import { describe, expect, it } from "vitest";
import type { DecisionRecord } from "../api/client";
import { filterDecisions, getDecisionSources, labelDecisionSource, summarizeDecisions } from "./actionPlanLogic";

const decisions: DecisionRecord[] = [
  {
    id: "raise-price",
    title: "Subir precio",
    detail: "Ajustar margen",
    source: "pricing",
    priority: "high",
    status: "open",
    owner: "Jorge"
  },
  {
    id: "package",
    title: "Revisar empaque",
    detail: "Buscar proveedor",
    source: "inventory",
    priority: "medium",
    status: "done",
    owner: "Laura"
  },
  {
    id: "promo",
    title: "Promocion pausada",
    detail: "No ejecutar",
    source: "sales",
    priority: "low",
    status: "dismissed"
  }
];

describe("action plan helpers", () => {
  it("summarizes decisions by status and priority", () => {
    expect(summarizeDecisions(decisions)).toEqual({
      open: 1,
      done: 1,
      dismissed: 1,
      highPriorityOpen: 1
    });
  });

  it("filters decisions by status and priority", () => {
    expect(filterDecisions(decisions, { status: "open", priority: "high" }).map((decision) => decision.id)).toEqual(["raise-price"]);
    expect(filterDecisions(decisions, { status: "all", priority: "all" })).toHaveLength(3);
  });

  it("filters decisions by source", () => {
    expect(filterDecisions(decisions, { status: "all", priority: "all", source: "inventory" }).map((decision) => decision.id)).toEqual(["package"]);
  });

  it("returns known decision sources with readable labels", () => {
    expect(getDecisionSources(decisions)).toEqual(["pricing", "inventory", "sales"]);
    expect(labelDecisionSource("pricing")).toBe("Precios");
    expect(labelDecisionSource("custom-source")).toBe("Custom source");
  });
});
