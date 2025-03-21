import { IsString, IsNumber, IsNotEmpty, IsEmail, IsOptional, IsDecimal } from 'class-validator';

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
    gender: string;

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
    @IsOptional()
    password: string;  //en la actualizacion de usuario la contraseña no se necesita

    @IsString()
    @IsNotEmpty()
    url_image: string;
    
    @IsNumber()
    @IsNotEmpty()
    subdependency_id: number;

    @IsString()
    @IsNotEmpty()
    job_title: string;

    @IsNumber()
    @IsNotEmpty()
    contract_type: number; 

    // @IsDecimal()
    // @IsNotEmpty()
    // @IsOptional()
    salary: number;

    
    updated_at: Date;
    
    // @IsNumber()
    // @IsNotEmpty()
    // status: number; 
}