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
exports.RolesController = void 0;
const common_1 = require("@nestjs/common");
const roles_service_1 = require("./roles.service");
const role_decorators_1 = require("../decorators/role.decorators");
const types_roles_1 = require("../db/enums/types-roles");
const search_roles_dto_1 = require("./dto/search.roles.dto");
const role_dto_1 = require("./dto/role.dto");
let RolesController = class RolesController {
    constructor(rolesService) {
        this.rolesService = rolesService;
    }
    get(body) {
        return this.rolesService.get(body);
    }
    async create(body) {
        return this.rolesService.create(body);
    }
    update(id, role) {
        return this.rolesService.update(id, role);
    }
    delete(id) {
        return this.rolesService.delete(id);
    }
    getActives() {
        return this.rolesService.getRoles_Actives();
    }
};
exports.RolesController = RolesController;
__decorate([
    (0, role_decorators_1.Roles)(types_roles_1.TypesRoles.admin, types_roles_1.TypesRoles.adminRRHH, types_roles_1.TypesRoles.auditor),
    (0, common_1.Post)('getAll'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_roles_dto_1.SearchRolesDto]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "get", null);
__decorate([
    (0, common_1.Post)('/create'),
    (0, role_decorators_1.Roles)(types_roles_1.TypesRoles.admin, types_roles_1.TypesRoles.adminRRHH),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [role_dto_1.RoleDto]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, role_decorators_1.Roles)(types_roles_1.TypesRoles.admin, types_roles_1.TypesRoles.adminRRHH),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, role_dto_1.RoleDto]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "update", null);
__decorate([
    (0, role_decorators_1.Roles)(types_roles_1.TypesRoles.admin, types_roles_1.TypesRoles.adminRRHH),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)('getRolesActives'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "getActives", null);
exports.RolesController = RolesController = __decorate([
    (0, common_1.Controller)('roles'),
    __metadata("design:paramtypes", [roles_service_1.RolesService])
], RolesController);
//# sourceMappingURL=roles.controller.js.map