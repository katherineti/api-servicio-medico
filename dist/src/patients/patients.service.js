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
var PatientsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const constants_1 = require("../constants");
const schema_1 = require("../db/schema");
const read_patients_dto_1 = require("./dto/read-patients-dto");
let PatientsService = PatientsService_1 = class PatientsService {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(PatientsService_1.name);
    }
    async getAll(filter) {
        const whereConditions = [];
        if (filter.patientCedula) {
            whereConditions.push((0, drizzle_orm_1.ilike)(schema_1.patientTable.cedula, `%${filter.patientCedula}%`));
        }
        const whereClause = whereConditions.length > 0 ? (0, drizzle_orm_1.and)(...whereConditions) : undefined;
        const rows = await this.db.select()
            .from(schema_1.patientTable)
            .where(whereClause)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.patientTable.id))
            .limit(filter.take)
            .offset((filter.page - 1) * filter.take);
        const [{ value: total }] = await this.db.select({ value: (0, drizzle_orm_1.count)() })
            .from(schema_1.patientTable)
            .where(whereClause);
        const result = new read_patients_dto_1.PatientsGetAll();
        result.total = total;
        result.page = filter.page;
        result.list = rows;
        return result;
    }
    async getById(id) {
        try {
            const result = await this.db.select({
                id: schema_1.patientTable.id
            })
                .from(schema_1.patientTable)
                .where((0, drizzle_orm_1.eq)(schema_1.patientTable.id, id))
                .limit(1);
            return result[0] || null;
        }
        catch (err) {
            console.error("Error en la base de datos al buscar el paciente " + id + ": ", err);
            throw new Error("Error al obtener el paciente " + id + " " + err);
        }
    }
    async update(id, patient) {
        const Patient = await this.getById(id);
        if (!Patient) {
            throw new common_1.NotFoundException('El paciente no existe');
        }
        const updateData = {
            name: patient.name,
            birthdate: patient.birthdate,
            placeBirth: patient.placeBirth,
            age: patient.age,
            cedula: patient.cedula,
            email: patient.email,
            phone: patient.phone,
            gender: patient.gender,
            civilStatus: patient.civilStatus,
            children: patient.children,
            isActivate: patient.isActivate,
            updatedAt: new Date()
        };
        this.logger.log("Paciente updateData", updateData);
        const updated = await this.db
            .update(schema_1.patientTable)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema_1.patientTable.id, id));
        this.logger.log("Paciente actualizado", updated);
        return updated[0];
    }
};
exports.PatientsService = PatientsService;
exports.PatientsService = PatientsService = PatientsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase])
], PatientsService);
//# sourceMappingURL=patients.service.js.map