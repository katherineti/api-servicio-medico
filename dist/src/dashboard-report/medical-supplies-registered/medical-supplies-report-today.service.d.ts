import type { Response } from "express";
import { NeonDatabase } from "drizzle-orm/neon-serverless";
import { DashboardReportDto, DashboardReportService } from "../dashboard-report.service";
import { MedicalSuppliesService } from "src/medical-supplies/medical-supplies.service";
export interface MedicalSupplyReportDto extends Omit<DashboardReportDto, "role"> {
}
export interface ProductRegistrationByDay {
    day: number;
    date: string;
    count: number;
}
export interface ProductsByCategory {
    categoryId: number;
    categoryName: string;
    productCount: number;
}
export interface ProductsByStatus {
    statusId: number;
    statusName: string;
    productCount: number;
}
export interface ProductsByType {
    typeId: number;
    typeName: string;
    productCount: number;
}
export interface CompleteMedicalSupplyStats {
    totalProducts: number;
    productsToday: number;
    productsByCategory: ProductsByCategory[];
    productsByStatus: ProductsByStatus[];
    productsByType: ProductsByType[];
    registrationsByDay: ProductRegistrationByDay[];
    todayProducts: any[];
}
export declare class MedicalSuppliesReportTodayService {
    private db;
    private readonly dashboardReportService;
    private readonly medicalSuppliesService;
    private readonly logger;
    constructor(db: NeonDatabase, dashboardReportService: DashboardReportService, medicalSuppliesService: MedicalSuppliesService);
    generatePdf(reportData: MedicalSupplyReportDto, res: Response): Promise<void>;
    generateCustomMedicalSuppliesPdf(reportData: MedicalSupplyReportDto, res: Response): Promise<void>;
    getCompleteMedicalSupplyStats(): Promise<CompleteMedicalSupplyStats>;
    private createCustomMedicalSuppliesDocumentDefinition;
    private addGeneralInfoTable;
    private addGeneralStatsSection;
    private addTodayRegistrationsChart;
    private addTodayProductsSection;
    private addProductsByCategorySection;
    private addProductsByStatusSection;
    private addSystemInfoSection;
}
