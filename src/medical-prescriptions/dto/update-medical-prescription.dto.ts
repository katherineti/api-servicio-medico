import { IsString, IsNotEmpty, IsOptional, IsInt, MinLength, MaxLength, IsDateString } from "class-validator"

export class UpdateMedicalPrescriptionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  place: string
  
  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  @MaxLength(700)
  recipeContent: string
  
  @IsInt()
  @IsNotEmpty()
  doctorId: number
  
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  mpps: string
  
  @IsInt()
  @IsNotEmpty()
  patientId: number
  
  @IsString()
  @IsOptional()
  @MaxLength(700)
  indications?: string
  
  @IsInt()
  @IsOptional()
  medicalReportId?: number

  @IsDateString()
  @IsNotEmpty()
  expirationDate: string // Se espera en formato ISO 8601 (YYYY-MM-DD)

  @IsNotEmpty()
  updatedAt: Date
}