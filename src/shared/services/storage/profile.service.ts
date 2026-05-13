import { STORAGE_KEYS } from "@/shared/constant/constant";
import { Profile } from "@/shared/types/type";
import { logger } from "@/shared/utils/logger";
import { StorageService } from "./storage.service";

class ProfileService {
    private storage = new StorageService(STORAGE_KEYS.profile);
    private cachedProfile: Profile | null = null;
    async get(): Promise<Profile | null> {
        try {
            const profile = await this.storage.get();
            this.cachedProfile = profile;
            logger.log("[ProfileStorage] get → success");
            return profile ?? null;
        } catch (error) {
            logger.error("[ProfileStorage] get → error:", error);
            throw error;
        }
    }
    async save(profile: Profile): Promise<void> {
        try {
            await this.storage.set(profile);
            this.cachedProfile = profile;
            logger.log("[ProfileStorage] save → success");
        } catch (error) {
            logger.error("[ProfileStorage] save → error:", error);
            throw error;
        }
    }
    async update(partial: Partial<Profile>): Promise<void> {
        try {
            await this.storage.update({
                ...this.cachedProfile,
                ...partial,
            });
            if (!this.cachedProfile) return;
            this.cachedProfile = {
                ...this.cachedProfile,
                ...partial,
            };
            logger.log("[ProfileStorage] update → success");
        } catch (error) {
            logger.error("[ProfileStorage] update → error:", error);
            throw error;
        }
    }
    async delete(): Promise<void> {
        try {
            await this.storage.remove();
            this.cachedProfile = null;
            logger.log("[ProfileStorage] delete → success");
        } catch (error) {
            logger.error("[ProfileStorage] delete → error:", error);
            throw error;
        }
    }
}
export const profileService = new ProfileService();
