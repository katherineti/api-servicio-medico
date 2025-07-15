import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchMedicalReportsDto {

  @IsOptional()
  @IsString()
  doctorCedula: string;

  @IsOptional()
  @IsString()
  patientCedula: string;
  
  @IsOptional()
  createdAt: Date;

  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  take: number;
}