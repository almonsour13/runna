// utils/simplify-coordinates.ts
import simplify from "simplify-js";
import { Coordinate } from "../types/type";

export function simplifyCoordinates(
    coordinates: Coordinate[],
    tolerance: number = 0.0001, // ~11m at equator, good for card thumbnails
    highQuality: boolean = false, // false = faster, good enough for previews
): Coordinate[] {
    if (coordinates.length <= 2) return coordinates;

    // simplify-js expects {x, y} points
    const points = coordinates.map((c) => ({
        x: c.longitude,
        y: c.latitude,
    }));

    const simplified = simplify(points, tolerance, highQuality);
    const lngLatMap = new Map(
        coordinates.map((c) => [`${c.longitude},${c.latitude}`, c]),
    );

    return simplified
        .map((p) => lngLatMap.get(`${p.x},${p.y}`))
        .filter((c): c is Coordinate => !!c);
}
