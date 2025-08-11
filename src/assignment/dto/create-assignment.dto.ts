import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateAssignmentDto{

/*     @IsNotEmpty()
    @IsNumber()
    employeeId: number; */
    @IsOptional()
    @IsNumber()
    employeeId: number;

    @IsOptional()
    @IsNumber()
    medicoId: number;

    @IsOptional()
    @IsNumber()
    familyId?: number;

    @IsNotEmpty()
    @IsNumber()
    type: number;

    @IsOptional()
    @IsString()
    observation?: string;

    @IsNotEmpty()
    @IsNumber()
    productId: number;

    @IsNotEmpty()
    @IsNumber()
    products: number;
}