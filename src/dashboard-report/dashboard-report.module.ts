import { Module } from '@nestjs/common';
import { DrizzleDbConecctionModule } from 'src/db.module';
import { DashboardReportService } from './dashboard-report.service';
import { DashboardReportController } from './dashboard-report.controller';
import { PdfDashboardService } from './pdf-dasboard.service';
import { MedicalSuppliesReportService } from './medical-supplies-report.service';
import { MedicalSuppliesReportMonthService } from './medical-supplies-report-month.service';

@Module({
    imports: [ DrizzleDbConecctionModule ],
    controllers: [DashboardReportController],
    providers: [
        DashboardReportService, PdfDashboardService,
        MedicalSuppliesReportService,
        MedicalSuppliesReportMonthService
    ],
    exports:[DashboardReportService,MedicalSuppliesReportService, MedicalSuppliesReportMonthService]
})
export class DashboardReportModule {}