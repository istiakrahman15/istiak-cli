import type { Command } from "commander";
import { MODELS, resolveModel } from "../ai/models.js";
import { loadConfig, saveConfig } from "./config.js";
import { logger } from "../utils/logger.js";
import { colors } from "../ui/colors.js";

export function registerModel(program: Command): void {
  program
    .command("model [name]")
    .description("List or switch the active AI model")
    .action(async (name?: string) => {
      if (!name) {
        console.log(colors.bold("\nAvailable models:\n"));
        for (const m of MODELS) {
          console.log(` ${colors.primary("•")} ${m.label} ${colors.muted(`(${m.id})`)}`);
        }
        console.log(colors.muted("\nSwitch with: istiak model <name>\n"));
        return;
      }

      const resolved = resolveModel(name);
      if (!resolved) {
        logger.error(`Unknown model "${name}". Run \`istiak model\` to see options.`);
        process.exitCode = 1;
        return;
      }

      const current = await loadConfig();
      await saveConfig({ ...current, MODEL: resolved.id });

      logger.success(`Switched default model to ${resolved.label} (${resolved.id})`);
    });
}
