import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/shared/db/schema/index.ts",
    out: "./src/shared/db/migrations",
    dialect: "sqlite",
    driver: "expo",
    verbose: true,
    strict: true,
});
