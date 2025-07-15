import { Module } from '@nestjs/common';
import { MedicalReportsController } from './medical-reports.controller';
import { MedicalReportsService } from './medical-reports.service';
import { DrizzleDbConecctionModule } from 'src/db.module';

@Module({
  imports: [DrizzleDbConecctionModule],
  controllers: [MedicalReportsController],
  providers: [MedicalReportsService]
})
export class MedicalReportsModule {}