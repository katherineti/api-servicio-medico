import { Inject, Injectable } from "@nestjs/common"
import type { Response } from "express"
import { BaseReportService } from "./base-report.service"
import { DateUtils } from "./date.utils"
import type { ReportOptions, BaseReportData } from "./common-report.interface"
import type { NeonDatabase } from "drizzle-orm/neon-serverless"
import type { TDocumentDefinitions } from "pdfmake/interfaces"
import { PG_CONNECTION } from "src/constants"

@Injectable()
export class ImprovedAssignmentReportService extends BaseReportService {
  constructor(@Inject(PG_CONNECTION) private db: NeonDatabase) {
    super()
  }

  async generateCustomPdf(
    reportData: BaseReportData,
    res: Response,
    options: ReportOptions = { reportType: "month" },
  ): Promise<void> {
    try {
      this.logger.log(`Generando PDF de asignaciones: ${reportData.title}`)

      const stats = await this.getAssignmentStats(options)
      const docDefinition = await this.createDocumentDefinition(reportData, stats, options)

      const filename = this.generateFilename(options)
      await this.generatePdfResponse(docDefinition, res, filename)
    } catch (error) {
      this.logger.error(`Error al generar PDF de asignaciones:`, error)
      throw error
    }
  }

  private async getAssignmentStats(options: ReportOptions) {
    const { startRange, endRange } = DateUtils.getDateRanges(options.reportType, options.date)

    // Implementar consultas optimizadas aquí
    // Usar el patrón Repository para separar la lógica de base de datos

    return {
      totalAssignments: 0,
      assignmentsInPeriod: 0,
      pendingAssignments: 0,
      completedAssignments: 0,
      averageProcessingTime: 0,
    }
  }

  private async createDocumentDefinition(
    reportData: BaseReportData,
    stats: any,
    options: ReportOptions,
  ): Promise<TDocumentDefinitions> {
    const styles = this.getCommonStyles()
    const content: any[] = []

    // Agregar logo si existe
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

    // Título dinámico basado en el tipo de reporte
    const title =
      options.reportType === "day"
        ? "REPORTE DIARIO DE ASIGNACIONES DE INSUMOS MÉDICOS"
        : "REPORTE MENSUAL DE ASIGNACIONES DE INSUMOS MÉDICOS"

    content.push({ text: title, style: "reportTitle" })

    // Agregar secciones usando métodos de la clase base
    this.addGeneralInfoTable(content, reportData, styles)
    this.addStatsSection(content, stats, styles, options)

    const docDefinition: TDocumentDefinitions = {
      content,
      styles,
      defaultStyle: { font: "Roboto" },
      pageSize: "A4",
      pageMargins: [40, 60, 40, 60] as [number, number, number, number],
      footer: (currentPage: number, pageCount: number) => ({
        text: `Reporte de Asignaciones - Página ${currentPage} de ${pageCount}`,
        style: "footer",
      }),
    }

    return docDefinition
  }

  private addStatsSection(content: any[], stats: any, styles: any, options: ReportOptions) {
    const periodLabel = options.reportType === "day" ? "Hoy" : "del Mes"

    content.push(
      { text: "Estadísticas Generales", style: "sectionTitle" },
      {
        table: {
          widths: ["50%", "50%"],
          body: [
            [
              { text: "Total de Asignaciones:", style: "tableCellLabel" },
              { text: stats.totalAssignments.toString(), style: "tableCellValue" },
            ],
            [
              { text: `Asignaciones ${periodLabel}:`, style: "tableCellLabel" },
              { text: stats.assignmentsInPeriod.toString(), style: "metricValue" },
            ],
            [
              { text: "Asignaciones Pendientes:", style: "tableCellLabel" },
              {
                text: stats.pendingAssignments.toString(),
                style: stats.pendingAssignments > 0 ? "warningValue" : "tableCellValue",
              },
            ],
            [
              { text: "Asignaciones Completadas:", style: "tableCellLabel" },
              { text: stats.completedAssignments.toString(), style: "tableCellValue" },
            ],
          ],
        },
        layout: this.getTableLayout(),
        margin: [0, 10, 0, 20],
      },
    )
  }

  private generateFilename(options: ReportOptions): string {
    const today = new Date()
    const dateStr = DateUtils.formatDateForFilename(today)
    const type = options.reportType === "day" ? "diario" : "mensual"
    return `reporte-asignaciones-${type}-${dateStr}.pdf`
  }

  private async loadLogo(): Promise<Buffer | null> {
    // Implementar carga de logo con manejo de errores
    return null
  }
}
