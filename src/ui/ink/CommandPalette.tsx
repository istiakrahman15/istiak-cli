import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "./theme.js";

export interface PaletteItem {
  id: string;
  label: string;
  description?: string;
}

export interface PaletteSection {
  title: string;
  items: PaletteItem[];
}

export interface CommandPaletteProps {
  sections: PaletteSection[];
  columns: number;
  onSelect: (id: string) => void;
  onClose: () => void;
}

/**
 * A full-width overlay that replaces the message list while open (Ink has
 * no layered/absolute positioning, so "overlay" here means swapping out
 * that region of the normal flow layout — see App.tsx). Ctrl+P toggles it
 * open; Escape, or selecting an item, closes it.
 */
export function CommandPalette({
  sections,
  columns,
  onSelect,
  onClose,
}: CommandPaletteProps): React.JSX.Element {
  const theme = useTheme();
  const flatItems = sections.flatMap((section) => section.items);
  const [index, setIndex] = useState(0);

  useInput((_input, key) => {
    if (key.escape) {
      onClose();
      return;
    }
    if (key.upArrow) {
      setIndex((i) => (flatItems.length === 0 ? 0 : (i - 1 + flatItems.length) % flatItems.length));
      return;
    }
    if (key.downArrow) {
      setIndex((i) => (flatItems.length === 0 ? 0 : (i + 1) % flatItems.length));
      return;
    }
    if (key.return) {
      const item = flatItems[index];
      if (item) onSelect(item.id);
    }
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
        Command Palette
      </Text>
      <Text color={theme.muted}>↑/↓ navigate · enter select · esc close</Text>

      {sections.map((section) => (
        <Box key={section.title} flexDirection="column" marginTop={1}>
          <Text color={theme.secondary}>{section.title}</Text>
          {section.items.map((item) => {
            const isSelected = flatItems[index]?.id === item.id;
            return (
              <Text key={item.id} color={isSelected ? theme.primary : theme.text} bold={isSelected}>
                {isSelected ? "› " : "  "}
                {item.label}
                {item.description ? <Text color={theme.muted}> — {item.description}</Text> : null}
              </Text>
            );
          })}
        </Box>
      ))}
    </Box>
  );
}
