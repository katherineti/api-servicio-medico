import { pgEnum, pgTable as table } from "drizzle-orm/pg-core";
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
    expirationDate: t.timestamp().notNull(),
    createdAt: t.timestamp().defaultNow(),
    updatedAt: t.timestamp().defaultNow()
});
/* export const expiredProductsTable = table("expiredProducts", {
    id: t.serial().primaryKey(),
    productId: t.integer().notNull().references(() => productsTable.id),
    expirationDate: t.date("expirationDate", { mode: "date" }),
    createdAt: t.timestamp().defaultNow(),
    updatedAt: t.timestamp().defaultNow()
}); */
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
    productId: t.integer().notNull().references(() => productsTable.id),
    products: t.integer().notNull().default(0),//numero de productos asignados a un empleado 
    createdAt: t.timestamp().defaultNow(),
    updatedAt: t.timestamp().defaultNow()
});
export const assignedProductTable = table("assignedProduct", {
    id: t.serial().primaryKey(),
    assignmentId: t.integer().notNull().references(() => assignmentTable.id),
    productId: t.integer().notNull().references(() => productsTable.id),
    quantity: t.integer().notNull().default(0), //resto del producto en almacen
    createdAt: t.timestamp().defaultNow(),
    updatedAt: t.timestamp().defaultNow()
});

//uso para listar los familiares del empleado, en el formulario de asignacion de productos
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