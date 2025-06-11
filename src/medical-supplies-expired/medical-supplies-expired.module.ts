import { Module } from '@nestjs/common';
import { MedicalSuppliesExpiredController } from './medical-supplies-expired.controller';
import { MedicalSuppliesExpiredService } from './medical-supplies-expired.service';
import { DrizzleDbConecctionModule } from 'src/db.module';

@Module({
  imports:[DrizzleDbConecctionModule],
  controllers: [MedicalSuppliesExpiredController],
  providers: [MedicalSuppliesExpiredService],
  exports:[MedicalSuppliesExpiredService]
})
export class MedicalSuppliesExpiredModule {}