import { db } from "@/shared/db";
import { coordinate } from "@/shared/db/schema";
import { Coordinate } from "@/shared/types/type";
import { logger } from "@/shared/utils/logger";
import { eq } from "drizzle-orm";

class CoordinateService {
    async getByActivityId(activityId: string): Promise<Coordinate[]> {
        try {
            const data = await db
                .select()
                .from(coordinate)
                .where(eq(coordinate.activityId, activityId));
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
    async create(coordinateInput: Coordinate): Promise<void> {
        try {
            const data = await db.insert(coordinate).values(coordinateInput);
            logger.log("[ActivityStorage] createCoordinates → success");
        } catch (error) {
            logger.error("[ActivityStorage] createCoordinates → error:", error);
            throw error;
        }
    }
    async deleteByActivityId(activityId: string): Promise<void> {
        try {
            await db
                .delete(coordinate)
                .where(eq(coordinate.activityId, activityId));
            logger.log(
                "[ActivityStorage] deleteCoordinatesByActivityId → success",
            );
        } catch (error) {
            logger.error(
                "[ActivityStorage] deleteCoordinatesByActivityId → error:",
                error,
            );
            throw error;
        }
    }
    async clear(): Promise<void> {
        try {
            await db.delete(coordinate);
            logger.log("[ActivityStorage] clearCoordinates → success");
        } catch (error) {
            logger.error("[ActivityStorage] clearCoordinates → error:", error);
            throw error;
        }
    }
}

export const coordinateService = new CoordinateService();
