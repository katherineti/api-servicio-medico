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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateAssignmentReportDto = exports.MedicalSupplyStatsDto = exports.GenerateMedicalSupplyReportDto = exports.SupplyTypeEnum = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var SupplyTypeEnum;
(function (SupplyTypeEnum) {
    SupplyTypeEnum[SupplyTypeEnum["MEDICAMENTOS"] = 1] = "MEDICAMENTOS";
    SupplyTypeEnum[SupplyTypeEnum["UNIFORMES"] = 2] = "UNIFORMES";
    SupplyTypeEnum[SupplyTypeEnum["EQUIPOS_ODONTOLOGICOS"] = 3] = "EQUIPOS_ODONTOLOGICOS";
})(SupplyTypeEnum || (exports.SupplyTypeEnum = SupplyTypeEnum = {}));
class GenerateMedicalSupplyReportDto {
}
exports.GenerateMedicalSupplyReportDto = GenerateMedicalSupplyReportDto;
__decorate([
    (0, class_validator_1.IsEnum)(SupplyTypeEnum),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], GenerateMedicalSupplyReportDto.prototype, "supplyType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === "true" || value === "1"),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GenerateMedicalSupplyReportDto.prototype, "includeExpired", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GenerateMedicalSupplyReportDto.prototype, "minStockThreshold", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === "true" || value === "1"),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GenerateMedicalSupplyReportDto.prototype, "download", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GenerateMedicalSupplyReportDto.prototype, "reportDate", void 0);
class MedicalSupplyStatsDto {
}
exports.MedicalSupplyStatsDto = MedicalSupplyStatsDto;
__decorate([
    (0, class_validator_1.IsEnum)(SupplyTypeEnum),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], MedicalSupplyStatsDto.prototype, "supplyType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], MedicalSupplyStatsDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], MedicalSupplyStatsDto.prototype, "endDate", void 0);
class GenerateAssignmentReportDto {
}
exports.GenerateAssignmentReportDto = GenerateAssignmentReportDto;
__decorate([
    (0, class_validator_1.IsEnum)(["day", "month"]),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateAssignmentReportDto.prototype, "reportType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GenerateAssignmentReportDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === "true" || value === "1"),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GenerateAssignmentReportDto.prototype, "download", void 0);
//# sourceMappingURL=medical-supplies-report.dto.js.map