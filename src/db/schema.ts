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
  status: integer().notNull().references( ()=>statusTable.id ),
  roles_id: integer().notNull().references( ()=>roleTable.id ),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow(),
});

/*
--1
select * from public.status
--2
SELECT * FROM public.roles;
--3
SELECT * FROM public.dependencies;
--4
SELECT * FROM public.subdependencies;
--5
SELECT * FROM public.users;

INSERT INTO public.status(status)
	VALUES ('Activo'),('Inactivo'),('De baja'),('Vacaciones');

INSERT INTO public.dependencies(
	 name, description, floor)
	VALUES ( 'Tecnologia', 'Gerencia de Tecnologia',2);
	
INSERT INTO public.subdependencies(
	 name, description, dependency_id)
	VALUES 
	('Soporte', null, 1),
	('Redes', null, 1),
	('Desarrollo de software', null, 1);

*/