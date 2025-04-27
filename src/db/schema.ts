import { integer, pgTable, serial, timestamp, varchar, boolean, pgEnum, date } from "drizzle-orm/pg-core";

// export const rolesEnum = pgEnum("roles", ["admin", "user"]);
export const rolesEnum = pgEnum("roles", ["admin", "almacen","medico","auditor"]);
export const ProductTypeEnum = pgEnum("ProductType", ["Medicamentos", "Uniformes","Equipos odontologicos"]);

export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 200 }).notNull(),
    email: varchar().notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
    // role: rolesEnum().default("user"),
    role: rolesEnum(),
    isActivate: boolean('isActivate').notNull().default(true),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow()
});
export const categoriesTable = pgTable("categories", {
    id: serial().primaryKey(),
    name: varchar({ length: 30 }).notNull(),
    type: ProductTypeEnum().notNull(),
    created_at: timestamp().defaultNow(),
    updated_at: timestamp().defaultNow()
});
export const productStatusTable = pgTable("productStatus",{
  id: serial().primaryKey(),
  status: varchar({ length: 30 }).notNull().unique(),
})
export const productsTable = pgTable("products", {
    id: serial().primaryKey(),
    code: varchar({ length: 50 }).notNull().unique(),
    stock: integer().notNull().default(0),
    name: varchar({ length: 100 }).notNull(),
    description: varchar({ length: 255 }).notNull(),
    url_image: varchar({ length: 255 }).default(''),
    type: ProductTypeEnum().notNull(),
    categoryId: integer().notNull().references(() => categoriesTable.id),
    statusId: integer().notNull().references(() => productStatusTable.id),
    //modificaciones
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow()
});
export const expiredProductsTable = pgTable("expiredProducts", {
    id: serial().primaryKey(),
    productId: integer().notNull().references(() => productsTable.id),
    expirationDate: date("expirationDate", { mode: "date" }),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow()
});
export const employeeTable = pgTable("employee", {
    id: serial().primaryKey(),
    name: varchar({ length: 200 }).notNull(),
    cedula: varchar({ length: 30 }).notNull().unique(),
    email: varchar({ length: 100 }).notNull().unique(),
    phone: varchar({ length: 255 }).notNull(),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow()
});
export const familyTable = pgTable("family", {
    id: serial().primaryKey(),
    name: varchar({ length: 200 }).notNull(),
    cedula: varchar({ length: 30 }).notNull().unique(),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow()
});
export const typesAssignmentTable = pgTable("typesAssignment" , {
    id: serial().primaryKey(),
    name: varchar({ length: 30 }).notNull().unique(),
});
export const assignmentTable = pgTable("assignment", {
    id: serial().primaryKey(),
    employeeId: integer().notNull().references(() => employeeTable.id),
    // familyId: integer().notNull().references(() => familyTable.id),
    familyId: integer().references(() => familyTable.id),
    type: integer().notNull().references(() => typesAssignmentTable.id),
    observation: varchar({ length: 200 }).default(""),
    // maxProducts: integer().default(0),
    productId: integer().notNull().references(() => productsTable.id),
    products: integer().notNull().default(0),//numero de productos asignados a un empleado 
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow()
});
export const assignedProductTable = pgTable("assignedProduct", {
    id: serial().primaryKey(),
    assignmentId: integer().notNull().references(() => assignmentTable.id),
    productId: integer().notNull().references(() => productsTable.id),
    quantity: integer().notNull().default(0), //resto del producto en almacen
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow()
});