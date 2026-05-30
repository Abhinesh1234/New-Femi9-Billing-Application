import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotificationItem,
} from "../../core/services/notificationApi";

interface Props {
  /**
   * 'topbar'  — blends into the admin portal header (uses topbar-link btn classes, larger dropdown)
   * 'compact' — small icon button for the party portal navbar
   */
  variant?: "topbar" | "compact";
}

const POLL_MS = 60_000;

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const NotificationBell = ({ variant = "compact" }: Props) => {
  const [open, setOpen]             = useState(false);
  const [unread, setUnread]         = useState(0);
  const [items, setItems]           = useState<AppNotificationItem[]>([]);
  const [loading, setLoading]       = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const dropdownRef                 = useRef<HTMLDivElement>(null);

  // ── Unread count polling ──────────────────────────────────────────────────
  const refreshCount = useCallback(async () => {
    const res = await fetchUnreadCount();
    if (res.success) setUnread(res.count);
  }, []);

  useEffect(() => {
    refreshCount();
    const timer = setInterval(refreshCount, POLL_MS);
    return () => clearInterval(timer);
  }, [refreshCount]);

  // ── Open / close ──────────────────────────────────────────────────────────
  const handleToggle = useCallback(async () => {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen) {
      setLoading(true);
      const res = await fetchNotifications();
      setLoading(false);
      if (res.success) setItems(res.data);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Mark single read ──────────────────────────────────────────────────────
  const handleMarkRead = useCallback(async (id: number) => {
    await markNotificationRead(id);
    setItems(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    setUnread(prev => Math.max(0, prev - 1));
  }, []);

  // ── Mark all read ─────────────────────────────────────────────────────────
  const handleMarkAll = useCallback(async () => {
    setMarkingAll(true);
    await markAllNotificationsRead();
    setMarkingAll(false);
    setItems(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    setUnread(0);
  }, []);

  const hasUnread    = unread > 0;
  const badgeLabel   = unread > 99 ? "99+" : String(unread);
  const isTopbar     = variant === "topbar";

  // ── Trigger button ────────────────────────────────────────────────────────
  const triggerBtn = isTopbar ? (
    <button
      type="button"
      className={`topbar-link btn drop-arrow-none${open ? " show" : ""}`}
      onClick={handleToggle}
      aria-label="Notifications"
    >
      <i className={`ti ti-bell fs-16${hasUnread ? " animate-ring" : ""}`} />
      {hasUnread && (
        <span className="badge rounded-pill">{badgeLabel}</span>
      )}
    </button>
  ) : (
    <button
      type="button"
      onClick={handleToggle}
      aria-label="Notifications"
      style={{
        position: "relative",
        background: open ? "#fff0f2" : "transparent",
        border: "1px solid #dee2e6",
        borderRadius: 8,
        width: 36,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        padding: 0,
        flexShrink: 0,
      }}
    >
      <i className="ti ti-bell" style={{ fontSize: 18, color: open ? "#E41F07" : "#495057" }} />
      {hasUnread && (
        <span style={{
          position: "absolute",
          top: 5,
          right: 5,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#E41F07",
          border: "1.5px solid #fff",
        }} />
      )}
    </button>
  );

  // ── Dropdown panel ────────────────────────────────────────────────────────
  const panel = open ? (
    <div
      style={{
        position: "absolute",
        top: isTopbar ? "calc(100% + 12px)" : "calc(100% + 6px)",
        right: 0,
        width: isTopbar ? 380 : 340,
        background: "#fff",
        border: "1px solid #dee2e6",
        borderRadius: 10,
        boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
        zIndex: 2000,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        className="d-flex align-items-center justify-content-between px-3 py-2"
        style={{ borderBottom: "1px solid #f0f0f0", background: "#fafbfc" }}
      >
        <span className="fw-semibold fs-14">
          Notifications
          {hasUnread && (
            <span
              className="ms-2 badge"
              style={{ background: "#E41F07", color: "#fff", fontSize: 11, fontWeight: 600 }}
            >
              {badgeLabel}
            </span>
          )}
        </span>
        {hasUnread && (
          <button
            type="button"
            className="btn btn-link p-0 fs-13 text-primary text-decoration-none"
            onClick={handleMarkAll}
            disabled={markingAll}
          >
            {markingAll ? "Marking…" : "Mark all read"}
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ maxHeight: 400, overflowY: "auto" }}>
        {loading ? (
          <div className="text-center py-4 text-muted fs-14">
            <span className="spinner-border spinner-border-sm me-2" style={{ width: 14, height: 14, borderWidth: 2 }} />
            Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="ti ti-bell-off fs-24 d-block mb-2" />
            <span className="fs-14">No notifications yet</span>
          </div>
        ) : (
          items.map(n => (
            <div
              key={n.id}
              className="px-3 py-2"
              style={{
                background: n.read_at ? "#fff" : "#fff5f5",
                borderBottom: "1px solid #f5f5f5",
                cursor: n.read_at ? "default" : "pointer",
              }}
              onClick={() => { if (!n.read_at) handleMarkRead(n.id); }}
            >
              <div className="d-flex align-items-start gap-2">
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: n.read_at ? "transparent" : "#E41F07",
                  marginTop: 6, flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="fs-13 fw-semibold mb-0" style={{ color: "#0f172a" }}>{n.title}</p>
                  <p className="fs-12 text-muted mb-0" style={{ lineHeight: 1.5 }}>{n.body}</p>
                  <p className="fs-11 text-muted mt-1 mb-0">{timeAgo(n.created_at)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  ) : null;

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      {triggerBtn}
      {panel}
    </div>
  );
};

export default NotificationBell;
