import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UploadedFile, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { SearchProductsDto } from './dto/search.products.dto';
import { Usersesion } from 'src/auth/strategies/usersesion.decorator';
import { IJwtPayload } from 'src/auth/dto/jwt-payload.interface';
import { ProductsGetAll } from './dto/read-products-dto';
import { MedicalSuppliesService } from './medical-supplies.service';
import { Product } from 'src/db/types/products.types';
import { Roles } from 'src/decorators/role.decorators';
import { TypesRoles } from 'src/db/enums/types-roles';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('medical-supplies')

export class MedicalSuppliesController {
  constructor(private readonly medicalSuppliesService: MedicalSuppliesService) { }

    @Post('getAll')
    @UsePipes(ValidationPipe)
    getProducts(@Body() body: SearchProductsDto, @Usersesion() user: IJwtPayload): Promise<ProductsGetAll> {
    return this.medicalSuppliesService.getAll(body);
    }

    @Delete(':id')
    deleteProduct(@Param('id', ParseIntPipe) id: number): Promise<Product> {
        return this.medicalSuppliesService.delete(id);
    }

    @Roles(TypesRoles.admin, TypesRoles.almacen)
    @Post('newProduct')
    @UseInterceptors(FileInterceptor('url_image', {
      storage: memoryStorage(), 
      limits: { fileSize: 1024 * 1024 * 10 },
    }))
    @UsePipes(ValidationPipe)
    async createProduct(
      @Body() createMedicalSupplyDto: CreateProductDto,
      @UploadedFile() file: Express.Multer.File,
    ) {
      return this.medicalSuppliesService.create(createMedicalSupplyDto, file); // Pasa el objeto 'file' directamente
    }

    @Put(':prodId')
    @UseInterceptors(FileInterceptor('url_image', {
        storage: memoryStorage(),
        limits: { fileSize: 1024 * 1024 * 10 },
      }))
    @UsePipes(ValidationPipe)
    updateProduct(
      @Param('prodId', ParseIntPipe) prodId: number,
      @Body() product: CreateProductDto,
      @UploadedFile() file: Express.Multer.File,
    ){

    return this.medicalSuppliesService.update(prodId, product, file);
    }
}