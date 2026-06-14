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
  const monthlyComparison = getMonthlyComparison(state.sales, state.expenses, today);
  const stockForecast = getStockForecast(state.products, monthlySales, today);
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
    breakEven: calculateBreakEven(monthlyExpenses, averageMarginPercent, monthlyRevenue),
    lowStockItems,
    weeklyRevenue,
    monthlyComparison,
    stockForecast,
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

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function monthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return `${MONTHS_ES[month - 1] ?? monthKey} ${year}`;
}

function previousMonthKey(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  return `${prevYear}-${String(prevMonth).padStart(2, "0")}`;
}

type ComparisonDelta = {
  current: number;
  previous: number;
  delta: number;
  deltaPercent: number | null;
  trend: "up" | "down" | "flat";
};

function buildDelta(current: number, previous: number): ComparisonDelta {
  const delta = current - previous;
  return {
    current: round(current),
    previous: round(previous),
    delta: round(delta),
    deltaPercent: previous === 0 ? null : round((delta / Math.abs(previous)) * 100),
    trend: delta > 0 ? "up" : delta < 0 ? "down" : "flat"
  };
}

function getMonthlyComparison(sales: Sale[], expenses: Expense[], today: string) {
  const currentKey = today.slice(0, 7);
  const prevKey = previousMonthKey(currentKey);

  const aggregate = (monthKey: string) => {
    const monthSales = sales.filter((sale) => sale.date.startsWith(monthKey));
    const monthExpenses = expenses.filter((expense) => expense.date.startsWith(monthKey));
    const revenue = sumBy(monthSales, (sale) => sale.revenue);
    const grossProfit = sumBy(monthSales, (sale) => sale.grossProfit);
    const expenseTotal = sumBy(monthExpenses, (expense) => expense.amount);
    return {
      revenue,
      grossProfit,
      expenses: expenseTotal,
      net: grossProfit - expenseTotal,
      hasActivity: monthSales.length > 0 || monthExpenses.length > 0
    };
  };

  const current = aggregate(currentKey);
  const previous = aggregate(prevKey);

  return {
    currentMonthLabel: monthLabel(currentKey),
    previousMonthLabel: monthLabel(prevKey),
    hasPreviousData: previous.hasActivity,
    revenue: buildDelta(current.revenue, previous.revenue),
    grossProfit: buildDelta(current.grossProfit, previous.grossProfit),
    expenses: buildDelta(current.expenses, previous.expenses),
    netResult: buildDelta(current.net, previous.net)
  };
}

function getStockForecast(products: Product[], monthlySales: Sale[], today: string) {
  const todayDay = Number(today.slice(8, 10)) || 1;
  const windowDays = monthlySales.reduce((maxDay, sale) => Math.max(maxDay, Number(sale.date.slice(8, 10)) || 0), todayDay);
  const observedDays = Math.max(1, windowDays);

  const unitsByProduct = new Map<string, number>();
  for (const sale of monthlySales) {
    unitsByProduct.set(sale.productId, (unitsByProduct.get(sale.productId) ?? 0) + sale.quantity);
  }

  const statusRank = { critical: 0, watch: 1, healthy: 2, idle: 3 };

  return products
    .map((product) => {
      const unitsSold = unitsByProduct.get(product.id) ?? 0;
      const dailyRate = unitsSold === 0 ? 0 : round(unitsSold / observedDays);
      const daysRemaining = unitsSold === 0 ? null : Math.round((product.stock / unitsSold) * observedDays);
      const status: "critical" | "watch" | "healthy" | "idle" =
        daysRemaining === null ? "idle" : daysRemaining <= 7 ? "critical" : daysRemaining <= 21 ? "watch" : "healthy";
      return {
        productId: product.id,
        name: product.name,
        unit: product.unit,
        stock: product.stock,
        unitsSold,
        dailyRate,
        daysRemaining,
        status
      };
    })
    .sort((a, b) => {
      const rankDiff = statusRank[a.status] - statusRank[b.status];
      if (rankDiff !== 0) return rankDiff;
      return (a.daysRemaining ?? Infinity) - (b.daysRemaining ?? Infinity);
    });
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

export function calculateBreakEven(fixedCosts: number, contributionMarginPercent: number, currentRevenue: number) {
  const ratio = contributionMarginPercent / 100;
  const canEstimate = ratio > 0 && fixedCosts > 0;
  const breakEvenRevenue = canEstimate ? round(fixedCosts / ratio) : 0;
  const isCovered = canEstimate ? currentRevenue >= breakEvenRevenue : fixedCosts === 0;
  const revenueGap = round(Math.max(0, breakEvenRevenue - currentRevenue));
  const progressPercent =
    breakEvenRevenue > 0 ? round(Math.min(100, (currentRevenue / breakEvenRevenue) * 100)) : fixedCosts === 0 ? 100 : 0;

  return {
    fixedCosts: round(fixedCosts),
    contributionMarginPercent: round(contributionMarginPercent),
    breakEvenRevenue,
    currentRevenue: round(currentRevenue),
    revenueGap,
    progressPercent,
    isCovered,
    canEstimate
  };
}

function sumBy<T>(items: T[], selector: (item: T) => number) {
  return items.reduce((sum, item) => sum + selector(item), 0);
}

function round(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
