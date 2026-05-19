import { db } from "@/shared/db";
import { activity, coordinate } from "@/shared/db/schema";
import { Activity, Coordinate } from "@/shared/types/type";
import { logger } from "@/shared/utils/logger";
import { and, eq, gte, lt } from "drizzle-orm";

class ActivityService {
    async get(): Promise<Activity[]> {
        try {
            const activities = await db.select().from(activity);
            logger.log("[ActivityStorage] get → success");
            return activities;
        } catch (error) {
            logger.error("[ActivityStorage] get → error:", error);
            throw error;
        }
    }
    async getById(id: number): Promise<Activity | null> {
        try {
            const data = await db
                .select()
                .from(activity)
                .where(eq(activity.id, id));
            logger.log("[ActivityStorage] getById → success");
            return data[0] || null;
        } catch (error) {
            logger.error("[ActivityStorage] getById → error:", error);
            throw error;
        }
    }

    async getByDate(date: Date): Promise<Activity[]> {
        try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
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
            logger.log("[ActivityStorage] getByDate → success");
            return data;
        } catch (error) {
            logger.error("[ActivityStorage] getByDate → error:", error);
            throw error;
        }
    }

    async getCoordinatesByActivityId(id: number): Promise<Coordinate[]> {
        try {
            const data = await db
                .select()
                .from(coordinate)
                .where(eq(coordinate.activityId, id));
            logger.log(
                "[ActivityStorage] getCoordinatesByActivityId → success",
            );
            return data;
        } catch (error) {
            logger.error(
                "[ActivityStorage] getCoordinatesByActivityId → error:",
                error,
            );
            throw error;
        }
    }

    async create(activityInput: Omit<Activity, "id">): Promise<Activity> {
        try {
            const data = await db
                .insert(activity)
                .values(activityInput)
                .returning();
            logger.log("[ActivityStorage] save → success");
            return data[0];
        } catch (error) {
            logger.error("[ActivityStorage] save → error:", error);
            throw error;
        }
    }
    async createCoordinates(
        coordinates: Omit<Coordinate, "id">[],
    ): Promise<Coordinate[]> {
        if (coordinates.length === 0) {
            logger.warn(
                "[ActivityStorage] createCoordinates → skipping, no coordinates",
            );
            return [];
        }
        try {
            const data = await db
                .insert(coordinate)
                .values(coordinates)
                .returning();
            logger.log("[ActivityStorage] createCoordinates → success");
            return data;
        } catch (error) {
            logger.error("[ActivityStorage] createCoordinates → error:", error);
            throw error;
        }
    }

    async delete(id: number): Promise<void> {
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
