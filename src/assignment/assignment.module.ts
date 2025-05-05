import { Module } from '@nestjs/common';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { DrizzleDbConecctionModule } from 'src/db.module';
import { LogsModule } from 'src/logs/logs.module';
import { MedicalSuppliesModule } from 'src/medical-supplies/medical-supplies.module';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [
    DrizzleDbConecctionModule, 
    MedicalSuppliesModule,
    CategoriesModule,
    LogsModule
  ],
  controllers: [AssignmentController],
  providers: [AssignmentService],
  exports:[AssignmentService]
})
export class AssignmentModule {}