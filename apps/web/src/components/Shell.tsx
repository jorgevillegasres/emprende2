import type { ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Emprendedos">
          <span className="brand-mark">e</span>
          <span>
            <strong>
              emprende<span>dos</span>
            </strong>
            <small>Crece con claridad</small>
          </span>
        </a>
        <nav className="nav" aria-label="Principal">
          <button className="nav-item active">Mi negocio</button>
          <button className="nav-item">Productos</button>
          <button className="nav-item">Inventario</button>
          <button className="nav-item">Ventas</button>
          <button className="nav-item">Gastos</button>
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
