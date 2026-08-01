import React, { useEffect, useMemo, useState } from "react";
import { Box, Text } from "ink";
import { useTheme } from "./theme.js";
import { renderMarkdown } from "../markdown.js";
import type { UIMessage } from "./types.js";

export interface ChatMessageViewProps {
  message: UIMessage;
  width: number;
}

const ROLE_LABEL: Record<UIMessage["role"], string> = {
  user: "you",
  assistant: "istiak",
  system: "system",
};

const CURSOR_BLINK_MS = 500;

/** A blinking block cursor at the end of the currently-streaming message. */
function useBlink(active: boolean): boolean {
  const [on, setOn] = useState(true);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setOn((prev) => !prev), CURSOR_BLINK_MS);
    return () => clearInterval(id);
  }, [active]);

  return active && on;
}

export function ChatMessageView({ message, width }: ChatMessageViewProps): React.JSX.Element {
  const theme = useTheme();
  const cursorOn = useBlink(Boolean(message.streaming));

  const accentColor =
    message.role === "user"
      ? theme.userLabel
      : message.role === "assistant"
        ? theme.assistantLabel
        : theme.muted;

  // Markdown/syntax-highlighting is applied only once a message has
  // finished streaming — re-lexing partial markdown on every token causes
  // flicker and broken formatting (e.g. an unclosed code fence).
  const rendered = useMemo(() => {
    if (message.streaming) return message.content;
    if (!message.content) return "";
    try {
      return renderMarkdown(message.content);
    } catch {
      return message.content;
    }
  }, [message.content, message.streaming]);

  return (
    <Box flexDirection="column" width={width} marginBottom={1}>
      <Box gap={1}>
        <Text bold color={accentColor}>
          {ROLE_LABEL[message.role]}
        </Text>
        {message.streaming ? <Text color={theme.muted}>generating…</Text> : null}
        {message.error ? <Text color={theme.danger}>failed</Text> : null}
      </Box>
      <Box paddingLeft={1}>
        <Text color={theme.secondary}>│ </Text>
        <Text color={message.error ? theme.danger : undefined} wrap="wrap">
          {rendered || (message.streaming ? "" : "")}
          {message.streaming && cursorOn ? <Text color={accentColor}>▌</Text> : null}
        </Text>
      </Box>
      {message.error ? (
        <Box paddingLeft={1}>
          <Text color={theme.muted}>Tip: run `istiak doctor` to check your setup.</Text>
        </Box>
      ) : null}
    </Box>
  );
}
