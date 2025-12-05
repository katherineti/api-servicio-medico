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
var MedicalReportsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalReportsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../db/schema");
const read_medical_reports_dto_1 = require("./dto/read-medical-reports-dto");
const constants_1 = require("../constants");
let MedicalReportsService = MedicalReportsService_1 = class MedicalReportsService {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(MedicalReportsService_1.name);
    }
    async getAll(filter) {
        const effectiveFilter = filter || { page: 1, take: 10 };
        const whereConditions = [];
        if (effectiveFilter.doctorCedula) {
            whereConditions.push((0, drizzle_orm_1.ilike)(schema_1.usersTable.cedula, `%${effectiveFilter.doctorCedula}%`));
        }
        if (effectiveFilter.patientCedula) {
            whereConditions.push((0, drizzle_orm_1.ilike)(schema_1.patientTable.cedula, `%${effectiveFilter.patientCedula}%`));
        }
        if (effectiveFilter.createdAt) {
            whereConditions.push((0, drizzle_orm_1.eq)(schema_1.medicalReportsTable.createdAt, effectiveFilter.createdAt));
        }
        const whereClause = whereConditions.length > 0 ? (0, drizzle_orm_1.and)(...whereConditions) : undefined;
        const rows = await this.db
            .select({
            id: schema_1.medicalReportsTable.id,
            apsCenter: schema_1.medicalReportsTable.apsCenter,
            insurance: schema_1.medicalReportsTable.insurance,
            doctorId: schema_1.usersTable.id,
            doctorName: schema_1.usersTable.name,
            doctorCedula: schema_1.usersTable.cedula,
            patientId: schema_1.patientTable.id,
            patientName: schema_1.patientTable.name,
            patientCedula: schema_1.patientTable.cedula,
            description: schema_1.medicalReportsTable.description,
            createdAt: (0, drizzle_orm_1.sql) `TO_CHAR(${schema_1.medicalReportsTable.createdAt}, 'YYYY-MM-DD')`,
            countMedicalPrescriptions: (0, drizzle_orm_1.count)(schema_1.medicalPrescriptionsTable.id)
        })
            .from(schema_1.medicalReportsTable)
            .leftJoin(schema_1.usersTable, (0, drizzle_orm_1.eq)(schema_1.medicalReportsTable.doctorId, schema_1.usersTable.id))
            .leftJoin(schema_1.patientTable, (0, drizzle_orm_1.eq)(schema_1.medicalReportsTable.patientId, schema_1.patientTable.id))
            .leftJoin(schema_1.medicalPrescriptionsTable, (0, drizzle_orm_1.eq)(schema_1.medicalPrescriptionsTable.medicalReportId, schema_1.medicalReportsTable.id))
            .where(whereClause)
            .groupBy(schema_1.medicalReportsTable.id, schema_1.medicalReportsTable.apsCenter, schema_1.medicalReportsTable.insurance, schema_1.usersTable.id, schema_1.usersTable.name, schema_1.usersTable.cedula, schema_1.patientTable.id, schema_1.patientTable.name, schema_1.patientTable.cedula, schema_1.medicalReportsTable.description, (0, drizzle_orm_1.sql) `TO_CHAR(${schema_1.medicalReportsTable.createdAt}, 'YYYY-MM-DD')`)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.medicalReportsTable.id))
            .limit(effectiveFilter.take)
            .offset((effectiveFilter.page - 1) * effectiveFilter.take);
        const [{ value: total }] = await this.db
            .select({ value: (0, drizzle_orm_1.count)() })
            .from(schema_1.medicalReportsTable)
            .leftJoin(schema_1.usersTable, (0, drizzle_orm_1.eq)(schema_1.medicalReportsTable.doctorId, schema_1.usersTable.id))
            .leftJoin(schema_1.patientTable, (0, drizzle_orm_1.eq)(schema_1.medicalReportsTable.patientId, schema_1.patientTable.id))
            .where(whereClause);
        const result = new read_medical_reports_dto_1.MedicalReportsGetAll();
        result.total = total;
        result.page = effectiveFilter.page || 1;
        result.list = rows;
        return result;
    }
    async getById(id) {
        try {
            const result = await this.db.select().from(schema_1.medicalReportsTable).where((0, drizzle_orm_1.eq)(schema_1.medicalReportsTable.id, id)).limit(1);
            return result[0] || null;
        }
        catch (err) {
            console.error("Error en la base de datos al buscar el informe médico  " + id + ": ", err);
            throw new Error("Error al obtener el informe médico " + id + " " + err);
        }
    }
    async getDoctor(doctorId) {
        try {
            const result = await this.db.select().from(schema_1.usersTable).where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, doctorId)).limit(1);
            return result[0] || null;
        }
        catch (err) {
            console.error("Error en la base de datos al buscar el doctor  " + doctorId + ": ", err);
            throw new Error("Error al obtener el doctor " + doctorId + " " + err);
        }
    }
    async getPatient(patientId) {
        try {
            const result = await this.db.select().from(schema_1.patientTable).where((0, drizzle_orm_1.eq)(schema_1.patientTable.id, patientId)).limit(1);
            return result[0] || null;
        }
        catch (err) {
            console.error("Error en la base de datos al buscar el paciente  " + patientId + ": ", err);
            throw new Error("Error al obtener el paciente " + patientId + " " + err);
        }
    }
    async create(createMedicalReportsDto) {
        const idMedicoExist = await this.getDoctor(Number(createMedicalReportsDto.doctorId));
        if (!idMedicoExist) {
            throw new common_1.ConflictException("El doctor no existe.");
        }
        const patientExist = await this.getPatient(Number(createMedicalReportsDto.patientId));
        if (!patientExist) {
            throw new common_1.ConflictException("El paciente no existe.");
        }
        try {
            const newReport = {
                ...createMedicalReportsDto,
                isActivate: true,
            };
            const [result] = await this.db.insert(schema_1.medicalReportsTable).values(newReport).returning();
            this.logger.debug(`Informe medico creado: ${JSON.stringify(result)}`);
            return result;
        }
        catch (error) {
            console.error("Error al insertar un informe medico en la base de datos", error);
            return { error: "Error al insertar un informe medico en la base de datos" };
        }
    }
};
exports.MedicalReportsService = MedicalReportsService;
exports.MedicalReportsService = MedicalReportsService = MedicalReportsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [Function])
], MedicalReportsService);
//# sourceMappingURL=medical-reports.service.js.map