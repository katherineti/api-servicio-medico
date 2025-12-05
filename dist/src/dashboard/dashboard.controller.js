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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const assignment_service_1 = require("../assignment/assignment.service");
const types_roles_1 = require("../db/enums/types-roles");
const role_decorators_1 = require("../decorators/role.decorators");
const medical_supplies_expired_service_1 = require("../medical-supplies-expired/medical-supplies-expired.service");
const medical_supplies_service_1 = require("../medical-supplies/medical-supplies.service");
const users_service_1 = require("../users/users.service");
let DashboardController = class DashboardController {
    constructor(usersService, medicalSuppliesService, assignmentService, medicalSuppliesExpiredService) {
        this.usersService = usersService;
        this.medicalSuppliesService = medicalSuppliesService;
        this.assignmentService = assignmentService;
        this.medicalSuppliesExpiredService = medicalSuppliesExpiredService;
    }
    totalUsers() {
        return this.usersService.countAllUsers();
    }
    totalProductsOfTheDay() {
        return this.medicalSuppliesService.totalProductsOfTheDay();
    }
    totalProductsOfMonth() {
        return this.medicalSuppliesService.totalProductsOfMonth();
    }
    totalAssignmentOfTheDay() {
        return this.assignmentService.totalAssignmentOfTheDay();
    }
    totalAssignmentOfMonth() {
        return this.assignmentService.totalAssignmentOfMonth();
    }
    totalAllProducts() {
        return this.medicalSuppliesService.countAllProducts();
    }
    totalAssignments() {
        return this.assignmentService.totalAssignments();
    }
    TotalAvailableProductsByType() {
        return this.medicalSuppliesService.getAccumulatedStockByType();
    }
    totalOfProductAssignmentsByType() {
        return this.assignmentService.getAccumulatedAssignmentProductsByType();
    }
    expiredProductsCount() {
        return this.medicalSuppliesExpiredService.expiredProductsCount();
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, role_decorators_1.Roles)(types_roles_1.TypesRoles.admin, types_roles_1.TypesRoles.adminRRHH, types_roles_1.TypesRoles.auditor),
    (0, common_1.Get)('totalUsers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "totalUsers", null);
__decorate([
    (0, role_decorators_1.Roles)(types_roles_1.TypesRoles.admin, types_roles_1.TypesRoles.adminRRHH, types_roles_1.TypesRoles.auditor),
    (0, common_1.Get)('totalProductsOfTheDay'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "totalProductsOfTheDay", null);
__decorate([
    (0, role_decorators_1.Roles)(types_roles_1.TypesRoles.admin, types_roles_1.TypesRoles.adminRRHH, types_roles_1.TypesRoles.auditor),
    (0, common_1.Get)('totalProductsOfMonth'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "totalProductsOfMonth", null);
__decorate([
    (0, role_decorators_1.Roles)(types_roles_1.TypesRoles.admin, types_roles_1.TypesRoles.adminRRHH, types_roles_1.TypesRoles.almacen, types_roles_1.TypesRoles.auditor),
    (0, common_1.Get)('totalAssignmentOfTheDay'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "totalAssignmentOfTheDay", null);
__decorate([
    (0, role_decorators_1.Roles)(types_roles_1.TypesRoles.admin, types_roles_1.TypesRoles.adminRRHH, types_roles_1.TypesRoles.almacen, types_roles_1.TypesRoles.auditor),
    (0, common_1.Get)('totalAssignmentOfMonth'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "totalAssignmentOfMonth", null);
__decorate([
    (0, common_1.Get)('totalAllProducts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "totalAllProducts", null);
__decorate([
    (0, common_1.Get)('totalAssignments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "totalAssignments", null);
__decorate([
    (0, role_decorators_1.Roles)(types_roles_1.TypesRoles.admin, types_roles_1.TypesRoles.adminRRHH, types_roles_1.TypesRoles.almacen),
    (0, common_1.Get)('totalAvailableProductsByType'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "TotalAvailableProductsByType", null);
__decorate([
    (0, role_decorators_1.Roles)(types_roles_1.TypesRoles.admin, types_roles_1.TypesRoles.adminRRHH, types_roles_1.TypesRoles.almacen),
    (0, common_1.Get)('totalOfProductAssignmentsByType'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "totalOfProductAssignmentsByType", null);
__decorate([
    (0, common_1.Get)('expiredProductsCount'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "expiredProductsCount", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [users_service_1.UsersService, medical_supplies_service_1.MedicalSuppliesService, assignment_service_1.AssignmentService, medical_supplies_expired_service_1.MedicalSuppliesExpiredService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map