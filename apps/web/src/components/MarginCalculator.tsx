import { useMemo, useState } from "react";
import { BrandMark } from "./BrandMark";
import { Icon } from "./Icon";

// Cuna de primer valor: el "aja" mas rapido del producto ("estoy vendiendo casi
// sin ganar") con UN producto, sin cuenta ni setup. La formula de margen es
// trivial y estable; refleja la fuente canonica calculatePriceScenario del
// paquete @emprendedos/domain (no se cablea el paquete por 2 lineas).

const TARGET_MARGIN = 0.5;

function money(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

function round(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function MarginCalculator({ onBack, onRegister }: { onBack: () => void; onRegister: () => void }) {
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [price, setPrice] = useState("");

  const result = useMemo(() => {
    const unitCost = Number(cost);
    const unitPrice = Number(price);
    const hasInput = price !== "" && Number.isFinite(unitPrice) && unitPrice > 0 && Number.isFinite(unitCost) && unitCost >= 0;
    if (!hasInput) return null;

    const unitProfit = round(unitPrice - unitCost);
    const marginPercent = round((unitProfit / unitPrice) * 100);
    const suggestedPrice = round(unitCost / (1 - TARGET_MARGIN));

    const verdict =
      marginPercent <= 0
        ? { tone: "at-risk" as const, label: "Estas vendiendo a perdida", detail: "Tu precio no cubre el costo. Cada venta te resta." }
        : marginPercent < 30
          ? { tone: "watch" as const, label: "Margen bajo", detail: "Queda poco para cubrir gastos. Revisa precio o costo." }
          : { tone: "healthy" as const, label: "Margen sano", detail: "Buen punto de partida para cubrir gastos y crecer." };

    return { unitProfit, marginPercent, suggestedPrice, verdict };
  }, [cost, price]);

  return (
    <main className="calc-page">
      <header className="calc-topbar">
        <button className="brand calc-brand" type="button" onClick={onBack} aria-label="Volver">
          <span className="brand-mark">
            <BrandMark />
          </span>
          <strong>
            emprende<span>dos</span>
          </strong>
        </button>
        <button className="secondary-action" type="button" onClick={onBack}>
          &larr; Volver
        </button>
      </header>

      <section className="calc-content">
        <p className="eyebrow">Calculadora gratis</p>
        <h1>¿Cuanto te deja realmente cada venta?</h1>
        <p className="calc-lead">Pon el costo y el precio de un producto. En 10 segundos sabes tu margen — sin crear cuenta.</p>

        <div className="calc-card">
          <label>
            <span>Producto (opcional)</span>
            <input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Jabon de lavanda" maxLength={60} />
          </label>
          <div className="calc-inputs">
            <label>
              <span>Costo por unidad</span>
              <input type="number" inputMode="numeric" min={0} value={cost} onChange={(event) => setCost(event.target.value)} placeholder="0" />
            </label>
            <label>
              <span>Precio de venta</span>
              <input type="number" inputMode="numeric" min={0} value={price} onChange={(event) => setPrice(event.target.value)} placeholder="0" />
            </label>
          </div>

          {result ? (
            <div className={`calc-result calc-${result.verdict.tone}`}>
              <div className="calc-result-head">
                <div>
                  <span className="calc-result-label">Margen{name ? ` de ${name}` : ""}</span>
                  <strong className="calc-margin">{result.marginPercent}%</strong>
                </div>
                <span className="calc-verdict-chip">{result.verdict.label}</span>
              </div>
              <p className="calc-verdict-detail">{result.verdict.detail}</p>
              <div className="calc-figures">
                <span>
                  <b>{money(result.unitProfit)}</b>
                  Ganas por unidad
                </span>
                <span>
                  <b>{money(result.suggestedPrice)}</b>
                  Precio para 50% margen
                </span>
              </div>
            </div>
          ) : (
            <p className="calc-empty">Escribe costo y precio para ver tu margen.</p>
          )}
        </div>

        <div className="calc-cta">
          <p>Guarda tus productos, registra ventas y mira la salud de tu negocio.</p>
          <button className="primary-action" type="button" onClick={onRegister}>
            <Icon name="plus" size={16} />
            Crear cuenta gratis
          </button>
        </div>
      </section>
    </main>
  );
}
