import type { Command } from "commander";
import { execSync } from "node:child_process";
import { logger } from "../utils/logger.js";
import { colors } from "../ui/colors.js";

function git(cmd: string): string {
  return execSync(`git ${cmd}`, { encoding: "utf8" }).trim();
}

export function registerGit(program: Command): void {
  const gitCmd = program.command("git").description("Git helper utilities");

  gitCmd
    .command("status")
    .description("Show a friendly git status summary")
    .action(() => {
      try {
        console.log(colors.bold(`\nBranch: ${git("rev-parse --abbrev-ref HEAD")}\n`));
        console.log(git("status -sb"));
      } catch (err) {
        logger.error((err as Error).message);
        process.exitCode = 1;
      }
    });

  gitCmd
    .command("undo")
    .description("Undo the last commit (soft reset)")
    .action(() => {
      try {
        execSync("git reset --soft HEAD~1", { stdio: "inherit" });
        logger.success("Last commit undone (changes kept staged).");
      } catch (err) {
        logger.error((err as Error).message);
        process.exitCode = 1;
      }
    });

  gitCmd
    .command("clean-branches")
    .description("List local branches already merged into the current branch")
    .action(() => {
      try {
        const merged = git("branch --merged").split("\n").map((b) => b.trim());
        for (const b of merged) {
          if (b && !b.startsWith("*")) console.log(b);
        }
      } catch (err) {
        logger.error((err as Error).message);
        process.exitCode = 1;
      }
    });
}
