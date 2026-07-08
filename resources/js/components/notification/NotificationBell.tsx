import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  deleteNotification,
  clearAllNotifications,
  type AppNotificationItem,
} from "../../core/services/notificationApi";

interface Props {
  variant?: "topbar" | "compact";
}

const POLL_MS = 60_000;

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)    return "Just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function notifIcon(type: string): { icon: string; bg: string; color: string } {
  if (type === "party_approval") return { icon: "ti-user-check",   bg: "#eef2ff", color: "#4f46e5" };
  if (type === "reorder_point")  return { icon: "ti-alert-triangle", bg: "#fef9ec", color: "#d97706" };
  return                                { icon: "ti-bell",           bg: "#f0fdf4", color: "#16a34a" };
}

const NotificationBell = ({ variant = "compact" }: Props) => {
  const [open, setOpen]               = useState(false);
  const [unread, setUnread]           = useState(0);
  const [items, setItems]             = useState<AppNotificationItem[]>([]);
  const [loading, setLoading]         = useState(false);
  const [markingAll, setMarkingAll]   = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const [clearingId, setClearingId]   = useState<number | null>(null);
  const dropdownRef                   = useRef<HTMLDivElement>(null);

  const refreshCount = useCallback(async () => {
    const res = await fetchUnreadCount();
    if (res.success) setUnread(res.count);
  }, []);

  useEffect(() => {
    refreshCount();
    const timer = setInterval(refreshCount, POLL_MS);
    return () => clearInterval(timer);
  }, [refreshCount]);

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

  const handleMarkRead = useCallback(async (id: number) => {
    await markNotificationRead(id);
    setItems(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    setUnread(prev => Math.max(0, prev - 1));
  }, []);

  const handleMarkAll = useCallback(async () => {
    setMarkingAll(true);
    await markAllNotificationsRead();
    setMarkingAll(false);
    setItems(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    setUnread(0);
  }, []);

  const handleDelete = useCallback(async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setClearingId(id);
    await deleteNotification(id);
    setClearingId(null);
    setItems(prev => {
      const removed = prev.find(n => n.id === id);
      if (removed && !removed.read_at) setUnread(u => Math.max(0, u - 1));
      return prev.filter(n => n.id !== id);
    });
  }, []);

  const handleClearAll = useCallback(async () => {
    setClearingAll(true);
    await clearAllNotifications();
    setClearingAll(false);
    setItems([]);
    setUnread(0);
  }, []);

  const hasUnread  = unread > 0;
  const badgeLabel = unread > 99 ? "99+" : String(unread);
  const isTopbar   = variant === "topbar";

  // ── Trigger button ──────────────────────────────────────────────────────────
  const triggerBtn = isTopbar ? (
    <button
      type="button"
      className={`topbar-link btn drop-arrow-none${open ? " show" : ""}`}
      onClick={handleToggle}
      aria-label="Notifications"
    >
      <i className={`ti ti-bell fs-16${hasUnread ? " animate-ring" : ""}`} />
      {hasUnread && <span className="badge rounded-pill">{badgeLabel}</span>}
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
          top: 5, right: 5,
          width: 8, height: 8,
          borderRadius: "50%",
          background: "#E41F07",
          border: "1.5px solid #fff",
        }} />
      )}
    </button>
  );

  // ── Dropdown panel ──────────────────────────────────────────────────────────
  const panel = open ? (
    <div style={{
      position: "absolute",
      top: isTopbar ? "calc(100% + 12px)" : "calc(100% + 6px)",
      right: 0,
      width: isTopbar ? 400 : 360,
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 14,
      boxShadow: "0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
      zIndex: 2000,
      overflow: "hidden",
    }}>

      {/* ── Header ── */}
      <div style={{
        padding: "16px 20px 14px",
        borderBottom: "1px solid #f3f4f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#fff",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", letterSpacing: "-0.01em" }}>
            Notifications
          </span>
          {hasUnread && (
            <span style={{
              background: "#E41F07",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 20,
              padding: "1px 7px",
              lineHeight: "18px",
              display: "inline-block",
            }}>
              {badgeLabel}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {hasUnread && (
            <button
              type="button"
              onClick={handleMarkAll}
              disabled={markingAll}
              style={{
                background: "none", border: "none", padding: 0,
                cursor: markingAll ? "default" : "pointer",
                fontSize: 12.5, fontWeight: 600,
                color: markingAll ? "#9ca3af" : "#E41F07",
              }}
            >
              {markingAll ? "Marking…" : "Mark all read"}
            </button>
          )}
          {items.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              disabled={clearingAll}
              style={{
                background: "none", border: "none", padding: 0,
                cursor: clearingAll ? "default" : "pointer",
                fontSize: 12.5, fontWeight: 600,
                color: clearingAll ? "#9ca3af" : "#6b7280",
              }}
            >
              {clearingAll ? "Clearing…" : "Clear all"}
            </button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxHeight: 420, overflowY: "auto" }}>
        {loading ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#9ca3af" }}>
            <span className="spinner-border spinner-border-sm me-2"
              style={{ width: 16, height: 16, borderWidth: 2, color: "#E41F07" }} />
            <span style={{ fontSize: 13.5 }}>Loading notifications…</span>
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "#f9fafb",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 14px",
            }}>
              <i className="ti ti-bell-off" style={{ fontSize: 22, color: "#d1d5db" }} />
            </div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#374151" }}>All caught up</p>
            <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "#9ca3af" }}>No notifications yet</p>
          </div>
        ) : (
          items.map((n, idx) => {
            const { icon, bg, color } = notifIcon(n.type);
            const isUnread = !n.read_at;
            return (
              <div
                key={n.id}
                onClick={() => { if (isUnread) handleMarkRead(n.id); }}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "14px 20px",
                  background: isUnread ? "#fdfaf9" : "#fff",
                  borderBottom: idx < items.length - 1 ? "1px solid #f3f4f6" : "none",
                  cursor: isUnread ? "pointer" : "default",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => { if (isUnread) (e.currentTarget as HTMLDivElement).style.background = "#fef5f4"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = isUnread ? "#fdfaf9" : "#fff"; }}
              >
                {/* Icon badge */}
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: bg, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginTop: 1,
                }}>
                  <i className={`ti ${icon}`} style={{ fontSize: 17, color }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <p style={{
                      margin: 0, fontSize: 13.5, fontWeight: isUnread ? 600 : 500,
                      color: "#111827", lineHeight: 1.4,
                    }}>
                      {n.title}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      {isUnread && (
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#E41F07", marginTop: 5 }} />
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(n.id, e)}
                        disabled={clearingId === n.id}
                        title="Dismiss"
                        style={{
                          width: 18, height: 18, borderRadius: "50%",
                          border: "1.5px solid #fecaca", background: "#fef2f2",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: clearingId === n.id ? "default" : "pointer",
                          flexShrink: 0, padding: 0,
                        }}
                      >
                        {clearingId === n.id
                          ? <span className="spinner-border spinner-border-sm" style={{ width: 8, height: 8, borderWidth: 1.5, color: "#ef4444" }} />
                          : <i className="ti ti-x" style={{ fontSize: 9, color: "#ef4444", lineHeight: 1 }} />
                        }
                      </button>
                    </div>
                  </div>
                  <p style={{
                    margin: "3px 0 0", fontSize: 12.5,
                    color: "#6b7280", lineHeight: 1.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical" as any,
                    overflow: "hidden",
                  }}>
                    {n.body}
                  </p>
                  <p style={{ margin: "5px 0 0", fontSize: 11.5, color: "#9ca3af", fontWeight: 500 }}>
                    {timeAgo(n.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Footer ── */}
      {!loading && items.length > 0 && (
        <div style={{
          padding: "10px 20px",
          borderTop: "1px solid #f3f4f6",
          textAlign: "center",
          background: "#fafafa",
        }}>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            Showing last {items.length} notification{items.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}
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
