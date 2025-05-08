import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchLogsDto {

  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  take: number;

  @IsOptional()
  @IsString()
  name_user:string;

  @IsOptional()
  @IsString()
  createdAt:string;
}