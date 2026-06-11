import { describe, expect, it } from "vitest";
import { createAuthHeaders } from "./client";

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
