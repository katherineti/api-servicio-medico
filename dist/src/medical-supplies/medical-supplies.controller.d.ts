import { SearchProductsDto } from './dto/search.products.dto';
import { IJwtPayload } from 'src/auth/dto/jwt-payload.interface';
import { ProductsGetAll } from './dto/read-products-dto';
import { MedicalSuppliesService } from './medical-supplies.service';
import { Product } from 'src/db/types/products.types';
import { CreateProductDto } from './dto/create-product.dto';
export declare class MedicalSuppliesController {
    private readonly medicalSuppliesService;
    constructor(medicalSuppliesService: MedicalSuppliesService);
    getProducts(body: SearchProductsDto, user: IJwtPayload): Promise<ProductsGetAll>;
    deleteProduct(id: number): Promise<Product>;
    createProduct(createMedicalSupplyDto: CreateProductDto, file: Express.Multer.File, user: IJwtPayload, clienteIp: string, req: Request): Promise<any>;
    updateProduct(prodId: number, product: CreateProductDto, file: Express.Multer.File): Promise<any>;
}
