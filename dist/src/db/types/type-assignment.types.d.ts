import { typesAssignmentTable } from "../schema";
export type typesAssignment = typeof typesAssignmentTable.$inferSelect;
type InsertTypesAssignment = typeof typesAssignmentTable.$inferInsert;
export type CreatetypesAssignment = Omit<InsertTypesAssignment, 'id' | 'createdAt' | 'updatedAt'>;
export {};
