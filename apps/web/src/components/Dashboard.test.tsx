import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { DashboardMetrics } from "../api/client";
import { Dashboard } from "./Dashboard";

const metrics: DashboardMetrics = {
  monthlyRevenue: 124000,
  monthlyGrossProfit: 85400,
  monthlyExpenses: 146000,
  averageMarginPercent: 68.87,
  totalInventoryValue: 914400,
  netAfterExpenses: -60600,
  breakEven: {
    fixedCosts: 146000,
    contributionMarginPercent: 68.87,
    breakEvenRevenue: 211993.61,
    currentRevenue: 124000,
    revenueGap: 87993.61,
    progressPercent: 58.49,
    isCovered: false,
    canEstimate: true
  },
  businessHealthScore: 57,
  weeklyRevenue: [{ label: "Semana 1", revenue: 124000 }],
  expensesByCategory: [{ category: "Servicios", amount: 68000 }],
  growthActions: [{ title: "Impulsa Shampoo solido", detail: "Es el producto con mas ventas.", tone: "growth" }],
  lowStockItems: [{ name: "Envase vidrio", type: "Insumo", stock: 30, minStock: 40, unit: "un" }],
  topProductsByRevenue: [],
  productProfitability: [{ productId: "shampoo", name: "Shampoo", quantity: 3, revenue: 48000, cost: 15600, grossProfit: 32400, marginPercent: 67.5, unitProfit: 10800 }],
  priceScenarios: [
    {
      name: "Shampoo",
      currentPrice: 16000,
      unitCost: 5200,
      targetMarginPercent: 60,
      currentMarginPercent: 67.5,
      currentUnitProfit: 10800,
      suggestedPrice: 13000,
      suggestedUnitProfit: 7800,
      priceDelta: -3000,
      priceDeltaPercent: -18.75,
      recommendation: {
        action: "maintain",
        tone: "steady",
        title: "Mantener precio",
        detail: "El precio actual ya supera el margen objetivo."
      }
    }
  ]
};

describe("Dashboard", () => {
  it("renders an executive overview layout before detailed analysis", () => {
    const markup = renderToStaticMarkup(<Dashboard metrics={metrics} token="token" />);

    expect(markup).toContain('class="executive-overview"');
    expect(markup).toContain('class="executive-panel"');
    expect(markup).toContain('class="executive-metrics"');
    expect(markup).toContain('class="dashboard-analysis"');
    expect(markup.indexOf("Salud del negocio")).toBeLessThan(markup.indexOf("Simulador de margen"));
    expect(markup.indexOf("Tus 3 decisiones de esta semana")).toBeLessThan(markup.indexOf("Ventas del mes"));
  });
});
