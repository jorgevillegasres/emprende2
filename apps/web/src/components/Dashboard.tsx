import type { DashboardMetrics } from "../api/client";

const toneLabels: Record<string, string> = {
  growth: "Crecer",
  warning: "Resolver",
  focus: "Afinar"
};

function money(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

export function Dashboard({ metrics }: { metrics: DashboardMetrics }) {
  const score = metrics.businessHealthScore ?? getScore(metrics);
  const circumference = 389.56;
  const offset = circumference - (score / 100) * circumference;
  const weeklyMax = Math.max(...metrics.weeklyRevenue.map((week) => week.revenue), 1);
  const expenseMax = Math.max(...metrics.expensesByCategory.map((expense) => expense.amount), 1);

  return (
    <main>
      <section className="hero-grid">
        <article className="card score-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">Pulso operativo</p>
              <h1>Salud del negocio</h1>
            </div>
            <span className="status-chip">En marcha</span>
          </div>
          <div className="gauge">
            <svg viewBox="0 0 160 160" aria-hidden="true">
              <circle className="gauge-track" cx="80" cy="80" r="62" fill="none" strokeWidth="16" />
              <circle className="gauge-fill" cx="80" cy="80" r="62" fill="none" strokeWidth="16" strokeDasharray={circumference} strokeDashoffset={offset} />
            </svg>
            <div className="gauge-value">
              <strong>{score}</strong>
              <span>de 100</span>
            </div>
          </div>
          <p className="score-note">Margen, caja operativa, inventario y foco comercial en una sola lectura.</p>
        </article>

        <article className="card decisions-card">
          <div className="decisions-head">
            <div>
              <p className="eyebrow">Prioridades</p>
              <h2>Tus 3 decisiones de esta semana</h2>
              <p>
                Ventas por <b>{money(metrics.monthlyRevenue)}</b> con margen promedio de <b>{metrics.averageMarginPercent}%</b>.
              </p>
            </div>
          </div>
          <div className="decision-list">
            {metrics.growthActions.slice(0, 3).map((action) => (
              <article className={`decision d-${action.tone}`} key={action.title}>
                <span>{toneLabels[action.tone] ?? "Actuar"}</span>
                <strong>{action.title}</strong>
                <p>{action.detail}</p>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="metric-grid" aria-label="Indicadores principales">
        <Metric label="Ventas del mes" value={money(metrics.monthlyRevenue)} detail="Ingresos registrados" accent="blue" />
        <Metric label="Utilidad bruta" value={money(metrics.monthlyGrossProfit)} detail={`${metrics.averageMarginPercent}% margen`} accent="green" />
        <Metric label="Inventario valorizado" value={money(metrics.totalInventoryValue)} detail="Insumos + productos" accent="yellow" />
        <Metric label="Gastos del mes" value={money(metrics.monthlyExpenses)} detail="Operacion registrada" accent="coral" />
        <Metric label="Resultado operativo" value={money(metrics.netAfterExpenses)} detail="Utilidad menos gastos" accent="ink" />
      </section>

      <section className="analytics-grid">
        <article className="card chart-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">Ritmo comercial</p>
              <h2>Ventas por semana</h2>
            </div>
          </div>
          <div className="bar-chart">
            {metrics.weeklyRevenue.map((week) => (
              <div className="bar-row" key={week.label}>
                <span>{week.label}</span>
                <div className="bar-track">
                  <span className="bar-fill" style={{ width: `${Math.max((week.revenue / weeklyMax) * 100, week.revenue > 0 ? 8 : 0)}%` }} />
                </div>
                <strong>{money(week.revenue)}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="card chart-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">Control de gastos</p>
              <h2>Mayores categorias</h2>
            </div>
          </div>
          <div className="expense-list">
            {metrics.expensesByCategory.map((expense) => (
              <div className="expense-row" key={expense.category}>
                <div>
                  <strong>{expense.category}</strong>
                  <span>{money(expense.amount)}</span>
                </div>
                <div className="bar-track">
                  <span className="bar-fill expense-fill" style={{ width: `${(expense.amount / expenseMax) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="card list-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">Inventario</p>
              <h2>Alertas de stock</h2>
            </div>
          </div>
          <div className="stock-list">
            {metrics.lowStockItems.slice(0, 5).map((item) => (
              <div className="stock-row" key={`${item.type}-${item.name}`}>
                <span>{item.type}</span>
                <strong>{item.name}</strong>
                <small>
                  {item.stock} / min. {item.minStock} {item.unit ?? ""}
                </small>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

function Metric({ label, value, detail, accent }: { label: string; value: string; detail: string; accent: string }) {
  return (
    <article className={`metric-card accent-${accent}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function getScore(metrics: DashboardMetrics) {
  const marginScore = Math.min(metrics.averageMarginPercent, 70);
  const inventoryPenalty = Math.min(metrics.lowStockItems.length * 5, 20);
  const cashScore = metrics.netAfterExpenses > 0 ? 20 : 8;
  return Math.max(35, Math.round(marginScore + cashScore - inventoryPenalty));
}
