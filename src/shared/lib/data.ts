import { Activity, Coordinate } from "../types/type";
import { generateId } from "../utils/utils";

function random(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number) {
    return Math.floor(random(min, max + 1));
}

/**
 * Convert meters to latitude degrees
 */
function metersToLat(meters: number): number {
    return meters / 111320;
}

/**
 * Convert meters to longitude degrees at a given latitude
 */
function metersToLng(meters: number, lat: number): number {
    return meters / (111320 * Math.cos((lat * Math.PI) / 180));
}

/**
 * Generate a realistic GPS path simulating a running/walking route.
 *
 * Strategy:
 * - Maintain a heading (direction in degrees) that gradually curves
 * - Simulate road-following by making turns infrequent but decisive
 * - Add small GPS noise (±1–3m) to mimic real GPS jitter
 * - Speed varies slightly each interval to simulate real effort
 *
 * @param startLat      Starting latitude  (e.g. 14.4297)
 * @param startLng      Starting longitude (e.g. 120.9367)
 * @param totalDistance Total target distance in meters
 * @param startTimestamp Unix ms timestamp for first point
 * @param type          "walk" | "run"
 */
function generateEarthCoordinates(
    startLat: number,
    startLng: number,
    totalDistance: number,
    startTimestamp: number,
    type: "walk" | "run",
): Coordinate[] {
    const coordinates: Coordinate[] = [];

    // ── Realistic pace (meters per second) ──────────────────────────────
    // Walk: ~1.2–1.6 m/s  |  Run: ~2.5–4.2 m/s
    const basePace = type === "run" ? random(2.5, 4.2) : random(1.2, 1.6);

    // GPS sample every 5 seconds
    const intervalSeconds = 5;

    // ── Heading state ────────────────────────────────────────────────────
    // Heading in degrees (0 = north, 90 = east, etc.)
    let heading = random(0, 360);

    // How many intervals until we make the next turn
    let stepsUntilTurn = randomInt(6, 20); // ~30–100 m between turns

    let lat = startLat;
    let lng = startLng;
    let distanceCovered = 0;

    while (distanceCovered < totalDistance) {
        // ── Speed jitter: ±8% of base pace ──────────────────────────────
        const speed = basePace * random(0.92, 1.08);
        const distanceThisStep = speed * intervalSeconds;

        // ── Heading update ───────────────────────────────────────────────
        stepsUntilTurn--;
        if (stepsUntilTurn <= 0) {
            // Make a realistic turn: mostly slight curves, occasionally sharp
            const turnAngle =
                Math.random() < 0.25
                    ? random(-140, 140) // sharp turn (e.g. U-turn or corner)
                    : random(-35, 35); // gentle curve

            heading = (heading + turnAngle + 360) % 360;
            stepsUntilTurn = randomInt(6, 20);
        } else {
            // Drift slightly each step to avoid perfectly straight segments
            heading = (heading + random(-4, 4) + 360) % 360;
        }

        // ── Move in current heading ──────────────────────────────────────
        const headingRad = (heading * Math.PI) / 180;
        const deltaLat = metersToLat(distanceThisStep * Math.cos(headingRad));
        const deltaLng = metersToLng(
            distanceThisStep * Math.sin(headingRad),
            lat,
        );

        lat += deltaLat;
        lng += deltaLng;

        // ── GPS noise: ±1–3 meters ───────────────────────────────────────
        const noiseLat = metersToLat(random(-2, 2));
        const noiseLng = metersToLng(random(-2, 2), lat);

        coordinates.push({
            latitude: Number((lat + noiseLat).toFixed(6)),
            longitude: Number((lng + noiseLng).toFixed(6)),
            timestamp:
                startTimestamp + coordinates.length * intervalSeconds * 1000,
        });

        distanceCovered += distanceThisStep;
    }

    return coordinates;
}

export const generateActivities = (): Activity[] => {
    const months = 2;

    const goal = 5000; // meters
    const sessionMaxPerDay = 3;

    const activities: Activity[] = [];

    const now = new Date();

    const startDate = new Date();
    startDate.setMonth(now.getMonth() - months);

    /**
     * Real world base location — Imus, Cavite
     */
    const baseLatitude = 14.4297;
    const baseLongitude = 120.9367;

    for (
        let day = new Date(startDate);
        day <= now;
        day.setDate(day.getDate() + 1)
    ) {
        const sessionCount = randomInt(1, sessionMaxPerDay);

        for (let i = 0; i < sessionCount; i++) {
            const type = Math.random() > 0.5 ? "walk" : "run";

            const start = new Date(day);
            start.setHours(randomInt(5, 20));
            start.setMinutes(randomInt(0, 59));
            start.setSeconds(randomInt(0, 59));

            // ── Distance: walk 1–4 km, run 3–12 km ──────────────────────
            const distance =
                type === "run" ? randomInt(3000, 12000) : randomInt(1000, 4000);

            // ── Duration derived from distance + realistic pace ──────────
            const avgPace =
                type === "run" ? random(2.5, 4.2) : random(1.2, 1.6);
            const duration = Math.round(distance / avgPace); // seconds

            const end = new Date(start.getTime() + duration * 1000);

            // Slightly randomize start location within the city area
            const activityStartLat = baseLatitude + random(-0.01, 0.01);
            const activityStartLng = baseLongitude + random(-0.01, 0.01);

            const coordinates = generateEarthCoordinates(
                activityStartLat,
                activityStartLng,
                distance,
                start.getTime(),
                type,
            );

            activities.push({
                id: generateId(),

                startTime: start.toISOString(),
                endTime: end.toISOString(),

                duration: duration.toString(),

                status: "completed",

                type,

                coordinates,

                goal,

                createdAt: start.toISOString(),
                updatedAt: end.toISOString(),
            });
        }
    }

    return activities.sort(
        (a, b) =>
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    );
};
