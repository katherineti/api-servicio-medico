import { familyTable } from "../schema";
export type Family = typeof familyTable.$inferSelect;
type InsertFamily = typeof familyTable.$inferInsert;
export type CreateFamily = Omit<InsertFamily, 'id' | 'createdAt' | 'updatedAt'>;
export {};
