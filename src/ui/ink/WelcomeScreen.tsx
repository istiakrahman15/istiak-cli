import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "./theme.js";
import { ASCII_LOGO, TAGLINE, VERSION } from "./logo.js";

export interface WelcomeScreenProps {
  modelLabel: string;
  columns: number;
}

const EXAMPLES = [
  "explain this codebase",
  "write a debounce function in TypeScript",
  "why is my build failing?",
  "review src/index.ts",
];

export function WelcomeScreen({ modelLabel, columns }: WelcomeScreenProps): React.JSX.Element {
  const theme = useTheme();
  const showLogo = columns >= 44;

  return (
    <Box flexDirection="column" width={columns} paddingY={1}>
      {showLogo ? (
        <Box flexDirection="column" marginBottom={1}>
          {ASCII_LOGO.map((line, i) => (
            <Text key={i} color={theme.primary}>
              {line}
            </Text>
          ))}
        </Box>
      ) : (
        <Text bold color={theme.primary}>
          ISTIAK CLI
        </Text>
      )}

      <Text color={theme.muted}>
        {TAGLINE} · v{VERSION} · model <Text color={theme.accent}>{modelLabel}</Text>
      </Text>

      <Box marginTop={1} flexDirection="column">
        <Text color={theme.secondary}>Try asking:</Text>
        {EXAMPLES.map((example) => (
          <Text key={example} color={theme.text}>
            {"  "}
            <Text color={theme.muted}>›</Text> {example}
          </Text>
        ))}
      </Box>

      <Box marginTop={1}>
        <Text color={theme.muted}>Ctrl+P for the command palette · Enter to send</Text>
      </Box>
    </Box>
  );
}
