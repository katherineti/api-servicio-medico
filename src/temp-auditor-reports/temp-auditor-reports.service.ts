import { ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION, REPORT_STATUS_ENPROCESO, REPORT_STATUS_FINALIZADO } from 'src/constants';
import { auditReportsTable_temp } from 'src/db/schema';
import { CreateReport, Reports } from 'src/db/types/reports.types';
import { v4 as uuidv4 } from 'uuid';
import { ReportCreateDto } from './dto/reports.dto';
import { ReportUpdateDto } from './dto/report-update.dto';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class TempAuditorReportsService {
    private readonly logger = new Logger(TempAuditorReportsService.name);
   
    constructor(@Inject(PG_CONNECTION) private db: NeonDatabase, private filesService: FilesService) {}
    
    async create(body: ReportCreateDto): Promise<Reports>{ 
        try {
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

        console.log("body",body);
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

    async update(id: number, body: Partial<ReportUpdateDto>): Promise<Reports>{

        const Report = await this.getById(id);

        if (!Report) {
            throw new NotFoundException('El reporte no existe');
        }

        const { title, receiver, auditorId, statusId,
                summary_objective,summary_scope,summary_methodology,summary_conclusionAndObservation,
                introduction, detailed_methodology, findings, conclusions
              } = body
        
        const updateData: Partial<CreateReport> = {
            title: title,
            receiver: receiver,
            auditorId: auditorId,
            statusId: statusId,
            summary_objective: summary_objective,
            summary_scope: summary_scope,
            summary_methodology: summary_methodology,
            summary_conclusionAndObservation: summary_conclusionAndObservation,
        };

        if(statusId===REPORT_STATUS_FINALIZADO){
            updateData.introduction= introduction,
            updateData.detailed_methodology= detailed_methodology,
            updateData.findings= findings,
            updateData.conclusions= conclusions,
            updateData.images= null,
            updateData.endDate = new Date();
        }
        console.log("objeto para actualizar " , updateData);
        const updated = await this.db
        .update(auditReportsTable_temp)
        .set(updateData)
        .where(eq(auditReportsTable_temp.id, id));

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
        } = body;

        const updateData: Partial<CreateReport> = {
        title,
        receiver,
        auditorId: auditorId ? Number(auditorId) : undefined,
        statusId: statusId ? Number(statusId) : undefined,
        summary_objective,
        summary_scope,
        summary_methodology,
        summary_conclusionAndObservation,
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
}