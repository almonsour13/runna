import { Accelerometer } from "expo-sensors";

export type ActivityType = "idle" | "walking" | "running";

interface ActivityClassifierOptions {
    windowSize?: number;
    updateInterval?: number;
    idleThreshold?: number;
    runningThreshold?: number;
}

const DEFAULTS = {
    windowSize: 20,
    updateInterval: 100,
    idleThreshold: 0.05,
    runningThreshold: 0.8,
};

class ActivityClassifierService {
    private subscription: ReturnType<typeof Accelerometer.addListener> | null =
        null;
    private window: number[] = [];
    private currentActivity: ActivityType = "idle";
    private options: Required<ActivityClassifierOptions>;
    private callbacks: Array<(activity: ActivityType) => void> = [];

    constructor(options: ActivityClassifierOptions = {}) {
        this.options = { ...DEFAULTS, ...options };
    }

    // ─── Public API ────────────────────────────────────────────────────────────

    start() {
        if (this.subscription) return;

        Accelerometer.setUpdateInterval(this.options.updateInterval);
        this.subscription = Accelerometer.addListener(({ x, y, z }) => {
            this.onSample(x, y, z);
        });
    }

    stop() {
        this.subscription?.remove();
        this.subscription = null;
        this.window = [];
    }

    getActivity(): ActivityType {
        return this.currentActivity;
    }

    onChange(callback: (activity: ActivityType) => void): () => void {
        this.callbacks.push(callback);
        return () => {
            this.callbacks = this.callbacks.filter((cb) => cb !== callback);
        };
    }

    // ─── Core Logic ────────────────────────────────────────────────────────────

    private onSample(x: number, y: number, z: number) {
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        this.window.push(magnitude);

        if (this.window.length > this.options.windowSize) {
            this.window.shift();
        }

        if (this.window.length < this.options.windowSize) return;

        const activity = this.classify(this.window);

        if (activity !== this.currentActivity) {
            this.currentActivity = activity;
            this.callbacks.forEach((cb) => {
                try {
                    cb(activity);
                } catch (e) {}
            });
        }
    }

    private classify(window: number[]): ActivityType {
        const variance = this.getVariance(window);
        if (variance < this.options.idleThreshold) return "idle";
        if (variance >= this.options.runningThreshold) return "running";
        return "walking";
    }

    private getVariance(values: number[]): number {
        const mean = values.reduce((s, v) => s + v, 0) / values.length;
        return values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
    }
}

export const activityClassifierService = new ActivityClassifierService();
