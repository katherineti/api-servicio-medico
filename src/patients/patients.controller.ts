import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { SearchPatientsDto } from './dto/search-patients.dto';
import { PatientsGetAll } from './dto/read-patients-dto';
import { PatientsService } from './patients.service';

@Controller('patients')
export class PatientsController {
    constructor(private readonly patientsService: PatientsService) { }

    @Post('getAll')
    @UsePipes(ValidationPipe)
    getProducts(@Body() body: SearchPatientsDto): Promise<PatientsGetAll> {
        return this.patientsService.getAll(body);
    }
}