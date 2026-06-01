import { db } from "@/shared/db";
import { activity } from "@/shared/db/schema";
import {
    Activity,
    ActivityType,
    ActivityWithCoordinates,
} from "@/shared/types/type";
import { logger } from "@/shared/utils/logger";
import { and, asc, desc, eq, gte, lt, lte } from "drizzle-orm";
import { DraftActivity } from "../record-activity.service";

class ActivityService {
    async get({
        limit,
        offset,
        orderBy = "createdAt",
        orderDirection = "desc",
    }: {
        limit?: number;
        offset?: number;
        orderBy?: keyof Activity;
        orderDirection?: "asc" | "desc";
    }): Promise<ActivityWithCoordinates[]> {
        try {
            const activities = await db.query.activity.findMany({
                with: { coordinates: true },
                where: eq(activity.status, "completed"),
                orderBy:
                    orderDirection === "desc"
                        ? desc(activity[orderBy])
                        : asc(activity[orderBy]),
                limit,
                offset,
            });

            logger.log("[ActivityStorage] get → success");
            return activities;
        } catch (error) {
            logger.error("[ActivityStorage] get → error:", error);
            throw error;
        }
    }

    async getById(id: string): Promise<ActivityWithCoordinates | null> {
        try {
            const data = await db.query.activity.findFirst({
                with: { coordinates: true },
                where: and(
                    eq(activity.id, id),
                    eq(activity.status, "completed"),
                ),
            });

            logger.log("[ActivityStorage] getById → success");
            return data ?? null;
        } catch (error) {
            logger.error("[ActivityStorage] getById → error:", error);
            throw error;
        }
    }

    async getByDate(date: Date): Promise<ActivityWithCoordinates[]> {
        try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const data = await db.query.activity.findMany({
                with: { coordinates: true },
                where: and(
                    gte(activity.createdAt, startOfDay),
                    lt(activity.createdAt, endOfDay),
                    eq(activity.status, "completed"),
                ),
            });

            logger.log("[ActivityStorage] getByDate → success");
            return data;
        } catch (error) {
            logger.error("[ActivityStorage] getByDate → error:", error);
            throw error;
        }
    }

    async getByDateRange(from: Date, to: Date): Promise<Activity[]> {
        try {
            const data = await db
                .select()
                .from(activity)
                .where(
                    and(
                        gte(activity.createdAt, from),
                        lte(activity.createdAt, to),
                        eq(activity.status, "completed"),
                    ),
                );

            logger.log("[ActivityStorage] getByDateRange → success");
            return data;
        } catch (error) {
            logger.error("[ActivityStorage] getByDateRange → error:", error);
            throw error;
        }
    }

    async getPrevActivityById(id: string): Promise<Activity | null> {
        try {
            const data = await db
                .select()
                .from(activity)
                .where(
                    and(lt(activity.id, id), eq(activity.status, "completed")),
                )
                .orderBy(desc(activity.id))
                .limit(1);

            logger.log("[ActivityStorage] getPreviousActivity → success");
            return data[0] || null;
        } catch (error) {
            logger.error(
                "[ActivityStorage] getPreviousActivity → error:",
                error,
            );
            throw error;
        }
    }

    async getPreviousDayActivities(date: Date): Promise<Activity[]> {
        try {
            const prevDay = new Date(date);
            prevDay.setDate(prevDay.getDate() - 1);

            const startOfDay = new Date(prevDay);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(prevDay);
            endOfDay.setHours(23, 59, 59, 999);

            const data = await db
                .select()
                .from(activity)
                .where(
                    and(
                        gte(activity.createdAt, startOfDay),
                        lte(activity.createdAt, endOfDay),
                        eq(activity.status, "completed"),
                    ),
                )
                .orderBy(desc(activity.createdAt));

            logger.log("[ActivityStorage] getPreviousDayActivities → success");
            return data;
        } catch (error) {
            logger.error(
                "[ActivityStorage] getPreviousDayActivities → error:",
                error,
            );
            throw error;
        }
    }

    async create(activityInput: DraftActivity): Promise<Activity> {
        try {
            const [createdActivity] = await db
                .insert(activity)
                .values(activityInput)
                .returning();

            logger.log("[ActivityStorage] create → success");
            return createdActivity;
        } catch (error) {
            logger.error("[ActivityStorage] create → error:", error);
            throw error;
        }
    }

    async createDraft(input: {
        id: string;
        startTime: Date;
        type: ActivityType;
    }): Promise<void> {
        try {
            const now = new Date();

            await db.insert(activity).values({
                id: input.id,
                startTime: input.startTime,
                type: input.type,
                createdAt: now,
                updatedAt: now,
            });

            logger.log("[ActivityStorage] createDraft → success");
        } catch (error) {
            logger.error("[ActivityStorage] createDraft → error:", error);
            throw error;
        }
    }

    async update(id: string, input: DraftActivity): Promise<Activity> {
        try {
            const [updated] = await db
                .update(activity)
                .set({ ...input, updatedAt: new Date() })
                .where(eq(activity.id, id))
                .returning();

            logger.log("[ActivityStorage] update → success");
            return updated;
        } catch (error) {
            logger.error("[ActivityStorage] update → error:", error);
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await db.delete(activity).where(eq(activity.id, id));

            logger.log("[ActivityStorage] delete → success");
        } catch (error) {
            logger.error("[ActivityStorage] delete → error:", error);
            throw error;
        }
    }

    async clear(): Promise<void> {
        try {
            await db.delete(activity);

            logger.log("[ActivityStorage] clear → success");
        } catch (error) {
            logger.error("[ActivityStorage] clear → error:", error);
            throw error;
        }
    }
}

export const activityService = new ActivityService();
