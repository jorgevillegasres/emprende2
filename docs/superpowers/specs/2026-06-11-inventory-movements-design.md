# Inventory Movements Design

## Context

Sales now decrement product stock. To make Emprendedos viable as a SaaS operations tool, stock changes must be auditable. A user should be able to answer why a product has its current stock, not only see the final number.

## Design

Add an `inventory_movements` ledger scoped by tenant. Each movement records:

- item type and item id
- movement type
- signed quantity
- stock before and stock after
- reference type and reference id
- note and creation timestamp

When a sale is created, the API writes a `sale` movement for the product with a negative quantity. The movement is created after stock is updated and includes the stock before and after the sale.

Expose `GET /v1/inventory-movements` so the web app can show recent movement history. The Inventario screen displays a compact kardex panel under the current list.

## Scope

This step records sale movements only. The same ledger shape is prepared for future purchase, production and manual adjustment movements.

## Testing

API tests verify that sale creation creates a movement with the expected quantity and stock values. Schema tests verify that the new table is exported. Web client tests verify the new endpoint path.
