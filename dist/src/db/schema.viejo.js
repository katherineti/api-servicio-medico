"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeFamilyTable = exports.assignedProductTable = exports.assignmentTable = exports.typesAssignmentTable = exports.familyTable = exports.employeeTable = exports.expiredProductsTable = exports.productsTable = exports.productStatusTable = exports.categoriesTable = exports.usersTable = exports.ProductTypeEnum = exports.rolesEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.rolesEnum = (0, pg_core_1.pgEnum)("roles", ["admin", "almacen", "medico", "auditor"]);
exports.ProductTypeEnum = (0, pg_core_1.pgEnum)("ProductType", ["Medicamentos", "Uniformes", "Equipos odontologicos"]);
exports.usersTable = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    name: (0, pg_core_1.varchar)({ length: 200 }).notNull(),
    email: (0, pg_core_1.varchar)().notNull().unique(),
    password: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    role: (0, exports.rolesEnum)(),
    isActivate: (0, pg_core_1.boolean)('isActivate').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)().defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)().defaultNow()
});
exports.categoriesTable = (0, pg_core_1.pgTable)("categories", {
    id: (0, pg_core_1.serial)().primaryKey(),
    name: (0, pg_core_1.varchar)({ length: 30 }).notNull(),
    type: (0, exports.ProductTypeEnum)().notNull(),
    created_at: (0, pg_core_1.timestamp)().defaultNow(),
    updated_at: (0, pg_core_1.timestamp)().defaultNow()
});
exports.productStatusTable = (0, pg_core_1.pgTable)("productStatus", {
    id: (0, pg_core_1.serial)().primaryKey(),
    status: (0, pg_core_1.varchar)({ length: 30 }).notNull().unique(),
});
exports.productsTable = (0, pg_core_1.pgTable)("products", {
    id: (0, pg_core_1.serial)().primaryKey(),
    code: (0, pg_core_1.varchar)({ length: 50 }).notNull().unique(),
    stock: (0, pg_core_1.integer)().notNull().default(0),
    name: (0, pg_core_1.varchar)({ length: 100 }).notNull(),
    description: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    url_image: (0, pg_core_1.varchar)({ length: 255 }).default(''),
    type: (0, exports.ProductTypeEnum)().notNull(),
    categoryId: (0, pg_core_1.integer)().notNull().references(() => exports.categoriesTable.id),
    statusId: (0, pg_core_1.integer)().notNull().references(() => exports.productStatusTable.id),
    createdAt: (0, pg_core_1.timestamp)().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)().defaultNow()
});
exports.expiredProductsTable = (0, pg_core_1.pgTable)("expiredProducts", {
    id: (0, pg_core_1.serial)().primaryKey(),
    productId: (0, pg_core_1.integer)().notNull().references(() => exports.productsTable.id),
    expirationDate: (0, pg_core_1.date)("expirationDate", { mode: "date" }),
    createdAt: (0, pg_core_1.timestamp)().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)().defaultNow()
});
exports.employeeTable = (0, pg_core_1.pgTable)("employee", {
    id: (0, pg_core_1.serial)().primaryKey(),
    name: (0, pg_core_1.varchar)({ length: 200 }).notNull(),
    cedula: (0, pg_core_1.varchar)({ length: 30 }).notNull().unique(),
    email: (0, pg_core_1.varchar)({ length: 100 }).notNull().unique(),
    phone: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)().defaultNow()
});
exports.familyTable = (0, pg_core_1.pgTable)("family", {
    id: (0, pg_core_1.serial)().primaryKey(),
    name: (0, pg_core_1.varchar)({ length: 200 }).notNull(),
    cedula: (0, pg_core_1.varchar)({ length: 30 }).notNull().unique(),
    createdAt: (0, pg_core_1.timestamp)().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)().defaultNow()
});
exports.typesAssignmentTable = (0, pg_core_1.pgTable)("typesAssignment", {
    id: (0, pg_core_1.serial)().primaryKey(),
    name: (0, pg_core_1.varchar)({ length: 30 }).notNull().unique(),
});
exports.assignmentTable = (0, pg_core_1.pgTable)("assignment", {
    id: (0, pg_core_1.serial)().primaryKey(),
    employeeId: (0, pg_core_1.integer)().notNull().references(() => exports.employeeTable.id),
    familyId: (0, pg_core_1.integer)().references(() => exports.familyTable.id),
    type: (0, pg_core_1.integer)().notNull().references(() => exports.typesAssignmentTable.id),
    observation: (0, pg_core_1.varchar)({ length: 200 }).default(""),
    productId: (0, pg_core_1.integer)().notNull().references(() => exports.productsTable.id),
    products: (0, pg_core_1.integer)().notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)().defaultNow()
});
exports.assignedProductTable = (0, pg_core_1.pgTable)("assignedProduct", {
    id: (0, pg_core_1.serial)().primaryKey(),
    assignmentId: (0, pg_core_1.integer)().notNull().references(() => exports.assignmentTable.id),
    productId: (0, pg_core_1.integer)().notNull().references(() => exports.productsTable.id),
    quantity: (0, pg_core_1.integer)().notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)().defaultNow()
});
exports.employeeFamilyTable = (0, pg_core_1.pgTable)("employeeFamily", {
    id: (0, pg_core_1.serial)().primaryKey(),
    employeeId: (0, pg_core_1.integer)().notNull().references(() => exports.employeeTable.id, { onDelete: 'cascade' }),
    familyId: (0, pg_core_1.integer)().notNull().references(() => exports.familyTable.id, { onDelete: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)().defaultNow()
}, (table) => {
    return {
        uniqueEmployeeFamily: (0, pg_core_1.unique)("employee_family_unique").on(table.employeeId, table.familyId),
    };
});
//# sourceMappingURL=schema.viejo.js.map