import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { ProvidersGetAll } from './dto/read-providers-dto';
import { CreateProvider } from 'src/db/types/providers.types';
export declare class ProvidersService {
    private db;
    private readonly logger;
    constructor(db: NeonDatabase);
    getByEmail(email: string): Promise<any>;
    getByName(name: string): Promise<any>;
    getAll(): Promise<ProvidersGetAll>;
    create(createProvider: CreateProvider): Promise<any>;
}
