import { Activity, Coordinate, RawCoordinate } from "../types/type";

export const computeStats = (activities: Activity[]) => {
    const distance = activities.reduce(
        (sum, activity) => sum + activity.distance,
        0,
    );
    const calories = activities.reduce(
        (sum, activity) => sum + activity.calories,
        0,
    );
    const duration = activities.reduce(
        (sum, activity) => sum + activity.duration,
        0,
    );
    const goal = activities.reduce((sum, activity) => sum + activity.goal, 0);
    const pace = activities.reduce(
        (sum, activity) => sum + activity.avgPace,
        0,
    );
    const speed = activities.reduce(
        (sum, activity) => sum + activity.avgSpeed,
        0,
    );

    const steps = activities.reduce((sum, activity) => sum + activity.steps, 0);

    return {
        distance,
        calories,
        duration,
        goal,
        pace,
        speed,
        steps,
    };
};
export const computeDistance = (a: RawCoordinate, b: RawCoordinate) => {
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

export const computeTotalDistance = (coordinates: RawCoordinate[]) => {
    let total = 0;

    for (let i = 1; i < coordinates.length; i++) {
        total += computeDistance(
            coordinates[i - 1], // ✅ pass full Coordinate object
            coordinates[i], // ✅ not raw lat/lng numbers
        );
    }

    return total; // ✅ was missing
};
export function computeCalories(distanceMeters: number, weightKg: number) {
    const distanceKm = distanceMeters / 1000;
    return weightKg * distanceKm * 1.036;
}
export function computeSpeed(distanceMeters: number, durationSeconds: number) {
    if (!durationSeconds || durationSeconds <= 0) return 0;

    const distanceKm = distanceMeters / 1000;
    const durationHours = durationSeconds / 3600;

    return distanceKm / durationHours;
}
export const computePace = (distance: number, duration: number) => {
    if (distance === 0) return 0;

    const distanceKm = distance / 1000;
    return duration / distanceKm;
};

export function computeKmSplits(coordinates: Coordinate[]) {
    const splits: {
        km: number;
        durationSec: number;
        paceMinkm: number;
        coord: Coordinate;
    }[] = [];
    let bucketDist = 0;
    let bucketStart = coordinates[0];

    for (let i = 1; i < coordinates.length; i++) {
        bucketDist += computeDistance(coordinates[i - 1], coordinates[i]);
        if (bucketDist >= 1000) {
            const durationSec =
                (coordinates[i].timestamp - bucketStart.timestamp) / 1000;
            splits.push({
                km: splits.length + 1,
                durationSec,
                paceMinkm: durationSec / 60,
                coord: coordinates[i],
            });
            bucketDist = 0;
            bucketStart = coordinates[i];
        }
    }
    const last = coordinates[coordinates.length - 1];
    if (bucketDist > 50) {
        const durationSec = (last.timestamp - bucketStart.timestamp) / 1000;
        splits.push({
            km: splits.length + 1,
            durationSec,
            paceMinkm: durationSec / 60 / (bucketDist / 1000),
            coord: last,
        });
    }
    return splits;
}

export function computeSegmentIntensities(coordinates: Coordinate[]): number[] {
    const speeds: number[] = [];
    for (let i = 1; i < coordinates.length; i++) {
        const dist = computeDistance(coordinates[i - 1], coordinates[i]);
        const dt =
            (coordinates[i].timestamp - coordinates[i - 1].timestamp) / 1000;
        speeds.push(dt > 0 ? dist / dt : 0);
    }
    const max = Math.max(...speeds);
    const min = Math.min(...speeds);
    return speeds.map((s) => (max > min ? (s - min) / (max - min) : 0.5));
}
