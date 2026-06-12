import { describe, expect, it } from "vitest";
import { resolveRequestContext } from "../src/auth/context.js";
import { signAuthToken } from "../src/auth/tokens.js";

describe("resolveRequestContext", () => {
  it("uses demo context when development fallback is enabled and headers are missing", () => {
    const context = resolveRequestContext({}, { allowDevelopmentContext: true });

    expect(context.tenantId).toBe("10000000-0000-0000-0000-000000000001");
    expect(context.userId).toBe("00000000-0000-0000-0000-000000000001");
    expect(context.role).toBe("owner");
  });

  it("uses request headers only when development fallback is enabled", () => {
    const context = resolveRequestContext(
      {
        "x-emprendedos-tenant-id": "tenant-a",
        "x-emprendedos-user-id": "user-a",
        "x-emprendedos-role": "operator"
      },
      { allowDevelopmentContext: true }
    );

    expect(context.tenantId).toBe("tenant-a");
    expect(context.userId).toBe("user-a");
    expect(context.role).toBe("operator");
  });

  it("throws when no bearer token is present and development fallback is disabled", () => {
    expect(() => resolveRequestContext({}, { allowDevelopmentContext: false })).toThrow("Authentication required");
  });

  it("uses bearer token context before development headers", () => {
    const token = signAuthToken(
      { userId: "token-user", tenantId: "token-tenant", role: "owner" },
      { secret: "dev-only-emprendedos-secret" }
    );

    const context = resolveRequestContext(
      {
        authorization: `Bearer ${token}`,
        "x-emprendedos-tenant-id": "tenant-from-header",
        "x-emprendedos-user-id": "user-from-header",
        "x-emprendedos-role": "operator"
      },
      { allowDevelopmentContext: true }
    );

    expect(context).toEqual({ userId: "token-user", tenantId: "token-tenant", role: "owner" });
  });

  it("falls back to owner role when development role header is unsupported", () => {
    const context = resolveRequestContext({ "x-emprendedos-role": "superuser" }, { allowDevelopmentContext: true });

    expect(context.role).toBe("owner");
  });
});
