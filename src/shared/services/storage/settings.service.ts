import { STORAGE_KEYS } from "@/shared/constant/constant";
import { Settings } from "@/shared/types/type";
import { logger } from "@/shared/utils/logger";
import { StorageService } from "./storage.service";

class SettingsService {
    private storage = new StorageService(STORAGE_KEYS.settings);

    async get(): Promise<Settings | null> {
        try {
            const settings = await this.storage.get();
            logger.log("[SettingsStorage] get → success");
            return settings ?? null;
        } catch (error) {
            logger.error("[SettingsStorage] get → error:", error);
            throw error;
        }
    }

    async save(settings: Settings): Promise<void> {
        try {
            await this.storage.set(settings);
            logger.log("[SettingsStorage] save → success");
        } catch (error) {
            logger.error("[SettingsStorage] save → error:", error);
            throw error;
        }
    }

    async update(partial: Partial<Settings>): Promise<void> {
        try {
            await this.storage.update(partial);
            logger.log("[SettingsStorage] update → success");
        } catch (error) {
            logger.error("[SettingsStorage] update → error:", error);
            throw error;
        }
    }

    async delete(): Promise<void> {
        try {
            await this.storage.remove();
            logger.log("[SettingsStorage] delete → success");
        } catch (error) {
            logger.error("[SettingsStorage] delete → error:", error);
            throw error;
        }
    }
}

export const settingsService = new SettingsService();
