import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/shared/db/schema/index.ts",
    out: "./src/shared/db/migrations",
    dialect: "sqlite",
    dbCredentials: {
        url: "app.db",
    },
    verbose: true,
    strict: true,
});
