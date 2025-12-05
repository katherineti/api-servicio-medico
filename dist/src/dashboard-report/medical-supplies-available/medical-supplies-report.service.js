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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalSuppliesReportService = void 0;
const common_1 = require("@nestjs/common");
const base_report_service_1 = require("./base-report.service");
const date_utils_1 = require("./date.utils");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../db/schema");
const constants_1 = require("../../constants");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const medical_supplies_service_1 = require("../../medical-supplies/medical-supplies.service");
const dashboard_report_service_1 = require("../dashboard-report.service");
let MedicalSuppliesReportService = class MedicalSuppliesReportService extends base_report_service_1.BaseReportService {
    constructor(db, medicalSuppliesService, dashboardReportService) {
        super();
        this.db = db;
        this.medicalSuppliesService = medicalSuppliesService;
        this.dashboardReportService = dashboardReportService;
    }
    async generateCustomPdf(reportData, res, options) {
        try {
            this.logger.log(`Generando PDF mejorado de ${reportData.typeName} disponibles`);
            const enhancedStats = await this.getEnhancedMedicalSupplyStats(options);
            const docDefinition = await this.createEnhancedDocumentDefinition(reportData, enhancedStats, options);
            const filename = this.generateFilename(options);
            await this.generatePdfResponse(docDefinition, res, filename);
        }
        catch (error) {
            this.logger.error(`Error al generar PDF mejorado de insumos médicos disponibles:`, error);
            throw error;
        }
    }
    async getEnhancedMedicalSupplyStats(options) {
        try {
            switch (options.supplyType) {
                case 1:
                    return await this.getEnhancedMedicationStatistics();
                case 2:
                    return await this.getEnhancedUniformStatistics();
                case 3:
                    return await this.getEnhancedDentalEquipmentStatistics();
                default:
                    throw new Error(`Tipo de insumo no válido: ${options.supplyType}`);
            }
        }
        catch (error) {
            this.logger.error("Error al obtener estadísticas mejoradas:", error);
            throw error;
        }
    }
    async getEnhancedMedicationStatistics() {
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const dateRanges = this.medicalSuppliesService.calculateCurrentMonthRange();
        const availableProducts = await this.db
            .select({
            id: schema_1.productsTable.id,
            name: schema_1.productsTable.name,
            code: schema_1.productsTable.code,
            stock: schema_1.productsTable.stock,
            expirationDate: schema_1.productsTable.expirationDate,
            categoryName: schema_1.categoriesTable.name,
            providerName: schema_1.providersTable.name,
        })
            .from(schema_1.productsTable)
            .leftJoin(schema_1.categoriesTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.categoryId, schema_1.categoriesTable.id))
            .leftJoin(schema_1.providersTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.providerId, schema_1.providersTable.id))
            .leftJoin(schema_1.typesOfProductsTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.type, schema_1.typesOfProductsTable.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.typesOfProductsTable.type, "Medicamentos"), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.productsTable.statusId, 1), (0, drizzle_orm_1.eq)(schema_1.productsTable.statusId, 3)), (0, drizzle_orm_1.gte)(schema_1.productsTable.createdAt, dateRanges.startOfMonth), (0, drizzle_orm_1.lte)(schema_1.productsTable.createdAt, dateRanges.endOfMonth)));
        const systemTotals = await this.db
            .select({
            total: (0, drizzle_orm_1.sum)(schema_1.productsTable.stock),
            status: schema_1.productStatusTable.status,
        })
            .from(schema_1.productsTable)
            .leftJoin(schema_1.productStatusTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.statusId, schema_1.productStatusTable.id))
            .leftJoin(schema_1.typesOfProductsTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.type, schema_1.typesOfProductsTable.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.typesOfProductsTable.type, "Medicamentos"), (0, drizzle_orm_1.gte)(schema_1.productsTable.createdAt, dateRanges.startOfMonth), (0, drizzle_orm_1.lte)(schema_1.productsTable.createdAt, dateRanges.endOfMonth)))
            .groupBy(schema_1.productStatusTable.status);
        console.log("systemTotals ", systemTotals);
        const totalAvailableProducts_sumStock = Number((await this.medicalSuppliesService.getAccumulatedStockByType()).sum_medicamentos);
        const countRegistryAvailableProducts = availableProducts.length;
        const lowStockThreshold = 15;
        const availableWithLowStock = availableProducts.filter((p) => p.stock <= lowStockThreshold).length;
        const availableNearExpiry = availableProducts.filter((p) => p.expirationDate && new Date(p.expirationDate) <= thirtyDaysFromNow && new Date(p.expirationDate) > now).length;
        const lowStockAvailableDetails = availableProducts
            .filter((p) => p.stock <= lowStockThreshold)
            .map((p) => ({
            id: p.id,
            name: p.name,
            code: p.code,
            stock: p.stock,
            minStock: 15,
            category: p.categoryName || "Sin categoría",
            provider: p.providerName || "Sin proveedor",
        }));
        console.log("**availableProducts", availableProducts);
        console.log("**lowStockAvailableDetails", lowStockAvailableDetails);
        const nearExpiryAvailableDetails = availableProducts
            .filter((p) => p.expirationDate && new Date(p.expirationDate) <= thirtyDaysFromNow && new Date(p.expirationDate) > now)
            .map((p) => ({
            id: p.id,
            name: p.name,
            code: p.code,
            expirationDate: new Date(p.expirationDate).toLocaleDateString(),
            daysToExpiry: Math.floor((new Date(p.expirationDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
            category: p.categoryName || "Sin categoría",
        }));
        const categoryMap = new Map();
        availableProducts.forEach((product) => {
            const category = product.categoryName || "Sin categoría";
            categoryMap.set(category, (categoryMap.get(category) || 0) + product.stock);
        });
        const categoryDistribution = Array.from(categoryMap.entries()).map(([categoryName, totalStock]) => ({
            categoryName,
            availableCount: totalStock,
            percentage: totalAvailableProducts_sumStock > 0 ? (totalStock / totalAvailableProducts_sumStock) * 100 : 0,
        }));
        const totalInSystem = systemTotals.reduce((sum, item) => sum + Number(item.total), 0);
        const expiredCount = Number(systemTotals.find((item) => item.status === "Caducado")?.total || 0);
        const _AvailableSumStock = Number(systemTotals.find((item) => item.status === "Disponible")?.total || 0);
        const notAvailableSumStock = Number(systemTotals.find((item) => item.status === "No Disponible")?.total || 0);
        const availabilityAnalysis = {
            totalProductsInSystem: totalInSystem,
            availableProducts: totalAvailableProducts_sumStock,
            availabilityPercentage: totalInSystem > 0 ? (totalAvailableProducts_sumStock / totalInSystem) * 100 : 0,
            noAvailabilityPercentage: totalInSystem > 0 ? (notAvailableSumStock / totalInSystem) * 100 : 0,
            notAvailableProducts: notAvailableSumStock,
            expiredProducts: expiredCount,
        };
        console.log("availabilityPercentage ", availabilityAnalysis.availabilityPercentage);
        console.log("totalAvailableProducts_sumStock", totalAvailableProducts_sumStock);
        console.log("totalInSystem", totalInSystem);
        console.log("sum med disponibles o prox a vencer", totalAvailableProducts_sumStock, " , solo disponibles:", _AvailableSumStock);
        console.log("sum med no disponibles", notAvailableSumStock, " ,noAvailabilityPercentage  ", availabilityAnalysis.noAvailabilityPercentage);
        return {
            totalAvailableProducts_sumStock,
            availableWithLowStock,
            availableNearExpiry,
            lowStockAvailableDetails,
            nearExpiryAvailableDetails,
            categoryDistribution,
            availabilityAnalysis,
            countRegistryAvailableProducts
        };
    }
    async getEnhancedUniformStatistics() {
        const dateRanges = this.medicalSuppliesService.calculateCurrentMonthRange();
        const availableProducts = await this.db
            .select({
            id: schema_1.productsTable.id,
            name: schema_1.productsTable.name,
            code: schema_1.productsTable.code,
            stock: schema_1.productsTable.stock,
            expirationDate: schema_1.productsTable.expirationDate,
            categoryName: schema_1.categoriesTable.name,
            providerName: schema_1.providersTable.name,
        })
            .from(schema_1.productsTable)
            .leftJoin(schema_1.categoriesTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.categoryId, schema_1.categoriesTable.id))
            .leftJoin(schema_1.providersTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.providerId, schema_1.providersTable.id))
            .leftJoin(schema_1.typesOfProductsTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.type, schema_1.typesOfProductsTable.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.typesOfProductsTable.type, "Uniformes"), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.productsTable.statusId, 1), (0, drizzle_orm_1.eq)(schema_1.productsTable.statusId, 3)), (0, drizzle_orm_1.gte)(schema_1.productsTable.createdAt, dateRanges.startOfMonth), (0, drizzle_orm_1.lte)(schema_1.productsTable.createdAt, dateRanges.endOfMonth)));
        const systemTotals = await this.db
            .select({
            total: (0, drizzle_orm_1.sum)(schema_1.productsTable.stock),
            status: schema_1.productStatusTable.status,
        })
            .from(schema_1.productsTable)
            .leftJoin(schema_1.productStatusTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.statusId, schema_1.productStatusTable.id))
            .leftJoin(schema_1.typesOfProductsTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.type, schema_1.typesOfProductsTable.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.typesOfProductsTable.type, "Uniformes"), (0, drizzle_orm_1.gte)(schema_1.productsTable.createdAt, dateRanges.startOfMonth), (0, drizzle_orm_1.lte)(schema_1.productsTable.createdAt, dateRanges.endOfMonth)))
            .groupBy(schema_1.productStatusTable.status);
        const lowStockThreshold = 15;
        const totalInSystem = systemTotals.reduce((sum, item) => sum + Number(item.total), 0);
        const totalAvailableProducts_sumStock = Number((await this.medicalSuppliesService.getAccumulatedStockByType()).sum_uniformes);
        const notAvailableSumStock = Number(systemTotals.find((item) => item.status === "No Disponible")?.total || 0);
        const countRegistryAvailableProducts = availableProducts.length;
        const categoryMap = new Map();
        availableProducts.forEach((product) => {
            const category = product.categoryName || "Sin categoría";
            categoryMap.set(category, (categoryMap.get(category) || 0) + product.stock);
        });
        const categoryDistribution = Array.from(categoryMap.entries()).map(([categoryName, totalStock]) => ({
            categoryName,
            availableCount: totalStock,
            percentage: totalAvailableProducts_sumStock > 0 ? (totalStock / totalAvailableProducts_sumStock) * 100 : 0,
        }));
        return {
            totalAvailableProducts_sumStock,
            availableWithLowStock: availableProducts.filter((p) => p.stock <= lowStockThreshold).length,
            availableNearExpiry: 0,
            lowStockAvailableDetails: availableProducts
                .filter((p) => p.stock <= lowStockThreshold)
                .map((p) => ({
                id: p.id,
                name: p.name,
                code: p.code,
                stock: p.stock,
                minStock: 15,
                category: p.categoryName || "Sin categoría",
                provider: p.providerName || "Sin proveedor",
            })),
            nearExpiryAvailableDetails: [],
            categoryDistribution,
            availabilityAnalysis: {
                totalProductsInSystem: systemTotals.reduce((sum, item) => sum + Number(item.total), 0),
                availableProducts: totalAvailableProducts_sumStock,
                notAvailableProducts: notAvailableSumStock,
                expiredProducts: 0,
                availabilityPercentage: totalInSystem > 0 ? (totalAvailableProducts_sumStock / totalInSystem) * 100 : 0,
                noAvailabilityPercentage: totalInSystem > 0 ? (notAvailableSumStock / totalInSystem) * 100 : 0,
            },
            countRegistryAvailableProducts
        };
    }
    async getEnhancedDentalEquipmentStatistics() {
        const dateRanges = this.medicalSuppliesService.calculateCurrentMonthRange();
        const availableProducts = await this.db
            .select({
            id: schema_1.productsTable.id,
            name: schema_1.productsTable.name,
            code: schema_1.productsTable.code,
            stock: schema_1.productsTable.stock,
            expirationDate: schema_1.productsTable.expirationDate,
            categoryName: schema_1.categoriesTable.name,
            providerName: schema_1.providersTable.name,
        })
            .from(schema_1.productsTable)
            .leftJoin(schema_1.categoriesTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.categoryId, schema_1.categoriesTable.id))
            .leftJoin(schema_1.providersTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.providerId, schema_1.providersTable.id))
            .leftJoin(schema_1.typesOfProductsTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.type, schema_1.typesOfProductsTable.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.typesOfProductsTable.type, "Equipos odontologicos"), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.productsTable.statusId, 1), (0, drizzle_orm_1.eq)(schema_1.productsTable.statusId, 3)), (0, drizzle_orm_1.gte)(schema_1.productsTable.createdAt, dateRanges.startOfMonth), (0, drizzle_orm_1.lte)(schema_1.productsTable.createdAt, dateRanges.endOfMonth)));
        const systemTotals = await this.db
            .select({
            total: (0, drizzle_orm_1.sum)(schema_1.productsTable.stock),
            status: schema_1.productStatusTable.status,
        })
            .from(schema_1.productsTable)
            .leftJoin(schema_1.productStatusTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.statusId, schema_1.productStatusTable.id))
            .leftJoin(schema_1.typesOfProductsTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.type, schema_1.typesOfProductsTable.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.typesOfProductsTable.type, "Equipos odontologicos"), (0, drizzle_orm_1.gte)(schema_1.productsTable.createdAt, dateRanges.startOfMonth), (0, drizzle_orm_1.lte)(schema_1.productsTable.createdAt, dateRanges.endOfMonth)))
            .groupBy(schema_1.productStatusTable.status);
        const lowStockThreshold = 15;
        const totalInSystem = systemTotals.reduce((sum, item) => sum + Number(item.total), 0);
        const totalAvailableProducts_sumStock = Number((await this.medicalSuppliesService.getAccumulatedStockByType()).sum_equiposOdontologicos);
        const notAvailableSumStock = Number(systemTotals.find((item) => item.status === "No Disponible")?.total || 0);
        const countRegistryAvailableProducts = availableProducts.length;
        const categoryMap = new Map();
        availableProducts.forEach((product) => {
            const category = product.categoryName || "Sin categoría";
            categoryMap.set(category, (categoryMap.get(category) || 0) + product.stock);
        });
        const categoryDistribution = Array.from(categoryMap.entries()).map(([categoryName, totalStock]) => ({
            categoryName,
            availableCount: totalStock,
            percentage: totalAvailableProducts_sumStock > 0 ? (totalStock / totalAvailableProducts_sumStock) * 100 : 0,
        }));
        return {
            totalAvailableProducts_sumStock,
            availableWithLowStock: availableProducts.filter((p) => p.stock <= lowStockThreshold).length,
            availableNearExpiry: 0,
            lowStockAvailableDetails: availableProducts
                .filter((p) => p.stock <= lowStockThreshold)
                .map((p) => ({
                id: p.id,
                name: p.name,
                code: p.code,
                stock: p.stock,
                minStock: 15,
                category: p.categoryName || "Sin categoría",
                provider: p.providerName || "Sin proveedor",
            })),
            nearExpiryAvailableDetails: [],
            categoryDistribution,
            availabilityAnalysis: {
                totalProductsInSystem: systemTotals.reduce((sum, item) => sum + Number(item.total), 0),
                availableProducts: totalAvailableProducts_sumStock,
                notAvailableProducts: notAvailableSumStock,
                expiredProducts: 0,
                availabilityPercentage: totalInSystem > 0 ? (totalAvailableProducts_sumStock / totalInSystem) * 100 : 0,
                noAvailabilityPercentage: totalInSystem > 0 ? (notAvailableSumStock / totalInSystem) * 100 : 0,
            },
            countRegistryAvailableProducts
        };
    }
    async createEnhancedDocumentDefinition(reportData, stats, options) {
        let logoData = null;
        try {
            logoData = await this.dashboardReportService.loadLogoWithRetry();
        }
        catch (error) {
            this.logger.warn("No se pudo cargar el logo:", error.message);
        }
        const styles = this.getCommonStyles();
        const content = [];
        const reportTitle = this.getReportTitle(options.supplyType);
        content.push({ text: reportTitle, style: "reportTitle" });
        this.addGeneralInfoTable(content, reportData, styles);
        this.addEnhancedStatsSection(content, stats, styles, options);
        this.addAvailabilityAnalysisSection(content, stats, styles, options);
        this.addLowStockDetailsSection(content, stats, styles, options);
        if (options.supplyType === 1 && stats.nearExpiryAvailableDetails.length > 0) {
            this.addNearExpiryDetailsSection(content, stats, styles, options);
        }
        if (stats.categoryDistribution.length > 0) {
            this.addCategoryDistributionSection(content, stats, styles, options);
        }
        this.addEnhancedRecommendationsSection(content, stats, styles, options);
        const docDefinition = {
            content,
            styles,
            defaultStyle: { font: "Roboto" },
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
                text: `${this.toSentenceCase(this.getReportTitle(options.supplyType))} - Página ${currentPage} de ${pageCount}`,
                style: "footer",
            }),
        };
        return docDefinition;
    }
    addEnhancedStatsSection(content, stats, styles, options) {
        const supplyType = this.getSupplyTypeName(options.supplyType);
        content.push({ text: `Estadísticas de ${supplyType} Disponibles en el Mes`, style: "sectionTitle" });
        const baseStats = [
            [
                { text: `Total ${supplyType} (Disponibles, No Disponibles, Pròximos a vencer, Caducados):`, style: "tableCellLabel" },
                { text: stats.availabilityAnalysis.totalProductsInSystem, style: "tableCellLabel" },
            ],
            [
                { text: `Total ${supplyType} Disponibles (Disponibles, Pròximos a vencer):`, style: "tableCellLabel" },
                { text: stats.totalAvailableProducts_sumStock.toString(), style: "metricValue" },
            ],
            [
                { text: `Artículos Disponibles con Stock Bajo:`, style: "tableCellLabel" },
                {
                    text: stats.availableWithLowStock.toString(),
                    style: stats.availableWithLowStock > 0 ? "errorValue" : "tableCellValue",
                },
                { text: "Requiere atención", style: stats.availableWithLowStock > 0 ? "errorValue" : "tableCellValue" },
            ],
        ];
        if (options.supplyType === 1 && stats.availableNearExpiry > 0) {
            baseStats.push([
                { text: "Disponibles Próximos a Vencer:", style: "tableCellLabel" },
                { text: stats.availableNearExpiry.toString(), style: "warningValue" },
                { text: "Monitorear", style: "warningValue" },
            ]);
        }
        content.push({
            table: {
                widths: ["75%", "25%", "25%"],
                body: [
                    [
                        { text: "Métrica", style: "tableHeader" },
                        { text: "Cantidad", style: "tableHeader" },
                    ],
                    ...baseStats,
                ],
            },
            layout: this.getTableLayout(),
            margin: [0, 10, 0, 20],
        });
    }
    addAvailabilityAnalysisSection(content, stats, styles, options) {
        const supplyType = this.getSupplyTypeName(options.supplyType);
        content.push({ text: "Análisis de Disponibilidad en el Sistema", style: "sectionTitle" });
        content.push({
            table: {
                widths: ["50%", "25%", "25%"],
                body: [
                    [
                        { text: "Estado", style: "tableHeader" },
                        { text: "Cantidad", style: "tableHeader" },
                        { text: "Porcentaje", style: "tableHeader" },
                    ],
                    [
                        { text: `${supplyType} Disponibles (Disponibles, Pròximos a vencer):`, style: "tableCellLabel" },
                        { text: stats.availabilityAnalysis.availableProducts.toString(), style: "metricValue" },
                        { text: `${stats.availabilityAnalysis.availabilityPercentage.toFixed(1)}%`, style: "metricValue" },
                    ],
                    [
                        { text: `${supplyType} No Disponibles`, style: "tableCellLabel" },
                        { text: stats.availabilityAnalysis.notAvailableProducts.toString(), style: "errorValue" },
                        { text: `${(stats.availabilityAnalysis.noAvailabilityPercentage).toFixed(1)}%`, style: "errorValue" },
                    ],
                ],
            },
            layout: this.getTableLayout(),
            margin: [0, 10, 0, 20],
        });
    }
    addLowStockDetailsSection(content, stats, styles, options) {
        const supplyType = this.getSupplyTypeName(options.supplyType);
        if (stats.lowStockAvailableDetails.length === 0)
            return;
        content.push({ text: `${supplyType} Disponibles con Stock Bajo - Requieren Reabastecimiento`, style: "sectionTitle" });
        const tableBody = [
            [
                { text: "Código", style: "tableHeader" },
                { text: "Producto", style: "tableHeader" },
                { text: "Stock Actual", style: "tableHeader" },
                { text: "Stock Mínimo", style: "tableHeader" },
                { text: "Proveedor", style: "tableHeader" },
            ],
            ...stats.lowStockAvailableDetails.map((item) => [
                { text: item.code, style: "tableCellValue" },
                { text: this.toSentenceCase(item.name), style: "tableCellValue" },
                { text: item.stock.toString(), style: "errorValue" },
                { text: item.minStock.toString(), style: "tableCellValue" },
                { text: this.toSentenceCase(item.provider), style: "tableCellValue" },
            ]),
        ];
        content.push({
            table: {
                widths: ["15%", "35%", "15%", "15%", "20%"],
                body: tableBody,
            },
            layout: this.getTableLayout(),
            margin: [0, 10, 0, 20],
        });
    }
    addNearExpiryDetailsSection(content, stats, styles, options) {
        const supplyType = this.getSupplyTypeName(options.supplyType);
        content.push({ text: `${supplyType} Disponibles Próximos a Vencer (30 días)`, style: "sectionTitle" });
        const tableBody = [
            [
                { text: "Código", style: "tableHeader" },
                { text: "Producto", style: "tableHeader" },
                { text: "Fecha Vencimiento", style: "tableHeader" },
                { text: "Días Restantes", style: "tableHeader" },
            ],
            ...stats.nearExpiryAvailableDetails.map((item) => [
                { text: item.code, style: "tableCellValue" },
                { text: item.name, style: "tableCellValue" },
                { text: item.expirationDate, style: "warningValue" },
                { text: item.daysToExpiry.toString(), style: "warningValue" },
            ]),
        ];
        content.push({
            table: {
                widths: ["15%", "45%", "25%", "15%"],
                body: tableBody,
            },
            layout: this.getTableLayout(),
            margin: [0, 10, 0, 20],
        });
    }
    addCategoryDistributionSection(content, stats, styles, options) {
        const supplyType = this.getSupplyTypeName(options.supplyType);
        content.push({ text: `Distribución por Categorías (Solo ${supplyType} Disponibles)`, style: "sectionTitle" });
        const tableBody = [
            [
                { text: "Categoría", style: "tableHeader" },
                { text: "Productos Disponibles", style: "tableHeader" },
                { text: "Porcentaje", style: "tableHeader" },
            ],
            ...stats.categoryDistribution.map((item) => [
                { text: this.toSentenceCase(item.categoryName), style: "tableCellValue" },
                { text: item.availableCount.toString(), style: "tableCellValue" },
                { text: `${item.percentage.toFixed(1)}%`, style: "tableCellValue" },
            ]),
        ];
        content.push({
            table: {
                widths: ["50%", "25%", "25%"],
                body: tableBody,
            },
            layout: this.getTableLayout(),
            margin: [0, 10, 0, 20],
        });
    }
    addEnhancedRecommendationsSection(content, stats, styles, options) {
        const supplyType = this.getSupplyTypeName(options.supplyType);
        const recommendations = this.generateEnhancedRecommendations(stats, options);
        if (recommendations.length > 0) {
            content.push({ text: `Recomendaciones para ${supplyType} Disponibles`, style: "sectionTitle" });
            recommendations.forEach((recommendation) => {
                content.push({
                    text: `• ${recommendation}`,
                    style: "paragraph",
                    margin: [10, 2, 0, 1],
                });
            });
        }
    }
    generateEnhancedRecommendations(stats, options) {
        const recommendations = [];
        const supplyType = this.getSupplyTypeName(options.supplyType);
        recommendations.push(`Disponibilidad actual: El ${stats.availabilityAnalysis.availabilityPercentage.toFixed(1)}% de ${supplyType.toLowerCase()} en el sistema están disponibles`);
        if (stats.availableWithLowStock > 0) {
            recommendations.push(`URGENTE: Reabastecer ${stats.availableWithLowStock} artículos(s) disponible(s) con stock bajo`);
            console.log("-> lowStockAvailableDetails ", stats.lowStockAvailableDetails);
            stats.lowStockAvailableDetails.forEach((product) => {
                const needed = product.minStock - product.stock;
                recommendations.push(`  - ${this.toSentenceCase(product.name)}: Solicitar ${needed} unidades adicionales al proveedor ${product.provider}`);
            });
        }
        else {
            recommendations.push(`Todos los ${supplyType.toLowerCase()} disponibles tienen stock adecuado`);
        }
        if (options.supplyType === 1 && stats.availableNearExpiry > 0) {
            recommendations.push(`ATENCIÓN: Monitorear ${stats.availableNearExpiry} medicamento(s) disponible(s) que vencen en los próximos 30 días`);
        }
        console.log("stats.availableWithLowStock  ", stats.availableWithLowStock);
        console.log("stats.countRegistryAvailableProducts ", stats.countRegistryAvailableProducts);
        if (stats.totalAvailableProducts_sumStock > 0) {
            const lowStockPercentage = (stats.availableWithLowStock / stats.countRegistryAvailableProducts) * 100;
            if (lowStockPercentage > 15) {
                recommendations.push(`RECOMENDACIÓN: El ${lowStockPercentage.toFixed(1)}% de ${supplyType.toLowerCase()} disponibles tienen stock bajo. Considerar revisar políticas de reabastecimiento`);
            }
        }
        return recommendations;
    }
    async getMedicalSupplyStats(options) {
        const enhancedStats = await this.getEnhancedMedicalSupplyStats(options);
        return {
            totalItems: enhancedStats.totalAvailableProducts_sumStock,
            availableItems: enhancedStats.totalAvailableProducts_sumStock,
            lowStockItems: enhancedStats.availableWithLowStock,
            expiredItems: options.supplyType === 1 ? enhancedStats.availableNearExpiry : undefined,
            topItems: [],
        };
    }
    getReportTitle(supplyType) {
        switch (supplyType) {
            case 1:
                return "REPORTE ESTADÍSTICO DE MEDICAMENTOS DISPONIBLES EN EL MES";
            case 2:
                return "REPORTE ESTADÍSTICO DE UNIFORMES DISPONIBLES EN EL MES";
            case 3:
                return "REPORTE ESTADÍSTICO DE EQUIPOS ODONTOLÓGICOS DISPONIBLES EN EL MES";
            default:
                return "REPORTE ESTADÍSTICO DE INSUMOS MÉDICOS DISPONIBLES EN EL MES";
        }
    }
    generateFilename(options) {
        const today = new Date();
        const dateStr = date_utils_1.DateUtils.formatDateForFilename(today);
        let typeStr = "";
        switch (options.supplyType) {
            case 1:
                typeStr = "medicamentos-disponibles";
                break;
            case 2:
                typeStr = "uniformes-disponibles";
                break;
            case 3:
                typeStr = "equipos-odontologicos-disponibles";
                break;
        }
        return `reporte-estadistico-${typeStr}-${dateStr}.pdf`;
    }
    async getMedicationStatistics() {
        const enhancedStats = await this.getEnhancedMedicationStatistics();
        return {
            totalStockMedicamentos: enhancedStats.totalAvailableProducts_sumStock.toString(),
            stockMedicamentosDisponibles: enhancedStats.totalAvailableProducts_sumStock.toString(),
            stockMedicamentosCaducados: "0",
            cantidadMedicamentosStockBajo: enhancedStats.availableWithLowStock,
        };
    }
    async getUniformesStatistics() {
        const enhancedStats = await this.getEnhancedUniformStatistics();
        return {
            totalStockUniformes: enhancedStats.totalAvailableProducts_sumStock.toString(),
            stockUniformesDisponibles: enhancedStats.totalAvailableProducts_sumStock.toString(),
            cantidadUniformesStockBajo: enhancedStats.availableWithLowStock,
        };
    }
    async getEquiposOdontologicosStatistics() {
        const enhancedStats = await this.getEnhancedDentalEquipmentStatistics();
        return {
            totalStockEquiposOdontologicos: enhancedStats.totalAvailableProducts_sumStock.toString(),
            stockEquiposOdontologicosDisponibles: enhancedStats.totalAvailableProducts_sumStock.toString(),
            cantidadEquiposOdontologicosStockBajo: enhancedStats.availableWithLowStock,
        };
    }
    toSentenceCase(str) {
        if (!str)
            return "";
        const lowercasedStr = str.toLowerCase();
        const firstChar = lowercasedStr.charAt(0).toUpperCase();
        const restOfString = lowercasedStr.slice(1);
        return firstChar + restOfString;
    }
};
exports.MedicalSuppliesReportService = MedicalSuppliesReportService;
exports.MedicalSuppliesReportService = MedicalSuppliesReportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase,
        medical_supplies_service_1.MedicalSuppliesService,
        dashboard_report_service_1.DashboardReportService])
], MedicalSuppliesReportService);
//# sourceMappingURL=medical-supplies-report.service.js.map