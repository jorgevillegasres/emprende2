CREATE TABLE "recipes" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"product_id" text NOT NULL,
	"name" text NOT NULL,
	"output_quantity" double precision NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;
CREATE INDEX "recipes_tenant_id_idx" ON "recipes" USING btree ("tenant_id");
CREATE INDEX "recipes_tenant_product_idx" ON "recipes" USING btree ("tenant_id","product_id");

CREATE TABLE "recipe_ingredients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"recipe_id" text NOT NULL,
	"supply_id" text NOT NULL,
	"quantity" double precision NOT NULL
);
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE no action ON UPDATE no action;
CREATE INDEX "recipe_ingredients_recipe_idx" ON "recipe_ingredients" USING btree ("tenant_id","recipe_id");
