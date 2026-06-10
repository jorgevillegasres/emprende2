import { describe, expect, it } from "vitest";
import { createInMemoryRepositories } from "../src/db/repositories.js";

describe("tenant isolation", () => {
  it("only returns products for the active tenant", async () => {
    const repositories = createInMemoryRepositories();
    await repositories.products.insert({
      tenantId: "tenant-a",
      id: "a-product",
      name: "Jabon",
      stock: 3,
      minStock: 1,
      unitCost: 2000,
      price: 8000
    });
    await repositories.products.insert({
      tenantId: "tenant-b",
      id: "b-product",
      name: "Vela",
      stock: 4,
      minStock: 1,
      unitCost: 3000,
      price: 12000
    });

    const tenantAProducts = await repositories.products.listByTenant("tenant-a");

    expect(tenantAProducts.map((product) => product.id)).toEqual(["a-product"]);
  });
});
