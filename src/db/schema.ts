import { integer, pgTable, serial, timestamp, varchar, boolean, pgEnum } from "drizzle-orm/pg-core";

export const rolesEnum = pgEnum("roles", ["admin", "user"]);
export const ProductTypeEnum = pgEnum("ProductType", ["Medicamentos", "Uniformes","Equipos_Odontologicos"]);

export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
    role: rolesEnum().default("user"),
    isActivate: boolean('isActivate').notNull().default(true),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow()
});

export const categoriesTable = pgTable("categories", {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    type: ProductTypeEnum().notNull(),
    created_at: timestamp().defaultNow(),
    updated_at: timestamp().defaultNow()
});
export const productStatusTable = pgTable("productStatus",{
  id: serial().primaryKey(),
  status: varchar({ length: 255 }).notNull().unique(),
})
export const productsTable = pgTable("products", {
    id: serial().primaryKey(),
    url_image: varchar({ length: 255 }).notNull(),
    description: varchar({ length: 255 }).notNull(),
    code: varchar({ length: 255 }).notNull().unique(),
    stock: integer().notNull().default(0),
    name: varchar({ length: 255 }).notNull(),
    categoryId: integer().notNull().references(() => categoriesTable.id),
    type: ProductTypeEnum().notNull(),
    statusId: integer().notNull().references(() => productStatusTable.id),
    //modificaciones
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow()
});
export const employeeTable = pgTable("employee", {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    cedula: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    phone: varchar({ length: 255 }).notNull(),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow()
});
export const familyTable = pgTable("family", {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    cedula: varchar({ length: 255 }).notNull(),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow()
});
export const assignmentTable = pgTable("assignment", {
    id: serial().primaryKey(),
    employeeId: integer().notNull().references(() => employeeTable.id),
    familyId: integer().notNull().references(() => familyTable.id),
    type: varchar({ length: 255 }).notNull().default("tipo de asignacion"),
    observation: varchar({ length: 255 }).notNull(),
    maxProducts: integer().default(0),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow()
});
export const assignedProductTable = pgTable("assignedProduct", {
    id: serial().primaryKey(),
    assignmentId: integer().notNull().references(() => assignmentTable.id),
    productId: integer().notNull().references(() => productsTable.id),
    quantity: integer().default(0),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow()
});