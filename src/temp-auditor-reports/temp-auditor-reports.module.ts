import { Module } from '@nestjs/common';
import { DrizzleDbConecctionModule } from 'src/db.module';
import { TempAuditorReportsController } from './temp-auditor-reports.controller';
import { TempAuditorReportsService } from './temp-auditor-reports.service';

@Module({
    imports:[DrizzleDbConecctionModule],
    controllers: [TempAuditorReportsController],
    providers: [TempAuditorReportsService]
})
export class TempAuditorReportsModule {}
