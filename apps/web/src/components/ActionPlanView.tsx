import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createDecision,
  listDecisions,
  updateDecisionStatus,
  type DecisionPriority,
  type DecisionRecord,
  type DecisionStatus
} from "../api/client";
import {
  filterDecisions,
  getDecisionSources,
  labelDecisionSource,
  summarizeDecisions,
  type DecisionPriorityFilter,
  type DecisionSourceFilter,
  type DecisionStatusFilter
} from "./actionPlanLogic";
import { Modal } from "./Modal";

const statusLabels: Record<DecisionStatusFilter, string> = {
  all: "Todas",
  open: "Abiertas",
  done: "Hechas",
  dismissed: "Descartadas"
};

const priorityLabels: Record<DecisionPriorityFilter, string> = {
  all: "Todas",
  high: "Alta",
  medium: "Media",
  low: "Baja"
};

export function ActionPlan({ token }: { token: string }) {
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<DecisionStatusFilter>("open");
  const [priorityFilter, setPriorityFilter] = useState<DecisionPriorityFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<DecisionSourceFilter>("all");
  const [message, setMessage] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    detail: "",
    owner: "owner",
    priority: "medium" as DecisionPriority,
    source: "manual",
    dueDate: ""
  });
  const summary = useMemo(() => summarizeDecisions(decisions), [decisions]);
  const sources = useMemo(() => getDecisionSources(decisions), [decisions]);
  const visibleDecisions = useMemo(
    () => filterDecisions(decisions, { status: statusFilter, priority: priorityFilter, source: sourceFilter }),
    [decisions, priorityFilter, sourceFilter, statusFilter]
  );

  useEffect(() => {
    listDecisions(token)
      .then(setDecisions)
      .catch(() => setMessage("No pudimos cargar el plan de accion."));
  }, [token]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    try {
      const created = await createDecision(
        {
          title: form.title,
          detail: form.detail,
          source: form.source,
          priority: form.priority,
          owner: form.owner.trim() || "owner",
          dueDate: form.dueDate || undefined
        },
        token
      );
      setDecisions((current) => [created, ...current]);
      setForm((current) => ({ ...current, title: "", detail: "", dueDate: "" }));
      setStatusFilter("open");
      setIsFormOpen(false);
      setMessage("Accion creada.");
    } catch {
      setMessage("No pudimos crear la accion.");
    }
  }

  async function handleStatus(id: string, status: DecisionStatus) {
    try {
      const updated = await updateDecisionStatus(id, status, token);
      setDecisions((current) => current.map((decision) => (decision.id === id ? updated : decision)));
    } catch {
      setMessage("No pudimos actualizar la accion.");
    }
  }

  return (
    <main className="action-plan-page">
      <section className="operations-hero action-plan-hero">
        <div>
          <p className="eyebrow">Plan de accion</p>
          <h1>Convierte decisiones en seguimiento real</h1>
          <p>Organiza responsables, prioridades y estados para que cada recomendacion termine en una accion visible.</p>
        </div>
        <div className="action-plan-summary">
          <Summary label="Abiertas" value={summary.open} />
          <Summary label="Alta prioridad" value={summary.highPriorityOpen} />
          <Summary label="Hechas" value={summary.done} />
        </div>
      </section>

      <section className="operations-board">
        <article className="card action-plan-list-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">Seguimiento</p>
              <h2>Acciones</h2>
            </div>
            <button className="primary-action" onClick={() => setIsFormOpen(true)} type="button">
              + Nueva accion
            </button>
          </div>
          <div className="action-plan-filters">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as DecisionStatusFilter)}>
              {(["open", "done", "dismissed", "all"] as const).map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
            <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as DecisionPriorityFilter)}>
              {(["all", "high", "medium", "low"] as const).map((priority) => (
                <option key={priority} value={priority}>
                  {priorityLabels[priority]}
                </option>
              ))}
            </select>
            <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as DecisionSourceFilter)}>
              <option value="all">Todos los origenes</option>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {labelDecisionSource(source)}
                </option>
              ))}
            </select>
          </div>
          {sources.length ? (
            <div className="action-plan-source-strip" aria-label="Resumen por origen">
              {sources.map((source) => (
                <span key={source}>
                  {labelDecisionSource(source)}
                  <b>{decisions.filter((decision) => decision.source === source).length}</b>
                </span>
              ))}
            </div>
          ) : null}
          <div className="action-plan-list">
            {visibleDecisions.length ? (
              visibleDecisions.map((decision) => (
                <article className={`action-plan-row status-${decision.status}`} key={decision.id}>
                  <div>
                    <div className="action-plan-badges">
                      <span>{priorityLabels[decision.priority]}</span>
                      <span>{labelDecisionSource(decision.source)}</span>
                    </div>
                    <strong>{decision.title}</strong>
                    <p>{decision.detail}</p>
                    <small>
                      {decision.owner || "Sin responsable"}
                      {decision.dueDate ? ` - ${decision.dueDate}` : ""}
                    </small>
                  </div>
                  <div className="action-plan-row-actions">
                    {decision.status !== "done" ? <button onClick={() => void handleStatus(decision.id, "done")} type="button">Hecha</button> : null}
                    {decision.status !== "dismissed" ? <button onClick={() => void handleStatus(decision.id, "dismissed")} type="button">Descartar</button> : null}
                    {decision.status !== "open" ? <button onClick={() => void handleStatus(decision.id, "open")} type="button">Reabrir</button> : null}
                  </div>
                </article>
              ))
            ) : (
              <p className="empty-note">No hay acciones para estos filtros.</p>
            )}
          </div>
        </article>
      </section>

      <Modal open={isFormOpen} onClose={() => setIsFormOpen(false)} eyebrow="Nueva accion" title="Crear seguimiento">
        <form className="action-plan-form" onSubmit={handleCreate}>
            <label>
              <span>Titulo</span>
              <input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            </label>
            <label>
              <span>Detalle</span>
              <input required value={form.detail} onChange={(event) => setForm((current) => ({ ...current, detail: event.target.value }))} />
            </label>
            <label>
              <span>Responsable</span>
              <input value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))} />
            </label>
            <label>
              <span>Origen</span>
              <select value={form.source} onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))}>
                <option value="manual">Manual</option>
                <option value="pricing">Precios</option>
                <option value="inventory">Inventario</option>
                <option value="production">Produccion</option>
                <option value="sales">Ventas</option>
                <option value="expenses">Gastos</option>
              </select>
            </label>
            <label>
              <span>Prioridad</span>
              <select value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as DecisionPriority }))}>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </label>
            <label>
              <span>Fecha objetivo</span>
              <input type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} />
            </label>
            <button className="primary-action" type="submit">Crear accion</button>
            {message ? <p className="decision-message">{message}</p> : null}
        </form>
      </Modal>
    </main>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <span>
      <strong>{value}</strong>
      {label}
    </span>
  );
}
