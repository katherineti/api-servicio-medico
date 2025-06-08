import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class ReportCreateDto {
  
  @IsOptional()
  @IsNumber()
  id?:number;
  
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
  auditorId: number; //puede ser un usuario de rol auditor o de rol admin

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