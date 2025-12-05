"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrizzleDbConecctionModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const constants_1 = require("./constants");
const neon_http_1 = require("drizzle-orm/neon-http");
let DrizzleDbConecctionModule = class DrizzleDbConecctionModule {
};
exports.DrizzleDbConecctionModule = DrizzleDbConecctionModule;
exports.DrizzleDbConecctionModule = DrizzleDbConecctionModule = __decorate([
    (0, common_1.Module)({
        providers: [
            {
                provide: constants_1.PG_CONNECTION,
                inject: [config_1.ConfigService],
                useFactory: async (configService) => {
                    const connectionString = configService.get('DATABASE_URL');
                    const db = (0, neon_http_1.drizzle)(connectionString);
                    return db;
                },
            },
        ],
        exports: [constants_1.PG_CONNECTION],
    })
], DrizzleDbConecctionModule);
//# sourceMappingURL=db.module.js.map