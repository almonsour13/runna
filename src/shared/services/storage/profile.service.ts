import { STORAGE_KEYS } from "@/shared/constant/constant";
import { logger } from "@/shared/utils/logger";
import { StorageService } from "./storage.service";

class Profile {
    private storage = new StorageService(STORAGE_KEYS.profile);

    async get(): Promise<Profile | null> {
        try {
            const profile = await this.storage.get();
            return profile ?? null;
        } catch (error) {
            logger.error("[ProfileStorage] get → error:", error);
            throw error;
        }
    }
    async save(profile: Profile): Promise<void> {
        try {
            await this.storage.set(profile);
            logger.log("[ProfileStorage] save → success");
        } catch (error) {
            logger.error("[ProfileStorage] save → error:", error);
            throw error;
        }
    }
    async update(partial: Partial<Profile>): Promise<void> {
        try {
            await this.storage.update(partial);
            logger.log("[ProfileStorage] update → success");
        } catch (error) {
            logger.error("[ProfileStorage] update → error:", error);
            throw error;
        }
    }
    async delete(): Promise<void> {
        try {
            await this.storage.remove();
            logger.log("[ProfileStorage] delete → success");
        } catch (error) {
            logger.error("[ProfileStorage] delete → error:", error);
            throw error;
        }
    }
    async clear(): Promise<void> {
        try {
            await this.storage.remove();
            logger.log("[ProfileStorage] clear → success");
        } catch (error) {
            logger.error("[ProfileStorage] clear → error:", error);
            throw error;
        }
    }
}
