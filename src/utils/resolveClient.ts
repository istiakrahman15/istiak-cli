import { AIClient } from "../ai/client.js";
import { DEFAULT_MODEL } from "../ai/models.js";
import { loadConfig } from "../commands/config.js";

/**
 * Builds an AIClient using, in priority order: environment variables
 * (OPENROUTER_API_KEY / MODEL), then the persisted config written by
 * `istiak config set` (~/.istiak/config.json), then the built-in default
 * model. Every AI-backed command should go through this so `config set`
 * actually takes effect everywhere, not just in `istiak chat`.
 */
export async function createAIClient(): Promise<AIClient> {
  const config = await loadConfig();
  const apiKey = process.env.OPENROUTER_API_KEY ?? config.OPENROUTER_API_KEY;
  const model = process.env.MODEL ?? config.MODEL ?? DEFAULT_MODEL;
  return new AIClient(apiKey, model);
}
