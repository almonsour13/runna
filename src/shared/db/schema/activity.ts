import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const activity = sqliteTable("activity", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    duration: integer("duration").notNull(),
    goal: integer("goal").notNull(),
    type: text("type").notNull(),
    status: text("status").notNull(),

    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
