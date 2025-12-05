export declare class DateUtils {
    static getDateRanges(reportType: "day" | "month", targetDate?: Date): {
        startRange: Date;
        endRange: Date;
    };
    static formatDateForFilename(date: Date): string;
    static getMonthName(monthIndex: number): string;
    static formatDateToSpanish(date: Date | string): string;
    static isExpired(expirationDate: Date | string): boolean;
    static getDaysUntilExpiration(expirationDate: Date | string): number;
}
