import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../src/auth/passwords.js";

describe("password hashing", () => {
  it("hashes and verifies a password without storing the raw value", async () => {
    const hash = await hashPassword("emprendedos-demo");

    expect(hash).not.toBe("emprendedos-demo");
    expect(hash.startsWith("scrypt:")).toBe(true);
    await expect(verifyPassword("emprendedos-demo", hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });
});
