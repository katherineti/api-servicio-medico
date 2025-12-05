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
var MedicalSuppliesExpiredService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalSuppliesExpiredService = void 0;
const common_1 = require("@nestjs/common");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const constants_1 = require("../constants");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const products_expired_dto_1 = require("./dto/products-expired-dto");
let MedicalSuppliesExpiredService = MedicalSuppliesExpiredService_1 = class MedicalSuppliesExpiredService {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(MedicalSuppliesExpiredService_1.name);
    }
    async getAll(filter) {
        const whereConditions = [];
        if (filter.name) {
            whereConditions.push((0, drizzle_orm_1.ilike)(schema_1.productsTable.name, `%${filter.name}%`));
        }
        if (filter.category) {
            whereConditions.push((0, drizzle_orm_1.ilike)(schema_1.categoriesTable.name, `%${filter.category}%`));
        }
        if (filter.expirationDate) {
            const datePart = filter.expirationDate.toString().split('T')[0];
            whereConditions.push((0, drizzle_orm_1.eq)(schema_1.productsTable.expirationDate, datePart));
        }
        whereConditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.productsTable.statusId, 3), (0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.productsTable.expirationDate), (0, drizzle_orm_1.sql) `(${schema_1.productsTable.expirationDate} - CURRENT_DATE) < 90`)), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.productsTable.statusId, 4), (0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.productsTable.expirationDate), (0, drizzle_orm_1.sql) `${schema_1.productsTable.expirationDate} <= CURRENT_DATE`))));
        const whereClause = whereConditions.length > 0 ? (0, drizzle_orm_1.and)(...whereConditions) : undefined;
        const rows = await this.db.select({
            id: schema_1.productsTable.id,
            url_image: schema_1.productsTable.url_image,
            description: schema_1.productsTable.description,
            code: schema_1.productsTable.code,
            stock: schema_1.productsTable.stock,
            name: schema_1.productsTable.name,
            providerId: schema_1.providersTable.id, provider: schema_1.providersTable.name,
            type: schema_1.productsTable.type,
            expirationDate: (0, drizzle_orm_1.sql) `TO_CHAR(${schema_1.productsTable.expirationDate}, 'YYYY-MM-DD')`,
            createdAt: schema_1.productsTable.createdAt,
            updatedAt: schema_1.productsTable.updatedAt,
            categoryId: schema_1.categoriesTable.id,
            category: schema_1.categoriesTable.name,
            statusId: schema_1.productsTable.statusId,
            status: schema_1.productStatusTable.status,
            isExpired: (0, drizzle_orm_1.sql) `
            CASE
                WHEN ${schema_1.productsTable.statusId} = 4 THEN TRUE
                WHEN ${schema_1.productsTable.expirationDate} IS NOT NULL 
                    AND ${schema_1.productsTable.expirationDate} <= CURRENT_DATE 
                THEN TRUE
                ELSE FALSE
            END
        `
        })
            .from(schema_1.productsTable)
            .leftJoin(schema_1.categoriesTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.categoryId, schema_1.categoriesTable.id))
            .leftJoin(schema_1.productStatusTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.statusId, schema_1.productStatusTable.id))
            .leftJoin(schema_1.providersTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.providerId, schema_1.providersTable.id))
            .where(whereClause)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.productsTable.id))
            .limit(filter.take)
            .offset((filter.page - 1) * filter.take);
        const [{ value: total }] = await this.db.select({ value: (0, drizzle_orm_1.count)() })
            .from(schema_1.productsTable)
            .leftJoin(schema_1.categoriesTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.categoryId, schema_1.categoriesTable.id))
            .where(whereClause);
        const result = new products_expired_dto_1.ProductsExpiredGetAll();
        result.total = total;
        result.page = filter.page;
        result.list = rows;
        this.logger.debug(`Resultado de productos prox a vencer y caducados: ${JSON.stringify(result)}`);
        return result;
    }
    async getbyId(id) {
        try {
            const result = await this.db.select({
                id: schema_1.productsTable.id,
                url_image: schema_1.productsTable.url_image,
                description: schema_1.productsTable.description,
                code: schema_1.productsTable.code,
                stock: schema_1.productsTable.stock,
                name: schema_1.productsTable.name,
                type: schema_1.productsTable.type,
                createdAt: schema_1.productsTable.createdAt,
                updatedAt: schema_1.productsTable.updatedAt,
                categoryId: schema_1.categoriesTable.id,
                category: schema_1.categoriesTable.name,
                statusId: schema_1.productsTable.statusId,
            })
                .from(schema_1.productsTable)
                .leftJoin(schema_1.categoriesTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.categoryId, schema_1.categoriesTable.id))
                .where((0, drizzle_orm_1.eq)(schema_1.productsTable.id, id))
                .limit(1);
            return result[0] || null;
        }
        catch (err) {
            console.error("Error en la base de datos al buscar el producto " + id + ": ", err);
            throw new Error("Error al obtener el producto " + id + " " + err);
        }
    }
    async expiredProductsCount() {
        const [{ value: total }] = await this.db.select({ value: (0, drizzle_orm_1.count)() })
            .from(schema_1.productsTable)
            .leftJoin(schema_1.categoriesTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.categoryId, schema_1.categoriesTable.id))
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.productsTable.statusId, 3), (0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.productsTable.expirationDate), (0, drizzle_orm_1.sql) `(${schema_1.productsTable.expirationDate} - CURRENT_DATE) < 90`)), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.productsTable.statusId, 4), (0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.productsTable.expirationDate), (0, drizzle_orm_1.sql) `${schema_1.productsTable.expirationDate} <= CURRENT_DATE`))));
        this.logger.debug(`Número de productos proximos a vencer y caducados: ${total}`);
        return total;
    }
};
exports.MedicalSuppliesExpiredService = MedicalSuppliesExpiredService;
exports.MedicalSuppliesExpiredService = MedicalSuppliesExpiredService = MedicalSuppliesExpiredService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase])
], MedicalSuppliesExpiredService);
//# sourceMappingURL=medical-supplies-expired.service.js.map