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
var TempAuditorReportsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TempAuditorReportsService = exports.ResultGetAllAuditores = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const constants_1 = require("../constants");
const schema_1 = require("../db/schema");
const uuid_1 = require("uuid");
const files_service_1 = require("../files/files.service");
const read_reports_dto_1 = require("./dto/read-reports-dto");
class ResultGetAllAuditores {
}
exports.ResultGetAllAuditores = ResultGetAllAuditores;
let TempAuditorReportsService = TempAuditorReportsService_1 = class TempAuditorReportsService {
    constructor(db, filesService) {
        this.db = db;
        this.filesService = filesService;
        this.logger = new common_1.Logger(TempAuditorReportsService_1.name);
    }
    async create(body) {
        try {
            body.additionalAuditorIds = await this.validateArrayadditionalAuditor(body);
            const id_report = body.id;
            if (id_report) {
                const Report = await this.getById(body.id);
                if (!Report) {
                    throw new common_1.NotFoundException('El reporte no existe');
                }
                const update = {
                    ...body, idDuplicate: null, updatedAt: null,
                };
                this.logger.log("TempAuditorReportsService.create() body.code ", body.code, " , body.code.charAt(0): ", Report.code.charAt(0));
                this.logger.log("TempAuditorReportsService.create() body ", body);
                this.logger.log("TempAuditorReportsService.create() Report de BD ", Report);
                if (Report.code.charAt(0) === 'D') {
                    update.idDuplicate = Report.idDuplicate;
                }
                const updated_ = await this.db
                    .update(schema_1.auditReportsTable_temp)
                    .set(update)
                    .where((0, drizzle_orm_1.eq)(schema_1.auditReportsTable_temp.id, body.id))
                    .returning();
                this.logger.debug(`Reporte actualizado: ${body.id}`);
                return updated_[0];
            }
            const existingReports = await this.db.select()
                .from(schema_1.auditReportsTable_temp)
                .where((0, drizzle_orm_1.eq)((0, drizzle_orm_1.sql) `lower(${schema_1.auditReportsTable_temp.title})`, (0, drizzle_orm_1.sql) `lower(${body.title})`))
                .limit(1);
            const existingReport = existingReports.length > 0 ? existingReports[0] : undefined;
            if (existingReport) {
                this.logger.warn(`Intento de crear reporte con título duplicado: ${body.title}`);
                throw new common_1.ConflictException(`Ya existe un reporte con el título: ${body.title}`);
            }
            const reportToCreate = {
                ...body,
                code: '',
                statusId: constants_1.REPORT_STATUS_ENPROCESO,
                startDate: new Date(),
                idDuplicate: null,
                updatedAt: null,
            };
            let newReport = await this.db.insert(schema_1.auditReportsTable_temp).values(reportToCreate).returning({ id: schema_1.auditReportsTable_temp.id });
            if (!newReport || newReport.length === 0 || !newReport[0].id) {
                this.logger.error(`Error al insertar el reporte inicial.`);
                throw new Error('Error al crear el reporte de auditoría.');
            }
            const newReportId = newReport[0].id;
            const year = new Date().getFullYear();
            const formattedId = `O${body.auditorId}${(0, uuid_1.v4)()}.${newReportId}.${year}`;
            const updateData = {
                code: formattedId
            };
            const updated = await this.db
                .update(schema_1.auditReportsTable_temp)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.auditReportsTable_temp.id, newReportId))
                .returning();
            this.logger.debug(`Informe de auditoría creado exitosamente con ID: ${newReportId}`);
            return updated[0];
        }
        catch (err) {
            this.logger.error(`Error al crear el reporte de auditoría: `, err);
            if (err instanceof common_1.ConflictException) {
                throw err;
            }
            throw new Error(`Error al registrar el reporte: ${err}`);
        }
    }
    async getById(id) {
        try {
            const result = await this.db.select()
                .from(schema_1.auditReportsTable_temp)
                .where((0, drizzle_orm_1.eq)(schema_1.auditReportsTable_temp.id, id))
                .limit(1);
            return result[0] || null;
        }
        catch (err) {
            console.error("Error en la base de datos al buscar el reporte " + id + ": ", err);
            throw new Error("Error al obtener el reporte " + id + " " + err);
        }
    }
    async getAll(filter) {
        const whereConditions = [];
        if (filter.receiver) {
            whereConditions.push((0, drizzle_orm_1.ilike)(schema_1.auditReportsTable_temp.receiver, `%${filter.receiver}%`));
        }
        if (filter.endDate) {
            const parsedEndDate = new Date(filter.endDate);
            const startOfDay = new Date(parsedEndDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(parsedEndDate);
            endOfDay.setHours(23, 59, 59, 999);
            whereConditions.push((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.auditReportsTable_temp.endDate, startOfDay), (0, drizzle_orm_1.lte)(schema_1.auditReportsTable_temp.endDate, endOfDay)));
        }
        const whereClause = whereConditions.length > 0 ? (0, drizzle_orm_1.and)(...whereConditions) : undefined;
        const rows = await this.db.select({
            id: schema_1.auditReportsTable_temp.id,
            code: schema_1.auditReportsTable_temp.code,
            title: schema_1.auditReportsTable_temp.title,
            receiver: schema_1.auditReportsTable_temp.receiver,
            auditorId: schema_1.auditReportsTable_temp.auditorId,
            auditor: schema_1.usersTable.name,
            additionalAuditorIds: schema_1.auditReportsTable_temp.additionalAuditorIds,
            summary_objective: schema_1.auditReportsTable_temp.summary_objective,
            summary_scope: schema_1.auditReportsTable_temp.summary_scope,
            summary_methodology: schema_1.auditReportsTable_temp.summary_methodology,
            summary_conclusionAndObservation: schema_1.auditReportsTable_temp.summary_conclusionAndObservation,
            introduction: schema_1.auditReportsTable_temp.introduction,
            detailed_methodology: schema_1.auditReportsTable_temp.detailed_methodology,
            findings: schema_1.auditReportsTable_temp.findings,
            conclusions: schema_1.auditReportsTable_temp.conclusions,
            statusId: schema_1.auditReportsTable_temp.statusId,
            status: schema_1.reportStatusTable.status,
            idDuplicate: schema_1.auditReportsTable_temp.idDuplicate,
            startDate: schema_1.auditReportsTable_temp.startDate,
            endDate: schema_1.auditReportsTable_temp.endDate,
            images: schema_1.auditReportsTable_temp.images
        })
            .from(schema_1.auditReportsTable_temp)
            .leftJoin(schema_1.usersTable, (0, drizzle_orm_1.eq)(schema_1.auditReportsTable_temp.auditorId, schema_1.usersTable.id))
            .leftJoin(schema_1.reportStatusTable, (0, drizzle_orm_1.eq)(schema_1.auditReportsTable_temp.statusId, schema_1.reportStatusTable.id))
            .where(whereClause)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.auditReportsTable_temp.id))
            .limit(filter.take)
            .offset((filter.page - 1) * filter.take);
        const [{ value: total }] = await this.db.select({ value: (0, drizzle_orm_1.count)() })
            .from(schema_1.auditReportsTable_temp)
            .leftJoin(schema_1.usersTable, (0, drizzle_orm_1.eq)(schema_1.auditReportsTable_temp.auditorId, schema_1.usersTable.id))
            .leftJoin(schema_1.reportStatusTable, (0, drizzle_orm_1.eq)(schema_1.auditReportsTable_temp.statusId, schema_1.reportStatusTable.id))
            .where(whereClause);
        const result = new read_reports_dto_1.ReportsGetAll();
        result.total = total;
        result.page = filter.page;
        result.list = rows;
        return result;
    }
    async update(id, body) {
        const Report = await this.getById(id);
        if (!Report) {
            throw new common_1.NotFoundException('El reporte no existe');
        }
        const { title, receiver, auditorId, statusId, summary_objective, summary_scope, summary_methodology, summary_conclusionAndObservation, introduction, detailed_methodology, findings, conclusions } = body;
        body.additionalAuditorIds = await this.validateArrayadditionalAuditor(body);
        const updateData = {
            title: title,
            receiver: receiver,
            auditorId: auditorId,
            statusId: statusId,
            summary_objective: summary_objective,
            summary_scope: summary_scope,
            summary_methodology: summary_methodology,
            summary_conclusionAndObservation: summary_conclusionAndObservation,
            additionalAuditorIds: body.additionalAuditorIds
        };
        if (statusId === constants_1.REPORT_STATUS_FINALIZADO) {
            updateData.introduction = introduction,
                updateData.detailed_methodology = detailed_methodology,
                updateData.findings = findings,
                updateData.conclusions = conclusions,
                updateData.images = null,
                updateData.endDate = new Date();
        }
        this.logger.log("update() body", body);
        this.logger.log("update() Report", Report);
        if (Report.code.charAt(0) === 'D') {
            updateData.idDuplicate = Report.idDuplicate;
        }
        if (Report.code.charAt(0) === 'D' && Number(statusId) === constants_1.REPORT_STATUS_FINALIZADO) {
            updateData.statusId = constants_1.REPORT_STATUS_COPIA_EDITADA;
        }
        const updated = await this.db
            .update(schema_1.auditReportsTable_temp)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema_1.auditReportsTable_temp.id, id))
            .returning();
        return updated[0];
    }
    async updateWithImages(id, body, files) {
        const existingReport = await this.getById(id);
        if (!existingReport) {
            throw new common_1.NotFoundException(`El reporte con ID ${id} no existe`);
        }
        const { title, receiver, auditorId, statusId, summary_objective, summary_scope, summary_methodology, summary_conclusionAndObservation, introduction, detailed_methodology, findings, conclusions, } = body;
        const additionalAuditorIds = await this.validateArrayadditionalAuditor(body);
        const updateData = {
            title,
            receiver,
            auditorId: auditorId ? Number(auditorId) : undefined,
            statusId: statusId ? Number(statusId) : undefined,
            summary_objective,
            summary_scope,
            summary_methodology,
            summary_conclusionAndObservation,
            additionalAuditorIds
        };
        if (Number(statusId) === constants_1.REPORT_STATUS_FINALIZADO) {
            updateData.introduction = introduction ?? null;
            updateData.detailed_methodology = detailed_methodology ?? null;
            updateData.findings = findings ?? null;
            updateData.conclusions = conclusions ?? null;
            updateData.endDate = new Date();
            this.logger.debug(`Actualizando reporte ${id} con estado FINALIZADO y datos base.`);
        }
        else {
            this.logger.debug(`Actualizando reporte ${id} con estado ${statusId} y datos base.`);
        }
        this.logger.debug(`Datos base a actualizar para el reporte ${id}: ${JSON.stringify(updateData)}`);
        let updatedReport;
        try {
            this.logger.log("update() body", body);
            this.logger.log("update() existingReport", existingReport);
            if (existingReport.code.charAt(0) === 'D') {
                updateData.idDuplicate = existingReport.idDuplicate;
            }
            if (existingReport.code.charAt(0) === 'D' && Number(statusId) === constants_1.REPORT_STATUS_FINALIZADO) {
                updateData.statusId = constants_1.REPORT_STATUS_COPIA_EDITADA;
            }
            const updatedReports = await this.db
                .update(schema_1.auditReportsTable_temp)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.auditReportsTable_temp.id, id))
                .returning();
            if (updatedReports.length > 0) {
                updatedReport = updatedReports[0];
                this.logger.log(`Reporte con ID ${id} actualizado exitosamente.`);
            }
            else {
                this.logger.warn(`No se pudo actualizar el reporte con ID ${id}.`);
                return undefined;
            }
        }
        catch (dbError) {
            this.logger.error(`Error al actualizar el reporte con ID ${id} en la base de datos:`, dbError);
            throw dbError;
        }
        let imagesError;
        if (Number(statusId) === constants_1.REPORT_STATUS_FINALIZADO && files && files.length > 0) {
            try {
                this.logger.debug(`Procesando ${files.length} imágenes para el reporte ${id}`);
                const savedPaths = await this.filesService.saveFiles(files, String(id));
                const normalizedPaths = savedPaths.map((path) => path.replace(/\\\\/g, '/'));
                const imagesUpdate = { ...updateData, images: JSON.stringify(normalizedPaths) };
                await this.db
                    .update(schema_1.auditReportsTable_temp)
                    .set(imagesUpdate)
                    .where((0, drizzle_orm_1.eq)(schema_1.auditReportsTable_temp.id, id));
                this.logger.debug(`Rutas de imágenes guardadas y actualizadas para el reporte ${id}: ${JSON.stringify(normalizedPaths)}`);
            }
            catch (fileError) {
                this.logger.error(`Error al guardar imágenes para el reporte ${id}:`, fileError);
                imagesError = `Error al guardar las imágenes para el reporte con ID ${id}.`;
            }
        }
        else if (files && files.length > 0) {
            this.logger.debug(`No se actualizaron imágenes para el reporte ${id} (estado no FINALIZADO).`);
        }
        else {
            this.logger.debug(`No se recibieron imágenes para el reporte ${id}.`);
        }
        if (imagesError) {
            return { saved: updatedReport, error: imagesError };
        }
        return updatedReport;
    }
    async delete(id) {
        const report = await this.getById(id);
        if (!report) {
            throw new common_1.NotFoundException('El reporte no existe');
        }
        const updateData = {
            statusId: constants_1.REPORT_STATUS_INHABILITADO,
        };
        await this.db
            .update(schema_1.auditReportsTable_temp)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema_1.auditReportsTable_temp.id, id));
        return await this.getById(id);
    }
    async getAllAuditores() {
        const statusCondition = (0, drizzle_orm_1.eq)(schema_1.usersTable.isActivate, true);
        const roleCondition = (0, drizzle_orm_1.inArray)(schema_1.usersTable.role, [1, 4]);
        const whereCondition = (0, drizzle_orm_1.and)(statusCondition, roleCondition);
        const rows = await this.db.select({
            id: schema_1.usersTable.id,
            name: schema_1.usersTable.name,
            email: schema_1.usersTable.email,
            isActivate: schema_1.usersTable.isActivate,
            role: schema_1.usersTable.role
        })
            .from(schema_1.usersTable)
            .where(whereCondition)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.usersTable.id));
        const [{ value: total }] = await this.db.select({ value: (0, drizzle_orm_1.count)() }).from(schema_1.usersTable).where(whereCondition);
        const result = new ResultGetAllAuditores();
        result.total = total;
        result.list = rows;
        return result;
    }
    async validateArrayadditionalAuditor(body) {
        if (body.additionalAuditorIds) {
            if (!Array.isArray(body.additionalAuditorIds)) {
                throw new common_1.BadRequestException("El campo additionalAuditorIds debe ser un array");
            }
            body.additionalAuditorIds = body.additionalAuditorIds.map(id => typeof id === 'string' ? Number(id) : id);
            const invalidIds = body.additionalAuditorIds.filter((id) => !Number.isInteger(id) || id <= 0);
            if (invalidIds.length > 0) {
                throw new common_1.BadRequestException(`Los siguientes IDs de auditores adicionales no son válidos: ${invalidIds.join(", ")}`);
            }
            body.additionalAuditorIds = [...new Set(body.additionalAuditorIds)];
            const originalLength = body.additionalAuditorIds.length;
            body.additionalAuditorIds = body.additionalAuditorIds.filter((id) => id !== body.auditorId);
            if (originalLength > body.additionalAuditorIds.length) {
                this.logger.warn(`Se removió el auditor principal (ID: ${body.auditorId}) de la lista de auditores adicionales`);
            }
            if (body.additionalAuditorIds.length > 0) {
                const existingAuditors = await this.db
                    .select({ id: schema_1.usersTable.id })
                    .from(schema_1.usersTable)
                    .where((0, drizzle_orm_1.inArray)(schema_1.usersTable.id, body.additionalAuditorIds));
                const existingIds = existingAuditors.map((auditor) => auditor.id);
                const nonExistentIds = body.additionalAuditorIds.filter((id) => !existingIds.includes(id));
                if (nonExistentIds.length > 0) {
                    throw new common_1.BadRequestException(`Los siguientes auditores adicionales no existen en la Base de Datos: ${nonExistentIds.join(", ")}`);
                }
            }
            this.logger.debug(`Auditores adicionales validados: ${body.additionalAuditorIds}`);
        }
        else {
            body.additionalAuditorIds = [];
        }
        return body.additionalAuditorIds;
    }
    async duplicate(body) {
        try {
            body.id = Number(body.id);
            const id_report = body.id;
            if (id_report) {
                const Report = await this.getById(body.id);
                if (!Report) {
                    throw new common_1.NotFoundException('El reporte de auditoria no existe');
                }
                const reportToCreate = {
                    ...Report,
                };
                delete reportToCreate.id;
                let newReport = await this.db.insert(schema_1.auditReportsTable_temp).values(reportToCreate).returning({ id: schema_1.auditReportsTable_temp.id });
                if (!newReport || newReport.length === 0 || !newReport[0].id) {
                    this.logger.error(`Error al insertar el reporte inicial.`);
                    throw new Error('Error al crear el reporte de auditoría.');
                }
                const newReportId = newReport[0].id;
                const year = new Date().getFullYear();
                const formattedId = `D${Report.auditorId}${(0, uuid_1.v4)()}.${newReportId}.${year}`;
                const updateData = {
                    code: formattedId,
                    idDuplicate: Report.id
                };
                if (Report.statusId === constants_1.REPORT_STATUS_COPIA_EDITADA) {
                    let status_report_original = 0;
                    if (Report.title) {
                        status_report_original = constants_1.REPORT_STATUS_ENPROCESO;
                    }
                    if (Report.summary_objective) {
                        status_report_original = constants_1.REPORT_STATUS_ENPROCESO;
                    }
                    if (Report.conclusions) {
                        status_report_original = constants_1.REPORT_STATUS_FINALIZADO;
                    }
                    updateData.statusId = status_report_original;
                }
                const updated = await this.db
                    .update(schema_1.auditReportsTable_temp)
                    .set(updateData)
                    .where((0, drizzle_orm_1.eq)(schema_1.auditReportsTable_temp.id, newReportId))
                    .returning();
                this.logger.debug(`Copia de Informe de Auditoría creado exitosamente con el ID: ${newReportId}`);
                const update = {
                    ...Report,
                    idDuplicate: Report.idDuplicate ? Report.idDuplicate : null,
                    statusId: constants_1.REPORT_STATUS_DUPLICADO,
                    updatedAt: new Date(),
                };
                const updated_ = await this.db
                    .update(schema_1.auditReportsTable_temp)
                    .set(update)
                    .where((0, drizzle_orm_1.eq)(schema_1.auditReportsTable_temp.id, body.id))
                    .returning();
                this.logger.debug(`El estado del reporte de auditoria con el id:${body.id} fue actualizado a duplicado`);
                return updated_[0];
            }
            else {
                throw new common_1.NotFoundException('Falta el id del reporte de auditoria');
            }
        }
        catch (err) {
            this.logger.error(`Error al duplicar el reporte de auditoría: `, err);
            if (err instanceof common_1.ConflictException) {
                throw err;
            }
            throw new Error(`Error al duplicar el reporte de auditoría: ${err}`);
        }
    }
};
exports.TempAuditorReportsService = TempAuditorReportsService;
exports.TempAuditorReportsService = TempAuditorReportsService = TempAuditorReportsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase, files_service_1.FilesService])
], TempAuditorReportsService);
//# sourceMappingURL=temp-auditor-reports.service.js.map