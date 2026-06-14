import { FormEvent, useEffect, useState } from "react";
import { createAdminUser, listAdminAccounts, reactivateAdminUser, suspendAdminUser, type AdminAccount } from "../api/client";
import { Icon } from "./Icon";
import { Modal } from "./Modal";

const emptyForm = { ownerName: "", email: "", password: "", businessName: "", businessType: "Productos fisicos" };

export function AdminPanel({ token, currentUserId }: { token: string; currentUserId: string }) {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [form, setForm] = useState(emptyForm);

  async function load() {
    setError("");
    try {
      setAccounts(await listAdminAccounts(token));
    } catch {
      setError("No pudimos cargar las cuentas. Revisa que tengas permiso de administrador.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      await createAdminUser(form, token);
      setForm(emptyForm);
      setIsCreateOpen(false);
      await load();
    } catch {
      setError("No pudimos crear la cuenta. Revisa el correo (unico) y la contrasena (minimo 8).");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleSuspend(account: AdminAccount) {
    setBusyId(account.userId);
    setError("");
    try {
      if (account.suspended) await reactivateAdminUser(account.userId, token);
      else await suspendAdminUser(account.userId, token);
      await load();
    } catch {
      setError("No pudimos actualizar la cuenta.");
    } finally {
      setBusyId("");
    }
  }

  const suspendedCount = accounts.filter((account) => account.suspended).length;

  return (
    <main className="operations-page">
      <section className="operations-hero">
        <div>
          <p className="eyebrow">Administracion</p>
          <h1>Cuentas de la plataforma</h1>
          <p>Gestiona los emprendimientos y usuarios. Crea cuentas o suspende el acceso cuando lo necesites.</p>
        </div>
        <div className="operations-stat">
          <span>Cuentas</span>
          <strong>{accounts.length}</strong>
        </div>
      </section>

      {error ? <div className="system-panel">{error}</div> : null}

      <section className="operations-board">
        <article className="card operations-table-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">Listado</p>
              <h2>Emprendimientos {suspendedCount > 0 ? <small className="admin-suspended-note">· {suspendedCount} suspendida(s)</small> : null}</h2>
            </div>
            <button className="primary-action" type="button" onClick={() => setIsCreateOpen(true)}>
              <Icon name="plus" size={16} />
              Nueva cuenta
            </button>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Emprendimiento</th>
                  <th>Responsable</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="table-empty" colSpan={6}>
                      Cargando cuentas...
                    </td>
                  </tr>
                ) : accounts.length ? (
                  accounts.map((account) => (
                    <tr key={account.userId}>
                      <td data-label="Emprendimiento">{account.tenantName || "—"}</td>
                      <td data-label="Responsable">{account.userName || "—"}</td>
                      <td data-label="Correo">{account.email}</td>
                      <td data-label="Rol">{account.role}</td>
                      <td data-label="Estado">
                        <span className={`account-status ${account.suspended ? "is-suspended" : "is-active"}`}>
                          {account.suspended ? "Suspendida" : "Activa"}
                        </span>
                      </td>
                      <td data-label="" className="admin-row-action">
                        {account.userId === currentUserId ? (
                          <span className="account-self">Tu cuenta</span>
                        ) : (
                          <button
                            className="ghost-action"
                            type="button"
                            disabled={busyId === account.userId}
                            onClick={() => void toggleSuspend(account)}
                          >
                            {account.suspended ? "Reactivar" : "Suspender"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="table-empty" colSpan={6}>
                      Aun no hay cuentas registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <Modal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} eyebrow="Nueva cuenta" title="Crear emprendimiento">
        <form className="operations-form" onSubmit={handleCreate}>
          <div className="form-grid">
            <label>
              <span>Responsable</span>
              <input value={form.ownerName} onChange={(event) => setForm((current) => ({ ...current, ownerName: event.target.value }))} required minLength={2} />
            </label>
            <label>
              <span>Emprendimiento</span>
              <input value={form.businessName} onChange={(event) => setForm((current) => ({ ...current, businessName: event.target.value }))} required minLength={2} />
            </label>
            <label>
              <span>Tipo de negocio</span>
              <input value={form.businessType} onChange={(event) => setForm((current) => ({ ...current, businessType: event.target.value }))} required />
            </label>
            <label>
              <span>Correo</span>
              <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
            </label>
            <label>
              <span>Contrasena</span>
              <input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required minLength={8} />
              <small className="field-hint">Minimo 8 caracteres.</small>
            </label>
          </div>
          <button className="primary-action form-action" disabled={isSaving} type="submit">
            {isSaving ? "Creando..." : "Crear cuenta"}
          </button>
        </form>
      </Modal>
    </main>
  );
}
