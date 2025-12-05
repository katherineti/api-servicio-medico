"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateUtils = void 0;
class DateUtils {
    static getDateRanges(reportType, targetDate) {
        const now = targetDate || new Date();
        if (reportType === "day") {
            const startOfDay = new Date(now);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(now);
            endOfDay.setHours(23, 59, 59, 999);
            return { startRange: startOfDay, endRange: endOfDay };
        }
        else {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            return { startRange: startOfMonth, endRange: endOfMonth };
        }
    }
    static formatDateForFilename(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
    static getMonthName(monthIndex) {
        const months = [
            "Enero",
            "Febrero",
            "Marzo",
            "Abril",
            "Mayo",
            "Junio",
            "Julio",
            "Agosto",
            "Septiembre",
            "Octubre",
            "Noviembre",
            "Diciembre",
        ];
        return months[monthIndex] || "Mes";
    }
    static formatDateToSpanish(date) {
        try {
            if (!date)
                return "N/A";
            const d = new Date(date);
            if (isNaN(d.getTime()))
                return "Fecha inválida";
            return d.toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        }
        catch (error) {
            return "Error en fecha";
        }
    }
    static isExpired(expirationDate) {
        if (!expirationDate)
            return false;
        const expDate = new Date(expirationDate);
        const now = new Date();
        return expDate < now;
    }
    static getDaysUntilExpiration(expirationDate) {
        if (!expirationDate)
            return -1;
        const expDate = new Date(expirationDate);
        const now = new Date();
        const diffTime = expDate.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}
exports.DateUtils = DateUtils;
//# sourceMappingURL=date.utils.js.map