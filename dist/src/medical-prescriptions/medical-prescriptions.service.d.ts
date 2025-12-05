import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { CreateMedicalPrescriptionDto } from './dto/create-medical-prescription.dto';
import { SearchMedicalPrescriptionDto } from './dto/search-medical-prescription.dto';
import { MedicalPrescription, MedicalPrescriptionGetAll } from './dto/read-medical-prescription-dto';
import { UpdateMedicalPrescriptionDto } from './dto/update-medical-prescription.dto';
export declare class MedicalPrescriptionsService {
    private db;
    private readonly logger;
    constructor(db: NeonDatabase);
    create(createMedicalPrescriptionDto: CreateMedicalPrescriptionDto): Promise<any>;
    getAll(filter: SearchMedicalPrescriptionDto): Promise<MedicalPrescriptionGetAll>;
    getById(id: number): Promise<MedicalPrescription>;
    update(id: number, updateMedicalPrescriptionDto: UpdateMedicalPrescriptionDto): Promise<any>;
    delete(id: number): Promise<any>;
}
