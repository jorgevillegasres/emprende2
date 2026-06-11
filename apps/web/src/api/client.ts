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

export type ProductRecord = {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  unitCost: number;
  price: number;
  unit?: string;
};

export type SupplyRecord = {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  averageCost: number;
  unit?: string;
};

export type SaleRecord = {
  date: string;
  productId: string;
  quantity: number;
  revenue: number;
  cost: number;
  grossProfit: number;
};

export type ExpenseRecord = {
  date: string;
  category: string;
  amount: number;
};

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const response = await fetch(`${API_BASE_URL}/v1/dashboard`);
  if (!response.ok) throw new Error("No se pudo cargar el dashboard");
  return response.json();
}

export async function listProducts(): Promise<ProductRecord[]> {
  return getJson("/v1/products");
}

export async function createProduct(payload: ProductRecord): Promise<ProductRecord> {
  return postJson("/v1/products", payload);
}

export async function listSupplies(): Promise<SupplyRecord[]> {
  return getJson("/v1/supplies");
}

export async function createSupply(payload: SupplyRecord): Promise<SupplyRecord> {
  return postJson("/v1/supplies", payload);
}

export async function listSales(): Promise<SaleRecord[]> {
  return getJson("/v1/sales");
}

export async function createSale(payload: SaleRecord): Promise<SaleRecord> {
  return postJson("/v1/sales", payload);
}

export async function listExpenses(): Promise<ExpenseRecord[]> {
  return getJson("/v1/expenses");
}

export async function createExpense(payload: ExpenseRecord): Promise<ExpenseRecord> {
  return postJson("/v1/expenses", payload);
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) throw new Error("No se pudo cargar la informacion");
  return response.json();
}

async function postJson<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("No se pudo guardar el registro");
  return response.json();
}
