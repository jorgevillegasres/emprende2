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
      priceDeltaPercent: -7.14,
      recommendation: {
        action: "maintain",
        tone: "steady",
        title: "Mantener precio",
        detail: "El precio actual ya supera el margen objetivo."
      }
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

  it("recommends raising price when the current margin is below target by a manageable gap", () => {
    const scenario = calculatePriceScenario({
      name: "Balsamo",
      currentPrice: 15000,
      unitCost: 7000,
      targetMarginPercent: 60
    });

    expect(scenario.recommendation).toEqual({
      action: "raise-price",
      tone: "growth",
      title: "Subir precio",
      detail: "Necesita subir $ 2.500 para llegar al margen objetivo."
    });
  });

  it("recommends reducing cost when the suggested price increase is too large", () => {
    const scenario = calculatePriceScenario({
      name: "Kit premium",
      currentPrice: 10000,
      unitCost: 8500,
      targetMarginPercent: 65
    });

    expect(scenario.recommendation).toEqual({
      action: "reduce-cost",
      tone: "focus",
      title: "Revisar costo",
      detail: "La subida sugerida supera 25%; conviene revisar insumos, receta o empaque."
    });
  });
});
