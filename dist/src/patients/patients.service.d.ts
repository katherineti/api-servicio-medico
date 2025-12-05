import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PatientsGetAll } from './dto/read-patients-dto';
import { SearchPatientsDto } from './dto/search-patients.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Patients } from 'src/db/types/patients.types';
export declare class PatientsService {
    private db;
    private readonly logger;
    constructor(db: NeonDatabase);
    getAll(filter: SearchPatientsDto): Promise<PatientsGetAll>;
    getById(id: number): Promise<any>;
    update(id: number, patient: Partial<UpdatePatientDto>): Promise<Patients>;
}
