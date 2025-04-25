import { integer, pgTable, serial, timestamp, varchar, boolean, pgEnum, date } from "drizzle-orm/pg-core";

// export const rolesEnum = pgEnum("roles", ["admin", "user"]);
export const rolesEnum = pgEnum("roles", ["admin", "almacen","medico","auditor"]);
export const ProductTypeEnum = pgEnum("ProductType", ["Medicamentos", "Uniformes","Equipos odontologicos"]);

export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
    // role: rolesEnum().default("user"),
    role: rolesEnum(),
    isActivate: boolean('isActivate').notNull().default(true),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow()
});

export const categoriesTable = pgTable("categories", {
    id: serial().primaryKey(),
    name: varchar({ length: 50 }).notNull(),
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
    url_image: varchar({ length: 255 }).default(''),
    description: varchar({ length: 255 }).notNull(),
    code: varchar({ length: 50 }).notNull().unique(),
    stock: integer().notNull().default(0),
    name: varchar({ length: 100 }).notNull(),
    categoryId: integer().notNull().references(() => categoriesTable.id),
    type: ProductTypeEnum().notNull(),
    statusId: integer().notNull().references(() => productStatusTable.id),
    //modificaciones
    // expirationDate: date("expiration_date", { mode: "date" }),
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