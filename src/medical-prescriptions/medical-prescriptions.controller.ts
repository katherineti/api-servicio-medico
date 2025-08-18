import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateMedicalPrescriptionDto } from './dto/create-medical-prescription.dto';
import { MedicalPrescriptionsService } from './medical-prescriptions.service';
import { SearchMedicalPrescriptionDto } from './dto/search-medical-prescription.dto';
import { MedicalPrescriptionGetAll } from './dto/read-medical-prescription-dto';

@Controller('medical-prescriptions') //Recipes
export class MedicalPrescriptionsController {
  constructor(private readonly medicalPrescriptionsService: MedicalPrescriptionsService) {}

  @Post('create')
 /*  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva receta médica' })
  @ApiResponse({ status: 201, description: 'La receta médica ha sido creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 409, description: 'Conflicto de datos (ej. doctor/paciente no existe).' }) */
  create(@Body() createMedicalPrescriptionDto: CreateMedicalPrescriptionDto) {
    return this.medicalPrescriptionsService.create(createMedicalPrescriptionDto);
  }

  @Post("getAll")
  @UsePipes(ValidationPipe)
  getAll(@Body() body: SearchMedicalPrescriptionDto): Promise<MedicalPrescriptionGetAll> {
    return this.medicalPrescriptionsService.getAll(body)
  }
}