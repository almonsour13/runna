// utils/preprocess-location.ts
import {
    MAX_SPEED_MPS,
    MIN_ACCURACY_METERS,
    MIN_DISTANCE_METERS,
} from "@/shared/constant/constant";
import { Coordinate } from "@/shared/types/type";
import { computeDistance } from "./compute";

export function preprocessLocation(
    coord: Coordinate,
    lastCoord: Coordinate | null,
): Coordinate | null {
    if (coord.accuracy > MIN_ACCURACY_METERS) return null;
    if (coord.speed != null && coord.speed > MAX_SPEED_MPS) return null;

    if (lastCoord) {
        const dist = computeDistance(lastCoord, coord);
        if (dist < MIN_DISTANCE_METERS) return null;
    }

    return coord;
}
