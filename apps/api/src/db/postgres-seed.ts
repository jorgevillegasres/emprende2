import type { createPostgresClient } from "./client.js";
import { expenses, memberships, products, sales, supplies, tenants, users } from "./schema.js";
import { getConfig } from "../config.js";
import { hashPassword } from "../auth/passwords.js";

type Db = ReturnType<typeof createPostgresClient>["db"];

const demoTenantId = process.env.DEMO_TENANT_ID ?? "10000000-0000-0000-0000-000000000001";
const demoUserId = process.env.DEMO_OWNER_USER_ID ?? "00000000-0000-0000-0000-000000000001";

export async function seedPostgresDemoData(db: Db) {
  const config = getConfig();
  const demoPasswordHash = await hashPassword(config.demoAuthPassword);

  await db
    .insert(tenants)
    .values({
      id: demoTenantId,
      name: "Emprendedos Demo",
      slug: "emprendedos-demo",
      businessType: "Productos fisicos",
      country: "CO",
      currency: "COP"
    })
    .onConflictDoNothing();

  await db
    .insert(users)
    .values({
      id: demoUserId,
      email: config.demoAuthEmail,
      name: "Usuario Demo",
      passwordHash: demoPasswordHash
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: config.demoAuthEmail,
        name: "Usuario Demo",
        passwordHash: demoPasswordHash
      }
    });

  await db
    .insert(memberships)
    .values({
      id: "20000000-0000-0000-0000-000000000001",
      tenantId: demoTenantId,
      userId: demoUserId,
      role: "owner"
    })
    .onConflictDoNothing();

  await db
    .insert(supplies)
    .values([
      { tenantId: demoTenantId, id: "envase-vidrio", name: "Envase vidrio 10 ml", stock: 30, minStock: 40, averageCost: 1200, unit: "un" },
      { tenantId: demoTenantId, id: "etiqueta-kraft", name: "Etiqueta kraft", stock: 66, minStock: 80, averageCost: 300, unit: "un" }
    ])
    .onConflictDoNothing();

  await db
    .insert(products)
    .values([
      { tenantId: demoTenantId, id: "shampoo-romero", name: "Shampoo solido romero", stock: 12, minStock: 10, unitCost: 5200, price: 16000, unit: "un" },
      { tenantId: demoTenantId, id: "balsamo-calendula", name: "Balsamo calendula", stock: 6, minStock: 8, unitCost: 4300, price: 14000, unit: "un" }
    ])
    .onConflictDoNothing();

  await db
    .insert(sales)
    .values([
      {
        id: "30000000-0000-0000-0000-000000000001",
        tenantId: demoTenantId,
        date: "2026-06-09",
        productId: "shampoo-romero",
        quantity: 3,
        revenue: 48000,
        cost: 15600,
        grossProfit: 32400
      },
      {
        id: "30000000-0000-0000-0000-000000000002",
        tenantId: demoTenantId,
        date: "2026-06-09",
        productId: "balsamo-calendula",
        quantity: 2,
        revenue: 28000,
        cost: 8600,
        grossProfit: 19400
      }
    ])
    .onConflictDoNothing();

  await db
    .insert(expenses)
    .values([
      { id: "40000000-0000-0000-0000-000000000001", tenantId: demoTenantId, date: "2026-06-02", category: "Servicios", amount: 68000 },
      { id: "40000000-0000-0000-0000-000000000002", tenantId: demoTenantId, date: "2026-06-05", category: "Herramientas", amount: 78000 }
    ])
    .onConflictDoNothing();
}
