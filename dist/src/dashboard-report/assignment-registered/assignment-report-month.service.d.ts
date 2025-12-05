import type { Response } from "express";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import { DashboardReportService } from "../../dashboard-report/dashboard-report.service";
import type { AssignmentReportDto, CompleteAssignmentStats } from "./assignment-stats.interface";
import { AssignmentService } from "src/assignment/assignment.service";
export interface AssignmentReportOptions {
    reportType: "day" | "month" | "year";
    date?: Date;
}
export declare class AssignmentReportMonthService {
    private db;
    private readonly dashboardReportService;
    private readonly assignmentService;
    private readonly logger;
    private readonly chartJSNodeCanvas;
    constructor(db: NeonDatabase, dashboardReportService: DashboardReportService, assignmentService: AssignmentService);
    generateCustomAssignmentsPdf(reportData: AssignmentReportDto, res: Response, options?: AssignmentReportOptions): Promise<void>;
    getCompleteAssignmentStats(options?: AssignmentReportOptions): Promise<CompleteAssignmentStats>;
    private createCustomAssignmentsDocumentDefinition;
    private addGeneralInfoTable;
    private addGeneralStatsSection;
    private addAssignmentsByEmployeeSection;
    private addAssignmentsByProductTypeSection;
    private addAssignmentsByFamilySection;
    private addAssignmentDetailSection;
    private addSystemInfoSection;
    private generateYearlyRegistrationChart;
    showCintilloCiip(content: any): Promise<any>;
}
