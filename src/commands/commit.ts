import type { Command } from "commander";
import { execSync, execFileSync } from "node:child_process";
import { createAIClient } from "../utils/resolveClient.js";
import { logger } from "../utils/logger.js";

export function registerCommit(program: Command): void {
  program
    .command("commit")
    .description("Generate a git commit message from staged changes")
    .option("--apply", "Run `git commit` with the generated message")
    .action(async (opts: { apply?: boolean }) => {
      try {
        const diff = execSync("git diff --cached", { encoding: "utf8" });
        if (!diff.trim()) {
          logger.warn("No staged changes. Run `git add` first.");
          return;
        }

        const client = await createAIClient();

        const message = await client.complete([
          {
            role: "system",
            content:
              "Write a single, concise conventional-commit style commit message (type: summary) for the given diff. Return only the message.",
          },
          { role: "user", content: diff },
        ]);

        console.log(message.trim());

        if (opts.apply) {
          execFileSync("git", ["commit", "-m", message.trim()], {
            stdio: "inherit",
          });
        }
      } catch (err) {
        logger.error((err as Error).message);
        process.exitCode = 1;
      }
    });
}
