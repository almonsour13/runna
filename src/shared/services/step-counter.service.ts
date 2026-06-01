import { Accelerometer } from "expo-sensors";
import { logger } from "../utils/logger";

// ─── Tuning constants ─────────────────────────────────────────────────────────

/**
 * How often the accelerometer fires (ms).
 * 100 ms → ~10 Hz, plenty for walking/running cadence detection.
 */
const ACCELEROMETER_UPDATE_INTERVAL_MS = 100;

/**
 * Minimum magnitude of the smoothed acceleration vector to qualify as a step peak.
 * Units: g-force (9.8 m/s² = 1 g).
 * Typical walking peak: ~1.2–1.5 g. Tune up if false-positives appear.
 */
const STEP_THRESHOLD = 1.15;

/**
 * Minimum time between two consecutive steps (ms).
 * 250 ms → max 4 steps/sec, fast enough for sprinting.
 * Prevents a single footfall from registering twice.
 */
const MIN_STEP_INTERVAL_MS = 250;

/**
 * Low-pass filter alpha for smoothing raw accelerometer noise.
 * Closer to 1 = less smoothing (noisier but more responsive).
 * Closer to 0 = heavy smoothing (lags real motion).
 */
const LOW_PASS_ALPHA = 0.2;

/**
 * Window size for the rolling average used to compute a dynamic baseline.
 * The detector fires when the current magnitude exceeds
 * (baseline * DYNAMIC_THRESHOLD_MULTIPLIER).
 */
const DYNAMIC_BASELINE_WINDOW = 10;
const DYNAMIC_THRESHOLD_MULTIPLIER = 1.05;

// ─── Types ────────────────────────────────────────────────────────────────────

type StepCallback = (totalSteps: number) => void;

// ─── Service ──────────────────────────────────────────────────────────────────

class StepCounterService {
    // Subscription handle returned by Accelerometer.addListener
    private subscription: ReturnType<typeof Accelerometer.addListener> | null =
        null;

    // Accumulated step count for the current session
    private steps = 0;

    // Smoothed acceleration magnitude (low-pass output)
    private smoothedMagnitude = 0;

    // Whether the magnitude is currently above the threshold (prevents double-counting)
    private isPeak = false;

    // Timestamp of the last confirmed step
    private lastStepTime = 0;

    // Rolling window of recent magnitudes for dynamic baseline
    private magnitudeWindow: number[] = [];

    // All registered step callbacks
    private stepCallbacks: Set<StepCallback> = new Set();

    // Is the service actively listening?
    private isRunning = false;

    // ─── Public API ────────────────────────────────────────────────────────────

    /**
     * Start counting steps.
     * Idempotent — safe to call multiple times; only one listener is created.
     */
    start(): void {
        if (this.isRunning) {
            logger.warn("[StepCounter] Already running, ignoring start()");
            return;
        }

        logger.log("[StepCounter] Starting step counter");

        Accelerometer.setUpdateInterval(ACCELEROMETER_UPDATE_INTERVAL_MS);

        this.subscription = Accelerometer.addListener(({ x, y, z }) => {
            this.handleAccelerometerUpdate(x, y, z);
        });

        this.isRunning = true;
        logger.log("[StepCounter] Step counter started");
    }

    /**
     * Stop counting steps and remove the accelerometer listener.
     * State (step count, smoothing values) is preserved so the count
     * can be read after stopping.
     */
    stop(): void {
        if (!this.isRunning) {
            logger.warn("[StepCounter] Not running, ignoring stop()");
            return;
        }

        logger.log("[StepCounter] Stopping step counter");

        this.subscription?.remove();
        this.subscription = null;
        this.isRunning = false;

        logger.log("[StepCounter] Step counter stopped", {
            totalSteps: this.steps,
        });
    }

    /**
     * Reset the step count and all internal filter state.
     * Does NOT stop the service if it is running.
     */
    reset(): void {
        logger.log("[StepCounter] Resetting step counter");
        this.steps = 0;
        this.smoothedMagnitude = 0;
        this.isPeak = false;
        this.lastStepTime = 0;
        this.magnitudeWindow = [];
        logger.log("[StepCounter] Step counter reset");
    }

    /** Returns the current step count without stopping the service. */
    getSteps(): number {
        return this.steps;
    }

    /** Whether the service is currently listening to the accelerometer. */
    get running(): boolean {
        return this.isRunning;
    }

    /**
     * Register a callback that fires on every confirmed step.
     * Returns an unsubscribe function.
     *
     * @example
     * const unsub = stepCounterService.onStep((total) => setSteps(total));
     * // later:
     * unsub();
     */
    onStep(callback: StepCallback): () => void {
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

    // ─── Core detection logic ──────────────────────────────────────────────────

    /**
     * Called on every accelerometer sample.
     *
     * Algorithm:
     *  1. Compute the raw vector magnitude (removes orientation dependence).
     *  2. Apply a low-pass filter to smooth out high-frequency noise.
     *  3. Maintain a rolling window to compute a dynamic baseline.
     *  4. Detect a rising edge: magnitude crosses above both the static
     *     threshold AND the dynamic baseline.
     *  5. Enforce a minimum inter-step interval to debounce double-counts.
     *  6. On a confirmed step: increment counter and notify callbacks.
     *  7. Detect the falling edge to reset the peak flag, ready for the next step.
     */
    private handleAccelerometerUpdate(x: number, y: number, z: number): void {
        // Step 1 — raw vector magnitude (g-force units)
        const rawMagnitude = Math.sqrt(x * x + y * y + z * z);

        // Step 2 — exponential low-pass filter to reduce noise
        this.smoothedMagnitude =
            LOW_PASS_ALPHA * rawMagnitude +
            (1 - LOW_PASS_ALPHA) * this.smoothedMagnitude;

        // Step 3 — maintain rolling window for dynamic baseline
        this.magnitudeWindow.push(this.smoothedMagnitude);
        if (this.magnitudeWindow.length > DYNAMIC_BASELINE_WINDOW) {
            this.magnitudeWindow.shift();
        }

        const baseline =
            this.magnitudeWindow.reduce((sum, v) => sum + v, 0) /
            this.magnitudeWindow.length;

        const dynamicThreshold = baseline * DYNAMIC_THRESHOLD_MULTIPLIER;

        // Step 4 & 5 — rising edge detection with debounce
        const now = Date.now();
        const aboveThreshold =
            this.smoothedMagnitude > STEP_THRESHOLD &&
            this.smoothedMagnitude > dynamicThreshold;

        if (aboveThreshold && !this.isPeak) {
            const timeSinceLastStep = now - this.lastStepTime;

            if (timeSinceLastStep >= MIN_STEP_INTERVAL_MS) {
                // Step 6 — confirmed step
                this.isPeak = true;
                this.lastStepTime = now;
                this.steps += 1;

                logger.log("[StepCounter] Step detected", {
                    step: this.steps,
                    magnitude: this.smoothedMagnitude.toFixed(3),
                    baseline: baseline.toFixed(3),
                    interval: timeSinceLastStep,
                });

                // Step 6 — notify all subscribers
                this.notifyCallbacks();
            }
        }

        // Step 7 — falling edge: reset peak flag once magnitude drops back down
        if (!aboveThreshold && this.isPeak) {
            this.isPeak = false;
        }
    }

    private notifyCallbacks(): void {
        this.stepCallbacks.forEach((cb) => {
            try {
                cb(this.steps);
            } catch (error) {
                logger.error("[StepCounter] Error in step callback:", error);
            }
        });
    }
}

export const stepCounterService = new StepCounterService();
