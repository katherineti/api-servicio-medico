import type { Response } from "express";
import { BaseReportService } from "./base-report.service";
import type { MedicalSupplyReportData, MedicalSupplyReportOptions, MedicalSupplyStats } from "./medical-supplies-report.interface";
import { NeonDatabase } from "drizzle-orm/neon-serverless";
import { MedicalSuppliesService } from "src/medical-supplies/medical-supplies.service";
import { DashboardReportService } from "../dashboard-report.service";
export interface EnhancedMedicationStatistics {
    totalAvailableProducts_sumStock: number;
    availableWithLowStock: number;
    availableNearExpiry: number;
    lowStockAvailableDetails: Array<{
        id: number;
        name: string;
        code: string;
        stock: number;
        minStock: number;
        category: string;
        provider: string;
    }>;
    nearExpiryAvailableDetails: Array<{
        id: number;
        name: string;
        code: string;
        expirationDate: string;
        daysToExpiry: number;
        category: string;
    }>;
    categoryDistribution: Array<{
        categoryName: string;
        availableCount: number;
        percentage: number;
    }>;
    availabilityAnalysis: {
        totalProductsInSystem: number;
        availableProducts: number;
        availabilityPercentage: number;
        notAvailableProducts: number;
        expiredProducts: number;
        noAvailabilityPercentage: number;
    };
    countRegistryAvailableProducts: number;
}
export declare class MedicalSuppliesReportService extends BaseReportService {
    private db;
    private readonly medicalSuppliesService;
    private readonly dashboardReportService;
    constructor(db: NeonDatabase, medicalSuppliesService: MedicalSuppliesService, dashboardReportService: DashboardReportService);
    generateCustomPdf(reportData: MedicalSupplyReportData, res: Response, options: MedicalSupplyReportOptions): Promise<void>;
    getEnhancedMedicalSupplyStats(options: MedicalSupplyReportOptions): Promise<EnhancedMedicationStatistics>;
    private getEnhancedMedicationStatistics;
    private getEnhancedUniformStatistics;
    private getEnhancedDentalEquipmentStatistics;
    private createEnhancedDocumentDefinition;
    private addEnhancedStatsSection;
    private addAvailabilityAnalysisSection;
    private addLowStockDetailsSection;
    private addNearExpiryDetailsSection;
    private addCategoryDistributionSection;
    private addEnhancedRecommendationsSection;
    private generateEnhancedRecommendations;
    getMedicalSupplyStats(options: MedicalSupplyReportOptions): Promise<MedicalSupplyStats>;
    private getReportTitle;
    private generateFilename;
    getMedicationStatistics(): Promise<{
        totalStockMedicamentos: string;
        stockMedicamentosDisponibles: string;
        stockMedicamentosCaducados: string;
        cantidadMedicamentosStockBajo: number;
    }>;
    getUniformesStatistics(): Promise<{
        totalStockUniformes: string;
        stockUniformesDisponibles: string;
        cantidadUniformesStockBajo: number;
    }>;
    getEquiposOdontologicosStatistics(): Promise<{
        totalStockEquiposOdontologicos: string;
        stockEquiposOdontologicosDisponibles: string;
        cantidadEquiposOdontologicosStockBajo: number;
    }>;
    toSentenceCase(str: string): string;
}
