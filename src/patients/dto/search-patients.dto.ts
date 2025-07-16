import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchPatientsDto {

  @IsOptional()
  @IsString()
  patientCedula: string;

  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  take: number;
}