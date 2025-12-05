import { Logger } from "@nestjs/common";
import { Response } from "express";
import { MedicalReportsService } from "./medical-reports.service";
import { BaseReportService } from "src/dashboard-report/medical-supplies-available/base-report.service";
export declare class MedicalReportPdfService extends BaseReportService {
    private readonly medicalReportsService;
    protected readonly logger: Logger;
    constructor(medicalReportsService: MedicalReportsService);
    generateMedicalReportPdf(reportId: number, res: Response, download?: boolean): Promise<void>;
    generateCustomPdf(reportData: any, res: Response, options: any): Promise<void>;
    private createMedicalReportDocumentDefinition;
    private formatDateForFilename;
    private setResponseHeaders;
    showSex(sex: string): "Masculino" | "Femenino";
    getCivilStatusString(civilStatus: any): "" | "Soltero(a)" | "Casado(a)" | "Divorciado(a)" | "Separado(a)" | "Viudo(a)";
    showDateBirth(dateBirth: any): string;
    capitalizarOracion(oracion: string): string;
    toTitleCase(str: string): string;
}
