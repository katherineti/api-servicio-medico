import { Inject, Injectable } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION } from 'src/constants';
import { categoriesTable } from 'src/db/schema';
import { eq } from 'drizzle-orm'

export interface ICategory{
    id:number, 
    name:string, 
    type:string, 
    created_at:Date, 
    updated_at:Date
}

@Injectable()
export class CategoriesService {
    constructor(@Inject(PG_CONNECTION) private db: NeonDatabase) {}
    
    async getAll(): Promise<ICategory[]> {
        try{
            return await this.db.select().from(categoriesTable).orderBy(categoriesTable.id);
        } catch (error) {
            console.error('Error al obtener todas las categorías', error);
            throw new Error(`Error al obtener todas las categorías: ${error.message}`);
        }
    }
    
    async getById(id:number): Promise<ICategory | undefined> {
        try{
            let result = await this.db.select().from(categoriesTable).where( eq(categoriesTable.id, id) );

            return result[0] || null;
        } catch (error) {
            console.error('Error al obtener todas las categorías', error);
            throw new Error(`Error al obtener todas las categorías: ${error.message}`);
        }
    }
}
