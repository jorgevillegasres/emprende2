import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

describe("weekly capture + flags", () => {
  it("requires the quickCapture flag, then records an aggregate entry that feeds cash flow", async () => {
    const app = buildApp();

    // Sin el flag, la captura esta deshabilitada para el tenant.
    const blocked = await app.inject({
      method: "POST",
      url: "/v1/capture/weekly",
      payload: { periodStart: "2026-06-15", periodEnd: "2026-06-21", revenue: 100000, cashOut: 40000 }
    });
    expect(blocked.statusCode).toBe(403);

    // El tenant activa la captura rapida (opt-in).
    const enabled = await app.inject({ method: "POST", url: "/v1/tenant/flags", payload: { quickCapture: true } });
    expect(enabled.statusCode).toBe(200);
    expect(enabled.json().featureFlags.quickCapture).toBe(true);

    // Ahora la captura funciona.
    const captured = await app.inject({
      method: "POST",
      url: "/v1/capture/weekly",
      payload: { periodStart: "2026-06-15", periodEnd: "2026-06-21", revenue: 100000, cashOut: 40000 }
    });
    expect(captured.statusCode).toBe(200);
    expect(captured.json().revenue).toBe(100000);

    // El flag viaja en /v1/auth/me.
    const me = await app.inject({ method: "GET", url: "/v1/auth/me" });
    expect(me.json().featureFlags.quickCapture).toBe(true);

    // El dashboard refleja la captura en su resultado de caja.
    const dashboard = await app.inject({ method: "GET", url: "/v1/dashboard?month=2026-06" });
    const body = dashboard.json();
    expect(body.cashFlow.usesAggregateCapture).toBe(true);
    expect(body.cashFlow.aggregateRevenue).toBe(100000);
  });

  it("accepts allowlisted events and rejects unknown ones", async () => {
    const app = buildApp();

    const ok = await app.inject({ method: "POST", url: "/v1/events", payload: { name: "calculator_used", props: { margin: 12 } } });
    expect(ok.statusCode).toBe(202);

    const bad = await app.inject({ method: "POST", url: "/v1/events", payload: { name: "definitely_not_allowed" } });
    expect(bad.statusCode).toBe(400);
  });
});
