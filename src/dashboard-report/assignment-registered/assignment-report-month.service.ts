import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common"
import type { Response } from "express"
import type { StyleDictionary, TDocumentDefinitions } from "pdfmake/interfaces"
import { and, count, desc, eq, gte, lte, sql, inArray, ne } from "drizzle-orm"
import {
  assignmentTable,
  employeeTable,
  familyTable,
  employeeFamilyTable,
  productsTable,
  typesOfProductsTable,
} from "src/db/schema"
import type { NeonDatabase } from "drizzle-orm/neon-serverless"
import { DashboardReportService } from "../../dashboard-report/dashboard-report.service"
import type {
  AssignmentReportDto,
  CompleteAssignmentStats,
  AssignmentRegistrationByDay,
  AssignmentsByEmployee,
  AssignmentsByProductType,
  AssignmentsByFamily,
  AssignmentRegistrationByMonth,
} from "./assignment-stats.interface"
import { PG_CONNECTION } from "src/constants"
import { AssignmentService } from "src/assignment/assignment.service"
import type { ChartConfiguration } from "chart.js"
import { ChartJSNodeCanvas } from "chartjs-node-canvas"

export interface AssignmentReportOptions {
  reportType: "day" | "month" | "year"
  date?: Date // Fecha específica para reportes del día
}

@Injectable()
export class AssignmentReportMonthService {
  private readonly logger = new Logger(AssignmentReportMonthService.name)
  private readonly chartJSNodeCanvas: ChartJSNodeCanvas

  constructor(
    @Inject(PG_CONNECTION) private db: NeonDatabase,
    // private readonly assignmentService: AssignmentService,
    @Inject(forwardRef(() => DashboardReportService))
    private readonly dashboardReportService: DashboardReportService,
    private readonly assignmentService: AssignmentService
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
   * Genera un PDF personalizado específico para asignaciones del mes
   */
  async generateCustomAssignmentsPdf(
    reportData: AssignmentReportDto,
    res: Response,
    options: AssignmentReportOptions = { reportType: "month" },
  ): Promise<void> {
    try {
      console.log("GenerateCustomAssignmentsPdf()  options: " , options);
      this.logger.log(`Generando PDF personalizado de asignaciones a empleados: ${reportData.title}`)

      // Obtener estadísticas completas
      const assignmentStats = await this.getCompleteAssignmentStats(options)

      // Crear definición del documento personalizada
      const docDefinition = await this.createCustomAssignmentsDocumentDefinition(reportData, assignmentStats, options)

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

      this.logger.log(`PDF personalizado de las asignaciones a empleados, generado exitosamente`)
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
   * Obtiene TODAS las estadísticas de las asignaciones a empleados
   */
  async getCompleteAssignmentStats(
    options: AssignmentReportOptions = { reportType: "month" },
  ): Promise<CompleteAssignmentStats> {
    try {
      console.log("GetCompleteAssignmentStats()  options: " , options);
      // Determinar el rango de fechas según el tipo de reporte
      let startRange: Date, endRange: Date, 
          startOfDay: Date, endOfDay: Date, 
          startMonth: Date, endMonth: Date

/*        if (options.reportType === "day") {
        const targetDate = options.date || new Date()
        const targetUtc = new Date(targetDate.toISOString())

        startOfDay = new Date(
          Date.UTC(targetUtc.getUTCFullYear(), targetUtc.getUTCMonth(), targetUtc.getUTCDate(), 0, 0, 0, 0),
        )
        endOfDay = new Date(
          Date.UTC(targetUtc.getUTCFullYear(), targetUtc.getUTCMonth(), targetUtc.getUTCDate(), 23, 59, 59, 999),
        )

        startRange = startOfDay
        endRange = endOfDay
      } else {
        const now = new Date()
        const nowUtc = new Date(now.toISOString())

        startOfDay = new Date(Date.UTC(
            nowUtc.getUTCFullYear(), 
            nowUtc.getUTCMonth(), 
            nowUtc.getUTCDate(), 0, 0, 0, 0));
        endOfDay = new Date( Date.UTC(
            nowUtc.getUTCFullYear(), 
            nowUtc.getUTCMonth(), 
            nowUtc.getUTCDate(), 23, 59, 59, 999));

        const currentYear = nowUtc.getUTCFullYear()
        const currentMonth = nowUtc.getUTCMonth()
        startRange = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0, 0))
        endRange = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999))
      }  */
/*       if (options.reportType === "day") {
        const targetDate = options.date || new Date()
        const targetUtc = new Date(targetDate.toISOString())

        startOfDay = new Date(
            targetDate.getFullYear(),
            targetDate.getMonth(),
            targetDate.getDate(),
            0, // Horas
            0, // Minutos
            0, // Segundos
            0  // Milisegundos
        )

        endOfDay = new Date(
            targetDate.getFullYear(),
            targetDate.getMonth(),
            targetDate.getDate(),
            23, // Horas
            59, // Minutos
            59, // Segundos
            999 // Milisegundos
        )

        startRange = startOfDay
        endRange = endOfDay
        
      } else {
        const now = new Date()
        const nowUtc = new Date(now.toISOString())

        startOfDay = new Date(Date.UTC(
            nowUtc.getUTCFullYear(), 
            nowUtc.getUTCMonth(), 
            nowUtc.getUTCDate(), 0, 0, 0, 0));
        endOfDay = new Date( Date.UTC(
            nowUtc.getUTCFullYear(), 
            nowUtc.getUTCMonth(), 
            nowUtc.getUTCDate(), 23, 59, 59, 999));

        const currentYear = nowUtc.getUTCFullYear()
        const currentMonth = nowUtc.getUTCMonth()
        startRange = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0, 0))
        endRange = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999))
      } */

    const now = new Date();
    const currentYear = now.getUTCFullYear();

    //año
    const startOfYear = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0));
    const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));

    const nowUtc = new Date(now.toISOString());
    //mes
    const currentMonth = nowUtc.getUTCMonth()
    startMonth = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0, 0))
    endMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999))

    //dia
    startOfDay = new Date(Date.UTC(
        nowUtc.getUTCFullYear(), 
        nowUtc.getUTCMonth(), 
        nowUtc.getUTCDate(), 0, 0, 0, 0));
    endOfDay = new Date( Date.UTC(
        nowUtc.getUTCFullYear(), 
        nowUtc.getUTCMonth(), 
        nowUtc.getUTCDate(), 23, 59, 59, 999));

    startRange = startOfYear;
    endRange = endOfYear;

    if (options.reportType === "day") {
        // 1. Obtener la fecha objetivo (hoy, en tu zona horaria local)
        const targetDateLocal = options.date || new Date();

        // 2. Establecer la hora de esa fecha local al inicio del día (00:00:00.000)
        // Esto se hace en tu zona horaria local.
        targetDateLocal.setHours(0, 0, 0, 0);

        // 3. 'startOfDay' es simplemente esa fecha local ajustada al inicio del día.
        // Cuando se imprima con .toISOString(), JavaScript la convertirá a su equivalente UTC.
        startOfDay = targetDateLocal;

        // 4. Crear una copia de 'startOfDay' para 'endOfDay'
        const endOfDayLocal = new Date(targetDateLocal);

        // 5. Establecer la hora de 'endOfDayLocal' al final del día (23:59:59.999)
        // Esto también se hace en tu zona horaria local.
        endOfDayLocal.setHours(23, 59, 59, 999);

        // 6. 'endOfDay' es esa fecha local ajustada al fin del día.
        // Cuando se imprima con .toISOString(), se convertirá a su equivalente UTC.
        endOfDay = endOfDayLocal;

        startRange = startOfDay;
        endRange = endOfDay;

      } else if (options.reportType === "month"){
        const now = new Date()
        const nowUtc = new Date(now.toISOString())

        startOfDay = new Date(Date.UTC(
            nowUtc.getUTCFullYear(), 
            nowUtc.getUTCMonth(), 
            nowUtc.getUTCDate(), 0, 0, 0, 0));
        endOfDay = new Date( Date.UTC(
            nowUtc.getUTCFullYear(), 
            nowUtc.getUTCMonth(), 
            nowUtc.getUTCDate(), 23, 59, 59, 999));

        const currentYear = nowUtc.getUTCFullYear()
        const currentMonth = nowUtc.getUTCMonth()
        startRange = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0, 0))
        endRange = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999))
      } 

this.logger.log('***************  Filtro de dia o mes o anio: ***************');
this.logger.log('año prueba antes:', startOfYear," ",endOfYear);
this.logger.log('startOfDay:', startOfDay);
this.logger.log('endOfDay:', endOfDay);
console.log("antes de 1.generalStats")
/*     // 1. Estadísticas generales de asignaciones
      const [generalStats] = await this.db
        .select({
          totalAssignments: count(),
          assignmentsToday: sql<number>`count(CASE WHEN ${assignmentTable.createdAt} >= ${startOfDay} AND ${assignmentTable.createdAt} <= ${endOfDay} THEN 1 ELSE NULL END)`,
          assignmentsThisMonth: sql<number>`count(CASE WHEN ${assignmentTable.createdAt} >= ${startRange} AND ${assignmentTable.createdAt} <= ${endRange} THEN 1 ELSE NULL END)`,
          totalProductsAssigned: sql<number>`sum(${assignmentTable.products})`,//por a hora no se usa porque es la suma de todos los registros
          totalProductsAssignedThisMonth: sql<number>`sum(CASE WHEN ${assignmentTable.createdAt} >= ${startRange} AND ${assignmentTable.createdAt} <= ${endRange} THEN ${assignmentTable.products} ELSE 0 END)`,
        })
        .from(assignmentTable)
        .innerJoin(productsTable, eq(productsTable.id, assignmentTable.productId))
        // .where(and(inArray(productsTable.type, [1, 2, 3]), ne(productsTable.statusId, 4)))
        .where(
          and(
            inArray(productsTable.type, [1, 2, 3]), 
            inArray(productsTable.statusId, [1, 2, 3, 4]), 
          )
        ) */
      // 1. Estadísticas generales de asignaciones
      let generalStats=null
      if(options.reportType === "year"){
      generalStats = await this.db
        .select({
          totalAssignments: count(),

          assignmentsThisMonth: sql<number>`count(CASE WHEN ${assignmentTable.createdAt} >= ${startMonth} AND ${assignmentTable.createdAt} <= ${endMonth} THEN 1 ELSE NULL END)`,
          totalProductsAssignedThisMonth: sql<number>`sum(CASE WHEN ${assignmentTable.createdAt} >= ${startMonth} AND ${assignmentTable.createdAt} <= ${endMonth} THEN ${assignmentTable.products} ELSE 0 END)`,
        
          registryAssignmentsYear: sql<number>`count(CASE WHEN ${assignmentTable.createdAt} >= ${startOfYear} AND ${assignmentTable.createdAt} <= ${endOfYear} THEN 1 ELSE NULL END)`,
          totalProductsAssignedYear: sql<number>`sum(CASE WHEN ${assignmentTable.createdAt} >= ${startOfYear} AND ${assignmentTable.createdAt} <= ${endOfYear} THEN ${assignmentTable.products} ELSE 0 END)`,
        })
        .from(assignmentTable)
        .innerJoin(productsTable, eq(productsTable.id, assignmentTable.productId))
        .where(
          and(
            inArray(productsTable.type, [1, 2, 3]), 
            inArray(productsTable.statusId, [1, 2, 3, 4]), 
          )
        ); 
      }else{ 
      //Consulta para dia y mes actual:
      generalStats = await this.db
        .select({
          // totalAssignments: count(),
          totalAssignments: sql<number>`count(CASE WHEN ${assignmentTable.createdAt} >= ${startOfYear} AND ${assignmentTable.createdAt} <= ${endOfYear} THEN 1 ELSE NULL END)`,
          assignmentsThisMonth: sql<number>`count(CASE WHEN ${assignmentTable.createdAt} >= ${startRange} AND ${assignmentTable.createdAt} <= ${endRange} THEN 1 ELSE NULL END)`,
          totalProductsAssignedThisMonth: sql<number>`sum(CASE WHEN ${assignmentTable.createdAt} >= ${startRange} AND ${assignmentTable.createdAt} <= ${endRange} THEN ${assignmentTable.products} ELSE 0 END)`,
        })
        .from(assignmentTable)
        .innerJoin(productsTable, eq(productsTable.id, assignmentTable.productId))
        .where(
          and(
            inArray(productsTable.type, [1, 2, 3]), 
            inArray(productsTable.statusId, [1, 2, 3, 4]), 
          )
        );
      }

      generalStats = generalStats[0]

      // 2. Asignaciones por empleado (del dia,mes o año actual)
      const assignmentsByEmployeeResult = await this.db
        .select({
          employeeId: employeeTable.id,
          employeeName: employeeTable.name,
          employeeCedula: employeeTable.cedula,
          assignmentCount: count(assignmentTable.id),
          totalProducts: sql<number>`sum(${assignmentTable.products})`,
        })
        .from(employeeTable)
        .leftJoin(assignmentTable, eq(assignmentTable.employeeId, employeeTable.id))
        .leftJoin(productsTable, eq(productsTable.id, assignmentTable.productId))
        .where(
          and(
            gte(assignmentTable.createdAt, startRange),
            lte(assignmentTable.createdAt, endRange),
            inArray(productsTable.type, [1, 2, 3]),
            // ne(productsTable.statusId, 4),
            inArray(productsTable.statusId, [1, 2, 3, 4]),
          ),
        )
        .groupBy(employeeTable.id, employeeTable.name, employeeTable.cedula)
        .orderBy(desc(sql<number>`count(${assignmentTable.id})`));

      // 3. Asignaciones por tipo de producto (del dia,mes o año actual)
      const assignmentsByProductTypeResult = await this.db
        .select({
          typeId: typesOfProductsTable.id,
          typeName: typesOfProductsTable.type,
          assignmentCount: count(assignmentTable.id),
          totalProducts: sql<number>`sum(${assignmentTable.products})`,
        })
        .from(typesOfProductsTable)
        .leftJoin(productsTable, eq(productsTable.type, typesOfProductsTable.id))
        .leftJoin(assignmentTable, eq(assignmentTable.productId, productsTable.id))
        .where(
          and(
            gte(assignmentTable.createdAt, startRange),
            lte(assignmentTable.createdAt, endRange),
            inArray(productsTable.type, [1, 2, 3]),
            inArray(productsTable.statusId, [1, 2, 3, 4]),
          ),
        )
        .groupBy(typesOfProductsTable.id, typesOfProductsTable.type)
        .orderBy(typesOfProductsTable.id);

      // 4. Asignaciones a familiares (del dia,mes o año actual)
      const assignmentsByFamilyResult = await this.db
        .select({
          familyId: familyTable.id,
          familyName: familyTable.name,
          familyCedula: familyTable.cedula,
          employeeName: employeeTable.name,
          assignmentCount: count(assignmentTable.id),
          totalProducts: sql<number>`sum(${assignmentTable.products})`,
        })
        .from(familyTable)
        .leftJoin(employeeFamilyTable, eq(employeeFamilyTable.familyId, familyTable.id))
        .leftJoin(employeeTable, eq(employeeTable.id, employeeFamilyTable.employeeId))
        .leftJoin(
          assignmentTable,
          and(eq(assignmentTable.familyId, familyTable.id), eq(assignmentTable.employeeId, employeeTable.id)),
        )
        .leftJoin(productsTable, eq(productsTable.id, assignmentTable.productId))
        .where(
          and(
            gte(assignmentTable.createdAt, startRange),
            lte(assignmentTable.createdAt, endRange),
            inArray(productsTable.type, [1, 2, 3]),
            inArray(productsTable.statusId, [1, 2, 3, 4]),
          ),
        )
        .groupBy(familyTable.id, familyTable.name, familyTable.cedula, employeeTable.name)
        .orderBy(desc(sql<number>`count(${assignmentTable.id})`));

      // 5. Registros por día del mes actual // no se esta usando en el anual
      const registrationsByDayResult = await this.db
        .select({
          createdAt: assignmentTable.createdAt,
          assignmentCount: count(),
        })
        .from(assignmentTable)
        .innerJoin(productsTable, eq(productsTable.id, assignmentTable.productId))
        .where(
          and(
            gte(assignmentTable.createdAt, startRange),
            lte(assignmentTable.createdAt, endRange),
            inArray(productsTable.type, [1, 2, 3]),
            inArray(productsTable.statusId, [1, 2, 3, 4]),
          ),
        )
        .groupBy(assignmentTable.createdAt)
        .orderBy(assignmentTable.createdAt);

      // 6. Asignaciones específicas del dia, mes o año con detalles completos
      // const monthlyAssignmentsResult = await this.db
      const assignmentsDetailsResult = await this.db
        .select({
          id: assignmentTable.id,
          employeeName: employeeTable.name,
          employeeCedula: employeeTable.cedula,
          familyName: familyTable.name,
          familyCedula: familyTable.cedula,
          productName: productsTable.name,
          productCode: productsTable.code,
          typeName: typesOfProductsTable.type,
          assignedProducts: assignmentTable.products,
          observation: assignmentTable.observation,
          createdAt: assignmentTable.createdAt,
        })
        .from(assignmentTable)
        .innerJoin(employeeTable, eq(assignmentTable.employeeId, employeeTable.id))
        .leftJoin(familyTable, eq(assignmentTable.familyId, familyTable.id))
        .innerJoin(productsTable, eq(assignmentTable.productId, productsTable.id))
        .innerJoin(typesOfProductsTable, eq(productsTable.type, typesOfProductsTable.id))
        .where(
          and(
            gte(assignmentTable.createdAt, startRange),
            lte(assignmentTable.createdAt, endRange),
            inArray(productsTable.type, [1, 2, 3]),
            inArray(productsTable.statusId, [1, 2, 3, 4]),
          ),
        )
        .orderBy(desc(assignmentTable.createdAt));

      // Procesar resultados
      const assignmentsByEmployee: AssignmentsByEmployee[] = assignmentsByEmployeeResult.map((row) => ({
        employeeId: row.employeeId,
        employeeName: this.dashboardReportService.capitalizeFirstLetter(row.employeeName),
        employeeCedula: row.employeeCedula,
        assignmentCount: Number(row.assignmentCount),
        totalProducts: Number(row.totalProducts) || 0,
      }))

      const assignmentsByProductType: AssignmentsByProductType[] = assignmentsByProductTypeResult.map((row) => ({
        typeId: row.typeId,
        typeName: this.dashboardReportService.capitalizeFirstLetter(row.typeName),
        assignmentCount: Number(row.assignmentCount),
        totalProducts: Number(row.totalProducts) || 0,
      }))

      const assignmentsByFamily: AssignmentsByFamily[] = assignmentsByFamilyResult.map((row) => ({
        familyId: row.familyId,
        familyName: this.dashboardReportService.capitalizeFirstLetter(row.familyName),
        familyCedula: row.familyCedula,
        employeeName: this.dashboardReportService.capitalizeFirstLetter(row.employeeName),
        assignmentCount: Number(row.assignmentCount),
        totalProducts: Number(row.totalProducts) || 0,
      }))

      const registrationsByDay: AssignmentRegistrationByDay[] = []
      const dayMap = new Map<string, number>()

      registrationsByDayResult.forEach((row) => {
        const date = new Date(row.createdAt).toISOString().split("T")[0]
        const day = new Date(row.createdAt).getUTCDate()

        const currentCount = dayMap.get(date) || 0
        dayMap.set(date, currentCount + Number(row.assignmentCount))
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

    // 7. Registros por mes del año actual (Para el gráfico de registros anuales de las asignaciones de insumos medicos a empleados)
    const registrationsByMonthResult = await this.db
      .select({
        month: sql<number>`EXTRACT(MONTH FROM ${assignmentTable.createdAt})`,
        assignmentCount: count(),
      })
      .from(assignmentTable)
      .innerJoin(productsTable, eq(assignmentTable.productId, productsTable.id))
      .where(
        and(
          gte(assignmentTable.createdAt, startOfYear),
          lte(assignmentTable.createdAt, endOfYear),
            inArray(productsTable.type, [1, 2, 3]),
            inArray(productsTable.statusId, [1, 2, 3, 4]),
        )
      )
      .groupBy(sql`EXTRACT(MONTH FROM ${assignmentTable.createdAt})`)
      .orderBy(sql`EXTRACT(MONTH FROM ${assignmentTable.createdAt})`);
      const monthsEs = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
      ];
      // Inicializa los 12 meses con 0
      const monthCounts: number[] = Array.from({ length: 12 }, () => 0);
      registrationsByMonthResult.forEach((row) => {
        const m = Number(row.month) // 1-12
        if (m >= 1 && m <= 12) {
          monthCounts[m - 1] = Number(row.assignmentCount)
        }
      });
      const registrationsByMonth: AssignmentRegistrationByMonth[] = monthCounts.map((count, idx) => ({
        month: idx + 1,
        label: monthsEs[idx],
        count,
      }));

      const completeStats: CompleteAssignmentStats = {
        totalAssignments: Number(generalStats.totalAssignments),

        assignmentsToday:  (await this.assignmentService.totalAssignmentOfTheDay()).count,
        assignmentsThisMonth: (await this.assignmentService.totalAssignmentOfMonth()).count,

        totalProductsAssignedThisMonthOrToday: options.reportType === "day"? Number( (await this.assignmentService.countProductsAssignmentOfTheDay()).count ) : Number( (await this.assignmentService.countProductsAssignmentOfMonth([1,2,3])).count ),
        assignmentDetails: assignmentsDetailsResult,//Asignaciones específicas del dia, mes o año con detalles completos

        assignmentsByEmployee,
        assignmentsByProductType,
        assignmentsByFamily,

        registrationsByDay,
        registrationsByMonth,

        registryAssignmentsYear: Number(generalStats.registryAssignmentsYear),
        totalProductsAssignedYear: Number(generalStats.totalProductsAssignedYear),
      }

      this.logger.log("Estadísticas completas de asignaciones a empleados:", JSON.stringify(completeStats, null, 2))
      return completeStats
    } catch (error) {
      this.logger.error("Error al obtener estadísticas de asignaciones a empleados:", error)
      throw new Error("Error al obtener estadísticas completas de asignaciones a empleados")
    }
  }

  /**
   * Crea una definición de documento personalizada para asignaciones
   */
  private async createCustomAssignmentsDocumentDefinition(
    reportData: AssignmentReportDto,
    assignmentStats: CompleteAssignmentStats,
    options: AssignmentReportOptions = { reportType: "month" },
  ): Promise<TDocumentDefinitions> {
    try {console.log("--------------options",options)
      // Cargar logo usando el método del DashboardReportService
      let logoData = null;
      // let labelReportType = options.reportType === "day"? 'del Dia':'del Mes';
      let labelReportType = "del Año Actual";
      if(options.reportType === "month"){
        labelReportType = 'del Mes';
      }
      if(options.reportType === "day"){
        labelReportType = 'del Dia';
      }

      try {
        logoData = await this.dashboardReportService.loadLogoWithRetry()
      } catch (error) {
        this.logger.warn("No se pudo cargar el logo:", error.message)
      }

      // Definir estilos
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

/*       const reportTitle =
        options.reportType === "day"
          ? "REPORTE DE REGISTROS DIARIOS DE LAS ASIGNACIONES DE INSUMOS MÉDICOS A EMPLEADOS"
          : "REPORTE DE REGISTROS MENSUAL DE LAS ASIGNACIONES DE INSUMOS MÉDICOS A EMPLEADOS" */
      const now = new Date();
      const currentYear = now.getFullYear();
      
      let reportTitle = `REPORTE REGISTROS ANUALES DE LAS ASIGNACIONES DE INSUMOS MÉDICOS A EMPLEADOS ${currentYear}`;
      if(options.reportType === "month"){
       reportTitle = "REPORTE REGISTROS MENSUALES DE LAS ASIGNACIONES DE INSUMOS MÉDICOS A EMPLEADOS";
      }
      if(options.reportType === "day"){
      reportTitle = "REPORTE REGISTROS DIARIOS DE LAS ASIGNACIONES DE INSUMOS MÉDICOS A EMPLEADOS";
      }

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
        text: reportTitle,
        style: "reportTitle",
      })

      console.log("options.reportType " , options.reportType)

      // Información general del reporte
      this.addGeneralInfoTable(content, reportData, styles)

      // Estadísticas generales
      this.addGeneralStatsSection(content, assignmentStats, styles, options)

      // Asignaciones por empleado
      this.addAssignmentsByEmployeeSection(content, assignmentStats, styles)

      // Asignaciones por tipo de producto
      this.addAssignmentsByProductTypeSection(content, assignmentStats, styles, options.reportType)

      // Asignaciones a familiares
      this.addAssignmentsByFamilySection(content, assignmentStats, styles, options.reportType)
      
      // NUEVO: Generar e insertar el gráfico anual por meses (AÑO ACTUAL). Ejemplo titulo del grafico: 'Registro de Insumos medicos - Año 2025'
      if(options.reportType === "year"){
        let yearlyChartBuffer = null
        try {
          yearlyChartBuffer = await this.generateYearlyRegistrationChart(assignmentStats);
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
      }
      // Detalle de Asignaciones
      this.addAssignmentDetailSection(content, assignmentStats, styles, options.reportType)
      // NUEVO: tabla detallada por mes 
      // this.addRegistrationsByMonthSection(content, medicalSupplyStats, styles);


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
          text: `Reporte de Asignaciones ${labelReportType} - Página ${currentPage} de ${pageCount}`,
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
  private addGeneralInfoTable(content: any[], reportData: AssignmentReportDto, styles: StyleDictionary): void {
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
    assignmentStats: CompleteAssignmentStats,
    styles: StyleDictionary,
    options: AssignmentReportOptions,
  ): void {
    const periodLabel = options.reportType === "day" ? "Hoy" : "del Mes"

    if(options.reportType === "year" ){
      content.push(
        { text: "Estadísticas Generales de las Asignaciones a Empleados", style: "sectionTitle" },
        {
          table: {
            widths: ["50%", "50%"],
            body: [
              [
                { text: "Total de Asignaciones (Registro):", style: "tableCellLabel" },
                { text: assignmentStats.totalAssignments.toString(), style: "tableCellValue" },
              ],
              //Asignaciones del año:
              [
                { text: `Asignaciones del Año (Registro):`, style: "tableCellLabel" },
                { text: assignmentStats.registryAssignmentsYear.toString(), style: "metricValue" },
              ],
                [
                { text: `Total de Productos Asignados en el Año:`, style: "tableCellLabel" },
                { text: assignmentStats.totalProductsAssignedYear.toString(), style: "tableCellValue" },
              ], 
              //Asignaciones del mes:
              [
                { text: `Asignaciones del Mes (Registro):`, style: "tableCellLabel" },
                { text: assignmentStats.assignmentsThisMonth.toString(), style: "tableCellValue" },
              ],
              [
                { text: `Total de Productos Asignados del Mes:`, style: "tableCellLabel" },
                { text: assignmentStats.totalProductsAssignedThisMonthOrToday.toString(), style: "tableCellValue" },
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
    if(options.reportType === "month" ){

        content.push(
          { text: "Estadísticas Generales de las Asignaciones a Empleados", style: "sectionTitle" },
          {
            table: {
              widths: ["50%", "50%"],
              body: [
                [
                  { text: "Total de Asignaciones en el Año (Registro):", style: "tableCellLabel" },
                  { text: assignmentStats.totalAssignments.toString(), style: "tableCellValue" },
                ],
                [
                  { text: `Asignaciones ${periodLabel} (Registro):`, style: "tableCellLabel" },
                  { text: assignmentStats.assignmentsThisMonth.toString(), style: "metricValue" },
                ],
/*                 [
                  { text: "Asignaciones de Hoy (Registro):", style: "tableCellLabel" },
                  { text: assignmentStats.assignmentsToday.toString(), style: "tableCellValue" },
                ], */
                // [ //todas las asignaciones en BD excepto losd e productos caducados:
                //   { text: "Total de Productos Asignados:", style: "tableCellLabel" },
                //   { text: assignmentStats.totalProductsAssigned.toString(), style: "tableCellValue" },
                // ],
                [
                  { text: `Total de Productos Asignados ${periodLabel}:`, style: "tableCellLabel" },
                  { text: assignmentStats.totalProductsAssignedThisMonthOrToday.toString(), style: "tableCellValue" },
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
    if(options.reportType === "day" ){
        content.push(
          { text: "Estadísticas Generales de las Asignaciones a Empleados", style: "sectionTitle" },
          {
            table: {
              widths: ["50%", "50%"],
              body: [
                [
                  { text: "Total de Asignaciones en el Año (Registro):", style: "tableCellLabel" },
                  { text: assignmentStats.totalAssignments.toString(), style: "tableCellValue" },
                ],
/*                 [
                  { text: `Asignaciones ${periodLabel} (Registro)`, style: "tableCellLabel" },
                  { text: assignmentStats.assignmentsThisMonth.toString(), style: "metricValue" },
                ], */
                [
                  { text: `Asignaciones de ${periodLabel} (Registro):`, style: "tableCellLabel" },
                  { text: assignmentStats.assignmentsToday.toString(), style: "metricValue" },
                ],
                // [
                //   { text: "Total de Productos Asignados:", style: "tableCellLabel" },
                //   { text: assignmentStats.totalProductsAssigned.toString(), style: "tableCellValue" },
                // ],
                [
                  { text: `Total de Productos Asignados ${periodLabel}:`, style: "tableCellLabel" },
                  { text: assignmentStats.totalProductsAssignedThisMonthOrToday.toString(), style: "tableCellValue" },
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

  }

  /**
   * Agrega la sección de asignaciones por empleado
   */
  private addAssignmentsByEmployeeSection(
    content: any[],
    assignmentStats: CompleteAssignmentStats,
    styles: StyleDictionary,
  ): void {
    if (assignmentStats.assignmentsByEmployee && assignmentStats.assignmentsByEmployee.length > 0) {
      content.push({ text: "Asignaciones por Empleado", style: "sectionTitle" })

      const employeeTableBody = [
        [
          { text: "Empleado", style: "tableHeader" },
          { text: "Cédula", style: "tableHeader" },
          { text: "Asignaciones", style: "tableHeader" },
          { text: "Total Productos", style: "tableHeader" },
        ],
      ]

      assignmentStats.assignmentsByEmployee.forEach((employee) => {
        employeeTableBody.push([
          { text: this.dashboardReportService.getValidContent(employee.employeeName), style: "tableCellValue" },
          { text: this.dashboardReportService.getValidContent(employee.employeeCedula), style: "tableCellValue" },
          { text: employee.assignmentCount.toString(), style: "tableCellValue" },
          { text: employee.totalProducts.toString(), style: "tableCellValue" },
        ])
      })

      content.push({
        table: {
          widths: ["35%", "20%", "20%", "25%"],
          body: employeeTableBody,
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
    }
  }

  /**
   * Agrega la sección de asignaciones por tipo de producto
   */
  private addAssignmentsByProductTypeSection(
    content: any[],
    assignmentStats: CompleteAssignmentStats,
    styles: StyleDictionary,
    reportType:string
  ): void {

    if (assignmentStats.assignmentsByProductType && assignmentStats.assignmentsByProductType.length > 0) {
        content.push({ text: "Distribución por Tipo de Producto", style: "sectionTitle" })
    
        const typeTableBody = [
          [
            { text: "Tipo de Producto", style: "tableHeader" },
            { text: "Asignaciones", style: "tableHeader" },
            { text: "Total Productos", style: "tableHeader" },
            { text: "Porcentaje", style: "tableHeader" },
          ],
        ]
    
        assignmentStats.assignmentsByProductType.forEach((type) => {
          const percentage =
            assignmentStats.totalAssignments > 0
              ? ((type.assignmentCount / assignmentStats.totalAssignments) * 100).toFixed(1)
              : "0"
    
          typeTableBody.push([
            { text: type.typeName, style: "tableCellValue" },
            { text: type.assignmentCount.toString(), style: "tableCellValue" },
            { text: type.totalProducts.toString(), style: "tableCellValue" },
            { text: `${percentage}%`, style: "tableCellValue" },
          ])
        })
    
        content.push({
          table: {
            widths: ["40%", "20%", "20%", "20%"],
            body: typeTableBody,
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
    }else {

      let titleN="No se registraron asignaciones en el año actual.";
      if(reportType==='month'){
        titleN="No se registraron asignaciones en el mes actual.";
      }
      if(reportType==='day'){
        titleN="No se registraron asignaciones el dia de hoy.";
      }

      content.push(
        { text: "Distribución por Tipo de Producto", style: "sectionTitle" },
        {
        //   text: "No se registraron asignaciones en el mes actual.",
        // text: reportType==='day'? "No se registraron asignaciones el dia de hoy." : "No se registraron asignaciones en el mes actual.",
          text: titleN,
          style: "paragraph",
          alignment: "center",
          color: "#666666",
          margin: [0, 10, 0, 20],
        },
      )
    }

  }

  /**
   * Agrega la sección de asignaciones a familiares
   */
  private addAssignmentsByFamilySection(
    content: any[],
    assignmentStats: CompleteAssignmentStats,
    styles: StyleDictionary,
    reportType:string
  ): void {

    if (assignmentStats.assignmentsByFamily && assignmentStats.assignmentsByFamily.length > 0) {
      content.push({ text: "Asignaciones a Familiares", style: "sectionTitle" })

      const familyTableBody = [
        [
          { text: "Familiar", style: "tableHeader" },
          { text: "Cédula", style: "tableHeader" },
          { text: "Empleado", style: "tableHeader" },
          { text: "Asignaciones", style: "tableHeader" },
          { text: "Total Productos", style: "tableHeader" },
        ],
      ]

      assignmentStats.assignmentsByFamily.forEach((family) => {
        familyTableBody.push([
          { text: this.dashboardReportService.getValidContent(family.familyName), style: "tableCellValue" },
          { text: this.dashboardReportService.getValidContent(family.familyCedula), style: "tableCellValue" },
          { text: this.dashboardReportService.getValidContent(family.employeeName), style: "tableCellValue" },
          { text: family.assignmentCount.toString(), style: "tableCellValue" },
          { text: family.totalProducts.toString(), style: "tableCellValue" },
        ])
      })

      content.push({
        table: {
          widths: ["25%", "15%", "25%", "15%", "20%"],
          body: familyTableBody,
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
        { text: "Asignaciones a Familiares", style: "sectionTitle" },
        {
          text: reportType==='day'? "No se registraron asignaciones a familiares en el dia de hoy." : "No se registraron asignaciones a familiares en el mes actual."  ,
          style: "paragraph",
          alignment: "center",
          color: "#666666",
          margin: [0, 10, 0, 20],
        },
      )
    }
  }

  /**
   * Agrega la sección de asignaciones detalladas del mes (se ubica a lo ultimo despues de 'Asignaciones a Familiares')
   */
  private addAssignmentDetailSection(
    content: any[],
    assignmentStats: CompleteAssignmentStats,
    styles: StyleDictionary,
    reportType:string
  ): void {

    let title="Detalles de las Asignaciones a Empleados en el Año Actual ("+assignmentStats.assignmentDetails.length+")";
    if(reportType==='month'){
      title="Detalles de las Asignaciones a Empleados en el Mes Actual ("+assignmentStats.assignmentDetails.length+")";
    }
    if(reportType==='day'){
      title="Detalle de las Asignaciones a Empleados de Hoy";
    }
    
    let titleN="No se registraron asignaciones en el año actual.";
    if(reportType==='month'){
      titleN="No se registraron asignaciones en el mes actual.";
    }
    if(reportType==='day'){
      titleN="No se registraron asignaciones el dia de hoy.";
    }
    
    if (assignmentStats.assignmentDetails && assignmentStats.assignmentDetails.length > 0) {

      content.push({ 
        // text: reportType==='day'? "Detalle de las Asignaciones de Hoy" : "Detalle de las Asignaciones del Mes Actual",
        text: title,
        style: "sectionTitle" 
      })

      const assignmentTableBody = [
        [
          { text: "Fecha", style: "tableHeader" },
          { text: "Empleado", style: "tableHeader" },
          { text: "Familiar", style: "tableHeader" },
          { text: "Producto", style: "tableHeader" },
          { text: "Tipo", style: "tableHeader" },
          // { text: "Cantidad", style: "tableHeader" },
          { text: "Stock asignado", style: "tableHeader" },
        ],
      ]

      // Limitar a las primeras 50 asignaciones para evitar PDFs muy largos
      const limitedAssignments = assignmentStats.assignmentDetails.slice(0, 50)

      limitedAssignments.forEach((assignment) => {
        assignmentTableBody.push([
          { text: this.dashboardReportService.formatDate(assignment.createdAt), style: "tableCellValue" },
          { text: this.dashboardReportService.getValidContent(assignment.employeeName), style: "tableCellValue" },
          {
            text: this.dashboardReportService.getValidContent(assignment.familyName || "N/A"),
            style: "tableCellValue",
          },
          { text: this.dashboardReportService.getValidContent(assignment.productName), style: "tableCellValue" },
          { text: this.dashboardReportService.getValidContent(assignment.typeName), style: "tableCellValue" },
          { text: assignment.assignedProducts.toString(), style: "tableCellValue" }, // = assignmentTable.products,
        ])
      })

      if (assignmentStats.assignmentDetails.length > 50) {
        assignmentTableBody.push([
          {
            text: "...",
            style: "tableCellValue",
            colSpan: 6,
            alignment: "center",
          } as any,
          {},
          {},
          {},
          {},
          {},
        ])
        assignmentTableBody.push([
          {
            text: `Mostrando las primeras 50 de ${assignmentStats.assignmentDetails.length} asignaciones`,
            style: "paragraph",
            colSpan: 6,
            alignment: "center",
            color: "#666666",
          } as any,
          {},
          {},
          {},
          {},
          {},
        ])
      }

      content.push({
        table: {
          widths: ["12%", "20%", "15%", "25%", "15%", "13%"],
          body: assignmentTableBody,
        },
        layout: {
          hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
          vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 1 : 0.5),
          hLineColor: (i, node) => (i === 0 || i === node.table.body.length ? "#003366" : "#BBBBBB"),
          vLineColor: (i, node) => (i === 0 || i === node.table.widths.length ? "#003366" : "#BBBBBB"),
          paddingLeft: (i, node) => 3,
          paddingRight: (i, node) => 3,
          paddingTop: (i, node) => 2,
          paddingBottom: (i, node) => 2,
        },
        margin: [0, 10, 0, 20],
      })
    } else {
      content.push(
        { 
          // text: `Detalle de Asignaciones de ${labelTypeReport}`, 
          text: title,
          // text: reportType==='day'? "Detalle de las Asignaciones de Hoy" : "Detalle de las Asignaciones del Mes Actual",
          style: "sectionTitle" },
        {
        //   text: `No se registraron asignaciones ${labelTypeReport.toLowerCase()}.`, 
          text: titleN,
          // text: reportType==='day'? "No se registraron asignaciones el dia de hoy." : "No se registraron asignaciones en el mes actual.",
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
  private addSystemInfoSection(content: any[], reportData: AssignmentReportDto, styles: StyleDictionary): void {
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
        text: "Este reporte fue generado automáticamente por el sistema de gestión de asignaciones médicas.",
        style: "paragraph",
        alignment: "center",
        color: "#666666",
      },
    )
  }

  // NUEVO grafico anual: Gráfico por MES del año actual
  private async generateYearlyRegistrationChart(medicalSupplyStats: CompleteAssignmentStats): Promise<Buffer | null> {
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
              label: "Registros de Asignaciones de Insumos médicos a Empleados",
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
              text: `Registros de Asignaciones de Insumos médicos a Empleados en el ${currentYear}`,
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
                label: (ctx) => `Registros de Asignaciones de Insumos médicos a Empleados: ${ctx.parsed.y}`,
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
                text: "Registros",
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
      this.logger.log(`Gráfico anual de asignaciones de inventario almacen a empleados, generado exitosamente para el año ${currentYear}`)

      return imageBuffer
    } catch (error) {
      this.logger.error("Error al generar gráfico de registros anual de asignaciones de inventario almacen a empleados,:", error)
      return null
    }
  }

}
