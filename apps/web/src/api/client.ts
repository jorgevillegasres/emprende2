export type DashboardMetrics = {
  monthlyRevenue: number;
  monthlyGrossProfit: number;
  monthlyExpenses: number;
  averageMarginPercent: number;
  totalInventoryValue: number;
  netAfterExpenses: number;
  businessHealthScore?: number;
  weeklyRevenue: Array<{ label: string; revenue: number }>;
  expensesByCategory: Array<{ category: string; amount: number }>;
  growthActions: Array<{ title: string; detail: string; tone: string }>;
  lowStockItems: Array<{ name: string; type: string; stock: number; minStock: number; unit?: string }>;
  topProductsByRevenue: Array<{ name: string; quantity: number; revenue: number; grossProfit: number }>;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:3001";

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const response = await fetch(`${API_BASE_URL}/v1/dashboard`);
  if (!response.ok) throw new Error("No se pudo cargar el dashboard");
  return response.json();
}
