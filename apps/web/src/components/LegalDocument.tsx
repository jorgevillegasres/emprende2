import { BrandMark } from "./BrandMark";
import { legalDocuments, type LegalDocKey } from "./legalContent";

export function LegalDocument({
  doc,
  onBack,
  onSwitch
}: {
  doc: LegalDocKey;
  onBack: () => void;
  onSwitch: (next: LegalDocKey) => void;
}) {
  const document = legalDocuments[doc];

  return (
    <main className="legal-page">
      <header className="legal-topbar">
        <button className="brand legal-brand" type="button" onClick={onBack} aria-label="Volver">
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

      <article className="legal-content">
        <p className="eyebrow">Legal</p>
        <h1>{document.title}</h1>
        <p className="legal-updated">Ultima actualizacion: {document.updated}</p>

        <p className="legal-intro">{document.intro}</p>

        {document.sections.map((section) => (
          <section className="legal-section" key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </section>
        ))}

        <div className="legal-switch">
          {doc === "terms" ? (
            <button type="button" onClick={() => onSwitch("privacy")}>
              Ver Politica de Tratamiento de Datos &rarr;
            </button>
          ) : (
            <button type="button" onClick={() => onSwitch("terms")}>
              Ver Terminos y Condiciones &rarr;
            </button>
          )}
        </div>
      </article>

      <footer className="legal-footer">
        <small>emprendedos · Crece con claridad</small>
      </footer>
    </main>
  );
}
