import { isToday, isYesterday } from "date-fns";
import { convertMsToS, convertMtoKm } from "./convert";

const pad = (n: number) => n.toString().padStart(2, "0");

export const formatStats = ({
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

    if (distance != null) {
        stats.push({
            key: "distance",
            label: "Distance",
            value: convertMtoKm(distance).toFixed(1),
            unit: "km",
            icon: "navigate",
        });
    }

    if (duration != null) {
        stats.push({
            key: "duration",
            label: "Duration",
            value: formatDuration(convertMsToS(duration)),
            unit: null,
            icon: "time",
        });
    }

    if (calories != null) {
        stats.push({
            key: "calories",
            label: "Calories",
            value: formatCalories(calories),
            unit: "kcal",
            icon: "flame",
        });
    }

    if (steps != null) {
        stats.push({
            key: "steps",
            label: "Steps",
            value: steps.toLocaleString("en-US", {
                maximumFractionDigits: 0,
            }),
            unit: null,
            icon: "footsteps",
        });
    }

    if (speed != null) {
        stats.push({
            key: "speed",
            label: "Speed",
            value: formatSpeed(speed),
            unit: "km/h",
            icon: "speedometer",
        });
    }

    if (pace != null) {
        stats.push({
            key: "pace",
            label: "Pace",
            value: formatPace(pace),
            unit: "/km",
            icon: "speedometer",
        });
    }

    return stats;
};
export const formatRelativeDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return null;
};
export function formatDurationReadable(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const parts: string[] = [];

    return `${hours}${hours > 1 ? "hrs" : "hr"} ${minutes}${minutes > 1 ? "mins" : "min"}`;
}
export const formatDurationHHMMSS = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};
export function formatDuration(seconds: number) {
    if (!seconds || seconds < 0) return "00:00";

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    return `${pad(hrs)}:${pad(mins)}`;
}
export function formatPace(secondsPerKm: number) {
    if (!secondsPerKm || secondsPerKm <= 0 || !isFinite(secondsPerKm)) {
        return "00:00";
    }

    const totalSeconds = Math.round(secondsPerKm);

    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;

    return `${min}:${pad(sec)}`;
}
export function formatSpeed(speed: number) {
    if (!speed || speed < 0 || !isFinite(speed)) return "0.0";
    return speed.toFixed(1);
}
export function formatCalories(calories: number) {
    if (!calories || calories < 0 || !isFinite(calories)) return "0";
    return calories.toLocaleString("en-US", {
        maximumFractionDigits: 0,
    });
}

export function formatCmToftIn(cm: number) {
    if (!cm || cm < 0 || !isFinite(cm)) return "0";
    const inches = Math.round(cm / 2.54);
    const ft = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${ft}' ${remainingInches}"`;
}
