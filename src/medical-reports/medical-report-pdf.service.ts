import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { Response } from "express"
import type { TDocumentDefinitions, StyleDictionary } from "pdfmake/interfaces"
import { MedicalReportsService } from "./medical-reports.service"
import * as path from "path"
import * as fs from "fs"
import { BaseReportService } from "src/dashboard-report/medical-supplies-available/base-report.service"

@Injectable()
export class MedicalReportPdfService extends BaseReportService {
  protected readonly logger = new Logger(MedicalReportPdfService.name)

  constructor(private readonly medicalReportsService: MedicalReportsService) {
    super()
  }

  async generateMedicalReportPdf(reportId: number, res: Response, download = false): Promise<void> {
    try {
      this.logger.log(`Generating PDF for medical report ID: ${reportId}`)

      const medicalReport = await this.medicalReportsService.getById(reportId)
      if (!medicalReport) {
        throw new NotFoundException(`Medical report with ID ${reportId} not found.`)
      }

      const doctor = await this.medicalReportsService.getDoctor(medicalReport.doctorId)
      const patient = await this.medicalReportsService.getPatient(medicalReport.patientId)

      const reportData = {
        ...medicalReport,
        doctorName: doctor?.name || "N/A",
        doctorCedula: doctor?.cedula || "N/A",
        doctorMppsCm: doctor?.mppsCM || "N/A", // Assuming doctor has mppsCM field
        patientName: patient?.name || "N/A",
        patientCedula: patient?.cedula || "N/A",
        patientPlaceOfBirth: patient?.placeOfBirth || "N/A", // Assuming patient has placeOfBirth
        patientDateOfBirth: patient?.dateOfBirth || "N/A", // Assuming patient has dateOfBirth
        patientAge: patient?.age || "N/A", // Assuming patient has age
        patientMaritalStatus: patient?.maritalStatus || "N/A", // Assuming patient has maritalStatus
        patientSex: patient?.sex || "N/A", // Assuming patient has sex
      }

      const docDefinition = await this.createMedicalReportDocumentDefinition(reportData)

      const filename = `informe-medico-${reportId}-${this.formatDateForFilename(new Date())}.pdf`

      this.setResponseHeaders(res, filename, download)
      await this.generatePdfResponse(docDefinition, res, filename)

      this.logger.log(`Medical report PDF for ID ${reportId} generated successfully.`)
    } catch (error) {
      this.logger.error(`Error generating medical report PDF for ID ${reportId}:`, error)
      if (!res.headersSent) {
        res.status(500).json({
          statusCode: 500,
          message: `Error al generar PDF del informe médico: ${error.message || "Error desconocido"}`,
        })
      }
    }
  }

  // Implement the abstract method from BaseReportService
  async generateCustomPdf(reportData: any, res: Response, options: any): Promise<void> {
    this.logger.warn(
      "generateCustomPdf is not the primary method for MedicalReportPdfService. Use generateMedicalReportPdf instead.",
    )
    // You might choose to throw an error or try to map the parameters if a generic use case is intended.
    // For now, we'll throw an error as the parameters don't directly map to generateMedicalReportPdf's reportId.
    throw new Error("This method is not implemented for MedicalReportPdfService. Please use generateMedicalReportPdf.")
  }

  private async createMedicalReportDocumentDefinition(reportData: any): Promise<TDocumentDefinitions> {
    const styles: StyleDictionary = {
      ...this.getCommonStyles(), // Inherit base styles
      headerBackground: {
        fillColor: "#003366", // Dark blue
        color: "#FFFFFF",
        bold: true,
        alignment: "center",
        fontSize: 10,
        margin: [0, 3, 0, 3],
      },
      sectionHeader: {
        fontSize: 11,
        bold: true,
        color: "#003366",
        margin: [0, 10, 0, 5],
      },
      tableLabel: {
        bold: true,
        fontSize: 8,
        color: "#000000",
        fillColor: "#E0E0E0",
        margin: [2, 2, 2, 2],
      },
      tableValue: {
        fontSize: 8,
        color: "#000000",
        fillColor: "#F5F5F5",
        margin: [2, 2, 2, 2],
      },
      reportTitle: {
        fontSize: 16,
        bold: true,
        alignment: "center",
        color: "#003366",
        margin: [0, 0, 0, 10],
      },
      footerText: {
        fontSize: 7,
        color: "#666666",
        alignment: "center",
        margin: [0, 2, 0, 0],
      },
      smallText: {
        fontSize: 7,
        color: "#000000",
      },
      checkboxLabel: {
        fontSize: 8,
        color: "#000000",
        margin: [0, 0, 2, 0],
      },
    }

    let gobiernoLogo: string | null = null
    let ciipLogo: string | null = null

    try {
      // Assuming these paths are correct relative to process.cwd()
      const gobiernoPath = path.join(process.cwd(), "src", "assets", "gobierno.png")
    //   const ciipPath = path.join(process.cwd(), "src", "assets", "ciip.png")
      const ciipPath = path.join(process.cwd(), "src", "assets", "membreteCIIP.jpeg")

      if (fs.existsSync(gobiernoPath)) {
        gobiernoLogo = fs.readFileSync(gobiernoPath).toString("base64")
      } else {
        this.logger.warn(`Gobierno logo not found at ${gobiernoPath}`)
      }
      if (fs.existsSync(ciipPath)) {
        ciipLogo = fs.readFileSync(ciipPath).toString("base64")
      } else {
        this.logger.warn(`CIIP logo not found at ${ciipPath}`)
      }
    } catch (error) {
      this.logger.error("Error loading logos:", error)
    }

    const headerColumns = []

    if (gobiernoLogo) {
      headerColumns.push({
        image: `data:image/png;base64,${gobiernoLogo}`,
        width: 100,
        alignment: "left",
        margin: [0, 0, 0, 0],
      })
    } else {
      // Add an empty object or a placeholder to maintain column structure if needed
      headerColumns.push({ text: "", width: 100 }) // Placeholder for left column
    }

    headerColumns.push({
      text: "INFORME MÉDICO",
      style: "reportTitle",
      width: "*",
      margin: [0, 10, 0, 0],
    })

    if (ciipLogo) {
      headerColumns.push({
        image: `data:image/png;base64,${ciipLogo}`,
        width: 100,
        alignment: "right",
        margin: [0, 0, 0, 0],
      })
    } else {
      // Add an empty object or a placeholder to maintain column structure if needed
      headerColumns.push({ text: "", width: 100 }) // Placeholder for right column
    }

    const docDefinition: TDocumentDefinitions = {
      content: [
        // Header Section
        {
          columns: headerColumns,
          margin: [0, 0, 0, 10],
        },
        {
          text: "Gobierno Bolivariano de Venezuela\nVicepresidencia de la República\nBolivariana de Venezuela",
          alignment: "left",
          fontSize: 7,
          margin: [0, -10, 0, 10],
        },

        // General Info Table
        {
          table: {
            widths: ["25%", "25%", "25%", "25%"],
            body: [
              [
                { text: "1. Centro APS:", style: "tableLabel" },
                { text: reportData.apsCenter || "N/A", style: "tableValue" },
                { text: "Fecha:", style: "tableLabel" },
                { text: "", style: "tableValue" },
              ],
              [
                { text: "2. Aseguradora:", style: "tableLabel" },
                { text: reportData.insurance || "N/A", style: "tableValue" },
                { text: "Día", style: "tableLabel" },
                { text: new Date(reportData.createdAt).getDate().toString(), style: "tableValue" },
              ],
              [
                { text: "", style: "tableLabel" },
                { text: "", style: "tableValue" },
                { text: "Mes", style: "tableLabel" },
                { text: (new Date(reportData.createdAt).getMonth() + 1).toString(), style: "tableValue" },
              ],
              [
                { text: "", style: "tableLabel" },
                { text: "", style: "tableValue" },
                { text: "Año", style: "tableLabel" },
                { text: new Date(reportData.createdAt).getFullYear().toString(), style: "tableValue" },
              ],
            ],
          },
          layout: this.getTableLayout(),
          margin: [0, 5, 0, 10],
        },

        // Patient Data Section
        { text: "Datos del Paciente", style: "headerBackground", margin: [0, 0, 0, 0] },
        {
          table: {
            widths: ["*", "*", "*", "*", "*", "*"],
            body: [
              [
                { text: "3. Nombres y Apellidos:", style: "tableLabel" },
                { text: reportData.patientName, colSpan: 5, style: "tableValue" },
                {},
                {},
                {},
                {},
              ],
              [
                { text: "4. N° Cédula de Identidad:", style: "tableLabel" },
                {
                  columns: [
                    { text: "V", style: "checkboxLabel" },
                    { text: "□", style: "checkboxLabel" }, // Placeholder for V checkbox
                    { text: "E", style: "checkboxLabel" },
                    { text: "□", style: "checkboxLabel" }, // Placeholder for E checkbox
                  ],
                  width: "auto",
                  margin: [0, 0, 5, 0],
                },
                { text: reportData.patientCedula, style: "tableValue" },
                { text: "5. Lugar de Nacimiento:", style: "tableLabel" },
                { text: reportData.patientPlaceOfBirth, colSpan: 2, style: "tableValue" },
                {},
              ],
              [
                { text: "6. Fecha de Nacimiento:", style: "tableLabel" },
                { text: this.formatDate(reportData.patientDateOfBirth), style: "tableValue" },
                { text: "7. Edad:", style: "tableLabel" },
                { text: reportData.patientAge.toString(), style: "tableValue" },
                { text: "8. Estado Civil:", style: "tableLabel" },
                {
                  columns: [
                    { text: `S ${reportData.patientMaritalStatus === "Soltero" ? "✓" : "□"}`, style: "checkboxLabel" },
                    { text: `C ${reportData.patientMaritalStatus === "Casado" ? "✓" : "□"}`, style: "checkboxLabel" },
                    { text: `V ${reportData.patientMaritalStatus === "Viudo" ? "✓" : "□"}`, style: "checkboxLabel" },
                    {
                      text: `D ${reportData.patientMaritalStatus === "Divorciado" ? "✓" : "□"}`,
                      style: "checkboxLabel",
                    },
                  ],
                  width: "*",
                },
              ],
              [
                { text: "9. Sexo:", style: "tableLabel" },
                {
                  columns: [
                    { text: `F ${reportData.patientSex === "Femenino" ? "✓" : "□"}`, style: "checkboxLabel" },
                    { text: `M ${reportData.patientSex === "Masculino" ? "✓" : "□"}`, style: "checkboxLabel" },
                  ],
                  width: "auto",
                },
                { text: "", colSpan: 4, style: "tableValue" },
                {},
                {},
                {},
              ],
            ],
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 10],
        },

        // Informe Section
        { text: "10. Informe", style: "headerBackground", margin: [0, 0, 0, 0] },
        {
          table: {
            widths: ["*"],
            body: [
              [{ text: reportData.description || "No hay informe disponible.", style: "tableValue", minHeight: 200 }],
            ],
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 20],
        },

        // Doctor Info Footer Section
        {
          table: {
            widths: ["25%", "25%", "25%", "25%"],
            body: [
              [
                { text: "11. Nombre del Médico", style: "tableHeader" },
                { text: "12. Cédula", style: "tableHeader" },
                { text: "13. M.P.P.S. - C.M", style: "tableHeader" },
                { text: "14. Firma y Sello", style: "tableHeader" },
              ],
              [
                { text: reportData.doctorName, style: "tableValue", minHeight: 40 },
                { text: reportData.doctorCedula, style: "tableValue" },
                { text: reportData.doctorMppsCm, style: "tableValue" },
                { text: "", style: "tableValue" },
              ],
            ],
          },
          layout: this.getTableLayout(),
          margin: [0, 10, 0, 0],
        },
      ],
      styles: styles,
      defaultStyle: {
        font: "Roboto",
        fontSize: 9,
      },
      pageSize: "A4",
      pageMargins: [40, 60, 40, 60],
      footer: (currentPage: number, pageCount: number) => ({
        columns: [
          { text: "DNI-e:Informe Medico", alignment: "left", style: "footerText", margin: [40, 0, 0, 0] },
          { text: `Pág: ${currentPage}/${pageCount}`, alignment: "center", style: "footerText" },
          {
            text: `Fecha de Emisión: ${this.formatDate(reportData.createdAt).split(",")[0]}`,
            alignment: "right",
            style: "footerText",
            margin: [0, 0, 40, 0],
          },
        ],
      }),
    }

    return docDefinition
  }

  private formatDateForFilename(date: Date): string {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  private setResponseHeaders(res: Response, filename: string, isDownload: boolean) {
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
    res.setHeader("Pragma", "no-cache")
    res.setHeader("Expires", "0")
    res.setHeader(
      "Content-Disposition",
      isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`,
    )
  }
}
