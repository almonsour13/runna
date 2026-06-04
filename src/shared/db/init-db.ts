import { logger } from "@/shared/utils/logger";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { db } from "./index";
import migrations from "./migrations/migrations";

let initialized: Promise<void> | null = null;

export function initDb(): Promise<void> {
    if (!initialized) {
        initialized = (async () => {
            try {
                logger.info("Running migrations...");
                await migrate(db, migrations);
                logger.info("Migrations completed");
            } catch (error) {
                logger.error("Migration failed", error);
                initialized = null;
                throw error;
            }
        })();
    }
    return initialized;
}
