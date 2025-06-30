import { Controller, Post, Body, Res, Query, Logger, Get, Param } from "@nestjs/common"
import type { Response } from "express"
import type { DashboardReportService, DashboardReportDto } from "./dashboard-report.service"
import { TypesRoles } from "src/db/enums/types-roles"
import { Roles } from "src/decorators/role.decorators"

@Controller("dashboard")
export class DashboardReportController {
  private readonly logger = new Logger(DashboardReportController.name)

  constructor(private readonly dashboardReportService: DashboardReportService) {}

  @Post("pdf/:id")
  @Roles(TypesRoles.admin, TypesRoles.auditor, TypesRoles.almacen, TypesRoles.medico)
  async generatePdf(
    @Param("id") id: number,
    @Body() reportDto: DashboardReportDto,
    @Res() res: Response,
    @Query("download") download?: string,
  ) {
    this.logger.log(`Solicitud de generación de PDF para el reporte del dashboard ${id}`)
    this.logger.log(`data controlador: reportDto`)

    try {
      // Obtener datos del reporte desde la base de datos
      const report = await this.dashboardReportService.getById(id)

      // Combinar datos del reporte con los datos enviados en el body
      const combinedReportData: DashboardReportDto = {
        ...report,
        ...reportDto, // Los datos del body tienen prioridad
        additionalInfo: {
          ...report.additionalInfo,
          ...reportDto.additionalInfo,
          reportId: id,
          retrievedAt: new Date().toISOString(),
        },
      }

      // Determinar si el PDF debe descargarse o mostrarse en el navegador
      const isDownload = download === "true" || download === "1"
      const filename = `reporte-dashboard-${id}-${Date.now()}.pdf`

      // Configurar encabezados de respuesta
      res.setHeader("Content-Type", "application/pdf")
      res.setHeader(
        "Content-Disposition",
        isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`,
      )

      console.log("Información del reporte del dashboard:", combinedReportData)

      await this.dashboardReportService.generatePdf(combinedReportData, res)

      this.logger.log(`PDF generado exitosamente para el reporte del dashboard ${id}`)
    } catch (error) {
      if (res.headersSent) {
        this.logger.warn(
          `Los encabezados ya fueron enviados para el reporte ${id}, no se puede enviar respuesta de error`,
        )
        return
      }

      this.logger.error(`Error al generar PDF para el reporte ${id}:`, error)

      res.status(500).json({
        statusCode: 500,
        message: `Error al generar PDF: ${error.message || "Error desconocido"}`,
      })
    }
  }

  // Rutas adicionales para gestionar reportes
  @Get("reports")
  @Roles(TypesRoles.admin, TypesRoles.auditor)
  async getAllReports(@Query("page") page: number = 1, @Query("limit") limit: number = 10) {
    this.logger.log(`Obteniendo reportes del dashboard - Página: ${page}`)
    return await this.dashboardReportService.findAll(page, limit)
  }

  @Get("reports/:id")
  @Roles(TypesRoles.admin, TypesRoles.auditor, TypesRoles.almacen, TypesRoles.medico)
  async getReportById(@Param("id") id: number) {
    this.logger.log(`Obteniendo reporte del dashboard con ID: ${id}`)
    return await this.dashboardReportService.getById(id)
  }

  @Post("reports")
  @Roles(TypesRoles.admin, TypesRoles.auditor, TypesRoles.almacen, TypesRoles.medico)
  async createReport(@Body() reportData: Partial<DashboardReportDto>) {
    this.logger.log("Creando nuevo reporte del dashboard")
    return await this.dashboardReportService.create(reportData)
  }
}
