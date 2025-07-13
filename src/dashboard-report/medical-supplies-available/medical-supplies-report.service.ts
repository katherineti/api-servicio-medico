import { Inject, Injectable } from "@nestjs/common"
import type { Response } from "express"
import { BaseReportService } from "./base-report.service"
import { DateUtils } from "./date.utils"
import type {
  MedicalSupplyReportData,
  MedicalSupplyReportOptions,
  MedicalSupplyStats,
  MedicalSupplyType,
} from "./medical-supplies-report.interface"
import type { TDocumentDefinitions } from "pdfmake/interfaces"
import { count, eq, and } from "drizzle-orm"
import { productsTable, categoriesTable, typesOfProductsTable, productStatusTable, providersTable } from "src/db/schema"
import { PG_CONNECTION } from "src/constants"
import { NeonDatabase } from "drizzle-orm/neon-serverless"

// Interfaces mejoradas para estadísticas detalladas
export interface EnhancedMedicationStatistics {
  // Estadísticas básicas de productos DISPONIBLES
  totalAvailableProducts: number
  totalAvailableValue: number

  // Análisis de productos disponibles
  availableWithLowStock: number
  availableNearExpiry: number // Solo medicamentos

  // Detalles específicos de productos disponibles
  lowStockAvailableDetails: Array<{
    id: number
    name: string
    code: string
    stock: number
    minStock: number
    category: string
    provider: string
  }>

  nearExpiryAvailableDetails: Array<{
    id: number
    name: string
    code: string
    expirationDate: string
    daysToExpiry: number
    category: string
  }>

  // Distribución por categorías (solo disponibles)
  categoryDistribution: Array<{
    categoryName: string
    availableCount: number
    percentage: number
  }>

  // Análisis de disponibilidad general
  availabilityAnalysis: {
    totalProductsInSystem: number
    availableProducts: number
    availabilityPercentage: number
    notAvailableProducts: number
    expiredProducts: number
  }
}

@Injectable()
export class MedicalSuppliesReportService extends BaseReportService {
  constructor(
     @Inject(PG_CONNECTION) private db: NeonDatabase
  ) {
    super()
  }

  async generateCustomPdf(
    reportData: MedicalSupplyReportData,
    res: Response,
    options: MedicalSupplyReportOptions,
  ): Promise<void> {
    try {
      this.logger.log(`Generando PDF mejorado de ${reportData.typeName} disponibles`)

      const enhancedStats = await this.getEnhancedMedicalSupplyStats(options)
      const docDefinition = await this.createEnhancedDocumentDefinition(reportData, enhancedStats, options)

      const filename = this.generateFilename(options)
      await this.generatePdfResponse(docDefinition, res, filename)
    } catch (error) {
      this.logger.error(`Error al generar PDF mejorado de insumos médicos disponibles:`, error)
      throw error
    }
  }

  // Método principal mejorado para obtener estadísticas detalladas
  async getEnhancedMedicalSupplyStats(options: MedicalSupplyReportOptions): Promise<EnhancedMedicationStatistics> {
    try {
      switch (options.supplyType) {
        case 1:
          return await this.getEnhancedMedicationStatistics()
        case 2:
          return await this.getEnhancedUniformStatistics()
        case 3:
          return await this.getEnhancedDentalEquipmentStatistics()
        default:
          throw new Error(`Tipo de insumo no válido: ${options.supplyType}`)
      }
    } catch (error) {
      this.logger.error("Error al obtener estadísticas mejoradas:", error)
      throw error
    }
  }

  // Estadísticas mejoradas para MEDICAMENTOS DISPONIBLES
  private async getEnhancedMedicationStatistics(): Promise<EnhancedMedicationStatistics> {
    const now = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    // Consulta optimizada con joins para productos DISPONIBLES
    const availableProducts = await this.db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        code: productsTable.code,
        stock: productsTable.stock,
        expirationDate: productsTable.expirationDate,
        categoryName: categoriesTable.name,
        providerName: providersTable.name,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .leftJoin(providersTable, eq(productsTable.providerId, providersTable.id))
      .leftJoin(typesOfProductsTable, eq(productsTable.type, typesOfProductsTable.id))
      .where(
        and(
          eq(typesOfProductsTable.type, "Medicamentos"),
          eq(productsTable.statusId, 1), // Solo productos DISPONIBLES
        ),
      )

    // Consulta para análisis de disponibilidad general
    const systemTotals = await this.db
      .select({
        total: count(),
        status: productStatusTable.status,
      })
      .from(productsTable)
      .leftJoin(productStatusTable, eq(productsTable.statusId, productStatusTable.id))
      .leftJoin(typesOfProductsTable, eq(productsTable.type, typesOfProductsTable.id))
      .where(eq(typesOfProductsTable.type, "Medicamentos"))
      .groupBy(productStatusTable.status)

    // Procesar estadísticas
    const totalAvailableProducts = availableProducts.length
    const totalAvailableValue = totalAvailableProducts * 150 // Precio promedio

    // Productos disponibles con stock bajo
    const lowStockThreshold = 10
    const availableWithLowStock = availableProducts.filter((p) => p.stock <= lowStockThreshold).length

    // Productos disponibles próximos a vencer
    const availableNearExpiry = availableProducts.filter(
      (p) => p.expirationDate && new Date(p.expirationDate) <= thirtyDaysFromNow && new Date(p.expirationDate) > now,
    ).length

    // Detalles de productos disponibles con stock bajo
    const lowStockAvailableDetails = availableProducts
      .filter((p) => p.stock <= lowStockThreshold)
      .map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        stock: p.stock,
        minStock: 20,
        category: p.categoryName || "Sin categoría",
        provider: p.providerName || "Sin proveedor",
      }))

    // Detalles de productos disponibles próximos a vencer
    const nearExpiryAvailableDetails = availableProducts
      .filter(
        (p) => p.expirationDate && new Date(p.expirationDate) <= thirtyDaysFromNow && new Date(p.expirationDate) > now,
      )
      .map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        expirationDate: new Date(p.expirationDate!).toLocaleDateString(),
        daysToExpiry: Math.floor((new Date(p.expirationDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        category: p.categoryName || "Sin categoría",
      }))

    // Distribución por categorías (solo productos disponibles)
    const categoryMap = new Map()
    availableProducts.forEach((product) => {
      const category = product.categoryName || "Sin categoría"
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
    })

    const categoryDistribution = Array.from(categoryMap.entries()).map(([categoryName, count]) => ({
      categoryName,
      availableCount: count,
      percentage: totalAvailableProducts > 0 ? (count / totalAvailableProducts) * 100 : 0,
    }))

    // Análisis de disponibilidad general
    const totalInSystem = systemTotals.reduce((sum, item) => sum + item.total, 0)
    const expiredCount = systemTotals.find((item) => item.status === "Caducado")?.total || 0
    const notAvailableCount = systemTotals.find((item) => item.status === "No Disponible")?.total || 0

    const availabilityAnalysis = {
      totalProductsInSystem: totalInSystem,
      availableProducts: totalAvailableProducts,
      availabilityPercentage: totalInSystem > 0 ? (totalAvailableProducts / totalInSystem) * 100 : 0,
      notAvailableProducts: notAvailableCount,
      expiredProducts: expiredCount,
    }

    return {
      totalAvailableProducts,
      totalAvailableValue,
      availableWithLowStock,
      availableNearExpiry,
      lowStockAvailableDetails,
      nearExpiryAvailableDetails,
      categoryDistribution,
      availabilityAnalysis,
    }
  }

  // Estadísticas mejoradas para UNIFORMES DISPONIBLES
  private async getEnhancedUniformStatistics(): Promise<EnhancedMedicationStatistics> {
    const availableProducts = await this.db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        code: productsTable.code,
        stock: productsTable.stock,
        expirationDate: productsTable.expirationDate,
        categoryName: categoriesTable.name,
        providerName: providersTable.name,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .leftJoin(providersTable, eq(productsTable.providerId, providersTable.id))
      .leftJoin(typesOfProductsTable, eq(productsTable.type, typesOfProductsTable.id))
      .where(
        and(
          eq(typesOfProductsTable.type, "Uniformes"),
          eq(productsTable.statusId, 1), // Solo productos DISPONIBLES
        ),
      )

    const totalAvailableProducts = availableProducts.length
    const lowStockThreshold = 5 // Menor threshold para uniformes

    return {
      totalAvailableProducts,
      totalAvailableValue: totalAvailableProducts * 75,
      availableWithLowStock: availableProducts.filter((p) => p.stock <= lowStockThreshold).length,
      availableNearExpiry: 0, // Uniformes no vencen
      lowStockAvailableDetails: availableProducts
        .filter((p) => p.stock <= lowStockThreshold)
        .map((p) => ({
          id: p.id,
          name: p.name,
          code: p.code,
          stock: p.stock,
          minStock: 10,
          category: p.categoryName || "Sin categoría",
          provider: p.providerName || "Sin proveedor",
        })),
      nearExpiryAvailableDetails: [], // No aplica para uniformes
      categoryDistribution: [], // Implementar según necesidad
      availabilityAnalysis: {
        totalProductsInSystem: 0, // Implementar consulta
        availableProducts: totalAvailableProducts,
        availabilityPercentage: 0,
        notAvailableProducts: 0,
        expiredProducts: 0,
      },
    }
  }

  // Estadísticas mejoradas para EQUIPOS ODONTOLÓGICOS DISPONIBLES
  private async getEnhancedDentalEquipmentStatistics(): Promise<EnhancedMedicationStatistics> {
    const availableProducts = await this.db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        code: productsTable.code,
        stock: productsTable.stock,
        expirationDate: productsTable.expirationDate,
        categoryName: categoriesTable.name,
        providerName: providersTable.name,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .leftJoin(providersTable, eq(productsTable.providerId, providersTable.id))
      .leftJoin(typesOfProductsTable, eq(productsTable.type, typesOfProductsTable.id))
      .where(
        and(
          eq(typesOfProductsTable.type, "Equipos odontologicos"),
          eq(productsTable.statusId, 1), // Solo productos DISPONIBLES
        ),
      )

    const totalAvailableProducts = availableProducts.length
    const lowStockThreshold = 2 // Muy bajo para equipos costosos

    return {
      totalAvailableProducts,
      totalAvailableValue: totalAvailableProducts * 500,
      availableWithLowStock: availableProducts.filter((p) => p.stock <= lowStockThreshold).length,
      availableNearExpiry: 0, // Equipos no vencen típicamente
      lowStockAvailableDetails: availableProducts
        .filter((p) => p.stock <= lowStockThreshold)
        .map((p) => ({
          id: p.id,
          name: p.name,
          code: p.code,
          stock: p.stock,
          minStock: 3,
          category: p.categoryName || "Sin categoría",
          provider: p.providerName || "Sin proveedor",
        })),
      nearExpiryAvailableDetails: [],
      categoryDistribution: [],
      availabilityAnalysis: {
        totalProductsInSystem: 0,
        availableProducts: totalAvailableProducts,
        availabilityPercentage: 0,
        notAvailableProducts: 0,
        expiredProducts: 0,
      },
    }
  }

  // Método mejorado para crear documento PDF con más información
  private async createEnhancedDocumentDefinition(
    reportData: MedicalSupplyReportData,
    stats: EnhancedMedicationStatistics,
    options: MedicalSupplyReportOptions,
  ): Promise<TDocumentDefinitions> {
    const styles = this.getCommonStyles()
    const content: any[] = []

    // Logo
    const logoData = await this.loadLogo()
    if (logoData) {
      content.push({
        image: `data:image/jpeg;base64,${logoData.toString("base64")}`,
        maxWidth: 515,
        maxHeight: 150,
        alignment: "center",
        margin: [0, 0, 0, 20],
      })
    }

    // Título mejorado
    const title = this.getReportTitle(options.supplyType)
    content.push({ text: title, style: "reportTitle" })

    // Información general
    this.addGeneralInfoTable(content, reportData, styles)

    // Estadísticas mejoradas de productos disponibles
    this.addEnhancedStatsSection(content, stats, styles, options)

    // Análisis de disponibilidad
    this.addAvailabilityAnalysisSection(content, stats, styles)

    // Productos disponibles con stock bajo (detalle)
    this.addLowStockDetailsSection(content, stats, styles, options)

    // Productos disponibles próximos a vencer (solo medicamentos)
    if (options.supplyType === 1 && stats.nearExpiryAvailableDetails.length > 0) {
      this.addNearExpiryDetailsSection(content, stats, styles)
    }

    // Distribución por categorías
    if (stats.categoryDistribution.length > 0) {
      this.addCategoryDistributionSection(content, stats, styles)
    }

    // Recomendaciones mejoradas
    this.addEnhancedRecommendationsSection(content, stats, styles, options)

    const docDefinition: TDocumentDefinitions = {
      content,
      styles,
      defaultStyle: { font: "Roboto" },
      pageSize: "A4",
      pageMargins: [40, 60, 40, 60] as [number, number, number, number],
      footer: (currentPage: number, pageCount: number) => ({
        text: `${this.toSentenceCase(this.getReportTitle(options.supplyType))} - Página ${currentPage} de ${pageCount}`,
        style: "footer",
      }),
    }

    return docDefinition
  }

  // Sección mejorada de estadísticas
  private addEnhancedStatsSection(
    content: any[],
    stats: EnhancedMedicationStatistics,
    styles: any,
    options: MedicalSupplyReportOptions,
  ) {
    const supplyType = this.getSupplyTypeName(options.supplyType)
    content.push({ text: "Estadísticas de Productos Disponibles", style: "sectionTitle" })

    const baseStats = [
      [
        { text: `Total ${supplyType} Disponibles:`, style: "tableCellLabel" },
        { text: stats.totalAvailableProducts.toString(), style: "metricValue" },
        { text: `$${stats.totalAvailableValue.toLocaleString()}`, style: "tableCellValue" },
      ],
      [
        { text: `Disponibles con Stock Bajo:`, style: "tableCellLabel" },
        {
          text: stats.availableWithLowStock.toString(),
          style: stats.availableWithLowStock > 0 ? "errorValue" : "tableCellValue",
        },
        { text: "Requiere atención", style: stats.availableWithLowStock > 0 ? "errorValue" : "tableCellValue" },
      ],
    ]

    if (options.supplyType === 1 && stats.availableNearExpiry > 0) {
      baseStats.push([
        { text: "Disponibles Próximos a Vencer:", style: "tableCellLabel" },
        { text: stats.availableNearExpiry.toString(), style: "warningValue" },
        { text: "Monitorear", style: "warningValue" },
      ])
    }

    content.push({
      table: {
        widths: ["50%", "25%", "25%"],
        body: [
          [
            { text: "Métrica", style: "tableHeader" },
            { text: "Cantidad", style: "tableHeader" },
            { text: "Valor/Estado", style: "tableHeader" },
          ],
          ...baseStats,
        ],
      },
      layout: this.getTableLayout(),
      margin: [0, 10, 0, 20],
    })
  }

  // Nueva sección de análisis de disponibilidad
  private addAvailabilityAnalysisSection(content: any[], stats: EnhancedMedicationStatistics, styles: any) {
    content.push({ text: "Análisis de Disponibilidad en el Sistema", style: "sectionTitle" })

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
            { text: "Productos Disponibles", style: "tableCellLabel" },
            { text: stats.availabilityAnalysis.availableProducts.toString(), style: "metricValue" },
            { text: `${stats.availabilityAnalysis.availabilityPercentage.toFixed(1)}%`, style: "metricValue" },
          ],
          [
            { text: "Productos No Disponibles", style: "tableCellLabel" },
            { text: stats.availabilityAnalysis.notAvailableProducts.toString(), style: "errorValue" },
            { text: `${(100 - stats.availabilityAnalysis.availabilityPercentage).toFixed(1)}%`, style: "errorValue" },
          ],
        ],
      },
      layout: this.getTableLayout(),
      margin: [0, 10, 0, 20],
    })
  }

  // Nueva sección de detalles de stock bajo
  private addLowStockDetailsSection(
    content: any[],
    stats: EnhancedMedicationStatistics,
    styles: any,
    options: MedicalSupplyReportOptions,
  ) {
    if (stats.lowStockAvailableDetails.length === 0) return

    content.push({ text: "Productos Disponibles con Stock Bajo - Requieren Reabastecimiento", style: "sectionTitle" })

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
        { text: item.name, style: "tableCellValue" },
        { text: item.stock.toString(), style: "errorValue" },
        { text: item.minStock.toString(), style: "tableCellValue" },
        { text: item.provider, style: "tableCellValue" },
      ]),
    ]

    content.push({
      table: {
        widths: ["15%", "35%", "15%", "15%", "20%"],
        body: tableBody,
      },
      layout: this.getTableLayout(),
      margin: [0, 10, 0, 20],
    })
  }

  // Nueva sección de productos próximos a vencer
  private addNearExpiryDetailsSection(content: any[], stats: EnhancedMedicationStatistics, styles: any) {
    content.push({ text: "Productos Disponibles Próximos a Vencer (30 días)", style: "sectionTitle" })

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
    ]

    content.push({
      table: {
        widths: ["15%", "45%", "25%", "15%"],
        body: tableBody,
      },
      layout: this.getTableLayout(),
      margin: [0, 10, 0, 20],
    })
  }

  // Nueva sección de distribución por categorías
  private addCategoryDistributionSection(content: any[], stats: EnhancedMedicationStatistics, styles: any) {
    content.push({ text: "Distribución por Categorías (Solo Productos Disponibles)", style: "sectionTitle" })

    const tableBody = [
      [
        { text: "Categoría", style: "tableHeader" },
        { text: "Productos Disponibles", style: "tableHeader" },
        { text: "Porcentaje", style: "tableHeader" },
      ],
      ...stats.categoryDistribution.map((item) => [
        { text: item.categoryName, style: "tableCellValue" },
        { text: item.availableCount.toString(), style: "tableCellValue" },
        { text: `${item.percentage.toFixed(1)}%`, style: "tableCellValue" },
      ]),
    ]

    content.push({
      table: {
        widths: ["50%", "25%", "25%"],
        body: tableBody,
      },
      layout: this.getTableLayout(),
      margin: [0, 10, 0, 20],
    })
  }

  // Recomendaciones mejoradas y específicas
  private addEnhancedRecommendationsSection(
    content: any[],
    stats: EnhancedMedicationStatistics,
    styles: any,
    options: MedicalSupplyReportOptions,
  ) {
    const recommendations = this.generateEnhancedRecommendations(stats, options)

    if (recommendations.length > 0) {
      content.push({ text: "Recomendaciones para Productos Disponibles", style: "sectionTitle" })

      recommendations.forEach((recommendation) => {
        content.push({
          text: `• ${recommendation}`,
          style: "paragraph",
          margin: [10, 2, 0, 2],
        })
      })
    }
  }

  // Recomendaciones mejoradas
  private generateEnhancedRecommendations(
    stats: EnhancedMedicationStatistics,
    options: MedicalSupplyReportOptions,
  ): string[] {
    const recommendations: string[] = []
    const supplyType = this.getSupplyTypeName(options.supplyType)

    // Disponibilidad general
    recommendations.push(
      `Disponibilidad actual: ${stats.availabilityAnalysis.availabilityPercentage.toFixed(1)}% de ${supplyType.toLowerCase()} en el sistema están disponibles`,
    )

    // Stock bajo
    if (stats.availableWithLowStock > 0) {
      recommendations.push(
        `URGENTE: Reabastecer ${stats.availableWithLowStock} producto(s) disponible(s) con stock bajo`,
      )

      // Recomendaciones específicas por producto
      stats.lowStockAvailableDetails.slice(0, 3).forEach((product) => {
        const needed = product.minStock - product.stock
        recommendations.push(`  - ${product.name}: Solicitar ${needed} unidades adicionales a ${product.provider}`)
      })
    } else {
      recommendations.push(`✓ Todos los productos disponibles tienen stock adecuado`)
    }

    // Próximos a vencer (solo medicamentos)
    if (options.supplyType === 1 && stats.availableNearExpiry > 0) {
      recommendations.push(
        `ATENCIÓN: Monitorear ${stats.availableNearExpiry} medicamento(s) disponible(s) que vencen en los próximos 30 días`,
      )
    }

    // Valor del inventario
    recommendations.push(`Valor total de productos disponibles: $${stats.totalAvailableValue.toLocaleString()}`)

    // Optimización
    if (stats.totalAvailableProducts > 0) {
      const lowStockPercentage = (stats.availableWithLowStock / stats.totalAvailableProducts) * 100
      if (lowStockPercentage > 20) {
        recommendations.push(
          `RECOMENDACIÓN: ${lowStockPercentage.toFixed(1)}% de productos disponibles tienen stock bajo. Considerar revisar políticas de reabastecimiento`,
        )
      }
    }

    return recommendations
  }

  // Mantener métodos existentes para compatibilidad
  async getMedicalSupplyStats(options: MedicalSupplyReportOptions): Promise<MedicalSupplyStats> {
    const enhancedStats = await this.getEnhancedMedicalSupplyStats(options)

    // Convertir estadísticas mejoradas al formato original para compatibilidad
    return {
      totalItems: enhancedStats.totalAvailableProducts,
      availableItems: enhancedStats.totalAvailableProducts,
      lowStockItems: enhancedStats.availableWithLowStock,
      expiredItems: options.supplyType === 1 ? enhancedStats.availableNearExpiry : undefined,
      totalValue: enhancedStats.totalAvailableValue,
      averagePrice:
        enhancedStats.totalAvailableProducts > 0
          ? enhancedStats.totalAvailableValue / enhancedStats.totalAvailableProducts
          : 0,
      topItems: [], // Implementar si es necesario
    }
  }

  // Métodos auxiliares existentes (mantener sin cambios)
  private getReportTitle(supplyType: MedicalSupplyType): string {
    switch (supplyType) {
      case 1:
        return "REPORTE ESTADÍSTICO DE MEDICAMENTOS DISPONIBLES"
      case 2:
        return "REPORTE ESTADÍSTICO DE UNIFORMES DISPONIBLES"
      case 3:
        return "REPORTE ESTADÍSTICO DE EQUIPOS ODONTOLÓGICOS DISPONIBLES"
      default:
        return "REPORTE ESTADÍSTICO DE INSUMOS MÉDICOS DISPONIBLES"
    }
  }

  private generateFilename(options: MedicalSupplyReportOptions): string {
    const today = new Date()
    const dateStr = DateUtils.formatDateForFilename(today)

    let typeStr = ""
    switch (options.supplyType) {
      case 1:
        typeStr = "medicamentos-disponibles"
        break
      case 2:
        typeStr = "uniformes-disponibles"
        break
      case 3:
        typeStr = "equipos-odontologicos-disponibles"
        break
    }

    return `reporte-estadistico-${typeStr}-${dateStr}.pdf`
  }

  private async loadLogo(): Promise<Buffer | null> {
    return null
  }

  // Métodos de compatibilidad (mantener para no romper funcionalidad existente)
  public async getMedicationStatistics() {
    const enhancedStats = await this.getEnhancedMedicationStatistics()
    return {
      totalStockMedicamentos: enhancedStats.totalAvailableProducts.toString(),
      stockMedicamentosDisponibles: enhancedStats.totalAvailableProducts.toString(),
      stockMedicamentosCaducados: "0", // Ya no relevante para productos disponibles
      cantidadMedicamentosStockBajo: enhancedStats.availableWithLowStock,
    }
  }

  public async getUniformesStatistics() {
    const enhancedStats = await this.getEnhancedUniformStatistics()
    return {
      totalStockUniformes: enhancedStats.totalAvailableProducts.toString(),
      stockUniformesDisponibles: enhancedStats.totalAvailableProducts.toString(),
      cantidadUniformesStockBajo: enhancedStats.availableWithLowStock,
    }
  }

  public async getEquiposOdontologicosStatistics() {
    const enhancedStats = await this.getEnhancedDentalEquipmentStatistics()
    return {
      totalStockEquiposOdontologicos: enhancedStats.totalAvailableProducts.toString(),
      stockEquiposOdontologicosDisponibles: enhancedStats.totalAvailableProducts.toString(),
      cantidadEquiposOdontologicosStockBajo: enhancedStats.availableWithLowStock,
    }
  }

  toSentenceCase(str: string): string {
    if (!str) return ""
    const lowercasedStr = str.toLowerCase()
    const firstChar = lowercasedStr.charAt(0).toUpperCase()
    const restOfString = lowercasedStr.slice(1)
    return firstChar + restOfString
  }
}
