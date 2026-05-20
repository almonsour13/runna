import { PREFIX } from "@/shared/constant/constant";
import { logger } from "@/shared/utils/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";

export class StorageService {
    private key: string;
    private profile: string;

    constructor(key: string) {
        this.key = key;
        this.profile = process.env.PROFILE || "";
    }

    async get() {
        try {
            const value = await AsyncStorage.getItem(this.key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            logger.error(`Error getting ${this.key}:`, error);
            return null;
        }
    }

    async set<T>(data: T): Promise<void> {
        try {
            await AsyncStorage.setItem(this.key, JSON.stringify(data));
        } catch (error) {
            logger.error(`Error setting ${this.key}:`, error);
        }
    }

    async remove(): Promise<void> {
        try {
            await AsyncStorage.removeItem(this.key);
        } catch (error) {
            logger.error(`Error removing ${this.key}:`, error);
        }
    }

    async update<T>(partial: T): Promise<void> {
        try {
            const current = await this.get();

            if (!current) {
                await this.set(partial as T);
                return;
            }

            const updated = {
                ...(current as object),
                ...partial,
            };

            await this.set(updated as T);
        } catch (error) {
            logger.error(`Error updating ${this.key}:`, error);
        }
    }
    static async resetAll(): Promise<void> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const appKeys = keys.filter((k) => k.startsWith(PREFIX));
            if (appKeys.length > 0) {
                await AsyncStorage.multiRemove(appKeys);
            }
        } catch (error) {
            logger.error("Error resetting all storage:", error);
            throw error;
        }
    }
}
