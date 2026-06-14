import { describe, expect, it } from "vitest";
import { calculateBreakEven, calculateDashboardMetrics } from "../src/index";

describe("calculateBreakEven", () => {
  it("estimates the revenue needed to cover fixed costs", () => {
    const result = calculateBreakEven(20000, 50, 27000);
    expect(result.breakEvenRevenue).toBe(40000);
    expect(result.revenueGap).toBe(13000);
    expect(result.progressPercent).toBe(67.5);
    expect(result.isCovered).toBe(false);
    expect(result.canEstimate).toBe(true);
  });

  it("marks the business as covered when revenue passes the break-even point", () => {
    const result = calculateBreakEven(10000, 50, 30000);
    expect(result.breakEvenRevenue).toBe(20000);
    expect(result.revenueGap).toBe(0);
    expect(result.progressPercent).toBe(100);
    expect(result.isCovered).toBe(true);
  });

  it("cannot estimate without a contribution margin", () => {
    const result = calculateBreakEven(20000, 0, 0);
    expect(result.canEstimate).toBe(false);
    expect(result.breakEvenRevenue).toBe(0);
    expect(result.isCovered).toBe(false);
  });
});

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
    expect(result.operationalCounts).toEqual({
      products: 2,
      supplies: 1,
      sales: 2,
      expenses: 1
    });
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
    expect(result.priceScenarios[0]).toMatchObject({
      name: "Balsamo",
      currentPrice: 9000,
      unitCost: 7000,
      targetMarginPercent: 60,
      suggestedPrice: 17500,
      priceDelta: 8500
    });
    expect(result.growthActions).toHaveLength(3);
  });
});
