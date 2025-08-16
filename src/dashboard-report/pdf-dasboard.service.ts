import { Injectable, Logger, BadRequestException } from "@nestjs/common"
import type { Response } from "express"
import PdfPrinter from "pdfmake"
import * as fs from "fs"
import * as path from "path"
import type { StyleDictionary, TDocumentDefinitions, TFontDictionary } from "pdfmake/interfaces"
import type { CompleteUserStats } from "./dashboard-report.service"
import { ChartJSNodeCanvas } from "chartjs-node-canvas"
import type { ChartConfiguration } from "chart.js"
import { IJwtPayload } from "src/auth/dto/jwt-payload.interface"

type CustomHeader = (currentPage: number, pageCount: number, pageSize: any) => any
interface CustomDocumentDefinitions extends Omit<TDocumentDefinitions, "header"> {
  header?: CustomHeader
}

@Injectable()
export class PdfDashboardService {
  private readonly logger = new Logger(PdfDashboardService.name)
  private readonly MAX_RETRIES = 3
  private readonly fonts: TFontDictionary
  private readonly chartJSNodeCanvas: ChartJSNodeCanvas

  constructor() {
    try {
/*       this.fonts = {
        Roboto: {
          normal: path.join(process.cwd(), "src", "assets", "fonts", "Roboto-Regular.ttf"),
          bold: path.join(process.cwd(), "src", "assets", "fonts", "Roboto-Medium.ttf"),
          italics: path.join(process.cwd(), "src", "assets", "fonts", "Roboto-Italic.ttf"),
          bolditalics: path.join(process.cwd(), "src", "assets", "fonts", "Roboto-MediumItalic.ttf"),
        },
      } */
      this.fonts = {
        Roboto: {
          normal: "Helvetica",
          bold: "Helvetica-Bold",
          italics: "Helvetica-Oblique",
          bolditalics: "Helvetica-BoldOblique",
        },
      }

      // Inicializar ChartJS para generar gráficos
      this.chartJSNodeCanvas = new ChartJSNodeCanvas({
        width: 600,
        height: 400,
        backgroundColour: "white",
        chartCallback: (ChartJS) => {
          // Registrar plugins necesarios
          ChartJS.defaults.responsive = true
          ChartJS.defaults.maintainAspectRatio = false
        },
      })

      this.verifyFonts()
    } catch (error) {
      this.logger.error("Error al inicializar fuentes:", error)
      this.fonts = {
        Roboto: {
          normal: "Helvetica",
          bold: "Helvetica-Bold",
          italics: "Helvetica-Oblique",
          bolditalics: "Helvetica-BoldOblique",
        },
      }
      this.logger.warn("Usando fuentes de respaldo")
    }
  }

  /**
   * Genera un PDF específico para estadísticas de usuarios
   */
  // async generateUserStatsPdf(userStats: CompleteUserStats, reportDto: any, res: Response): Promise<void> {
  async generateUserStatsPdf(userStats: CompleteUserStats, res: Response, user: IJwtPayload): Promise<void> {
    try {
      this.logger.log("Generando PDF de estadísticas de usuarios")

      // Validar datos
      this.validateUserStats(userStats)

      // Crear definición del documento
      const docDefinition = await this.createUserStatsDocumentDefinition(userStats, user)

      // Crear instancia de PdfPrinter
      const printer = new PdfPrinter(this.fonts)

      // Crear documento PDF
      const pdfDoc = printer.createPdfKitDocument(docDefinition)

      // Manejar errores en la generación del PDF
      pdfDoc.on("error", (error) => {
        this.logger.error(`Error durante la generación del PDF:`, error)
        if (!res.headersSent) {
          res.status(500).json({
            statusCode: 500,
            message: `Error al generar PDF: ${error.message}`,
          })
        }
      })

      // Enviar el PDF como respuesta
      pdfDoc.pipe(res)
      pdfDoc.end()

      this.logger.log("PDF de estadísticas generado exitosamente")
    } catch (error) {
      this.logger.error("Error al generar PDF de estadísticas:", error)

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
   * Genera un gráfico de puntos para los registros por día del MES ACTUAL
   */
  private async generateRegistrationChart(userStats: CompleteUserStats): Promise<Buffer | null> {
    try {
      if (!userStats.registrationsByDay || userStats.registrationsByDay.length === 0) {
        this.logger.warn("No hay datos de registros por día para generar el gráfico")
        return null
      }

      // Obtener fecha actual automáticamente
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() // 0-11 (Enero = 0, Julio = 6)
      const currentMonthName = this.getMonthName(currentMonth)

      // Calcular días del mes actual
      const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

      this.logger.log(`Generando gráfico para: ${currentMonthName} ${currentYear} (${daysInCurrentMonth} días)`)

      // Filtrar solo los registros del mes actual
      const currentMonthRegistrations = userStats.registrationsByDay.filter((dayData) => {
        const registrationDate = new Date(dayData.date + "T00:00:00.000Z")
        const registrationYear = registrationDate.getUTCFullYear()
        const registrationMonth = registrationDate.getUTCMonth()

        return registrationYear === currentYear && registrationMonth === currentMonth
      })

      // this.logger.log(`Registros del mes actual encontrados:`, currentMonthRegistrations)

      // Crear mapa de registros por día del mes actual
      const registrationMap = new Map<number, number>()

      // Inicializar todos los días del mes con 0 registros
      for (let day = 1; day <= daysInCurrentMonth; day++) {
        registrationMap.set(day, 0)
      }

      // Llenar el mapa con los registros reales del mes actual
      currentMonthRegistrations.forEach((dayData) => {
        const registrationDate = new Date(dayData.date + "T00:00:00.000Z")
        const dayOfMonth = registrationDate.getUTCDate()

        // Sumar registros si hay múltiples registros el mismo día
        const currentCount = registrationMap.get(dayOfMonth) || 0
        registrationMap.set(dayOfMonth, currentCount + dayData.count)

        // this.logger.log(`Día ${dayOfMonth}: ${dayData.count} registros (total: ${currentCount + dayData.count})`)
      })

      // Preparar datos para el gráfico
      const labels = Array.from({ length: daysInCurrentMonth }, (_, i) => (i + 1).toString())
      const data = Array.from({ length: daysInCurrentMonth }, (_, i) => registrationMap.get(i + 1) || 0)

      // this.logger.log(`Etiquetas del gráfico (días):`, labels)
      // this.logger.log(`Datos del gráfico (registros):`, data)

      // Configuración del gráfico con tipos correctos
      const configuration: ChartConfiguration<"line", number[], string> = {
        type: "line" as const,
        data: {
          labels: labels,
          datasets: [
            {
              label: "Usuarios Registrados",
              data: data,
              borderColor: "#003366",
              backgroundColor: "#003366",
              pointBackgroundColor: "#003366",
              pointBorderColor: "#ffffff",
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              fill: false,
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `Registros de Usuarios - ${currentMonthName} ${currentYear}`,
              font: {
                size: 16,
                weight: "bold" as const,
              },
              color: "#003366",
            },
            legend: {
              display: true,
              position: "top" as const,
              labels: {
                color: "#333333",
                font: {
                  size: 12,
                },
              },
            },
            tooltip: {
              callbacks: {
                title: (context) => `${context[0].label} de ${currentMonthName} ${currentYear}`,
                label: (context) => `Usuarios registrados: ${context.parsed.y}`,
              },
            },
          },
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: `Días de ${currentMonthName} ${currentYear}`,
                color: "#666666",
                font: {
                  size: 12,
                  weight: "bold" as const,
                },
              },
              grid: {
                color: "#e0e0e0",
              },
              ticks: {
                color: "#666666",
                font: {
                  size: 10,
                },
              },
            },
            y: {
              display: true,
              title: {
                display: true,
                text: "Cantidad de Usuarios",
                color: "#666666",
                font: {
                  size: 12,
                  weight: "bold" as const,
                },
              },
              beginAtZero: true,
              grid: {
                color: "#e0e0e0",
              },
              ticks: {
                color: "#666666",
                font: {
                  size: 10,
                },
                stepSize: 1,
              },
            },
          },
        },
      }

      // Generar imagen del gráfico
      const imageBuffer = await this.chartJSNodeCanvas.renderToBuffer(configuration)
      this.logger.log(`Gráfico generado exitosamente para ${currentMonthName} ${currentYear}`)

      return imageBuffer
    } catch (error) {
      this.logger.error("Error al generar gráfico de registros:", error)
      return null
    }
  }

  /**
   * Obtiene el nombre del mes en español
   */
  private getMonthName(monthIndex: number): string {
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]
    return months[monthIndex] || "Mes"
  }

  /**
   * Crea la definición del documento PDF para estadísticas de usuarios
   */
  // private async createUserStatsDocumentDefinition(
  //   userStats: CompleteUserStats,
  //   reportDto: any,
  // ): Promise<CustomDocumentDefinitions> {
  private async createUserStatsDocumentDefinition(
    userStats: CompleteUserStats,
    user: IJwtPayload
  ): Promise<CustomDocumentDefinitions> {
    try {
      // Cargar logo
      let logoData = null
      try {
        logoData = await this.loadLogoWithRetry()
      } catch (error) {
        this.logger.warn("No se pudo cargar el logo:", error.message)
      }

      // Definir estilos
      const styles: StyleDictionary = {
        headerSection: {
          fontSize: 8,
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
      }

      // Crear contenido del documento
      const content: any[] = []

      // Crea una nueva instancia de Date
      const fechaActual = new Date();
      // Obtiene el año de la fecha actual
      const anioActual = fechaActual.getFullYear();

      let reportTitle = `REPORTE ESTADÍSTICO DE USUARIOS EN EL AÑO ${anioActual}`;
      
      // AÑADIR EL TÍTULO AL PRINCIPIO DEL CONTENIDO
      content.push({
        text: reportTitle,
        style: "reportTitle",
      });

      // Información general del reporte
      // this.addGeneralInfoTable(content, reportDto, styles)
      this.addGeneralInfoTable(content, styles, user)

      // 1) Estadísticas generales
      this.addGeneralStatsSection(content, userStats, styles)

      // 2) Usuarios por rol
      this.addUsersByRoleSection(content, userStats, styles)

      // 3) NUEVO: Generar e insertar el gráfico anual por meses (AÑO ACTUAL). Ejemplo titulo del grafico: 'Registro de Usuarios - Año 2025'
      let yearlyChartBuffer = null
      try {
        yearlyChartBuffer = await this.generateYearlyRegistrationChart(userStats);
      } catch (error) {
        this.logger.warn("No se pudo generar el gráfico anual de usuarios:", (error as any)?.message)
      }

      if (yearlyChartBuffer) {
/*         const anioActual = new Date().getFullYear()
        // Título del gráfico anual (opcional, usando estilos existentes)
        content.push({ text: `Registros de Usuarios por Mes - ${anioActual}`, style: "sectionTitle" }) */
        content.push({
          image: `data:image/png;base64,${yearlyChartBuffer.toString("base64")}`,
          width: 500,
          alignment: "center",
          margin: [0, 10, 0, 20],
        })
      }

      // NUEVO: tabla detallada por mes 
      this.addRegistrationsByMonthSection(content, userStats, styles);

/*     // 5) AGREGAR GRÁFICO DE REGISTROS POR DÍA

      // Generar gráfico de registros por dia
      let chartBuffer = null
      try {
        chartBuffer = await this.generateRegistrationChart(userStats)
      } catch (error) {
        this.logger.warn("No se pudo generar el gráfico:", error.message)
      }

      if (chartBuffer) {
        content.push({
          image: `data:image/png;base64,${chartBuffer.toString("base64")}`,
          width: 500,
          alignment: "center",
          margin: [0, 10, 0, 20],
        })
      }
     //... Sección “Tabla Detallada de Registros por Día”
      this.addRegistrationsByDaySection(content, userStats, styles) */

      // 6)Información del sistema
      this.addSystemInfoSection(content, styles, user)

      // Crear definición del documento
      return {
        content: content,
        styles: styles,
        defaultStyle: {
          font: "Roboto",
          fontSize: 9,
          lineHeight: 1.2,
        },
        pageSize: "A4",
        // pageMargins: [40, 50, 40, 50],
        pageMargins: [40, 80, 40, 60],//80 margen superior en cada pagina del pdf
        background: function(currentPage, pageSize)  {
          // El logo en el fondo de cada página
          if (logoData) {
            return {
              image: `data:image/jpeg;base64,${logoData.toString("base64")}`,
              maxWidth: 515,
              maxHeight: 80,
              alignment: "center",
              margin: [0, 20, 0, 0], // Margen del logo
            };
          }
          return '' // Devuelve un texto vacío si no hay logo
        },
        
        header: (currentPage, pageCount, pageSize) => {
          // El header está vacío para no interferir con el contenido
          return [];
        },
        footer: (currentPage, pageCount) => ({
          text: `Reporte anual de usuarios - Página ${currentPage} de ${pageCount}`,
          style: "footer",
        }),

      }
    } catch (error) {
      throw new Error(`Error al crear la definición del documento: ${error.message}`)
    }
  }

  /**
   * Agrega la tabla de información general
   */
  private addGeneralInfoTable(content: any[], styles: StyleDictionary, user: IJwtPayload): void {
    const today = new Date()
    const year = today.getFullYear()

    const currentDate = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    content.push({
      margin: [0, 5, 0, 15],
      table: {
        widths: ["*", "*", "*"],
        layout: {
          hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
          vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 1 : 0.5),
          hLineColor: (i, node) => (i === 0 || i === node.table.body.length ? "#003366" : "#BBBBBB"),
          vLineColor: (i, node) => (i === 0 || i === node.table.widths.length ? "#003366" : "#BBBBBB"),
          paddingLeft: (i, node) => 6,
          paddingRight: (i, node) => 6,
          paddingTop: (i, node) => 3,
          paddingBottom: (i, node) => 3,
        },
        body: [
          [
            { text: "Tipo de Reporte", style: "tableHeader" },
            { text: "Generado por", style: "tableHeader" },
            { text: "Fecha de Generación", style: "tableHeader" },
          ],
          [
            { text: `Estadísticas de Usuarios en ${year}`, style: "tableCellValue" },
            // { text: reportDto?.role || "Sistema", style: "tableCellValue" },
            { text: "Sistema", style: "tableCellValue" },
            // { text: user?.role || "Sistema", style: "tableCellValue" },
            { text: currentDate, style: "tableCellValue" },
          ],
        ],
      },
    })
  }

  /**
   * Agrega la sección de estadísticas generales
   */
  private addGeneralStatsSection(content: any[], userStats: CompleteUserStats, styles: StyleDictionary): void {
    content.push(
      { text: "Estadísticas Generales", style: "sectionTitle" },
      {
        table: {
          widths: ["50%", "50%"],
          body: [
            [
              { text: "Total de Usuarios en el Año:", style: "tableCellLabel" },
              { text: userStats.totalUsers.toString(), style: "tableCellValue" },
            ],
            [
              { text: "Usuarios Registrados en el Mes:", style: "tableCellLabel" },
              { text: userStats.usersThisMonth.toString(), style: "tableCellValue" },
            ],
            [
              { text: "Usuarios Registrados Hoy:", style: "tableCellLabel" },
              { text: userStats.usersToday.toString(), style: "tableCellValue" },
            ],
            [
              { text: "Usuarios Activos:", style: "tableCellLabel" },
              { text: userStats.activeUsers.toString(), style: "tableCellValue" },
            ],
            [
              { text: "Usuarios Inactivos:", style: "tableCellLabel" },
              { text: userStats.inactiveUsers.toString(), style: "tableCellValue" },
            ],
          ],
        },
        layout: {
          hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
          vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 1 : 0.5),
          hLineColor: (i, node) => (i === 0 || i === node.table.body.length ? "#003366" : "#BBBBBB"),
          vLineColor: (i, node) => (i === 0 || i === node.table.widths.length ? "#003366" : "#BBBBBB"),
          paddingLeft: (i, node) => 6,
          paddingRight: (i, node) => 6,
          paddingTop: (i, node) => 3,
          paddingBottom: (i, node) => 3,
        },
        margin: [0, 5, 0, 15],
      },
    )
  }

  /**
   * Agrega la sección de usuarios por rol
   */
  private addUsersByRoleSection(content: any[], userStats: CompleteUserStats, styles: StyleDictionary): void {
    content.push({ text: "Distribución de Usuarios por Rol", style: "sectionTitle" })

    const roleTableBody = [
      [
        { text: "Rol", style: "tableHeader" },
        { text: "Cantidad de Usuarios", style: "tableHeader" },
        { text: "Porcentaje", style: "tableHeader" },
      ],
    ]

    userStats.usersByRole.forEach((role) => {
      const percentage = userStats.totalUsers > 0 ? ((role.userCount / userStats.totalUsers) * 100).toFixed(1) : "0"

      roleTableBody.push([
        { text: role.roleName, style: "tableCellValue" },
        { text: role.userCount.toString(), style: "tableCellValue" },
        { text: `${percentage}%`, style: "tableCellValue" },
      ])
    })

    content.push({
      table: {
        widths: ["40%", "30%", "30%"],
        body: roleTableBody,
      },
      layout: {
        hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
        vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 1 : 0.5),
        hLineColor: (i, node) => (i === 0 || i === node.table.body.length ? "#003366" : "#BBBBBB"),
        vLineColor: (i, node) => (i === 0 || i === node.table.widths.length ? "#003366" : "#BBBBBB"),
        paddingLeft: (i, node) => 6,
        paddingRight: (i, node) => 6,
        paddingTop: (i, node) => 3,
        paddingBottom: (i, node) => 3,
      },
      margin: [0, 5, 0, 15],
    })
  }

  /**
   * Agrega la sección de registros por día
   */
  private addRegistrationsByDaySection(content: any[], userStats: CompleteUserStats, styles: StyleDictionary): void {
    if (userStats.registrationsByDay && userStats.registrationsByDay.length > 0) {
      content.push({ text: "Tabla Detallada de Registros por Día", style: "sectionTitle" })

      const dayTableBody = [
        [
          { text: "Fecha", style: "tableHeader" },
          { text: "Usuarios Registrados", style: "tableHeader" },
        ],
      ]

      userStats.registrationsByDay.forEach((dayData) => {
        dayTableBody.push([
          { text: dayData.date, style: "tableCellValue" },
          { text: dayData.count.toString(), style: "tableCellValue" },
        ])
      })

      content.push({
        table: {
          widths: ["60%", "40%"],
          body: dayTableBody,
        },
        layout: {
          hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
          vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 1 : 0.5),
          hLineColor: (i, node) => (i === 0 || i === node.table.body.length ? "#003366" : "#BBBBBB"),
          vLineColor: (i, node) => (i === 0 || i === node.table.widths.length ? "#003366" : "#BBBBBB"),
          paddingLeft: (i, node) => 6,
          paddingRight: (i, node) => 6,
          paddingTop: (i, node) => 3,
          paddingBottom: (i, node) => 3,
        },
        margin: [0, 5, 0, 15],
      })
    }
  }

  /**
   * Agrega la sección de información del sistema
   */
  // private addSystemInfoSection(content: any[], reportDto: any, styles: StyleDictionary): void {
  private addSystemInfoSection(content: any[], styles: StyleDictionary, user: IJwtPayload): void {
    const currentDate = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    // Crea una nueva instancia de Date
    const fechaActual = new Date();
    // Obtiene el año de la fecha actual
    const anioActual = fechaActual.getFullYear();

    content.push(
      { text: "\n" },
      // { text: `Generado por: ${reportDto?.role || "Sistema de Gestión Médica"}`, style: "paragraph" },
      { text: `Generado por: ${"Sistema de Gestión Médica"}`, style: "paragraph" },
      // { text: `Generado por: ${user?.role || "Sistema"}`, style: "paragraph" },
      { text: `Fecha y hora de generación: ${currentDate}`, style: "paragraph" },
      { text: `Tipo de reporte: Estadísticas de Usuarios en ${anioActual}`, style: "paragraph" },
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
   * Valida que las estadísticas de usuarios sean válidas
   */
  private validateUserStats(userStats: CompleteUserStats): void {
    if (!userStats) {
      throw new BadRequestException("Las estadísticas de usuarios son requeridas")
    }

    if (typeof userStats.totalUsers !== "number") {
      throw new BadRequestException("El total de usuarios debe ser un número")
    }

    if (!Array.isArray(userStats.usersByRole)) {
      throw new BadRequestException("Los usuarios por rol deben ser un array")
    }
  }

  /**
   * Verifica que las fuentes existen
   */
  private verifyFonts(): void {
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
   * Carga el logo con reintentos
   */
  private async loadLogoWithRetry(): Promise<Buffer | null> {
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

        this.logger.warn(`Intento ${attempt + 1}/${this.MAX_RETRIES}: Logo no encontrado`)

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
    return null
  }

  // NUEVO grafico anual de usuarios: Gráfico por MES del año actual
  private async generateYearlyRegistrationChart(userStats: CompleteUserStats): Promise<Buffer | null> {
    try {
      const now = new Date()
      const currentYear = now.getFullYear()

      // Si no hay datos mensuales, devolvemos null
      if (!userStats.registrationsByMonth || userStats.registrationsByMonth.length === 0) {
        this.logger.warn("No hay datos de registros por mes para generar el gráfico anual")
        return null
      }

      // Asegurar 12 meses (1..12) con 0 por defecto
      const monthCounts: number[] = Array.from({ length: 12 }, () => 0)
      for (const m of userStats.registrationsByMonth) {
        // asumiendo que m.month es 1..12
        if (m.month >= 1 && m.month <= 12) {
          monthCounts[m.month - 1] = Number(m.count || 0)
        }
      }

      // Etiquetas en español
      const labels = [
        "Enero","Febrero","Marzo","Abril","Mayo","Junio",
        "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
      ]
      const data = monthCounts

      const configuration: ChartConfiguration<"bar", number[], string> = {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Usuarios Registrados",
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
              text: `Registros de Usuarios en el ${currentYear}`,
              font: { size: 14, weight: "bold" as const },
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
                label: (ctx) => `Usuarios registrados: ${ctx.parsed.y}`,
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: `Meses del Año ${currentYear}`,
                color: "#666666",
                font: { size: 12, weight: "bold" as const },
              },
              grid: { color: "#e0e0e0" },
              ticks: { color: "#666666", font: { size: 10 } },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Cantidad de Usuarios",
                color: "#666666",
                font: { size: 12, weight: "bold" as const },
              },
              grid: { color: "#e0e0e0" },
              ticks: { color: "#666666", font: { size: 10 }, stepSize: 1 },
            },
          },
        },
      }

      const imageBuffer = await this.chartJSNodeCanvas.renderToBuffer(configuration)
      this.logger.log(`Gráfico anual de usuarios generado exitosamente para el año ${currentYear}`)

      return imageBuffer
    } catch (error) {
      this.logger.error("Error al generar gráfico de registros anual de usuarios:", error)
      return null
    }
  }

  // NUEVO: Tabla Detallada de Registros por Mes
  private addRegistrationsByMonthSection(
    content: any[],
    userStats: CompleteUserStats,
    styles: StyleDictionary
  ): void {
    if (!userStats.registrationsByMonth || userStats.registrationsByMonth.length === 0) {
      this.logger.warn("No hay datos de registros por mes para construir la tabla")
      return
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    content.push({ text: `Tabla Detallada de Registros por Mes en el ${currentYear}`, style: "sectionTitle" })

    const tableBody: any[] = [
      [
        { text: "Mes", style: "tableHeader" },
        { text: "Usuarios Registrados", style: "tableHeader" },
        { text: "Porcentaje", style: "tableHeader" },
      ],
    ]

    // Mapa (mes -> cantidad)
    const byMonth = new Map<number, number>()
    for (const m of userStats.registrationsByMonth) {
      byMonth.set(Number(m.month), Number(m.count || 0))
    }

    // Rellenar 1..12 y mantener orden
    for (let month = 1; month <= 12; month++) {
      const count = byMonth.get(month) ?? 0
      // getMonthName espera índice 0-11
      const monthName = this.getMonthName(month - 1);

      const percentage = userStats.totalUsers > 0 ? ((count / userStats.totalUsers) * 100).toFixed(1) : "0"

      tableBody.push([
        { text: monthName, style: "tableCellValue" },
        { text: count.toString(), style: "tableCellValue" },
        { text: `${percentage}%`, style: "tableCellValue" },
      ])
    }

    content.push({
      table: {
        // widths: ["60%", "40%"],
        widths: ["40%", "30%", "30%"],
        body: tableBody,
      },
      layout: {
        hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
        vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 1 : 0.5),
        hLineColor: (i, node) => (i === 0 || i === node.table.body.length ? "#003366" : "#BBBBBB"),
        vLineColor: (i, node) => (i === 0 || i === node.table.widths.length ? "#003366" : "#BBBBBB"),
        paddingLeft: (i, node) => 6,
        paddingRight: (i, node) => 6,
        paddingTop: (i, node) => 3,
        paddingBottom: (i, node) => 3,
      },
      margin: [0, 5, 0, 15],
    })
  }
}