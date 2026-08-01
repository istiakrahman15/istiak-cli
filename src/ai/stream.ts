import type { AxiosInstance } from "axios";
import type { Readable } from "node:stream";
import type { ChatMessage } from "./client.js";

interface StreamDelta {
  choices?: Array<{ delta?: { content?: string } }>;
}

/**
 * Streams a chat completion from OpenRouter using server-sent events and
 * invokes `onToken` for each text delta as it arrives.
 *
 * The response stream's listeners are always torn down exactly once the
 * promise settles (success, error, or abort) so a resolved/rejected
 * promise never leaves a dangling 'data' listener still consuming — and
 * therefore keeping the process alive — in the background.
 */
export async function streamChatCompletion(
  http: AxiosInstance,
  model: string,
  messages: ChatMessage[],
  onToken: (chunk: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await http.post<Readable>(
    "/chat/completions",
    { model, messages, stream: true },
    { responseType: "stream", signal }
  );

  const body = response.data;

  return new Promise((resolve, reject) => {
    let buffer = "";
    let settled = false;

    const cleanup = () => {
      body.off("data", onData);
      body.off("end", onEnd);
      body.off("error", onError);
      if (!body.destroyed) body.destroy();
    };

    const settleResolve = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };

    const settleReject = (err: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(err);
    };

    function onData(chunk: Buffer) {
      buffer += chunk.toString("utf8");
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;

        const payload = trimmed.replace(/^data:\s*/, "");
        if (payload === "[DONE]") {
          settleResolve();
          return;
        }

        try {
          const json = JSON.parse(payload) as StreamDelta;
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) onToken(delta);
        } catch {
          // Ignore malformed keep-alive/partial chunks.
        }
      }
    }

    function onEnd() {
      settleResolve();
    }

    function onError(err: Error) {
      settleReject(err);
    }

    body.on("data", onData);
    body.on("end", onEnd);
    body.on("error", onError);
  });
}
