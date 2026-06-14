import type { ReactNode } from "react";
import { BrandMark } from "./BrandMark";
import { Icon } from "./Icon";
import { getPrimaryActionSection } from "./shellActions";

export type AppSection = "dashboard" | "products" | "supplies" | "sales" | "expenses" | "recipes" | "plan";

const navItems: Array<{ section: AppSection; label: string; icon: string }> = [
  { section: "dashboard", label: "Mi negocio", icon: "dashboard" },
  { section: "products", label: "Productos", icon: "products" },
  { section: "supplies", label: "Inventario", icon: "inventory" },
  { section: "sales", label: "Ventas", icon: "sales" },
  { section: "expenses", label: "Gastos", icon: "expenses" },
  { section: "recipes", label: "Recetas", icon: "recipes" },
  { section: "plan", label: "Plan", icon: "plan" }
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
          <span className="brand-mark">
            <BrandMark />
          </span>
          <span>
            <strong>
              emprende<span>dos</span>
            </strong>
            <small>Crece con claridad</small>
          </span>
        </button>
        <div className="nav-viewport">
          <nav className="nav" aria-label="Secciones principales">
            {navItems.map((item) => (
              <button
                className={`nav-item ${activeSection === item.section ? "active" : ""}`}
                key={item.section}
                type="button"
                onClick={() => onSectionChange(item.section)}
              >
                <Icon name={item.icon} size={16} />
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="top-actions">
          <span className="today-pill">Junio 2026</span>
          {userLabel ? <span className="user-pill">{userLabel}</span> : null}
          <button className="primary-action" onClick={onPrimaryAction ?? (() => onSectionChange(getPrimaryActionSection()))} type="button">
            <Icon name="sales" size={16} />
            Registrar venta
          </button>
          {onLogout ? (
            <button className="secondary-action" onClick={onLogout} type="button" aria-label="Cerrar sesion">
              <Icon name="logout" size={16} />
              <span className="action-label">Salir</span>
            </button>
          ) : null}
        </div>
      </header>
      {children}
    </div>
  );
}
