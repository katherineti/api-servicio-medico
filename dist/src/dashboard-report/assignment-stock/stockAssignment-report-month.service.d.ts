import type { Response } from "express";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import { DashboardReportService } from "../dashboard-report.service";
import { AssignmentService } from "src/assignment/assignment.service";
import { AssignmentReportDto, CompleteAssignmentStats } from "./stockAssignment-stats.interface";
import { MedicalSupplyType } from "../medical-supplies-available/medical-supplies-report.interface";
export interface AssignmentReportByTypeSuppliesOptions {
    reportType: "day" | "month";
    date?: Date;
    supplyType: number;
}
export declare class AssignmentReportMonthByMedicalSuppliesService {
    private db;
    private readonly dashboardReportService;
    private readonly assignmentService;
    private readonly logger;
    constructor(db: NeonDatabase, dashboardReportService: DashboardReportService, assignmentService: AssignmentService);
    generateCustomAssignmentsPdf(reportData: AssignmentReportDto, res: Response, options?: AssignmentReportByTypeSuppliesOptions): Promise<void>;
    getCompleteAssignmentStats(options?: AssignmentReportByTypeSuppliesOptions): Promise<CompleteAssignmentStats>;
    private createCustomAssignmentsDocumentDefinition;
    private addGeneralInfoTable;
    private addGeneralStatsSection;
    private addAssignmentsByEmployeeSection;
    private addAssignmentsByProductTypeSection;
    private addAssignmentsByFamilySection;
    private addAssignmentDetailSection;
    private addSystemInfoSection;
    getSupplyTypeName(supplyType: MedicalSupplyType): string;
    private generateTopMedicinesChart;
    private addTopMedicinesChartSection;
    capitalizeWords(cadena: any): any;
    private capitalizarOracion;
}
