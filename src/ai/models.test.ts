import { describe, expect, it } from "vitest";
import { DEFAULT_MODEL, MODELS, resolveModel } from "./models.js";

describe("resolveModel", () => {
  it("resolves by exact model id", () => {
    const result = resolveModel("deepseek/deepseek-chat");
    expect(result?.label).toBe("DeepSeek");
  });

  it("resolves by label, case-insensitively", () => {
    const result = resolveModel("claude");
    expect(result?.id).toBe("anthropic/claude-3.5-sonnet");
  });

  it("returns undefined for an unknown model", () => {
    expect(resolveModel("not-a-real-model")).toBeUndefined();
  });

  it("includes the default model in the supported list", () => {
    expect(MODELS.some((m) => m.id === DEFAULT_MODEL)).toBe(true);
  });
});
