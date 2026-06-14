import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Shell } from "./Shell";

describe("Shell", () => {
  it("renders a sidebar with grouped navigation and a topbar action", () => {
    const markup = renderToStaticMarkup(
      <Shell activeSection="dashboard" onSectionChange={() => undefined} userLabel="owner">
        <main>Content</main>
      </Shell>
    );

    expect(markup).toContain('class="sidebar"');
    expect(markup).toContain('class="nav-group"');
    expect(markup).toContain('aria-label="Secciones principales"');
    expect(markup).toContain("Registrar venta");
  });
});
