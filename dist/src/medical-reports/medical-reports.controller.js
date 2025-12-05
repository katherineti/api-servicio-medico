"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalReportsController = void 0;
const common_1 = require("@nestjs/common");
const medical_reports_service_1 = require("./medical-reports.service");
const types_roles_1 = require("../db/enums/types-roles");
const role_decorators_1 = require("../decorators/role.decorators");
const medical_report_pdf_service_1 = require("./medical-report-pdf.service");
let MedicalReportsController = class MedicalReportsController {
    constructor(medicalReportsService, medicalReportPdfService) {
        this.medicalReportsService = medicalReportsService;
        this.medicalReportPdfService = medicalReportPdfService;
    }
    getProducts(body) {
        return this.medicalReportsService.getAll(body);
    }
    getById(id) {
        return this.medicalReportsService.getById(id);
    }
    async create(createMedicalReportsDto) {
        console.log("createMedicalReportsDto", createMedicalReportsDto);
        return this.medicalReportsService.create(createMedicalReportsDto);
    }
    async generateMedicalReportPdf(id, res, download) {
        const isDownload = download === "true" || download === "1";
        await this.medicalReportPdfService.generateMedicalReportPdf(id, res, isDownload);
    }
};
exports.MedicalReportsController = MedicalReportsController;
__decorate([
    (0, common_1.Post)("getAll"),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], MedicalReportsController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MedicalReportsController.prototype, "getById", null);
__decorate([
    (0, role_decorators_1.Roles)(types_roles_1.TypesRoles.admin, types_roles_1.TypesRoles.adminRRHH, types_roles_1.TypesRoles.medico),
    (0, common_1.Post)("create"),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], MedicalReportsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)("pdf/:id"),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('download')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, String]),
    __metadata("design:returntype", Promise)
], MedicalReportsController.prototype, "generateMedicalReportPdf", null);
exports.MedicalReportsController = MedicalReportsController = __decorate([
    (0, common_1.Controller)("medical-reports"),
    __metadata("design:paramtypes", [medical_reports_service_1.MedicalReportsService,
        medical_report_pdf_service_1.MedicalReportPdfService])
], MedicalReportsController);
//# sourceMappingURL=medical-reports.controller.js.map