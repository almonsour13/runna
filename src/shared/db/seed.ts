import { db } from ".";
import { Coordinate } from "../types/type";
import { activity, coordinate } from "./schema";

function random(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number) {
    return Math.floor(random(min, max + 1));
}

function metersToLat(meters: number) {
    return meters / 111320;
}

function metersToLng(meters: number, lat: number) {
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
    const intervalMs = 5000;

    let heading = random(0, 360);
    let stepsUntilTurn = randomInt(6, 20);

    let lat = startLat;
    let lng = startLng;
    let distanceCovered = 0;

    while (distanceCovered < totalDistance) {
        const speed = basePace * random(0.92, 1.08);
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
            timestamp: startTimestamp + coordinates.length * intervalMs,
            altitude: 0,
            accuracy: 5,
            speed: 0,
            heading: 0,
        });

        distanceCovered += distanceStep;
    }

    return coordinates;
}

export const seed = async ({
    months = 2,
    goal = 5000,
    sessionMinPerDay = 2,
    sessionMaxPerDay = 3,
}) => {
    const now = new Date();

    const startDate = new Date();
    startDate.setMonth(now.getMonth() - months);

    const baseLat = 6.891719;
    const baseLng = 126.074069;

    for (
        let day = new Date(startDate);
        day <= now;
        day.setDate(day.getDate() + 1)
    ) {
        const sessionCount = randomInt(sessionMinPerDay, sessionMaxPerDay);

        for (let i = 0; i < sessionCount; i++) {
            const type = Math.random() > 0.5 ? "walk" : "run";

            const start = new Date(day);
            start.setHours(
                randomInt(5, 20),
                randomInt(0, 59),
                randomInt(0, 59),
            );

            const distance =
                type === "run"
                    ? randomInt(6000, 18000)
                    : randomInt(3000, 12000);

            const startLat = baseLat + random(-0.01, 0.01);
            const startLng = baseLng + random(-0.01, 0.01);

            const coords = generateEarthCoordinates(
                startLat,
                startLng,
                distance,
                start.getTime(),
                type,
            );

            const firstTs = coords[0].timestamp;
            const lastTs = coords[coords.length - 1].timestamp;

            const end = new Date(lastTs);

            const [act] = await db
                .insert(activity)
                .values({
                    startTime: start.toISOString(),
                    endTime: end.toISOString(),
                    duration: lastTs - firstTs,
                    goal,
                    type,
                    status: "completed",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .returning();

            await db.insert(coordinate).values(
                coords.map((c) => ({
                    ...c,
                    activityId: act.id,
                })),
            );
        }
    }
};
