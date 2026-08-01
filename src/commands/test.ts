import type { Command } from "commander";
import path from "node:path";
import { createAIClient } from "../utils/resolveClient.js";
import { readFileSafe, writeFileSafe } from "../utils/files.js";
import { logger } from "../utils/logger.js";

export function registerTest(program: Command): void {
  program
    .command("test <file>")
    .description("Generate tests for a file")
    .option("-o, --out <file>", "Write the generated tests to a file")
    .action(async (file: string, opts: { out?: string }) => {
      try {
        const content = await readFileSafe(file);
        const client = await createAIClient();

        const result = await client.complete([
          {
            role: "system",
            content:
              "Write unit tests for the given source file using Vitest. Cover the main behaviors and edge cases. Return only code.",
          },
          { role: "user", content: `File: ${file}\n\n${content}` },
        ]);

        const outPath =
          opts.out ??
          path.join(
            path.dirname(file),
            `${path.basename(file, path.extname(file))}.test${path.extname(file)}`
          );

        await writeFileSafe(outPath, result);
        logger.success(`Tests saved to ${outPath}`);
      } catch (err) {
        logger.error((err as Error).message);
        process.exitCode = 1;
      }
    });
}
