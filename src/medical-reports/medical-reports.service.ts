import { Inject, Injectable, Logger } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION } from 'src/constants';

@Injectable()
export class MedicalReportsService {
      private readonly logger = new Logger(MedicalReportsService.name);
      
      constructor(@Inject(PG_CONNECTION) private db: NeonDatabase) {}
    
}