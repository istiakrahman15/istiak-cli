import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "./theme.js";

export interface FooterProps {
  columns: number;
  status?: string;
  isError?: boolean;
}

const FULL_HINTS =
  "enter send · alt+enter newline · ↑/↓ history · pgup/pgdn scroll · ctrl+l clear · ctrl+p palette · ctrl+c exit";
const MEDIUM_HINTS = "enter send · alt+enter newline · pgup/pgdn scroll · ctrl+p palette · ctrl+c exit";
const SHORT_HINTS = "enter send · ctrl+p palette · ctrl+c exit";

function hintsFor(columns: number): string {
  if (columns >= 115) return FULL_HINTS;
  if (columns >= 80) return MEDIUM_HINTS;
  return SHORT_HINTS;
}

export function Footer({ columns, status, isError }: FooterProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Box justifyContent="space-between" width={columns} paddingX={1}>
      <Text color={theme.muted}>{hintsFor(columns)}</Text>
      {status ? <Text color={isError ? theme.danger : theme.muted}>{status}</Text> : null}
    </Box>
  );
}
