import type { AppSection } from "./Shell";
import type { DashboardMetrics } from "../api/client";

export type OnboardingStep = {
  title: string;
  detail: string;
  section: Exclude<AppSection, "dashboard" | "plan">;
  completed?: boolean;
};

export const onboardingSteps: OnboardingStep[] = [
  {
    title: "Carga tus productos",
    detail: "Agrega lo que vendes con costo y precio para que Emprendedos calcule margen.",
    section: "products"
  },
  {
    title: "Registra tus insumos",
    detail: "Incluye materias primas, empaques o consumibles para cuidar stock y compras.",
    section: "supplies"
  },
  {
    title: "Registra tu primera venta",
    detail: "Una venta activa margen, utilidad y ritmo comercial en tu tablero.",
    section: "sales"
  },
  {
    title: "Anota tus gastos base",
    detail: "Servicios, transporte y herramientas ayudan a ver el resultado real.",
    section: "expenses"
  }
];

export function getOnboardingProgress(metrics: DashboardMetrics) {
  const counts = metrics.operationalCounts ?? {
    products: metrics.productProfitability.length,
    supplies: metrics.totalInventoryValue > 0 ? 1 : 0,
    sales: metrics.monthlyRevenue > 0 || metrics.topProductsByRevenue.length > 0 ? 1 : 0,
    expenses: metrics.monthlyExpenses > 0 || metrics.expensesByCategory.length > 0 ? 1 : 0
  };
  const steps: OnboardingStep[] = onboardingSteps.map((step) => ({
    ...step,
    completed:
      (step.section === "products" && counts.products > 0) ||
      (step.section === "supplies" && counts.supplies > 0) ||
      (step.section === "sales" && counts.sales > 0) ||
      (step.section === "expenses" && counts.expenses > 0)
  }));
  const completed = steps.filter((step) => step.completed).length;

  return {
    steps,
    completed,
    total: steps.length,
    percent: Math.round((completed / steps.length) * 100),
    nextStep: steps.find((step) => !step.completed) ?? null
  };
}

export function isNewBusiness(metrics: DashboardMetrics) {
  return (
    metrics.monthlyRevenue === 0 &&
    metrics.monthlyExpenses === 0 &&
    metrics.totalInventoryValue === 0 &&
    metrics.lowStockItems.length === 0 &&
    metrics.topProductsByRevenue.length === 0
  );
}
