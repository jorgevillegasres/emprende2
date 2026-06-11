# Sales Stock Movement Design

## Context

Sales now calculate revenue, cost and gross profit from the selected product. The next operational step is to make each sale affect inventory, so the system reflects what happened in the business instead of only recording financial data.

## Design

When a tenant creates a sale:

- The API validates that the product exists for the same tenant.
- The API checks that available stock is greater than or equal to the sale quantity.
- If stock is insufficient, the API returns `409` and does not create the sale.
- If stock is available, the API creates the sale and updates the product stock by subtracting the sold quantity.
- The web sales form shows available stock for the selected product and disables saving when the requested quantity exceeds it.

This keeps inventory enforcement in the backend while making the frontend clearer for the user.

## Scope

This step updates product stock directly. A later version should add a dedicated stock movement ledger with movement type, source document, timestamp and user, which will be important for auditability in a SaaS environment.

## Testing

API tests cover stock decrement and insufficient-stock rejection. Existing web and API checks verify that the behavior compiles and remains compatible with the current sales flow.
