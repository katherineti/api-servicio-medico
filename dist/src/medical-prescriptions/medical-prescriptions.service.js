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
var MedicalPrescriptionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalPrescriptionsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const constants_1 = require("../constants");
const schema_1 = require("../db/schema");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const read_medical_prescription_dto_1 = require("./dto/read-medical-prescription-dto");
let MedicalPrescriptionsService = MedicalPrescriptionsService_1 = class MedicalPrescriptionsService {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(MedicalPrescriptionsService_1.name);
    }
    async create(createMedicalPrescriptionDto) {
        const doctorExist = await this.db
            .select()
            .from(schema_1.usersTable)
            .where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, createMedicalPrescriptionDto.doctorId))
            .limit(1);
        if (!doctorExist.length) {
            throw new common_1.ConflictException("El doctor especificado no existe.");
        }
        const patientExist = await this.db
            .select()
            .from(schema_1.patientTable)
            .where((0, drizzle_orm_1.eq)(schema_1.patientTable.id, createMedicalPrescriptionDto.patientId))
            .limit(1);
        if (!patientExist.length) {
            throw new common_1.ConflictException("El paciente especificado no existe.");
        }
        if (createMedicalPrescriptionDto.medicalReportId) {
            const medicalReportExist = await this.db
                .select()
                .from(schema_1.medicalReportsTable)
                .where((0, drizzle_orm_1.eq)(schema_1.medicalReportsTable.id, createMedicalPrescriptionDto.medicalReportId))
                .limit(1);
            if (!medicalReportExist.length) {
                throw new common_1.ConflictException("El informe médico asociado no existe.");
            }
        }
        try {
            const [result] = await this.db
                .insert(schema_1.medicalPrescriptionsTable)
                .values({
                ...createMedicalPrescriptionDto,
            })
                .returning();
            this.logger.debug(`Recipe médico creado: ${JSON.stringify(result)}`);
            return result;
        }
        catch (error) {
            this.logger.error("Error al insertar un recipe médico en la base de datos", error.stack);
            throw new common_1.ConflictException("Error al crear la recipe médico.");
        }
    }
    async getAll(filter) {
        const rows = await this.db
            .select({
            id: schema_1.medicalPrescriptionsTable.id,
            medicalReportId: schema_1.medicalPrescriptionsTable.medicalReportId,
            place: schema_1.medicalPrescriptionsTable.place,
            expirationDate: (0, drizzle_orm_1.sql) `TO_CHAR(${schema_1.medicalPrescriptionsTable.expirationDate}, 'YYYY-MM-DD')`,
            recipeContent: schema_1.medicalPrescriptionsTable.recipeContent,
            doctorId: schema_1.usersTable.id,
            doctorName: schema_1.usersTable.name,
            doctorCedula: schema_1.usersTable.cedula,
            mpps: schema_1.medicalPrescriptionsTable.mpps,
            patientId: schema_1.patientTable.id,
            patientName: schema_1.patientTable.name,
            patientCedula: schema_1.patientTable.cedula,
            indications: schema_1.medicalPrescriptionsTable.indications,
            createdAt: (0, drizzle_orm_1.sql) `TO_CHAR(${schema_1.medicalPrescriptionsTable.createdAt}, 'YYYY-MM-DD')`,
            updatedAt: (0, drizzle_orm_1.sql) `TO_CHAR(${schema_1.medicalPrescriptionsTable.updatedAt}, 'YYYY-MM-DD')`,
        })
            .from(schema_1.medicalPrescriptionsTable)
            .leftJoin(schema_1.usersTable, (0, drizzle_orm_1.eq)(schema_1.medicalPrescriptionsTable.doctorId, schema_1.usersTable.id))
            .leftJoin(schema_1.patientTable, (0, drizzle_orm_1.eq)(schema_1.medicalPrescriptionsTable.patientId, schema_1.patientTable.id))
            .where((0, drizzle_orm_1.eq)(schema_1.medicalPrescriptionsTable.medicalReportId, filter.medicalReportId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.medicalPrescriptionsTable.id))
            .limit(filter.take)
            .offset(((filter.page ?? 1) - 1) * (filter.take ?? 10));
        const [{ value: total }] = await this.db
            .select({ value: (0, drizzle_orm_1.count)() })
            .from(schema_1.medicalPrescriptionsTable)
            .leftJoin(schema_1.usersTable, (0, drizzle_orm_1.eq)(schema_1.medicalPrescriptionsTable.doctorId, schema_1.usersTable.id))
            .leftJoin(schema_1.patientTable, (0, drizzle_orm_1.eq)(schema_1.medicalPrescriptionsTable.patientId, schema_1.patientTable.id))
            .where((0, drizzle_orm_1.eq)(schema_1.medicalPrescriptionsTable.medicalReportId, filter.medicalReportId));
        const result = new read_medical_prescription_dto_1.MedicalPrescriptionGetAll();
        result.total = total;
        result.page = filter.page ?? 1;
        result.list = rows;
        return result;
    }
    async getById(id) {
        const result = await this.db
            .select({
            id: schema_1.medicalPrescriptionsTable.id,
            medicalReportId: schema_1.medicalPrescriptionsTable.medicalReportId,
            place: schema_1.medicalPrescriptionsTable.place,
            expirationDate: (0, drizzle_orm_1.sql) `TO_CHAR(${schema_1.medicalPrescriptionsTable.expirationDate}, 'YYYY-MM-DD')`,
            recipeContent: schema_1.medicalPrescriptionsTable.recipeContent,
            doctorId: schema_1.usersTable.id,
            doctorName: schema_1.usersTable.name,
            doctorCedula: schema_1.usersTable.cedula,
            mpps: schema_1.medicalPrescriptionsTable.mpps,
            patientId: schema_1.patientTable.id,
            patientName: schema_1.patientTable.name,
            patientCedula: schema_1.patientTable.cedula,
            patientBirthdate: schema_1.patientTable.birthdate,
            indications: schema_1.medicalPrescriptionsTable.indications,
            createdAt: (0, drizzle_orm_1.sql) `TO_CHAR(${schema_1.medicalPrescriptionsTable.createdAt}, 'YYYY-MM-DD')`,
            updatedAt: (0, drizzle_orm_1.sql) `TO_CHAR(${schema_1.medicalPrescriptionsTable.updatedAt}, 'YYYY-MM-DD')`,
        })
            .from(schema_1.medicalPrescriptionsTable)
            .leftJoin(schema_1.usersTable, (0, drizzle_orm_1.eq)(schema_1.medicalPrescriptionsTable.doctorId, schema_1.usersTable.id))
            .leftJoin(schema_1.patientTable, (0, drizzle_orm_1.eq)(schema_1.medicalPrescriptionsTable.patientId, schema_1.patientTable.id))
            .where((0, drizzle_orm_1.eq)(schema_1.medicalPrescriptionsTable.id, id))
            .limit(1);
        if (!result.length) {
            throw new common_1.ConflictException(`El recipe consultado ${id} no existe.`);
        }
        return result[0];
    }
    async update(id, updateMedicalPrescriptionDto) {
        if (updateMedicalPrescriptionDto.doctorId) {
            const doctorExist = await this.db
                .select()
                .from(schema_1.usersTable)
                .where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, updateMedicalPrescriptionDto.doctorId))
                .limit(1);
            if (!doctorExist.length) {
                throw new common_1.ConflictException("El doctor especificado no existe.");
            }
        }
        if (updateMedicalPrescriptionDto.patientId) {
            const patientExist = await this.db
                .select()
                .from(schema_1.patientTable)
                .where((0, drizzle_orm_1.eq)(schema_1.patientTable.id, updateMedicalPrescriptionDto.patientId))
                .limit(1);
            if (!patientExist.length) {
                throw new common_1.ConflictException("El paciente especificado no existe.");
            }
        }
        if (updateMedicalPrescriptionDto.medicalReportId) {
            const medicalReportExist = await this.db
                .select()
                .from(schema_1.medicalReportsTable)
                .where((0, drizzle_orm_1.eq)(schema_1.medicalReportsTable.id, updateMedicalPrescriptionDto.medicalReportId))
                .limit(1);
            if (!medicalReportExist.length) {
                throw new common_1.ConflictException("El informe médico asociado no existe.");
            }
        }
        try {
            let updated = {
                ...updateMedicalPrescriptionDto,
                updatedAt: new Date()
            };
            const [result] = await this.db
                .update(schema_1.medicalPrescriptionsTable)
                .set(updated)
                .where((0, drizzle_orm_1.eq)(schema_1.medicalPrescriptionsTable.id, id))
                .returning();
            if (!result) {
                throw new common_1.ConflictException("Error al actualizar el recipe médico");
            }
            this.logger.debug(`Recipe médico actualizada: ${JSON.stringify(result)}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Error al actualizar el recipe médico con ID ${id}`, error.stack);
            throw new common_1.ConflictException("Error al actualizar el recipe médico.");
        }
    }
    async delete(id) {
        try {
            const [result] = await this.db
                .delete(schema_1.medicalPrescriptionsTable)
                .where((0, drizzle_orm_1.eq)(schema_1.medicalPrescriptionsTable.id, id))
                .returning({ id: schema_1.medicalPrescriptionsTable.id });
            if (!result) {
                throw new common_1.ConflictException("El doctor especificado no existe.");
            }
            this.logger.debug(`Receta médica eliminada: ${JSON.stringify(result)}`);
            return { message: `Receta médica con ID ${id} eliminada exitosamente.` };
        }
        catch (error) {
            this.logger.error(`Error al eliminar la receta médica con ID ${id}`, error.stack);
            throw new common_1.ConflictException("Error al eliminar la receta médica.");
        }
    }
};
exports.MedicalPrescriptionsService = MedicalPrescriptionsService;
exports.MedicalPrescriptionsService = MedicalPrescriptionsService = MedicalPrescriptionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase])
], MedicalPrescriptionsService);
//# sourceMappingURL=medical-prescriptions.service.js.map