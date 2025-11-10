import { Module } from '@nestjs/common';
import { ExportController } from './excel-export.controller';
import { ExportUsersService } from './excel-export-users.service';
import { DrizzleDbConecctionModule } from 'src/db.module';

@Module({
  imports: [DrizzleDbConecctionModule],
  controllers: [ExportController],
  providers: [ExportUsersService],
  exports: [ExportUsersService]
})
export class ExcelExportModule {}