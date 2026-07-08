import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../core/redux/store";
import { startLoading, stopLoading } from "../core/redux/loaderSlice";

// Replace pure-numeric segments (record IDs) with a placeholder so that
// navigating between records on the same page type (e.g. /items/1 → /items/2)
// does not trigger the full-page preloader.
function normalizePathname(pathname: string): string {
  return pathname
    .split("/")
    .map((seg) => (/^\d+$/.test(seg) ? ":id" : seg))
    .join("/");
}

const RouteChangeWatcher = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const isFirstRender = useRef(true);
  const prevNormalizedRef = useRef<string>("");
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const normalized = normalizePathname(location.pathname);

    // Skip initial mount — auth source handles the initial page-load loader
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevNormalizedRef.current = normalized;
      return;
    }

    // Same page template (only the :id changed) — skip preloader entirely so
    // in-page record switches (delete/restore in overview) update silently.
    if (normalized === prevNormalizedRef.current) return;
    prevNormalizedRef.current = normalized;

    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    dispatch(startLoading("route"));

    // Allow two frames for React to commit the new route before stopping
    stopTimerRef.current = setTimeout(() => {
      dispatch(stopLoading("route"));
    }, 80);

    return () => {
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
      // If Suspense unmounts this component (lazy chunk loading) before the
      // timer fires, the "route" key would stay active forever. Clear it here.
      dispatch(stopLoading("route"));
    };
  }, [location.pathname]);

  return null;
};

export default RouteChangeWatcher;
