import type { Command } from "commander";
import { render } from "ink";
import React from "react";
import { ChatApp } from "../ui/ink/App.js";
import { resolveModel, DEFAULT_MODEL } from "../ai/models.js";
import { loadConfig } from "./config.js";

export function registerChat(program: Command): void {
  program
    .command("chat")
    .description("Start an interactive AI chat session")
    .action(async () => {
      const config = await loadConfig();

      const apiKey = process.env.OPENROUTER_API_KEY ?? config.OPENROUTER_API_KEY;
      const modelId = process.env.MODEL ?? config.MODEL ?? DEFAULT_MODEL;
      const resolved = resolveModel(modelId);
      const modelLabel = resolved?.label ?? modelId;
      const theme = config.theme ?? "dark";

      const { waitUntilExit } = render(
        React.createElement(ChatApp, {
          apiKey,
          model: modelId,
          modelLabel,
          theme,
        }),
        { exitOnCtrlC: false }
      );

      await waitUntilExit();
    });
}
