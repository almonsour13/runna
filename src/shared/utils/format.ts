import { isToday, isYesterday } from "date-fns";

const pad = (n: number) => n.toString().padStart(2, "0");

export const formatRelativeDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return null;
};
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
    return calories.toFixed(0);
}

export function formatCmToftIn(cm: number) {
    if (!cm || cm < 0 || !isFinite(cm)) return "0";
    const inches = Math.round(cm / 2.54);
    const ft = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${ft}' ${remainingInches}"`;
}
