import { useEffect, useState } from "react";

/** Formats a duration in whole seconds as `m:ss` (or `h:mm:ss` past an hour). */
function formatElapsed(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

/**
 * Ticks once a second for the header's session clock. The interval is
 * cleared on unmount, and a single shared start time (passed in, not
 * captured internally) means remounts don't reset the clock.
 */
export function useElapsedTime(startedAt: number): string {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return formatElapsed(Math.max(Math.floor((now - startedAt) / 1000), 0));
}
