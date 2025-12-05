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
var AssignmentReportMonthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentReportMonthService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../db/schema");
const dashboard_report_service_1 = require("../../dashboard-report/dashboard-report.service");
const constants_1 = require("../../constants");
const assignment_service_1 = require("../../assignment/assignment.service");
const chartjs_node_canvas_1 = require("chartjs-node-canvas");
let AssignmentReportMonthService = AssignmentReportMonthService_1 = class AssignmentReportMonthService {
    constructor(db, dashboardReportService, assignmentService) {
        this.db = db;
        this.dashboardReportService = dashboardReportService;
        this.assignmentService = assignmentService;
        this.logger = new common_1.Logger(AssignmentReportMonthService_1.name);
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
    async generateCustomAssignmentsPdf(reportData, res, options = { reportType: "month" }) {
        try {
            console.log("GenerateCustomAssignmentsPdf()  options: ", options);
            this.logger.log(`Generando PDF personalizado de asignaciones a empleados: ${reportData.title}`);
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
            this.logger.log(`PDF personalizado de las asignaciones a empleados, generado exitosamente`);
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
    async getCompleteAssignmentStats(options = { reportType: "month" }) {
        try {
            console.log("GetCompleteAssignmentStats()  options: ", options);
            let startRange, endRange, startOfDay, endOfDay, startMonth, endMonth;
            const now = new Date();
            const currentYear = now.getUTCFullYear();
            const startOfYear = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0));
            const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));
            const nowUtc = new Date(now.toISOString());
            const currentMonth = nowUtc.getUTCMonth();
            startMonth = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0, 0));
            endMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999));
            startOfDay = new Date(Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), nowUtc.getUTCDate(), 0, 0, 0, 0));
            endOfDay = new Date(Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), nowUtc.getUTCDate(), 23, 59, 59, 999));
            startRange = startOfYear;
            endRange = endOfYear;
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
            else if (options.reportType === "month") {
                const now = new Date();
                const nowUtc = new Date(now.toISOString());
                startOfDay = new Date(Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), nowUtc.getUTCDate(), 0, 0, 0, 0));
                endOfDay = new Date(Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), nowUtc.getUTCDate(), 23, 59, 59, 999));
                const currentYear = nowUtc.getUTCFullYear();
                const currentMonth = nowUtc.getUTCMonth();
                startRange = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0, 0));
                endRange = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999));
            }
            this.logger.log('***************  Filtro de dia o mes o anio: ***************');
            this.logger.log('año prueba antes:', startOfYear, " ", endOfYear);
            this.logger.log('startOfDay:', startOfDay);
            this.logger.log('endOfDay:', endOfDay);
            console.log("antes de 1.generalStats");
            let generalStats = null;
            if (options.reportType === "year") {
                generalStats = await this.db
                    .select({
                    totalAssignments: (0, drizzle_orm_1.count)(),
                    assignmentsThisMonth: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.assignmentTable.createdAt} >= ${startMonth} AND ${schema_1.assignmentTable.createdAt} <= ${endMonth} THEN 1 ELSE NULL END)`,
                    totalProductsAssignedThisMonth: (0, drizzle_orm_1.sql) `sum(CASE WHEN ${schema_1.assignmentTable.createdAt} >= ${startMonth} AND ${schema_1.assignmentTable.createdAt} <= ${endMonth} THEN ${schema_1.assignmentTable.products} ELSE 0 END)`,
                    registryAssignmentsYear: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.assignmentTable.createdAt} >= ${startOfYear} AND ${schema_1.assignmentTable.createdAt} <= ${endOfYear} THEN 1 ELSE NULL END)`,
                    totalProductsAssignedYear: (0, drizzle_orm_1.sql) `sum(CASE WHEN ${schema_1.assignmentTable.createdAt} >= ${startOfYear} AND ${schema_1.assignmentTable.createdAt} <= ${endOfYear} THEN ${schema_1.assignmentTable.products} ELSE 0 END)`,
                })
                    .from(schema_1.assignmentTable)
                    .innerJoin(schema_1.productsTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.id, schema_1.assignmentTable.productId))
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.assignmentTable.employeeId), (0, drizzle_orm_1.inArray)(schema_1.productsTable.type, [1, 2, 3]), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4])));
            }
            else {
                generalStats = await this.db
                    .select({
                    totalAssignments: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.assignmentTable.createdAt} >= ${startOfYear} AND ${schema_1.assignmentTable.createdAt} <= ${endOfYear} THEN 1 ELSE NULL END)`,
                    assignmentsThisMonth: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.assignmentTable.createdAt} >= ${startRange} AND ${schema_1.assignmentTable.createdAt} <= ${endRange} THEN 1 ELSE NULL END)`,
                    totalProductsAssignedThisMonth: (0, drizzle_orm_1.sql) `sum(CASE WHEN ${schema_1.assignmentTable.createdAt} >= ${startRange} AND ${schema_1.assignmentTable.createdAt} <= ${endRange} THEN ${schema_1.assignmentTable.products} ELSE 0 END)`,
                })
                    .from(schema_1.assignmentTable)
                    .innerJoin(schema_1.productsTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.id, schema_1.assignmentTable.productId))
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.assignmentTable.employeeId), (0, drizzle_orm_1.inArray)(schema_1.productsTable.type, [1, 2, 3]), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4])));
            }
            generalStats = generalStats[0];
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
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.assignmentTable.employeeId), (0, drizzle_orm_1.gte)(schema_1.assignmentTable.createdAt, startRange), (0, drizzle_orm_1.lte)(schema_1.assignmentTable.createdAt, endRange), (0, drizzle_orm_1.inArray)(schema_1.productsTable.type, [1, 2, 3]), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4])))
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
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.assignmentTable.employeeId), (0, drizzle_orm_1.gte)(schema_1.assignmentTable.createdAt, startRange), (0, drizzle_orm_1.lte)(schema_1.assignmentTable.createdAt, endRange), (0, drizzle_orm_1.inArray)(schema_1.productsTable.type, [1, 2, 3]), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4])))
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
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.assignmentTable.employeeId), (0, drizzle_orm_1.gte)(schema_1.assignmentTable.createdAt, startRange), (0, drizzle_orm_1.lte)(schema_1.assignmentTable.createdAt, endRange), (0, drizzle_orm_1.inArray)(schema_1.productsTable.type, [1, 2, 3]), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4])))
                .groupBy(schema_1.familyTable.id, schema_1.familyTable.name, schema_1.familyTable.cedula, schema_1.employeeTable.name)
                .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `count(${schema_1.assignmentTable.id})`));
            const registrationsByDayResult = await this.db
                .select({
                createdAt: schema_1.assignmentTable.createdAt,
                assignmentCount: (0, drizzle_orm_1.count)(),
            })
                .from(schema_1.assignmentTable)
                .innerJoin(schema_1.productsTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.id, schema_1.assignmentTable.productId))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.assignmentTable.employeeId), (0, drizzle_orm_1.gte)(schema_1.assignmentTable.createdAt, startRange), (0, drizzle_orm_1.lte)(schema_1.assignmentTable.createdAt, endRange), (0, drizzle_orm_1.inArray)(schema_1.productsTable.type, [1, 2, 3]), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4])))
                .groupBy(schema_1.assignmentTable.createdAt)
                .orderBy(schema_1.assignmentTable.createdAt);
            const assignmentsDetailsResult = await this.db
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
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.assignmentTable.employeeId), (0, drizzle_orm_1.gte)(schema_1.assignmentTable.createdAt, startRange), (0, drizzle_orm_1.lte)(schema_1.assignmentTable.createdAt, endRange), (0, drizzle_orm_1.inArray)(schema_1.productsTable.type, [1, 2, 3]), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4])))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.assignmentTable.createdAt));
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
            const registrationsByMonthResult = await this.db
                .select({
                month: (0, drizzle_orm_1.sql) `EXTRACT(MONTH FROM ${schema_1.assignmentTable.createdAt})`,
                assignmentCount: (0, drizzle_orm_1.count)(),
            })
                .from(schema_1.assignmentTable)
                .innerJoin(schema_1.productsTable, (0, drizzle_orm_1.eq)(schema_1.assignmentTable.productId, schema_1.productsTable.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.assignmentTable.employeeId), (0, drizzle_orm_1.gte)(schema_1.assignmentTable.createdAt, startOfYear), (0, drizzle_orm_1.lte)(schema_1.assignmentTable.createdAt, endOfYear), (0, drizzle_orm_1.inArray)(schema_1.productsTable.type, [1, 2, 3]), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4])))
                .groupBy((0, drizzle_orm_1.sql) `EXTRACT(MONTH FROM ${schema_1.assignmentTable.createdAt})`)
                .orderBy((0, drizzle_orm_1.sql) `EXTRACT(MONTH FROM ${schema_1.assignmentTable.createdAt})`);
            const monthsEs = [
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
            ];
            const monthCounts = Array.from({ length: 12 }, () => 0);
            registrationsByMonthResult.forEach((row) => {
                const m = Number(row.month);
                if (m >= 1 && m <= 12) {
                    monthCounts[m - 1] = Number(row.assignmentCount);
                }
            });
            const registrationsByMonth = monthCounts.map((count, idx) => ({
                month: idx + 1,
                label: monthsEs[idx],
                count,
            }));
            const completeStats = {
                totalAssignments: Number(generalStats.totalAssignments),
                assignmentsToday: (await this.assignmentService.totalAssignmentOfTheDay()).count,
                assignmentsThisMonth: (await this.assignmentService.totalAssignmentOfMonth()).count,
                totalProductsAssignedThisMonthOrToday: options.reportType === "day" ? Number((await this.assignmentService.countProductsAssignmentOfTheDay()).count) : Number((await this.assignmentService.countProductsAssignmentOfMonth([1, 2, 3])).count),
                assignmentDetails: assignmentsDetailsResult,
                assignmentsByEmployee,
                assignmentsByProductType,
                assignmentsByFamily,
                registrationsByDay,
                registrationsByMonth,
                registryAssignmentsYear: Number(generalStats.registryAssignmentsYear),
                totalProductsAssignedYear: Number(generalStats.totalProductsAssignedYear),
            };
            this.logger.log("Estadísticas completas de asignaciones a empleados:", JSON.stringify(completeStats, null, 2));
            return completeStats;
        }
        catch (error) {
            this.logger.error("Error al obtener estadísticas de asignaciones a empleados:", error);
            throw new Error("Error al obtener estadísticas completas de asignaciones a empleados");
        }
    }
    async createCustomAssignmentsDocumentDefinition(reportData, assignmentStats, options = { reportType: "month" }) {
        try {
            let logoData = null;
            let labelReportType = "en el año actual";
            if (options.reportType === "month") {
                labelReportType = 'en el mes';
            }
            if (options.reportType === "day") {
                labelReportType = 'en el dia';
            }
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
            const now = new Date();
            const currentYear = now.getFullYear();
            let reportTitle = `REPORTE REGISTROS ANUALES DE LAS ASIGNACIONES DE INSUMOS MÉDICOS A EMPLEADOS ${currentYear}`;
            if (options.reportType === "month") {
                reportTitle = "REPORTE REGISTROS MENSUALES DE LAS ASIGNACIONES DE INSUMOS MÉDICOS A EMPLEADOS";
            }
            if (options.reportType === "day") {
                reportTitle = "REPORTE REGISTROS DIARIOS DE LAS ASIGNACIONES DE INSUMOS MÉDICOS A EMPLEADOS";
            }
            content.push({
                text: reportTitle,
                style: "reportTitle",
            });
            console.log("options.reportType ", options.reportType);
            this.addGeneralInfoTable(content, reportData, styles);
            this.addGeneralStatsSection(content, assignmentStats, styles, options);
            this.addAssignmentsByEmployeeSection(content, assignmentStats, styles);
            this.addAssignmentsByProductTypeSection(content, assignmentStats, styles, options.reportType);
            this.addAssignmentsByFamilySection(content, assignmentStats, styles, options.reportType);
            if (options.reportType === "year") {
                let yearlyChartBuffer = null;
                try {
                    yearlyChartBuffer = await this.generateYearlyRegistrationChart(assignmentStats);
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
            }
            this.addAssignmentDetailSection(content, assignmentStats, styles, options.reportType);
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
                    text: `Registros de asignaciones a empleados ${labelReportType} - Página ${currentPage} de ${pageCount}`,
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
        const periodLabel = options.reportType === "day" ? "Hoy" : "del Mes";
        if (options.reportType === "year") {
            content.push({ text: "Estadísticas Generales de las Asignaciones a Empleados", style: "sectionTitle" }, {
                table: {
                    widths: ["50%", "50%"],
                    body: [
                        [
                            { text: "Total de Asignaciones (Registro):", style: "tableCellLabel" },
                            { text: assignmentStats.totalAssignments.toString(), style: "tableCellValue" },
                        ],
                        [
                            { text: `Asignaciones del Año (Registro):`, style: "tableCellLabel" },
                            { text: assignmentStats.registryAssignmentsYear.toString(), style: "metricValue" },
                        ],
                        [
                            { text: `Total de Productos Asignados en el Año:`, style: "tableCellLabel" },
                            { text: assignmentStats.totalProductsAssignedYear.toString(), style: "tableCellValue" },
                        ],
                        [
                            { text: `Asignaciones del Mes (Registro):`, style: "tableCellLabel" },
                            { text: assignmentStats.assignmentsThisMonth.toString(), style: "tableCellValue" },
                        ],
                        [
                            { text: `Total de Productos Asignados del Mes:`, style: "tableCellLabel" },
                            { text: assignmentStats.totalProductsAssignedThisMonthOrToday.toString(), style: "tableCellValue" },
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
        if (options.reportType === "month") {
            content.push({ text: "Estadísticas Generales de las Asignaciones a Empleados", style: "sectionTitle" }, {
                table: {
                    widths: ["50%", "50%"],
                    body: [
                        [
                            { text: "Total de Asignaciones en el Año (Registro):", style: "tableCellLabel" },
                            { text: assignmentStats.totalAssignments.toString(), style: "tableCellValue" },
                        ],
                        [
                            { text: `Asignaciones ${periodLabel} (Registro):`, style: "tableCellLabel" },
                            { text: assignmentStats.assignmentsThisMonth.toString(), style: "metricValue" },
                        ],
                        [
                            { text: `Total de Productos Asignados ${periodLabel}:`, style: "tableCellLabel" },
                            { text: assignmentStats.totalProductsAssignedThisMonthOrToday.toString(), style: "tableCellValue" },
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
        if (options.reportType === "day") {
            content.push({ text: "Estadísticas Generales de las Asignaciones a Empleados", style: "sectionTitle" }, {
                table: {
                    widths: ["50%", "50%"],
                    body: [
                        [
                            { text: "Total de Asignaciones en el Año (Registro):", style: "tableCellLabel" },
                            { text: assignmentStats.totalAssignments.toString(), style: "tableCellValue" },
                        ],
                        [
                            { text: `Asignaciones de ${periodLabel} (Registro):`, style: "tableCellLabel" },
                            { text: assignmentStats.assignmentsToday.toString(), style: "metricValue" },
                        ],
                        [
                            { text: `Total de Productos Asignados ${periodLabel}:`, style: "tableCellLabel" },
                            { text: assignmentStats.totalProductsAssignedThisMonthOrToday.toString(), style: "tableCellValue" },
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
            let titleN = "No se registraron asignaciones en el año actual.";
            if (reportType === 'month') {
                titleN = "No se registraron asignaciones en el mes actual.";
            }
            if (reportType === 'day') {
                titleN = "No se registraron asignaciones el dia de hoy.";
            }
            content.push({ text: "Distribución por Tipo de Producto", style: "sectionTitle" }, {
                text: titleN,
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
        let title = "Detalles de las Asignaciones a Empleados en el Año Actual (" + assignmentStats.assignmentDetails.length + ")";
        if (reportType === 'month') {
            title = "Detalles de las Asignaciones a Empleados en el Mes Actual (" + assignmentStats.assignmentDetails.length + ")";
        }
        if (reportType === 'day') {
            title = "Detalle de las Asignaciones a Empleados de Hoy";
        }
        let titleN = "No se registraron asignaciones en el año actual.";
        if (reportType === 'month') {
            titleN = "No se registraron asignaciones en el mes actual.";
        }
        if (reportType === 'day') {
            titleN = "No se registraron asignaciones el dia de hoy.";
        }
        if (assignmentStats.assignmentDetails && assignmentStats.assignmentDetails.length > 0) {
            content.push({
                text: title,
                style: "sectionTitle"
            });
            const assignmentTableBody = [
                [
                    { text: "Fecha", style: "tableHeader" },
                    { text: "Empleado", style: "tableHeader" },
                    { text: "Familiar", style: "tableHeader" },
                    { text: "Producto", style: "tableHeader" },
                    { text: "Tipo", style: "tableHeader" },
                    { text: "Stock asignado", style: "tableHeader" },
                ],
            ];
            const limitedAssignments = assignmentStats.assignmentDetails.slice(0, 50);
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
            if (assignmentStats.assignmentDetails.length > 50) {
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
                        text: `Mostrando las primeras 50 de ${assignmentStats.assignmentDetails.length} asignaciones`,
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
                text: title,
                style: "sectionTitle"
            }, {
                text: titleN,
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
                            label: "Registros de Asignaciones de Insumos médicos a Empleados",
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
                            text: `Registros de Asignaciones de Insumos médicos a Empleados en el ${currentYear}`,
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
                                label: (ctx) => `Registros de Asignaciones de Insumos médicos a Empleados: ${ctx.parsed.y}`,
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
                                text: "Registros",
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
            this.logger.log(`Gráfico anual de asignaciones de inventario almacen a empleados, generado exitosamente para el año ${currentYear}`);
            return imageBuffer;
        }
        catch (error) {
            this.logger.error("Error al generar gráfico de registros anual de asignaciones de inventario almacen a empleados,:", error);
            return null;
        }
    }
    async showCintilloCiip(content) {
        let logoData = null;
        try {
            logoData = await this.dashboardReportService.loadLogoWithRetry();
        }
        catch (error) {
            this.logger.warn("No se pudo cargar el logo:", error.message);
        }
        if (logoData) {
            content.push({
                image: `data:image/jpeg;base64,${logoData.toString("base64")}`,
                maxWidth: 515,
                maxHeight: 150,
                alignment: "center",
                margin: [0, 0, 0, 20],
            });
        }
        return content;
    }
};
exports.AssignmentReportMonthService = AssignmentReportMonthService;
exports.AssignmentReportMonthService = AssignmentReportMonthService = AssignmentReportMonthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => dashboard_report_service_1.DashboardReportService))),
    __metadata("design:paramtypes", [Function, dashboard_report_service_1.DashboardReportService,
        assignment_service_1.AssignmentService])
], AssignmentReportMonthService);
//# sourceMappingURL=assignment-report-month.service.js.map