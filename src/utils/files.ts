import fs from "fs-extra";
import path from "node:path";

export async function readFileSafe(filePath: string): Promise<string> {
  const resolved = path.resolve(filePath);
  try {
    // Reading directly (rather than pathExists() then readFile()) avoids a
    // check-then-use race where the file could vanish between the two
    // calls, and it's one syscall instead of two.
    return await fs.readFile(resolved, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`File not found: ${filePath}`);
    }
    throw err;
  }
}

export async function writeFileSafe(filePath: string, content: string): Promise<void> {
  const resolved = path.resolve(filePath);
  await fs.ensureDir(path.dirname(resolved));
  await fs.writeFile(resolved, content, "utf8");
}

export async function listProjectFiles(
  dir: string,
  ignore: string[] = ["node_modules", ".git", "dist", "build"]
): Promise<string[]> {
  const resolved = path.resolve(dir);
  const entries = await fs.readdir(resolved, { withFileTypes: true });

  const results: string[] = [];
  for (const entry of entries) {
    if (ignore.includes(entry.name)) continue;

    // Symlinks are skipped rather than followed: a symlinked directory can
    // create an infinite recursion loop (e.g. a link pointing back at an
    // ancestor directory), and a symlink Dirent reports isDirectory() as
    // false, so without this check it would previously fall through to the
    // "file" branch below and later crash `readFileSafe`/`review` on a
    // dangling or directory-pointing link.
    if (entry.isSymbolicLink()) continue;

    const full = path.join(resolved, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await listProjectFiles(full, ignore)));
    } else if (entry.isFile()) {
      results.push(full);
    }
  }
  return results;
}
