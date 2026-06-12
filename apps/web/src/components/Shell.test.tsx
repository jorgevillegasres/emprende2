import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Shell } from "./Shell";

describe("Shell", () => {
  it("separates scrollable navigation from persistent actions", () => {
    const markup = renderToStaticMarkup(
      <Shell activeSection="dashboard" onSectionChange={() => undefined} userLabel="owner">
        <main>Content</main>
      </Shell>
    );

    expect(markup).toContain('class="nav-viewport"');
    expect(markup).toContain('aria-label="Secciones principales"');
    expect(markup).toContain("Registrar venta");
  });
});
