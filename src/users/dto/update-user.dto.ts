import { IsString, IsNumber, IsNotEmpty, IsOptional, IsBoolean, Matches } from 'class-validator';

export class UpdateUserDto{

    @IsOptional()
    @IsNumber()
    id: number;

    @IsNotEmpty()
    @IsString()
    @Matches(/^[a-zA-ZÀ-ÿ0-9\s]+$/)
    name: string;

    @IsOptional()
    // @IsString()
    role: any; //'admin' | 'user';

    @IsOptional()
    @IsBoolean()
    isActivate: boolean;

    // @IsOptional()
    // updatedAt: Date;
}