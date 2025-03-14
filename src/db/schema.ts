import { integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const roleTable = pgTable("roles",{
  id: serial().primaryKey(),
  code: varchar({ length: 255 }).notNull().unique() ,
})

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  lastname: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  username: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  url_image: varchar({ length: 255 }).notNull(),
  id_departamento: integer().notNull() ,
  id_cargo: integer().notNull(),
  status: integer().notNull(),
  created_at: timestamp(). defaultNow(),
  updated_at: timestamp(). defaultNow(),
  roles_id: integer().notNull().references( ()=>roleTable.id )
});
