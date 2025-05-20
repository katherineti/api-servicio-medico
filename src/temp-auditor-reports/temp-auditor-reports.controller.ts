import { Body, Controller, Delete, Param, ParseIntPipe, Post, Put, UploadedFiles, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { TempAuditorReportsService } from './temp-auditor-reports.service';
import { Roles } from 'src/decorators/role.decorators';
import { TypesRoles } from 'src/db/enums/types-roles';
import { Reports } from 'src/db/types/reports.types';
import { ReportCreateDto } from './dto/reports.dto';
import { ReportUpdateDto } from './dto/report-update.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SearchReportsDto } from './dto/search.reports.dto';
import { ReportsGetAll } from './dto/read-reports-dto';
@Controller('temp-auditor-reports')
export class TempAuditorReportsController {
    constructor(private readonly tempAuditorReportsService: TempAuditorReportsService) { }
    @Post()
    @Roles(TypesRoles.admin,TypesRoles.auditor)
    @UsePipes(ValidationPipe)
    async create(
      @Body() reportDto: ReportCreateDto,
    ): Promise<Reports> {
  
      return this.tempAuditorReportsService.create(reportDto);
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
}