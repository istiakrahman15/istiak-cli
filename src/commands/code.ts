import type { Command } from "commander";
import clipboardy from "clipboardy";
import { createAIClient } from "../utils/resolveClient.js";
import { writeFileSafe } from "../utils/files.js";
import { logger } from "../utils/logger.js";

export function registerCode(program: Command): void {
  program
    .command("code <prompt>")
    .description("Generate code from a natural-language prompt")
    .option("-o, --out <file>", "Write the generated code to a file")
    .option("-c, --copy", "Copy the generated code to the clipboard")
    .action(async (prompt: string, opts: { out?: string; copy?: boolean }) => {
      try {
        const client = await createAIClient();

        let full = "";
        await client.stream(
          [
            {
              role: "system",
              content:
                "You are a senior software engineer. Respond only with code and minimal necessary comments.",
            },
            { role: "user", content: prompt },
          ],
          (chunk) => {
            process.stdout.write(chunk);
            full += chunk;
          }
        );
        console.log();

        if (opts.out) {
          await writeFileSafe(opts.out, full);
          logger.success(`Saved to ${opts.out}`);
        }

        if (opts.copy) {
          try {
            await clipboardy.write(full);
            logger.success("Copied to clipboard");
          } catch (err) {
            // Headless CI/SSH sessions often have no clipboard available —
            // that shouldn't fail a command that already succeeded.
            logger.warn(`Could not copy to clipboard: ${(err as Error).message}`);
          }
        }
      } catch (err) {
        logger.error((err as Error).message);
        process.exitCode = 1;
      }
    });
}
