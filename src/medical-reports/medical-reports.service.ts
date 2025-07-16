import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { and, count, desc, eq, ilike, sql } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION } from 'src/constants';
import { medicalReportsTable, patientTable, usersTable } from 'src/db/schema';
import { MedicalReportsGetAll } from './dto/read-medical-reports-dto';
import { SearchMedicalReportsDto } from './dto/search-medical-reports.dto';
import { CreateMedicalReportDto } from './dto/create-medical-reports.dto';

@Injectable()
export class MedicalReportsService {
  private readonly logger = new Logger(MedicalReportsService.name);
  
  constructor(@Inject(PG_CONNECTION) private db: NeonDatabase) {}

  async getAll(filter: SearchMedicalReportsDto): Promise<MedicalReportsGetAll> {
      const whereConditions = [];

      // Búsqueda por doctorCedula(ilike) si se proporciona
      if (filter.doctorCedula) {
        whereConditions.push(ilike(usersTable.cedula, `%${filter.doctorCedula}%`));
      }
      
      if (filter.patientCedula) {
        whereConditions.push(ilike(patientTable.cedula, `%${filter.patientCedula}%`));
      } 
  
      if (filter.createdAt) {
        // const datePart = filter.createdAt.toString().split('T')[0];
        whereConditions.push(eq(medicalReportsTable.createdAt, filter.createdAt ));
      } 

      // Condición de búsqueda combinada (si hay alguna)
      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const rows = await
      this.db.select({
        id: medicalReportsTable.id,
        apsCenter: medicalReportsTable.apsCenter,
        insurance: medicalReportsTable.insurance,
        doctorId: usersTable.id,
        doctorName: usersTable.name,
        doctorCedula: usersTable.cedula,
        patientId: patientTable.id,
        patientName: patientTable.name,
        patientCedula: patientTable.cedula,
        description: medicalReportsTable.description, //Informe
        createdAt: sql<string>`TO_CHAR(${medicalReportsTable.createdAt}, 'YYYY-MM-DD')`,
      })
      .from(medicalReportsTable)
      .leftJoin(usersTable, eq(medicalReportsTable.doctorId, usersTable.id))
      .leftJoin(patientTable, eq(medicalReportsTable.patientId, patientTable.id))
      .where(whereClause)
      .orderBy(desc(medicalReportsTable.id))
      .limit(filter.take)
      .offset((filter.page - 1) * filter.take);
  
      // Consulta para obtener el total de registros
      const [{ value: total }] = await 
      this.db.select({ value: count() })
      .from(medicalReportsTable)
      .leftJoin(usersTable, eq(medicalReportsTable.doctorId, usersTable.id))
      .leftJoin(patientTable, eq(medicalReportsTable.patientId, patientTable.id))
      .where(whereClause);

      const result = new MedicalReportsGetAll();
      result.total = total;
      result.page = filter.page;
      result.list = rows;
  
      return result;
  }

  async getDoctor(doctorId: number): Promise<any> {
      try{
          const result = await this.db.select()
          .from(usersTable)
          .where(eq( usersTable.id, doctorId ))
          .limit(1);

          return result[0] || null;

      }catch(err){
          console.error("Error en la base de datos al buscar el doctor  " + doctorId + ": ", err);
          throw new Error("Error al obtener el doctor " + doctorId + " " + err);
      }
  }
  async getPatient(patientId: number): Promise<any> {
      try{
          const result = await this.db.select()
          .from(patientTable)
          .where(eq( patientTable.id, patientId ))
          .limit(1);

          return result[0] || null;

      }catch(err){
          console.error("Error en la base de datos al buscar el paciente  " + patientId + ": ", err);
          throw new Error("Error al obtener el paciente " + patientId + " " + err);
      }
  }

  async create(createMedicalReportsDto: CreateMedicalReportDto): Promise<any>{

      const idMedicoExist = await this.getDoctor(Number(createMedicalReportsDto.doctorId));
      if (!idMedicoExist) {
          throw new ConflictException('El doctor no existe.');
      }

      const patientExist = await this.getPatient(Number(createMedicalReportsDto.patientId));
      if (!patientExist) {
          throw new ConflictException('El paciente no existe.');
      } 

      try {
        const newReport = {
          ...createMedicalReportsDto,
          isActivate:true,
        };
        // console.log("createMedicalReportsDto" , newReport)
        const [result] = await this.db.insert(medicalReportsTable).values(newReport).returning();
        this.logger.debug(`Informe medico creado: ${JSON.stringify(result)}`);
        return result;

      } catch (error) {
      console.error('Error al insertar un informe medico en la base de datos', error);
      return { error: 'Error al insertar un informe medico en la base de datos' };
      }
  }
    
}