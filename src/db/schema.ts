import { integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const dependenciesTable = pgTable("dependencies",{
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull().unique(),
  description: varchar({ length: 255 }).notNull(),
  floor: integer().notNull()
})

export const subdependenciesTable = pgTable("subdependencies",{
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull().unique(),
  description: varchar({ length: 255 }),
  dependency_id: integer().notNull().references( ()=>dependenciesTable.id ),
})

export const statusTable = pgTable("status",{
  id: serial().primaryKey(),
  status: varchar({ length: 255 }).notNull().unique(),
})

export const roleTable = pgTable("roles",{
  id: serial().primaryKey(),
  code: varchar({ length: 255 }).notNull().unique() ,
})

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  lastname: varchar({ length: 255 }).notNull(),
  birthdate: varchar().notNull(),//si no coloco nul,me da error en el objeto del actualizar la tabla
  email: varchar({ length: 255 }).notNull().unique(),
  username: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  url_image: varchar({ length: 255 }).notNull(),
  subdependency_id: integer().notNull().references( ()=>subdependenciesTable.id ),
  id_cargo: integer().notNull(),
  contract_type: integer().notNull(),
  // status: integer().notNull(),
  status: integer().notNull().references( ()=>statusTable.id ),
  roles_id: integer().notNull().references( ()=>roleTable.id ),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow(),
});

/*
INSERT INTO public.status(status)
	VALUES ('Activo'),('Inactivo'),('De baja'),('Vacaciones');
*/