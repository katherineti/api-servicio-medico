"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const users_module_1 = require("../users/users.module");
const db_module_1 = require("../db.module");
const jwt_1 = require("@nestjs/jwt");
const constants_1 = require("../constants");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const passport_1 = require("@nestjs/passport");
const logs_module_1 = require("../logs/logs.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            db_module_1.DrizzleDbConecctionModule,
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
            logs_module_1.LogsModule,
            passport_1.PassportModule.register({
                defaultStrategy: 'jwt',
            }),
            jwt_1.JwtModule.register({
                global: true,
                secret: constants_1.jwtConstants.secret,
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy],
        exports: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy, passport_1.PassportModule]
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map