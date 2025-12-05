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
exports.ExportController = void 0;
const common_1 = require("@nestjs/common");
const excel_export_users_service_1 = require("./excel-export-users.service");
let ExportController = class ExportController {
    constructor(exportUsersService) {
        this.exportUsersService = exportUsersService;
    }
    async exportUsers(exportDto, res) {
        try {
            const buffer = await this.exportUsersService.exportUsers(exportDto.format || "xlsx", exportDto.role || "all", exportDto.name || "", exportDto.cedula || "");
            const timestamp = new Date().toISOString().split("T")[0];
            const fileName = exportDto.format === "xlsx" ? `Usuarios_${timestamp}.xlsx` : `Usuarios_${timestamp}.csv`;
            const contentType = exportDto.format === "xlsx"
                ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                : "text/csv; charset=utf-8";
            res.setHeader("Content-Type", contentType);
            res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
            res.setHeader("Content-Length", buffer.length);
            res.end(buffer);
        }
        catch (error) {
            console.error("Error al generar o enviar el archivo:", error);
            if (!res.headersSent) {
                res.status(500).send({
                    statusCode: 500,
                    message: "Error interno del servidor al generar el archivo.",
                });
            }
            return;
        }
    }
};
exports.ExportController = ExportController;
__decorate([
    (0, common_1.Header)('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)("/download"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "exportUsers", null);
exports.ExportController = ExportController = __decorate([
    (0, common_1.Controller)("excel"),
    __metadata("design:paramtypes", [excel_export_users_service_1.ExportUsersService])
], ExportController);
//# sourceMappingURL=excel-export.controller.js.map