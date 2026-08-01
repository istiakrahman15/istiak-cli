import type { Command } from "commander";
import { createAIClient } from "../utils/resolveClient.js";
import { readFileSafe } from "../utils/files.js";
import { logger } from "../utils/logger.js";

export function registerOptimize(program: Command): void {
  program
    .command("optimize <file>")
    .description("Suggest performance optimizations for a file")
    .action(async (file: string) => {
      try {
        const content = await readFileSafe(file);
        const client = await createAIClient();

        await client.stream(
          [
            {
              role: "system",
              content:
                "Identify performance bottlenecks in the given code and propose concrete optimizations with brief before/after snippets.",
            },
            { role: "user", content: `File: ${file}\n\n${content}` },
          ],
          (chunk) => process.stdout.write(chunk)
        );
        console.log();
      } catch (err) {
        logger.error((err as Error).message);
        process.exitCode = 1;
      }
    });
}
