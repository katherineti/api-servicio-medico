import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION, REPORT_STATUS_ENPROCESO, REPORT_STATUS_FINALIZADO } from 'src/constants';
import { auditReportsTable } from 'src/db/schema';
import { CreateReport, Reports } from 'src/db/types/reports.types';
import { v4 as uuidv4 } from 'uuid';
import { ReportCreateDto } from './dto/reports.dto';
import { ReportUpdateDto } from './dto/report-update.dto';

@Injectable()
export class AuditorReportsService {
    private readonly logger = new Logger(AuditorReportsService.name);
   
    constructor(@Inject(PG_CONNECTION) private db: NeonDatabase) {}
    
    async create(body: ReportCreateDto): Promise<Reports>{ 
        try {
        const reportToCreate = {
            ...body,
            code: '',
            statusId: REPORT_STATUS_ENPROCESO,
            startDate: new Date(),
            idDuplicate: null,
            updatedAt: null,
          };

        console.log("body",body);

        let newReport = await this.db.insert(auditReportsTable).values(reportToCreate).returning();

        if (!newReport || !newReport[0].id) {
            throw new Error('Error al crear el reporte de auditoría.');
        }

        const newReportId = newReport[0].id;
        const year = new Date().getFullYear();
    
        const formattedId = `O${body.auditorId}${uuidv4()}.${newReportId}.${year}`;

        const updateData: Partial<CreateReport> = {
            code: formattedId
        }

        const updated = await this.db
        .update(auditReportsTable)
        .set(updateData)
        .where(eq(auditReportsTable.id, newReportId))
        .returning();
    
        this.logger.debug(`Informe de auditoría creado exitosamente con ID: ${newReportId}`);
      
        return updated[0];

    } catch (err) {
        this.logger.error(`Error al crear el reporte de auditoría: `, err);
        throw new Error(`Error al registrar el reporte: ${err}`);
      }
    }

    async getById(id: number): Promise<Reports | null> {
        try{
            const result = await this.db.select()
            .from(auditReportsTable)
            .where(eq( auditReportsTable.id, id ))
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

        const { title, addressee, auditorId, statusId,
                summary_objective,summary_scope,summary_methodology,summary_conclusionAndObservation,
                introduction, detailed_methodology, findings, conclusions
              } = body
        
        const updateData: Partial<CreateReport> = {
            title: title,
            addressee: addressee,
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
            updateData.images= 'images',
            updateData.endDate = new Date();
        }
        console.log("objeto para actualizar " , updateData);
        const updated = await this.db
        .update(auditReportsTable)
        .set(updateData)
        .where(eq(auditReportsTable.id, id));

        return updated[0];
    }

}