import type { Command } from "commander";
import { createAIClient } from "../utils/resolveClient.js";
import { readFileSafe } from "../utils/files.js";
import { logger } from "../utils/logger.js";
import { printMarkdown } from "../ui/markdown.js";
import { startSpinner, stopSpinnerSuccess, stopSpinnerFail } from "../ui/spinner.js";

export function registerFix(program: Command): void {
  program
    .command("fix <file>")
    .description("Find and fix errors in a file")
    .action(async (file: string) => {
      const spinner = startSpinner(`Analyzing ${file}...`);
      try {
        const content = await readFileSafe(file);
        const client = await createAIClient();

        const result = await client.complete([
          {
            role: "system",
            content:
              "You are a debugging assistant. Identify bugs in the given file and return the corrected full file content, followed by a short explanation of what was fixed.",
          },
          { role: "user", content: `File: ${file}\n\n${content}` },
        ]);

        stopSpinnerSuccess(spinner, "Analysis complete");
        printMarkdown(result);
      } catch (err) {
        stopSpinnerFail(spinner, "Failed to analyze file");
        logger.error((err as Error).message);
        process.exitCode = 1;
      }
    });
}
