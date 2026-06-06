import { useSettingsStore } from "../stores/use-settings-store";
import {
    formatCalories,
    formatDurationReadable,
    formatPaceByUnit,
    formatSpeedByUnit,
} from "../utils/format";
import { useUnit } from "./use-unit";

export const useFormatMetrics = ({
    distance,
    calories,
    duration,
    steps,
    speed,
    pace,
}: {
    distance?: number;
    duration?: number;
    calories?: number;
    steps?: number;
    speed?: number;
    pace?: number;
}) => {
    const stats = [];
    const preferences = useSettingsStore((s) => s.settings?.preferences);
    const unit = preferences?.unit || "kilometers";

    if (distance != null) {
        const d = useUnit(distance, false);
        stats.push({
            key: "distance",
            label: "Distance",
            value: [
                {
                    value: d.value,
                    unit: d.unit,
                },
            ],
            icon: "navigate",
        });
    }

    if (duration != null) {
        const du = formatDurationReadable(duration);
        stats.push({
            key: "duration",
            label: "Duration",
            value: [
                {
                    value: du.value[0].value,
                    unit: du.value[0].unit,
                },
                {
                    value: du.value[1].value,
                    unit: du.value[1].unit,
                },
            ],
            icon: "time",
        });
    }

    if (calories != null) {
        stats.push({
            key: "calories",
            label: "Calories",
            value: [
                {
                    value: formatCalories(calories),
                    unit: "kcal",
                },
            ],
            icon: "flame",
        });
    }

    if (steps != null) {
        stats.push({
            key: "steps",
            label: "Steps",
            value: [
                {
                    value: steps.toLocaleString("en-US"),
                    unit: " ",
                },
            ],
            icon: "footsteps",
        });
    }

    if (speed != null) {
        const s = formatSpeedByUnit(speed, unit);
        stats.push({
            key: "speed",
            label: "Speed",
            value: [
                {
                    value: s.value,
                    unit: s.unit,
                },
            ],
            icon: "speedometer",
        });
    }

    if (pace != null) {
        const p = formatPaceByUnit(pace, unit);
        stats.push({
            key: "pace",
            label: "Pace",
            value: [
                {
                    value: p.value,
                    unit: p.unit,
                },
            ],
            icon: "timer",
        });
    }

    return stats;
};
