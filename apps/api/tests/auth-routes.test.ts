import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

describe("auth routes", () => {
  it("registers an owner with a new tenant and returns a usable token", async () => {
    const app = buildApp();
    const registerResponse = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: {
        ownerName: "Ana Emprende",
        email: "ana@example.com",
        password: "super-segura-123",
        businessName: "Casa Ana",
        businessType: "Productos artesanales",
        country: "CO",
        currency: "COP"
      }
    });
    const registerBody = registerResponse.json();

    const meResponse = await app.inject({
      method: "GET",
      url: "/v1/auth/me",
      headers: { authorization: `Bearer ${registerBody.token}` }
    });

    expect(registerResponse.statusCode).toBe(200);
    expect(registerBody.token).toEqual(expect.any(String));
    expect(registerBody.role).toBe("owner");
    expect(registerBody.userId).toEqual(expect.any(String));
    expect(registerBody.tenantId).toEqual(expect.any(String));
    expect(meResponse.json()).toMatchObject({
      userId: registerBody.userId,
      tenantId: registerBody.tenantId,
      role: "owner"
    });
  });

  it("logs in with demo credentials and returns current user context", async () => {
    const app = buildApp();
    const loginResponse = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      payload: { email: "demo@emprendedos.local", password: "emprendedos-demo" }
    });
    const loginBody = loginResponse.json();

    const meResponse = await app.inject({
      method: "GET",
      url: "/v1/auth/me",
      headers: { authorization: `Bearer ${loginBody.token}` }
    });

    expect(loginResponse.statusCode).toBe(200);
    expect(loginBody.token).toEqual(expect.any(String));
    expect(meResponse.statusCode).toBe(200);
    expect(meResponse.json()).toMatchObject({
      userId: "00000000-0000-0000-0000-000000000001",
      tenantId: "10000000-0000-0000-0000-000000000001",
      role: "owner"
    });
  });

  it("rejects invalid demo credentials", async () => {
    const app = buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      payload: { email: "demo@emprendedos.local", password: "wrong" }
    });

    expect(response.statusCode).toBe(401);
  });

  it("rejects a removed seeded identity even when demo config credentials match", async () => {
    const originalEmail = process.env.DEMO_AUTH_EMAIL;
    process.env.DEMO_AUTH_EMAIL = "missing@emprendedos.local";

    try {
      const app = buildApp();
      const response = await app.inject({
        method: "POST",
        url: "/v1/auth/login",
        payload: { email: "missing@emprendedos.local", password: "emprendedos-demo" }
      });

      expect(response.statusCode).toBe(401);
    } finally {
      if (originalEmail === undefined) {
        delete process.env.DEMO_AUTH_EMAIL;
      } else {
        process.env.DEMO_AUTH_EMAIL = originalEmail;
      }
    }
  });

  it("uses bearer token context before development headers", async () => {
    const app = buildApp();
    const loginResponse = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      payload: { email: "demo@emprendedos.local", password: "emprendedos-demo" }
    });
    const token = loginResponse.json().token;

    const response = await app.inject({
      method: "GET",
      url: "/v1/auth/me",
      headers: {
        authorization: `Bearer ${token}`,
        "x-emprendedos-tenant-id": "tenant-from-header"
      }
    });

    expect(response.json().tenantId).toBe("10000000-0000-0000-0000-000000000001");
  });
});
