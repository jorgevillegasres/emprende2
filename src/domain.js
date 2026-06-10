export function addSupplyPurchase(state, purchase) {
  const supplies = state.supplies.map((supply) => {
    if (supply.id !== purchase.supplyId) return supply;

    const oldStock = Number(supply.stock || 0);
    const oldCost = Number(supply.averageCost || 0);
    const quantity = Number(purchase.quantity || 0);
    const totalCost = Number(purchase.totalCost || 0);
    const newStock = oldStock + quantity;
    const averageCost = newStock === 0 ? 0 : (oldStock * oldCost + totalCost) / newStock;

    return {
      ...supply,
      stock: round(newStock),
      averageCost: round(averageCost),
      lot: purchase.lot || supply.lot || '',
      expiresAt: purchase.expiresAt || supply.expiresAt || '',
    };
  });

  ensureFound(supplies, purchase.supplyId, 'Insumo');

  return {
    ...state,
    supplies,
    purchases: [{ ...purchase, totalCost: Number(purchase.totalCost) }, ...(state.purchases || [])],
  };
}

export function registerProduction(state, production) {
  const product = (state.products || []).find((item) => item.id === production.productId);
  if (!product) throw new Error(`Producto no encontrado: ${production.productId}`);

  const consumptions = production.consumptions || [];
  let totalCost = 0;

  for (const consumption of consumptions) {
    const supply = (state.supplies || []).find((item) => item.id === consumption.supplyId);
    if (!supply) throw new Error(`Insumo no encontrado: ${consumption.supplyId}`);
    if (Number(supply.stock) < Number(consumption.quantity)) {
      throw new Error(`Stock insuficiente para ${supply.name}`);
    }
    totalCost += Number(consumption.quantity) * Number(supply.averageCost || 0);
  }

  totalCost += Number(production.laborCost || 0);
  totalCost += Number(production.directCost || 0);

  const supplies = (state.supplies || []).map((supply) => {
    const consumption = consumptions.find((item) => item.supplyId === supply.id);
    if (!consumption) return supply;
    return { ...supply, stock: round(Number(supply.stock) - Number(consumption.quantity)) };
  });

  const quantityProduced = Number(production.quantityProduced || 0);
  if (quantityProduced <= 0) throw new Error('La cantidad producida debe ser mayor que cero');

  const newUnitCost = totalCost / quantityProduced;
  const products = (state.products || []).map((item) => {
    if (item.id !== production.productId) return item;

    const oldStock = Number(item.stock || 0);
    const oldUnitCost = Number(item.unitCost || 0);
    const newStock = oldStock + quantityProduced;
    const blendedUnitCost =
      newStock === 0 ? 0 : (oldStock * oldUnitCost + totalCost) / newStock;

    return {
      ...item,
      stock: round(newStock),
      unitCost: round(blendedUnitCost),
      lot: production.lot || item.lot || '',
      expiresAt: production.expiresAt || item.expiresAt || '',
    };
  });

  return {
    ...state,
    supplies,
    products,
    productions: [
      {
        ...production,
        quantityProduced,
        totalCost: round(totalCost),
        unitCost: round(newUnitCost),
      },
      ...(state.productions || []),
    ],
  };
}

export function registerSale(state, sale) {
  const product = (state.products || []).find((item) => item.id === sale.productId);
  if (!product) throw new Error(`Producto no encontrado: ${sale.productId}`);

  const quantity = Number(sale.quantity || 0);
  if (quantity <= 0) throw new Error('La cantidad vendida debe ser mayor que cero');
  if (Number(product.stock || 0) < quantity) {
    throw new Error(`Stock insuficiente para ${product.name}`);
  }

  const unitPrice = Number(sale.unitPrice || product.price || 0);
  const unitCost = Number(product.unitCost || 0);
  const revenue = quantity * unitPrice;
  const cost = quantity * unitCost;
  const grossProfit = revenue - cost;

  const products = (state.products || []).map((item) => {
    if (item.id !== sale.productId) return item;
    return { ...item, stock: round(Number(item.stock || 0) - quantity) };
  });

  return {
    ...state,
    products,
    sales: [
      {
        ...sale,
        quantity,
        unitPrice: round(unitPrice),
        unitCost: round(unitCost),
        revenue: round(revenue),
        cost: round(cost),
        grossProfit: round(grossProfit),
      },
      ...(state.sales || []),
    ],
  };
}

export function getLowStockItems(state) {
  const supplies = (state.supplies || [])
    .filter((item) => Number(item.stock || 0) <= Number(item.minStock || 0))
    .map((item) => ({ ...item, type: 'Insumo' }));
  const products = (state.products || [])
    .filter((item) => Number(item.stock || 0) <= Number(item.minStock || 0))
    .map((item) => ({ ...item, type: 'Producto' }));

  return [...supplies, ...products];
}

export function getUpcomingExpirations(state, today = toDateKey(new Date()), days = 45) {
  const start = new Date(`${today}T00:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + days);

  return [...(state.supplies || []), ...(state.products || [])]
    .filter((item) => item.expiresAt)
    .filter((item) => {
      const expiresAt = new Date(`${item.expiresAt}T00:00:00`);
      return expiresAt >= start && expiresAt <= end;
    })
    .sort((a, b) => a.expiresAt.localeCompare(b.expiresAt));
}

export function getMonthlyExpenseTotal(expenses, monthKey) {
  return round(
    (expenses || [])
      .filter((expense) => String(expense.date || '').startsWith(monthKey))
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
  );
}

export function calculateDashboardMetrics(state, today = toDateKey(new Date())) {
  const monthKey = today.slice(0, 7);
  const supplyInventoryValue = sumBy(state.supplies, (item) => item.stock * item.averageCost);
  const productInventoryValue = sumBy(state.products, (item) => item.stock * item.unitCost);
  const monthlyExpenses = getMonthlyExpenseTotal(state.expenses || [], monthKey);
  const monthlySales = (state.sales || []).filter((sale) =>
    String(sale.date || '').startsWith(monthKey),
  );
  const monthlyRevenue = sumBy(monthlySales, (sale) => sale.revenue);
  const monthlyGrossProfit = sumBy(monthlySales, (sale) => sale.grossProfit);
  const averageMarginPercent =
    monthlyRevenue === 0 ? 0 : round((monthlyGrossProfit / monthlyRevenue) * 100);
  const marginLeaders = [...(state.products || [])]
    .map((product) => ({
      ...product,
      margin: round(Number(product.price || 0) - Number(product.unitCost || 0)),
      marginPercent:
        Number(product.price || 0) === 0
          ? 0
          : round(((Number(product.price) - Number(product.unitCost || 0)) / Number(product.price)) * 100),
    }))
    .sort((a, b) => b.margin - a.margin);
  const lowStockItems = getLowStockItems(state);
  const upcomingExpirations = getUpcomingExpirations(state, today);
  const weeklyRevenue = getWeeklyRevenue(monthlySales, today);
  const expensesByCategory = getExpensesByCategory(state.expenses || [], monthKey);
  const topProductsByRevenue = getTopProductsByRevenue(monthlySales, state.products || []);
  const growthActions = getGrowthActions({
    lowStockItems,
    marginLeaders,
    expensesByCategory,
    topProductsByRevenue,
    averageMarginPercent,
  });
  const businessHealthScore = getBusinessHealthScore({
    averageMarginPercent,
    netAfterExpenses: monthlyGrossProfit - monthlyExpenses,
    lowStockItems,
    monthlyRevenue,
  });

  return {
    supplyInventoryValue: round(supplyInventoryValue),
    productInventoryValue: round(productInventoryValue),
    totalInventoryValue: round(supplyInventoryValue + productInventoryValue),
    monthlyExpenses,
    monthlyRevenue,
    monthlyGrossProfit,
    averageMarginPercent,
    netAfterExpenses: round(monthlyGrossProfit - monthlyExpenses),
    businessHealthScore,
    weeklyRevenue,
    expensesByCategory,
    topProductsByRevenue,
    growthActions,
    lowStockItems,
    upcomingExpirations,
    marginLeaders,
  };
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function ensureFound(items, id, label) {
  if (!items.some((item) => item.id === id)) {
    throw new Error(`${label} no encontrado: ${id}`);
  }
}

function sumBy(items = [], selector) {
  return round(items.reduce((sum, item) => sum + Number(selector(item) || 0), 0));
}

function getWeeklyRevenue(sales, today) {
  const monthStart = new Date(`${today.slice(0, 7)}-01T00:00:00`);
  const weeks = Array.from({ length: 5 }, (_, index) => ({
    label: `Semana ${index + 1}`,
    revenue: 0,
  }));

  for (const sale of sales || []) {
    const saleDate = new Date(`${sale.date}T00:00:00`);
    const dayOffset = Math.floor((saleDate - monthStart) / 86400000);
    const weekIndex = Math.min(4, Math.max(0, Math.floor(dayOffset / 7)));
    weeks[weekIndex].revenue += Number(sale.revenue || 0);
  }

  return weeks.map((week) => ({ ...week, revenue: round(week.revenue) }));
}

function getExpensesByCategory(expenses, monthKey) {
  const totals = new Map();
  for (const expense of expenses || []) {
    if (!String(expense.date || '').startsWith(monthKey)) continue;
    const category = expense.category || 'Otros';
    totals.set(category, (totals.get(category) || 0) + Number(expense.amount || 0));
  }

  return [...totals.entries()]
    .map(([category, amount]) => ({ category, amount: round(amount) }))
    .sort((a, b) => b.amount - a.amount);
}

function getTopProductsByRevenue(sales, products) {
  const productNames = new Map((products || []).map((product) => [product.id, product.name]));
  const totals = new Map();

  for (const sale of sales || []) {
    const current = totals.get(sale.productId) || {
      productId: sale.productId,
      name: productNames.get(sale.productId) || sale.productId,
      quantity: 0,
      revenue: 0,
      grossProfit: 0,
    };
    current.quantity += Number(sale.quantity || 0);
    current.revenue += Number(sale.revenue || 0);
    current.grossProfit += Number(sale.grossProfit || 0);
    totals.set(sale.productId, current);
  }

  return [...totals.values()]
    .map((item) => ({
      ...item,
      quantity: round(item.quantity),
      revenue: round(item.revenue),
      grossProfit: round(item.grossProfit),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

function getGrowthActions({
  lowStockItems,
  marginLeaders,
  expensesByCategory,
  topProductsByRevenue,
  averageMarginPercent,
}) {
  const actions = [];
  const lowProduct = (lowStockItems || []).find((item) => item.type === 'Producto');
  const lowSupply = (lowStockItems || []).find((item) => item.type === 'Insumo');
  const weakMargin = [...(marginLeaders || [])]
    .reverse()
    .find((product) => Number(product.marginPercent || 0) < 55);
  const topProduct = (topProductsByRevenue || [])[0];
  const topExpense = (expensesByCategory || [])[0];

  if (topProduct) {
    actions.push({
      title: `Impulsa ${topProduct.name}`,
      detail: 'Es el producto con mas ventas este mes. Dale visibilidad en tus canales.',
      tone: 'growth',
    });
  }
  if (lowProduct) {
    actions.push({
      title: `Programa produccion de ${lowProduct.name}`,
      detail: `Esta por debajo del minimo: ${lowProduct.stock} ${lowProduct.unit || ''}.`,
      tone: 'warning',
    });
  }
  if (lowSupply) {
    actions.push({
      title: `Compra ${lowSupply.name}`,
      detail: 'Este insumo puede frenar tu proxima produccion.',
      tone: 'warning',
    });
  }
  if (weakMargin) {
    actions.push({
      title: `Revisa precio de ${weakMargin.name}`,
      detail: `Su margen estimado es ${weakMargin.marginPercent}%.`,
      tone: 'focus',
    });
  }
  if (topExpense) {
    actions.push({
      title: `Observa gasto en ${topExpense.category}`,
      detail: `Es tu mayor categoria del mes: ${formatCurrency(topExpense.amount)}.`,
      tone: 'focus',
    });
  }
  if (averageMarginPercent < 45) {
    actions.push({
      title: 'Sube el margen promedio',
      detail: 'Tu rentabilidad necesita una revision de precios o costos.',
      tone: 'focus',
    });
  }

  return actions.slice(0, 3);
}

function getBusinessHealthScore({ averageMarginPercent, netAfterExpenses, lowStockItems, monthlyRevenue }) {
  let score = 50;
  score += Math.min(25, averageMarginPercent * 0.35);
  score += monthlyRevenue > 0 ? 12 : -8;
  score += netAfterExpenses >= 0 ? 12 : -10;
  score -= Math.min(18, (lowStockItems || []).length * 4);

  return Math.max(0, Math.min(100, Math.round(score)));
}

function round(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}
