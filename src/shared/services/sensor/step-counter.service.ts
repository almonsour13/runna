import { Accelerometer } from "expo-sensors";
import { activityClassifierService } from "./activity-classifier.service";

const STEP_PEAK_THRESHOLD = 1.2; // g — magnitude must exceed this to count
const STEP_VALLEY_THRESHOLD = 1.05; // g — must fall below this before next step
const STEP_INTERVAL_MS = 250; // minimum ms between steps (~max 4 steps/sec)

class StepCounterService {
    private subscription: ReturnType<typeof Accelerometer.addListener> | null =
        null;
    private steps = 0;
    private lastMagnitude = 1.0;
    private belowValley = true; // ready to detect the next peak
    private lastStepTime = 0;

    start() {
        if (this.subscription) return;
        this.reset();
        Accelerometer.setUpdateInterval(50); // 20 Hz for step detection

        this.subscription = Accelerometer.addListener(({ x, y, z }) => {
            const magnitude = Math.sqrt(x * x + y * y + z * z);
            this.processSample(magnitude);
            this.lastMagnitude = magnitude;
        });
    }

    stop() {
        this.subscription?.remove();
        this.subscription = null;
    }

    reset() {
        this.steps = 0;
        this.lastMagnitude = 1.0;
        this.belowValley = true;
        this.lastStepTime = 0;
    }

    getSteps(): number {
        return this.steps;
    }

    private processSample(magnitude: number) {
        const now = Date.now();

        // Mark as ready for a new peak once signal dips below the valley line
        if (magnitude < STEP_VALLEY_THRESHOLD) {
            this.belowValley = true;
        }

        // Count a step on the rising edge through the peak threshold
        if (
            this.belowValley &&
            magnitude >= STEP_PEAK_THRESHOLD &&
            this.lastMagnitude < STEP_PEAK_THRESHOLD &&
            now - this.lastStepTime >= STEP_INTERVAL_MS
        ) {
            const activity = activityClassifierService.getActivity();
            if (activity === "walking" || activity === "running") {
                this.steps++;
                this.lastStepTime = now;
                this.belowValley = false; // require dip before next step
            }
        }
    }
}

export const stepCounterService = new StepCounterService();
