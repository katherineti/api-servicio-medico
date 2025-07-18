CREATE TYPE "public"."ProductType" AS ENUM('Medicamentos', 'Uniformes', 'Equipos odontologicos');--> statement-breakpoint
CREATE TYPE "public"."roles_enum" AS ENUM('admin', 'almacen', 'medico', 'auditor');--> statement-breakpoint
CREATE TABLE "assignment" (
	"id" serial PRIMARY KEY NOT NULL,
	"employeeId" integer NOT NULL,
	"familyId" integer,
	"type" integer NOT NULL,
	"observation" varchar(200) DEFAULT '',
	"productId" integer NOT NULL,
	"products" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "auditReports_temp" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar NOT NULL,
	"title" varchar(50) NOT NULL,
	"receiver" varchar(50) NOT NULL,
	"auditorId" integer NOT NULL,
	"additionalAuditorIds" json DEFAULT '[]'::json,
	"summary_objective" varchar(50),
	"summary_scope" varchar(50),
	"summary_methodology" varchar(50),
	"summary_conclusionAndObservation" varchar(50),
	"introduction" varchar(200),
	"detailed_methodology" varchar(150),
	"findings" varchar(150),
	"conclusions" varchar(200),
	"images" json,
	"statusId" integer NOT NULL,
	"idDuplicate" integer DEFAULT null,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp,
	"updatedAt" timestamp DEFAULT null,
	CONSTRAINT "auditReports_temp_title_unique" UNIQUE("title")
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
CREATE TABLE "employeeFamily" (
	"id" serial PRIMARY KEY NOT NULL,
	"employeeId" integer NOT NULL,
	"familyId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "employee" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"cedula" varchar(10) NOT NULL,
	"email" varchar(100) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "employee_cedula_unique" UNIQUE("cedula"),
	CONSTRAINT "employee_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "family" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"cedula" varchar(10) DEFAULT null,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"productId" integer DEFAULT null,
	"action" varchar(100) NOT NULL,
	"ipAddress" varchar(200) NOT NULL,
	"hostname" varchar(200) NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "medicalPrescriptions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "medicalPrescriptions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"medicalReportId" integer,
	"place" varchar(100) NOT NULL,
	"doctorId" integer NOT NULL,
	"mpps" varchar(100) NOT NULL,
	"patientId" integer NOT NULL,
	"recipeContent" varchar(700) NOT NULL,
	"indications" varchar(700) DEFAULT null,
	"expirationDate" date NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "medicalReports" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "medicalReports_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"patientId" integer NOT NULL,
	"doctorId" integer NOT NULL,
	"description" varchar(700) DEFAULT null,
	"insurance" varchar(100) DEFAULT null,
	"apsCenter" varchar(100) DEFAULT null,
	"mppsCM" varchar(100) DEFAULT null,
	"isActivate" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"birthdate" date DEFAULT null,
	"age" integer NOT NULL,
	"cedula" varchar(10) NOT NULL,
	"email" varchar(100) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"gender" varchar(1) NOT NULL,
	"civilStatus" varchar(1) NOT NULL,
	"children" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "patients_cedula_unique" UNIQUE("cedula"),
	CONSTRAINT "patients_email_unique" UNIQUE("email")
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
	"providerId" integer NOT NULL,
	"description" varchar(255) NOT NULL,
	"url_image" varchar(255) DEFAULT '',
	"type" integer NOT NULL,
	"categoryId" integer NOT NULL,
	"statusId" integer NOT NULL,
	"expirationDate" date DEFAULT null,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "products_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "providers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"email" varchar(100) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "providers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "reportStatus" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" varchar(30) NOT NULL,
	CONSTRAINT "reportStatus_status_unique" UNIQUE("status")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(40) NOT NULL,
	"description" varchar(50) DEFAULT null,
	"isActivate" boolean DEFAULT true NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "typesAssignment" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(30) NOT NULL,
	CONSTRAINT "typesAssignment_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "typesProducts" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "ProductType" NOT NULL,
	CONSTRAINT "typesProducts_type_unique" UNIQUE("type")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(200) NOT NULL,
	"cedula" varchar(10) NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" integer NOT NULL,
	"isActivate" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "users_cedula_unique" UNIQUE("cedula"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_employeeId_employee_id_fk" FOREIGN KEY ("employeeId") REFERENCES "public"."employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_familyId_family_id_fk" FOREIGN KEY ("familyId") REFERENCES "public"."family"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_type_typesAssignment_id_fk" FOREIGN KEY ("type") REFERENCES "public"."typesAssignment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auditReports_temp" ADD CONSTRAINT "auditReports_temp_auditorId_users_id_fk" FOREIGN KEY ("auditorId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auditReports_temp" ADD CONSTRAINT "auditReports_temp_statusId_reportStatus_id_fk" FOREIGN KEY ("statusId") REFERENCES "public"."reportStatus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employeeFamily" ADD CONSTRAINT "employeeFamily_employeeId_employee_id_fk" FOREIGN KEY ("employeeId") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employeeFamily" ADD CONSTRAINT "employeeFamily_familyId_family_id_fk" FOREIGN KEY ("familyId") REFERENCES "public"."family"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "logs" ADD CONSTRAINT "logs_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "logs" ADD CONSTRAINT "logs_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicalPrescriptions" ADD CONSTRAINT "medicalPrescriptions_medicalReportId_medicalReports_id_fk" FOREIGN KEY ("medicalReportId") REFERENCES "public"."medicalReports"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicalPrescriptions" ADD CONSTRAINT "medicalPrescriptions_doctorId_users_id_fk" FOREIGN KEY ("doctorId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicalPrescriptions" ADD CONSTRAINT "medicalPrescriptions_patientId_patients_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicalReports" ADD CONSTRAINT "medicalReports_patientId_patients_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicalReports" ADD CONSTRAINT "medicalReports_doctorId_users_id_fk" FOREIGN KEY ("doctorId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_providerId_providers_id_fk" FOREIGN KEY ("providerId") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_type_typesProducts_id_fk" FOREIGN KEY ("type") REFERENCES "public"."typesProducts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_statusId_productStatus_id_fk" FOREIGN KEY ("statusId") REFERENCES "public"."productStatus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_roles_id_fk" FOREIGN KEY ("role") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "employee_family_unique" ON "employeeFamily" USING btree ("employeeId","familyId");--> statement-breakpoint
CREATE INDEX "idx_providers_name_lower" ON "providers" USING btree (lower("name"));