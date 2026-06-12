import type { ReactNode } from "react";
import { getPrimaryActionSection } from "./shellActions";

export type AppSection = "dashboard" | "products" | "supplies" | "sales" | "expenses" | "recipes" | "plan";

const navItems: Array<{ section: AppSection; label: string }> = [
  { section: "dashboard", label: "Mi negocio" },
  { section: "products", label: "Productos" },
  { section: "supplies", label: "Inventario" },
  { section: "sales", label: "Ventas" },
  { section: "expenses", label: "Gastos" },
  { section: "recipes", label: "Recetas" },
  { section: "plan", label: "Plan" }
];

export function Shell({
  activeSection,
  onPrimaryAction,
  onLogout,
  onSectionChange,
  userLabel,
  children
}: {
  activeSection: AppSection;
  onPrimaryAction?: () => void;
  onLogout?: () => void;
  onSectionChange: (section: AppSection) => void;
  userLabel?: string;
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
          {userLabel ? <span className="user-pill">{userLabel}</span> : null}
          <button className="primary-action" onClick={onPrimaryAction ?? (() => onSectionChange(getPrimaryActionSection()))} type="button">
            Registrar venta
          </button>
          {onLogout ? (
            <button className="secondary-action" onClick={onLogout} type="button">
              Salir
            </button>
          ) : null}
        </div>
      </header>
      {children}
    </div>
  );
}
