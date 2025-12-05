import type { Response } from "express";
import type { CompleteUserStats } from "./dashboard-report.service";
import { IJwtPayload } from "src/auth/dto/jwt-payload.interface";
export declare class PdfDashboardService {
    private readonly logger;
    private readonly MAX_RETRIES;
    private readonly fonts;
    private readonly chartJSNodeCanvas;
    constructor();
    generateUserStatsPdf(userStats: CompleteUserStats, res: Response, user: IJwtPayload): Promise<void>;
    private generateRegistrationChart;
    private getMonthName;
    private createUserStatsDocumentDefinition;
    private addGeneralInfoTable;
    private addGeneralStatsSection;
    private addUsersByRoleSection;
    private addRegistrationsByDaySection;
    private addSystemInfoSection;
    private validateUserStats;
    private verifyFonts;
    private loadLogoWithRetry;
    private generateYearlyRegistrationChart;
    private addRegistrationsByMonthSection;
}
