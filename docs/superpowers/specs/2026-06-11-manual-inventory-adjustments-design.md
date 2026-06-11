# Manual Inventory Adjustments Design

## Context

The inventory ledger records stock changes caused by sales. Entrepreneurs also need to correct inventory after physical counts, losses, samples, gifts or operational mistakes.

## Design

Add a manual inventory adjustment flow for finished products:

- The API accepts a product id, counted stock and note.
- The API validates that the product belongs to the tenant.
- The API calculates the delta from current stock to counted stock.
- The product stock is updated to the counted value.
- An `adjustment` inventory movement is written with signed quantity, stock before, stock after and the note.
- The Inventario screen shows a compact adjustment form above the kardex.

The first version supports product stock only. Supplies can use the same pattern when purchasing and production flows are added.

## Testing

API tests cover stock update and movement creation. Web client tests cover the new endpoint helper. Full typecheck, test and build verification should remain green.
