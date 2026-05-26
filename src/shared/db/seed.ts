import { db } from ".";
import { ACTIVITY_TYPE } from "../constant/constant";
import { Coordinate } from "../types/type";
import { logger } from "../utils/logger";
import { generateId } from "../utils/utils";
import { activity, coordinate, schedule } from "./schema";

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
    let stepIndex = 0;

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

export const seed = async ({
    days = 10,
    goal = 5000,
    sessionMinPerDay = 2,
    sessionMaxPerDay = 3,
}) => {
    const now = new Date();
    // await db.delete(coordinate);
    // await db.delete(activity);

    const startDate = new Date();
    startDate.setDate(now.getDate() - days);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const baseLat = 6.891719;
    const baseLng = 126.074069;
    logger.log("[Seed] start seeding");

    for (
        let day = new Date(startDate);
        day <= endOfToday;
        day.setDate(day.getDate() + 1)
    ) {
        const sessionCount = randomInt(sessionMinPerDay, sessionMaxPerDay);
        const isImportedBatch = Math.random() > 0.7;

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

            const durationMs = lastTs - firstTs;
            const durationSec = durationMs / 1000;
            const distanceKm = distance / 1000;
            const avgSpeed = distanceKm / (durationSec / 3600);
            const avgPace = durationSec / 60 / distanceKm;
            const calories =
                type === "run" ? distance * 0.063 : distance * 0.04;
            const stepLength = type === "run" ? 0.75 : 0.65; // meters per step
            const steps = Math.round(distance / stepLength);

            const [act] = await db
                .insert(activity)
                .values({
                    id: generateId(),
                    startTime: start,
                    endTime: end,
                    duration: durationMs,
                    distance,
                    calories,
                    avgPace,
                    avgSpeed,
                    goal,
                    steps,
                    type,
                    status: "completed",
                    isImported: isImportedBatch, // 👈 whole day's batch
                    importedAt: isImportedBatch ? new Date(start) : null,
                    createdAt: start,
                    updatedAt: start,
                })
                .returning();

            await db.insert(coordinate).values(
                coords.map((c) => ({
                    ...c,
                    id: generateId(),
                    activityId: act.id,
                })),
            );
        }
    }
    logger.log("[Seed] seeding complete");
};

const WEEKLY_PATTERNS = [
    [1, 3, 5], // Mon Wed Fri
    [0, 6], // Weekend
    [2, 4], // Tue Thu
    [1, 2, 3, 4, 5], // Weekdays
];

function randomTime() {
    const hour = randomInt(5, 20);
    const minute = randomInt(0, 59);

    return `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
}

function randomGoal(type: (typeof ACTIVITY_TYPE)[number]) {
    switch (type) {
        case "run":
            return randomInt(5000, 15000);

        case "walk":
            return randomInt(2000, 8000);

        default:
            return 5000;
    }
}

function randomName(type: (typeof ACTIVITY_TYPE)[number]) {
    const names = {
        walk: ["Morning Walk", "Evening Walk", "Daily Walk"],
        run: ["Morning Run", "Tempo Run", "Recovery Run"],
    };

    return names[type][randomInt(0, names[type].length - 1)];
}

export const seedSchedule = async ({
    count = 10,
}: {
    count?: number;
} = {}) => {
    logger.log("[Schedule Seed] start seeding");

    await db.delete(schedule);

    const now = new Date();

    const schedules = Array.from({ length: count }).map(() => {
        const type = ACTIVITY_TYPE[randomInt(0, ACTIVITY_TYPE.length - 1)];
        const repeatDays = JSON.stringify(
            WEEKLY_PATTERNS[randomInt(0, WEEKLY_PATTERNS.length - 1)],
        );

        return {
            id: generateId(),

            title: randomName(type),
            time: randomTime(),
            goal: randomGoal(type),

            type,
            repeatDays,

            status: Math.random() > 0.2 ? "active" : "inactive",

            createdAt: now,
            updatedAt: now,
        };
    });

    await db.insert(schedule).values(schedules);

    logger.log("[Schedule Seed] seeding complete");
};
