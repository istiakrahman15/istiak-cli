import { Marked } from "marked";
import { markedTerminal } from "marked-terminal";

// A fresh Marked instance per call keeps this stateless and safe to reuse
// across concurrent renders (e.g. multiple messages re-rendering), rather
// than mutating the global `marked` singleton as a module-load side effect.
//
// Syntax highlighting for fenced code blocks is handled internally by
// marked-terminal via cli-highlight — `ignoreIllegals: true` is passed as
// its highlightOptions (the second constructor argument) so an unrecognized
// language tag degrades to plain text instead of throwing. There's no need
// for (and no such thing as) a custom highlighter callback here: marked-
// terminal's own `code` option is a chalk *style* function applied around
// the already-highlighted output, not a highlighter itself.
function createRenderer() {
  const instance = new Marked();
  instance.use(markedTerminal({ reflowText: false }, { ignoreIllegals: true }));
  return instance;
}

/** Renders markdown to an ANSI-colored string suited for terminal output. */
export function renderMarkdown(text: string): string {
  const out = createRenderer().parse(text, { async: false }) as string;
  return out.replace(/\n+$/, "");
}

export function printMarkdown(text: string): void {
  console.log(renderMarkdown(text));
}
