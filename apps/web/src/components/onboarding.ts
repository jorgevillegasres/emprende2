import type { AppSection } from "./Shell";
import type { DashboardMetrics } from "../api/client";

export type OnboardingStep = {
  title: string;
  detail: string;
  section: Exclude<AppSection, "dashboard">;
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
    title: "Anota tus gastos base",
    detail: "Servicios, transporte y herramientas ayudan a ver el resultado real.",
    section: "expenses"
  }
];

export function isNewBusiness(metrics: DashboardMetrics) {
  return (
    metrics.monthlyRevenue === 0 &&
    metrics.monthlyExpenses === 0 &&
    metrics.totalInventoryValue === 0 &&
    metrics.lowStockItems.length === 0 &&
    metrics.topProductsByRevenue.length === 0
  );
}
