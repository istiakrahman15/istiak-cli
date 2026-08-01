import React from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "./theme.js";

export interface HelpOverlayProps {
  columns: number;
  onClose: () => void;
}

interface HelpSection {
  title: string;
  rows: Array<{ keys: string; description: string }>;
}

const SECTIONS: HelpSection[] = [
  {
    title: "Chatting",
    rows: [
      { keys: "Enter", description: "Send the current message" },
      { keys: "Alt+Enter", description: "Insert a newline without sending" },
      { keys: "↑ / ↓", description: "Recall previous messages you sent" },
    ],
  },
  {
    title: "Navigating",
    rows: [
      { keys: "PgUp / PgDn", description: "Scroll the conversation history" },
      { keys: "Ctrl+L", description: "Clear the conversation" },
    ],
  },
  {
    title: "Tools",
    rows: [
      { keys: "Ctrl+P", description: "Open the command palette (theme, model, clear, help)" },
      { keys: "Ctrl+C", description: "Exit" },
    ],
  },
  {
    title: "Editing",
    rows: [
      { keys: "Ctrl+U", description: "Clear the current input line" },
      { keys: "Ctrl+W", description: "Delete the previous word" },
      { keys: "← / →", description: "Move the cursor" },
    ],
  },
];

export function HelpOverlay({ columns, onClose }: HelpOverlayProps): React.JSX.Element {
  const theme = useTheme();

  useInput((_input, key) => {
    if (key.escape || key.return) onClose();
  });

  return (
    <Box
      flexDirection="column"
      width={columns}
      borderStyle="round"
      borderColor={theme.primary}
      paddingX={1}
    >
      <Text bold color={theme.primary}>
        Help
      </Text>
      <Text color={theme.muted}>esc or enter to close</Text>

      {SECTIONS.map((section) => (
        <Box key={section.title} flexDirection="column" marginTop={1}>
          <Text color={theme.secondary}>{section.title}</Text>
          {section.rows.map((row) => (
            <Box key={row.keys} gap={1}>
              <Box width={14}>
                <Text color={theme.accent}>{row.keys}</Text>
              </Box>
              <Text color={theme.text}>{row.description}</Text>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}
