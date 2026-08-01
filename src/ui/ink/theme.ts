import { createContext, useContext } from "react";
import type { ThemeName } from "../colors.js";

export interface InkPalette {
  name: ThemeName;
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  muted: string;
  text: string;
  border: string;
  userLabel: string;
  assistantLabel: string;
}

// Each palette is self-contained so the whole UI can re-skin at once.
export const PALETTES: Record<ThemeName, InkPalette> = {
  dark: {
    name: "dark",
    primary: "#00E5FF",
    secondary: "#7C8DB5",
    accent: "#FF3CAC",
    success: "#00FF9C",
    warning: "#FFD166",
    danger: "#FF5C5C",
    muted: "gray",
    text: "white",
    border: "#2A2F3A",
    userLabel: "#00E5FF",
    assistantLabel: "#FF3CAC",
  },
  light: {
    name: "light",
    primary: "#0066CC",
    secondary: "#5B6B82",
    accent: "#CC0066",
    success: "#0A8F4C",
    warning: "#B58900",
    danger: "#CC3333",
    muted: "gray",
    text: "black",
    border: "#D0D5DD",
    userLabel: "#0066CC",
    assistantLabel: "#CC0066",
  },
  cyber: {
    name: "cyber",
    primary: "#00FFF7",
    secondary: "#8A6BFF",
    accent: "#FF00E6",
    success: "#39FF14",
    warning: "#FFEA00",
    danger: "#FF003C",
    muted: "gray",
    text: "#E8FFFF",
    border: "#1F3B3B",
    userLabel: "#00FFF7",
    assistantLabel: "#FF00E6",
  },
  matrix: {
    name: "matrix",
    primary: "#00FF41",
    secondary: "#4CAF50",
    accent: "#008F11",
    success: "#00FF41",
    warning: "#B8FF00",
    danger: "#FF3131",
    muted: "gray",
    text: "#B7FFB7",
    border: "#0D3B0D",
    userLabel: "#00FF41",
    assistantLabel: "#008F11",
  },
};

export const ThemeContext = createContext<InkPalette>(PALETTES.dark);

export function useTheme(): InkPalette {
  return useContext(ThemeContext);
}

export function resolvePalette(name: string | undefined): InkPalette {
  if (name && name in PALETTES) {
    return PALETTES[name as ThemeName];
  }
  return PALETTES.dark;
}

export const THEME_ORDER: ThemeName[] = ["dark", "cyber", "matrix", "light"];
