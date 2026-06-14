import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  createExpense,
  createInventoryAdjustment,
  createInventoryPurchase,
  createProduct,
  createProductionOrder,
  createSale,
  createSupply,
  listExpenses,
  listInventoryMovements,
  listProducts,
  listSales,
  listSupplies,
  type ExpenseRecord,
  type InventoryMovementRecord,
  type ProductRecord,
  type SaleRecord,
  type SupplyRecord
} from "../api/client";
import { buildCsvFromTable, createExportFilename, downloadCsv } from "./csvExport";
import { Modal } from "./Modal";
import { getTemplatesForSection } from "./operationTemplates";
import { calculateSaleTotals } from "./salesCalculator";
import type { AppSection } from "./Shell";

type Field = {
  name: string;
  label: string;
  type: "text" | "number" | "date";
  defaultValue?: string;
};

type Row = ProductRecord | SupplyRecord | SaleRecord | ExpenseRecord;
type OperationSection = Exclude<AppSection, "dashboard" | "recipes" | "plan">;

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
} satisfies Record<OperationSection, {
  title: string;
  eyebrow: string;
  description: string;
  fields: Field[];
  headers: string[];
  load: (token?: string | null) => Promise<Row[]>;
  create: (payload: never, token?: string | null) => Promise<Row>;
  toCells: (row: never) => Array<string | number>;
}>;

export function Operations({ focusSignal = 0, section, token }: { focusSignal?: number; section: OperationSection; token: string }) {
  const config = resourceConfig[section];
  const templates = getTemplatesForSection(section);
  const [rows, setRows] = useState<Row[]>([]);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovementRecord[]>([]);
  const [adjustmentProducts, setAdjustmentProducts] = useState<ProductRecord[]>([]);
  const [adjustmentProductId, setAdjustmentProductId] = useState("");
  const [adjustmentStockAfter, setAdjustmentStockAfter] = useState(0);
  const [adjustmentNote, setAdjustmentNote] = useState("Conteo fisico");
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [purchaseProducts, setPurchaseProducts] = useState<ProductRecord[]>([]);
  const [purchaseSupplies, setPurchaseSupplies] = useState<SupplyRecord[]>([]);
  const [purchaseItemType, setPurchaseItemType] = useState<"product" | "supply">("product");
  const [purchaseItemId, setPurchaseItemId] = useState("");
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [purchaseUnitCost, setPurchaseUnitCost] = useState(0);
  const [purchaseNote, setPurchaseNote] = useState("Compra de inventario");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [productionProductId, setProductionProductId] = useState("");
  const [productionQuantity, setProductionQuantity] = useState(1);
  const [productionSupplyOneId, setProductionSupplyOneId] = useState("");
  const [productionSupplyOneQuantity, setProductionSupplyOneQuantity] = useState(1);
  const [productionSupplyTwoId, setProductionSupplyTwoId] = useState("");
  const [productionSupplyTwoQuantity, setProductionSupplyTwoQuantity] = useState(0);
  const [productionNote, setProductionNote] = useState("Orden de produccion");
  const [isProducing, setIsProducing] = useState(false);
  const [productOptions, setProductOptions] = useState<ProductRecord[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [saleQuantity, setSaleQuantity] = useState(1);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openInventoryAction, setOpenInventoryAction] = useState<"produce" | "purchase" | "adjust" | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const addLabel =
    section === "products" ? "Nuevo producto" : section === "supplies" ? "Nuevo insumo" : section === "sales" ? "Registrar venta" : "Registrar gasto";
  const totalValue = useMemo(() => rows.length, [rows]);
  const selectedProduct = productOptions.find((product) => product.id === selectedProductId);
  const saleTotals = calculateSaleTotals(selectedProduct, saleQuantity);
  const isSalesSection = section === "sales";
  const canSubmitSale = Boolean(selectedProduct) && Number.isFinite(saleQuantity) && saleQuantity > 0 && saleQuantity <= (selectedProduct?.stock ?? 0);
  const salesDateDefault = resourceConfig.sales.fields.find((field) => field.name === "date")?.defaultValue;
  const adjustmentProduct = adjustmentProducts.find((product) => product.id === adjustmentProductId);
  const adjustmentDelta = adjustmentStockAfter - (adjustmentProduct?.stock ?? 0);
  const canSubmitAdjustment = Boolean(adjustmentProduct) && Number.isFinite(adjustmentStockAfter) && adjustmentStockAfter >= 0 && adjustmentNote.trim().length > 0;
  const purchaseOptions = purchaseItemType === "product" ? purchaseProducts : purchaseSupplies;
  const purchaseItem = purchaseOptions.find((item) => item.id === purchaseItemId);
  const canSubmitPurchase = Boolean(purchaseItem) && Number.isFinite(purchaseQuantity) && purchaseQuantity > 0 && purchaseNote.trim().length > 0;
  const productionProduct = purchaseProducts.find((product) => product.id === productionProductId);
  const productionSupplyLines = [
    { supplyId: productionSupplyOneId, quantity: productionSupplyOneQuantity },
    { supplyId: productionSupplyTwoId, quantity: productionSupplyTwoQuantity }
  ].filter((line) => line.supplyId && Number.isFinite(line.quantity) && line.quantity > 0);
  const productionSupplyIds = new Set(productionSupplyLines.map((line) => line.supplyId));
  const canSubmitProduction =
    Boolean(productionProduct) &&
    Number.isFinite(productionQuantity) &&
    productionQuantity > 0 &&
    productionSupplyLines.length > 0 &&
    productionSupplyIds.size === productionSupplyLines.length &&
    productionSupplyLines.every((line) => (purchaseSupplies.find((supply) => supply.id === line.supplyId)?.stock ?? 0) >= line.quantity) &&
    productionNote.trim().length > 0;

  useEffect(() => {
    let isMounted = true;
    setError("");
    config.load(token).then((records) => {
      if (isMounted) setRows(records);
    }).catch(() => {
      if (isMounted) setError("No se pudo cargar la informacion");
    });

    if (section === "sales") {
      listProducts(token).then((products) => {
        if (!isMounted) return;

        setProductOptions(products);
        setSelectedProductId((currentId) => {
          if (products.some((product) => product.id === currentId)) return currentId;
          return products[0]?.id ?? "";
        });
        setSaleQuantity(1);
      }).catch(() => {
        if (isMounted) setError("No se pudo cargar el catalogo de productos");
      });
    }

    if (section === "supplies") {
      listProducts(token).then((products) => {
        if (!isMounted) return;

        setAdjustmentProducts(products);
        setPurchaseProducts(products);
        setAdjustmentProductId((currentId) => {
          const nextId = products.some((product) => product.id === currentId) ? currentId : products[0]?.id ?? "";
          setAdjustmentStockAfter(products.find((product) => product.id === nextId)?.stock ?? 0);
          return nextId;
        });
        if (purchaseItemType === "product") {
          setPurchaseItemId((currentId) => products.some((product) => product.id === currentId) ? currentId : products[0]?.id ?? "");
        }
        setProductionProductId((currentId) => products.some((product) => product.id === currentId) ? currentId : products[0]?.id ?? "");
      }).catch(() => {
        if (isMounted) setError("No se pudo cargar el catalogo de productos");
      });

      listSupplies(token).then((supplies) => {
        if (!isMounted) return;

        setPurchaseSupplies(supplies);
        if (purchaseItemType === "supply") {
          setPurchaseItemId((currentId) => supplies.some((supply) => supply.id === currentId) ? currentId : supplies[0]?.id ?? "");
        }
        setProductionSupplyOneId((currentId) => supplies.some((supply) => supply.id === currentId) ? currentId : supplies[0]?.id ?? "");
        setProductionSupplyTwoId((currentId) => supplies.some((supply) => supply.id === currentId) ? currentId : supplies[1]?.id ?? "");
      }).catch(() => {
        if (isMounted) setError("No se pudo cargar el catalogo de insumos");
      });

      listInventoryMovements(token).then((movements) => {
        if (isMounted) setInventoryMovements(movements);
      }).catch(() => {
        if (isMounted) setError("No se pudo cargar el kardex de inventario");
      });
    }

    return () => {
      isMounted = false;
    };
  }, [config, section, token]);

  useEffect(() => {
    if (section !== "sales" || focusSignal === 0) return;
    setIsDrawerOpen(true);
  }, [focusSignal, section]);

  useEffect(() => {
    setIsDrawerOpen(false);
    setOpenInventoryAction(null);
    setError("");
  }, [section]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = isSalesSection
      ? {
          date: String(form.get("date") ?? ""),
          productId: selectedProductId,
          quantity: saleQuantity,
          ...saleTotals
        }
      : Object.fromEntries(
          config.fields.map((field) => {
            const value = String(form.get(field.name) ?? "");
            return [field.name, field.type === "number" ? Number(value) : value];
          })
        );

    try {
      await config.create(payload as never, token);
      setRows(await config.load(token));
      if (isSalesSection) setProductOptions(await listProducts(token));
      formElement.reset();
      if (isSalesSection) setSaleQuantity(1);
      setIsDrawerOpen(false);
    } catch {
      setError("Revisa los campos e intenta guardar de nuevo");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAdjustmentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmitAdjustment) return;

    setIsAdjusting(true);
    setError("");
    try {
      await createInventoryAdjustment({
        itemType: "product",
        itemId: adjustmentProductId,
        stockAfter: adjustmentStockAfter,
        note: adjustmentNote.trim()
      }, token);
      const [products, movements] = await Promise.all([listProducts(token), listInventoryMovements(token)]);
      setAdjustmentProducts(products);
      setInventoryMovements(movements);
      setAdjustmentProductId((currentId) => {
        const nextId = products.some((product) => product.id === currentId) ? currentId : products[0]?.id ?? "";
        setAdjustmentStockAfter(products.find((product) => product.id === nextId)?.stock ?? 0);
        return nextId;
      });
      setOpenInventoryAction(null);
    } catch {
      setError("No se pudo registrar el ajuste de inventario");
    } finally {
      setIsAdjusting(false);
    }
  }

  async function handlePurchaseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmitPurchase) return;

    setIsPurchasing(true);
    setError("");
    try {
      await createInventoryPurchase({
        itemType: purchaseItemType,
        itemId: purchaseItemId,
        quantity: purchaseQuantity,
        unitCost: purchaseUnitCost,
        note: purchaseNote.trim()
      }, token);
      const [supplies, products, movements] = await Promise.all([listSupplies(token), listProducts(token), listInventoryMovements(token)]);
      setRows(supplies);
      setPurchaseSupplies(supplies);
      setPurchaseProducts(products);
      setAdjustmentProducts(products);
      setInventoryMovements(movements);
      setPurchaseItemId((currentId) => {
        const options = purchaseItemType === "product" ? products : supplies;
        return options.some((item) => item.id === currentId) ? currentId : options[0]?.id ?? "";
      });
      setPurchaseQuantity(1);
      setOpenInventoryAction(null);
    } catch {
      setError("No se pudo registrar la entrada de inventario");
    } finally {
      setIsPurchasing(false);
    }
  }

  async function handleProductionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmitProduction) return;

    setIsProducing(true);
    setError("");
    try {
      await createProductionOrder({
        productId: productionProductId,
        quantity: productionQuantity,
        supplies: productionSupplyLines,
        note: productionNote.trim()
      }, token);
      const [supplies, products, movements] = await Promise.all([listSupplies(token), listProducts(token), listInventoryMovements(token)]);
      setRows(supplies);
      setPurchaseSupplies(supplies);
      setPurchaseProducts(products);
      setAdjustmentProducts(products);
      setInventoryMovements(movements);
      setProductionProductId((currentId) => products.some((product) => product.id === currentId) ? currentId : products[0]?.id ?? "");
      setProductionSupplyOneId((currentId) => supplies.some((supply) => supply.id === currentId) ? currentId : supplies[0]?.id ?? "");
      setProductionSupplyTwoId((currentId) => supplies.some((supply) => supply.id === currentId) ? currentId : supplies[1]?.id ?? "");
      setProductionQuantity(1);
      setProductionSupplyOneQuantity(1);
      setProductionSupplyTwoQuantity(0);
      setOpenInventoryAction(null);
    } catch {
      setError("No se pudo registrar la orden de produccion");
    } finally {
      setIsProducing(false);
    }
  }

  function applyTemplate(values: Record<string, string | number>) {
    const form = formRef.current;
    if (!form) return;

    Object.entries(values).forEach(([name, value]) => {
      const input = form.elements.namedItem(name);
      if (input instanceof HTMLInputElement) {
        input.value = String(value);
      }
    });
  }

  function handleExportRows() {
    const csv = buildCsvFromTable(config.headers, rows.map((row) => config.toCells(row as never)));
    downloadCsv(createExportFilename(config.title), csv);
  }

  function handleExportInventoryMovements() {
    const csv = buildCsvFromTable(
      ["Fecha", "Tipo item", "Item", "Movimiento", "Cantidad", "Stock antes", "Stock despues", "Referencia", "Nota"],
      inventoryMovements.map((movement) => [
        movement.createdAt ?? "",
        movement.itemType === "product" ? "Producto" : "Insumo",
        movement.itemId,
        formatMovementType(movement.movementType),
        movement.quantity,
        movement.stockBefore,
        movement.stockAfter,
        movement.referenceType,
        movement.note ?? ""
      ])
    );
    downloadCsv(createExportFilename("movimientos de inventario"), csv);
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

      <section className="operations-board">
        <article className="card operations-table-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">Listado</p>
              <h2>Registros actuales</h2>
            </div>
            <div className="operations-head-actions">
              <button className="ghost-action export-action" disabled={!rows.length} onClick={handleExportRows} type="button">
                Exportar CSV
              </button>
              <button className="primary-action" onClick={() => setIsDrawerOpen(true)} type="button">
                + {addLabel}
              </button>
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
                {rows.length ? (
                  rows.map((row, index) => (
                    <tr key={rowKey(row, index)}>
                      {config.toCells(row as never).map((cell, cellIndex) => (
                        <td key={`${rowKey(row, index)}-${cellIndex}`} data-label={config.headers[cellIndex]}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="table-empty" colSpan={config.headers.length}>
                      Aun no tienes registros aqui. Toca <b>{addLabel}</b> para crear el primero.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <Modal open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} eyebrow="Nuevo registro" title={addLabel}>
        <form className="operations-form" onSubmit={handleSubmit} ref={formRef}>
          {templates.length ? (
            <div className="template-strip">
              {templates.map((template) => (
                <button className="template-chip" key={template.label} onClick={() => applyTemplate(template.values)} type="button">
                  <strong>{template.label}</strong>
                  <span>{template.hint}</span>
                </button>
              ))}
            </div>
          ) : null}
          {isSalesSection ? (
            <div className="sales-builder">
              {productOptions.length ? (
                <>
                  <label>
                    <span>Fecha</span>
                    <input name="date" type="date" defaultValue={salesDateDefault} required />
                  </label>
                  <label>
                    <span>Producto vendido</span>
                    <select value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)} required>
                      {productOptions.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {money(product.price)} - stock {product.stock}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Cantidad</span>
                    <input name="quantity" type="number" min={0.01} step={0.01} value={saleQuantity} onChange={(event) => setSaleQuantity(Number(event.target.value))} required />
                  </label>
                  <div className="sales-summary" aria-live="polite">
                    <div>
                      <span>Disponible</span>
                      <strong>{selectedProduct?.stock ?? 0} {selectedProduct?.unit ?? "un"}</strong>
                    </div>
                    <div>
                      <span>Ingreso</span>
                      <strong>{money(saleTotals.revenue)}</strong>
                    </div>
                    <div>
                      <span>Costo</span>
                      <strong>{money(saleTotals.cost)}</strong>
                    </div>
                    <div className="profit">
                      <span>Utilidad</span>
                      <strong>{money(saleTotals.grossProfit)}</strong>
                    </div>
                  </div>
                  {selectedProduct && saleQuantity > selectedProduct.stock ? (
                    <p className="form-error">No hay stock suficiente para esta venta.</p>
                  ) : null}
                </>
              ) : (
                <div className="empty-helper">
                  <strong>Primero crea un producto.</strong>
                  <span>Las ventas usan precio y costo del catalogo para calcular utilidad automaticamente.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="form-grid">
              {config.fields.map((field) => (
                <label key={field.name}>
                  <span>{field.label}</span>
                  <input name={field.name} type={field.type} min={field.type === "number" ? 0 : undefined} step={field.type === "number" ? 0.01 : undefined} defaultValue={field.defaultValue} required />
                </label>
              ))}
            </div>
          )}
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-action form-action" disabled={isSaving || (isSalesSection && !canSubmitSale)} type="submit">
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </Modal>

      {section === "supplies" ? (
        <section className="card movements-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">Kardex</p>
              <h2>Movimientos de inventario</h2>
            </div>
            <div className="operations-head-actions">
              <button className="ghost-action" disabled={!inventoryMovements.length} onClick={handleExportInventoryMovements} type="button">
                Exportar CSV
              </button>
              <button className="ghost-action" onClick={() => setOpenInventoryAction("adjust")} type="button">
                Ajustar stock
              </button>
              <button className="ghost-action" onClick={() => setOpenInventoryAction("purchase")} type="button">
                Registrar entrada
              </button>
              <button className="primary-action" onClick={() => setOpenInventoryAction("produce")} type="button">
                + Producir lote
              </button>
            </div>
          </div>
          {inventoryMovements.length ? (
            <div className="movement-list">
              {inventoryMovements.map((movement) => (
                <div className="movement-row" key={movement.id}>
                  <span className={`movement-badge ${movement.quantity < 0 ? "out" : "in"}`}>{movement.quantity < 0 ? "Salida" : "Entrada"}</span>
                  <div>
                    <strong>{movement.itemId}</strong>
                    <small>{formatMovementType(movement.movementType)} - {movement.referenceType}</small>
                  </div>
                  <span>{movement.quantity}</span>
                  <span>{movement.stockBefore} {"->"} {movement.stockAfter}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-copy">Todavia no hay movimientos de inventario. Registra una entrada, produccion o ajuste para verlos aqui.</p>
          )}
        </section>
      ) : null}

      <Modal open={openInventoryAction === "produce"} onClose={() => setOpenInventoryAction(null)} eyebrow="Produccion" title="Convertir insumos en producto" size="lg">
        <form className="adjustment-panel" onSubmit={handleProductionSubmit}>
            {purchaseProducts.length && purchaseSupplies.length ? (
              <div className="production-grid">
                <label>
                  <span>Producto</span>
                  <select value={productionProductId} onChange={(event) => setProductionProductId(event.target.value)} required>
                    {purchaseProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - stock {product.stock}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Cantidad lote</span>
                  <input type="number" min={0.01} step={0.01} value={productionQuantity} onChange={(event) => setProductionQuantity(Number(event.target.value))} required />
                </label>
                <label>
                  <span>Insumo 1</span>
                  <select value={productionSupplyOneId} onChange={(event) => setProductionSupplyOneId(event.target.value)} required>
                    {purchaseSupplies.map((supply) => (
                      <option key={supply.id} value={supply.id}>
                        {supply.name} - stock {supply.stock}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Cant. 1</span>
                  <input type="number" min={0.01} step={0.01} value={productionSupplyOneQuantity} onChange={(event) => setProductionSupplyOneQuantity(Number(event.target.value))} required />
                </label>
                <label>
                  <span>Insumo 2</span>
                  <select value={productionSupplyTwoId} onChange={(event) => setProductionSupplyTwoId(event.target.value)}>
                    <option value="">Sin segundo insumo</option>
                    {purchaseSupplies.map((supply) => (
                      <option key={supply.id} value={supply.id}>
                        {supply.name} - stock {supply.stock}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Cant. 2</span>
                  <input type="number" min={0} step={0.01} value={productionSupplyTwoQuantity} onChange={(event) => setProductionSupplyTwoQuantity(Number(event.target.value))} />
                </label>
                <label>
                  <span>Nota</span>
                  <input value={productionNote} onChange={(event) => setProductionNote(event.target.value)} required />
                </label>
                <button className="secondary-action adjustment-action" disabled={isProducing || !canSubmitProduction} type="submit">
                  {isProducing ? "Produciendo..." : "Registrar produccion"}
                </button>
              </div>
            ) : (
              <p className="empty-copy">Crea al menos un producto y un insumo para registrar produccion.</p>
            )}
        </form>
      </Modal>

      <Modal open={openInventoryAction === "purchase"} onClose={() => setOpenInventoryAction(null)} eyebrow="Entrada" title="Registrar compra o reposicion" size="lg">
        <form className="adjustment-panel" onSubmit={handlePurchaseSubmit}>
            {purchaseOptions.length ? (
              <div className="purchase-grid">
                <label>
                  <span>Tipo</span>
                  <select
                    value={purchaseItemType}
                    onChange={(event) => {
                      const nextType = event.target.value as "product" | "supply";
                      const nextOptions = nextType === "product" ? purchaseProducts : purchaseSupplies;
                      setPurchaseItemType(nextType);
                      setPurchaseItemId(nextOptions[0]?.id ?? "");
                    }}
                  >
                    <option value="product">Producto</option>
                    <option value="supply">Insumo</option>
                  </select>
                </label>
                <label>
                  <span>Item</span>
                  <select value={purchaseItemId} onChange={(event) => setPurchaseItemId(event.target.value)} required>
                    {purchaseOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} - stock {item.stock}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Cantidad</span>
                  <input type="number" min={0.01} step={0.01} value={purchaseQuantity} onChange={(event) => setPurchaseQuantity(Number(event.target.value))} required />
                </label>
                <label>
                  <span>Costo unitario</span>
                  <input type="number" min={0} step={0.01} value={purchaseUnitCost} onChange={(event) => setPurchaseUnitCost(Number(event.target.value))} />
                </label>
                <label>
                  <span>Nota</span>
                  <input value={purchaseNote} onChange={(event) => setPurchaseNote(event.target.value)} required />
                </label>
                <button className="secondary-action adjustment-action" disabled={isPurchasing || !canSubmitPurchase} type="submit">
                  {isPurchasing ? "Registrando..." : "Registrar entrada"}
                </button>
              </div>
            ) : (
              <p className="empty-copy">Crea productos o insumos para registrar entradas de inventario.</p>
            )}
        </form>
      </Modal>

      <Modal open={openInventoryAction === "adjust"} onClose={() => setOpenInventoryAction(null)} eyebrow="Ajuste manual" title="Corregir stock contado">
        <form className="adjustment-panel" onSubmit={handleAdjustmentSubmit}>
            {adjustmentProducts.length ? (
              <div className="adjustment-grid">
                <label>
                  <span>Producto</span>
                  <select
                    value={adjustmentProductId}
                    onChange={(event) => {
                      const nextProduct = adjustmentProducts.find((product) => product.id === event.target.value);
                      setAdjustmentProductId(event.target.value);
                      setAdjustmentStockAfter(nextProduct?.stock ?? 0);
                    }}
                    required
                  >
                    {adjustmentProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - stock {product.stock}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Stock contado</span>
                  <input type="number" min={0} step={0.01} value={adjustmentStockAfter} onChange={(event) => setAdjustmentStockAfter(Number(event.target.value))} required />
                </label>
                <label>
                  <span>Motivo</span>
                  <input value={adjustmentNote} onChange={(event) => setAdjustmentNote(event.target.value)} required />
                </label>
                <div className="adjustment-delta">
                  <span>Diferencia</span>
                  <strong>{adjustmentDelta > 0 ? `+${adjustmentDelta}` : adjustmentDelta}</strong>
                </div>
                <button className="secondary-action adjustment-action" disabled={isAdjusting || !canSubmitAdjustment} type="submit">
                  {isAdjusting ? "Ajustando..." : "Registrar ajuste"}
                </button>
              </div>
            ) : (
              <p className="empty-copy">Crea un producto para registrar ajustes manuales de inventario.</p>
            )}
        </form>
      </Modal>
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

function formatMovementType(type: InventoryMovementRecord["movementType"]) {
  if (type === "sale") return "Venta";
  if (type === "production") return "Produccion";
  if (type === "purchase") return "Compra";
  return "Ajuste";
}
