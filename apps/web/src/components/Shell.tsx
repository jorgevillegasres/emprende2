import { useEffect, useState, type ReactNode } from "react";
import { BrandMark } from "./BrandMark";
import { Icon } from "./Icon";
import { getPrimaryActionSection } from "./shellActions";

export type AppSection = "dashboard" | "products" | "supplies" | "sales" | "expenses" | "recipes" | "plan" | "admin";

export type ShellNotification = { id: string; tone: "danger" | "warning" | "info" | "success"; title: string; detail: string };

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
  isSuperAdmin,
  periodLabel,
  canGoNextPeriod,
  onPrevPeriod,
  onNextPeriod,
  searchValue,
  onSearchChange,
  searchEnabled,
  notifications,
  children
}: {
  activeSection: AppSection;
  onPrimaryAction?: () => void;
  onLogout?: () => void;
  onSectionChange: (section: AppSection) => void;
  userLabel?: string;
  isSuperAdmin?: boolean;
  periodLabel?: string;
  canGoNextPeriod?: boolean;
  onPrevPeriod?: () => void;
  onNextPeriod?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchEnabled?: boolean;
  notifications?: ShellNotification[];
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [navOpen, setNavOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const alerts = notifications ?? [];
  const groups = isSuperAdmin
    ? [...navGroups, { label: "Plataforma", items: [{ section: "admin" as AppSection, label: "Cuentas", icon: "admin" }] }]
    : navGroups;
  const activeLabel =
    [...allItems, { section: "admin" as AppSection, label: "Cuentas", icon: "admin" }].find((item) => item.section === activeSection)?.label ?? "Inicio";

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
          {groups.map((group) => (
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
          {searchEnabled ? (
            <label className="topbar-search">
              <Icon name="search" size={16} />
              <input
                type="search"
                placeholder="Buscar en esta seccion..."
                aria-label="Buscar"
                value={searchValue ?? ""}
                onChange={(event) => onSearchChange?.(event.target.value)}
              />
            </label>
          ) : (
            <span className="topbar-search-spacer" />
          )}
          <div className="topbar-actions">
            {activeSection === "dashboard" && periodLabel ? (
              <div className="period-selector" role="group" aria-label="Periodo del tablero">
                <button className="period-arrow" type="button" aria-label="Mes anterior" onClick={onPrevPeriod}>
                  <Icon name="chevron-left" size={16} />
                </button>
                <span className="period-label">{periodLabel}</span>
                <button
                  className="period-arrow"
                  type="button"
                  aria-label="Mes siguiente"
                  onClick={onNextPeriod}
                  disabled={!canGoNextPeriod}
                >
                  <Icon name="chevron-right" size={16} />
                </button>
              </div>
            ) : null}
            <button
              className="icon-button"
              type="button"
              aria-label={theme === "dark" ? "Tema claro" : "Tema oscuro"}
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
            >
              <Icon name="theme" size={18} />
            </button>
            <div className="notif-wrap">
              <button
                className="icon-button"
                type="button"
                aria-label="Notificaciones"
                aria-expanded={notifOpen}
                onClick={() => setNotifOpen((open) => !open)}
              >
                <Icon name="bell" size={18} />
                {alerts.length > 0 ? <span className="notif-badge">{alerts.length}</span> : null}
              </button>
              {notifOpen ? (
                <>
                  <button className="notif-scrim" type="button" aria-label="Cerrar notificaciones" onClick={() => setNotifOpen(false)} />
                  <div className="notif-panel" role="dialog" aria-label="Notificaciones">
                    <div className="notif-panel-head">
                      <strong>Notificaciones</strong>
                      <span>{alerts.length > 0 ? `${alerts.length} alertas` : "Sin alertas"}</span>
                    </div>
                    {alerts.length > 0 ? (
                      <ul className="notif-list">
                        {alerts.map((alert) => (
                          <li className={`notif-item notif-${alert.tone}`} key={alert.id}>
                            <strong>{alert.title}</strong>
                            <span>{alert.detail}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="notif-empty">Todo en orden. Sin alertas por ahora.</p>
                    )}
                  </div>
                </>
              ) : null}
            </div>
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
