import { FormEvent, useState } from "react";
import type { RegisterPayload } from "../api/client";

export function Login({
  error,
  isLoading,
  onLogin,
  onRegister
}: {
  error: string;
  isLoading: boolean;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (payload: RegisterPayload) => Promise<void>;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("demo@emprendedos.local");
  const [password, setPassword] = useState("emprendedos-demo");
  const [ownerName, setOwnerName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("Productos fisicos");

  function switchMode(nextMode: "login" | "register") {
    setMode(nextMode);
    setEmail(nextMode === "login" ? "demo@emprendedos.local" : "");
    setPassword(nextMode === "login" ? "emprendedos-demo" : "");
  }

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onLogin(email, password);
  }

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onRegister({
      ownerName,
      email,
      password,
      businessName,
      businessType,
      country: "CO",
      currency: "COP"
    });
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-copy">
          <div className="brand">
            <span className="brand-mark">e</span>
            <span>
              <strong>
                emprende<span>dos</span>
              </strong>
              <small>Tu negocio, mejor acompasado</small>
            </span>
          </div>
          <div>
            <p className="eyebrow">Centro de mando</p>
            <h1>{mode === "login" ? "Entra a tu espacio de crecimiento" : "Crea el centro de mando de tu emprendimiento"}</h1>
            <p>
              Ventas, inventario, gastos y decisiones en un mismo lugar para que cada emprendedor vea su negocio con claridad.
            </p>
          </div>
        </div>

        <form className="card login-form" onSubmit={mode === "login" ? handleLoginSubmit : handleRegisterSubmit}>
          <div>
            <p className="eyebrow">Acceso</p>
            <h2>{mode === "login" ? "Iniciar sesion" : "Crear cuenta"}</h2>
          </div>
          <div className="mode-tabs">
            <button className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")} type="button">
              Entrar
            </button>
            <button className={mode === "register" ? "active" : ""} onClick={() => switchMode("register")} type="button">
              Crear
            </button>
          </div>
          {mode === "register" ? (
            <>
              <label>
                <span>Tu nombre</span>
                <input autoComplete="name" name="ownerName" onChange={(event) => setOwnerName(event.target.value)} required type="text" value={ownerName} />
              </label>
              <label>
                <span>Emprendimiento</span>
                <input name="businessName" onChange={(event) => setBusinessName(event.target.value)} required type="text" value={businessName} />
              </label>
              <label>
                <span>Tipo de negocio</span>
                <input name="businessType" onChange={(event) => setBusinessType(event.target.value)} required type="text" value={businessType} />
              </label>
            </>
          ) : null}
          <label>
            <span>Correo</span>
            <input autoComplete="email" name="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
          </label>
          <label>
            <span>Contrasena</span>
            <input autoComplete="current-password" name="password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-action form-action" disabled={isLoading} type="submit">
            {isLoading ? "Validando..." : mode === "login" ? "Entrar" : "Crear mi espacio"}
          </button>
        </form>
      </section>
    </main>
  );
}
