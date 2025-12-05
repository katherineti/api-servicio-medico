"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardModule = void 0;
const common_1 = require("@nestjs/common");
const dashboard_controller_1 = require("./dashboard.controller");
const db_module_1 = require("../db.module");
const users_module_1 = require("../users/users.module");
const medical_supplies_module_1 = require("../medical-supplies/medical-supplies.module");
const categories_module_1 = require("../categories/categories.module");
const assignment_module_1 = require("../assignment/assignment.module");
const medical_supplies_expired_module_1 = require("../medical-supplies-expired/medical-supplies-expired.module");
let DashboardModule = class DashboardModule {
};
exports.DashboardModule = DashboardModule;
exports.DashboardModule = DashboardModule = __decorate([
    (0, common_1.Module)({
        imports: [
            db_module_1.DrizzleDbConecctionModule,
            users_module_1.UsersModule,
            medical_supplies_module_1.MedicalSuppliesModule,
            categories_module_1.CategoriesModule,
            assignment_module_1.AssignmentModule,
            medical_supplies_expired_module_1.MedicalSuppliesExpiredModule
        ],
        controllers: [dashboard_controller_1.DashboardController],
    })
], DashboardModule);
//# sourceMappingURL=dashboard.module.js.map