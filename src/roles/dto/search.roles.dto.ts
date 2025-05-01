import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchRolesDto {

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