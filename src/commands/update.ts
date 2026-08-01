import type { Command } from "commander";
import { execSync } from "node:child_process";
import { logger } from "../utils/logger.js";

export function registerUpdate(program: Command): void {
  program
    .command("update")
    .description("Update ISTIAK CLI to the latest version")
    .action(() => {
      try {
        logger.info("Updating istiak-cli...");
        execSync("npm install -g istiak-cli@latest", { stdio: "inherit" });
        logger.success("ISTIAK CLI updated.");
      } catch (err) {
        logger.error((err as Error).message);
        process.exitCode = 1;
      }
    });
}
