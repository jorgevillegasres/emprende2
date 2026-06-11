# Production From Recipes Implementation Plan

## Steps

1. Add API tests for producing from a recipe and missing recipe handling.
2. Add web client test for the route helper.
3. Extend recipe repository with tenant/id lookup.
4. Refactor production order execution into a shared internal helper.
5. Add `POST /v1/production-orders/from-recipe`.
6. Add web client payload/helper.
7. Add a production-from-recipe panel in `Recetas`.
8. Run focused tests, full tests, typecheck, build, browser checks, and commit.
