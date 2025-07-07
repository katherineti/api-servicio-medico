import { Controller, Post, Body, Res, Query, Logger, Get, Param, ParseIntPipe } from "@nestjs/common"
import type { Response } from "express"
import { PdfDashboardService } from "./pdf-dasboard.service"
import { DashboardReportService } from "./dashboard-report.service";

@Controller("dashboard-reports")
export class DashboardReportController {
  private readonly logger = new Logger(DashboardReportController.name)

  constructor(
    private readonly dashboardReportService: DashboardReportService,
    private readonly pdfGeneratorDashboardService: PdfDashboardService
  ) {}

  @Post("pdf/:id")
  async generatePdf(id: number, @Body() reportDto: any, @Res() res: Response, @Query('download') download?: string) {
    this.logger.log(`Solicitud de generación de PDF para el reporte de estadísticas de usuarios`);

    try {
      // Obtener las estadísticas completas de usuarios
      const userStats = await this.dashboardReportService.getCompleteUserStats()
      this.logger.log(`Estadísticas obtenidas:`, userStats)

      // Determinar si el PDF debe descargarse o mostrarse en el navegador
      const isDownload = download === "true" || download === "1"
      const filename = `reporte-estadisticas-usuarios-${new Date().toISOString().split("T")[0]}.pdf`

      // Configurar encabezados de respuesta
      res.setHeader("Content-Type", "application/pdf")
      res.setHeader(
        "Content-Disposition",
        isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`,
      )

      // Generar PDF con las estadísticas
      await this.pdfGeneratorDashboardService.generateUserStatsPdf(userStats, reportDto, res)

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
}