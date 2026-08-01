import type { Command } from "commander";
import { execFileSync } from "node:child_process";
import fs from "fs-extra";
import { logger } from "../utils/logger.js";

interface ScaffoldStep {
  cmd: string;
  args: string[];
  /** Run inside this directory instead of the current one. */
  cwd?: string;
  /** Create `cwd` before running, for tools that don't create it themselves. */
  createCwd?: boolean;
}

// Argv-array scaffolders — never a shell string. This avoids two problems
// with the previous implementation: (1) the project name was interpolated
// into a `bash -c` string, so a name like `foo; rm -rf ~` would execute
// arbitrary shell commands, and (2) it hardcoded `/bin/bash`, which doesn't
// exist on Windows even though the PRD targets Windows for v1.
const SCAFFOLDERS: Record<string, (name: string) => ScaffoldStep> = {
  react: (name) => ({
    cmd: "npm",
    args: ["create", "vite@latest", name, "--", "--template", "react-ts"],
  }),
  vue: (name) => ({
    cmd: "npm",
    args: ["create", "vite@latest", name, "--", "--template", "vue-ts"],
  }),
  node: (name) => ({
    cmd: "npm",
    args: ["init", "-y"],
    cwd: name,
    createCwd: true,
  }),
  express: (name) => ({ cmd: "npm", args: ["create", "express-app@latest", name] }),
  next: (name) => ({ cmd: "npx", args: ["create-next-app@latest", name] }),
};

// Project names become directory/argv entries; keep them to a conservative,
// cross-platform-safe charset instead of trusting arbitrary input.
const SAFE_NAME = /^[a-zA-Z0-9._-]+$/;

export function registerCreate(program: Command): void {
  program
    .command("create <template> <name>")
    .description("Scaffold a new project (react, vue, node, express, next)")
    .action(async (template: string, name: string) => {
      const scaffolder = SCAFFOLDERS[template.toLowerCase()];
      if (!scaffolder) {
        logger.error(
          `Unknown template "${template}". Available: ${Object.keys(SCAFFOLDERS).join(", ")}`
        );
        process.exitCode = 1;
        return;
      }

      if (!SAFE_NAME.test(name)) {
        logger.error(
          `Invalid project name "${name}". Use only letters, numbers, dots, dashes, and underscores.`
        );
        process.exitCode = 1;
        return;
      }

      const { cmd, args, cwd, createCwd } = scaffolder(name);
      logger.info(`Running: ${cmd} ${args.join(" ")}${cwd ? ` (in ./${cwd})` : ""}`);

      try {
        if (cwd && createCwd) {
          await fs.ensureDir(cwd);
        }
        execFileSync(cmd, args, { stdio: "inherit", cwd });
        logger.success(`Project "${name}" created.`);
      } catch (err) {
        logger.error((err as Error).message);
        process.exitCode = 1;
      }
    });
}
