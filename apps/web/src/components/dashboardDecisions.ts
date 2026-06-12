import type { DecisionPayload, DecisionRecord, DecisionPriority } from "../api/client";

export type GrowthAction = {
  title: string;
  detail: string;
  tone: string;
};

export type PricingAction = {
  name: string;
  recommendation: {
    title: string;
    detail: string;
    action: "raise-price" | "reduce-cost" | "maintain";
  };
};

export function getGrowthActionSource(action: GrowthAction) {
  const title = action.title.toLowerCase();
  if (title.startsWith("compra ")) return "inventory";
  if (title.startsWith("programa produccion ")) return "production";
  if (title.startsWith("observa gasto ")) return "expenses";
  if (title.startsWith("impulsa ")) return "sales";
  return "pricing";
}

export function buildGrowthDecisionPayload(action: GrowthAction, owner: string): DecisionPayload {
  return {
    title: action.title,
    detail: action.detail,
    source: getGrowthActionSource(action),
    priority: getGrowthActionPriority(action),
    owner: owner.trim() || "owner"
  };
}

export function buildPricingDecisionPayload(action: PricingAction, owner: string): DecisionPayload {
  return {
    title: `${action.recommendation.title}: ${action.name}`,
    detail: action.recommendation.detail,
    source: "pricing",
    priority: action.recommendation.action === "maintain" ? "low" : "high",
    owner: owner.trim() || "owner"
  };
}

export function findMatchingDecision(decisions: DecisionRecord[], payload: Pick<DecisionPayload, "title" | "detail" | "source">) {
  return decisions.find((decision) => decision.source === payload.source && decision.title === payload.title && decision.detail === payload.detail);
}

function getGrowthActionPriority(action: GrowthAction): DecisionPriority {
  if (action.tone === "growth") return "medium";
  if (action.tone === "focus") return "medium";
  return "high";
}
