import { useEffect, useMemo, useState } from "react";
import { createDecision, listDecisions, updateDecisionStatus, type DashboardMetrics, type DecisionRecord } from "../api/client";
import { buildGrowthDecisionPayload, buildPricingDecisionPayload, findMatchingDecision, type GrowthAction } from "./dashboardDecisions";
import { Icon } from "./Icon";
import type { AppSection } from "./Shell";
import { getOnboardingProgress } from "./onboarding";

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
  const health = metrics.businessHealth;
  const score = health?.score ?? metrics.businessHealthScore ?? 0;
  const circumference = 389.56;
  const offset = circumference - (score / 100) * circumference;
  const weeklyMax = Math.max(...metrics.weeklyRevenue.map((week) => week.revenue), 1);
  const expenseMax = Math.max(...metrics.expensesByCategory.map((expense) => expense.amount), 1);
  const profitMax = Math.max(...metrics.productProfitability.map((product) => product.grossProfit), 1);
  const selectedScenario = metrics.priceScenarios.find((scenario) => scenario.name === selectedProductName) ?? metrics.priceScenarios[0];
  const onboardingProgress = getOnboardingProgress(metrics);
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

  async function handleCreateDecision(payload: ReturnType<typeof buildGrowthDecisionPayload>) {
    const existing = findMatchingDecision(decisions, payload);
    if (existing) {
      setDecisionStatusFilter(existing.status);
      setDecisionMessage(existing.status === "open" ? "Esta accion ya esta en tu plan." : `Esta accion ya existe como ${statusLabels[existing.status].toLowerCase()}.`);
      return;
    }

    setIsSavingDecision(true);
    setDecisionMessage("");
    try {
      const created = await createDecision(payload, token);
      setDecisions((current) => [created, ...current]);
      setDecisionStatusFilter("open");
      setDecisionMessage("Decision guardada.");
    } catch {
      setDecisionMessage("No pudimos guardar la decision.");
    } finally {
      setIsSavingDecision(false);
    }
  }

  async function handleSavePricingDecision() {
    if (!simulatedScenario) return;
    await handleCreateDecision(buildPricingDecisionPayload(simulatedScenario, decisionOwner));
  }

  async function handleSaveGrowthDecision(action: GrowthAction) {
    await handleCreateDecision(buildGrowthDecisionPayload(action, decisionOwner));
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
      {onboardingProgress.percent < 100 ? <OnboardingPanel onSectionChange={onSectionChange} progress={onboardingProgress} /> : null}

      <section className="executive-overview">
        <article className="card score-card executive-score">
          <div className="card-head">
            <div>
              <p className="eyebrow">Pulso operativo</p>
              <h1>Salud del negocio</h1>
            </div>
            <span className={`status-chip health-${health?.verdict ?? "setup"}`}>{health?.label ?? "Sin datos"}</span>
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
          <p className="score-note">{health?.reason ?? "Margen, caja operativa, inventario y foco comercial en una sola lectura."}</p>
        </article>

        <div className="executive-panel">
          <article className="card decisions-card executive-decisions">
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
                  <button
                    className="decision-plan-action"
                    disabled={isSavingDecision || Boolean(findMatchingDecision(decisions, buildGrowthDecisionPayload(action, decisionOwner)))}
                    onClick={() => void handleSaveGrowthDecision(action)}
                    type="button"
                  >
                    {findMatchingDecision(decisions, buildGrowthDecisionPayload(action, decisionOwner)) ? "En plan" : "Agregar al plan"}
                  </button>
                </article>
              ))}
            </div>
          </article>

          <section className="executive-metrics" aria-label="Indicadores principales">
            <Metric label="Ventas del mes" value={money(metrics.monthlyRevenue)} detail="Ingresos registrados" accent="blue" icon="sales" />
            <Metric label="Utilidad bruta" value={money(metrics.monthlyGrossProfit)} detail={`${metrics.averageMarginPercent}% margen`} accent="green" icon="expenses" />
            <Metric
              label="Resultado operativo"
              value={money(metrics.netAfterExpenses)}
              detail={metrics.netAfterExpenses < 0 ? "Estas gastando mas de lo que ganas" : "Utilidad menos gastos"}
              accent={metrics.netAfterExpenses < 0 ? "coral" : "green"}
              tone={metrics.netAfterExpenses < 0 ? "negative" : "positive"}
              icon="plan"
            />
            <Metric label="Inventario valorizado" value={money(metrics.totalInventoryValue)} detail="Insumos + productos" accent="yellow" icon="inventory" />
          </section>
        </div>
      </section>

      <MonthlyComparisonStrip comparison={metrics.monthlyComparison} />

      <BreakEvenPanel breakEven={metrics.breakEven} />

      <section className="dashboard-analysis">
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
              <button
                className="secondary-action inline-decision-action"
                disabled={isSavingDecision || Boolean(findMatchingDecision(decisions, buildPricingDecisionPayload(simulatedScenario, decisionOwner)))}
                onClick={() => void handleSavePricingDecision()}
                type="button"
              >
                {isSavingDecision ? "Guardando..." : findMatchingDecision(decisions, buildPricingDecisionPayload(simulatedScenario, decisionOwner)) ? "Ya esta en el plan" : "Guardar decision"}
              </button>
              {decisionMessage ? <p className="decision-message">{decisionMessage}</p> : null}
            </div>
          ) : (
            <p className="empty-note">Crea productos con costo y precio para simular margen.</p>
          )}
        </article>

        <article className="card chart-card sales-chart-card">
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

        <article className="card chart-card expense-chart-card">
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

        <article className="card list-card decisions-panel-card">
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

        <article className="card list-card stock-alerts-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">Inventario</p>
              <h2>Alertas de stock</h2>
            </div>
          </div>
          <div className="stock-list">
            {metrics.lowStockItems.slice(0, 5).map((item) => (
              <div className={`stock-row ${item.stock <= item.minStock * 0.5 ? "stock-critical" : "stock-low"}`} key={`${item.type}-${item.name}`}>
                <span>{item.type}</span>
                <strong>{item.name}</strong>
                <small>
                  <b>{item.stock}</b> / min. {item.minStock} {item.unit ?? ""}
                </small>
              </div>
            ))}
          </div>
        </article>
      </section>

      <StockForecastPanel forecast={metrics.stockForecast} />
    </main>
  );
}

function OnboardingPanel({
  onSectionChange,
  progress
}: {
  onSectionChange?: (section: AppSection) => void;
  progress: ReturnType<typeof getOnboardingProgress>;
}) {
  return (
    <section className="onboarding-band">
      <div className="onboarding-copy">
        <p className="eyebrow">Primeras cargas</p>
        <h1>Activa tu tablero con datos reales</h1>
        <p>
          Lleva {progress.completed} de {progress.total} pasos. Cuando completes esta base, Emprendedos puede mostrar margen,
          stock, ventas y resultado operativo con mucha mas claridad.
        </p>
        <div className="onboarding-progress" aria-label="Progreso de configuracion">
          <span style={{ width: `${progress.percent}%` }} />
        </div>
        {progress.nextStep ? (
          <button className="primary-action onboarding-next-action" onClick={() => onSectionChange?.(progress.nextStep!.section)} type="button">
            Siguiente: {progress.nextStep.title}
          </button>
        ) : null}
      </div>
      <div className="onboarding-steps">
        {progress.steps.map((step, index) => (
          <button className={`onboarding-step ${step.completed ? "completed" : ""}`} key={step.section} onClick={() => onSectionChange?.(step.section)} type="button">
            <span>{step.completed ? "OK" : index + 1}</span>
            <strong>{step.title}</strong>
            <small>{step.detail}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function BreakEvenPanel({ breakEven }: { breakEven: DashboardMetrics["breakEven"] }) {
  const { canEstimate, isCovered, breakEvenRevenue, currentRevenue, revenueGap, progressPercent, contributionMarginPercent } = breakEven;
  const state = isCovered ? "is-covered" : canEstimate ? "is-below" : "is-empty";

  const headline = !canEstimate
    ? "Aun no podemos calcular tu punto de equilibrio"
    : isCovered
      ? "Tu negocio ya cubre sus gastos este mes"
      : `Te faltan ${money(revenueGap)} en ventas para cubrir tus gastos`;

  const detail = !canEstimate
    ? "Registra ventas con margen y gastos del mes para estimar cuanto necesitas vender."
    : `Con un margen promedio de ${contributionMarginPercent}%, necesitas vender ${money(breakEvenRevenue)} al mes para no perder dinero.`;

  return (
    <section className={`break-even-band ${state}`} aria-label="Punto de equilibrio">
      <div className="break-even-copy">
        <p className="eyebrow">Punto de equilibrio</p>
        <h2>{headline}</h2>
        <p>{detail}</p>
      </div>
      <div className="break-even-track-wrap">
        <div className="break-even-figures">
          <span>
            Vas en <b>{money(currentRevenue)}</b>
          </span>
          <span>
            Meta <b>{canEstimate ? money(breakEvenRevenue) : "--"}</b>
          </span>
        </div>
        <div className="break-even-track">
          <span className="break-even-fill" style={{ width: `${canEstimate ? progressPercent : 0}%` }} />
        </div>
        <p className="break-even-status">
          {!canEstimate ? "Sin datos suficientes" : isCovered ? `Cubierto al ${progressPercent}%` : `${progressPercent}% del objetivo`}
        </p>
      </div>
    </section>
  );
}

function MonthlyComparisonStrip({ comparison }: { comparison: DashboardMetrics["monthlyComparison"] }) {
  const items: Array<{ label: string; delta: DashboardMetrics["monthlyComparison"]["revenue"]; higherIsBetter: boolean }> = [
    { label: "Ventas", delta: comparison.revenue, higherIsBetter: true },
    { label: "Utilidad bruta", delta: comparison.grossProfit, higherIsBetter: true },
    { label: "Gastos", delta: comparison.expenses, higherIsBetter: false },
    { label: "Resultado", delta: comparison.netResult, higherIsBetter: true }
  ];

  return (
    <section className="comparison-strip" aria-label="Comparacion con el mes anterior">
      <div className="comparison-head">
        <p className="eyebrow">Tendencia</p>
        <h2>
          {comparison.currentMonthLabel} <span>vs. {comparison.previousMonthLabel}</span>
        </h2>
        <p className="comparison-sub">
          {comparison.hasPreviousData
            ? "Asi se mueve tu negocio frente al mes pasado."
            : `Aun no hay datos de ${comparison.previousMonthLabel} para comparar.`}
        </p>
      </div>
      <div className="comparison-grid">
        {items.map((item) => {
          const { delta } = item;
          const isPositive = delta.trend === "flat" ? null : (delta.trend === "up") === item.higherIsBetter;
          const tone = !comparison.hasPreviousData ? "neutral" : isPositive === null ? "neutral" : isPositive ? "positive" : "negative";
          const arrow = delta.trend === "up" ? "↑" : delta.trend === "down" ? "↓" : "→";
          const badge = !comparison.hasPreviousData
            ? "Mes base"
            : delta.deltaPercent !== null
              ? `${arrow} ${delta.deltaPercent >= 0 ? "+" : ""}${delta.deltaPercent}%`
              : delta.previous === 0
                ? "Nuevo"
                : `${arrow} ${money(delta.delta)}`;
          return (
            <article className={`comparison-card tone-${tone}`} key={item.label}>
              <span className="comparison-label">{item.label}</span>
              <strong>{money(delta.current)}</strong>
              <span className={`comparison-badge badge-${tone}`}>{badge}</span>
              {comparison.hasPreviousData ? (
                <small>
                  {delta.delta >= 0 ? "+" : ""}
                  {money(delta.delta)} vs. mes anterior
                </small>
              ) : (
                <small>Sin referencia previa</small>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function StockForecastPanel({ forecast }: { forecast: DashboardMetrics["stockForecast"] }) {
  const statusLabels: Record<DashboardMetrics["stockForecast"][number]["status"], string> = {
    critical: "Reponer ya",
    watch: "Planear compra",
    healthy: "Con holgura",
    idle: "Sin rotacion"
  };

  const withSales = forecast.filter((item) => item.daysRemaining !== null);
  const priority = forecast.filter((item) => item.status === "critical" || item.status === "watch").length;

  return (
    <section className="card forecast-card" aria-label="Proyeccion de stock">
      <div className="card-head">
        <div>
          <p className="eyebrow">Proyeccion de inventario</p>
          <h2>¿Cuanto te dura el stock?</h2>
        </div>
        <span className="status-chip">{priority > 0 ? `${priority} por reponer` : "Todo con holgura"}</span>
      </div>
      <p className="forecast-sub">Estimado segun el ritmo de ventas de este mes. Te avisamos que productos se agotan pronto.</p>
      {withSales.length > 0 ? (
        <div className="forecast-grid">
          {forecast.map((item) => (
            <article className={`forecast-item forecast-${item.status}`} key={item.productId}>
              <div className="forecast-item-head">
                <strong>{item.name}</strong>
                <span className={`forecast-pill pill-${item.status}`}>{statusLabels[item.status]}</span>
              </div>
              <div className="forecast-figure">
                {item.daysRemaining === null ? (
                  <span className="forecast-days-empty">Sin ventas este mes</span>
                ) : (
                  <>
                    <strong>{item.daysRemaining}</strong>
                    <span>dias de stock</span>
                  </>
                )}
              </div>
              <small>
                {item.stock} {item.unit ?? "un"} en mano
                {item.daysRemaining !== null ? ` - ${item.unitsSold} vendidas este mes` : ""}
              </small>
            </article>
          ))}
        </div>
      ) : (
        <p className="empty-note">Registra ventas de tus productos para proyectar cuanto durara el inventario.</p>
      )}
    </section>
  );
}

function Metric({ label, value, detail, accent, tone, icon }: { label: string; value: string; detail: string; accent: string; tone?: "positive" | "negative"; icon: string }) {
  return (
    <article className={`metric-card accent-${accent}${tone ? ` metric-tone-${tone}` : ""}`}>
      <span className={`metric-icon icon-${accent}`} aria-hidden="true">
        <Icon name={icon} size={18} />
      </span>
      <span className="metric-label">{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
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

function getScenarioRecommendation(priceDelta: number, priceDeltaPercent: number): {
  action: "raise-price" | "reduce-cost" | "maintain";
  tone: "growth" | "focus" | "steady";
  title: string;
  detail: string;
} {
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

