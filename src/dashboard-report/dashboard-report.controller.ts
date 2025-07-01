import { Controller, Post, Body, Res, Query, Logger, Get, Param, ParseIntPipe } from "@nestjs/common"
import type { Response } from "express"
// ❌ Problema: import type hace que el servicio no esté disponible en runtime
// import type { DashboardReportService, DashboardReportDto } from "./dashboard-report.service"
// ✅ Solución: Importar el servicio sin 'type' y el DTO con 'type'
// import { DashboardReportService } from "./dashboard-report.service"
import { PdfDashboardService } from "./pdf-dasboard.service"
import { DashboardReportService } from "./dashboard-report.service";
import { console } from "inspector";

@Controller("dashboard-reports")
export class DashboardReportController {
  private readonly logger = new Logger(DashboardReportController.name)

  constructor(
    private readonly dashboardReportService: DashboardReportService,
    private readonly pdfGeneratorDashboardService: PdfDashboardService
  ) {}

  
  @Post('pdf/:id')
  async generatePdf(
    @Param('id', ParseIntPipe) id: number, 
    @Body() reportDto: any,
    @Res() res: Response,
    @Query('download') download?: string,
  ){
    this.logger.log(`Solicitud de generación de PDF para el informe ${id}`);
    
    try {
      // const report = await this.tempAuditorReportsService.getById(id)
      // const report = await this.dashboardReportService.getById(id)
      // Determinar si el PDF debe descargarse o mostrarse en el navegador
      const isDownload = download === 'true' || download === '1';
      const filename = `informe-auditoria-${id}.pdf`;
      
      // Configurar encabezados de respuesta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition', 
        isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`
      );
      // console.log("Informacion del informe" , report)
      const getCompleteUserStats = await this.dashboardReportService.getCompleteUserStats()
      this.logger.log(`******************************getCompleteUserStats: `,getCompleteUserStats);

      await this.pdfGeneratorDashboardService.generatePdf(reportDto, res);
      
      this.logger.log(`PDF generado exitosamente para el informe ${id}`);


    } catch (error) {
      if (res.headersSent) {
        this.logger.warn(`Los encabezados ya fueron enviados para el informe ${id}, no se puede enviar respuesta de error`);
        return;
      }
      
    }
  }

  
  @Get('estadisticas')
  async estadisticas(){
    this.logger.log(`ESTADISTICAS`);
   
      const getCompleteUserStats = await this.dashboardReportService.getCompleteUserStats()
      console.log(getCompleteUserStats);
      return getCompleteUserStats;
  }
}