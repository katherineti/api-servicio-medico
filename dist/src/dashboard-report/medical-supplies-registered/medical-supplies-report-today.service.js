"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MedicalSuppliesReportTodayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalSuppliesReportTodayService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../db/schema");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const dashboard_report_service_1 = require("../dashboard-report.service");
const constants_1 = require("../../constants");
const medical_supplies_service_1 = require("../../medical-supplies/medical-supplies.service");
let MedicalSuppliesReportTodayService = MedicalSuppliesReportTodayService_1 = class MedicalSuppliesReportTodayService {
    constructor(db, dashboardReportService, medicalSuppliesService) {
        this.db = db;
        this.dashboardReportService = dashboardReportService;
        this.medicalSuppliesService = medicalSuppliesService;
        this.logger = new common_1.Logger(MedicalSuppliesReportTodayService_1.name);
    }
    async generatePdf(reportData, res) {
        try {
            this.logger.log(`Generando PDF para el reporte de inventario almacén: ${reportData.title}`);
            const medicalSupplyStats = await this.getCompleteMedicalSupplyStats();
            const extendedReportData = {
                ...reportData,
                role: "Sistema",
                additionalInfo: {
                    "Total de inventario almacén:": medicalSupplyStats.totalProducts,
                    "Generado por:": reportData.additionalInfo?.generatedBy || "Sistema",
                    "Fecha:": new Date().toISOString(),
                    reportType: "Inventario almacén",
                },
            };
            await this.dashboardReportService.generatePdf(extendedReportData, res);
            this.logger.log(`PDF de inventario almacén de hoy generado exitosamente`);
        }
        catch (error) {
            this.logger.error(`Error al generar PDF de inventario almacén de hoy:`, error);
            if (res.headersSent) {
                return;
            }
            res.status(500).json({
                statusCode: 500,
                message: `Error al generar PDF: ${error.message || "Error desconocido"}`,
            });
        }
    }
    async generateCustomMedicalSuppliesPdf(reportData, res) {
        try {
            this.logger.log(`Generando PDF personalizado para inventario almacén(hoy): ${reportData.title}`);
            const medicalSupplyStats = await this.getCompleteMedicalSupplyStats();
            const docDefinition = await this.createCustomMedicalSuppliesDocumentDefinition(reportData, medicalSupplyStats);
            const PdfPrinter = require("pdfmake");
            const fonts = {
                Roboto: {
                    normal: "Helvetica",
                    bold: "Helvetica-Bold",
                    italics: "Helvetica-Oblique",
                    bolditalics: "Helvetica-BoldOblique",
                },
            };
            const printer = new PdfPrinter(fonts);
            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            pdfDoc.on("error", (error) => {
                this.logger.error(`Error durante la generación del PDF: ${error.message}`);
                if (!res.headersSent) {
                    res.status(500).json({
                        statusCode: 500,
                        message: `Error al generar PDF: ${error.message}`,
                    });
                }
            });
            pdfDoc.pipe(res);
            pdfDoc.end();
            this.logger.log(`PDF personalizado de inventario almacén(hoy) generado exitosamente`);
        }
        catch (error) {
            this.logger.error(`Error al generar PDF personalizado:`, error);
            if (res.headersSent) {
                return;
            }
            res.status(500).json({
                statusCode: 500,
                message: `Error al generar PDF: ${error.message || "Error desconocido"}`,
            });
        }
    }
    async getCompleteMedicalSupplyStats() {
        try {
            const now = new Date();
            const nowUtc = new Date(now.toISOString());
            const currentYear = nowUtc.getUTCFullYear();
            const currentMonth = nowUtc.getUTCMonth();
            const startOfYear = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0));
            const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));
            const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0, 0));
            const endOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999));
            const startOfDay = new Date(Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), nowUtc.getUTCDate(), 0, 0, 0, 0));
            const endOfDay = new Date(Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), nowUtc.getUTCDate(), 23, 59, 59, 999));
            const [generalStats] = await this.db
                .select({
                totalProducts: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.productsTable.createdAt} >= ${startOfYear} AND ${schema_1.productsTable.createdAt} <= ${endOfYear} THEN 1 ELSE NULL END)`,
                productsToday: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.productsTable.createdAt} >= ${startOfDay} AND ${schema_1.productsTable.createdAt} <= ${endOfDay} THEN 1 ELSE NULL END)`,
            })
                .from(schema_1.productsTable)
                .where((0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4]));
            console.log("REGISTROS GENERALES ", generalStats);
            const productsByCategoryResult = await this.db
                .select({
                categoryId: schema_1.categoriesTable.id,
                categoryName: schema_1.categoriesTable.name,
                productCount: (0, drizzle_orm_1.count)(schema_1.productsTable.id),
            })
                .from(schema_1.categoriesTable)
                .innerJoin(schema_1.productsTable, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.productsTable.categoryId, schema_1.categoriesTable.id), (0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.productsTable.createdAt, startOfDay), (0, drizzle_orm_1.lte)(schema_1.productsTable.createdAt, endOfDay)), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4])))
                .where((0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4]))
                .groupBy(schema_1.categoriesTable.id, schema_1.categoriesTable.name)
                .orderBy(schema_1.categoriesTable.id);
            const productsByStatusResult = await this.db
                .select({
                statusId: schema_1.productStatusTable.id,
                statusName: schema_1.productStatusTable.status,
                productCount: (0, drizzle_orm_1.count)(schema_1.productsTable.id),
            })
                .from(schema_1.productStatusTable)
                .innerJoin(schema_1.productsTable, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.productsTable.statusId, schema_1.productStatusTable.id), (0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.productsTable.createdAt, startOfDay), (0, drizzle_orm_1.lte)(schema_1.productsTable.createdAt, endOfDay)), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4])))
                .where((0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4]))
                .groupBy(schema_1.productStatusTable.id, schema_1.productStatusTable.status)
                .orderBy(schema_1.productStatusTable.id);
            const productsByTypeResult = await this.db
                .select({
                typeId: schema_1.typesOfProductsTable.id,
                typeName: schema_1.typesOfProductsTable.type,
                productCount: (0, drizzle_orm_1.count)(schema_1.productsTable.id),
            })
                .from(schema_1.typesOfProductsTable)
                .innerJoin(schema_1.productsTable, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.productsTable.type, schema_1.typesOfProductsTable.id), (0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.productsTable.createdAt, startOfDay), (0, drizzle_orm_1.lte)(schema_1.productsTable.createdAt, endOfDay)), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4])))
                .where((0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4]))
                .groupBy(schema_1.typesOfProductsTable.id, schema_1.typesOfProductsTable.type)
                .orderBy(schema_1.typesOfProductsTable.id);
            const registrationsByDayResult = await this.db
                .select({
                createdAt: schema_1.productsTable.createdAt,
                productCount: (0, drizzle_orm_1.count)(),
            })
                .from(schema_1.productsTable)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.productsTable.createdAt, startOfDay), (0, drizzle_orm_1.lte)(schema_1.productsTable.createdAt, endOfDay), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4])))
                .groupBy(schema_1.productsTable.createdAt)
                .orderBy(schema_1.productsTable.createdAt);
            const todayProductsResult = await this.db
                .select({
                id: schema_1.productsTable.id,
                code: schema_1.productsTable.code,
                name: schema_1.productsTable.name,
                stock: schema_1.productsTable.stock,
                description: schema_1.productsTable.description,
                categoryName: schema_1.categoriesTable.name,
                statusName: schema_1.productStatusTable.status,
                typeName: schema_1.typesOfProductsTable.type,
                providerName: schema_1.providersTable.name,
                expirationDate: schema_1.productsTable.expirationDate,
                createdAt: schema_1.productsTable.createdAt,
            })
                .from(schema_1.productsTable)
                .innerJoin(schema_1.categoriesTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.categoryId, schema_1.categoriesTable.id))
                .innerJoin(schema_1.productStatusTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.statusId, schema_1.productStatusTable.id))
                .innerJoin(schema_1.typesOfProductsTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.type, schema_1.typesOfProductsTable.id))
                .innerJoin(schema_1.providersTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.providerId, schema_1.providersTable.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.productsTable.createdAt, startOfDay), (0, drizzle_orm_1.lte)(schema_1.productsTable.createdAt, endOfDay), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4])))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.productsTable.createdAt));
            const productsByCategory = productsByCategoryResult.map((row) => ({
                categoryId: row.categoryId,
                categoryName: this.dashboardReportService.capitalizeFirstLetter(row.categoryName),
                productCount: Number(row.productCount),
            }));
            const productsByStatus = productsByStatusResult.map((row) => ({
                statusId: row.statusId,
                statusName: this.dashboardReportService.capitalizeFirstLetter(row.statusName),
                productCount: Number(row.productCount),
            }));
            const productsByType = productsByTypeResult.map((row) => ({
                typeId: row.typeId,
                typeName: this.dashboardReportService.capitalizeFirstLetter(row.typeName),
                productCount: Number(row.productCount),
            }));
            const registrationsByDay = [];
            const dayMap = new Map();
            registrationsByDayResult.forEach((row) => {
                const date = new Date(row.createdAt).toISOString().split("T")[0];
                const day = new Date(row.createdAt).getUTCDate();
                const currentCount = dayMap.get(date) || 0;
                dayMap.set(date, currentCount + Number(row.productCount));
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
            const completeStats = {
                totalProducts: Number(generalStats.totalProducts),
                productsToday: Number((await this.medicalSuppliesService.totalProductsOfTheDay()).count),
                productsByCategory,
                productsByStatus,
                productsByType,
                registrationsByDay,
                todayProducts: todayProductsResult,
            };
            this.logger.log("Estadísticas completas de inventario almacén(hoy):", JSON.stringify(completeStats, null, 2));
            return completeStats;
        }
        catch (error) {
            this.logger.error("Error al obtener estadísticas de inventario almacén(hoy):", error);
            throw new Error("Error al obtener estadísticas completas de inventario almacén(hoy)");
        }
    }
    async createCustomMedicalSuppliesDocumentDefinition(reportData, medicalSupplyStats) {
        try {
            let logoData = null;
            try {
                logoData = await this.dashboardReportService.loadLogoWithRetry();
            }
            catch (error) {
                this.logger.warn("No se pudo cargar el logo:", error.message);
            }
            const styles = {
                headerSection: {
                    fontSize: 10,
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
            let reportTitle = "REPORTE ESTADÍSTICO DEL INVENTARIO ALMACÉN REGISTRADO HOY";
            content.push({
                text: reportTitle,
                style: "reportTitle",
            });
            this.addGeneralInfoTable(content, reportData, styles);
            this.addGeneralStatsSection(content, medicalSupplyStats, styles);
            this.addTodayProductsSection(content, medicalSupplyStats, styles);
            this.addProductsByCategorySection(content, medicalSupplyStats, styles);
            this.addProductsByStatusSection(content, medicalSupplyStats, styles);
            this.addSystemInfoSection(content, reportData, styles);
            return {
                content: content,
                styles: styles,
                defaultStyle: {
                    font: "Roboto",
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
                    text: `Reporte de inventario almacén(hoy) - Página ${currentPage} de ${pageCount}`,
                    style: "footer",
                }),
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
                        { text: "Fecha del Reporte", style: "tableHeader" },
                        { text: "Fecha de Generación", style: "tableHeader" },
                    ],
                    [
                        { text: this.dashboardReportService.getValidContent(reportData.type), style: "tableCellValue" },
                        { text: this.dashboardReportService.formatDate(reportData.date), style: "tableCellValue" },
                        { text: this.dashboardReportService.formatDate(new Date().toISOString()), style: "tableCellValue" },
                    ],
                ],
            },
        });
    }
    addGeneralStatsSection(content, medicalSupplyStats, styles) {
        content.push({ text: "Estadísticas Generales del Inventario Almacén (Disponibles, No Disponibles, Pròximos a vencer, Caducados)", style: "sectionTitle" }, {
            table: {
                widths: ["50%", "50%"],
                body: [
                    [
                        { text: "Registros de Inventario almacén en el Año:", style: "tableCellLabel" },
                        { text: medicalSupplyStats.totalProducts.toString(), style: "tableCellValue" },
                    ],
                    [
                        { text: "Registros de Hoy:", style: "tableCellLabel" },
                        { text: medicalSupplyStats.productsToday.toString(), style: "metricValue" },
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
    addTodayRegistrationsChart(content, medicalSupplyStats, styles) {
        const today = new Date();
        const todayFormatted = today.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
        content.push({
            text: `Cantidad de Registros de Usuarios – ${todayFormatted}`,
            style: "chartTitle",
            margin: [0, 0, 0, 20],
            alignment: "center",
            fontSize: 16,
            bold: true,
        });
        const chartHeight = 200;
        const chartWidth = 300;
        const barWidth = 80;
        const maxValue = Math.max(medicalSupplyStats.productsToday, 5);
        const maxBarDrawableHeight = 150;
        const barHeight = (medicalSupplyStats.productsToday / maxValue) * maxBarDrawableHeight;
        const chartStartX = 100;
        const chartStartY = 50;
        const chartEndX = chartStartX + chartWidth;
        const chartEndY = chartStartY + chartHeight;
        content.push({
            canvas: [
                {
                    type: "line",
                    x1: chartStartX,
                    y1: chartStartY,
                    x2: chartStartX,
                    y2: chartEndY - 30,
                    lineWidth: 1,
                    lineColor: "#000000",
                },
                {
                    type: "line",
                    x1: chartStartX,
                    y1: chartEndY - 30,
                    x2: chartEndX,
                    y2: chartEndY - 30,
                    lineWidth: 1,
                    lineColor: "#000000",
                },
                {
                    type: "rect",
                    x: chartStartX + (chartWidth / 2) - (barWidth / 2),
                    y: (chartEndY - 30) - barHeight,
                    w: barWidth,
                    h: barHeight,
                    color: "#4A90E2",
                    lineColor: "#3A73B6",
                    lineWidth: 1,
                },
                {
                    text: medicalSupplyStats.productsToday.toString(),
                    x: chartStartX + (chartWidth / 2) - (barWidth / 2) + (barWidth / 2),
                    y: (chartEndY - 30) - barHeight - 15,
                    fontSize: 14,
                    bold: true,
                    color: "#000000",
                    alignment: "center",
                },
            ],
            margin: [0, 10, 0, 10],
        });
        content.push({
            columns: [
                {
                    width: chartStartX - 10,
                    stack: [
                        {
                            text: "Cantidad de Registros",
                            fontSize: 12,
                            bold: true,
                            color: "#000000",
                            alignment: "center",
                            margin: [0, (chartHeight / 2) - 10, 0, 0],
                        },
                    ],
                },
                {
                    width: chartWidth,
                    stack: [
                        {
                            text: todayFormatted,
                            alignment: "center",
                            fontSize: 12,
                            bold: true,
                            margin: [0, chartHeight - 20, 0, 0],
                        },
                    ],
                },
                { width: "*", text: "" },
            ],
            margin: [0, -chartHeight - 10, 0, 0],
        });
        content.push({
            table: {
                widths: ["*"],
                body: [
                    [
                        {
                            stack: [
                                {
                                    text: "Resumen del Gráfico",
                                    fontSize: 11,
                                    bold: true,
                                    color: "#003366",
                                    alignment: "center",
                                    margin: [0, 0, 0, 5],
                                },
                                {
                                    text: `• Eje X (Horizontal): Fecha actual (${todayFormatted})`,
                                    fontSize: 10,
                                    margin: [10, 2, 10, 2],
                                },
                                {
                                    text: `• Eje Y (Vertical): Cantidad de registros de inventario almacén`,
                                    fontSize: 10,
                                    margin: [10, 2, 10, 2],
                                },
                                {
                                    text: `• Total de inventario almacén registrados hoy: ${medicalSupplyStats.productsToday}`,
                                    fontSize: 10,
                                    bold: true,
                                    color: "#4A90E2",
                                    margin: [10, 2, 10, 0],
                                },
                            ],
                            fillColor: "#F8F9FA",
                            margin: [10, 8, 10, 8],
                        },
                    ],
                ],
            },
            layout: {
                hLineWidth: () => 1,
                vLineWidth: () => 1,
                hLineColor: () => "#DEE2E6",
                vLineColor: () => "#DEE2E6",
                paddingLeft: () => 0,
                paddingRight: () => 0,
                paddingTop: () => 0,
                paddingBottom: () => 0,
            },
            margin: [0, 20, 0, 20],
        });
    }
    addTodayProductsSection(content, medicalSupplyStats, styles) {
        if (medicalSupplyStats.todayProducts && medicalSupplyStats.todayProducts.length > 0) {
            content.push({ text: "Inventario Almacén Registrado Hoy - Detalle", style: "sectionTitle" });
            const productTableBody = [
                [
                    { text: "Código", style: "tableHeader" },
                    { text: "Nombre", style: "tableHeader" },
                    { text: "Categoría", style: "tableHeader" },
                    { text: "Estado", style: "tableHeader" },
                    { text: "Stock", style: "tableHeader" },
                    { text: "Proveedor", style: "tableHeader" },
                ],
            ];
            medicalSupplyStats.todayProducts.forEach((product) => {
                productTableBody.push([
                    { text: this.dashboardReportService.getValidContent(product.code), style: "tableCellValue" },
                    { text: this.dashboardReportService.getValidContent(product.name), style: "tableCellValue" },
                    { text: this.dashboardReportService.getValidContent(product.categoryName), style: "tableCellValue" },
                    { text: this.dashboardReportService.getValidContent(product.statusName), style: "tableCellValue" },
                    { text: this.dashboardReportService.getValidContent(product.stock), style: "tableCellValue" },
                    { text: this.dashboardReportService.getValidContent(product.providerName), style: "tableCellValue" },
                ]);
            });
            content.push({
                table: {
                    widths: ["15%", "25%", "15%", "15%", "10%", "20%"],
                    body: productTableBody,
                },
                layout: {
                    hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
                    vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 1 : 0.5),
                    hLineColor: (i, node) => (i === 0 || i === node.table.body.length ? "#003366" : "#BBBBBB"),
                    vLineColor: (i, node) => (i === 0 || i === node.table.widths.length ? "#003366" : "#BBBBBB"),
                    paddingLeft: (i, node) => 5,
                    paddingRight: (i, node) => 5,
                    paddingTop: (i, node) => 3,
                    paddingBottom: (i, node) => 3,
                },
                margin: [0, 10, 0, 20],
            });
        }
        else {
            content.push({ text: "Inventario Almacén Registrado Hoy - Detalle", style: "sectionTitle" }, {
                text: "No se registró inventario almacén nuevo el día de hoy.",
                style: "paragraph",
                alignment: "center",
                color: "#666666",
                margin: [0, 10, 0, 20],
            });
        }
    }
    addProductsByCategorySection(content, medicalSupplyStats, styles) {
        if (medicalSupplyStats.productsByCategory && medicalSupplyStats.productsByCategory.length > 0) {
            content.push({ text: "Distribución por Categoría", style: "sectionTitle" });
            const categoryTableBody = [
                [
                    { text: "Categoría", style: "tableHeader" },
                    { text: "Cantidad de Inventario Almacén(Hoy)", style: "tableHeader" },
                    { text: "Porcentaje", style: "tableHeader" },
                ],
            ];
            medicalSupplyStats.productsByCategory.forEach((category) => {
                const percentage = medicalSupplyStats.productsToday > 0
                    ? ((category.productCount / medicalSupplyStats.productsToday) * 100).toFixed(1)
                    : "0";
                categoryTableBody.push([
                    { text: category.categoryName, style: "tableCellValue" },
                    { text: category.productCount.toString(), style: "tableCellValue" },
                    { text: `${percentage}%`, style: "tableCellValue" },
                ]);
            });
            content.push({
                table: {
                    widths: ["50%", "25%", "25%"],
                    body: categoryTableBody,
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
        else {
            content.push({ text: "Distribución por Categoría", style: "sectionTitle" }, {
                text: "No se registró inventario almacén nuevo el día de hoy.",
                style: "paragraph",
                alignment: "center",
                color: "#666666",
                margin: [0, 10, 0, 20],
            });
        }
    }
    addProductsByStatusSection(content, medicalSupplyStats, styles) {
        if (medicalSupplyStats.productsByStatus && medicalSupplyStats.productsByStatus.length > 0) {
            content.push({ text: "Distribución por Estado", style: "sectionTitle" });
            const statusTableBody = [
                [
                    { text: "Estado", style: "tableHeader" },
                    { text: "Cantidad de Inventario Almacén(Hoy)", style: "tableHeader" },
                    { text: "Porcentaje", style: "tableHeader" },
                ],
            ];
            medicalSupplyStats.productsByStatus.forEach((status) => {
                const percentage = medicalSupplyStats.productsToday > 0
                    ? ((status.productCount / medicalSupplyStats.productsToday) * 100).toFixed(1)
                    : "0";
                statusTableBody.push([
                    { text: status.statusName, style: "tableCellValue" },
                    { text: status.productCount.toString(), style: "tableCellValue" },
                    { text: `${percentage}%`, style: "tableCellValue" },
                ]);
            });
            content.push({
                table: {
                    widths: ["50%", "25%", "25%"],
                    body: statusTableBody,
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
        else {
            content.push({ text: "Distribución por Estado", style: "sectionTitle" }, {
                text: "No se registró inventario almacén nuevo el día de hoy.",
                style: "paragraph",
                alignment: "center",
                color: "#666666",
                margin: [0, 10, 0, 20],
            });
        }
    }
    addSystemInfoSection(content, reportData, styles) {
        const currentDate = new Date().toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
        content.push({ text: "\n" }, { text: `Generado por: Sistema de Gestión Médica`, style: "paragraph" }, { text: `Fecha y hora de generación: ${currentDate}`, style: "paragraph" }, { text: `Tipo de reporte: ${reportData.type}`, style: "paragraph" }, { text: "\n" }, {
            text: "Este reporte fue generado automáticamente por el sistema de gestión de inventario médico.",
            style: "paragraph",
            alignment: "center",
            color: "#666666",
        });
    }
};
exports.MedicalSuppliesReportTodayService = MedicalSuppliesReportTodayService;
exports.MedicalSuppliesReportTodayService = MedicalSuppliesReportTodayService = MedicalSuppliesReportTodayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => dashboard_report_service_1.DashboardReportService))),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase,
        dashboard_report_service_1.DashboardReportService,
        medical_supplies_service_1.MedicalSuppliesService])
], MedicalSuppliesReportTodayService);
//# sourceMappingURL=medical-supplies-report-today.service.js.map