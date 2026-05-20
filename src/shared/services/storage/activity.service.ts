import { db } from "@/shared/db";
import { activity, coordinate } from "@/shared/db/schema";
import { Activity, Coordinate } from "@/shared/types/type";
import { logger } from "@/shared/utils/logger";
import { and, asc, desc, eq, gte, lt, lte } from "drizzle-orm";

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
    }): Promise<Activity[]> {
        try {
            const query = db
                .select()
                .from(activity)
                .orderBy(
                    orderDirection === "desc"
                        ? desc(activity[orderBy])
                        : asc(activity[orderBy]),
                );
            if (limit !== undefined) {
                query.limit(limit);
            }
            if (offset !== undefined) {
                query.offset(offset);
            }
            const activities = await query;
            logger.log("[ActivityStorage] get → success");
            return activities;
        } catch (error) {
            logger.error("[ActivityStorage] get → error:", error);
            throw error;
        }
    }
    async getById(id: string): Promise<Activity | null> {
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
    async getByDateRange(from: Date, to: Date): Promise<Activity[]> {
        try {
            const data = await db
                .select()
                .from(activity)
                .where(
                    and(
                        gte(activity.createdAt, from),
                        lte(activity.createdAt, to),
                    ),
                );
            logger.log("[ActivityStorage] getByDateRange → success");
            return data;
        } catch (error) {
            logger.error("[ActivityStorage] getByDateRange → error:", error);
            throw error;
        }
    }

    async getCoordinatesByActivityId(id: string): Promise<Coordinate[]> {
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

    async create(
        activityInput: Omit<Activity, "isImported" | "importedAt">,
    ): Promise<Activity> {
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
    async createCoordinates(coordinates: Coordinate[]): Promise<Coordinate[]> {
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
