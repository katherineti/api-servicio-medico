import { usersTable } from "../schema";

export type User = typeof usersTable.$inferSelect;

type InsertUser = typeof usersTable.$inferInsert;
export type CreateUser = Omit<InsertUser, 'id' | 'isActivate' | 'createdAt' | 'updatedAt'>;