import { Module } from '@nestjs/common';
import { DrizzleDbConecctionModule } from 'src/db.module';
import { DashboardReportService } from './dashboard-report.service';
import { DashboardReportController } from './dashboard-report.controller';
import { PdfDashboardService } from './pdf-dasboard.service';

@Module({
    imports: [ DrizzleDbConecctionModule ],
    controllers: [DashboardReportController],
    providers: [DashboardReportService, PdfDashboardService],
    exports:[DashboardReportService]
})
export class DashboardReportModule {}