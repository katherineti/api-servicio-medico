import { Body, Controller, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { TempAuditorReportsService } from './temp-auditor-reports.service';
import { Roles } from 'src/decorators/role.decorators';
import { TypesRoles } from 'src/db/enums/types-roles';
import { Reports } from 'src/db/types/reports.types';
import { ReportCreateDto } from './dto/reports.dto';
import { ReportUpdateDto } from './dto/report-update.dto';

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

    @Put(':id')
    @Roles(TypesRoles.admin,TypesRoles.auditor)
    @UsePipes(ValidationPipe)
    update(
      @Param('id') id: number,
      @Body() reportDto: ReportUpdateDto
    ){

    return this.tempAuditorReportsService.update(id, reportDto);
    }
}