import { describe, expect, it, vi, beforeEach } from "vitest";
import fs from "fs-extra";

vi.mock("fs-extra", () => ({
  default: {
    pathExists: vi.fn(),
    readJson: vi.fn(),
    writeJson: vi.fn(),
    ensureDir: vi.fn(),
    chmod: vi.fn(),
  },
}));

const mockedFs = vi.mocked(fs, { deep: true });

describe("loadConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an empty object when no config file exists", async () => {
    mockedFs.pathExists.mockResolvedValue(false as never);
    const { loadConfig } = await import("./config.js");
    expect(await loadConfig()).toEqual({});
  });

  it("keeps only known, well-typed fields and drops the rest", async () => {
    mockedFs.pathExists.mockResolvedValue(true as never);
    mockedFs.readJson.mockResolvedValue({
      OPENROUTER_API_KEY: "sk-abc",
      MODEL: "deepseek/deepseek-chat",
      theme: "matrix",
      unexpectedField: "should be dropped",
    } as never);

    const { loadConfig } = await import("./config.js");
    expect(await loadConfig()).toEqual({
      OPENROUTER_API_KEY: "sk-abc",
      MODEL: "deepseek/deepseek-chat",
      theme: "matrix",
    });
  });

  it("silently drops an invalid theme value rather than trusting a hand-edited file", async () => {
    mockedFs.pathExists.mockResolvedValue(true as never);
    mockedFs.readJson.mockResolvedValue({ theme: "not-a-real-theme" } as never);

    const { loadConfig } = await import("./config.js");
    expect(await loadConfig()).toEqual({});
  });

  it("returns an empty object when the config file is malformed JSON", async () => {
    mockedFs.pathExists.mockResolvedValue(true as never);
    mockedFs.readJson.mockRejectedValue(new Error("bad json"));

    const { loadConfig } = await import("./config.js");
    expect(await loadConfig()).toEqual({});
  });
});

describe("saveConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("writes the config file with owner-only permissions", async () => {
    const { saveConfig, CONFIG_PATH, CONFIG_DIR } = await import("./config.js");
    await saveConfig({ OPENROUTER_API_KEY: "sk-abc" });

    expect(mockedFs.ensureDir).toHaveBeenCalledWith(CONFIG_DIR, { mode: 0o700 });
    expect(mockedFs.writeJson).toHaveBeenCalledWith(
      CONFIG_PATH,
      { OPENROUTER_API_KEY: "sk-abc" },
      { spaces: 2, mode: 0o600 }
    );
    expect(mockedFs.chmod).toHaveBeenCalledWith(CONFIG_DIR, 0o700);
  });
});
