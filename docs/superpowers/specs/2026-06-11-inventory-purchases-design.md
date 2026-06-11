# Inventory Purchases Design

## Context

Emprendedos already supports sales, stock decrement, kardex movements and manual stock adjustments. The next operational gap is stock replenishment: users need to register purchases or entries without treating them as corrections.

## Design

Add an inventory purchase flow:

- The API accepts product or supply entries.
- Quantity must be positive.
- The item must belong to the current tenant.
- The item stock increases by the received quantity.
- A `purchase` movement is written to the kardex with positive quantity, stock before and stock after.
- For supplies, when `unitCost` is provided, the system recalculates weighted average cost.
- The Inventario screen shows an "Entrada" form above manual adjustments.

This keeps purchases distinct from manual adjustments and preserves a clean operational audit trail.

## Scope

This first version does not create supplier invoices, accounts payable or purchase orders. It records the stock movement and the inventory cost effect for supplies.

## Testing

API tests cover product purchase movements and supply purchases with weighted average cost. Web client tests cover the endpoint path. Full test, typecheck and build verification must pass.
