"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardReportModule = void 0;
const common_1 = require("@nestjs/common");
const db_module_1 = require("../db.module");
const dashboard_report_service_1 = require("./dashboard-report.service");
const dashboard_report_controller_1 = require("./dashboard-report.controller");
const pdf_dasboard_service_1 = require("./pdf-dasboard.service");
const medical_supplies_report_today_service_1 = require("./medical-supplies-registered/medical-supplies-report-today.service");
const medical_supplies_report_month_service_1 = require("./medical-supplies-registered/medical-supplies-report-month.service");
const assignment_report_month_service_1 = require("./assignment-registered/assignment-report-month.service");
const assignment_module_1 = require("../assignment/assignment.module");
const medical_supplies_report_service_1 = require("./medical-supplies-available/medical-supplies-report.service");
const medical_supplies_module_1 = require("../medical-supplies/medical-supplies.module");
const stockAssignment_report_month_service_1 = require("./assignment-stock/stockAssignment-report-month.service");
const medical_supplies_report_all_service_1 = require("./medical-supplies-registered/medical-supplies-report-all.service");
let DashboardReportModule = class DashboardReportModule {
};
exports.DashboardReportModule = DashboardReportModule;
exports.DashboardReportModule = DashboardReportModule = __decorate([
    (0, common_1.Module)({
        imports: [db_module_1.DrizzleDbConecctionModule, assignment_module_1.AssignmentModule, medical_supplies_module_1.MedicalSuppliesModule],
        controllers: [dashboard_report_controller_1.DashboardReportController],
        providers: [
            dashboard_report_service_1.DashboardReportService, pdf_dasboard_service_1.PdfDashboardService,
            medical_supplies_report_today_service_1.MedicalSuppliesReportTodayService,
            medical_supplies_report_month_service_1.MedicalSuppliesReportMonthService,
            medical_supplies_report_all_service_1.MedicalSuppliesReportAllService,
            assignment_report_month_service_1.AssignmentReportMonthService,
            medical_supplies_report_service_1.MedicalSuppliesReportService,
            stockAssignment_report_month_service_1.AssignmentReportMonthByMedicalSuppliesService
        ],
        exports: [dashboard_report_service_1.DashboardReportService, medical_supplies_report_today_service_1.MedicalSuppliesReportTodayService, medical_supplies_report_month_service_1.MedicalSuppliesReportMonthService, assignment_report_month_service_1.AssignmentReportMonthService, medical_supplies_report_service_1.MedicalSuppliesReportService]
    })
], DashboardReportModule);
//# sourceMappingURL=dashboard-report.module.js.map