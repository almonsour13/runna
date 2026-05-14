import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";
import { logger } from "../utils/logger";
import * as schema from "./schema";

const customLogger = {
    logQuery(query: string, params: unknown[]) {
        console.log("[DB] Query:", query);
        console.log("[DB] Params:", params);
    },
};

logger.log("[DB] Opening database");
export const sqlite = SQLite.openDatabaseSync("app.db");
logger.log("[DB] Database opened");
export const db = drizzle(sqlite, { schema, logger: customLogger });
logger.log("[DB] Database ready");
