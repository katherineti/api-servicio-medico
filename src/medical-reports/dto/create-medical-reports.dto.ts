import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateMedicalReportDto{
    @IsNotEmpty()
    @IsNumber()
    // patientId: string;
    patientId: number;

    @IsNotEmpty()
    @IsNumber()
    // doctorId: string;
    doctorId: number;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    insurance: string;

    @IsOptional()
    @IsString()
    apsCenter: string;

    @IsOptional()
    @IsString()
    mppsCM: string;
}