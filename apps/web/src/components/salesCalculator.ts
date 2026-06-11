import type { ProductRecord } from "../api/client";

export type SaleTotals = {
  revenue: number;
  cost: number;
  grossProfit: number;
};

export function calculateSaleTotals(product: ProductRecord | undefined, quantity: number): SaleTotals {
  if (!product || !Number.isFinite(quantity) || quantity <= 0) return { revenue: 0, cost: 0, grossProfit: 0 };

  const revenue = product.price * quantity;
  const cost = product.unitCost * quantity;
  return {
    revenue,
    cost,
    grossProfit: revenue - cost
  };
}
