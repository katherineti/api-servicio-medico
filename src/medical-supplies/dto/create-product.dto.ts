import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

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
    type: number;
    // type: TypesProducts;

    @IsNotEmpty()
    @IsString()
    status: string;//es un string numerico ejemplo '1'
    
    // @IsNotEmpty()
    @IsOptional()
    expirationDate: Date | 'null' | null;

    @IsNotEmpty()
    @IsNumber()
    providerId: number;//es un string numerico ejemplo '1'
}