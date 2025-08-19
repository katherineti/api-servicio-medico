import { Body, Controller, Post, UsePipes, ValidationPipe, Get, Param, Res, HttpStatus, Inject, forwardRef } from "@nestjs/common"
import type { Response } from "express"
import type { CreateMedicalPrescriptionDto } from './dto/create-medical-prescription.dto';
import { MedicalPrescriptionsService } from './medical-prescriptions.service';
import type { SearchMedicalPrescriptionDto } from './dto/search-medical-prescription.dto';
import { MedicalPrescriptionGetAll } from './dto/read-medical-prescription-dto';
import { RecipePdfService } from "./services/medical-prescription-pdf.service"

@Controller('medical-prescriptions') //Recipes
export class MedicalPrescriptionsController {
  constructor(
    private readonly medicalPrescriptionsService: MedicalPrescriptionsService, 
    private readonly recipePdfService: RecipePdfService
  ) {}

  @Post('create')
 /*  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva receta médica' })
  @ApiResponse({ status: 201, description: 'La receta médica ha sido creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 409, description: 'Conflicto de datos (ej. doctor/paciente no existe).' }) */
  create(@Body() createMedicalPrescriptionDto: CreateMedicalPrescriptionDto) {
    return this.medicalPrescriptionsService.create(createMedicalPrescriptionDto);
  }

  //Para la lista de recipes medicos, por informe medico
  @Post("getAll")
  @UsePipes(ValidationPipe)
  getAll(@Body() body: SearchMedicalPrescriptionDto): Promise<MedicalPrescriptionGetAll> {
    return this.medicalPrescriptionsService.getAll(body)
  }

  //GET /medical-prescriptions/{id}/pdf - Descarga PDF del recipe
  @Get(":id/pdf")
  async generatePrescriptionPdf(@Param('id') id: number, @Res() res: Response) {
    try {
      const prescriptionData = await this.medicalPrescriptionsService.getById(id)

      const pdfBuffer = await this.recipePdfService.generateRecipePdf(prescriptionData)

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="receta-medica-${id}.pdf"`,
        "Content-Length": pdfBuffer.length,
      })

      res.status(HttpStatus.OK).send(pdfBuffer)
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Error al generar el PDF del recipe médico",
        error: error.message,
      })
    }
  }

  //GET /medical-prescriptions/{id}/pdf/preview - Previsualizar en navegador
  @Get(":id/pdf/preview")
  async previewPrescriptionPdf(@Param('id') id: string, @Res() res: Response) {
    try {
      const prescriptionId = Number.parseInt(id)
      const prescriptionData = await this.medicalPrescriptionsService.getById(prescriptionId)

      const pdfBuffer = await this.recipePdfService.generateRecipePdf(prescriptionData)

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
      })

      res.status(HttpStatus.OK).send(pdfBuffer)
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Error al generar el PDF del recipe médico",
        error: error.message,
      })
    }
  }
  
}