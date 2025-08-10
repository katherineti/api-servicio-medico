import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common"
import type { Response } from "express"
import type { StyleDictionary, TDocumentDefinitions } from "pdfmake/interfaces"
import { and, count, desc, eq, gte, inArray, lte, sql } from "drizzle-orm"
import { productsTable, categoriesTable, productStatusTable, typesOfProductsTable, providersTable } from "src/db/schema"
import  { NeonDatabase } from "drizzle-orm/neon-serverless"
// import  { DashboardReportService, DashboardReportDto } from "./dashboard-report.service"
import { PG_CONNECTION } from "src/constants"
import { DashboardReportDto, DashboardReportService } from "../dashboard-report.service"
import type { ChartConfiguration } from "chart.js"
import { ChartJSNodeCanvas } from "chartjs-node-canvas"

export interface MedicalSupplyReportDto extends Omit<DashboardReportDto, "role"> {
  // Extender la interfaz base removiendo 'role' que no es necesario para medicamentos
}

export interface ProductRegistrationByMonth {
  month: number // 1-12
  label: string // "Enero", "Febrero", ...
  count: number // Cantidad de usuarios registrados en el mes
}
export interface ProductRegistrationByDay {
  day: number
  date: string
  count: number
}

export interface ProductsByCategory {
  categoryId: number
  categoryName: string
  productCount: number
}

export interface ProductsByStatus {
  statusId: number
  statusName: string
  productCount: number
}

export interface ProductsByType {
  typeId: number
  typeName: string
  productCount: number
}

export interface CompleteMedicalSupplyStats {
  totalProducts: number
  productsMonth: number
  productsDay: number
  productsYear: number
  productsByCategory: ProductsByCategory[]
  productsByStatus: ProductsByStatus[]
  productsByType: ProductsByType[]
  todayProducts: any[] // Productos específicos creados en el año
  registrationsByDay: ProductRegistrationByDay[]
  registrationsByMonth: ProductRegistrationByMonth[] // NUEVO
}

@Injectable()
export class MedicalSuppliesReportAllService {
  private readonly logger = new Logger(MedicalSuppliesReportAllService.name)
  private readonly chartJSNodeCanvas: ChartJSNodeCanvas

  constructor(
    @Inject(PG_CONNECTION) private db: NeonDatabase,
    @Inject(forwardRef(() => DashboardReportService))
    private readonly dashboardReportService: DashboardReportService
  ) {
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
  }

  /**
   * Genera un PDF para el reporte de medicamentos usando el servicio base
   */
  async generatePdf(reportData: MedicalSupplyReportDto, res: Response): Promise<void> {
    try {
      this.logger.log(`Generando PDF para el reporte de inventario almacén: ${reportData.title}`)

      // Obtener estadísticas completas para incluir en additionalInfo
      const medicalSupplyStats = await this.getCompleteMedicalSupplyStats()

      // Crear un reporte extendido con la información de medicamentos
      const extendedReportData: DashboardReportDto = {
        ...reportData,
        role: "Sistema", // Agregar el campo role requerido
        additionalInfo: {
          // Remover los campos que se duplican
          "Total de inventario almacén:": medicalSupplyStats.productsYear,
          "Generado por:": reportData.additionalInfo?.generatedBy || "Sistema",
          "Fecha:": new Date().toISOString(),
          reportType: "Inventario almacén",
          // No incluir productsByCategory, productsByStatus, todayProducts aquí para evitar mostrarlos en la tabla
        },
      }

      // Usar el método generatePdf del DashboardReportService
      await this.dashboardReportService.generatePdf(extendedReportData, res)

      this.logger.log(`PDF de inventario almacén del anio generado exitosamente`)
    } catch (error) {
      this.logger.error(`Error al generar PDF de inventario almacén del anio:`, error)

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
   * Genera un PDF personalizado específico para medicamentos
   */
  async generateCustomMedicalSuppliesPdf(reportData: MedicalSupplyReportDto, res: Response): Promise<void> {
    try {
      this.logger.log(`Generando PDF personalizado para inventario almacén(anio): ${reportData.title}`)

      // Obtener estadísticas completas
      const medicalSupplyStats = await this.getCompleteMedicalSupplyStats()

      // Crear definición del documento personalizada
      const docDefinition = await this.createCustomMedicalSuppliesDocumentDefinition(reportData, medicalSupplyStats)

      // Usar PdfPrinter directamente con la definición personalizada
      const PdfPrinter = require("pdfmake")

      // Usar las mismas fuentes que el DashboardReportService (fuentes de respaldo)
      const fonts = {
        Roboto: {
          normal: "Helvetica",
          bold: "Helvetica-Bold",
          italics: "Helvetica-Oblique",
          bolditalics: "Helvetica-BoldOblique",
        },
      }

      // Crear instancia de PdfPrinter
      const printer = new PdfPrinter(fonts)

      // Crear documento PDF con la definición personalizada
      const pdfDoc = printer.createPdfKitDocument(docDefinition)

      // Manejar errores en la generación del PDF
      pdfDoc.on("error", (error) => {
        this.logger.error(`Error durante la generación del PDF: ${error.message}`)
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

      this.logger.log(`PDF personalizado de inventario almacén(anio) generado exitosamente`)
    } catch (error) {
      this.logger.error(`Error al generar PDF personalizado:`, error)

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
   * Obtiene TODAS las estadísticas de los suplementos medicos
   */
  async getCompleteMedicalSupplyStats(): Promise<CompleteMedicalSupplyStats> {
    try {
      const now = new Date()
      const nowUtc = new Date(now.toISOString())

      const startOfDay = new Date(
        Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), nowUtc.getUTCDate(), 0, 0, 0, 0),
      )
      const endOfDay = new Date(
        Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), nowUtc.getUTCDate(), 23, 59, 59, 999),
      )

      const currentYear = nowUtc.getUTCFullYear()
      const currentMonth = nowUtc.getUTCMonth()
      const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0, 0))
      const endOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999))

      const startOfYear = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0));
      const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));

      // 1. Estadísticas generales de productos 
      const [generalStats] = await this.db
        .select({
          totalProducts: count(),
          productsYear: sql<number>`count(CASE WHEN ${productsTable.createdAt} >= ${startOfYear} AND ${productsTable.createdAt} <= ${endOfYear} THEN 1 ELSE NULL END)`,
          productsMonth: sql<number>`count(CASE WHEN ${productsTable.createdAt} >= ${startOfMonth} AND ${productsTable.createdAt} <= ${endOfMonth} THEN 1 ELSE NULL END)`,
          productsDay: sql<number>`count(CASE WHEN ${productsTable.createdAt} >= ${startOfDay} AND ${productsTable.createdAt} <= ${endOfDay} THEN 1 ELSE NULL END)`,
        })
        .from(productsTable)
        .where(
          inArray(productsTable.statusId, [1,2,3,4])
        )
        // .where(eq(productsTable.type, 1)) // Filtrar solo medicamentos

      // 2. Productos por categoría 
      const productsByCategoryResult = await this.db
        .select({
          categoryId: categoriesTable.id,
          categoryName: categoriesTable.name,
          productCount: count(productsTable.id),
        })
        .from(categoriesTable)
        .innerJoin(productsTable,             
            and(
                eq(productsTable.categoryId, categoriesTable.id),
/*                 and(
                    gte(productsTable.createdAt, startOfMonth),
                    lte(productsTable.createdAt, endOfMonth)
                ), */
                and(
                  gte(productsTable.createdAt, startOfYear),
                  lte(productsTable.createdAt, endOfYear),
                ),
                inArray(productsTable.statusId, [1,2,3,4])
            ))
        .where(inArray(productsTable.statusId, [1,2,3,4]))
        .groupBy(categoriesTable.id, categoriesTable.name)
        .orderBy(categoriesTable.id);

      // 3. Productos por estado 
      const productsByStatusResult = await this.db
        .select({
          statusId: productStatusTable.id,
          statusName: productStatusTable.status,
          productCount: count(productsTable.id),
        })
        .from(productStatusTable)
        // .leftJoin(productsTable, eq(productsTable.statusId, productStatusTable.id))
         .innerJoin(productsTable,
            and(
                eq(productsTable.statusId, productStatusTable.id) ,
                and(
                  gte(productsTable.createdAt, startOfYear),
                  lte(productsTable.createdAt, endOfYear),
                ),
                inArray(productsTable.statusId, [1,2,3,4])
            )
        )
        .where(inArray(productsTable.statusId, [1,2,3,4]))
        .groupBy(productStatusTable.id, productStatusTable.status)
        .orderBy(productStatusTable.id);

      // 4. Productos por tipo 
      const productsByTypeResult = await this.db
        .select({
          typeId: typesOfProductsTable.id,
          typeName: typesOfProductsTable.type,
          productCount: count(productsTable.id),
        })
        .from(typesOfProductsTable)
        // .leftJoin(productsTable, eq(productsTable.type, typesOfProductsTable.id))
        .innerJoin(
            productsTable, 
             and(
                eq(productsTable.type, typesOfProductsTable.id),
                and(
                  gte(productsTable.createdAt, startOfYear),
                  lte(productsTable.createdAt, endOfYear),
                ),
                inArray(productsTable.statusId, [1,2,3,4])
            )
        ) 
        .where(inArray(productsTable.statusId, [1,2,3,4]))
        .groupBy(typesOfProductsTable.id, typesOfProductsTable.type)
        .orderBy(typesOfProductsTable.id);

      // 5. Registros por día del anio actual 
      const registrationsByDayResult = await this.db
        .select({
          createdAt: productsTable.createdAt,
          productCount: count(),
        })
        .from(productsTable)
        .where(
          and(
            inArray(productsTable.statusId, [1,2,3,4]),
            gte(productsTable.createdAt, startOfYear),
            lte(productsTable.createdAt, endOfYear),
            ),
        )
        .groupBy(productsTable.createdAt)
        .orderBy(productsTable.createdAt);

      // 6. Productos específicos creados en el anio 
      const todayProductsResult = await this.db
        .select({
          id: productsTable.id,
          code: productsTable.code,
          name: productsTable.name,
          stock: productsTable.stock,
          description: productsTable.description,
          categoryName: categoriesTable.name,
          statusName: productStatusTable.status,
          typeName: typesOfProductsTable.type,
          providerName: providersTable.name,
          expirationDate: productsTable.expirationDate,
          createdAt: productsTable.createdAt,
        })
        .from(productsTable)
        .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .innerJoin(productStatusTable, eq(productsTable.statusId, productStatusTable.id))
        .innerJoin(typesOfProductsTable, eq(productsTable.type, typesOfProductsTable.id))
        .innerJoin(providersTable, eq(productsTable.providerId, providersTable.id))
        .where(
          and(
            inArray(productsTable.statusId, [1,2,3,4]),
            gte(productsTable.createdAt, startOfYear),
            lte(productsTable.createdAt, endOfYear),
          ),
        )
        // .orderBy(desc(productsTable.createdAt));
        .orderBy(desc(productsTable.name));

      // Procesar resultados usando métodos del DashboardReportService
      const productsByCategory: ProductsByCategory[] = productsByCategoryResult.map((row) => ({
        categoryId: row.categoryId,
        categoryName: this.dashboardReportService.capitalizeFirstLetter(row.categoryName),
        productCount: Number(row.productCount),
      }))

      const productsByStatus: ProductsByStatus[] = productsByStatusResult.map((row) => ({
        statusId: row.statusId,
        statusName: this.dashboardReportService.capitalizeFirstLetter(row.statusName),
        productCount: Number(row.productCount),
      }))

      const productsByType: ProductsByType[] = productsByTypeResult.map((row) => ({
        typeId: row.typeId,
        typeName: this.dashboardReportService.capitalizeFirstLetter(row.typeName),
        productCount: Number(row.productCount),
      }))

      const registrationsByDay: ProductRegistrationByDay[] = []
      const dayMap = new Map<string, number>()

      registrationsByDayResult.forEach((row) => {
        const date = new Date(row.createdAt).toISOString().split("T")[0]
        const day = new Date(row.createdAt).getUTCDate()

        const currentCount = dayMap.get(date) || 0
        dayMap.set(date, currentCount + Number(row.productCount))
      })

      dayMap.forEach((count, date) => {
        const day = new Date(date).getUTCDate()
        registrationsByDay.push({
          day,
          count,
          date,
        })
      })

      registrationsByDay.sort((a, b) => a.day - b.day)

    // 7. Registros por mes del año actual (Para el gráfico de registros anuales de insumos medicos)
    const registrationsByMonthResult = await this.db
      .select({
        month: sql<number>`EXTRACT(MONTH FROM ${productsTable.createdAt})`,
        medicalSuppliesCount: count(),
      })
      .from(productsTable)
      .where(
        and(
          inArray(productsTable.statusId, [1,2,3,4]),
          gte(productsTable.createdAt, startOfYear),
          lte(productsTable.createdAt, endOfYear),
        )
      )
      .groupBy(sql`EXTRACT(MONTH FROM ${productsTable.createdAt})`)
      .orderBy(sql`EXTRACT(MONTH FROM ${productsTable.createdAt})`);
      const monthsEs = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
      ];
      // Inicializa los 12 meses con 0
      const monthCounts: number[] = Array.from({ length: 12 }, () => 0);
      registrationsByMonthResult.forEach((row) => {
        const m = Number(row.month) // 1-12
        if (m >= 1 && m <= 12) {
          monthCounts[m - 1] = Number(row.medicalSuppliesCount)
        }
      });
      const registrationsByMonth: ProductRegistrationByMonth[] = monthCounts.map((count, idx) => ({
        month: idx + 1,
        label: monthsEs[idx],
        count,
      }));

      const completeStats: CompleteMedicalSupplyStats = {
        totalProducts: Number(generalStats.totalProducts),
        productsMonth: Number(generalStats.productsMonth),
        productsDay: Number(generalStats.productsDay),
        productsYear: Number(generalStats.productsYear),
        productsByCategory,
        productsByStatus,
        productsByType,
        registrationsByDay,
        todayProducts: todayProductsResult,
        registrationsByMonth
      }

      this.logger.log("Estadísticas completas de inventario almacén(anio):", JSON.stringify(completeStats, null, 2))
      return completeStats
    } catch (error) {
      this.logger.error("Error al obtener estadísticas de inventario almacén(anio):", error)
      throw new Error("Error al obtener estadísticas completas de inventario almacén(anio)")
    }
  }

  /**
   * Crea una definición de documento personalizada para medicamentos
   */
  private async createCustomMedicalSuppliesDocumentDefinition(
    reportData: MedicalSupplyReportDto,
    medicalSupplyStats: CompleteMedicalSupplyStats,
  ): Promise<TDocumentDefinitions> {
    try {
      // Cargar logo usando el método del DashboardReportService
      let logoData = null
      try {
        logoData = await this.dashboardReportService.loadLogoWithRetry()
      } catch (error) {
        this.logger.warn("No se pudo cargar el logo:", error.message)
      }

      // Definir estilos (reutilizando la estructura del DashboardReportService)
      const styles: StyleDictionary = {
        headerSection: {
          fontSize: 10,
          alignment: "right",
          color: "#666666",
          margin: [0, 5, 0, 0],
        },
        reportTitle: {
          fontSize: 14,
          bold: true,
          alignment: "center",
          margin: [0, 15, 0, 10],
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

      // Crea una nueva instancia de Date
      const fechaActual = new Date();
      // Obtiene el año de la fecha actual
      const anioActual = fechaActual.getFullYear();

      content.push({
        text: `REPORTE ESTADÍSTICO DEL INVENTARIO ALMACÉN REGISTRADO EN EL AÑO ${anioActual}`,
        style: "reportTitle",
      })

      // Información general del reporte
      this.addGeneralInfoTable(content, reportData, styles)

      // Estadísticas generales
      this.addGeneralStatsSection(content, medicalSupplyStats, styles)

      // Gráfico de los registros de insumos medicos en el año actual
      // this.addChart(content, medicalSupplyStats, styles)

      // Productos registrados año (tabla detallada)
      this.addTodayProductsSection(content, medicalSupplyStats, styles)

      // Distribución por categoría
      this.addProductsByCategorySection(content, medicalSupplyStats, styles)

      // Distribución por estado
      this.addProductsByStatusSection(content, medicalSupplyStats, styles)

      // Distribución por tipo
      this.addProductsByTypeSection(content, medicalSupplyStats, styles)

      // NUEVO: Generar e insertar el gráfico anual por meses (AÑO ACTUAL). Ejemplo titulo del grafico: 'Registro de Insumos medicos - Año 2025'
      let yearlyChartBuffer = null
      try {
        yearlyChartBuffer = await this.generateYearlyRegistrationChart(medicalSupplyStats);
      } catch (error) {
        this.logger.warn("No se pudo generar el gráfico anual de usuarios:", (error as any)?.message)
      }

      if (yearlyChartBuffer) {
/*      // Título del gráfico anual (opcional, usando estilos existentes)
        content.push({ text: `Registros de Usuarios por Mes - ${new Date().getFullYear()}`, style: "sectionTitle" }) */
        content.push({
          image: `data:image/png;base64,${yearlyChartBuffer.toString("base64")}`,
          width: 500,
          alignment: "center",
          margin: [0, 10, 0, 20],
        })
      }
      // NUEVO: tabla detallada por mes 
      this.addRegistrationsByMonthSection(content, medicalSupplyStats, styles);

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
          text: `Reporte anual del inventario almacén - Página ${currentPage} de ${pageCount}`,
          style: "footer",
        }),
/*         header: ((currentPage, pageCount, pageSize) => {
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
                      {
                        text: `Estadísticas de Usuarios - Página: ${currentPage} de ${pageCount}`,
                        style: "headerSection",
                      },
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
        }).bind(this), */
      }
    } catch (error) {
      throw new Error(`Error al crear la definición del documento: ${error.message}`)
    }
  }

  /**
   * Agrega la tabla de información general
   */
  private addGeneralInfoTable(content: any[], reportData: MedicalSupplyReportDto, styles: StyleDictionary): void {
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
            { text: "Fecha del Reporte", style: "tableHeader" },
            { text: "Fecha de Generación", style: "tableHeader" },
          ],
          [
            { text: this.dashboardReportService.getValidContent(reportData.type), style: "tableCellValue" },
            { text: this.dashboardReportService.formatDate(reportData.date), style: "tableCellValue" },
            { text: this.dashboardReportService.formatDate(new Date().toISOString()), style: "tableCellValue" },
          ],
        ],
      },
    })
  }

  /**
   * Agrega la sección de estadísticas generales
   */
  private addGeneralStatsSection(
    content: any[],
    medicalSupplyStats: CompleteMedicalSupplyStats,
    styles: StyleDictionary,
  ): void {
    content.push(
      { text: "Estadísticas Generales del Inventario Almacén (Disponibles, No Disponibles, Pròximos a vencer, Caducados)", style: "sectionTitle" },
      {
        table: {
          widths: ["50%", "50%"],
          body: [
            [
              { text: "Todos los Registros de Inventario almacén:", style: "tableCellLabel" },
              { text: medicalSupplyStats.totalProducts.toString(), style: "tableCellValue" },
            ],
            [
              { text: "Registros del Año:", style: "tableCellLabel" },
              { text: medicalSupplyStats.productsYear.toString(), style: "metricValue" },
            ],
            [
              { text: "Registros del Mes:", style: "tableCellLabel" },
              { text: medicalSupplyStats.productsMonth.toString(), style: "tableCellValue" },
            ],
            
            [
              { text: "Registros de Hoy:", style: "tableCellLabel" },
              // { text: medicalSupplyStats.productsMonth.toString(), style: "metricValue" },
              { text: medicalSupplyStats.productsDay.toString(), style: "tableCellValue" },
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
   * Agrega la sección de Inventario Almacén Registrado en el Año - Detalle
   */
  private addTodayProductsSection(
    content: any[],
    medicalSupplyStats: CompleteMedicalSupplyStats,
    styles: StyleDictionary,
  ): void {
    if (medicalSupplyStats.todayProducts && medicalSupplyStats.todayProducts.length > 0) {
      content.push({ text: "Inventario Almacén Registrado en el Año - Detalle ("+medicalSupplyStats.todayProducts.length+")", style: "sectionTitle" })

      const productTableBody = [
        [
          { text: "Código", style: "tableHeader" },
          { text: "Nombre", style: "tableHeader" },
          { text: "Categoría", style: "tableHeader" },
          { text: "Estado", style: "tableHeader" },
          { text: "Stock", style: "tableHeader" },
          { text: "Proveedor", style: "tableHeader" },
        ],
      ]

      medicalSupplyStats.todayProducts.forEach((product) => {
        productTableBody.push([
          { text: this.dashboardReportService.getValidContent(product.code), style: "tableCellValue" },
          { text: this.dashboardReportService.getValidContent(product.name), style: "tableCellValue" },
          { text: this.dashboardReportService.getValidContent(product.categoryName), style: "tableCellValue" },
          { text: this.dashboardReportService.getValidContent(product.statusName), style: "tableCellValue" },
          { text: this.dashboardReportService.getValidContent(product.stock), style: "tableCellValue" },
          { text: this.dashboardReportService.getValidContent(product.providerName), style: "tableCellValue" },
        ])
      })

      content.push({
        table: {
          widths: ["15%", "25%", "15%", "15%", "10%", "20%"],
          body: productTableBody,
        },
        layout: {
          hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
          vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 1 : 0.5),
          hLineColor: (i, node) => (i === 0 || i === node.table.body.length ? "#003366" : "#BBBBBB"),
          vLineColor: (i, node) => (i === 0 || i === node.table.widths.length ? "#003366" : "#BBBBBB"),
          paddingLeft: (i, node) => 5,
          paddingRight: (i, node) => 5,
          paddingTop: (i, node) => 3,
          paddingBottom: (i, node) => 3,
        },
        margin: [0, 10, 0, 20],
      })
    } else {
      content.push(
        { text: "Inventario Almacén Registrado en el año", style: "sectionTitle" },
        {
          text: "No se registró inventario almacén en el año",
          style: "paragraph",
          alignment: "center",
          color: "#666666",
          margin: [0, 10, 0, 20],
        },
      )
    }
  }

  /**
   * Agrega la sección de productos por categoría
   */
  private addProductsByCategorySection(
    content: any[],
    medicalSupplyStats: CompleteMedicalSupplyStats,
    styles: StyleDictionary,
  ): void {

    if (medicalSupplyStats.productsByCategory && medicalSupplyStats.productsByCategory.length > 0) {
      content.push({ text: "Distribución por Categoría", style: "sectionTitle" })

      const categoryTableBody = [
        [
          { text: "Categoría", style: "tableHeader" },
          { text: "Cantidad de Inventario Almacén(Año)", style: "tableHeader" },
          { text: "Porcentaje", style: "tableHeader" },
        ],
      ]
      medicalSupplyStats.productsByCategory.forEach((category) => {
        console.log("category.productCount  " , category.productCount )
        console.log("category.productsMonth  " , medicalSupplyStats.productsMonth )
        const percentage =
          medicalSupplyStats.productsYear > 0
          // medicalSupplyStats.productsMonth > 0
            ? ((category.productCount / medicalSupplyStats.productsYear) * 100).toFixed(1)
            // ? ((category.productCount / medicalSupplyStats.productsMonth) * 100).toFixed(1)
            : "0"
  console.log("medicalSupplyStats.productsYear " , medicalSupplyStats.productsYear)
        categoryTableBody.push([
          { text: category.categoryName, style: "tableCellValue" },
          { text: category.productCount.toString(), style: "tableCellValue" },
          { text: `${percentage}%`, style: "tableCellValue" },
        ])
      })

      content.push({
        table: {
          widths: ["50%", "25%", "25%"],
          body: categoryTableBody,
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
    } else {
      content.push(
        { text: "Distribución por Categoría", style: "sectionTitle" },
        {
          text: "No se registró inventario almacén en el año",
          style: "paragraph",
          alignment: "center",
          color: "#666666",
          margin: [0, 10, 0, 20],
        },
      )
    }
  }

  /**
   * Agrega la sección de productos por estado
   */
  private addProductsByStatusSection(
    content: any[],
    medicalSupplyStats: CompleteMedicalSupplyStats,
    styles: StyleDictionary,
  ): void {

   if (medicalSupplyStats.productsByStatus && medicalSupplyStats.productsByStatus.length > 0) {
    content.push({ text: "Distribución por Estado", style: "sectionTitle" })

    const statusTableBody = [
      [
        { text: "Estado", style: "tableHeader" },
        { text: "Cantidad de Inventario Almacén(Año)", style: "tableHeader" },
        { text: "Porcentaje", style: "tableHeader" },
      ],
    ]

    medicalSupplyStats.productsByStatus.forEach((status) => {
      const percentage =
        medicalSupplyStats.productsYear > 0
        // medicalSupplyStats.productsMonth > 0
          ? ((status.productCount / medicalSupplyStats.productsYear) * 100).toFixed(1)
          // ? ((status.productCount / medicalSupplyStats.productsMonth) * 100).toFixed(1)
          : "0"

      statusTableBody.push([
        { text: status.statusName, style: "tableCellValue" },
        { text: status.productCount.toString(), style: "tableCellValue" },
        { text: `${percentage}%`, style: "tableCellValue" },
      ])
    })

    content.push({
      table: {
        widths: ["50%", "25%", "25%"],
        body: statusTableBody,
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

    } else {
      content.push(
        { text: "Distribución por Estado", style: "sectionTitle" },
        {
          text: "No se registró inventario almacén en el año",
          style: "paragraph",
          alignment: "center",
          color: "#666666",
          margin: [0, 10, 0, 20],
        },
      )
    }
  }

  /**
   * Agrega la sección de productos por tipo
   */
  private addProductsByTypeSection(
    content: any[],
    medicalSupply: CompleteMedicalSupplyStats,
    styles: StyleDictionary,
  ): void {

   if (medicalSupply.productsByStatus && medicalSupply.productsByStatus.length > 0) {
    content.push({ text: "Distribución por Tipo", style: "sectionTitle" })

    const statusTableBody = [
      [
        { text: "Tipo", style: "tableHeader" },
        { text: "Cantidad de Inventario Almacén(Año)", style: "tableHeader" },
        { text: "Porcentaje", style: "tableHeader" },
      ],
    ]

    medicalSupply.productsByType.forEach((type) => {
      console.log("Distribución por Tipo. "+"type.productCount, medicalSupply.productsYear; ",type.productCount,",",medicalSupply.productsYear)
      const percentage =
        medicalSupply.productsYear > 0
        // medicalSupplyStats.productsMonth > 0
          ? ((type.productCount / medicalSupply.productsYear) * 100).toFixed(1)
          // ? ((type.productCount / medicalSupplyStats.productsMonth) * 100).toFixed(1)
          : "0"

      statusTableBody.push([
        { text: type.typeName, style: "tableCellValue" },
        { text: type.productCount.toString(), style: "tableCellValue" },
        { text: `${percentage}%`, style: "tableCellValue" },
      ])
    })

    content.push({
      table: {
        widths: ["50%", "25%", "25%"],
        body: statusTableBody,
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

    } else {
      content.push(
        { text: "Distribución por Tipo", style: "sectionTitle" },
        {
          text: "No se registró inventario almacén en el año",
          style: "paragraph",
          alignment: "center",
          color: "#666666",
          margin: [0, 10, 0, 20],
        },
      )
    }
  }

  /**
   * Agrega la sección de información del sistema
   */
  private addSystemInfoSection(content: any[], reportData: MedicalSupplyReportDto, styles: StyleDictionary): void {
    const currentDate = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    content.push(
      { text: "\n\n" },
      { text: `Generado por: Sistema de Gestión Médica`, style: "paragraph" },
      { text: `Fecha y hora de generación: ${currentDate}`, style: "paragraph" },
      { text: `Tipo de reporte: ${reportData.type}`, style: "paragraph" },
      { text: "\n" },
      {
        text: "Este reporte fue generado automáticamente por el sistema de gestión de inventario médico.",
        style: "paragraph",
        alignment: "center",
        color: "#666666",
      },
    )
  }

  // NUEVO grafico anual de usuarios: Gráfico por MES del año actual
  private async generateYearlyRegistrationChart(medicalSupplyStats: CompleteMedicalSupplyStats): Promise<Buffer | null> {
    try {
      const now = new Date()
      const currentYear = now.getFullYear()

      // Si no hay datos mensuales, devolvemos null
      if (!medicalSupplyStats.registrationsByMonth || medicalSupplyStats.registrationsByMonth.length === 0) {
        this.logger.warn("No hay datos de registros por mes para generar el gráfico anual")
        return null
      }

      // Asegurar 12 meses (1..12) con 0 por defecto
      const monthCounts: number[] = Array.from({ length: 12 }, () => 0)
      for (const m of medicalSupplyStats.registrationsByMonth) {
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
              label: "Inventario Almacén Registrado",
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
              text: `Registros de Inventario Almacén en el ${currentYear}`,
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
                label: (ctx) => `Inventario almacén registrado: ${ctx.parsed.y}`,
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
                text: "Cantidad de Inventario Almacén",
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
      this.logger.log(`Gráfico anual de inventario almacen generado exitosamente para el año ${currentYear}`)

      return imageBuffer
    } catch (error) {
      this.logger.error("Error al generar gráfico de registros anual de inventario almacen:", error)
      return null
    }
  }

  // NUEVO: Tabla Detallada de Registros por Mes
  private addRegistrationsByMonthSection(
    content: any[],
    medicalSupplyStats: CompleteMedicalSupplyStats,
    styles: StyleDictionary
  ): void {
    if (!medicalSupplyStats.registrationsByMonth || medicalSupplyStats.registrationsByMonth.length === 0) {
      this.logger.warn("No hay datos de registros por mes para construir la tabla")
      return
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    content.push({ text: `Tabla Detallada de Registros por Mes en el ${currentYear}`, style: "sectionTitle" })

    const tableBody: any[] = [
      [
        { text: "Mes", style: "tableHeader" },
        { text: "Inventario Almacén Registrado", style: "tableHeader" },
        { text: "Porcentaje", style: "tableHeader" },
      ],
    ]

    // Mapa (mes -> cantidad)
    const byMonth = new Map<number, number>()
    for (const m of medicalSupplyStats.registrationsByMonth) {
      byMonth.set(Number(m.month), Number(m.count || 0))
    }

    for (let month = 1; month <= 12; month++) {
      const count = byMonth.get(month) ?? 0
      // getMonthName espera índice 0-11
      const monthName = this.getMonthName(month - 1);

      const percentage = medicalSupplyStats.productsYear > 0 ? ((count / medicalSupplyStats.productsYear) * 100).toFixed(1) : "0"

      tableBody.push([
        { text: monthName, style: "tableCellValue" },
        { text: count.toString(), style: "tableCellValue" },
        { text: `${percentage}%`, style: "tableCellValue" },
      ])
    }

    content.push({
      table: {
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
}