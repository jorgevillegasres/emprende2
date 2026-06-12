import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

describe("dashboard endpoint", () => {
  it("returns tenant-scoped dashboard metrics", async () => {
    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/v1/dashboard" });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.monthlyRevenue).toBeGreaterThan(0);
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
