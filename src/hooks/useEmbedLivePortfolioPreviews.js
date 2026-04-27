import { useState, useEffect } from "react";

const DESKTOP_MIN = "(min-width: 768px)";

/**
 * Full-site iframes are heavy (each loads its own app + subresources). On narrow
 * viewports this often blows mobile memory budgets. Desktop keeps live previews.
 */
export function useEmbedLivePortfolioPreviews() {
  const [allowIframes, setAllowIframes] = useState(() =>
    typeof window !== "undefined" && window.matchMedia(DESKTOP_MIN).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MIN);
    const sync = () => setAllowIframes(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return allowIframes;
}
