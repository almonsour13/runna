import { db } from "@/shared/db";
import { Activity } from "@/shared/db/repositories/activity.repository";
import { activity } from "@/shared/db/schema";
import { logger } from "@/shared/utils/logger";
import { and, desc, gte, lt, lte } from "drizzle-orm";

class HomeService {
    async getWeekActivity(): Promise<Activity[]> {
        try {
            const today = new Date();

            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - 6);
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfDay = new Date(today);
            endOfDay.setHours(23, 59, 59, 999);

            const data = await db
                .select()
                .from(activity)
                .where(
                    and(
                        gte(activity.createdAt, startOfWeek),
                        lte(activity.createdAt, endOfDay),
                    ),
                );

            logger.log("[HomeService] getWeekActivity → success");
            return data;
        } catch (error) {
            logger.error("[HomeService] getWeekActivity → error:", error);
            return [];
        }
    }

    async getTodayActivity(): Promise<Activity[]> {
        try {
            const now = new Date();

            const startOfDay = new Date(now);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(now);
            endOfDay.setHours(23, 59, 59, 999);

            const data = await db
                .select()
                .from(activity)
                .where(
                    and(
                        gte(activity.createdAt, startOfDay),
                        lt(activity.createdAt, endOfDay),
                    ),
                );

            logger.log("[HomeService] getTodayActivity → success");
            return data;
        } catch (error) {
            logger.error("[HomeService] getTodayActivity → error:", error);
            throw error;
        }
    }

    async getRecentActivity(): Promise<Activity[]> {
        try {
            const data = await db
                .select()
                .from(activity)
                .orderBy(desc(activity.createdAt))
                .limit(5);

            logger.log("[HomeService] getRecentActivities → success");
            return data;
        } catch (error) {
            logger.error("[HomeService] getRecentActivities → error:", error);
            throw error;
        }
    }
}

export const homeService = new HomeService();
