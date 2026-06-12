# Production History Design

## Goal

Add a production history so entrepreneurs can review produced lots, real costs, and traceability after creating manual or recipe-driven production orders.

## Recommended Scope

Store one production order summary per successful production run. Inventory movements remain the detailed kardex; production history becomes the business-friendly list of lots.

The system must:

- Persist every successful production order.
- List tenant-scoped production orders.
- Include product id, produced quantity, total cost, unit cost, optional recipe id, note, and creation date.
- Record manual production and recipe-driven production in the same history.
- Keep existing inventory movement behavior unchanged.

## API

Add `GET /v1/production-orders`.

Existing `POST /v1/production-orders` and `POST /v1/production-orders/from-recipe` should return and persist the order summary.

## Data Model

Add a `production_orders` table with:

- `id`
- `tenant_id`
- `product_id`
- `quantity`
- `total_cost`
- `unit_cost`
- `recipe_id`
- `note`
- `created_at`

## UI

Show recent production lots in the `Recetas` page, below recipe creation and production-from-recipe actions.

## Testing

Add tests for:

- Manual production creates a history entry.
- Recipe-driven production creates a history entry with `recipeId`.
- Web client path helper.
