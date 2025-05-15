import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class ReportCreateDto {
  
  @IsOptional()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  receiver: string;

  @IsNotEmpty()
  @IsNumber()
  auditorId: number;

  @IsOptional()
  @IsNumber()
  statusId?: number;

  @IsOptional()
  startDate?: Date;

  @IsOptional()
  @IsNumber()
  idDuplicate?: number | null;

  @IsOptional()
  updatedAt?: Date;
}