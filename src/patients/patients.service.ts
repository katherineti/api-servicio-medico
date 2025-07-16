import { Inject, Injectable, Logger } from '@nestjs/common';
import { and, desc, count, ilike } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION } from 'src/constants';
import { patientTable } from 'src/db/schema';
import { PatientsGetAll } from './dto/read-patients-dto';
import { SearchPatientsDto } from './dto/search-patients.dto';

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
}
