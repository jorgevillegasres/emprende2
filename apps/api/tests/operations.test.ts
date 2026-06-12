import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

describe("operational resource routes", () => {
  it("creates, lists, and completes tenant-scoped decisions", async () => {
    const app = buildApp();
    const headers = { "x-emprendedos-tenant-id": "decision-tenant", "x-emprendedos-user-id": "decision-user" };

    const createResponse = await app.inject({
      method: "POST",
      url: "/v1/decisions",
      headers,
      payload: {
        title: "Subir precio de shampoo",
        detail: "Necesita subir $ 2.500 para llegar al margen objetivo.",
        source: "pricing",
        priority: "high",
        dueDate: "2026-06-20"
      }
    });
    const created = createResponse.json();
    const listResponse = await app.inject({ method: "GET", url: "/v1/decisions", headers });
    const completeResponse = await app.inject({
      method: "PATCH",
      url: `/v1/decisions/${created.id}`,
      headers,
      payload: { status: "done" }
    });

    expect(createResponse.statusCode).toBe(201);
    expect(created).toMatchObject({
      id: expect.any(String),
      title: "Subir precio de shampoo",
      status: "open",
      priority: "high",
      dueDate: "2026-06-20"
    });
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json()).toEqual([expect.objectContaining({ id: created.id, tenantId: "decision-tenant" })]);
    expect(completeResponse.statusCode).toBe(200);
    expect(completeResponse.json()).toMatchObject({ id: created.id, status: "done" });
  });

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

  it("decrements product stock when a sale is created", async () => {
    const app = buildApp();
    const headers = { "x-emprendedos-tenant-id": "stock-tenant", "x-emprendedos-user-id": "stock-user" };

    await app.inject({
      method: "POST",
      url: "/v1/products",
      headers,
      payload: { id: "stock-soap", name: "Jabon stock", stock: 8, minStock: 2, unitCost: 5000, price: 12000, unit: "un" }
    });

    const saleResponse = await app.inject({
      method: "POST",
      url: "/v1/sales",
      headers,
      payload: {
        date: "2026-06-10",
        productId: "stock-soap",
        quantity: 3,
        revenue: 36000,
        cost: 15000,
        grossProfit: 21000
      }
    });
    const productsResponse = await app.inject({ method: "GET", url: "/v1/products", headers });
    const products = productsResponse.json();

    expect(saleResponse.statusCode).toBe(201);
    expect(products.find((product: { id: string }) => product.id === "stock-soap")?.stock).toBe(5);
  });

  it("records an inventory movement when a sale decreases stock", async () => {
    const app = buildApp();
    const headers = { "x-emprendedos-tenant-id": "movement-tenant", "x-emprendedos-user-id": "movement-user" };

    await app.inject({
      method: "POST",
      url: "/v1/products",
      headers,
      payload: { id: "movement-soap", name: "Jabon movimiento", stock: 8, minStock: 2, unitCost: 5000, price: 12000, unit: "un" }
    });

    const saleResponse = await app.inject({
      method: "POST",
      url: "/v1/sales",
      headers,
      payload: {
        date: "2026-06-10",
        productId: "movement-soap",
        quantity: 3,
        revenue: 36000,
        cost: 15000,
        grossProfit: 21000
      }
    });
    const movementsResponse = await app.inject({ method: "GET", url: "/v1/inventory-movements", headers });
    const movements = movementsResponse.json();

    expect(saleResponse.statusCode).toBe(201);
    expect(movementsResponse.statusCode).toBe(200);
    expect(movements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          itemType: "product",
          itemId: "movement-soap",
          movementType: "sale",
          quantity: -3,
          stockBefore: 8,
          stockAfter: 5,
          referenceType: "sale"
        })
      ])
    );
  });

  it("rejects sales that exceed available product stock", async () => {
    const app = buildApp();
    const headers = { "x-emprendedos-tenant-id": "limited-stock-tenant", "x-emprendedos-user-id": "limited-stock-user" };

    await app.inject({
      method: "POST",
      url: "/v1/products",
      headers,
      payload: { id: "limited-soap", name: "Jabon limitado", stock: 2, minStock: 1, unitCost: 5000, price: 12000, unit: "un" }
    });

    const saleResponse = await app.inject({
      method: "POST",
      url: "/v1/sales",
      headers,
      payload: {
        date: "2026-06-10",
        productId: "limited-soap",
        quantity: 3,
        revenue: 36000,
        cost: 15000,
        grossProfit: 21000
      }
    });
    const productsResponse = await app.inject({ method: "GET", url: "/v1/products", headers });
    const products = productsResponse.json();

    expect(saleResponse.statusCode).toBe(409);
    expect(products.find((product: { id: string }) => product.id === "limited-soap")?.stock).toBe(2);
  });

  it("adjusts product stock manually and records an inventory movement", async () => {
    const app = buildApp();
    const headers = { "x-emprendedos-tenant-id": "adjustment-tenant", "x-emprendedos-user-id": "adjustment-user" };

    await app.inject({
      method: "POST",
      url: "/v1/products",
      headers,
      payload: { id: "adjusted-soap", name: "Jabon ajustado", stock: 10, minStock: 2, unitCost: 5000, price: 12000, unit: "un" }
    });

    const adjustmentResponse = await app.inject({
      method: "POST",
      url: "/v1/inventory-adjustments",
      headers,
      payload: {
        itemType: "product",
        itemId: "adjusted-soap",
        stockAfter: 7,
        note: "Conteo fisico"
      }
    });
    const productsResponse = await app.inject({ method: "GET", url: "/v1/products", headers });
    const movementsResponse = await app.inject({ method: "GET", url: "/v1/inventory-movements", headers });
    const products = productsResponse.json();
    const movements = movementsResponse.json();

    expect(adjustmentResponse.statusCode).toBe(201);
    expect(products.find((product: { id: string }) => product.id === "adjusted-soap")?.stock).toBe(7);
    expect(movements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          itemType: "product",
          itemId: "adjusted-soap",
          movementType: "adjustment",
          quantity: -3,
          stockBefore: 10,
          stockAfter: 7,
          referenceType: "manual-adjustment",
          note: "Conteo fisico"
        })
      ])
    );
  });

  it("records a product inventory purchase as a positive movement", async () => {
    const app = buildApp();
    const headers = { "x-emprendedos-tenant-id": "purchase-product-tenant", "x-emprendedos-user-id": "purchase-product-user" };

    await app.inject({
      method: "POST",
      url: "/v1/products",
      headers,
      payload: { id: "purchased-soap", name: "Jabon comprado", stock: 4, minStock: 2, unitCost: 5000, price: 12000, unit: "un" }
    });

    const purchaseResponse = await app.inject({
      method: "POST",
      url: "/v1/inventory-purchases",
      headers,
      payload: {
        itemType: "product",
        itemId: "purchased-soap",
        quantity: 6,
        unitCost: 5200,
        note: "Reposicion inicial"
      }
    });
    const productsResponse = await app.inject({ method: "GET", url: "/v1/products", headers });
    const movementsResponse = await app.inject({ method: "GET", url: "/v1/inventory-movements", headers });
    const products = productsResponse.json();
    const movements = movementsResponse.json();

    expect(purchaseResponse.statusCode).toBe(201);
    expect(products.find((product: { id: string }) => product.id === "purchased-soap")?.stock).toBe(10);
    expect(movements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          itemType: "product",
          itemId: "purchased-soap",
          movementType: "purchase",
          quantity: 6,
          stockBefore: 4,
          stockAfter: 10,
          referenceType: "inventory-purchase",
          note: "Reposicion inicial"
        })
      ])
    );
  });

  it("records a supply inventory purchase and recalculates average cost", async () => {
    const app = buildApp();
    const headers = { "x-emprendedos-tenant-id": "purchase-supply-tenant", "x-emprendedos-user-id": "purchase-supply-user" };

    await app.inject({
      method: "POST",
      url: "/v1/supplies",
      headers,
      payload: { id: "purchased-oil", name: "Aceite comprado", stock: 4, minStock: 2, averageCost: 1000, unit: "ml" }
    });

    const purchaseResponse = await app.inject({
      method: "POST",
      url: "/v1/inventory-purchases",
      headers,
      payload: {
        itemType: "supply",
        itemId: "purchased-oil",
        quantity: 6,
        unitCost: 1500,
        note: "Compra de insumo"
      }
    });
    const suppliesResponse = await app.inject({ method: "GET", url: "/v1/supplies", headers });
    const movementsResponse = await app.inject({ method: "GET", url: "/v1/inventory-movements", headers });
    const supplies = suppliesResponse.json();
    const movements = movementsResponse.json();

    expect(purchaseResponse.statusCode).toBe(201);
    expect(supplies.find((supply: { id: string }) => supply.id === "purchased-oil")?.stock).toBe(10);
    expect(supplies.find((supply: { id: string }) => supply.id === "purchased-oil")?.averageCost).toBe(1300);
    expect(movements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          itemType: "supply",
          itemId: "purchased-oil",
          movementType: "purchase",
          quantity: 6,
          stockBefore: 4,
          stockAfter: 10,
          referenceType: "inventory-purchase"
        })
      ])
    );
  });

  it("creates a production order that consumes supplies and increases finished product stock", async () => {
    const app = buildApp();
    const headers = { "x-emprendedos-tenant-id": "production-tenant", "x-emprendedos-user-id": "production-user" };

    await app.inject({
      method: "POST",
      url: "/v1/products",
      headers,
      payload: { id: "finished-soap", name: "Jabon terminado", stock: 2, minStock: 1, unitCost: 5000, price: 12000, unit: "un" }
    });
    await app.inject({
      method: "POST",
      url: "/v1/supplies",
      headers,
      payload: { id: "olive-oil", name: "Aceite de oliva", stock: 100, minStock: 20, averageCost: 100, unit: "ml" }
    });
    await app.inject({
      method: "POST",
      url: "/v1/supplies",
      headers,
      payload: { id: "lye", name: "Soda caustica", stock: 20, minStock: 5, averageCost: 1000, unit: "g" }
    });

    const productionResponse = await app.inject({
      method: "POST",
      url: "/v1/production-orders",
      headers,
      payload: {
        productId: "finished-soap",
        quantity: 3,
        supplies: [
          { supplyId: "olive-oil", quantity: 30 },
          { supplyId: "lye", quantity: 6 }
        ],
        note: "Lote piloto"
      }
    });
    const order = productionResponse.json();
    const productsResponse = await app.inject({ method: "GET", url: "/v1/products", headers });
    const suppliesResponse = await app.inject({ method: "GET", url: "/v1/supplies", headers });
    const movementsResponse = await app.inject({ method: "GET", url: "/v1/inventory-movements", headers });
    const products = productsResponse.json();
    const supplies = suppliesResponse.json();
    const movements = movementsResponse.json();

    expect(productionResponse.statusCode).toBe(201);
    expect(order.totalCost).toBe(9000);
    expect(order.unitCost).toBe(3000);
    expect(products.find((product: { id: string }) => product.id === "finished-soap")?.stock).toBe(5);
    expect(products.find((product: { id: string }) => product.id === "finished-soap")?.unitCost).toBe(3800);
    expect(supplies.find((supply: { id: string }) => supply.id === "olive-oil")?.stock).toBe(70);
    expect(supplies.find((supply: { id: string }) => supply.id === "lye")?.stock).toBe(14);
    expect(movements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          itemType: "product",
          itemId: "finished-soap",
          movementType: "production",
          quantity: 3,
          stockBefore: 2,
          stockAfter: 5,
          referenceType: "production-order",
          referenceId: order.id,
          note: "Lote piloto"
        }),
        expect.objectContaining({
          itemType: "supply",
          itemId: "olive-oil",
          movementType: "production",
          quantity: -30,
          stockBefore: 100,
          stockAfter: 70,
          referenceType: "production-order",
          referenceId: order.id
        }),
        expect.objectContaining({
          itemType: "supply",
          itemId: "lye",
          movementType: "production",
          quantity: -6,
          stockBefore: 20,
          stockAfter: 14,
          referenceType: "production-order",
          referenceId: order.id
        })
      ])
    );
  });

  it("lists production order history after manual production", async () => {
    const app = buildApp();
    const headers = { "x-emprendedos-tenant-id": "production-history-tenant", "x-emprendedos-user-id": "production-history-user" };

    await app.inject({
      method: "POST",
      url: "/v1/products",
      headers,
      payload: { id: "history-soap", name: "Jabon historial", stock: 1, minStock: 1, unitCost: 1000, price: 12000, unit: "un" }
    });
    await app.inject({
      method: "POST",
      url: "/v1/supplies",
      headers,
      payload: { id: "history-oil", name: "Aceite historial", stock: 50, minStock: 10, averageCost: 200, unit: "ml" }
    });

    const productionResponse = await app.inject({
      method: "POST",
      url: "/v1/production-orders",
      headers,
      payload: {
        productId: "history-soap",
        quantity: 5,
        supplies: [{ supplyId: "history-oil", quantity: 10 }],
        note: "Lote manual"
      }
    });
    const order = productionResponse.json();
    const historyResponse = await app.inject({ method: "GET", url: "/v1/production-orders", headers });
    const history = historyResponse.json();

    expect(productionResponse.statusCode).toBe(201);
    expect(historyResponse.statusCode).toBe(200);
    expect(history).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: order.id,
          productId: "history-soap",
          quantity: 5,
          totalCost: 2000,
          unitCost: 400,
          recipeId: null,
          note: "Lote manual"
        })
      ])
    );
  });

  it("rejects production orders when a supply has insufficient stock", async () => {
    const app = buildApp();
    const headers = { "x-emprendedos-tenant-id": "production-limited-tenant", "x-emprendedos-user-id": "production-limited-user" };

    await app.inject({
      method: "POST",
      url: "/v1/products",
      headers,
      payload: { id: "limited-finished-soap", name: "Jabon limitado", stock: 2, minStock: 1, unitCost: 5000, price: 12000, unit: "un" }
    });
    await app.inject({
      method: "POST",
      url: "/v1/supplies",
      headers,
      payload: { id: "limited-oil", name: "Aceite limitado", stock: 10, minStock: 2, averageCost: 100, unit: "ml" }
    });

    const productionResponse = await app.inject({
      method: "POST",
      url: "/v1/production-orders",
      headers,
      payload: {
        productId: "limited-finished-soap",
        quantity: 2,
        supplies: [{ supplyId: "limited-oil", quantity: 30 }],
        note: "Lote sin inventario"
      }
    });
    const productsResponse = await app.inject({ method: "GET", url: "/v1/products", headers });
    const suppliesResponse = await app.inject({ method: "GET", url: "/v1/supplies", headers });
    const movementsResponse = await app.inject({ method: "GET", url: "/v1/inventory-movements", headers });
    const products = productsResponse.json();
    const supplies = suppliesResponse.json();
    const movements = movementsResponse.json();

    expect(productionResponse.statusCode).toBe(409);
    expect(products.find((product: { id: string }) => product.id === "limited-finished-soap")?.stock).toBe(2);
    expect(supplies.find((supply: { id: string }) => supply.id === "limited-oil")?.stock).toBe(10);
    expect(movements).toHaveLength(0);
  });

  it("creates and lists tenant-scoped recipes with ingredients", async () => {
    const app = buildApp();
    const headers = { "x-emprendedos-tenant-id": "recipe-tenant", "x-emprendedos-user-id": "recipe-user" };

    await app.inject({
      method: "POST",
      url: "/v1/products",
      headers,
      payload: { id: "recipe-soap", name: "Jabon receta", stock: 0, minStock: 2, unitCost: 0, price: 12000, unit: "un" }
    });
    await app.inject({
      method: "POST",
      url: "/v1/supplies",
      headers,
      payload: { id: "recipe-oil", name: "Aceite receta", stock: 100, minStock: 10, averageCost: 100, unit: "ml" }
    });
    await app.inject({
      method: "POST",
      url: "/v1/supplies",
      headers,
      payload: { id: "recipe-label", name: "Etiqueta receta", stock: 30, minStock: 10, averageCost: 300, unit: "un" }
    });

    const createResponse = await app.inject({
      method: "POST",
      url: "/v1/recipes",
      headers,
      payload: {
        id: "soap-formula",
        productId: "recipe-soap",
        name: "Formula jabon",
        outputQuantity: 10,
        ingredients: [
          { supplyId: "recipe-oil", quantity: 80 },
          { supplyId: "recipe-label", quantity: 10 }
        ],
        note: "Lote base"
      }
    });
    const listResponse = await app.inject({ method: "GET", url: "/v1/recipes", headers });
    const recipes = listResponse.json();

    expect(createResponse.statusCode).toBe(201);
    expect(listResponse.statusCode).toBe(200);
    expect(recipes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "soap-formula",
          productId: "recipe-soap",
          name: "Formula jabon",
          outputQuantity: 10,
          note: "Lote base",
          ingredients: [
            { supplyId: "recipe-oil", quantity: 80 },
            { supplyId: "recipe-label", quantity: 10 }
          ]
        })
      ])
    );
  });

  it("rejects recipes that reference a missing supply", async () => {
    const app = buildApp();
    const headers = { "x-emprendedos-tenant-id": "recipe-missing-tenant", "x-emprendedos-user-id": "recipe-missing-user" };

    await app.inject({
      method: "POST",
      url: "/v1/products",
      headers,
      payload: { id: "missing-recipe-soap", name: "Jabon sin insumo", stock: 0, minStock: 2, unitCost: 0, price: 12000, unit: "un" }
    });

    const createResponse = await app.inject({
      method: "POST",
      url: "/v1/recipes",
      headers,
      payload: {
        id: "missing-supply-formula",
        productId: "missing-recipe-soap",
        name: "Formula incompleta",
        outputQuantity: 10,
        ingredients: [{ supplyId: "missing-oil", quantity: 80 }],
        note: "Debe fallar"
      }
    });

    expect(createResponse.statusCode).toBe(404);
    expect(createResponse.json()).toEqual(expect.objectContaining({ error: "Supply not found", supplyId: "missing-oil" }));
  });

  it("creates a production order from a recipe with scaled ingredients", async () => {
    const app = buildApp();
    const headers = { "x-emprendedos-tenant-id": "recipe-production-tenant", "x-emprendedos-user-id": "recipe-production-user" };

    await app.inject({
      method: "POST",
      url: "/v1/products",
      headers,
      payload: { id: "recipe-batch-soap", name: "Jabon receta lote", stock: 2, minStock: 1, unitCost: 5000, price: 12000, unit: "un" }
    });
    await app.inject({
      method: "POST",
      url: "/v1/supplies",
      headers,
      payload: { id: "recipe-batch-oil", name: "Aceite lote receta", stock: 100, minStock: 10, averageCost: 100, unit: "ml" }
    });
    await app.inject({
      method: "POST",
      url: "/v1/recipes",
      headers,
      payload: {
        id: "scaled-soap-formula",
        productId: "recipe-batch-soap",
        name: "Formula escalable",
        outputQuantity: 10,
        ingredients: [{ supplyId: "recipe-batch-oil", quantity: 20 }],
        note: "Base"
      }
    });

    const productionResponse = await app.inject({
      method: "POST",
      url: "/v1/production-orders/from-recipe",
      headers,
      payload: {
        recipeId: "scaled-soap-formula",
        quantity: 25,
        note: "Lote desde receta"
      }
    });
    const order = productionResponse.json();
    const products = (await app.inject({ method: "GET", url: "/v1/products", headers })).json();
    const supplies = (await app.inject({ method: "GET", url: "/v1/supplies", headers })).json();
    const movements = (await app.inject({ method: "GET", url: "/v1/inventory-movements", headers })).json();

    expect(productionResponse.statusCode).toBe(201);
    expect(order.productId).toBe("recipe-batch-soap");
    expect(order.quantity).toBe(25);
    expect(order.totalCost).toBe(5000);
    expect(order.unitCost).toBe(200);
    expect(products.find((product: { id: string }) => product.id === "recipe-batch-soap")?.stock).toBe(27);
    expect(supplies.find((supply: { id: string }) => supply.id === "recipe-batch-oil")?.stock).toBe(50);
    expect(movements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          itemType: "supply",
          itemId: "recipe-batch-oil",
          movementType: "production",
          quantity: -50,
          referenceType: "production-order",
          referenceId: order.id
        }),
        expect.objectContaining({
          itemType: "product",
          itemId: "recipe-batch-soap",
          movementType: "production",
          quantity: 25,
          referenceType: "production-order",
          referenceId: order.id
        })
      ])
    );
  });

  it("lists recipe-driven production orders with the recipe reference", async () => {
    const app = buildApp();
    const headers = { "x-emprendedos-tenant-id": "recipe-history-tenant", "x-emprendedos-user-id": "recipe-history-user" };

    await app.inject({
      method: "POST",
      url: "/v1/products",
      headers,
      payload: { id: "recipe-history-soap", name: "Jabon receta historial", stock: 0, minStock: 1, unitCost: 0, price: 12000, unit: "un" }
    });
    await app.inject({
      method: "POST",
      url: "/v1/supplies",
      headers,
      payload: { id: "recipe-history-oil", name: "Aceite receta historial", stock: 100, minStock: 10, averageCost: 100, unit: "ml" }
    });
    await app.inject({
      method: "POST",
      url: "/v1/recipes",
      headers,
      payload: {
        id: "history-formula",
        productId: "recipe-history-soap",
        name: "Formula historial",
        outputQuantity: 10,
        ingredients: [{ supplyId: "recipe-history-oil", quantity: 20 }],
        note: "Base"
      }
    });

    const productionResponse = await app.inject({
      method: "POST",
      url: "/v1/production-orders/from-recipe",
      headers,
      payload: { recipeId: "history-formula", quantity: 10, note: "Desde receta historial" }
    });
    const order = productionResponse.json();
    const history = (await app.inject({ method: "GET", url: "/v1/production-orders", headers })).json();

    expect(productionResponse.statusCode).toBe(201);
    expect(history).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: order.id,
          productId: "recipe-history-soap",
          quantity: 10,
          recipeId: "history-formula",
          note: "Desde receta historial"
        })
      ])
    );
  });

  it("rejects production from a missing recipe", async () => {
    const app = buildApp();
    const headers = { "x-emprendedos-tenant-id": "missing-production-recipe-tenant", "x-emprendedos-user-id": "missing-production-recipe-user" };

    const productionResponse = await app.inject({
      method: "POST",
      url: "/v1/production-orders/from-recipe",
      headers,
      payload: {
        recipeId: "does-not-exist",
        quantity: 10,
        note: "Debe fallar"
      }
    });

    expect(productionResponse.statusCode).toBe(404);
    expect(productionResponse.json()).toEqual(expect.objectContaining({ error: "Recipe not found" }));
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
