import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class ReportUpdateDto {
  
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

  @IsNotEmpty()
  @IsNumber()
  statusId?: number;

  @IsOptional()
  startDate?: Date;

  @IsOptional()
  @IsNumber()
  idDuplicate?: number | null;

  @IsOptional()
  updatedAt?: Date;

  @IsNotEmpty()
  @IsString()
  summary_objective: string;

  @IsNotEmpty()
  @IsString()
  summary_scope: string;

  @IsNotEmpty()
  @IsString()
  summary_methodology: string;

  @IsNotEmpty()
  @IsString()
  summary_conclusionAndObservation: string;

  @IsOptional()
  @IsString()
  introduction: string;

  @IsOptional()
  @IsString()
  detailed_methodology: string;

  @IsOptional()
  @IsString()
  findings: string;

  @IsOptional()
  @IsString()
  conclusions: string;
}