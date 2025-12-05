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
var MedicalSuppliesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalSuppliesService = void 0;
const common_1 = require("@nestjs/common");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const constants_1 = require("../constants");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const read_products_dto_1 = require("./dto/read-products-dto");
const fs_1 = require("fs");
const path_1 = require("path");
const categories_service_1 = require("../categories/categories.service");
const logs_service_1 = require("../logs/logs.service");
let MedicalSuppliesService = MedicalSuppliesService_1 = class MedicalSuppliesService {
    constructor(db, categoriesService, logsService) {
        this.db = db;
        this.categoriesService = categoriesService;
        this.logsService = logsService;
        this.logger = new common_1.Logger(MedicalSuppliesService_1.name);
    }
    async getProductbyId(id) {
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
    async getProductbyCode(code) {
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
                .where((0, drizzle_orm_1.eq)(schema_1.productsTable.code, code))
                .limit(1);
            return result[0] || null;
        }
        catch (err) {
            console.error("Error en la base de datos al buscar el producto por el codigo" + code + ": ", err);
            throw new Error("Error al obtener el producto por el codigo" + code + " " + err);
        }
    }
    async getAll(filter, usersesion) {
        const whereConditions = [];
        const ROL_ADMIN = 'admin';
        const ROL_ADMIN_RRHH = 'admin RRHH';
        const ROL_ALMACEN = 'almacen';
        const TYPE_ID_UNIFORME = constants_1.PRODUCT_TYPE_UNIFORMES;
        const IS_ADMIN = usersesion.role === ROL_ADMIN;
        const IS_RRHH_ADMIN = usersesion.role === ROL_ADMIN_RRHH;
        const IS_ALMACEN = usersesion.role === ROL_ALMACEN;
        console.log("IS_ADMIN", IS_ADMIN);
        console.log("IS_RRHH_ADMIN", IS_RRHH_ADMIN);
        console.log("IS_ALMACEN", IS_ALMACEN);
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
        whereConditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.productsTable.statusId, 1), (0, drizzle_orm_1.eq)(schema_1.productsTable.statusId, 3)));
        if (!(IS_ADMIN || IS_RRHH_ADMIN || IS_ALMACEN)) {
            whereConditions.push((0, drizzle_orm_1.ne)(schema_1.productsTable.type, TYPE_ID_UNIFORME));
        }
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
            status: schema_1.productStatusTable.status
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
        const result = new read_products_dto_1.ProductsGetAll();
        result.total = total;
        result.page = filter.page;
        result.list = rows;
        return result;
    }
    async create(createMedicalSupplyDto, userId, customerAccessPoint, file) {
        let imageUrl = null;
        let category;
        const existCodeMedicalSupply = await this.getProductbyCode(createMedicalSupplyDto.code);
        if (existCodeMedicalSupply) {
            throw new common_1.NotFoundException('El código del insumo médico ya existe.');
        }
        if (file) {
            category = await this.categoriesService.getById(Number(createMedicalSupplyDto.category));
            const categoryWithoutSpaces = this.removesSpacesInString(category.name);
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);
            const filename = `product_${timestamp}_${randomString}_${file.originalname}`;
            const uploadDir = (0, path_1.join)(process.cwd(), 'uploads/' + categoryWithoutSpaces);
            this.logger.log("Ruta estatica donde se guarda la imagen del insumo medicos/inventario almacen creado", uploadDir);
            const imagePath = (0, path_1.join)(uploadDir, filename);
            imageUrl = `/${categoryWithoutSpaces}/${filename}`;
            this.logger.log("Archivo", JSON.stringify(file));
            try {
                await fs_1.promises.mkdir(uploadDir, { recursive: true });
                console.log(imagePath, file.buffer);
                await fs_1.promises.writeFile(imagePath, file.buffer);
            }
            catch (error) {
                console.error('Error al guardar la imagen', error);
                return { id: Date.now(), ...createMedicalSupplyDto, url_image: null, error: 'Error al guardar la imagen' };
            }
        }
        try {
            let obj = {
                name: createMedicalSupplyDto.name,
                description: createMedicalSupplyDto.description,
                categoryId: Number(createMedicalSupplyDto.category),
                type: Number(createMedicalSupplyDto.type),
                stock: Number(createMedicalSupplyDto.stock),
                code: createMedicalSupplyDto.code,
                url_image: imageUrl,
                statusId: Number(createMedicalSupplyDto.status),
                providerId: Number(createMedicalSupplyDto.providerId)
            };
            if (createMedicalSupplyDto.expirationDate && obj.type != 2 && obj.type != 3) {
                const fechaStringToDate = new Date(createMedicalSupplyDto.expirationDate);
                const expirationDateString = fechaStringToDate.toISOString().split('T')[0];
                obj['expirationDate'] = createMedicalSupplyDto.expirationDate ? expirationDateString : null;
            }
            const [newMedicalSupply] = await this.db.insert(schema_1.productsTable).values(obj).returning();
            this.logsService.create({
                action: 'Insumo médico agregado',
                userId: userId,
                productId: newMedicalSupply.id,
                ipAddress: customerAccessPoint.ip,
                hostname: customerAccessPoint.hostname
            });
            return newMedicalSupply;
        }
        catch (error) {
            console.error('Error al insertar en la base de datos', error);
            return { error: 'Error al insertar en la base de datos' };
        }
    }
    async update(id, updateMedicalSupplyDto, file) {
        this.logger.log("updateMedicalSupplyDto", updateMedicalSupplyDto);
        let imageUrl = null;
        let category;
        const prod = await this.getProductbyId(id);
        if (!prod) {
            throw new common_1.NotFoundException('El producto no existe.');
        }
        if (prod.url_image) {
            imageUrl = prod.url_image;
        }
        const existCodeMedicalSupply = updateMedicalSupplyDto.code === prod.code ? true : false;
        if (existCodeMedicalSupply) {
            throw new common_1.NotFoundException('El código del insumo médico ya existe');
        }
        if (file) {
            category = await this.categoriesService.getById(Number(updateMedicalSupplyDto.category));
            const categoryWithoutSpaces = this.removesSpacesInString(category.name);
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);
            const filename = `product_${timestamp}_${randomString}_${file.originalname}`;
            const uploadDir = (0, path_1.join)(process.cwd(), 'uploads/' + categoryWithoutSpaces);
            ;
            this.logger.log("Ruta estatica donde se guarda la imagen del insumo medicos/inventario almacen actualizado", uploadDir);
            const imagePath = (0, path_1.join)(uploadDir, filename);
            imageUrl = `/${categoryWithoutSpaces}/${filename}`;
            this.logger.log("Archivo", JSON.stringify(file));
            try {
                await fs_1.promises.mkdir(uploadDir, { recursive: true });
                console.log(imagePath, file.buffer);
                await fs_1.promises.writeFile(imagePath, file.buffer);
            }
            catch (error) {
                console.error('Error al guardar la imagen', error);
                return { id: Date.now(), ...updateMedicalSupplyDto, url_image: null, error: 'Error al guardar la imagen' };
            }
        }
        if (updateMedicalSupplyDto.url_image === "null") {
            imageUrl = null;
        }
        try {
            const updateData = {
                name: updateMedicalSupplyDto.name,
                description: updateMedicalSupplyDto.description,
                categoryId: Number(updateMedicalSupplyDto.category),
                type: Number(updateMedicalSupplyDto.type),
                stock: Number(updateMedicalSupplyDto.stock),
                statusId: Number(updateMedicalSupplyDto.status),
                updatedAt: new Date(),
                url_image: imageUrl,
                providerId: Number(updateMedicalSupplyDto.providerId)
            };
            if (updateMedicalSupplyDto.expirationDate && updateData.type != 2 && updateData.type != 3) {
                const fechaStringToDate = new Date(updateMedicalSupplyDto.expirationDate);
                const expirationDateString = fechaStringToDate.toISOString().split('T')[0];
                updateData['expirationDate'] = updateMedicalSupplyDto.expirationDate ? expirationDateString : null;
            }
            if (updateMedicalSupplyDto.expirationDate === 'null') {
                updateData['expirationDate'] = null;
            }
            this.logger.log("updateData ", updateData);
            const updated = await this.db
                .update(schema_1.productsTable)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.productsTable.id, id));
            return updated[0];
            this.logger.log("updated[0] ", updated[0]);
        }
        catch (error) {
            console.error('Error al actualizar el registro', error);
            return { error: 'Error al actualizar el registro' };
        }
    }
    async delete(id) {
        const prod = await this.getProductbyId(id);
        if (!prod) {
            throw new common_1.NotFoundException('La usuario no existe');
        }
        const updateData = {
            statusId: constants_1.PRODUCT_STATUS_INACTIVO,
            updatedAt: new Date()
        };
        await this.db
            .update(schema_1.productsTable)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema_1.productsTable.id, id));
        return await this.getProductbyId(id);
    }
    removesSpacesInString(texto) {
        return texto.replace(/\s+/g, '_');
    }
    async totalProductsOfTheDay() {
        const nowCaracas = new Date();
        const startOfDayCaracas = new Date(nowCaracas);
        startOfDayCaracas.setHours(0, 0, 0, 0);
        const endOfDayCaracas = new Date(nowCaracas);
        endOfDayCaracas.setHours(23, 59, 59, 999);
        const [result] = await this.db
            .select({ count: (0, drizzle_orm_1.count)() })
            .from(schema_1.productsTable)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `${schema_1.productsTable.createdAt} >= ${startOfDayCaracas.toISOString()} AND ${schema_1.productsTable.createdAt} <= ${endOfDayCaracas.toISOString()}`, (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4])));
        return result || { count: 0 };
    }
    async totalProductsOfMonth() {
        const now = new Date();
        const nowUtc = new Date(now.toISOString());
        const currentYear = nowUtc.getUTCFullYear();
        const currentMonth = nowUtc.getUTCMonth();
        const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0, 0));
        const endOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999));
        const [result] = await this.db
            .select({ count: (0, drizzle_orm_1.count)() })
            .from(schema_1.productsTable)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.productsTable.createdAt, startOfMonth), (0, drizzle_orm_1.lte)(schema_1.productsTable.createdAt, endOfMonth)), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4])));
        return result || { count: 0 };
    }
    async countAllProducts() {
        const [result] = await this.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.productsTable).where((0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4]));
        return result ? result : { count: 0 };
    }
    async getAccumulatedStockByType() {
        const dateRanges = this.calculateCurrentMonthRange();
        const result = await this.db
            .select({
            sum_medicamentos: (0, drizzle_orm_1.sum)((0, drizzle_orm_1.sql) `CASE WHEN ${schema_1.productsTable.type} = 1 THEN ${schema_1.productsTable.stock} ELSE 0 END`).as('sum_medicamentos'),
            sum_uniformes: (0, drizzle_orm_1.sum)((0, drizzle_orm_1.sql) `CASE WHEN ${schema_1.productsTable.type} = 2 THEN ${schema_1.productsTable.stock} ELSE 0 END`).as('sum_uniformes'),
            'sum_equiposOdontologicos': (0, drizzle_orm_1.sum)((0, drizzle_orm_1.sql) `CASE WHEN ${schema_1.productsTable.type} = 3 THEN ${schema_1.productsTable.stock} ELSE 0 END`).as('sum_equiposOdontologicos'),
        })
            .from(schema_1.productsTable)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `${schema_1.productsTable.type} IN (1, 2, 3)`, (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.productsTable.statusId, 1), (0, drizzle_orm_1.eq)(schema_1.productsTable.statusId, 3)), (0, drizzle_orm_1.gte)(schema_1.productsTable.createdAt, dateRanges.startOfMonth), (0, drizzle_orm_1.lte)(schema_1.productsTable.createdAt, dateRanges.endOfMonth)));
        const data = result[0];
        const finalResult = {
            sum_medicamentos: 0,
            sum_uniformes: 0,
            sum_equiposOdontologicos: 0,
        };
        if (data) {
            finalResult.sum_medicamentos = Number(data.sum_medicamentos ?? 0);
            finalResult.sum_uniformes = Number(data.sum_uniformes ?? 0);
            finalResult.sum_equiposOdontologicos = Number(data.sum_equiposOdontologicos ?? 0);
        }
        return finalResult;
    }
    calculateCurrentMonthRange() {
        const now = new Date();
        const nowUtc = new Date(now.toISOString());
        const currentYear = nowUtc.getUTCFullYear();
        const currentMonth = nowUtc.getUTCMonth();
        const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0, 0));
        const endOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999));
        return {
            startOfMonth,
            endOfMonth,
        };
    }
};
exports.MedicalSuppliesService = MedicalSuppliesService;
exports.MedicalSuppliesService = MedicalSuppliesService = MedicalSuppliesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase, categories_service_1.CategoriesService, logs_service_1.LogsService])
], MedicalSuppliesService);
//# sourceMappingURL=medical-supplies.service.js.map