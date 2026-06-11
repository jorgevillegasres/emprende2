import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

describe("auth routes", () => {
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
