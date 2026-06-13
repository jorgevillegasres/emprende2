import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getConfig } from "../src/config.js";

describe("getConfig", () => {
  it("uses memory data store by default", () => {
    const config = getConfig({});

    expect(config.dataStore).toBe("memory");
    expect(config.host).toBe("127.0.0.1");
    expect(config.databaseUrl).toBe("postgres://postgres:postgres@127.0.0.1:5432/emprendedos");
    expect(config.webOrigins).toEqual(["http://127.0.0.1:5173", "http://localhost:5173"]);
  });

  it("uses an explicit API host when provided by the deployment platform", () => {
    const config = getConfig({ API_HOST: "0.0.0.0" });

    expect(config.host).toBe("0.0.0.0");
  });

  it("uses postgres data store when requested", () => {
    const config = getConfig({
      DATA_STORE: "postgres",
      DATABASE_URL: "postgres://user:pass@localhost:5432/app"
    });

    expect(config.dataStore).toBe("postgres");
    expect(config.databaseUrl).toBe("postgres://user:pass@localhost:5432/app");
  });

  it("accepts a comma-separated web origin allowlist", () => {
    const config = getConfig({
      WEB_ORIGIN: "https://app.emprendedos.com, https://demo.emprendedos.com "
    });

    expect(config.webOrigins).toEqual(["https://app.emprendedos.com", "https://demo.emprendedos.com"]);
  });

  it("documents the required SaaS environment variables in the root example file", () => {
    const envExample = readFileSync(resolve(process.cwd(), "../../.env.example"), "utf8");

    expect(envExample).toContain("DATA_STORE=memory");
    expect(envExample).toContain("DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/emprendedos");
    expect(envExample).toContain("API_PORT=3001");
    expect(envExample).toContain("API_HOST=127.0.0.1");
    expect(envExample).toContain("WEB_ORIGIN=http://127.0.0.1:5173,http://localhost:5173");
    expect(envExample).toContain("VITE_API_BASE_URL=http://127.0.0.1:3001");
    expect(envExample).toContain("AUTH_SECRET=");
    expect(envExample).toContain("ALLOW_DEV_REQUEST_CONTEXT=true");
  });
});
