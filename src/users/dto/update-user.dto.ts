import { IsString, IsNotEmpty, IsOptional, IsBoolean, Matches, IsNumber } from 'class-validator';

export class UpdateUserDto{

    @IsNotEmpty()
    @IsString()
    @Matches(/^[a-zA-ZÀ-ÿ0-9\s]+$/)
    name: string;

    @IsOptional()
    @IsNumber()
    role?: number;

    @IsOptional()
    @IsBoolean()
    isActivate?: boolean;
}