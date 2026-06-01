import { STORAGE_KEYS } from "../constant/constant";
import {
    Activity,
    ActivityType,
    RawCoordinate,
    RecordStatus,
} from "../types/type";
import {
    computeCalories,
    computePace,
    computeSpeed,
    computeTotalDistance,
} from "../utils/compute";
import { convertMsToS } from "../utils/convert";
import { logger } from "../utils/logger";
import { generateId } from "../utils/utils";
import { locationService } from "./location/location.service";
import { stepCounterService } from "./step-counter.service";
import { activityService } from "./storage/activity.service";
import { coordinateService } from "./storage/coordinates.service";
import { profileService } from "./storage/profile.service";
import { StorageService } from "./storage/storage.service";

export type DraftActivity = Omit<Activity, "isImported" | "importedAt">;

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

                if (this.activity) {
                    const distance = computeTotalDistance(this.coordinates);
                    const pace = computePace(distance, convertMsToS(duration));
                    const steps = this.activity.steps;
                    this.statsCallbacks.forEach((cb) =>
                        cb({ distance, pace, steps }),
                    );
                }
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
    private startStepCounter(): void {
        this.stopStepCounter();
        stepCounterService.start();

        this.stepListener = stepCounterService.onStep((total) => {
            if (!this.activity || this.activity.status !== "active") return;
            this.activity.steps = total;
            logger.log("[ActivityService] Step recorded", { steps: total });
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
            // Don't throw — allow activity to continue without location tracking.
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
        if (this.isTransitioning) {
            throw new Error(
                "[ActivityService] Transition in progress — start() blocked.",
            );
        }
        this.isTransitioning = true;
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
            stepCounterService.reset();

            await this.activityStorage.set(this.activity);

            await activityService.createDraft({
                id: this.activity.id,
                startTime: new Date(this.activity.startTime),
                type: this.activity.type,
            });

            // ✅ Register listener BEFORE locationService.start() so the
            // seeded coord emitted inside start() is captured immediately.
            await this.startLocationListener();
            await locationService.start();

            this.startStepCounter();
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
            await activityService.delete(this.activity?.id ?? "");
            this.activity = null;
            this.coordinates = [];
            throw error;
        } finally {
            this.isTransitioning = false;
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
        if (this.isTransitioning) {
            throw new Error(
                "[ActivityService] Transition in progress — pause() blocked.",
            );
        }
        this.isTransitioning = true;
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
            this.isTransitioning = false;
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
        if (this.isTransitioning) {
            throw new Error(
                "[ActivityService] Transition in progress — resume() blocked.",
            );
        }
        this.isTransitioning = true;
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

            // ✅ Register listener BEFORE locationService.start() for the
            // same reason as start() — seed coord must not be missed.
            await this.startLocationListener();
            await locationService.start();
            this.startStepCounter();
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
            this.isTransitioning = false;
        }
    }

    // ======================
    // Stop
    // ======================
    async stop(): Promise<void> {
        if (this.isTransitioning) {
            throw new Error(
                "[ActivityService] Transition in progress — stop() blocked.",
            );
        }
        this.isTransitioning = true;
        logger.log("[ActivityService] stop() called");

        if (!this.activity) {
            this.isTransitioning = false;
            logger.error("[ActivityService] Stop failed: no active activity");
            throw new Error("No activity in progress");
        }

        try {
            logger.log("[ActivityService] Stopping activity", {
                id: this.activity.id,
            });

            const profile = await profileService.get();
            const finalSteps = stepCounterService.getSteps();
            const finalDuration = this.computeDuration();
            const finalCoordinates = this.coordinates;
            const startTime = new Date(this.activity.startTime);
            const endTime = new Date();

            const distance = computeTotalDistance(finalCoordinates);
            const calories = computeCalories(distance, profile?.weight ?? 75);
            const avgPace = computePace(distance, convertMsToS(finalDuration));
            const avgSpeed = computeSpeed(
                distance,
                convertMsToS(finalDuration),
            );

            const newActivity: DraftActivity = {
                id: this.activity.id,
                startTime,
                endTime,
                duration: finalDuration,
                distance,
                calories,
                avgPace,
                avgSpeed,
                goal: profile?.goal ?? 5000,
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

            this.activity = null;
            this.coordinates = [];

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
            this.isTransitioning = false;
        }
    }

    // ======================
    // Discard
    // ======================
    async discard(): Promise<void> {
        if (this.isTransitioning) {
            throw new Error(
                "[ActivityService] Transition in progress — discard() blocked.",
            );
        }
        if (!this.activity) {
            logger.error(
                "[ActivityService] Discard failed: no active activity",
            );
            throw new Error("No activity in progress");
        }

        const activityId = this.activity.id;
        this.isTransitioning = true;
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
            this.activity = null;
            this.coordinates = [];
            this.isTransitioning = false;
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

            // Crash recovery — surface active session as paused.
            if (storedActivity.status === "active") {
                storedActivity.status = "paused";
                storedActivity.lastPauseTime =
                    storedActivity.lastPauseTime ?? Date.now();
                await this.activityStorage.set(storedActivity);
                logger.log(
                    "[ActivityService] Crashed session surfaced as paused",
                    {
                        id: storedActivity.id,
                    },
                );
            }

            this.activity = storedActivity;

            const coordinates = await coordinateService.getByActivityId(
                storedActivity.id,
            );
            if (coordinates) {
                this.coordinates = coordinates;
            }

            logger.log("[ActivityService] Activity restored", {
                id: storedActivity.id,
                status: storedActivity.status,
                steps: storedActivity.steps,
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
