import { eq } from "drizzle-orm";
import { db } from "..";
import { activity } from "../schema";

export type Activity = typeof activity.$inferSelect;

class ActivityRepository {
    async getAll() {
        return await db.select().from(activity);
    }

    async getById(id: number) {
        const results = await db
            .select()
            .from(activity)
            .where(eq(activity.id, id));
        return results[0] ?? null;
    }

    async create(data: typeof activity.$inferInsert) {
        return await db.insert(activity).values(data).returning();
    }

    async update(id: number, data: Partial<typeof activity.$inferInsert>) {
        return await db
            .update(activity)
            .set(data)
            .where(eq(activity.id, id))
            .returning();
    }

    async delete(id: number) {
        return await db.delete(activity).where(eq(activity.id, id)).returning();
    }
    async clear() {
        return await db.delete(activity).returning();
    }
}
export const activityRepository = new ActivityRepository();
