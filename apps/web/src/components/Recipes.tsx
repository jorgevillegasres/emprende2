import { FormEvent, useEffect, useState } from "react";
import {
  createProductionFromRecipe,
  createRecipe,
  listProductionOrders,
  listProducts,
  listRecipes,
  listSupplies,
  type ProductRecord,
  type ProductionOrderSummaryRecord,
  type RecipeRecord,
  type SupplyRecord
} from "../api/client";
import { buildCsvFromTable, createExportFilename, downloadCsv } from "./csvExport";
import { Icon } from "./Icon";
import { Modal } from "./Modal";

export function Recipes({ token }: { token: string }) {
  const [recipes, setRecipes] = useState<RecipeRecord[]>([]);
  const [productionOrders, setProductionOrders] = useState<ProductionOrderSummaryRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [supplies, setSupplies] = useState<SupplyRecord[]>([]);
  const [recipeId, setRecipeId] = useState("");
  const [name, setName] = useState("");
  const [productId, setProductId] = useState("");
  const [outputQuantity, setOutputQuantity] = useState(10);
  const [supplyOneId, setSupplyOneId] = useState("");
  const [supplyOneQuantity, setSupplyOneQuantity] = useState(1);
  const [supplyTwoId, setSupplyTwoId] = useState("");
  const [supplyTwoQuantity, setSupplyTwoQuantity] = useState(0);
  const [note, setNote] = useState("");
  const [productionRecipeId, setProductionRecipeId] = useState("");
  const [productionQuantity, setProductionQuantity] = useState(10);
  const [productionNote, setProductionNote] = useState("Produccion desde receta");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isProducing, setIsProducing] = useState(false);
  const [isProduceOpen, setIsProduceOpen] = useState(false);
  const [isRecipeFormOpen, setIsRecipeFormOpen] = useState(false);

  const ingredientLines = [
    { supplyId: supplyOneId, quantity: supplyOneQuantity },
    { supplyId: supplyTwoId, quantity: supplyTwoQuantity }
  ].filter((line) => line.supplyId && Number.isFinite(line.quantity) && line.quantity > 0);
  const uniqueIngredientIds = new Set(ingredientLines.map((line) => line.supplyId));
  const canSubmit =
    recipeId.trim().length > 0 &&
    name.trim().length > 0 &&
    Boolean(productId) &&
    Number.isFinite(outputQuantity) &&
    outputQuantity > 0 &&
    ingredientLines.length > 0 &&
    uniqueIngredientIds.size === ingredientLines.length;
  const productionRecipe = recipes.find((recipe) => recipe.id === productionRecipeId);
  const canProduce = Boolean(productionRecipe) && Number.isFinite(productionQuantity) && productionQuantity > 0 && productionNote.trim().length > 0;

  useEffect(() => {
    let isMounted = true;
    setError("");

    Promise.all([listRecipes(token), listProducts(token), listSupplies(token), listProductionOrders(token)])
      .then(([loadedRecipes, loadedProducts, loadedSupplies, loadedProductionOrders]) => {
        if (!isMounted) return;
        setRecipes(loadedRecipes);
        setProducts(loadedProducts);
        setSupplies(loadedSupplies);
        setProductionOrders(loadedProductionOrders);
        setProductionRecipeId((currentId) => loadedRecipes.some((recipe) => recipe.id === currentId) ? currentId : loadedRecipes[0]?.id ?? "");
        setProductId((currentId) => loadedProducts.some((product) => product.id === currentId) ? currentId : loadedProducts[0]?.id ?? "");
        setSupplyOneId((currentId) => loadedSupplies.some((supply) => supply.id === currentId) ? currentId : loadedSupplies[0]?.id ?? "");
        setSupplyTwoId((currentId) => loadedSupplies.some((supply) => supply.id === currentId) ? currentId : loadedSupplies[1]?.id ?? "");
      })
      .catch(() => {
        if (isMounted) setError("No se pudieron cargar las recetas");
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSaving(true);
    setError("");
    try {
      await createRecipe({
        id: recipeId.trim(),
        productId,
        name: name.trim(),
        outputQuantity,
        ingredients: ingredientLines,
        note: note.trim()
      }, token);
      const loadedRecipes = await listRecipes(token);
      setRecipes(loadedRecipes);
      setProductionRecipeId((currentId) => loadedRecipes.some((recipe) => recipe.id === currentId) ? currentId : loadedRecipes[0]?.id ?? "");
      setRecipeId("");
      setName("");
      setOutputQuantity(10);
      setSupplyOneQuantity(1);
      setSupplyTwoQuantity(0);
      setNote("");
      setIsRecipeFormOpen(false);
    } catch {
      setError("No se pudo guardar la receta. Revisa producto, insumos y codigo.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleProductionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canProduce) return;

    setIsProducing(true);
    setError("");
    try {
      await createProductionFromRecipe({
        recipeId: productionRecipeId,
        quantity: productionQuantity,
        note: productionNote.trim()
      }, token);
      const [loadedRecipes, loadedProducts, loadedSupplies, loadedProductionOrders] = await Promise.all([
        listRecipes(token),
        listProducts(token),
        listSupplies(token),
        listProductionOrders(token)
      ]);
      setRecipes(loadedRecipes);
      setProducts(loadedProducts);
      setSupplies(loadedSupplies);
      setProductionOrders(loadedProductionOrders);
      setProductionRecipeId((currentId) => loadedRecipes.some((recipe) => recipe.id === currentId) ? currentId : loadedRecipes[0]?.id ?? "");
      setProductionQuantity(productionRecipe?.outputQuantity ?? 10);
      setIsProduceOpen(false);
    } catch {
      setError("No se pudo producir desde la receta. Revisa stock de insumos.");
    } finally {
      setIsProducing(false);
    }
  }

  function handleExportProductionOrders() {
    const csv = buildCsvFromTable(
      ["Fecha", "Producto", "Cantidad", "Costo total", "Costo unitario", "Receta", "Nota"],
      productionOrders.map((order) => [
        order.createdAt ?? "",
        products.find((product) => product.id === order.productId)?.name ?? order.productId,
        order.quantity,
        money(order.totalCost),
        money(order.unitCost),
        order.recipeId ? recipes.find((recipe) => recipe.id === order.recipeId)?.name ?? order.recipeId : "Produccion manual",
        order.note ?? ""
      ])
    );
    downloadCsv(createExportFilename("historial de lotes producidos"), csv);
  }

  return (
    <main className="operations-page recipes-page">
      <section className="operations-hero">
        <div>
          <p className="eyebrow">Produccion repetible</p>
          <h1>Recetas</h1>
          <p>Define formulas base para producir con consistencia y controlar consumo de insumos.</p>
        </div>
        <div className="operations-stat">
          <span>Recetas</span>
          <strong>{recipes.length}</strong>
        </div>
      </section>

      {error ? <div className="system-panel">{error}</div> : null}

      <section className="card recipes-library-card">
        <div className="card-head">
          <div>
            <p className="eyebrow">Biblioteca</p>
            <h2>Formulas guardadas</h2>
          </div>
          <div className="operations-head-actions">
            <button className="ghost-action" disabled={!recipes.length} onClick={() => setIsProduceOpen(true)} type="button">
              <Icon name="products" size={16} />
              Producir lote
            </button>
            <button className="primary-action" onClick={() => setIsRecipeFormOpen(true)} type="button">
              <Icon name="plus" size={16} />
              Nueva receta
            </button>
          </div>
        </div>
        {recipes.length ? (
          <div className="recipe-list">
            {recipes.map((recipe) => (
              <article className="recipe-row" key={recipe.id}>
                <div>
                  <span>{recipe.productId}</span>
                  <strong>{recipe.name}</strong>
                  <small>Rinde {recipe.outputQuantity} unidades base</small>
                </div>
                <ul>
                  {recipe.ingredients.map((ingredient) => (
                    <li key={ingredient.supplyId}>
                      {ingredient.supplyId}: {ingredient.quantity}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-copy">Aun no tienes recetas. Toca <b>+ Nueva receta</b> para crear tu primera formula base.</p>
        )}
      </section>

      <Modal open={isProduceOpen} onClose={() => setIsProduceOpen(false)} eyebrow="Produccion guiada" title="Producir desde receta" size="lg">
        <form className="recipe-production-form" onSubmit={handleProductionSubmit}>
            {recipes.length ? (
              <div className="recipe-form-grid compact">
                <label>
                  <span>Receta</span>
                  <select value={productionRecipeId} onChange={(event) => setProductionRecipeId(event.target.value)} required>
                    {recipes.map((recipe) => (
                      <option key={recipe.id} value={recipe.id}>
                        {recipe.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Cantidad a producir</span>
                  <input type="number" min={0.01} step={0.01} value={productionQuantity} onChange={(event) => setProductionQuantity(Number(event.target.value))} required />
                </label>
                <label>
                  <span>Nota</span>
                  <input value={productionNote} onChange={(event) => setProductionNote(event.target.value)} required />
                </label>
                <button className="primary-action" disabled={isProducing || !canProduce} type="submit">
                  {isProducing ? "Produciendo..." : "Producir lote"}
                </button>
              </div>
            ) : (
              <p className="empty-copy">Guarda una receta para producir automaticamente desde ella.</p>
            )}
            {productionRecipe ? (
              <div className="recipe-scale-preview">
                <span>Consumo estimado</span>
                <strong>{productionRecipe.name}</strong>
                <ul>
                  {productionRecipe.ingredients.map((ingredient) => (
                    <li key={ingredient.supplyId}>
                      {ingredient.supplyId}: {roundQuantity((ingredient.quantity * productionQuantity) / productionRecipe.outputQuantity)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
        </form>
      </Modal>

      <Modal open={isRecipeFormOpen} onClose={() => setIsRecipeFormOpen(false)} eyebrow="Nueva formula" title="Receta base" size="lg">
        <form className="recipe-form" onSubmit={handleSubmit}>
          <div className="recipe-form-grid">
            <label>
              <span>Codigo</span>
              <input value={recipeId} onChange={(event) => setRecipeId(event.target.value)} placeholder="shampoo-romero-base" required />
            </label>
            <label>
              <span>Nombre</span>
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Formula shampoo romero" required />
            </label>
            <label>
              <span>Producto</span>
              <select value={productId} onChange={(event) => setProductId(event.target.value)} required>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Rinde</span>
              <input type="number" min={0.01} step={0.01} value={outputQuantity} onChange={(event) => setOutputQuantity(Number(event.target.value))} required />
            </label>
            <label>
              <span>Insumo 1</span>
              <select value={supplyOneId} onChange={(event) => setSupplyOneId(event.target.value)} required>
                {supplies.map((supply) => (
                  <option key={supply.id} value={supply.id}>
                    {supply.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Cant. 1</span>
              <input type="number" min={0.01} step={0.01} value={supplyOneQuantity} onChange={(event) => setSupplyOneQuantity(Number(event.target.value))} required />
            </label>
            <label>
              <span>Insumo 2</span>
              <select value={supplyTwoId} onChange={(event) => setSupplyTwoId(event.target.value)}>
                <option value="">Sin segundo insumo</option>
                {supplies.map((supply) => (
                  <option key={supply.id} value={supply.id}>
                    {supply.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Cant. 2</span>
              <input type="number" min={0} step={0.01} value={supplyTwoQuantity} onChange={(event) => setSupplyTwoQuantity(Number(event.target.value))} />
            </label>
            <label className="recipe-note">
              <span>Nota</span>
              <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Proceso, temperatura, proveedor..." />
            </label>
          </div>
          <button className="primary-action" disabled={isSaving || !canSubmit} type="submit">
            {isSaving ? "Guardando..." : "Guardar receta"}
          </button>
        </form>
      </Modal>

      <section className="card production-history-card">
        <div className="card-head">
          <div>
            <p className="eyebrow">Trazabilidad</p>
            <h2>Historial de lotes producidos</h2>
          </div>
          <button className="secondary-action export-action" disabled={!productionOrders.length} onClick={handleExportProductionOrders} type="button">
            <Icon name="download" size={16} />
            Exportar CSV
          </button>
        </div>
        {productionOrders.length ? (
          <div className="production-history-list">
            {productionOrders.map((order) => (
              <article className="production-history-row" key={order.id}>
                <div>
                  <span>{order.recipeId ? `Receta ${order.recipeId}` : "Produccion manual"}</span>
                  <strong>{order.productId}</strong>
                  <small>{order.note || "Sin nota"}</small>
                </div>
                <div>
                  <span>Cantidad</span>
                  <strong>{order.quantity}</strong>
                </div>
                <div>
                  <span>Costo total</span>
                  <strong>{money(order.totalCost)}</strong>
                </div>
                <div>
                  <span>Costo unit.</span>
                  <strong>{money(order.unitCost)}</strong>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-copy">Todavia no hay lotes producidos.</p>
        )}
      </section>
    </main>
  );
}

function money(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

function roundQuantity(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
