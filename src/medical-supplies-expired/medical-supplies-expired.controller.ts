import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ProductsGetAll } from 'src/medical-supplies/dto/read-products-dto';
import { SearchProductsDto } from 'src/medical-supplies/dto/search.products.dto';
import { MedicalSuppliesExpiredService } from './medical-supplies-expired.service';
import { ProductsExpiredGetAll } from './dto/products-expired-dto';
import { SearchProductsExpiredDto } from './dto/search-products-expired.dto';

@Controller('medical-supplies-expired')
export class MedicalSuppliesExpiredController {
    constructor(private readonly medicalSuppliesExpiredService: MedicalSuppliesExpiredService) { }
    
    @Post('getAll')
    // @UsePipes(ValidationPipe)
    getProducts(@Body() body: SearchProductsExpiredDto): Promise<ProductsExpiredGetAll> {
    return this.medicalSuppliesExpiredService.getAll(body);
    }
}