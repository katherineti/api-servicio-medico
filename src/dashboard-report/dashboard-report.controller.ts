import { Controller, Post, Body, Res, Query, Logger, Get, Param, ParseIntPipe } from "@nestjs/common"
import type { Response } from "express"
import { PdfDashboardService } from "./pdf-dasboard.service"
import { DashboardReportService } from "./dashboard-report.service";
import { Usersesion } from "src/auth/strategies/usersesion.decorator";
import { IJwtPayload } from "src/auth/dto/jwt-payload.interface";
import { MedicalSuppliesReportTodayService } from "./medical-supplies-registered/medical-supplies-report-today.service";
import { MedicalSuppliesReportMonthService } from "./medical-supplies-registered/medical-supplies-report-month.service";
import { AssignmentReportMonthService, AssignmentReportOptions } from "./assignment-registered/assignment-report-month.service";

@Controller("dashboard-reports")
export class DashboardReportController {
  private readonly logger = new Logger(DashboardReportController.name)

  constructor(
    private readonly dashboardReportService: DashboardReportService,
    private readonly pdfGeneratorDashboardService: PdfDashboardService,
    private readonly medicalSuppliesReportTodayService: MedicalSuppliesReportTodayService,
    private readonly medicalSuppliesReportMonthService: MedicalSuppliesReportMonthService,
    private readonly assignmentReportMonthService: AssignmentReportMonthService
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

}