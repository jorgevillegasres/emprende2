// Datos demo compartidos por el seed en memoria y el de PostgreSQL.
// Un emprendimiento de cosmetica artesanal con un mes de operacion realista:
// ventas repartidas en las 4 semanas, varias categorias de gasto, alertas de
// stock, recetas y produccion. Cifras consistentes (revenue = price*qty, etc.).

export const DEMO_TENANT_ID = process.env.DEMO_TENANT_ID ?? "10000000-0000-0000-0000-000000000001";
export const DEMO_USER_ID = process.env.DEMO_OWNER_USER_ID ?? "00000000-0000-0000-0000-000000000001";
export const DEMO_MEMBERSHIP_ID = "20000000-0000-0000-0000-000000000001";

export const demoTenant = {
  id: DEMO_TENANT_ID,
  name: "Aromas Aurora",
  slug: "aromas-aurora",
  businessType: "Cosmetica artesanal",
  country: "CO",
  currency: "COP"
};

export const demoUserName = "Aurora (demo)";

type SupplySeed = { id: string; name: string; stock: number; minStock: number; averageCost: number; unit: string };
type ProductSeed = { id: string; name: string; stock: number; minStock: number; unitCost: number; price: number; unit: string };
type RecipeSeed = { id: string; productId: string; name: string; outputQuantity: number; note: string; ingredients: Array<{ id: string; supplyId: string; quantity: number }> };
type SaleSeed = { id: string; date: string; productId: string; quantity: number; revenue: number; cost: number; grossProfit: number };
type ExpenseSeed = { id: string; date: string; category: string; amount: number };
type ProductionSeed = { id: string; productId: string; quantity: number; totalCost: number; unitCost: number; recipeId: string; note: string; createdAt: string };
type MovementSeed = {
  id: string;
  itemType: "product" | "supply";
  itemId: string;
  movementType: "sale" | "production" | "adjustment" | "purchase";
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  referenceType: string;
  referenceId: string;
  note: string;
  createdAt: string;
};

export const demoSupplies: SupplySeed[] = [
  { id: "envase-vidrio", name: "Envase vidrio 10 ml", stock: 30, minStock: 40, averageCost: 1200, unit: "un" },
  { id: "etiqueta-kraft", name: "Etiqueta kraft", stock: 66, minStock: 80, averageCost: 300, unit: "un" },
  { id: "aceite-coco", name: "Aceite coco", stock: 18, minStock: 12, averageCost: 22000, unit: "kg" },
  { id: "manteca-karite", name: "Manteca karite", stock: 8, minStock: 10, averageCost: 36000, unit: "kg" },
  { id: "esencia-lavanda", name: "Esencia de lavanda", stock: 25, minStock: 15, averageCost: 15000, unit: "ml" }
];

export const demoProducts: ProductSeed[] = [
  { id: "jabon-lavanda", name: "Jabon lavanda", stock: 20, minStock: 18, unitCost: 3600, price: 12000, unit: "un" },
  { id: "shampoo-romero", name: "Shampoo solido romero", stock: 14, minStock: 10, unitCost: 5200, price: 16000, unit: "un" },
  { id: "balsamo-calendula", name: "Balsamo calendula", stock: 6, minStock: 8, unitCost: 4300, price: 14000, unit: "un" },
  { id: "vela-lavanda", name: "Vela aromatica lavanda", stock: 16, minStock: 8, unitCost: 6000, price: 18000, unit: "un" },
  { id: "crema-karite", name: "Crema corporal karite", stock: 12, minStock: 6, unitCost: 8000, price: 22000, unit: "un" }
];

export const demoRecipes: RecipeSeed[] = [
  {
    id: "shampoo-romero-base",
    productId: "shampoo-romero",
    name: "Formula base shampoo romero",
    outputQuantity: 10,
    note: "Receta demo para validar produccion repetible",
    ingredients: [
      { id: "50000000-0000-0000-0000-000000000001", supplyId: "envase-vidrio", quantity: 10 },
      { id: "50000000-0000-0000-0000-000000000002", supplyId: "etiqueta-kraft", quantity: 10 }
    ]
  },
  {
    id: "vela-lavanda-base",
    productId: "vela-lavanda",
    name: "Formula vela aromatica lavanda",
    outputQuantity: 12,
    note: "Vela de soya con esencia de lavanda",
    ingredients: [
      { id: "50000000-0000-0000-0000-000000000003", supplyId: "envase-vidrio", quantity: 12 },
      { id: "50000000-0000-0000-0000-000000000004", supplyId: "esencia-lavanda", quantity: 3 }
    ]
  }
];

// Ventas del mes anterior (mayo, ~468.000) para alimentar la comparacion mensual.
// Junio crece ~32% frente a mayo y pasa de perdida a utilidad.
const demoSalesPreviousMonth: SaleSeed[] = [
  { id: "31000000-0000-0000-0000-000000000001", date: "2026-05-03", productId: "jabon-lavanda", quantity: 4, revenue: 48000, cost: 14400, grossProfit: 33600 },
  { id: "31000000-0000-0000-0000-000000000002", date: "2026-05-05", productId: "crema-karite", quantity: 2, revenue: 44000, cost: 16000, grossProfit: 28000 },
  { id: "31000000-0000-0000-0000-000000000003", date: "2026-05-08", productId: "shampoo-romero", quantity: 3, revenue: 48000, cost: 15600, grossProfit: 32400 },
  { id: "31000000-0000-0000-0000-000000000004", date: "2026-05-12", productId: "vela-lavanda", quantity: 2, revenue: 36000, cost: 12000, grossProfit: 24000 },
  { id: "31000000-0000-0000-0000-000000000005", date: "2026-05-15", productId: "vela-lavanda", quantity: 3, revenue: 54000, cost: 18000, grossProfit: 36000 },
  { id: "31000000-0000-0000-0000-000000000006", date: "2026-05-17", productId: "crema-karite", quantity: 2, revenue: 44000, cost: 16000, grossProfit: 28000 },
  { id: "31000000-0000-0000-0000-000000000007", date: "2026-05-21", productId: "balsamo-calendula", quantity: 3, revenue: 42000, cost: 12900, grossProfit: 29100 },
  { id: "31000000-0000-0000-0000-000000000008", date: "2026-05-25", productId: "jabon-lavanda", quantity: 5, revenue: 60000, cost: 18000, grossProfit: 42000 },
  { id: "31000000-0000-0000-0000-000000000009", date: "2026-05-28", productId: "shampoo-romero", quantity: 4, revenue: 64000, cost: 20800, grossProfit: 43200 },
  { id: "31000000-0000-0000-0000-000000000010", date: "2026-05-30", productId: "balsamo-calendula", quantity: 2, revenue: 28000, cost: 8600, grossProfit: 19400 }
];

// Ventas repartidas en las 4 semanas de junio (revenue total ~616.000).
const demoSalesCurrentMonth: SaleSeed[] = [
  { id: "30000000-0000-0000-0000-000000000001", date: "2026-06-02", productId: "jabon-lavanda", quantity: 3, revenue: 36000, cost: 10800, grossProfit: 25200 },
  { id: "30000000-0000-0000-0000-000000000002", date: "2026-06-04", productId: "vela-lavanda", quantity: 2, revenue: 36000, cost: 12000, grossProfit: 24000 },
  { id: "30000000-0000-0000-0000-000000000003", date: "2026-06-06", productId: "shampoo-romero", quantity: 2, revenue: 32000, cost: 10400, grossProfit: 21600 },
  { id: "30000000-0000-0000-0000-000000000004", date: "2026-06-09", productId: "shampoo-romero", quantity: 3, revenue: 48000, cost: 15600, grossProfit: 32400 },
  { id: "30000000-0000-0000-0000-000000000005", date: "2026-06-09", productId: "balsamo-calendula", quantity: 2, revenue: 28000, cost: 8600, grossProfit: 19400 },
  { id: "30000000-0000-0000-0000-000000000006", date: "2026-06-10", productId: "jabon-lavanda", quantity: 4, revenue: 48000, cost: 14400, grossProfit: 33600 },
  { id: "30000000-0000-0000-0000-000000000007", date: "2026-06-12", productId: "crema-karite", quantity: 2, revenue: 44000, cost: 16000, grossProfit: 28000 },
  { id: "30000000-0000-0000-0000-000000000008", date: "2026-06-16", productId: "vela-lavanda", quantity: 3, revenue: 54000, cost: 18000, grossProfit: 36000 },
  { id: "30000000-0000-0000-0000-000000000009", date: "2026-06-18", productId: "jabon-lavanda", quantity: 5, revenue: 60000, cost: 18000, grossProfit: 42000 },
  { id: "30000000-0000-0000-0000-000000000010", date: "2026-06-19", productId: "balsamo-calendula", quantity: 2, revenue: 28000, cost: 8600, grossProfit: 19400 },
  { id: "30000000-0000-0000-0000-000000000011", date: "2026-06-23", productId: "crema-karite", quantity: 3, revenue: 66000, cost: 24000, grossProfit: 42000 },
  { id: "30000000-0000-0000-0000-000000000012", date: "2026-06-24", productId: "shampoo-romero", quantity: 4, revenue: 64000, cost: 20800, grossProfit: 43200 },
  { id: "30000000-0000-0000-0000-000000000013", date: "2026-06-26", productId: "jabon-lavanda", quantity: 3, revenue: 36000, cost: 10800, grossProfit: 25200 },
  { id: "30000000-0000-0000-0000-000000000014", date: "2026-06-27", productId: "vela-lavanda", quantity: 2, revenue: 36000, cost: 12000, grossProfit: 24000 }
];

// Historico completo de ventas (mayo + junio) consumido por el seed.
export const demoSales: SaleSeed[] = [...demoSalesPreviousMonth, ...demoSalesCurrentMonth];

// Gastos de mayo (~348.000) para la comparacion mensual.
const demoExpensesPreviousMonth: ExpenseSeed[] = [
  { id: "41000000-0000-0000-0000-000000000001", date: "2026-05-02", category: "Servicios", amount: 65000 },
  { id: "41000000-0000-0000-0000-000000000002", date: "2026-05-06", category: "Herramientas", amount: 40000 },
  { id: "41000000-0000-0000-0000-000000000003", date: "2026-05-14", category: "Arriendo", amount: 120000 },
  { id: "41000000-0000-0000-0000-000000000004", date: "2026-05-19", category: "Marketing", amount: 38000 },
  { id: "41000000-0000-0000-0000-000000000005", date: "2026-05-24", category: "Insumos", amount: 85000 }
];

// Gastos del mes en varias categorias (total ~401.000).
const demoExpensesCurrentMonth: ExpenseSeed[] = [
  { id: "40000000-0000-0000-0000-000000000001", date: "2026-06-02", category: "Servicios", amount: 68000 },
  { id: "40000000-0000-0000-0000-000000000002", date: "2026-06-05", category: "Herramientas", amount: 78000 },
  { id: "40000000-0000-0000-0000-000000000003", date: "2026-06-10", category: "Marketing", amount: 45000 },
  { id: "40000000-0000-0000-0000-000000000004", date: "2026-06-15", category: "Arriendo", amount: 120000 },
  { id: "40000000-0000-0000-0000-000000000005", date: "2026-06-20", category: "Insumos", amount: 90000 }
];

// Historico completo de gastos (mayo + junio) consumido por el seed.
export const demoExpenses: ExpenseSeed[] = [...demoExpensesPreviousMonth, ...demoExpensesCurrentMonth];

export const demoProductionOrders: ProductionSeed[] = [
  {
    id: "60000000-0000-0000-0000-000000000001",
    productId: "shampoo-romero",
    quantity: 10,
    totalCost: 15000,
    unitCost: 1500,
    recipeId: "shampoo-romero-base",
    note: "Lote demo producido desde receta",
    createdAt: "2026-06-08T09:00:00.000Z"
  }
];

export const demoInventoryMovements: MovementSeed[] = [
  {
    id: "70000000-0000-0000-0000-000000000001",
    itemType: "product",
    itemId: "shampoo-romero",
    movementType: "production",
    quantity: 10,
    stockBefore: 4,
    stockAfter: 14,
    referenceType: "production_order",
    referenceId: "60000000-0000-0000-0000-000000000001",
    note: "Entrada de lote demo",
    createdAt: "2026-06-08T09:00:00.000Z"
  },
  {
    id: "70000000-0000-0000-0000-000000000002",
    itemType: "supply",
    itemId: "envase-vidrio",
    movementType: "production",
    quantity: -10,
    stockBefore: 40,
    stockAfter: 30,
    referenceType: "production_order",
    referenceId: "60000000-0000-0000-0000-000000000001",
    note: "Consumo de lote demo",
    createdAt: "2026-06-08T09:00:00.000Z"
  },
  {
    id: "70000000-0000-0000-0000-000000000003",
    itemType: "supply",
    itemId: "etiqueta-kraft",
    movementType: "production",
    quantity: -10,
    stockBefore: 76,
    stockAfter: 66,
    referenceType: "production_order",
    referenceId: "60000000-0000-0000-0000-000000000001",
    note: "Consumo de lote demo",
    createdAt: "2026-06-08T09:00:00.000Z"
  }
];
