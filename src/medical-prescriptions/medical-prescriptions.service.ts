import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { count, eq, desc, sql } from 'drizzle-orm';
import { PG_CONNECTION } from 'src/constants';
import { medicalPrescriptionsTable, medicalReportsTable, patientTable, usersTable } from 'src/db/schema';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { CreateMedicalPrescriptionDto } from './dto/create-medical-prescription.dto';
import { SearchMedicalPrescriptionDto } from './dto/search-medical-prescription.dto';
import { MedicalPrescriptionGetAll } from './dto/read-medical-prescription-dto';

@Injectable()
export class MedicalPrescriptionsService {
  private readonly logger = new Logger(MedicalPrescriptionsService.name)

  constructor(@Inject(PG_CONNECTION) private db: NeonDatabase) {}

  async create(createMedicalPrescriptionDto: CreateMedicalPrescriptionDto): Promise<any> {
    // Validar existencia de doctor
    const doctorExist = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, createMedicalPrescriptionDto.doctorId))
      .limit(1)
    if (!doctorExist.length) {
      throw new ConflictException("El doctor especificado no existe.")
    }

    // Validar existencia de paciente
    const patientExist = await this.db
      .select()
      .from(patientTable)
      .where(eq(patientTable.id, createMedicalPrescriptionDto.patientId))
      .limit(1)
    if (!patientExist.length) {
      throw new ConflictException("El paciente especificado no existe.")
    }

    // Validar existencia de informe médico si se proporciona
    if (createMedicalPrescriptionDto.medicalReportId) {
      const medicalReportExist = await this.db
        .select()
        .from(medicalReportsTable)
        .where(eq(medicalReportsTable.id, createMedicalPrescriptionDto.medicalReportId))
        .limit(1)
      if (!medicalReportExist.length) {
        throw new ConflictException("El informe médico asociado no existe.")
      }
    }

    try {
      const [result] = await this.db
        .insert(medicalPrescriptionsTable)
        .values({
          ...createMedicalPrescriptionDto,
          // Drizzle-orm maneja automáticamente createdAt y updatedAt con defaultNow()
          // expirationDate se espera como string en el DTO y Drizzle lo mapea a date
        })
        .returning()
      this.logger.debug(`Recipe médico creado: ${JSON.stringify(result)}`)
      return result
    } catch (error) {
      this.logger.error("Error al insertar un recipe médico en la base de datos", error.stack)
      throw new ConflictException("Error al crear la recipe médico.")
    }
  }

   async getAll(filter: SearchMedicalPrescriptionDto): Promise<MedicalPrescriptionGetAll> {
/*     const whereConditions = []

    if (filter.doctorCedula) {
      whereConditions.push(ilike(usersTable.cedula, `%${filter.doctorCedula}%`))
    }

    if (filter.patientCedula) {
      whereConditions.push(ilike(patientTable.cedula, `%${filter.patientCedula}%`))
    }

    if (filter.createdAt) {
      whereConditions.push(sql`DATE(${medicalPrescriptionsTable.createdAt}) = ${filter.createdAt}`)
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined */

    const rows = await this.db
      .select({
        id: medicalPrescriptionsTable.id,
        medicalReportId: medicalPrescriptionsTable.medicalReportId,
        place: medicalPrescriptionsTable.place,
        expirationDate: sql<string>`TO_CHAR(${medicalPrescriptionsTable.expirationDate}, 'YYYY-MM-DD')`,
        recipeContent: medicalPrescriptionsTable.recipeContent,
        doctorId: usersTable.id,
          doctorName: usersTable.name,
          doctorCedula: usersTable.cedula,
        mpps: medicalPrescriptionsTable.mpps,
        patientId: patientTable.id,
          patientName: patientTable.name,
          patientCedula: patientTable.cedula,
        indications: medicalPrescriptionsTable.indications,
        createdAt: sql<string>`TO_CHAR(${medicalPrescriptionsTable.createdAt}, 'YYYY-MM-DD')`,
        updatedAt: sql<string>`TO_CHAR(${medicalPrescriptionsTable.updatedAt}, 'YYYY-MM-DD')`,
      })
      .from(medicalPrescriptionsTable)
      .leftJoin(usersTable, eq(medicalPrescriptionsTable.doctorId, usersTable.id))
      .leftJoin(patientTable, eq(medicalPrescriptionsTable.patientId, patientTable.id))
      // .where(whereClause)
      .where(
        eq( medicalPrescriptionsTable.medicalReportId, Number(filter.medicalReportId) 
      ))
      .orderBy(desc(medicalPrescriptionsTable.id))
      .limit(filter.take)
      .offset(((filter.page ?? 1) - 1) * (filter.take ?? 10));

    const [{ value: total }] = await this.db
      .select({ value: count() })
      .from(medicalPrescriptionsTable)
      .leftJoin(usersTable, eq(medicalPrescriptionsTable.doctorId, usersTable.id))
      .leftJoin(patientTable, eq(medicalPrescriptionsTable.patientId, patientTable.id))
      .where(eq( medicalPrescriptionsTable.medicalReportId, Number(filter.medicalReportId) ));

    const result = new MedicalPrescriptionGetAll()
    result.total = total
    result.page = filter.page ?? 1
    result.list = rows

    return result
  }

  async getById(id: number): Promise<any> {
    const result = await this.db
      .select({
        id: medicalPrescriptionsTable.id,
        medicalReportId: medicalPrescriptionsTable.medicalReportId,
        place: medicalPrescriptionsTable.place,
        expirationDate: sql<string>`TO_CHAR(${medicalPrescriptionsTable.expirationDate}, 'YYYY-MM-DD')`,
        recipeContent: medicalPrescriptionsTable.recipeContent,
        doctorId: usersTable.id,
          doctorName: usersTable.name,
          doctorCedula: usersTable.cedula,
        mpps: medicalPrescriptionsTable.mpps,
        patientId: patientTable.id,
          patientName: patientTable.name,
          patientCedula: patientTable.cedula,
        indications: medicalPrescriptionsTable.indications,
        createdAt: sql<string>`TO_CHAR(${medicalPrescriptionsTable.createdAt}, 'YYYY-MM-DD')`,
        updatedAt: sql<string>`TO_CHAR(${medicalPrescriptionsTable.updatedAt}, 'YYYY-MM-DD')`,
      })
      .from(medicalPrescriptionsTable)
      .leftJoin(usersTable, eq(medicalPrescriptionsTable.doctorId, usersTable.id))
      .leftJoin(patientTable, eq(medicalPrescriptionsTable.patientId, patientTable.id))
      .where(eq(medicalPrescriptionsTable.id, id))
      .limit(1);

    if (!result.length) {
      throw new ConflictException(`El recipe consultado ${id} no existe.`)
    }
    return result[0]
  }

/*   async update(id: number, updateMedicalPrescriptionDto: UpdateMedicalPrescriptionDto): Promise<any> {
    // Validar existencia de doctor si se actualiza
    if (updateMedicalPrescriptionDto.doctorId) {
      const doctorExist = await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, updateMedicalPrescriptionDto.doctorId))
        .limit(1)
      if (!doctorExist.length) {
        throw new ConflictException("El doctor especificado no existe.")
      }
    }

    // Validar existencia de paciente si se actualiza
    if (updateMedicalPrescriptionDto.patientId) {
      const patientExist = await this.db
        .select()
        .from(patientTable)
        .where(eq(patientTable.id, updateMedicalPrescriptionDto.patientId))
        .limit(1)
      if (!patientExist.length) {
        throw new ConflictException("El paciente especificado no existe.")
      }
    }

    // Validar existencia de informe médico si se actualiza
    if (updateMedicalPrescriptionDto.medicalReportId) {
      const medicalReportExist = await this.db
        .select()
        .from(medicalReportsTable)
        .where(eq(medicalReportsTable.id, updateMedicalPrescriptionDto.medicalReportId))
        .limit(1)
      if (!medicalReportExist.length) {
        throw new ConflictException("El informe médico asociado no existe.")
      }
    }

    try {
      const [result] = await this.db
        .update(medicalPrescriptionsTable)
        .set({
          ...updateMedicalPrescriptionDto,
          updatedAt: new Date(), // Actualizar la fecha de actualización
        })
        .where(eq(medicalPrescriptionsTable.id, id))
        .returning()

      if (!result) {
        throw new ConflictException("El doctor especificado no existe.")
      }
      this.logger.debug(`Receta médica actualizada: ${JSON.stringify(result)}`)
      return result
    } catch (error) {
      this.logger.error(`Error al actualizar la receta médica con ID ${id}`, error.stack)
      throw new ConflictException("Error al actualizar la receta médica.")
    }
  } */

  async delete(id: number): Promise<any> {
    try {
      const [result] = await this.db
        .delete(medicalPrescriptionsTable)
        .where(eq(medicalPrescriptionsTable.id, id))
        .returning({ id: medicalPrescriptionsTable.id })

      if (!result) {
        throw new ConflictException("El doctor especificado no existe.")
      }
      this.logger.debug(`Receta médica eliminada: ${JSON.stringify(result)}`)
      return { message: `Receta médica con ID ${id} eliminada exitosamente.` }
    } catch (error) {
      this.logger.error(`Error al eliminar la receta médica con ID ${id}`, error.stack)
      throw new ConflictException("Error al eliminar la receta médica.")
    }
  }
}
