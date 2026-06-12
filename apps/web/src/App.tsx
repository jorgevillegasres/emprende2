import { useEffect, useState } from "react";
import { getCurrentUser, getDashboardMetrics, login, registerOwner, type AuthSession, type DashboardMetrics, type RegisterPayload } from "./api/client";
import { ActionPlan } from "./components/ActionPlanView";
import { Dashboard } from "./components/Dashboard";
import { Login } from "./components/Login";
import { Operations } from "./components/Operations";
import { Recipes } from "./components/Recipes";
import { Shell, type AppSection } from "./components/Shell";

const AUTH_STORAGE_KEY = "emprendedos.auth";

export function App() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [error, setError] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<AppSection>("dashboard");
  const [salesFocusSignal, setSalesFocusSignal] = useState(0);

  useEffect(() => {
    const storedSession = readStoredSession();
    if (!storedSession) {
      setIsAuthLoading(false);
      return;
    }

    getCurrentUser(storedSession.token)
      .then((session) => {
        persistSession(session);
        setAuthSession(session);
        return loadDashboard(session.token);
      })
      .catch(() => {
        clearStoredSession();
        setAuthError("Tu sesion expiro. Inicia sesion de nuevo.");
      })
      .finally(() => setIsAuthLoading(false));
  }, []);

  async function loadDashboard(token: string) {
    setError("");
    return getDashboardMetrics(token)
      .then(setMetrics)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Error cargando dashboard");
      });
  }

  async function handleLogin(email: string, password: string) {
    setIsLoginLoading(true);
    setAuthError("");
    try {
      const session = await login(email, password);
      persistSession(session);
      setAuthSession(session);
      setActiveSection("dashboard");
      await loadDashboard(session.token);
    } catch {
      setAuthError("No pudimos validar esas credenciales.");
    } finally {
      setIsLoginLoading(false);
    }
  }

  async function handleRegister(payload: RegisterPayload) {
    setIsLoginLoading(true);
    setAuthError("");
    try {
      const session = await registerOwner(payload);
      persistSession(session);
      setAuthSession(session);
      setActiveSection("dashboard");
      await loadDashboard(session.token);
    } catch {
      setAuthError("No pudimos crear la cuenta. Revisa el correo o intenta con otro.");
    } finally {
      setIsLoginLoading(false);
    }
  }

  function handleLogout() {
    clearStoredSession();
    setAuthSession(null);
    setMetrics(null);
    setError("");
    setAuthError("");
    setActiveSection("dashboard");
  }

  function handlePrimaryAction() {
    setActiveSection("sales");
    setSalesFocusSignal((current) => current + 1);
  }

  if (isAuthLoading) {
    return <div className="system-panel boot-panel">Preparando tu espacio Emprendedos...</div>;
  }

  if (!authSession) {
    return <Login error={authError} isLoading={isLoginLoading} onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <Shell activeSection={activeSection} onLogout={handleLogout} onPrimaryAction={handlePrimaryAction} onSectionChange={setActiveSection} userLabel={authSession.role}>
      {activeSection === "dashboard" ? (
        <>
          {error ? <div className="system-panel">{error}</div> : null}
          {!metrics && !error ? <div className="system-panel">Cargando Emprendedos...</div> : null}
          {metrics ? <Dashboard metrics={metrics} onSectionChange={setActiveSection} token={authSession.token} /> : null}
        </>
      ) : activeSection === "recipes" ? (
        <Recipes token={authSession.token} />
      ) : activeSection === "plan" ? (
        <ActionPlan token={authSession.token} />
      ) : (
        <Operations focusSignal={activeSection === "sales" ? salesFocusSignal : 0} section={activeSection} token={authSession.token} />
      )}
    </Shell>
  );
}

function readStoredSession(): AuthSession | null {
  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!rawSession) return null;

  try {
    const parsedSession = JSON.parse(rawSession) as AuthSession;
    if (!parsedSession.token) return null;
    return parsedSession;
  } catch {
    return null;
  }
}

function persistSession(session: AuthSession) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function clearStoredSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
