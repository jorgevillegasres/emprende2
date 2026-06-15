import { BrandMark } from "./BrandMark";
import { Icon } from "./Icon";
import type { LegalDocKey } from "./legalContent";

const features: Array<{ icon: string; title: string; detail: string }> = [
  { icon: "dashboard", title: "Tablero claro", detail: "Salud del negocio, ventas, utilidad y margen de un vistazo." },
  { icon: "inventory", title: "Inventario y costos", detail: "Insumos, producto terminado, stock minimo y costo promedio ponderado." },
  { icon: "plan", title: "Punto de equilibrio", detail: "Cuanto necesitas vender para cubrir tus gastos, sin hojas de calculo." },
  { icon: "sales", title: "Decisiones de la semana", detail: "Recomendaciones accionables: que producir, comprar o revisar." }
];

const segments = [
  "Cosmetica y jabones",
  "Reposteria y alimentos",
  "Velas y aromas",
  "Ropa y accesorios",
  "Ceramica y decoracion",
  "Otro producto fisico"
];

export function Landing({
  onLogin,
  onRegister,
  onDemo,
  demoLoading,
  onCalculator,
  onLegal
}: {
  onLogin: () => void;
  onRegister: () => void;
  onDemo: () => void;
  demoLoading?: boolean;
  onCalculator: () => void;
  onLegal: (doc: LegalDocKey) => void;
}) {
  return (
    <div className="landing">
      <header className="landing-nav">
        <span className="brand">
          <span className="brand-mark">
            <BrandMark />
          </span>
          <strong>
            emprende<span>dos</span>
          </strong>
        </span>
        <div className="landing-nav-actions">
          <button className="secondary-action" type="button" onClick={onLogin}>
            Iniciar sesion
          </button>
          <button className="primary-action" type="button" onClick={onRegister}>
            Crear cuenta
          </button>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <p className="eyebrow">Centro de mando para emprendedores</p>
          <h1>
            Haz crecer tu emprendimiento <span>con claridad</span>
          </h1>
          <p className="landing-lead">
            La cabina de mando para quienes fabrican y venden productos fisicos. Entiende tus ventas, margenes,
            inventario y las decisiones de esta semana — todo en un solo lugar.
          </p>
          <div className="landing-cta">
            <button className="primary-action landing-cta-main" type="button" onClick={onRegister}>
              <Icon name="plus" size={16} />
              Crear cuenta gratis
            </button>
            <button className="secondary-action" type="button" onClick={onDemo} disabled={demoLoading}>
              {demoLoading ? "Abriendo demo..." : "Ver demo en vivo"}
            </button>
          </div>
          <button className="landing-calc-link" type="button" onClick={onCalculator}>
            <Icon name="sales" size={16} />
            Calcula tu margen en 10 segundos — sin cuenta
          </button>
          <p className="landing-note">Sin tarjeta. Empieza con datos de ejemplo o los tuyos.</p>
        </div>

        <div className="landing-hero-visual" aria-hidden="true">
          <div className="landing-card landing-card-score">
            <p className="eyebrow">Pulso operativo</p>
            <strong>Salud del negocio</strong>
            <div className="landing-gauge">
              <svg viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="62" fill="none" strokeWidth="16" className="landing-gauge-track" />
                <circle cx="80" cy="80" r="62" fill="none" strokeWidth="16" strokeLinecap="round" className="landing-gauge-fill" />
              </svg>
              <div className="landing-gauge-value">
                <b>68</b>
                <span>de 100</span>
              </div>
            </div>
          </div>
          <div className="landing-card landing-card-kpi">
            <span className="landing-kpi-icon">
              <Icon name="sales" size={18} />
            </span>
            <span>Ventas del mes</span>
            <b>$ 616.000</b>
          </div>
          <div className="landing-card landing-card-break">
            <p className="eyebrow">Punto de equilibrio</p>
            <strong>Cubierto al 100%</strong>
            <div className="landing-bar">
              <span />
            </div>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <div className="landing-section-head">
          <p className="eyebrow">Lo que te da</p>
          <h2>Convierte tus datos en decisiones</h2>
        </div>
        <div className="landing-feature-grid">
          {features.map((feature) => (
            <article className="landing-feature" key={feature.title}>
              <span className="landing-feature-icon">
                <Icon name={feature.icon} size={20} />
              </span>
              <strong>{feature.title}</strong>
              <p>{feature.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-segments">
        <div className="landing-section-head">
          <p className="eyebrow">Para quien es</p>
          <h2>Hecho para negocios que producen y venden</h2>
        </div>
        <ul className="landing-segment-list">
          {segments.map((segment) => (
            <li key={segment}>
              <Icon name="plan" size={16} />
              {segment}
            </li>
          ))}
        </ul>
      </section>

      <section className="landing-final">
        <div className="landing-final-inner">
          <h2>Empieza a ver tu negocio con claridad</h2>
          <p>Crea tu cuenta en minutos y carga tus productos, ventas y gastos. O explora el demo primero.</p>
          <div className="landing-cta">
            <button className="primary-action" type="button" onClick={onRegister}>
              <Icon name="plus" size={16} />
              Crear cuenta gratis
            </button>
            <button className="landing-ghost" type="button" onClick={onDemo} disabled={demoLoading}>
              {demoLoading ? "Abriendo demo..." : "Ver demo en vivo"}
            </button>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <span className="brand">
          <span className="brand-mark">
            <BrandMark />
          </span>
          <strong>
            emprende<span>dos</span>
          </strong>
        </span>
        <nav className="landing-legal-links" aria-label="Documentos legales">
          <button type="button" onClick={() => onLegal("terms")}>
            Terminos y Condiciones
          </button>
          <button type="button" onClick={() => onLegal("privacy")}>
            Tratamiento de Datos
          </button>
        </nav>
        <small>Crece con claridad · {new Date().getFullYear()}</small>
      </footer>
    </div>
  );
}
