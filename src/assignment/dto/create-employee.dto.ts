import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateEmployeeDto{

    @IsNotEmpty()
    @IsString()
    cedula:string;

    @IsNotEmpty()
    @IsString()
    name:string;

    @IsNotEmpty()
    @IsEmail()
    email:string;

    @IsNotEmpty()
    @IsString()
    phone:string;
}