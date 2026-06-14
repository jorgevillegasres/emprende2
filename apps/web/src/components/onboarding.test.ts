import { describe, expect, it } from "vitest";
import type { DashboardMetrics } from "../api/client";
import { getActivationStatus, getOnboardingProgress, isNewBusiness } from "./onboarding";

const emptyMetrics: DashboardMetrics = {
  monthlyRevenue: 0,
  monthlyGrossProfit: 0,
  monthlyExpenses: 0,
  averageMarginPercent: 0,
  totalInventoryValue: 0,
  netAfterExpenses: 0,
  breakEven: {
    fixedCosts: 0,
    contributionMarginPercent: 0,
    breakEvenRevenue: 0,
    currentRevenue: 0,
    revenueGap: 0,
    progressPercent: 0,
    isCovered: false,
    canEstimate: false
  },
  businessHealthScore: 35,
  weeklyRevenue: [],
  monthlyComparison: {
    currentMonthLabel: "Junio 2026",
    previousMonthLabel: "Mayo 2026",
    hasPreviousData: false,
    revenue: { current: 0, previous: 0, delta: 0, deltaPercent: null, trend: "flat" },
    grossProfit: { current: 0, previous: 0, delta: 0, deltaPercent: null, trend: "flat" },
    expenses: { current: 0, previous: 0, delta: 0, deltaPercent: null, trend: "flat" },
    netResult: { current: 0, previous: 0, delta: 0, deltaPercent: null, trend: "flat" }
  },
  stockForecast: [],
  expensesByCategory: [],
  growthActions: [],
  lowStockItems: [],
  topProductsByRevenue: [],
  productProfitability: [],
  priceScenarios: []
};

describe("isNewBusiness", () => {
  it("detects a business with no operational data yet", () => {
    expect(isNewBusiness(emptyMetrics)).toBe(true);
  });

  it("does not mark a business with revenue as new", () => {
    expect(isNewBusiness({ ...emptyMetrics, monthlyRevenue: 1000 })).toBe(false);
  });
});

describe("getOnboardingProgress", () => {
  it("builds setup steps from operational counts", () => {
    const progress = getOnboardingProgress({
      ...emptyMetrics,
      operationalCounts: { products: 1, supplies: 0, sales: 0, expenses: 1 }
    });

    expect(progress.percent).toBe(50);
    expect(progress.completed).toBe(2);
    expect(progress.nextStep?.section).toBe("supplies");
    expect(progress.steps.map((step) => ({ section: step.section, completed: step.completed }))).toEqual([
      { section: "products", completed: true },
      { section: "supplies", completed: false },
      { section: "sales", completed: false },
      { section: "expenses", completed: true }
    ]);
  });
});

describe("getActivationStatus", () => {
  it("marks the business as ready when all setup steps are complete", () => {
    const status = getActivationStatus({
      ...emptyMetrics,
      operationalCounts: { products: 1, supplies: 1, sales: 1, expenses: 1 }
    });

    expect(status.isReady).toBe(true);
    expect(status.label).toBe("Listo para operar");
    expect(status.nextActionSection).toBeNull();
  });

  it("points to the next setup action when the business is not ready", () => {
    const status = getActivationStatus({
      ...emptyMetrics,
      operationalCounts: { products: 1, supplies: 0, sales: 0, expenses: 0 }
    });

    expect(status.isReady).toBe(false);
    expect(status.label).toBe("Configuracion en progreso");
    expect(status.nextActionSection).toBe("supplies");
  });
});
