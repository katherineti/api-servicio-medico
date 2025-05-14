import { Body, Controller, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuditorReportsService } from './auditor-reports.service';
import { Roles } from 'src/decorators/role.decorators';
import { TypesRoles } from 'src/db/enums/types-roles';
import { Reports } from 'src/db/types/reports.types';
import { ReportCreateDto } from './dto/reports.dto';
import { ReportUpdateDto } from './dto/report-update.dto';

@Controller('auditor-reports')
export class AuditorReportsController {
    constructor(private readonly auditorReportsService: AuditorReportsService) { }
    @Post()
    @Roles(TypesRoles.admin,TypesRoles.auditor)
    @UsePipes(ValidationPipe)
    async create(
      @Body() reportDto: ReportCreateDto,
    ): Promise<Reports> {
  
      return this.auditorReportsService.create(reportDto);
    }

    @Put(':id')
    @Roles(TypesRoles.admin,TypesRoles.auditor)
    @UsePipes(ValidationPipe)
    update(
      @Param('id') id: number,
      @Body() reportDto: ReportUpdateDto
    ){

    return this.auditorReportsService.update(id, reportDto);
    }
}