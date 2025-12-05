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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const constants_1 = require("../constants");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const argon2 = __importStar(require("argon2"));
const read_user_dto_1 = require("./dto/read-user-dto");
const schema_2 = require("../db/schema");
let UsersService = UsersService_1 = class UsersService {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(UsersService_1.name);
    }
    async findOnByEmail(email) {
        const result = await this.db.select({
            id: schema_1.usersTable.id,
            email: schema_1.usersTable.email,
            name: schema_1.usersTable.name,
            password: schema_1.usersTable.password,
            isActivate: schema_1.usersTable.isActivate,
            role: schema_2.rolesTable.name,
        })
            .from(schema_1.usersTable)
            .leftJoin(schema_2.rolesTable, (0, drizzle_orm_1.eq)(schema_1.usersTable.role, schema_2.rolesTable.id))
            .where((0, drizzle_orm_1.eq)(schema_1.usersTable.email, email))
            .limit(1);
        return result[0];
    }
    async findOnByCedula(cedulaUser) {
        const result = await this.db.select({
            id: schema_1.usersTable.id,
            email: schema_1.usersTable.email,
            name: schema_1.usersTable.name,
            password: schema_1.usersTable.password,
            isActivate: schema_1.usersTable.isActivate,
            role: schema_2.rolesTable.name,
        })
            .from(schema_1.usersTable)
            .leftJoin(schema_2.rolesTable, (0, drizzle_orm_1.eq)(schema_1.usersTable.role, schema_2.rolesTable.id))
            .where((0, drizzle_orm_1.ilike)(schema_1.usersTable.cedula, `%${cedulaUser}%`))
            .limit(1);
        return result[0];
    }
    async getUserbyId(id) {
        try {
            const result = await this.db.select({
                id: schema_1.usersTable.id,
                name: schema_1.usersTable.name,
                email: schema_1.usersTable.email,
                role: schema_2.rolesTable.name,
                isActivate: schema_1.usersTable.isActivate
            })
                .from(schema_1.usersTable)
                .leftJoin(schema_2.rolesTable, (0, drizzle_orm_1.eq)(schema_1.usersTable.id, schema_2.rolesTable.id))
                .where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, id))
                .limit(1);
            return result[0] || null;
        }
        catch (err) {
            console.error("Error en la base de datos al buscar el usuario " + id + ": ", err);
            throw new Error("Error al obtener el usuario " + id + " " + err);
        }
    }
    async createUser(createUser) {
        try {
            const hash = await argon2.hash(createUser.password);
            const newUser = {
                ...createUser,
                password: hash,
                isActivate: true,
            };
            await this.db.insert(schema_1.usersTable).values(newUser);
        }
        catch (err) {
            throw new Error("Error al crear un usuario " + err);
        }
    }
    async update(id, user) {
        const User = await this.getUserbyId(id);
        if (!User) {
            throw new common_1.NotFoundException('La usuario no existe');
        }
        const updateData = {
            name: user.name,
            role: user.role,
            isActivate: user.isActivate,
            updatedAt: new Date()
        };
        const updatedUser = await this.db
            .update(schema_1.usersTable)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, id));
        return updatedUser[0];
    }
    async delete(id) {
        const user = await this.getUserbyId(id);
        if (!user) {
            throw new common_1.NotFoundException('La usuario no existe');
        }
        const updateData = {
            isActivate: false,
            updatedAt: new Date()
        };
        await this.db
            .update(schema_1.usersTable)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, id));
        return await this.getUserbyId(id);
    }
    async getAll(filter, user) {
        const buscadorLike = filter.name ? filter.name : '';
        const whereConditions = [];
        if (true) {
            whereConditions.push((0, drizzle_orm_1.ilike)(schema_1.usersTable.name, `%${buscadorLike}%`));
        }
        if (filter.cedula) {
            whereConditions.push((0, drizzle_orm_1.ilike)(schema_1.usersTable.cedula, `%${filter.cedula}%`));
        }
        const whereClause = whereConditions.length > 0 ? (0, drizzle_orm_1.and)(...whereConditions) : undefined;
        const rows = await this.db.select({
            id: schema_1.usersTable.id,
            name: schema_1.usersTable.name,
            email: schema_1.usersTable.email,
            isActivate: schema_1.usersTable.isActivate,
            createdAt: schema_1.usersTable.createdAt,
            updatedAt: schema_1.usersTable.updatedAt,
            role: schema_2.rolesTable.name,
            roleId: schema_2.rolesTable.id,
            cedula: schema_1.usersTable.cedula,
        })
            .from(schema_1.usersTable)
            .leftJoin(schema_2.rolesTable, (0, drizzle_orm_1.eq)(schema_1.usersTable.role, schema_2.rolesTable.id))
            .where(whereClause)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.usersTable.id))
            .limit(filter.take)
            .offset((filter.page - 1) * filter.take);
        const [{ value: total }] = await this.db.select({ value: (0, drizzle_orm_1.count)() }).from(schema_1.usersTable).where(whereClause);
        const result = new read_user_dto_1.ResultGetAll();
        result.total = total;
        result.page = filter.page;
        result.list = rows;
        return result;
    }
    async validarAdmin(email) {
        try {
            const userExists = await this.db.select({
                isActivate: schema_1.usersTable.isActivate,
            })
                .from(schema_1.usersTable)
                .where((0, drizzle_orm_1.eq)(schema_1.usersTable.email, email))
                .limit(1);
            if (userExists) {
                return userExists[0];
            }
            else {
                return null;
            }
        }
        catch (error) {
            this.logger.error("Error al buscar el administrador: ", error);
            throw error;
        }
    }
    async getUsersbyRol(id) {
        try {
            const result = await this.db.select({
                id: schema_1.usersTable.id,
                name: schema_1.usersTable.name,
                cedula: schema_1.usersTable.cedula,
                email: schema_1.usersTable.email,
                role: schema_2.rolesTable.name,
                isActivate: schema_1.usersTable.isActivate
            })
                .from(schema_1.usersTable)
                .leftJoin(schema_2.rolesTable, (0, drizzle_orm_1.eq)(schema_1.usersTable.id, schema_2.rolesTable.id))
                .where((0, drizzle_orm_1.eq)(schema_1.usersTable.role, id));
            return result || null;
        }
        catch (err) {
            console.error("Error en la base de datos al buscar el usuario por rol" + id + ": ", err);
            throw new Error("Error al obtener el usuario por rol" + id + " " + err);
        }
    }
    async countAllUsers() {
        const now = new Date();
        const nowUtc = new Date(now.toISOString());
        const currentYear = nowUtc.getUTCFullYear();
        const startOfYear = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0));
        const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));
        const [result] = await this.db.select({ count: (0, drizzle_orm_1.count)() })
            .from(schema_1.usersTable)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.usersTable.createdAt, startOfYear), (0, drizzle_orm_1.lte)(schema_1.usersTable.createdAt, endOfYear)));
        return result ? result : { count: 0 };
    }
    async totalUsersOfTheDay() {
        const nowCaracas = new Date();
        const startOfDayCaracas = new Date(nowCaracas);
        startOfDayCaracas.setHours(0, 0, 0, 0);
        const endOfDayCaracas = new Date(nowCaracas);
        endOfDayCaracas.setHours(23, 59, 59, 999);
        const [result] = await this.db
            .select({ count: (0, drizzle_orm_1.count)() })
            .from(schema_1.usersTable)
            .where((0, drizzle_orm_1.sql) `${schema_1.usersTable.createdAt} >= ${startOfDayCaracas.toISOString()} AND ${schema_1.usersTable.createdAt} <= ${endOfDayCaracas.toISOString()}`);
        return result || { count: 0 };
    }
    async totalUsersOfMonth() {
        const nowCaracas = new Date();
        const year = nowCaracas.getFullYear();
        const month = nowCaracas.getMonth();
        const startOfMonthCaracas = new Date(year, month, 1, 0, 0, 0, 0);
        const endOfMonthCaracas = new Date(year, month + 1, 0, 23, 59, 59, 999);
        const [result] = await this.db
            .select({ count: (0, drizzle_orm_1.count)() })
            .from(schema_1.usersTable)
            .where((0, drizzle_orm_1.sql) `${schema_1.usersTable.createdAt} >= ${startOfMonthCaracas.toISOString()} AND ${schema_1.usersTable.createdAt} <= ${endOfMonthCaracas.toISOString()}`);
        return result || { count: 0 };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase])
], UsersService);
//# sourceMappingURL=users.service.js.map