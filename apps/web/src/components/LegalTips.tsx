import { useMemo, useState } from "react";
import { legalSectors, legalTips, type LegalTip } from "./legalTipsContent";
import type { LegalDocKey } from "./legalContent";

export function LegalTips({ onLegal }: { onLegal: (doc: LegalDocKey) => void }) {
  const [sector, setSector] = useState("General");

  const sortedTips = useMemo(() => {
    const isRelevant = (tip: LegalTip) => sector !== "General" && tip.sectors.includes(sector);
    return [...legalTips].sort((a, b) => Number(isRelevant(b)) - Number(isRelevant(a)));
  }, [sector]);

  const relevantCount = sector === "General" ? 0 : legalTips.filter((tip) => tip.sectors.includes(sector)).length;

  return (
    <main className="operations-page legal-tips-page">
      <section className="operations-hero">
        <div>
          <p className="eyebrow">Cumplimiento</p>
          <h1>Aspectos legales para tu negocio</h1>
          <p>Guias practicas de formalizacion, impuestos, marca y normas para emprendedores en Colombia.</p>
        </div>
        <div className="operations-stat">
          <span>Guias</span>
          <strong>{legalTips.length}</strong>
        </div>
      </section>

      <div className="legal-tips-note" role="note">
        <strong>Orientacion general.</strong> Esta seccion no reemplaza la asesoria de un profesional. Verifica cada
        tramite con la entidad correspondiente (DIAN, Camara de Comercio, INVIMA, SIC) antes de actuar.
      </div>

      <div className="legal-tips-toolbar">
        <label>
          <span>Tu sector</span>
          <select value={sector} onChange={(event) => setSector(event.target.value)}>
            {legalSectors.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        {relevantCount > 0 ? (
          <span className="legal-tips-relevant-count">{relevantCount} guias destacadas para tu sector</span>
        ) : null}
      </div>

      <div className="legal-tips-grid">
        {sortedTips.map((tip) => {
          const relevant = sector !== "General" && tip.sectors.includes(sector);
          return (
            <article className={`card legal-tip-card ${relevant ? "is-relevant" : ""}`} key={tip.id}>
              <div className="legal-tip-head">
                <span className="legal-tip-category">{tip.category}</span>
                {tip.severity === "important" ? <span className="legal-tip-flag">Prioritario</span> : null}
                {relevant ? <span className="legal-tip-relevant">Para tu sector</span> : null}
              </div>
              <h2>{tip.title}</h2>
              <p className="legal-tip-summary">{tip.summary}</p>
              <details className="legal-tip-details">
                <summary>Ver pasos</summary>
                <ul>
                  {tip.points.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </details>
            </article>
          );
        })}
      </div>

      <section className="card legal-tips-docs">
        <div>
          <p className="eyebrow">Documentos de la plataforma</p>
          <h2>Tu marco legal con Emprendedos</h2>
          <p>Consulta como tratamos tus datos y las condiciones de uso del servicio.</p>
        </div>
        <div className="legal-tips-docs-actions">
          <button className="secondary-action" type="button" onClick={() => onLegal("terms")}>
            Terminos y Condiciones
          </button>
          <button className="secondary-action" type="button" onClick={() => onLegal("privacy")}>
            Tratamiento de Datos
          </button>
        </div>
      </section>
    </main>
  );
}
