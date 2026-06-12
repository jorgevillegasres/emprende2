import { describe, expect, it } from "vitest";
import { calculateDashboardMetrics } from "../src/index";

describe("calculateDashboardMetrics", () => {
  it("calculates monthly revenue, margin, weekly revenue, and growth actions", () => {
    const result = calculateDashboardMetrics(
      {
        supplies: [{ id: "labels", name: "Etiquetas", stock: 5, minStock: 10, averageCost: 300, unit: "un" }],
        products: [
          { id: "soap", name: "Jabon", stock: 8, minStock: 4, unitCost: 3000, price: 9000 },
          { id: "balm", name: "Balsamo", stock: 1, minStock: 5, unitCost: 7000, price: 9000 }
        ],
        expenses: [{ date: "2026-06-02", category: "Servicios", amount: 20000 }],
        sales: [
          { date: "2026-06-01", productId: "soap", quantity: 2, revenue: 18000, cost: 6000, grossProfit: 12000 },
          { date: "2026-06-09", productId: "balm", quantity: 1, revenue: 9000, cost: 7000, grossProfit: 2000 }
        ]
      },
      "2026-06-10"
    );

    expect(result.monthlyRevenue).toBe(27000);
    expect(result.averageMarginPercent).toBe(51.85);
    expect(result.weeklyRevenue.map((week) => week.revenue)).toEqual([18000, 9000, 0, 0, 0]);
    expect(result.productProfitability).toEqual([
      {
        productId: "soap",
        name: "Jabon",
        quantity: 2,
        revenue: 18000,
        cost: 6000,
        grossProfit: 12000,
        marginPercent: 66.67,
        unitProfit: 6000
      },
      {
        productId: "balm",
        name: "Balsamo",
        quantity: 1,
        revenue: 9000,
        cost: 7000,
        grossProfit: 2000,
        marginPercent: 22.22,
        unitProfit: 2000
      }
    ]);
    expect(result.growthActions).toHaveLength(3);
  });
});
