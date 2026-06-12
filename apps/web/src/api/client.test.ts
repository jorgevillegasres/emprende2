import { describe, expect, it } from "vitest";
import {
  createAuthHeaders,
  getInventoryAdjustmentPath,
  getInventoryMovementsPath,
  getInventoryPurchasePath,
  getProductionFromRecipePath,
  getProductionOrderPath,
  getProductionOrdersPath,
  getRecipesPath,
  getDecisionsPath,
  getRegisterPath
} from "./client";

describe("createAuthHeaders", () => {
  it("returns an empty header set when the session token is missing", () => {
    expect(createAuthHeaders(null)).toEqual({});
  });

  it("formats a bearer authorization header when a session token exists", () => {
    expect(createAuthHeaders("session-token")).toEqual({
      Authorization: "Bearer session-token"
    });
  });
});

describe("getRegisterPath", () => {
  it("targets the owner registration endpoint", () => {
    expect(getRegisterPath()).toBe("/v1/auth/register");
  });
});

describe("getInventoryMovementsPath", () => {
  it("targets the inventory movement endpoint", () => {
    expect(getInventoryMovementsPath()).toBe("/v1/inventory-movements");
  });
});

describe("getInventoryAdjustmentPath", () => {
  it("targets the inventory adjustment endpoint", () => {
    expect(getInventoryAdjustmentPath()).toBe("/v1/inventory-adjustments");
  });
});

describe("getInventoryPurchasePath", () => {
  it("targets the inventory purchase endpoint", () => {
    expect(getInventoryPurchasePath()).toBe("/v1/inventory-purchases");
  });
});

describe("getProductionOrderPath", () => {
  it("targets the production order endpoint", () => {
    expect(getProductionOrderPath()).toBe("/v1/production-orders");
  });
});

describe("getProductionOrdersPath", () => {
  it("targets the production order listing endpoint", () => {
    expect(getProductionOrdersPath()).toBe("/v1/production-orders");
  });
});

describe("getProductionFromRecipePath", () => {
  it("targets the recipe-driven production endpoint", () => {
    expect(getProductionFromRecipePath()).toBe("/v1/production-orders/from-recipe");
  });
});

describe("getRecipesPath", () => {
  it("targets the recipes endpoint", () => {
    expect(getRecipesPath()).toBe("/v1/recipes");
  });
});

describe("getDecisionsPath", () => {
  it("targets the decisions endpoint", () => {
    expect(getDecisionsPath()).toBe("/v1/decisions");
  });

  it("can target decisions by status", () => {
    expect(getDecisionsPath("done")).toBe("/v1/decisions?status=done");
  });
});
