import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

describe("dashboard endpoint", () => {
  it("returns tenant-scoped dashboard metrics", async () => {
    const app = buildApp();
    // Mes fijo con datos demo para que la prueba sea determinista en el tiempo.
    const response = await app.inject({ method: "GET", url: "/v1/dashboard?month=2026-06" });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.monthlyRevenue).toBeGreaterThan(0);
    expect(body.operationalCounts).toMatchObject({
      products: expect.any(Number),
      supplies: expect.any(Number),
      sales: expect.any(Number),
      expenses: expect.any(Number)
    });
    expect(body.growthActions.length).toBeGreaterThan(0);
    expect(body.lowStockItems.length).toBeGreaterThan(0);
    expect(body.productProfitability[0]).toMatchObject({
      name: expect.any(String),
      revenue: expect.any(Number),
      grossProfit: expect.any(Number),
      marginPercent: expect.any(Number),
      unitProfit: expect.any(Number)
    });
    expect(body.priceScenarios[0]).toMatchObject({
      name: expect.any(String),
      currentPrice: expect.any(Number),
      unitCost: expect.any(Number),
      currentMarginPercent: expect.any(Number),
      suggestedPrice: expect.any(Number),
      recommendation: {
        action: expect.any(String),
        tone: expect.any(String),
        title: expect.any(String),
        detail: expect.any(String)
      }
    });
  });
});
