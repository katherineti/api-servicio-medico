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
exports.MedicalPrescriptionsController = void 0;
const common_1 = require("@nestjs/common");
const medical_prescriptions_service_1 = require("./medical-prescriptions.service");
const medical_prescription_pdf_service_1 = require("./services/medical-prescription-pdf.service");
const update_medical_prescription_dto_1 = require("./dto/update-medical-prescription.dto");
let MedicalPrescriptionsController = class MedicalPrescriptionsController {
    constructor(medicalPrescriptionsService, recipePdfService) {
        this.medicalPrescriptionsService = medicalPrescriptionsService;
        this.recipePdfService = recipePdfService;
    }
    create(createMedicalPrescriptionDto) {
        return this.medicalPrescriptionsService.create(createMedicalPrescriptionDto);
    }
    update(id, updateMedicalPrescriptionDto) {
        return this.medicalPrescriptionsService.update(id, updateMedicalPrescriptionDto);
    }
    getAll(body) {
        return this.medicalPrescriptionsService.getAll(body);
    }
    async generatePrescriptionPdf(id, res) {
        try {
            const prescriptionData = await this.medicalPrescriptionsService.getById(id);
            const pdfBuffer = await this.recipePdfService.generateRecipePdf(prescriptionData);
            res.set({
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="receta-medica-${id}.pdf"`,
                "Content-Length": pdfBuffer.length,
            });
            res.status(common_1.HttpStatus.OK).send(pdfBuffer);
        }
        catch (error) {
            res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Error al generar el PDF del recipe médico",
                error: error.message,
            });
        }
    }
    async previewPrescriptionPdf(id, res) {
        try {
            const prescriptionId = Number.parseInt(id);
            const prescriptionData = await this.medicalPrescriptionsService.getById(prescriptionId);
            const pdfBuffer = await this.recipePdfService.generateRecipePdf(prescriptionData);
            res.set({
                "Content-Type": "application/pdf",
                "Content-Disposition": "inline",
            });
            res.status(common_1.HttpStatus.OK).send(pdfBuffer);
        }
        catch (error) {
            res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Error al generar el PDF del recipe médico",
                error: error.message,
            });
        }
    }
};
exports.MedicalPrescriptionsController = MedicalPrescriptionsController;
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", void 0)
], MedicalPrescriptionsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_medical_prescription_dto_1.UpdateMedicalPrescriptionDto]),
    __metadata("design:returntype", void 0)
], MedicalPrescriptionsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)("getAll"),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], MedicalPrescriptionsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(":id/pdf"),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MedicalPrescriptionsController.prototype, "generatePrescriptionPdf", null);
__decorate([
    (0, common_1.Get)(":id/pdf/preview"),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MedicalPrescriptionsController.prototype, "previewPrescriptionPdf", null);
exports.MedicalPrescriptionsController = MedicalPrescriptionsController = __decorate([
    (0, common_1.Controller)('medical-prescriptions'),
    __metadata("design:paramtypes", [medical_prescriptions_service_1.MedicalPrescriptionsService,
        medical_prescription_pdf_service_1.RecipePdfService])
], MedicalPrescriptionsController);
//# sourceMappingURL=medical-prescriptions.controller.js.map