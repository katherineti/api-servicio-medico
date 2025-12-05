import type { Response } from "express";
import type { CreateMedicalPrescriptionDto } from './dto/create-medical-prescription.dto';
import { MedicalPrescriptionsService } from './medical-prescriptions.service';
import type { SearchMedicalPrescriptionDto } from './dto/search-medical-prescription.dto';
import { MedicalPrescriptionGetAll } from './dto/read-medical-prescription-dto';
import { RecipePdfService } from "./services/medical-prescription-pdf.service";
import { UpdateMedicalPrescriptionDto } from "./dto/update-medical-prescription.dto";
export declare class MedicalPrescriptionsController {
    private readonly medicalPrescriptionsService;
    private readonly recipePdfService;
    constructor(medicalPrescriptionsService: MedicalPrescriptionsService, recipePdfService: RecipePdfService);
    create(createMedicalPrescriptionDto: CreateMedicalPrescriptionDto): Promise<any>;
    update(id: number, updateMedicalPrescriptionDto: UpdateMedicalPrescriptionDto): Promise<any>;
    getAll(body: SearchMedicalPrescriptionDto): Promise<MedicalPrescriptionGetAll>;
    generatePrescriptionPdf(id: number, res: Response): Promise<void>;
    previewPrescriptionPdf(id: string, res: Response): Promise<void>;
}
