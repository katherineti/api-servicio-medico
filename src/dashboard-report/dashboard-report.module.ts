import { Module } from '@nestjs/common';
import { DrizzleDbConecctionModule } from 'src/db.module';
import { DashboardReportService } from './dashboard-report.service';
import { DashboardReportController } from './dashboard-report.controller';

@Module({
    imports: [ DrizzleDbConecctionModule ],
    controllers: [DashboardReportController],
    providers: [DashboardReportService],
    // exports:[DashboardReportService]
})
export class DashboardReportModule {}