import {
  addSupplyPurchase,
  calculateDashboardMetrics,
  formatCurrency,
  makeId,
  registerProduction,
  toDateKey,
} from './domain.js';
import { loadState, resetState, saveState } from './storage.js';

const today = toDateKey(new Date());
let state = loadState();
let currentView = 'dashboard';

const viewTitles = {
  dashboard: 'Dashboard operativo',
  supplies: 'Inventario de insumos',
  products: 'Productos terminados',
  recipes: 'Recetas y formulaciones',
  production: 'Produccion por lotes',
  purchases: 'Compras de insumos',
  expenses: 'Gastos del taller',
};

document.querySelector('#todayPill').textContent = today;
document.querySelectorAll('.nav-item').forEach((button) => {
  button.addEventListener('click', () => setView(button.dataset.view));
});
document.querySelector('#resetButton').addEventListener('click', () => {
  state = resetState();
  persistAndRender('Datos demo restaurados');
});

render();

function setView(view) {
  currentView = view;
  document.querySelectorAll('.nav-item').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === view);
  });
  document.querySelectorAll('.view').forEach((section) => {
    section.classList.toggle('active', section.id === view);
  });
  document.querySelector('#viewTitle').textContent = viewTitles[view];
  render();
}

function render() {
  renderDashboard();
  renderSupplies();
  renderProducts();
  renderRecipes();
  renderProduction();
  renderPurchases();
  renderExpenses();
}

function renderDashboard() {
  const metrics = calculateDashboardMetrics(state, today);
  const section = document.querySelector('#dashboard');
  section.innerHTML = `
    <div class="metric-grid">
      ${metricCard('Inventario total', formatCurrency(metrics.totalInventoryValue), 'Insumos + producto terminado')}
      ${metricCard('Valor insumos', formatCurrency(metrics.supplyInventoryValue), 'Costo promedio ponderado')}
      ${metricCard('Valor producto', formatCurrency(metrics.productInventoryValue), 'Costo unitario estimado')}
      ${metricCard('Gastos del mes', formatCurrency(metrics.monthlyExpenses), 'Operacion registrada')}
    </div>

    <div class="dashboard-grid">
      <article class="panel">
        <div class="panel-head">
          <h2>Alertas de stock</h2>
          <span>${metrics.lowStockItems.length}</span>
        </div>
        ${renderAlertList(metrics.lowStockItems)}
      </article>

      <article class="panel">
        <div class="panel-head">
          <h2>Proximos vencimientos</h2>
          <span>${metrics.upcomingExpirations.length}</span>
        </div>
        ${renderExpirationList(metrics.upcomingExpirations)}
      </article>

      <article class="panel wide">
        <div class="panel-head">
          <h2>Margen estimado</h2>
          <span>Precio - costo</span>
        </div>
        ${renderMarginTable(metrics.marginLeaders)}
      </article>

      <article class="panel">
        <div class="panel-head">
          <h2>Acciones rapidas</h2>
          <span>Hoy</span>
        </div>
        <div class="quick-actions">
          <button type="button" data-jump="purchases">Registrar compra</button>
          <button type="button" data-jump="production">Registrar produccion</button>
          <button type="button" data-jump="expenses">Registrar gasto</button>
        </div>
      </article>
    </div>
  `;
  section.querySelectorAll('[data-jump]').forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.jump));
  });
}

function renderSupplies() {
  const section = document.querySelector('#supplies');
  section.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Insumo</th>
            <th>Categoria</th>
            <th>Stock</th>
            <th>Minimo</th>
            <th>Costo prom.</th>
            <th>Lote</th>
            <th>Vence</th>
          </tr>
        </thead>
        <tbody>
          ${state.supplies.map(renderSupplyRow).join('')}
        </tbody>
      </table>
    </div>
  `;
  section.querySelectorAll('[data-min-supply]').forEach((input) => {
    input.addEventListener('change', () => {
      updateMinimum('supplies', input.dataset.minSupply, input.value);
    });
  });
}

function renderProducts() {
  const section = document.querySelector('#products');
  section.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Categoria</th>
            <th>Stock</th>
            <th>Minimo</th>
            <th>Costo unit.</th>
            <th>Precio</th>
            <th>Margen</th>
          </tr>
        </thead>
        <tbody>
          ${state.products.map(renderProductRow).join('')}
        </tbody>
      </table>
    </div>
  `;
  section.querySelectorAll('[data-min-product]').forEach((input) => {
    input.addEventListener('change', () => {
      updateMinimum('products', input.dataset.minProduct, input.value);
    });
  });
}

function renderRecipes() {
  const section = document.querySelector('#recipes');
  section.innerHTML = `
    <div class="recipe-grid">
      ${state.recipes
        .map((recipe) => {
          const product = findProduct(recipe.productId);
          return `
            <article class="recipe-card">
              <div>
                <p class="eyebrow">Rinde ${recipe.yield} ${product?.unit || 'un'}</p>
                <h2>${product?.name || 'Producto sin nombre'}</h2>
              </div>
              <ul>
                ${recipe.ingredients
                  .map((ingredient) => {
                    const supply = findSupply(ingredient.supplyId);
                    return `<li><span>${supply?.name || 'Insumo'}</span><strong>${ingredient.quantity} ${supply?.unit || ''}</strong></li>`;
                  })
                  .join('')}
              </ul>
              <p>${recipe.notes}</p>
            </article>
          `;
        })
        .join('')}
    </div>
  `;
}

function renderProduction() {
  const section = document.querySelector('#production');
  section.innerHTML = `
    <div class="split-layout">
      <form class="panel form-panel" id="productionForm">
        <h2>Registrar produccion</h2>
        <label>Producto
          <select name="productId" required>
            ${state.products.map((product) => option(product.id, product.name)).join('')}
          </select>
        </label>
        <label>Cantidad producida
          <input name="quantityProduced" type="number" min="1" step="1" required />
        </label>
        <label>Fecha
          <input name="date" type="date" value="${today}" required />
        </label>
        <label>Lote
          <input name="lot" placeholder="Ej. JL-0610" />
        </label>
        <label>Vencimiento
          <input name="expiresAt" type="date" />
        </label>
        <label>Mano de obra directa
          <input name="laborCost" type="number" min="0" step="100" value="0" />
        </label>
        <button type="submit">Crear lote</button>
        <p class="form-note">Si el producto tiene receta, se consumen insumos proporcionalmente al rendimiento.</p>
      </form>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Costo lote</th>
              <th>Costo unit.</th>
            </tr>
          </thead>
          <tbody>${state.productions.map(renderProductionRow).join('')}</tbody>
        </table>
      </div>
    </div>
  `;
  section.querySelector('#productionForm').addEventListener('submit', handleProductionSubmit);
}

function renderPurchases() {
  const section = document.querySelector('#purchases');
  section.innerHTML = `
    <div class="split-layout">
      <form class="panel form-panel" id="purchaseForm">
        <h2>Registrar compra</h2>
        <label>Insumo
          <select name="supplyId" required>
            ${state.supplies.map((supply) => option(supply.id, supply.name)).join('')}
          </select>
        </label>
        <label>Proveedor
          <input name="supplier" placeholder="Nombre proveedor" required />
        </label>
        <label>Fecha
          <input name="date" type="date" value="${today}" required />
        </label>
        <label>Cantidad
          <input name="quantity" type="number" min="0.01" step="0.01" required />
        </label>
        <label>Costo total
          <input name="totalCost" type="number" min="0" step="100" required />
        </label>
        <label>Lote
          <input name="lot" placeholder="Opcional" />
        </label>
        <label>Vencimiento
          <input name="expiresAt" type="date" />
        </label>
        <button type="submit">Guardar compra</button>
      </form>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Insumo</th>
              <th>Proveedor</th>
              <th>Cantidad</th>
              <th>Costo</th>
            </tr>
          </thead>
          <tbody>${state.purchases.map(renderPurchaseRow).join('')}</tbody>
        </table>
      </div>
    </div>
  `;
  section.querySelector('#purchaseForm').addEventListener('submit', handlePurchaseSubmit);
}

function renderExpenses() {
  const monthKey = today.slice(0, 7);
  const total = state.expenses
    .filter((expense) => expense.date.startsWith(monthKey))
    .reduce((sum, expense) => sum + Number(expense.amount), 0);
  const section = document.querySelector('#expenses');
  section.innerHTML = `
    <div class="split-layout">
      <form class="panel form-panel" id="expenseForm">
        <h2>Registrar gasto</h2>
        <label>Categoria
          <select name="category" required>
            ${['Servicios', 'Transporte', 'Herramientas', 'Publicidad', 'Empaques indirectos', 'Otros']
              .map((item) => option(item, item))
              .join('')}
          </select>
        </label>
        <label>Descripcion
          <input name="description" placeholder="Detalle corto" required />
        </label>
        <label>Fecha
          <input name="date" type="date" value="${today}" required />
        </label>
        <label>Monto
          <input name="amount" type="number" min="0" step="100" required />
        </label>
        <button type="submit">Guardar gasto</button>
      </form>

      <article class="panel">
        <div class="panel-head">
          <h2>Gastos ${monthKey}</h2>
          <span>${formatCurrency(total)}</span>
        </div>
        <div class="table-wrap flat">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Categoria</th>
                <th>Descripcion</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>${state.expenses.map(renderExpenseRow).join('')}</tbody>
          </table>
        </div>
      </article>
    </div>
  `;
  section.querySelector('#expenseForm').addEventListener('submit', handleExpenseSubmit);
}

function handlePurchaseSubmit(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  state = addSupplyPurchase(state, {
    id: makeId('compra'),
    supplyId: data.supplyId,
    supplier: data.supplier.trim(),
    date: data.date,
    quantity: Number(data.quantity),
    totalCost: Number(data.totalCost),
    lot: data.lot.trim(),
    expiresAt: data.expiresAt,
  });
  event.currentTarget.reset();
  persistAndRender('Compra registrada');
}

function handleProductionSubmit(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const productId = data.productId;
  const recipe = state.recipes.find((item) => item.productId === productId);
  const multiplier = recipe ? Number(data.quantityProduced) / Number(recipe.yield) : 0;
  const consumptions = recipe
    ? recipe.ingredients.map((ingredient) => ({
        supplyId: ingredient.supplyId,
        quantity: Number((ingredient.quantity * multiplier).toFixed(4)),
      }))
    : [];

  try {
    state = registerProduction(state, {
      id: makeId('prod'),
      productId,
      date: data.date,
      quantityProduced: Number(data.quantityProduced),
      lot: data.lot.trim(),
      expiresAt: data.expiresAt,
      laborCost: Number(data.laborCost || 0),
      consumptions,
    });
    event.currentTarget.reset();
    persistAndRender('Produccion registrada');
  } catch (error) {
    showToast(error.message);
  }
}

function handleExpenseSubmit(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  state = {
    ...state,
    expenses: [
      {
        id: makeId('gasto'),
        category: data.category,
        description: data.description.trim(),
        date: data.date,
        amount: Number(data.amount),
      },
      ...state.expenses,
    ],
  };
  event.currentTarget.reset();
  persistAndRender('Gasto registrado');
}

function updateMinimum(collection, id, value) {
  state = {
    ...state,
    [collection]: state[collection].map((item) =>
      item.id === id ? { ...item, minStock: Number(value) } : item,
    ),
  };
  persistAndRender('Minimo actualizado');
}

function persistAndRender(message) {
  saveState(state);
  render();
  showToast(message);
}

function metricCard(label, value, detail) {
  return `
    <article class="metric-card">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${detail}</small>
    </article>
  `;
}

function renderAlertList(items) {
  if (!items.length) return '<p class="empty">Sin alertas de stock.</p>';
  return `
    <ul class="alert-list">
      ${items
        .map(
          (item) => `
            <li>
              <strong>${item.name}</strong>
              <span>${item.type} | ${item.stock} ${item.unit || ''} / min. ${item.minStock}</span>
            </li>
          `,
        )
        .join('')}
    </ul>
  `;
}

function renderExpirationList(items) {
  if (!items.length) return '<p class="empty">Sin vencimientos proximos.</p>';
  return `
    <ul class="alert-list">
      ${items
        .map(
          (item) => `
            <li>
              <strong>${item.name}</strong>
              <span>Lote ${item.lot || 'sin lote'} | vence ${item.expiresAt}</span>
            </li>
          `,
        )
        .join('')}
    </ul>
  `;
}

function renderMarginTable(products) {
  return `
    <div class="table-wrap flat">
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Costo</th>
            <th>Precio</th>
            <th>Margen</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          ${products
            .map(
              (product) => `
                <tr>
                  <td>${product.name}</td>
                  <td>${formatCurrency(product.unitCost)}</td>
                  <td>${formatCurrency(product.price)}</td>
                  <td>${formatCurrency(product.margin)}</td>
                  <td>${product.marginPercent}%</td>
                </tr>
              `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderSupplyRow(supply) {
  const low = Number(supply.stock) <= Number(supply.minStock);
  return `
    <tr class="${low ? 'is-low' : ''}">
      <td><strong>${supply.name}</strong></td>
      <td>${supply.category}</td>
      <td>${supply.stock} ${supply.unit}</td>
      <td><input class="mini-input" data-min-supply="${supply.id}" type="number" value="${supply.minStock}" /></td>
      <td>${formatCurrency(supply.averageCost)} / ${supply.unit}</td>
      <td>${supply.lot || '-'}</td>
      <td>${supply.expiresAt || '-'}</td>
    </tr>
  `;
}

function renderProductRow(product) {
  const low = Number(product.stock) <= Number(product.minStock);
  const margin = Number(product.price || 0) - Number(product.unitCost || 0);
  return `
    <tr class="${low ? 'is-low' : ''}">
      <td><strong>${product.name}</strong></td>
      <td>${product.category}</td>
      <td>${product.stock} ${product.unit}</td>
      <td><input class="mini-input" data-min-product="${product.id}" type="number" value="${product.minStock}" /></td>
      <td>${formatCurrency(product.unitCost)}</td>
      <td>${formatCurrency(product.price)}</td>
      <td>${formatCurrency(margin)}</td>
    </tr>
  `;
}

function renderProductionRow(production) {
  const product = findProduct(production.productId);
  return `
    <tr>
      <td>${production.date}</td>
      <td>${product?.name || production.productId}</td>
      <td>${production.quantityProduced} ${product?.unit || ''}</td>
      <td>${formatCurrency(production.totalCost)}</td>
      <td>${formatCurrency(production.unitCost)}</td>
    </tr>
  `;
}

function renderPurchaseRow(purchase) {
  const supply = findSupply(purchase.supplyId);
  return `
    <tr>
      <td>${purchase.date}</td>
      <td>${supply?.name || purchase.supplyId}</td>
      <td>${purchase.supplier}</td>
      <td>${purchase.quantity} ${supply?.unit || ''}</td>
      <td>${formatCurrency(purchase.totalCost)}</td>
    </tr>
  `;
}

function renderExpenseRow(expense) {
  return `
    <tr>
      <td>${expense.date}</td>
      <td>${expense.category}</td>
      <td>${expense.description}</td>
      <td>${formatCurrency(expense.amount)}</td>
    </tr>
  `;
}

function option(value, label) {
  return `<option value="${value}">${label}</option>`;
}

function findSupply(id) {
  return state.supplies.find((supply) => supply.id === id);
}

function findProduct(id) {
  return state.products.find((product) => product.id === id);
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('visible'), 2200);
}
