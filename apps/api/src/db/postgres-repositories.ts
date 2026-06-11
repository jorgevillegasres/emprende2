import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import type { createPostgresClient } from "./client.js";
import type { AuthIdentityRecord, ExpenseRecord, InventoryMovementRecord, ProductRecord, Repositories, SaleRecord, SupplyRecord } from "./repositories.js";
import { expenses, inventoryMovements, memberships, products, sales, supplies, tenants, users } from "./schema.js";

type Db = ReturnType<typeof createPostgresClient>["db"];

export function createPostgresRepositories(db: Db): Repositories {
  return {
    auth: {
      async insert(record: AuthIdentityRecord) {
        await db
          .insert(users)
          .values({
            id: record.userId,
            email: record.email,
            name: record.email,
            passwordHash: record.passwordHash
          })
          .onConflictDoNothing();

        await db
          .insert(memberships)
          .values({
            id: randomUUID(),
            tenantId: record.tenantId,
            userId: record.userId,
            role: record.role
          })
          .onConflictDoNothing();

        return record;
      },
      async findByEmail(email: string) {
        const [identity] = await db
          .select({
            userId: users.id,
            email: users.email,
            passwordHash: users.passwordHash,
            tenantId: memberships.tenantId,
            role: memberships.role
          })
          .from(users)
          .innerJoin(memberships, eq(users.id, memberships.userId))
          .where(eq(users.email, email.toLowerCase()))
          .limit(1);

        if (!identity) return null;
        return {
          ...identity,
          role: toAuthRole(identity.role)
        };
      },
      async registerOwner(record: AuthIdentityRecord) {
        await db.insert(tenants).values({
          id: record.tenantId,
          name: record.tenantName ?? "Nuevo emprendimiento",
          slug: record.tenantSlug ?? record.tenantId,
          businessType: record.businessType ?? "Emprendimiento",
          country: record.country ?? "CO",
          currency: record.currency ?? "COP"
        });

        await db.insert(users).values({
          id: record.userId,
          email: record.email,
          name: record.userName ?? record.email,
          passwordHash: record.passwordHash
        });

        await db.insert(memberships).values({
          id: randomUUID(),
          tenantId: record.tenantId,
          userId: record.userId,
          role: record.role
        });

        return record;
      }
    },
    products: {
      async insert(record: ProductRecord) {
        const [created] = await db.insert(products).values(record).returning();
        return toProductRecord(created);
      },
      async listByTenant(tenantId: string) {
        const rows = await db.select().from(products).where(eq(products.tenantId, tenantId));
        return rows.map(toProductRecord);
      },
      async findByTenantAndId(tenantId: string, id: string) {
        const [row] = await db.select().from(products).where(and(eq(products.tenantId, tenantId), eq(products.id, id))).limit(1);
        return row ? toProductRecord(row) : null;
      },
      async updateStock(tenantId: string, id: string, stock: number) {
        const [updated] = await db
          .update(products)
          .set({ stock, updatedAt: new Date() })
          .where(and(eq(products.tenantId, tenantId), eq(products.id, id)))
          .returning();
        return updated ? toProductRecord(updated) : null;
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
    },
    inventoryMovements: {
      async insert(record: InventoryMovementRecord) {
        const values = { ...record, createdAt: undefined };
        const [created] = await db.insert(inventoryMovements).values(values).returning();
        return toInventoryMovementRecord(created);
      },
      async listByTenant(tenantId: string) {
        const rows = await db.select().from(inventoryMovements).where(eq(inventoryMovements.tenantId, tenantId)).orderBy(desc(inventoryMovements.createdAt));
        return rows.map(toInventoryMovementRecord);
      }
    }
  };
}

function toAuthRole(role: string): AuthIdentityRecord["role"] {
  if (role === "owner" || role === "admin" || role === "operator" || role === "viewer") return role;
  return "viewer";
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

function toInventoryMovementRecord(row: typeof inventoryMovements.$inferSelect): InventoryMovementRecord {
  return {
    tenantId: row.tenantId,
    id: row.id,
    itemType: toInventoryItemType(row.itemType),
    itemId: row.itemId,
    movementType: toInventoryMovementType(row.movementType),
    quantity: row.quantity,
    stockBefore: row.stockBefore,
    stockAfter: row.stockAfter,
    referenceType: row.referenceType,
    referenceId: row.referenceId,
    note: row.note,
    createdAt: row.createdAt.toISOString()
  };
}

function toInventoryItemType(value: string): InventoryMovementRecord["itemType"] {
  return value === "supply" ? "supply" : "product";
}

function toInventoryMovementType(value: string): InventoryMovementRecord["movementType"] {
  if (value === "production" || value === "adjustment" || value === "purchase") return value;
  return "sale";
}
