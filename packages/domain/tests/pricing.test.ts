import { describe, expect, it } from "vitest";
import { calculatePriceScenario } from "../src/index";

describe("calculatePriceScenario", () => {
  it("suggests a selling price from unit cost and target gross margin", () => {
    const scenario = calculatePriceScenario({
      name: "Shampoo solido",
      currentPrice: 16000,
      unitCost: 5200,
      targetMarginPercent: 65
    });

    expect(scenario).toEqual({
      name: "Shampoo solido",
      currentPrice: 16000,
      unitCost: 5200,
      currentMarginPercent: 67.5,
      currentUnitProfit: 10800,
      targetMarginPercent: 65,
      suggestedPrice: 14857.14,
      suggestedUnitProfit: 9657.14,
      priceDelta: -1142.86,
      priceDeltaPercent: -7.14
    });
  });

  it("keeps the calculation safe when price or target margin are invalid", () => {
    const scenario = calculatePriceScenario({
      name: "Nuevo producto",
      currentPrice: 0,
      unitCost: 4000,
      targetMarginPercent: 100
    });

    expect(scenario.currentMarginPercent).toBe(0);
    expect(scenario.suggestedPrice).toBe(0);
    expect(scenario.priceDeltaPercent).toBe(0);
  });
});
