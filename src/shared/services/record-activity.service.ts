import { STORAGE_KEYS } from "../constant/constant";
import {
    Activity,
    ActivityType,
    RawCoordinate,
    RecordStatus,
} from "../types/type";
import {
    computeCalories,
    computeTotalDistance
} from "../utils/compute";
import { convertMsToS } from "../utils/convert";
import { logger } from "../utils/logger";
import { generateId } from "../utils/utils";
import { locationService } from "./location/location.service";
import { stepCounterService } from "./sensor/step-counter.service";
import { activityService } from "./storage/activity.service";
import { coordinateService } from "./storage/coordinates.service";
import { profileService } from "./storage/profile.service";
import { settingsService } from "./storage/settings.service";
import { StorageService } from "./storage/storage.service";

export type DraftActivity = Omit<
    Activity,
    "isImported" | "importedAt" | "source"
>;

type RecordActivity = {
    id: string;
    startTime: number;
    pausedTime: number;
    lastPauseTime: number | null;
    steps: number;
    status: RecordStatus;
    type: ActivityType;
};

type LiveStats = {
    distance: number;
    pace: number;
    steps: number;
};

const TRANSITION_TIMEOUT_MS = 10_000;

class RecordActivityService {
    // ======================
    // State
    // ======================
    private activityStorage = new StorageService(STORAGE_KEYS.record);
    private activity: RecordActivity | null = null;
    private coordinates: RawCoordinate[] = [];
    private readonly DURATION_UPDATE_INTERVAL = 1000;
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private durationCallbacks: Set<(duration: number) => void> = new Set();
    private statsCallbacks: Set<(stats: LiveStats) => void> = new Set();
    private locationListener: (() => void) | null = null;
    private stepListener: (() => void) | null = null;
    private isTransitioning = false;

    // ======================
    // Transition guard
    // ======================
    private acquireTransition(caller: string): () => void {
        if (this.isTransitioning) {
            throw new Error(
                `[ActivityService] Transition in progress — ${caller}() blocked.`,
            );
        }
        this.isTransitioning = true;

        const timer = setTimeout(() => {
            logger.error(
                `[ActivityService] Transition timeout in ${caller}() — force-releasing flag`,
            );
            this.isTransitioning = false;
        }, TRANSITION_TIMEOUT_MS);

        return () => {
            clearTimeout(timer);
            this.isTransitioning = false;
        };
    }

    // ======================
    // State reset
    // ======================
    private resetState(): void {
        this.activity = null;
        this.coordinates = [];
        // this.durationCallbacks.clear();
        // this.statsCallbacks.clear();
    }

    // ======================
    // Duration
    // ======================
    private computeDuration(): number {
        if (!this.activity) return 0;

        const { startTime, pausedTime, lastPauseTime, status } = this.activity;

        const extraPaused =
            status === "paused" && lastPauseTime != null
                ? Date.now() - lastPauseTime
                : 0;

        return Date.now() - startTime - pausedTime - extraPaused;
    }

    // ======================
    // Interval (live stats)
    // ======================
    private startInterval(): void {
        if (this.intervalId !== null) return;

        this.intervalId = setInterval(() => {
            try {
                const duration = this.computeDuration();
                this.durationCallbacks.forEach((cb) => cb(duration));

                // if (this.activity) {
                //     const distance = computeTotalDistance(this.coordinates);
                //     const pace = computePace(distance, convertMsToS(duration));
                //     const steps = this.activity.steps;
                //     this.statsCallbacks.forEach((cb) =>
                //         cb({ distance, pace, steps }),
                //     );
                // }
            } catch (error) {
                logger.error("[ActivityService] Error in interval:", error);
            }
        }, this.DURATION_UPDATE_INTERVAL);
    }

    private stopInterval(): void {
        if (this.intervalId === null) return;
        clearInterval(this.intervalId);
        this.intervalId = null;
    }

    // ======================
    // Step counter
    // ======================
    private async startStepCounter(): Promise<void> {
        this.stopStepCounter();
        stepCounterService.seedSteps(this.activity?.steps ?? 0);

        const available = await stepCounterService.start();

        if (!available) {
            logger.warn(
                "[ActivityService] Step counter unavailable — activity continues without step tracking",
            );
            return;
        }

        this.stepListener = stepCounterService.onStepUpdate((totalSteps) => {
            if (!this.activity) return;

            this.activity.steps = totalSteps;

            this.activityStorage.set(this.activity).catch((error) => {
                logger.error(
                    "[ActivityService] Failed to persist step count — steps may be lost on crash",
                    {
                        activityId: this.activity?.id,
                        steps: totalSteps,
                        message: (error as Error)?.message,
                    },
                );
            });

            logger.log("[ActivityService] Steps updated and persisted", {
                activityId: this.activity.id,
                steps: totalSteps,
            });
        });

        logger.log("[ActivityService] Step counter started");
    }

    private stopStepCounter(): void {
        if (this.stepListener) {
            this.stepListener();
            this.stepListener = null;
        }

        stepCounterService.stop();
        logger.log("[ActivityService] Step counter stopped");
    }

    // ======================
    // Location listener
    // ======================
    private async startLocationListener(): Promise<void> {
        try {
            await this.stopLocationListener();
            logger.log("[ActivityService] Location listener starting");

            this.locationListener = locationService.onLocationUpdate(
                async (coord: RawCoordinate, mode) => {
                    try {
                        if (
                            !this.activity ||
                            this.activity.status !== "active" ||
                            mode !== "recording"
                        )
                            return;

                        this.coordinates.push(coord);
                        await coordinateService.create({
                            id: generateId(),
                            activityId: this.activity.id,
                            ...coord,
                        });

                        logger.log("[ActivityService] Location recorded", {
                            activityId: this.activity.id,
                            lat: coord.latitude,
                            lng: coord.longitude,
                        });
                    } catch (error) {
                        logger.error(
                            "[ActivityService] Error recording location:",
                            error,
                        );
                    }
                },
            );

            logger.log("[ActivityService] Location listener started");
        } catch (error) {
            logger.error(
                "[ActivityService] Failed to start location listener",
                {
                    message: (error as Error)?.message,
                    stack: (error as Error)?.stack,
                },
            );
        }
    }

    private async stopLocationListener(): Promise<void> {
        try {
            if (this.locationListener) {
                this.locationListener();
                this.locationListener = null;
            }
            logger.log("[ActivityService] Location listener stopped");
        } catch (error) {
            logger.error(
                "[ActivityService] Failed to stop location listener",
                error,
            );
        }
    }

    // ======================
    // Start
    // ======================
    async start(type: ActivityType | null): Promise<void> {
        const release = this.acquireTransition("start");
        logger.log("[ActivityService] start() called", { type });

        try {
            this.stopInterval();
            this.stopStepCounter();
            await this.stopLocationListener();

            this.activity = {
                id: generateId(),
                startTime: Date.now(),
                pausedTime: 0,
                lastPauseTime: null,
                steps: 0,
                status: "active",
                type: type ?? "run",
            };
            this.coordinates = [];

            await this.activityStorage.set(this.activity);

            await activityService.createDraft({
                id: this.activity.id,
                startTime: new Date(this.activity.startTime),
                type: this.activity.type,
            });

            await this.startLocationListener();
            await locationService.start();

            await this.startStepCounter();
            this.startInterval();

            logger.log("[ActivityService] Activity started", {
                id: this.activity.id,
            });
        } catch (error) {
            logger.error("[ActivityService] Failed to start activity", {
                message: (error as Error)?.message,
                stack: (error as Error)?.stack,
            });
            this.stopInterval();
            this.stopStepCounter();
            await this.stopLocationListener();

            if (this.activity?.id) {
                await activityService.delete(this.activity.id);
            }

            this.resetState();
            throw error;
        } finally {
            release();
        }
    }

    // ======================
    // Pause
    // ======================
    async pause(): Promise<void> {
        if (!this.activity) {
            logger.error("[ActivityService] Pause failed: no active activity");
            throw new Error("No activity in progress");
        }
        if (this.activity.status === "paused") {
            logger.warn("[ActivityService] Activity already paused", {
                id: this.activity.id,
            });
            return;
        }

        const release = this.acquireTransition("pause");
        logger.log("[ActivityService] pause() called");

        try {
            this.activity.status = "paused";
            this.activity.lastPauseTime = Date.now();

            this.stopInterval();
            this.stopStepCounter();

            await locationService.stop();
            await this.stopLocationListener();
            await this.activityStorage.set(this.activity);

            logger.log("[ActivityService] Activity paused", {
                id: this.activity.id,
                steps: this.activity.steps,
            });
        } catch (error) {
            logger.error("[ActivityService] Failed to pause activity", {
                message: (error as Error)?.message,
                stack: (error as Error)?.stack,
            });
            throw error;
        } finally {
            release();
        }
    }

    // ======================
    // Resume
    // ======================
    async resume(): Promise<void> {
        if (!this.activity) {
            logger.error("[ActivityService] Resume failed: no active activity");
            throw new Error("No activity in progress");
        }
        if (this.activity.status === "active") {
            logger.warn("[ActivityService] Activity already active", {
                id: this.activity.id,
            });
            return;
        }

        const release = this.acquireTransition("resume");
        logger.log("[ActivityService] resume() called");

        try {
            if (this.activity.lastPauseTime != null) {
                const pauseDuration = Date.now() - this.activity.lastPauseTime;
                this.activity.pausedTime += pauseDuration;
                this.activity.lastPauseTime = null;
                logger.log("[ActivityService] Pause duration applied", {
                    pauseDuration,
                    totalPausedTime: this.activity.pausedTime,
                });
            }

            this.activity.status = "active";

            await this.startLocationListener();
            await locationService.start();
            await this.startStepCounter();
            this.startInterval();
            await this.activityStorage.set(this.activity);

            logger.log("[ActivityService] Activity resumed", {
                id: this.activity.id,
                steps: this.activity.steps,
            });
        } catch (error) {
            logger.error("[ActivityService] Failed to resume activity", {
                message: (error as Error)?.message,
                stack: (error as Error)?.stack,
            });
            this.activity.status = "paused";
            this.stopInterval();
            this.stopStepCounter();
            await this.stopLocationListener();
            throw error;
        } finally {
            release();
        }
    }

    // ======================
    // Stop
    // ======================
    async stop(): Promise<void> {
        const release = this.acquireTransition("stop");
        logger.log("[ActivityService] stop() called");

        if (!this.activity) {
            release();
            logger.error("[ActivityService] Stop failed: no active activity");
            throw new Error("No activity in progress");
        }

        try {
            logger.log("[ActivityService] Stopping activity", {
                id: this.activity.id,
            });

            const profile = await profileService.get();
            const settings = await settingsService.get();
            const finalSteps = this.activity.steps;
            const finalDuration = this.computeDuration();
            const finalCoordinates = this.coordinates;
            const startTime = new Date(this.activity.startTime);
            const endTime = new Date();

            const distance = computeTotalDistance(finalCoordinates);
            const calories = computeCalories(distance, profile?.weight ?? 75);
            const avgPace = convertMsToS(finalDuration) / distance;
            const avgSpeed = distance / convertMsToS(finalDuration);

            const newActivity: DraftActivity = {
                id: this.activity.id,
                startTime,
                endTime,
                duration: finalDuration,
                distance,
                calories,
                avgPace,
                avgSpeed,
                goal: settings?.preferences?.goal ?? 5000,
                status: "completed",
                type: this.activity.type ?? "run",
                steps: finalSteps,
                createdAt: startTime,
                updatedAt: endTime,
            };

            logger.log("[ActivityService] Final activity payload", newActivity);

            this.stopInterval();
            this.stopStepCounter();
            await this.stopLocationListener();

            await activityService.update(this.activity.id, newActivity);
            await this.activityStorage.remove();

            this.resetState();

            logger.log("[ActivityService] Activity stopped", {
                finalSteps,
                finalDuration,
                distance,
            });
        } catch (error) {
            logger.error("[ActivityService] Error stopping activity", {
                message: (error as Error)?.message,
                stack: (error as Error)?.stack,
            });
            throw error;
        } finally {
            release();
        }
    }

    // ======================
    // Discard
    // ======================
    async discard(): Promise<void> {
        if (!this.activity) {
            logger.error(
                "[ActivityService] Discard failed: no active activity",
            );
            throw new Error("No activity in progress");
        }

        const activityId = this.activity.id;
        const release = this.acquireTransition("discard");
        logger.log("[ActivityService] discard() called", { id: activityId });

        try {
            this.stopInterval();
            this.stopStepCounter();
            await this.stopLocationListener();
            await coordinateService.deleteByActivityId(activityId);
            await activityService.delete(activityId);
            await this.activityStorage.remove();

            logger.log("[ActivityService] Activity discarded", {
                id: activityId,
            });
        } catch (error) {
            logger.error("[ActivityService] Error discarding activity", {
                message: (error as Error)?.message,
                stack: (error as Error)?.stack,
            });
            throw error;
        } finally {
            this.resetState();
            release();
        }
    }

    // ======================
    // Restore
    // ======================
    async restore(): Promise<{
        activity: RecordActivity | null;
        computedDuration: number;
        coordinates: RawCoordinate[];
    } | null> {
        logger.log("[ActivityService] restore() called");

        try {
            const storedActivity = await this.activityStorage.get();

            if (!storedActivity) {
                logger.log("[ActivityService] No stored activity found");
                return null;
            }

            logger.log("[ActivityService] Stored activity found", {
                id: storedActivity.id,
                status: storedActivity.status,
            });

            this.activity = storedActivity;

            const coordinates = await coordinateService.getByActivityId(
                storedActivity.id,
            );
            if (coordinates) {
                this.coordinates = coordinates;
            }

            if (storedActivity.status === "active") {
                logger.log(
                    "[ActivityService] Crashed active session detected — resuming",
                    { id: storedActivity.id },
                );

                if (this.activity) {
                    this.activity.status = "paused";
                    this.activity.lastPauseTime =
                        this.activity.lastPauseTime ?? Date.now();
                    await this.activityStorage.set(this.activity);
                }

                await this.resume();
            }

            logger.log("[ActivityService] Activity restored", {
                id: this.activity?.id,
                status: this.activity?.status,
                steps: this.activity?.steps,
                coordinatesCount: this.coordinates.length,
            });

            return {
                activity: this.activity,
                computedDuration: this.computeDuration(),
                coordinates: this.coordinates,
            };
        } catch (error) {
            logger.error("[ActivityService] Failed to restore activity", {
                message: (error as Error)?.message,
                stack: (error as Error)?.stack,
            });

            this.resetState();
            return null;
        }
    }

    // ======================
    // Public subscription API
    // ======================
    onDurationUpdate(callback: (duration: number) => void): () => void {
        this.durationCallbacks.add(callback);
        return () => this.durationCallbacks.delete(callback);
    }

    onStatsUpdate(callback: (stats: LiveStats) => void): () => void {
        this.statsCallbacks.add(callback);
        return () => this.statsCallbacks.delete(callback);
    }
}

export const recordActivityService = new RecordActivityService();
