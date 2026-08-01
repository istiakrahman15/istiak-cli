import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "./theme.js";

export interface HeaderProps {
  projectName: string;
  modelLabel: string;
  connected: boolean;
  cwd: string;
  sessionTime: string;
  columns: number;
}

// Breakpoints for which status-bar fields fit. Below MIN, we drop to the
// bare minimum (title + model) rather than truncating fields into
// unreadable fragments.
const SHOW_EXTRAS_AT = 100;
const SHOW_THEME_AT = 78;
const MIN_USABLE = 50;

export function Header({
  projectName,
  modelLabel,
  connected,
  cwd,
  sessionTime,
  columns,
}: HeaderProps): React.JSX.Element {
  const theme = useTheme();
  const showTheme = columns >= SHOW_THEME_AT;
  const showExtras = columns >= SHOW_EXTRAS_AT;
  const compact = columns < MIN_USABLE;

  return (
    <Box
      borderStyle="round"
      borderColor={theme.border}
      paddingX={1}
      justifyContent="space-between"
      width={columns}
    >
      <Box gap={1}>
        <Text bold color={theme.primary}>
          {compact ? "ISTIAK" : projectName}
        </Text>
        {!compact ? <Text color={theme.muted}>chat</Text> : null}
      </Box>

      <Box gap={2}>
        <Box gap={1}>
          <Text color={connected ? theme.success : theme.danger}>●</Text>
          {!compact ? (
            <Text color={theme.muted}>{connected ? "connected" : "no API key"}</Text>
          ) : null}
        </Box>

        <Box gap={1}>
          <Text color={theme.muted}>model</Text>
          <Text color={theme.accent} bold>
            {modelLabel}
          </Text>
        </Box>

        {showTheme ? (
          <Box gap={1}>
            <Text color={theme.muted}>theme</Text>
            <Text color={theme.secondary}>{theme.name}</Text>
          </Box>
        ) : null}

        {showExtras ? (
          <Box gap={1}>
            <Text color={theme.muted}>dir</Text>
            <Text color={theme.text}>{cwd}</Text>
          </Box>
        ) : null}

        {showExtras ? (
          <Box gap={1}>
            <Text color={theme.muted}>session</Text>
            <Text color={theme.text}>{sessionTime}</Text>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
