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
var MedicalSuppliesReportAllService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalSuppliesReportAllService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../db/schema");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const constants_1 = require("../../constants");
const dashboard_report_service_1 = require("../dashboard-report.service");
const chartjs_node_canvas_1 = require("chartjs-node-canvas");
let MedicalSuppliesReportAllService = MedicalSuppliesReportAllService_1 = class MedicalSuppliesReportAllService {
    constructor(db, dashboardReportService) {
        this.db = db;
        this.dashboardReportService = dashboardReportService;
        this.logger = new common_1.Logger(MedicalSuppliesReportAllService_1.name);
        this.chartJSNodeCanvas = new chartjs_node_canvas_1.ChartJSNodeCanvas({
            width: 600,
            height: 400,
            backgroundColour: "white",
            chartCallback: (ChartJS) => {
                ChartJS.defaults.responsive = true;
                ChartJS.defaults.maintainAspectRatio = false;
            },
        });
    }
    async generatePdf(reportData, res) {
        try {
            this.logger.log(`Generando PDF para el reporte de inventario almacén: ${reportData.title}`);
            const medicalSupplyStats = await this.getCompleteMedicalSupplyStats();
            const extendedReportData = {
                ...reportData,
                role: "Sistema",
                additionalInfo: {
                    "Total de inventario almacén:": medicalSupplyStats.productsYear,
                    "Generado por:": reportData.additionalInfo?.generatedBy || "Sistema",
                    "Fecha:": new Date().toISOString(),
                    reportType: "Inventario almacén",
                },
            };
            await this.dashboardReportService.generatePdf(extendedReportData, res);
            this.logger.log(`PDF de inventario almacén del anio generado exitosamente`);
        }
        catch (error) {
            this.logger.error(`Error al generar PDF de inventario almacén del anio:`, error);
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
            this.logger.log(`Generando PDF personalizado para inventario almacén(anio): ${reportData.title}`);
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
            this.logger.log(`PDF personalizado de inventario almacén(anio) generado exitosamente`);
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
            const startOfDay = new Date(Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), nowUtc.getUTCDate(), 0, 0, 0, 0));
            const endOfDay = new Date(Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), nowUtc.getUTCDate(), 23, 59, 59, 999));
            const currentYear = nowUtc.getUTCFullYear();
            const currentMonth = nowUtc.getUTCMonth();
            const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0, 0));
            const endOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999));
            const startOfYear = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0));
            const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));
            const [generalStats] = await this.db
                .select({
                totalProducts: (0, drizzle_orm_1.count)(),
                productsYear: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.productsTable.createdAt} >= ${startOfYear} AND ${schema_1.productsTable.createdAt} <= ${endOfYear} THEN 1 ELSE NULL END)`,
                productsMonth: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.productsTable.createdAt} >= ${startOfMonth} AND ${schema_1.productsTable.createdAt} <= ${endOfMonth} THEN 1 ELSE NULL END)`,
                productsDay: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.productsTable.createdAt} >= ${startOfDay} AND ${schema_1.productsTable.createdAt} <= ${endOfDay} THEN 1 ELSE NULL END)`,
            })
                .from(schema_1.productsTable)
                .where((0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4]));
            const productsByCategoryResult = await this.db
                .select({
                categoryId: schema_1.categoriesTable.id,
                categoryName: schema_1.categoriesTable.name,
                productCount: (0, drizzle_orm_1.count)(schema_1.productsTable.id),
            })
                .from(schema_1.categoriesTable)
                .innerJoin(schema_1.productsTable, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.productsTable.categoryId, schema_1.categoriesTable.id), (0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.productsTable.createdAt, startOfYear), (0, drizzle_orm_1.lte)(schema_1.productsTable.createdAt, endOfYear)), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4])))
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
                .innerJoin(schema_1.productsTable, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.productsTable.statusId, schema_1.productStatusTable.id), (0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.productsTable.createdAt, startOfYear), (0, drizzle_orm_1.lte)(schema_1.productsTable.createdAt, endOfYear)), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4])))
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
                .innerJoin(schema_1.productsTable, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.productsTable.type, schema_1.typesOfProductsTable.id), (0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.productsTable.createdAt, startOfYear), (0, drizzle_orm_1.lte)(schema_1.productsTable.createdAt, endOfYear)), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4])))
                .where((0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4]))
                .groupBy(schema_1.typesOfProductsTable.id, schema_1.typesOfProductsTable.type)
                .orderBy(schema_1.typesOfProductsTable.id);
            const registrationsByDayResult = await this.db
                .select({
                createdAt: schema_1.productsTable.createdAt,
                productCount: (0, drizzle_orm_1.count)(),
            })
                .from(schema_1.productsTable)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4]), (0, drizzle_orm_1.gte)(schema_1.productsTable.createdAt, startOfYear), (0, drizzle_orm_1.lte)(schema_1.productsTable.createdAt, endOfYear)))
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
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4]), (0, drizzle_orm_1.gte)(schema_1.productsTable.createdAt, startOfYear), (0, drizzle_orm_1.lte)(schema_1.productsTable.createdAt, endOfYear)))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.productsTable.name));
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
            const registrationsByMonthResult = await this.db
                .select({
                month: (0, drizzle_orm_1.sql) `EXTRACT(MONTH FROM ${schema_1.productsTable.createdAt})`,
                medicalSuppliesCount: (0, drizzle_orm_1.count)(),
            })
                .from(schema_1.productsTable)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4]), (0, drizzle_orm_1.gte)(schema_1.productsTable.createdAt, startOfYear), (0, drizzle_orm_1.lte)(schema_1.productsTable.createdAt, endOfYear)))
                .groupBy((0, drizzle_orm_1.sql) `EXTRACT(MONTH FROM ${schema_1.productsTable.createdAt})`)
                .orderBy((0, drizzle_orm_1.sql) `EXTRACT(MONTH FROM ${schema_1.productsTable.createdAt})`);
            const monthsEs = [
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
            ];
            const monthCounts = Array.from({ length: 12 }, () => 0);
            registrationsByMonthResult.forEach((row) => {
                const m = Number(row.month);
                if (m >= 1 && m <= 12) {
                    monthCounts[m - 1] = Number(row.medicalSuppliesCount);
                }
            });
            const registrationsByMonth = monthCounts.map((count, idx) => ({
                month: idx + 1,
                label: monthsEs[idx],
                count,
            }));
            const completeStats = {
                totalProducts: Number(generalStats.totalProducts),
                productsMonth: Number(generalStats.productsMonth),
                productsDay: Number(generalStats.productsDay),
                productsYear: Number(generalStats.productsYear),
                productsByCategory,
                productsByStatus,
                productsByType,
                registrationsByDay,
                todayProducts: todayProductsResult,
                registrationsByMonth
            };
            this.logger.log("Estadísticas completas de inventario almacén(anio):", JSON.stringify(completeStats, null, 2));
            return completeStats;
        }
        catch (error) {
            this.logger.error("Error al obtener estadísticas de inventario almacén(anio):", error);
            throw new Error("Error al obtener estadísticas completas de inventario almacén(anio)");
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
            const fechaActual = new Date();
            const anioActual = fechaActual.getFullYear();
            let reportTitle = `REPORTE ESTADÍSTICO DEL INVENTARIO ALMACÉN REGISTRADO EN EL AÑO ${anioActual}`;
            content.push({
                text: reportTitle,
                style: "reportTitle",
            });
            this.addGeneralInfoTable(content, reportData, styles);
            this.addGeneralStatsSection(content, medicalSupplyStats, styles);
            this.addTodayProductsSection(content, medicalSupplyStats, styles);
            this.addProductsByCategorySection(content, medicalSupplyStats, styles);
            this.addProductsByStatusSection(content, medicalSupplyStats, styles);
            this.addProductsByTypeSection(content, medicalSupplyStats, styles);
            let yearlyChartBuffer = null;
            try {
                yearlyChartBuffer = await this.generateYearlyRegistrationChart(medicalSupplyStats);
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
            this.addRegistrationsByMonthSection(content, medicalSupplyStats, styles);
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
                    text: `Reporte anual del inventario almacén - Página ${currentPage} de ${pageCount}`,
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
                        { text: "Todos los Registros de Inventario almacén:", style: "tableCellLabel" },
                        { text: medicalSupplyStats.totalProducts.toString(), style: "tableCellValue" },
                    ],
                    [
                        { text: "Registros del Año:", style: "tableCellLabel" },
                        { text: medicalSupplyStats.productsYear.toString(), style: "metricValue" },
                    ],
                    [
                        { text: "Registros del Mes:", style: "tableCellLabel" },
                        { text: medicalSupplyStats.productsMonth.toString(), style: "tableCellValue" },
                    ],
                    [
                        { text: "Registros de Hoy:", style: "tableCellLabel" },
                        { text: medicalSupplyStats.productsDay.toString(), style: "tableCellValue" },
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
    addTodayProductsSection(content, medicalSupplyStats, styles) {
        if (medicalSupplyStats.todayProducts && medicalSupplyStats.todayProducts.length > 0) {
            content.push({ text: "Inventario Almacén Registrado en el Año - Detalle (" + medicalSupplyStats.todayProducts.length + ")", style: "sectionTitle" });
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
            content.push({ text: "Inventario Almacén Registrado en el año", style: "sectionTitle" }, {
                text: "No se registró inventario almacén en el año",
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
                    { text: "Cantidad de Inventario Almacén(Año)", style: "tableHeader" },
                    { text: "Porcentaje", style: "tableHeader" },
                ],
            ];
            medicalSupplyStats.productsByCategory.forEach((category) => {
                console.log("category.productCount  ", category.productCount);
                console.log("category.productsMonth  ", medicalSupplyStats.productsMonth);
                const percentage = medicalSupplyStats.productsYear > 0
                    ? ((category.productCount / medicalSupplyStats.productsYear) * 100).toFixed(1)
                    : "0";
                console.log("medicalSupplyStats.productsYear ", medicalSupplyStats.productsYear);
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
                text: "No se registró inventario almacén en el año",
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
                    { text: "Cantidad de Inventario Almacén(Año)", style: "tableHeader" },
                    { text: "Porcentaje", style: "tableHeader" },
                ],
            ];
            medicalSupplyStats.productsByStatus.forEach((status) => {
                const percentage = medicalSupplyStats.productsYear > 0
                    ? ((status.productCount / medicalSupplyStats.productsYear) * 100).toFixed(1)
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
                text: "No se registró inventario almacén en el año",
                style: "paragraph",
                alignment: "center",
                color: "#666666",
                margin: [0, 10, 0, 20],
            });
        }
    }
    addProductsByTypeSection(content, medicalSupply, styles) {
        if (medicalSupply.productsByStatus && medicalSupply.productsByStatus.length > 0) {
            content.push({ text: "Distribución por Tipo", style: "sectionTitle" });
            const statusTableBody = [
                [
                    { text: "Tipo", style: "tableHeader" },
                    { text: "Cantidad de Inventario Almacén(Año)", style: "tableHeader" },
                    { text: "Porcentaje", style: "tableHeader" },
                ],
            ];
            medicalSupply.productsByType.forEach((type) => {
                console.log("Distribución por Tipo. " + "type.productCount, medicalSupply.productsYear; ", type.productCount, ",", medicalSupply.productsYear);
                const percentage = medicalSupply.productsYear > 0
                    ? ((type.productCount / medicalSupply.productsYear) * 100).toFixed(1)
                    : "0";
                statusTableBody.push([
                    { text: type.typeName, style: "tableCellValue" },
                    { text: type.productCount.toString(), style: "tableCellValue" },
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
            content.push({ text: "Distribución por Tipo", style: "sectionTitle" }, {
                text: "No se registró inventario almacén en el año",
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
    async generateYearlyRegistrationChart(medicalSupplyStats) {
        try {
            const now = new Date();
            const currentYear = now.getFullYear();
            if (!medicalSupplyStats.registrationsByMonth || medicalSupplyStats.registrationsByMonth.length === 0) {
                this.logger.warn("No hay datos de registros por mes para generar el gráfico anual");
                return null;
            }
            const monthCounts = Array.from({ length: 12 }, () => 0);
            for (const m of medicalSupplyStats.registrationsByMonth) {
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
                            label: "Inventario Almacén Registrado",
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
                            text: `Registros de Inventario Almacén en el ${currentYear}`,
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
                                label: (ctx) => `Inventario almacén registrado: ${ctx.parsed.y}`,
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
                                text: "Cantidad de Inventario Almacén",
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
            this.logger.log(`Gráfico anual de inventario almacen generado exitosamente para el año ${currentYear}`);
            return imageBuffer;
        }
        catch (error) {
            this.logger.error("Error al generar gráfico de registros anual de inventario almacen:", error);
            return null;
        }
    }
    addRegistrationsByMonthSection(content, medicalSupplyStats, styles) {
        if (!medicalSupplyStats.registrationsByMonth || medicalSupplyStats.registrationsByMonth.length === 0) {
            this.logger.warn("No hay datos de registros por mes para construir la tabla");
            return;
        }
        const now = new Date();
        const currentYear = now.getFullYear();
        content.push({ text: `Tabla Detallada de Registros por Mes en el ${currentYear}`, style: "sectionTitle" });
        const tableBody = [
            [
                { text: "Mes", style: "tableHeader" },
                { text: "Inventario Almacén Registrado", style: "tableHeader" },
                { text: "Porcentaje", style: "tableHeader" },
            ],
        ];
        const byMonth = new Map();
        for (const m of medicalSupplyStats.registrationsByMonth) {
            byMonth.set(Number(m.month), Number(m.count || 0));
        }
        for (let month = 1; month <= 12; month++) {
            const count = byMonth.get(month) ?? 0;
            const monthName = this.getMonthName(month - 1);
            const percentage = medicalSupplyStats.productsYear > 0 ? ((count / medicalSupplyStats.productsYear) * 100).toFixed(1) : "0";
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
};
exports.MedicalSuppliesReportAllService = MedicalSuppliesReportAllService;
exports.MedicalSuppliesReportAllService = MedicalSuppliesReportAllService = MedicalSuppliesReportAllService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => dashboard_report_service_1.DashboardReportService))),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase,
        dashboard_report_service_1.DashboardReportService])
], MedicalSuppliesReportAllService);
//# sourceMappingURL=medical-supplies-report-all.service.js.map