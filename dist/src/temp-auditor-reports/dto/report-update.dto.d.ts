export declare class ReportUpdateDto {
    code: string;
    title: string;
    receiver: string;
    auditorId: number;
    statusId?: number;
    startDate?: Date;
    idDuplicate?: number | null;
    updatedAt?: Date;
    summary_objective: string;
    summary_scope: string;
    summary_methodology: string;
    summary_conclusionAndObservation: string;
    introduction?: string;
    detailed_methodology?: string;
    findings?: string;
    conclusions?: string;
    images?: any;
    additionalAuditorIds: number[];
}
