import { Module } from '@nestjs/common';
import { DrizzleDbConecctionModule } from 'src/db.module';
import { DashboardReportService } from './dashboard-report.service';
import { DashboardReportController } from './dashboard-report.controller';
import { PdfDashboardService } from './pdf-dasboard.service';
import { MedicalSuppliesReportTodayService } from './medical-supplies-registered/medical-supplies-report-today.service';
import { MedicalSuppliesReportMonthService } from './medical-supplies-registered/medical-supplies-report-month.service';
import { AssignmentReportMonthService } from './assignment-registered/assignment-report-month.service';
import { AssignmentModule } from 'src/assignment/assignment.module';

@Module({
    imports: [ DrizzleDbConecctionModule, AssignmentModule ],
    controllers: [DashboardReportController],
    providers: [
        DashboardReportService, PdfDashboardService,
        MedicalSuppliesReportTodayService,
        MedicalSuppliesReportMonthService,
        AssignmentReportMonthService
    ],
    exports:[DashboardReportService,MedicalSuppliesReportTodayService, MedicalSuppliesReportMonthService, AssignmentReportMonthService]
})
export class DashboardReportModule {}