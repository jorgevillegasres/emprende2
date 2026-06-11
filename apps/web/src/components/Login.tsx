import { FormEvent, useState } from "react";

export function Login({
  error,
  isLoading,
  onLogin
}: {
  error: string;
  isLoading: boolean;
  onLogin: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("demo@emprendedos.local");
  const [password, setPassword] = useState("emprendedos-demo");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onLogin(email, password);
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
            <h1>Entra a tu espacio de crecimiento</h1>
            <p>
              Ventas, inventario, gastos y decisiones en un mismo lugar para que cada emprendedor vea su negocio con claridad.
            </p>
          </div>
        </div>

        <form className="card login-form" onSubmit={handleSubmit}>
          <div>
            <p className="eyebrow">Acceso</p>
            <h2>Iniciar sesion</h2>
          </div>
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
            {isLoading ? "Validando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
