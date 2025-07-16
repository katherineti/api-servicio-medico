import { Module } from '@nestjs/common';
import { MedicalReportsController } from './medical-reports.controller';
import { MedicalReportsService } from './medical-reports.service';
import { DrizzleDbConecctionModule } from 'src/db.module';
import { MedicalReportPdfService } from './medical-report-pdf.service';

@Module({
  imports: [DrizzleDbConecctionModule],
  controllers: [MedicalReportsController],
  providers: [
    MedicalReportsService,
    MedicalReportPdfService
  ]
})
export class MedicalReportsModule {}