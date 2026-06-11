import { describe, expect, it } from "vitest";
import { databaseSchemaVersion, expenses, products, sales, supplies, users } from "../src/db/schema.js";

describe("drizzle schema", () => {
  it("exports operational tables and schema version", () => {
    expect(databaseSchemaVersion).toBe("2026-06-11-persistent-auth-identities");
    expect(users).toBeDefined();
    expect(products).toBeDefined();
    expect(supplies).toBeDefined();
    expect(sales).toBeDefined();
    expect(expenses).toBeDefined();
  });
});
