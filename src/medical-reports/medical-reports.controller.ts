import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { MedicalReportsService } from './medical-reports.service';
import { MedicalReportsGetAll } from './dto/read-medical-reports-dto';
import { SearchMedicalReportsDto } from './dto/search-medical-reports.dto';
import { TypesRoles } from 'src/db/enums/types-roles';
import { Roles } from 'src/decorators/role.decorators';
import { CreateMedicalReportDto } from './dto/create-medical-reports.dto';

@Controller('medical-reports')
export class MedicalReportsController {
    constructor(private readonly medicalReportsService: MedicalReportsService) { }

    @Post('getAll')
    @UsePipes(ValidationPipe)
    getProducts(@Body() body: SearchMedicalReportsDto): Promise<MedicalReportsGetAll> {
        return this.medicalReportsService.getAll(body);
    }

    @Roles(TypesRoles.admin, TypesRoles.medico)
    @Post('new')
    @UsePipes(ValidationPipe)
    async create(
        @Body() createMedicalReportsDto: CreateMedicalReportDto,
    ){
        return this.medicalReportsService.create(createMedicalReportsDto);
    }
}