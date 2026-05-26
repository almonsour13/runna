import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const activity = sqliteTable("activity", {
    id: text("id").primaryKey(),
    startTime: integer("start_time", { mode: "timestamp" }).notNull(),
    endTime: integer("end_time", { mode: "timestamp" }).notNull(),

    duration: integer("duration").notNull(),
    distance: real("distance").notNull(),
    calories: real("calories").notNull(),
    avgPace: real("avg_pace").notNull(),
    avgSpeed: real("avg_speed").notNull(),
    steps: integer("steps").notNull(),

    goal: integer("goal").notNull(),
    type: text("type").notNull(),
    status: text("status").notNull(),

    isImported: integer("is_imported", { mode: "boolean" })
        .notNull()
        .default(false),
    importedAt: integer("imported_at", { mode: "timestamp" }),

    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
