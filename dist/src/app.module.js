"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const db_module_1 = require("./db.module");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const core_1 = require("@nestjs/core");
const at_guard_1 = require("./guards/at.guard");
const medical_supplies_module_1 = require("./medical-supplies/medical-supplies.module");
const categories_module_1 = require("./categories/categories.module");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const assignment_module_1 = require("./assignment/assignment.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const roles_guard_1 = require("./guards/roles.guard");
const roles_module_1 = require("./roles/roles.module");
const logs_module_1 = require("./logs/logs.module");
const temp_auditor_reports_module_1 = require("./temp-auditor-reports/temp-auditor-reports.module");
const files_module_1 = require("./files/files.module");
const medical_supplies_expired_module_1 = require("./medical-supplies-expired/medical-supplies-expired.module");
const providers_module_1 = require("./providers/providers.module");
const dashboard_report_module_1 = require("./dashboard-report/dashboard-report.module");
const medical_reports_module_1 = require("./medical-reports/medical-reports.module");
const patients_module_1 = require("./patients/patients.module");
const medical_prescriptions_module_1 = require("./medical-prescriptions/medical-prescriptions.module");
const excel_export_module_1 = require("./excel/excel-export.module");
const db_backup_module_1 = require("./db-backup/db-backup.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            db_module_1.DrizzleDbConecctionModule,
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), 'uploads'),
                serveRoot: '/uploads',
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            medical_supplies_module_1.MedicalSuppliesModule,
            categories_module_1.CategoriesModule,
            assignment_module_1.AssignmentModule,
            dashboard_module_1.DashboardModule,
            roles_module_1.RolesModule,
            logs_module_1.LogsModule,
            temp_auditor_reports_module_1.TempAuditorReportsModule,
            files_module_1.FilesModule,
            medical_supplies_expired_module_1.MedicalSuppliesExpiredModule,
            providers_module_1.ProvidersModule,
            dashboard_report_module_1.DashboardReportModule,
            medical_reports_module_1.MedicalReportsModule,
            patients_module_1.PatientsModule,
            medical_prescriptions_module_1.MedicalPrescriptionsModule,
            excel_export_module_1.ExcelExportModule,
            db_backup_module_1.DbBackupModule
        ],
        controllers: [],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: at_guard_1.AtGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard
            }
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map