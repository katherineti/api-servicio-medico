import { IsOptional, IsString, IsInt, Min, Max, IsDateString, IsNotEmpty, IsNumber } from "class-validator"
import { Type } from "class-transformer"

export class SearchMedicalPrescriptionDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number = 10

/*   @IsOptional()
  @IsString()
  doctorCedula?: string

  @IsOptional()
  @IsString()
  patientCedula?: string 

  @IsOptional()
  @IsDateString()
  createdAt?: string */


  @IsNotEmpty()
  @IsNumber()
  medicalReportId: number;
}
