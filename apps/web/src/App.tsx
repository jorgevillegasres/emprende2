import { useEffect, useState } from "react";
import { getDashboardMetrics, type DashboardMetrics } from "./api/client";
import { Dashboard } from "./components/Dashboard";
import { Shell } from "./components/Shell";

export function App() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboardMetrics()
      .then(setMetrics)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Error cargando dashboard");
      });
  }, []);

  return (
    <Shell>
      {error ? <div className="system-panel">{error}</div> : null}
      {!metrics && !error ? <div className="system-panel">Cargando Emprendedos...</div> : null}
      {metrics ? <Dashboard metrics={metrics} /> : null}
    </Shell>
  );
}
