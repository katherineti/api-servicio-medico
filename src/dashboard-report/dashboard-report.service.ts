import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
  Inject,
} from "@nestjs/common"
import type { Response } from "express"
import PdfPrinter from "pdfmake"
import * as fs from "fs"
import * as path from "path"
import type { Style, StyleDictionary, TDocumentDefinitions, TFontDictionary } from "pdfmake/interfaces"
import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm"
import { rolesTable, usersTable } from "src/db/schema"
import { PG_CONNECTION } from "src/constants"
import { NeonDatabase } from "drizzle-orm/neon-serverless"

export interface DashboardReportDto {
  title: string
  value: any
  type: string
  date: string
  role: string
  additionalInfo?: any
}
export interface UserRegistrationByDay {
  day: number
  date: string // Fecha en formato YYYY-MM-DD
  count: number // Cantidad de usuarios registrados
}

export interface UsersByRole {
  roleId: number
  roleName: string
  userCount: number
}

export interface CompleteUserStats {
  totalUsers: number
  usersToday: number
  usersThisMonth: number
  activeUsers: number
  inactiveUsers: number
  usersByRole: UsersByRole[]
  registrationsByDay: UserRegistrationByDay[]
}

type CustomHeader = (currentPage: number, pageCount: number, pageSize: any) => any
interface CustomDocumentDefinitions extends Omit<TDocumentDefinitions, "header"> {
  header?: CustomHeader
}

@Injectable()
export class DashboardReportService {
  private readonly logger = new Logger(DashboardReportService.name)
  private readonly MAX_RETRIES = 3
  private readonly fonts: TFontDictionary

  constructor(  @Inject(PG_CONNECTION) private db: NeonDatabase  ) {
    try {
      // Define fuentes
      this.fonts = {
        Roboto: {
          normal: path.join(process.cwd(), "src", "assets", "fonts", "Roboto-Regular.ttf"),
          bold: path.join(process.cwd(), "src", "assets", "fonts", "Roboto-Medium.ttf"),
          italics: path.join(process.cwd(), "src", "assets", "fonts", "Roboto-Italic.ttf"),
          bolditalics: path.join(process.cwd(), "src", "assets", "fonts", "Roboto-MediumItalic.ttf"),
        },
      }
      // Verifica que las fuentes existen
      this.verifyFonts();

    } catch (error) {
      this.logger.error("Error al inicializar fuentes:", error);
      // Usar fuentes de respaldo si las personalizadas fallan
      this.fonts = {
        Roboto: {
          normal: "Helvetica",
          bold: "Helvetica-Bold",
          italics: "Helvetica-Oblique",
          bolditalics: "Helvetica-BoldOblique",
        },
      }
      this.logger.warn("Usando fuentes de respaldo");
    }
  }

  // ==================== MÉTODOS DE GESTIÓN DE REPORTES ====================
  /**
   * Crea un nuevo reporte del dashboard
   */
  async create(reportData: Partial<DashboardReportDto>): Promise<DashboardReportDto> {
    try {
      this.logger.log("Creando nuevo reporte del dashboard")

      this.validateReportData(reportData)

      // Aquí implementarías la lógica para crear el reporte en la base de datos
      const createdReport: DashboardReportDto = {
        title: reportData.title || "Reporte sin título",
        value: reportData.value || 0,
        type: reportData.type || "general",
        date: reportData.date || new Date().toISOString(),
        role: reportData.role || "user",
        additionalInfo: {
          ...reportData.additionalInfo,
          createdAt: new Date().toISOString(),
          id: Math.floor(Math.random() * 1000), // ID simulado
        },
      }

      this.logger.log(`Reporte del dashboard creado exitosamente: ${createdReport.title}`)
      return createdReport
    } catch (error) {
      this.logger.error("Error al crear reporte del dashboard:", error)
      throw new Error("Error al crear el reporte del dashboard")
    }
  }

  /**
   * Obtiene todos los reportes del dashboard con paginación
   */
  async findAll(page = 1, limit = 10): Promise<{ reports: DashboardReportDto[]; total: number }> {
    try {
      this.logger.log(`Obteniendo reportes del dashboard - Página: ${page}, Límite: ${limit}`);

      // Por ahora, devolvemos datos simulados
      const mockReports: DashboardReportDto[] = Array.from({ length: Math.min(limit, 5) }, (_, index) => ({
        title: `Reporte ${(page - 1) * limit + index + 1}`,
        value: Math.floor(Math.random() * 1000),
        type: ["users", "products", "assignments"][index % 3],
        date: new Date().toISOString(),
        role: "admin",
        additionalInfo: {
          reportId: (page - 1) * limit + index + 1,
          generatedAt: new Date().toISOString(),
        },
      }))

      const total = 50 // Total simulado

      this.logger.log(`Reportes del dashboard obtenidos: ${mockReports.length} de ${total}`)
      return { reports: mockReports, total }
    } catch (error) {
      this.logger.error("Error al obtener reportes del dashboard:", error)
      throw new Error("Error al obtener los reportes del dashboard")
    }
  }

  // ==================== MÉTODO DE GENERACIÓN DE PDF ====================

  /**
   * Genera un PDF para un reporte del dashboard y lo envía como respuesta HTTP
   */
  async generatePdf(reportData: DashboardReportDto, res: Response): Promise<void> {
    try {
      // Valida los datos del reporte
      this.validateReportData(reportData)

      this.logger.log(`Generando PDF para el reporte del dashboard: ${reportData.title}`)

      // Crea definición del documento
      let docDefinition: TDocumentDefinitions
      try {
        docDefinition = await this.createDashboardDocumentDefinition(reportData)
      } catch (error) {
        throw new InternalServerErrorException(`Error al crear la definición del documento: ${error.message}`)
      }

      // Crea instancia de PdfPrinter
      const printer = new PdfPrinter(this.fonts)

      // Crea documento PDF
      let pdfDoc
      try {
        pdfDoc = printer.createPdfKitDocument(docDefinition)
      } catch (error) {
        throw new InternalServerErrorException(`Error al crear el documento PDF: ${error.message}`)
      }

      // Maneja errores en la generación del PDF
      pdfDoc.on("error", (error) => {
        this.logger.error(`Error durante la generación del PDF: ${error.message}`)
        if (!res.headersSent) {
          res.status(500).json({
            statusCode: 500,
            message: `Error al generar PDF: ${error.message}`,
          })
        }
      })

      // Envia el PDF como respuesta
      try {
        pdfDoc.pipe(res)
        pdfDoc.end()
        this.logger.log(`PDF generado exitosamente para el reporte: ${reportData.title}`)
      } catch (error) {
        throw new InternalServerErrorException(`Error al enviar el PDF: ${error.message}`)
      }
    } catch (error) {
      if (error instanceof InternalServerErrorException || error instanceof BadRequestException) {
        throw error
      }

      this.logger.error(`Error no manejado al generar PDF:`, error)

      if (res.headersSent) {
        return
      }

      res.status(500).json({
        statusCode: 500,
        message: `Error al generar PDF: ${error.message || "Error desconocido"}`,
      })
    }
  }

  /**
   * Verifica que las fuentes existen
   */
 verifyFonts(): void {
    try {
      const fontPaths = [
        this.fonts.Roboto.normal,
        this.fonts.Roboto.bold,
        this.fonts.Roboto.italics,
        this.fonts.Roboto.bolditalics,
      ]

      for (const fontPath of fontPaths) {
        if (!fs.existsSync(fontPath as string)) {
          throw new Error(`La fuente ${fontPath} no existe`)
        }
      }
    } catch (error) {
      this.logger.error("Error al verificar fuentes:", error)
      throw error
    }
  }

  /**
   * Valida que los datos del reporte sean válidos
   */
  private validateReportData(reportData: any): void {
    if (!reportData) {
      throw new BadRequestException("Los datos del reporte son requeridos")
    }

    if (!reportData.title) {
      throw new BadRequestException("El título del reporte es requerido")
    }

    if (reportData.value === null || reportData.value === undefined) {
      throw new BadRequestException("El valor del reporte es requerido")
    }

    const requiredFields = ["type", "date", "role"]
    const missingFields = requiredFields.filter((field) => !reportData[field])

    if (missingFields.length > 0) {
      throw new BadRequestException(`Campos requeridos faltantes: ${missingFields.join(", ")}`)
    }
  }

  /**
   * Crea la definición del documento PDF para el dashboard
   */
  private async createDashboardDocumentDefinition(reportData: DashboardReportDto): Promise<CustomDocumentDefinitions> {
    try {
      // Cargar logo con reintentos
      let logoData = null
      try {
        logoData = await this.loadLogoWithRetry()
      } catch (error) {
        this.logger.warn("No se pudo cargar el logo, continuando sin él:", error.message)
      }

      // Definir estilos
      const styles: StyleDictionary = {
        headerSection: {
          fontSize: 10,
          alignment: "right",
          color: "#666666",
          margin: [0, 5, 0, 0],
        } as Style,
        reportTitle: {
          fontSize: 18,
          bold: true,
          alignment: "center",
          margin: [0, 20, 0, 15],
          color: "#003366",
        } as Style,
        sectionTitle: {
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 10],
          color: "#003366",
        } as Style,
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: "#FFFFFF",
          fillColor: "#003366",
          alignment: "center",
          margin: [0, 5, 0, 5],
        } as Style,
        tableCellLabel: {
          bold: true,
          fontSize: 11,
          color: "#000000",
          fillColor: "#E0E0E0",
          margin: [5, 5, 5, 5],
        } as Style,
        tableCellValue: {
          fontSize: 11,
          color: "#000000",
          fillColor: "#F5F5F5",
          margin: [5, 5, 5, 5],
        } as Style,
        metricValue: {
          fontSize: 24,
          bold: true,
          color: "#27ae60",
          alignment: "center",
          margin: [0, 10, 0, 10],
        } as Style,
        paragraph: {
          fontSize: 11,
          margin: [0, 5, 0, 5],
          alignment: "justify",
        } as Style,
        footer: {
          fontSize: 9,
          alignment: "center",
          color: "#666666",
          margin: [0, 10, 0, 0],
        } as Style,
      }

      // Crear contenido del documento
      const content: any[] = []

      // Logo y título principal
      if (logoData) {
        content.push({
          image: `data:image/jpeg;base64,${logoData.toString("base64")}`,
          maxWidth: 515,
          maxHeight: 150,
          alignment: "center",
          margin: [0, 0, 0, 20],
        })
      }

      content.push({
        text: "REPORTE DEL DASHBOARD",
        style: "reportTitle",
      })

      // Información general del reporte
      this.addGeneralInfoTable(content, reportData, styles)

      // Métrica principal
      this.addMainMetricSection(content, reportData, styles)

      // Información adicional si existe
      if (reportData.additionalInfo) {
        this.addAdditionalInfoSection(content, reportData, styles)
      }

      // Información del sistema
      this.addSystemInfoSection(content, reportData, styles)

      // Crear definición del documento
      return {
        content: content,
        styles: styles,
        defaultStyle: {
          font: "Roboto",
        },
        pageSize: "A4",
        pageMargins: [40, 60, 40, 60],
        footer: (currentPage, pageCount) => ({
          text: `Reporte Dashboard - Página ${currentPage} de ${pageCount}`,
          style: "footer",
        }),
        header: ((currentPage, pageCount, pageSize) => {
          if (currentPage === 1) return null

          return {
            stack: [
              {
                columns: [
                  logoData
                    ? {
                        image: `data:image/jpeg;base64,${logoData.toString("base64")}`,
                        width: 60,
                        margin: [40, 10, 0, 0],
                      }
                    : {},
                  {
                    stack: [
                      { text: `${reportData.title} - Página: ${currentPage} de ${pageCount}`, style: "headerSection" },
                    ],
                    alignment: "right",
                    margin: [0, 10, 40, 0],
                  },
                ],
              },
              {
                canvas: [
                  {
                    type: "line",
                    x1: 40,
                    y1: 50,
                    x2: pageSize.width - 40,
                    y2: 50,
                    lineWidth: 1,
                    lineColor: "#cccccc",
                  },
                ],
              },
            ],
          }
        }).bind(this),
      }
    } catch (error) {
      throw new Error(`Error al crear la definición del documento: ${error.message}`)
    }
  }

  /**
   * Agrega la tabla de información general
   */
  private addGeneralInfoTable(content: any[], reportData: DashboardReportDto, styles: StyleDictionary): void {
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
            { text: "Rol de Usuario", style: "tableHeader" },
            { text: "Fecha de Generación", style: "tableHeader" },
          ],
          [
            { text: this.getValidContent(reportData.type), style: "tableCellValue" },
            { text: this.getValidContent(reportData.role), style: "tableCellValue" },
            { text: this.formatDate(reportData.date), style: "tableCellValue" },
          ],
        ],
      },
    })
  }

  /**
   * Agrega la sección de métrica principal
   */
  private addMainMetricSection(content: any[], reportData: DashboardReportDto, styles: StyleDictionary): void {
    content.push(
      { text: "Métrica Principal", style: "sectionTitle" },
      {
        table: {
          widths: ["40%", "60%"],
          body: [
            [
              { text: "Descripción:", style: "tableCellLabel" },
              { text: this.getValidContent(reportData.title), style: "tableCellValue" },
            ],
            [
              { text: "Valor:", style: "tableCellLabel" },
              { text: this.getValidContent(reportData.value), style: "metricValue" },
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
      },
    )
  }

  /**
   * Agrega la sección de información adicional
   */
  private addAdditionalInfoSection(content: any[], reportData: DashboardReportDto, styles: StyleDictionary): void {
    content.push({ text: "Información Adicional", style: "sectionTitle" })

    const additionalTableBody = [
      [
        { text: "Campo", style: "tableHeader" },
        { text: "Valor", style: "tableHeader" },
      ],
    ]

    Object.keys(reportData.additionalInfo).forEach((key) => {
      const displayKey = this.formatKey(key)
      const displayValue = reportData.additionalInfo[key]

      additionalTableBody.push([
        { text: displayKey, style: "tableCellLabel" },
        { text: this.getValidContent(displayValue), style: "tableCellValue" },
      ])
    })

    content.push({
      table: {
        widths: ["40%", "60%"],
        body: additionalTableBody,
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
    })
  }

  /**
   * Agrega la sección de información del sistema
   */
  private addSystemInfoSection(content: any[], reportData: DashboardReportDto, styles: StyleDictionary): void {
    const currentDate = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    content.push(
      { text: "\n\n" },
      { text: `Generado por: Usuario con rol ${reportData.role}`, style: "paragraph" },
      { text: `Fecha y hora de generación: ${currentDate}`, style: "paragraph" },
      { text: `Tipo de reporte: ${reportData.type}`, style: "paragraph" },
      { text: "\n" },
      {
        text: "Este reporte fue generado automáticamente por el sistema de gestión médica.",
        style: "paragraph",
        alignment: "center",
        color: "#666666",
      },
    )
  }

  /**
   * Carga el logo con reintentos
   */
  async loadLogoWithRetry(): Promise<Buffer | null> {
    const possibleLogoPaths = [
      path.join(process.cwd(), "src", "membreteCIIP.jpeg"),
      path.join(process.cwd(), "src", "assets", "membreteCIIP.jpeg"),
      path.join(process.cwd(), "assets", "membreteCIIP.jpeg"),
      path.join(process.cwd(), "membreteCIIP.jpeg"),
    ]

    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        for (const logoPath of possibleLogoPaths) {
          if (fs.existsSync(logoPath)) {
            return fs.readFileSync(logoPath)
          }
        }

        this.logger.warn(`Intento ${attempt + 1}/${this.MAX_RETRIES}: Logo no encontrado en las ubicaciones esperadas`)

        if (attempt < this.MAX_RETRIES - 1) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 100))
        }
      } catch (error) {
        this.logger.warn(`Intento ${attempt + 1}/${this.MAX_RETRIES}: Error al cargar el logo:`, error)

        if (attempt < this.MAX_RETRIES - 1) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 100))
        }
      }
    }

    throw new Error("No se pudo cargar el logo después de varios intentos")
  }

  /**
   * Formatea una fecha en formato legible
   */
  formatDate(date: Date | string): string {
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

  /**
   * Valida y procesa el contenido de texto
   */
  getValidContent(content: any): string {
    try {
      if (content === null || content === undefined) {
        return "No disponible"
      }

      if (typeof content === "string" && content.trim() === "") {
        return "No disponible"
      }

      if (typeof content === "object") {
        try {
          return JSON.stringify(content, null, 2)
        } catch (error) {
          this.logger.error("Error al convertir objeto a JSON:", error)
          return "Contenido en formato no compatible"
        }
      }

      return this.capitalizarOracion(String(content))
    } catch (error) {
      this.logger.error("Error al procesar contenido:", error)
      return "Error al procesar contenido"
    }
  }

  /**
   * Capitaliza la primera letra de una oración
   */
  private capitalizarOracion(oracion: string): string {
    if (oracion.length === 0) {
      return ""
    }
    return oracion.charAt(0).toUpperCase() + oracion.slice(1)
  }

  /**
   * Formatea las claves para mostrar
   */
  private formatKey(key: string): string {
    const keyMappings: { [key: string]: string } = {
      currentDate: "Fecha Actual",
      currentMonth: "Mes Actual",
      userRole: "Rol de Usuario",
      category: "Categoría",
      status: "Estado",
      period: "Período",
      alertLevel: "Nivel de Alerta",
      generatedAt: "Generado en",
      reportType: "Tipo de Reporte",
    }

    return keyMappings[key] || key.charAt(0).toUpperCase() + key.slice(1)
  }

  /**
   * Obtiene TODAS las estadísticas de los usuarios
   */
  async getCompleteUserStats(): Promise<CompleteUserStats> {
    try {
      const now = new Date();
      const nowUtc = new Date(now.toISOString());

      const startOfDay = new Date(Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), nowUtc.getUTCDate(), 0, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), nowUtc.getUTCDate(), 23, 59, 59, 999));

      const currentYear = nowUtc.getUTCFullYear();
      const currentMonth = nowUtc.getUTCMonth();
      const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0, 0));
      const endOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999));

      const startOfYear = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0));
      const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));

      // console.log("PROBANDO. INICIO DEL DÍA ACTUAL (UTC): ", startOfDay.toISOString(), " , FIN DEL DÍA (UTC): ", endOfDay.toISOString());
      // console.log("PROBANDO. INICIO DEL MES ACTUAL (UTC): ", startOfMonth.toISOString(), " , FIN DE MES (UTC): ", endOfMonth.toISOString());

      // --- CAMBIO CLAVE: Se reemplazo count(condition) por count(sql`CASE WHEN ... THEN 1 ELSE NULL END`) ---
      const [generalStats] = await this.db
        .select({
          // totalUsers: count(), 
          //Usuarios del año:
          totalUsers: sql<number>`count(CASE WHEN ${usersTable.createdAt} >= ${startOfYear} AND ${usersTable.createdAt} <= ${endOfYear} THEN 1 ELSE NULL END)`,
          usersThisMonth: sql<number>`count(CASE WHEN ${usersTable.createdAt} >= ${startOfMonth} AND ${usersTable.createdAt} <= ${endOfMonth} THEN 1 ELSE NULL END)`,
          usersToday: sql<number>`count(CASE WHEN ${usersTable.createdAt} >= ${startOfDay} AND ${usersTable.createdAt} <= ${endOfDay} THEN 1 ELSE NULL END)`,
          // ¡Se añade el filtro por año a los usuarios activos e inactivos!
          activeUsers: sql<number>`count(CASE WHEN ${usersTable.isActivate} = TRUE AND (${usersTable.createdAt} >= ${startOfYear} AND ${usersTable.createdAt} <= ${endOfYear}) THEN 1 ELSE NULL END)`,
          inactiveUsers: sql<number>`count(CASE WHEN ${usersTable.isActivate} = FALSE AND (${usersTable.createdAt} >= ${startOfYear} AND ${usersTable.createdAt} <= ${endOfYear}) THEN 1 ELSE NULL END)`,
        })
        .from(usersTable);
      // --- FIN CAMBIO CLAVE ---

      // 2. Usuarios por rol
      const usersByRoleResult = await this.db
        .select({
          roleId: rolesTable.id,
          roleName: rolesTable.name,
          userCount: count(usersTable.id), // Contar usuarios, si no hay se devolverá 0 por el LEFT JOIN
        })
        .from(rolesTable) 
        .leftJoin( usersTable, 
          and(
            eq(usersTable.role, rolesTable.id),
            and(
              gte(usersTable.createdAt, startOfYear),
              lte(usersTable.createdAt, endOfYear),
            )
          )
        ) 
        .groupBy(rolesTable.id, rolesTable.name) 
        .orderBy(rolesTable.id); // Ordenar por el ID del rol para consistencia

      // 3. Registros por día del mes actual 
      const registrationsByDayResult = await this.db
        .select({
          createdAt: usersTable.createdAt,
          userCount: count(),
        })
        .from(usersTable)
        .where(
          and(
            gte(usersTable.createdAt, startOfMonth),
            lte(usersTable.createdAt, endOfMonth)
          )
        )
        .groupBy(usersTable.createdAt)
        .orderBy(usersTable.createdAt);

      // Procesar resultados 
      const usersByRole: UsersByRole[] = usersByRoleResult.map((row) => ({
        roleId: row.roleId,
        roleName: this.capitalizeFirstLetter(row.roleName),
        userCount: Number(row.userCount),
      }));

      const registrationsByDay: UserRegistrationByDay[] = [];
      const dayMap = new Map<string, number>();

      registrationsByDayResult.forEach((row) => {
        const date = new Date(row.createdAt).toISOString().split('T')[0];
        const day = new Date(row.createdAt).getUTCDate();

        const currentCount = dayMap.get(date) || 0;
        dayMap.set(date, currentCount + Number(row.userCount));
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

      const completeStats: CompleteUserStats = {
        totalUsers: Number(generalStats.totalUsers),
        usersToday: Number(generalStats.usersToday),
        usersThisMonth: Number(generalStats.usersThisMonth),
        activeUsers: Number(generalStats.activeUsers),
        inactiveUsers: Number(generalStats.inactiveUsers),
        usersByRole,
        registrationsByDay,
      };

      this.logger.log("Estadísticas completas de usuarios:", JSON.stringify(completeStats, null, 2));
      return completeStats;

    } catch (error) {
      this.logger.error("Error al obtener las estadísticas de usuarios:", error);
      throw new Error("Error al obtener las estadísticas de usuarios");
    }
  }

  capitalizeFirstLetter(string: string): string {
    if (!string) return ''; // Manejar casos de string vacío o null/undefined
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

}