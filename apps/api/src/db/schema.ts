import { date, doublePrecision, index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  businessType: text("business_type").notNull(),
  country: text("country").notNull(),
  currency: text("currency").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
    userId: uuid("user_id").notNull().references(() => users.id),
    role: text("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    membershipTenantUserUnique: uniqueIndex("memberships_tenant_user_unique").on(table.tenantId, table.userId)
  })
);

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
    name: text("name").notNull(),
    category: text("category").notNull().default("General"),
    unit: text("unit").notNull().default("un"),
    stock: doublePrecision("stock").notNull().default(0),
    minStock: doublePrecision("min_stock").notNull().default(0),
    unitCost: doublePrecision("unit_cost").notNull().default(0),
    price: doublePrecision("price").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    productsTenantIdIdx: index("products_tenant_id_idx").on(table.tenantId)
  })
);

export const supplies = pgTable(
  "supplies",
  {
    id: text("id").primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
    name: text("name").notNull(),
    category: text("category").notNull().default("General"),
    unit: text("unit").notNull().default("un"),
    stock: doublePrecision("stock").notNull().default(0),
    minStock: doublePrecision("min_stock").notNull().default(0),
    averageCost: doublePrecision("average_cost").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    suppliesTenantIdIdx: index("supplies_tenant_id_idx").on(table.tenantId)
  })
);

export const sales = pgTable(
  "sales",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
    productId: text("product_id").notNull(),
    date: date("date", { mode: "string" }).notNull(),
    quantity: doublePrecision("quantity").notNull(),
    unitPrice: doublePrecision("unit_price").notNull().default(0),
    unitCost: doublePrecision("unit_cost").notNull().default(0),
    revenue: doublePrecision("revenue").notNull(),
    cost: doublePrecision("cost").notNull(),
    grossProfit: doublePrecision("gross_profit").notNull(),
    channel: text("channel").notNull().default("Directo"),
    note: text("note").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    salesTenantDateIdx: index("sales_tenant_date_idx").on(table.tenantId, table.date)
  })
);

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
    date: date("date", { mode: "string" }).notNull(),
    category: text("category").notNull(),
    description: text("description").notNull().default(""),
    amount: doublePrecision("amount").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    expensesTenantDateIdx: index("expenses_tenant_date_idx").on(table.tenantId, table.date)
  })
);

export const inventoryMovements = pgTable(
  "inventory_movements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
    itemType: text("item_type").notNull(),
    itemId: text("item_id").notNull(),
    movementType: text("movement_type").notNull(),
    quantity: doublePrecision("quantity").notNull(),
    stockBefore: doublePrecision("stock_before").notNull(),
    stockAfter: doublePrecision("stock_after").notNull(),
    referenceType: text("reference_type").notNull(),
    referenceId: text("reference_id").notNull(),
    note: text("note").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    inventoryMovementsTenantItemIdx: index("inventory_movements_tenant_item_idx").on(table.tenantId, table.itemType, table.itemId),
    inventoryMovementsTenantCreatedIdx: index("inventory_movements_tenant_created_idx").on(table.tenantId, table.createdAt)
  })
);

export const recipes = pgTable(
  "recipes",
  {
    id: text("id").primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
    productId: text("product_id").notNull(),
    name: text("name").notNull(),
    outputQuantity: doublePrecision("output_quantity").notNull(),
    note: text("note").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    recipesTenantIdIdx: index("recipes_tenant_id_idx").on(table.tenantId),
    recipesTenantProductIdx: index("recipes_tenant_product_idx").on(table.tenantId, table.productId)
  })
);

export const recipeIngredients = pgTable(
  "recipe_ingredients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
    recipeId: text("recipe_id").notNull().references(() => recipes.id),
    supplyId: text("supply_id").notNull(),
    quantity: doublePrecision("quantity").notNull()
  },
  (table) => ({
    recipeIngredientsRecipeIdx: index("recipe_ingredients_recipe_idx").on(table.tenantId, table.recipeId)
  })
);

export const productionOrders = pgTable(
  "production_orders",
  {
    id: uuid("id").primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
    productId: text("product_id").notNull(),
    quantity: doublePrecision("quantity").notNull(),
    totalCost: doublePrecision("total_cost").notNull(),
    unitCost: doublePrecision("unit_cost").notNull(),
    recipeId: text("recipe_id"),
    note: text("note").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    productionOrdersTenantCreatedIdx: index("production_orders_tenant_created_idx").on(table.tenantId, table.createdAt),
    productionOrdersTenantProductIdx: index("production_orders_tenant_product_idx").on(table.tenantId, table.productId)
  })
);

export const decisions = pgTable(
  "decisions",
  {
    id: uuid("id").primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
    title: text("title").notNull(),
    detail: text("detail").notNull(),
    source: text("source").notNull(),
    priority: text("priority").notNull().default("medium"),
    status: text("status").notNull().default("open"),
    owner: text("owner").notNull().default(""),
    dueDate: date("due_date", { mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    decisionsTenantStatusIdx: index("decisions_tenant_status_idx").on(table.tenantId, table.status),
    decisionsTenantCreatedIdx: index("decisions_tenant_created_idx").on(table.tenantId, table.createdAt)
  })
);

export const schema = {
  tenants,
  users,
  memberships,
  products,
  supplies,
  sales,
  expenses,
  inventoryMovements,
  recipes,
  recipeIngredients,
  productionOrders,
  decisions
};

export const databaseSchemaVersion = "2026-06-11-decision-tracking";
