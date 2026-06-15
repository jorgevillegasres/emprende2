import { useEffect, useState } from "react";
import { demoLogin, getCurrentUser, getDashboardMetrics, login, registerOwner, track, type AuthSession, type DashboardMetrics, type RegisterPayload } from "./api/client";
import { ActionPlan } from "./components/ActionPlanView";
import { AdminPanel } from "./components/AdminPanel";
import { Dashboard } from "./components/Dashboard";
import { Landing } from "./components/Landing";
import { Login } from "./components/Login";
import { MarginCalculator } from "./components/MarginCalculator";
import { Operations } from "./components/Operations";
import { WeeklyCapture } from "./components/WeeklyCapture";
import { Recipes } from "./components/Recipes";
import { Shell, type AppSection, type ShellNotification } from "./components/Shell";

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
  const [authView, setAuthView] = useState<"landing" | "login" | "calculator">("landing");
  const [loginInitialMode, setLoginInitialMode] = useState<"login" | "register">("login");
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const [searchQuery, setSearchQuery] = useState("");

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
      .then((metrics) => {
        setMetrics(metrics);
        track("dashboard_viewed", { month }, token);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Error cargando dashboard");
      });
  }

  function handleEnableCapture() {
    setAuthSession((session) => {
      if (!session) return session;
      const updated = { ...session, featureFlags: { ...session.featureFlags, quickCapture: true } };
      persistSession(updated);
      return updated;
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
      track("register_completed", {}, session.token);
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
      track("demo_opened", {}, session.token);
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

  function changeSection(section: AppSection) {
    setActiveSection(section);
    setSearchQuery("");
  }

  function handlePrimaryAction() {
    changeSection("sales");
    setSalesFocusSignal((current) => current + 1);
  }

  const searchEnabled = activeSection === "products" || activeSection === "supplies" || activeSection === "sales" || activeSection === "expenses";
  const notifications = metrics ? buildNotifications(metrics) : [];

  if (isAuthLoading) {
    return <div className="system-panel boot-panel">Preparando tu espacio Emprendedos...</div>;
  }

  if (!authSession) {
    if (authView === "calculator") {
      return (
        <MarginCalculator
          onBack={() => setAuthView("landing")}
          onRegister={() => {
            setLoginInitialMode("register");
            setAuthView("login");
          }}
        />
      );
    }
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
        onCalculator={() => setAuthView("calculator")}
      />
    );
  }

  return (
    <Shell
      activeSection={activeSection}
      onLogout={handleLogout}
      onPrimaryAction={handlePrimaryAction}
      onSectionChange={changeSection}
      userLabel={authSession.role}
      isSuperAdmin={authSession.superAdmin}
      periodLabel={formatMonthLabel(selectedMonth)}
      canGoNextPeriod={selectedMonth < currentMonthKey()}
      onPrevPeriod={() => setSelectedMonth((month) => shiftMonth(month, -1))}
      onNextPeriod={() => setSelectedMonth((month) => shiftMonth(month, 1))}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchEnabled={searchEnabled}
      notifications={notifications}
    >
      {activeSection === "dashboard" ? (
        <>
          {error ? <div className="system-panel">{error}</div> : null}
          {!metrics && !error ? <div className="system-panel">Cargando Emprendedos...</div> : null}
          {metrics ? (
            <>
              <WeeklyCapture
                token={authSession.token}
                quickCapture={authSession.featureFlags?.quickCapture ?? false}
                cashFlow={metrics.cashFlow}
                onEnable={handleEnableCapture}
                onCaptured={() => void loadDashboard(authSession.token, selectedMonth)}
              />
              <Dashboard metrics={metrics} onSectionChange={changeSection} token={authSession.token} />
            </>
          ) : null}
        </>
      ) : activeSection === "recipes" ? (
        <Recipes token={authSession.token} />
      ) : activeSection === "plan" ? (
        <ActionPlan token={authSession.token} />
      ) : activeSection === "admin" ? (
        <AdminPanel token={authSession.token} currentUserId={authSession.userId} />
      ) : (
        <Operations focusSignal={activeSection === "sales" ? salesFocusSignal : 0} section={activeSection} token={authSession.token} searchQuery={searchQuery} />
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

function buildNotifications(metrics: DashboardMetrics): ShellNotification[] {
  const fmt = (value: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
  const notifications: ShellNotification[] = [];

  for (const item of metrics.stockForecast.filter((forecast) => forecast.status === "critical").slice(0, 3)) {
    notifications.push({
      id: `forecast-${item.productId}`,
      tone: "danger",
      title: `Por agotarse: ${item.name}`,
      detail: item.daysRemaining !== null ? `Te quedan ~${item.daysRemaining} dias de stock al ritmo actual.` : "Stock muy bajo."
    });
  }

  for (const item of metrics.lowStockItems.slice(0, 4)) {
    notifications.push({
      id: `lowstock-${item.type}-${item.name}`,
      tone: item.stock <= item.minStock * 0.5 ? "danger" : "warning",
      title: `Stock bajo: ${item.name}`,
      detail: `${item.stock} disponibles (minimo ${item.minStock}${item.unit ? ` ${item.unit}` : ""}).`
    });
  }

  if (metrics.breakEven.canEstimate && !metrics.breakEven.isCovered) {
    notifications.push({
      id: "breakeven",
      tone: "warning",
      title: "Aun no cubres tus gastos",
      detail: `Te faltan ${fmt(metrics.breakEven.revenueGap)} en ventas este mes.`
    });
  }

  if (metrics.netAfterExpenses < 0) {
    notifications.push({
      id: "net-negative",
      tone: "danger",
      title: "Resultado del mes en rojo",
      detail: `Estas gastando ${fmt(Math.abs(metrics.netAfterExpenses))} mas de lo que ganas.`
    });
  }

  return notifications;
}
