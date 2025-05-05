import { logsTable } from "../schema";

export type Log = typeof logsTable.$inferSelect;

type InsertLog = typeof logsTable.$inferInsert;
export type CreateLog = Omit<Log, 'id' | 'createdAt' >;