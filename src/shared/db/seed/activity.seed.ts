import { Coordinate } from "@/shared/types/type";
import { convertMsToS } from "@/shared/utils/convert";
import { generateId } from "@/shared/utils/utils";
import { desc } from "drizzle-orm";
import { db } from "..";
import { activity, coordinate } from "../schema";

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
// ... (keep your geographic calculations and generateEarthCoordinates unchanged)

export const seedActivity = async ({
    days = 10,
    goal = 5000,
    sessionMinPerDay = 2,
    sessionMaxPerDay = 3,
    restDayChance = 0,
}) => {
    const now = new Date();

    const startDate = new Date();
    startDate.setDate(now.getDate() - days);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const baseLat = 6.891719;
    const baseLng = 126.074069;
    console.log("[Seed] start seeding");

    for (
        let day = new Date(startDate);
        day <= endOfToday;
        day.setDate(day.getDate() + 1)
    ) {
        if (Math.random() < restDayChance) {
            continue;
        }

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
                    : randomInt(3000, 12000); // meters

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
            const durationSeconds = convertMsToS(durationMs);

            // ==========================================
            // 🚨 CALCULATE RAW METRIC SENSOR BASE UNITS
            // ==========================================

            // Raw Pace: seconds per meter (Time / Distance)
            const avgPace = distance > 0 ? durationSeconds / distance : 0;

            // Raw Speed: meters per second (Distance / Time)
            const avgSpeed =
                durationSeconds > 0 ? distance / durationSeconds : 0;

            const calories =
                type === "run" ? distance * 0.063 : distance * 0.04;
            const stepLength = type === "run" ? 0.75 : 0.65;
            const steps = Math.round(distance / stepLength);

            const [act] = await db
                .insert(activity)
                .values({
                    id: generateId(),
                    startTime: start,
                    endTime: end,
                    duration: durationMs, // total raw elapsed ms
                    distance, // total raw meters
                    calories,
                    avgPace, // saved raw as seconds/meter
                    avgSpeed, // saved raw as meters/second
                    goal,
                    steps,
                    type,
                    status: "completed",
                    source: "seed",
                    createdAt: start,
                    updatedAt: start,
                })
                .returning()
                .all();

            await db
                .insert(coordinate)
                .values(
                    coords.map((c) => ({
                        ...c,
                        id: generateId(),
                        activityId: act.id,
                    })),
                )
                .run();
        }
    }
    console.log("[Seed] seeding complete");
};
export const seedWithRangeFromLastRecentActivityToNow = async ({
    goal = 5000,
    sessionMinPerDay = 1,
    sessionMaxPerDay = 3,
} = {}) => {
    const latest = await db
        .select()
        .from(activity)
        .orderBy(desc(activity.startTime))
        .limit(1)
        .get();

    // No existing activities
    if (!latest) {
        console.log("[Seed] No activities found, seeding 30 days");

        await seedActivity({
            days: 30,
            goal,
            sessionMinPerDay,
            sessionMaxPerDay,
        });

        return;
    }

    const lastDate = new Date(latest.startTime);
    const now = new Date();

    const diffMs = now.getTime() - lastDate.getTime();
    const daysToSeed = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (daysToSeed <= 0) {
        console.log("[Seed] Database already up to date");
        return;
    }

    console.log(
        `[Seed] Found latest activity on ${lastDate.toISOString()}, seeding ${daysToSeed} missing days`,
    );

    await seedActivity({
        days: daysToSeed,
        goal,
        sessionMinPerDay,
        sessionMaxPerDay,
    });
};
// (async () => {
//     // Supposing your schema has a "source" field on the activity table,
//     // and a relation or foreign key linking coordinates to activities.

//     // 1. Delete coordinates linked to non-manual activities
//     await db
//         .delete(coordinate)
//         .where(
//             inArray(
//                 coordinate.activityId,
//                 db
//                     .select({ id: activity.id })
//                     .from(activity)
//                     .where(ne(activity.source, "manual")),
//             ),
//         )
//         .run();

//     // 2. Delete the activities themselves, protecting manual entries
//     await db.delete(activity).where(ne(activity.source, "manual")).run();

//     seedActivity({
//         days: 30,
//         goal: 5000,
//         sessionMinPerDay: 1,
//         sessionMaxPerDay: 3,
//         // restDayChance: 0.3,
//     })
//         .then(() => {
//             console.log("🌱 Seed complete");
//             process.exit(0);
//         })
//         .catch((error) => {
//             console.error("❌ Seed failed:", error);
//             process.exit(1);
//         });
// })();

// seedWithRangeFromLastRecentActivityToNow({
//     goal: 5000,
//     sessionMinPerDay: 1,
//     sessionMaxPerDay: 3,
// })
//     .then(() => {
//         console.log("🌱 Seed complete");
//         process.exit(0);
//     })
//     .catch((error) => {
//         console.error("❌ Seed failed:", error);
//         process.exit(1);
//     });
