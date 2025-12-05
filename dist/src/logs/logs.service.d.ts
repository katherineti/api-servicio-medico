import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { ResultGetAllLogs } from './dto/read-logs-dto';
import { SearchLogsDto } from './dto/search.logs.dto';
import { CreateLog } from 'src/db/types/logs.types';
export declare class LogsService {
    private db;
    constructor(db: NeonDatabase);
    getAll(filter: SearchLogsDto): Promise<ResultGetAllLogs>;
    create(body: CreateLog): Promise<any>;
}
