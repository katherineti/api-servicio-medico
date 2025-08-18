import { IsString, IsOptional, IsDateString } from "class-validator"

export class GenerateRecipePdfDto {
  @IsString()
  place: string

  @IsDateString()
  emissionDate: string

  @IsDateString()
  expirationDate: string

  // Datos del Paciente
  @IsString()
  patientName: string

  @IsString()
  patientId: string

  @IsString()
  patientBirthYear: string

  // Indicaciones y Recipe
  @IsString()
  indications: string

  @IsString()
  recipe: string

  // Datos del Médico
  @IsString()
  doctorName: string

  @IsString()
  doctorId: string

  @IsString()
  doctorMpps: string

  @IsOptional()
  @IsString()
  doctorSignature?: string

  @IsOptional()
  @IsString()
  doctorSeal?: string
}
