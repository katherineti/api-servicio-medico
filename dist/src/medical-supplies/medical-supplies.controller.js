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
exports.MedicalSuppliesController = void 0;
const common_1 = require("@nestjs/common");
const search_products_dto_1 = require("./dto/search.products.dto");
const usersesion_decorator_1 = require("../auth/strategies/usersesion.decorator");
const medical_supplies_service_1 = require("./medical-supplies.service");
const role_decorators_1 = require("../decorators/role.decorators");
const types_roles_1 = require("../db/enums/types-roles");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const create_product_dto_1 = require("./dto/create-product.dto");
let MedicalSuppliesController = class MedicalSuppliesController {
    constructor(medicalSuppliesService) {
        this.medicalSuppliesService = medicalSuppliesService;
    }
    getProducts(body, user) {
        return this.medicalSuppliesService.getAll(body, user);
    }
    deleteProduct(id) {
        return this.medicalSuppliesService.delete(id);
    }
    async createProduct(createMedicalSupplyDto, file, user, clienteIp, req) {
        let client = {
            ip: clienteIp,
            hostname: req.headers['host']
        };
        return this.medicalSuppliesService.create(createMedicalSupplyDto, user.sub, client, file);
    }
    updateProduct(prodId, product, file) {
        return this.medicalSuppliesService.update(prodId, product, file);
    }
};
exports.MedicalSuppliesController = MedicalSuppliesController;
__decorate([
    (0, common_1.Post)('getAll'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, usersesion_decorator_1.Usersesion)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_products_dto_1.SearchProductsDto, Object]),
    __metadata("design:returntype", Promise)
], MedicalSuppliesController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MedicalSuppliesController.prototype, "deleteProduct", null);
__decorate([
    (0, role_decorators_1.Roles)(types_roles_1.TypesRoles.admin, types_roles_1.TypesRoles.adminRRHH, types_roles_1.TypesRoles.almacen),
    (0, common_1.Post)('newProduct'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('url_image', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 1024 * 1024 * 10 },
    })),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, usersesion_decorator_1.Usersesion)()),
    __param(3, (0, common_1.Ip)()),
    __param(4, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto, Object, Object, String, Request]),
    __metadata("design:returntype", Promise)
], MedicalSuppliesController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Put)(':prodId'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('url_image', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 1024 * 1024 * 10 },
    })),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Param)('prodId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_product_dto_1.CreateProductDto, Object]),
    __metadata("design:returntype", void 0)
], MedicalSuppliesController.prototype, "updateProduct", null);
exports.MedicalSuppliesController = MedicalSuppliesController = __decorate([
    (0, common_1.Controller)('medical-supplies'),
    __metadata("design:paramtypes", [medical_supplies_service_1.MedicalSuppliesService])
], MedicalSuppliesController);
//# sourceMappingURL=medical-supplies.controller.js.map