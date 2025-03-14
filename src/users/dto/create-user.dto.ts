import { IsString, IsNumber, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateUserDto{

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    lastname: string;

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

    @IsNumber()
    @IsNotEmpty()
    age: number;

    @IsString()
    @IsNotEmpty()
    url_image: string;
    
    @IsNumber()
    @IsNotEmpty()
    id_departamento: number;

    @IsNumber()
    @IsNotEmpty()
    id_cargo: number;
}