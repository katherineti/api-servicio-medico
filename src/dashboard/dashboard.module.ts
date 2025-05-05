import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DrizzleDbConecctionModule } from 'src/db.module';
import { UsersModule } from 'src/users/users.module';
import { MedicalSuppliesModule } from 'src/medical-supplies/medical-supplies.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { AssignmentModule } from 'src/assignment/assignment.module';

@Module({
  imports: [
    DrizzleDbConecctionModule,
    UsersModule,
    MedicalSuppliesModule,
    CategoriesModule,
    AssignmentModule
  ],
  controllers: [DashboardController],
})
export class DashboardModule {}