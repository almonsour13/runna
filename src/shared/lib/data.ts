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
): Coordinate[] {
    const coordinates: Coordinate[] = [];

    const basePace = type === "run" ? random(2.5, 4.2) : random(1.2, 1.6);

    // GPS sample every 5 seconds
    const intervalSeconds = 5;
    const intervalMs = intervalSeconds * 1000;

    let heading = random(0, 360);
    let stepsUntilTurn = randomInt(6, 20);

    let lat = startLat;
    let lng = startLng;
    let distanceCovered = 0;

    while (distanceCovered < totalDistance) {
        const speed = basePace * random(0.92, 1.08);
        const distanceThisStep = speed * intervalSeconds;

        stepsUntilTurn--;
        if (stepsUntilTurn <= 0) {
            const turnAngle =
                Math.random() < 0.25 ? random(-140, 140) : random(-35, 35);
            heading = (heading + turnAngle + 360) % 360;
            stepsUntilTurn = randomInt(6, 20);
        } else {
            heading = (heading + random(-4, 4) + 360) % 360;
        }

        const headingRad = (heading * Math.PI) / 180;
        const deltaLat = metersToLat(distanceThisStep * Math.cos(headingRad));
        const deltaLng = metersToLng(
            distanceThisStep * Math.sin(headingRad),
            lat,
        );

        lat += deltaLat;
        lng += deltaLng;

        const noiseLat = metersToLat(random(-2, 2));
        const noiseLng = metersToLng(random(-2, 2), lat);

        coordinates.push({
            latitude: Number((lat + noiseLat).toFixed(6)),
            longitude: Number((lng + noiseLng).toFixed(6)),
            timestamp: startTimestamp + coordinates.length * intervalMs,
            accuracy: 0,
            altitude: 0,
            heading: 0,
            speed: 0,
        });

        distanceCovered += distanceThisStep;
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
}): Activity[] => {
    const activities: Activity[] = [];

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

                startTime: start.toISOString(),
                endTime: end.toISOString(),

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
        (a, b) =>
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    );
};
