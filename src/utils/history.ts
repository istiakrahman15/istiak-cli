import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import type { ChatMessage } from "../ai/client.js";

const HISTORY_PATH = path.join(os.homedir(), ".istiak-history.json");

// Chat history can contain sensitive content (code, secrets pasted into a
// prompt, etc.), so the file is restricted to the owner only.
const FILE_MODE = 0o600;

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    (candidate.role === "system" || candidate.role === "user" || candidate.role === "assistant") &&
    typeof candidate.content === "string"
  );
}

export async function loadHistory(): Promise<ChatMessage[]> {
  if (!(await fs.pathExists(HISTORY_PATH))) return [];
  try {
    const raw: unknown = await fs.readJson(HISTORY_PATH);
    return Array.isArray(raw) ? raw.filter(isChatMessage) : [];
  } catch {
    return [];
  }
}

export async function saveHistory(messages: ChatMessage[]): Promise<void> {
  await fs.writeJson(HISTORY_PATH, messages, { spaces: 2, mode: FILE_MODE });
}

// appendHistory does a read-modify-write of a single shared file. Two
// overlapping calls (e.g. a fast user message immediately followed by an
// assistant reply) could otherwise interleave their reads and one write
// would silently clobber the other. This chain serializes every call
// through the same tail promise so writes always happen one at a time, in
// call order, regardless of how quickly they're fired.
let writeQueue: Promise<void> = Promise.resolve();

export function appendHistory(message: ChatMessage): Promise<void> {
  writeQueue = writeQueue
    .catch(() => {
      // A previous write failing shouldn't permanently wedge the queue.
    })
    .then(async () => {
      const history = await loadHistory();
      history.push(message);
      await saveHistory(history);
    });
  return writeQueue;
}

export async function clearHistory(): Promise<void> {
  await fs.remove(HISTORY_PATH);
}
