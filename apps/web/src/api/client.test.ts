import { describe, expect, it } from "vitest";
import { createAuthHeaders, getRegisterPath } from "./client";

describe("createAuthHeaders", () => {
  it("returns an empty header set when the session token is missing", () => {
    expect(createAuthHeaders(null)).toEqual({});
  });

  it("formats a bearer authorization header when a session token exists", () => {
    expect(createAuthHeaders("session-token")).toEqual({
      Authorization: "Bearer session-token"
    });
  });
});

describe("getRegisterPath", () => {
  it("targets the owner registration endpoint", () => {
    expect(getRegisterPath()).toBe("/v1/auth/register");
  });
});
