"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalSuppliesExpiredModule = void 0;
const common_1 = require("@nestjs/common");
const medical_supplies_expired_controller_1 = require("./medical-supplies-expired.controller");
const medical_supplies_expired_service_1 = require("./medical-supplies-expired.service");
const db_module_1 = require("../db.module");
let MedicalSuppliesExpiredModule = class MedicalSuppliesExpiredModule {
};
exports.MedicalSuppliesExpiredModule = MedicalSuppliesExpiredModule;
exports.MedicalSuppliesExpiredModule = MedicalSuppliesExpiredModule = __decorate([
    (0, common_1.Module)({
        imports: [db_module_1.DrizzleDbConecctionModule],
        controllers: [medical_supplies_expired_controller_1.MedicalSuppliesExpiredController],
        providers: [medical_supplies_expired_service_1.MedicalSuppliesExpiredService],
        exports: [medical_supplies_expired_service_1.MedicalSuppliesExpiredService]
    })
], MedicalSuppliesExpiredModule);
//# sourceMappingURL=medical-supplies-expired.module.js.map