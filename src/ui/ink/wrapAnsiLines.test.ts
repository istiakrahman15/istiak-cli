import { describe, expect, it } from "vitest";
import { wrapAnsiLines } from "./wrapAnsiLines.js";

describe("wrapAnsiLines", () => {
  it("splits plain text on existing newlines", () => {
    expect(wrapAnsiLines("a\nb\nc", 80)).toEqual(["a", "b", "c"]);
  });

  it("wraps a long line to the given width", () => {
    const lines = wrapAnsiLines("a".repeat(25), 10);
    expect(lines.length).toBeGreaterThan(1);
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(10);
    }
  });

  it("falls back to newline splitting when width is not positive", () => {
    expect(wrapAnsiLines("a\nb", 0)).toEqual(["a", "b"]);
  });
});
