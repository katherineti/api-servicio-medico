import { assignmentTable } from "../schema";
export type Assignment = typeof assignmentTable.$inferSelect;
type InsertAssignment = typeof assignmentTable.$inferInsert;
export type CreateAssignment = Omit<InsertAssignment, 'id' | 'createdAt' | 'updatedAt'>;
export {};
