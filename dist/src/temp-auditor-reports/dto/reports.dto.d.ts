export declare class ReportCreateDto {
    id?: number;
    code: string;
    title: string;
    receiver: string;
    auditorId: number;
    statusId?: number;
    startDate?: Date;
    idDuplicate?: number | null;
    updatedAt?: Date;
    additionalAuditorIds: number[];
}
