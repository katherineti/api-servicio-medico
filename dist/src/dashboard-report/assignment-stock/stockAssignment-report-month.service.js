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
var AssignmentReportMonthByMedicalSuppliesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentReportMonthByMedicalSuppliesService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../db/schema");
const dashboard_report_service_1 = require("../dashboard-report.service");
const constants_1 = require("../../constants");
const assignment_service_1 = require("../../assignment/assignment.service");
const chartjs_node_canvas_1 = require("chartjs-node-canvas");
let AssignmentReportMonthByMedicalSuppliesService = AssignmentReportMonthByMedicalSuppliesService_1 = class AssignmentReportMonthByMedicalSuppliesService {
    constructor(db, dashboardReportService, assignmentService) {
        this.db = db;
        this.dashboardReportService = dashboardReportService;
        this.assignmentService = assignmentService;
        this.logger = new common_1.Logger(AssignmentReportMonthByMedicalSuppliesService_1.name);
    }
    async generateCustomAssignmentsPdf(reportData, res, options = { reportType: "month", supplyType: 1 }) {
        try {
            this.logger.log(`Generando PDF personalizado para asignaciones del mes, por tipo: ${reportData.title}`);
            const assignmentStats = await this.getCompleteAssignmentStats(options);
            const docDefinition = await this.createCustomAssignmentsDocumentDefinition(reportData, assignmentStats, options);
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
            this.logger.log(`PDF personalizado de asignaciones del mes generado exitosamente`);
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
    async getCompleteAssignmentStats(options = { reportType: "month", supplyType: 1 }) {
        try {
            let startRange, endRange, startOfDay, endOfDay;
            const now = new Date();
            const nowUtc = new Date(now.toISOString());
            const currentYear = nowUtc.getUTCFullYear();
            const startOfYear = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0));
            const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));
            if (options.reportType === "day") {
                const targetDateLocal = options.date || new Date();
                targetDateLocal.setHours(0, 0, 0, 0);
                startOfDay = targetDateLocal;
                const endOfDayLocal = new Date(targetDateLocal);
                endOfDayLocal.setHours(23, 59, 59, 999);
                endOfDay = endOfDayLocal;
                startRange = startOfDay;
                endRange = endOfDay;
            }
            else {
                startOfDay = new Date(Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), nowUtc.getUTCDate(), 0, 0, 0, 0));
                endOfDay = new Date(Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), nowUtc.getUTCDate(), 23, 59, 59, 999));
                const currentMonth = nowUtc.getUTCMonth();
                startRange = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0, 0));
                endRange = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999));
            }
            const [generalStats] = await this.db
                .select({
                totalAssignments: (0, drizzle_orm_1.sql) `sum(CASE WHEN ${schema_1.assignmentTable.createdAt} >= ${startOfYear} AND ${schema_1.assignmentTable.createdAt} <= ${endOfYear} THEN ${schema_1.assignmentTable.products} ELSE 0 END)`,
                assignmentsToday: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.assignmentTable.createdAt} >= ${startOfDay} AND ${schema_1.assignmentTable.createdAt} <= ${endOfDay} THEN 1 ELSE NULL END)`,
                assignmentsThisMonth: (0, drizzle_orm_1.sql) `sum(CASE WHEN ${schema_1.assignmentTable.createdAt} >= ${startRange} AND ${schema_1.assignmentTable.createdAt} <= ${endRange} THEN ${schema_1.assignmentTable.products} ELSE NULL END)`,
                totalProductsAssigned: (0, drizzle_orm_1.sql) `sum(${schema_1.assignmentTable.products})`,
                totalProductsAssignedThisMonth: (0, drizzle_orm_1.sql) `sum(CASE WHEN ${schema_1.assignmentTable.createdAt} >= ${startRange} AND ${schema_1.assignmentTable.createdAt} <= ${endRange} THEN ${schema_1.assignmentTable.products} ELSE 0 END)`,
            })
                .from(schema_1.assignmentTable)
                .innerJoin(schema_1.productsTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.id, schema_1.assignmentTable.productId))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.assignmentTable.employeeId), (0, drizzle_orm_1.eq)(schema_1.productsTable.type, options.supplyType), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4])));
            const assignmentsByEmployeeResult = await this.db
                .select({
                employeeId: schema_1.employeeTable.id,
                employeeName: schema_1.employeeTable.name,
                employeeCedula: schema_1.employeeTable.cedula,
                assignmentCount: (0, drizzle_orm_1.count)(schema_1.assignmentTable.id),
                totalProducts: (0, drizzle_orm_1.sql) `sum(${schema_1.assignmentTable.products})`,
            })
                .from(schema_1.employeeTable)
                .leftJoin(schema_1.assignmentTable, (0, drizzle_orm_1.eq)(schema_1.assignmentTable.employeeId, schema_1.employeeTable.id))
                .leftJoin(schema_1.productsTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.id, schema_1.assignmentTable.productId))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.assignmentTable.employeeId), (0, drizzle_orm_1.gte)(schema_1.assignmentTable.createdAt, startRange), (0, drizzle_orm_1.lte)(schema_1.assignmentTable.createdAt, endRange), (0, drizzle_orm_1.eq)(schema_1.productsTable.type, options.supplyType), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4])))
                .groupBy(schema_1.employeeTable.id, schema_1.employeeTable.name, schema_1.employeeTable.cedula)
                .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `count(${schema_1.assignmentTable.id})`));
            const assignmentsByProductTypeResult = await this.db
                .select({
                typeId: schema_1.typesOfProductsTable.id,
                typeName: schema_1.typesOfProductsTable.type,
                assignmentCount: (0, drizzle_orm_1.count)(schema_1.assignmentTable.id),
                totalProducts: (0, drizzle_orm_1.sql) `sum(${schema_1.assignmentTable.products})`,
            })
                .from(schema_1.typesOfProductsTable)
                .leftJoin(schema_1.productsTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.type, schema_1.typesOfProductsTable.id))
                .leftJoin(schema_1.assignmentTable, (0, drizzle_orm_1.eq)(schema_1.assignmentTable.productId, schema_1.productsTable.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.assignmentTable.employeeId), (0, drizzle_orm_1.gte)(schema_1.assignmentTable.createdAt, startRange), (0, drizzle_orm_1.lte)(schema_1.assignmentTable.createdAt, endRange), (0, drizzle_orm_1.eq)(schema_1.productsTable.type, options.supplyType), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4])))
                .groupBy(schema_1.typesOfProductsTable.id, schema_1.typesOfProductsTable.type)
                .orderBy(schema_1.typesOfProductsTable.id);
            const assignmentsByFamilyResult = await this.db
                .select({
                familyId: schema_1.familyTable.id,
                familyName: schema_1.familyTable.name,
                familyCedula: schema_1.familyTable.cedula,
                employeeName: schema_1.employeeTable.name,
                assignmentCount: (0, drizzle_orm_1.count)(schema_1.assignmentTable.id),
                totalProducts: (0, drizzle_orm_1.sql) `sum(${schema_1.assignmentTable.products})`,
            })
                .from(schema_1.familyTable)
                .leftJoin(schema_1.employeeFamilyTable, (0, drizzle_orm_1.eq)(schema_1.employeeFamilyTable.familyId, schema_1.familyTable.id))
                .leftJoin(schema_1.employeeTable, (0, drizzle_orm_1.eq)(schema_1.employeeTable.id, schema_1.employeeFamilyTable.employeeId))
                .leftJoin(schema_1.assignmentTable, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.assignmentTable.familyId, schema_1.familyTable.id), (0, drizzle_orm_1.eq)(schema_1.assignmentTable.employeeId, schema_1.employeeTable.id)))
                .leftJoin(schema_1.productsTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.id, schema_1.assignmentTable.productId))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.assignmentTable.employeeId), (0, drizzle_orm_1.gte)(schema_1.assignmentTable.createdAt, startRange), (0, drizzle_orm_1.lte)(schema_1.assignmentTable.createdAt, endRange), (0, drizzle_orm_1.eq)(schema_1.productsTable.type, options.supplyType), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4])))
                .groupBy(schema_1.familyTable.id, schema_1.familyTable.name, schema_1.familyTable.cedula, schema_1.employeeTable.name)
                .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `count(${schema_1.assignmentTable.id})`));
            const registrationsByDayResult = await this.db
                .select({
                createdAt: schema_1.assignmentTable.createdAt,
                assignmentCount: (0, drizzle_orm_1.count)(),
            })
                .from(schema_1.assignmentTable)
                .innerJoin(schema_1.productsTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.id, schema_1.assignmentTable.productId))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.assignmentTable.employeeId), (0, drizzle_orm_1.gte)(schema_1.assignmentTable.createdAt, startRange), (0, drizzle_orm_1.lte)(schema_1.assignmentTable.createdAt, endRange), (0, drizzle_orm_1.eq)(schema_1.productsTable.type, options.supplyType), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4])))
                .groupBy(schema_1.assignmentTable.createdAt)
                .orderBy(schema_1.assignmentTable.createdAt);
            const monthlyAssignmentsResult = await this.db
                .select({
                id: schema_1.assignmentTable.id,
                employeeName: schema_1.employeeTable.name,
                employeeCedula: schema_1.employeeTable.cedula,
                familyName: schema_1.familyTable.name,
                familyCedula: schema_1.familyTable.cedula,
                productName: schema_1.productsTable.name,
                productCode: schema_1.productsTable.code,
                typeName: schema_1.typesOfProductsTable.type,
                assignedProducts: schema_1.assignmentTable.products,
                observation: schema_1.assignmentTable.observation,
                createdAt: schema_1.assignmentTable.createdAt,
            })
                .from(schema_1.assignmentTable)
                .innerJoin(schema_1.employeeTable, (0, drizzle_orm_1.eq)(schema_1.assignmentTable.employeeId, schema_1.employeeTable.id))
                .leftJoin(schema_1.familyTable, (0, drizzle_orm_1.eq)(schema_1.assignmentTable.familyId, schema_1.familyTable.id))
                .innerJoin(schema_1.productsTable, (0, drizzle_orm_1.eq)(schema_1.assignmentTable.productId, schema_1.productsTable.id))
                .innerJoin(schema_1.typesOfProductsTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.type, schema_1.typesOfProductsTable.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.assignmentTable.employeeId), (0, drizzle_orm_1.gte)(schema_1.assignmentTable.createdAt, startRange), (0, drizzle_orm_1.lte)(schema_1.assignmentTable.createdAt, endRange), (0, drizzle_orm_1.eq)(schema_1.productsTable.type, options.supplyType), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4])))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.assignmentTable.createdAt));
            const topRequestedMedicines = await this.db
                .select({
                productId: schema_1.assignmentTable.productId,
                productName: schema_1.productsTable.name,
                productCode: schema_1.productsTable.code,
                totalAssignments: (0, drizzle_orm_1.count)(schema_1.assignmentTable.id),
                totalQuantity: (0, drizzle_orm_1.sum)(schema_1.assignmentTable.products),
            })
                .from(schema_1.assignmentTable)
                .innerJoin(schema_1.productsTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.id, schema_1.assignmentTable.productId))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.assignmentTable.employeeId), (0, drizzle_orm_1.eq)(schema_1.productsTable.type, options.supplyType), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4]), (0, drizzle_orm_1.gte)(schema_1.assignmentTable.createdAt, startRange), (0, drizzle_orm_1.lte)(schema_1.assignmentTable.createdAt, endRange)))
                .groupBy(schema_1.assignmentTable.productId, schema_1.productsTable.name, schema_1.productsTable.code)
                .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sum)(schema_1.assignmentTable.products)))
                .limit(5);
            const assignmentsByEmployee = assignmentsByEmployeeResult.map((row) => ({
                employeeId: row.employeeId,
                employeeName: this.dashboardReportService.capitalizeFirstLetter(row.employeeName),
                employeeCedula: row.employeeCedula,
                assignmentCount: Number(row.assignmentCount),
                totalProducts: Number(row.totalProducts) || 0,
            }));
            const assignmentsByProductType = assignmentsByProductTypeResult.map((row) => ({
                typeId: row.typeId,
                typeName: this.dashboardReportService.capitalizeFirstLetter(row.typeName),
                assignmentCount: Number(row.assignmentCount),
                totalProducts: Number(row.totalProducts) || 0,
            }));
            const assignmentsByFamily = assignmentsByFamilyResult.map((row) => ({
                familyId: row.familyId,
                familyName: this.dashboardReportService.capitalizeFirstLetter(row.familyName),
                familyCedula: row.familyCedula,
                employeeName: this.dashboardReportService.capitalizeFirstLetter(row.employeeName),
                assignmentCount: Number(row.assignmentCount),
                totalProducts: Number(row.totalProducts) || 0,
            }));
            const registrationsByDay = [];
            const dayMap = new Map();
            registrationsByDayResult.forEach((row) => {
                const date = new Date(row.createdAt).toISOString().split("T")[0];
                const day = new Date(row.createdAt).getUTCDate();
                const currentCount = dayMap.get(date) || 0;
                dayMap.set(date, currentCount + Number(row.assignmentCount));
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
                totalAssignments: Number(generalStats.totalAssignments),
                assignmentsToday: (await this.assignmentService.totalAssignmentOfTheDay()).count,
                assignmentsThisMonth: (await this.assignmentService.totalAssignmentOfMonth()).count,
                totalProductsAssigned: Number(generalStats.totalProductsAssigned) || 0,
                totalProductsAssignedThisMonthOrToday: options.reportType === "day" ? Number((await this.assignmentService.countProductsAssignmentOfTheDay()).count) : Number((await this.assignmentService.countProductsAssignmentOfMonth([options.supplyType])).count),
                assignmentsByEmployee,
                assignmentsByProductType,
                assignmentsByFamily,
                registrationsByDay,
                monthlyAssignments: monthlyAssignmentsResult,
                topRequestedMedicines: topRequestedMedicines.map((medicine) => ({
                    productId: medicine.productId,
                    productName: medicine.productName,
                    productCode: medicine.productCode,
                    totalAssignments: Number(medicine.totalAssignments),
                    totalQuantity: Number(medicine.totalQuantity) || 0,
                })),
            };
            this.logger.log("Estadísticas completas de asignaciones del mes:", JSON.stringify(completeStats, null, 2));
            return completeStats;
        }
        catch (error) {
            this.logger.error("Error al obtener estadísticas de asignaciones del mes:", error);
            throw new Error("Error al obtener estadísticas completas de asignaciones del mes");
        }
    }
    async createCustomAssignmentsDocumentDefinition(reportData, assignmentStats, options = { reportType: "month", supplyType: 1 }) {
        try {
            let logoData = null;
            let labelReportType = options.reportType === "day" ? 'en el dia' : 'en el mes';
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
                }
            };
            const content = [];
            let reportTitle = "REPORTE MENSUAL DE LAS ASIGNACIONES DE MEDICAMENTOS A EMPLEADOS";
            if (options.supplyType === 1) {
                reportTitle = "REPORTE MENSUAL DE LAS ASIGNACIONES DE MEDICAMENTOS A EMPLEADOS";
            }
            if (options.supplyType === 2) {
                reportTitle = "REPORTE MENSUAL DE LAS ASIGNACIONES DE UNIFORMES A EMPLEADOS";
            }
            if (options.supplyType === 3) {
                reportTitle = "REPORTE MENSUAL DE LAS ASIGNACIONES DE EQUIPOS ODONTOLÓGICOS A EMPLEADOS";
            }
            content.push({
                text: reportTitle,
                style: "reportTitle",
            });
            this.addGeneralInfoTable(content, reportData, styles);
            this.addGeneralStatsSection(content, assignmentStats, styles, options);
            this.addAssignmentsByEmployeeSection(content, assignmentStats, styles);
            this.addAssignmentsByProductTypeSection(content, assignmentStats, styles, options.reportType);
            this.addAssignmentsByFamilySection(content, assignmentStats, styles, options.reportType);
            this.addAssignmentDetailSection(content, assignmentStats, styles, options.reportType);
            const topMedicinesChartBase64 = await this.generateTopMedicinesChart(assignmentStats.topRequestedMedicines);
            if (reportTitle === "REPORTE MENSUAL DE LAS ASIGNACIONES DE MEDICAMENTOS A EMPLEADOS" && topMedicinesChartBase64 && assignmentStats.topRequestedMedicines.length > 0) {
                this.addTopMedicinesChartSection(content, assignmentStats, topMedicinesChartBase64, styles, options);
            }
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
                    text: `Reporte de asignaciones a empleados ${labelReportType} - Página ${currentPage} de ${pageCount}`,
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
    addGeneralStatsSection(content, assignmentStats, styles, options) {
        const periodLabel = options.reportType === "day" ? "Hoy" : "en el Mes";
        const supplyType = this.getSupplyTypeName(options.supplyType);
        if (options.reportType === "day") {
            content.push({ text: `Estadísticas Generales de Asignaciones de ${supplyType} a Empleados`, style: "sectionTitle" }, {
                table: {
                    widths: ["50%", "50%"],
                    body: [
                        [
                            { text: `Total de ${supplyType} Asignados en el Año:`, style: "tableCellLabel" },
                            { text: assignmentStats.totalAssignments.toString(), style: "tableCellValue" },
                        ],
                        [
                            { text: `Total de ${supplyType} Asignados ${periodLabel}:`, style: "tableCellLabel" },
                            { text: assignmentStats.totalProductsAssignedThisMonthOrToday.toString(), style: "metricValue" },
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
        else {
            content.push({ text: `Estadísticas Generales de Asignaciones de ${supplyType} a Empleados`, style: "sectionTitle" }, {
                table: {
                    widths: ["50%", "50%"],
                    body: [
                        [
                            { text: `Total de ${supplyType} Asignados en el Año:`, style: "tableCellLabel" },
                            { text: assignmentStats.totalAssignments.toString(), style: "tableCellValue" },
                        ],
                        [
                            { text: `Total de ${supplyType} Asignados ${periodLabel}:`, style: "tableCellLabel" },
                            { text: assignmentStats.totalProductsAssignedThisMonthOrToday.toString(), style: "metricValue" },
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
    }
    addAssignmentsByEmployeeSection(content, assignmentStats, styles) {
        if (assignmentStats.assignmentsByEmployee && assignmentStats.assignmentsByEmployee.length > 0) {
            content.push({ text: "Asignaciones por Empleado", style: "sectionTitle" });
            const employeeTableBody = [
                [
                    { text: "Empleado", style: "tableHeader" },
                    { text: "Cédula", style: "tableHeader" },
                    { text: "Asignaciones", style: "tableHeader" },
                    { text: "Total Productos", style: "tableHeader" },
                ],
            ];
            assignmentStats.assignmentsByEmployee.forEach((employee) => {
                employeeTableBody.push([
                    { text: this.dashboardReportService.getValidContent(employee.employeeName), style: "tableCellValue" },
                    { text: this.dashboardReportService.getValidContent(employee.employeeCedula), style: "tableCellValue" },
                    { text: employee.assignmentCount.toString(), style: "tableCellValue" },
                    { text: employee.totalProducts.toString(), style: "tableCellValue" },
                ]);
            });
            content.push({
                table: {
                    widths: ["35%", "20%", "20%", "25%"],
                    body: employeeTableBody,
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
    }
    addAssignmentsByProductTypeSection(content, assignmentStats, styles, reportType) {
        if (assignmentStats.assignmentsByProductType && assignmentStats.assignmentsByProductType.length > 0) {
            content.push({ text: "Distribución por Tipo de Producto", style: "sectionTitle" });
            const typeTableBody = [
                [
                    { text: "Tipo de Producto", style: "tableHeader" },
                    { text: "Asignaciones", style: "tableHeader" },
                    { text: "Total Productos", style: "tableHeader" },
                    { text: "Porcentaje", style: "tableHeader" },
                ],
            ];
            assignmentStats.assignmentsByProductType.forEach((type) => {
                const percentage = assignmentStats.totalAssignments > 0
                    ? ((type.assignmentCount / assignmentStats.totalAssignments) * 100).toFixed(1)
                    : "0";
                typeTableBody.push([
                    { text: type.typeName, style: "tableCellValue" },
                    { text: type.assignmentCount.toString(), style: "tableCellValue" },
                    { text: type.totalProducts.toString(), style: "tableCellValue" },
                    { text: `${percentage}%`, style: "tableCellValue" },
                ]);
            });
            content.push({
                table: {
                    widths: ["40%", "20%", "20%", "20%"],
                    body: typeTableBody,
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
            content.push({ text: "Distribución por Tipo de Producto", style: "sectionTitle" }, {
                text: reportType === 'day' ? "No se registraron asignaciones el dia de hoy." : "No se registraron asignaciones en el mes actual.",
                style: "paragraph",
                alignment: "center",
                color: "#666666",
                margin: [0, 10, 0, 20],
            });
        }
    }
    addAssignmentsByFamilySection(content, assignmentStats, styles, reportType) {
        if (assignmentStats.assignmentsByFamily && assignmentStats.assignmentsByFamily.length > 0) {
            content.push({ text: "Asignaciones a Familiares", style: "sectionTitle" });
            const familyTableBody = [
                [
                    { text: "Familiar", style: "tableHeader" },
                    { text: "Cédula", style: "tableHeader" },
                    { text: "Empleado", style: "tableHeader" },
                    { text: "Asignaciones", style: "tableHeader" },
                    { text: "Total Productos", style: "tableHeader" },
                ],
            ];
            assignmentStats.assignmentsByFamily.forEach((family) => {
                familyTableBody.push([
                    { text: this.dashboardReportService.getValidContent(family.familyName), style: "tableCellValue" },
                    { text: this.dashboardReportService.getValidContent(family.familyCedula), style: "tableCellValue" },
                    { text: this.dashboardReportService.getValidContent(family.employeeName), style: "tableCellValue" },
                    { text: family.assignmentCount.toString(), style: "tableCellValue" },
                    { text: family.totalProducts.toString(), style: "tableCellValue" },
                ]);
            });
            content.push({
                table: {
                    widths: ["25%", "15%", "25%", "15%", "20%"],
                    body: familyTableBody,
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
            content.push({ text: "Asignaciones a Familiares", style: "sectionTitle" }, {
                text: reportType === 'day' ? "No se registraron asignaciones a familiares en el dia de hoy." : "No se registraron asignaciones a familiares en el mes actual.",
                style: "paragraph",
                alignment: "center",
                color: "#666666",
                margin: [0, 10, 0, 20],
            });
        }
    }
    addAssignmentDetailSection(content, assignmentStats, styles, reportType) {
        if (assignmentStats.monthlyAssignments && assignmentStats.monthlyAssignments.length > 0) {
            content.push({
                text: reportType === 'day' ? "Detalle de las Asignaciones de Hoy" : "Detalle de las Asignaciones del Mes Actual",
                style: "sectionTitle"
            });
            const assignmentTableBody = [
                [
                    { text: "Fecha", style: "tableHeader" },
                    { text: "Empleado", style: "tableHeader" },
                    { text: "Familiar", style: "tableHeader" },
                    { text: "Producto", style: "tableHeader" },
                    { text: "Tipo", style: "tableHeader" },
                    { text: "Cantidad", style: "tableHeader" },
                ],
            ];
            const limitedAssignments = assignmentStats.monthlyAssignments.slice(0, 50);
            limitedAssignments.forEach((assignment) => {
                assignmentTableBody.push([
                    { text: this.dashboardReportService.formatDate(assignment.createdAt), style: "tableCellValue" },
                    { text: this.dashboardReportService.getValidContent(assignment.employeeName), style: "tableCellValue" },
                    {
                        text: this.dashboardReportService.getValidContent(assignment.familyName || "N/A"),
                        style: "tableCellValue",
                    },
                    { text: this.dashboardReportService.getValidContent(assignment.productName), style: "tableCellValue" },
                    { text: this.dashboardReportService.getValidContent(assignment.typeName), style: "tableCellValue" },
                    { text: assignment.assignedProducts.toString(), style: "tableCellValue" },
                ]);
            });
            if (assignmentStats.monthlyAssignments.length > 50) {
                assignmentTableBody.push([
                    {
                        text: "...",
                        style: "tableCellValue",
                        colSpan: 6,
                        alignment: "center",
                    },
                    {},
                    {},
                    {},
                    {},
                    {},
                ]);
                assignmentTableBody.push([
                    {
                        text: `Mostrando las primeras 50 de ${assignmentStats.monthlyAssignments.length} asignaciones`,
                        style: "paragraph",
                        colSpan: 6,
                        alignment: "center",
                        color: "#666666",
                    },
                    {},
                    {},
                    {},
                    {},
                    {},
                ]);
            }
            content.push({
                table: {
                    widths: ["12%", "20%", "15%", "25%", "15%", "13%"],
                    body: assignmentTableBody,
                },
                layout: {
                    hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
                    vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 1 : 0.5),
                    hLineColor: (i, node) => (i === 0 || i === node.table.body.length ? "#003366" : "#BBBBBB"),
                    vLineColor: (i, node) => (i === 0 || i === node.table.widths.length ? "#003366" : "#BBBBBB"),
                    paddingLeft: (i, node) => 3,
                    paddingRight: (i, node) => 3,
                    paddingTop: (i, node) => 2,
                    paddingBottom: (i, node) => 2,
                },
                margin: [0, 10, 0, 20],
            });
        }
        else {
            content.push({
                text: reportType === 'day' ? "Detalle de las Asignaciones de Hoy" : "Detalle de las Asignaciones del Mes Actual",
                style: "sectionTitle"
            }, {
                text: reportType === 'day' ? "No se registraron asignaciones el dia de hoy." : "No se registraron asignaciones en el mes actual.",
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
            text: "Este reporte fue generado automáticamente por el sistema de gestión de asignaciones médicas.",
            style: "paragraph",
            alignment: "center",
            color: "#666666",
        });
    }
    getSupplyTypeName(supplyType) {
        switch (supplyType) {
            case 1:
                return "Medicamentos";
            case 2:
                return "Uniformes";
            case 3:
                return "Equipos Odontológicos";
            default:
                return "Insumos Médicos";
        }
    }
    async generateTopMedicinesChart(topMedicines) {
        try {
            const width = 800;
            const height = 400;
            const chartJSNodeCanvas = new chartjs_node_canvas_1.ChartJSNodeCanvas({ width, height });
            const labels = topMedicines.map((medicine) => this.capitalizeWords(medicine.productName));
            const data = topMedicines.map((medicine) => medicine.totalQuantity);
            const configuration = {
                type: "bar",
                data: {
                    labels,
                    datasets: [
                        {
                            label: "Cantidad Asignada",
                            data,
                            backgroundColor: "#003366",
                            borderColor: "#002244",
                            borderWidth: 1,
                            categoryPercentage: topMedicines.length === 1 ? 0.2 : 0.3,
                            barPercentage: 0.6,
                        },
                    ],
                },
                options: {
                    responsive: false,
                    plugins: {
                        title: {
                            display: false,
                            text: "Top 5 Medicamentos Más Solicitados",
                            font: {
                                size: 16,
                                weight: "bold",
                            },
                        },
                        legend: {
                            display: false,
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: "Cantidad",
                            },
                        },
                        x: {
                            title: {
                                display: true,
                                text: "Medicamentos",
                            },
                            ticks: {
                                maxRotation: 45,
                                minRotation: 0,
                            },
                        },
                    },
                },
            };
            const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
            return `data:image/png;base64,${imageBuffer.toString("base64")}`;
        }
        catch (error) {
            this.logger.error("Error generating top medicines chart:", error);
            return "";
        }
    }
    addTopMedicinesChartSection(content, assignmentStats, chartBase64, styles, options) {
        const supplyType = this.getSupplyTypeName(options.supplyType);
        const periodLabel = options.reportType === "day" ? "del Día" : "del Mes";
        content.push({ text: `Top 5 ${supplyType} Más Solicitados del Mes`, style: "sectionTitle", alignment: "center" }, {
            image: chartBase64,
            width: 500,
            alignment: "center",
            margin: [0, 10, 0, 10],
        });
        if (assignmentStats.topRequestedMedicines.length > 0) {
            const tableBody = [
                [
                    { text: "Código", style: "tableHeader" },
                    { text: "Medicamento", style: "tableHeader" },
                    { text: "Asignaciones", style: "tableHeader" },
                    { text: "Cantidad Total", style: "tableHeader" },
                ],
            ];
            assignmentStats.topRequestedMedicines.forEach((medicine) => {
                tableBody.push([
                    { text: medicine.productCode, style: "tableCellValue" },
                    { text: this.capitalizeWords(medicine.productName), style: "tableCellValue" },
                    { text: medicine.totalAssignments.toString(), style: "tableCellValue" },
                    { text: medicine.totalQuantity.toString(), style: "tableCellValue" },
                ]);
            });
            content.push({
                table: {
                    widths: ["15%", "45%", "20%", "20%"],
                    body: tableBody,
                },
                layout: {
                    hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
                    vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 1 : 0.5),
                    hLineColor: (i, node) => (i === 0 || i === node.table.body.length ? "#003366" : "#BBBBBB"),
                    vLineColor: (i, node) => (i === 0 || i === node.table.widths.length ? "#003366" : "#BBBBBB"),
                    paddingLeft: (i, node) => 8,
                    paddingRight: (i, node) => 8,
                    paddingTop: (i, node) => 4,
                    paddingBottom: (i, node) => 4,
                },
                margin: [0, 10, 0, 20],
            });
        }
    }
    capitalizeWords(cadena) {
        if (!cadena) {
            return '';
        }
        const palabras = cadena.toLowerCase().split(' ');
        const palabrasCapitalizadas = palabras.map(palabra => {
            if (palabra.length === 0) {
                return '';
            }
            return palabra.charAt(0).toUpperCase() + palabra.slice(1);
        });
        return palabrasCapitalizadas.join(' ');
    }
    capitalizarOracion(oracion) {
        if (oracion.length === 0) {
            return "";
        }
        return oracion.charAt(0).toUpperCase() + oracion.slice(1);
    }
};
exports.AssignmentReportMonthByMedicalSuppliesService = AssignmentReportMonthByMedicalSuppliesService;
exports.AssignmentReportMonthByMedicalSuppliesService = AssignmentReportMonthByMedicalSuppliesService = AssignmentReportMonthByMedicalSuppliesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => dashboard_report_service_1.DashboardReportService))),
    __metadata("design:paramtypes", [Function, dashboard_report_service_1.DashboardReportService,
        assignment_service_1.AssignmentService])
], AssignmentReportMonthByMedicalSuppliesService);
//# sourceMappingURL=stockAssignment-report-month.service.js.map