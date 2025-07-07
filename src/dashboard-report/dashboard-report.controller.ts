import { Controller, Post, Body, Res, Query, Logger, Get, Param, ParseIntPipe } from "@nestjs/common"
import type { Response } from "express"
import { PdfDashboardService } from "./pdf-dasboard.service"
import { DashboardReportService } from "./dashboard-report.service";
import { Usersesion } from "src/auth/strategies/usersesion.decorator";
import { IJwtPayload } from "src/auth/dto/jwt-payload.interface";
import { MedicalSuppliesReportService } from "./medical-supplies-report.service";

@Controller("dashboard-reports")
export class DashboardReportController {
  private readonly logger = new Logger(DashboardReportController.name)

  constructor(
    private readonly dashboardReportService: DashboardReportService,
    private readonly pdfGeneratorDashboardService: PdfDashboardService,
    private readonly medicalSuppliesReportService: MedicalSuppliesReportService,
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
    this.logger.log(`Solicitud de generación de PDF para el reporte de medicamentos registrados hoy`)

    try {
      // Obtener las estadísticas completas de medicamentos
      const medicalSupplyStats = await this.medicalSuppliesReportService.getCompleteMedicalSupplyStats()
      this.logger.log(`Estadísticas de medicamentos obtenidas:`, medicalSupplyStats)

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
      await this.medicalSuppliesReportService.generateCustomMedicalSuppliesPdf(reportData, res)

      this.logger.log(`PDF de medicamentos generado exitosamente`)
    } catch (error) {
      this.logger.error(`Error al generar PDF de medicamentos:`, error)

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