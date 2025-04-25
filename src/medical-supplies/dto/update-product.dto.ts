import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { TypesProducts } from 'src/db/types/types-products';

export class UpdateProductDto{

    @IsOptional()
    @IsString()
    url_image: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    code: string;

    @IsNotEmpty()
    @IsNumber()
    stock: number;

    @IsNotEmpty()
    @IsNumber()
    categoryId: number;

    @IsNotEmpty()
    @IsString()
    type: TypesProducts;

    @IsNotEmpty()
    @IsNumber()
    statusId: number;
}