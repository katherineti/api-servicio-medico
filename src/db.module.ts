import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PG_CONNECTION } from './constants';
import { drizzle } from 'drizzle-orm/neon-http';

@Module({
    providers:[
        {
            provide: PG_CONNECTION,
            inject: [ConfigService],
            useFactory: async (configService: ConfigService)=>{
                const connectionString = configService.get<string>('DATABASE_URL')!;
                const db = drizzle(connectionString)
                return db
            },
        },
    ],
    exports: [PG_CONNECTION],
})
export class DrizzleDbConecctionModule{}