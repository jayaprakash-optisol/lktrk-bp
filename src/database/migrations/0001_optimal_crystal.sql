ALTER TABLE "project" ADD COLUMN "regulation_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_regulation_id_regulation_id_fk" FOREIGN KEY ("regulation_id") REFERENCES "public"."regulation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" DROP COLUMN "regulation";