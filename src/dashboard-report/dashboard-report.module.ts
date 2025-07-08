import { Module } from '@nestjs/common';
import { DrizzleDbConecctionModule } from 'src/db.module';
import { DashboardReportService } from './dashboard-report.service';
import { DashboardReportController } from './dashboard-report.controller';
import { PdfDashboardService } from './pdf-dasboard.service';
import { MedicalSuppliesReportTodayService } from './medical-supplies-registered/medical-supplies-report-today.service';
import { MedicalSuppliesReportMonthService } from './medical-supplies-registered/medical-supplies-report-month.service';


@Module({
    imports: [ DrizzleDbConecctionModule ],
    controllers: [DashboardReportController],
    providers: [
        DashboardReportService, PdfDashboardService,
        MedicalSuppliesReportTodayService,
        MedicalSuppliesReportMonthService
    ],
    exports:[DashboardReportService,MedicalSuppliesReportTodayService, MedicalSuppliesReportMonthService]
})
export class DashboardReportModule {}