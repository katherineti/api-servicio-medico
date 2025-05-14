import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION, REPORT_STATUS_ENPROCESO } from 'src/constants';
import { auditReportsTable } from 'src/db/schema';
import { CreateReport, Reports } from 'src/db/types/reports.types';
import { v4 as uuidv4 } from 'uuid';
import { ReportCreateDto } from './dto/reports.dto';

@Injectable()
export class AuditorReportsService {
    logger: any;
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
    
        this.logger.log(`Informe de auditoría creado exitosamente con ID: ${newReportId}`);
      
        return updated[0];

    } catch (error) {
        this.logger.error(`Error al crear el reporte de auditoría: ${error.message}`, error.stack);
        throw new Error(`Error al registrar el reporte: ${error.message}`);
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

}
