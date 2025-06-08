import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Res, UploadedFiles, UseInterceptors, UsePipes, ValidationPipe, Logger, Query } from '@nestjs/common';
import { TempAuditorReportsService } from './temp-auditor-reports.service';
import { Roles } from 'src/decorators/role.decorators';
import { TypesRoles } from 'src/db/enums/types-roles';
import { Reports } from 'src/db/types/reports.types';
import { ReportCreateDto } from './dto/reports.dto';
import { ReportUpdateDto } from './dto/report-update.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SearchReportsDto } from './dto/search.reports.dto';
import { ReportsGetAll } from './dto/read-reports-dto';
import { Response } from 'express';
import { PdfGeneratorService } from './pdf-generator.service';

@Controller('temp-auditor-reports')
export class TempAuditorReportsController {
    private readonly logger = new Logger(TempAuditorReportsController.name);

    constructor(
      private readonly tempAuditorReportsService: TempAuditorReportsService,  
      private readonly pdfGeneratorService: PdfGeneratorService
    ) { }
    @Post()
    @Roles(TypesRoles.admin,TypesRoles.auditor)
    @UsePipes(ValidationPipe)
    async create(
      @Body() reportDto: ReportCreateDto,
    ): Promise<Reports> {
  
      return this.tempAuditorReportsService.create(reportDto);
    }
        @Roles(TypesRoles.admin, TypesRoles.auditor)
        @Get('getAllAuditores')
        @UsePipes(ValidationPipe)
        getAllAuditores(): Promise<any> {
          return this.tempAuditorReportsService.getAllAuditores();
        }

    @Post('getAll')
    @UsePipes(ValidationPipe)
    getProducts(@Body() body: SearchReportsDto): Promise<ReportsGetAll> {
    return this.tempAuditorReportsService.getAll(body);
    }

    @Put(':id')
    @Roles(TypesRoles.admin,TypesRoles.auditor)
    @UsePipes(ValidationPipe)
    update(
      @Param('id') id: number,
      @Body() reportDto: ReportUpdateDto
    ){

    return this.tempAuditorReportsService.update(id, reportDto);
    }

    @Put('images/:id')
    @Roles(TypesRoles.admin, TypesRoles.auditor)
    @UseInterceptors(
      FileFieldsInterceptor([
        { name: 'images', maxCount: 10 }, // Especifica el nombre del campo 'images'
      ], {
        limits: {
          fileSize: 5 * 1024 * 1024, // 5MB
        },
      })
    )
    async updateWithImages(
      @Param('id', ParseIntPipe) id: number,
      @Body() reportDto: ReportUpdateDto,
      @UploadedFiles() files: { images?: Express.Multer.File[] }
    ) {
      console.log('Datos del reporte recibidos:', JSON.stringify(reportDto, null, 2));
      console.log('Archivos recibidos:', files?.images?.length || 0);
    
      // Extraer los archivos del objeto files
      const imageFiles = files?.images || [];
      
      return this.tempAuditorReportsService.updateWithImages(id, reportDto, imageFiles);
    }

    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number): Promise<Reports> {
        return this.tempAuditorReportsService.delete(id);
    }

  @Post('pdf/:id')
  async generatePdf(
    @Param('id', ParseIntPipe) id: number, 
    @Body() reportDto: any,
    @Res() res: Response,
    @Query('download') download?: string,
  ){
    this.logger.log(`Solicitud de generación de PDF para el informe ${id}`);
    
    try {
      const report = await this.tempAuditorReportsService.getById(id)
      // Determinar si el PDF debe descargarse o mostrarse en el navegador
      const isDownload = download === 'true' || download === '1';
      const filename = `informe-auditoria-${id}.pdf`;
      
      // Configurar encabezados de respuesta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition', 
        isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`
      );
      console.log("Informacion del informe" , report)

      await this.pdfGeneratorService.generatePdf(reportDto, res);
      
      this.logger.log(`PDF generado exitosamente para el informe ${id}`);
    } catch (error) {
      if (res.headersSent) {
        this.logger.warn(`Los encabezados ya fueron enviados para el informe ${id}, no se puede enviar respuesta de error`);
        return;
      }
      
    }
  }

}