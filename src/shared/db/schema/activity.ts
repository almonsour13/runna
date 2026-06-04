import { ActivityType } from "@/shared/types/type";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const activity = sqliteTable("activity", {
    id: text("id").primaryKey(),
    startTime: integer("start_time", { mode: "timestamp" }).notNull(),
    endTime: integer("end_time", { mode: "timestamp" }),

    duration: integer("duration").notNull().default(0),
    distance: real("distance").notNull().default(0),
    calories: real("calories").notNull().default(0),
    avgPace: real("avg_pace").notNull().default(0),
    avgSpeed: real("avg_speed").notNull().default(0),
    steps: integer("steps").notNull().default(0),

    goal: integer("goal").notNull().default(0),
    type: text("type").$type<ActivityType>().notNull(),
    status: text("status").notNull().default("inProgress"),
    source: text("source").notNull().default("manual"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
