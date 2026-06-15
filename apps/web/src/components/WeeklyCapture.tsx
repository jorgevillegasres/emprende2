import { useState } from "react";
import { createWeeklyCapture, setTenantFlags, track, type DashboardMetrics } from "../api/client";
import { Icon } from "./Icon";

function money(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

function currentWeek(): { periodStart: string; periodEnd: string } {
  const today = new Date();
  const periodEnd = today.toISOString().slice(0, 10);
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - 6);
  return { periodStart: start.toISOString().slice(0, 10), periodEnd };
}

export function WeeklyCapture({
  token,
  quickCapture,
  cashFlow,
  onEnable,
  onCaptured
}: {
  token: string;
  quickCapture: boolean;
  cashFlow: DashboardMetrics["cashFlow"];
  onEnable: () => void;
  onCaptured: () => void;
}) {
  const [revenue, setRevenue] = useState("");
  const [cashOut, setCashOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleEnable() {
    setBusy(true);
    try {
      await setTenantFlags({ quickCapture: true }, token);
      track("quick_capture_enabled", {}, token);
      onEnable();
    } catch {
      setMessage("No pudimos activar la carga rapida.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit() {
    const revenueValue = Number(revenue);
    const cashOutValue = Number(cashOut);
    if (!Number.isFinite(revenueValue) || revenueValue < 0 || !Number.isFinite(cashOutValue) || cashOutValue < 0) {
      setMessage("Escribe cuanto entro y cuanto salio.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      await createWeeklyCapture({ ...currentWeek(), revenue: revenueValue, cashOut: cashOutValue }, token);
      setRevenue("");
      setCashOut("");
      onCaptured();
    } catch {
      setMessage("No pudimos guardar la semana. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  if (!quickCapture) {
    return (
      <section className="card capture-optin">
        <div className="capture-optin-copy">
          <p className="eyebrow">Carga rapida (beta)</p>
          <h2>¿Llevas las cuentas en la cabeza o en un cuaderno?</h2>
          <p>Activa la carga semanal: en menos de un minuto registras cuanto entro y cuanto salio, sin anotar venta por venta.</p>
        </div>
        <button className="primary-action" type="button" disabled={busy} onClick={() => void handleEnable()}>
          {busy ? "Activando..." : "Activar carga rapida"}
        </button>
        {message ? <p className="capture-message">{message}</p> : null}
      </section>
    );
  }

  return (
    <section className="card capture-card">
      <div className="card-head">
        <div>
          <p className="eyebrow">Carga rapida de la semana</p>
          <h2>¿Cuanto se movio esta semana?</h2>
        </div>
        <Icon name="sales" size={20} />
      </div>

      <div className="capture-inputs">
        <label>
          <span>Entro (ventas)</span>
          <input type="number" inputMode="numeric" min={0} value={revenue} onChange={(event) => setRevenue(event.target.value)} placeholder="0" />
        </label>
        <label>
          <span>Salio (todo lo que gastaste)</span>
          <input type="number" inputMode="numeric" min={0} value={cashOut} onChange={(event) => setCashOut(event.target.value)} placeholder="0" />
        </label>
        <button className="primary-action" type="button" disabled={busy} onClick={() => void handleSubmit()}>
          {busy ? "Guardando..." : "Guardar la semana"}
        </button>
      </div>
      {message ? <p className="capture-message">{message}</p> : null}

      {cashFlow?.usesAggregateCapture ? (
        <div className={`capture-result ${cashFlow.cashResult < 0 ? "is-negative" : "is-positive"}`}>
          <span>
            <b>{money(cashFlow.cashIn)}</b>
            Entro este mes
          </span>
          <span>
            <b>{money(cashFlow.cashOut)}</b>
            Salio
          </span>
          <span className="capture-result-net">
            <b>{money(cashFlow.cashResult)}</b>
            Te {cashFlow.cashResult < 0 ? "falto" : "quedo"}
          </span>
        </div>
      ) : null}
    </section>
  );
}
