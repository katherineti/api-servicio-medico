import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import { MedicalReportsGetAll } from "./dto/read-medical-reports-dto";
import type { SearchMedicalReportsDto } from "./dto/search-medical-reports.dto";
import type { CreateMedicalReportDto } from "./dto/create-medical-reports.dto";
export declare class MedicalReportsService {
    private db;
    private readonly logger;
    constructor(db: NeonDatabase);
    getAll(filter: SearchMedicalReportsDto): Promise<MedicalReportsGetAll>;
    getById(id: number): Promise<any>;
    getDoctor(doctorId: number): Promise<any>;
    getPatient(patientId: number): Promise<any>;
    create(createMedicalReportsDto: CreateMedicalReportDto): Promise<any>;
}
