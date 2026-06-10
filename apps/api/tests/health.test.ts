import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

describe("health route", () => {
  it("returns ok", async () => {
    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/v1/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true, service: "emprendedos-api" });
  });
});
