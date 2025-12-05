import { providersTable } from "../schema";
export type Providers = typeof providersTable.$inferSelect;
type InsertProvider = typeof providersTable.$inferInsert;
export type CreateProvider = Omit<InsertProvider, 'id' | 'createdAt' | 'updatedAt'>;
export {};
