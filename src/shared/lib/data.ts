import { Activity, Coordinate } from "../types/type";

function random(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number) {
    return Math.floor(random(min, max + 1));
}

function metersToLat(meters: number): number {
    return meters / 111320;
}

function metersToLng(meters: number, lat: number): number {
    return meters / (111320 * Math.cos((lat * Math.PI) / 180));
}

function generateEarthCoordinates(
    startLat: number,
    startLng: number,
    totalDistance: number,
    startTimestamp: number,
    type: "walk" | "run",
): Omit<Coordinate, "activityId" | "id">[] {
    // ✅ correct Omit syntax on the element type
    const coordinates: Omit<Coordinate, "activityId" | "id">[] = [];

    const baseSpeed = type === "run" ? random(2.5, 4.2) : random(1.2, 1.6); // ✅ renamed: this is m/s, not pace
    const intervalMs = 5000;

    let heading = random(0, 360);
    let stepsUntilTurn = randomInt(6, 20);

    let lat = startLat;
    let lng = startLng;
    let distanceCovered = 0;
    let stepIndex = 0; // ✅ explicit counter instead of relying on coordinates.length at push time

    while (distanceCovered < totalDistance) {
        const speed = baseSpeed * random(0.92, 1.08);
        const distanceStep = speed * 5;

        stepsUntilTurn--;

        if (stepsUntilTurn <= 0) {
            heading = (heading + random(-120, 120) + 360) % 360;
            stepsUntilTurn = randomInt(6, 20);
        } else {
            heading = (heading + random(-4, 4) + 360) % 360;
        }

        const rad = (heading * Math.PI) / 180;

        lat += metersToLat(distanceStep * Math.cos(rad));
        lng += metersToLng(distanceStep * Math.sin(rad), lat);

        coordinates.push({
            latitude: Number(lat.toFixed(6)),
            longitude: Number(lng.toFixed(6)),
            timestamp: startTimestamp + stepIndex * intervalMs, // ✅ Date object to match schema mode: "timestamp"
            altitude: 0,
            accuracy: 5,
            speed: 0,
            heading: 0,
        });

        distanceCovered += distanceStep;
        stepIndex++; // ✅ increment after push
    }

    return coordinates;
}

export const generateActivities = ({
    months = 2,
    goal = 5000,
    sessionMinPerDay = 2,
    sessionMaxPerDay = 3,
}: {
    months?: number;
    goal?: number;
    sessionMinPerDay?: number;
    sessionMaxPerDay?: number;
}): Activity & { coordinates: Coordinate[] } => {
    const activities: Activity & { coordinates: Coordinate[] }[] = [];

    const now = new Date();

    const startDate = new Date();
    startDate.setMonth(now.getMonth() - months);

    const baseLatitude = 6.891719;
    const baseLongitude = 126.074069;

    for (
        let day = new Date(startDate);
        day <= now;
        day.setDate(day.getDate() + 1)
    ) {
        const sessionCount = randomInt(sessionMinPerDay, sessionMaxPerDay);

        for (let i = 0; i < sessionCount; i++) {
            const type = Math.random() > 0.5 ? "walk" : "run";

            const start = new Date(day);
            start.setHours(randomInt(5, 20));
            start.setMinutes(randomInt(0, 59));
            start.setSeconds(randomInt(0, 59));
            start.setMilliseconds(0);
            // minimum 30 mins = 1800 seconds
            // run pace ~3.5 m/s → min 6300m, walk pace ~1.4 m/s → min 2520m
            const distance =
                type === "run"
                    ? randomInt(6300, 18000)
                    : randomInt(3000, 12000);

            const activityStartLat = baseLatitude + random(-0.01, 0.01);
            const activityStartLng = baseLongitude + random(-0.01, 0.01);

            const startTimestamp = start.getTime();

            const coordinates = generateEarthCoordinates(
                activityStartLat,
                activityStartLng,
                distance,
                startTimestamp,
                type,
            );

            // ✅ duration = last timestamp − first timestamp (pure ms)
            const firstTs = coordinates[0].timestamp;
            const lastTs = coordinates[coordinates.length - 1].timestamp;
            const durationMs = lastTs - firstTs;

            // ✅ endTime derived directly from last coordinate timestamp
            const end = new Date(lastTs);

            activities.push({
                id: activities.length + 1,

                startTime: start,
                endTime: end,

                // ✅ stored as milliseconds
                duration: durationMs,

                status: "completed",

                type,

                coordinates,

                goal,

                createdAt: start,
                updatedAt: end,
            });
        }
    }

    return activities.sort(
        (a, b) => b.startTime.getTime() - a.startTime.getTime(),
    );
};
