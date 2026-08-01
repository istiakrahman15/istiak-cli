import { describe, expect, it, vi, beforeEach } from "vitest";
import fs from "fs-extra";

vi.mock("fs-extra", () => ({
  default: {
    pathExists: vi.fn(),
    readJson: vi.fn(),
    writeJson: vi.fn(),
    remove: vi.fn(),
  },
}));

const mockedFs = vi.mocked(fs, { deep: true });

describe("history utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an empty array when no history file exists", async () => {
    mockedFs.pathExists.mockResolvedValue(false as never);
    const { loadHistory } = await import("./history.js");
    expect(await loadHistory()).toEqual([]);
  });

  it("returns an empty array when the history file is malformed", async () => {
    mockedFs.pathExists.mockResolvedValue(true as never);
    mockedFs.readJson.mockRejectedValue(new Error("bad json"));
    const { loadHistory } = await import("./history.js");
    expect(await loadHistory()).toEqual([]);
  });
});
