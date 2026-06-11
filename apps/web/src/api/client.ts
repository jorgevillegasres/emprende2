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

export type AuthSession = {
  token: string;
  userId: string;
  tenantId: string;
  role: string;
};

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

export function createAuthHeaders(token: string | null | undefined): Record<string, string> {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function login(email: string, password: string): Promise<AuthSession> {
  return postJson("/v1/auth/login", { email, password });
}

export async function getCurrentUser(token: string): Promise<AuthSession> {
  const session = await getJson<Omit<AuthSession, "token">>("/v1/auth/me", token);
  return { ...session, token };
}

export async function getDashboardMetrics(token?: string | null): Promise<DashboardMetrics> {
  const response = await fetch(`${API_BASE_URL}/v1/dashboard`, {
    headers: createAuthHeaders(token)
  });
  if (!response.ok) throw new Error("No se pudo cargar el dashboard");
  return response.json();
}

export async function listProducts(token?: string | null): Promise<ProductRecord[]> {
  return getJson("/v1/products", token);
}

export async function createProduct(payload: ProductRecord, token?: string | null): Promise<ProductRecord> {
  return postJson("/v1/products", payload, token);
}

export async function listSupplies(token?: string | null): Promise<SupplyRecord[]> {
  return getJson("/v1/supplies", token);
}

export async function createSupply(payload: SupplyRecord, token?: string | null): Promise<SupplyRecord> {
  return postJson("/v1/supplies", payload, token);
}

export async function listSales(token?: string | null): Promise<SaleRecord[]> {
  return getJson("/v1/sales", token);
}

export async function createSale(payload: SaleRecord, token?: string | null): Promise<SaleRecord> {
  return postJson("/v1/sales", payload, token);
}

export async function listExpenses(token?: string | null): Promise<ExpenseRecord[]> {
  return getJson("/v1/expenses", token);
}

export async function createExpense(payload: ExpenseRecord, token?: string | null): Promise<ExpenseRecord> {
  return postJson("/v1/expenses", payload, token);
}

async function getJson<T>(path: string, token?: string | null): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: createAuthHeaders(token)
  });
  if (!response.ok) throw new Error("No se pudo cargar la informacion");
  return response.json();
}

async function postJson<T>(path: string, payload: unknown, token?: string | null): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...createAuthHeaders(token) },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("No se pudo guardar el registro");
  return response.json();
}
