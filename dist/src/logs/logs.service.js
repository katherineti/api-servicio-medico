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
exports.LogsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const constants_1 = require("../constants");
const schema_1 = require("../db/schema");
const read_logs_dto_1 = require("./dto/read-logs-dto");
let LogsService = class LogsService {
    constructor(db) {
        this.db = db;
    }
    async getAll(filter) {
        const whereConditions = [];
        if (filter.name_user) {
            whereConditions.push((0, drizzle_orm_1.ilike)(schema_1.usersTable.name, `%${filter.name_user}%`));
        }
        if (filter.createdAt) {
            const startOfDay = new Date(filter.createdAt);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(filter.createdAt);
            endOfDay.setHours(23, 59, 59, 999);
            whereConditions.push((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.logsTable.createdAt, startOfDay), (0, drizzle_orm_1.lte)(schema_1.logsTable.createdAt, endOfDay)));
        }
        const whereClause = whereConditions.length > 0 ? (0, drizzle_orm_1.and)(...whereConditions) : undefined;
        const rows = await this.db.select({
            id: schema_1.logsTable.id,
            userId: schema_1.logsTable.userId,
            userName: schema_1.usersTable.name,
            productId: schema_1.logsTable.productId,
            productName: schema_1.productsTable.name,
            action: schema_1.logsTable.action,
            ipAddress: schema_1.logsTable.ipAddress,
            hostname: schema_1.logsTable.hostname,
            createdAt: schema_1.logsTable.createdAt,
        })
            .from(schema_1.logsTable)
            .leftJoin(schema_1.usersTable, (0, drizzle_orm_1.eq)(schema_1.logsTable.userId, schema_1.usersTable.id))
            .leftJoin(schema_1.productsTable, (0, drizzle_orm_1.eq)(schema_1.logsTable.productId, schema_1.productsTable.id))
            .where(whereClause)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.logsTable.createdAt))
            .limit(filter.take)
            .offset((filter.page - 1) * filter.take);
        const [{ value: total }] = await this.db.
            select({ value: (0, drizzle_orm_1.count)() }).from(schema_1.logsTable)
            .leftJoin(schema_1.usersTable, (0, drizzle_orm_1.eq)(schema_1.logsTable.userId, schema_1.usersTable.id))
            .leftJoin(schema_1.productsTable, (0, drizzle_orm_1.eq)(schema_1.logsTable.productId, schema_1.productsTable.id))
            .where(whereClause);
        const result = new read_logs_dto_1.ResultGetAllLogs();
        result.total = total;
        result.page = filter.page;
        result.list = rows;
        return result;
    }
    async create(body) {
        try {
            let createLog = {
                userId: body.userId,
                action: body.action,
                ipAddress: body.ipAddress,
                hostname: body.hostname,
                productId: body.productId,
            };
            await this.db.insert(schema_1.logsTable).values(createLog);
            common_1.Logger.debug("Log ", JSON.stringify(createLog));
        }
        catch (err) {
            throw new Error("Error al registrar el log " + err);
        }
    }
};
exports.LogsService = LogsService;
exports.LogsService = LogsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase])
], LogsService);
//# sourceMappingURL=logs.service.js.map