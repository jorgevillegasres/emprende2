import { describe, expect, it } from "vitest";
import { getTemplatesForSection } from "./operationTemplates";

describe("getTemplatesForSection", () => {
  it("returns product templates with editable product fields", () => {
    expect(getTemplatesForSection("products")[0]).toMatchObject({
      label: "Producto listo",
      values: {
        id: "producto-principal",
        name: "Producto principal",
        stock: 10,
        minStock: 4,
        unitCost: 5000,
        price: 12000,
        unit: "un"
      }
    });
  });

  it("returns no templates for sales because sales depend on existing products", () => {
    expect(getTemplatesForSection("sales")).toEqual([]);
  });
});
