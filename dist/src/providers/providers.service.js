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
var ProvidersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvidersService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const constants_1 = require("../constants");
const schema_1 = require("../db/schema");
const read_providers_dto_1 = require("./dto/read-providers-dto");
let ProvidersService = ProvidersService_1 = class ProvidersService {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(ProvidersService_1.name);
    }
    async getByEmail(email) {
        try {
            const result = await this.db.select()
                .from(schema_1.providersTable)
                .where((0, drizzle_orm_1.eq)(schema_1.providersTable.email, email))
                .limit(1);
            return result[0] || null;
        }
        catch (err) {
            console.error("Error en la base de datos al buscar el proveedor con el email " + email + ": ", err);
            throw new Error("Error al obtener el proveedor con el email " + email + " " + err);
        }
    }
    async getByName(name) {
        try {
            const result = await this.db.select()
                .from(schema_1.providersTable)
                .where((0, drizzle_orm_1.eq)((0, drizzle_orm_1.sql) `lower(${schema_1.providersTable.name})`, name.toLowerCase()))
                .limit(1);
            return result[0] || null;
        }
        catch (err) {
            console.error("Error en la base de datos al buscar el proveedor con el nombre " + name + ": ", err);
            throw new Error("Error al obtener el proveedor con el nombre " + name + " " + err);
        }
    }
    async getAll() {
        const rows = await this.db.select()
            .from(schema_1.providersTable)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.providersTable.id));
        const [{ value: total }] = await this.db.select({ value: (0, drizzle_orm_1.count)() })
            .from(schema_1.providersTable);
        const result = new read_providers_dto_1.ProvidersGetAll();
        result.total = total;
        result.list = rows;
        this.logger.log(`Resultado de proveedores: ${JSON.stringify(result)}`);
        return result;
    }
    async create(createProvider) {
        const emailExist = await this.getByEmail(createProvider.email);
        if (emailExist) {
            throw new common_1.ConflictException('El correo del proveedor ya existe.');
        }
        const nameExist = await this.getByName(createProvider.name);
        if (nameExist) {
            throw new common_1.ConflictException('El nombre del proveedor ya existe.');
        }
        try {
            console.log("createProvider", createProvider);
            const [result] = await this.db.insert(schema_1.providersTable).values(createProvider).returning();
            this.logger.log(`Proveedor creado: ${JSON.stringify(result)}`);
            return result;
        }
        catch (error) {
            console.error('Error al insertar un proveedor en la base de datos', error);
            return { error: 'Error al insertar un proveedor en la base de datos' };
        }
    }
};
exports.ProvidersService = ProvidersService;
exports.ProvidersService = ProvidersService = ProvidersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase])
], ProvidersService);
//# sourceMappingURL=providers.service.js.map