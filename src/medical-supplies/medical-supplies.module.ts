import { Module } from '@nestjs/common';
import { MedicalSuppliesController } from './medical-supplies.controller';
import { MedicalSuppliesService } from './medical-supplies.service';
import { DrizzleDbConecctionModule } from 'src/db.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { LogsModule } from 'src/logs/logs.module';

@Module({
  imports: [DrizzleDbConecctionModule, CategoriesModule, LogsModule],
  controllers: [MedicalSuppliesController],
  providers: [MedicalSuppliesService],
  exports:[MedicalSuppliesService]
})
export class MedicalSuppliesModule {}