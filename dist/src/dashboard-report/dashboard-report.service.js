"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var DashboardReportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardReportService = void 0;
const common_1 = require("@nestjs/common");
const pdfmake_1 = __importDefault(require("pdfmake"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../db/schema");
const constants_1 = require("../constants");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
let DashboardReportService = DashboardReportService_1 = class DashboardReportService {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(DashboardReportService_1.name);
        this.MAX_RETRIES = 3;
        try {
            this.fonts = {
                Roboto: {
                    normal: "Helvetica",
                    bold: "Helvetica-Bold",
                    italics: "Helvetica-Oblique",
                    bolditalics: "Helvetica-BoldOblique",
                },
            };
            this.verifyFonts();
        }
        catch (error) {
            this.logger.error("Error al inicializar fuentes:", error);
            this.fonts = {
                Roboto: {
                    normal: "Helvetica",
                    bold: "Helvetica-Bold",
                    italics: "Helvetica-Oblique",
                    bolditalics: "Helvetica-BoldOblique",
                },
            };
            this.logger.warn("Usando fuentes de respaldo");
        }
    }
    async create(reportData) {
        try {
            this.logger.log("Creando nuevo reporte del dashboard");
            this.validateReportData(reportData);
            const createdReport = {
                title: reportData.title || "Reporte sin título",
                value: reportData.value || 0,
                type: reportData.type || "general",
                date: reportData.date || new Date().toISOString(),
                role: reportData.role || "user",
                additionalInfo: {
                    ...reportData.additionalInfo,
                    createdAt: new Date().toISOString(),
                    id: Math.floor(Math.random() * 1000),
                },
            };
            this.logger.log(`Reporte del dashboard creado exitosamente: ${createdReport.title}`);
            return createdReport;
        }
        catch (error) {
            this.logger.error("Error al crear reporte del dashboard:", error);
            throw new Error("Error al crear el reporte del dashboard");
        }
    }
    async findAll(page = 1, limit = 10) {
        try {
            this.logger.log(`Obteniendo reportes del dashboard - Página: ${page}, Límite: ${limit}`);
            const mockReports = Array.from({ length: Math.min(limit, 5) }, (_, index) => ({
                title: `Reporte ${(page - 1) * limit + index + 1}`,
                value: Math.floor(Math.random() * 1000),
                type: ["users", "products", "assignments"][index % 3],
                date: new Date().toISOString(),
                role: "admin",
                additionalInfo: {
                    reportId: (page - 1) * limit + index + 1,
                    generatedAt: new Date().toISOString(),
                },
            }));
            const total = 50;
            this.logger.log(`Reportes del dashboard obtenidos: ${mockReports.length} de ${total}`);
            return { reports: mockReports, total };
        }
        catch (error) {
            this.logger.error("Error al obtener reportes del dashboard:", error);
            throw new Error("Error al obtener los reportes del dashboard");
        }
    }
    async generatePdf(reportData, res) {
        try {
            this.validateReportData(reportData);
            this.logger.log(`Generando PDF para el reporte del dashboard: ${reportData.title}`);
            let docDefinition;
            try {
                docDefinition = await this.createDashboardDocumentDefinition(reportData);
            }
            catch (error) {
                throw new common_1.InternalServerErrorException(`Error al crear la definición del documento: ${error.message}`);
            }
            const printer = new pdfmake_1.default(this.fonts);
            let pdfDoc;
            try {
                pdfDoc = printer.createPdfKitDocument(docDefinition);
            }
            catch (error) {
                throw new common_1.InternalServerErrorException(`Error al crear el documento PDF: ${error.message}`);
            }
            pdfDoc.on("error", (error) => {
                this.logger.error(`Error durante la generación del PDF: ${error.message}`);
                if (!res.headersSent) {
                    res.status(500).json({
                        statusCode: 500,
                        message: `Error al generar PDF: ${error.message}`,
                    });
                }
            });
            try {
                pdfDoc.pipe(res);
                pdfDoc.end();
                this.logger.log(`PDF generado exitosamente para el reporte: ${reportData.title}`);
            }
            catch (error) {
                throw new common_1.InternalServerErrorException(`Error al enviar el PDF: ${error.message}`);
            }
        }
        catch (error) {
            if (error instanceof common_1.InternalServerErrorException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error(`Error no manejado al generar PDF:`, error);
            if (res.headersSent) {
                return;
            }
            res.status(500).json({
                statusCode: 500,
                message: `Error al generar PDF: ${error.message || "Error desconocido"}`,
            });
        }
    }
    verifyFonts() {
        try {
            const fontPaths = [
                this.fonts.Roboto.normal,
                this.fonts.Roboto.bold,
                this.fonts.Roboto.italics,
                this.fonts.Roboto.bolditalics,
            ];
            for (const fontPath of fontPaths) {
                if (!fs.existsSync(fontPath)) {
                    throw new Error(`La fuente ${fontPath} no existe`);
                }
            }
        }
        catch (error) {
            this.logger.error("Error al verificar fuentes:", error);
            throw error;
        }
    }
    validateReportData(reportData) {
        if (!reportData) {
            throw new common_1.BadRequestException("Los datos del reporte son requeridos");
        }
        if (!reportData.title) {
            throw new common_1.BadRequestException("El título del reporte es requerido");
        }
        if (reportData.value === null || reportData.value === undefined) {
            throw new common_1.BadRequestException("El valor del reporte es requerido");
        }
        const requiredFields = ["type", "date", "role"];
        const missingFields = requiredFields.filter((field) => !reportData[field]);
        if (missingFields.length > 0) {
            throw new common_1.BadRequestException(`Campos requeridos faltantes: ${missingFields.join(", ")}`);
        }
    }
    async createDashboardDocumentDefinition(reportData) {
        try {
            let logoData = null;
            try {
                logoData = await this.loadLogoWithRetry();
            }
            catch (error) {
                this.logger.warn("No se pudo cargar el logo, continuando sin él:", error.message);
            }
            const styles = {
                headerSection: {
                    fontSize: 10,
                    alignment: "right",
                    color: "#666666",
                    margin: [0, 5, 0, 0],
                },
                reportTitle: {
                    fontSize: 18,
                    bold: true,
                    alignment: "center",
                    margin: [0, 20, 0, 15],
                    color: "#003366",
                },
                sectionTitle: {
                    fontSize: 14,
                    bold: true,
                    margin: [0, 15, 0, 10],
                    color: "#003366",
                },
                tableHeader: {
                    bold: true,
                    fontSize: 12,
                    color: "#FFFFFF",
                    fillColor: "#003366",
                    alignment: "center",
                    margin: [0, 5, 0, 5],
                },
                tableCellLabel: {
                    bold: true,
                    fontSize: 11,
                    color: "#000000",
                    fillColor: "#E0E0E0",
                    margin: [5, 5, 5, 5],
                },
                tableCellValue: {
                    fontSize: 11,
                    color: "#000000",
                    fillColor: "#F5F5F5",
                    margin: [5, 5, 5, 5],
                },
                metricValue: {
                    fontSize: 24,
                    bold: true,
                    color: "#27ae60",
                    alignment: "center",
                    margin: [0, 10, 0, 10],
                },
                paragraph: {
                    fontSize: 11,
                    margin: [0, 5, 0, 5],
                    alignment: "justify",
                },
                footer: {
                    fontSize: 9,
                    alignment: "center",
                    color: "#666666",
                    margin: [0, 10, 0, 0],
                },
            };
            const content = [];
            if (logoData) {
                content.push({
                    image: `data:image/jpeg;base64,${logoData.toString("base64")}`,
                    maxWidth: 515,
                    maxHeight: 150,
                    alignment: "center",
                    margin: [0, 0, 0, 20],
                });
            }
            content.push({
                text: "REPORTE DEL DASHBOARD",
                style: "reportTitle",
            });
            this.addGeneralInfoTable(content, reportData, styles);
            this.addMainMetricSection(content, reportData, styles);
            if (reportData.additionalInfo) {
                this.addAdditionalInfoSection(content, reportData, styles);
            }
            this.addSystemInfoSection(content, reportData, styles);
            return {
                content: content,
                styles: styles,
                defaultStyle: {
                    font: "Roboto",
                },
                pageSize: "A4",
                pageMargins: [40, 60, 40, 60],
                footer: (currentPage, pageCount) => ({
                    text: `Reporte Dashboard - Página ${currentPage} de ${pageCount}`,
                    style: "footer",
                }),
                header: ((currentPage, pageCount, pageSize) => {
                    if (currentPage === 1)
                        return null;
                    return {
                        stack: [
                            {
                                columns: [
                                    logoData
                                        ? {
                                            image: `data:image/jpeg;base64,${logoData.toString("base64")}`,
                                            width: 60,
                                            margin: [40, 10, 0, 0],
                                        }
                                        : {},
                                    {
                                        stack: [
                                            { text: `${reportData.title} - Página: ${currentPage} de ${pageCount}`, style: "headerSection" },
                                        ],
                                        alignment: "right",
                                        margin: [0, 10, 40, 0],
                                    },
                                ],
                            },
                            {
                                canvas: [
                                    {
                                        type: "line",
                                        x1: 40,
                                        y1: 50,
                                        x2: pageSize.width - 40,
                                        y2: 50,
                                        lineWidth: 1,
                                        lineColor: "#cccccc",
                                    },
                                ],
                            },
                        ],
                    };
                }).bind(this),
            };
        }
        catch (error) {
            throw new Error(`Error al crear la definición del documento: ${error.message}`);
        }
    }
    addGeneralInfoTable(content, reportData, styles) {
        content.push({
            margin: [0, 10, 0, 20],
            table: {
                widths: ["*", "*", "*"],
                layout: {
                    hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
                    vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 1 : 0.5),
                    hLineColor: (i, node) => (i === 0 || i === node.table.body.length ? "#003366" : "#BBBBBB"),
                    vLineColor: (i, node) => (i === 0 || i === node.table.widths.length ? "#003366" : "#BBBBBB"),
                    paddingLeft: (i, node) => 10,
                    paddingRight: (i, node) => 10,
                    paddingTop: (i, node) => 5,
                    paddingBottom: (i, node) => 5,
                },
                body: [
                    [
                        { text: "Tipo de Reporte", style: "tableHeader" },
                        { text: "Rol de Usuario", style: "tableHeader" },
                        { text: "Fecha de Generación", style: "tableHeader" },
                    ],
                    [
                        { text: this.getValidContent(reportData.type), style: "tableCellValue" },
                        { text: this.getValidContent(reportData.role), style: "tableCellValue" },
                        { text: this.formatDate(reportData.date), style: "tableCellValue" },
                    ],
                ],
            },
        });
    }
    addMainMetricSection(content, reportData, styles) {
        content.push({ text: "Métrica Principal", style: "sectionTitle" }, {
            table: {
                widths: ["40%", "60%"],
                body: [
                    [
                        { text: "Descripción:", style: "tableCellLabel" },
                        { text: this.getValidContent(reportData.title), style: "tableCellValue" },
                    ],
                    [
                        { text: "Valor:", style: "tableCellLabel" },
                        { text: this.getValidContent(reportData.value), style: "metricValue" },
                    ],
                ],
            },
            layout: {
                hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
                vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 1 : 0.5),
                hLineColor: (i, node) => (i === 0 || i === node.table.body.length ? "#003366" : "#BBBBBB"),
                vLineColor: (i, node) => (i === 0 || i === node.table.widths.length ? "#003366" : "#BBBBBB"),
                paddingLeft: (i, node) => 10,
                paddingRight: (i, node) => 10,
                paddingTop: (i, node) => 5,
                paddingBottom: (i, node) => 5,
            },
            margin: [0, 10, 0, 20],
        });
    }
    addAdditionalInfoSection(content, reportData, styles) {
        content.push({ text: "Información Adicional", style: "sectionTitle" });
        const additionalTableBody = [
            [
                { text: "Campo", style: "tableHeader" },
                { text: "Valor", style: "tableHeader" },
            ],
        ];
        Object.keys(reportData.additionalInfo).forEach((key) => {
            const displayKey = this.formatKey(key);
            const displayValue = reportData.additionalInfo[key];
            additionalTableBody.push([
                { text: displayKey, style: "tableCellLabel" },
                { text: this.getValidContent(displayValue), style: "tableCellValue" },
            ]);
        });
        content.push({
            table: {
                widths: ["40%", "60%"],
                body: additionalTableBody,
            },
            layout: {
                hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
                vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 1 : 0.5),
                hLineColor: (i, node) => (i === 0 || i === node.table.body.length ? "#003366" : "#BBBBBB"),
                vLineColor: (i, node) => (i === 0 || i === node.table.widths.length ? "#003366" : "#BBBBBB"),
                paddingLeft: (i, node) => 10,
                paddingRight: (i, node) => 10,
                paddingTop: (i, node) => 5,
                paddingBottom: (i, node) => 5,
            },
            margin: [0, 10, 0, 20],
        });
    }
    addSystemInfoSection(content, reportData, styles) {
        const currentDate = new Date().toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
        content.push({ text: "\n\n" }, { text: `Generado por: Usuario con rol ${reportData.role}`, style: "paragraph" }, { text: `Fecha y hora de generación: ${currentDate}`, style: "paragraph" }, { text: `Tipo de reporte: ${reportData.type}`, style: "paragraph" }, { text: "\n" }, {
            text: "Este reporte fue generado automáticamente por el sistema de gestión médica.",
            style: "paragraph",
            alignment: "center",
            color: "#666666",
        });
    }
    async loadLogoWithRetry() {
        const possibleLogoPaths = [
            path.join(process.cwd(), "uploads", constants_1.membreteCIIP)
        ];
        for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
            try {
                for (const logoPath of possibleLogoPaths) {
                    if (fs.existsSync(logoPath)) {
                        return fs.readFileSync(logoPath);
                    }
                }
                this.logger.warn(`Intento ${attempt + 1}/${this.MAX_RETRIES}: Logo no encontrado en las ubicaciones esperadas`);
                if (attempt < this.MAX_RETRIES - 1) {
                    await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 100));
                }
            }
            catch (error) {
                this.logger.warn(`Intento ${attempt + 1}/${this.MAX_RETRIES}: Error al cargar el logo:`, error);
                if (attempt < this.MAX_RETRIES - 1) {
                    await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 100));
                }
            }
        }
        throw new Error("No se pudo cargar el logo después de varios intentos");
    }
    formatDate(date) {
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
            this.logger.error("Error al formatear fecha:", error);
            return "Error en fecha";
        }
    }
    getValidContent(content) {
        try {
            if (content === null || content === undefined) {
                return "No disponible";
            }
            if (typeof content === "string" && content.trim() === "") {
                return "No disponible";
            }
            if (typeof content === "object") {
                try {
                    return JSON.stringify(content, null, 2);
                }
                catch (error) {
                    this.logger.error("Error al convertir objeto a JSON:", error);
                    return "Contenido en formato no compatible";
                }
            }
            return this.capitalizarOracion(String(content));
        }
        catch (error) {
            this.logger.error("Error al procesar contenido:", error);
            return "Error al procesar contenido";
        }
    }
    capitalizarOracion(oracion) {
        if (oracion.length === 0) {
            return "";
        }
        return oracion.charAt(0).toUpperCase() + oracion.slice(1);
    }
    formatKey(key) {
        const keyMappings = {
            currentDate: "Fecha Actual",
            currentMonth: "Mes Actual",
            userRole: "Rol de Usuario",
            category: "Categoría",
            status: "Estado",
            period: "Período",
            alertLevel: "Nivel de Alerta",
            generatedAt: "Generado en",
            reportType: "Tipo de Reporte",
        };
        return keyMappings[key] || key.charAt(0).toUpperCase() + key.slice(1);
    }
    async getCompleteUserStats() {
        try {
            const now = new Date();
            const nowUtc = new Date(now.toISOString());
            const startOfDay = new Date(Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), nowUtc.getUTCDate(), 0, 0, 0, 0));
            const endOfDay = new Date(Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), nowUtc.getUTCDate(), 23, 59, 59, 999));
            const currentYear = nowUtc.getUTCFullYear();
            const currentMonth = nowUtc.getUTCMonth();
            const startOfNextMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 1, 0, 0, 0, 0));
            const endOfMonth = new Date(startOfNextMonth.getTime() - 1);
            const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0, 0));
            const startOfYear = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0));
            const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));
            const [generalStats] = await this.db
                .select({
                totalUsers: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.usersTable.createdAt} >= ${startOfYear} AND ${schema_1.usersTable.createdAt} <= ${endOfYear} THEN 1 ELSE NULL END)`,
                usersThisMonth: (0, drizzle_orm_1.sql) `count(CASE WHEN date_trunc('month', ${schema_1.usersTable.createdAt}) = date_trunc('month', NOW()) THEN 1 ELSE NULL END)`,
                usersToday: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.usersTable.createdAt} >= ${startOfDay} AND ${schema_1.usersTable.createdAt} <= ${endOfDay} THEN 1 ELSE NULL END)`,
                activeUsers: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.usersTable.isActivate} = TRUE AND (${schema_1.usersTable.createdAt} >= ${startOfYear} AND ${schema_1.usersTable.createdAt} <= ${endOfYear}) THEN 1 ELSE NULL END)`,
                inactiveUsers: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.usersTable.isActivate} = FALSE AND (${schema_1.usersTable.createdAt} >= ${startOfYear} AND ${schema_1.usersTable.createdAt} <= ${endOfYear}) THEN 1 ELSE NULL END)`,
            })
                .from(schema_1.usersTable);
            const usersByRoleResult = await this.db
                .select({
                roleId: schema_1.rolesTable.id,
                roleName: schema_1.rolesTable.name,
                userCount: (0, drizzle_orm_1.count)(schema_1.usersTable.id),
            })
                .from(schema_1.rolesTable)
                .leftJoin(schema_1.usersTable, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.usersTable.role, schema_1.rolesTable.id), (0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.usersTable.createdAt, startOfYear), (0, drizzle_orm_1.lte)(schema_1.usersTable.createdAt, endOfYear))))
                .groupBy(schema_1.rolesTable.id, schema_1.rolesTable.name)
                .orderBy(schema_1.rolesTable.id);
            const registrationsByDayResult = await this.db
                .select({
                createdAt: schema_1.usersTable.createdAt,
                userCount: (0, drizzle_orm_1.count)(),
            })
                .from(schema_1.usersTable)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.usersTable.createdAt, startOfMonth), (0, drizzle_orm_1.lte)(schema_1.usersTable.createdAt, endOfMonth)))
                .groupBy(schema_1.usersTable.createdAt)
                .orderBy(schema_1.usersTable.createdAt);
            const usersByRole = usersByRoleResult.map((row) => ({
                roleId: row.roleId,
                roleName: this.capitalizeFirstLetter(row.roleName),
                userCount: Number(row.userCount),
            }));
            const registrationsByDay = [];
            const dayMap = new Map();
            registrationsByDayResult.forEach((row) => {
                const date = new Date(row.createdAt).toISOString().split('T')[0];
                const day = new Date(row.createdAt).getUTCDate();
                const currentCount = dayMap.get(date) || 0;
                dayMap.set(date, currentCount + Number(row.userCount));
            });
            dayMap.forEach((count, date) => {
                const day = new Date(date).getUTCDate();
                registrationsByDay.push({
                    day,
                    count,
                    date,
                });
            });
            registrationsByDay.sort((a, b) => a.day - b.day);
            const registrationsByMonthResult = await this.db
                .select({
                month: (0, drizzle_orm_1.sql) `EXTRACT(MONTH FROM ${schema_1.usersTable.createdAt})`,
                userCount: (0, drizzle_orm_1.count)(),
            })
                .from(schema_1.usersTable)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.usersTable.createdAt, startOfYear), (0, drizzle_orm_1.lte)(schema_1.usersTable.createdAt, endOfYear)))
                .groupBy((0, drizzle_orm_1.sql) `EXTRACT(MONTH FROM ${schema_1.usersTable.createdAt})`)
                .orderBy((0, drizzle_orm_1.sql) `EXTRACT(MONTH FROM ${schema_1.usersTable.createdAt})`);
            const monthsEs = [
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
            ];
            const monthCounts = Array.from({ length: 12 }, () => 0);
            registrationsByMonthResult.forEach((row) => {
                const m = Number(row.month);
                if (m >= 1 && m <= 12) {
                    monthCounts[m - 1] = Number(row.userCount);
                }
            });
            const registrationsByMonth = monthCounts.map((count, idx) => ({
                month: idx + 1,
                label: monthsEs[idx],
                count,
            }));
            console.log("usersThisMonth ", generalStats.usersThisMonth, Number(generalStats.usersThisMonth));
            const completeStats = {
                totalUsers: Number(generalStats.totalUsers),
                usersToday: Number(generalStats.usersToday),
                usersThisMonth: Number(generalStats.usersThisMonth),
                activeUsers: Number(generalStats.activeUsers),
                inactiveUsers: Number(generalStats.inactiveUsers),
                usersByRole,
                registrationsByDay,
                registrationsByMonth,
            };
            this.logger.log("Estadísticas completas de usuarios:", JSON.stringify(completeStats, null, 2));
            return completeStats;
        }
        catch (error) {
            this.logger.error("Error al obtener las estadísticas de usuarios:", error);
            throw new Error("Error al obtener las estadísticas de usuarios");
        }
    }
    capitalizeFirstLetter(string) {
        if (!string)
            return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
};
exports.DashboardReportService = DashboardReportService;
exports.DashboardReportService = DashboardReportService = DashboardReportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase])
], DashboardReportService);
//# sourceMappingURL=dashboard-report.service.js.map