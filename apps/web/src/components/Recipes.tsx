import { FormEvent, useEffect, useState } from "react";
import { createRecipe, listProducts, listRecipes, listSupplies, type ProductRecord, type RecipeRecord, type SupplyRecord } from "../api/client";

export function Recipes({ token }: { token: string }) {
  const [recipes, setRecipes] = useState<RecipeRecord[]>([]);
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
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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

  useEffect(() => {
    let isMounted = true;
    setError("");

    Promise.all([listRecipes(token), listProducts(token), listSupplies(token)])
      .then(([loadedRecipes, loadedProducts, loadedSupplies]) => {
        if (!isMounted) return;
        setRecipes(loadedRecipes);
        setProducts(loadedProducts);
        setSupplies(loadedSupplies);
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
      setRecipes(await listRecipes(token));
      setRecipeId("");
      setName("");
      setOutputQuantity(10);
      setSupplyOneQuantity(1);
      setSupplyTwoQuantity(0);
      setNote("");
    } catch {
      setError("No se pudo guardar la receta. Revisa producto, insumos y codigo.");
    } finally {
      setIsSaving(false);
    }
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

      <section className="recipes-grid">
        <form className="card recipe-form" onSubmit={handleSubmit}>
          <div>
            <p className="eyebrow">Nueva formula</p>
            <h2>Receta base</h2>
          </div>
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

        <section className="card recipes-list-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">Biblioteca</p>
              <h2>Formulas guardadas</h2>
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
            <p className="empty-copy">Todavia no hay recetas guardadas.</p>
          )}
        </section>
      </section>
    </main>
  );
}
