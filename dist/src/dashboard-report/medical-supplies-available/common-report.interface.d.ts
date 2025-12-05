export interface BaseReportData {
    title: string;
    value?: any;
    type: string;
    date: string;
    filename?: string;
    additionalInfo?: any;
}
export interface ReportOptions {
    reportType: "day" | "month";
    date?: Date;
    download?: boolean;
}
export interface GeneralStats {
    total: number;
    today: number;
    thisMonth: number;
}
export interface ReportResponse {
    success: boolean;
    message: string;
    data?: any;
}
export interface AssignmentStats {
    totalAssignments: number;
    assignmentsInPeriod: number;
    pendingAssignments?: number;
    completedAssignments?: number;
    averageProcessingTime?: number;
}
