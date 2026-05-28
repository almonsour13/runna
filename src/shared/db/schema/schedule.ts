import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const schedule = sqliteTable("schedule", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    time: text("time").notNull(),
    goal: real("goal").notNull(),
    type: text("type").notNull(),
    repeatDays: text("repeat_days").default("[]"),

    status: text("status").default("active").notNull(),

    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
