import { auditReportsTable } from "../schema";

export type Reports = typeof auditReportsTable.$inferSelect;

 type InsertReport = typeof auditReportsTable.$inferInsert;
export type CreateReport = Omit<Reports, 'id'  >;