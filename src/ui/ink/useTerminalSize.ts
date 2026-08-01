import { useEffect, useState } from "react";
import { useStdout } from "ink";

export interface TerminalSize {
  columns: number;
  rows: number;
}

const MIN_COLUMNS = 40;
const MIN_ROWS = 10;

/** Tracks the terminal's size and re-renders on resize (SIGWINCH). */
export function useTerminalSize(): TerminalSize {
  const { stdout } = useStdout();

  const [size, setSize] = useState<TerminalSize>({
    columns: Math.max(stdout?.columns ?? 80, MIN_COLUMNS),
    rows: Math.max(stdout?.rows ?? 24, MIN_ROWS),
  });

  useEffect(() => {
    if (!stdout) return;

    const onResize = () => {
      setSize({
        columns: Math.max(stdout.columns ?? 80, MIN_COLUMNS),
        rows: Math.max(stdout.rows ?? 24, MIN_ROWS),
      });
    };

    stdout.on("resize", onResize);
    return () => {
      stdout.off("resize", onResize);
    };
  }, [stdout]);

  return size;
}
