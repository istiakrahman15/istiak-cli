import axios, { type AxiosInstance } from "axios";
import { DEFAULT_MODEL } from "./models.js";
import { streamChatCompletion } from "./stream.js";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterChoice {
  message?: { content?: string };
  delta?: { content?: string };
}

interface OpenRouterCompletionResponse {
  choices?: OpenRouterChoice[];
}

export class AIClient {
  private http: AxiosInstance;
  private model: string;

  constructor(apiKey: string | undefined, model: string = DEFAULT_MODEL) {
    if (!apiKey) {
      throw new Error(
        "Missing OPENROUTER_API_KEY. Run `istiak config set` to configure it."
      );
    }
    this.model = model;
    this.http = axios.create({
      baseURL: OPENROUTER_BASE_URL,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/istiakrahman15/istiak-cli",
        "X-Title": "ISTIAK CLI",
      },
    });
  }

  /** Non-streaming completion — returns the full response text. */
  async complete(messages: ChatMessage[], signal?: AbortSignal): Promise<string> {
    const { data } = await this.http.post<OpenRouterCompletionResponse>(
      "/chat/completions",
      { model: this.model, messages },
      { signal }
    );
    return data.choices?.[0]?.message?.content ?? "";
  }

  /**
   * Streaming completion. Calls `onToken` for each incoming chunk of text.
   * Pass `signal` (from an AbortController) to allow the caller to cancel an
   * in-flight request — e.g. when the UI unmounts or the user hits Ctrl+C —
   * so the underlying socket doesn't keep the process alive.
   * See ai/stream.ts for the SSE parsing implementation.
   */
  async stream(
    messages: ChatMessage[],
    onToken: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<void> {
    await streamChatCompletion(this.http, this.model, messages, onToken, signal);
  }

  setModel(model: string): void {
    this.model = model;
  }
}
