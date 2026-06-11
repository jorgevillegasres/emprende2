# Smart Sales Entry Design

## Context

Emprendedos already lets entrepreneurs manage products, supplies, sales and expenses. Sales still behaved like a raw accounting form: the user had to type product, revenue, cost and gross profit manually.

For a SaaS aimed at small businesses, sales capture should reduce mental load and turn operational data into business insight automatically.

## Design

The sales form becomes a guided entry flow:

- Load the tenant product catalog when the user opens Ventas.
- Let the user choose the sold product from a select control.
- Ask only for date and quantity.
- Calculate revenue, cost and gross profit from the selected product's price and unit cost.
- Show those totals before saving.
- Submit the existing API sale payload, keeping the backend contract unchanged.

If there are no products, the form explains that a product must exist first because the sale depends on catalog pricing and costing.

## Scope

This iteration does not decrement inventory or introduce sale line items. It keeps one sale as one product movement, which matches the current API model. Inventory deduction should be handled in a later backend-backed stock movement step.

## Testing

The calculation lives in a small pure module with unit tests for normal positive quantities and zero quantity behavior. The UI is covered by TypeScript and browser verification.
