import chalk from "chalk";

export const colors = {
  primary: chalk.hex("#00E5FF"),
  accent: chalk.hex("#FF3CAC"),
  success: chalk.hex("#00FF9C"),
  warning: chalk.hex("#FFD166"),
  danger: chalk.hex("#FF5C5C"),
  muted: chalk.gray,
  bold: chalk.bold,
};

export type ThemeName = "dark" | "light" | "cyber" | "matrix";

export const themes: Record<ThemeName, { primary: string; accent: string }> = {
  dark: { primary: "#00E5FF", accent: "#FF3CAC" },
  light: { primary: "#0066CC", accent: "#CC0066" },
  cyber: { primary: "#00FFF7", accent: "#FF00E6" },
  matrix: { primary: "#00FF41", accent: "#008F11" },
};
