import { Module } from '@nestjs/common';
import { DrizzleDbConecctionModule } from 'src/db.module';
import { DashboardReportService } from './dashboard-report.service';
import { DashboardReportController } from './dashboard-report.controller';
import { PdfDashboardService } from './pdf-dasboard.service';
import { MedicalSuppliesReportService } from './medical-supplies-report.service';

@Module({
    imports: [ DrizzleDbConecctionModule ],
    controllers: [DashboardReportController],
    providers: [
        DashboardReportService, PdfDashboardService, 
        MedicalSuppliesReportService
    ],
    exports:[DashboardReportService,MedicalSuppliesReportService]
})
export class DashboardReportModule {}