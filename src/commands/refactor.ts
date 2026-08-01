import type { Command } from "commander";
import { createAIClient } from "../utils/resolveClient.js";
import { readFileSafe, writeFileSafe } from "../utils/files.js";
import { logger } from "../utils/logger.js";

export function registerRefactor(program: Command): void {
  program
    .command("refactor <file>")
    .description("Refactor a file for clarity and maintainability")
    .option("--apply", "Overwrite the file with the refactored version")
    .action(async (file: string, opts: { apply?: boolean }) => {
      try {
        const content = await readFileSafe(file);
        const client = await createAIClient();

        const result = await client.complete([
          {
            role: "system",
            content:
              "Refactor the given code for readability and maintainability without changing its behavior. Return only the refactored code.",
          },
          { role: "user", content: `File: ${file}\n\n${content}` },
        ]);

        if (opts.apply) {
          await writeFileSafe(file, result);
          logger.success(`Refactored ${file} in place`);
        } else {
          console.log(result);
        }
      } catch (err) {
        logger.error((err as Error).message);
        process.exitCode = 1;
      }
    });
}
