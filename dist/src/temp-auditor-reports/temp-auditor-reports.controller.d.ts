import { TempAuditorReportsService } from './temp-auditor-reports.service';
import { Reports } from 'src/db/types/reports.types';
import { ReportCreateDto } from './dto/reports.dto';
import { ReportUpdateDto } from './dto/report-update.dto';
import { SearchReportsDto } from './dto/search.reports.dto';
import { ReportsGetAll } from './dto/read-reports-dto';
import { Response } from 'express';
import { PdfGeneratorService } from './pdf-generator.service';
export declare class TempAuditorReportsController {
    private readonly tempAuditorReportsService;
    private readonly pdfGeneratorService;
    private readonly logger;
    constructor(tempAuditorReportsService: TempAuditorReportsService, pdfGeneratorService: PdfGeneratorService);
    create(reportDto: ReportCreateDto): Promise<Reports>;
    getAllAuditores(): Promise<any>;
    getUser(id: number): Promise<Reports | null>;
    getProducts(body: SearchReportsDto): Promise<ReportsGetAll>;
    update(id: number, reportDto: ReportUpdateDto): Promise<{
        id: number;
        updatedAt: Date;
        code: string;
        statusId: number;
        title: string;
        receiver: string;
        auditorId: number;
        additionalAuditorIds: number[];
        summary_objective: string;
        summary_scope: string;
        summary_methodology: string;
        summary_conclusionAndObservation: string;
        introduction: string;
        detailed_methodology: string;
        findings: string;
        conclusions: string;
        images: string;
        idDuplicate: number;
        startDate: Date;
        endDate: Date;
    }>;
    updateWithImages(id: number, reportDto: ReportUpdateDto, files: {
        images?: Express.Multer.File[];
    }): Promise<{
        id: number;
        updatedAt: Date;
        code: string;
        statusId: number;
        title: string;
        receiver: string;
        auditorId: number;
        additionalAuditorIds: number[];
        summary_objective: string;
        summary_scope: string;
        summary_methodology: string;
        summary_conclusionAndObservation: string;
        introduction: string;
        detailed_methodology: string;
        findings: string;
        conclusions: string;
        images: string;
        idDuplicate: number;
        startDate: Date;
        endDate: Date;
    } | {
        saved: Reports;
        error?: string;
    }>;
    delete(id: number): Promise<Reports>;
    generatePdf(id: number, reportDto: any, res: Response, download?: string): Promise<void>;
    duplicate(objectId: {
        id: number;
    }): Promise<Reports>;
}
