"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentModule = void 0;
const common_1 = require("@nestjs/common");
const assignment_controller_1 = require("./assignment.controller");
const assignment_service_1 = require("./assignment.service");
const db_module_1 = require("../db.module");
const logs_module_1 = require("../logs/logs.module");
const medical_supplies_module_1 = require("../medical-supplies/medical-supplies.module");
const categories_module_1 = require("../categories/categories.module");
let AssignmentModule = class AssignmentModule {
};
exports.AssignmentModule = AssignmentModule;
exports.AssignmentModule = AssignmentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            db_module_1.DrizzleDbConecctionModule,
            medical_supplies_module_1.MedicalSuppliesModule,
            categories_module_1.CategoriesModule,
            logs_module_1.LogsModule
        ],
        controllers: [assignment_controller_1.AssignmentController],
        providers: [assignment_service_1.AssignmentService],
        exports: [assignment_service_1.AssignmentService]
    })
], AssignmentModule);
//# sourceMappingURL=assignment.module.js.map