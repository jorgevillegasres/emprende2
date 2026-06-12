import type { DecisionPriority, DecisionRecord, DecisionStatus } from "../api/client";

export type DecisionStatusFilter = DecisionStatus | "all";
export type DecisionPriorityFilter = DecisionPriority | "all";

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
  filters: { status: DecisionStatusFilter; priority: DecisionPriorityFilter }
) {
  return decisions.filter((decision) => {
    const matchesStatus = filters.status === "all" || decision.status === filters.status;
    const matchesPriority = filters.priority === "all" || decision.priority === filters.priority;
    return matchesStatus && matchesPriority;
  });
}
