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
    @IsOptional()
    // @IsNotEmpty()
    password: string;  //en la actualizacion de usuario la contraseña no se necesita

    @IsString()
    @IsNotEmpty()
    url_image: string;
    
    @IsNumber()
    @IsNotEmpty()
    subdependency_id: number;

    @IsNumber()
    @IsNotEmpty()
    id_cargo: number; 

    @IsNumber()
    @IsNotEmpty()
    contract_type: number; 
    
    @IsNumber()
    // @IsOptional()
    @IsNotEmpty()
    status: number; 
}