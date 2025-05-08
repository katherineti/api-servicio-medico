import { Inject, Injectable, Logger } from '@nestjs/common';
import { count, eq, desc, ilike, and, gte, lte } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION } from 'src/constants';
import { logsTable, productsTable, usersTable } from 'src/db/schema';
import { ResultGetAllLogs } from './dto/read-logs-dto';
import { SearchLogsDto } from './dto/search.logs.dto';
import { CreateLog } from 'src/db/types/logs.types';

@Injectable()
export class LogsService {
    
    constructor(@Inject(PG_CONNECTION) private db: NeonDatabase) {}

    async getAll(filter: SearchLogsDto): Promise<ResultGetAllLogs> {

    const whereConditions = [];
    // Búsqueda por nombre de usuario (ilike) si se proporciona
    if (filter.name_user) {
      whereConditions.push(ilike(usersTable.name, `%${filter.name_user}%`));
    }

    // Búsqueda por fecha de registro, si se proporciona
    if (filter.createdAt) {
        const startOfDay = new Date(filter.createdAt);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(filter.createdAt);
        endOfDay.setHours(23, 59, 59, 999);

        whereConditions.push(and(
            gte(logsTable.createdAt, startOfDay),
            lte(logsTable.createdAt, endOfDay)
        ));
    }

    // Condición de búsqueda combinada (si hay alguna)
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const rows = await 
    this.db.select({
        id: logsTable.id,
        userId: logsTable.userId,
        userName: usersTable.name,
        productId: logsTable.productId,
        productName: productsTable.name,
        action: logsTable.action,
        ipAddress: logsTable.ipAddress,
        hostname: logsTable.hostname,
        createdAt: logsTable.createdAt,
    })
    .from(logsTable)
    .leftJoin(usersTable, eq(logsTable.userId, usersTable.id))
    .leftJoin(productsTable, eq(logsTable.productId, productsTable.id))
    .where(whereClause)
    .orderBy(desc(logsTable.createdAt))
    .limit(filter.take)
    .offset((filter.page - 1) * filter.take);

    // Consulta para obtener el total de usuarios (para metadata)
    const [{ value: total }] = await this.db.
    select({ value: count() }).from(logsTable)
    .leftJoin(usersTable, eq(logsTable.userId, usersTable.id))
    .leftJoin(productsTable, eq(logsTable.productId, productsTable.id))
    .where(whereClause);

    const result = new ResultGetAllLogs();
    result.total = total;
    result.page = filter.page;
    result.list = rows;

    return result;
    }

    async create(body: CreateLog): Promise<any>{
        try {    
        let createLog:CreateLog= {
            userId: body.userId,
            action: body.action,
            ipAddress: body.ipAddress, //Direccion IP del usuario conectado
            hostname: body.hostname, //Hostname del usuario conectado
            productId: body.productId, //(Opcional) Es Null en el inicio y cierre se sesión
        }
        
        await this.db.insert(logsTable).values(createLog);
        Logger.debug("Log " , JSON.stringify(createLog));
    
        } catch (err) {
    
        throw new Error("Error al registrar el log " + err);
        }
    }
}