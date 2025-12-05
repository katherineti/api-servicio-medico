import type { Response } from "express";
import { NeonDatabase } from "drizzle-orm/neon-serverless";
export interface DashboardReportDto {
    title: string;
    value: any;
    type: string;
    date: string;
    role: string;
    additionalInfo?: any;
}
export interface UserRegistrationByMonth {
    month: number;
    label: string;
    count: number;
}
export interface UserRegistrationByDay {
    day: number;
    date: string;
    count: number;
}
export interface UsersByRole {
    roleId: number;
    roleName: string;
    userCount: number;
}
export interface CompleteUserStats {
    totalUsers: number;
    usersToday: number;
    usersThisMonth: number;
    activeUsers: number;
    inactiveUsers: number;
    usersByRole: UsersByRole[];
    registrationsByDay: UserRegistrationByDay[];
    registrationsByMonth: UserRegistrationByMonth[];
}
export declare class DashboardReportService {
    private db;
    private readonly logger;
    private readonly MAX_RETRIES;
    private readonly fonts;
    constructor(db: NeonDatabase);
    create(reportData: Partial<DashboardReportDto>): Promise<DashboardReportDto>;
    findAll(page?: number, limit?: number): Promise<{
        reports: DashboardReportDto[];
        total: number;
    }>;
    generatePdf(reportData: DashboardReportDto, res: Response): Promise<void>;
    verifyFonts(): void;
    private validateReportData;
    private createDashboardDocumentDefinition;
    private addGeneralInfoTable;
    private addMainMetricSection;
    private addAdditionalInfoSection;
    private addSystemInfoSection;
    loadLogoWithRetry(): Promise<Buffer | null>;
    formatDate(date: Date | string): string;
    getValidContent(content: any): string;
    private capitalizarOracion;
    private formatKey;
    getCompleteUserStats(): Promise<CompleteUserStats>;
    capitalizeFirstLetter(string: string): string;
}
