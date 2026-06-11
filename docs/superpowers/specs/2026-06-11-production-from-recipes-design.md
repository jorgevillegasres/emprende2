# Production From Recipes Design

## Goal

Let entrepreneurs produce finished goods directly from a saved recipe, so Emprendedos calculates the required supplies automatically.

## Recommended Scope

Add a recipe-driven production endpoint and a compact UI action in the `Recetas` section.

The system must:

- Find a tenant recipe by id.
- Scale each ingredient by `requestedQuantity / recipe.outputQuantity`.
- Reuse the production order stock behavior.
- Reject production if the recipe does not exist.
- Reject production if any scaled ingredient has insufficient stock.
- Return the created production order summary.

## API

Add `POST /v1/production-orders/from-recipe`.

Payload:

- `recipeId`: saved recipe id.
- `quantity`: finished product quantity to produce.
- `note`: short production note.

Response matches the existing production order response:

- `id`
- `productId`
- `quantity`
- `totalCost`
- `unitCost`
- `movements`

## UI

In the `Recetas` page, add a production panel that lets the user select a recipe, choose the quantity to produce, add a note, and submit.

After submission, refresh recipes/products/supplies enough to show current context and leave the user on `Recetas`.

## Testing

Add API tests for:

- Producing from a recipe scales ingredients and records inventory movements.
- Missing recipe returns `404`.

Add client test for:

- The production-from-recipe path helper.
