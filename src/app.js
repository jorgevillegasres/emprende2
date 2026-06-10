import {
  addSupplyPurchase,
  calculateDashboardMetrics,
  formatCurrency,
  makeId,
  registerProduction,
  registerSale,
  toDateKey,
} from './domain.js';
import { loadState, resetState, saveState } from './storage.js';

const today = toDateKey(new Date());
let state = loadState();
let currentView = 'dashboard';

const viewTitles = {
  dashboard: 'Tu negocio este mes',
  supplies: 'Inventario de insumos',
  products: 'Productos terminados',
  recipes: 'Recetas y formulaciones',
  production: 'Produccion por lotes',
  purchases: 'Compras de insumos',
  sales: 'Ventas simples',
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
document.querySelector('#quickSaleButton').addEventListener('click', () => setView('sales'));

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
  renderSales();
  renderExpenses();
}

function renderDashboard() {
  const metrics = calculateDashboardMetrics(state, today);
  const section = document.querySelector('#dashboard');
  section.innerHTML = `
    <div class="hero-grid">
      <article class="card score-card">
        <div class="card-head">
          <h2>Salud del negocio</h2>
          <span>${getHealthLabel(metrics.businessHealthScore)}</span>
        </div>
        ${renderHealthGauge(metrics.businessHealthScore)}
        <p>${renderHealthInsight(metrics)}</p>
      </article>

      <article class="card decisions-card">
        <div class="decisions-head">
          <div>
            <h2>Tus 3 decisiones de esta semana</h2>
            <p>${renderBusinessNarrative(metrics)}</p>
          </div>
          <span class="week-chip">${getWeekRangeLabel(today)}</span>
        </div>
        ${renderDecisionCards(metrics.growthActions)}
      </article>
    </div>

    <div class="section-title">Tu negocio este mes <span>corte al ${formatShortDate(today)}</span></div>
    <div class="metric-grid">
      ${metricCard('Ventas del mes', formatCurrency(metrics.monthlyRevenue), `${getTotalUnitsSold()} unidades vendidas`, 'accent-blue', '2 hoy')}
      ${metricCard('Utilidad bruta', formatCurrency(metrics.monthlyGrossProfit), 'Lo que queda despues del costo de producto', 'accent-green', `${metrics.averageMarginPercent}%`)}
      ${metricCard('Margen promedio', `${metrics.averageMarginPercent}%`, 'Tus precios estan mostrando su fuerza', 'accent-green', 'bien')}
      ${metricCard('Inventario valorizado', formatCurrency(metrics.totalInventoryValue), `${formatCurrency(metrics.supplyInventoryValue)} en insumos`, 'accent-violet')}
      ${metricCard('Gastos del mes', formatCurrency(metrics.monthlyExpenses), 'Operacion registrada este mes', 'accent-gold', 'vigilar')}
      ${metricCard('Resultado operativo', formatCurrency(metrics.netAfterExpenses), 'Utilidad bruta menos gastos', 'accent-coral', metrics.netAfterExpenses >= 0 ? 'positivo' : 'en rojo')}
    </div>

    <div class="section-title">Como se mueve la plata <span>simple, sin contabilidad pesada</span></div>
    <div class="dashboard-grid">
      <article class="panel chart-panel cash-chart">
        <div class="panel-head">
          <h2>Ventas por semana</h2>
          <span>${getBestWeekLabel(metrics.weeklyRevenue)}</span>
        </div>
        ${renderWeeklyRevenueChart(metrics.weeklyRevenue)}
      </article>

      <article class="panel chart-panel">
        <div class="panel-head">
          <h2>En que se va el gasto</h2>
          <span>${formatCurrency(metrics.monthlyExpenses)}</span>
        </div>
        ${renderExpenseBars(metrics.expensesByCategory)}
      </article>

      <article class="panel">
        <div class="panel-head">
          <h2>Lo que mas deja margen</h2>
          <span>Ranking</span>
        </div>
        ${renderTopProducts(metrics.topProductsByRevenue)}
      </article>

      <article class="panel">
        <div class="panel-head">
          <h2>Ojo con esto</h2>
          <span>${metrics.lowStockItems.length} alertas</span>
        </div>
        ${renderAlertList(metrics.lowStockItems)}
      </article>

      <article class="panel">
        <div class="panel-head">
          <h2>Acciones rapidas</h2>
          <span>Hoy</span>
        </div>
        <div class="quick-actions">
          <button type="button" data-jump="purchases">Registrar compra</button>
          <button type="button" data-jump="production">Planear produccion</button>
          <button type="button" data-jump="sales">Registrar venta</button>
          <button type="button" data-jump="expenses">Registrar gasto</button>
        </div>
      </article>

      <article class="panel">
        <div class="panel-head">
          <h2>Ventas recientes</h2>
          <span>${(state.sales || []).length}</span>
        </div>
        ${renderRecentSales()}
      </article>

      <article class="panel wide">
        <div class="panel-head">
          <h2>Margen estimado</h2>
          <span>Precio - costo</span>
        </div>
        ${renderMarginTable(metrics.marginLeaders)}
      </article>
    </div>
  `;
  section.querySelectorAll('[data-jump]').forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.jump));
  });
}
function renderSales() {
  const section = document.querySelector('#sales');
  section.innerHTML = `
    <div class="split-layout">
      <form class="panel form-panel" id="saleForm">
        <h2>Registrar venta</h2>
        <label>Producto
          <select name="productId" required>
            ${state.products.map((product) => option(product.id, `${product.name} | stock ${product.stock}`)).join('')}
          </select>
        </label>
        <label>Cantidad
          <input name="quantity" type="number" min="1" step="1" required />
        </label>
        <label>Precio unitario
          <input name="unitPrice" type="number" min="0" step="100" required />
        </label>
        <label>Canal
          <select name="channel" required>
            ${['Feria local', 'Instagram', 'WhatsApp', 'Tienda aliada', 'Otro'].map((item) => option(item, item)).join('')}
          </select>
        </label>
        <label>Fecha
          <input name="date" type="date" value="${today}" required />
        </label>
        <label>Nota
          <input name="note" placeholder="Opcional" />
        </label>
        <button type="submit">Guardar venta</button>
        <p class="form-note">La venta descuenta producto terminado y calcula utilidad con el costo unitario actual.</p>
      </form>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Canal</th>
              <th>Cantidad</th>
              <th>Ingreso</th>
              <th>Utilidad</th>
            </tr>
          </thead>
          <tbody>${(state.sales || []).map(renderSaleRow).join('')}</tbody>
        </table>
      </div>
    </div>
  `;

  const form = section.querySelector('#saleForm');
  const productSelect = form.elements.productId;
  const priceInput = form.elements.unitPrice;
  productSelect.addEventListener('change', () => {
    priceInput.value = findProduct(productSelect.value)?.price || 0;
  });
  priceInput.value = findProduct(productSelect.value)?.price || 0;
  form.addEventListener('submit', handleSaleSubmit);
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

function handleSaleSubmit(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));

  try {
    state = registerSale(state, {
      id: makeId('venta'),
      productId: data.productId,
      date: data.date,
      quantity: Number(data.quantity),
      unitPrice: Number(data.unitPrice),
      channel: data.channel,
      note: data.note.trim(),
    });
    event.currentTarget.reset();
    persistAndRender('Venta registrada');
  } catch (error) {
    showToast(error.message);
  }
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

function metricCard(label, value, detail, accent = '', chip = '') {
  return `
    <article class="metric-card ${accent}">
      <div class="metric-label">
        <span>${label}</span>
        ${chip ? `<em>${chip}</em>` : ''}
      </div>
      <strong>${value}</strong>
      <small>${detail}</small>
    </article>
  `;
}

function renderHealthGauge(score) {
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;
  return `
    <div class="gauge" aria-label="Score de salud ${score} de 100">
      <svg viewBox="0 0 160 160" role="img">
        <defs>
          <linearGradient id="scoreGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#0EA866" />
            <stop offset="100%" stop-color="#F0573E" />
          </linearGradient>
        </defs>
        <circle class="gauge-track" cx="80" cy="80" r="${radius}" fill="none" stroke-width="16" />
        <circle class="gauge-fill" cx="80" cy="80" r="${radius}" fill="none" stroke-width="16" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" />
      </svg>
      <div class="gauge-value">
        <strong>${score}</strong>
        <span>de 100</span>
      </div>
    </div>
  `;
}

function renderHealthInsight(metrics) {
  const salesTarget = Math.max(0, metrics.monthlyExpenses - metrics.monthlyGrossProfit);
  if (metrics.netAfterExpenses >= 0) {
    return `Tus ventas cubren gastos y dejan utilidad. Mantén el foco en productos de alto margen.`;
  }
  return `Tus margenes son sanos (${metrics.averageMarginPercent}% promedio), pero necesitas cubrir ${formatCurrency(salesTarget)} para equilibrar el mes.`;
}

function renderBusinessNarrative(metrics) {
  const multiplier =
    metrics.monthlyGrossProfit <= 0
      ? 0
      : Math.max(1, Math.ceil(metrics.monthlyExpenses / metrics.monthlyGrossProfit));
  return `Vendiste <b>${formatCurrency(metrics.monthlyRevenue)}</b> con margen de ${metrics.averageMarginPercent}%, pero tus gastos del mes (${formatCurrency(metrics.monthlyExpenses)}) piden atencion. Para cubrirlos necesitas sostener cerca de <b>${multiplier}x</b> tu ritmo actual.`;
}

function renderDecisionCards(actions) {
  if (!actions.length) return '<p class="empty">Registra ventas y costos para recibir decisiones accionables.</p>';
  return `
    <div class="decision-list">
      ${actions
        .slice(0, 3)
        .map((action) => {
          const isProductionAction = action.title.toLowerCase().includes('programa');
          const label = isProductionAction
            ? 'Producir'
            : action.tone === 'warning'
              ? 'Comprar'
              : action.tone === 'focus'
                ? 'Revisar'
                : 'Producir';
          const target = isProductionAction
            ? 'production'
            : action.tone === 'warning'
              ? 'purchases'
              : action.tone === 'focus'
                ? 'products'
                : 'production';
          return `
            <article class="decision d-${action.tone}">
              <span>${label}</span>
              <strong>${action.title}</strong>
              <p>${action.detail}</p>
              <button type="button" data-jump="${target}">Actuar ahora</button>
            </article>
          `;
        })
        .join('')}
    </div>
  `;
}

function renderWeeklyRevenueChart(weeks) {
  const max = Math.max(1, ...weeks.map((week) => Number(week.revenue || 0)));
  return `
    <div class="bar-chart weekly-chart">
      ${weeks
        .map(
          (week) => `
            <div class="bar-column">
              <div class="bar-track">
                <span style="height: ${Math.max(6, (week.revenue / max) * 100)}%"></span>
              </div>
              <strong>${formatCurrency(week.revenue)}</strong>
              <small>${week.label}</small>
            </div>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderExpenseBars(expenses) {
  if (!expenses.length) return '<p class="empty">Sin gastos registrados este mes.</p>';
  const max = Math.max(1, ...expenses.map((expense) => Number(expense.amount || 0)));
  return `
    <div class="expense-bars">
      ${expenses
        .map(
          (expense) => `
            <div class="expense-bar">
              <div>
                <strong>${expense.category}</strong>
                <span>${formatCurrency(expense.amount)}</span>
              </div>
              <i style="width: ${Math.max(8, (expense.amount / max) * 100)}%"></i>
            </div>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderGrowthActions(actions) {
  if (!actions.length) return '<p class="empty">Registra ventas y costos para recibir recomendaciones.</p>';
  return `
    <ul class="action-list">
      ${actions
        .map(
          (action) => `
            <li class="${action.tone}">
              <strong>${action.title}</strong>
              <span>${action.detail}</span>
            </li>
          `,
        )
        .join('')}
    </ul>
  `;
}

function renderTopProducts(products) {
  if (!products.length) return '<p class="empty">Sin ventas registradas este mes.</p>';
  return `
    <div class="top-products">
      ${products
        .map(
          (product, index) => `
            <div>
              <span>${index + 1}</span>
              <strong>${product.name}</strong>
              <small>${product.quantity} un | ${formatCurrency(product.revenue)}</small>
            </div>
          `,
        )
        .join('')}
    </div>
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

function renderRecentSales() {
  const sales = (state.sales || []).slice(0, 5);
  if (!sales.length) return '<p class="empty">Sin ventas registradas.</p>';
  return `
    <ul class="alert-list sales-list">
      ${sales
        .map((sale) => {
          const product = findProduct(sale.productId);
          return `
            <li>
              <strong>${product?.name || sale.productId}</strong>
              <span>${sale.quantity} un | ${sale.channel} | ${formatCurrency(sale.revenue)}</span>
            </li>
          `;
        })
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

function renderSaleRow(sale) {
  const product = findProduct(sale.productId);
  return `
    <tr>
      <td>${sale.date}</td>
      <td>${product?.name || sale.productId}</td>
      <td>${sale.channel}</td>
      <td>${sale.quantity} ${product?.unit || 'un'}</td>
      <td>${formatCurrency(sale.revenue)}</td>
      <td>${formatCurrency(sale.grossProfit)}</td>
    </tr>
  `;
}

function option(value, label) {
  return `<option value="${value}">${label}</option>`;
}

function getHealthLabel(score) {
  if (score >= 80) return 'Negocio en expansion';
  if (score >= 60) return 'Buen pulso, ajusta focos';
  if (score >= 40) return 'Necesita atencion';
  return 'Prioriza margen y stock';
}

function getWeekRangeLabel(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`);
  const day = date.getDate();
  const start = day - ((date.getDay() + 6) % 7);
  const end = start + 6;
  return `Semana del ${Math.max(1, start)} al ${Math.max(1, end)}`;
}

function formatShortDate(dateKey) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${dateKey}T00:00:00`));
}

function getTotalUnitsSold() {
  return (state.sales || []).reduce((sum, sale) => sum + Number(sale.quantity || 0), 0);
}

function getBestWeekLabel(weeks) {
  const best = [...weeks].sort((a, b) => b.revenue - a.revenue)[0];
  if (!best || best.revenue === 0) return 'Aun sin ventas';
  return `${best.label} fue la mejor`;
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
