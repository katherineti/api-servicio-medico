import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { DrizzleDbConecctionModule } from 'src/db.module';

@Module({
  imports: [DrizzleDbConecctionModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports:[CategoriesService]
})
export class CategoriesModule {}