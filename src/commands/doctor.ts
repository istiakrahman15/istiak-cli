import type { Command } from "commander";
import { execSync } from "node:child_process";
import { colors } from "../ui/colors.js";
import { loadConfig } from "./config.js";

interface Check {
  name: string;
  run: () => string | null | Promise<string | null>; // version/info string, or null if missing
}

const checks: Check[] = [
  {
    name: "Node.js",
    run: () => execSync("node --version", { encoding: "utf8" }).trim(),
  },
  {
    name: "npm",
    run: () => execSync("npm --version", { encoding: "utf8" }).trim(),
  },
  {
    name: "Git",
    run: () => execSync("git --version", { encoding: "utf8" }).trim(),
  },
  {
    name: "OPENROUTER_API_KEY",
    run: async () => {
      if (process.env.OPENROUTER_API_KEY) return "set (env)";
      const config = await loadConfig();
      return config.OPENROUTER_API_KEY ? "set (config)" : null;
    },
  },
];

export function registerDoctor(program: Command): void {
  program
    .command("doctor")
    .description("Check your environment (Node, npm, Git, API key)")
    .action(async () => {
      console.log(colors.bold("\nISTIAK CLI — Environment Check\n"));

      for (const check of checks) {
        try {
          const result = await check.run();
          if (result) {
            console.log(colors.success("✔"), check.name, colors.muted(`(${result})`));
          } else {
            console.log(colors.warning("⚠"), check.name, colors.muted("not configured"));
          }
        } catch {
          console.log(colors.danger("✖"), check.name, colors.muted("not found"));
        }
      }
      console.log();
    });
}
