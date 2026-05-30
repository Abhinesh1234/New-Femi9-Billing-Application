import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const CHUNK_RELOAD_KEY = "__chunk_reload__";

function isChunkError(error: Error): boolean {
  const msg = error?.message ?? "";
  return (
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("Importing a module script failed") ||
    msg.includes("error loading dynamically imported module") ||
    /Loading chunk \d+ failed/.test(msg)
  );
}

/**
 * Catches React render errors so a single component crash doesn't blank the whole app.
 * Chunk load errors (stale build after deploy) trigger a one-shot auto-reload.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (isChunkError(error)) {
      // Auto-reload once to pick up the new build. Guard against reload loops.
      const alreadyReloaded = sessionStorage.getItem(CHUNK_RELOAD_KEY);
      if (!alreadyReloaded) {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
        window.location.reload();
        return;
      }
    }
    console.error("[ErrorBoundary] Uncaught render error:", error, info.componentStack);
  }

  private handleReload = (): void => {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
    window.location.reload();
  };

  private handleReset = (): void => {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        style={{
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          height:         "100vh",
          gap:            16,
          fontFamily:     "system-ui, -apple-system, sans-serif",
          color:          "#374151",
          padding:        24,
          textAlign:      "center",
        }}
      >
        <div
          style={{
            width:      64,
            height:     64,
            borderRadius: "50%",
            background: "#fef2f2",
            display:    "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i className="ti ti-alert-circle" style={{ fontSize: 32, color: "#ef4444" }} />
        </div>

        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Something went wrong</h2>

        <p style={{ margin: 0, color: "#6b7280", fontSize: 14, maxWidth: 440 }}>
          {this.state.error && isChunkError(this.state.error)
            ? "The app was updated. Please reload to get the latest version."
            : (this.state.error?.message ?? "An unexpected error occurred in the application.")}
        </p>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={this.handleReset}
            style={{
              padding:      "8px 20px",
              background:   "#f3f4f6",
              color:        "#374151",
              border:       "1px solid #d1d5db",
              borderRadius: 6,
              cursor:       "pointer",
              fontSize:     14,
              fontWeight:   500,
            }}
          >
            Try again
          </button>
          <button
            onClick={this.handleReload}
            style={{
              padding:      "8px 20px",
              background:   "#ef4444",
              color:        "#fff",
              border:       "none",
              borderRadius: 6,
              cursor:       "pointer",
              fontSize:     14,
              fontWeight:   500,
            }}
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
