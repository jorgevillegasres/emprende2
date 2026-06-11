import { describe, expect, it } from "vitest";
import type { DashboardMetrics } from "../api/client";
import { isNewBusiness } from "./onboarding";

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
  topProductsByRevenue: []
};

describe("isNewBusiness", () => {
  it("detects a business with no operational data yet", () => {
    expect(isNewBusiness(emptyMetrics)).toBe(true);
  });

  it("does not mark a business with revenue as new", () => {
    expect(isNewBusiness({ ...emptyMetrics, monthlyRevenue: 1000 })).toBe(false);
  });
});
