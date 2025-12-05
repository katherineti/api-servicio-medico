import { MedicalReportsService } from "./medical-reports.service";
import type { MedicalReportsGetAll } from "./dto/read-medical-reports-dto";
import type { SearchMedicalReportsDto } from "./dto/search-medical-reports.dto";
import type { CreateMedicalReportDto } from "./dto/create-medical-reports.dto";
import { MedicalReportPdfService } from "./medical-report-pdf.service";
import type { Response } from "express";
export declare class MedicalReportsController {
    private readonly medicalReportsService;
    private readonly medicalReportPdfService;
    constructor(medicalReportsService: MedicalReportsService, medicalReportPdfService: MedicalReportPdfService);
    getProducts(body: SearchMedicalReportsDto): Promise<MedicalReportsGetAll>;
    getById(id: number): Promise<any[]>;
    create(createMedicalReportsDto: CreateMedicalReportDto): Promise<any>;
    generateMedicalReportPdf(id: number, res: Response, download?: string): Promise<void>;
}
