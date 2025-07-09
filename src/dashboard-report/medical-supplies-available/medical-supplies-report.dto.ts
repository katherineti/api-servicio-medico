import { IsEnum, IsOptional, IsBoolean, IsNumber, Min, IsDateString, IsString } from "class-validator"
import { Transform, Type } from "class-transformer"
// import { ApiProperty } from "@nestjs/swagger"

export enum SupplyTypeEnum {
  MEDICAMENTOS = 1,
  UNIFORMES = 2,
  EQUIPOS_ODONTOLOGICOS = 3,
}

export class GenerateMedicalSupplyReportDto {
/*   @ApiProperty({
    enum: SupplyTypeEnum,
    description: "1=Medicamentos, 2=Uniformes, 3=Equipos Odontológicos",
  }) */
  @IsEnum(SupplyTypeEnum)
  @Type(() => Number)
  supplyType: SupplyTypeEnum

//   @ApiProperty({ required: false, description: "Include expired items (only for medications)" })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === "1")
  @IsBoolean()
  includeExpired?: boolean

//   @ApiProperty({ required: false, description: "Minimum stock threshold for low stock alerts" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minStockThreshold?: number

//   @ApiProperty({ required: false, description: "Download as attachment" })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === "1")
  @IsBoolean()
  download?: boolean

//   @ApiProperty({ required: false, description: "Report date" })
  @IsOptional()
  @IsDateString()
  reportDate?: string
}

export class MedicalSupplyStatsDto {
/*   @ApiProperty({
    enum: SupplyTypeEnum,
    description: "1=Medicamentos, 2=Uniformes, 3=Equipos Odontológicos",
  }) */
  @IsEnum(SupplyTypeEnum)
  @Type(() => Number)
  supplyType: SupplyTypeEnum

//   @ApiProperty({ required: false, description: "Start date for statistics" })
  @IsOptional()
  @IsDateString()
  startDate?: string

//   @ApiProperty({ required: false, description: "End date for statistics" })
  @IsOptional()
  @IsDateString()
  endDate?: string
}

export class GenerateAssignmentReportDto {
//   @ApiProperty({ enum: ["day", "month"], description: "Report type" })
  @IsEnum(["day", "month"])
  @IsString()
  reportType: "day" | "month"

//   @ApiProperty({ required: false, description: "Report date" })
  @IsOptional()
  @IsDateString()
  date?: string

//   @ApiProperty({ required: false, description: "Download as attachment" })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === "1")
  @IsBoolean()
  download?: boolean
}