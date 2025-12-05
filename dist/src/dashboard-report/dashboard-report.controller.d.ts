import { Response } from "express";
import { PdfDashboardService } from "./pdf-dasboard.service";
import { DashboardReportService } from "./dashboard-report.service";
import { IJwtPayload } from "src/auth/dto/jwt-payload.interface";
import { MedicalSuppliesReportTodayService } from "./medical-supplies-registered/medical-supplies-report-today.service";
import { MedicalSuppliesReportMonthService } from "./medical-supplies-registered/medical-supplies-report-month.service";
import { AssignmentReportMonthService } from "./assignment-registered/assignment-report-month.service";
import type { AlertSummary, InventoryAlert, MedicalSupplyType } from "./medical-supplies-available/medical-supplies-report.interface";
import { MedicalSuppliesReportService } from "./medical-supplies-available/medical-supplies-report.service";
import { AssignmentReportMonthByMedicalSuppliesService } from "./assignment-stock/stockAssignment-report-month.service";
import { MedicalSuppliesReportAllService } from "./medical-supplies-registered/medical-supplies-report-all.service";
export declare class DashboardReportController {
    private readonly dashboardReportService;
    private readonly pdfGeneratorDashboardService;
    private readonly medicalSuppliesReportTodayService;
    private readonly medicalSuppliesReportMonthService;
    private readonly medicalSuppliesReportAllService;
    private readonly assignmentReportMonthService;
    private readonly medicalSuppliesReportService;
    private readonly assignmentReportMonthByMedicalSuppliesService;
    private readonly logger;
    constructor(dashboardReportService: DashboardReportService, pdfGeneratorDashboardService: PdfDashboardService, medicalSuppliesReportTodayService: MedicalSuppliesReportTodayService, medicalSuppliesReportMonthService: MedicalSuppliesReportMonthService, medicalSuppliesReportAllService: MedicalSuppliesReportAllService, assignmentReportMonthService: AssignmentReportMonthService, medicalSuppliesReportService: MedicalSuppliesReportService, assignmentReportMonthByMedicalSuppliesService: AssignmentReportMonthByMedicalSuppliesService);
    generatePdfUsers(res: Response, user: IJwtPayload, download: boolean): Promise<void>;
    pdfMedicalSupplies_today(res: Response, user: IJwtPayload, download?: string): Promise<void>;
    pdfMedicalSupplies_month(res: Response, user: IJwtPayload, download?: string): Promise<void>;
    pdfMedicalSupply_AllRecords(res: Response, user: IJwtPayload, download?: string): Promise<void>;
    pdfAssignmentsYear(res: Response, user: IJwtPayload, download?: string): Promise<void>;
    pdfAssignmentsMonth(res: Response, user: IJwtPayload, download?: string): Promise<void>;
    pdfAssignmentsDay(res: Response, user: IJwtPayload, download?: string): Promise<void>;
    pdfAssignmentsMonthMedicamentsUniformesOdontologic(supplyType: string, res: Response, user: IJwtPayload, download?: string): Promise<void>;
    generateMedicalSuppliesReport(supplyType: string, res: Response, user: IJwtPayload, includeExpired?: string, minStockThreshold?: string, download?: string): Promise<void>;
    getMedicalSuppliesStats(supplyType: string, startDate?: string, endDate?: string, user?: IJwtPayload): Promise<{
        success: boolean;
        data: {
            supplyType: MedicalSupplyType;
            typeName: string;
            stats: import("./medical-supplies-available/medical-supplies-report.interface").MedicalSupplyStats;
            dateRange: {
                start: string;
                end: string;
            };
        };
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        data: any;
    }>;
    getSupplyTypes(): Promise<{
        success: boolean;
        data: {
            id: number;
            name: string;
            description: string;
            features: string[];
        }[];
    }>;
    getInventoryAlerts(supplyType: string, user?: IJwtPayload): Promise<{
        success: boolean;
        data: {
            supplyType: MedicalSupplyType;
            typeName: string;
            alerts: InventoryAlert[];
            summary: AlertSummary;
            metadata: {
                generatedAt: string;
                alertTypes: import("./medical-supplies-available/medical-supplies-report.interface").AlertType[];
                priorityDistribution: {
                    critical: number;
                    high: number;
                    medium: number;
                    low: number;
                };
            };
        };
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        data: any;
    }>;
    private validateSupplyType;
    private createReportData;
    private getSupplyTypeName;
    private generateFilename;
    private setResponseHeaders;
    private getAlertsForSupplyType;
    private handleError;
    generateEnhancedAvailableProductsReport(supplyType: string, res: Response, user: IJwtPayload, includeExpired?: string, minStockThreshold?: string, download?: string): Promise<void>;
    getEnhancedAvailableProductsStats(supplyType: string, user?: IJwtPayload): Promise<{
        success: boolean;
        data: {
            supplyType: MedicalSupplyType;
            typeName: string;
            enhancedStats: import("./medical-supplies-available/medical-supplies-report.service").EnhancedMedicationStatistics;
            metadata: {
                reportType: string;
                generatedAt: string;
                focusedOn: string;
                excludes: string[];
            };
        };
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        data: any;
    }>;
    private createEnhancedReportData;
    private generateEnhancedFilename;
    private getDefaultStockThreshold;
}
