import { describe, expect, it, vi, beforeEach } from "vitest";
import fs from "fs-extra";

vi.mock("fs-extra", () => ({
  default: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    ensureDir: vi.fn(),
    readdir: vi.fn(),
  },
}));

const mockedFs = vi.mocked(fs, { deep: true });

function fakeDirent(name: string, kind: "file" | "dir" | "symlink") {
  return {
    name,
    isDirectory: () => kind === "dir",
    isFile: () => kind === "file",
    isSymbolicLink: () => kind === "symlink",
  } as unknown as import("node:fs").Dirent;
}

describe("readFileSafe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the file contents on success", async () => {
    mockedFs.readFile.mockResolvedValue("hello" as never);
    const { readFileSafe } = await import("./files.js");
    expect(await readFileSafe("hello.txt")).toBe("hello");
  });

  it("translates ENOENT into a friendly error instead of a raw errno", async () => {
    const enoent = Object.assign(new Error("no such file"), { code: "ENOENT" });
    mockedFs.readFile.mockRejectedValue(enoent as never);

    const { readFileSafe } = await import("./files.js");
    await expect(readFileSafe("missing.txt")).rejects.toThrow(/File not found: missing\.txt/);
  });

  it("rethrows non-ENOENT errors unchanged", async () => {
    const eacces = Object.assign(new Error("permission denied"), { code: "EACCES" });
    mockedFs.readFile.mockRejectedValue(eacces as never);

    const { readFileSafe } = await import("./files.js");
    await expect(readFileSafe("locked.txt")).rejects.toThrow(/permission denied/);
  });
});

describe("listProjectFiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips symlinks instead of following or misreading them as files", async () => {
    mockedFs.readdir.mockResolvedValue([
      fakeDirent("index.ts", "file"),
      fakeDirent("link-to-somewhere", "symlink"),
      fakeDirent("node_modules", "dir"),
    ] as never);

    const { listProjectFiles } = await import("./files.js");
    const files = await listProjectFiles("/project");

    expect(files).toHaveLength(1);
    expect(files[0]).toContain("index.ts");
  });
});
