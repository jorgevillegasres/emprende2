# Inventory Movements Plan

## Goal

Create the first kardex foundation so sales leave an auditable inventory movement.

## Steps

1. Add failing tests for inventory movement creation and schema export.
2. Add the `inventory_movements` table to Drizzle schema and migration files.
3. Add inventory movement records to in-memory and Postgres repositories.
4. Write a sale movement when product stock is decremented.
5. Expose `GET /v1/inventory-movements`.
6. Add a web client method and render recent movements in Inventario.
7. Verify focused tests, full tests, typecheck, build and browser/API behavior.
