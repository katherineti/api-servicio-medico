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
Object.defineProperty(exports, "__esModule", { value: true });
exports.medicalPrescriptionsTable = exports.medicalReportsTable = exports.patientTable = exports.auditReportsTable_temp = exports.reportStatusTable = exports.logsTable = exports.rolesTable = exports.employeeFamilyTable = exports.assignmentTable = exports.typesAssignmentTable = exports.familyTable = exports.employeeTable = exports.providersTable = exports.productsTable = exports.typesOfProductsTable = exports.productStatusTable = exports.categoriesTable = exports.usersTable = exports.ProductTypeEnum = exports.rolesEnum = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const t = __importStar(require("drizzle-orm/pg-core"));
exports.rolesEnum = (0, pg_core_1.pgEnum)("roles_enum", ["admin", "almacen", "medico", "auditor"]);
exports.ProductTypeEnum = (0, pg_core_1.pgEnum)("ProductType", ["Medicamentos", "Uniformes", "Equipos odontologicos"]);
exports.usersTable = (0, pg_core_1.pgTable)("users", {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    name: t.varchar({ length: 200 }).notNull(),
    cedula: t.varchar({ length: 12 }).notNull().unique(),
    email: t.varchar().notNull().unique(),
    password: t.varchar({ length: 255 }).notNull(),
    role: t.integer().notNull().references(() => exports.rolesTable.id),
    isActivate: t.boolean('isActivate').notNull().default(true),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp().defaultNow()
});
exports.categoriesTable = (0, pg_core_1.pgTable)("categories", {
    id: t.serial().primaryKey(),
    name: t.varchar({ length: 30 }).notNull(),
    type: (0, exports.ProductTypeEnum)().notNull(),
    created_at: t.timestamp().defaultNow(),
    updated_at: t.timestamp().defaultNow()
});
exports.productStatusTable = (0, pg_core_1.pgTable)("productStatus", {
    id: t.serial().primaryKey(),
    status: t.varchar({ length: 30 }).notNull().unique(),
});
exports.typesOfProductsTable = (0, pg_core_1.pgTable)("typesProducts", {
    id: t.serial().primaryKey(),
    type: (0, exports.ProductTypeEnum)().notNull().unique(),
});
exports.productsTable = (0, pg_core_1.pgTable)("products", {
    id: t.serial().primaryKey(),
    code: t.varchar({ length: 50 }).notNull().unique(),
    stock: t.integer().notNull().default(0),
    name: t.varchar({ length: 100 }).notNull(),
    providerId: t.integer().notNull().references(() => exports.providersTable.id),
    description: t.varchar({ length: 255 }).notNull(),
    url_image: t.varchar({ length: 255 }).default(''),
    type: t.integer().notNull().references(() => exports.typesOfProductsTable.id),
    categoryId: t.integer().notNull().references(() => exports.categoriesTable.id),
    statusId: t.integer().notNull().references(() => exports.productStatusTable.id),
    expirationDate: t.date().default(null),
    createdAt: t.timestamp().defaultNow(),
    updatedAt: t.timestamp().defaultNow()
});
exports.providersTable = (0, pg_core_1.pgTable)("providers", {
    id: t.serial().primaryKey(),
    name: t.varchar({ length: 200 }).notNull(),
    email: t.varchar({ length: 100 }).notNull().unique(),
    phone: t.varchar({ length: 50 }).notNull(),
    createdAt: t.timestamp().defaultNow(),
    updatedAt: t.timestamp().defaultNow()
}, (table) => [
    (0, pg_core_1.index)('idx_providers_name_lower')
        .using('btree', (0, drizzle_orm_1.sql) `lower(${table.name})`)
]);
exports.employeeTable = (0, pg_core_1.pgTable)("employee", {
    id: t.serial().primaryKey(),
    name: t.varchar({ length: 200 }).notNull(),
    cedula: t.varchar({ length: 12 }).notNull().unique(),
    email: t.varchar({ length: 100 }).notNull().unique(),
    phone: t.varchar({ length: 50 }).notNull(),
    createdAt: t.timestamp().defaultNow(),
    updatedAt: t.timestamp().defaultNow()
});
exports.familyTable = (0, pg_core_1.pgTable)("family", {
    id: t.serial().primaryKey(),
    name: t.varchar({ length: 200 }).notNull(),
    cedula: t.varchar({ length: 12 }).default(null),
    createdAt: t.timestamp().defaultNow(),
    updatedAt: t.timestamp().defaultNow()
});
exports.typesAssignmentTable = (0, pg_core_1.pgTable)("typesAssignment", {
    id: t.serial().primaryKey(),
    name: t.varchar({ length: 30 }).notNull().unique(),
});
exports.assignmentTable = (0, pg_core_1.pgTable)("assignment", {
    id: t.serial().primaryKey(),
    employeeId: t.integer().references(() => exports.employeeTable.id),
    medicoId: t.integer().references(() => exports.usersTable.id),
    familyId: t.integer().references(() => exports.familyTable.id),
    type: t.integer().notNull().references(() => exports.typesAssignmentTable.id),
    observation: t.varchar({ length: 200 }).default(""),
    productId: t.integer().notNull().references(() => exports.productsTable.id, { onDelete: 'cascade' }),
    products: t.integer().notNull().default(0),
    createdAt: t.timestamp().defaultNow(),
    updatedAt: t.timestamp().defaultNow()
});
exports.employeeFamilyTable = (0, pg_core_1.pgTable)("employeeFamily", {
    id: t.serial().primaryKey(),
    employeeId: t.integer().notNull().references(() => exports.employeeTable.id, { onDelete: 'cascade' }),
    familyId: t.integer().notNull().references(() => exports.familyTable.id, { onDelete: 'cascade' }),
    createdAt: t.timestamp().defaultNow(),
    updatedAt: t.timestamp().defaultNow()
}, (table) => [
    t.uniqueIndex("employee_family_unique").on(table.employeeId, table.familyId)
]);
exports.rolesTable = (0, pg_core_1.pgTable)("roles", {
    id: t.serial().primaryKey(),
    name: t.varchar({ length: 40 }).notNull().unique(),
    description: t.varchar({ length: 50 }).default(null),
    isActivate: t.boolean().notNull().default(true),
});
exports.logsTable = (0, pg_core_1.pgTable)("logs", {
    id: t.serial().primaryKey(),
    userId: t.integer().notNull().references(() => exports.usersTable.id, { onDelete: 'cascade' }),
    productId: t.integer().default(null).references(() => exports.productsTable.id, { onDelete: 'cascade' }),
    action: t.varchar({ length: 100 }).notNull(),
    ipAddress: t.varchar({ length: 200 }).notNull(),
    hostname: t.varchar({ length: 200 }).notNull(),
    createdAt: t.timestamp().defaultNow()
});
exports.reportStatusTable = (0, pg_core_1.pgTable)("reportStatus", {
    id: t.serial().primaryKey(),
    status: t.varchar({ length: 30 }).notNull().unique(),
});
exports.auditReportsTable_temp = (0, pg_core_1.pgTable)("auditReports_temp", {
    id: t.serial().primaryKey(),
    code: t.varchar().notNull(),
    title: t.varchar({ length: 50 }).notNull(),
    receiver: t.varchar({ length: 50 }).notNull(),
    auditorId: t.integer().notNull().references(() => exports.usersTable.id, { onDelete: 'cascade' }),
    additionalAuditorIds: (0, pg_core_1.json)().$type().default([]),
    summary_objective: t.varchar({ length: 50 }),
    summary_scope: t.varchar({ length: 50 }),
    summary_methodology: t.varchar({ length: 50 }),
    summary_conclusionAndObservation: t.varchar({ length: 50 }),
    introduction: t.varchar({ length: 200 }),
    detailed_methodology: t.varchar({ length: 150 }),
    findings: t.varchar({ length: 150 }),
    conclusions: t.varchar({ length: 200 }),
    images: (0, pg_core_1.json)('images').$type(),
    statusId: t.integer().notNull().references(() => exports.reportStatusTable.id),
    idDuplicate: t.integer().default(null),
    startDate: t.timestamp().notNull(),
    endDate: t.timestamp(),
    updatedAt: t.timestamp().default(null)
});
exports.patientTable = (0, pg_core_1.pgTable)("patients", {
    id: t.serial().primaryKey(),
    name: t.varchar({ length: 200 }).notNull(),
    birthdate: t.date().default(null),
    placeBirth: t.varchar({ length: 40 }).notNull(),
    age: t.integer().notNull(),
    cedula: t.varchar({ length: 12 }).notNull().unique(),
    email: t.varchar({ length: 100 }).notNull().unique(),
    phone: t.varchar({ length: 50 }).notNull(),
    gender: t.varchar({ length: 1 }).notNull(),
    civilStatus: t.varchar({ length: 1 }).notNull(),
    children: t.integer().notNull().default(0),
    isActivate: t.boolean('isActivate').notNull().default(true),
    createdAt: t.timestamp().defaultNow(),
    updatedAt: t.timestamp().defaultNow()
});
exports.medicalReportsTable = (0, pg_core_1.pgTable)("medicalReports", {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    patientId: t.integer().notNull().references(() => exports.patientTable.id, { onDelete: 'cascade' }),
    doctorId: t.integer().notNull().references(() => exports.usersTable.id, { onDelete: 'cascade' }),
    description: t.varchar({ length: 700 }).default(null),
    insurance: t.varchar({ length: 100 }).default(null),
    apsCenter: t.varchar({ length: 100 }).default(null),
    mppsCM: t.varchar({ length: 100 }).default(null),
    isActivate: t.boolean('isActivate').notNull().default(true),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp().defaultNow()
});
exports.medicalPrescriptionsTable = (0, pg_core_1.pgTable)("medicalPrescriptions", {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    medicalReportId: t.integer().references(() => exports.medicalReportsTable.id, { onDelete: "set null" }),
    place: t.varchar({ length: 100 }).notNull(),
    doctorId: t
        .integer()
        .notNull()
        .references(() => exports.usersTable.id, { onDelete: "cascade" }),
    mpps: t.varchar({ length: 100 }).notNull(),
    patientId: t
        .integer()
        .notNull()
        .references(() => exports.patientTable.id, { onDelete: "cascade" }),
    recipeContent: t.varchar({ length: 700 }).notNull(),
    indications: t.varchar({ length: 700 }).default(null),
    expirationDate: t.date().notNull(),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp().defaultNow(),
});
//# sourceMappingURL=schema.js.map