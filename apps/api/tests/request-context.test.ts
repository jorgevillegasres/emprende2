import { describe, expect, it } from "vitest";
import { resolveRequestContext } from "../src/auth/context.js";

describe("resolveRequestContext", () => {
  it("uses demo context when headers are missing", () => {
    const context = resolveRequestContext({});

    expect(context.tenantId).toBe("10000000-0000-0000-0000-000000000001");
    expect(context.userId).toBe("00000000-0000-0000-0000-000000000001");
    expect(context.role).toBe("owner");
  });

  it("uses request headers when present", () => {
    const context = resolveRequestContext({
      "x-emprendedos-tenant-id": "tenant-a",
      "x-emprendedos-user-id": "user-a",
      "x-emprendedos-role": "operator"
    });

    expect(context.tenantId).toBe("tenant-a");
    expect(context.userId).toBe("user-a");
    expect(context.role).toBe("operator");
  });

  it("falls back to owner role when role header is unsupported", () => {
    const context = resolveRequestContext({
      "x-emprendedos-role": "superuser"
    });

    expect(context.role).toBe("owner");
  });
});
