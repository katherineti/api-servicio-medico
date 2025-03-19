import { date, integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const roleTable = pgTable("roles",{
  id: serial().primaryKey(),
  code: varchar({ length: 255 }).notNull().unique() ,
})

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  lastname: varchar({ length: 255 }).notNull(),
  // age: integer().notNull(),
  birthdate: varchar().notNull(),//si no coloco nul,me da error en el objeto del actualizar la tabla
  email: varchar({ length: 255 }).notNull().unique(),
  username: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  url_image: varchar({ length: 255 }),
  id_departamento: integer() ,
  id_cargo: integer(),
  // contract_types: integer(),
  status: integer().notNull(),
  roles_id: integer().notNull().references( ()=>roleTable.id ),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow(),
});
