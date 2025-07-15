CREATE TABLE "medicalReports" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "medicalReports_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"patientId" integer NOT NULL,
	"doctorId" integer NOT NULL,
	"description" varchar(300) DEFAULT null,
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
ALTER TABLE "medicalReports" ADD CONSTRAINT "medicalReports_patientId_patients_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicalReports" ADD CONSTRAINT "medicalReports_doctorId_users_id_fk" FOREIGN KEY ("doctorId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;