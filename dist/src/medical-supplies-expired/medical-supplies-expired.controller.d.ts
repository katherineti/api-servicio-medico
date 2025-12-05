import { MedicalSuppliesExpiredService } from './medical-supplies-expired.service';
import { ProductsExpiredGetAll } from './dto/products-expired-dto';
import { SearchProductsExpiredDto } from './dto/search-products-expired.dto';
export declare class MedicalSuppliesExpiredController {
    private readonly medicalSuppliesExpiredService;
    constructor(medicalSuppliesExpiredService: MedicalSuppliesExpiredService);
    getProducts(body: SearchProductsExpiredDto): Promise<ProductsExpiredGetAll>;
}
