import { useEffect } from "react";

/**
 * Fires `onRefresh` whenever the browser tab becomes visible again.
 * Each list page passes its cache-first refresh callback so stale data
 * is silently reloaded when the user returns from another tab.
 */
export function useWindowFocusRefresh(onRefresh: () => void): void {
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible") onRefresh();
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [onRefresh]);
}
