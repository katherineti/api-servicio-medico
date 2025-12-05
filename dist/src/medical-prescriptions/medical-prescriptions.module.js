"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalPrescriptionsModule = void 0;
const common_1 = require("@nestjs/common");
const medical_prescriptions_controller_1 = require("./medical-prescriptions.controller");
const medical_prescriptions_service_1 = require("./medical-prescriptions.service");
const db_module_1 = require("../db.module");
const medical_prescription_pdf_service_1 = require("./services/medical-prescription-pdf.service");
let MedicalPrescriptionsModule = class MedicalPrescriptionsModule {
};
exports.MedicalPrescriptionsModule = MedicalPrescriptionsModule;
exports.MedicalPrescriptionsModule = MedicalPrescriptionsModule = __decorate([
    (0, common_1.Module)({
        imports: [db_module_1.DrizzleDbConecctionModule],
        controllers: [medical_prescriptions_controller_1.MedicalPrescriptionsController],
        providers: [medical_prescriptions_service_1.MedicalPrescriptionsService, medical_prescription_pdf_service_1.RecipePdfService],
    })
], MedicalPrescriptionsModule);
//# sourceMappingURL=medical-prescriptions.module.js.map