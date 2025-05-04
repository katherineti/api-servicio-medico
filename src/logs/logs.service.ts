import { Inject, Injectable } from '@nestjs/common';
import { count } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION } from 'src/constants';
import { logsTable } from 'src/db/schema';
import { ResultGetAllLogs } from './dto/read-logs-dto';
import { SearchLogsDto } from './dto/search.logs.dto';
import { CreateLog } from 'src/db/types/logs.types';

@Injectable()
export class LogsService {
    
    constructor(@Inject(PG_CONNECTION) private db: NeonDatabase) {}

    async getAll(filter: SearchLogsDto): Promise<ResultGetAllLogs> {

    const rows = await 
    this.db.select({
        id:  logsTable.id,
        userId: logsTable.userId,
        productId: logsTable.productId,
        action: logsTable.action,
        ipAddress: logsTable.ipAddress,
        hostname: logsTable.hostname,
        createdAt: logsTable.createdAt,
    })
    .from(logsTable)
    .limit(filter.take)
    .offset((filter.page - 1) * filter.take);

    // Consulta para obtener el total de usuarios (para metadata)
    const [{ value: total }] = await this.db.select({ value: count() }).from(logsTable)

    const result = new ResultGetAllLogs();
    result.total = total;
    result.page = filter.page;
    result.list = rows;

    return result;
    }

    async create(createLog: CreateLog): Promise<any>{
    
        try {    
        await this.db.insert(logsTable).values(createLog);
    
        } catch (err) {
    
        throw new Error("Error al registrar el log " + err);
        }
    }

}