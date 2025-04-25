import { Module } from '@nestjs/common';
import { MedicalSuppliesController } from './medical-supplies.controller';
import { MedicalSuppliesService } from './medical-supplies.service';
import { DrizzleDbConecctionModule } from 'src/db.module';
import { CategoriesService } from 'src/categories/categories.service';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [DrizzleDbConecctionModule, CategoriesModule],
  controllers: [MedicalSuppliesController],
  providers: [MedicalSuppliesService, CategoriesService]
})
export class MedicalSuppliesModule {}
