import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createExpense,
  createProduct,
  createSale,
  createSupply,
  listExpenses,
  listProducts,
  listSales,
  listSupplies,
  type ExpenseRecord,
  type ProductRecord,
  type SaleRecord,
  type SupplyRecord
} from "../api/client";
import type { AppSection } from "./Shell";

type Field = {
  name: string;
  label: string;
  type: "text" | "number" | "date";
  defaultValue?: string;
};

type Row = ProductRecord | SupplyRecord | SaleRecord | ExpenseRecord;

const resourceConfig = {
  products: {
    title: "Productos terminados",
    eyebrow: "Catalogo comercial",
    description: "Controla existencias, costos y precios de venta.",
    fields: [
      { name: "id", label: "Codigo", type: "text" },
      { name: "name", label: "Nombre", type: "text" },
      { name: "stock", label: "Stock", type: "number" },
      { name: "minStock", label: "Minimo", type: "number" },
      { name: "unitCost", label: "Costo unitario", type: "number" },
      { name: "price", label: "Precio", type: "number" },
      { name: "unit", label: "Unidad", type: "text", defaultValue: "un" }
    ],
    headers: ["Codigo", "Nombre", "Stock", "Min.", "Costo", "Precio"],
    load: listProducts,
    create: createProduct,
    toCells: (row: ProductRecord) => [row.id, row.name, row.stock, row.minStock, money(row.unitCost), money(row.price)]
  },
  supplies: {
    title: "Insumos",
    eyebrow: "Inventario productivo",
    description: "Registra materias primas, empaques y consumibles.",
    fields: [
      { name: "id", label: "Codigo", type: "text" },
      { name: "name", label: "Nombre", type: "text" },
      { name: "stock", label: "Stock", type: "number" },
      { name: "minStock", label: "Minimo", type: "number" },
      { name: "averageCost", label: "Costo promedio", type: "number" },
      { name: "unit", label: "Unidad", type: "text", defaultValue: "un" }
    ],
    headers: ["Codigo", "Nombre", "Stock", "Min.", "Costo prom."],
    load: listSupplies,
    create: createSupply,
    toCells: (row: SupplyRecord) => [row.id ?? "", row.name, row.stock, row.minStock, money(row.averageCost)]
  },
  sales: {
    title: "Ventas",
    eyebrow: "Ingresos",
    description: "Registra ventas para alimentar margen, ritmo comercial y utilidad.",
    fields: [
      { name: "date", label: "Fecha", type: "date", defaultValue: "2026-06-10" },
      { name: "productId", label: "Producto", type: "text" },
      { name: "quantity", label: "Cantidad", type: "number" },
      { name: "revenue", label: "Ingreso", type: "number" },
      { name: "cost", label: "Costo", type: "number" },
      { name: "grossProfit", label: "Utilidad bruta", type: "number" }
    ],
    headers: ["Fecha", "Producto", "Cant.", "Ingreso", "Costo", "Utilidad"],
    load: listSales,
    create: createSale,
    toCells: (row: SaleRecord) => [row.date, row.productId, row.quantity, money(row.revenue), money(row.cost), money(row.grossProfit)]
  },
  expenses: {
    title: "Gastos",
    eyebrow: "Egresos",
    description: "Observa salidas de dinero por categoria para proteger caja.",
    fields: [
      { name: "date", label: "Fecha", type: "date", defaultValue: "2026-06-10" },
      { name: "category", label: "Categoria", type: "text" },
      { name: "amount", label: "Valor", type: "number" }
    ],
    headers: ["Fecha", "Categoria", "Valor"],
    load: listExpenses,
    create: createExpense,
    toCells: (row: ExpenseRecord) => [row.date, row.category, money(row.amount)]
  }
} satisfies Record<Exclude<AppSection, "dashboard">, {
  title: string;
  eyebrow: string;
  description: string;
  fields: Field[];
  headers: string[];
  load: (token?: string | null) => Promise<Row[]>;
  create: (payload: never, token?: string | null) => Promise<Row>;
  toCells: (row: never) => Array<string | number>;
}>;

export function Operations({ section, token }: { section: Exclude<AppSection, "dashboard">; token: string }) {
  const config = resourceConfig[section];
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const totalValue = useMemo(() => rows.length, [rows]);

  useEffect(() => {
    setError("");
    config.load(token).then(setRows).catch(() => setError("No se pudo cargar la informacion"));
  }, [config, token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(
      config.fields.map((field) => {
        const value = String(form.get(field.name) ?? "");
        return [field.name, field.type === "number" ? Number(value) : value];
      })
    );

    try {
      await config.create(payload as never, token);
      setRows(await config.load(token));
      event.currentTarget.reset();
    } catch {
      setError("Revisa los campos e intenta guardar de nuevo");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="operations-page">
      <section className="operations-hero">
        <div>
          <p className="eyebrow">{config.eyebrow}</p>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>
        <div className="operations-stat">
          <span>Registros</span>
          <strong>{totalValue}</strong>
        </div>
      </section>

      <section className="operations-grid">
        <form className="card operations-form" onSubmit={handleSubmit}>
          <div>
            <p className="eyebrow">Nuevo registro</p>
            <h2>Captura rapida</h2>
          </div>
          <div className="form-grid">
            {config.fields.map((field) => (
              <label key={field.name}>
                <span>{field.label}</span>
                <input name={field.name} type={field.type} min={field.type === "number" ? 0 : undefined} step={field.type === "number" ? 0.01 : undefined} defaultValue={field.defaultValue} required />
              </label>
            ))}
          </div>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-action form-action" disabled={isSaving} type="submit">
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
        </form>

        <article className="card operations-table-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">Listado</p>
              <h2>Registros actuales</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {config.headers.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={rowKey(row, index)}>
                    {config.toCells(row as never).map((cell, cellIndex) => (
                      <td key={`${rowKey(row, index)}-${cellIndex}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </main>
  );
}

function rowKey(row: Row, index: number) {
  if ("id" in row && row.id) return row.id;
  if ("category" in row) return `${row.category}-${row.date}-${index}`;
  if ("date" in row) return `${row.date}-${index}`;
  return `row-${index}`;
}

function money(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}
