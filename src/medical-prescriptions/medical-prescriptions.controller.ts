import { Body, Controller, Post, UsePipes, ValidationPipe, Get, Param, Res, HttpStatus, Put, ParseIntPipe } from "@nestjs/common"
import type { Response } from "express"
import type { CreateMedicalPrescriptionDto } from './dto/create-medical-prescription.dto';
import { MedicalPrescriptionsService } from './medical-prescriptions.service';
import type { SearchMedicalPrescriptionDto } from './dto/search-medical-prescription.dto';
import { MedicalPrescriptionGetAll } from './dto/read-medical-prescription-dto';
import { RecipePdfService } from "./services/medical-prescription-pdf.service"
import { UpdateMedicalPrescriptionDto } from "./dto/update-medical-prescription.dto";

@Controller('medical-prescriptions') //Recipes
export class MedicalPrescriptionsController {
  constructor(
    private readonly medicalPrescriptionsService: MedicalPrescriptionsService, 
    private readonly recipePdfService: RecipePdfService
  ) {}

  @Post('create')
  create(@Body() createMedicalPrescriptionDto: CreateMedicalPrescriptionDto) {
    return this.medicalPrescriptionsService.create(createMedicalPrescriptionDto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateMedicalPrescriptionDto: UpdateMedicalPrescriptionDto) {
    return this.medicalPrescriptionsService.update(id, updateMedicalPrescriptionDto);
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