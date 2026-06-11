import type { ReactNode } from "react";

export type AppSection = "dashboard" | "products" | "supplies" | "sales" | "expenses";

const navItems: Array<{ section: AppSection; label: string }> = [
  { section: "dashboard", label: "Mi negocio" },
  { section: "products", label: "Productos" },
  { section: "supplies", label: "Inventario" },
  { section: "sales", label: "Ventas" },
  { section: "expenses", label: "Gastos" }
];

export function Shell({
  activeSection,
  onSectionChange,
  children
}: {
  activeSection: AppSection;
  onSectionChange: (section: AppSection) => void;
  children: ReactNode;
}) {
  return (
    <div className="shell">
      <header className="topbar">
        <button className="brand brand-button" type="button" onClick={() => onSectionChange("dashboard")} aria-label="Emprendedos">
          <span className="brand-mark">e</span>
          <span>
            <strong>
              emprende<span>dos</span>
            </strong>
            <small>Crece con claridad</small>
          </span>
        </button>
        <nav className="nav" aria-label="Principal">
          {navItems.map((item) => (
            <button
              className={`nav-item ${activeSection === item.section ? "active" : ""}`}
              key={item.section}
              type="button"
              onClick={() => onSectionChange(item.section)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="top-actions">
          <span className="today-pill">Junio 2026</span>
          <button className="primary-action">Registrar venta</button>
        </div>
      </header>
      {children}
    </div>
  );
}
