//report
import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import  { Response } from "express"
// import { BaseReportService } from "src/reports/base-report.service"
import  { TDocumentDefinitions, StyleDictionary } from "pdfmake/interfaces"
import  { MedicalReportsService } from "./medical-reports.service"
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
      this.logger.log(`Generando PDF para informe médico ID: ${reportId}`)

      const medicalReport = await this.medicalReportsService.getById(reportId)
      if (!medicalReport) {
        throw new NotFoundException(`Informe médico con ID ${reportId} no encontrado.`)
      }

      const doctor = await this.medicalReportsService.getDoctor(medicalReport.doctorId)
      const patient = await this.medicalReportsService.getPatient(medicalReport.patientId)

      const datePatient=patient?.birthdate || null;
        // if (datePatient) {
        // const isoString = datePatient.toISOString(); // e.g., "2025-07-15T14:00:00.000Z" (UTC)
        // const localDateFromISO = new Date(isoString); // Creates a Date object from the UTC string
        // console.log("Fecha a partir de ISO string (muestra en local):", localDateFromISO.toLocaleDateString());
        // }

        console.log("doctor",doctor)
        console.log("patient",patient)

      const reportData = {
        ...medicalReport,
        doctorName: doctor?.name || "N/A",
        doctorCedula: doctor?.cedula || "N/A",
        // doctorMppsCm: doctor?.mppsCM || "N/A",
        patientName: patient?.name || "N/A",
        patientCedula: patient?.cedula || "N/A",
        patientPlaceOfBirth: patient?.birthdate || "N/A",
        // patientDateOfBirth: patient?.dateOfBirth || "N/A",
        patientDateOfBirth: datePatient || "N/A",
        patientAge: patient?.age || "N/A",
        patientMaritalStatus: patient?.civilStatus || "N/A",
        patientSex: patient?.gender || "N/A",
      }

      const docDefinition = await this.createMedicalReportDocumentDefinition(reportData)

      const filename = `informe-medico-${reportId}-${this.formatDateForFilename(new Date())}.pdf`

      this.setResponseHeaders(res, filename, download)
      await this.generatePdfResponse(docDefinition, res, filename)

      this.logger.log(`PDF de informe médico para ID ${reportId} generado exitosamente.`)
    } catch (error) {
      this.logger.error(`Error al generar PDF del informe médico para ID ${reportId}:`, error)
      if (!res.headersSent) {
        res.status(500).json({
          statusCode: 500,
          message: `Error al generar PDF del informe médico: ${error.message || "Error desconocido"}`,
        })
      }
    }
  }

  async generateCustomPdf(reportData: any, res: Response, options: any): Promise<void> {
    this.logger.warn(
      "generateCustomPdf no es el método principal para MedicalReportPdfService. Use generateMedicalReportPdf en su lugar.",
    )
    throw new Error(
      "Este método no está implementado para MedicalReportPdfService. Por favor, use generateMedicalReportPdf.",
    )
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
      // New styles for the desired look
      tableHeaderBlue: {
        fillColor: "#003366",
        color: "#FFFFFF",
        bold: true,
        fontSize: 8,
        alignment: "center",
        margin: [0, 2, 0, 2],
      },
      tableCellContent: {
        fontSize: 8,
        color: "#000000",
        margin: [2, 2, 2, 2],
      },
      tableCellUnderline: {
        fontSize: 8,
        color: "#000000",
        decoration: "underline",
        margin: [2, 2, 2, 2],
      },
      checkboxSquare: {
        fontSize: 8,
        color: "#000000",
        margin: [0, 0, 2, 0],
      },
    }

    let gobiernoLogo: string | null = null
    let ciipLogo: string | null = null

    try {
      const gobiernoPath = path.join(process.cwd(), "src", "assets", "gobierno.png")
      const ciipPath = path.join(process.cwd(), "src", "assets", "logo-ciip.png")

      if (fs.existsSync(gobiernoPath)) {
        gobiernoLogo = fs.readFileSync(gobiernoPath).toString("base64")
      } else {
        this.logger.warn(`Logo Gobierno no encontrado en ${gobiernoPath}`)
      }
      if (fs.existsSync(ciipPath)) {
        ciipLogo = fs.readFileSync(ciipPath).toString("base64")
      } else {
        this.logger.warn(`Logo CIIP no encontrado en ${ciipPath}`)
      }
    } catch (error) {
      this.logger.error("Error al cargar los logos:", error)
    }

    const createdAtDate = new Date(reportData.createdAt)
    const day = createdAtDate.getDate().toString()
    const month = (createdAtDate.getMonth() + 1).toString()
    const year = createdAtDate.getFullYear().toString()
console.log('reportData...',reportData)

    const docDefinition: TDocumentDefinitions = {
      content: [
        // Header Section
        {
          columns: [
            {
              width: "auto",
              stack: [
                gobiernoLogo
                  ? {
                      image: `data:image/png;base64,${gobiernoLogo}`,
                      width: 100,
                      alignment: "left",
                      margin: [0, 0, 0, 0],
                    }
                  : { text: "", width: 100 }, // Placeholder
/*                 {
                  text: "Gobierno Bolivariano de Venezuela\nVicepresidencia de la República\nBolivariana de Venezuela",
                  alignment: "left",
                  fontSize: 7,
                  margin: [0, 5, 0, 0],
                }, */
              ],
            },
            {
              text: "INFORME MÉDICO",
              style: "reportTitle",
              width: "*",
              margin: [0, 10, 0, 0],
            },
            {
              width: "auto",
              stack: [
                ciipLogo
                  ? {
                      image: `data:image/png;base64,${ciipLogo}`,
                      width: 100,
                      alignment: "right",
                      margin: [0, 0, 0, 0],
                    }
                  : { text: "", width: 100 }, // Placeholder
              ],
            },
          ],
          margin: [0, 0, 0, 10],
        },

        // General Info Table
        {
          table: {
            widths: ["25%", "25%", "25%", "25%"],
            body: [
              [
                { text: "2. Centro APS:", style: "tableHeaderBlue" },
                { text: reportData.apsCenter || "", style: "tableCellUnderline" },
                { text: "1. Fecha de Elaboración:", style: "tableHeaderBlue" },
                {
                  columns: [
                    // { text: "Día", width: "auto", style: "tableCellContent" },
                    { text: day+'/', width: "*", style: "tableCellUnderline" },
                    // { text: "Mes", width: "auto", style: "tableCellContent" },
                    { text: month+'/', width: "*", style: "tableCellUnderline" },
                    // { text: "Año", width: "auto", style: "tableCellContent" },
                    { text: year, width: "*", style: "tableCellUnderline" },
                  ],
                  margin: [0, 0, 0, 0],
                  columnGap: 2,
                },
              ],
              [
                { text: "3. Aseguradora:", style: "tableHeaderBlue" },
                { text: reportData.insurance || "", colSpan: 3, style: "tableCellUnderline" },
                {},
                {},
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
              [{ text: "Nombres y Apellidos:", style: "tableHeaderBlue", colSpan: 6 }, {}, {}, {}, {}, {}],
              [{ text: reportData.patientName, colSpan: 6, style: "tableCellUnderline" }, {}, {}, {}, {}, {}],
              [
                { text: "N° Cédula de Identidad:", style: "tableHeaderBlue" },
                {
                  columns: [
                    // { text: "V", width: "auto", style: "checkboxLabel" },
                    {
                      text: reportData.patientCedula.startsWith("V") ? "V" : "",
                      width: "auto",
                      style: "checkboxSquare",
                    },
                    { text: "", width: 20, decoration: "underline" }, // Line for input
                    // { text: "E", width: "auto", style: "checkboxLabel" },
                    {
                      text: reportData.patientCedula.startsWith("E") ? "E" : "",
                      width: "auto",
                      style: "checkboxSquare",
                    },
                    { text: "", width: 20, decoration: "underline" }, // Line for input
                  ],
                  width: "auto",
                  margin: [0, 0, 5, 0],
                  columnGap: 2,
                },
                { text: reportData.patientCedula, style: "tableCellUnderline" },
                { text: "Lugar de Nacimiento:", style: "tableHeaderBlue" },
                // { text: reportData.patientPlaceOfBirth, colSpan: 2, style: "tableCellUnderline" },
                { text: '', colSpan: 2, style: "tableCellUnderline" },
                {},
              ],
              [
                { text: "Fecha de Nacimiento:", style: "tableHeaderBlue" },
                // { text: this.formatDate(reportData.patientDateOfBirth), style: "tableCellUnderline" },
                { text: reportData.patientDateOfBirth, style: "tableCellUnderline" },
                { text: "Edad:", style: "tableHeaderBlue" },
                { text: reportData.patientAge.toString(), style: "tableCellUnderline" },
                { text: "Estado Civil:", style: "tableHeaderBlue" },
                { text: reportData.patientMaritalStatus, style: "tableCellUnderline" },
/*                 {
/*                   columns: [
                    { text: `S ${reportData.patientMaritalStatus === "Soltero" ? "✓" : "□"}`, style: "checkboxSquare" },
                    { text: `C ${reportData.patientMaritalStatus === "Casado" ? "✓" : "□"}`, style: "checkboxSquare" },
                    { text: `V ${reportData.patientMaritalStatus === "Viudo" ? "✓" : "□"}`, style: "checkboxSquare" },
                    {
                      text: `D ${reportData.patientMaritalStatus === "Divorciado" ? "✓" : "□"}`,
                      style: "checkboxSquare",
                    },
                  ], * /
                  columns: [
                    { text: `${reportData.patientMaritalStatus }`, style: "checkboxSquare" },
                    {
                      style: "checkboxSquare",
                    },
                  ],
                  width: "*",
                  columnGap: 2,
                }, */
              ],
              [
                { text: "Sexo:", style: "tableHeaderBlue" },
                { text: reportData.patientSex, style: "tableCellUnderline" },

/*                 {
/*                   columns: [
                    { text: `F ${reportData.patientSex === "Femenino" ? "✓" : "□"}`, style: "checkboxSquare" },
                    { text: `M ${reportData.patientSex === "Masculino" ? "✓" : "□"}`, style: "checkboxSquare" },
                  ], * /
                  columns: [
                    { text: `F ${reportData.patientSex === "Femenino" ? "F" : ""}`, style: "checkboxSquare" },
                    { text: `M ${reportData.patientSex === "Masculino" ? "M" : ""}`, style: "checkboxSquare" },
                  ],
                  width: "auto",
                  columnGap: 2,
                }, */
                { text: "", colSpan: 4, style: "tableCellContent" }, // Empty cell to fill space
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
        { text: "11. Informe", style: "headerBackground", margin: [0, 0, 0, 0] },
        {
          table: {
            widths: ["*"],
            body: [
              [
                {
                  text: reportData.description || "",
                  style: "tableCellContent",
                  minHeight: 200,
                  border: [true, true, true, true],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: (i, node) => 1,
            vLineWidth: (i, node) => 1,
            hLineColor: (i, node) => "#000000",
            vLineColor: (i, node) => "#000000",
            paddingLeft: (i, node) => 5,
            paddingRight: (i, node) => 5,
            paddingTop: (i, node) => 5,
            paddingBottom: (i, node) => 5,
          },
          margin: [0, 0, 0, 20],
        },

        // Doctor Info Footer Section
        {
          table: {
            widths: ["25%", "25%", "25%", "25%"],
            body: [
              [
                { text: "1. Nombre del Médico", style: "tableHeaderBlue" },
                { text: "2. Cédula", style: "tableHeaderBlue" },
                { text: "3. M.P.P.S. - C.M", style: "tableHeaderBlue" },
                { text: "4. Firma y Sello", style: "tableHeaderBlue" },
              ],
              [
                { text: reportData.doctorName, style: "tableCellUnderline", minHeight: 40 },
                { text: reportData.doctorCedula, style: "tableCellUnderline" },
                { text: reportData.doctorMppsCm, style: "tableCellUnderline" },
                { text: "", style: "tableCellUnderline" }, // For signature and stamp
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
