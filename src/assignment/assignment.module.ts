import { Module } from '@nestjs/common';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { DrizzleDbConecctionModule } from 'src/db.module';
import { MedicalSuppliesService } from 'src/medical-supplies/medical-supplies.service';
import { MedicalSuppliesModule } from 'src/medical-supplies/medical-supplies.module';
import { CategoriesService } from 'src/categories/categories.service';

@Module({
  imports: [DrizzleDbConecctionModule],
  controllers: [AssignmentController],
  providers: [AssignmentService,MedicalSuppliesService, CategoriesService]
})
export class AssignmentModule {}
