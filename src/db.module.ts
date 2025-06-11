import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PG_CONNECTION } from './constants';
// import { drizzle } from 'drizzle-orm/neon-http';
// 1. Cambiar el import del driver
import { drizzle } from 'drizzle-orm/node-postgres'; // Usar el driver para Node.js y 'pg'
import * as schema from '../src/db/schema';
import { Pool } from 'pg'; 
@Module({
    providers:[
        {
            provide: PG_CONNECTION,
            inject: [ConfigService],
            useFactory: async (configService: ConfigService)=>{
                const connectionString = configService.get<string>('DATABASE_URL')!;

                // const db = drizzle(connectionString)
                // 2. Crear una instancia de Pool de 'pg'. Creamos un Pool de conexiones usando el driver 'pg' (node-postgres)
                const pool = new Pool({
                 connectionString
                });
                // 3. Pasar el pool a drizzle
                const db = drizzle(pool, { schema });

                return db
            },
        },
    ],
    exports: [PG_CONNECTION],
})
export class DrizzleDbConecctionModule{}