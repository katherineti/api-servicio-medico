import { Module } from '@nestjs/common';
import { MedicalPrescriptionsController } from './medical-prescriptions.controller';
import { MedicalPrescriptionsService } from './medical-prescriptions.service';
import { DrizzleDbConecctionModule } from 'src/db.module';
import { RecipePdfService } from './services/medical-prescription-pdf.service';

@Module({
  imports: [DrizzleDbConecctionModule],
  controllers: [MedicalPrescriptionsController],
  providers: [MedicalPrescriptionsService, RecipePdfService],
})
export class MedicalPrescriptionsModule {}