import { Module } from '@nestjs/common';
import { AuditorReportsController } from './auditor-reports.controller';
import { AuditorReportsService } from './auditor-reports.service';
import { DrizzleDbConecctionModule } from 'src/db.module';

@Module({
  imports:[DrizzleDbConecctionModule],
  controllers: [AuditorReportsController],
  providers: [AuditorReportsService]
})

export class AuditorReportsModule {}