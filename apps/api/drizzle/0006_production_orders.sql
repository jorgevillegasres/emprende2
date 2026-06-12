CREATE TABLE "production_orders" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"product_id" text NOT NULL,
	"quantity" double precision NOT NULL,
	"total_cost" double precision NOT NULL,
	"unit_cost" double precision NOT NULL,
	"recipe_id" text,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "production_orders" ADD CONSTRAINT "production_orders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;
CREATE INDEX "production_orders_tenant_created_idx" ON "production_orders" USING btree ("tenant_id","created_at");
CREATE INDEX "production_orders_tenant_product_idx" ON "production_orders" USING btree ("tenant_id","product_id");
