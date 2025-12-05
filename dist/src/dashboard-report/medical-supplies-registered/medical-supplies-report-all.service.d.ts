import type { Response } from "express";
import { NeonDatabase } from "drizzle-orm/neon-serverless";
import { DashboardReportDto, DashboardReportService } from "../dashboard-report.service";
export interface MedicalSupplyReportDto extends Omit<DashboardReportDto, "role"> {
}
export interface ProductRegistrationByMonth {
    month: number;
    label: string;
    count: number;
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
    productsMonth: number;
    productsDay: number;
    productsYear: number;
    productsByCategory: ProductsByCategory[];
    productsByStatus: ProductsByStatus[];
    productsByType: ProductsByType[];
    todayProducts: any[];
    registrationsByDay: ProductRegistrationByDay[];
    registrationsByMonth: ProductRegistrationByMonth[];
}
export declare class MedicalSuppliesReportAllService {
    private db;
    private readonly dashboardReportService;
    private readonly logger;
    private readonly chartJSNodeCanvas;
    constructor(db: NeonDatabase, dashboardReportService: DashboardReportService);
    generatePdf(reportData: MedicalSupplyReportDto, res: Response): Promise<void>;
    generateCustomMedicalSuppliesPdf(reportData: MedicalSupplyReportDto, res: Response): Promise<void>;
    getCompleteMedicalSupplyStats(): Promise<CompleteMedicalSupplyStats>;
    private createCustomMedicalSuppliesDocumentDefinition;
    private addGeneralInfoTable;
    private addGeneralStatsSection;
    private addTodayProductsSection;
    private addProductsByCategorySection;
    private addProductsByStatusSection;
    private addProductsByTypeSection;
    private addSystemInfoSection;
    private generateYearlyRegistrationChart;
    private addRegistrationsByMonthSection;
    private getMonthName;
}
