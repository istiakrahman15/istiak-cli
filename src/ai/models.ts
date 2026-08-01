export interface ModelDefinition {
  id: string;
  label: string;
  provider: "deepseek" | "openai" | "anthropic" | "google" | "qwen" | "meta";
}

// Model IDs follow OpenRouter's `provider/model` naming convention.
export const MODELS: ModelDefinition[] = [
  { id: "deepseek/deepseek-chat", label: "DeepSeek", provider: "deepseek" },
  { id: "openai/gpt-4o-mini", label: "GPT", provider: "openai" },
  { id: "anthropic/claude-3.5-sonnet", label: "Claude", provider: "anthropic" },
  { id: "google/gemini-pro-1.5", label: "Gemini", provider: "google" },
  { id: "qwen/qwen-2.5-72b-instruct", label: "Qwen", provider: "qwen" },
  { id: "meta-llama/llama-3.1-70b-instruct", label: "Llama", provider: "meta" },
];

export const DEFAULT_MODEL = "deepseek/deepseek-chat";

export function resolveModel(idOrLabel: string): ModelDefinition | undefined {
  const needle = idOrLabel.toLowerCase();
  return MODELS.find(
    (m) => m.id.toLowerCase() === needle || m.label.toLowerCase() === needle
  );
}
