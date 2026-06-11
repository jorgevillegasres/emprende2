# Manual Inventory Adjustments Plan

## Goal

Allow a user to correct product stock manually while preserving an auditable kardex movement.

## Steps

1. Add failing API and web client tests for manual adjustments.
2. Add `POST /v1/inventory-adjustments`.
3. Add web client payload/path helpers.
4. Render an adjustment form in Inventario.
5. Refresh products and kardex after a successful adjustment.
6. Verify focused tests, full tests, typecheck, build and local API behavior.
