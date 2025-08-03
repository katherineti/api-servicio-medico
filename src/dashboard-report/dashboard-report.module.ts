import { Module } from '@nestjs/common';
import { DrizzleDbConecctionModule } from 'src/db.module';
import { DashboardReportService } from './dashboard-report.service';
import { DashboardReportController } from './dashboard-report.controller';
import { PdfDashboardService } from './pdf-dasboard.service';
import { MedicalSuppliesReportTodayService } from './medical-supplies-registered/medical-supplies-report-today.service';
import { MedicalSuppliesReportMonthService } from './medical-supplies-registered/medical-supplies-report-month.service';
import { AssignmentReportMonthService } from './assignment-registered/assignment-report-month.service';
import { AssignmentModule } from 'src/assignment/assignment.module';
import { MedicalSuppliesReportService } from './medical-supplies-available/medical-supplies-report.service';
import { MedicalSuppliesModule } from 'src/medical-supplies/medical-supplies.module';
import { AssignmentReportMonthByMedicalSuppliesService } from './assignment-stock/stockAssignment-report-month.service';
import { MedicalSuppliesReportAllService } from './medical-supplies-registered/medical-supplies-report-all.service';

@Module({
    imports: [ DrizzleDbConecctionModule, AssignmentModule, MedicalSuppliesModule ],
    controllers: [DashboardReportController],
    providers: [
        DashboardReportService, PdfDashboardService,
        MedicalSuppliesReportTodayService,//Registros de insumos medicos
        MedicalSuppliesReportMonthService,//Registros de insumos medicos
        MedicalSuppliesReportAllService,//Registros de insumos medicos
        AssignmentReportMonthService,
        //insumos medicos disponibles
        MedicalSuppliesReportService,
        //asignaciones por tipo de insumo medico
        AssignmentReportMonthByMedicalSuppliesService
    ],
    exports:[DashboardReportService,MedicalSuppliesReportTodayService, MedicalSuppliesReportMonthService, AssignmentReportMonthService, MedicalSuppliesReportService]
})
export class DashboardReportModule {}