// schema/relations.ts
import { relations } from "drizzle-orm";
import { activity } from "./activity";
import { coordinate } from "./coordinate";

export const activityRelations = relations(activity, ({ many }) => ({
    coordinates: many(coordinate),
}));

export const coordinateRelations = relations(coordinate, ({ one }) => ({
    activity: one(activity, {
        fields: [coordinate.activityId],
        references: [activity.id],
    }),
}));
