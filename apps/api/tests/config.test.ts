import { describe, expect, it } from "vitest";
import { getConfig } from "../src/config.js";

describe("getConfig", () => {
  it("uses memory data store by default", () => {
    const config = getConfig({});

    expect(config.dataStore).toBe("memory");
    expect(config.databaseUrl).toBe("postgres://postgres:postgres@127.0.0.1:5432/emprendedos");
  });

  it("uses postgres data store when requested", () => {
    const config = getConfig({
      DATA_STORE: "postgres",
      DATABASE_URL: "postgres://user:pass@localhost:5432/app"
    });

    expect(config.dataStore).toBe("postgres");
    expect(config.databaseUrl).toBe("postgres://user:pass@localhost:5432/app");
  });
});
