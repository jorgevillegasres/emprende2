import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

describe("operational resource routes", () => {
  it("lists and creates tenant-scoped products", async () => {
    const app = buildApp();

    const createResponse = await app.inject({
      method: "POST",
      url: "/v1/products",
      payload: { id: "body-butter", name: "Body butter", stock: 4, minStock: 2, unitCost: 9000, price: 22000, unit: "un" }
    });
    const listResponse = await app.inject({ method: "GET", url: "/v1/products" });
    const products = listResponse.json();

    expect(createResponse.statusCode).toBe(201);
    expect(listResponse.statusCode).toBe(200);
    expect(products.some((product: { id: string }) => product.id === "body-butter")).toBe(true);
  });

  it("lists and creates tenant-scoped supplies", async () => {
    const app = buildApp();

    const createResponse = await app.inject({
      method: "POST",
      url: "/v1/supplies",
      payload: { id: "cocoa-butter", name: "Manteca de cacao", stock: 8, minStock: 3, averageCost: 18000, unit: "kg" }
    });
    const listResponse = await app.inject({ method: "GET", url: "/v1/supplies" });
    const supplies = listResponse.json();

    expect(createResponse.statusCode).toBe(201);
    expect(listResponse.statusCode).toBe(200);
    expect(supplies.some((supply: { id: string }) => supply.id === "cocoa-butter")).toBe(true);
  });

  it("lists and creates tenant-scoped sales", async () => {
    const app = buildApp();

    const createResponse = await app.inject({
      method: "POST",
      url: "/v1/sales",
      payload: {
        date: "2026-06-10",
        productId: "shampoo-romero",
        quantity: 1,
        revenue: 16000,
        cost: 5200,
        grossProfit: 10800
      }
    });
    const listResponse = await app.inject({ method: "GET", url: "/v1/sales" });
    const sales = listResponse.json();

    expect(createResponse.statusCode).toBe(201);
    expect(listResponse.statusCode).toBe(200);
    expect(sales.some((sale: { productId: string; revenue: number }) => sale.productId === "shampoo-romero" && sale.revenue === 16000)).toBe(true);
  });

  it("lists and creates tenant-scoped expenses", async () => {
    const app = buildApp();

    const createResponse = await app.inject({
      method: "POST",
      url: "/v1/expenses",
      payload: { date: "2026-06-10", category: "Empaque", amount: 34000 }
    });
    const listResponse = await app.inject({ method: "GET", url: "/v1/expenses" });
    const expenses = listResponse.json();

    expect(createResponse.statusCode).toBe(201);
    expect(listResponse.statusCode).toBe(200);
    expect(expenses.some((expense: { category: string; amount: number }) => expense.category === "Empaque" && expense.amount === 34000)).toBe(true);
  });

  it("rejects invalid product payloads", async () => {
    const app = buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/v1/products",
      payload: { id: "bad", name: "", stock: -1, minStock: 0, unitCost: 0, price: 0 }
    });

    expect(response.statusCode).toBe(400);
  });

  it("isolates resources by request tenant header", async () => {
    const app = buildApp();

    await app.inject({
      method: "POST",
      url: "/v1/products",
      headers: { "x-emprendedos-tenant-id": "tenant-a", "x-emprendedos-user-id": "user-a" },
      payload: { id: "tenant-a-product", name: "Producto A", stock: 1, minStock: 1, unitCost: 1000, price: 2000, unit: "un" }
    });
    await app.inject({
      method: "POST",
      url: "/v1/products",
      headers: { "x-emprendedos-tenant-id": "tenant-b", "x-emprendedos-user-id": "user-b" },
      payload: { id: "tenant-b-product", name: "Producto B", stock: 1, minStock: 1, unitCost: 1000, price: 2000, unit: "un" }
    });

    const response = await app.inject({
      method: "GET",
      url: "/v1/products",
      headers: { "x-emprendedos-tenant-id": "tenant-a", "x-emprendedos-user-id": "user-a" }
    });
    const products = response.json();

    expect(response.statusCode).toBe(200);
    expect(products.map((product: { id: string }) => product.id)).toContain("tenant-a-product");
    expect(products.map((product: { id: string }) => product.id)).not.toContain("tenant-b-product");
  });
});
