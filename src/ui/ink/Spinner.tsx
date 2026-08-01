import React from "react";
import { Text } from "ink";
import InkSpinner from "ink-spinner";
import { useTheme } from "./theme.js";

export function Spinner({ label }: { label: string }): React.JSX.Element {
  const theme = useTheme();
  return (
    <Text color={theme.primary}>
      <InkSpinner type="dots" /> {label}
    </Text>
  );
}
