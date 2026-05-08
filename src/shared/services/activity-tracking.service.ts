import { ActivityTrackingStatus } from "../types/type";
import { logger } from "../utils/logger";
import { generateId } from "../utils/utils";

type Metrics = {
    duration: number;
    status?: ActivityTrackingStatus;
};
type ActivityTracking = {
    id: string;
    startTime: number;
    pausedTime: number;
    lastPauseTime: number | null;
    status: ActivityTrackingStatus;
    steps: number;
};

class ActivityTrackingService {
    private activity: ActivityTracking | null = null;
    private metricsUpdateCallBacks: Array<(metrics: Metrics) => void> = [];
    private readonly SESSION_UPDATE_INTERVAL = 1000;
    private activeActivityUpdateInterval: ReturnType<
        typeof setInterval
    > | null = null;

    private getElapsedMs(): number {
        if (!this.activity) return 0;

        const { startTime, pausedTime, lastPauseTime, status } = this.activity;

        const extraPaused =
            status === "paused" && lastPauseTime != null
                ? Date.now() - lastPauseTime
                : 0;

        return Date.now() - startTime - pausedTime - extraPaused;
    }
    private notifyMetricsUpdate(): void {
        if (!this.activity) return;

        // REMOVE: fake step calculation based on elapsed time
        // Steps are now updated directly from stepService via subscribeToSteps()
        const stats: Metrics = {
            duration: this.getElapsedMs(),
        };

        this.metricsUpdateCallBacks.forEach((callback) => {
            try {
                callback(stats);
            } catch (error) {
                logger.error("[ActiveActivityService] Metrics callback error", {
                    error,
                });
            }
        });
    }

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

    async start() {
        if (this.activity) {
            logger.warn(
                "[activityService] Start blocked: activity already exists",
                { id: this.activity.id },
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
                steps: 0,
            };
            this.startSession();
        } catch (error) {
            logger.error("[activityService] Failed to start activity", {
                error,
            });
            throw error;
        }
    }
    async pause() {
        if (!this.activity) {
            logger.error("[activityService] Pause failed: no active activity");
            throw new Error("No activity in progress");
        }

        if (this.activity.status === "paused") {
            logger.warn("[activityService] Activity already paused", {
                id: this.activity.id,
            });
            return;
        }

        this.activity.status = "paused";
        this.activity.lastPauseTime = Date.now();
        this.stopSession();

        logger.log("[activityService] Activity paused", {
            id: this.activity.id,
            pausedAt: this.activity.lastPauseTime,
        });
    }
    async resume() {
        if (!this.activity) {
            logger.error("[activityService] Resume failed: no active activity");
            throw new Error("No activity in progress");
        }

        if (this.activity.status === "active") {
            logger.warn("[activityService] Activity already active", {
                id: this.activity.id,
            });
            return;
        }

        if (this.activity.lastPauseTime != null) {
            const pauseDuration = Date.now() - this.activity.lastPauseTime;

            this.activity.pausedTime += pauseDuration;
            this.activity.lastPauseTime = null;

            logger.log("[activityService] Pause duration applied", {
                id: this.activity.id,
                pauseDuration,
                totalPausedTime: this.activity.pausedTime,
            });
        }

        this.activity.status = "active";
        this.startSession();

        logger.log("[activityService] Activity resumed", {
            id: this.activity.id,
            status: this.activity.status,
        });
    }
    async stop() {
        if (!this.activity) {
            logger.warn("[activityService] Stop called but no active activity");
            throw new Error("No activity in progress");
        }
        try {
            logger.log("[activityService] Stopping activity", {
                id: this.activity.id,
                startTime: this.activity.startTime,
                steps: this.activity.steps,
            });

            const endTime = new Date().toISOString();
            this.activity = null;
            this.stopSession();
        } catch (error) {
            logger.error("[activityService] Error stopping activity", {
                error,
            });
            throw error;
        }
    }
    async discard() {
        if (!this.activity) {
            logger.error(
                "[activityService] Discard failed: no active activity",
            );
            throw new Error("No activity in progress");
        }

        try {
            logger.log("[activityService] Discarding activity", {
                id: this.activity.id,
            });

            this.activity = null;
            this.stopSession();

            logger.log("[activityService] Activity discarded");
        } catch (error) {
            logger.error("[activityService] Error discarding activity", {
                error,
            });
            throw error;
        }
    }

    onStatsUpdate(callback: (metric: Metrics) => void): () => void {
        this.metricsUpdateCallBacks.push(callback);

        return () => {
            this.metricsUpdateCallBacks = this.metricsUpdateCallBacks.filter(
                (cb) => cb !== callback,
            );
        };
    }
}

export const activityTrackingService = new ActivityTrackingService();
