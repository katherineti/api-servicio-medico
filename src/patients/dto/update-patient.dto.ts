import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class UpdatePatientDto{

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    birthdate: string;
    
    @IsNotEmpty()
    placeBirth : string;

    @IsNotEmpty()
    @IsInt()
    age: number;

    @IsNotEmpty()
    @IsString()
    cedula: string;

    @IsNotEmpty()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    phone:string ;

    @IsNotEmpty()
    @IsString()
    gender: string;

    @IsNotEmpty()
    @IsString()
    civilStatus: string;

    @IsNotEmpty()
    @IsInt()
    children: number;

    @IsBoolean()
    isActivate:boolean;
}