import React, { useMemo, useRef } from "react";
import { Box, Text } from "ink";
import { useTheme } from "./theme.js";
import { ChatMessageView } from "./ChatMessage.js";
import { WelcomeScreen } from "./WelcomeScreen.js";
import { renderMarkdown } from "../markdown.js";
import { wrapAnsiLines } from "./wrapAnsiLines.js";
import type { UIMessage } from "./types.js";

export interface MessageListProps {
  messages: UIMessage[];
  columns: number;
  availableRows: number;
  /** Number of messages scrolled up from the bottom (0 = pinned to latest). */
  scrollOffset: number;
  modelLabel: string;
}

const LABEL_LINES = 1;
const MARGIN_LINES = 1;

interface HeightCacheEntry {
  content: string;
  streaming: boolean;
  width: number;
  height: number;
}

function computeHeight(message: UIMessage, innerWidth: number): number {
  const text = message.streaming
    ? message.content
    : (() => {
        try {
          return renderMarkdown(message.content || "");
        } catch {
          return message.content;
        }
      })();
  const lines = wrapAnsiLines(text || " ", innerWidth).length;
  return lines + LABEL_LINES + MARGIN_LINES;
}

/**
 * Renders a windowed slice of the conversation so it fits the terminal's
 * current height, with a message-count-based scroll offset (PageUp/PageDown
 * in App.tsx) standing in for a true scroll container, which Ink has no
 * native primitive for.
 */
export function MessageList({
  messages,
  columns,
  availableRows,
  scrollOffset,
  modelLabel,
}: MessageListProps): React.JSX.Element {
  const theme = useTheme();
  const innerWidth = Math.max(columns - 4, 20);

  // Every streamed token changes `messages`' reference, which would
  // otherwise force every already-completed message in the visible window
  // to be re-parsed as markdown just to re-derive the same height. This
  // cache makes that cost O(1) for messages whose content/streaming state
  // hasn't actually changed since the last render.
  const heightCache = useRef<Map<string, HeightCacheEntry>>(new Map());

  const { visible, hiddenAbove, hiddenBelow } = useMemo(() => {
    const cache = heightCache.current;
    const liveIds = new Set(messages.map((m) => m.id));
    for (const id of cache.keys()) {
      if (!liveIds.has(id)) cache.delete(id);
    }

    const getHeight = (message: UIMessage): number => {
      const cached = cache.get(message.id);
      if (
        cached &&
        cached.content === message.content &&
        cached.streaming === message.streaming &&
        cached.width === innerWidth
      ) {
        return cached.height;
      }
      const height = computeHeight(message, innerWidth);
      cache.set(message.id, {
        content: message.content,
        streaming: Boolean(message.streaming),
        width: innerWidth,
        height,
      });
      return height;
    };

    if (messages.length === 0) {
      return { visible: [] as UIMessage[], hiddenAbove: 0, hiddenBelow: 0 };
    }

    const clampedOffset = Math.min(Math.max(scrollOffset, 0), messages.length - 1);
    const endIndex = messages.length - 1 - clampedOffset;

    let budget = Math.max(availableRows, 3);
    let startIndex = endIndex;

    for (let i = endIndex; i >= 0; i -= 1) {
      const message = messages[i];
      if (!message) break;
      const height = getHeight(message);
      if (height > budget && startIndex !== endIndex) break;
      budget -= height;
      startIndex = i;
      if (budget <= 0) break;
    }

    return {
      visible: messages.slice(startIndex, endIndex + 1),
      hiddenAbove: startIndex,
      hiddenBelow: messages.length - 1 - endIndex,
    };
  }, [messages, availableRows, innerWidth, scrollOffset]);

  if (messages.length === 0) {
    return <WelcomeScreen modelLabel={modelLabel} columns={columns} />;
  }

  return (
    <Box flexDirection="column" width={columns}>
      {hiddenAbove > 0 ? (
        <Text color={theme.muted}>
          ↑ {hiddenAbove} earlier message{hiddenAbove === 1 ? "" : "s"} (PgUp to scroll)
        </Text>
      ) : null}
      {visible.map((message) => (
        <ChatMessageView key={message.id} message={message} width={columns} />
      ))}
      {hiddenBelow > 0 ? (
        <Text color={theme.muted}>
          ↓ {hiddenBelow} newer message{hiddenBelow === 1 ? "" : "s"} (PgDn to scroll)
        </Text>
      ) : null}
    </Box>
  );
}
