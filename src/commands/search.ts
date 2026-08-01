import type { Command } from "commander";
import { createAIClient } from "../utils/resolveClient.js";
import { logger } from "../utils/logger.js";

export function registerSearch(program: Command): void {
  program
    .command("search <query>")
    .description("Search developer documentation and get a summarized answer")
    .action(async (query: string) => {
      try {
        const client = await createAIClient();

        await client.stream(
          [
            {
              role: "system",
              content:
                "Answer the developer's documentation question concisely, citing the relevant library/API names. If unsure, say so rather than guessing.",
            },
            { role: "user", content: query },
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
