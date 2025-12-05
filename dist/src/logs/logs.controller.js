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
exports.LogsController = void 0;
const common_1 = require("@nestjs/common");
const search_logs_dto_1 = require("./dto/search.logs.dto");
const logs_service_1 = require("./logs.service");
const usersesion_decorator_1 = require("../auth/strategies/usersesion.decorator");
let LogsController = class LogsController {
    constructor(logsService) {
        this.logsService = logsService;
    }
    get(body) {
        return this.logsService.getAll(body);
    }
    create(body, clienteIp, req, user) {
        const _body = {
            action: body.action,
            userId: user.sub,
            productId: null,
            ipAddress: clienteIp,
            hostname: req.headers['host']
        };
        return this.logsService.create(_body);
    }
};
exports.LogsController = LogsController;
__decorate([
    (0, common_1.Post)('getAll'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_logs_dto_1.SearchLogsDto]),
    __metadata("design:returntype", Promise)
], LogsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, usersesion_decorator_1.Usersesion)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Request, Object]),
    __metadata("design:returntype", Promise)
], LogsController.prototype, "create", null);
exports.LogsController = LogsController = __decorate([
    (0, common_1.Controller)('logs'),
    __metadata("design:paramtypes", [logs_service_1.LogsService])
], LogsController);
//# sourceMappingURL=logs.controller.js.map