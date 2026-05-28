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
import { notificationService } from "./notification/notification.service";
import { activityService } from "./storage/activity.service";
import { coordinateService } from "./storage/coordinates.service";
import { profileService } from "./storage/profile.service";
import { StorageService } from "./storage/storage.service";

type DraftActivity = Omit<Activity, "isImported" | "importedAt">;
type RecordActivity = {
    id: string;
    startTime: number;
    pausedTime: number;
    lastPauseTime: number | null;
    steps: number;
    status: RecordStatus;
    type: ActivityType;
};

class RecordActivityService {
    private activityStorage = new StorageService(STORAGE_KEYS.record);
    private activity: RecordActivity | null = null;
    private coordinates: RawCoordinate[] = [];
    private readonly DURATION_UPDATE_INTERVAL = 1000;
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private durationCallbacks: Set<(duration: number) => void> = new Set();
    private locationListener: (() => void) | null = null;

    private computeDuration(): number {
        if (!this.activity) return 0;

        const { startTime, pausedTime, lastPauseTime, status } = this.activity;

        const extraPaused =
            status === "paused" && lastPauseTime != null
                ? Date.now() - lastPauseTime
                : 0;

        return Date.now() - startTime - pausedTime - extraPaused;
    }

    private startInterval(): void {
        if (this.intervalId !== null) return;

        this.intervalId = setInterval(async () => {
            try {
                const duration = this.computeDuration();
                this.durationCallbacks.forEach((cb) => cb(duration));

                // Update progress notification
                if (this.activity) {
                    const distance = computeTotalDistance(this.coordinates);
                    const pace = computePace(distance, convertMsToS(duration));

                    // Fire and forget - don't await to prevent blocking the interval
                    notificationService
                        .updateActivityProgressNotification(
                            this.activity.id,
                            duration,
                            this.activity.type || "Activity",
                            distance,
                            pace.toString(),
                        )
                        .catch((error) => {
                            logger.error(
                                "[ActivityService] Failed to update progress notification:",
                                error,
                            );
                        });
                }
            } catch (error) {
                logger.error(
                    "[ActivityService] Error in duration update interval:",
                    error,
                );
            }
        }, this.DURATION_UPDATE_INTERVAL);
    }

    private stopInterval(): void {
        if (this.intervalId === null) return;
        clearInterval(this.intervalId);
        this.intervalId = null;
    }

    /**
     * FIX: Made fully async so callers can await it, preventing races between
     * stop and subsequent start calls on the native location stack.
     */
    private async stopLocationListener(): Promise<void> {
        try {
            // Unregister the coordinate callback first
            if (this.locationListener) {
                this.locationListener();
                this.locationListener = null;
            }

            // FIX: await stop() so the native subscription is fully torn down
            // before any subsequent start() call is made.
            await locationService.stop();

            // FIX: await startPreview() so it only begins after stop() settles,
            // preventing a new watchPositionAsync from racing the old teardown.
            await locationService.startPreview();

            logger.log("[ActivityService] Location listener stopped");
        } catch (error) {
            logger.error("[ActivityService] Failed to stop location listener", {
                message: (error as Error)?.message,
                stack: (error as Error)?.stack,
            });
        }
    }

    private async startLocationListener(): Promise<void> {
        try {
            // FIX: await the full teardown before starting anything new,
            // so we never overlap native GPS subscriptions.
            await this.stopLocationListener();

            // Start location service
            try {
                await locationService.stopPreview();
                await locationService.start();
            } catch (error) {
                logger.warn(
                    "[ActivityService] Location service start warning:",
                    {
                        message: (error as Error)?.message,
                    },
                );

                // FIX: If locationService.start() was silently dropped due to
                // isTransitioning, surface it so the caller is aware GPS is not running.
                const msg = (error as Error)?.message ?? "";
                if (msg.includes("Transition in progress")) {
                    logger.error(
                        "[ActivityService] GPS start was blocked by an in-progress transition — location tracking may not be active.",
                    );
                }
                // Continue anyway — allow activity to proceed without GPS rather than crashing.
            }

            logger.log("[ActivityService] Location listener starting");

            this.locationListener = locationService.onLocationUpdate(
                async (coord: RawCoordinate, _label, mode) => {
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

                        logger.log("[ActivityService] Location recorded");
                    } catch (error) {
                        logger.error(
                            "[ActivityService] Error recording location:",
                            error,
                        );
                    }
                },
            );
        } catch (error) {
            logger.error(
                "[ActivityService] Failed to start location listener",
                {
                    message: (error as Error)?.message,
                    stack: (error as Error)?.stack,
                },
            );
            // Don't throw - allow activity to continue without location tracking
        }
    }

    async start(type: ActivityType | null): Promise<void> {
        logger.log("[ActivityService] start() called", { type });
        try {
            // Clean up any previous state
            this.stopInterval();

            // FIX: await the stop so the native layer is fully settled before
            // we assign a new activity and kick off a new startLocationListener().
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

            // Store activity first
            await this.activityStorage.set(this.activity);

            // Start location listener (non-blocking errors)
            await this.startLocationListener();

            // Start interval after location listener
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

            // FIX: await cleanup on failure path too, for the same reason.
            await this.stopLocationListener();
            this.activity = null;
            this.coordinates = [];
            throw error;
        }
    }

    async pause(): Promise<void> {
        logger.log("[ActivityService] pause() called");
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
        try {
            this.activity.status = "paused";
            this.activity.lastPauseTime = Date.now();
            this.stopInterval();

            // FIX: await so the native subscription is fully stopped before
            // the activity state is persisted, keeping storage consistent.
            await this.stopLocationListener();

            // Fire and forget - don't block on notification
            notificationService
                .cancelActivityProgressNotification(this.activity.id)
                .catch((error) => {
                    logger.error(
                        "[ActivityService] Failed to cancel progress notification:",
                        error,
                    );
                });

            await this.activityStorage.set(this.activity);
            logger.log("[ActivityService] Activity paused", {
                id: this.activity.id,
            });
        } catch (error) {
            logger.error("[ActivityService] Failed to pause activity", {
                message: (error as Error)?.message,
                stack: (error as Error)?.stack,
            });
            throw error;
        }
    }

    async resume(): Promise<void> {
        logger.log("[ActivityService] resume() called");
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
            this.startInterval();
            await this.startLocationListener();
            await this.activityStorage.set(this.activity);
            logger.log("[ActivityService] Activity resumed", {
                id: this.activity.id,
            });
        } catch (error) {
            logger.error("[ActivityService] Failed to resume activity", {
                message: (error as Error)?.message,
                stack: (error as Error)?.stack,
            });

            // Roll back status so the user can try resuming again
            this.activity.status = "paused";

            // FIX: Stop the interval AND the location listener on rollback.
            // Previously only stopInterval() was called, leaving a dangling
            // listener if startLocationListener() partially succeeded.
            this.stopInterval();
            await this.stopLocationListener();

            throw error;
        }
    }

    async stop(): Promise<void> {
        logger.log("[ActivityService] stop() called");
        if (!this.activity) {
            logger.error("[ActivityService] Stop failed: no active activity");
            throw new Error("No activity in progress");
        }

        try {
            logger.log("[ActivityService] Stopping activity", {
                id: this.activity.id,
            });

            const activityId = this.activity.id;
            const profile = await profileService.get();
            const finalSteps = this.activity.steps;
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
                id: activityId,
                startTime,
                endTime,
                duration: finalDuration,
                distance,
                calories,
                avgPace,
                avgSpeed,
                goal: profile?.goal ?? 5000,
                status: "Completed",
                type: this.activity.type ?? "run",
                steps: finalSteps,
                createdAt: startTime,
                updatedAt: endTime,
            };

            logger.log("[ActivityService] New activity payload", newActivity);

            // FIX: await stopLocationListener() so the native subscription is
            // fully torn down before we write the final record to storage.
            this.stopInterval();
            await this.stopLocationListener();

            // Perform cleanup operations in parallel
            await Promise.all([
                activityService.create(newActivity),
                notificationService
                    .cancelActivityProgressNotification(activityId)
                    .catch((error) => {
                        logger.error(
                            "[ActivityService] Failed to cancel notification during stop:",
                            error,
                        );
                    }),
            ]);

            this.activity = null;
            this.coordinates = [];
            this.activityStorage.remove();
            logger.log("[ActivityService] Activity stopped");
        } catch (error) {
            logger.error("[ActivityService] Error stopping activity", {
                message: (error as Error)?.message,
                stack: (error as Error)?.stack,
            });
            throw error;
        }
    }

    async discard(): Promise<void> {
        logger.log("[ActivityService] discard() called");
        if (!this.activity) {
            logger.error(
                "[ActivityService] Discard failed: no active activity",
            );
            throw new Error("No activity in progress");
        }

        // Capture id before any async work
        const activityId = this.activity.id;

        // FIX: Stop timers and await location teardown before clearing state,
        // so we don't leave dangling native subscriptions.
        this.stopInterval();
        await this.stopLocationListener();

        // FIX: Clear in-memory state immediately in a finally block so that
        // a DB failure in coordinateService.deleteByActivityId() no longer
        // leaves this.activity as a stale, half-discarded object, which
        // caused subsequent action calls to crash.
        try {
            logger.log("[ActivityService] Discarding activity", {
                id: activityId,
            });

            // Clean up data in parallel
            await Promise.all([
                coordinateService.deleteByActivityId(activityId),
                notificationService
                    .cancelActivityProgressNotification(activityId)
                    .catch((error) => {
                        logger.error(
                            "[ActivityService] Failed to cancel notification during discard:",
                            error,
                        );
                    }),
            ]);

            logger.log("[ActivityService] Activity discarded");
        } catch (error) {
            logger.error("[ActivityService] Error discarding activity", {
                message: (error as Error)?.message,
                stack: (error as Error)?.stack,
            });
            throw error;
        } finally {
            // FIX: Always clear state regardless of DB success/failure.
            this.activity = null;
            this.coordinates = [];
            this.activityStorage.remove();
        }
    }

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

            // if app crashed mid-session, surface as paused
            if (storedActivity.status === "active") {
                storedActivity.status = "paused";
                storedActivity.lastPauseTime =
                    storedActivity.lastPauseTime ?? Date.now();
                await this.activityStorage.set(storedActivity);
                logger.log(
                    "[ActivityService] Crashed active session surfaced as paused",
                    { id: storedActivity.id },
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

    onDurationUpdate(callback: (duration: number) => void): () => void {
        this.durationCallbacks.add(callback);
        return () => {
            this.durationCallbacks.delete(callback);
        };
    }
}

export const recordActivityService = new RecordActivityService();
