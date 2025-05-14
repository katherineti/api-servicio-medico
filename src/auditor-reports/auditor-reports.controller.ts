import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuditorReportsService } from './auditor-reports.service';
import { Roles } from 'src/decorators/role.decorators';
import { TypesRoles } from 'src/db/enums/types-roles';
import { Reports } from 'src/db/types/reports.types';
import { ReportCreateDto } from './dto/reports.dto';

@Controller('auditor-reports')
export class AuditorReportsController {
    constructor(private readonly auditorReportsService: AuditorReportsService) { }
    @Post()
    @Roles(TypesRoles.admin,TypesRoles.auditor)
    @UsePipes(ValidationPipe)
    async createAccount(
      @Body() reportDto: ReportCreateDto,
    ): Promise<Reports> {
  
      return this.auditorReportsService.create(reportDto);
    }
}