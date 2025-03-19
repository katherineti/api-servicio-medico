import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateUserDto{

    @IsNumber()
    @IsNotEmpty()
    id: number;

    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    lastname: string;

    @IsString()
    @IsOptional()
    url_image: string;
    
    @IsNumber()
    @IsOptional()
    id_departamento: number;

    @IsNumber()
    @IsOptional()
    id_cargo: number; 
}