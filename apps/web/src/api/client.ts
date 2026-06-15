export type ComparisonDelta = {
  current: number;
  previous: number;
  delta: number;
  deltaPercent: number | null;
  trend: "up" | "down" | "flat";
};

export type DashboardMetrics = {
  monthlyRevenue: number;
  monthlyGrossProfit: number;
  monthlyExpenses: number;
  averageMarginPercent: number;
  totalInventoryValue: number;
  netAfterExpenses: number;
  breakEven: {
    fixedCosts: number;
    contributionMarginPercent: number;
    breakEvenRevenue: number;
    currentRevenue: number;
    revenueGap: number;
    progressPercent: number;
    isCovered: boolean;
    canEstimate: boolean;
  };
  businessHealthScore?: number;
  businessHealth?: {
    score: number;
    verdict: "healthy" | "watch" | "at-risk" | "setup";
    label: string;
    reason: string;
  };
  cashFlow?: {
    usesAggregateCapture: boolean;
    cashIn: number;
    cashOut: number;
    cashResult: number;
    aggregateRevenue: number;
    aggregateCashOut: number;
  };
  operationalCounts?: {
    products: number;
    supplies: number;
    sales: number;
    expenses: number;
  };
  weeklyRevenue: Array<{ label: string; revenue: number }>;
  monthlyComparison: {
    currentMonthLabel: string;
    previousMonthLabel: string;
    hasPreviousData: boolean;
    revenue: ComparisonDelta;
    grossProfit: ComparisonDelta;
    expenses: ComparisonDelta;
    netResult: ComparisonDelta;
  };
  stockForecast: Array<{
    productId: string;
    name: string;
    unit?: string;
    stock: number;
    unitsSold: number;
    dailyRate: number;
    daysRemaining: number | null;
    status: "critical" | "watch" | "healthy" | "idle";
  }>;
  expensesByCategory: Array<{ category: string; amount: number }>;
  growthActions: Array<{ title: string; detail: string; tone: string }>;
  lowStockItems: Array<{ name: string; type: string; stock: number; minStock: number; unit?: string }>;
  topProductsByRevenue: Array<{ name: string; quantity: number; revenue: number; grossProfit: number }>;
  productProfitability: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
    cost: number;
    grossProfit: number;
    marginPercent: number;
    unitProfit: number;
  }>;
  priceScenarios: Array<{
    name: string;
    currentPrice: number;
    unitCost: number;
    targetMarginPercent: number;
    currentMarginPercent: number;
    currentUnitProfit: number;
    suggestedPrice: number;
    suggestedUnitProfit: number;
    priceDelta: number;
    priceDeltaPercent: number;
    recommendation: {
      action: "raise-price" | "reduce-cost" | "maintain";
      tone: "growth" | "focus" | "steady";
      title: string;
      detail: string;
    };
  }>;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:3001";

export type TenantFeatureFlags = {
  quickCapture?: boolean;
};

export type AuthSession = {
  token: string;
  userId: string;
  tenantId: string;
  role: string;
  superAdmin?: boolean;
  featureFlags?: TenantFeatureFlags;
};

export type AdminAccount = {
  userId: string;
  userName: string;
  email: string;
  tenantId: string;
  tenantName: string;
  role: string;
  suspended: boolean;
};

export type RegisterPayload = {
  ownerName: string;
  email: string;
  password: string;
  businessName: string;
  businessType: string;
  country: string;
  currency: string;
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

export type InventoryMovementRecord = {
  id: string;
  itemType: "product" | "supply";
  itemId: string;
  movementType: "sale" | "production" | "adjustment" | "purchase";
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  referenceType: string;
  referenceId: string;
  note?: string;
  createdAt?: string;
};

export type InventoryAdjustmentPayload = {
  itemType: "product";
  itemId: string;
  stockAfter: number;
  note: string;
};

export type InventoryPurchasePayload = {
  itemType: "product" | "supply";
  itemId: string;
  quantity: number;
  unitCost?: number;
  note: string;
};

export type ProductionOrderPayload = {
  productId: string;
  quantity: number;
  supplies: Array<{ supplyId: string; quantity: number }>;
  note: string;
};

export type ProductionFromRecipePayload = {
  recipeId: string;
  quantity: number;
  note: string;
};

export type ProductionOrderRecord = {
  id: string;
  productId: string;
  quantity: number;
  totalCost: number;
  unitCost: number;
  recipeId?: string | null;
  note?: string;
  createdAt?: string;
  movements: InventoryMovementRecord[];
};

export type ProductionOrderSummaryRecord = Omit<ProductionOrderRecord, "movements">;

export type RecipeIngredientRecord = {
  supplyId: string;
  quantity: number;
};

export type RecipeRecord = {
  id: string;
  productId: string;
  name: string;
  outputQuantity: number;
  ingredients: RecipeIngredientRecord[];
  note?: string;
  createdAt?: string;
};

export type RecipePayload = {
  id: string;
  productId: string;
  name: string;
  outputQuantity: number;
  ingredients: RecipeIngredientRecord[];
  note?: string;
};

export type DecisionStatus = "open" | "done" | "dismissed";
export type DecisionPriority = "low" | "medium" | "high";

export type DecisionRecord = {
  id: string;
  tenantId?: string;
  title: string;
  detail: string;
  source: string;
  priority: DecisionPriority;
  status: DecisionStatus;
  owner?: string;
  dueDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type DecisionPayload = {
  title: string;
  detail: string;
  source: string;
  priority: DecisionPriority;
  owner?: string;
  dueDate?: string;
};

export function createAuthHeaders(token: string | null | undefined): Record<string, string> {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export function getRegisterPath() {
  return "/v1/auth/register";
}

export function getInventoryMovementsPath() {
  return "/v1/inventory-movements";
}

export function getInventoryAdjustmentPath() {
  return "/v1/inventory-adjustments";
}

export function getInventoryPurchasePath() {
  return "/v1/inventory-purchases";
}

export function getProductionOrderPath() {
  return "/v1/production-orders";
}

export function getProductionOrdersPath() {
  return "/v1/production-orders";
}

export function getProductionFromRecipePath() {
  return "/v1/production-orders/from-recipe";
}

export function getRecipesPath() {
  return "/v1/recipes";
}

export function getDecisionsPath(status?: DecisionStatus) {
  return status ? `/v1/decisions?status=${status}` : "/v1/decisions";
}

export async function login(email: string, password: string): Promise<AuthSession> {
  return postJson("/v1/auth/login", { email, password });
}

export async function registerOwner(payload: RegisterPayload): Promise<AuthSession> {
  return postJson(getRegisterPath(), payload);
}

export async function demoLogin(): Promise<AuthSession> {
  return postJson("/v1/auth/demo", {});
}

export async function listAdminAccounts(token: string): Promise<AdminAccount[]> {
  return getJson<AdminAccount[]>("/v1/admin/accounts", token);
}

export async function createAdminUser(
  payload: { ownerName: string; email: string; password: string; businessName: string; businessType: string },
  token: string
): Promise<void> {
  await postJson("/v1/admin/users", payload, token);
}

export async function suspendAdminUser(userId: string, token: string): Promise<void> {
  await postJson(`/v1/admin/users/${userId}/suspend`, {}, token);
}

export async function reactivateAdminUser(userId: string, token: string): Promise<void> {
  await postJson(`/v1/admin/users/${userId}/reactivate`, {}, token);
}

export async function getCurrentUser(token: string): Promise<AuthSession> {
  const session = await getJson<Omit<AuthSession, "token">>("/v1/auth/me", token);
  return { ...session, token };
}

export async function getDashboardMetrics(token?: string | null, month?: string): Promise<DashboardMetrics> {
  const query = month ? `?month=${encodeURIComponent(month)}` : "";
  const response = await fetch(`${API_BASE_URL}/v1/dashboard${query}`, {
    headers: createAuthHeaders(token)
  });
  if (!response.ok) throw new Error("No se pudo cargar el dashboard");
  return response.json();
}

export async function setTenantFlags(flags: TenantFeatureFlags, token: string): Promise<TenantFeatureFlags> {
  const result = await postJson<{ featureFlags: TenantFeatureFlags }>("/v1/tenant/flags", flags, token);
  return result.featureFlags;
}

export async function createWeeklyCapture(
  payload: { periodStart: string; periodEnd: string; revenue: number; cashOut: number; note?: string },
  token: string
): Promise<void> {
  await postJson("/v1/capture/weekly", payload, token);
}

// Instrumentacion fire-and-forget: nunca debe romper la UX.
export function track(name: string, props: Record<string, unknown> = {}, token?: string | null): void {
  void fetch(`${API_BASE_URL}/v1/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...createAuthHeaders(token) },
    body: JSON.stringify({ name, props })
  }).catch(() => {});
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

export async function listInventoryMovements(token?: string | null): Promise<InventoryMovementRecord[]> {
  return getJson(getInventoryMovementsPath(), token);
}

export async function createInventoryAdjustment(payload: InventoryAdjustmentPayload, token?: string | null): Promise<InventoryMovementRecord> {
  return postJson(getInventoryAdjustmentPath(), payload, token);
}

export async function createInventoryPurchase(payload: InventoryPurchasePayload, token?: string | null): Promise<InventoryMovementRecord> {
  return postJson(getInventoryPurchasePath(), payload, token);
}

export async function createProductionOrder(payload: ProductionOrderPayload, token?: string | null): Promise<ProductionOrderRecord> {
  return postJson(getProductionOrderPath(), payload, token);
}

export async function listProductionOrders(token?: string | null): Promise<ProductionOrderSummaryRecord[]> {
  return getJson(getProductionOrdersPath(), token);
}

export async function createProductionFromRecipe(payload: ProductionFromRecipePayload, token?: string | null): Promise<ProductionOrderRecord> {
  return postJson(getProductionFromRecipePath(), payload, token);
}

export async function listRecipes(token?: string | null): Promise<RecipeRecord[]> {
  return getJson(getRecipesPath(), token);
}

export async function createRecipe(payload: RecipePayload, token?: string | null): Promise<RecipeRecord> {
  return postJson(getRecipesPath(), payload, token);
}

export async function listDecisions(token?: string | null, status?: DecisionStatus): Promise<DecisionRecord[]> {
  return getJson(getDecisionsPath(status), token);
}

export async function createDecision(payload: DecisionPayload, token?: string | null): Promise<DecisionRecord> {
  return postJson(getDecisionsPath(), payload, token);
}

export async function updateDecisionStatus(id: string, status: DecisionStatus, token?: string | null): Promise<DecisionRecord> {
  return patchJson(`${getDecisionsPath()}/${id}`, { status }, token);
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

async function patchJson<T>(path: string, payload: unknown, token?: string | null): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...createAuthHeaders(token) },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("No se pudo actualizar el registro");
  return response.json();
}
