import { describe, expect, it } from "vitest";
import { calculateBusinessHealth } from "../src/index";

describe("calculateBusinessHealth", () => {
  it("returns a setup verdict when there is no financial data yet", () => {
    const result = calculateBusinessHealth({ averageMarginPercent: 0, netAfterExpenses: 0, lowStockCount: 0, hasMinimumData: false });
    expect(result.verdict).toBe("setup");
    expect(result.score).toBe(0);
  });

  it("never shows a money-losing business as healthy, even with great margin", () => {
    const result = calculateBusinessHealth({ averageMarginPercent: 70, netAfterExpenses: -50000, lowStockCount: 0, hasMinimumData: true });
    expect(result.verdict).toBe("at-risk");
    expect(result.score).toBeLessThanOrEqual(45);
  });

  it("flags a thin-margin but profitable business as watch", () => {
    const result = calculateBusinessHealth({ averageMarginPercent: 30, netAfterExpenses: 5000, lowStockCount: 0, hasMinimumData: true });
    expect(result.verdict).toBe("watch");
  });

  it("marks a profitable, healthy-margin business as healthy", () => {
    const result = calculateBusinessHealth({ averageMarginPercent: 60, netAfterExpenses: 20000, lowStockCount: 1, hasMinimumData: true });
    expect(result.verdict).toBe("healthy");
    expect(result.score).toBeGreaterThan(45);
  });

  it("uses cash result for the verdict in cash mode, ignoring margin", () => {
    const positive = calculateBusinessHealth({ averageMarginPercent: 0, netAfterExpenses: 0, lowStockCount: 0, hasMinimumData: true, cashMode: { cashResult: 30000 } });
    expect(positive.verdict).toBe("healthy");

    const negative = calculateBusinessHealth({ averageMarginPercent: 80, netAfterExpenses: 0, lowStockCount: 0, hasMinimumData: true, cashMode: { cashResult: -10000 } });
    expect(negative.verdict).toBe("at-risk");
  });
});
