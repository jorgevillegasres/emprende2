import { describe, expect, it } from "vitest";
import { getPrimaryActionSection } from "./shellActions";

describe("getPrimaryActionSection", () => {
  it("routes the persistent primary action to sales", () => {
    expect(getPrimaryActionSection()).toBe("sales");
  });
});
