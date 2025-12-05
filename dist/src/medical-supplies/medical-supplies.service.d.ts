import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { SearchProductsDto } from './dto/search.products.dto';
import { ProductsGetAll } from './dto/read-products-dto';
import { Product } from 'src/db/types/products.types';
import { CategoriesService } from 'src/categories/categories.service';
import { CreateProductDto } from './dto/create-product.dto';
import { IcustomerAccessPoint } from 'src/logs/interfaces/logs.interface';
import { LogsService } from 'src/logs/logs.service';
import { IJwtPayload } from 'src/auth/dto/jwt-payload.interface';
export interface stockMedicalSuppliesAvailables {
    sum_medicamentos: number;
    sum_uniformes: number;
    sum_equiposOdontologicos: number;
}
export declare class MedicalSuppliesService {
    private db;
    private categoriesService;
    private logsService;
    private readonly logger;
    constructor(db: NeonDatabase, categoriesService: CategoriesService, logsService: LogsService);
    getProductbyId(id: number): Promise<any>;
    getProductbyCode(code: string): Promise<any>;
    getAll(filter: SearchProductsDto, usersesion: IJwtPayload): Promise<ProductsGetAll>;
    create(createMedicalSupplyDto: CreateProductDto, userId: number, customerAccessPoint: IcustomerAccessPoint, file?: Express.Multer.File): Promise<any>;
    update(id: number, updateMedicalSupplyDto: CreateProductDto, file?: Express.Multer.File): Promise<any>;
    delete(id: number): Promise<Product>;
    removesSpacesInString(texto: string): string;
    totalProductsOfTheDay(): Promise<{
        count: number;
    }>;
    totalProductsOfMonth(): Promise<{
        count: number;
    }>;
    countAllProducts(): Promise<{
        count: number;
    }>;
    getAccumulatedStockByType(): Promise<stockMedicalSuppliesAvailables>;
    calculateCurrentMonthRange(): {
        startOfMonth: Date;
        endOfMonth: Date;
    };
}
