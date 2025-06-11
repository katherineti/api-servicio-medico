import { BadRequestException, ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { and, count, desc, eq, gte, ilike, inArray, lte } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION, REPORT_STATUS_ELIMINADO, REPORT_STATUS_ENPROCESO, REPORT_STATUS_FINALIZADO } from 'src/constants';
import { auditReportsTable_temp, reportStatusTable, usersTable } from 'src/db/schema';
import { CreateReport, Reports } from 'src/db/types/reports.types';
import { v4 as uuidv4 } from 'uuid';
import { ReportCreateDto } from './dto/reports.dto';
import { ReportUpdateDto } from './dto/report-update.dto';
import { FilesService } from 'src/files/files.service';
import { SearchReportsDto } from './dto/search.reports.dto';
import { ReportsGetAll } from './dto/read-reports-dto';
//inyeccion para driver coneccion a BD local
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from 'src/db/schema'

export class ResultGetAllAuditores{
  total: number;
  list: {
        id: number,
        name: string,
        email: string,
        isActivate: boolean,
        role: number
    }[];
}
@Injectable()
export class TempAuditorReportsService {
    private readonly logger = new Logger(TempAuditorReportsService.name);
   
    constructor(@Inject(PG_CONNECTION) private db: NodePgDatabase<typeof schema>, private filesService: FilesService ) {}
    
    async create(body: ReportCreateDto): Promise<Reports>{ 
        try {
        //6. Validar y limpiar el array de auditores adicionales
        body.additionalAuditorIds = await this.validateArrayadditionalAuditor(body);

        //5.Actualiza si ya esta creado el reporte
        const id_report = body.id;
        if(id_report){
            const Report = await this.getById(body.id);

            if (!Report) {
                throw new NotFoundException('El reporte no existe');
            }

            const update = {
                ...body, idDuplicate: null, updatedAt: null,
            };
            const updated_ = await this.db
            .update(auditReportsTable_temp)
            .set(update)
            .where(eq(auditReportsTable_temp.id, body.id))
            .returning();
            this.logger.debug(`Reporte actualizado: ${body.id}`);
            return updated_[0];
        }

        // 1. Verifica si ya existe un reporte con el mismo título
        const existingReports = await this.db.select()
        .from(auditReportsTable_temp)
        .where(eq(auditReportsTable_temp.title, body.title))
        .limit(1);

        const existingReport = existingReports.length > 0 ? existingReports[0] : undefined;

        if (existingReport) {
            this.logger.warn(`Intento de crear reporte con título duplicado: ${body.title}`);
            throw new ConflictException(`Ya existe un reporte con el título: ${body.title}`);
        }

        // 2. Crea el objeto para la inserción inicial
        const reportToCreate = {
            ...body,
            code: '',
            statusId: REPORT_STATUS_ENPROCESO,
            startDate: new Date(),
            idDuplicate: null,
            updatedAt: null,
          };

        // 3. Inserta el nuevo reporte y obtener el ID
        let newReport = await this.db.insert(auditReportsTable_temp).values(reportToCreate).returning({ id: auditReportsTable_temp.id });

        if (!newReport || newReport.length === 0 || !newReport[0].id) {
            this.logger.error(`Error al insertar el reporte inicial.`);
            throw new Error('Error al crear el reporte de auditoría.');
        }

        const newReportId = newReport[0].id;
        const year = new Date().getFullYear();
    
        const formattedId = `O${body.auditorId}${uuidv4()}.${newReportId}.${year}`;

        const updateData: Partial<CreateReport> = {
            code: formattedId
        }

        // 4. Actualiza el reporte con el código generado
        const updated = await this.db
        .update(auditReportsTable_temp)
        .set(updateData)
        .where(eq(auditReportsTable_temp.id, newReportId))
        .returning();
    
        this.logger.debug(`Informe de auditoría creado exitosamente con ID: ${newReportId}`);
      
        return updated[0];

    } catch (err)  {
      this.logger.error(`Error al crear el reporte de auditoría: `, err);
      if (err instanceof ConflictException) {
        throw err;
      }
      throw new Error(`Error al registrar el reporte: ${err}`);
     }
    }

    async getById(id: number): Promise<Reports | null> {
        try{
            const result = await this.db.select()
            .from(auditReportsTable_temp)
            .where(eq( auditReportsTable_temp.id, id ))
            .limit(1);
        
            return result[0] || null;
            
        }catch(err){
            console.error("Error en la base de datos al buscar el reporte " + id + ": ", err);
            throw new Error("Error al obtener el reporte " + id + " " + err);
        }
    }

    async getAll(filter: SearchReportsDto): Promise<ReportsGetAll> { 
    const whereConditions = [];

    if (filter.receiver) {
        whereConditions.push(ilike(auditReportsTable_temp.receiver, `%${filter.receiver}%`));
    }
    if (filter.endDate) {
        const parsedEndDate = new Date(filter.endDate);
        const startOfDay = new Date(parsedEndDate);
        startOfDay.setHours(0, 0, 0, 0); // Establece la hora al inicio del día

        const endOfDay = new Date(parsedEndDate);
        endOfDay.setHours(23, 59, 59, 999); // Establece la hora al final del día

        whereConditions.push(
            and(
            gte(auditReportsTable_temp.endDate, startOfDay),
            lte(auditReportsTable_temp.endDate, endOfDay)
            )
        );
    }

    // Condición de búsqueda combinada (si hay alguna)
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const rows = await
    this.db.select({
        id: auditReportsTable_temp.id,
        code: auditReportsTable_temp.code,
        title: auditReportsTable_temp.title,
        receiver: auditReportsTable_temp.receiver,
        auditorId: auditReportsTable_temp.auditorId,
        auditor: usersTable.name,
        additionalAuditorIds: auditReportsTable_temp.additionalAuditorIds,
        summary_objective: auditReportsTable_temp.summary_objective,
        summary_scope: auditReportsTable_temp.summary_scope,
        summary_methodology: auditReportsTable_temp.summary_methodology,
        summary_conclusionAndObservation: auditReportsTable_temp.summary_conclusionAndObservation,

        introduction: auditReportsTable_temp.introduction,
        detailed_methodology: auditReportsTable_temp.detailed_methodology,
        findings: auditReportsTable_temp.findings,
        conclusions: auditReportsTable_temp.conclusions,

        statusId: auditReportsTable_temp.statusId,
        status: reportStatusTable.status,
        idDuplicate: auditReportsTable_temp.idDuplicate,
        startDate: auditReportsTable_temp.startDate,
        endDate: auditReportsTable_temp.endDate,
        images: auditReportsTable_temp.images
    })
    .from(auditReportsTable_temp)
    .leftJoin(usersTable, eq(auditReportsTable_temp.auditorId, usersTable.id))
    .leftJoin(reportStatusTable, eq(auditReportsTable_temp.statusId, reportStatusTable.id ) )
    .where(whereClause)
    .orderBy(desc(auditReportsTable_temp.id))
    .limit(filter.take)
    .offset((filter.page - 1) * filter.take);

    const [{ value: total }] = await 
    this.db.select({ value: count() })
    .from(auditReportsTable_temp)
    .leftJoin(usersTable, eq(auditReportsTable_temp.auditorId, usersTable.id))
    .leftJoin(reportStatusTable, eq(auditReportsTable_temp.statusId, reportStatusTable.id ) )
    .where(whereClause);

    const result = new ReportsGetAll();
    result.total = total;
    result.page = filter.page;
    result.list = rows;

    return result;
    }

    async update(id: number, body: Partial<ReportUpdateDto>): Promise<Reports>{

        const Report = await this.getById(id);

        if (!Report) {
            throw new NotFoundException('El reporte no existe');
        }

        const { title, receiver, auditorId, statusId,
                summary_objective,summary_scope,summary_methodology,summary_conclusionAndObservation,
                introduction, detailed_methodology, findings, conclusions
              } = body;
        
        // Validar y limpiar el array de auditores adicionales
        body.additionalAuditorIds = await this.validateArrayadditionalAuditor(body);
        
        const updateData: Partial<CreateReport> = {
            title: title,
            receiver: receiver,
            auditorId: auditorId,
            statusId: statusId,
            summary_objective: summary_objective,
            summary_scope: summary_scope,
            summary_methodology: summary_methodology,
            summary_conclusionAndObservation: summary_conclusionAndObservation,
            additionalAuditorIds: body.additionalAuditorIds
        };

        if(statusId===REPORT_STATUS_FINALIZADO){
            updateData.introduction= introduction,
            updateData.detailed_methodology= detailed_methodology,
            updateData.findings= findings,
            updateData.conclusions= conclusions,
            updateData.images= null,
            updateData.endDate = new Date();
        }

        const updated = await this.db
        .update(auditReportsTable_temp)
        .set(updateData)
        .where(eq(auditReportsTable_temp.id, id))
        .returning();

        return updated[0];
    }

    // Método para actualizar el reporte con imágenes
    async updateWithImages(
        id: number,
        body: ReportUpdateDto,
        files: Express.Multer.File[],
    ): Promise<Reports | { saved: Reports; error?: string } | undefined> {
        const existingReport = await this.getById(id);

        if (!existingReport) {
        throw new NotFoundException(`El reporte con ID ${id} no existe`);
        }

        const {
        title,
        receiver,
        auditorId,
        statusId,
        summary_objective,
        summary_scope,
        summary_methodology,
        summary_conclusionAndObservation,
        introduction,
        detailed_methodology,
        findings,
        conclusions,
        // additionalAuditorIds
        } = body;

        const additionalAuditorIds = await this.validateArrayadditionalAuditor(body);

        const updateData: Partial<CreateReport> = {
        title,
        receiver,
        auditorId: auditorId ? Number(auditorId) : undefined,
        statusId: statusId ? Number(statusId) : undefined,
        summary_objective,
        summary_scope,
        summary_methodology,
        summary_conclusionAndObservation,
        additionalAuditorIds
        };

        if (Number(statusId) === REPORT_STATUS_FINALIZADO) {
        updateData.introduction = introduction ?? null;
        updateData.detailed_methodology = detailed_methodology ?? null;
        updateData.findings = findings ?? null;
        updateData.conclusions = conclusions ?? null;
        updateData.endDate = new Date();
        this.logger.debug(`Actualizando reporte ${id} con estado FINALIZADO y datos base.`);
        } else {
        this.logger.debug(`Actualizando reporte ${id} con estado ${statusId} y datos base.`);
        }

        this.logger.debug(`Datos base a actualizar para el reporte ${id}: ${JSON.stringify(updateData)}`);

        let updatedReport: Reports | undefined;
        try {
        const updatedReports = await this.db
            .update(auditReportsTable_temp)
            .set(updateData)
            .where(eq(auditReportsTable_temp.id, id))
            .returning();

        if (updatedReports.length > 0) {
            updatedReport = updatedReports[0];
            this.logger.log(`Reporte con ID ${id} actualizado exitosamente.`);
        } else {
            this.logger.warn(`No se pudo actualizar el reporte con ID ${id}.`);
            return undefined;
        }
        } catch (dbError) {
        this.logger.error(`Error al actualizar el reporte con ID ${id} en la base de datos:`, dbError);
        throw dbError;
        }

        let imagesError: string | undefined;
        if (Number(statusId) === REPORT_STATUS_FINALIZADO && files && files.length > 0) {
        try {
            this.logger.debug(`Procesando ${files.length} imágenes para el reporte ${id}`);
            // No es necesario imprimir detalles de cada archivo para el rendimiento en producción
            const savedPaths = await this.filesService.saveFiles(files, String(id));
            const normalizedPaths = savedPaths.map((path) => path.replace(/\\\\/g, '/'));
            const imagesUpdate = { ...updateData, images: JSON.stringify(normalizedPaths) }; // Define el tipo explícitamente
            // Actualizar las imágenes SOLO si la actualización principal fue exitosa
            await this.db
            .update(auditReportsTable_temp)
            .set(imagesUpdate)
            .where(eq(auditReportsTable_temp.id, id));
            this.logger.debug(`Rutas de imágenes guardadas y actualizadas para el reporte ${id}: ${JSON.stringify(normalizedPaths)}`);
        } catch (fileError) {
            this.logger.error(`Error al guardar imágenes para el reporte ${id}:`, fileError);
            imagesError = `Error al guardar las imágenes para el reporte con ID ${id}.`;
        }
        } else if (files && files.length > 0) {
        this.logger.debug(`No se actualizaron imágenes para el reporte ${id} (estado no FINALIZADO).`);
        } else {
        this.logger.debug(`No se recibieron imágenes para el reporte ${id}.`);
        }

        if (imagesError) {
        return { saved: updatedReport!, error: imagesError };
        }

        return updatedReport;
    }

    async delete(id: number): Promise<Reports>{

    const report = await this.getById(id);

    if (!report) {
        throw new NotFoundException('El reporte no existe');
    }
    const updateData: Partial<Reports> = {
        statusId: REPORT_STATUS_ELIMINADO,
        // updatedAt: new Date()
    };

    await this.db
    .update(auditReportsTable_temp)
    .set(updateData)
    .where(eq(auditReportsTable_temp.id, id));

    return await this.getById(id);
    }

    async getAllAuditores(): Promise<ResultGetAllAuditores> {

    const statusCondition = eq(usersTable.isActivate , true);

    // Condición para filtrar por roles 1(admin) y 4(auditor)
    const roleCondition = inArray(usersTable.role, [1, 4]);

    //Combinamos las condiciones con AND
    const whereCondition = and(statusCondition, roleCondition) 

    const rows = await 
    this.db.select( {
        id:  usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        isActivate: usersTable.isActivate,
        role: usersTable.role
    })
    .from(usersTable)
    .where(whereCondition)
    .orderBy(desc(usersTable.id))//orden desde el más reciente

    // Consulta para obtener el total de usuarios (para metadata)
    const [{ value: total }] = await this.db.select({ value: count() }).from(usersTable).where(whereCondition);

    const result = new ResultGetAllAuditores();
    result.total = total;
    result.list = rows;

    return result;
    }

    async validateArrayadditionalAuditor(body){
        //6. Validar y limpiar el array de auditores adicionales
        if (body.additionalAuditorIds) {
            // 6.1. Validar que sea un array
            if (!Array.isArray(body.additionalAuditorIds)) {
                throw new BadRequestException("El campo additionalAuditorIds debe ser un array")
            }

            // 6.2. Validar que todos los elementos sean números válidos
                //Convertir a números si vienen como strings
                body.additionalAuditorIds = body.additionalAuditorIds.map(id => 
                    typeof id === 'string' ? Number(id) : id
                );
            const invalidIds = body.additionalAuditorIds.filter((id) => !Number.isInteger(id) || id <= 0)

            if (invalidIds.length > 0) {
                throw new BadRequestException(`Los siguientes IDs de auditores adicionales no son válidos: ${invalidIds.join(", ")}`)
            }

            // 6.3. Remover duplicados del array
            body.additionalAuditorIds = [...new Set(body.additionalAuditorIds)]

            // 6.4. Validar que el auditor principal no esté en los auditores adicionales
            const originalLength = body.additionalAuditorIds.length
            body.additionalAuditorIds = body.additionalAuditorIds.filter((id) => id !== body.auditorId)

            // Logger si se removió el auditor principal
            if (originalLength > body.additionalAuditorIds.length) {
                this.logger.warn(
                    `Se removió el auditor principal (ID: ${body.auditorId}) de la lista de auditores adicionales`,
                )
            }

            // 6.5. Validar que los auditores adicionales existan en la base de datos
            if (body.additionalAuditorIds.length > 0) {
                const existingAuditors = await this.db
                .select({ id: usersTable.id })
                .from(usersTable)
                .where(inArray(usersTable.id, body.additionalAuditorIds))

                const existingIds = existingAuditors.map((auditor) => auditor.id)
                const nonExistentIds = body.additionalAuditorIds.filter((id) => !existingIds.includes(id))

                if (nonExistentIds.length > 0) {
                    throw new BadRequestException(`Los siguientes auditores adicionales no existen en la Base de Datos: ${nonExistentIds.join(", ")}`)
                }
            }

            this.logger.debug(`Auditores adicionales validados: ${body.additionalAuditorIds}`)
        } else {
        // 6.6. Si no se proporciona el array, establecer como array vacío
        body.additionalAuditorIds = [];
        }

        return body.additionalAuditorIds;
    }
}