import { IsString, IsNumber, IsNotEmpty, IsEmail, IsUUID, IsDate } from 'class-validator';
import { Transform } from 'class-transformer';

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
    @IsUUID()
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

    @IsDate()
    @Transform( ( {value} )=> new Date(value).toISOString() )
    created_at: string;

    @IsNumber()
    roles_id: number;
}