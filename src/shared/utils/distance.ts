import { Coordinate } from "../types/type";

export const computeDistance = (a: Coordinate, b: Coordinate) => {
    const R = 6_371_000;
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);

    const x =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

export const computeTotalDistance = (coordinates: Coordinate[]) => {
    let total = 0;

    for (let i = 1; i < coordinates.length; i++) {
        total += computeDistance(
            coordinates[i - 1], // ✅ pass full Coordinate object
            coordinates[i], // ✅ not raw lat/lng numbers
        );
    }

    return total; // ✅ was missing
};

export const convertMtoKm = (m: number) => {
    return (m / 1000).toFixed(1);
};
