import { describe, expect, it } from "vitest";
import { createSeededRepositories } from "../src/db/seed.js";

const demoTenantId = "10000000-0000-0000-0000-000000000001";

describe("demo seed", () => {
  it("includes inventory movements and production history for a complete demo flow", async () => {
    const repositories = await createSeededRepositories();

    const movements = await repositories.inventoryMovements.listByTenant(demoTenantId);
    const productionOrders = await repositories.productionOrders.listByTenant(demoTenantId);

    expect(movements.length).toBeGreaterThan(0);
    expect(productionOrders).toEqual([
      expect.objectContaining({
        productId: "shampoo-romero",
        quantity: 10,
        recipeId: "shampoo-romero-base"
      })
    ]);
  });
});
