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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PdfDashboardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfDashboardService = void 0;
const common_1 = require("@nestjs/common");
const pdfmake_1 = __importDefault(require("pdfmake"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const chartjs_node_canvas_1 = require("chartjs-node-canvas");
const constants_1 = require("../constants");
let PdfDashboardService = PdfDashboardService_1 = class PdfDashboardService {
    constructor() {
        this.logger = new common_1.Logger(PdfDashboardService_1.name);
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
            this.chartJSNodeCanvas = new chartjs_node_canvas_1.ChartJSNodeCanvas({
                width: 600,
                height: 400,
                backgroundColour: "white",
                chartCallback: (ChartJS) => {
                    ChartJS.defaults.responsive = true;
                    ChartJS.defaults.maintainAspectRatio = false;
                },
            });
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
    async generateUserStatsPdf(userStats, res, user) {
        try {
            this.logger.log("Generando PDF de estadísticas de usuarios");
            this.validateUserStats(userStats);
            const docDefinition = await this.createUserStatsDocumentDefinition(userStats, user);
            const printer = new pdfmake_1.default(this.fonts);
            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            pdfDoc.on("error", (error) => {
                this.logger.error(`Error durante la generación del PDF:`, error);
                if (!res.headersSent) {
                    res.status(500).json({
                        statusCode: 500,
                        message: `Error al generar PDF: ${error.message}`,
                    });
                }
            });
            pdfDoc.pipe(res);
            pdfDoc.end();
            this.logger.log("PDF de estadísticas generado exitosamente");
        }
        catch (error) {
            this.logger.error("Error al generar PDF de estadísticas:", error);
            if (res.headersSent) {
                return;
            }
            res.status(500).json({
                statusCode: 500,
                message: `Error al generar PDF: ${error.message || "Error desconocido"}`,
            });
        }
    }
    async generateRegistrationChart(userStats) {
        try {
            if (!userStats.registrationsByDay || userStats.registrationsByDay.length === 0) {
                this.logger.warn("No hay datos de registros por día para generar el gráfico");
                return null;
            }
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();
            const currentMonthName = this.getMonthName(currentMonth);
            const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            this.logger.log(`Generando gráfico para: ${currentMonthName} ${currentYear} (${daysInCurrentMonth} días)`);
            const currentMonthRegistrations = userStats.registrationsByDay.filter((dayData) => {
                const registrationDate = new Date(dayData.date + "T00:00:00.000Z");
                const registrationYear = registrationDate.getUTCFullYear();
                const registrationMonth = registrationDate.getUTCMonth();
                return registrationYear === currentYear && registrationMonth === currentMonth;
            });
            const registrationMap = new Map();
            for (let day = 1; day <= daysInCurrentMonth; day++) {
                registrationMap.set(day, 0);
            }
            currentMonthRegistrations.forEach((dayData) => {
                const registrationDate = new Date(dayData.date + "T00:00:00.000Z");
                const dayOfMonth = registrationDate.getUTCDate();
                const currentCount = registrationMap.get(dayOfMonth) || 0;
                registrationMap.set(dayOfMonth, currentCount + dayData.count);
            });
            const labels = Array.from({ length: daysInCurrentMonth }, (_, i) => (i + 1).toString());
            const data = Array.from({ length: daysInCurrentMonth }, (_, i) => registrationMap.get(i + 1) || 0);
            const configuration = {
                type: "line",
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: "Usuarios Registrados",
                            data: data,
                            borderColor: "#003366",
                            backgroundColor: "#003366",
                            pointBackgroundColor: "#003366",
                            pointBorderColor: "#ffffff",
                            pointBorderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            fill: false,
                            tension: 0.1,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: `Registros de Usuarios - ${currentMonthName} ${currentYear}`,
                            font: {
                                size: 16,
                                weight: "bold",
                            },
                            color: "#003366",
                        },
                        legend: {
                            display: true,
                            position: "top",
                            labels: {
                                color: "#333333",
                                font: {
                                    size: 12,
                                },
                            },
                        },
                        tooltip: {
                            callbacks: {
                                title: (context) => `${context[0].label} de ${currentMonthName} ${currentYear}`,
                                label: (context) => `Usuarios registrados: ${context.parsed.y}`,
                            },
                        },
                    },
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: `Días de ${currentMonthName} ${currentYear}`,
                                color: "#666666",
                                font: {
                                    size: 12,
                                    weight: "bold",
                                },
                            },
                            grid: {
                                color: "#e0e0e0",
                            },
                            ticks: {
                                color: "#666666",
                                font: {
                                    size: 10,
                                },
                            },
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: "Cantidad de Usuarios",
                                color: "#666666",
                                font: {
                                    size: 12,
                                    weight: "bold",
                                },
                            },
                            beginAtZero: true,
                            grid: {
                                color: "#e0e0e0",
                            },
                            ticks: {
                                color: "#666666",
                                font: {
                                    size: 10,
                                },
                                stepSize: 1,
                            },
                        },
                    },
                },
            };
            const imageBuffer = await this.chartJSNodeCanvas.renderToBuffer(configuration);
            this.logger.log(`Gráfico generado exitosamente para ${currentMonthName} ${currentYear}`);
            return imageBuffer;
        }
        catch (error) {
            this.logger.error("Error al generar gráfico de registros:", error);
            return null;
        }
    }
    getMonthName(monthIndex) {
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
    async createUserStatsDocumentDefinition(userStats, user) {
        try {
            let logoData = null;
            try {
                logoData = await this.loadLogoWithRetry();
            }
            catch (error) {
                this.logger.warn("No se pudo cargar el logo:", error.message);
            }
            const styles = {
                headerSection: {
                    fontSize: 8,
                    alignment: "right",
                    color: "#666666",
                    margin: [0, 5, 0, 0],
                },
                reportTitle: {
                    fontSize: 12,
                    bold: true,
                    alignment: "center",
                    margin: [40, 5, 40, 10],
                    color: "#003366",
                },
                sectionTitle: {
                    fontSize: 11,
                    bold: true,
                    margin: [0, 10, 0, 8],
                    color: "#003366",
                },
                tableHeader: {
                    bold: true,
                    fontSize: 9,
                    color: "#FFFFFF",
                    fillColor: "#003366",
                    alignment: "center",
                    margin: [0, 3, 0, 3],
                },
                tableCellLabel: {
                    bold: true,
                    fontSize: 9,
                    color: "#000000",
                    fillColor: "#E0E0E0",
                    margin: [3, 3, 3, 3],
                },
                tableCellValue: {
                    fontSize: 9,
                    color: "#000000",
                    fillColor: "#F5F5F5",
                    margin: [3, 3, 3, 3],
                },
                metricValue: {
                    fontSize: 16,
                    bold: true,
                    color: "#27ae60",
                    alignment: "center",
                    margin: [0, 5, 0, 5],
                },
                paragraph: {
                    fontSize: 9,
                    margin: [0, 3, 0, 3],
                    alignment: "justify",
                },
                footer: {
                    fontSize: 8,
                    alignment: "center",
                    color: "#666666",
                    margin: [0, 5, 0, 0],
                },
            };
            const content = [];
            const fechaActual = new Date();
            const anioActual = fechaActual.getFullYear();
            let reportTitle = `REPORTE ESTADÍSTICO DE USUARIOS EN EL AÑO ${anioActual}`;
            content.push({
                text: reportTitle,
                style: "reportTitle",
            });
            this.addGeneralInfoTable(content, styles, user);
            this.addGeneralStatsSection(content, userStats, styles);
            this.addUsersByRoleSection(content, userStats, styles);
            let yearlyChartBuffer = null;
            try {
                yearlyChartBuffer = await this.generateYearlyRegistrationChart(userStats);
            }
            catch (error) {
                this.logger.warn("No se pudo generar el gráfico anual de usuarios:", error?.message);
            }
            if (yearlyChartBuffer) {
                content.push({
                    image: `data:image/png;base64,${yearlyChartBuffer.toString("base64")}`,
                    width: 500,
                    alignment: "center",
                    margin: [0, 10, 0, 20],
                });
            }
            this.addRegistrationsByMonthSection(content, userStats, styles);
            this.addSystemInfoSection(content, styles, user);
            return {
                content: content,
                styles: styles,
                defaultStyle: {
                    font: "Roboto",
                    fontSize: 9,
                    lineHeight: 1.2,
                },
                pageSize: "A4",
                pageMargins: [40, 80, 40, 60],
                background: function (currentPage, pageSize) {
                    if (logoData) {
                        return {
                            image: `data:image/jpeg;base64,${logoData.toString("base64")}`,
                            maxWidth: 515,
                            maxHeight: 80,
                            alignment: "center",
                            margin: [0, 20, 0, 0],
                        };
                    }
                    return '';
                },
                header: (currentPage, pageCount, pageSize) => {
                    return [];
                },
                footer: (currentPage, pageCount) => ({
                    text: `Reporte anual de usuarios - Página ${currentPage} de ${pageCount}`,
                    style: "footer",
                }),
            };
        }
        catch (error) {
            throw new Error(`Error al crear la definición del documento: ${error.message}`);
        }
    }
    addGeneralInfoTable(content, styles, user) {
        const today = new Date();
        const year = today.getFullYear();
        const currentDate = new Date().toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
        content.push({
            margin: [0, 5, 0, 15],
            table: {
                widths: ["*", "*", "*"],
                layout: {
                    hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
                    vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 1 : 0.5),
                    hLineColor: (i, node) => (i === 0 || i === node.table.body.length ? "#003366" : "#BBBBBB"),
                    vLineColor: (i, node) => (i === 0 || i === node.table.widths.length ? "#003366" : "#BBBBBB"),
                    paddingLeft: (i, node) => 6,
                    paddingRight: (i, node) => 6,
                    paddingTop: (i, node) => 3,
                    paddingBottom: (i, node) => 3,
                },
                body: [
                    [
                        { text: "Tipo de Reporte", style: "tableHeader" },
                        { text: "Generado por", style: "tableHeader" },
                        { text: "Fecha de Generación", style: "tableHeader" },
                    ],
                    [
                        { text: `Estadísticas de Usuarios en ${year}`, style: "tableCellValue" },
                        { text: "Sistema", style: "tableCellValue" },
                        { text: currentDate, style: "tableCellValue" },
                    ],
                ],
            },
        });
    }
    addGeneralStatsSection(content, userStats, styles) {
        content.push({ text: "Estadísticas Generales", style: "sectionTitle" }, {
            table: {
                widths: ["50%", "50%"],
                body: [
                    [
                        { text: "Total de Usuarios en el Año:", style: "tableCellLabel" },
                        { text: userStats.totalUsers.toString(), style: "tableCellValue" },
                    ],
                    [
                        { text: "Usuarios Registrados en el Mes:", style: "tableCellLabel" },
                        { text: userStats.usersThisMonth.toString(), style: "tableCellValue" },
                    ],
                    [
                        { text: "Usuarios Registrados Hoy:", style: "tableCellLabel" },
                        { text: userStats.usersToday.toString(), style: "tableCellValue" },
                    ],
                    [
                        { text: "Usuarios Activos:", style: "tableCellLabel" },
                        { text: userStats.activeUsers.toString(), style: "tableCellValue" },
                    ],
                    [
                        { text: "Usuarios Inactivos:", style: "tableCellLabel" },
                        { text: userStats.inactiveUsers.toString(), style: "tableCellValue" },
                    ],
                ],
            },
            layout: {
                hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
                vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 1 : 0.5),
                hLineColor: (i, node) => (i === 0 || i === node.table.body.length ? "#003366" : "#BBBBBB"),
                vLineColor: (i, node) => (i === 0 || i === node.table.widths.length ? "#003366" : "#BBBBBB"),
                paddingLeft: (i, node) => 6,
                paddingRight: (i, node) => 6,
                paddingTop: (i, node) => 3,
                paddingBottom: (i, node) => 3,
            },
            margin: [0, 5, 0, 15],
        });
    }
    addUsersByRoleSection(content, userStats, styles) {
        content.push({ text: "Distribución de Usuarios por Rol", style: "sectionTitle" });
        const roleTableBody = [
            [
                { text: "Rol", style: "tableHeader" },
                { text: "Cantidad de Usuarios", style: "tableHeader" },
                { text: "Porcentaje", style: "tableHeader" },
            ],
        ];
        userStats.usersByRole.forEach((role) => {
            const percentage = userStats.totalUsers > 0 ? ((role.userCount / userStats.totalUsers) * 100).toFixed(1) : "0";
            roleTableBody.push([
                { text: role.roleName, style: "tableCellValue" },
                { text: role.userCount.toString(), style: "tableCellValue" },
                { text: `${percentage}%`, style: "tableCellValue" },
            ]);
        });
        content.push({
            table: {
                widths: ["40%", "30%", "30%"],
                body: roleTableBody,
            },
            layout: {
                hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
                vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 1 : 0.5),
                hLineColor: (i, node) => (i === 0 || i === node.table.body.length ? "#003366" : "#BBBBBB"),
                vLineColor: (i, node) => (i === 0 || i === node.table.widths.length ? "#003366" : "#BBBBBB"),
                paddingLeft: (i, node) => 6,
                paddingRight: (i, node) => 6,
                paddingTop: (i, node) => 3,
                paddingBottom: (i, node) => 3,
            },
            margin: [0, 5, 0, 15],
        });
    }
    addRegistrationsByDaySection(content, userStats, styles) {
        if (userStats.registrationsByDay && userStats.registrationsByDay.length > 0) {
            content.push({ text: "Tabla Detallada de Registros por Día", style: "sectionTitle" });
            const dayTableBody = [
                [
                    { text: "Fecha", style: "tableHeader" },
                    { text: "Usuarios Registrados", style: "tableHeader" },
                ],
            ];
            userStats.registrationsByDay.forEach((dayData) => {
                dayTableBody.push([
                    { text: dayData.date, style: "tableCellValue" },
                    { text: dayData.count.toString(), style: "tableCellValue" },
                ]);
            });
            content.push({
                table: {
                    widths: ["60%", "40%"],
                    body: dayTableBody,
                },
                layout: {
                    hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
                    vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 1 : 0.5),
                    hLineColor: (i, node) => (i === 0 || i === node.table.body.length ? "#003366" : "#BBBBBB"),
                    vLineColor: (i, node) => (i === 0 || i === node.table.widths.length ? "#003366" : "#BBBBBB"),
                    paddingLeft: (i, node) => 6,
                    paddingRight: (i, node) => 6,
                    paddingTop: (i, node) => 3,
                    paddingBottom: (i, node) => 3,
                },
                margin: [0, 5, 0, 15],
            });
        }
    }
    addSystemInfoSection(content, styles, user) {
        const currentDate = new Date().toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
        const fechaActual = new Date();
        const anioActual = fechaActual.getFullYear();
        content.push({ text: "\n" }, { text: `Generado por: ${"Sistema de Gestión Médica"}`, style: "paragraph" }, { text: `Fecha y hora de generación: ${currentDate}`, style: "paragraph" }, { text: `Tipo de reporte: Estadísticas de Usuarios en ${anioActual}`, style: "paragraph" }, { text: "\n" }, {
            text: "Este reporte fue generado automáticamente por el sistema de gestión médica.",
            style: "paragraph",
            alignment: "center",
            color: "#666666",
        });
    }
    validateUserStats(userStats) {
        if (!userStats) {
            throw new common_1.BadRequestException("Las estadísticas de usuarios son requeridas");
        }
        if (typeof userStats.totalUsers !== "number") {
            throw new common_1.BadRequestException("El total de usuarios debe ser un número");
        }
        if (!Array.isArray(userStats.usersByRole)) {
            throw new common_1.BadRequestException("Los usuarios por rol deben ser un array");
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
                this.logger.warn(`Intento ${attempt + 1}/${this.MAX_RETRIES}: Logo no encontrado`);
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
        return null;
    }
    async generateYearlyRegistrationChart(userStats) {
        try {
            const now = new Date();
            const currentYear = now.getFullYear();
            if (!userStats.registrationsByMonth || userStats.registrationsByMonth.length === 0) {
                this.logger.warn("No hay datos de registros por mes para generar el gráfico anual");
                return null;
            }
            const monthCounts = Array.from({ length: 12 }, () => 0);
            for (const m of userStats.registrationsByMonth) {
                if (m.month >= 1 && m.month <= 12) {
                    monthCounts[m.month - 1] = Number(m.count || 0);
                }
            }
            const labels = [
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
            ];
            const data = monthCounts;
            const configuration = {
                type: "bar",
                data: {
                    labels,
                    datasets: [
                        {
                            label: "Usuarios Registrados",
                            data,
                            backgroundColor: "#003366",
                            borderColor: "#003366",
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: `Registros de Usuarios en el ${currentYear}`,
                            font: { size: 14, weight: "bold" },
                            color: "#003366",
                        },
                        legend: {
                            display: true,
                            position: "top",
                            labels: { color: "#333333", font: { size: 12 } },
                        },
                        tooltip: {
                            callbacks: {
                                title: (ctx) => `${ctx[0].label} ${currentYear}`,
                                label: (ctx) => `Usuarios registrados: ${ctx.parsed.y}`,
                            },
                        },
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: `Meses del Año ${currentYear}`,
                                color: "#666666",
                                font: { size: 12, weight: "bold" },
                            },
                            grid: { color: "#e0e0e0" },
                            ticks: { color: "#666666", font: { size: 10 } },
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: "Cantidad de Usuarios",
                                color: "#666666",
                                font: { size: 12, weight: "bold" },
                            },
                            grid: { color: "#e0e0e0" },
                            ticks: { color: "#666666", font: { size: 10 }, stepSize: 1 },
                        },
                    },
                },
            };
            const imageBuffer = await this.chartJSNodeCanvas.renderToBuffer(configuration);
            this.logger.log(`Gráfico anual de usuarios generado exitosamente para el año ${currentYear}`);
            return imageBuffer;
        }
        catch (error) {
            this.logger.error("Error al generar gráfico de registros anual de usuarios:", error);
            return null;
        }
    }
    addRegistrationsByMonthSection(content, userStats, styles) {
        if (!userStats.registrationsByMonth || userStats.registrationsByMonth.length === 0) {
            this.logger.warn("No hay datos de registros por mes para construir la tabla");
            return;
        }
        const now = new Date();
        const currentYear = now.getFullYear();
        content.push({ text: `Tabla Detallada de Registros por Mes en el ${currentYear}`, style: "sectionTitle" });
        const tableBody = [
            [
                { text: "Mes", style: "tableHeader" },
                { text: "Usuarios Registrados", style: "tableHeader" },
                { text: "Porcentaje", style: "tableHeader" },
            ],
        ];
        const byMonth = new Map();
        for (const m of userStats.registrationsByMonth) {
            byMonth.set(Number(m.month), Number(m.count || 0));
        }
        for (let month = 1; month <= 12; month++) {
            const count = byMonth.get(month) ?? 0;
            const monthName = this.getMonthName(month - 1);
            const percentage = userStats.totalUsers > 0 ? ((count / userStats.totalUsers) * 100).toFixed(1) : "0";
            tableBody.push([
                { text: monthName, style: "tableCellValue" },
                { text: count.toString(), style: "tableCellValue" },
                { text: `${percentage}%`, style: "tableCellValue" },
            ]);
        }
        content.push({
            table: {
                widths: ["40%", "30%", "30%"],
                body: tableBody,
            },
            layout: {
                hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
                vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 1 : 0.5),
                hLineColor: (i, node) => (i === 0 || i === node.table.body.length ? "#003366" : "#BBBBBB"),
                vLineColor: (i, node) => (i === 0 || i === node.table.widths.length ? "#003366" : "#BBBBBB"),
                paddingLeft: (i, node) => 6,
                paddingRight: (i, node) => 6,
                paddingTop: (i, node) => 3,
                paddingBottom: (i, node) => 3,
            },
            margin: [0, 5, 0, 15],
        });
    }
};
exports.PdfDashboardService = PdfDashboardService;
exports.PdfDashboardService = PdfDashboardService = PdfDashboardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PdfDashboardService);
//# sourceMappingURL=pdf-dasboard.service.js.map