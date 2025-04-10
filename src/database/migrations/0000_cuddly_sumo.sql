CREATE TYPE "public"."access_difficulty_name" AS ENUM('easy', 'moderate', 'difficult', 'unsafe_without_equipment');--> statement-breakpoint
CREATE TYPE "public"."access_level" AS ENUM('no_access', 'view_access', 'edit_access', 'full_access');--> statement-breakpoint
CREATE TYPE "public"."component_sub_type" AS ENUM('pump_casing', 'flange_connection', 'bearing_shaft', 'compressor_seal', 'ball_valve');--> statement-breakpoint
CREATE TYPE "public"."component_type" AS ENUM('flange', 'connector', 'valve', 'gauge', 'meter');--> statement-breakpoint
CREATE TYPE "public"."customer_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."equipment_type" AS ENUM('storage_tank', 'pipeline_piping', 'vessel', 'blower_fan');--> statement-breakpoint
CREATE TYPE "public"."facility_type" AS ENUM('well_pads', 'gas_processing_plants', 'storage_terminals', 'storage_tanks');--> statement-breakpoint
CREATE TYPE "public"."hazard_tag_name" AS ENUM('flammable', 'hap', 'corrosive', 'pressurized', 'voc');--> statement-breakpoint
CREATE TYPE "public"."module" AS ENUM('dashboard', 'projects', 'surveys', 'calendar', 'customers', 'components', 'equipments', 'facility', 'roles', 'reports');--> statement-breakpoint
CREATE TYPE "public"."monitoring_frequency_name" AS ENUM('annual', 'bimonthly', 'monthly', 'quarterly', 'half_yearly', 'daily', 'weekly', 'biweekly');--> statement-breakpoint
CREATE TYPE "public"."operating_status" AS ENUM('shutdown', 'operating', 'maintenance', 'inoperative');--> statement-breakpoint
CREATE TYPE "public"."priority_name" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."regulation_name" AS ENUM('40_cfr_part_60', '40_cfr_part_61', '30_tac_chapter_115', 'other');--> statement-breakpoint
CREATE TYPE "public"."service_type_name" AS ENUM('ammonia', 'btex', 'condensate', 'gas_methane', 'lube_oil', 'other');--> statement-breakpoint
CREATE TYPE "public"."survey_method_name" AS ENUM('method_21', 'ogi', 'avo', 'method_3', 'method_16');--> statement-breakpoint
CREATE TYPE "public"."survey_status" AS ENUM('planned', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."survey_type_name" AS ENUM('initial', 'routine', 'follow_up', 'compliance');--> statement-breakpoint
CREATE TYPE "public"."technology_name" AS ENUM('ogi', 'pid', 'fid', 'tdlas', 'cems', 'other');--> statement-breakpoint
CREATE TYPE "public"."zone_name" AS ENUM('Refrigeration Unit', 'Storage Units', 'Compression Unit', 'Treating Unit', 'Stabilization Unit', 'Dehydration (Dehy)', 'Processing unit');--> statement-breakpoint
CREATE TABLE "component" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"component_sub_type" "component_sub_type" NOT NULL,
	"monitoring_frequency" "monitoring_frequency_name" NOT NULL,
	"access_difficulty" "access_difficulty_name" NOT NULL,
	"location_latitude" double precision,
	"location_longitude" double precision,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "component_hazard_tag" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"component_id" uuid NOT NULL,
	"hazard_tag" "hazard_tag_name" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "component_service_type" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"component_id" uuid NOT NULL,
	"service_type" "service_type_name" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "component_type_link" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"component_id" uuid NOT NULL,
	"component_type" "component_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"customer_id" uuid NOT NULL,
	"office_number" varchar,
	"tceq_steers_account_no" varchar,
	"contact_name" varchar,
	"contact_designation" varchar,
	"mobile_phone" varchar,
	"email" varchar
);
--> statement-breakpoint
CREATE TABLE "customer" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"company_name" varchar NOT NULL,
	"parent_company_id" uuid,
	"office_phone" varchar,
	"email" varchar,
	"address1" varchar,
	"address2" varchar,
	"city" varchar,
	"state" varchar,
	"zip_code" varchar,
	"email_domain_mfa" varchar,
	"cedri_report_required" boolean,
	"status" "customer_status" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"equipment_name" varchar NOT NULL,
	"equipment_type" "equipment_type" NOT NULL,
	"location_latitude" double precision,
	"location_longitude" double precision,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "facility" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"facility_name" varchar NOT NULL,
	"facility_type" "facility_type" NOT NULL,
	"operating_status" "operating_status" NOT NULL,
	"customer_id" uuid NOT NULL,
	"location_latitude" double precision,
	"location_longitude" double precision,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "role" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"name" varchar NOT NULL,
	"description" varchar
);
--> statement-breakpoint
CREATE TABLE "role_module_access" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"role_id" uuid NOT NULL,
	"module" "module" NOT NULL,
	"access_level" "access_level" DEFAULT 'no_access' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone_number" varchar,
	"password" varchar NOT NULL,
	"role_id" uuid NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"project_name" varchar NOT NULL,
	"customer_id" uuid NOT NULL,
	"regulation" "regulation_name" NOT NULL,
	"monitoring_frequency" "monitoring_frequency_name" NOT NULL,
	"technology" "technology_name" NOT NULL,
	"survey_method" "survey_method_name" NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "project_component" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"project_id" uuid NOT NULL,
	"component_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_equipment" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"project_id" uuid NOT NULL,
	"equipment_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_facility" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"project_id" uuid NOT NULL,
	"facility_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "survey" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"customer_name" varchar NOT NULL,
	"project_id" uuid NOT NULL,
	"facility_id" uuid NOT NULL,
	"zone" "zone_name" NOT NULL,
	"regulation_id" uuid NOT NULL,
	"monitoring_frequency" "monitoring_frequency_name" NOT NULL,
	"survey_type" "survey_type_name" NOT NULL,
	"priority" "priority_name" NOT NULL,
	"survey_method" "survey_method_name" NOT NULL,
	"technology" "technology_name" NOT NULL,
	"primary_technician_id" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"notes" varchar
);
--> statement-breakpoint
CREATE TABLE "survey_component" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"survey_id" uuid NOT NULL,
	"component_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "survey_technician" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"survey_id" uuid NOT NULL,
	"technician_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regulation" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"name" varchar NOT NULL,
	"description" varchar,
	"code" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "component_hazard_tag" ADD CONSTRAINT "component_hazard_tag_component_id_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component_service_type" ADD CONSTRAINT "component_service_type_component_id_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component_type_link" ADD CONSTRAINT "component_type_link_component_id_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact" ADD CONSTRAINT "contact_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facility" ADD CONSTRAINT "facility_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_module_access" ADD CONSTRAINT "role_module_access_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_component" ADD CONSTRAINT "project_component_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_component" ADD CONSTRAINT "project_component_component_id_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_equipment" ADD CONSTRAINT "project_equipment_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_equipment" ADD CONSTRAINT "project_equipment_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_facility" ADD CONSTRAINT "project_facility_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_facility" ADD CONSTRAINT "project_facility_facility_id_facility_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facility"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey" ADD CONSTRAINT "survey_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey" ADD CONSTRAINT "survey_facility_id_facility_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facility"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey" ADD CONSTRAINT "survey_regulation_id_regulation_id_fk" FOREIGN KEY ("regulation_id") REFERENCES "public"."regulation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey" ADD CONSTRAINT "survey_primary_technician_id_user_id_fk" FOREIGN KEY ("primary_technician_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_component" ADD CONSTRAINT "survey_component_survey_id_survey_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."survey"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_component" ADD CONSTRAINT "survey_component_component_id_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_technician" ADD CONSTRAINT "survey_technician_survey_id_survey_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."survey"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_technician" ADD CONSTRAINT "survey_technician_technician_id_user_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;