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
var DashboardReportController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardReportController = void 0;
const common_1 = require("@nestjs/common");
const pdf_dasboard_service_1 = require("./pdf-dasboard.service");
const dashboard_report_service_1 = require("./dashboard-report.service");
const usersesion_decorator_1 = require("../auth/strategies/usersesion.decorator");
const medical_supplies_report_today_service_1 = require("./medical-supplies-registered/medical-supplies-report-today.service");
const medical_supplies_report_month_service_1 = require("./medical-supplies-registered/medical-supplies-report-month.service");
const assignment_report_month_service_1 = require("./assignment-registered/assignment-report-month.service");
const medical_supplies_report_service_1 = require("./medical-supplies-available/medical-supplies-report.service");
const stockAssignment_report_month_service_1 = require("./assignment-stock/stockAssignment-report-month.service");
const medical_supplies_report_all_service_1 = require("./medical-supplies-registered/medical-supplies-report-all.service");
let DashboardReportController = DashboardReportController_1 = class DashboardReportController {
    constructor(dashboardReportService, pdfGeneratorDashboardService, medicalSuppliesReportTodayService, medicalSuppliesReportMonthService, medicalSuppliesReportAllService, assignmentReportMonthService, medicalSuppliesReportService, assignmentReportMonthByMedicalSuppliesService) {
        this.dashboardReportService = dashboardReportService;
        this.pdfGeneratorDashboardService = pdfGeneratorDashboardService;
        this.medicalSuppliesReportTodayService = medicalSuppliesReportTodayService;
        this.medicalSuppliesReportMonthService = medicalSuppliesReportMonthService;
        this.medicalSuppliesReportAllService = medicalSuppliesReportAllService;
        this.assignmentReportMonthService = assignmentReportMonthService;
        this.medicalSuppliesReportService = medicalSuppliesReportService;
        this.assignmentReportMonthByMedicalSuppliesService = assignmentReportMonthByMedicalSuppliesService;
        this.logger = new common_1.Logger(DashboardReportController_1.name);
    }
    async generatePdfUsers(res, user, download) {
        this.logger.log(`Solicitud de generación de PDF para el reporte de estadísticas de usuarios`);
        try {
            const userStats = await this.dashboardReportService.getCompleteUserStats();
            this.logger.log(`Estadísticas obtenidas:`, userStats);
            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, "0");
            const day = today.getDate().toString().padStart(2, "0");
            const filename = `reporte-estadistico-de-usuarios-${year}.pdf`;
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.setHeader("Content-Disposition", download ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`);
            await this.pdfGeneratorDashboardService.generateUserStatsPdf(userStats, res, user);
            this.logger.log(`PDF de estadísticas generado exitosamente`);
        }
        catch (error) {
            this.logger.error(`Error al generar PDF de estadísticas:`, error);
            if (res.headersSent) {
                this.logger.warn(`Los encabezados ya fueron enviados, no se puede enviar respuesta de error`);
                return;
            }
            res.status(500).json({
                statusCode: 500,
                message: `Error al generar PDF: ${error.message || "Error desconocido"}`,
            });
        }
    }
    async pdfMedicalSupplies_today(res, user, download) {
        this.logger.log(`Solicitud de generación de PDF para el reporte de Inventario Almacén registrados hoy`);
        try {
            const medicalSupplyStats = await this.medicalSuppliesReportTodayService.getCompleteMedicalSupplyStats();
            this.logger.log(`Estadísticas de Inventario Almacén obtenidas:`, medicalSupplyStats);
            const isDownload = download === "true" || download === "1";
            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, "0");
            const day = today.getDate().toString().padStart(2, "0");
            const filename = `reporte-estadistico-insumos-medicos(Hoy)-${year}-${month}-${day}.pdf`;
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`);
            const reportData = {
                title: "Registros de Inventario Almacén (Hoy)",
                value: medicalSupplyStats.productsToday,
                type: "Inventario Almacén de Hoy (Registros)",
                date: today.toISOString(),
                additionalInfo: {
                    totalProducts: medicalSupplyStats.totalProducts,
                    generatedBy: user?.email || "Sistema",
                    generatedAt: new Date().toISOString(),
                },
            };
            await this.medicalSuppliesReportTodayService.generateCustomMedicalSuppliesPdf(reportData, res);
            this.logger.log(`PDF de Inventario Almacén generado exitosamente`);
        }
        catch (error) {
            this.logger.error(`Error al generar PDF de Inventario Almacén(Hoy):`, error);
            if (res.headersSent) {
                this.logger.warn(`Los encabezados ya fueron enviados, no se puede enviar respuesta de error`);
                return;
            }
            res.status(500).json({
                statusCode: 500,
                message: `Error al generar PDF: ${error.message || "Error desconocido"}`,
            });
        }
    }
    async pdfMedicalSupplies_month(res, user, download) {
        this.logger.log(`Solicitud de generación de PDF para el reporte de Inventario Almacén registrados en el mes`);
        try {
            const medicalSupplyStats = await this.medicalSuppliesReportMonthService.getCompleteMedicalSupplyStats();
            this.logger.log(`Estadísticas de Inventario Almacén obtenidas:`, medicalSupplyStats);
            const isDownload = download === "true" || download === "1";
            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, "0");
            const day = today.getDate().toString().padStart(2, "0");
            const filename = `reporte-estadistico-insumos-medicos(Mes)-${year}-${month}-${day}.pdf`;
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`);
            const reportData = {
                title: "Registros de Inventario Almacén (Mes)",
                value: medicalSupplyStats.productsToday,
                type: "Inventario Almacén en el Mes (Registros)",
                date: today.toISOString(),
                additionalInfo: {
                    totalProducts: medicalSupplyStats.totalProducts,
                    generatedBy: user?.email || "Sistema",
                    generatedAt: new Date().toISOString(),
                },
            };
            await this.medicalSuppliesReportMonthService.generateCustomMedicalSuppliesPdf(reportData, res);
            this.logger.log(`PDF de Inventario Almacén generado exitosamente`);
        }
        catch (error) {
            this.logger.error(`Error al generar PDF de Inventario Almacén(Mes):`, error);
            if (res.headersSent) {
                this.logger.warn(`Los encabezados ya fueron enviados, no se puede enviar respuesta de error`);
                return;
            }
            res.status(500).json({
                statusCode: 500,
                message: `Error al generar PDF: ${error.message || "Error desconocido"}`,
            });
        }
    }
    async pdfMedicalSupply_AllRecords(res, user, download) {
        this.logger.log(`Solicitud de generación de PDF para el reporte de Inventario Almacén registrado(Todo) `);
        try {
            const medicalSupplyStats = await this.medicalSuppliesReportAllService.getCompleteMedicalSupplyStats();
            this.logger.log(`Estadísticas de Inventario Almacén obtenidas:`, medicalSupplyStats);
            const isDownload = download === "true" || download === "1";
            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, "0");
            const day = today.getDate().toString().padStart(2, "0");
            const filename = `reporte-estadistico-insumos-medicos-${year}.pdf`;
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`);
            const fechaActual = new Date();
            const anioActual = fechaActual.getFullYear();
            const reportData = {
                title: "Registros de Inventario Almacén (Año)",
                value: medicalSupplyStats.productsYear,
                type: `Inventario Almacén del Año ${anioActual} (Registros)`,
                date: today.toISOString(),
                additionalInfo: {
                    totalProducts: medicalSupplyStats.totalProducts,
                    generatedBy: user?.email || "Sistema",
                    generatedAt: new Date().toISOString(),
                },
            };
            await this.medicalSuppliesReportAllService.generateCustomMedicalSuppliesPdf(reportData, res);
            this.logger.log(`PDF de Inventario Almacén generado exitosamente`);
        }
        catch (error) {
            this.logger.error(`Error al generar PDF de Inventario Almacén(Año):`, error);
            if (res.headersSent) {
                this.logger.warn(`Los encabezados ya fueron enviados, no se puede enviar respuesta de error`);
                return;
            }
            res.status(500).json({
                statusCode: 500,
                message: `Error al generar PDF: ${error.message || "Error desconocido"}`,
            });
        }
    }
    async pdfAssignmentsYear(res, user, download) {
        const options = { reportType: "year" };
        this.logger.log(`Solicitud de generación de PDF para el reporte de asignaciones de insumos médicos del anio`);
        try {
            const assignmentStats = await this.assignmentReportMonthService.getCompleteAssignmentStats(options);
            this.logger.log(`Estadísticas de asignaciones del anio obtenidas:`, assignmentStats);
            const isDownload = download === "true" || download === "1";
            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, "0");
            const filename = `reporte-estadistico-registros-de-asignaciones-a-empleados-${year}.pdf`;
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`);
            const reportData = {
                title: "Registros Anuales de las Asignaciones de Insumos Médicos a Empleados",
                value: assignmentStats.assignmentsThisMonth,
                type: "Registro Anual de las Asignaciones de Insumos Médicos a Empleados",
                date: today.toISOString(),
                additionalInfo: {
                    totalAssignments: assignmentStats.totalAssignments,
                    totalProductsAssigned: assignmentStats.totalProductsAssignedYear,
                    generatedBy: user?.email || "Sistema",
                    generatedAt: new Date().toISOString(),
                },
            };
            await this.assignmentReportMonthService.generateCustomAssignmentsPdf(reportData, res, options);
            this.logger.log(`PDF de asignaciones del anio generado exitosamente`);
        }
        catch (error) {
            this.logger.error(`Error al generar PDF de asignaciones del anio:`, error);
            if (res.headersSent) {
                this.logger.warn(`Los encabezados ya fueron enviados, no se puede enviar respuesta de error`);
                return;
            }
            res.status(500).json({
                statusCode: 500,
                message: `Error al generar PDF: ${error.message || "Error desconocido"}`,
            });
        }
    }
    async pdfAssignmentsMonth(res, user, download) {
        const options = { reportType: "month" };
        this.logger.log(`Solicitud de generación de PDF para el reporte de asignaciones de insumos médicos del mes`);
        try {
            const assignmentStats = await this.assignmentReportMonthService.getCompleteAssignmentStats(options);
            this.logger.log(`Estadísticas de asignaciones del mes obtenidas:`, assignmentStats);
            const isDownload = download === "true" || download === "1";
            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, "0");
            const filename = `reporte-estadistico-de-registros-asignaciones-a-empleados-${year}-${month}.pdf`;
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`);
            const reportData = {
                title: "Registros de las Asignaciones de Insumos Médicos a Empleados(Mes)",
                value: assignmentStats.assignmentsThisMonth,
                type: "Registro Mensual de las Asignaciones de Insumos Médicos a Empleados",
                date: today.toISOString(),
                additionalInfo: {
                    totalAssignments: assignmentStats.totalAssignments,
                    totalProductsAssigned: assignmentStats.totalProductsAssignedThisMonthOrToday,
                    generatedBy: user?.email || "Sistema",
                    generatedAt: new Date().toISOString(),
                },
            };
            await this.assignmentReportMonthService.generateCustomAssignmentsPdf(reportData, res, options);
            this.logger.log(`PDF de asignaciones del mes generado exitosamente`);
        }
        catch (error) {
            this.logger.error(`Error al generar PDF de asignaciones del mes:`, error);
            if (res.headersSent) {
                this.logger.warn(`Los encabezados ya fueron enviados, no se puede enviar respuesta de error`);
                return;
            }
            res.status(500).json({
                statusCode: 500,
                message: `Error al generar PDF: ${error.message || "Error desconocido"}`,
            });
        }
    }
    async pdfAssignmentsDay(res, user, download) {
        this.logger.log(`Solicitud de generación de PDF para el reporte de asignaciones de insumos médicos del día`);
        try {
            const options = { reportType: "day" };
            const assignmentStats = await this.assignmentReportMonthService.getCompleteAssignmentStats(options);
            this.logger.log(`Estadísticas de asignaciones del día obtenidas:`, assignmentStats);
            const isDownload = download === "true" || download === "1";
            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, "0");
            const day = today.getDate().toString().padStart(2, "0");
            const filename = `reporte-estadistico-de-registros-asignaciones-a-empleados-${year}-${month}-${day}.pdf`;
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`);
            const reportData = {
                title: "Registros de las Asignaciones de Insumos Médicos a Empleados(Hoy)",
                value: assignmentStats.assignmentsToday,
                type: "Registros en el día de las Asignaciones de Insumos Médicos a Empleados",
                date: today.toISOString(),
                additionalInfo: {
                    totalAssignments: assignmentStats.totalAssignments,
                    totalProductsAssigned: assignmentStats.totalProductsAssignedThisMonthOrToday,
                    generatedBy: user?.email || "Sistema",
                    generatedAt: new Date().toISOString(),
                },
            };
            await this.assignmentReportMonthService.generateCustomAssignmentsPdf(reportData, res, options);
            this.logger.log(`PDF de asignaciones del día generado exitosamente`);
        }
        catch (error) {
            this.logger.error(`Error al generar PDF de asignaciones del día:`, error);
            if (res.headersSent) {
                this.logger.warn(`Los encabezados ya fueron enviados, no se puede enviar respuesta de error`);
                return;
            }
            res.status(500).json({
                statusCode: 500,
                message: `Error al generar PDF: ${error.message || "Error desconocido"}`,
            });
        }
    }
    async pdfAssignmentsMonthMedicamentsUniformesOdontologic(supplyType, res, user, download) {
        const parsedSupplyType = Number.parseInt(supplyType);
        const options = { reportType: "month", supplyType: parsedSupplyType };
        this.validateSupplyType(parsedSupplyType);
        try {
            const assignmentStats = await this.assignmentReportMonthByMedicalSuppliesService.getCompleteAssignmentStats(options);
            const isDownload = download === "true" || download === "1";
            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, "0");
            let filename = `reporte-estadistico-asignaciones-${parsedSupplyType}-${year}-${month}.pdf`;
            if (options.supplyType === 1) {
                filename = `reporte-estadistico-asignaciones-medicamentos-${year}-${month}.pdf`;
            }
            if (options.supplyType === 2) {
                filename = `reporte-estadistico-asignaciones-uniformes-${year}-${month}.pdf`;
            }
            if (options.supplyType === 3) {
                filename = `reporte-estadistico-asignaciones-equiposodontologicos-${year}-${month}.pdf`;
            }
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`);
            const supplyType = this.getSupplyTypeName(options.supplyType);
            const reportData = {
                title: "Asignaciones de Insumos Médicos (Mes)",
                value: assignmentStats.assignmentsThisMonth,
                type: `Asignaciones de ${supplyType} a Empleados`,
                date: today.toISOString(),
                additionalInfo: {
                    totalAssignments: assignmentStats.totalAssignments,
                    totalProductsAssigned: assignmentStats.totalProductsAssigned,
                    generatedBy: user?.email || "Sistema",
                    generatedAt: new Date().toISOString(),
                },
            };
            await this.assignmentReportMonthByMedicalSuppliesService.generateCustomAssignmentsPdf(reportData, res, options);
            this.logger.log(`PDF de asignaciones del mes generado exitosamente`);
        }
        catch (error) {
            this.logger.error(`Error al generar PDF de asignaciones del mes:`, error);
            if (res.headersSent) {
                this.logger.warn(`Los encabezados ya fueron enviados, no se puede enviar respuesta de error`);
                return;
            }
            res.status(500).json({
                statusCode: 500,
                message: `Error al generar PDF: ${error.message || "Error desconocido"}`,
            });
        }
    }
    async generateMedicalSuppliesReport(supplyType, res, user, includeExpired, minStockThreshold, download) {
        try {
            const parsedSupplyType = Number.parseInt(supplyType);
            this.validateSupplyType(parsedSupplyType);
            const options = {
                supplyType: parsedSupplyType,
                includeExpired: includeExpired === "true",
                minStockThreshold: minStockThreshold ? Number.parseInt(minStockThreshold) : 15,
                reportDate: new Date(),
            };
            const reportData = this.createReportData(parsedSupplyType, user);
            this.setResponseHeaders(res, reportData.filename, download === "true");
            await this.medicalSuppliesReportService.generateCustomPdf(reportData, res, options);
        }
        catch (error) {
            this.handleError(error, res, `Error generating medical supplies report for type ${supplyType}`);
        }
    }
    async getMedicalSuppliesStats(supplyType, startDate, endDate, user) {
        try {
            const parsedSupplyType = Number.parseInt(supplyType);
            this.validateSupplyType(parsedSupplyType);
            const options = {
                supplyType: parsedSupplyType,
                reportDate: new Date(),
            };
            const stats = await this.medicalSuppliesReportService.getMedicalSupplyStats(options);
            return {
                success: true,
                data: {
                    supplyType: parsedSupplyType,
                    typeName: this.getSupplyTypeName(parsedSupplyType),
                    stats,
                    dateRange: {
                        start: startDate || new Date().toISOString(),
                        end: endDate || new Date().toISOString(),
                    },
                },
            };
        }
        catch (error) {
            this.logger.error(`Error getting medical supplies stats for type ${supplyType}:`, error);
            return {
                success: false,
                message: `Error retrieving statistics: ${error.message}`,
                data: null,
            };
        }
    }
    async getSupplyTypes() {
        return {
            success: true,
            data: [
                {
                    id: 1,
                    name: "Medicamentos",
                    description: "Productos farmacéuticos",
                    features: ["expiration_tracking", "batch_control", "prescription_required"],
                },
                {
                    id: 2,
                    name: "Uniformes",
                    description: "Uniformes médicos y vestimenta",
                    features: ["size_variants", "color_options", "department_specific"],
                },
                {
                    id: 3,
                    name: "Equipos Odontológicos",
                    description: "Equipos e instrumentos odontológicos",
                    features: ["maintenance_tracking", "calibration_required", "sterilization_control"],
                },
            ],
        };
    }
    async getInventoryAlerts(supplyType, user) {
        try {
            const parsedSupplyType = Number.parseInt(supplyType);
            this.validateSupplyType(parsedSupplyType);
            const alerts = await this.getAlertsForSupplyType(parsedSupplyType);
            const summary = {
                total: alerts.length,
                critical: alerts.filter((a) => a.priority === "critical").length,
                high: alerts.filter((a) => a.priority === "high").length,
                medium: alerts.filter((a) => a.priority === "medium").length,
                low: alerts.filter((a) => a.priority === "low").length,
            };
            return {
                success: true,
                data: {
                    supplyType: parsedSupplyType,
                    typeName: this.getSupplyTypeName(parsedSupplyType),
                    alerts,
                    summary,
                    metadata: {
                        generatedAt: new Date().toISOString(),
                        alertTypes: [...new Set(alerts.map((a) => a.type))],
                        priorityDistribution: {
                            critical: summary.critical,
                            high: summary.high,
                            medium: summary.medium,
                            low: summary.low,
                        },
                    },
                },
            };
        }
        catch (error) {
            this.logger.error(`Error getting alerts for supply type ${supplyType}:`, error);
            return {
                success: false,
                message: `Error retrieving alerts: ${error.message}`,
                data: null,
            };
        }
    }
    validateSupplyType(supplyType) {
        if (![1, 2, 3].includes(supplyType)) {
            throw new Error(`Invalid supply type: ${supplyType}. Must be 1 (Medicamentos), 2 (Uniformes), or 3 (Equipos Odontológicos)`);
        }
    }
    createReportData(supplyType, user) {
        const today = new Date();
        const typeName = this.getSupplyTypeName(supplyType);
        return {
            type: supplyType,
            typeName,
            title: `Reporte de ${typeName} Disponibles`,
            date: today.toISOString(),
            filename: this.generateFilename(supplyType),
            stats: {
                totalItems: 0,
                availableItems: 0,
                lowStockItems: 0,
                topItems: [],
            },
            additionalInfo: {
                generatedBy: user?.email || "Sistema",
                generatedAt: new Date().toISOString(),
                userId: user?.sub || null,
            },
        };
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
    generateFilename(supplyType) {
        const today = new Date();
        const dateStr = today.toISOString().split("T")[0];
        if (supplyType == 1) {
            return `reporte-estadistico-medicamentos-disponibles-${dateStr}.pdf`;
        }
        else if (supplyType == 2) {
            return `reporte-estadistico-uniformes-disponibles-${dateStr}.pdf`;
        }
        else if (supplyType == 3) {
            return `reporte-estadistico-equiposodontologicos-disponibles-${dateStr}.pdf`;
        }
    }
    setResponseHeaders(res, filename, isDownload) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.setHeader("Content-Disposition", isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`);
    }
    async getAlertsForSupplyType(supplyType) {
        const mockAlerts = [
            {
                type: "low_stock",
                productId: 1,
                productName: "Paracetamol 500mg",
                message: "Stock bajo detectado - Solo quedan 5 unidades",
                priority: "high",
                createdAt: new Date(),
                details: {
                    currentStock: 5,
                    minimumStock: 20,
                },
            },
            {
                type: "expired",
                productId: 2,
                productName: "Ibuprofeno 400mg",
                message: "Medicamento vencido - Retirar del inventario",
                priority: "critical",
                createdAt: new Date(),
                details: {
                    expirationDate: new Date("2024-01-15"),
                    daysUntilExpiration: -30,
                },
            },
            {
                type: "expiring_soon",
                productId: 3,
                productName: "Amoxicilina 250mg",
                message: "Medicamento próximo a vencer en 7 días",
                priority: "medium",
                createdAt: new Date(),
                details: {
                    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    daysUntilExpiration: 7,
                },
            },
            {
                type: "out_of_stock",
                productId: 4,
                productName: "Mascarillas N95",
                message: "Producto agotado - Reabastecer urgentemente",
                priority: "critical",
                createdAt: new Date(),
                details: {
                    currentStock: 0,
                    minimumStock: 100,
                },
            },
        ];
        return mockAlerts.filter((alert) => {
            switch (supplyType) {
                case 1:
                    return ["expired", "expiring_soon", "low_stock"].includes(alert.type);
                case 2:
                    return ["low_stock", "out_of_stock"].includes(alert.type);
                case 3:
                    return ["maintenance_required", "low_stock"].includes(alert.type);
                default:
                    return true;
            }
        });
    }
    handleError(error, res, message) {
        this.logger.error(message, error);
        if (res.headersSent) {
            this.logger.warn("Headers already sent, no se puede enviar respuesta de error");
            return;
        }
        res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            message: `${message}: ${error.message || "Error desconocido"}`,
            timestamp: new Date().toISOString(),
            path: res.req?.url || "unknown",
        });
    }
    async generateEnhancedAvailableProductsReport(supplyType, res, user, includeExpired, minStockThreshold, download) {
        try {
            const parsedSupplyType = Number.parseInt(supplyType);
            this.validateSupplyType(parsedSupplyType);
            this.logger.log(`Generando reporte MEJORADO de ${this.getSupplyTypeName(parsedSupplyType)} disponibles`);
            const options = {
                supplyType: parsedSupplyType,
                includeExpired: false,
                minStockThreshold: minStockThreshold
                    ? Number.parseInt(minStockThreshold)
                    : this.getDefaultStockThreshold(parsedSupplyType),
                reportDate: new Date(),
            };
            const reportData = this.createEnhancedReportData(parsedSupplyType, user);
            this.setResponseHeaders(res, reportData.filename, download === "true");
            await this.medicalSuppliesReportService.generateCustomPdf(reportData, res, options);
            this.logger.log(`PDF mejorado de ${this.getSupplyTypeName(parsedSupplyType)} disponibles generado exitosamente`);
        }
        catch (error) {
            this.handleError(error, res, `Error generating enhanced available products report for type ${supplyType}`);
        }
    }
    async getEnhancedAvailableProductsStats(supplyType, user) {
        try {
            const parsedSupplyType = Number.parseInt(supplyType);
            this.validateSupplyType(parsedSupplyType);
            const options = {
                supplyType: parsedSupplyType,
                reportDate: new Date(),
            };
            const enhancedStats = await this.medicalSuppliesReportService.getEnhancedMedicalSupplyStats(options);
            return {
                success: true,
                data: {
                    supplyType: parsedSupplyType,
                    typeName: this.getSupplyTypeName(parsedSupplyType),
                    enhancedStats,
                    metadata: {
                        reportType: "available_products_only",
                        generatedAt: new Date().toISOString(),
                        focusedOn: "productos_disponibles_solamente",
                        excludes: ["productos_vencidos", "productos_no_disponibles", "movimientos_de_entrada"],
                    },
                },
            };
        }
        catch (error) {
            this.logger.error(`Error getting enhanced available products stats for type ${supplyType}:`, error);
            return {
                success: false,
                message: `Error retrieving enhanced statistics: ${error.message}`,
                data: null,
            };
        }
    }
    createEnhancedReportData(supplyType, user) {
        const today = new Date();
        const typeName = this.getSupplyTypeName(supplyType);
        return {
            type: supplyType,
            typeName,
            title: `Reporte Estadístico de ${typeName} Disponibles`,
            date: today.toISOString(),
            filename: this.generateEnhancedFilename(supplyType),
            stats: {
                totalItems: 0,
                availableItems: 0,
                lowStockItems: 0,
                topItems: [],
            },
            additionalInfo: {
                reportType: "enhanced_available_products",
                focusedOn: "productos_disponibles_solamente",
                generatedBy: user?.email || "Sistema",
                generatedAt: new Date().toISOString(),
                userId: user?.sub || null,
                improvements: [
                    "consultas_optimizadas_con_joins",
                    "estadisticas_detalladas_por_categoria",
                    "analisis_de_disponibilidad",
                    "recomendaciones_especificas",
                    "detalles_de_productos_criticos",
                ],
            },
        };
    }
    generateEnhancedFilename(supplyType) {
        const today = new Date();
        const dateStr = today.toISOString().split("T")[0];
        switch (supplyType) {
            case 1:
                return `reporte-estadistico-medicamentos-disponibles-mejorado-${dateStr}.pdf`;
            case 2:
                return `reporte-estadistico-uniformes-disponibles-mejorado-${dateStr}.pdf`;
            case 3:
                return `reporte-estadistico-equipos-odontologicos-disponibles-mejorado-${dateStr}.pdf`;
            default:
                return `reporte-estadistico-productos-disponibles-mejorado-${dateStr}.pdf`;
        }
    }
    getDefaultStockThreshold(supplyType) {
        switch (supplyType) {
            case 1:
                return 10;
            case 2:
                return 5;
            case 3:
                return 2;
            default:
                return 10;
        }
    }
};
exports.DashboardReportController = DashboardReportController;
__decorate([
    (0, common_1.Post)("pdf"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, usersesion_decorator_1.Usersesion)()),
    __param(2, (0, common_1.Query)('download', new common_1.DefaultValuePipe(false), common_1.ParseBoolPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Boolean]),
    __metadata("design:returntype", Promise)
], DashboardReportController.prototype, "generatePdfUsers", null);
__decorate([
    (0, common_1.Post)("pdf/register/medicalSuppliesToday"),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, usersesion_decorator_1.Usersesion)()),
    __param(2, (0, common_1.Query)('download')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], DashboardReportController.prototype, "pdfMedicalSupplies_today", null);
__decorate([
    (0, common_1.Post)("pdf/register/medicalSuppliesMonth"),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, usersesion_decorator_1.Usersesion)()),
    __param(2, (0, common_1.Query)('download')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], DashboardReportController.prototype, "pdfMedicalSupplies_month", null);
__decorate([
    (0, common_1.Post)("pdf/register/medicalSupplies/all"),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, usersesion_decorator_1.Usersesion)()),
    __param(2, (0, common_1.Query)('download')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], DashboardReportController.prototype, "pdfMedicalSupply_AllRecords", null);
__decorate([
    (0, common_1.Post)("pdf/register/assignments-year"),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, usersesion_decorator_1.Usersesion)()),
    __param(2, (0, common_1.Query)('download')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], DashboardReportController.prototype, "pdfAssignmentsYear", null);
__decorate([
    (0, common_1.Post)("pdf/register/assignments-month"),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, usersesion_decorator_1.Usersesion)()),
    __param(2, (0, common_1.Query)('download')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], DashboardReportController.prototype, "pdfAssignmentsMonth", null);
__decorate([
    (0, common_1.Post)("pdf/register/assignments-day"),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, usersesion_decorator_1.Usersesion)()),
    __param(2, (0, common_1.Query)('download')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], DashboardReportController.prototype, "pdfAssignmentsDay", null);
__decorate([
    (0, common_1.Post)("pdf/generate/assignments-month/:supplyType"),
    __param(0, (0, common_1.Param)('supplyType')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, usersesion_decorator_1.Usersesion)()),
    __param(3, (0, common_1.Query)('download')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", Promise)
], DashboardReportController.prototype, "pdfAssignmentsMonthMedicamentsUniformesOdontologic", null);
__decorate([
    (0, common_1.Post)("generate/:supplyType"),
    __param(0, (0, common_1.Param)('supplyType')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, usersesion_decorator_1.Usersesion)()),
    __param(3, (0, common_1.Query)('includeExpired')),
    __param(4, (0, common_1.Query)('minStockThreshold')),
    __param(5, (0, common_1.Query)('download')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], DashboardReportController.prototype, "generateMedicalSuppliesReport", null);
__decorate([
    (0, common_1.Get)("stats/:supplyType"),
    __param(0, (0, common_1.Param)('supplyType')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, usersesion_decorator_1.Usersesion)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], DashboardReportController.prototype, "getMedicalSuppliesStats", null);
__decorate([
    (0, common_1.Get)("SupplyTypes"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardReportController.prototype, "getSupplyTypes", null);
__decorate([
    (0, common_1.Get)("alerts/:supplyType"),
    __param(0, (0, common_1.Param)('supplyType')),
    __param(1, (0, usersesion_decorator_1.Usersesion)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DashboardReportController.prototype, "getInventoryAlerts", null);
__decorate([
    (0, common_1.Post)("generate/available/:supplyType"),
    __param(0, (0, common_1.Param)('supplyType')),
    __param(2, (0, usersesion_decorator_1.Usersesion)()),
    __param(3, (0, common_1.Query)('includeExpired')),
    __param(4, (0, common_1.Query)('minStockThreshold')),
    __param(5, (0, common_1.Query)('download')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], DashboardReportController.prototype, "generateEnhancedAvailableProductsReport", null);
__decorate([
    (0, common_1.Get)("stats/available/:supplyType"),
    __param(0, (0, common_1.Param)('supplyType')),
    __param(1, (0, usersesion_decorator_1.Usersesion)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DashboardReportController.prototype, "getEnhancedAvailableProductsStats", null);
exports.DashboardReportController = DashboardReportController = DashboardReportController_1 = __decorate([
    (0, common_1.Controller)("dashboard-reports"),
    __metadata("design:paramtypes", [dashboard_report_service_1.DashboardReportService,
        pdf_dasboard_service_1.PdfDashboardService,
        medical_supplies_report_today_service_1.MedicalSuppliesReportTodayService,
        medical_supplies_report_month_service_1.MedicalSuppliesReportMonthService,
        medical_supplies_report_all_service_1.MedicalSuppliesReportAllService,
        assignment_report_month_service_1.AssignmentReportMonthService,
        medical_supplies_report_service_1.MedicalSuppliesReportService,
        stockAssignment_report_month_service_1.AssignmentReportMonthByMedicalSuppliesService])
], DashboardReportController);
//# sourceMappingURL=dashboard-report.controller.js.map