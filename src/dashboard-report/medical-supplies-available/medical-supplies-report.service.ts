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
import type { NeonDatabase } from "drizzle-orm/neon-serverless"
import type { TDocumentDefinitions } from "pdfmake/interfaces"
import { PG_CONNECTION } from "src/constants"
import { MedicalSuppliesService } from "src/medical-supplies/medical-supplies.service"
import { count, sql, sum } from "drizzle-orm"
import { productsTable } from "src/db/schema"

interface medicationStatistics{
  totalStockMedicamentos: string,
  stockMedicamentosDisponibles: string,
  stockMedicamentosCaducados: string,
  cantidadMedicamentosStockBajo: number
}
interface uniformesStatistics{
  totalStockUniformes: string,
  stockUniformesDisponibles: string,
  // stockUniformesCaducados: string,
  cantidadUniformesStockBajo: number
}
interface equiposodontologicosStatistics{
  totalStockEquiposOdontologicos: string,
  stockEquiposOdontologicosDisponibles: string,
  // stockEquiposOdontologicosCaducados: string,
  cantidadEquiposOdontologicosStockBajo: number
}

@Injectable()
export class MedicalSuppliesReportService extends BaseReportService {
  constructor(
    @Inject(PG_CONNECTION) private db: NeonDatabase,
    private readonly medicalSuppliesService: MedicalSuppliesService) {
    super()
  }

  async generateCustomPdf(
    reportData: MedicalSupplyReportData,
    res: Response,
    options: MedicalSupplyReportOptions,
  ): Promise<void> {
    try {
      this.logger.log(`Generando PDF de insumos médicos disponibles: ${reportData.typeName}`)

      const stats = await this.getMedicalSupplyStats(options)
      const docDefinition = await this.createConditionalDocumentDefinition(reportData, stats, options)

      const filename = this.generateFilename(options)
      await this.generatePdfResponse(docDefinition, res, filename)
    } catch (error) {
      this.logger.error(`Error al generar PDF de insumos médicos disponibles:`, error)
      throw error
    }
  }

  async getMedicalSupplyStats(options: MedicalSupplyReportOptions): Promise<MedicalSupplyStats> {
    try {
      switch (options.supplyType) {
        case 1:
          return await this.getMedicamentosStats(options)
        case 2:
          return await this.getUniformesStats(options)
        case 3:
          return await this.getEquiposOdontologicosStats(options)
        default:
          throw new Error(`Tipo de insumo no válido: ${options.supplyType}`)
      }
    } catch (error) {
      this.logger.error("Error al obtener estadísticas de insumos médicos disponibles:", error)
      throw error
    }
  }

  private async getMedicamentosStats(options: MedicalSupplyReportOptions): Promise<MedicalSupplyStats> {
    console.log("await this.medicalSuppliesService.getAccumulatedStockByType() ", await this.medicalSuppliesService.getAccumulatedStockByType() );
    console.log("getMedicationStatistics()", await this.getMedicationStatistics())
    return {
      totalItems: Number((await this.getMedicationStatistics()).totalStockMedicamentos),
      availableItems: Number((await this.getMedicationStatistics()).stockMedicamentosDisponibles),
      lowStockItems: Number((await this.getMedicationStatistics()).cantidadMedicamentosStockBajo),
      expiredItems: Number((await this.getMedicationStatistics()).stockMedicamentosCaducados),
      totalValue: 0,
      averagePrice: 0,
      topItems: [],
    }
  }

  
  private async getUniformesStats(options: MedicalSupplyReportOptions): Promise<MedicalSupplyStats> {
    return {
      totalItems: Number((await this.getUniformesStatistics()).totalStockUniformes),
      availableItems: Number((await this.getUniformesStatistics()).stockUniformesDisponibles),
      lowStockItems: Number((await this.getUniformesStatistics()).cantidadUniformesStockBajo),
      totalValue: 0,
      averagePrice: 0,
      topItems: [],
    }
  }

  private async getEquiposOdontologicosStats(options: MedicalSupplyReportOptions): Promise<MedicalSupplyStats> {
    return {
      totalItems: Number((await this.getEquiposOdontologicosStatistics()).totalStockEquiposOdontologicos),
      availableItems: Number((await this.getEquiposOdontologicosStatistics()).stockEquiposOdontologicosDisponibles),
      lowStockItems: Number((await this.getEquiposOdontologicosStatistics()).cantidadEquiposOdontologicosStockBajo),
      totalValue: 0,
      averagePrice: 0,
      topItems: [],
    }
  }

  private async createConditionalDocumentDefinition(
    reportData: MedicalSupplyReportData,
    stats: MedicalSupplyStats,
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

    // Título
    const title = this.getReportTitle(options.supplyType)
    content.push({ text: title, style: "reportTitle" })

    // Información general - usando los métodos heredados
    this.addGeneralInfoTable(content, reportData, styles)
    this.addConditionalStatsSection(content, stats, styles, options)
    this.addTopItemsTable(content, stats.topItems, styles, options)
    this.addRecommendationsSection(content, stats, styles, options)

    const docDefinition: TDocumentDefinitions = {
      content,
      styles,
      defaultStyle: { font: "Roboto" },
      pageSize: "A4",
      pageMargins: [40, 60, 40, 60] as [number, number, number, number],
      footer: (currentPage: number, pageCount: number) => ({
        text: `${ this.toSentenceCase( this.getReportTitle(options.supplyType)) } - Página ${currentPage} de ${pageCount}`,
        style: "footer",
      }),
    }

    return docDefinition
  }

  private getReportTitle(supplyType: MedicalSupplyType): string {
    switch (supplyType) {
      case 1:
        return "REPORTE DE MEDICAMENTOS DISPONIBLES"
      case 2:
        return "REPORTE DE UNIFORMES DISPONIBLES"
      case 3:
        return "REPORTE DE EQUIPOS ODONTOLÓGICOS DISPONIBLES"
      default:
        return "REPORTE DE INSUMOS MÉDICOS"
    }
  }

  private addConditionalStatsSection(
    content: any[],
    stats: MedicalSupplyStats,
    styles: any,
    options: MedicalSupplyReportOptions,
  ) {

    const supplyType = this.getSupplyTypeName(options.supplyType)
    content.push({ text: "Estadísticas Generales", style: "sectionTitle" })

    const baseStats = [
      [
        { text: `Total de ${supplyType}:`, style: "tableCellLabel" },
        { text: stats.totalItems.toString(), style: "tableCellValue" },
      ],
      [
        { text: `${supplyType} Disponibles:`, style: "tableCellLabel" },
        { text: stats.availableItems.toString(), style: "metricValue" },
      ],
      [
        { text: `${supplyType} con Stock Bajo:`, style: "tableCellLabel" },
        { text: stats.lowStockItems.toString(), style: stats.lowStockItems > 0 ? "errorValue" : "tableCellValue" },
      ],
/*       [
        { text: "Valor Total Inventario:", style: "tableCellLabel" },
        { text: `$${stats.totalValue.toLocaleString()}`, style: "tableCellValue" },
      ], */
    ]

    if (options.supplyType === 1 && stats.expiredItems !== undefined) {
      baseStats.splice(3, 0, [
        { text: "Medicamentos Vencidos:", style: "tableCellLabel" },
        { text: stats.expiredItems.toString(), style: stats.expiredItems > 0 ? "errorValue" : "tableCellValue" },
      ])
    }

    content.push({
      table: {
        widths: ["60%", "40%"],
        body: baseStats,
      },
      layout: this.getTableLayout(),
      margin: [0, 10, 0, 20],
    })
  }

  private addTopItemsTable(content: any[], topItems: any[], styles: any, options: MedicalSupplyReportOptions) {
    if (topItems.length === 0) return

    content.push({ text: "Items Principales", style: "sectionTitle" })

    const headers = ["Nombre", "Cantidad", "Valor", "Estado"]
    if (options.supplyType === 1) {
      headers.push("Vencimiento")
    }

    const tableBody = [
      headers.map((header) => ({ text: header, style: "tableHeader" })),
      ...topItems.map((item) => {
        const row = [
          { text: item.name, style: "tableCellValue" },
          { text: item.quantity.toString(), style: "tableCellValue" },
          { text: `$${item.value.toLocaleString()}`, style: "tableCellValue" },
          { text: this.getStatusText(item.status), style: this.getStatusStyle(item.status) },
        ]

        if (options.supplyType === 1) {
          row.push({ text: item.expirationDate || "N/A", style: "tableCellValue" })
        }

        return row
      }),
    ]

    content.push({
      table: {
        widths: options.supplyType === 1 ? ["30%", "15%", "20%", "15%", "20%"] : ["35%", "20%", "25%", "20%"],
        body: tableBody,
      },
      layout: this.getTableLayout(),
      margin: [0, 10, 0, 20],
    })
  }

  private addRecommendationsSection(
    content: any[],
    stats: MedicalSupplyStats,
    styles: any,
    options: MedicalSupplyReportOptions,
  ) {
    const recommendations = this.generateRecommendations(stats, options)

    if (recommendations.length > 0) {
      content.push({ text: "Recomendaciones", style: "sectionTitle" })

      recommendations.forEach((recommendation) => {
        content.push({
          text: `• ${recommendation}`,
          style: "paragraph",
          margin: [10, 2, 0, 2],
        })
      })
    }
  }

  private generateRecommendations(stats: MedicalSupplyStats, options: MedicalSupplyReportOptions): string[] {
    const recommendations: string[] = []

    if (stats.lowStockItems > 0) {
      // recommendations.push(`Se recomienda reabastecer ${stats.lowStockItems} items con stock bajo`)
      recommendations.push(`Se recomienda reabastecer ${stats.lowStockItems} artículo(s) con stock bajo`)
    }

    if (options.supplyType === 1 && stats.expiredItems && stats.expiredItems > 0) {
      recommendations.push(`Revisar y retirar ${stats.expiredItems} medicamentos vencidos del inventario`)
    }

    if (stats.availableItems === 0) {
      recommendations.push("URGENTE: No hay artículos disponibles en inventario")
    }

    return recommendations
  }

  private getStatusText(status: string): string {
    switch (status) {
      case "available":
        return "Disponible"
      case "low_stock":
        return "Stock Bajo"
      case "expired":
        return "Vencido"
      default:
        return "Desconocido"
    }
  }

  private getStatusStyle(status: string): string {
    switch (status) {
      case "available":
        return "tableCellValue"
      case "low_stock":
        return "warningValue"
      case "expired":
        return "errorValue"
      default:
        return "tableCellValue"
    }
  }

  private generateFilename(options: MedicalSupplyReportOptions): string {
    const today = new Date()
    const dateStr = DateUtils.formatDateForFilename(today)

    let typeStr = ""
    switch (options.supplyType) {
      case 1:
        typeStr = "medicamentos"
        break
      case 2:
        typeStr = "uniformes"
        break
      case 3:
        typeStr = "equipos-odontologicos"
        break
    }

    return `reporte-${typeStr}-${dateStr}.pdf`
  }

  private async loadLogo(): Promise<Buffer | null> {
    return null
  }

//data
  public async getMedicationStatistics(): Promise<medicationStatistics> {
    const result = await this.db
      .select({
        totalStockMedicamentos: sum(
          sql`CASE WHEN ${productsTable.type} = 1 THEN ${productsTable.stock} ELSE 0 END`
        ).as('total_stock_medicamentos'),
        stockMedicamentosDisponibles: sum(
          sql`CASE WHEN ${productsTable.type} = 1 AND ${productsTable.statusId} = 1 THEN ${productsTable.stock} ELSE 0 END`
        ).as('stock_medicamentos_disponibles'),
        stockMedicamentosCaducados: sum(
          sql`CASE WHEN ${productsTable.type} = 1 AND ${productsTable.statusId} = 4 THEN ${productsTable.stock} ELSE 0 END`
        ).as('stock_medicamentos_caducados'),
        cantidadMedicamentosStockBajo: count(
          sql`CASE WHEN ${productsTable.type} = 1 AND ${productsTable.stock} < 16 AND ${productsTable.statusId} = 1 THEN ${productsTable.id} ELSE NULL END`
        ).as('cantidad_medicamentos_stock_bajo'),
      })
      .from(productsTable);

    // Drizzle devuelve un array, y como esta consulta sin GROUP BY
    // siempre devuelve un solo resultado, tomamos el primer elemento.
    return result[0];
  }
  public async getUniformesStatistics(): Promise<uniformesStatistics> {
    const result = await this.db
      .select({
        totalStockUniformes: sum(
          sql`CASE WHEN ${productsTable.type} = 2 THEN ${productsTable.stock} ELSE 0 END`
        ).as('total_stock_uniformes'),
        stockUniformesDisponibles: sum(
          sql`CASE WHEN ${productsTable.type} = 2 AND ${productsTable.statusId} = 1 THEN ${productsTable.stock} ELSE 0 END`
        ).as('stock_uniformes_disponibles'),
/*         stockUniformesCaducados: sum(
          sql`CASE WHEN ${productsTable.type} = 2 AND ${productsTable.statusId} = 4 THEN ${productsTable.stock} ELSE 0 END`
        ).as('stock_uniformes_caducados'), */
        cantidadUniformesStockBajo: count(
          sql`CASE WHEN ${productsTable.type} = 2 AND ${productsTable.stock} < 16 AND ${productsTable.statusId} = 1 THEN ${productsTable.id} ELSE NULL END`
        ).as('cantidad_uniformes_stock_bajo'),
      })
      .from(productsTable);

    // Drizzle devuelve un array, y como esta consulta sin GROUP BY
    // siempre devuelve un solo resultado, tomamos el primer elemento.
    return result[0];
  }
  public async getEquiposOdontologicosStatistics(): Promise<equiposodontologicosStatistics> {
    const result = await this.db
      .select({
        totalStockEquiposOdontologicos: sum(
          sql`CASE WHEN ${productsTable.type} = 3 THEN ${productsTable.stock} ELSE 0 END`
        ).as('total_stock_equiposOdontologicos'),
        stockEquiposOdontologicosDisponibles: sum(
          sql`CASE WHEN ${productsTable.type} = 3 AND ${productsTable.statusId} = 1 THEN ${productsTable.stock} ELSE 0 END`
        ).as('stock_equiposOdontologicos_disponibles'),
        /* stockEquiposOdontologicosCaducados: sum(
          sql`CASE WHEN ${productsTable.type} = 3 AND ${productsTable.statusId} = 4 THEN ${productsTable.stock} ELSE 0 END`
        ).as('stock_equiposOdontologicos_caducados'), */
        cantidadEquiposOdontologicosStockBajo: count(
          sql`CASE WHEN ${productsTable.type} = 3 AND ${productsTable.stock} < 16 AND ${productsTable.statusId} = 1 THEN ${productsTable.id} ELSE NULL END`
        ).as('cantidad_equiposOdontologicos_stock_bajo'),
      })
      .from(productsTable);

    // Drizzle devuelve un array, y como esta consulta sin GROUP BY
    // siempre devuelve un solo resultado, tomamos el primer elemento.
    return result[0];
  }

  toSentenceCase(str: string): string {
    if (!str) {
      return ''; // Maneja entradas nulas o vacías
    }

    // 1. Convertir todo el string a minúsculas para asegurar la uniformidad
    const lowercasedStr = str.toLowerCase();

    // 2. Tomar la primera letra y convertirla a mayúscula
    const firstChar = lowercasedStr.charAt(0).toUpperCase();

    // 3. Tomar el resto del string (desde el segundo carácter)
    const restOfString = lowercasedStr.slice(1);

    // 4. Unir la primera letra capitalizada con el resto del string
    return firstChar + restOfString;
}

}
