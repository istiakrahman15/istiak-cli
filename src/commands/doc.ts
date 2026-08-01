import type { Command } from "commander";
import { createAIClient } from "../utils/resolveClient.js";
import { readFileSafe, writeFileSafe } from "../utils/files.js";
import { logger } from "../utils/logger.js";
import { printMarkdown } from "../ui/markdown.js";

export function registerDoc(program: Command): void {
  program
    .command("doc <file>")
    .description("Generate documentation for a file")
    .option("-o, --out <file>", "Write the documentation to a file")
    .action(async (file: string, opts: { out?: string }) => {
      try {
        const content = await readFileSafe(file);
        const client = await createAIClient();

        const result = await client.complete([
          {
            role: "system",
            content:
              "Generate clear Markdown documentation (purpose, usage, parameters, return values) for the given source file.",
          },
          { role: "user", content: `File: ${file}\n\n${content}` },
        ]);

        if (opts.out) {
          await writeFileSafe(opts.out, result);
          logger.success(`Documentation saved to ${opts.out}`);
        } else {
          printMarkdown(result);
        }
      } catch (err) {
        logger.error((err as Error).message);
        process.exitCode = 1;
      }
    });
}
