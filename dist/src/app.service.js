"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("./constants");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const schema_1 = require("./db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const argon2 = __importStar(require("argon2"));
let AppService = class AppService {
    constructor(conn) {
        this.conn = conn;
    }
    async getUsers() {
        try {
            const result = await this.conn
                .select({
                id: schema_1.usersTable.id,
                nombre: schema_1.usersTable.name,
                role: schema_1.usersTable.role,
            })
                .from(schema_1.usersTable);
            return result;
        }
        catch (err) {
            console.error("Error al obtener usuarios:", err);
            throw new Error("Error al obtener usuarios");
        }
    }
    async getUserbyId(id) {
        try {
            const result = await this.conn.select()
                .from(schema_1.usersTable)
                .where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, id));
            return result[0] || null;
        }
        catch (err) {
            console.error("Error en la base de datos al buscar el usuario:", err);
            throw new Error("Error al obtener el usuario " + err);
        }
    }
    async createUser(createUser) {
        try {
            const hash = await argon2.hash(createUser.password);
            this.conn.select().from(schema_1.usersTable);
            const newUser = {
                ...createUser,
                roles_id: 1,
            };
        }
        catch (err) {
            throw new Error("Error al crear un usuario " + err);
        }
        return "Usuario registrado";
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase])
], AppService);
//# sourceMappingURL=app.service.js.map