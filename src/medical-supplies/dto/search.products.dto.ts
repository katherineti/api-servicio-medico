import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchProductsDto {

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  category: string;
  
  @IsOptional()
  expirationDate:Date;

  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  take: number;
}