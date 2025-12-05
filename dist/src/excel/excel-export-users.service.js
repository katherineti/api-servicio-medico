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
var ExportUsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportUsersService = void 0;
const common_1 = require("@nestjs/common");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const exceljs_1 = require("exceljs");
const constants_1 = require("../constants");
const buffer_1 = require("buffer");
let ExportUsersService = ExportUsersService_1 = class ExportUsersService {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(ExportUsersService_1.name);
    }
    async exportUsers(format, roleFilter, nameFilter, cedulaFilter) {
        try {
            const currentYear = new Date().getFullYear();
            const startOfYear = new Date(`${currentYear}-01-01`);
            const endOfYear = new Date(`${currentYear + 1}-01-01`);
            const whereConditions = [(0, drizzle_orm_1.gte)(schema_1.usersTable.createdAt, startOfYear), (0, drizzle_orm_1.lt)(schema_1.usersTable.createdAt, endOfYear)];
            if (roleFilter && roleFilter !== "all") {
                whereConditions.push((0, drizzle_orm_1.eq)(schema_1.rolesTable.name, roleFilter));
            }
            if (nameFilter && nameFilter.trim()) {
                whereConditions.push((0, drizzle_orm_1.ilike)(schema_1.usersTable.name, `%${nameFilter}%`));
            }
            if (cedulaFilter && cedulaFilter.trim()) {
                whereConditions.push((0, drizzle_orm_1.ilike)(schema_1.usersTable.cedula, `%${cedulaFilter}%`));
            }
            const rows = await this.db
                .select({
                id: schema_1.usersTable.id,
                name: schema_1.usersTable.name,
                email: schema_1.usersTable.email,
                isActivate: schema_1.usersTable.isActivate,
                createdAt: schema_1.usersTable.createdAt,
                updatedAt: schema_1.usersTable.updatedAt,
                role: schema_1.rolesTable.name,
                cedula: schema_1.usersTable.cedula,
            })
                .from(schema_1.usersTable)
                .leftJoin(schema_1.rolesTable, (0, drizzle_orm_1.eq)(schema_1.usersTable.role, schema_1.rolesTable.id))
                .where((0, drizzle_orm_1.and)(...whereConditions))
                .orderBy((0, drizzle_orm_1.asc)(schema_1.rolesTable.name), (0, drizzle_orm_1.asc)(schema_1.usersTable.isActivate), (0, drizzle_orm_1.asc)(schema_1.usersTable.name));
            if (format === "xlsx") {
                return await this.generateExcel(rows);
            }
            else {
                return await this.generateCsv(rows);
            }
        }
        catch (error) {
            this.logger.error("Error exporting users:", error);
            throw error;
        }
    }
    async generateExcel(data) {
        const workbook = new exceljs_1.Workbook();
        const worksheet = workbook.addWorksheet("Usuarios");
        worksheet.columns = [
            { header: "Nombre", key: "name", width: 25 },
            { header: "Email", key: "email", width: 30 },
            { header: "Rol", key: "role", width: 15 },
            { header: "Estado", key: "isActivate", width: 12 },
            { header: "Fecha Creación", key: "createdAt", width: 20 },
        ];
        worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
        worksheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } };
        data.forEach((user, index) => {
            const row = worksheet.addRow({
                name: user.name,
                email: user.email,
                role: user.role || "N/A",
                isActivate: user.isActivate ? "Activo" : "Inactivo",
                createdAt: new Date(user.createdAt).toLocaleString("es-VE"),
            });
            if (index % 2 === 0) {
                row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } };
            }
        });
        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    }
    sanitizeCsv(data) {
        if (data === null || data === undefined) {
            return "";
        }
        let str = String(data);
        str = str.replace(/"/g, '""');
        if (str.includes(',') || str.includes('\n') || str.includes('\r') || str.includes('"')) {
            return `"${str}"`;
        }
        return str;
    }
    async generateCsv(data) {
        let csv = "\ufeffNombre,Email,Rol,Estado,Fecha Creación\n";
        data.forEach((user) => {
            const userLine = `${this.sanitizeCsv(user.name)},${this.sanitizeCsv(user.email)},${this.sanitizeCsv(user.role || 'N/A')},${user.isActivate ? 'Activo' : 'Inactivo'},${new Date(user.createdAt).toLocaleString('es-VE')}\n`;
            csv += userLine;
        });
        return buffer_1.Buffer.from(csv, "utf8");
    }
};
exports.ExportUsersService = ExportUsersService;
exports.ExportUsersService = ExportUsersService = ExportUsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [Function])
], ExportUsersService);
//# sourceMappingURL=excel-export-users.service.js.map