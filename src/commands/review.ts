import type { Command } from "commander";
import path from "node:path";
import { createAIClient } from "../utils/resolveClient.js";
import { listProjectFiles, readFileSafe } from "../utils/files.js";
import { logger } from "../utils/logger.js";
import { printMarkdown } from "../ui/markdown.js";
import { startSpinner, stopSpinnerSuccess, stopSpinnerFail } from "../ui/spinner.js";

const REVIEWABLE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".java"]);
const MAX_FILES = 20;

export function registerReview(program: Command): void {
  program
    .command("review [target]")
    .description("Review a project or a single file")
    .action(async (target: string = ".") => {
      const spinner = startSpinner(`Reviewing ${target}...`);
      try {
        const files = (await listProjectFiles(target))
          .filter((f) => REVIEWABLE_EXT.has(path.extname(f)))
          .slice(0, MAX_FILES);

        // A single unreadable file (permission denied, binary content, a
        // broken symlink slipping through, etc.) used to reject the whole
        // Promise.all and abort the review with no output at all.
        // allSettled means one bad file just gets skipped and noted.
        const results = await Promise.allSettled(
          files.map(async (f) => `--- ${f} ---\n${await readFileSafe(f)}`)
        );

        const snippets: string[] = [];
        const skipped: string[] = [];
        results.forEach((result, i) => {
          if (result.status === "fulfilled") {
            snippets.push(result.value);
          } else {
            skipped.push(files[i] ?? "(unknown file)");
          }
        });

        const client = await createAIClient();

        const result = await client.complete([
          {
            role: "system",
            content:
              "You are a senior code reviewer. Summarize code quality, bugs, and suggestions across the given files, organized by file.",
          },
          { role: "user", content: snippets.join("\n\n") || "No reviewable files found." },
        ]);

        stopSpinnerSuccess(spinner, `Reviewed ${snippets.length} file(s)`);
        printMarkdown(result);

        if (skipped.length > 0) {
          logger.warn(`Skipped ${skipped.length} unreadable file(s): ${skipped.join(", ")}`);
        }
      } catch (err) {
        stopSpinnerFail(spinner, "Review failed");
        logger.error((err as Error).message);
        process.exitCode = 1;
      }
    });
}
