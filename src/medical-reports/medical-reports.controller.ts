/* import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { MedicalReportsService } from './medical-reports.service';
import { MedicalReportsGetAll } from './dto/read-medical-reports-dto';
import { SearchMedicalReportsDto } from './dto/search-medical-reports.dto';
import { TypesRoles } from 'src/db/enums/types-roles';
import { Roles } from 'src/decorators/role.decorators';
import { CreateMedicalReportDto } from './dto/create-medical-reports.dto';
import { MedicalReportPdfService } from './medical-report-pdf.service';

@Controller('medical-reports')
export class MedicalReportsController {
    constructor(
        private readonly medicalReportsService: MedicalReportsService,
        private readonly medicalReportPdfService: MedicalReportPdfService
    ) { }

    @Post('getAll')
    @UsePipes(ValidationPipe)
    getProducts(@Body() body: SearchMedicalReportsDto): Promise<MedicalReportsGetAll> {
        return this.medicalReportsService.getAll(body);
    }

    @Get(':id')
    getById( @Param('id', ParseIntPipe) id: number ): Promise<any[]> {
        return this.medicalReportsService.getById(id);
    }

    @Roles(TypesRoles.admin, TypesRoles.medico)
    @Post('create')
    @UsePipes(ValidationPipe)
    async create(
        @Body() createMedicalReportsDto: CreateMedicalReportDto,
    ){
        return this.medicalReportsService.create(createMedicalReportsDto);
    }

  @Get("pdf/:id")
  @Roles(TypesRoles.admin, TypesRoles.medico) // Restrict access as needed
  async generateMedicalReportPdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
    @Query('download') download?: string,
  ): Promise<void> {
    const isDownload = download === "true" || download === "1"
    await this.medicalReportPdfService.generateMedicalReportPdf(id, res, isDownload)
  } 
} */
import { Controller, Get, Param, Post, UsePipes, ValidationPipe, Res, Query, ParseIntPipe } from "@nestjs/common"
import { MedicalReportsService } from "./medical-reports.service" // Changed from 'type' to regular import
import type { MedicalReportsGetAll } from "./dto/read-medical-reports-dto"
import type { SearchMedicalReportsDto } from "./dto/search-medical-reports.dto"
import { TypesRoles } from "src/db/enums/types-roles"
import { Roles } from "src/decorators/role.decorators"
import type { CreateMedicalReportDto } from "./dto/create-medical-reports.dto"
import { MedicalReportPdfService } from "./medical-report-pdf.service" // Changed from 'type' to regular import
import type { Response } from "express"

@Controller("medical-reports")
export class MedicalReportsController {
  constructor(
    private readonly medicalReportsService: MedicalReportsService,
    private readonly medicalReportPdfService: MedicalReportPdfService,
  ) {}

  @Post("getAll")
  @UsePipes(ValidationPipe)
  getProducts(body: SearchMedicalReportsDto): Promise<MedicalReportsGetAll> {
    return this.medicalReportsService.getAll(body)
  }

  @Get(":id")
  getById(@Param('id', ParseIntPipe) id: number): Promise<any[]> {
    return this.medicalReportsService.getById(id)
  }

  @Roles(TypesRoles.admin, TypesRoles.medico)
  @Post("create")
  @UsePipes(ValidationPipe)
  async create(createMedicalReportsDto: CreateMedicalReportDto): Promise<any> {
    return this.medicalReportsService.create(createMedicalReportsDto)
  }

  // Generate PDF
  @Get("pdf/:id")
//   @Roles(TypesRoles.admin, TypesRoles.medico) // Restrict access as needed
  async generateMedicalReportPdf(
    @Param('id') id: number,
    @Res() res: Response,
    @Query('download') download?: string,
  ): Promise<void> {
    const isDownload = download === "true" || download === "1"
    await this.medicalReportPdfService.generateMedicalReportPdf(id, res, isDownload)
  }
}
