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
import { stepCounterService } from "./sensor/step-counter.service";
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

// FIX: Added a cap so transitions cannot lock the service forever if an async
// operation (e.g. stopLocationUpdatesAsync) hangs and never resolves.
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

    // FIX: Centralised transition guard with a timeout so a hung async
    // operation can never permanently lock the service. Returns a cleanup
    // function that clears the timeout and releases the flag.
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

    // FIX: Shared helper to wipe in-memory state and clear subscriber sets.
    // Calling this in stop/discard/restore-error paths prevents stale
    // callbacks accumulating across activity sessions.
    private resetState(): void {
        this.activity = null;
        this.coordinates = [];
        // Clear subscriber sets so stale callbacks from a previous session
        // do not fire into the next one.
        this.durationCallbacks.clear();
        this.statsCallbacks.clear();
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

    // Starts the pedometer and registers a listener that:
    //   1. Writes the latest count into this.activity.steps (in-memory) so
    //      the live-stats interval always has the current value.
    //   2. Persists the updated RecordActivity to activityStorage after each
    //      step event so a crash mid-activity doesn't lose the step count.
    //      On restart, restore() reads activityStorage and gets the last
    //      persisted steps back automatically — no extra restore logic needed.
    //
    // stepCounterService.start() returns false (without throwing) when the
    // hardware is unavailable — we log a warning and continue so the
    // activity still works, just without step data.
    private async startStepCounter(): Promise<void> {
        // Always clear any previous listener before registering a new one.
        this.stopStepCounter();

        const available = await stepCounterService.start();

        if (!available) {
            logger.warn(
                "[ActivityService] Step counter unavailable — activity continues without step tracking",
            );
            return;
        }

        // Seed the offset with whatever is already on this.activity.steps.
        // For a fresh activity that is 0. For a restored session it is the
        // count that was persisted before the crash, so new steps accumulate
        // on top rather than overwriting it.
        stepCounterService.seedSteps(this.activity?.steps ?? 0);

        this.stepListener = stepCounterService.onStepUpdate((totalSteps) => {
            if (!this.activity) return;

            // 1. Keep the in-memory state current so the interval callback
            //    and stop() both read the real value without extra lookups.
            this.activity.steps = totalSteps;

            // 2. Persist asynchronously so a crash between step events loses
            //    at most one step update rather than all steps since start.
            //    Fire-and-forget is intentional — a failed write is logged
            //    but must not throw into the pedometer callback or disrupt
            //    the active recording.
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
        // Unregister our callback first so no more updates arrive after
        // stepCounterService.stop() tears down the OS subscription.
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
        // FIX: Replaced inline isTransitioning flag manipulation with
        // acquireTransition(), which also enforces a timeout so a hung
        // async op can never permanently lock the service.
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

            // ✅ Register listener BEFORE locationService.start() so the
            // seeded coord emitted inside start() is captured immediately.
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

            // FIX: Guard delete with a null check — if this.activity was
            // never fully initialized the id would be undefined, and passing
            // an empty string to delete is a silent no-op at best.
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

            // NOTE: locationService.stop() tears down foreground/background
            // tracking. stopLocationListener() removes our coord callback.
            // Both are needed — stop() alone doesn't remove the callback.
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

            // ✅ Register listener BEFORE locationService.start() for the
            // same reason as start() — seed coord must not be missed.
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

            // Reads the cumulative count kept in sync by the step
            // counter callback. Zero if the pedometer was unavailable.
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

            // NOTE: locationService.stop() is intentionally not called here
            // because the activity may have been paused before stop() was
            // invoked — locationService tracking is already torn down at
            // pause time. Calling stop() again on an idle locationService
            // is harmless but would add noise to the logs.

            await activityService.update(this.activity.id, newActivity);
            await this.activityStorage.remove();

            // FIX: Use resetState() instead of nulling fields individually,
            // so subscriber sets are also cleared.
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
            // FIX: Use resetState() so subscriber sets are also cleared,
            // matching the cleanup done in stop().
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
        // NOTE: restore() is not guarded by acquireTransition() at its own
        // level because it internally calls resume(), which acquires the
        // guard itself. Wrapping the outer call too would deadlock.
        // Callers should ensure restore() is not invoked concurrently with
        // other transitions (it is only called once at app boot).
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

                // ✅ Force to paused so resume() guard doesn't early-return.
                if (this.activity) {
                    this.activity.status = "paused";
                    this.activity.lastPauseTime =
                        this.activity.lastPauseTime ?? Date.now();
                    await this.activityStorage.set(this.activity);
                }

                // ✅ Await resume so tracking is fully active before returning.
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

            // FIX: Previously returned null while leaving this.activity
            // partially initialized. Now resets state so the service is
            // clean for a fresh start rather than being in a dirty state
            // that the caller cannot detect.
            this.resetState();
            return null;
        }
    }

    // ======================
    // Public subscription API
    // ======================

    // NOTE: Subscribers are responsible for calling the returned unsubscribe
    // function when their component unmounts. Failing to do so will leave
    // stale callbacks in the sets until the next resetState() call (i.e.
    // the next stop/discard/restore-error).
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
