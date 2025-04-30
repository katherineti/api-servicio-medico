import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { UsersService } from 'src/users/users.service';
import { MedicalSuppliesService } from 'src/medical-supplies/medical-supplies.service';
import { DrizzleDbConecctionModule } from 'src/db.module';
import { CategoriesService } from 'src/categories/categories.service';

@Module({
  imports: [DrizzleDbConecctionModule],
  controllers: [DashboardController],
  providers:[UsersService, MedicalSuppliesService, CategoriesService]
})
export class DashboardModule {}