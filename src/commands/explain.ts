import type { Command } from "commander";
import { createAIClient } from "../utils/resolveClient.js";
import { readFileSafe } from "../utils/files.js";
import { logger } from "../utils/logger.js";

export function registerExplain(program: Command): void {
  program
    .command("explain <file>")
    .description("Explain what a piece of code does")
    .action(async (file: string) => {
      try {
        const content = await readFileSafe(file);
        const client = await createAIClient();

        await client.stream(
          [
            {
              role: "system",
              content:
                "Explain the given code clearly and concisely for a developer reading it for the first time.",
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
