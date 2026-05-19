import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const activity = sqliteTable("activity", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    startTime: integer("start_time", { mode: "timestamp" }).notNull(),
    endTime: integer("end_time", { mode: "timestamp" }).notNull(),

    duration: integer("duration").notNull(),
    distance: real("distance").notNull(),
    calories: real("calories").notNull(),
    avgPace: real("avg_pace").notNull(),
    avgSpeed: real("avg_speed").notNull(),

    goal: integer("goal").notNull(),
    type: text("type").notNull(),
    status: text("status").notNull(),

    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
