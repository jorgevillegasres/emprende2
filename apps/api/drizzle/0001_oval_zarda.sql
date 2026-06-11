CREATE INDEX "expenses_tenant_date_idx" ON "expenses" USING btree ("tenant_id","date");--> statement-breakpoint
CREATE INDEX "products_tenant_id_idx" ON "products" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "sales_tenant_date_idx" ON "sales" USING btree ("tenant_id","date");--> statement-breakpoint
CREATE INDEX "supplies_tenant_id_idx" ON "supplies" USING btree ("tenant_id");