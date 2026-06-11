import type { AppSection } from "./Shell";

export type OperationTemplate = {
  label: string;
  hint: string;
  values: Record<string, string | number>;
};

const templates: Partial<Record<Exclude<AppSection, "dashboard">, OperationTemplate[]>> = {
  products: [
    {
      label: "Producto listo",
      hint: "Un articulo vendido tal cual, con costo y precio.",
      values: {
        id: "producto-principal",
        name: "Producto principal",
        stock: 10,
        minStock: 4,
        unitCost: 5000,
        price: 12000,
        unit: "un"
      }
    },
    {
      label: "Combo o kit",
      hint: "Paquete de varios productos vendido como una unidad.",
      values: {
        id: "combo-inicial",
        name: "Combo inicial",
        stock: 5,
        minStock: 2,
        unitCost: 15000,
        price: 32000,
        unit: "kit"
      }
    }
  ],
  supplies: [
    {
      label: "Materia prima",
      hint: "Ingrediente, material o componente que se consume al producir.",
      values: {
        id: "materia-prima",
        name: "Materia prima principal",
        stock: 50,
        minStock: 15,
        averageCost: 1200,
        unit: "un"
      }
    },
    {
      label: "Empaque",
      hint: "Bolsas, etiquetas, cajas o envases.",
      values: {
        id: "empaque-base",
        name: "Empaque base",
        stock: 100,
        minStock: 30,
        averageCost: 300,
        unit: "un"
      }
    }
  ],
  expenses: [
    {
      label: "Gasto mensual",
      hint: "Servicios, alquiler, internet o suscripciones.",
      values: {
        date: new Date().toISOString().slice(0, 10),
        category: "Servicios",
        amount: 50000
      }
    },
    {
      label: "Transporte",
      hint: "Envios, domicilios o desplazamientos.",
      values: {
        date: new Date().toISOString().slice(0, 10),
        category: "Transporte",
        amount: 15000
      }
    }
  ],
  sales: []
};

export function getTemplatesForSection(section: Exclude<AppSection, "dashboard">) {
  return templates[section] ?? [];
}
