import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION } from 'src/constants';
import { rolesTable } from 'src/db/schema';
import { SearchRolesDto } from './dto/search.roles.dto';
import { ResultGetAllRoles } from './dto/read-role-dto';
import { count, ilike, eq } from 'drizzle-orm';
import { CreateRole, RolesSelect } from 'src/db/types/roles.types';
import { RoleDto } from './dto/role.dto';
//inyeccion para driver coneccion a BD local
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from 'src/db/schema'
@Injectable()
export class RolesService {

    constructor(@Inject(PG_CONNECTION) private db:  NodePgDatabase<typeof schema>) {}

    async get(filter: SearchRolesDto): Promise<ResultGetAllRoles> {
        try{
            const buscadorLike: string = filter.name ? filter.name : '';

            //Búsqueda por nombre
            const searchCondition = ilike(rolesTable.name, `%${buscadorLike}%`)
            
            const rows = await this.db.select()
            .from(rolesTable)
            .where(searchCondition)
            .orderBy(rolesTable.id)
            .limit(filter.take)
            .offset((filter.page - 1) * filter.take);

            // Consulta para obtener el total de roles
            const [{ value: total }] = await this.db.select({ value: count() }).from(rolesTable).where(searchCondition);
        
            const result = new ResultGetAllRoles();
            result.total = total;
            result.page = filter.page;
            result.list = rows;
        
            return result;
    
        }catch(err){
            console.error("Error en la base de datos al buscar los roles ", err);
            throw new Error("Error al obtener los roles " + err);
        }
    }

    async getRoleById(id: number): Promise<any> {
    try{
        const result = await this.db.select()
        .from(rolesTable)
        .where(eq( rolesTable.id, id ))
        .limit(1);
    
        return result[0] || null;
        
    }catch(err){
        console.error("Error en la base de datos al buscar el rol " + id + ": ", err);
        throw new Error("Error al obtener el rol " + id + " " + err);
    }
    }

    async create( newRole: CreateRole): Promise<any>{
        newRole.name = newRole.name.toLowerCase();
        try {
            await this.db.insert(rolesTable).values(newRole);

        } catch (err) {
            throw new Error("Error al crear un rol " + err);
        }
    }

    async update(id: number, roleDto: Partial<RoleDto>): Promise<RolesSelect>{

    const Role = await this.getRoleById(id);

    if (!Role) {
        throw new NotFoundException('El rol no existe');
    }
    
    const updateData: Partial<RoleDto> = {
        name: roleDto.name? roleDto.name.toLowerCase():'',
        description: roleDto.description,
        isActivate: roleDto.isActivate
    };

    const updated = await this.db
    .update(rolesTable)
    .set(updateData)
    .where(eq(rolesTable.id, id));

    return updated[0];
    }

    
    async delete(id: number): Promise<RolesSelect>{

    const rol = await this.getRoleById(id);

    if (!rol) {
        throw new NotFoundException('El rol no existe');
    }
    const updateData: Partial<RolesSelect> = {
        isActivate: false, 
    };

    await this.db
    .update(rolesTable)
    .set(updateData)
    .where(eq(rolesTable.id, id));

    return await this.getRoleById(id);
    }

    async getRoles_Actives(): Promise<any> {
        try{

            const rows = await this.db.select({
                id: rolesTable.id,
                name: rolesTable.name
            }).from(rolesTable).where(eq(rolesTable.isActivate,true));
        
            return rows;
    
        }catch(err){
            console.error("Error en la base de datos al buscar los roles activos ", err);
            throw new Error("Error al obtener los roles activos" + err);
        }
    }
}