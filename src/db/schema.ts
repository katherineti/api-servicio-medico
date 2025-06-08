import { json, pgEnum, pgTable as table, unique } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

export const rolesEnum = pgEnum("roles_enum", ["admin", "almacen","medico","auditor"]);
export const ProductTypeEnum = pgEnum("ProductType", ["Medicamentos", "Uniformes","Equipos odontologicos"]);

export const usersTable = table("users", {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    name: t.varchar({ length: 200 }).notNull(),
    email: t.varchar().notNull().unique(),
    password: t.varchar({ length: 255 }).notNull(),
    // role: rolesEnum().notNull(),
    role: t.integer().notNull().references(() => rolesTable.id),
    isActivate: t.boolean('isActivate').notNull().default(true),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp().defaultNow()
});

export const categoriesTable = table("categories", {
    id: t.serial().primaryKey(),
    name: t.varchar({ length: 30 }).notNull(),
    type: ProductTypeEnum().notNull(),
    created_at: t.timestamp().defaultNow(),
    updated_at: t.timestamp().defaultNow()
});

export const productStatusTable = table("productStatus",{
  id: t.serial().primaryKey(),
  status: t.varchar({ length: 30 }).notNull().unique(),
})

export const productsTable = table("products", {
    id: t.serial().primaryKey(),
    code: t.varchar({ length: 50 }).notNull().unique(),
    stock: t.integer().notNull().default(0),
    name: t.varchar({ length: 100 }).notNull(),
    description: t.varchar({ length: 255 }).notNull(),
    url_image: t.varchar({ length: 255 }).default(''),
    type: ProductTypeEnum().notNull(),
    categoryId: t.integer().notNull().references(() => categoriesTable.id),
    statusId: t.integer().notNull().references(() => productStatusTable.id),
    expirationDate: t.date().notNull(),
    createdAt: t.timestamp().defaultNow(),
    updatedAt: t.timestamp().defaultNow()
});

export const employeeTable = table("employee", {
    id: t.serial().primaryKey(),
    name: t.varchar({ length: 200 }).notNull(),
    cedula: t.varchar({ length: 10 }).notNull().unique(),
    email: t.varchar({ length: 100 }).notNull().unique(),
    phone: t.varchar({ length: 50 }).notNull(),
    createdAt: t.timestamp().defaultNow(),
    updatedAt: t.timestamp().defaultNow()
});

export const familyTable = table("family", {
    id: t.serial().primaryKey(),
    name: t.varchar({ length: 200 }).notNull(),
    cedula: t.varchar({length:10}).default(null),
    createdAt: t.timestamp().defaultNow(),
    updatedAt: t.timestamp().defaultNow()
});

export const typesAssignmentTable = table("typesAssignment" , {
    id: t.serial().primaryKey(),
    name: t.varchar({ length: 30 }).notNull().unique(),
});

export const assignmentTable = table("assignment", {
    id: t.serial().primaryKey(),
    employeeId: t.integer().notNull().references(() => employeeTable.id),
    familyId: t.integer().references(() => familyTable.id),
    type: t.integer().notNull().references(() => typesAssignmentTable.id),
    observation: t.varchar({ length: 200 }).default(""),
    productId: t.integer().notNull().references(() => productsTable.id, { onDelete: 'cascade' } ),
    products: t.integer().notNull().default(0),//numero de productos asignados a un empleado 
    createdAt: t.timestamp().defaultNow(),
    updatedAt: t.timestamp().defaultNow()
});
/* export const assignedProductTable = table("assignedProduct", {
    id: t.serial().primaryKey(),
    assignmentId: t.integer().notNull().references(() => assignmentTable.id),
    productId: t.integer().notNull().references(() => productsTable.id),
    quantity: t.integer().notNull().default(0), //resto del producto en almacen
    createdAt: t.timestamp().defaultNow(),
    updatedAt: t.timestamp().defaultNow()
}); */

//Uso para listar los familiares del empleado, en el formulario de asignacion de productos
export const employeeFamilyTable = table("employeeFamily", {
    id: t.serial().primaryKey(),
    employeeId: t.integer().notNull().references(() => employeeTable.id, { onDelete: 'cascade' }),
    familyId: t.integer().notNull().references(() => familyTable.id, { onDelete: 'cascade' }),
    createdAt: t.timestamp().defaultNow(),
    updatedAt: t.timestamp().defaultNow()
}, 
(table) => [
    t.uniqueIndex("employee_family_unique").on(table.employeeId, table.familyId)
  ]
);

export const rolesTable = table("roles", {
    id: t.serial().primaryKey(),
    name: t.varchar({ length: 40 }).notNull().unique(),
    description: t.varchar({ length: 50 }).default(null),
    isActivate: t.boolean().notNull().default(true),
});

export const logsTable = table("logs", {
    id: t.serial().primaryKey(),
    userId: t.integer().notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
    productId: t.integer().default(null).references(() => productsTable.id, { onDelete: 'cascade' } ),
    action: t.varchar({ length: 100 }).notNull(),
    ipAddress: t.varchar({ length: 200 }).notNull(), //Direccion IP del usuario conectado
    hostname: t.varchar({ length: 200 }).notNull(), //Hostname del usuario conectado
    createdAt: t.timestamp().defaultNow()
});

export const auditReportsTable_temp = table("auditReports_temp", {
    id: t.serial().primaryKey(),
    code: t.varchar().notNull(),
    title: t.varchar({ length: 50 }).notNull().unique(),
    receiver: t.varchar({ length: 50 }).notNull(),
    auditorId: t.integer().notNull().references(() => usersTable.id, { onDelete: 'cascade' }), //Auditor principal del reporte
    additionalAuditorIds: json().$type<number[]>().default([]),
    summary_objective: t.varchar({ length: 50 }),
    summary_scope: t.varchar({ length: 50 }),//Alcance
    summary_methodology: t.varchar({ length: 50 }),
    summary_conclusionAndObservation: t.varchar({ length: 50 }),
    introduction: t.varchar({ length: 200 }),
    detailed_methodology: t.varchar({ length: 150 }),
    findings: t.varchar({ length: 150 }),//Hallazgos
    conclusions: t.varchar({ length: 200 }),
    images: json('images').$type<string>(),
    statusId: t.integer().notNull().references(() => reportStatusTable.id),
    idDuplicate: t.integer().default(null),
    startDate: t.timestamp().notNull(),
    endDate: t.timestamp(),
    updatedAt: t.timestamp().default(null)
});

export const reportStatusTable = table("reportStatus",{
    id: t.serial().primaryKey(),
    status: t.varchar({ length: 30 }).notNull().unique(),
})