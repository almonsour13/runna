import { eq } from "drizzle-orm";
import { db } from "..";
import { coordinate } from "../schema";

export type Coordinate = typeof coordinate.$inferSelect;

class CoordinateRepository {
    async getAll() {
        return await db.select().from(coordinate);
    }
    async getById(id: number) {
        const results = await db
            .select()
            .from(coordinate)
            .where(eq(coordinate.id, id));
        return results[0] ?? null;
    }
    async getByActivityId(activityId: number) {
        return await db
            .select()
            .from(coordinate)
            .where(eq(coordinate.activityId, activityId));
    }
    async create(data: typeof coordinate.$inferInsert) {
        return await db.insert(coordinate).values(data).returning();
    }
    async update(id: number, data: Partial<typeof coordinate.$inferInsert>) {
        return await db
            .update(coordinate)
            .set(data)
            .where(eq(coordinate.id, id))
            .returning();
    }
    async delete(id: number) {
        return await db
            .delete(coordinate)
            .where(eq(coordinate.id, id))
            .returning();
    }
}
export const coordinateRepository = new CoordinateRepository();
