--
-- PostgreSQL database dump
--

\restrict UyNQbhQFUsmozbNzaLM6fTVBXVyA1ToXBSzT09qp4AlSNh0ZYDMkw9tiJIsBqRY

-- Dumped from database version 16.9 (415ebe8)
-- Dumped by pg_dump version 16.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: curso_owner
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO curso_owner;

--
-- Name: ProductType; Type: TYPE; Schema: public; Owner: curso_owner
--

CREATE TYPE public."ProductType" AS ENUM (
    'Medicamentos',
    'Uniformes',
    'Equipos odontologicos'
);


ALTER TYPE public."ProductType" OWNER TO curso_owner;

--
-- Name: roles_enum; Type: TYPE; Schema: public; Owner: curso_owner
--

CREATE TYPE public.roles_enum AS ENUM (
    'admin',
    'almacen',
    'medico',
    'auditor'
);


ALTER TYPE public.roles_enum OWNER TO curso_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: curso_owner
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO curso_owner;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: curso_owner
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO curso_owner;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: curso_owner
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: assignment; Type: TABLE; Schema: public; Owner: curso_owner
--

CREATE TABLE public.assignment (
    id integer NOT NULL,
    "employeeId" integer,
    "medicoId" integer,
    "familyId" integer,
    type integer NOT NULL,
    observation character varying(200) DEFAULT ''::character varying,
    "productId" integer NOT NULL,
    products integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.assignment OWNER TO curso_owner;

--
-- Name: assignment_id_seq; Type: SEQUENCE; Schema: public; Owner: curso_owner
--

CREATE SEQUENCE public.assignment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assignment_id_seq OWNER TO curso_owner;

--
-- Name: assignment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: curso_owner
--

ALTER SEQUENCE public.assignment_id_seq OWNED BY public.assignment.id;


--
-- Name: auditReports_temp; Type: TABLE; Schema: public; Owner: curso_owner
--

CREATE TABLE public."auditReports_temp" (
    id integer NOT NULL,
    code character varying NOT NULL,
    title character varying(50) NOT NULL,
    receiver character varying(50) NOT NULL,
    "auditorId" integer NOT NULL,
    "additionalAuditorIds" json DEFAULT '[]'::json,
    summary_objective character varying(50),
    summary_scope character varying(50),
    summary_methodology character varying(50),
    "summary_conclusionAndObservation" character varying(50),
    introduction character varying(200),
    detailed_methodology character varying(150),
    findings character varying(150),
    conclusions character varying(200),
    images json,
    "statusId" integer NOT NULL,
    "idDuplicate" integer,
    "startDate" timestamp without time zone NOT NULL,
    "endDate" timestamp without time zone,
    "updatedAt" timestamp without time zone
);


ALTER TABLE public."auditReports_temp" OWNER TO curso_owner;

--
-- Name: auditReports_temp_id_seq; Type: SEQUENCE; Schema: public; Owner: curso_owner
--

CREATE SEQUENCE public."auditReports_temp_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."auditReports_temp_id_seq" OWNER TO curso_owner;

--
-- Name: auditReports_temp_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: curso_owner
--

ALTER SEQUENCE public."auditReports_temp_id_seq" OWNED BY public."auditReports_temp".id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: curso_owner
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(30) NOT NULL,
    type public."ProductType" NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.categories OWNER TO curso_owner;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: curso_owner
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO curso_owner;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: curso_owner
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: employee; Type: TABLE; Schema: public; Owner: curso_owner
--

CREATE TABLE public.employee (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    cedula character varying(12) NOT NULL,
    email character varying(100) NOT NULL,
    phone character varying(50) NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.employee OWNER TO curso_owner;

--
-- Name: employeeFamily; Type: TABLE; Schema: public; Owner: curso_owner
--

CREATE TABLE public."employeeFamily" (
    id integer NOT NULL,
    "employeeId" integer NOT NULL,
    "familyId" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now()
);


ALTER TABLE public."employeeFamily" OWNER TO curso_owner;

--
-- Name: employeeFamily_id_seq; Type: SEQUENCE; Schema: public; Owner: curso_owner
--

CREATE SEQUENCE public."employeeFamily_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."employeeFamily_id_seq" OWNER TO curso_owner;

--
-- Name: employeeFamily_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: curso_owner
--

ALTER SEQUENCE public."employeeFamily_id_seq" OWNED BY public."employeeFamily".id;


--
-- Name: employee_id_seq; Type: SEQUENCE; Schema: public; Owner: curso_owner
--

CREATE SEQUENCE public.employee_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_id_seq OWNER TO curso_owner;

--
-- Name: employee_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: curso_owner
--

ALTER SEQUENCE public.employee_id_seq OWNED BY public.employee.id;


--
-- Name: family; Type: TABLE; Schema: public; Owner: curso_owner
--

CREATE TABLE public.family (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    cedula character varying(12) DEFAULT NULL::character varying,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.family OWNER TO curso_owner;

--
-- Name: family_id_seq; Type: SEQUENCE; Schema: public; Owner: curso_owner
--

CREATE SEQUENCE public.family_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.family_id_seq OWNER TO curso_owner;

--
-- Name: family_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: curso_owner
--

ALTER SEQUENCE public.family_id_seq OWNED BY public.family.id;


--
-- Name: logs; Type: TABLE; Schema: public; Owner: curso_owner
--

CREATE TABLE public.logs (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "productId" integer,
    action character varying(100) NOT NULL,
    "ipAddress" character varying(200) NOT NULL,
    hostname character varying(200) NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.logs OWNER TO curso_owner;

--
-- Name: logs_id_seq; Type: SEQUENCE; Schema: public; Owner: curso_owner
--

CREATE SEQUENCE public.logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.logs_id_seq OWNER TO curso_owner;

--
-- Name: logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: curso_owner
--

ALTER SEQUENCE public.logs_id_seq OWNED BY public.logs.id;


--
-- Name: medicalPrescriptions; Type: TABLE; Schema: public; Owner: curso_owner
--

CREATE TABLE public."medicalPrescriptions" (
    id integer NOT NULL,
    "medicalReportId" integer,
    place character varying(100) NOT NULL,
    "doctorId" integer NOT NULL,
    mpps character varying(100) NOT NULL,
    "patientId" integer NOT NULL,
    "recipeContent" character varying(700) NOT NULL,
    indications character varying(700) DEFAULT NULL::character varying,
    "expirationDate" date NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now()
);


ALTER TABLE public."medicalPrescriptions" OWNER TO curso_owner;

--
-- Name: medicalPrescriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: curso_owner
--

ALTER TABLE public."medicalPrescriptions" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."medicalPrescriptions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: medicalReports; Type: TABLE; Schema: public; Owner: curso_owner
--

CREATE TABLE public."medicalReports" (
    id integer NOT NULL,
    "patientId" integer NOT NULL,
    "doctorId" integer NOT NULL,
    description character varying(700) DEFAULT NULL::character varying,
    insurance character varying(100) DEFAULT NULL::character varying,
    "apsCenter" character varying(100) DEFAULT NULL::character varying,
    "mppsCM" character varying(100) DEFAULT NULL::character varying,
    "isActivate" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now()
);


ALTER TABLE public."medicalReports" OWNER TO curso_owner;

--
-- Name: medicalReports_id_seq; Type: SEQUENCE; Schema: public; Owner: curso_owner
--

ALTER TABLE public."medicalReports" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."medicalReports_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: patients; Type: TABLE; Schema: public; Owner: curso_owner
--

CREATE TABLE public.patients (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    birthdate date,
    "placeBirth" character varying(40) NOT NULL,
    age integer NOT NULL,
    cedula character varying(12) NOT NULL,
    email character varying(100) NOT NULL,
    phone character varying(50) NOT NULL,
    gender character varying(1) NOT NULL,
    "civilStatus" character varying(1) NOT NULL,
    children integer DEFAULT 0 NOT NULL,
    "isActivate" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.patients OWNER TO curso_owner;

--
-- Name: patients_id_seq; Type: SEQUENCE; Schema: public; Owner: curso_owner
--

CREATE SEQUENCE public.patients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patients_id_seq OWNER TO curso_owner;

--
-- Name: patients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: curso_owner
--

ALTER SEQUENCE public.patients_id_seq OWNED BY public.patients.id;


--
-- Name: productStatus; Type: TABLE; Schema: public; Owner: curso_owner
--

CREATE TABLE public."productStatus" (
    id integer NOT NULL,
    status character varying(30) NOT NULL
);


ALTER TABLE public."productStatus" OWNER TO curso_owner;

--
-- Name: productStatus_id_seq; Type: SEQUENCE; Schema: public; Owner: curso_owner
--

CREATE SEQUENCE public."productStatus_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."productStatus_id_seq" OWNER TO curso_owner;

--
-- Name: productStatus_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: curso_owner
--

ALTER SEQUENCE public."productStatus_id_seq" OWNED BY public."productStatus".id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: curso_owner
--

CREATE TABLE public.products (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    name character varying(100) NOT NULL,
    "providerId" integer NOT NULL,
    description character varying(255) NOT NULL,
    url_image character varying(255) DEFAULT ''::character varying,
    type integer NOT NULL,
    "categoryId" integer NOT NULL,
    "statusId" integer NOT NULL,
    "expirationDate" date,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.products OWNER TO curso_owner;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: curso_owner
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO curso_owner;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: curso_owner
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: providers; Type: TABLE; Schema: public; Owner: curso_owner
--

CREATE TABLE public.providers (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    email character varying(100) NOT NULL,
    phone character varying(50) NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.providers OWNER TO curso_owner;

--
-- Name: providers_id_seq; Type: SEQUENCE; Schema: public; Owner: curso_owner
--

CREATE SEQUENCE public.providers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.providers_id_seq OWNER TO curso_owner;

--
-- Name: providers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: curso_owner
--

ALTER SEQUENCE public.providers_id_seq OWNED BY public.providers.id;


--
-- Name: reportStatus; Type: TABLE; Schema: public; Owner: curso_owner
--

CREATE TABLE public."reportStatus" (
    id integer NOT NULL,
    status character varying(30) NOT NULL
);


ALTER TABLE public."reportStatus" OWNER TO curso_owner;

--
-- Name: reportStatus_id_seq; Type: SEQUENCE; Schema: public; Owner: curso_owner
--

CREATE SEQUENCE public."reportStatus_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."reportStatus_id_seq" OWNER TO curso_owner;

--
-- Name: reportStatus_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: curso_owner
--

ALTER SEQUENCE public."reportStatus_id_seq" OWNED BY public."reportStatus".id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: curso_owner
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(40) NOT NULL,
    description character varying(50) DEFAULT NULL::character varying,
    "isActivate" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.roles OWNER TO curso_owner;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: curso_owner
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO curso_owner;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: curso_owner
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: typesAssignment; Type: TABLE; Schema: public; Owner: curso_owner
--

CREATE TABLE public."typesAssignment" (
    id integer NOT NULL,
    name character varying(30) NOT NULL
);


ALTER TABLE public."typesAssignment" OWNER TO curso_owner;

--
-- Name: typesAssignment_id_seq; Type: SEQUENCE; Schema: public; Owner: curso_owner
--

CREATE SEQUENCE public."typesAssignment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."typesAssignment_id_seq" OWNER TO curso_owner;

--
-- Name: typesAssignment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: curso_owner
--

ALTER SEQUENCE public."typesAssignment_id_seq" OWNED BY public."typesAssignment".id;


--
-- Name: typesProducts; Type: TABLE; Schema: public; Owner: curso_owner
--

CREATE TABLE public."typesProducts" (
    id integer NOT NULL,
    type public."ProductType" NOT NULL
);


ALTER TABLE public."typesProducts" OWNER TO curso_owner;

--
-- Name: typesProducts_id_seq; Type: SEQUENCE; Schema: public; Owner: curso_owner
--

CREATE SEQUENCE public."typesProducts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."typesProducts_id_seq" OWNER TO curso_owner;

--
-- Name: typesProducts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: curso_owner
--

ALTER SEQUENCE public."typesProducts_id_seq" OWNED BY public."typesProducts".id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: curso_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    cedula character varying(12) NOT NULL,
    email character varying NOT NULL,
    password character varying(255) NOT NULL,
    role integer NOT NULL,
    "isActivate" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO curso_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: curso_owner
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: curso_owner
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: assignment id; Type: DEFAULT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.assignment ALTER COLUMN id SET DEFAULT nextval('public.assignment_id_seq'::regclass);


--
-- Name: auditReports_temp id; Type: DEFAULT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public."auditReports_temp" ALTER COLUMN id SET DEFAULT nextval('public."auditReports_temp_id_seq"'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: employee id; Type: DEFAULT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.employee ALTER COLUMN id SET DEFAULT nextval('public.employee_id_seq'::regclass);


--
-- Name: employeeFamily id; Type: DEFAULT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public."employeeFamily" ALTER COLUMN id SET DEFAULT nextval('public."employeeFamily_id_seq"'::regclass);


--
-- Name: family id; Type: DEFAULT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.family ALTER COLUMN id SET DEFAULT nextval('public.family_id_seq'::regclass);


--
-- Name: logs id; Type: DEFAULT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.logs ALTER COLUMN id SET DEFAULT nextval('public.logs_id_seq'::regclass);


--
-- Name: patients id; Type: DEFAULT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.patients ALTER COLUMN id SET DEFAULT nextval('public.patients_id_seq'::regclass);


--
-- Name: productStatus id; Type: DEFAULT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public."productStatus" ALTER COLUMN id SET DEFAULT nextval('public."productStatus_id_seq"'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: providers id; Type: DEFAULT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.providers ALTER COLUMN id SET DEFAULT nextval('public.providers_id_seq'::regclass);


--
-- Name: reportStatus id; Type: DEFAULT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public."reportStatus" ALTER COLUMN id SET DEFAULT nextval('public."reportStatus_id_seq"'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: typesAssignment id; Type: DEFAULT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public."typesAssignment" ALTER COLUMN id SET DEFAULT nextval('public."typesAssignment_id_seq"'::regclass);


--
-- Name: typesProducts id; Type: DEFAULT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public."typesProducts" ALTER COLUMN id SET DEFAULT nextval('public."typesProducts_id_seq"'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: curso_owner
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
\.


--
-- Data for Name: assignment; Type: TABLE DATA; Schema: public; Owner: curso_owner
--

COPY public.assignment (id, "employeeId", "medicoId", "familyId", type, observation, "productId", products, "createdAt", "updatedAt") FROM stdin;
14	\N	36	\N	1	test almacen movil	2	4	2025-08-31 22:04:46.72365	2025-08-31 22:04:46.72365
15	17	\N	30	2	test	22	1	2025-08-31 22:37:45.312825	2025-08-31 22:37:45.312825
16	16	\N	31	1	test	10	1	2025-08-31 22:41:46.880541	2025-08-31 22:41:46.880541
17	16	\N	32	1	test	20	1	2025-08-31 22:44:40.078306	2025-08-31 22:44:40.078306
18	16	\N	\N	1	asignacion al empleado V-1234567890	26	1	2025-09-06 23:29:50.461163	2025-09-06 23:29:50.461163
19	17	\N	\N	2	test	24	1	2025-09-06 23:30:42.121773	2025-09-06 23:30:42.121773
20	17	\N	\N	1	test	24	1	2025-09-06 23:51:51.383609	2025-09-06 23:51:51.383609
21	16	\N	\N	1	test	2	1	2025-09-07 01:16:50.331603	2025-09-07 01:16:50.331603
22	16	\N	32	1	test	25	1	2025-09-07 01:25:29.98761	2025-09-07 01:25:29.98761
\.


--
-- Data for Name: auditReports_temp; Type: TABLE DATA; Schema: public; Owner: curso_owner
--

COPY public."auditReports_temp" (id, code, title, receiver, "auditorId", "additionalAuditorIds", summary_objective, summary_scope, summary_methodology, "summary_conclusionAndObservation", introduction, detailed_methodology, findings, conclusions, images, "statusId", "idDuplicate", "startDate", "endDate", "updatedAt") FROM stdin;
31	O2998aaae66-f519-4408-b8e1-9fdcf88d0388.31.2025	test2	test	29	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2	\N	2025-09-08 15:52:26.267	\N	\N
38	D29bc872b98-c781-41c6-bd39-44f9fecacc41.38.2025	titulo mo	destinatario test	29	[]	o mo	o	o	o	i mod	i	i	i	["/uploads/reports/Id 25/report-1757213332016-731714450-auditoria.jpg"]	3	37	2025-09-07 02:47:11.084	2025-09-08 17:34:08.37	2025-09-08 17:34:18.042
33	O29aa36bc53-f361-4ec7-ba27-7c35da7f4542.33.2025	test4	t	29	[]	t	t	t	t	t	t	t	t	\N	3	\N	2025-09-08 15:55:33.684	2025-09-08 15:55:47.431	2025-09-08 17:52:30.975
32	O29225815ff-1a34-40bd-abdc-4cb92b91992d.32.2025	test3	test	29	[]	t	t	t	t	\N	\N	\N	\N	\N	3	\N	2025-09-08 15:53:15.946	\N	2025-09-08 16:31:20.306
40	D29e11109cc-6e56-406c-b495-9f2d7a640501.40.2025	test4	t	29	[]	t	t	t	t	t	t	t	t	\N	5	33	2025-09-08 15:55:33.684	2025-09-08 17:55:53.958	\N
41	O2945957498-32ac-4e65-a95b-1d685d507d79.41.2025	Test3_	test	29	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2	\N	2025-09-08 18:03:17.995	\N	\N
39	D2935304f32-4ee6-47d5-889a-bb91a509a4ef.39.2025	titulo mo0	destinatario test	29	[]	o mo	o	o	o	i mod	i	i	i	["/uploads/reports/Id 25/report-1757213332016-731714450-auditoria.jpg"]	5	38	2025-09-07 02:47:11.084	2025-09-08 17:34:43.308	\N
25	O2969709346-e513-4e4e-ba0c-46a9e979f6b0.25.2025	titulo	destinatario test	29	[]	o	o	o	o	i	i	i	i	["/uploads/reports/Id 25/report-1757213332016-731714450-auditoria.jpg"]	3	\N	2025-09-07 02:47:11.084	2025-09-07 02:48:52.103	2025-09-08 13:47:11.232
30	D296300ef83-bb6f-4da8-b075-268c805a58d2.30.2025	titulo mo1	destinatario test	29	[]	o mo	o	o	o	i mod	i	i	i	["/uploads/reports/Id 25/report-1757213332016-731714450-auditoria.jpg"]	3	25	2025-09-07 02:47:11.084	2025-09-08 16:26:00.706	2025-09-08 16:59:19.35
36	D29931f9f49-360a-4b40-923e-8ed2593f728d.36.2025	titulo mo2	destinatario test	29	[]	o mo	o	o	o	i mod	i	i	i	["/uploads/reports/Id 25/report-1757213332016-731714450-auditoria.jpg"]	3	30	2025-09-07 02:47:11.084	2025-09-08 16:26:00.706	2025-09-08 17:19:19.938
37	D2996f0f9e1-55ad-4b1b-91c8-2bba9df62041.37.2025	titulo mo3	destinatario test	29	[]	o mo	o	o	o	i mod	i	i	i	["/uploads/reports/Id 25/report-1757213332016-731714450-auditoria.jpg"]	3	36	2025-09-07 02:47:11.084	2025-09-08 16:26:00.706	2025-09-08 17:32:19.678
42	O3963247f8f-f2a9-487f-ba21-e5f2e6342090.42.2025	vv	vdvvd	39	[]	a	a	a	a	\N	\N	\N	\N	\N	3	\N	2025-10-31 16:34:47.179	\N	2025-10-31 16:42:20.403
43	D3935df90b2-f606-486d-8bff-40decd9a9781.43.2025	vv	vdvvd	39	[]	a	a	a	a	\N	\N	\N	\N	\N	4	42	2025-10-31 16:34:47.179	\N	\N
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: curso_owner
--

COPY public.categories (id, name, type, created_at, updated_at) FROM stdin;
1	categoria 1	Equipos odontologicos	2025-04-26 06:43:25.386671	2025-04-26 06:43:25.386671
2	categoria 2	Equipos odontologicos	2025-04-26 06:43:25.386671	2025-04-26 06:43:25.386671
3	categoria 3	Equipos odontologicos	2025-04-26 06:43:25.386671	2025-04-26 06:43:25.386671
\.


--
-- Data for Name: employee; Type: TABLE DATA; Schema: public; Owner: curso_owner
--

COPY public.employee (id, name, cedula, email, phone, "createdAt", "updatedAt") FROM stdin;
16	empleado uno	V-1234567890	empleadouno@test.com	+5811111111	2025-08-31 21:21:55.023077	2025-08-31 21:21:55.023077
17	empleadodos	V-5454545	empleadodos@gmail.com	04123456789	2025-08-31 22:10:24.757501	2025-08-31 22:10:24.757501
\.


--
-- Data for Name: employeeFamily; Type: TABLE DATA; Schema: public; Owner: curso_owner
--

COPY public."employeeFamily" (id, "employeeId", "familyId", "createdAt", "updatedAt") FROM stdin;
22	17	29	2025-08-31 22:11:25.495072	2025-08-31 22:11:25.495072
23	17	30	2025-08-31 22:36:55.604878	2025-08-31 22:36:55.604878
24	16	31	2025-08-31 22:40:58.30383	2025-08-31 22:40:58.30383
25	16	32	2025-08-31 22:44:30.200081	2025-08-31 22:44:30.200081
\.


--
-- Data for Name: family; Type: TABLE DATA; Schema: public; Owner: curso_owner
--

COPY public.family (id, name, cedula, "createdAt", "updatedAt") FROM stdin;
29	Petra	V-2506777777	2025-08-31 22:11:25.413864	2025-08-31 22:11:25.413864
30	Mariela	V-1234567800	2025-08-31 22:36:55.520934	2025-08-31 22:36:55.520934
31	Familiar Julio Test 	V-34555555	2025-08-31 22:40:58.220187	2025-08-31 22:40:58.220187
32	Charlie Perez	E-8888888	2025-08-31 22:44:30.113292	2025-08-31 22:44:30.113292
\.


--
-- Data for Name: logs; Type: TABLE DATA; Schema: public; Owner: curso_owner
--

COPY public.logs (id, "userId", "productId", action, "ipAddress", hostname, "createdAt") FROM stdin;
1231	29	\N	Inicio de sesión	::1	localhost:3000	2025-08-31 20:46:20.532444
1232	32	\N	Inicio de sesión	::1	localhost:3000	2025-08-31 21:07:18.615297
1233	29	\N	Inicio de sesión	::1	localhost:3000	2025-08-31 21:13:44.615202
1234	29	\N	Inicio de sesión	::1	localhost:3000	2025-08-31 21:20:36.392598
1235	29	\N	Inicio de sesión	::1	localhost:3000	2025-08-31 21:55:47.627779
1236	29	2	Asignación de insumo médico	::1	localhost:3000	2025-08-31 22:04:46.893948
1237	29	\N	Inicio de sesión	::1	localhost:3000	2025-08-31 22:09:45.972078
1238	29	\N	Inicio de sesión	::1	localhost:3000	2025-08-31 22:22:31.226244
1239	29	\N	Inicio de sesión	::1	localhost:3000	2025-08-31 22:35:29.630299
1240	29	22	Asignación de insumo médico	::1	localhost:3000	2025-08-31 22:37:45.4779
1241	29	10	Asignación de insumo médico	::1	localhost:3000	2025-08-31 22:41:47.057506
1242	29	20	Asignación de insumo médico	::1	localhost:3000	2025-08-31 22:44:40.254509
1243	29	\N	Inicio de sesión	::1	localhost:3000	2025-08-31 23:06:17.48226
1244	29	\N	Inicio de sesión	::1	localhost:3000	2025-08-31 23:11:37.39625
1245	29	\N	Inicio de sesión	::1	localhost:3000	2025-08-31 23:49:02.968257
1246	29	\N	Inicio de sesión	::1	localhost:3000	2025-08-31 23:56:20.112709
1247	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 00:05:11.00251
1248	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 00:16:08.50518
1249	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 00:26:40.098787
1250	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 00:32:32.84589
1251	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 01:09:32.677281
1252	29	24	Insumo médico agregado	::1	localhost:3000	2025-09-01 01:11:52.099223
1253	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 01:15:50.396722
1254	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 01:29:40.885477
1255	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 01:48:44.371884
1256	29	\N	Inicio de sesión	::ffff:127.0.0.1	localhost:3000	2025-09-01 01:55:33.722039
1257	29	25	Insumo médico agregado	::1	localhost:3000	2025-09-01 01:58:27.862001
1258	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 02:09:48.65812
1259	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 02:19:07.877036
1260	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 02:39:06.091512
1261	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 02:44:39.986238
1262	29	26	Insumo médico agregado	::1	localhost:3000	2025-09-01 02:45:36.756843
1263	29	27	Insumo médico agregado	::1	localhost:3000	2025-09-01 02:47:40.499877
1264	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 02:50:12.492612
1265	29	28	Insumo médico agregado	::1	localhost:3000	2025-09-01 02:51:50.962663
1266	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 03:06:59.781394
1267	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 03:18:47.337838
1268	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 03:44:12.518584
1269	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 04:21:11.195059
1270	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 04:26:22.948326
1271	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 04:46:56.174337
1272	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 14:53:33.533716
1273	29	\N	Logout	::1	localhost:3000	2025-09-01 14:53:43.993385
1274	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 14:53:58.666118
1275	33	\N	Logout	::1	localhost:3000	2025-09-01 14:58:52.143137
1276	37	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 14:58:57.742393
1277	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 15:23:19.157063
1278	29	\N	Logout	::1	localhost:3000	2025-09-01 15:28:11.006434
1279	37	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 15:28:17.627738
1280	37	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 15:35:26.353572
1281	37	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 15:45:08.458921
1282	37	\N	Logout	::1	localhost:3000	2025-09-01 15:45:11.289432
1283	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 15:45:17.338622
1284	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 15:50:26.009538
1285	37	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 15:58:54.23153
1286	37	\N	Logout	::1	localhost:3000	2025-09-01 16:00:08.711464
1287	36	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 16:00:28.233482
1288	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 16:06:20.64086
1289	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 16:18:21.926691
1290	29	\N	Logout	::1	localhost:3000	2025-09-01 16:18:36.384835
1291	36	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 16:18:45.172155
1292	37	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 16:28:18.897137
1293	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 16:36:23.20334
1294	29	\N	Logout	::1	localhost:3000	2025-09-01 16:36:57.507613
1295	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 16:37:05.396088
1296	33	\N	Logout	::1	localhost:3000	2025-09-01 16:37:35.069257
1297	36	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 16:37:45.967284
1298	36	\N	Logout	::1	localhost:3000	2025-09-01 16:39:45.082369
1299	37	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 16:39:53.040802
1300	37	\N	Logout	::1	localhost:3000	2025-09-01 16:40:55.337912
1301	34	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 16:41:19.244106
1302	34	\N	Logout	::1	localhost:3000	2025-09-01 16:41:22.977558
1303	35	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 16:41:34.406529
1304	35	\N	Logout	::1	localhost:3000	2025-09-01 16:45:59.442998
1305	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 16:46:15.386861
1306	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-01 18:21:57.788143
1307	33	\N	Logout	::1	localhost:3000	2025-09-01 18:23:55.146983
1308	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-06 23:20:31.644769
1309	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-06 23:28:04.066162
1310	29	26	Asignación de insumo médico	::1	localhost:3000	2025-09-06 23:29:50.634064
1311	29	24	Asignación de insumo médico	::1	localhost:3000	2025-09-06 23:30:42.298585
1312	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-06 23:43:08.806295
1313	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-06 23:51:13.010512
1314	29	24	Asignación de insumo médico	::1	localhost:3000	2025-09-06 23:51:51.55667
1315	34	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 00:11:55.237391
1316	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 00:20:37.553679
1317	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 00:28:45.425889
1318	29	29	Insumo médico agregado	::1	localhost:3000	2025-09-07 00:30:14.406133
1319	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 00:37:21.392564
1320	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 00:59:03.566394
1321	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 01:13:24.569644
1322	29	2	Asignación de insumo médico	::1	localhost:3000	2025-09-07 01:16:50.518373
1323	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 01:23:39.494752
1324	29	25	Asignación de insumo médico	::1	localhost:3000	2025-09-07 01:25:30.161656
1325	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 01:30:33.681819
1326	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 01:39:15.450824
1327	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 01:48:46.822686
1328	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 02:00:25.444181
1329	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 02:09:57.465425
1330	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 02:16:25.693692
1331	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 02:25:38.574421
1332	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 02:46:48.61413
1333	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 02:52:29.677979
1334	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 03:02:32.371583
1335	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 03:11:23.284157
1336	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 03:17:34.989649
1337	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 05:27:51.818003
1338	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 05:46:46.452845
1339	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 05:55:30.221847
1340	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 06:21:36.281424
1341	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 06:26:48.39054
1342	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 06:53:20.656926
1343	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 06:59:35.448393
1344	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 07:05:01.575941
1345	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 07:10:26.702534
1346	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-07 07:16:57.570643
1347	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 12:11:05.654322
1348	29	\N	Logout	::1	localhost:3000	2025-09-08 12:11:32.396682
1349	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 12:11:39.671079
1350	33	\N	Logout	::1	localhost:3000	2025-09-08 12:11:45.020493
1351	34	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 12:11:52.441917
1352	34	\N	Logout	::1	localhost:3000	2025-09-08 12:11:55.924805
1353	36	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 12:12:06.51136
1354	36	\N	Logout	::1	localhost:3000	2025-09-08 12:12:14.747373
1355	37	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 12:12:26.564759
1356	37	\N	Logout	::1	localhost:3000	2025-09-08 12:12:30.220792
1357	35	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 12:12:42.932927
1358	35	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 13:31:44.55935
1359	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 13:36:53.486269
1360	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 13:47:02.451812
1361	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 13:54:29.802802
1362	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 14:12:56.68955
1363	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 15:44:39.860487
1364	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 15:49:48.683674
1365	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 15:55:22.961834
1366	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 16:07:03.195512
1367	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 16:19:59.795697
1368	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 16:25:12.975319
1369	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 16:30:43.172718
1370	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 16:47:38.744498
1371	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 16:58:34.71694
1372	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 17:05:05.284886
1373	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 17:18:51.354744
1374	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 17:31:06.842609
1375	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 17:45:03.19247
1376	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 18:03:06.683696
1377	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 18:10:45.889146
1378	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 18:30:41.640791
1379	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 18:46:04.265045
1380	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 18:51:16.432175
1381	29	\N	Inicio de sesión	::1	localhost:3000	2025-09-08 19:49:53.157574
1382	29	\N	Logout	::1	localhost:3000	2025-09-08 19:51:35.775512
1383	34	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 15:47:37.598557
1384	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 15:57:20.012196
1385	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 16:07:22.398451
1386	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 16:27:58.388002
1387	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 16:33:26.450232
1388	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 17:04:00.744477
1389	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 17:12:05.59347
1390	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 17:22:29.318679
1391	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 17:41:38.672496
1392	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 17:52:33.058661
1393	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 18:07:01.023217
1394	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 18:12:12.992097
1395	33	\N	Inicio de sesión	::ffff:127.0.0.1	localhost:3000	2025-09-17 18:17:19.72311
1396	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 18:27:08.566947
1397	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 18:36:59.607499
1398	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 18:52:35.641296
1399	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 18:57:57.54753
1400	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 19:10:30.922112
1401	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 19:31:51.94416
1402	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 19:38:16.90865
1403	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 19:49:29.944119
1404	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 19:58:04.750488
1405	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 20:03:26.126824
1406	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 20:18:30.164484
1407	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 20:24:38.684728
1408	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 20:34:00.28361
1409	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 20:41:01.468327
1410	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 20:50:55.335817
1411	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 21:03:26.727061
1412	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 21:09:06.03582
1413	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 21:19:16.126295
1414	33	\N	Logout	::1	localhost:3000	2025-09-17 21:22:39.812371
1415	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-17 21:22:48.387177
1416	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-24 17:02:32.799551
1417	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-24 17:18:17.941797
1418	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-24 17:30:54.060551
1419	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-24 17:46:51.392953
1420	33	\N	Logout	::1	localhost:3000	2025-09-24 17:48:43.816066
1421	38	\N	Inicio de sesión	::1	localhost:3000	2025-09-24 17:50:02.551945
1422	38	\N	Inicio de sesión	::1	localhost:3000	2025-09-24 17:57:08.708905
1423	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-24 18:09:05.40658
1424	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-24 18:31:22.280359
1425	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-24 18:36:45.560366
1426	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-24 18:45:51.643203
1427	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-24 18:58:52.803144
1428	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-24 19:25:14.930069
1429	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-24 19:43:13.963262
1430	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-24 20:31:22.52327
1431	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-26 15:27:21.869251
1432	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-26 15:42:28.076896
1433	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-26 15:58:21.794399
1434	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-26 16:14:06.782294
1435	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-26 16:21:05.791093
1436	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-26 16:26:28.644865
1437	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-26 16:40:46.242116
1438	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-26 16:49:08.812333
1439	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-26 17:00:02.676248
1440	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-26 17:07:31.891617
1441	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-26 17:26:37.823692
1442	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-26 17:39:37.786964
1443	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-26 17:47:26.119352
1444	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-26 18:48:31.625211
1445	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-26 19:15:53.23605
1446	33	\N	Inicio de sesión	::1	localhost:3000	2025-09-26 19:44:56.48449
1447	33	\N	Inicio de sesión	::1	localhost:3000	2025-10-01 15:54:36.141725
1448	33	\N	Inicio de sesión	::1	localhost:3000	2025-10-01 16:35:50.731557
1449	33	\N	Inicio de sesión	::1	localhost:3000	2025-10-01 16:56:37.366182
1450	33	\N	Inicio de sesión	::1	localhost:3000	2025-10-01 17:10:10.442507
1451	33	\N	Inicio de sesión	::1	localhost:3000	2025-10-01 17:25:07.490487
1452	33	\N	Inicio de sesión	::1	localhost:3000	2025-10-01 18:51:58.577951
1453	33	\N	Inicio de sesión	::1	localhost:3000	2025-10-01 19:00:13.727088
1454	33	\N	Inicio de sesión	::1	localhost:3000	2025-10-01 20:38:34.791794
1455	33	\N	Inicio de sesión	::1	localhost:3000	2025-10-02 14:47:05.805223
1456	33	\N	Inicio de sesión	::1	localhost:3000	2025-10-02 14:52:10.693429
1457	33	\N	Inicio de sesión	::1	localhost:3000	2025-10-02 15:04:48.576152
1458	33	\N	Inicio de sesión	::1	localhost:3000	2025-10-02 15:11:07.953827
1459	33	\N	Inicio de sesión	::1	localhost:3000	2025-10-02 15:32:52.62157
1460	33	\N	Inicio de sesión	::1	localhost:3000	2025-10-02 15:38:52.854761
1461	33	\N	Inicio de sesión	::1	localhost:3000	2025-10-02 15:57:37.744459
1462	33	\N	Inicio de sesión	::1	localhost:3000	2025-10-02 16:03:41.799992
1463	33	\N	Inicio de sesión	::1	localhost:3000	2025-10-02 16:09:18.913073
1464	33	\N	Inicio de sesión	::1	localhost:3000	2025-10-02 16:19:08.496535
1465	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-02 16:48:41.782508
1466	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-02 16:53:56.300897
1467	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-02 20:00:22.339779
1468	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-02 20:08:33.393112
1469	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-02 20:24:08.054318
1470	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-02 20:53:59.881063
1471	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-02 21:16:53.132873
1472	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-02 21:44:31.022764
1473	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-02 21:54:21.487137
1474	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-03 15:03:52.489983
1475	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-03 15:43:19.849246
1476	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-03 15:53:34.469672
1477	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-03 16:01:13.969129
1478	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-03 16:24:30.283933
1479	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-03 16:52:58.322991
1480	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-03 17:46:30.467158
1481	40	\N	Inicio de sesión	::ffff:172.21.20.132	172.21.20.132:3000	2025-10-03 18:05:12.148554
1482	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-03 18:11:16.204432
1483	41	\N	Inicio de sesión	::ffff:172.21.20.151	172.21.20.132:3000	2025-10-03 18:12:25.809523
1484	41	\N	Inicio de sesión	::ffff:172.21.20.151	172.21.20.132:3000	2025-10-03 18:20:09.386419
1485	41	\N	Logout	::ffff:172.21.20.151	172.21.20.132:3000	2025-10-03 18:22:11.879054
1486	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-03 18:24:29.606182
1487	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-03 18:34:55.284721
1488	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-03 18:47:49.457926
1489	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-03 18:54:24.02741
1490	40	\N	Inicio de sesión	::ffff:172.21.20.132	172.21.20.132:3000	2025-10-03 18:56:08.065776
1491	40	\N	Inicio de sesión	::ffff:172.21.20.132	172.21.20.132:3000	2025-10-03 19:01:25.325634
1492	40	\N	Inicio de sesión	::ffff:172.21.20.132	172.21.20.132:3000	2025-10-03 19:17:18.963324
1493	40	\N	Inicio de sesión	::ffff:172.21.20.132	172.21.20.132:3000	2025-10-03 19:22:21.3584
1494	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-03 20:06:27.84325
1495	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-03 20:14:44.434932
1496	40	\N	Inicio de sesión	::ffff:172.21.20.132	172.21.20.132:3000	2025-10-03 20:17:28.290988
1497	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-03 20:19:53.154236
1498	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-03 20:30:51.254614
1499	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-08 15:48:26.41014
1500	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-09 20:57:51.638971
1501	38	\N	Logout	::1	localhost:3000	2025-10-09 20:59:40.474887
1502	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-09 20:59:44.217625
1503	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-09 21:08:44.400929
1504	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-09 21:14:51.468549
1505	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-09 21:26:19.311044
1506	38	\N	Logout	::1	localhost:3000	2025-10-09 21:26:36.14015
1507	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-09 21:26:39.057154
1508	38	\N	Logout	::1	localhost:3000	2025-10-09 21:26:57.211776
1509	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-09 21:29:28.736107
1510	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-09 21:39:06.863284
1511	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-09 21:44:50.965372
1512	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-09 21:58:28.854419
1513	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-10 14:16:35.985048
1514	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-10 14:45:22.266318
1515	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-10 15:20:41.028404
1516	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-10 15:28:44.832041
1517	38	\N	Logout	::1	localhost:3000	2025-10-10 15:29:12.682758
1518	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-10 15:29:16.042793
1519	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-10 16:02:40.543211
1520	38	\N	Logout	::1	localhost:3000	2025-10-10 16:10:22.798192
1521	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-10 16:10:25.782288
1522	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-10 16:17:16.273759
1523	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-10 16:31:08.841397
1524	38	\N	Logout	::1	localhost:3000	2025-10-10 16:32:34.884353
1525	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-10 16:32:37.795556
1526	38	\N	Logout	::1	localhost:3000	2025-10-10 16:35:07.733828
1527	38	\N	Logout	::1	localhost:3000	2025-10-10 16:35:07.751823
1528	38	\N	Logout	::1	localhost:3000	2025-10-10 16:35:07.760261
1529	38	\N	Logout	::1	localhost:3000	2025-10-10 16:35:07.777826
1530	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-10 16:35:17.297021
1531	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-10 17:34:52.693289
1532	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-10 17:58:52.165849
1533	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-10 18:20:43.116077
1534	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-10 18:27:28.986073
1535	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-10 18:49:07.253407
1536	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-10 19:01:00.822811
1537	38	\N	Inicio de sesión	::1	localhost:3000	2025-10-14 21:11:59.899429
1538	38	\N	Logout	::1	localhost:3000	2025-10-14 21:12:41.088809
1539	36	\N	Inicio de sesión	::1	localhost:3000	2025-10-14 21:12:58.655572
1540	36	\N	Inicio de sesión	::1	localhost:3000	2025-10-14 21:21:17.605612
1541	36	\N	Inicio de sesión	::1	localhost:3000	2025-10-14 21:28:19.596044
1542	39	\N	Inicio de sesión	::1	localhost:3000	2025-10-31 16:27:17.445266
1543	39	\N	Inicio de sesión	::1	localhost:3000	2025-10-31 16:34:35.417167
1544	39	\N	Inicio de sesión	::1	localhost:3000	2025-10-31 16:41:36.737009
1545	39	\N	Inicio de sesión	::1	localhost:3000	2025-10-31 16:50:28.301837
1546	39	\N	Inicio de sesión	::1	localhost:3000	2025-10-31 16:55:43.252312
1547	39	\N	Inicio de sesión	::1	localhost:3000	2025-10-31 17:02:55.116355
1548	39	\N	Inicio de sesión	::1	localhost:3000	2025-10-31 17:08:58.644448
1549	39	\N	Inicio de sesión	::1	localhost:3000	2025-10-31 17:24:11.343968
1550	39	\N	Inicio de sesión	::1	localhost:3000	2025-10-31 17:51:47.997865
1551	39	\N	Inicio de sesión	::1	localhost:3000	2025-10-31 18:02:39.248204
1552	39	\N	Logout	::1	localhost:3000	2025-10-31 18:03:38.638592
1553	34	\N	Inicio de sesión	::1	localhost:3000	2025-10-31 18:03:46.815974
1554	34	\N	Logout	::1	localhost:3000	2025-10-31 18:04:24.605459
1555	35	\N	Inicio de sesión	::1	localhost:3000	2025-10-31 18:04:37.662993
1556	35	\N	Logout	::1	localhost:3000	2025-10-31 18:05:01.793721
1557	37	\N	Inicio de sesión	::1	localhost:3000	2025-10-31 18:05:11.215252
1558	37	\N	Logout	::1	localhost:3000	2025-10-31 18:05:14.85141
1559	37	\N	Inicio de sesión	::1	localhost:3000	2025-10-31 18:05:57.400186
1560	37	\N	Logout	::1	localhost:3000	2025-10-31 18:06:01.455191
1561	34	\N	Inicio de sesión	::1	localhost:3000	2025-10-31 18:06:25.613805
1562	34	\N	Logout	::1	localhost:3000	2025-10-31 18:06:32.121508
1563	36	\N	Inicio de sesión	::1	localhost:3000	2025-10-31 18:06:40.565963
1564	36	\N	Inicio de sesión	::1	localhost:3000	2025-11-03 19:13:34.110811
1565	36	\N	Inicio de sesión	::1	localhost:3000	2025-11-03 19:21:15.243528
1566	36	\N	Inicio de sesión	::1	localhost:3000	2025-11-03 19:27:56.278335
1567	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-03 20:17:05.215283
1568	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-03 20:27:25.927158
1569	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-03 20:51:16.358542
1570	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-03 21:06:08.099936
1571	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-03 21:14:11.196799
1572	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-03 21:19:31.192841
1573	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-03 21:31:20.165528
1574	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-03 21:36:38.066964
1575	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-04 15:16:26.585437
1576	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-04 15:45:01.416421
1577	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-04 15:51:41.552538
1578	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-04 15:57:18.670092
1579	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-04 16:09:52.363273
1580	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-04 16:30:47.552366
1581	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-04 16:36:33.175687
1582	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-04 16:46:33.182609
1583	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-04 17:46:41.953102
1584	33	\N	Logout	::1	localhost:3000	2025-11-04 17:59:07.996489
1585	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-04 17:59:11.020382
1586	33	\N	Logout	::ffff:127.0.0.1	localhost:3000	2025-11-04 18:00:02.200772
1587	33	\N	Inicio de sesión	::ffff:127.0.0.1	localhost:3000	2025-11-04 18:00:04.929808
1588	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-04 18:18:43.411213
1589	33	\N	Logout	::1	localhost:3000	2025-11-04 18:48:00.775118
1590	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-04 18:48:26.79704
1591	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-04 18:55:59.866427
1592	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-04 19:07:39.947621
1593	33	\N	Logout	::1	localhost:3000	2025-11-04 19:13:23.494668
1594	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-04 19:13:32.283101
1595	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-04 19:19:36.106119
1596	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-04 19:48:31.192924
1597	33	\N	Logout	::1	localhost:3000	2025-11-05 20:23:49.187603
1598	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-05 20:24:03.507734
1599	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-05 20:31:07.702962
1600	33	\N	Logout	::1	localhost:3000	2025-11-05 20:35:07.337119
1601	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-05 20:35:10.297329
1602	33	\N	Logout	::1	localhost:3000	2025-11-05 21:29:59.537174
1603	39	\N	Inicio de sesión	::1	localhost:3000	2025-11-05 21:30:05.183179
1604	39	\N	Logout	::1	localhost:3000	2025-11-06 14:33:39.717252
1605	39	\N	Inicio de sesión	::1	localhost:3000	2025-11-06 14:33:46.74413
1606	39	\N	Logout	::1	localhost:3000	2025-11-06 14:33:57.162565
1607	34	\N	Inicio de sesión	::1	localhost:3000	2025-11-06 14:34:07.53993
1608	34	\N	Logout	::1	localhost:3000	2025-11-06 14:34:16.033638
1609	37	\N	Inicio de sesión	::1	localhost:3000	2025-11-06 14:34:29.42365
1610	37	\N	Logout	::1	localhost:3000	2025-11-06 14:34:38.316427
1611	36	\N	Inicio de sesión	::1	localhost:3000	2025-11-06 14:34:45.701153
1612	36	\N	Logout	::1	localhost:3000	2025-11-06 14:34:55.957823
1613	36	\N	Inicio de sesión	::1	localhost:3000	2025-11-06 14:43:14.764439
1614	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-07 15:31:09.153252
1615	33	\N	Logout	::1	localhost:3000	2025-11-07 15:56:24.459407
1616	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-07 15:56:32.155964
1617	33	\N	Logout	::1	localhost:3000	2025-11-07 15:57:19.074345
1618	36	\N	Inicio de sesión	::1	localhost:3000	2025-11-07 15:57:29.536832
1619	36	\N	Logout	::1	localhost:3000	2025-11-07 15:57:59.434023
1620	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-07 16:00:00.565588
1621	33	\N	Logout	::1	localhost:3000	2025-11-10 17:32:18.025031
1622	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-10 17:32:24.013412
1623	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-10 19:14:48.465422
1624	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-11 19:23:33.735495
1625	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-11 20:11:49.021388
1626	33	\N	Logout	::1	localhost:3000	2025-11-12 15:37:55.18801
1627	39	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 15:38:43.963528
1628	39	\N	Inicio de sesión	::ffff:127.0.0.1	localhost:3000	2025-11-12 15:38:50.326488
1629	39	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 16:08:32.737855
1630	39	\N	Inicio de sesión	::ffff:127.0.0.1	localhost:3000	2025-11-12 16:18:28.102262
1631	39	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 16:18:40.642772
1632	39	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 17:12:12.971489
1633	39	\N	Logout	::1	localhost:3000	2025-11-12 17:24:16.396056
1634	38	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 17:24:31.847877
1635	38	\N	Logout	::1	localhost:3000	2025-11-12 17:24:42.251827
1636	34	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 17:24:47.983166
1637	34	\N	Logout	::1	localhost:3000	2025-11-12 17:25:12.364402
1638	35	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 17:25:17.456207
1639	35	\N	Logout	::1	localhost:3000	2025-11-12 17:25:26.218065
1640	36	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 17:25:37.034366
1641	36	\N	Logout	::1	localhost:3000	2025-11-12 17:25:46.664464
1642	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 17:26:23.47541
1643	33	\N	Logout	::1	localhost:3000	2025-11-12 17:28:18.302189
1644	34	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 17:28:32.196577
1645	34	\N	Logout	::1	localhost:3000	2025-11-12 17:56:58.887298
1646	34	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 17:57:02.457202
1647	34	\N	Logout	::1	localhost:3000	2025-11-12 17:59:32.811332
1648	34	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 17:59:44.017419
1649	34	\N	Logout	::1	localhost:3000	2025-11-12 18:19:46.472718
1650	34	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 18:19:49.604623
1651	34	\N	Logout	::1	localhost:3000	2025-11-12 18:19:59.017154
1652	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 18:20:09.100223
1653	33	\N	Logout	::1	localhost:3000	2025-11-12 18:20:14.523493
1654	34	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 18:20:19.496887
1655	34	\N	Logout	::1	localhost:3000	2025-11-12 18:20:24.567303
1656	38	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 18:20:43.808994
1657	38	\N	Logout	::1	localhost:3000	2025-11-12 18:20:51.158878
1658	35	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 18:21:02.967
1659	35	\N	Logout	::1	localhost:3000	2025-11-12 18:21:08.048431
1660	37	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 18:21:21.211173
1661	37	\N	Logout	::1	localhost:3000	2025-11-12 18:21:26.188249
1662	36	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 18:22:13.877993
1663	36	\N	Logout	::1	localhost:3000	2025-11-12 18:22:19.261916
1664	37	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 18:22:47.99298
1665	37	\N	Logout	::1	localhost:3000	2025-11-12 18:36:53.939219
1666	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 18:37:11.596559
1667	33	\N	Logout	::1	localhost:3000	2025-11-12 18:37:35.961406
1668	34	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 18:37:40.690935
1669	34	\N	Logout	::1	localhost:3000	2025-11-12 18:37:50.294051
1670	35	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 18:37:57.248387
1671	35	\N	Logout	::1	localhost:3000	2025-11-12 18:38:03.821489
1672	37	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 18:38:21.560055
1673	37	\N	Logout	::1	localhost:3000	2025-11-12 18:38:32.379148
1674	36	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 18:39:40.564209
1675	36	\N	Logout	::1	localhost:3000	2025-11-12 18:41:34.496577
1676	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 18:41:45.020148
1677	33	\N	Logout	::1	localhost:3000	2025-11-12 18:42:16.606775
1678	34	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 18:42:20.733134
1679	34	\N	Logout	::1	localhost:3000	2025-11-12 18:51:30.323849
1680	38	\N	Inicio de sesión	::1	localhost:3000	2025-11-12 18:51:48.198993
1681	38	\N	Logout	::1	localhost:3000	2025-11-13 17:57:25.800043
1682	38	\N	Inicio de sesión	::1	localhost:3000	2025-11-13 17:57:29.466616
1683	38	\N	Inicio de sesión	::1	localhost:3000	2025-11-13 20:41:17.431715
1684	38	\N	Logout	::1	localhost:3000	2025-11-14 15:33:35.893965
1685	38	\N	Inicio de sesión	::1	localhost:3000	2025-11-14 15:33:39.654959
1686	38	\N	Logout	::1	localhost:3000	2025-11-14 15:46:19.674579
1687	38	\N	Inicio de sesión	::1	localhost:3000	2025-11-14 15:48:32.516467
1688	38	\N	Logout	::1	localhost:3000	2025-11-14 15:59:03.854748
1689	38	\N	Inicio de sesión	::1	localhost:3000	2025-11-14 15:59:06.810518
1690	38	\N	Logout	::1	localhost:3000	2025-11-14 16:05:10.346821
1691	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-14 16:05:17.099167
1692	33	\N	Logout	::1	localhost:3000	2025-11-14 16:10:46.033798
1693	34	\N	Inicio de sesión	::1	localhost:3000	2025-11-14 16:10:50.996373
1694	34	\N	Logout	::1	localhost:3000	2025-11-14 16:10:56.98267
1695	35	\N	Inicio de sesión	::1	localhost:3000	2025-11-14 16:11:00.374549
1696	35	\N	Logout	::1	localhost:3000	2025-11-14 16:11:02.869303
1697	38	\N	Inicio de sesión	::1	localhost:3000	2025-11-14 16:11:15.942649
1698	38	\N	Logout	::1	localhost:3000	2025-11-14 16:20:47.695157
1699	38	\N	Inicio de sesión	::1	localhost:3000	2025-11-14 16:20:50.782862
1700	38	\N	Logout	::1	localhost:3000	2025-11-14 16:21:41.404463
1701	33	\N	Inicio de sesión	::1	localhost:3000	2025-11-14 16:21:45.124184
1702	33	\N	Logout	::1	localhost:3000	2025-11-14 16:21:50.595063
1703	34	\N	Inicio de sesión	::1	localhost:3000	2025-11-14 16:21:54.967871
1704	34	\N	Logout	::1	localhost:3000	2025-11-14 16:21:59.924517
1705	37	\N	Inicio de sesión	::1	localhost:3000	2025-11-14 16:23:32.021368
1706	37	\N	Logout	::1	localhost:3000	2025-11-14 16:23:42.528062
1707	36	\N	Inicio de sesión	::1	localhost:3000	2025-11-14 16:23:49.788603
1708	36	\N	Logout	::1	localhost:3000	2025-11-14 16:23:57.257158
1709	39	\N	Inicio de sesión	::1	localhost:3000	2025-11-14 16:34:56.346077
\.


--
-- Data for Name: medicalPrescriptions; Type: TABLE DATA; Schema: public; Owner: curso_owner
--

COPY public."medicalPrescriptions" (id, "medicalReportId", place, "doctorId", mpps, "patientId", "recipeContent", indications, "expirationDate", "createdAt", "updatedAt") FROM stdin;
10	11	Caracas	29	test	2	Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur 	Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur 	2025-10-31	2025-08-31 23:08:40.53888	2025-08-31 23:10:53.241
11	11	mi lugar	29	test	2	test	test	2025-09-30	2025-09-01 14:59:55.731868	2025-09-01 14:59:55.731868
12	11	t	29	test	2	t	t	2025-09-03	2025-09-01 15:31:19.889327	2025-09-01 15:31:19.889327
13	11	a	29	test	2	t	t	2025-09-11	2025-09-01 15:35:56.471027	2025-09-01 15:35:56.471027
14	11	t	29	test	2	a	a	2025-09-18	2025-09-01 15:40:07.700541	2025-09-01 15:40:07.700541
15	11	b	29	test	2	b	b	2025-09-09	2025-09-01 16:08:05.808362	2025-09-01 16:08:05.808362
16	11	q	29	test	2	q	q	2025-09-19	2025-09-01 16:28:37.504769	2025-09-01 16:28:37.504769
17	11	w	29	test	2	w	w	2025-09-09	2025-09-01 16:36:46.671453	2025-09-01 16:36:46.671453
18	11	rrhh	29	test	2	rrhh	rrhh	2025-09-03	2025-09-01 16:37:29.033097	2025-09-01 16:37:29.033097
19	11	medico	29	test	2	medico	medico	2025-09-02	2025-09-01 16:38:09.76588	2025-09-01 16:38:09.76588
20	11	medico2	29	test	2	medico2	medico2	2025-09-06	2025-09-01 16:39:15.19398	2025-09-01 16:39:15.19398
21	11	enfermero	29	test	2	enfermero	enfermero	2025-09-11	2025-09-01 16:40:12.184771	2025-09-01 16:40:12.184771
22	11	enfermero2	29	test	2	enfermero2	enfermero2	2025-09-13	2025-09-01 16:40:52.457842	2025-09-01 16:40:52.457842
23	11	test	29	test	2	auditor	auditor	2025-09-11	2025-09-01 16:42:08.914952	2025-09-01 16:42:08.914952
24	11	test	29	test	2	i	i	2025-09-11	2025-09-01 16:46:30.053149	2025-09-01 16:46:30.053149
\.


--
-- Data for Name: medicalReports; Type: TABLE DATA; Schema: public; Owner: curso_owner
--

COPY public."medicalReports" (id, "patientId", "doctorId", description, insurance, "apsCenter", "mppsCM", "isActivate", "createdAt", "updatedAt") FROM stdin;
11	2	29	Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.	Miranda	aps	test	t	2025-08-31 23:07:26.527229	2025-08-31 23:07:26.527229
12	2	32	iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii	test	test	test	t	2025-09-01 18:22:45.192854	2025-09-01 18:22:45.192854
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: curso_owner
--

COPY public.patients (id, name, birthdate, "placeBirth", age, cedula, email, phone, gender, "civilStatus", children, "isActivate", "createdAt", "updatedAt") FROM stdin;
2	Maria Perez	2000-07-19	Caracas mod	25	V-2300011000	email@gmail.com	04240000011	F	C	2	t	2025-08-31 21:54:31.984475	2025-09-01 15:52:44.877
\.


--
-- Data for Name: productStatus; Type: TABLE DATA; Schema: public; Owner: curso_owner
--

COPY public."productStatus" (id, status) FROM stdin;
3	Proximo a vencerse
4	Caducado
1	Disponible
2	No Disponible
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: curso_owner
--

COPY public.products (id, code, stock, name, "providerId", description, url_image, type, "categoryId", "statusId", "expirationDate", "createdAt", "updatedAt") FROM stdin;
21	2108odont	1	mi nuevo odontologico	2	test	/categoria_2/product_1755813105487_uycr3up3wb_images (13).jpg	3	2	1	\N	2025-08-21 15:48:47.406699	2025-08-21 21:51:45.511
10	codp2	1	prueba2.	39	a	\N	1	1	3	2025-06-19	2025-06-17 15:17:47.329437	2025-09-01 03:07:30.81
1	a	0	articulo	5	a	\N	1	1	3	2025-06-15	2025-06-13 06:03:56.143617	2025-09-01 03:09:58.88
22	prodn2	0	N2	11	test	/categoria_1/product_1755794552309_k7x8m0p6ffs_Atamel-500.jpg	1	1	1	\N	2025-08-21 15:59:59.470697	2025-08-31 22:37:45.988
3	00p	3	c_	26	c_	\N	1	2	4	2025-06-14	2025-06-14 04:07:28.669598	2025-06-14 06:02:22.307
12	1	0	atamel	40	test	/categoria_2/product_1752866408568_2me1lrgbtst_Atamel-500.jpg	2	2	1	\N	2025-07-07 09:20:22.487671	2025-08-12 20:54:34.922
14	ibuprofenoh7	2	ibuprofeno	25	descripcion test	\N	1	2	3	2025-07-31	2025-07-14 21:00:07.961652	2025-09-01 03:10:08.213
20	2108	0	nuevo2108	39	test	/categoria_1/product_1756680351428_5nwgmmjdblf_mandala.png	1	1	3	2025-10-02	2025-08-21 15:46:42.841426	2025-08-31 22:45:51.642
13	00eq	1	Prod eq odontologico	38	desc	\N	3	1	1	\N	2025-07-12 18:35:08.847897	2025-09-01 03:10:18.031
9	produser17	0	prod	1	test	\N	1	1	3	2025-06-18	2025-06-17 15:13:58.824451	2025-09-01 03:19:33.088
26	uniforme2	11	g	41	test	/categoria_1/product_1756694769524_j5tytytthin_uniformemedico2.png	2	1	1	\N	2025-09-01 02:45:36.66684	2025-09-06 23:29:51.041
11	005	0	Diclofenacol	41	prueba	/categoria_3/product_1752866557193_jgcbu1noplg_DICLOFENAC-SODICO.jpg	1	3	3	\N	2025-07-07 05:33:21.208483	2025-08-16 21:01:07.837
24	nuevo0	8	Vitamina C	39	test	/categoria_3/product_1756694579769_ee268swjyge_vitaminC.jpg	1	3	3	2025-10-31	2025-09-01 01:11:52.014005	2025-09-06 23:51:51.966
15	9	2	prod caducado	41	test	/categoria_1/product_1752531245284_nsff9qhjn_descarga (2).png	1	1	4	2025-07-14	2025-07-14 22:14:04.905135	2025-07-14 22:14:53.347
16	3	1	uniforme medico1	41	test	\N	2	2	2	\N	2025-07-14 22:37:01.587693	2025-07-14 22:37:01.587693
17	eqodonto1	2	prod eq odontologico	41	test	\N	3	3	2	\N	2025-07-14 22:45:41.115241	2025-07-14 22:45:41.115241
5	0loratadina	3	loratadina	26	c_		1	2	4	2025-06-14	2025-06-14 04:07:28.669598	2025-06-14 06:02:22.307
2	6	5	prod de id 24	11	prod con proveedor h6	/categoria_1/product_1757207785705_xfyhx9s6b_mandala.png	1	1	3	2025-06-21	2025-06-14 03:46:57.487335	2025-09-07 01:16:50.933
25	rr	0	Test producto con imkagen de 9.48MB	1	test	/categoria_2/product_1756694490106_ojhf7i26e8l_9.48MB.jpg	1	2	1	\N	2025-09-01 01:58:27.747494	2025-09-07 01:25:30.587
29	t	5	prod uniforme	39	test	\N	2	1	1	\N	2025-09-07 00:30:14.27842	2025-10-03 18:31:23.903
19	testAgosto0	2	testAgosto sin imagen modificado..	40	test	\N	1	1	3	2025-09-30	2025-08-03 07:22:18.741393	2025-09-01 00:18:40.273
23	unif000	0	test3 producto	39	test	/categoria_2/product_1755794540914_6cff3pfb0ac_uniforme medico.jpg	2	2	1	\N	2025-08-21 16:09:43.565005	2025-08-21 16:42:20.994
27	rr000	2	Medicamento con imagen 7.62MB	41	test	/categoria_1/product_1756695029919_t96ey8vc9pr_8MB_pexels-tomfisk-1519753.jpg	1	1	3	2025-10-09	2025-09-01 02:47:40.367416	2025-09-01 02:50:50.033
28	d	1	f	41	d	/categoria_1/product_1756695092987_5t9ngjqqtw_8MB_pexels-tomfisk-1519753.jpg	1	1	1	\N	2025-09-01 02:51:50.87608	2025-09-01 02:51:50.87608
18	unidisp0	1	prod uniforme disponible	41	test	\N	2	2	1	\N	2025-07-14 22:48:41.325254	2025-09-01 03:07:19.222
30	prod30	    1	producto inyectado en Backup 	2	test	/categoria_2/product_1755813105487_uycr3up3wb_images (13).jpg	3	2	1	\N	2025-11-14 15:48:47.406699	2025-11-14 21:51:45.511
\.


--
-- Data for Name: providers; Type: TABLE DATA; Schema: public; Owner: curso_owner
--

COPY public.providers (id, name, email, phone, "createdAt", "updatedAt") FROM stdin;
1	proveedor1	email@gmail.com	+584123334455	2025-06-13 01:03:56.576309	2025-06-13 01:03:56.576309
2	proveedor2	email2@gmail.com	+584123334455	2025-06-13 05:50:00.43251	2025-06-13 05:50:00.43251
3	proveedor3	email3@gmail.com	+584123334455	2025-06-13 05:50:00.43251	2025-06-13 05:50:00.43251
4	proveedor4	email4@gmail.com	+584123334455	2025-06-13 05:50:00.43251	2025-06-13 05:50:00.43251
5	prov5	email5_@gmail.com	0	2025-06-13 07:07:37.21017	2025-06-13 07:07:37.21017
7	a	h@gmail.com	La vidaboones: nunca sabes lo que te va a tocar	2025-06-13 07:17:55.574245	2025-06-13 07:17:55.574245
8	p7	p7@gmail.com	0	2025-06-13 07:23:01.694393	2025-06-13 07:23:01.694393
9	prob9	prov9@gmail.com	0	2025-06-13 07:31:24.875095	2025-06-13 07:31:24.875095
10	prob10	ptest@gmail.com	0	2025-06-13 07:37:56.813013	2025-06-13 07:37:56.813013
11	proveedor 11	prov11@gmail.com	0	2025-06-13 07:48:33.469191	2025-06-13 07:48:33.469191
12	g	g@gmail.com	g	2025-06-13 07:58:19.228155	2025-06-13 07:58:19.228155
13	g22	g2@gmail.com	0	2025-06-13 08:00:01.431669	2025-06-13 08:00:01.431669
14	g3_	g3@gmail.com	0	2025-06-13 08:01:12.991261	2025-06-13 08:01:12.991261
15	g4	g4@gmail.com	0	2025-06-13 08:07:22.710657	2025-06-13 08:07:22.710657
16	g5	g5@gmail.com	0	2025-06-13 08:10:04.32907	2025-06-13 08:10:04.32907
17	g6	g6@gmail.co	0	2025-06-13 08:13:42.781608	2025-06-13 08:13:42.781608
18	g7	g7@gmail.com	0	2025-06-13 08:15:13.286275	2025-06-13 08:15:13.286275
19	g8	g8@gmail.com	0	2025-06-13 08:19:43.005535	2025-06-13 08:19:43.005535
21	h33	h33@gmail.com	0	2025-06-14 03:31:23.281589	2025-06-14 03:31:23.281589
22	H4	H4@G.COM	0	2025-06-14 03:35:55.950298	2025-06-14 03:35:55.950298
23	h5	h5@gmail.com	0	2025-06-14 03:40:48.216481	2025-06-14 03:40:48.216481
24	h6	h6@gmail.com	0	2025-06-14 03:44:58.103054	2025-06-14 03:44:58.103054
25	h7	h7@gmail.com	0	2025-06-14 04:06:39.641572	2025-06-14 04:06:39.641572
26	h8	h8@gmail.com	0	2025-06-14 04:07:04.127214	2025-06-14 04:07:04.127214
38	prov	h2@gmail.com	0	2025-06-16 00:51:44.883633	2025-06-16 00:51:44.883633
39	proveedor1a	h3@gmail.com	0	2025-06-16 00:55:46.649466	2025-06-16 00:55:46.649466
40	test	h4@gmail.com	0	2025-06-16 01:04:12.777517	2025-06-16 01:04:12.777517
41	TEST..	h22@gmail.com	0	2025-06-16 01:08:11.138888	2025-06-16 01:08:11.138888
\.


--
-- Data for Name: reportStatus; Type: TABLE DATA; Schema: public; Owner: curso_owner
--

COPY public."reportStatus" (id, status) FROM stdin;
1	Finalizado
2	En proceso
3	Duplicado
4	Inhabilitado
5	Copia editada
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: curso_owner
--

COPY public.roles (id, name, description, "isActivate") FROM stdin;
4	auditor	\N	t
1	admin	Administrador principal	t
3	medico	\N	t
7	admin RRHH	Administrador para Recursos Humanos	t
2	almacen	Gestor del almacén principal	t
5	almacen movil	Gestor del almacén móvil	t
6	enfermero(a)	\N	t
\.


--
-- Data for Name: typesAssignment; Type: TABLE DATA; Schema: public; Owner: curso_owner
--

COPY public."typesAssignment" (id, name) FROM stdin;
1	mi tipo de asignacion1
2	mi tipo de asignacion2
\.


--
-- Data for Name: typesProducts; Type: TABLE DATA; Schema: public; Owner: curso_owner
--

COPY public."typesProducts" (id, type) FROM stdin;
1	Medicamentos
2	Uniformes
3	Equipos odontologicos
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: curso_owner
--

COPY public.users (id, name, cedula, email, password, role, "isActivate", "createdAt", "updatedAt") FROM stdin;
29	admin	V-1234567890	admin@test.com	$argon2id$v=19$m=65536,t=3,p=4$V3Ud7F9fQBHO2GckFZ6jng$YuqQZDtccGsxfAOvhZPVYtORux5UKNyOjvyW/JqjrJU	1	t	2025-08-31 20:45:38.279891	2025-08-31 20:45:38.279891
32	antony castillo	V-1234567800	antony@test.com	$argon2id$v=19$m=65536,t=3,p=4$UtRr34S2hHZp531F0NKtJA$BInFtPdOAej7yrFiVkD2hmnk+sUXRtJmmGZGjWswADI	1	t	2025-08-31 21:06:56.715504	2025-08-31 21:06:56.715504
33	Admin RRHH	V-1234567000	adminrrhhtest@test.com	$argon2id$v=19$m=65536,t=3,p=4$uO/TnmOADNEABeRz/BEn+g$3XuQHS0EqJ7KhTR+r+6fLr2GqpaM9lqUTmE2O9i6h4E	7	t	2025-08-31 21:08:30.367601	2025-08-31 21:08:30.367601
34	Almacén test	V-0000000000	almacen@test.com	$argon2id$v=19$m=65536,t=3,p=4$Ur1EhR2LOtI0OPIjc9m1EA$1DHLX0CU/VaII0B49jhoBQm6uCtmTuTh9kvlwZnSUBQ	2	t	2025-08-31 21:09:38.516889	2025-08-31 21:09:38.516889
35	Cecilia Perez	E-1111111111	auditor@test.com	$argon2id$v=19$m=65536,t=3,p=4$B7XmnAk602cKGur4VQzNcA$hjNhnIQPRnkrBhKarCYfKMhA5iVIapIF1P3ZjWTY91g	4	t	2025-08-31 21:11:04.152889	2025-08-31 21:11:04.152889
36	Medico test	V-2222222222	medico@test.com	$argon2id$v=19$m=65536,t=3,p=4$vb3rEHcbwoFZY0FP3LiRlg$E8/SiOSp6f9/rBpcIl4kSkGYGh0rn4cwTw3Blj2KR9o	3	t	2025-08-31 21:12:00.669918	2025-08-31 21:12:00.669918
37	Juan Sanchez	V-4444444444	enfermero@test.com	$argon2id$v=19$m=65536,t=3,p=4$affAetd7SxuIyN946Ftzmw$6G+Y6up7RS+ROAk2YPBo7znI44Ahw6Gc/UgjAw4r7kU	6	t	2025-08-31 21:14:20.006229	2025-08-31 21:14:20.006229
38	test24	V-0101010101	admin@test24.com	$argon2id$v=19$m=65536,t=3,p=4$uq0aaS3buTkZFL81BloycA$pcX+bhjw4tVBW/9+ErhUWJ7tOLJJIp7dJgC17hASqeQ	1	t	2025-09-24 17:49:53.098887	2025-09-24 17:49:53.098887
39	admin2	V-2020202	admin2@test.com	$argon2id$v=19$m=65536,t=3,p=4$pr1oif7PWILGFWVwGyW4kA$AsXqgnOTPxZrmJJQEtMYCtRGvLZFJd8k0pcG13Yjt70	1	t	2025-09-24 17:57:54.678513	2025-09-24 17:57:54.678513
40	Elys	V-24332005	elysdb@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$qqOLCSn0hOHkUmdcvQ384w$LZ104ekTwavHIwuGPUMqKh+SKqItSPEkoR7wxAGITH4	1	t	2025-10-03 18:05:07.161458	2025-10-03 18:05:07.161458
41	JESUS ARELLANO	V-22027995	je.arellano@ciip.com.ve	$argon2id$v=19$m=65536,t=3,p=4$OsCHpk/VIQgokyvkLLuTYA$ZcY8kpf8BP2YefbiojQURgO1zeMhZlfl+U4sHo+2CM4	1	t	2025-10-03 18:12:11.265958	2025-10-03 18:12:11.265958
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: curso_owner
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 1, false);


--
-- Name: assignment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: curso_owner
--

SELECT pg_catalog.setval('public.assignment_id_seq', 22, true);


--
-- Name: auditReports_temp_id_seq; Type: SEQUENCE SET; Schema: public; Owner: curso_owner
--

SELECT pg_catalog.setval('public."auditReports_temp_id_seq"', 43, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: curso_owner
--

SELECT pg_catalog.setval('public.categories_id_seq', 8, true);


--
-- Name: employeeFamily_id_seq; Type: SEQUENCE SET; Schema: public; Owner: curso_owner
--

SELECT pg_catalog.setval('public."employeeFamily_id_seq"', 25, true);


--
-- Name: employee_id_seq; Type: SEQUENCE SET; Schema: public; Owner: curso_owner
--

SELECT pg_catalog.setval('public.employee_id_seq', 17, true);


--
-- Name: family_id_seq; Type: SEQUENCE SET; Schema: public; Owner: curso_owner
--

SELECT pg_catalog.setval('public.family_id_seq', 32, true);


--
-- Name: logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: curso_owner
--

SELECT pg_catalog.setval('public.logs_id_seq', 1689, true);


--
-- Name: medicalPrescriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: curso_owner
--

SELECT pg_catalog.setval('public."medicalPrescriptions_id_seq"', 24, true);


--
-- Name: medicalReports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: curso_owner
--

SELECT pg_catalog.setval('public."medicalReports_id_seq"', 12, true);


--
-- Name: patients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: curso_owner
--

SELECT pg_catalog.setval('public.patients_id_seq', 2, true);


--
-- Name: productStatus_id_seq; Type: SEQUENCE SET; Schema: public; Owner: curso_owner
--

SELECT pg_catalog.setval('public."productStatus_id_seq"', 4, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: curso_owner
--

SELECT pg_catalog.setval('public.products_id_seq', 29, true);


--
-- Name: providers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: curso_owner
--

SELECT pg_catalog.setval('public.providers_id_seq', 41, true);


--
-- Name: reportStatus_id_seq; Type: SEQUENCE SET; Schema: public; Owner: curso_owner
--

SELECT pg_catalog.setval('public."reportStatus_id_seq"', 7, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: curso_owner
--

SELECT pg_catalog.setval('public.roles_id_seq', 16, true);


--
-- Name: typesAssignment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: curso_owner
--

SELECT pg_catalog.setval('public."typesAssignment_id_seq"', 2, true);


--
-- Name: typesProducts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: curso_owner
--

SELECT pg_catalog.setval('public."typesProducts_id_seq"', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: curso_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 41, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: curso_owner
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: assignment assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.assignment
    ADD CONSTRAINT assignment_pkey PRIMARY KEY (id);


--
-- Name: auditReports_temp auditReports_temp_pkey; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public."auditReports_temp"
    ADD CONSTRAINT "auditReports_temp_pkey" PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: employeeFamily employeeFamily_pkey; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public."employeeFamily"
    ADD CONSTRAINT "employeeFamily_pkey" PRIMARY KEY (id);


--
-- Name: employee employee_cedula_unique; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT employee_cedula_unique UNIQUE (cedula);


--
-- Name: employee employee_email_unique; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT employee_email_unique UNIQUE (email);


--
-- Name: employee employee_pkey; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT employee_pkey PRIMARY KEY (id);


--
-- Name: family family_pkey; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.family
    ADD CONSTRAINT family_pkey PRIMARY KEY (id);


--
-- Name: logs logs_pkey; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT logs_pkey PRIMARY KEY (id);


--
-- Name: medicalPrescriptions medicalPrescriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public."medicalPrescriptions"
    ADD CONSTRAINT "medicalPrescriptions_pkey" PRIMARY KEY (id);


--
-- Name: medicalReports medicalReports_pkey; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public."medicalReports"
    ADD CONSTRAINT "medicalReports_pkey" PRIMARY KEY (id);


--
-- Name: patients patients_cedula_unique; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_cedula_unique UNIQUE (cedula);


--
-- Name: patients patients_email_unique; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_email_unique UNIQUE (email);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: productStatus productStatus_pkey; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public."productStatus"
    ADD CONSTRAINT "productStatus_pkey" PRIMARY KEY (id);


--
-- Name: productStatus productStatus_status_unique; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public."productStatus"
    ADD CONSTRAINT "productStatus_status_unique" UNIQUE (status);


--
-- Name: products products_code_unique; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_code_unique UNIQUE (code);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: providers providers_email_unique; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_email_unique UNIQUE (email);


--
-- Name: providers providers_pkey; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_pkey PRIMARY KEY (id);


--
-- Name: reportStatus reportStatus_pkey; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public."reportStatus"
    ADD CONSTRAINT "reportStatus_pkey" PRIMARY KEY (id);


--
-- Name: reportStatus reportStatus_status_unique; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public."reportStatus"
    ADD CONSTRAINT "reportStatus_status_unique" UNIQUE (status);


--
-- Name: roles roles_name_unique; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_unique UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: typesAssignment typesAssignment_name_unique; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public."typesAssignment"
    ADD CONSTRAINT "typesAssignment_name_unique" UNIQUE (name);


--
-- Name: typesAssignment typesAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public."typesAssignment"
    ADD CONSTRAINT "typesAssignment_pkey" PRIMARY KEY (id);


--
-- Name: typesProducts typesProducts_pkey; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public."typesProducts"
    ADD CONSTRAINT "typesProducts_pkey" PRIMARY KEY (id);


--
-- Name: typesProducts typesProducts_type_unique; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public."typesProducts"
    ADD CONSTRAINT "typesProducts_type_unique" UNIQUE (type);


--
-- Name: users users_cedula_unique; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_cedula_unique UNIQUE (cedula);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: employee_family_unique; Type: INDEX; Schema: public; Owner: curso_owner
--

CREATE UNIQUE INDEX employee_family_unique ON public."employeeFamily" USING btree ("employeeId", "familyId");


--
-- Name: idx_providers_name_lower; Type: INDEX; Schema: public; Owner: curso_owner
--

CREATE INDEX idx_providers_name_lower ON public.providers USING btree (lower((name)::text));


--
-- Name: assignment assignment_employeeId_employee_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.assignment
    ADD CONSTRAINT "assignment_employeeId_employee_id_fk" FOREIGN KEY ("employeeId") REFERENCES public.employee(id);


--
-- Name: assignment assignment_familyId_family_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.assignment
    ADD CONSTRAINT "assignment_familyId_family_id_fk" FOREIGN KEY ("familyId") REFERENCES public.family(id);


--
-- Name: assignment assignment_medicoId_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.assignment
    ADD CONSTRAINT "assignment_medicoId_users_id_fk" FOREIGN KEY ("medicoId") REFERENCES public.users(id);


--
-- Name: assignment assignment_productId_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.assignment
    ADD CONSTRAINT "assignment_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: assignment assignment_type_typesAssignment_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.assignment
    ADD CONSTRAINT "assignment_type_typesAssignment_id_fk" FOREIGN KEY (type) REFERENCES public."typesAssignment"(id);


--
-- Name: auditReports_temp auditReports_temp_auditorId_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public."auditReports_temp"
    ADD CONSTRAINT "auditReports_temp_auditorId_users_id_fk" FOREIGN KEY ("auditorId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: auditReports_temp auditReports_temp_statusId_reportStatus_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public."auditReports_temp"
    ADD CONSTRAINT "auditReports_temp_statusId_reportStatus_id_fk" FOREIGN KEY ("statusId") REFERENCES public."reportStatus"(id);


--
-- Name: employeeFamily employeeFamily_employeeId_employee_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public."employeeFamily"
    ADD CONSTRAINT "employeeFamily_employeeId_employee_id_fk" FOREIGN KEY ("employeeId") REFERENCES public.employee(id) ON DELETE CASCADE;


--
-- Name: employeeFamily employeeFamily_familyId_family_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public."employeeFamily"
    ADD CONSTRAINT "employeeFamily_familyId_family_id_fk" FOREIGN KEY ("familyId") REFERENCES public.family(id) ON DELETE CASCADE;


--
-- Name: logs logs_productId_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT "logs_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: logs logs_userId_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT "logs_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: medicalPrescriptions medicalPrescriptions_doctorId_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public."medicalPrescriptions"
    ADD CONSTRAINT "medicalPrescriptions_doctorId_users_id_fk" FOREIGN KEY ("doctorId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: medicalPrescriptions medicalPrescriptions_medicalReportId_medicalReports_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public."medicalPrescriptions"
    ADD CONSTRAINT "medicalPrescriptions_medicalReportId_medicalReports_id_fk" FOREIGN KEY ("medicalReportId") REFERENCES public."medicalReports"(id) ON DELETE SET NULL;


--
-- Name: medicalPrescriptions medicalPrescriptions_patientId_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public."medicalPrescriptions"
    ADD CONSTRAINT "medicalPrescriptions_patientId_patients_id_fk" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: medicalReports medicalReports_doctorId_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public."medicalReports"
    ADD CONSTRAINT "medicalReports_doctorId_users_id_fk" FOREIGN KEY ("doctorId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: medicalReports medicalReports_patientId_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public."medicalReports"
    ADD CONSTRAINT "medicalReports_patientId_patients_id_fk" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: products products_categoryId_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_categoryId_categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES public.categories(id);


--
-- Name: products products_providerId_providers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_providerId_providers_id_fk" FOREIGN KEY ("providerId") REFERENCES public.providers(id);


--
-- Name: products products_statusId_productStatus_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_statusId_productStatus_id_fk" FOREIGN KEY ("statusId") REFERENCES public."productStatus"(id);


--
-- Name: products products_type_typesProducts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_type_typesProducts_id_fk" FOREIGN KEY (type) REFERENCES public."typesProducts"(id);


--
-- Name: users users_role_roles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: curso_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_roles_id_fk FOREIGN KEY (role) REFERENCES public.roles(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict UyNQbhQFUsmozbNzaLM6fTVBXVyA1ToXBSzT09qp4AlSNh0ZYDMkw9tiJIsBqRY

