import { eq } from "drizzle-orm";
import type { createPostgresClient } from "./client.js";
import type { ExpenseRecord, ProductRecord, Repositories, SaleRecord, SupplyRecord } from "./repositories.js";
import { expenses, products, sales, supplies } from "./schema.js";

type Db = ReturnType<typeof createPostgresClient>["db"];

export function createPostgresRepositories(db: Db): Repositories {
  return {
    products: {
      async insert(record: ProductRecord) {
        const [created] = await db.insert(products).values(record).returning();
        return toProductRecord(created);
      },
      async listByTenant(tenantId: string) {
        const rows = await db.select().from(products).where(eq(products.tenantId, tenantId));
        return rows.map(toProductRecord);
      }
    },
    supplies: {
      async insert(record: SupplyRecord) {
        const [created] = await db.insert(supplies).values(record).returning();
        return toSupplyRecord(created);
      },
      async listByTenant(tenantId: string) {
        const rows = await db.select().from(supplies).where(eq(supplies.tenantId, tenantId));
        return rows.map(toSupplyRecord);
      }
    },
    sales: {
      async insert(record: SaleRecord) {
        const [created] = await db.insert(sales).values(record).returning();
        return toSaleRecord(created);
      },
      async listByTenant(tenantId: string) {
        const rows = await db.select().from(sales).where(eq(sales.tenantId, tenantId));
        return rows.map(toSaleRecord);
      }
    },
    expenses: {
      async insert(record: ExpenseRecord) {
        const [created] = await db.insert(expenses).values(record).returning();
        return toExpenseRecord(created);
      },
      async listByTenant(tenantId: string) {
        const rows = await db.select().from(expenses).where(eq(expenses.tenantId, tenantId));
        return rows.map(toExpenseRecord);
      }
    }
  };
}

function toProductRecord(row: typeof products.$inferSelect): ProductRecord {
  return {
    tenantId: row.tenantId,
    id: row.id,
    name: row.name,
    stock: row.stock,
    minStock: row.minStock,
    unitCost: row.unitCost,
    price: row.price,
    unit: row.unit
  };
}

function toSupplyRecord(row: typeof supplies.$inferSelect): SupplyRecord {
  return {
    tenantId: row.tenantId,
    id: row.id,
    name: row.name,
    stock: row.stock,
    minStock: row.minStock,
    averageCost: row.averageCost,
    unit: row.unit
  };
}

function toSaleRecord(row: typeof sales.$inferSelect): SaleRecord {
  return {
    tenantId: row.tenantId,
    date: row.date,
    productId: row.productId,
    quantity: row.quantity,
    revenue: row.revenue,
    cost: row.cost,
    grossProfit: row.grossProfit
  };
}

function toExpenseRecord(row: typeof expenses.$inferSelect): ExpenseRecord {
  return {
    tenantId: row.tenantId,
    date: row.date,
    category: row.category,
    amount: row.amount
  };
}
