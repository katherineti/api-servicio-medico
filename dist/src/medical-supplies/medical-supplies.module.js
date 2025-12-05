"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalSuppliesModule = void 0;
const common_1 = require("@nestjs/common");
const medical_supplies_controller_1 = require("./medical-supplies.controller");
const medical_supplies_service_1 = require("./medical-supplies.service");
const db_module_1 = require("../db.module");
const categories_module_1 = require("../categories/categories.module");
const logs_module_1 = require("../logs/logs.module");
let MedicalSuppliesModule = class MedicalSuppliesModule {
};
exports.MedicalSuppliesModule = MedicalSuppliesModule;
exports.MedicalSuppliesModule = MedicalSuppliesModule = __decorate([
    (0, common_1.Module)({
        imports: [db_module_1.DrizzleDbConecctionModule, categories_module_1.CategoriesModule, logs_module_1.LogsModule],
        controllers: [medical_supplies_controller_1.MedicalSuppliesController],
        providers: [medical_supplies_service_1.MedicalSuppliesService],
        exports: [medical_supplies_service_1.MedicalSuppliesService]
    })
], MedicalSuppliesModule);
//# sourceMappingURL=medical-supplies.module.js.map