import wrapAnsi from "wrap-ansi";

/**
 * Splits ANSI-colored text into a flat array of visual lines wrapped to
 * `width`, preserving color codes across line breaks. Used to compute how
 * many terminal rows a message occupies for the scrollable chat viewport.
 */
export function wrapAnsiLines(text: string, width: number): string[] {
  if (width <= 0) return text.split("\n");
  const wrapped = wrapAnsi(text, width, { hard: true, trim: false });
  return wrapped.split("\n");
}
