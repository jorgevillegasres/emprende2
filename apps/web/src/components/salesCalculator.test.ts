import { describe, expect, it } from "vitest";
import type { ProductRecord } from "../api/client";
import { calculateSaleTotals } from "./salesCalculator";

const product: ProductRecord = {
  id: "soap-001",
  name: "Jabon herbal",
  stock: 20,
  minStock: 4,
  unitCost: 5200,
  price: 13500,
  unit: "un"
};

describe("calculateSaleTotals", () => {
  it("calculates revenue, cost and gross profit from a product and quantity", () => {
    expect(calculateSaleTotals(product, 3)).toEqual({
      revenue: 40500,
      cost: 15600,
      grossProfit: 24900
    });
  });

  it("returns zero totals when quantity is not positive", () => {
    expect(calculateSaleTotals(product, 0)).toEqual({
      revenue: 0,
      cost: 0,
      grossProfit: 0
    });
  });

  it("returns zero totals when quantity is not a valid number", () => {
    expect(calculateSaleTotals(product, Number.NaN)).toEqual({
      revenue: 0,
      cost: 0,
      grossProfit: 0
    });
  });
});
