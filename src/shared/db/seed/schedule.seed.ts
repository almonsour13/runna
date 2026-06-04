import { ACTIVITY_TYPE } from "@/shared/constant/constant";
import { db } from "@/shared/db/index";
import { schedule } from "@/shared/db/schema/schedule";
import { notificationService } from "@/shared/services/notification/notification.service";
import { Schedule } from "@/shared/types/type";
import { logger } from "@/shared/utils/logger";
import { generateId } from "@/shared/utils/utils";

function random(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number) {
    return Math.floor(random(min, max + 1));
}

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
export const seedSchedule = async ({ count = 10 }: { count?: number } = {}) => {
    logger.log("[Schedule Seed] start seeding");

    await db.delete(schedule);
    // await notificationService.cancelAllScheduleActivityNotifications();

    const granted = await notificationService.requestPermissions();
    if (!granted) {
        logger.warn(
            "[Schedule Seed] Notification permission denied, skipping notification scheduling",
        );
    }

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

    if (granted) {
        const activeSchedules = schedules.filter((s) => s.status === "active");
        await Promise.all(
            activeSchedules.map((s) =>
                notificationService.scheduleActivityNotification(s as Schedule),
            ),
        );
    }

    logger.log("[Schedule Seed] seeding complete");
};
// seedSchedule({ count: 10 }).catch((err) => {
//     logger.error("[Schedule Seed] seeding failed", err);
//     process.exit(1);
// });
