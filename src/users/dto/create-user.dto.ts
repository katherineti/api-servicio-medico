import { IsString, IsNumber, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class CreateUserDto{

        @IsNumber()
        @IsOptional()
        id: number;

    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsNotEmpty()
    lastname: string;

    @IsString()
    @IsNotEmpty()
    birthdate: string;

    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;  

    @IsString()
    @IsNotEmpty()
    url_image: string;
    
    @IsNumber()
    @IsNotEmpty()
    id_departamento: number;

    @IsNumber()
    @IsNotEmpty()
    id_cargo: number; 
    
    @IsNumber()
    // @IsOptional()
    @IsNotEmpty()
    status: number; 
}