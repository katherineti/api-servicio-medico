import { Inject, Injectable } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION } from 'src/constants';
import { roleTable } from 'src/db/schema';

@Injectable()
export class RolesService {
     constructor(@Inject(PG_CONNECTION) private db: NeonDatabase) {}

    async getAll() {
    
        try{

            const result = await this.db.select()
            .from(roleTable);
        
            return result || null;
            
        }catch(err){
            console.error("Error en la base de datos al buscar los roles ", err);
            throw new Error("Error al obtener los roles " + err);
        }
    }
}