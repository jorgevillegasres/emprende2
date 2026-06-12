import type { DecisionPriority, DecisionRecord, DecisionStatus } from "../api/client";

export type DecisionStatusFilter = DecisionStatus | "all";
export type DecisionPriorityFilter = DecisionPriority | "all";
export type DecisionSourceFilter = string | "all";

const sourceLabels: Record<string, string> = {
  manual: "Manual",
  pricing: "Precios",
  inventory: "Inventario",
  production: "Produccion",
  sales: "Ventas",
  expenses: "Gastos"
};

export function summarizeDecisions(decisions: DecisionRecord[]) {
  return {
    open: decisions.filter((decision) => decision.status === "open").length,
    done: decisions.filter((decision) => decision.status === "done").length,
    dismissed: decisions.filter((decision) => decision.status === "dismissed").length,
    highPriorityOpen: decisions.filter((decision) => decision.status === "open" && decision.priority === "high").length
  };
}

export function filterDecisions(
  decisions: DecisionRecord[],
  filters: { status: DecisionStatusFilter; priority: DecisionPriorityFilter; source?: DecisionSourceFilter }
) {
  return decisions.filter((decision) => {
    const matchesStatus = filters.status === "all" || decision.status === filters.status;
    const matchesPriority = filters.priority === "all" || decision.priority === filters.priority;
    const matchesSource = !filters.source || filters.source === "all" || decision.source === filters.source;
    return matchesStatus && matchesPriority && matchesSource;
  });
}

export function getDecisionSources(decisions: DecisionRecord[]) {
  return Array.from(new Set(decisions.map((decision) => decision.source).filter(Boolean)));
}

export function labelDecisionSource(source: string) {
  if (sourceLabels[source]) return sourceLabels[source];
  const normalized = source.replace(/[-_]+/g, " ").trim();
  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : "Sin origen";
}
