import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { and,desc, count, eq, sql } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION } from 'src/constants';
import { providersTable } from 'src/db/schema';
import { ProvidersGetAll } from './dto/read-providers-dto';
import { CreateProvider } from 'src/db/types/providers.types';

@Injectable()
export class ProvidersService {
    private readonly logger = new Logger(ProvidersService.name);
    
    constructor(@Inject(PG_CONNECTION) private db: NeonDatabase) { }

    async getByEmail(email: string): Promise<any> {
        try{
            const result = await this.db.select()
            .from(providersTable)
            .where(eq( providersTable.email, email ))
            .limit(1);

            return result[0] || null;

        }catch(err){
            console.error("Error en la base de datos al buscar el proveedor con el email " + email + ": ", err);
            throw new Error("Error al obtener el proveedor con el email " + email + " " + err);
        }
    }

    async getByName(name: string): Promise<any> {
        try{
            const result = await this.db.select()
            .from(providersTable)
            .where(eq( sql`lower(${providersTable.name})`, name.toLowerCase() ))
            .limit(1);

            return result[0] || null;

        }catch(err){
            console.error("Error en la base de datos al buscar el proveedor con el nombre " + name + ": ", err);
            throw new Error("Error al obtener el proveedor con el nombre " + name + " " + err);
        }
    }

    async getAll(): Promise<ProvidersGetAll> {

    const rows = await
    this.db.select()
    .from(providersTable)
    .orderBy(desc(providersTable.id));

    // Consulta para obtener el total de productos
    const [{ value: total }] = await 
    this.db.select({ value: count() })
    .from(providersTable);

    const result = new ProvidersGetAll();
    result.total = total;
    result.list = rows;
    this.logger.debug(`Resultado de proveedores: ${JSON.stringify(result)}`);
    return result;
    }

    async create(createProvider: CreateProvider): Promise<any>{
        const emailExist = await this.getByEmail(createProvider.email);
        if (emailExist) {
            throw new ConflictException('El correo del proveedor ya existe.');
        }

        const nameExist = await this.getByName(createProvider.name);
        if (nameExist) {
            throw new ConflictException('El nombre del proveedor ya existe.');
        }

        try {
            console.log("createProvider" , createProvider)
            const [result] = await this.db.insert(providersTable).values(createProvider).returning();
            this.logger.debug(`Proveedor creado: ${JSON.stringify(result)}`);
            return result;

        } catch (error) {
        console.error('Error al insertar un proveedor en la base de datos', error);
        return { error: 'Error al insertar un proveedor en la base de datos' };
        }
    }
}