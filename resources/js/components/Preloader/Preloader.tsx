import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectIsLoading } from "../../core/redux/loaderSlice";
import type { RootState } from "../../core/redux/store";
import logoLight from "../../assets/img/logo.svg";
import logoDark from "../../assets/img/logo-white.svg";

const MIN_DISPLAY_MS = 400;
const FADE_DURATION_MS = 300;

const Preloader = () => {
  const isLoading = useSelector(selectIsLoading);
  const isDark =
    useSelector((state: RootState) => state.theme.themeSettings["data-bs-theme"]) === "dark";

  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  const showStartRef = useRef<number | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isLoading) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      setFading(false);
      setVisible(true);
      showStartRef.current = Date.now();
    } else {
      if (!visible) return;

      const elapsed = showStartRef.current ? Date.now() - showStartRef.current : MIN_DISPLAY_MS;
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);

      hideTimerRef.current = setTimeout(() => {
        setFading(true);
        fadeTimerRef.current = setTimeout(() => {
          setVisible(false);
          setFading(false);
        }, FADE_DURATION_MS);
      }, remaining);
    }

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div
      className={`preloader-overlay${fading ? " preloader-overlay--fading" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      aria-hidden={!visible}
    >
      <div className="preloader-progress-bar" />
      <div className="preloader-content">
        <img
          src={isDark ? logoDark : logoLight}
          alt=""
          className="preloader-logo"
          aria-hidden="true"
        />
        <div className="preloader-spinner" aria-hidden="true">
          <div className="preloader-spinner__ring" />
        </div>
        <span className="visually-hidden">Loading, please wait…</span>
      </div>
    </div>
  );
};

export default Preloader;
