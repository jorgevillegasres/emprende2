# Production Orders Design

## Goal

Add a first production workflow for Emprendedos so an entrepreneur can convert supplies into finished product stock with traceable inventory movements and realistic batch costing.

## Recommended Scope

The first version uses a direct production order instead of saved recipes. A user selects one finished product, enters the produced quantity, adds the supplies consumed, and submits the batch.

The system must:

- Increase finished product stock.
- Decrease each consumed supply stock.
- Reject the order when any supply has insufficient stock.
- Record inventory movements for the finished product and each consumed supply.
- Calculate the produced batch cost from supply average costs.
- Recalculate the finished product unit cost using weighted average cost.

## API

Add `POST /v1/production-orders`.

Payload:

- `productId`: finished product id.
- `quantity`: produced product quantity.
- `supplies`: non-empty list of `{ supplyId, quantity }`.
- `note`: short operational note.

Response:

- `id`: production order reference id.
- `productId`
- `quantity`
- `totalCost`
- `unitCost`
- `movements`

## Data Model

No new database table is required for this first version. The production order is represented by inventory movements sharing:

- `referenceType: "production-order"`
- the same `referenceId`

This keeps the workflow small while preserving auditability through the kardex.

## Errors

- `400` for invalid payloads.
- `404` when the product or a supply does not exist in the tenant.
- `409` when any supply lacks enough stock. No stock should change in this case.

## Testing

Add API tests for:

- Successful production consuming supplies, increasing product stock, recalculating product unit cost, and recording movements.
- Insufficient supply rejection without stock changes.
