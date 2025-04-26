CREATE TYPE "public"."ProductType" AS ENUM('Medicamentos', 'Uniformes', 'Equipos odontologicos');--> statement-breakpoint
CREATE TYPE "public"."roles" AS ENUM('admin', 'almacen', 'medico', 'auditor');--> statement-breakpoint
CREATE TABLE "assignedProduct" (
	"id" serial PRIMARY KEY NOT NULL,
	"assignmentId" integer NOT NULL,
	"productId" integer NOT NULL,
	"quantity" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assignment" (
	"id" serial PRIMARY KEY NOT NULL,
	"employeeId" integer NOT NULL,
	"familyId" integer NOT NULL,
	"type" integer NOT NULL,
	"observation" varchar(200) NOT NULL,
	"maxProducts" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(30) NOT NULL,
	"type" "ProductType" NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "employee" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"cedula" varchar(30) NOT NULL,
	"email" varchar(100) NOT NULL,
	"phone" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "employee_cedula_unique" UNIQUE("cedula"),
	CONSTRAINT "employee_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "expiredProducts" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"expirationDate" date,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "family" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"cedula" varchar(30) NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "family_cedula_unique" UNIQUE("cedula")
);
--> statement-breakpoint
CREATE TABLE "productStatus" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" varchar(30) NOT NULL,
	CONSTRAINT "productStatus_status_unique" UNIQUE("status")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(255) NOT NULL,
	"url_image" varchar(255) DEFAULT '',
	"type" "ProductType" NOT NULL,
	"categoryId" integer NOT NULL,
	"statusId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "products_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "typesAssignment" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(30) NOT NULL,
	CONSTRAINT "typesAssignment_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "roles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "roles" CASCADE;--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_username_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_roles_id_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" SET DATA TYPE varchar(200);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "roles";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "isActivate" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updatedAt" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "assignedProduct" ADD CONSTRAINT "assignedProduct_assignmentId_assignment_id_fk" FOREIGN KEY ("assignmentId") REFERENCES "public"."assignment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignedProduct" ADD CONSTRAINT "assignedProduct_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_employeeId_employee_id_fk" FOREIGN KEY ("employeeId") REFERENCES "public"."employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_familyId_family_id_fk" FOREIGN KEY ("familyId") REFERENCES "public"."family"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_type_typesAssignment_id_fk" FOREIGN KEY ("type") REFERENCES "public"."typesAssignment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expiredProducts" ADD CONSTRAINT "expiredProducts_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_statusId_productStatus_id_fk" FOREIGN KEY ("statusId") REFERENCES "public"."productStatus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "lastname";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "age";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "username";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "url_image";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "id_departamento";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "id_cargo";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "roles_id";