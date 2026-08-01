// Pure ASCII (no box-drawing/block Unicode) so it renders identically in
// legacy cmd.exe, PowerShell, Windows Terminal, and any Linux terminal —
// block/box characters (█ ─ │ ┌) are the most common source of mangled
// startup screens on Windows outside Windows Terminal.
export const ASCII_LOGO = [
  "   ___ ____ _____ ___    _    _  __",
  "  |_ _/ ___|_   _|_ _|  / \\  | |/ /",
  "   | |\\___ \\ | |  | |  / _ \\ | ' / ",
  "   | | ___) || |  | | / ___ \\| . \\ ",
  "  |___|____/ |_| |___/_/   \\_\\_|\\_\\",
  "                                CLI",
];

export const LOGO_WIDTH = Math.max(...ASCII_LOGO.map((line) => line.length));
export const TAGLINE = "AI Developer Terminal";
export const VERSION = "1.0.0";
