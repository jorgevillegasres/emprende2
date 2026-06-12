import { describe, expect, it } from "vitest";
import type { DashboardMetrics } from "../api/client";
import { getOnboardingProgress, isNewBusiness } from "./onboarding";

const emptyMetrics: DashboardMetrics = {
  monthlyRevenue: 0,
  monthlyGrossProfit: 0,
  monthlyExpenses: 0,
  averageMarginPercent: 0,
  totalInventoryValue: 0,
  netAfterExpenses: 0,
  businessHealthScore: 35,
  weeklyRevenue: [],
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
