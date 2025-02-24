import { IsString, IsNumber, IsNotEmpty, IsEmail } from 'class-validator';

/* 
//DTO basico :
export class UserDto{
    id: number;
    name: string;
    lastname: string;
    age: number;
    email: string;
    username: string;
    password: string;
    created_at: string;
    roles_id: number;
} */

//DTO con validaciones usando decoradores:
export class UserDto{

    @IsNumber()
    id: number;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    lastname: string;

    @IsNumber()
    @IsNotEmpty()
    age: number;

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

    created_at: string;

    @IsNumber()
    roles_id: number;
}