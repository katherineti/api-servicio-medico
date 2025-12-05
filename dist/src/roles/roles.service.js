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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const constants_1 = require("../constants");
const schema_1 = require("../db/schema");
const read_role_dto_1 = require("./dto/read-role-dto");
const drizzle_orm_1 = require("drizzle-orm");
let RolesService = class RolesService {
    constructor(db) {
        this.db = db;
    }
    async get(filter) {
        try {
            const buscadorLike = filter.name ? filter.name : '';
            const searchCondition = (0, drizzle_orm_1.ilike)(schema_1.rolesTable.name, `%${buscadorLike}%`);
            const rows = await this.db.select()
                .from(schema_1.rolesTable)
                .where(searchCondition)
                .orderBy(schema_1.rolesTable.id)
                .limit(filter.take)
                .offset((filter.page - 1) * filter.take);
            const [{ value: total }] = await this.db.select({ value: (0, drizzle_orm_1.count)() }).from(schema_1.rolesTable).where(searchCondition);
            const result = new read_role_dto_1.ResultGetAllRoles();
            result.total = total;
            result.page = filter.page;
            result.list = rows;
            return result;
        }
        catch (err) {
            console.error("Error en la base de datos al buscar los roles ", err);
            throw new Error("Error al obtener los roles " + err);
        }
    }
    async getRoleById(id) {
        try {
            const result = await this.db.select()
                .from(schema_1.rolesTable)
                .where((0, drizzle_orm_1.eq)(schema_1.rolesTable.id, id))
                .limit(1);
            return result[0] || null;
        }
        catch (err) {
            console.error("Error en la base de datos al buscar el rol " + id + ": ", err);
            throw new Error("Error al obtener el rol " + id + " " + err);
        }
    }
    async create(newRole) {
        newRole.name = newRole.name.toLowerCase();
        try {
            await this.db.insert(schema_1.rolesTable).values(newRole);
        }
        catch (err) {
            throw new Error("Error al crear un rol " + err);
        }
    }
    async update(id, roleDto) {
        const Role = await this.getRoleById(id);
        if (!Role) {
            throw new common_1.NotFoundException('El rol no existe');
        }
        const updateData = {
            name: roleDto.name ? roleDto.name.toLowerCase() : '',
            description: roleDto.description,
            isActivate: roleDto.isActivate
        };
        const updated = await this.db
            .update(schema_1.rolesTable)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema_1.rolesTable.id, id));
        return updated[0];
    }
    async delete(id) {
        const rol = await this.getRoleById(id);
        if (!rol) {
            throw new common_1.NotFoundException('El rol no existe');
        }
        const updateData = {
            isActivate: false,
        };
        await this.db
            .update(schema_1.rolesTable)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema_1.rolesTable.id, id));
        return await this.getRoleById(id);
    }
    async getRoles_Actives() {
        try {
            const rows = await this.db.select({
                id: schema_1.rolesTable.id,
                name: schema_1.rolesTable.name
            }).from(schema_1.rolesTable).where((0, drizzle_orm_1.eq)(schema_1.rolesTable.isActivate, true));
            return rows;
        }
        catch (err) {
            console.error("Error en la base de datos al buscar los roles activos ", err);
            throw new Error("Error al obtener los roles activos" + err);
        }
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase])
], RolesService);
//# sourceMappingURL=roles.service.js.map