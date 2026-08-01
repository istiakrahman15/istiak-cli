export type MessageRole = "user" | "assistant" | "system";

export interface UIMessage {
  id: string;
  role: MessageRole;
  content: string;
  streaming?: boolean;
  error?: boolean;
  createdAt: number;
}

let counter = 0;

/** Monotonic id generator — good enough for a single CLI session's message list. */
export function nextMessageId(): string {
  counter += 1;
  return `msg_${Date.now()}_${counter}`;
}
