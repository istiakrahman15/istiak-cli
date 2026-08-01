import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "./theme.js";

export interface InputBoxProps {
  columns: number;
  disabled?: boolean;
  history: string[];
  modelLabel: string;
  onSubmit: (value: string) => void;
}

/**
 * Splits on Unicode code points rather than UTF-16 code units. Indexing a
 * JS string directly (`value[i]`, `value.slice(i, i+1)`) can land in the
 * middle of a surrogate pair — e.g. most emoji — and corrupt it into two
 * lone-surrogate replacement characters on the very next edit. All cursor
 * math below operates on this array instead of the raw string.
 */
function toChars(value: string): string[] {
  return Array.from(value);
}

/**
 * A minimal but real multiline text input: printable-char insertion,
 * backspace/delete, left/right cursor movement, ctrl+u (clear line),
 * ctrl+w (delete word back), up/down for message history recall, plain
 * Enter to submit, and Alt+Enter (meta+return) to insert a newline.
 * Ink has no built-in multiline TextInput, so this is hand-rolled.
 */
export function InputBox({
  columns,
  disabled,
  history,
  modelLabel,
  onSubmit,
}: InputBoxProps): React.JSX.Element {
  const theme = useTheme();
  const [value, setValue] = useState("");
  const [cursor, setCursor] = useState(0);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  useInput(
    (input, key) => {
      const chars = toChars(value);

      // Alt+Enter (many terminals report this as meta+return) inserts a newline.
      if (key.return && key.meta) {
        const next = [...chars.slice(0, cursor), "\n", ...chars.slice(cursor)].join("");
        setValue(next);
        setCursor(cursor + 1);
        return;
      }

      if (key.return) {
        const trimmed = value.trim();
        if (trimmed.length > 0) {
          onSubmit(value);
        }
        setValue("");
        setCursor(0);
        setHistoryIndex(null);
        return;
      }

      if (key.upArrow) {
        if (history.length === 0) return;
        const nextIndex =
          historyIndex === null ? history.length - 1 : Math.max(historyIndex - 1, 0);
        setHistoryIndex(nextIndex);
        const recalled = history[nextIndex] ?? "";
        setValue(recalled);
        setCursor(toChars(recalled).length);
        return;
      }

      if (key.downArrow) {
        if (historyIndex === null) return;
        const nextIndex = historyIndex + 1;
        if (nextIndex >= history.length) {
          setHistoryIndex(null);
          setValue("");
          setCursor(0);
        } else {
          setHistoryIndex(nextIndex);
          const recalled = history[nextIndex] ?? "";
          setValue(recalled);
          setCursor(toChars(recalled).length);
        }
        return;
      }

      if (key.leftArrow) {
        setCursor((c) => Math.max(c - 1, 0));
        return;
      }

      if (key.rightArrow) {
        setCursor((c) => Math.min(c + 1, chars.length));
        return;
      }

      if (key.ctrl && input === "u") {
        setValue("");
        setCursor(0);
        return;
      }

      if (key.ctrl && input === "w") {
        const beforeChars = chars.slice(0, cursor);
        const before = beforeChars.join("").replace(/\s*\S+\s*$/, "");
        setValue(before + chars.slice(cursor).join(""));
        setCursor(toChars(before).length);
        return;
      }

      if (key.backspace || key.delete) {
        if (cursor === 0) return;
        const next = [...chars.slice(0, cursor - 1), ...chars.slice(cursor)].join("");
        setValue(next);
        setCursor(cursor - 1);
        return;
      }

      if (!key.ctrl && !key.meta && input) {
        const inputChars = toChars(input);
        const next = [...chars.slice(0, cursor), ...inputChars, ...chars.slice(cursor)].join("");
        setValue(next);
        setCursor(cursor + inputChars.length);
      }
    },
    { isActive: !disabled }
  );

  const chars = toChars(value);
  const before = chars.slice(0, cursor).join("");
  const atCursor = chars[cursor] ?? " ";
  const after = chars.slice(cursor + 1).join("");

  return (
    <Box flexDirection="column" width={columns}>
      <Box
        borderStyle="round"
        borderColor={disabled ? theme.muted : theme.primary}
        paddingX={1}
        width={columns}
      >
        <Text color={theme.muted}>{"> "}</Text>
        <Text wrap="wrap">
          {before}
          <Text
            backgroundColor={disabled ? undefined : theme.primary}
            color={disabled ? undefined : "black"}
          >
            {disabled ? "" : atCursor}
          </Text>
          {after}
          {value.length === 0 ? (
            <Text color={theme.muted}>{disabled ? "waiting for response…" : "ask anything…"}</Text>
          ) : null}
        </Text>
      </Box>
      <Box justifyContent="space-between" paddingX={1}>
        <Text color={theme.muted}>
          model <Text color={theme.secondary}>{modelLabel}</Text>
        </Text>
        {value.length > 0 ? (
          <Text color={theme.muted}>{chars.length} chars</Text>
        ) : null}
      </Box>
    </Box>
  );
}
