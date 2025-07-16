import { Body, Controller, Post } from '@nestjs/common';
import { CreateMedicalPrescriptionDto } from './dto/create-medical-prescription.dto';
import { MedicalPrescriptionsService } from './medical-prescriptions.service';

@Controller('medical-prescriptions')
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
}