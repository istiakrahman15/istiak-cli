#!/usr/bin/env node
// Ensures dist/index.js is executable on POSIX systems after every build.
// npm's own bin-linking (via `npm link` / `npm install -g`) already sets
// this permission when it creates the global command shim, so this is a
// defensive backstop — it matters for anyone running `./dist/index.js` or
// `node dist/index.js` directly without going through npm's bin machinery.
// A no-op on Windows, which has no POSIX execute bit for chmod to set.
import { chmodSync } from "node:fs";

try {
  chmodSync("dist/index.js", 0o755);
} catch {
  // Non-fatal: nothing to chmod (e.g. build produced no output) shouldn't
  // fail the build itself.
}
