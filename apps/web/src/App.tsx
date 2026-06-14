import { useEffect, useState } from "react";
import { demoLogin, getCurrentUser, getDashboardMetrics, login, registerOwner, type AuthSession, type DashboardMetrics, type RegisterPayload } from "./api/client";
import { ActionPlan } from "./components/ActionPlanView";
import { AdminPanel } from "./components/AdminPanel";
import { Dashboard } from "./components/Dashboard";
import { Landing } from "./components/Landing";
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
  const [authView, setAuthView] = useState<"landing" | "login">("landing");
  const [loginInitialMode, setLoginInitialMode] = useState<"login" | "register">("login");
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());

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
      })
      .catch(() => {
        clearStoredSession();
        setAuthError("Tu sesion expiro. Inicia sesion de nuevo.");
      })
      .finally(() => setIsAuthLoading(false));
  }, []);

  // Carga el dashboard cuando hay sesion y cuando cambia el periodo seleccionado.
  useEffect(() => {
    if (!authSession) return;
    void loadDashboard(authSession.token, selectedMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authSession, selectedMonth]);

  async function loadDashboard(token: string, month: string) {
    setError("");
    return getDashboardMetrics(token, month)
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
    } catch {
      setAuthError("No pudimos crear la cuenta. Revisa el correo o intenta con otro.");
    } finally {
      setIsLoginLoading(false);
    }
  }

  async function handleDemoLogin() {
    setIsDemoLoading(true);
    setAuthError("");
    try {
      const session = await demoLogin();
      persistSession(session);
      setAuthSession(session);
      setActiveSection("dashboard");
    } catch {
      setAuthError("No pudimos abrir el demo. Intenta de nuevo.");
    } finally {
      setIsDemoLoading(false);
    }
  }

  function handleLogout() {
    clearStoredSession();
    setAuthSession(null);
    setMetrics(null);
    setError("");
    setAuthError("");
    setActiveSection("dashboard");
    setAuthView("landing");
  }

  function handlePrimaryAction() {
    setActiveSection("sales");
    setSalesFocusSignal((current) => current + 1);
  }

  if (isAuthLoading) {
    return <div className="system-panel boot-panel">Preparando tu espacio Emprendedos...</div>;
  }

  if (!authSession) {
    if (authView === "login") {
      return (
        <Login
          error={authError}
          isLoading={isLoginLoading}
          initialMode={loginInitialMode}
          onBack={() => setAuthView("landing")}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      );
    }
    return (
      <Landing
        onLogin={() => {
          setLoginInitialMode("login");
          setAuthView("login");
        }}
        onRegister={() => {
          setLoginInitialMode("register");
          setAuthView("login");
        }}
        onDemo={handleDemoLogin}
        demoLoading={isDemoLoading}
      />
    );
  }

  return (
    <Shell
      activeSection={activeSection}
      onLogout={handleLogout}
      onPrimaryAction={handlePrimaryAction}
      onSectionChange={setActiveSection}
      userLabel={authSession.role}
      isSuperAdmin={authSession.superAdmin}
      periodLabel={formatMonthLabel(selectedMonth)}
      canGoNextPeriod={selectedMonth < currentMonthKey()}
      onPrevPeriod={() => setSelectedMonth((month) => shiftMonth(month, -1))}
      onNextPeriod={() => setSelectedMonth((month) => shiftMonth(month, 1))}
    >
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
      ) : activeSection === "admin" ? (
        <AdminPanel token={authSession.token} currentUserId={authSession.userId} />
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

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function currentMonthKey(): string {
  return new Date().toISOString().slice(0, 7);
}

function shiftMonth(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return `${MONTHS_ES[month - 1] ?? monthKey} ${year}`;
}
