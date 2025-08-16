import { Injectable, Logger } from "@nestjs/common"
import type { Response } from "express"
import type { StyleDictionary, TDocumentDefinitions } from "pdfmake/interfaces"
import type { MedicalSupplyType } from "./medical-supplies-report.interface"

@Injectable()
export abstract class BaseReportService {
  protected readonly logger = new Logger(this.constructor.name)

  protected getCommonStyles(): StyleDictionary {
    return {
      headerSection: {
        fontSize: 10,
        alignment: "right",
        color: "#666666",
        margin: [0, 5, 0, 0],
      },
      reportTitle: {
        // fontSize: 14,
        fontSize: 12,
        bold: true,
        alignment: "center",
        // margin: [0, 15, 0, 10],
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
      warningValue: {
        fontSize: 9,
        bold: true,
        color: "#f39c12",
        fillColor: "#fef9e7",
        margin: [3, 3, 3, 3],
      },
      errorValue: {
        fontSize: 9,
        bold: true,
        color: "#e74c3c",
        fillColor: "#fdedec",
        margin: [3, 3, 3, 3],
      },
      // Nuevos estilos para reportes mejorados
      successValue: {
        fontSize: 9,
        bold: true,
        color: "#27ae60",
        fillColor: "#eafaf1",
        margin: [3, 3, 3, 3],
      },
      infoValue: {
        fontSize: 9,
        bold: true,
        color: "#3498db",
        fillColor: "#ebf3fd",
        margin: [3, 3, 3, 3],
      },
      criticalValue: {
        fontSize: 9,
        bold: true,
        color: "#ffffff",
        fillColor: "#e74c3c",
        margin: [3, 3, 3, 3],
      },
      enhancedSectionTitle: {
        fontSize: 12,
        bold: true,
        margin: [0, 15, 0, 10],
        color: "#2c3e50",
        decoration: "underline",
      },
    }
  }

  protected addGeneralInfoTable(content: any[], reportData: any, styles: StyleDictionary): void {
    const typeReport_number = this.getValidContent(reportData.type || reportData.typeName)
    const supplyType = this.getSupplyTypeName(Number(typeReport_number))

    content.push({
      margin: [0, 10, 0, 20],
      table: {
        widths: ["*", "*", "*"],
        layout: this.getTableLayout(),
        body: [
          [
            { text: "Tipo de Reporte", style: "tableHeader" },
            { text: "Fecha del Reporte", style: "tableHeader" },
            { text: "Fecha de Generación", style: "tableHeader" },
          ],
          [
            { text: supplyType + " Disponibles en el Mes", style: "tableCellValue" },
            { text: this.formatDate(reportData.date), style: "tableCellValue" },
            { text: this.formatDate(new Date().toISOString()), style: "tableCellValue" },
          ],
        ],
      },
    })
  }

  // Nuevo método para tabla de información mejorada
  protected addEnhancedGeneralInfoTable(content: any[], reportData: any, styles: StyleDictionary): void {
    const typeReport_number = this.getValidContent(reportData.type || reportData.typeName)
    const supplyType = this.getSupplyTypeName(Number(typeReport_number))

    content.push({
      margin: [0, 10, 0, 20],
      table: {
        widths: ["25%", "25%", "25%", "25%"],
        layout: this.getTableLayout(),
        body: [
          [
            { text: "Tipo de Reporte", style: "tableHeader" },
            { text: "Enfoque", style: "tableHeader" },
            { text: "Fecha del Reporte", style: "tableHeader" },
            { text: "Fecha de Generación", style: "tableHeader" },
          ],
          [
            { text: supplyType + " Disponibles", style: "tableCellValue" },
            { text: "Solo Productos Disponibles", style: "successValue" },
            { text: this.formatDate(reportData.date), style: "tableCellValue" },
            { text: this.formatDate(new Date().toISOString()), style: "tableCellValue" },
          ],
        ],
      },
    })
  }

  protected getTableLayout() {
    return {
      hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
      vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 1 : 0.5),
      hLineColor: (i, node) => (i === 0 || i === node.table.body.length ? "#003366" : "#BBBBBB"),
      vLineColor: (i, node) => (i === 0 || i === node.table.widths.length ? "#003366" : "#BBBBBB"),
      paddingLeft: (i, node) => 10,
      paddingRight: (i, node) => 10,
      paddingTop: (i, node) => 5,
      paddingBottom: (i, node) => 5,
    }
  }

  // Nuevo layout para tablas mejoradas
  protected getEnhancedTableLayout() {
    return {
      hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 2 : 1),
      vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 2 : 1),
      hLineColor: (i, node) => (i === 0 || i === node.table.body.length ? "#2c3e50" : "#bdc3c7"),
      vLineColor: (i, node) => (i === 0 || i === node.table.widths.length ? "#2c3e50" : "#bdc3c7"),
      paddingLeft: (i, node) => 12,
      paddingRight: (i, node) => 12,
      paddingTop: (i, node) => 8,
      paddingBottom: (i, node) => 8,
    }
  }

  protected formatDate(date: Date | string): string {
    try {
      if (!date) return "N/A"
      const d = new Date(date)
      if (isNaN(d.getTime())) return "Fecha inválida"

      return d.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      this.logger.error("Error al formatear fecha:", error)
      return "Error en fecha"
    }
  }

  protected getValidContent(content: any): string {
    console.log("tipo de Reporte: getValidContent(): ", JSON.stringify(content, null, 2))
    if (content === null || content === undefined) return "No disponible"
    if (typeof content === "string" && content.trim() === "") return "No disponible"
    if (typeof content === "object") {
      try {
        return JSON.stringify(content, null, 2)
      } catch (error) {
        return "Contenido en formato no compatible"
      }
    }
    return this.capitalizeFirstLetter(String(content))
  }

  protected capitalizeFirstLetter(string: string): string {
    if (!string) return ""
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  // Nuevo método para obtener estilo basado en prioridad
  protected getStyleByPriority(priority: "low" | "medium" | "high" | "critical"): string {
    switch (priority) {
      case "critical":
        return "criticalValue"
      case "high":
        return "errorValue"
      case "medium":
        return "warningValue"
      case "low":
        return "infoValue"
      default:
        return "tableCellValue"
    }
  }

  // Nuevo método para obtener color basado en disponibilidad
  protected getAvailabilityStyle(percentage: number): string {
    if (percentage >= 80) return "successValue"
    if (percentage >= 60) return "infoValue"
    if (percentage >= 40) return "warningValue"
    return "errorValue"
  }

  protected async generatePdfResponse(
    docDefinition: TDocumentDefinitions,
    res: Response,
    filename: string,
  ): Promise<void> {
    try {
      const PdfPrinter = require("pdfmake")
      const fonts = {
        Roboto: {
          normal: "Helvetica",
          bold: "Helvetica-Bold",
          italics: "Helvetica-Oblique",
          bolditalics: "Helvetica-BoldOblique",
        },
      }

      const printer = new PdfPrinter(fonts)
      const pdfDoc = printer.createPdfKitDocument(docDefinition)

      pdfDoc.on("error", (error) => {
        this.logger.error(`Error durante la generación del PDF: ${error.message}`)
        if (!res.headersSent) {
          res.status(500).json({
            statusCode: 500,
            message: `Error al generar PDF: ${error.message}`,
          })
        }
      })

      pdfDoc.pipe(res)
      pdfDoc.end()

      this.logger.log(`PDF ${filename} generado exitosamente`)
    } catch (error) {
      this.logger.error(`Error al generar PDF:`, error)
      if (!res.headersSent) {
        res.status(500).json({
          statusCode: 500,
          message: `Error al generar PDF: ${error.message || "Error desconocido"}`,
        })
      }
    }
  }

  // Método abstracto con firma flexible
  abstract generateCustomPdf(reportData: any, res: Response, options?: any): Promise<void>

  getSupplyTypeName(supplyType: MedicalSupplyType): string {
    switch (supplyType) {
      case 1:
        return "Medicamentos"
      case 2:
        return "Uniformes"
      case 3:
        return "Equipos Odontológicos"
      default:
        return "Insumos Médicos"
    }
  }

}