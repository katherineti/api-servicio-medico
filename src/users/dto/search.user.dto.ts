import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchUserDto {

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  cedula: string;

  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  take: number;
}