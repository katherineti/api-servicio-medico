import { rolesTable } from "../schema";

export type RolesSelect = typeof rolesTable.$inferSelect;

type InsertRole = typeof rolesTable.$inferInsert;
export type CreateRole = Omit<InsertRole, 'id' >;
// export type CreateRole = Omit<InsertRole, 'id' | 'createdAt' | 'updatedAt'>;