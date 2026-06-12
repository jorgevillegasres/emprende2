import { describe, expect, it } from "vitest";
import type { DecisionRecord } from "../api/client";
import { buildGrowthDecisionPayload, buildPricingDecisionPayload, findMatchingDecision, getGrowthActionSource } from "./dashboardDecisions";

const existingDecisions: DecisionRecord[] = [
  {
    id: "stock-action",
    title: "Compra Envase vidrio",
    detail: "Este insumo puede frenar la proxima produccion.",
    source: "inventory",
    priority: "high",
    status: "done",
    owner: "Jorge"
  }
];

describe("dashboard decision helpers", () => {
  it("classifies dashboard recommendations by operational source", () => {
    expect(getGrowthActionSource({ title: "Compra Envase vidrio", detail: "Comprar", tone: "warning" })).toBe("inventory");
    expect(getGrowthActionSource({ title: "Programa produccion de Balsamo", detail: "Producir", tone: "warning" })).toBe("production");
    expect(getGrowthActionSource({ title: "Observa gasto en Servicios", detail: "Revisar", tone: "focus" })).toBe("expenses");
    expect(getGrowthActionSource({ title: "Impulsa Shampoo solido", detail: "Vender", tone: "growth" })).toBe("sales");
  });

  it("builds decision payloads from dashboard recommendations", () => {
    expect(buildGrowthDecisionPayload({ title: "Compra Envase vidrio", detail: "Este insumo puede frenar la proxima produccion.", tone: "warning" }, "Laura")).toEqual({
      title: "Compra Envase vidrio",
      detail: "Este insumo puede frenar la proxima produccion.",
      source: "inventory",
      priority: "high",
      owner: "Laura"
    });

    expect(buildPricingDecisionPayload({ name: "Shampoo", recommendation: { title: "Mantener precio", detail: "Va bien.", action: "maintain" } }, "Jorge")).toEqual({
      title: "Mantener precio: Shampoo",
      detail: "Va bien.",
      source: "pricing",
      priority: "low",
      owner: "Jorge"
    });
  });

  it("finds a matching decision across statuses to avoid duplicates", () => {
    const payload = buildGrowthDecisionPayload(
      { title: "Compra Envase vidrio", detail: "Este insumo puede frenar la proxima produccion.", tone: "warning" },
      "Laura"
    );

    expect(findMatchingDecision(existingDecisions, payload)?.id).toBe("stock-action");
  });
});
