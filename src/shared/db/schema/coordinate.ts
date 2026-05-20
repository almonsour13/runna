import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { activity } from "./activity";

export const coordinate = sqliteTable("coordinate", {
    id: text("id").primaryKey(),
    activityId: text("activity_id")
        .notNull()
        .references(() => activity.id, {
            onDelete: "cascade",
        }),
    latitude: real("latitude").notNull(),
    longitude: real("longitude").notNull(),
    altitude: real("altitude"),
    accuracy: real("accuracy"),
    speed: real("speed"),
    heading: real("heading"),
    timestamp: integer("timestamp").notNull(),
});
