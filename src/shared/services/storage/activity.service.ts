import { STORAGE_KEYS } from "@/shared/constant/constant";
import { Activity } from "@/shared/types/type";
import { logger } from "@/shared/utils/logger";
import { StorageService } from "./storage.service";

class ActivityService {
    private storage = new StorageService(STORAGE_KEYS.activity);
    private cachedActivities: Activity[] | null = null;

    async get(): Promise<Activity[]> {
        try {
            if (this.cachedActivities) return this.cachedActivities;

            const activities = (await this.storage.get()) ?? [];
            // const activities = generateActivities({
            //     months: 12,
            // });
            this.cachedActivities = activities;
            logger.log("[ActivityStorage] get → success");
            return activities;
        } catch (error) {
            logger.error("[ActivityStorage] get → error:", error);
            throw error;
        }
    }

    async save(activity: Activity): Promise<void> {
        try {
            const activities = await this.get(); // ensures cache is populated
            const updated = [...activities, activity];
            this.cachedActivities = updated;
            await this.storage.set(updated);
            logger.log("[ActivityStorage] save → success");
        } catch (error) {
            logger.error("[ActivityStorage] save → error:", error);
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const activities = await this.get();
            const filtered = activities.filter((a) => a.id !== id);
            this.cachedActivities = filtered;
            await this.storage.set(filtered);
            logger.log("[ActivityStorage] delete → success");
        } catch (error) {
            logger.error("[ActivityStorage] delete → error:", error);
            throw error;
        }
    }
    async clear(): Promise<void> {
        try {
            this.cachedActivities = null;
            await this.storage.remove();
            logger.log("[ActivityStorage] clear → success");
        } catch (error) {
            logger.error("[ActivityStorage] clear → error:", error);
            throw error;
        }
    }
}

export const activityService = new ActivityService();
