import {
    MAX_SPEED_MPS,
    MIN_ACCURACY_METERS,
    MIN_DISTANCE_METERS,
    WARMUP_READINGS,
} from "@/shared/constant/constant";
import { Coordinate } from "@/shared/types/type";
import { computeDistance } from "./compute";

let readingCount = 0;

export function resetPreprocessor(): void {
    readingCount = 0;
}

export function preprocessLocation(
    coord: Coordinate,
    lastCoord: Coordinate | null,
): Coordinate | null {
    // Warmup — discard first N readings while GPS stabilizes
    if (readingCount < WARMUP_READINGS) {
        readingCount++;
        return null;
    }

    // Accuracy check
    if (coord.accuracy > MIN_ACCURACY_METERS) return null;

    // Speed check (only when speed is actually reported)
    if (coord.speed != null && coord.speed > 0 && coord.speed > MAX_SPEED_MPS)
        return null;

    if (lastCoord) {
        const dist = computeDistance(lastCoord, coord);

        // Too close — ignore
        if (dist < MIN_DISTANCE_METERS) return null;

        // Too far for time elapsed — bad GPS point
        const timeDeltaSec = (coord.timestamp - lastCoord.timestamp) / 1000;
        const maxPossibleDist = MAX_SPEED_MPS * timeDeltaSec * 2;
        if (timeDeltaSec > 0 && dist > maxPossibleDist) return null;
    }

    return coord;
}
