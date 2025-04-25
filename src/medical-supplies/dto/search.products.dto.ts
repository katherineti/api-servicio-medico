import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchProductsDto {

  @IsOptional()
  @IsString()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  take: number;
}