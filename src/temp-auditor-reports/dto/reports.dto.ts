import { Transform } from 'class-transformer';
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

  @IsOptional()
  @Transform(({ value }) => {
      if (!Array.isArray(value)) return value
  
      return value.map((id) => {
        if (typeof id === "string") {
          const numericId = Number(id.trim())
          return !isNaN(numericId) && Number.isInteger(numericId) ? numericId : id
        }
        return id
      })
  })
  additionalAuditorIds: number[];
}