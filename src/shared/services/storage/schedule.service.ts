import { db } from "@/shared/db";
import { schedule } from "@/shared/db/schema";
import { Schedule } from "@/shared/types/type";
import { logger } from "@/shared/utils/logger";
import { eq } from "drizzle-orm";

class ScheduleService {
    async get(): Promise<Schedule[]> {
        try {
            const data = await db.select().from(schedule);
            logger.log("[ScheduleStorage] get → success");
            return data;
        } catch (error) {
            logger.error("[ScheduleStorage] get → error:", error);
            throw error;
        }
    }
    async getById(id: string): Promise<Schedule | null> {
        try {
            const data = await db
                .select()
                .from(schedule)
                .where(eq(schedule.id, id));
            logger.log("[ScheduleStorage] getById → success");
            return data[0] || null;
        } catch (error) {
            logger.error("[ScheduleStorage] getById → error:", error);
            throw error;
        }
    }
    async getByDay(date: Date): Promise<Schedule[]> {
        try {
            const day = date.getDay();
            const data = await db.select().from(schedule);

            const filtered = data.filter((item) => {
                try {
                    const days = JSON.parse(item.repeatDays || "[]");

                    return days.includes(day);
                } catch {
                    return false;
                }
            });

            logger.log("[ScheduleStorage] getByRepeatDay → success");

            return filtered;
        } catch (error) {
            logger.error("[ScheduleStorage] getByRepeatDay → error:", error);

            throw error;
        }
    }

    async create(scheduleInput: Omit<Schedule, "status">) {
        try {
            const data = await db
                .insert(schedule)
                .values(scheduleInput)
                .returning();
            logger.log("[ScheduleStorage] create → success");
            return data[0];
        } catch (error) {
            logger.error("[ScheduleStorage] create → error:", error);
            throw error;
        }
    }
    async update(id: string, partial: Partial<Schedule>) {
        try {
            await db.update(schedule).set(partial).where(eq(schedule.id, id));
            logger.log("[ScheduleStorage] update → success");
        } catch (error) {
            logger.error("[ScheduleStorage] update → error:", error);
            throw error;
        }
    }
    async delete(id: string) {
        try {
            await db.delete(schedule).where(eq(schedule.id, id));
            logger.log("[ScheduleStorage] delete → success");
        } catch (error) {
            logger.error("[ScheduleStorage] delete → error:", error);
            throw error;
        }
    }
    async clear() {
        try {
            await db.delete(schedule);
            logger.log("[ScheduleStorage] clear → success");
        } catch (error) {
            logger.error("[ScheduleStorage] clear → error:", error);
            throw error;
        }
    }
}

export const scheduleService = new ScheduleService();
