CREATE TABLE "inventory_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"item_type" text NOT NULL,
	"item_id" text NOT NULL,
	"movement_type" text NOT NULL,
	"quantity" double precision NOT NULL,
	"stock_before" double precision NOT NULL,
	"stock_after" double precision NOT NULL,
	"reference_type" text NOT NULL,
	"reference_id" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;
CREATE INDEX "inventory_movements_tenant_item_idx" ON "inventory_movements" USING btree ("tenant_id","item_type","item_id");
CREATE INDEX "inventory_movements_tenant_created_idx" ON "inventory_movements" USING btree ("tenant_id","created_at");
