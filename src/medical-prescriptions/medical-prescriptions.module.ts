import { Module } from '@nestjs/common';
import { MedicalPrescriptionsController } from './medical-prescriptions.controller';
import { MedicalPrescriptionsService } from './medical-prescriptions.service';
import { DrizzleDbConecctionModule } from 'src/db.module';

@Module({
  imports: [DrizzleDbConecctionModule],
  controllers: [MedicalPrescriptionsController],
  providers: [MedicalPrescriptionsService]
})
export class MedicalPrescriptionsModule {}
