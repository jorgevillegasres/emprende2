import { useEffect, useMemo, useState } from "react";
import { createDecision, listDecisions, updateDecisionStatus, type DashboardMetrics, type DecisionRecord } from "../api/client";
import type { AppSection } from "./Shell";
import { isNewBusiness, onboardingSteps } from "./onboarding";

const toneLabels: Record<string, string> = {
  growth: "Crecer",
  warning: "Resolver",
  focus: "Afinar"
};

const statusLabels: Record<DecisionRecord["status"], string> = {
  open: "Abiertas",
  done: "Hechas",
  dismissed: "Descartadas"
};

function money(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

export function Dashboard({ metrics, onSectionChange, token }: { metrics: DashboardMetrics; onSectionChange?: (section: AppSection) => void; token: string }) {
  const [targetMargin, setTargetMargin] = useState(60);
  const [selectedProductName, setSelectedProductName] = useState(metrics.priceScenarios[0]?.name ?? "");
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [decisionOwner, setDecisionOwner] = useState("owner");
  const [decisionStatusFilter, setDecisionStatusFilter] = useState<DecisionRecord["status"]>("open");
  const [decisionMessage, setDecisionMessage] = useState("");
  const [isSavingDecision, setIsSavingDecision] = useState(false);
  const score = metrics.businessHealthScore ?? getScore(metrics);
  const circumference = 389.56;
  const offset = circumference - (score / 100) * circumference;
  const weeklyMax = Math.max(...metrics.weeklyRevenue.map((week) => week.revenue), 1);
  const expenseMax = Math.max(...metrics.expensesByCategory.map((expense) => expense.amount), 1);
  const profitMax = Math.max(...metrics.productProfitability.map((product) => product.grossProfit), 1);
  const selectedScenario = metrics.priceScenarios.find((scenario) => scenario.name === selectedProductName) ?? metrics.priceScenarios[0];
  const simulatedScenario = useMemo(
    () => (selectedScenario ? calculateScenario(selectedScenario.name, selectedScenario.currentPrice, selectedScenario.unitCost, targetMargin) : null),
    [selectedScenario, targetMargin]
  );
  const decisionCounts = {
    open: decisions.filter((decision) => decision.status === "open").length,
    done: decisions.filter((decision) => decision.status === "done").length,
    dismissed: decisions.filter((decision) => decision.status === "dismissed").length
  };
  const filteredDecisions = decisions.filter((decision) => decision.status === decisionStatusFilter);

  useEffect(() => {
    listDecisions(token)
      .then(setDecisions)
      .catch(() => setDecisionMessage("No pudimos cargar tus decisiones."));
  }, [token]);

  async function handleSaveDecision() {
    if (!simulatedScenario) return;
    setIsSavingDecision(true);
    setDecisionMessage("");
    try {
      const created = await createDecision(
        {
          title: `${simulatedScenario.recommendation.title}: ${simulatedScenario.name}`,
          detail: simulatedScenario.recommendation.detail,
          source: "pricing",
          priority: simulatedScenario.recommendation.action === "maintain" ? "low" : "high",
          owner: decisionOwner.trim() || "owner"
        },
        token
      );
      setDecisions((current) => [created, ...current]);
      setDecisionMessage("Decision guardada.");
    } catch {
      setDecisionMessage("No pudimos guardar la decision.");
    } finally {
      setIsSavingDecision(false);
    }
  }

  async function handleCompleteDecision(id: string) {
    try {
      const updated = await updateDecisionStatus(id, "done", token);
      setDecisions((current) => current.map((decision) => (decision.id === id ? updated : decision)));
    } catch {
      setDecisionMessage("No pudimos actualizar la decision.");
    }
  }

  return (
    <main>
      {isNewBusiness(metrics) ? <OnboardingPanel onSectionChange={onSectionChange} /> : null}

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
        <article className="card pricing-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">Precios</p>
              <h2>Simulador de margen</h2>
            </div>
          </div>
          {simulatedScenario ? (
            <div className="pricing-simulator">
              <label>
                Producto
                <select value={selectedScenario?.name ?? ""} onChange={(event) => setSelectedProductName(event.target.value)}>
                  {metrics.priceScenarios.map((scenario) => (
                    <option key={scenario.name} value={scenario.name}>
                      {scenario.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="range-label">
                <span>
                  Margen objetivo
                  <b>{targetMargin}%</b>
                </span>
                <input min="35" max="80" onChange={(event) => setTargetMargin(Number(event.target.value))} type="range" value={targetMargin} />
              </label>
              <div className="pricing-result">
                <span>Precio sugerido</span>
                <strong>{money(simulatedScenario.suggestedPrice)}</strong>
                <small className={simulatedScenario.priceDelta >= 0 ? "delta-up" : "delta-down"}>
                  {simulatedScenario.priceDelta >= 0 ? "+" : ""}
                  {money(simulatedScenario.priceDelta)} vs. precio actual
                </small>
              </div>
              <div className="pricing-kpis">
                <span>
                  <b>{money(simulatedScenario.currentPrice)}</b>
                  Actual
                </span>
                <span>
                  <b>{money(simulatedScenario.unitCost)}</b>
                  Costo
                </span>
                <span>
                  <b>{money(simulatedScenario.suggestedUnitProfit)}</b>
                  Utilidad/un
                </span>
              </div>
              <div className={`pricing-advice advice-${simulatedScenario.recommendation.tone}`}>
                <span>{simulatedScenario.recommendation.title}</span>
                <p>{simulatedScenario.recommendation.detail}</p>
              </div>
              <label>
                Responsable
                <input maxLength={80} onChange={(event) => setDecisionOwner(event.target.value)} type="text" value={decisionOwner} />
              </label>
              <button className="secondary-action inline-decision-action" disabled={isSavingDecision} onClick={handleSaveDecision} type="button">
                {isSavingDecision ? "Guardando..." : "Guardar decision"}
              </button>
              {decisionMessage ? <p className="decision-message">{decisionMessage}</p> : null}
            </div>
          ) : (
            <p className="empty-note">Crea productos con costo y precio para simular margen.</p>
          )}
        </article>

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

        <article className="card profitability-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">Rentabilidad</p>
              <h2>Productos que mas dejan</h2>
            </div>
          </div>
          <div className="profitability-list">
            {metrics.productProfitability.length > 0 ? (
              metrics.productProfitability.map((product) => (
                <div className="profitability-row" key={product.productId}>
                  <div className="profitability-copy">
                    <strong>{product.name}</strong>
                    <span>
                      {product.marginPercent}% margen - {money(product.unitProfit)} por unidad
                    </span>
                  </div>
                  <div className="profitability-numbers">
                    <strong>{money(product.grossProfit)}</strong>
                    <span>{money(product.revenue)} ventas</span>
                  </div>
                  <div className="bar-track">
                    <span className="bar-fill profit-fill" style={{ width: `${Math.max((product.grossProfit / profitMax) * 100, 8)}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-note">Registra ventas para ver margen, utilidad y productos lideres.</p>
            )}
          </div>
        </article>

        <article className="card list-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">Decisiones</p>
              <h2>Acciones abiertas</h2>
            </div>
          </div>
          <div className="decision-status-tabs" aria-label="Filtrar decisiones por estado">
            {(["open", "done", "dismissed"] as const).map((status) => (
              <button className={decisionStatusFilter === status ? "active" : ""} key={status} onClick={() => setDecisionStatusFilter(status)} type="button">
                {statusLabels[status]} <b>{decisionCounts[status]}</b>
              </button>
            ))}
          </div>
          <div className="decision-task-list">
            {filteredDecisions.length > 0 ? (
              filteredDecisions.slice(0, 4).map((decision) => (
                <div className="decision-task-row" key={decision.id}>
                  <div>
                    <span>{decision.priority}</span>
                    <strong>{decision.title}</strong>
                    <small>{decision.detail}</small>
                    <em>{decision.owner || "Sin responsable"}</em>
                  </div>
                  {decision.status === "open" ? <button onClick={() => void handleCompleteDecision(decision.id)} type="button">Hecha</button> : null}
                </div>
              ))
            ) : (
              <p className="empty-note">No hay decisiones en este estado.</p>
            )}
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

function OnboardingPanel({ onSectionChange }: { onSectionChange?: (section: AppSection) => void }) {
  return (
    <section className="onboarding-band">
      <div className="onboarding-copy">
        <p className="eyebrow">Primeras 3 cargas</p>
        <h1>Convierte tu espacio en un tablero con datos reales</h1>
        <p>Empieza por lo minimo: productos, insumos y gastos. Con eso Emprendedos ya puede mostrar margen, stock y resultado operativo.</p>
      </div>
      <div className="onboarding-steps">
        {onboardingSteps.map((step, index) => (
          <button className="onboarding-step" key={step.section} onClick={() => onSectionChange?.(step.section)} type="button">
            <span>{index + 1}</span>
            <strong>{step.title}</strong>
            <small>{step.detail}</small>
          </button>
        ))}
      </div>
    </section>
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

function calculateScenario(name: string, currentPrice: number, unitCost: number, targetMarginPercent: number) {
  const targetRatio = targetMarginPercent / 100;
  const suggestedPrice = targetRatio >= 1 || targetRatio < 0 ? 0 : round(unitCost / (1 - targetRatio));
  const priceDelta = round(suggestedPrice - currentPrice);
  return {
    name,
    currentPrice,
    unitCost,
    targetMarginPercent,
    suggestedPrice,
    suggestedUnitProfit: round(suggestedPrice - unitCost),
    priceDelta,
    recommendation: getScenarioRecommendation(priceDelta, currentPrice <= 0 ? 0 : round((priceDelta / currentPrice) * 100))
  };
}

function getScenarioRecommendation(priceDelta: number, priceDeltaPercent: number) {
  if (priceDelta <= 0) {
    return {
      action: "maintain",
      tone: "steady",
      title: "Mantener precio",
      detail: "El precio actual ya supera el margen objetivo."
    };
  }

  if (priceDeltaPercent > 25) {
    return {
      action: "reduce-cost",
      tone: "focus",
      title: "Revisar costo",
      detail: "La subida sugerida supera 25%; conviene revisar insumos, receta o empaque."
    };
  }

  return {
    action: "raise-price",
    tone: "growth",
    title: "Subir precio",
    detail: `Necesita subir ${money(priceDelta)} para llegar al margen objetivo.`
  };
}

function round(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

