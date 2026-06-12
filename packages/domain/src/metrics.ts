import { calculatePriceScenario } from "./pricing.js";

export type Supply = {
  id?: string;
  name: string;
  stock: number;
  minStock: number;
  averageCost: number;
  unit?: string;
};

export type Product = {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  unitCost: number;
  price: number;
  unit?: string;
};

export type Expense = {
  date: string;
  category: string;
  amount: number;
};

export type Sale = {
  date: string;
  productId: string;
  quantity: number;
  revenue: number;
  cost: number;
  grossProfit: number;
};

export type DashboardState = {
  supplies: Supply[];
  products: Product[];
  expenses: Expense[];
  sales: Sale[];
};

export function calculateDashboardMetrics(state: DashboardState, today: string) {
  const monthKey = today.slice(0, 7);
  const monthlySales = state.sales.filter((sale) => sale.date.startsWith(monthKey));
  const monthlyExpensesList = state.expenses.filter((expense) => expense.date.startsWith(monthKey));
  const monthlyRevenue = round(sumBy(monthlySales, (sale) => sale.revenue));
  const monthlyGrossProfit = round(sumBy(monthlySales, (sale) => sale.grossProfit));
  const monthlyExpenses = round(sumBy(monthlyExpensesList, (expense) => expense.amount));
  const averageMarginPercent = monthlyRevenue === 0 ? 0 : round((monthlyGrossProfit / monthlyRevenue) * 100);
  const supplyInventoryValue = round(sumBy(state.supplies, (supply) => supply.stock * supply.averageCost));
  const productInventoryValue = round(sumBy(state.products, (product) => product.stock * product.unitCost));
  const lowStockItems = [
    ...state.supplies
      .filter((supply) => supply.stock <= supply.minStock)
      .map((supply) => ({ ...supply, type: "Insumo" as const })),
    ...state.products
      .filter((product) => product.stock <= product.minStock)
      .map((product) => ({ ...product, type: "Producto" as const }))
  ];
  const weeklyRevenue = getWeeklyRevenue(monthlySales, today);
  const expensesByCategory = getExpensesByCategory(monthlyExpensesList);
  const topProductsByRevenue = getTopProductsByRevenue(monthlySales, state.products);
  const productProfitability = getProductProfitability(monthlySales, state.products);
  const priceScenarios = getPriceScenarios(state.products, 60);
  const marginLeaders = state.products
    .map((product) => ({
      ...product,
      margin: round(product.price - product.unitCost),
      marginPercent: product.price === 0 ? 0 : round(((product.price - product.unitCost) / product.price) * 100)
    }))
    .sort((a, b) => b.margin - a.margin);

  return {
    monthlyRevenue,
    monthlyGrossProfit,
    monthlyExpenses,
    averageMarginPercent,
    operationalCounts: {
      products: state.products.length,
      supplies: state.supplies.length,
      sales: state.sales.length,
      expenses: state.expenses.length
    },
    supplyInventoryValue,
    productInventoryValue,
    totalInventoryValue: round(supplyInventoryValue + productInventoryValue),
    netAfterExpenses: round(monthlyGrossProfit - monthlyExpenses),
    lowStockItems,
    weeklyRevenue,
    expensesByCategory,
    topProductsByRevenue,
    productProfitability,
    priceScenarios,
    marginLeaders,
    growthActions: getGrowthActions(lowStockItems, marginLeaders, expensesByCategory, topProductsByRevenue, averageMarginPercent)
  };
}

function getWeeklyRevenue(sales: Sale[], today: string) {
  const monthStart = new Date(`${today.slice(0, 7)}-01T00:00:00`);
  const weeks = Array.from({ length: 5 }, (_, index) => ({ label: `Semana ${index + 1}`, revenue: 0 }));
  for (const sale of sales) {
    const saleDate = new Date(`${sale.date}T00:00:00`);
    const dayOffset = Math.floor((saleDate.getTime() - monthStart.getTime()) / 86400000);
    const weekIndex = Math.min(4, Math.max(0, Math.floor(dayOffset / 7)));
    weeks[weekIndex].revenue += sale.revenue;
  }
  return weeks.map((week) => ({ ...week, revenue: round(week.revenue) }));
}

function getExpensesByCategory(expenses: Expense[]) {
  const totals = new Map<string, number>();
  for (const expense of expenses) totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
  return [...totals.entries()]
    .map(([category, amount]) => ({ category, amount: round(amount) }))
    .sort((a, b) => b.amount - a.amount);
}

function getTopProductsByRevenue(sales: Sale[], products: Product[]) {
  const productNames = new Map(products.map((product) => [product.id, product.name]));
  const totals = new Map<string, { productId: string; name: string; quantity: number; revenue: number; grossProfit: number }>();
  for (const sale of sales) {
    const current = totals.get(sale.productId) ?? {
      productId: sale.productId,
      name: productNames.get(sale.productId) ?? sale.productId,
      quantity: 0,
      revenue: 0,
      grossProfit: 0
    };
    current.quantity += sale.quantity;
    current.revenue += sale.revenue;
    current.grossProfit += sale.grossProfit;
    totals.set(sale.productId, current);
  }
  return [...totals.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
}

function getProductProfitability(sales: Sale[], products: Product[]) {
  const productNames = new Map(products.map((product) => [product.id, product.name]));
  const totals = new Map<
    string,
    { productId: string; name: string; quantity: number; revenue: number; cost: number; grossProfit: number }
  >();
  for (const sale of sales) {
    const current = totals.get(sale.productId) ?? {
      productId: sale.productId,
      name: productNames.get(sale.productId) ?? sale.productId,
      quantity: 0,
      revenue: 0,
      cost: 0,
      grossProfit: 0
    };
    current.quantity += sale.quantity;
    current.revenue += sale.revenue;
    current.cost += sale.cost;
    current.grossProfit += sale.grossProfit;
    totals.set(sale.productId, current);
  }

  return [...totals.values()]
    .map((product) => ({
      ...product,
      revenue: round(product.revenue),
      cost: round(product.cost),
      grossProfit: round(product.grossProfit),
      marginPercent: product.revenue === 0 ? 0 : round((product.grossProfit / product.revenue) * 100),
      unitProfit: product.quantity === 0 ? 0 : round(product.grossProfit / product.quantity)
    }))
    .sort((a, b) => b.grossProfit - a.grossProfit)
    .slice(0, 5);
}

function getPriceScenarios(products: Product[], targetMarginPercent: number) {
  return products
    .map((product) =>
      calculatePriceScenario({
        name: product.name,
        currentPrice: product.price,
        unitCost: product.unitCost,
        targetMarginPercent
      })
    )
    .sort((a, b) => a.currentMarginPercent - b.currentMarginPercent)
    .slice(0, 5);
}

function getGrowthActions(
  lowStockItems: Array<(Supply | Product) & { type: "Insumo" | "Producto" }>,
  marginLeaders: Array<Product & { margin: number; marginPercent: number }>,
  expensesByCategory: Array<{ category: string; amount: number }>,
  topProductsByRevenue: Array<{ productId: string; name: string; quantity: number; revenue: number; grossProfit: number }>,
  averageMarginPercent: number
) {
  const actions: Array<{ title: string; detail: string; tone: "growth" | "warning" | "focus" }> = [];
  const topProduct = topProductsByRevenue[0];
  const lowProduct = lowStockItems.find((item) => item.type === "Producto");
  const lowSupply = lowStockItems.find((item) => item.type === "Insumo");
  const weakMargin = [...marginLeaders].reverse().find((product) => product.marginPercent < 55);
  const topExpense = expensesByCategory[0];

  if (topProduct) actions.push({ title: `Impulsa ${topProduct.name}`, detail: "Es el producto con mas ventas este mes.", tone: "growth" });
  if (lowProduct) actions.push({ title: `Programa produccion de ${lowProduct.name}`, detail: "Esta por debajo del minimo.", tone: "warning" });
  if (lowSupply) actions.push({ title: `Compra ${lowSupply.name}`, detail: "Este insumo puede frenar la proxima produccion.", tone: "warning" });
  if (weakMargin) actions.push({ title: `Revisa precio de ${weakMargin.name}`, detail: `Su margen estimado es ${weakMargin.marginPercent}%.`, tone: "focus" });
  if (topExpense) actions.push({ title: `Observa gasto en ${topExpense.category}`, detail: "Es tu mayor categoria del mes.", tone: "focus" });
  if (averageMarginPercent < 45) actions.push({ title: "Sube el margen promedio", detail: "Tu rentabilidad necesita revision.", tone: "focus" });

  return actions.slice(0, 3);
}

function sumBy<T>(items: T[], selector: (item: T) => number) {
  return items.reduce((sum, item) => sum + selector(item), 0);
}

function round(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
