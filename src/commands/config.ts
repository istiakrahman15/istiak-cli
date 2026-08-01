import type { Command } from "commander";
import enquirer from "enquirer";
import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { MODELS, DEFAULT_MODEL } from "../ai/models.js";
import { logger } from "../utils/logger.js";

export const CONFIG_DIR = path.join(os.homedir(), ".istiak");
export const CONFIG_PATH = path.join(CONFIG_DIR, "config.json");

// Config holds a plaintext API key, so both the directory and file are
// created owner-only (no group/world access) rather than relying on the
// process umask.
const DIR_MODE = 0o700;
const FILE_MODE = 0o600;

export const VALID_THEMES = ["dark", "light", "cyber", "matrix"] as const;
export type ThemeName = (typeof VALID_THEMES)[number];

export interface IstiakConfig {
  OPENROUTER_API_KEY?: string;
  MODEL?: string;
  theme?: ThemeName;
}

function isValidTheme(value: unknown): value is ThemeName {
  return typeof value === "string" && (VALID_THEMES as readonly string[]).includes(value);
}

function sanitizeConfig(raw: unknown): IstiakConfig {
  if (typeof raw !== "object" || raw === null) return {};
  const candidate = raw as Record<string, unknown>;

  const config: IstiakConfig = {};
  if (typeof candidate.OPENROUTER_API_KEY === "string") {
    config.OPENROUTER_API_KEY = candidate.OPENROUTER_API_KEY;
  }
  if (typeof candidate.MODEL === "string") {
    config.MODEL = candidate.MODEL;
  }
  if (isValidTheme(candidate.theme)) {
    config.theme = candidate.theme;
  }
  return config;
}

export async function loadConfig(): Promise<IstiakConfig> {
  if (!(await fs.pathExists(CONFIG_PATH))) return {};
  try {
    const raw: unknown = await fs.readJson(CONFIG_PATH);
    return sanitizeConfig(raw);
  } catch {
    return {};
  }
}

export async function saveConfig(config: IstiakConfig): Promise<void> {
  await fs.ensureDir(CONFIG_DIR, { mode: DIR_MODE });
  await fs.writeJson(CONFIG_PATH, config, { spaces: 2, mode: FILE_MODE });
  // ensureDir only applies `mode` when creating the directory, so an
  // already-existing (possibly world-readable) ~/.istiak from a previous
  // run is re-tightened here too.
  await fs.chmod(CONFIG_DIR, DIR_MODE);
}

export function registerConfig(program: Command): void {
  const config = program.command("config").description("Manage ISTIAK CLI settings");

  config
    .command("set")
    .description("Interactively configure API key, model, and theme")
    .action(async () => {
      const current = await loadConfig();

      // enquirer's select/multiselect prompts take `initial` as the index
      // of the pre-selected choice, not the choice's value — passing a
      // string here (the model id / theme name) both fails to typecheck
      // against enquirer's ArrayPromptOptions and silently fails to
      // pre-select anything at runtime.
      const modelChoices = MODELS.map((m) => m.label);
      const currentModelLabel =
        MODELS.find((m) => m.id === (current.MODEL ?? DEFAULT_MODEL))?.label ??
        modelChoices[0];
      const modelInitialIndex = Math.max(modelChoices.indexOf(currentModelLabel ?? ""), 0);

      const themeChoices = [...VALID_THEMES];
      const themeInitialIndex = Math.max(themeChoices.indexOf(current.theme ?? "dark"), 0);

      const answers = await enquirer.prompt<{
        apiKey: string;
        model: string;
        theme: string;
      }>([
        {
          type: "password",
          name: "apiKey",
          message: "OpenRouter API key:",
          initial: current.OPENROUTER_API_KEY,
        },
        {
          type: "select",
          name: "model",
          message: "Default model:",
          choices: modelChoices,
          initial: modelInitialIndex,
        },
        {
          type: "select",
          name: "theme",
          message: "Theme:",
          choices: themeChoices,
          initial: themeInitialIndex,
        },
      ]);

      const model = MODELS.find((m) => m.label === answers.model)?.id ?? DEFAULT_MODEL;
      const theme = isValidTheme(answers.theme) ? answers.theme : "dark";

      await saveConfig({
        OPENROUTER_API_KEY: answers.apiKey,
        MODEL: model,
        theme,
      });

      logger.success(`Config saved to ${CONFIG_PATH}`);
    });

  config
    .command("show")
    .description("Show the current configuration")
    .action(async () => {
      const current = await loadConfig();
      console.log({
        ...current,
        OPENROUTER_API_KEY: current.OPENROUTER_API_KEY ? "••••••••" : undefined,
      });
    });
}
