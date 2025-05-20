import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchReportsDto {

  @IsOptional()
  @IsString()
  receiver: string;
  
  @IsOptional()
  endDate:Date;

  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  take: number;
}