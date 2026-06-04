import { Pedometer } from "expo-sensors";
import { logger } from "../../utils/logger";

type StepCallback = (totalSteps: number) => void;

class StepCounterService {
    // ======================
    // State
    // ======================
    private subscription: ReturnType<typeof Pedometer.watchStepCount> | null =
        null;
    private steps = 0;
    private stepOffset = 0;
    private isAvailable: boolean | null = null;
    private stepCallbacks: Set<StepCallback> = new Set();

    // ======================
    // Availability / Permissions
    // ======================
    async requestPermissions(): Promise<boolean> {
        if (this.isAvailable !== null) return this.isAvailable;

        try {
            const { status } = await Pedometer.requestPermissionsAsync();

            if (status !== "granted") {
                logger.warn("[StepCounter] Pedometer permission denied");
                this.isAvailable = false;
                return false;
            }

            const available = await Pedometer.isAvailableAsync();
            this.isAvailable = available;

            if (!available) {
                logger.warn(
                    "[StepCounter] Pedometer not available on this device",
                );
            } else {
                logger.log("[StepCounter] Pedometer available");
            }

            return available;
        } catch (error) {
            logger.error("[StepCounter] Availability check failed", {
                message: (error as Error)?.message,
            });
            this.isAvailable = false;
            return false;
        }
    }

    // ======================
    // Start
    // ======================
    async start(): Promise<boolean> {
        logger.log("[StepCounter] start() called", {
            stepOffset: this.stepOffset,
        });

        this.stop();
        this.steps = this.stepOffset;

        const available = await this.requestPermissions();

        if (!available) {
            logger.warn(
                "[StepCounter] start() skipped — pedometer not available",
            );
            return false;
        }

        try {
            this.subscription = Pedometer.watchStepCount(({ steps }) => {
                // steps from watchStepCount is cumulative from when watch started
                // so we add the offset for restored sessions
                const total = this.stepOffset + steps;
                this.steps = total;

                logger.log("[StepCounter] Step detected", {
                    steps,
                    total,
                });

                this.emitToCallbacks(total);
            });

            logger.log("[StepCounter] Listening for steps via pedometer");
            return true;
        } catch (error) {
            logger.error("[StepCounter] Failed to start", {
                message: (error as Error)?.message,
                stack: (error as Error)?.stack,
            });
            this.stop();
            return false;
        }
    }

    // ======================
    // Stop
    // ======================
    stop(): void {
        if (!this.subscription) {
            logger.log("[StepCounter] stop() called — no active subscription");
            return;
        }

        try {
            this.subscription.remove();
        } catch (error) {
            logger.error("[StepCounter] Error removing subscription", {
                message: (error as Error)?.message,
            });
        } finally {
            this.subscription = null;
            logger.log("[StepCounter] Stopped", { finalSteps: this.steps });
        }
    }

    // ======================
    // Reset
    // ======================
    reset(): void {
        this.steps = 0;
        this.stepOffset = 0;
        logger.log("[StepCounter] Reset");
    }

    // ======================
    // Seed (crash restore)
    // ======================
    seedSteps(restoredSteps: number): void {
        this.stepOffset = restoredSteps;
        logger.log("[StepCounter] Step seed set", {
            stepOffset: this.stepOffset,
        });
    }

    // ======================
    // Getters
    // ======================
    getSteps(): number {
        return this.steps;
    }

    getAvailability(): boolean | null {
        return this.isAvailable;
    }

    // ======================
    // Callbacks
    // ======================
    private emitToCallbacks(totalSteps: number): void {
        this.stepCallbacks.forEach((cb) => {
            try {
                cb(totalSteps);
            } catch (error) {
                logger.error("[StepCounter] Error in step callback", {
                    message: (error as Error)?.message,
                });
            }
        });
    }

    onStepUpdate(callback: StepCallback): () => void {
        if (!callback) {
            logger.warn(
                "[StepCounter] Attempted to register null/undefined callback",
            );
            return () => {};
        }

        this.stepCallbacks.add(callback);
        logger.log(
            `[StepCounter] Callback registered (total: ${this.stepCallbacks.size})`,
        );

        return () => {
            this.stepCallbacks.delete(callback);
            logger.log(
                `[StepCounter] Callback unregistered (remaining: ${this.stepCallbacks.size})`,
            );
        };
    }

    // ======================
    // Debug / Status
    // ======================
    getStatus() {
        return {
            isAvailable: this.isAvailable,
            isRunning: this.subscription !== null,
            steps: this.steps,
            stepOffset: this.stepOffset,
            callbackCount: this.stepCallbacks.size,
        };
    }
}

export const stepCounterService = new StepCounterService();
