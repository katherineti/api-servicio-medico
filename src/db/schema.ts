import { sql } from "drizzle-orm";
import { check, integer, numeric, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const typesContractsTable = pgTable("types_contracts",{
  id: serial().primaryKey(),
  type_contract: varchar({ length: 255 }).notNull().unique(),
})

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
    gender: varchar({ length: 1 }).notNull(), 
    birthdate: varchar().notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    username: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
    url_image: varchar({ length: 255 }).notNull(),
    subdependency_id: integer().notNull().references(() => subdependenciesTable.id),
    job_title: varchar({ length: 255 }).notNull(),
    contract_type: integer().notNull().references(() => typesContractsTable.id),
    salary: numeric("salary", { precision: 10, scale: 2 }).default("0").notNull(),
    roles_id: integer().notNull().references(() => roleTable.id),
    created_at: timestamp().defaultNow(),
    updated_at: timestamp().defaultNow(),
    status: integer().notNull().references(() => statusTable.id),
}, (table) => [ 
    // check("salary_positive", sql`${table.salary} >= 0`), // Restricción CHECK
    check("valid_gender", sql`${table.gender} IN ('F', 'M')`), // Restricción CHECK para gender
]);

/*
export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    lastname: varchar({ length: 255 }).notNull(),
    birthdate: varchar().notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    username: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
    url_image: varchar({ length: 255 }).notNull(),
    subdependency_id: integer().notNull().references(() => subdependenciesTable.id),
    job_title: varchar({ length: 255 }).notNull(),
    contract_type: integer().notNull().references(() => typesContractsTable.id),
    status: integer().notNull().references(() => statusTable.id),
    roles_id: integer().notNull().references(() => roleTable.id),
    salary: numeric("salary", { precision: 10, scale: 2 }).default("0").notNull(),
    created_at: timestamp().defaultNow(),
    updated_at: timestamp().defaultNow(),
}, (table) => { // Segundo argumento de pgTable
    return {
        salaryCheck: check("salary_positive", sql`${table.salary} >= 0`),
    };
});*/

/*
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  lastname: varchar({ length: 255 }).notNull(),
  birthdate: varchar().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  username: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  url_image: varchar({ length: 255 }).notNull(),
  subdependency_id: integer().notNull().references( ()=>subdependenciesTable.id ),
  job_title: varchar({ length: 255 }).notNull(),
  contract_type: integer().notNull().references( ()=>typesContractsTable.id ),
  status: integer().notNull().references( ()=>statusTable.id ),
  roles_id: integer().notNull().references( ()=>roleTable.id ),
  salary: numeric("salary", { precision: 10, scale: 2 }).default("0").notNull(),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow(),
}, (table) => {
  return {
      salaryCheck: check("salary_positive", sql`${table.salary} >= 0`),
  };
}
);*/

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
	VALUES ('Activo'),('Inactivo'),('De baja'),('Vacaciones
	
INSERT INTO public.types_contracts(type_contract)
	VALUES ('Indefinido'),('Temporal'),('Fijo');

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