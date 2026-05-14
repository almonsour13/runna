import { activityRepository } from "@/shared/db/repositories/activity.repository";
import { Activity } from "@/shared/types/type";
import { logger } from "@/shared/utils/logger";

class ActivityService {
    async get(): Promise<Activity[]> {
        try {
            const activities = await activityRepository.getAll();
            // const activities = generateActivities({
            //     months: 2,
            // });
            logger.log("[ActivityStorage] get → success");
            return activities;
        } catch (error) {
            logger.error("[ActivityStorage] get → error:", error);
            throw error;
        }
    }
    async getById(id: number): Promise<Activity | null> {
        try {
            const activity = await activityRepository.getById(id);
            logger.log("[ActivityStorage] getById → success");
            return activity;
        } catch (error) {
            logger.error("[ActivityStorage] getById → error:", error);
            throw error;
        }
    }

    async create(activity: Activity): Promise<void> {
        try {
            await activityRepository.create(activity);
            logger.log("[ActivityStorage] save → success");
        } catch (error) {
            logger.error("[ActivityStorage] save → error:", error);
            throw error;
        }
    }

    async delete(id: number): Promise<void> {
        try {
            await activityRepository.delete(id);
            logger.log("[ActivityStorage] delete → success");
        } catch (error) {
            logger.error("[ActivityStorage] delete → error:", error);
            throw error;
        }
    }
    async clear(): Promise<void> {
        try {
            await activityRepository.clear();
            logger.log("[ActivityStorage] clear → success");
        } catch (error) {
            logger.error("[ActivityStorage] clear → error:", error);
            throw error;
        }
    }
}

export const activityService = new ActivityService();
