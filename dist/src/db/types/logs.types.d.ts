import { logsTable } from "../schema";
export type Log = typeof logsTable.$inferSelect;
export type CreateLog = Omit<Log, 'id' | 'createdAt'>;
