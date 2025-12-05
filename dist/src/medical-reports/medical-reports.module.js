"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalReportsModule = void 0;
const common_1 = require("@nestjs/common");
const medical_reports_controller_1 = require("./medical-reports.controller");
const medical_reports_service_1 = require("./medical-reports.service");
const db_module_1 = require("../db.module");
const medical_report_pdf_service_1 = require("./medical-report-pdf.service");
let MedicalReportsModule = class MedicalReportsModule {
};
exports.MedicalReportsModule = MedicalReportsModule;
exports.MedicalReportsModule = MedicalReportsModule = __decorate([
    (0, common_1.Module)({
        imports: [db_module_1.DrizzleDbConecctionModule],
        controllers: [medical_reports_controller_1.MedicalReportsController],
        providers: [
            medical_reports_service_1.MedicalReportsService,
            medical_report_pdf_service_1.MedicalReportPdfService
        ]
    })
], MedicalReportsModule);
//# sourceMappingURL=medical-reports.module.js.map