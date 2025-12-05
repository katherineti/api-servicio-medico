import { auditReportsTable_temp } from "../schema";
export type Reports = typeof auditReportsTable_temp.$inferSelect;
type InsertReport = typeof auditReportsTable_temp.$inferInsert;
export type CreateReport = Omit<Reports, 'id'>;
export type ListReports = Omit<InsertReport, 'images' | 'updatedAt'>;
export {};
