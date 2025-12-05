export declare enum SupplyTypeEnum {
    MEDICAMENTOS = 1,
    UNIFORMES = 2,
    EQUIPOS_ODONTOLOGICOS = 3
}
export declare class GenerateMedicalSupplyReportDto {
    supplyType: SupplyTypeEnum;
    includeExpired?: boolean;
    minStockThreshold?: number;
    download?: boolean;
    reportDate?: string;
}
export declare class MedicalSupplyStatsDto {
    supplyType: SupplyTypeEnum;
    startDate?: string;
    endDate?: string;
}
export declare class GenerateAssignmentReportDto {
    reportType: "day" | "month";
    date?: string;
    download?: boolean;
}
