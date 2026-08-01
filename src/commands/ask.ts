import type { Command } from "commander";
import { createAIClient } from "../utils/resolveClient.js";
import { appendHistory } from "../utils/history.js";
import { logger } from "../utils/logger.js";

export function registerAsk(program: Command): void {
  program
    .command("ask <question>")
    .description("Ask the AI a one-shot question")
    .action(async (question: string) => {
      try {
        const client = await createAIClient();

        let full = "";
        await client.stream([{ role: "user", content: question }], (chunk) => {
          process.stdout.write(chunk);
          full += chunk;
        });
        console.log();

        await appendHistory({ role: "user", content: question });
        await appendHistory({ role: "assistant", content: full });
      } catch (err) {
        logger.error((err as Error).message);
        process.exitCode = 1;
      }
    });
}
