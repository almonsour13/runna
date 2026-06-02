import { Accelerometer } from "expo-sensors";
import { logger } from "../../utils/logger";

// Minimum time between two detected steps (ms). Filters out noise / double-counts.
// Human cadence is ~1–3 steps/sec, so anything faster than ~250 ms is noise.
const STEP_COOLDOWN_MS = 300;

// Acceleration magnitude threshold to register as a step.
// A relaxed walking gait peaks around 1.2–1.5 g; 1.15 is a safe floor that
// still ignores minor arm / device jitter.
const STEP_THRESHOLD = 1.15;

// Accelerometer poll interval in ms. 100 ms (10 Hz) is sufficient for gait
// detection and keeps battery impact low.
const UPDATE_INTERVAL_MS = 100;

// How long to wait for the first accelerometer event before giving up.
const AVAILABILITY_CHECK_TIMEOUT_MS = 3_000;

type StepCallback = (totalSteps: number) => void;

class StepCounterService {
    // ======================
    // State
    // ======================

    private subscription: ReturnType<typeof Accelerometer.addListener> | null =
        null;

    // Total steps for this session (offset + steps detected since start).
    private steps = 0;

    // Pre-crash step count added to every reading during a restored session.
    private stepOffset = 0;

    // Timestamp of the last accepted step — used to enforce STEP_COOLDOWN_MS.
    private lastStepTime = 0;

    private isAvailable: boolean | null = null;

    private stepCallbacks: Set<StepCallback> = new Set();

    // ======================
    // Availability / Permissions
    // ======================

    async requestPermissions(): Promise<boolean> {
        if (this.isAvailable !== null) return this.isAvailable;

        try {
            // Probe availability by attempting to subscribe and waiting for
            // the first event. Accelerometer.isAvailableAsync() exists in
            // newer Expo SDK versions but isn't universally available, so
            // we fall back to an event-based check that works everywhere.
            const available = await Promise.race([
                new Promise<boolean>((resolve) => {
                    // If isAvailableAsync exists, prefer it.
                    if (typeof Accelerometer.isAvailableAsync === "function") {
                        Accelerometer.isAvailableAsync()
                            .then(resolve)
                            .catch(() => resolve(false));
                    } else {
                        // Fallback: try subscribing; if we get an event it works.
                        const probe = Accelerometer.addListener(() => {
                            probe.remove();
                            resolve(true);
                        });
                        Accelerometer.setUpdateInterval(UPDATE_INTERVAL_MS);
                    }
                }),
                new Promise<false>((resolve) =>
                    setTimeout(
                        () => resolve(false),
                        AVAILABILITY_CHECK_TIMEOUT_MS,
                    ),
                ),
            ]);

            this.isAvailable = available;

            if (!available) {
                logger.warn(
                    "[StepCounter] Accelerometer not available on this device",
                );
            } else {
                logger.log("[StepCounter] Accelerometer available");
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
        this.lastStepTime = 0;

        const available = await this.requestPermissions();

        if (!available) {
            logger.warn(
                "[StepCounter] start() skipped — accelerometer not available",
            );
            return false;
        }

        try {
            Accelerometer.setUpdateInterval(UPDATE_INTERVAL_MS);

            this.subscription = Accelerometer.addListener(({ x, y, z }) => {
                // Compute the total acceleration magnitude (in g).
                // A flat, stationary phone reads ~1 g on the z-axis; walking
                // produces a noticeable spike above that baseline.
                const magnitude = Math.sqrt(x * x + y * y + z * z);

                const now = Date.now();

                if (
                    magnitude > STEP_THRESHOLD &&
                    now - this.lastStepTime > STEP_COOLDOWN_MS
                ) {
                    this.lastStepTime = now;
                    this.steps += 1;

                    logger.log("[StepCounter] Step detected", {
                        magnitude: magnitude.toFixed(3),
                        total: this.steps,
                    });

                    this.emitToCallbacks(this.steps);
                }
            });

            logger.log("[StepCounter] Listening for steps via accelerometer");
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
    // Seed (crash restore)
    // ======================

    seedSteps(restoredSteps: number): void {
        this.stepOffset = restoredSteps;
        logger.log("[StepCounter] Step seed set", {
            stepOffset: this.stepOffset,
        });
    }

    private resetSeed(): void {
        this.stepOffset = 0;
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
            this.resetSeed();
            logger.log("[StepCounter] Stopped", { finalSteps: this.steps });
        }
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
