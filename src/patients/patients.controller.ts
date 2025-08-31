import { Body, Controller, Param, ParseIntPipe, Patch, Post,  UsePipes, ValidationPipe } from '@nestjs/common';
import { SearchPatientsDto } from './dto/search-patients.dto';
import { PatientsGetAll } from './dto/read-patients-dto';
import { PatientsService } from './patients.service';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Patients } from 'src/db/types/patients.types';

@Controller('patients')
export class PatientsController {
    constructor(private readonly patientsService: PatientsService) { }

    @Post('getAll')
    @UsePipes(ValidationPipe)
    getProducts(@Body() body: SearchPatientsDto): Promise<PatientsGetAll> {
        return this.patientsService.getAll(body);
    }

    @Patch(':id')
    @UsePipes(ValidationPipe)
    update(
        @Param('id', ParseIntPipe) patientId: number,
        @Body() patient: UpdatePatientDto,
    ): Promise<Patients> {

        return this.patientsService.update(patientId, patient);
    }
}