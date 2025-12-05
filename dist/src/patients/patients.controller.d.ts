import { SearchPatientsDto } from './dto/search-patients.dto';
import { PatientsGetAll } from './dto/read-patients-dto';
import { PatientsService } from './patients.service';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Patients } from 'src/db/types/patients.types';
export declare class PatientsController {
    private readonly patientsService;
    constructor(patientsService: PatientsService);
    getProducts(body: SearchPatientsDto): Promise<PatientsGetAll>;
    update(patientId: number, patient: UpdatePatientDto): Promise<Patients>;
}
