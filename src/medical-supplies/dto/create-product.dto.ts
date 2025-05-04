import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { TypesProducts } from 'src/db/enums/types-products';

export class CreateProductDto{

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
    code: string;//es un string numerico ejemplo '000'

    @IsNotEmpty()
    @IsString()
    stock: string;

    @IsNotEmpty()
    @IsString()
    category: string;//es un string numerico ejemplo '1'

    @IsNotEmpty()
    @IsString()
    type: TypesProducts;

    @IsNotEmpty()
    @IsString()
    status: string;//es un string numerico ejemplo '1'

    @IsNotEmpty()
    expirationDate: Date;
}