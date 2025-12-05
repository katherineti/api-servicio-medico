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
exports.AssignmentService = void 0;
const common_1 = require("@nestjs/common");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const constants_1 = require("../constants");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const medical_supplies_service_1 = require("../medical-supplies/medical-supplies.service");
const logs_service_1 = require("../logs/logs.service");
let AssignmentService = class AssignmentService {
    constructor(db, medicalSuppliesService, logsService) {
        this.db = db;
        this.medicalSuppliesService = medicalSuppliesService;
        this.logsService = logsService;
    }
    async createAssignment(create, userId, customerAccessPoint) {
        console.log("Body ", create);
        const product = await this.medicalSuppliesService.getProductbyId(create.productId);
        if (!product) {
            throw new common_1.NotFoundException('El producto no existe.');
        }
        const stockDisponible = product.stock;
        if (stockDisponible < create.products) {
            throw new common_1.ConflictException('El stock actual del producto es insuficiente.');
        }
        if (product.statusId === 4) {
            throw new common_1.ConflictException('El producto ha caducado. No puede asignar un producto en este estado.');
        }
        common_1.Logger.debug("Producto ", JSON.stringify(product));
        const insert = {
            ...create,
        };
        const [result] = await this.db.insert(schema_1.assignmentTable).values(insert).returning();
        common_1.Logger.debug("Insert de la asignacion ", JSON.stringify(result));
        if (!result) {
            throw new Error('Error al crear la asignación de producto para el empleado.');
        }
        const updateData = {
            name: product.name,
            description: product.description,
            categoryId: product.categoryId,
            type: product.type,
            stock: (stockDisponible - create.products),
            statusId: product.statusId,
            updatedAt: new Date(),
        };
        const updatedStockProduct = await this.db
            .update(schema_1.productsTable)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema_1.productsTable.id, product.id))
            .returning()
            .execute();
        if (!updatedStockProduct) {
            throw new common_1.ConflictException('Error al actualizar el stock del producto.');
        }
        common_1.Logger.debug("Stock actualizado en la tabla productos " + JSON.stringify(updatedStockProduct));
        this.logsService.create({
            action: 'Asignación de insumo médico',
            userId: userId,
            productId: create.productId,
            ipAddress: customerAccessPoint.ip,
            hostname: customerAccessPoint.hostname
        });
        return result;
    }
    async getAllEmployees() {
        try {
            return await this.db.select().from(schema_1.employeeTable).orderBy(schema_1.employeeTable.name);
        }
        catch (error) {
            console.error('Error al obtener todas las categorías', error);
            throw new Error(`Error al obtener todas las categorías: ${error.message}`);
        }
    }
    async getFamiliesByEmployee(employeeId) {
        try {
            return await this.db.select({
                id: schema_1.employeeFamilyTable.id,
                employeeId: schema_1.employeeFamilyTable.employeeId,
                familyId: schema_1.employeeFamilyTable.familyId,
                familyName: schema_1.familyTable.name,
                familyCedula: schema_1.familyTable.cedula
            })
                .from(schema_1.employeeFamilyTable)
                .leftJoin(schema_1.familyTable, (0, drizzle_orm_1.eq)(schema_1.employeeFamilyTable.familyId, schema_1.familyTable.id))
                .where((0, drizzle_orm_1.eq)(schema_1.employeeFamilyTable.employeeId, employeeId))
                .orderBy(schema_1.familyTable.name);
        }
        catch (error) {
            console.error('Error al obtener los familiares de un empleado', error);
            throw new Error(`Error al obtener los familiares de un empleado: ${error.message}`);
        }
    }
    async getAllTypesAssignment() {
        try {
            return await this.db.select().from(schema_1.typesAssignmentTable).orderBy(schema_1.typesAssignmentTable.id);
        }
        catch (error) {
            console.error('Error al obtener todos los tipos de asignación', error);
            throw new Error(`Error al obtener todos los tipos de asignación: ${error.message}`);
        }
    }
    async addFamilyMember(family) {
        try {
            const [resultFamily] = await this.db.insert(schema_1.familyTable).values(family).returning();
            common_1.Logger.debug("Insert de familiar ", JSON.stringify(resultFamily));
            if (!resultFamily) {
                throw new common_1.NotFoundException('Error al crear un familiar');
            }
            const insertEmployeeFamily = {
                employeeId: family.employeeId,
                familyId: resultFamily.id
            };
            const [resultEmployeeFamily] = await this.db.insert(schema_1.employeeFamilyTable).values(insertEmployeeFamily).returning();
            if (!resultEmployeeFamily) {
                throw new common_1.NotFoundException('Error al crear la relacion empleado - familiar');
            }
            common_1.Logger.debug("Insert en Employee - Family ", JSON.stringify(resultEmployeeFamily));
            const [getOneFamilyByEmployeeSelected] = await this.db.select({
                id: schema_1.employeeFamilyTable.id,
                employeeId: schema_1.employeeFamilyTable.employeeId,
                familyId: schema_1.employeeFamilyTable.familyId,
                familyName: schema_1.familyTable.name,
                familyCedula: schema_1.familyTable.cedula
            })
                .from(schema_1.employeeFamilyTable)
                .leftJoin(schema_1.familyTable, (0, drizzle_orm_1.eq)(schema_1.employeeFamilyTable.familyId, schema_1.familyTable.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.employeeFamilyTable.employeeId, family.employeeId), (0, drizzle_orm_1.eq)(schema_1.employeeFamilyTable.familyId, resultFamily.id)))
                .orderBy(schema_1.familyTable.name);
            common_1.Logger.debug("Consulta de la relacion Empleado seleccionado - Familiar nuevo ", JSON.stringify(getOneFamilyByEmployeeSelected));
            return getOneFamilyByEmployeeSelected;
        }
        catch (error) {
            console.error('Error al crear un familiar', error);
            throw new Error(`Error al crear un familiar: ${error.message}`);
        }
    }
    async addEmployee(createEmployeeDto) {
        try {
            const [resulEmployee] = await this.db.insert(schema_1.employeeTable).values(createEmployeeDto).returning();
            common_1.Logger.debug("Insert de empleado", JSON.stringify(resulEmployee));
            return resulEmployee;
        }
        catch (error) {
            console.error('Error al crear un empleado', error);
            throw new Error(`Error al crear un empleado: ${error.message}`);
        }
    }
    async totalAssignmentOfTheDay() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        let whereConditions = (0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.assignmentTable.employeeId), (0, drizzle_orm_1.gte)(schema_1.assignmentTable.createdAt, today), (0, drizzle_orm_1.lt)(schema_1.assignmentTable.createdAt, endOfDay), (0, drizzle_orm_1.inArray)(schema_1.productsTable.type, [1, 2, 3]), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4]));
        const [assignmentsCount] = await this.db
            .select({ count: (0, drizzle_orm_1.count)() })
            .from(schema_1.assignmentTable)
            .innerJoin(schema_1.productsTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.id, schema_1.assignmentTable.productId))
            .where(whereConditions);
        common_1.Logger.debug("Contador de registros de asignaciones de insumos medicos al empleado, del dia, en el dashboard", JSON.stringify(assignmentsCount));
        return assignmentsCount;
    }
    async countProductsAssignmentOfTheDay() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        let whereConditions = (0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.assignmentTable.employeeId), (0, drizzle_orm_1.gte)(schema_1.assignmentTable.createdAt, today), (0, drizzle_orm_1.lt)(schema_1.assignmentTable.createdAt, endOfDay), (0, drizzle_orm_1.inArray)(schema_1.productsTable.type, [1, 2, 3]), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4]));
        const [assignmentSum] = await this.db
            .select({
            count: (0, drizzle_orm_1.sql) `sum(${schema_1.assignmentTable.products})`.as('count'),
        })
            .from(schema_1.assignmentTable)
            .innerJoin(schema_1.productsTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.id, schema_1.assignmentTable.productId))
            .where(whereConditions);
        return assignmentSum;
    }
    async countProductsAssignmentOfMonth(typesMedicalSuppliesArray) {
        const nowCaracas = new Date();
        const year = nowCaracas.getFullYear();
        const month = nowCaracas.getMonth();
        const startOfMonthCaracas = new Date(year, month, 1, 0, 0, 0, 0);
        const endOfMonthCaracas = new Date(year, month + 1, 0, 23, 59, 59, 999);
        const [assignmentSum] = await this.db
            .select({
            count: (0, drizzle_orm_1.sql) `sum(${schema_1.assignmentTable.products})`.as('count'),
        })
            .from(schema_1.assignmentTable)
            .innerJoin(schema_1.productsTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.id, schema_1.assignmentTable.productId))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.assignmentTable.employeeId), (0, drizzle_orm_1.sql) `${schema_1.assignmentTable.createdAt} >= ${startOfMonthCaracas.toISOString()} AND ${schema_1.assignmentTable.createdAt} <= ${endOfMonthCaracas.toISOString()}`, (0, drizzle_orm_1.inArray)(schema_1.productsTable.type, typesMedicalSuppliesArray), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4])));
        return assignmentSum;
    }
    async totalAssignmentOfMonth() {
        const nowCaracas = new Date();
        const year = nowCaracas.getFullYear();
        const month = nowCaracas.getMonth();
        const startOfMonthCaracas = new Date(year, month, 1, 0, 0, 0, 0);
        const endOfMonthCaracas = new Date(year, month + 1, 0, 23, 59, 59, 999);
        const [result] = await this.db
            .select({ count: (0, drizzle_orm_1.count)() })
            .from(schema_1.assignmentTable)
            .innerJoin(schema_1.productsTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.id, schema_1.assignmentTable.productId))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.assignmentTable.employeeId), (0, drizzle_orm_1.sql) `${schema_1.assignmentTable.createdAt} >= ${startOfMonthCaracas.toISOString()} AND ${schema_1.assignmentTable.createdAt} <= ${endOfMonthCaracas.toISOString()}`, (0, drizzle_orm_1.inArray)(schema_1.productsTable.type, [1, 2, 3]), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4])));
        return result || { count: 0 };
    }
    async totalAssignments() {
        const dateRanges = this.getYear();
        const [result] = await this
            .db.select({ count: (0, drizzle_orm_1.count)() })
            .from(schema_1.assignmentTable)
            .innerJoin(schema_1.productsTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.id, schema_1.assignmentTable.productId))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.assignmentTable.employeeId), (0, drizzle_orm_1.gte)(schema_1.assignmentTable.createdAt, dateRanges.startOfYear), (0, drizzle_orm_1.lte)(schema_1.assignmentTable.createdAt, dateRanges.endOfYear), (0, drizzle_orm_1.inArray)(schema_1.productsTable.type, [1, 2, 3]), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4])));
        return result || { count: 0 };
    }
    async getAccumulatedAssignmentProductsByType() {
        const dateRanges = this.calculateCurrentMonthRange();
        const result = await this.db
            .select({
            sumAsig_medicamentos: (0, drizzle_orm_1.sql) `COALESCE(SUM(CASE WHEN ${schema_1.productsTable.type} = 1 THEN ${schema_1.assignmentTable.products} ELSE 0 END), 0)`.as('sumAsig_medicamentos'),
            sumAsig_uniformes: (0, drizzle_orm_1.sql) `COALESCE(SUM(CASE WHEN ${schema_1.productsTable.type} = 2 THEN ${schema_1.assignmentTable.products} ELSE 0 END), 0)`.as('sumAsig_uniformes'),
            sumAsig_equiposOdontologicos: (0, drizzle_orm_1.sql) `COALESCE(SUM(CASE WHEN ${schema_1.productsTable.type} = 3 THEN ${schema_1.assignmentTable.products} ELSE 0 END), 0)`.as('sumAsig_equiposOdontologicos'),
        })
            .from(schema_1.assignmentTable)
            .innerJoin(schema_1.productsTable, (0, drizzle_orm_1.eq)(schema_1.productsTable.id, schema_1.assignmentTable.productId))
            .innerJoin(schema_1.typesOfProductsTable, (0, drizzle_orm_1.eq)(schema_1.typesOfProductsTable.id, schema_1.productsTable.type))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.assignmentTable.employeeId), (0, drizzle_orm_1.inArray)(schema_1.productsTable.type, [1, 2, 3]), (0, drizzle_orm_1.inArray)(schema_1.productsTable.statusId, [1, 2, 3, 4]), (0, drizzle_orm_1.gte)(schema_1.assignmentTable.createdAt, dateRanges.startOfMonth), (0, drizzle_orm_1.lte)(schema_1.assignmentTable.createdAt, dateRanges.endOfMonth)));
        return result[0];
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
    getYear() {
        const now = new Date();
        const currentYear = now.getUTCFullYear();
        const startOfYear = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0));
        const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));
        return {
            startOfYear,
            endOfYear,
        };
    }
};
exports.AssignmentService = AssignmentService;
exports.AssignmentService = AssignmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase, medical_supplies_service_1.MedicalSuppliesService, logs_service_1.LogsService])
], AssignmentService);
//# sourceMappingURL=assignment.service.js.map