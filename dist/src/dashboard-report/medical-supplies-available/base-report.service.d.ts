import { Logger } from "@nestjs/common";
import type { Response } from "express";
import type { StyleDictionary, TDocumentDefinitions } from "pdfmake/interfaces";
import type { MedicalSupplyType } from "./medical-supplies-report.interface";
export declare abstract class BaseReportService {
    protected readonly logger: Logger;
    protected getCommonStyles(): StyleDictionary;
    protected addGeneralInfoTable(content: any[], reportData: any, styles: StyleDictionary): void;
    protected addEnhancedGeneralInfoTable(content: any[], reportData: any, styles: StyleDictionary): void;
    protected getTableLayout(): {
        hLineWidth: (i: any, node: any) => 1 | 0.5;
        vLineWidth: (i: any, node: any) => 1 | 0.5;
        hLineColor: (i: any, node: any) => "#003366" | "#BBBBBB";
        vLineColor: (i: any, node: any) => "#003366" | "#BBBBBB";
        paddingLeft: (i: any, node: any) => number;
        paddingRight: (i: any, node: any) => number;
        paddingTop: (i: any, node: any) => number;
        paddingBottom: (i: any, node: any) => number;
    };
    protected getEnhancedTableLayout(): {
        hLineWidth: (i: any, node: any) => 1 | 2;
        vLineWidth: (i: any, node: any) => 1 | 2;
        hLineColor: (i: any, node: any) => "#2c3e50" | "#bdc3c7";
        vLineColor: (i: any, node: any) => "#2c3e50" | "#bdc3c7";
        paddingLeft: (i: any, node: any) => number;
        paddingRight: (i: any, node: any) => number;
        paddingTop: (i: any, node: any) => number;
        paddingBottom: (i: any, node: any) => number;
    };
    protected formatDate(date: Date | string): string;
    protected getValidContent(content: any): string;
    protected capitalizeFirstLetter(string: string): string;
    protected getStyleByPriority(priority: "low" | "medium" | "high" | "critical"): string;
    protected getAvailabilityStyle(percentage: number): string;
    protected generatePdfResponse(docDefinition: TDocumentDefinitions, res: Response, filename: string): Promise<void>;
    abstract generateCustomPdf(reportData: any, res: Response, options?: any): Promise<void>;
    getSupplyTypeName(supplyType: MedicalSupplyType): string;
}
