// No usable typings resolve for "marked-terminal" with the installed
// version (neither a bundled `.d.ts` nor a compatible `@types/marked-terminal`
// package), so this is a hand-written shim. It only covers the API surface
// this project actually uses — see src/ui/markdown.ts — plus the option
// names documented in marked-terminal's README, rather than mirroring the
// package's full internal implementation.

declare module "marked-terminal" {
  import type { MarkedExtension } from "marked";

  /**
   * Most renderer options are either a style function applied to the
   * already-rendered text (e.g. a chalk color function, which has this
   * exact call signature), or `false`/`undefined` to leave the default
   * rendering as-is.
   */
  type StyleFn = (text: string) => string;

  export interface TerminalRendererOptions {
    code?: StyleFn;
    blockquote?: StyleFn;
    html?: StyleFn;
    heading?: StyleFn;
    firstHeading?: StyleFn;
    hr?: StyleFn;
    listitem?: StyleFn;
    table?: StyleFn;
    paragraph?: StyleFn;
    strong?: StyleFn;
    em?: StyleFn;
    codespan?: StyleFn;
    del?: StyleFn;
    link?: StyleFn;
    href?: StyleFn;
    text?: StyleFn;
    /** Unescape HTML entities in the output. */
    unescape?: boolean;
    /** Render `:emoji:` shortcodes. */
    emoji?: boolean;
    /** Wrap width for text; defaults to the terminal width. */
    width?: number;
    /** Prefix headings with a `#`-style section marker. */
    showSectionPrefix?: boolean;
    /** Re-wrap paragraph text to `width`. We disable this — see markdown.ts. */
    reflowText?: boolean;
    /** Number of spaces per indentation level. */
    tab?: number;
    tableOptions?: Record<string, unknown>;
  }

  /**
   * Passed straight through to cli-highlight for fenced code blocks.
   * Matches cli-highlight's own HighlightOptions shape (language, theme,
   * ignoreIllegals, etc.) but is kept structural here since we only rely
   * on `ignoreIllegals`.
   */
  export interface TerminalHighlightOptions {
    language?: string;
    ignoreIllegals?: boolean;
    theme?: Record<string, unknown>;
  }

  export function markedTerminal(
    options?: TerminalRendererOptions,
    highlightOptions?: TerminalHighlightOptions
  ): MarkedExtension;
}
