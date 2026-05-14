import { STORAGE_KEYS } from "../constant/constant";
import { Activity, ActivityTrackingStatus, Coordinate } from "../types/type";
import { logger } from "../utils/logger";
import { generateId } from "../utils/utils";
import { locationService } from "./location/location.service";
import { activityService } from "./storage/activity.service";
import { StorageService } from "./storage/storage.service";

type Metrics = {
    duration: number;
    status?: ActivityTrackingStatus;
    coordinates?: Coordinate[] | [];
};

type ActivityTracking = {
    id: string;
    startTime: number;
    pausedTime: number;
    lastPauseTime: number | null;
    status: ActivityTrackingStatus;
    coordinates: Coordinate[] | [];
};

class ActivityTrackingService {
    private activityStorage = new StorageService(STORAGE_KEYS.activityTracking);
    private activity: ActivityTracking | null = null;
    private metricsUpdateCallBacks: Array<(metrics: Metrics) => void> = [];
    private readonly SESSION_UPDATE_INTERVAL = 1000;
    private activeActivityUpdateInterval: ReturnType<
        typeof setInterval
    > | null = null;
    private removeLocationListener: (() => void) | null = null;

    getCurrentMetrics(): Metrics | null {
        if (!this.activity) return null;

        return {
            duration: this.getElapsedMs(),
            status: this.activity.status,
            coordinates: this.activity.coordinates,
        };
    }

    // ======================
    // Elapsed time
    // ======================
    private getElapsedMs(): number {
        if (!this.activity) return 0;

        const { startTime, pausedTime, lastPauseTime, status } = this.activity;

        const extraPaused =
            status === "paused" && lastPauseTime != null
                ? Date.now() - lastPauseTime
                : 0;

        return Date.now() - startTime - pausedTime - extraPaused;
    }

    // ======================
    // Metrics
    // ======================
    private notifyMetricsUpdate(): void {
        if (!this.activity) return;

        const stats: Metrics = {
            duration: this.getElapsedMs(),
        };

        this.metricsUpdateCallBacks.forEach((callback) => {
            try {
                callback(stats);
            } catch (error) {
                logger.error("[ActivityService] Metrics callback error", {
                    error,
                });
            }
        });
    }

    // ======================
    // Session interval
    // ======================
    private startSession(): void {
        this.stopSession();

        this.activeActivityUpdateInterval = setInterval(() => {
            if (!this.activity) {
                this.stopSession();
                return;
            }

            if (this.activity.status === "active") {
                this.notifyMetricsUpdate();
            }
        }, this.SESSION_UPDATE_INTERVAL);
    }

    private stopSession(): void {
        if (this.activeActivityUpdateInterval) {
            clearInterval(this.activeActivityUpdateInterval);
            this.activeActivityUpdateInterval = null;
        }
    }

    private startLocationListener(): void {
        this.stopLocationListener();

        this.removeLocationListener = locationService.onLocationUpdate(
            async (coord: Coordinate, _label, mode) => {
                if (!this.activity || this.activity.status !== "active") return;
                if (mode !== "recording") return;
                this.activity = {
                    ...this.activity,
                    coordinates: [...this.activity.coordinates, coord],
                };
                await this.activityStorage.set(this.activity);
            },
        );

        logger.log("[ActivityService] Location listener started");
    }

    private stopLocationListener(): void {
        if (this.removeLocationListener) {
            this.removeLocationListener();
            this.removeLocationListener = null;
            logger.log("[ActivityService] Location listener stopped");
        }
    }
    // ======================
    // Controls
    // ======================
    async start(): Promise<void> {
        if (this.activity) {
            logger.warn(
                "[ActivityService] Start blocked: activity already exists",
                {
                    id: this.activity.id,
                },
            );
            throw new Error("An activity is already in progress");
        }

        try {
            this.activity = {
                id: generateId(),
                startTime: Date.now(),
                pausedTime: 0,
                lastPauseTime: null,
                status: "active",
                coordinates: [],
            };

            this.startSession();
            await locationService.start();
            this.startLocationListener();
            this.activityStorage.set(this.activity);

            logger.log("[ActivityService] Activity started", {
                id: this.activity.id,
            });
        } catch (error) {
            logger.error("[ActivityService] Failed to start activity", {
                error,
            });
            this.activity = null;
            throw error;
        }
    }

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

        this.activity.status = "paused";
        this.activity.lastPauseTime = Date.now();
        this.stopSession();
        this.stopLocationListener();
        await locationService.stop();
        this.activityStorage.set(this.activity);

        logger.log("[ActivityService] Activity paused", {
            id: this.activity.id,
            pausedAt: this.activity.lastPauseTime,
        });
    }

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

        if (this.activity.lastPauseTime != null) {
            const pauseDuration = Date.now() - this.activity.lastPauseTime;
            this.activity.pausedTime += pauseDuration;
            this.activity.lastPauseTime = null;

            logger.log("[ActivityService] Pause duration applied", {
                id: this.activity.id,
                pauseDuration,
                totalPausedTime: this.activity.pausedTime,
            });
        }

        this.activity.status = "active";
        this.startSession();
        await locationService.start();
        this.startLocationListener();

        this.activityStorage.set(this.activity);
        logger.log("[ActivityService] Activity resumed", {
            id: this.activity.id,
            status: this.activity.status,
        });
    }

    async stop(): Promise<Activity> {
        if (!this.activity) {
            logger.warn("[ActivityService] Stop called but no active activity");
            throw new Error("No activity in progress");
        }

        try {
            logger.log("[ActivityService] Stopping activity", {
                id: this.activity.id,
                startTime: this.activity.startTime,
                totalDuration: this.getElapsedMs(),
            });

            const finalDuration = this.getElapsedMs();
            const finalCoordinates = this.activity.coordinates;
            const endTime = new Date().toISOString();
            const formattedNewActivity: Activity = {
                id: this.activity.id,
                startTime: new Date(this.activity.startTime).toISOString(),
                endTime,
                duration: finalDuration,
                coordinates: finalCoordinates,
                status: "completed",
                type: "run",
                goal: 5000,
                updatedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
            };
            logger.log(
                "[ActivityService] Activity stopped",
                formattedNewActivity,
            );

            await activityService.save(formattedNewActivity);

            this.stopSession();
            this.stopLocationListener();
            await locationService.stop();
            this.activity = null;
            this.activityStorage.remove();
            logger.log("[ActivityService] Activity stopped");

            return formattedNewActivity;
        } catch (error) {
            logger.error("[ActivityService] Error stopping activity", {
                error,
            });
            throw error;
        }
    }

    async discard(): Promise<void> {
        if (!this.activity) {
            logger.error(
                "[ActivityService] Discard failed: no active activity",
            );
            throw new Error("No activity in progress");
        }

        try {
            logger.log("[ActivityService] Discarding activity", {
                id: this.activity.id,
            });

            this.stopSession();
            this.stopLocationListener();
            await locationService.stop();
            this.activity = null;
            this.activityStorage.remove();

            logger.log("[ActivityService] Activity discarded");
        } catch (error) {
            logger.error("[ActivityService] Error discarding activity", {
                error,
            });
            throw error;
        }
    }

    async restore(): Promise<ActivityTracking | null> {
        try {
            const storedActivity = await this.activityStorage.get();

            if (!storedActivity) {
                logger.log("[ActivityService] No stored activity found");
                return null;
            }

            this.activity = storedActivity;

            if (storedActivity.status === "active") {
                this.startSession();
                await locationService.start();
                this.startLocationListener();
            } else {
                this.stopSession();
                await locationService.stop();
                this.stopLocationListener();
            }

            logger.log("[ActivityService] Restored activity", {
                id: storedActivity.id,
                status: storedActivity.status,
            });

            return storedActivity;
        } catch (error) {
            logger.error("[ActivityService] Error restoring activity", {
                error,
            });
            throw error;
        }
    }

    // ======================
    // Listener
    // ======================
    onMetricsUpdate(callback: (metric: Metrics) => void): () => void {
        this.metricsUpdateCallBacks.push(callback);

        return () => {
            this.metricsUpdateCallBacks = this.metricsUpdateCallBacks.filter(
                (cb) => cb !== callback,
            );
        };
    }
}

export const activityTrackingService = new ActivityTrackingService();
