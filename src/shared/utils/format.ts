import { isToday, isYesterday } from "date-fns";
import { UnitMode } from "../types/type";
import { convertMtoKm, convertMtoMiles } from "./convert";

const pad = (n: number) => n.toString().padStart(2, "0");

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

    return {
        value: [
            {
                value: hours,
                unit: "h",
            },
            {
                value: minutes,
                unit: "m",
            },
        ],
    };
}
export const formatDurationHHMMSS = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};
export function formatDuration(ms: number) {
    if (!ms || ms < 0) return "00:00";
    const totalSeconds = Math.floor(ms / 1000);

    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);

    return `${pad(hrs)}:${pad(mins)}`;
}
export const formatDistanceByUnit = (
    meters: number,
    unit: UnitMode = "kilometers",
    showUnit = true,
    minimumFractionDigits = 1,
    maximumFractionDigits = 1,
): {
    value: string | number;
    unit: string;
} => {
    if (unit === "kilometers") {
        const value = convertMtoKm(meters).toLocaleString("en-US", {
            minimumFractionDigits,
            maximumFractionDigits,
        });
        return {
            value: showUnit ? `${value} km` : value,
            unit: "km",
        };
    }

    const value = convertMtoMiles(meters).toLocaleString("en-US", {
        minimumFractionDigits,
        maximumFractionDigits,
    });
    return {
        value: showUnit ? `${value} mi` : value,
        unit: "mi",
    };
};

export function formatPaceByUnit(secondsPerMeter: number, unit: UnitMode) {
    if (
        !secondsPerMeter ||
        secondsPerMeter <= 0 ||
        !isFinite(secondsPerMeter)
    ) {
        return {
            value: "00:00",
            unit: unit === "miles" ? "/mi" : "/km",
        };
    }

    let totalSecondsPerUnit = 0;
    let unitLabel = "/km";

    if (unit === "miles") {
        // seconds/meter * 1609.344 meters/mile = seconds/mile
        totalSecondsPerUnit = Math.round(secondsPerMeter * 1609.344);
        unitLabel = "/mi";
    } else {
        // Default to kilometers: seconds/meter * 1000 meters/km = seconds/km
        totalSecondsPerUnit = Math.round(secondsPerMeter * 1000);
        unitLabel = "/km";
    }

    const min = Math.floor(totalSecondsPerUnit / 60);
    const sec = totalSecondsPerUnit % 60;

    return {
        value: `${pad(min)}:${pad(sec)}`,
        unit: unitLabel,
    };
}
export function formatSpeedByUnit(metersPerSecond: number, unit: UnitMode) {
    if (!metersPerSecond || metersPerSecond < 0 || !isFinite(metersPerSecond)) {
        return {
            value: "0.0",
            unit: unit === "miles" ? "mph" : "km/h",
        };
    }

    let calculatedSpeed = 0;
    let unitLabel = "km/h";

    if (unit === "miles") {
        // m/s to mph: multiply by 2.23694
        calculatedSpeed = metersPerSecond * 2.23694;
        unitLabel = "mph";
    } else {
        // m/s to km/h: multiply by 3.6
        calculatedSpeed = metersPerSecond * 3.6;
        unitLabel = "km/h";
    }

    return {
        value: calculatedSpeed.toFixed(1),
        unit: unitLabel,
    };
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
