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
var TempAuditorReportsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TempAuditorReportsController = void 0;
const common_1 = require("@nestjs/common");
const temp_auditor_reports_service_1 = require("./temp-auditor-reports.service");
const role_decorators_1 = require("../decorators/role.decorators");
const types_roles_1 = require("../db/enums/types-roles");
const reports_dto_1 = require("./dto/reports.dto");
const report_update_dto_1 = require("./dto/report-update.dto");
const platform_express_1 = require("@nestjs/platform-express");
const search_reports_dto_1 = require("./dto/search.reports.dto");
const pdf_generator_service_1 = require("./pdf-generator.service");
let TempAuditorReportsController = TempAuditorReportsController_1 = class TempAuditorReportsController {
    constructor(tempAuditorReportsService, pdfGeneratorService) {
        this.tempAuditorReportsService = tempAuditorReportsService;
        this.pdfGeneratorService = pdfGeneratorService;
        this.logger = new common_1.Logger(TempAuditorReportsController_1.name);
    }
    async create(reportDto) {
        return this.tempAuditorReportsService.create(reportDto);
    }
    getAllAuditores() {
        return this.tempAuditorReportsService.getAllAuditores();
    }
    getUser(id) {
        return this.tempAuditorReportsService.getById(id);
    }
    getProducts(body) {
        return this.tempAuditorReportsService.getAll(body);
    }
    update(id, reportDto) {
        return this.tempAuditorReportsService.update(id, reportDto);
    }
    async updateWithImages(id, reportDto, files) {
        console.log('Datos del reporte recibido:', JSON.stringify(reportDto, null, 2));
        console.log('Numero de archivos recibidos:', files?.images?.length || 0);
        console.log('Archivos recibidos:', files?.images);
        const imageFiles = files?.images || [];
        return this.tempAuditorReportsService.updateWithImages(id, reportDto, imageFiles);
    }
    delete(id) {
        return this.tempAuditorReportsService.delete(id);
    }
    async generatePdf(id, reportDto, res, download) {
        this.logger.log(`** Endpoint @Post('pdf/:id'). Solicitud de generación de PDF para el informe ${id} **`);
        try {
            const report = await this.tempAuditorReportsService.getById(id);
            const isDownload = download === 'true' || download === '1';
            const filename = `informe-auditoria-${id}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`);
            console.log("Informacion del informe", report);
            await this.pdfGeneratorService.generatePdf(reportDto, res);
            this.logger.log(`PDF generado exitosamente para el informe ${id}`);
        }
        catch (error) {
            if (res.headersSent) {
                this.logger.warn(`Los encabezados ya fueron enviados para el informe ${id}, no se puede enviar respuesta de error`);
                return;
            }
        }
    }
    async duplicate(objectId) {
        return this.tempAuditorReportsService.duplicate(objectId);
    }
};
exports.TempAuditorReportsController = TempAuditorReportsController;
__decorate([
    (0, common_1.Post)(),
    (0, role_decorators_1.Roles)(types_roles_1.TypesRoles.admin, types_roles_1.TypesRoles.adminRRHH, types_roles_1.TypesRoles.auditor),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reports_dto_1.ReportCreateDto]),
    __metadata("design:returntype", Promise)
], TempAuditorReportsController.prototype, "create", null);
__decorate([
    (0, role_decorators_1.Roles)(types_roles_1.TypesRoles.admin, types_roles_1.TypesRoles.adminRRHH, types_roles_1.TypesRoles.auditor),
    (0, common_1.Get)('getAllAuditores'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TempAuditorReportsController.prototype, "getAllAuditores", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TempAuditorReportsController.prototype, "getUser", null);
__decorate([
    (0, common_1.Post)('getAll'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_reports_dto_1.SearchReportsDto]),
    __metadata("design:returntype", Promise)
], TempAuditorReportsController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, role_decorators_1.Roles)(types_roles_1.TypesRoles.admin, types_roles_1.TypesRoles.adminRRHH, types_roles_1.TypesRoles.auditor),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, report_update_dto_1.ReportUpdateDto]),
    __metadata("design:returntype", void 0)
], TempAuditorReportsController.prototype, "update", null);
__decorate([
    (0, common_1.Put)('images/:id'),
    (0, role_decorators_1.Roles)(types_roles_1.TypesRoles.admin, types_roles_1.TypesRoles.adminRRHH, types_roles_1.TypesRoles.auditor),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'images', maxCount: 10 },
    ], {
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, report_update_dto_1.ReportUpdateDto, Object]),
    __metadata("design:returntype", Promise)
], TempAuditorReportsController.prototype, "updateWithImages", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TempAuditorReportsController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)('pdf/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.Query)('download')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object, String]),
    __metadata("design:returntype", Promise)
], TempAuditorReportsController.prototype, "generatePdf", null);
__decorate([
    (0, common_1.Post)('duplicate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TempAuditorReportsController.prototype, "duplicate", null);
exports.TempAuditorReportsController = TempAuditorReportsController = TempAuditorReportsController_1 = __decorate([
    (0, common_1.Controller)('temp-auditor-reports'),
    __metadata("design:paramtypes", [temp_auditor_reports_service_1.TempAuditorReportsService,
        pdf_generator_service_1.PdfGeneratorService])
], TempAuditorReportsController);
//# sourceMappingURL=temp-auditor-reports.controller.js.map