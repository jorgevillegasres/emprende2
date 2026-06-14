import { describe, expect, it } from "vitest";
import { signAuthToken, verifyAuthToken } from "../src/auth/tokens.js";

describe("auth tokens", () => {
  it("signs and verifies a request context", () => {
    const token = signAuthToken(
      { userId: "user-a", tenantId: "tenant-a", role: "admin" },
      { secret: "test-secret", now: 1_000, expiresInSeconds: 60 }
    );

    expect(verifyAuthToken(token, { secret: "test-secret", now: 1_030 })).toEqual({
      userId: "user-a",
      tenantId: "tenant-a",
      role: "admin",
      superAdmin: false
    });
  });

  it("rejects tampered tokens", () => {
    const token = signAuthToken(
      { userId: "user-a", tenantId: "tenant-a", role: "admin" },
      { secret: "test-secret", now: 1_000, expiresInSeconds: 60 }
    );
    const [encodedPayload, signature] = token.split(".");
    const tamperedPayload = Buffer.from(
      JSON.stringify({ userId: "user-a", tenantId: "tenant-b", role: "admin", exp: 1_060 }),
      "utf8"
    ).toString("base64url");
    const tampered = `${tamperedPayload}.${signature}`;

    expect(verifyAuthToken(tampered, { secret: "test-secret", now: 1_030 })).toBeNull();
  });

  it("rejects expired tokens", () => {
    const token = signAuthToken(
      { userId: "user-a", tenantId: "tenant-a", role: "admin" },
      { secret: "test-secret", now: 1_000, expiresInSeconds: 60 }
    );

    expect(verifyAuthToken(token, { secret: "test-secret", now: 1_061 })).toBeNull();
  });
});
