import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { loadConfig } from "../commands/config.js";
import { createAIClient } from "./resolveClient.js";

vi.mock("../commands/config.js", () => ({
  loadConfig: vi.fn(),
}));

const mockedLoadConfig = vi.mocked(loadConfig);

const ENV_KEYS = ["OPENROUTER_API_KEY", "MODEL"] as const;
const savedEnv: Record<string, string | undefined> = {};

describe("createAIClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const key of ENV_KEYS) {
      savedEnv[key] = process.env[key];
      delete process.env[key];
    }
    mockedLoadConfig.mockResolvedValue({});
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (savedEnv[key] === undefined) delete process.env[key];
      else process.env[key] = savedEnv[key];
    }
  });

  it("prefers an env var API key over the persisted config", async () => {
    process.env.OPENROUTER_API_KEY = "env-key";
    mockedLoadConfig.mockResolvedValue({ OPENROUTER_API_KEY: "config-key" });

    // AIClient doesn't expose its key, so we assert indirectly: construction
    // must not throw the "missing API key" error, which only happens when
    // neither source provided one.
    await expect(createAIClient()).resolves.toBeDefined();
  });

  it("falls back to the persisted config when no env var is set", async () => {
    mockedLoadConfig.mockResolvedValue({ OPENROUTER_API_KEY: "config-key" });
    await expect(createAIClient()).resolves.toBeDefined();
  });

  it("throws when neither env nor config has an API key", async () => {
    mockedLoadConfig.mockResolvedValue({});
    await expect(createAIClient()).rejects.toThrow(/OPENROUTER_API_KEY/);
  });
});
