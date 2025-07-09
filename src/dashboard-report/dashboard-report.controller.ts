import { Controller, Post, Body, Res, Query, Logger, Get, Param, ParseIntPipe, HttpStatus } from "@nestjs/common"
import type { Response } from "express"
import { PdfDashboardService } from "./pdf-dasboard.service"
import { DashboardReportService } from "./dashboard-report.service";
import { Usersesion } from "src/auth/strategies/usersesion.decorator";
import { IJwtPayload } from "src/auth/dto/jwt-payload.interface";
import { MedicalSuppliesReportTodayService } from "./medical-supplies-registered/medical-supplies-report-today.service";
import { MedicalSuppliesReportMonthService } from "./medical-supplies-registered/medical-supplies-report-month.service";
import { AssignmentReportMonthService, AssignmentReportOptions } from "./assignment-registered/assignment-report-month.service";
// import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { MedicalSuppliesReportService } from "./medical-supplies-available/medical-supplies-report.service";
import { AlertSummary, InventoryAlert, MedicalSupplyReportData, MedicalSupplyReportOptions, MedicalSupplyType } from "./medical-supplies-available/medical-supplies-report.interface";

// @ApiTags("Medical Supplies Reports")
@Controller("dashboard-reports")
export class DashboardReportController {
  private readonly logger = new Logger(DashboardReportController.name)

  constructor(
    private readonly dashboardReportService: DashboardReportService,
    private readonly pdfGeneratorDashboardService: PdfDashboardService,
    private readonly medicalSuppliesReportTodayService: MedicalSuppliesReportTodayService,
    private readonly medicalSuppliesReportMonthService: MedicalSuppliesReportMonthService,
    private readonly assignmentReportMonthService: AssignmentReportMonthService,
    // private readonly productReportService: ProductReportService
    private readonly medicalSuppliesReportService: MedicalSuppliesReportService
  ) {}

  //1-PDF para reporte estadistico de usuarios
  // @Post("pdf/:id")
  @Post("pdf")
  async generatePdfUsers(
    // id: number, 
    // @Body() reportDto: any, 
    @Res() res: Response, 
    @Usersesion() user: IJwtPayload,
    @Query('download') download?: string,
  ) {
    this.logger.log(`Solicitud de generación de PDF para el reporte de estadísticas de usuarios`);

    try {
      // Obtener las estadísticas completas de usuarios
      const userStats = await this.dashboardReportService.getCompleteUserStats()
      this.logger.log(`Estadísticas obtenidas:`, userStats)

      // Determinar si el PDF debe descargarse o mostrarse en el navegador
      const isDownload = download === "true" || download === "1";

      let today = new Date();
      let year = today.getFullYear();
      let month = (today.getMonth() + 1).toString().padStart(2, '0');
      let day = today.getDate().toString().padStart(2, '0');
      // const filename = `reporte-estadisticas-usuarios-${new Date().toISOString().split("T")[0]}.pdf`
      let filename = `reporte-estadistico-de-usuarios-${year}-${month}-${day}.pdf`;

      // Configurar encabezados de respuesta
      res.setHeader("Content-Type", "application/pdf")
      res.setHeader(
        "Content-Disposition",
        isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`,
      )

      // Generar PDF con las estadísticas
      // await this.pdfGeneratorDashboardService.generateUserStatsPdf(userStats, reportDto, res)
      await this.pdfGeneratorDashboardService.generateUserStatsPdf(userStats, res, user)

      this.logger.log(`PDF de estadísticas generado exitosamente`);
    } catch (error) {
      this.logger.error(`Error al generar PDF de estadísticas:`, error);

      if (res.headersSent) {
        this.logger.warn(`Los encabezados ya fueron enviados, no se puede enviar respuesta de error`);
        return
      }

      res.status(500).json({
        statusCode: 500,
        message: `Error al generar PDF: ${error.message || "Error desconocido"}`,
      })
    }
  }
  
/*   @Get('estadisticas')
  async estadisticas(){ 
      const getCompleteUserStats = await this.dashboardReportService.getCompleteUserStats()
      // console.log(getCompleteUserStats);
      return getCompleteUserStats;
  } */

  //2-PDF para reporte estadistico de: Registros de Insumos Médicos (Hoy)
    @Post("pdf/register/medicalSuppliesToday")
  async pdfMedicalSupplies_today(
    @Res() res: Response, 
    @Usersesion() user: IJwtPayload,
    @Query('download') download?: string,
  ) {
    this.logger.log(`Solicitud de generación de PDF para el reporte de Inventario Almacén registrados hoy`)

    try {
      // Obtener las estadísticas completas de medicamentos
      const medicalSupplyStats = await this.medicalSuppliesReportTodayService.getCompleteMedicalSupplyStats()
      this.logger.log(`Estadísticas de Inventario Almacén obtenidas:`, medicalSupplyStats)

      // Determinar si el PDF debe descargarse o mostrarse en el navegador
      const isDownload = download === "true" || download === "1"

      const today = new Date()
      const year = today.getFullYear()
      const month = (today.getMonth() + 1).toString().padStart(2, "0")
      const day = today.getDate().toString().padStart(2, "0")
      const filename = `reporte-estadistico-insumos-medicos(Hoy)-${year}-${month}-${day}.pdf`

      // Configurar encabezados de respuesta
      res.setHeader("Content-Type", "application/pdf")
      res.setHeader(
        "Content-Disposition",
        isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`,
      )

      // Crear datos del reporte
      const reportData = {
        title: "Registros de Inventario Almacén (Hoy)",
        value: medicalSupplyStats.productsToday,
        type: "Inventario Almacén",
        date: today.toISOString(),
        additionalInfo: {
          totalProducts: medicalSupplyStats.totalProducts,
          generatedBy: user?.email || "Sistema",
          generatedAt: new Date().toISOString(),
        },
      }

      // Generar PDF personalizado para Inventario Almacén
      await this.medicalSuppliesReportTodayService.generateCustomMedicalSuppliesPdf(reportData, res)

      this.logger.log(`PDF de Inventario Almacén generado exitosamente`)
    } catch (error) {
      this.logger.error(`Error al generar PDF de Inventario Almacén(Hoy):`, error)

      if (res.headersSent) {
        this.logger.warn(`Los encabezados ya fueron enviados, no se puede enviar respuesta de error`)
        return
      }

      res.status(500).json({
        statusCode: 500,
        message: `Error al generar PDF: ${error.message || "Error desconocido"}`,
      })
    }
  }

  //3-PDF para reporte estadistico de: Registros de Insumos Médicos (Mes)
    @Post("pdf/register/medicalSuppliesMonth")
  async pdfMedicalSupplies_month(
    @Res() res: Response, 
    @Usersesion() user: IJwtPayload,
    @Query('download') download?: string,
  ) {
    this.logger.log(`Solicitud de generación de PDF para el reporte de Inventario Almacén registrados en el mes`)

    try {
      // Obtener las estadísticas completas de medicamentos
      const medicalSupplyStats = await this.medicalSuppliesReportMonthService.getCompleteMedicalSupplyStats()
      this.logger.log(`Estadísticas de Inventario Almacén obtenidas:`, medicalSupplyStats)

      // Determinar si el PDF debe descargarse o mostrarse en el navegador
      const isDownload = download === "true" || download === "1"

      const today = new Date()
      const year = today.getFullYear()
      const month = (today.getMonth() + 1).toString().padStart(2, "0")
      const day = today.getDate().toString().padStart(2, "0")
      const filename = `reporte-estadistico-insumos-medicos(Mes)-${year}-${month}-${day}.pdf`

      // Configurar encabezados de respuesta
      res.setHeader("Content-Type", "application/pdf")
      res.setHeader(
        "Content-Disposition",
        isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`,
      )

      // Crear datos del reporte
      const reportData = {
        title: "Registros de Inventario Almacén (Mes)",
        value: medicalSupplyStats.productsToday,
        type: "Inventario Almacén",
        date: today.toISOString(),
        additionalInfo: {
          totalProducts: medicalSupplyStats.totalProducts,
          generatedBy: user?.email || "Sistema",
          generatedAt: new Date().toISOString(),
        },
      }

      // Generar PDF personalizado para Inventario Almacén
      await this.medicalSuppliesReportMonthService.generateCustomMedicalSuppliesPdf(reportData, res)

      this.logger.log(`PDF de Inventario Almacén generado exitosamente`)
    } catch (error) {
      this.logger.error(`Error al generar PDF de Inventario Almacén(Mes):`, error)

      if (res.headersSent) {
        this.logger.warn(`Los encabezados ya fueron enviados, no se puede enviar respuesta de error`)
        return
      }

      res.status(500).json({
        statusCode: 500,
        message: `Error al generar PDF: ${error.message || "Error desconocido"}`,
      })
    }
  }  

  //card 4, card 5 del dashboard -PDF para reporte estadistico sobre: Registros de Asignaciones de Insumos Médicos a empleado o a familiar de empleado (Dia,Mes)
/*   @Post("pdf/register/assignments-month")
  async pdfAssignmentsMonth(
    res: Response, 
    @Usersesion() user: IJwtPayload, 
    @Query('download') download?: string) {
    this.logger.log(`Solicitud de generación de PDF para el reporte de asignaciones de insumos medicos a empleados en el mes`)

    try {
      // Obtener las estadísticas completas de asignaciones
      const assignmentStats = await this.assignmentReportMonthService.getCompleteAssignmentStats()
      this.logger.log(`Estadísticas de asignaciones obtenidas:`, assignmentStats)

      // Determinar si el PDF debe descargarse o mostrarse en el navegador
      const isDownload = download === "true" || download === "1"

      const today = new Date()
      const year = today.getFullYear()
      const month = (today.getMonth() + 1).toString().padStart(2, "0")
      const day = today.getDate().toString().padStart(2, "0")
      const filename = `reporte-estadistico-registro-asignaciones(Mes)-${year}-${month}-${day}.pdf`

      // Configurar encabezados de respuesta
      res.setHeader("Content-Type", "application/pdf")
      res.setHeader(
        "Content-Disposition",
        isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`,
      )

      // Crear datos del reporte
      const reportData = {
        title: "Asignaciones de Insumos Médicos (Mes)",
        value: assignmentStats.assignmentsThisMonth,
        type: "Asignaciones Médicas",
        date: today.toISOString(),
        additionalInfo: {
          totalAssignments: assignmentStats.totalAssignments,
          totalProductsAssigned: assignmentStats.totalProductsAssigned,
          generatedBy: user?.email || "Sistema",
          generatedAt: new Date().toISOString(),
        },
      }

      // Generar PDF personalizado para asignaciones
      await this.assignmentReportMonthService.generateCustomAssignmentsPdf(reportData, res)

      this.logger.log(`PDF de asignaciones del mes generado exitosamente`)
    } catch (error) {
      this.logger.error(`Error al generar PDF de asignaciones del mes:`, error)

      if (res.headersSent) {
        this.logger.warn(`Los encabezados ya fueron enviados, no se puede enviar respuesta de error`)
        return
      }

      res.status(500).json({
        statusCode: 500,
        message: `Error al generar PDF: ${error.message || "Error desconocido"}`,
      })
    }
  } */

 @Post("pdf/register/assignments-month")
  async pdfAssignmentsMonth(@Res() res: Response, @Usersesion() user: IJwtPayload, @Query('download') download?: string) {
    const options: AssignmentReportOptions = { reportType: "month" }

    this.logger.log(`Solicitud de generación de PDF para el reporte de asignaciones de insumos médicos del mes`)

    try {
      // Obtener las estadísticas completas de asignaciones del mes
      const assignmentStats = await this.assignmentReportMonthService.getCompleteAssignmentStats(options)
      this.logger.log(`Estadísticas de asignaciones del mes obtenidas:`, assignmentStats)

      // Determinar si el PDF debe descargarse o mostrarse en el navegador
      const isDownload = download === "true" || download === "1"

      const today = new Date()
      const year = today.getFullYear()
      const month = (today.getMonth() + 1).toString().padStart(2, "0")
      const filename = `reporte-estadistico-registro-asignaciones(Mes)-${year}-${month}.pdf`

      // Configurar encabezados de respuesta
      res.setHeader("Content-Type", "application/pdf")
      res.setHeader(
        "Content-Disposition",
        isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`,
      )

      // Crear datos del reporte
      const reportData = {
        title: "Asignaciones de Insumos Médicos (Mes)",
        value: assignmentStats.assignmentsThisMonth,
        type: "Asignaciones Médicas Mensuales",
        date: today.toISOString(),
        additionalInfo: {
          totalAssignments: assignmentStats.totalAssignments,
          totalProductsAssigned: assignmentStats.totalProductsAssigned,
          generatedBy: user?.email || "Sistema",
          generatedAt: new Date().toISOString(),
        },
      }

      // Generar PDF personalizado para asignaciones del mes
      await this.assignmentReportMonthService.generateCustomAssignmentsPdf(reportData, res, options)

      this.logger.log(`PDF de asignaciones del mes generado exitosamente`)
    } catch (error) {
      this.logger.error(`Error al generar PDF de asignaciones del mes:`, error)

      if (res.headersSent) {
        this.logger.warn(`Los encabezados ya fueron enviados, no se puede enviar respuesta de error`)
        return
      }

      res.status(500).json({
        statusCode: 500,
        message: `Error al generar PDF: ${error.message || "Error desconocido"}`,
      })
    }
  }

  @Post("pdf/register/assignments-day")
  async pdfAssignmentsDay(@Res() res: Response, @Usersesion() user: IJwtPayload, @Query('download') download?: string) {
    this.logger.log(`Solicitud de generación de PDF para el reporte de asignaciones de insumos médicos del día`)

    try {
      const options: AssignmentReportOptions = { reportType: "day" }

      // Obtener las estadísticas completas de asignaciones del día
      const assignmentStats = await this.assignmentReportMonthService.getCompleteAssignmentStats(options)
      this.logger.log(`Estadísticas de asignaciones del día obtenidas:`, assignmentStats)

      // Determinar si el PDF debe descargarse o mostrarse en el navegador
      const isDownload = download === "true" || download === "1"

      const today = new Date()
      const year = today.getFullYear()
      const month = (today.getMonth() + 1).toString().padStart(2, "0")
      const day = today.getDate().toString().padStart(2, "0")
      const filename = `reporte-estadistico-registro-asignaciones-${year}-${month}-${day}.pdf`

      // Configurar encabezados de respuesta
      res.setHeader("Content-Type", "application/pdf")
      res.setHeader(
        "Content-Disposition",
        isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`,
      )

      // Crear datos del reporte
      const reportData = {
        title: "Asignaciones de Insumos Médicos (Día)",
        value: assignmentStats.assignmentsToday,
        type: "Asignaciones Médicas Diarias",
        date: today.toISOString(),
        additionalInfo: {
          totalAssignments: assignmentStats.totalAssignments,
          totalProductsAssigned: assignmentStats.totalProductsAssigned,
          generatedBy: user?.email || "Sistema",
          generatedAt: new Date().toISOString(),
        },
      }

      // Generar PDF personalizado para asignaciones del día
      await this.assignmentReportMonthService.generateCustomAssignmentsPdf(reportData, res, options)

      this.logger.log(`PDF de asignaciones del día generado exitosamente`)
    } catch (error) {
      this.logger.error(`Error al generar PDF de asignaciones del día:`, error)

      if (res.headersSent) {
        this.logger.warn(`Los encabezados ya fueron enviados, no se puede enviar respuesta de error`)
        return
      }

      res.status(500).json({
        statusCode: 500,
        message: `Error al generar PDF: ${error.message || "Error desconocido"}`,
      })
    }
  }

/*     // ==================== REPORTES DE INSUMOS MEDICOS DISPONIBLES ====================

  @Get("products/medicamentos")
  async generateMedicamentosReport(
    @Res() res: Response,
    @Usersesion() user: IJwtPayload,
    @Query("download") download?: string,
  ) {
    this.logger.log("Solicitud de reporte de medicamentos disponibles")

    await this.productReportService.generateMedicamentosReport(res, user, download)
  }

  @Get("products/uniformes")
  async generateUniformesReport(
    @Res() res: Response,
    @Usersesion() user: IJwtPayload,
    @Query("download") download?: string,
  ) {
    this.logger.log("Solicitud de reporte de uniformes disponibles")

    await this.productReportService.generateUniformesReport(res, user, download)
  }

  @Get("products/equipos-odontologicos")
  async generateEquiposOdontologicosReport(
    @Res() res: Response,
    @Usersesion() user: IJwtPayload,
    @Query("download") download?: string,
  ) {
    this.logger.log("Solicitud de reporte de equipos odontológicos disponibles")

    await this.productReportService.generateEquiposOdontologicosReport(res, user, download)
  } */


  @Post("generate/:supplyType")
/*   @ApiOperation({ summary: "Generate conditional medical supplies report PDF" })
  @ApiParam({
    name: "supplyType",
    enum: [1, 2, 3],
    description: "1=Medicamentos, 2=Uniformes, 3=Equipos Odontológicos",
  })
  @ApiQuery({ name: "includeExpired", required: false, type: Boolean })
  @ApiQuery({ name: "minStockThreshold", required: false, type: Number })
  @ApiQuery({ name: "download", required: false, type: Boolean })
  @ApiResponse({ status: 200, description: "PDF generated successfully" })
  @ApiResponse({ status: 400, description: "Invalid supply type" })
  @ApiResponse({ status: 500, description: "Internal server error" }) */
  async generateMedicalSuppliesReport(
    // supplyType: string, // Remove decorator
@Param('supplyType') supplyType: string, // Specify the parameter name
    @Res() res: Response,
    @Usersesion() user: IJwtPayload,
    // includeExpired?: string,
    // minStockThreshold?: string,
    @Query('includeExpired') includeExpired?: string,
    @Query('minStockThreshold') minStockThreshold?: string,
    @Query('download') download?: string
  ) {
    try {
      const parsedSupplyType = Number.parseInt(supplyType);
      console.log("supplyType " , supplyType)
      // const parsedSupplyType = supplyType
      this.validateSupplyType(parsedSupplyType)

      const options: MedicalSupplyReportOptions = {
        supplyType: parsedSupplyType,
        includeExpired: includeExpired === "true",
        minStockThreshold: minStockThreshold ? Number.parseInt(minStockThreshold) : 10,
        reportDate: new Date(),
      }

      const reportData = this.createReportData(parsedSupplyType, user)
      this.setResponseHeaders(res, reportData.filename!, download === "true")

      await this.medicalSuppliesReportService.generateCustomPdf(reportData, res, options)
    } catch (error) {
      this.handleError(error, res, `Error generating medical supplies report for type ${supplyType}`)
    }
  }

  @Get("stats/:supplyType")
/*   @ApiOperation({ summary: "Get medical supplies statistics" })
  @ApiParam({
    name: "supplyType",
    enum: [1, 2, 3],
    description: "1=Medicamentos, 2=Uniformes, 3=Equipos Odontológicos",
  })
  @ApiQuery({ name: "startDate", required: false, type: String })
  @ApiQuery({ name: "endDate", required: false, type: String })
  @ApiResponse({ status: 200, description: "Statistics retrieved successfully" }) */
  async getMedicalSuppliesStats(
    supplyType: string, // Remove decorator
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Usersesion() user?: IJwtPayload,
  ) {
    try {
      const parsedSupplyType = Number.parseInt(supplyType)
      this.validateSupplyType(parsedSupplyType)

      const options: MedicalSupplyReportOptions = {
        supplyType: parsedSupplyType,
        reportDate: new Date(),
      }

      // TODO: Implementar método para obtener solo estadísticas
      const stats = await this.medicalSuppliesReportService.getMedicalSupplyStats(options)

      return {
        success: true,
        data: {
          supplyType: parsedSupplyType,
          typeName: this.getSupplyTypeName(parsedSupplyType),
          stats,
          dateRange: {
            start: startDate || new Date().toISOString(),
            end: endDate || new Date().toISOString(),
          },
        },
      }
    } catch (error) {
      this.logger.error(`Error getting medical supplies stats for type ${supplyType}:`, error)
      return {
        success: false,
        message: `Error retrieving statistics: ${error.message}`,
        data: null,
      }
    }
  }

  @Get("types")
  // @ApiOperation({ summary: "Get available medical supply types" })
  // @ApiResponse({ status: 200, description: "Supply types retrieved successfully" })
  async getSupplyTypes() {
    return {
      success: true,
      data: [
        {
          id: 1,
          name: "Medicamentos",
          description: "Productos farmacéuticos y medicamentos",
          features: ["expiration_tracking", "batch_control", "prescription_required"],
        },
        {
          id: 2,
          name: "Uniformes",
          description: "Uniformes médicos y vestimenta",
          features: ["size_variants", "color_options", "department_specific"],
        },
        {
          id: 3,
          name: "Equipos Odontológicos",
          description: "Equipos e instrumentos odontológicos",
          features: ["maintenance_tracking", "calibration_required", "sterilization_control"],
        },
      ],
    }
  }

  @Get("alerts/:supplyType")
/*   @ApiOperation({ summary: "Get inventory alerts for specific supply type" })
  @ApiParam({
    name: "supplyType",
    enum: [1, 2, 3],
    description: "1=Medicamentos, 2=Uniformes, 3=Equipos Odontológicos",
  })
  @ApiResponse({ status: 200, description: "Alerts retrieved successfully" }) */
  async getInventoryAlerts(supplyType: string, @Usersesion() user?: IJwtPayload) {
    // Remove decorator
    try {
      const parsedSupplyType = Number.parseInt(supplyType)
      this.validateSupplyType(parsedSupplyType)

      const alerts = await this.getAlertsForSupplyType(parsedSupplyType)

      const summary: AlertSummary = {
        total: alerts.length,
        critical: alerts.filter((a) => a.priority === "critical").length,
        high: alerts.filter((a) => a.priority === "high").length,
        medium: alerts.filter((a) => a.priority === "medium").length,
        low: alerts.filter((a) => a.priority === "low").length,
      }

      return {
        success: true,
        data: {
          supplyType: parsedSupplyType,
          typeName: this.getSupplyTypeName(parsedSupplyType),
          alerts,
          summary,
          metadata: {
            generatedAt: new Date().toISOString(),
            alertTypes: [...new Set(alerts.map((a) => a.type))],
            priorityDistribution: {
              critical: summary.critical,
              high: summary.high,
              medium: summary.medium,
              low: summary.low,
            },
          },
        },
      }
    } catch (error) {
      this.logger.error(`Error getting alerts for supply type ${supplyType}:`, error)
      return {
        success: false,
        message: `Error retrieving alerts: ${error.message}`,
        data: null,
      }
    }
  }

  private validateSupplyType(supplyType: number): asserts supplyType is MedicalSupplyType {
    if (![1, 2, 3].includes(supplyType)) {
      throw new Error(
        `Invalid supply type: ${supplyType}. Must be 1 (Medicamentos), 2 (Uniformes), or 3 (Equipos Odontológicos)`,
      )
    }
  }

  private createReportData(supplyType: MedicalSupplyType, user: IJwtPayload): MedicalSupplyReportData {
    const today = new Date()
    const typeName = this.getSupplyTypeName(supplyType)

    return {
      type: supplyType,
      typeName,
      title: `Reporte de ${typeName} Disponibles`,
      date: today.toISOString(),
      filename: this.generateFilename(supplyType),
      stats: {
        totalItems: 0,
        availableItems: 0,
        lowStockItems: 0,
        totalValue: 0,
        averagePrice: 0,
        topItems: [],
      },
      additionalInfo: {
        generatedBy: user?.email || "Sistema",
        generatedAt: new Date().toISOString(),
        userId: user?.sub || null,
      },
    }
  }

  private getSupplyTypeName(supplyType: MedicalSupplyType): string {
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

  private generateFilename(supplyType: MedicalSupplyType): string {
    const today = new Date()
    const dateStr = today.toISOString().split("T")[0]
    const typeName = this.getSupplyTypeName(supplyType).toLowerCase().replace(/\s+/g, "-")

    return `reporte-${typeName}-${dateStr}.pdf`
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

  private async getAlertsForSupplyType(supplyType: MedicalSupplyType): Promise<InventoryAlert[]> {
    // TODO: Implementar consulta real a la base de datos
    const mockAlerts: InventoryAlert[] = [
      {
        type: "low_stock",
        productId: 1,
        productName: "Paracetamol 500mg",
        message: "Stock bajo detectado - Solo quedan 5 unidades",
        priority: "high",
        createdAt: new Date(),
        details: {
          currentStock: 5,
          minimumStock: 20,
        },
      },
      {
        type: "expired",
        productId: 2,
        productName: "Ibuprofeno 400mg",
        message: "Medicamento vencido - Retirar del inventario",
        priority: "critical",
        createdAt: new Date(),
        details: {
          expirationDate: new Date("2024-01-15"),
          daysUntilExpiration: -30,
        },
      },
      {
        type: "expiring_soon",
        productId: 3,
        productName: "Amoxicilina 250mg",
        message: "Medicamento próximo a vencer en 7 días",
        priority: "medium",
        createdAt: new Date(),
        details: {
          expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          daysUntilExpiration: 7,
        },
      },
      {
        type: "out_of_stock",
        productId: 4,
        productName: "Mascarillas N95",
        message: "Producto agotado - Reabastecer urgentemente",
        priority: "critical",
        createdAt: new Date(),
        details: {
          currentStock: 0,
          minimumStock: 100,
        },
      },
    ]

    // Filtrar alertas según el tipo de insumo
    return mockAlerts.filter((alert) => {
      switch (supplyType) {
        case 1: // Medicamentos
          return ["expired", "expiring_soon", "low_stock"].includes(alert.type)
        case 2: // Uniformes
          return ["low_stock", "out_of_stock"].includes(alert.type)
        case 3: // Equipos Odontológicos
          return ["maintenance_required", "low_stock"].includes(alert.type)
        default:
          return true
      }
    })
  }

  private handleError(error: any, res: Response, message: string) {
    this.logger.error(message, error)

    if (res.headersSent) {
      this.logger.warn("Headers already sent, cannot send error response")
      return
    }

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: `${message}: ${error.message || "Error desconocido"}`,
      timestamp: new Date().toISOString(),
      path: res.req?.url || "unknown",
    })
  }
  

}