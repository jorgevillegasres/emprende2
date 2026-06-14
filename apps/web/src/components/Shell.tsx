import { useEffect, useState, type ReactNode } from "react";
import { BrandMark } from "./BrandMark";
import { Icon } from "./Icon";
import { getPrimaryActionSection } from "./shellActions";

export type AppSection = "dashboard" | "products" | "supplies" | "sales" | "expenses" | "recipes" | "plan";

type NavItem = { section: AppSection; label: string; icon: string };

const navGroups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "General",
    items: [{ section: "dashboard", label: "Mi negocio", icon: "dashboard" }]
  },
  {
    label: "Operacion",
    items: [
      { section: "products", label: "Productos", icon: "products" },
      { section: "supplies", label: "Inventario", icon: "inventory" },
      { section: "sales", label: "Ventas", icon: "sales" },
      { section: "expenses", label: "Gastos", icon: "expenses" }
    ]
  },
  {
    label: "Produccion",
    items: [
      { section: "recipes", label: "Recetas", icon: "recipes" },
      { section: "plan", label: "Plan", icon: "plan" }
    ]
  }
];

const allItems = navGroups.flatMap((group) => group.items);

const THEME_KEY = "emprendedos.theme";

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
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [navOpen, setNavOpen] = useState(false);
  const activeLabel = allItems.find((item) => item.section === activeSection)?.label ?? "Inicio";

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  function goTo(section: AppSection) {
    onSectionChange(section);
    setNavOpen(false);
  }

  return (
    <div className={`app-layout ${navOpen ? "nav-open" : ""}`}>
      <aside className="sidebar">
        <button className="sidebar-brand" type="button" onClick={() => goTo("dashboard")} aria-label="Emprendedos">
          <span className="brand-mark">
            <BrandMark />
          </span>
          <span className="sidebar-brand-text">
            <strong>
              emprende<span>dos</span>
            </strong>
            <small>Crece con claridad</small>
          </span>
        </button>

        <nav className="sidebar-nav" aria-label="Secciones principales">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <p className="nav-group-label">{group.label}</p>
              {group.items.map((item) => (
                <button
                  className={`nav-item ${activeSection === item.section ? "active" : ""}`}
                  key={item.section}
                  type="button"
                  onClick={() => goTo(item.section)}
                >
                  <Icon name={item.icon} size={18} />
                  <span className="nav-label">{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="sidebar-user">
            <span className="avatar" aria-hidden="true">
              {(userLabel ?? "U").slice(0, 1).toUpperCase()}
            </span>
            <span className="sidebar-user-text">
              <strong>{userLabel ?? "Usuario"}</strong>
              <small>Sesion activa</small>
            </span>
          </span>
          {onLogout ? (
            <button className="icon-button" onClick={onLogout} type="button" aria-label="Cerrar sesion">
              <Icon name="logout" size={18} />
            </button>
          ) : null}
        </div>
      </aside>

      <button className="nav-scrim" type="button" aria-label="Cerrar menu" onClick={() => setNavOpen(false)} />

      <div className="app-main">
        <header className="topbar">
          <button className="icon-button nav-toggle" type="button" aria-label="Abrir menu" onClick={() => setNavOpen((open) => !open)}>
            <Icon name="dashboard" size={18} />
          </button>
          <div className="breadcrumb">
            <span>Inicio</span>
            <span className="breadcrumb-sep">/</span>
            <b>{activeLabel}</b>
          </div>
          <label className="topbar-search">
            <Icon name="search" size={16} />
            <input type="search" placeholder="Buscar..." aria-label="Buscar" />
          </label>
          <div className="topbar-actions">
            <span className="date-pill">Junio 2026</span>
            <button
              className="icon-button"
              type="button"
              aria-label={theme === "dark" ? "Tema claro" : "Tema oscuro"}
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
            >
              <Icon name="theme" size={18} />
            </button>
            <button className="icon-button" type="button" aria-label="Notificaciones">
              <Icon name="bell" size={18} />
            </button>
            <button
              className="primary-action"
              onClick={onPrimaryAction ?? (() => onSectionChange(getPrimaryActionSection()))}
              type="button"
            >
              <Icon name="plus" size={16} />
              <span className="action-label">Registrar venta</span>
            </button>
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
