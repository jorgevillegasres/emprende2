# Sales Stock Movement Plan

## Goal

Make sales reduce product stock and prevent selling more units than are available.

## Steps

1. Add API tests for stock decrement and insufficient-stock rejection.
2. Extend product repositories with tenant-scoped product lookup and stock update.
3. Update the sales route to validate product existence and available stock.
4. Update the web sales form to show available stock and disable invalid sales.
5. Verify focused API tests, full tests, typecheck, build and browser behavior.
