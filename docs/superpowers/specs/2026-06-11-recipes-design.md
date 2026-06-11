# Recipes Design

## Goal

Add reusable production recipes so an entrepreneur can define how a finished product is made before creating production orders.

## Recommended Scope

This first version stores recipes and their supply lines. It does not consume inventory by itself. Production orders remain responsible for moving stock.

The system must:

- Save a recipe for a tenant.
- Link the recipe to a finished product.
- Store a base output quantity.
- Store one or more supply lines with quantity required for the base output.
- List recipes with their ingredients.
- Reject recipes that reference missing products or supplies.
- Keep recipes tenant-scoped.

## API

Add:

- `GET /v1/recipes`
- `POST /v1/recipes`

Create payload:

- `id`: recipe code.
- `productId`: finished product id.
- `name`: recipe name.
- `outputQuantity`: base produced quantity.
- `ingredients`: non-empty list of `{ supplyId, quantity }`.
- `note`: optional short note.

## Data Model

Use two Postgres tables:

- `recipes`: one row per tenant recipe.
- `recipe_ingredients`: ingredient lines linked by `recipe_id` and `tenant_id`.

The in-memory repository mirrors the same shape so tests and local demo behavior stay aligned.

## Errors

- `400` for invalid payloads or duplicated supply lines.
- `404` when the finished product or any supply does not exist.

## UI

Add a dedicated `Recetas` section in the app shell. The first screen should list saved recipes and provide a compact creation form with:

- Recipe id/name.
- Product.
- Base output quantity.
- Two ingredient slots.
- Note.

## Testing

Add tests for:

- Creating and listing a tenant recipe with ingredients.
- Rejecting recipes that reference a missing supply.
- Web client route helper.
