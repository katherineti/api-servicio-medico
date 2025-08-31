import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { and, desc, count, ilike, eq } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION } from 'src/constants';
import { patientTable } from 'src/db/schema';
import { PatientsGetAll } from './dto/read-patients-dto';
import { SearchPatientsDto } from './dto/search-patients.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Patients } from 'src/db/types/patients.types';

@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name);
  
  constructor(@Inject(PG_CONNECTION) private db: NeonDatabase) {}

  async getAll(filter: SearchPatientsDto): Promise<PatientsGetAll> {
      const whereConditions = [];

        // Búsqueda por patientCedula(ilike) si se proporciona
      if (filter.patientCedula) {
        whereConditions.push(ilike(patientTable.cedula, `%${filter.patientCedula}%`));
      } 

      // Condición de búsqueda combinada (si hay alguna)
      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const rows = await
      this.db.select()
      .from(patientTable)
      .where(whereClause)
      .orderBy(desc(patientTable.id))
      .limit(filter.take)
      .offset((filter.page - 1) * filter.take);
  
      // Consulta para obtener el total de registros
      const [{ value: total }] = await 
      this.db.select({ value: count() })
      .from(patientTable)
      .where(whereClause);

      const result = new PatientsGetAll();
      result.total = total;
      result.page = filter.page;
      result.list = rows;
  
      return result;
  }

  async getById(id: number): Promise<any> {
    try{
      const result = await this.db.select({
          id:  patientTable.id
        })
        .from(patientTable)
        .where(eq( patientTable.id, id ))
        .limit(1);
  
      return result[0] || null;
      
    }catch(err){
      console.error("Error en la base de datos al buscar el paciente " + id + ": ", err);
      throw new Error("Error al obtener el paciente " + id + " " + err);
    }
  }
  async update(id: number, patient: Partial<UpdatePatientDto>): Promise<Patients>{

    const Patient = await this.getById(id);

    if (!Patient) {
      throw new NotFoundException('El paciente no existe');
    }
    const updateData: Partial<Patients> = {
      name: patient.name,
      birthdate: patient.birthdate,
      placeBirth: patient.placeBirth,
      age: patient.age,
      cedula: patient.cedula,
      email: patient.email,
      phone: patient.phone,
      gender: patient.gender,
      civilStatus: patient.civilStatus,
      children: patient.children,
      isActivate: patient.isActivate,
      updatedAt: new Date()
    };
    this.logger.log("Paciente updateData" , updateData)

    const updated = await this.db
    .update(patientTable)
    .set(updateData)
    .where(eq(patientTable.id, id))
    this.logger.log("Paciente actualizado" , updated)

    return updated[0];
  }
}