import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { ProductsExpiredGetAll } from './dto/products-expired-dto';
import { SearchProductsExpiredDto } from './dto/search-products-expired.dto';
export declare class MedicalSuppliesExpiredService {
    private db;
    private readonly logger;
    constructor(db: NeonDatabase);
    getAll(filter: SearchProductsExpiredDto): Promise<ProductsExpiredGetAll>;
    getbyId(id: number): Promise<any>;
    expiredProductsCount(): Promise<number>;
}
