import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateFamilyDto{

    @IsNotEmpty()
    @IsNumber()
    employeeId: number;

    @IsOptional()
    @IsString()
    name:string;

    @IsOptional()
    @IsString()
    cedula:string;
}