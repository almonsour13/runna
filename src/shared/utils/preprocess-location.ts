import { RawCoordinate } from "@/shared/types/type";
import { GPS_FILTER_CONFIG } from "../constant/gps";
import { computeDistance } from "./compute";

let readingCount = 0;

export function resetPreprocessor(): void {
    readingCount = 0;
}

export function preprocessLocation(
    coord: RawCoordinate,
    lastCoord: RawCoordinate | null,
): RawCoordinate | null {
    // 1. Warmup — let GPS hardware stabilize
    if (readingCount < GPS_FILTER_CONFIG.WARMUP_READINGS) {
        readingCount++;
        return null;
    }

    // 2. Hard accuracy cap — drop anything wider than 15m radius
    if (
        coord.accuracy != null &&
        coord.accuracy > GPS_FILTER_CONFIG.MAX_ACCURACY_METERS
    ) {
        return null;
    }

    // 3. Hardware speed check — drop vehicle-speed anomalies
    if (coord.speed != null && coord.speed > GPS_FILTER_CONFIG.MAX_SPEED_MS) {
        return null;
    }

    // 4. Relative delta checks vs last valid waypoint
    if (lastCoord) {
        const dist = computeDistance(lastCoord, coord);

        // Drop standing-still jitter/noise
        if (dist < GPS_FILTER_CONFIG.MIN_DISTANCE_METERS) {
            return null;
        }

        // Time delta
        const timeDeltaSec = (coord.timestamp - lastCoord.timestamp) / 1000;

        if (timeDeltaSec > 0) {
            // Max plausible distance given speed cap + 10% GPS variance buffer
            const maxPossibleDist =
                GPS_FILTER_CONFIG.MAX_SPEED_MS * timeDeltaSec * 1.1;

            if (dist > maxPossibleDist) {
                return null;
            }
        }
    }

    return coord;
}
