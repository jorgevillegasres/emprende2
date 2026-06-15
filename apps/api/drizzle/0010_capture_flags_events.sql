ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "feature_flags" jsonb DEFAULT '{}'::jsonb NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "aggregate_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"revenue" double precision NOT NULL,
	"cash_out" double precision NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"name" text NOT NULL,
	"props" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "aggregate_entries" ADD CONSTRAINT "aggregate_entries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "aggregate_entries_tenant_period_idx" ON "aggregate_entries" ("tenant_id","period_start");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_name_created_idx" ON "events" ("name","created_at");
