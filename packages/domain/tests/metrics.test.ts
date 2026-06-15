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

  it("compares the current month against the previous one", () => {
    const result = calculateDashboardMetrics(
      {
        supplies: [],
        products: [{ id: "soap", name: "Jabon", stock: 8, minStock: 4, unitCost: 3000, price: 9000 }],
        expenses: [
          { date: "2026-05-04", category: "Servicios", amount: 10000 },
          { date: "2026-06-02", category: "Servicios", amount: 20000 }
        ],
        sales: [
          { date: "2026-05-05", productId: "soap", quantity: 1, revenue: 9000, cost: 3000, grossProfit: 6000 },
          { date: "2026-06-01", productId: "soap", quantity: 2, revenue: 18000, cost: 6000, grossProfit: 12000 }
        ]
      },
      "2026-06-10"
    );

    expect(result.monthlyComparison.currentMonthLabel).toBe("Junio 2026");
    expect(result.monthlyComparison.previousMonthLabel).toBe("Mayo 2026");
    expect(result.monthlyComparison.hasPreviousData).toBe(true);
    expect(result.monthlyComparison.revenue).toMatchObject({ current: 18000, previous: 9000, delta: 9000, deltaPercent: 100, trend: "up" });
    expect(result.monthlyComparison.expenses.trend).toBe("up");
    expect(result.monthlyComparison.netResult.current).toBe(-8000);
  });

  it("returns no previous data when last month had no activity", () => {
    const result = calculateDashboardMetrics(
      {
        supplies: [],
        products: [{ id: "soap", name: "Jabon", stock: 8, minStock: 4, unitCost: 3000, price: 9000 }],
        expenses: [],
        sales: [{ date: "2026-06-01", productId: "soap", quantity: 2, revenue: 18000, cost: 6000, grossProfit: 12000 }]
      },
      "2026-06-10"
    );

    expect(result.monthlyComparison.hasPreviousData).toBe(false);
    expect(result.monthlyComparison.revenue.deltaPercent).toBeNull();
    expect(result.monthlyComparison.revenue.trend).toBe("up");
  });

  it("projects how long product stock lasts at the current sales pace", () => {
    const result = calculateDashboardMetrics(
      {
        supplies: [],
        products: [
          { id: "soap", name: "Jabon", stock: 10, minStock: 4, unitCost: 3000, price: 9000 },
          { id: "balm", name: "Balsamo", stock: 40, minStock: 5, unitCost: 7000, price: 9000 },
          { id: "wax", name: "Vela", stock: 5, minStock: 2, unitCost: 6000, price: 18000 }
        ],
        expenses: [],
        sales: [
          { date: "2026-06-02", productId: "soap", quantity: 5, revenue: 45000, cost: 15000, grossProfit: 30000 },
          { date: "2026-06-09", productId: "soap", quantity: 5, revenue: 45000, cost: 15000, grossProfit: 30000 },
          { date: "2026-06-10", productId: "balm", quantity: 1, revenue: 9000, cost: 7000, grossProfit: 2000 }
        ]
      },
      "2026-06-10"
    );

    const soap = result.stockForecast.find((item) => item.productId === "soap");
    const balm = result.stockForecast.find((item) => item.productId === "balm");
    const wax = result.stockForecast.find((item) => item.productId === "wax");

    expect(soap).toMatchObject({ unitsSold: 10, daysRemaining: 10, status: "watch" });
    expect(balm).toMatchObject({ unitsSold: 1, status: "healthy" });
    expect(wax).toMatchObject({ unitsSold: 0, daysRemaining: null, status: "idle" });
    // Most urgent product is listed first.
    expect(result.stockForecast[0]?.productId).toBe("soap");
  });

  it("does not report a percentage change when the previous base is negative", () => {
    const result = calculateDashboardMetrics(
      {
        supplies: [],
        products: [{ id: "soap", name: "Jabon", stock: 8, minStock: 4, unitCost: 3000, price: 9000 }],
        expenses: [
          { date: "2026-05-04", category: "Arriendo", amount: 30000 },
          { date: "2026-06-02", category: "Arriendo", amount: 5000 }
        ],
        sales: [
          { date: "2026-05-05", productId: "soap", quantity: 1, revenue: 9000, cost: 3000, grossProfit: 6000 },
          { date: "2026-06-01", productId: "soap", quantity: 3, revenue: 27000, cost: 9000, grossProfit: 18000 }
        ]
      },
      "2026-06-10"
    );

    // Mayo: gp 6000 - gastos 30000 = -24000 (perdida). Junio: 18000 - 5000 = +13000.
    expect(result.monthlyComparison.netResult.previous).toBe(-24000);
    expect(result.monthlyComparison.netResult.current).toBe(13000);
    expect(result.monthlyComparison.netResult.deltaPercent).toBeNull();
    expect(result.monthlyComparison.netResult.trend).toBe("up");
  });

  it("recommends reviewing price instead of pushing volume when the top seller has a thin margin", () => {
    const result = calculateDashboardMetrics(
      {
        supplies: [],
        products: [{ id: "soap", name: "Jabon", stock: 8, minStock: 4, unitCost: 8500, price: 9000 }],
        expenses: [],
        sales: [{ date: "2026-06-01", productId: "soap", quantity: 10, revenue: 90000, cost: 85000, grossProfit: 5000 }]
      },
      "2026-06-10"
    );

    const topAction = result.growthActions[0];
    expect(topAction.title).toContain("Revisa el precio");
    expect(topAction.tone).toBe("focus");
  });

  it("exposes a business health verdict, never green while losing money", () => {
    const losing = calculateDashboardMetrics(
      {
        supplies: [],
        products: [{ id: "soap", name: "Jabon", stock: 8, minStock: 4, unitCost: 3000, price: 9000 }],
        expenses: [{ date: "2026-06-02", category: "Arriendo", amount: 50000 }],
        sales: [{ date: "2026-06-01", productId: "soap", quantity: 2, revenue: 18000, cost: 6000, grossProfit: 12000 }]
      },
      "2026-06-10"
    );

    expect(losing.businessHealth.verdict).toBe("at-risk");
    expect(losing.businessHealthScore).toBeLessThanOrEqual(45);
  });

  it("computes a cash result and cash-mode health from aggregate weekly entries", () => {
    const result = calculateDashboardMetrics(
      {
        supplies: [],
        products: [],
        expenses: [],
        sales: [],
        aggregateEntries: [
          { periodStart: "2026-06-01", periodEnd: "2026-06-07", revenue: 200000, cashOut: 120000 },
          { periodStart: "2026-06-08", periodEnd: "2026-06-14", revenue: 150000, cashOut: 180000 }
        ]
      },
      "2026-06-10"
    );

    expect(result.cashFlow.usesAggregateCapture).toBe(true);
    expect(result.cashFlow.cashIn).toBe(350000);
    expect(result.cashFlow.cashOut).toBe(300000);
    expect(result.cashFlow.cashResult).toBe(50000);
    expect(result.businessHealth.verdict).toBe("healthy");
  });

  it("flags cash-negative aggregate capture as at-risk and leaves granular metrics empty", () => {
    const result = calculateDashboardMetrics(
      {
        supplies: [],
        products: [],
        expenses: [],
        sales: [],
        aggregateEntries: [{ periodStart: "2026-06-02", periodEnd: "2026-06-08", revenue: 100000, cashOut: 150000 }]
      },
      "2026-06-10"
    );

    expect(result.cashFlow.cashResult).toBe(-50000);
    expect(result.businessHealth.verdict).toBe("at-risk");
    // La captura gruesa no inventa metricas por producto.
    expect(result.monthlyRevenue).toBe(0);
    expect(result.productProfitability).toHaveLength(0);
  });
});
