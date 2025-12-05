import { employeeTable } from "../schema";
export type Employee = typeof employeeTable.$inferSelect;
type InsertEmployee = typeof employeeTable.$inferInsert;
export type CreateEmployee = Omit<InsertEmployee, 'id' | 'createdAt' | 'updatedAt'>;
export {};
