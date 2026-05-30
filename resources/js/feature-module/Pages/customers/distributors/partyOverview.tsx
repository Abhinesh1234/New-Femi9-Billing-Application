import { useCallback, useEffect, useRef, useState } from "react";
import { usePermission } from "../../../../core/hooks/usePermission";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../../../../core/redux/loaderSlice";
import { useNavigate, useParams, useLocation as useRouterLocation, useSearchParams } from "react-router";
import { Toast } from "react-bootstrap";
import Footer from "../../../../components/footer/footer";
import ConfirmDialog, { type ConfirmConfig } from "../../../../components/confirm-dialog/ConfirmDialog";
import {
  destroyParty,
  restoreParty,
  togglePartyStatus,
  fetchPartyReceivables,
  fetchPartyChildren,
  type PartyDetail,
  type PartyReceivables,
  type PartyChildItem,
} from "../../../../core/services/partyApi";
import {
  readPartyFullDetail,
  readPartyAuditLogs,
  readPartyPage,
  getPartyPage,
  getPartyFullDetail,
  getPartyAuditLogs,
  bustParty,
  bustAllPartyCache,
  hydratePartyFullDetail,
  type PartyListItem,
} from "../../../../core/cache/partyCache";
import { type AuditLogEntry } from "../../../../core/services/auditLogApi";
import { emitMutation, onMutation } from "../../../../core/cache/mutationEvents";
import { all_routes } from "../../../../routes/all_routes";
import {
  fetchPartyComments,
  storePartyComment,
  destroyPartyComment,
  type PartyComment,
} from "../../../../core/services/partyCommentApi";

const route = all_routes;
type Tab = "overview" | "comments" | "transactions" | "statement" | "history";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = ["#e03131", "#2f9e44", "#1971c2", "#e67700", "#7048e8", "#0c8599"];
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }

const PAYMENT_LABELS: Record<string, string> = {
  due_on_receipt: "Due on Receipt",
  net_15: "Net 15",
  net_30: "Net 30",
  net_45: "Net 45",
  net_60: "Net 60",
  net_90: "Net 90",
};

const LANG_LABELS: Record<string, string> = {
  english: "English", hindi: "Hindi", tamil: "Tamil", telugu: "Telugu",
};

function fmt(val: any): string {
  return val === null || val === undefined || val === "" ? "—" : String(val);
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const rawTs = iso;
  const utcTs = rawTs.replace(" ", "T").replace(/Z$|[+-]\d{2}:\d{2}$/, "");
  const d = new Date(utcTs);
  return (
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) +
    ", " +
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
  );
}

function formatDateShort(iso: string): { date: string; time: string } {
  const rawTs = iso;
  const utcTs = rawTs.replace(" ", "T").replace(/Z$|[+-]\d{2}:\d{2}$/, "");
  const d = new Date(utcTs);
  return {
    date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
  };
}

// ── HTML sanitizer (allowlist: b/strong/i/em/u/br only) ──────────────────────
function sanitizeHtml(html: string): string {
  const ALLOWED = new Set(["b", "strong", "i", "em", "u", "br"]);
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*\/?>/g, (match, tag: string) => {
    const lower = tag.toLowerCase();
    if (!ALLOWED.has(lower)) return "";
    if (lower === "br") return "<br>";
    return match.startsWith("</") ? `</${lower}>` : `<${lower}>`;
  });
}

// ── Storage image helper ──────────────────────────────────────────────────────
function storageSrc(path: string | null | undefined): string | null {
  if (!path) return null;
  return path.startsWith("http") || path.startsWith("/") ? path : `/storage/${path}`;
}

// ── Info row (label + value) ──────────────────────────────────────────────────
function PartyInfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="d-flex align-items-center px-4 py-2">
      <span className="text-muted fs-14 flex-shrink-0" style={{ width: "45%" }}>{label}</span>
      <span className="fs-14 fw-medium">{value}</span>
    </div>
  );
}

// ── Collapsible section ────────────────────────────────────────────────────────
function Section({
  title, defaultOpen = true, action, children,
}: {
  title: string;
  defaultOpen?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-top">
      <div
        className="d-flex align-items-center justify-content-between px-3 py-2"
        style={{ cursor: "pointer", userSelect: "none" }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="fw-semibold fs-13 text-uppercase" style={{ color: "#6c757d", letterSpacing: "0.04em" }}>
          {title}
        </span>
        <div className="d-flex align-items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {action}
          <i
            className={`ti ${open ? "ti-chevron-up" : "ti-chevron-down"} text-muted`}
            style={{ fontSize: 13, cursor: "pointer" }}
            onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
          />
        </div>
      </div>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

// ── Address block ─────────────────────────────────────────────────────────────
function AddressBlock({
  label, address, onNew,
}: {
  label: string;
  address: PartyDetail["billing_address"];
  onNew?: () => void;
}) {
  const lines = address
    ? [
        address.attention,
        address.street1,
        address.street2,
        [address.city, address.pin_code].filter(Boolean).join(", ") || null,
        address.state,
        address.country?.name ?? null,
      ].filter(Boolean)
    : [];

  return (
    <div className="mb-3">
      <span className="fs-13 fw-semibold" style={{ color: "#495057" }}>{label}</span>
      {lines.length > 0 ? (
        <div className="fs-13 text-muted mt-1" style={{ lineHeight: 1.8 }}>
          {lines.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      ) : (
        <div className="fs-13 text-muted mt-1">
          No {label} —{" "}
          {onNew && (
            <span className="text-primary" style={{ cursor: "pointer" }} onClick={onNew}>
              New Address
            </span>
          )}
        </div>
      )}
    </div>
  );
}

const PANEL_PER_PAGE = 50;

// ── Main component ─────────────────────────────────────────────────────────────
const PartyOverview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canEdit   = usePermission("parties", "edit");
  const canDelete = usePermission("parties", "delete");
  const dispatch = useDispatch();
  const navState = useRouterLocation().state as { tab?: Tab; listFilter?: "active" | "deleted" } | null;
  const [searchParams] = useSearchParams();

  const [party, setParty] = useState<PartyDetail | null>(() => { const n = Number(id); return isNaN(n) ? null : readPartyFullDetail(n) ?? null; });
  const [loading, setLoading] = useState(() => { const n = Number(id); return isNaN(n) ? false : readPartyFullDetail(n) == null; });
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(
    navState?.tab ?? (searchParams.get("tab") as Tab | null) ?? "overview"
  );

  const [imageExpanded, setImageExpanded] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // ── Left panel (infinite scroll) ──
  const [panelItems, setPanelItems]                   = useState<PartyListItem[]>([]);
  const [panelPage, setPanelPage]                     = useState(1);
  const [panelHasMore, setPanelHasMore]               = useState(false);
  const [panelLoading, setPanelLoading]               = useState(false);
  const [panelSearchDebounced, setPanelSearchDebounced] = useState("");
  const panelSearchTimer                              = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelScrollRef                                = useRef<HTMLDivElement>(null);

  const [listSearch, setListSearch] = useState("");
  const [listFilter, setListFilter] = useState<"active" | "deleted">(navState?.listFilter ?? "active");
  const pendingDeletedNavRef = useRef(false);

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const [auditLastPage, setAuditLastPage] = useState(1);
  const [auditTotal, setAuditTotal] = useState(0);

  const [comments, setComments] = useState<PartyComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const editorRef = useRef<HTMLDivElement>(null);

  const [receivables, setReceivables]         = useState<PartyReceivables | null>(null);
  const [receivablesLoading, setReceivablesLoading] = useState(false);
  const [childParties, setChildParties]       = useState<PartyChildItem[]>([]);
  const [childrenLoading, setChildrenLoading] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);
  const detailFetchRef = useRef(0);
  const activeItemRef = useRef<HTMLDivElement>(null);

  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger"; message: string }>({
    show: false, type: "success", message: "",
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (type: "success" | "danger", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // ── Panel load function ──
  const loadPanelPage = useCallback(async (
    filter: "active" | "deleted", page: number, search: string, append: boolean,
  ) => {
    setPanelLoading(true);
    try {
      const result = await getPartyPage(
        filter === "deleted", page, PANEL_PER_PAGE,
        search.trim(), "display_name", "asc",
      );
      setPanelItems(prev => append ? [...prev, ...result.data] : result.data);
      setPanelHasMore(result.meta.current_page < result.meta.last_page);
      setPanelPage(result.meta.current_page);
    } catch {}
    setPanelLoading(false);
  }, []);

  // ── Debounce panel search ──
  useEffect(() => {
    if (panelSearchTimer.current) clearTimeout(panelSearchTimer.current);
    panelSearchTimer.current = setTimeout(() => setPanelSearchDebounced(listSearch), 400);
    return () => { if (panelSearchTimer.current) clearTimeout(panelSearchTimer.current); };
  }, [listSearch]);

  // ── Reload panel when filter or debounced search changes ──
  useEffect(() => {
    setPanelItems([]);
    setPanelPage(1);
    loadPanelPage(listFilter, 1, panelSearchDebounced, false);
  }, [listFilter, panelSearchDebounced, loadPanelPage]);

  // ── Auto-navigate when filter changes (O2) ──
  useEffect(() => {
    if (!party) return;
    if (listFilter === "deleted") {
      if (!party.deleted_at) {
        const first = panelItems[0];
        if (first) navigate(`/distributors/${first.id}`);
        else pendingDeletedNavRef.current = true;
      }
    } else {
      pendingDeletedNavRef.current = false;
      if (party.deleted_at) {
        const first = panelItems.find(p => !(p as any).deleted_at);
        if (first) navigate(`/distributors/${first.id}`);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listFilter]);

  useEffect(() => {
    if (pendingDeletedNavRef.current && panelItems.length > 0) {
      pendingDeletedNavRef.current = false;
      navigate(`/distributors/${panelItems[0].id}`);
    }
  }, [panelItems]);

  // ── Scroll-to-bottom infinite load ──
  const handlePanelScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom && panelHasMore && !panelLoading) {
      loadPanelPage(listFilter, panelPage + 1, panelSearchDebounced, true);
    }
  }, [panelHasMore, panelLoading, panelPage, listFilter, panelSearchDebounced, loadPanelPage]);

  // ── Scroll active item into view ──
  useEffect(() => {
    const t = setTimeout(() => activeItemRef.current?.scrollIntoView({ block: "center", behavior: "instant" }), 50);
    return () => clearTimeout(t);
  }, [id, panelItems]);

  // ── Refresh ──
  const handleRefresh = useCallback(async () => {
    if (!id || refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    const numId = Number(id);
    try {
      bustAllPartyCache();
      const tasks: Promise<unknown>[] = [
        loadPanelPage(listFilter, 1, panelSearchDebounced, false),
        getPartyFullDetail(numId)
          .then((detail) => { setParty(detail); setError(null); hydratePartyFullDetail(detail); })
          .catch(() => showToast("danger", "Failed to reload party.")),
      ];
      if (activeTab === "history") {
        tasks.push(
          getPartyAuditLogs(numId, auditPage)
            .then((entry) => {
              setAuditLogs(entry.logs);
              setAuditLastPage(entry.lastPage);
              setAuditTotal(entry.total);
            })
            .catch(() => showToast("danger", "Failed to reload activity history."))
        );
      }
      await Promise.all(tasks);
    } catch {}
    finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }, [id, listFilter, panelSearchDebounced, activeTab, auditPage, loadPanelPage]);

  useEffect(() => onMutation("parties:mutated", handleRefresh), [handleRefresh]);

  // ── Fetch party detail ──
  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    const token = ++detailFetchRef.current;

    const cached = readPartyFullDetail(numId);
    if (cached) {
      setParty(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    dispatch(startLoading("party-detail"));
    setError(null);
    getPartyFullDetail(numId).then((detail) => {
      if (token !== detailFetchRef.current) return;
      setParty(detail);
      setLoading(false);
      dispatch(stopLoading("party-detail"));
    }).catch((err: any) => {
      if (token !== detailFetchRef.current) return;
      setError(err?.message ?? "Failed to load party.");
      setLoading(false);
      dispatch(stopLoading("party-detail"));
    });

    return () => { dispatch(stopLoading("party-detail")); };
  }, [id]);

  // ── Audit logs ──
  useEffect(() => {
    if (activeTab !== "history" || !id) return;
    const numId = Number(id);
    const cached = readPartyAuditLogs(numId, auditPage);
    if (cached) { setAuditLogs(cached.logs); setAuditLastPage(cached.lastPage); setAuditTotal(cached.total); return; }
    setAuditLoading(true);
    getPartyAuditLogs(numId, auditPage).then((entry) => {
      setAuditLogs(entry.logs); setAuditLastPage(entry.lastPage); setAuditTotal(entry.total); setAuditLoading(false);
    }).catch(() => { setAuditLoading(false); showToast("danger", "Failed to load activity history."); });
  }, [activeTab, id, auditPage]);

  useEffect(() => { setAuditPage(1); }, [id]);

  // ── Fetch receivables whenever the viewed party changes ──
  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    if (isNaN(numId)) return;
    setReceivables(null);
    setReceivablesLoading(true);
    fetchPartyReceivables(numId)
      .then((res) => { if (res.success) setReceivables(res.data); })
      .catch(() => {})
      .finally(() => setReceivablesLoading(false));
  }, [id]);

  // ── Fetch direct children whenever the viewed party changes ──
  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    if (isNaN(numId)) return;
    setChildParties([]);
    setChildrenLoading(true);
    fetchPartyChildren(numId)
      .then((res) => { if (res.success) setChildParties(res.data); })
      .catch(() => {})
      .finally(() => setChildrenLoading(false));
  }, [id]);

  // ── Fetch comments when tab opens or party changes ──
  useEffect(() => {
    if (activeTab !== "comments" || !id) return;
    setCommentsLoading(true);
    fetchPartyComments(Number(id)).then((res) => {
      if (res.success) setComments(res.data);
      setCommentsLoading(false);
    }).catch(() => setCommentsLoading(false));
  }, [activeTab, id]);

  // ── Delete ──
  const executeDelete = async (targetId: number) => {
    const res = await destroyParty(targetId);
    if (!res.success) { showToast("danger", (res as any).message ?? "Failed to delete."); return; }
    bustParty(targetId);
    setPanelItems(prev => prev.filter(p => p.id !== targetId));
    emitMutation("parties:mutated");
    showToast("success", "Party deleted.");
    if (Number(id) === targetId) {
      const fallback = panelItems.find(p => p.id !== targetId);
      setTimeout(() => navigate(fallback ? `/distributors/${fallback.id}` : -1 as any), 600);
    }
  };

  const handleDelete = () => {
    if (!party) return;
    setConfirmConfig({
      icon: "ti-trash", iconColor: "#e03131", iconBg: "#fff0f0",
      title: "Delete Party?",
      message: `"${party.display_name}" will be soft-deleted and can be restored later.`,
      confirmLabel: "Delete", confirmColor: "#e03131",
      onConfirm: () => executeDelete(Number(id)),
    });
  };

  // ── Restore ──
  const executeRestore = async (targetId: number) => {
    const res = await restoreParty(targetId);
    if (!res.success) { showToast("danger", (res as any).message ?? "Failed to restore."); return; }

    bustParty(targetId);
    const remaining = panelItems.filter(p => p.id !== targetId);
    setPanelItems(remaining);
    emitMutation("parties:mutated");
    showToast("success", "Party restored.");

    if (listFilter === "deleted" && remaining.length === 0) {
      // Last deleted party restored — bust active cache and switch to active view
      // so the restored party appears in the left panel automatically.
      bustAllPartyCache();
      setListFilter("active");
    }

    navigate(`/distributors/${targetId}`);
  };

  const handleRestore = (targetId: number) => {
    const target = panelItems.find((p) => p.id === targetId) ?? party;
    setConfirmConfig({
      icon: "ti-refresh", iconColor: "#2f9e44", iconBg: "#ebfbee",
      title: "Restore Party?",
      message: `"${target?.display_name ?? "This party"}" will be restored and made active again.`,
      confirmLabel: "Restore", confirmColor: "#2f9e44",
      onConfirm: () => executeRestore(targetId),
    });
  };

  // ── Toggle status ──
  const handleToggleStatus = () => {
    if (!party) return;
    const activating = !party.is_active;
    setConfirmConfig({
      icon: activating ? "ti-circle-check" : "ti-circle-x",
      iconColor: activating ? "#2f9e44" : "#e67700",
      iconBg:    activating ? "#ebfbee"  : "#fff8eb",
      title:   activating ? "Mark as Active?" : "Mark as Inactive?",
      message: activating
        ? `"${party.display_name}" will be marked as Active.`
        : `"${party.display_name}" will be marked as Inactive.`,
      confirmLabel: activating ? "Mark as Active" : "Mark as Inactive",
      confirmColor: activating ? "#2f9e44" : "#e67700",
      onConfirm: async () => {
        const res = await togglePartyStatus(Number(id));
        if (!res.success) { showToast("danger", (res as any).message ?? "Failed to update status."); return; }
        bustParty(Number(id));
        setParty((prev) => prev ? { ...prev, is_active: (res as any).is_active } : prev);
        emitMutation("parties:mutated");
        showToast("success", (res as any).is_active ? "Party activated." : "Party deactivated.");
      },
    });
  };

  // ── Filtered list (panel items are already server-filtered) ──
  const filteredList = panelItems;

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "history",  label: "History"  },
  ];

  const avatarBg = party ? avatarColor(party.id) : "#e03131";
  const partyInitials = party ? initials(party.display_name) : "";
  const isDeleted  = Boolean(party?.deleted_at);
  const isInactive = !isDeleted && !party?.is_active;

  return (
    <>
    <div
      className="page-wrapper"
      style={{ height: "calc(100vh - 57px)", minHeight: "unset", overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      {/* ═══ Two-pane shell ═════════════════════════════════════════════════════ */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Left: Party list ──────────────────────────────────────────────── */}
        <div
          className="d-none d-xl-flex"
          style={{ width: 340, minWidth: 340, flexDirection: "column", borderRight: "1px solid #dee2e6", background: "#fff", overflow: "hidden" }}
        >
          {/* Search + filter */}
          <div className="px-3 py-3" style={{ borderBottom: "1px solid #dee2e6", flexShrink: 0 }}>
            <div className="d-flex align-items-center gap-2">
              <div className="input-group flex-grow-1">
                <span className="input-group-text border-end-0 bg-white">
                  <i className="ti ti-search text-muted fs-13" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search parties…"
                  value={listSearch}
                  onChange={(e) => setListSearch(e.target.value)}
                />
                {listSearch && (
                  <button type="button" className="btn btn-sm btn-outline-light border-start-0" onClick={() => setListSearch("")}>
                    <i className="ti ti-x fs-12 text-muted" />
                  </button>
                )}
              </div>

              <div className="dropdown flex-shrink-0">
                <button
                  type="button"
                  className="btn btn-outline-light d-flex align-items-center justify-content-center"
                  style={{ width: 38, height: 38, position: "relative" }}
                  data-bs-toggle="dropdown"
                  title="Filter"
                >
                  <i className="ti ti-filter fs-14 text-muted" />
                  {listFilter === "deleted" && (
                    <span style={{ position: "absolute", top: 5, right: 5, width: 7, height: 7, borderRadius: "50%", background: "#e03131", border: "1.5px solid #fff" }} />
                  )}
                </button>
                <div className="dropdown-menu dropdown-menu-end dropmenu-hover-primary" style={{ minWidth: 180 }}>
                  {(["active", "deleted"] as const).map((f) => (
                    <button
                      key={f}
                      className="dropdown-item d-flex align-items-center gap-2 fs-13"
                      style={{ fontWeight: listFilter === f ? 600 : 400, color: listFilter === f ? "#e03131" : undefined }}
                      onClick={() => setListFilter(f)}
                    >
                      <i className={`ti ${f === "active" ? "ti-users" : "ti-trash"} fs-13`} />
                      {f === "active" ? "Active Parties" : "Deleted Parties"}
                      {listFilter === f && <i className="ti ti-check ms-auto fs-12" style={{ color: "#e03131" }} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }} onScroll={handlePanelScroll} ref={panelScrollRef}>
            {panelLoading && panelItems.length === 0 ? (
              <div className="text-center py-4 text-muted fs-13">
                <span className="spinner-border spinner-border-sm me-2" />Loading…
              </div>
            ) : filteredList.length === 0 ? (
              <div className="text-center py-4 text-muted fs-13">
                <i className={`ti ${listFilter === "deleted" ? "ti-trash" : "ti-mood-empty"} d-block fs-24 mb-1`} />
                {listFilter === "deleted" ? "No deleted parties" : "No parties found"}
              </div>
            ) : (
              filteredList.map((p) => {
                const isActive = String(p.id) === id;
                return (
                  <div
                    key={p.id}
                    ref={isActive ? activeItemRef : undefined}
                    className="d-flex align-items-center gap-2 px-3"
                    style={{
                      paddingTop: 11, paddingBottom: 11,
                      borderBottom: "1px solid #f5f5f5",
                      cursor: "pointer",
                      background: isActive ? "#fff1f0" : "transparent",
                    }}
                    onClick={() => navigate(`/distributors/${p.id}`)}
                    onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "#f8f9fa"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = isActive ? "#fff1f0" : "transparent"; }}
                  >
                    {/* Avatar */}
                    <div
                      className="rounded border d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                      style={{ width: 28, height: 28, background: "#f5f5f5", opacity: listFilter === "deleted" ? 0.5 : 1 }}
                    >
                      {storageSrc(p.party_image) ? (
                        <img src={storageSrc(p.party_image)!} alt={p.display_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <i className="ti ti-user text-muted" style={{ fontSize: 13 }} />
                      )}
                    </div>

                    {/* Name + subtitle */}
                    <div className="flex-grow-1 overflow-hidden">
                      <span
                        className="d-block text-truncate"
                        style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? "#e03131" : "#212529" }}
                      >
                        {p.display_name}
                      </span>
                      {p.mobile && (
                        <span className="d-block text-truncate fs-12 text-muted">
                          {p.mobile_code ? `${p.mobile_code} ` : ""}{p.mobile}
                        </span>
                      )}
                    </div>

                    {/* Restore button for deleted */}
                    {listFilter === "deleted" && (
                      <button
                        type="button"
                        className="btn btn-sm flex-shrink-0 d-flex align-items-center gap-1"
                        style={{ fontSize: 11, padding: "2px 8px", background: "#fff4f4", color: "#e03131", border: "1px solid #fde8e8", borderRadius: 6 }}
                        onClick={(e) => { e.stopPropagation(); handleRestore(p.id); }}
                      >
                        <i className="ti ti-refresh" style={{ fontSize: 11 }} />Restore
                      </button>
                    )}
                  </div>
                );
              })
            )}

            {/* Infinite scroll loading indicator */}
            {panelLoading && panelItems.length > 0 && (
              <div className="text-center py-3 text-muted fs-13">
                <span className="spinner-border spinner-border-sm me-2" />Loading…
              </div>
            )}
          </div>

        </div>

        {/* ── Right: Party detail ────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", background: "#fff" }}>
          {!party ? (
            <div style={{ padding: "1.25rem" }}>
              <div className="alert alert-danger">{error ?? "Party not found."}</div>
              <button className="btn btn-outline-light" onClick={() => navigate(route.distributors)}>
                <i className="ti ti-arrow-left me-1" />Back to Parties
              </button>
            </div>
          ) : (
          <div style={{ padding: "1.25rem" }}>

            {/* ── Header ── */}
            <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
              <div className="d-flex align-items-start gap-3">
                {/* Image */}
                <div
                  className="rounded border d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                  style={{
                    width: 56, height: 56, background: "#f5f5f5",
                    cursor: storageSrc(party.party_image) ? "zoom-in" : "default",
                  }}
                  onClick={() => { if (storageSrc(party.party_image)) setImageExpanded(true); }}
                >
                  {storageSrc(party.party_image)
                    ? <img src={storageSrc(party.party_image)!} alt={party.display_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <i className="ti ti-user fs-24 text-muted" />
                  }
                </div>

                {/* Name + badges */}
                <div>
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                    <h4 className="fw-bold mb-0 lh-sm">{party.display_name}</h4>
                    {isDeleted ? (
                      <span className="badge badge-soft-danger d-inline-flex align-items-center gap-1 fs-12">
                        <i className="ti ti-trash" style={{ fontSize: 10 }} />Deleted
                      </span>
                    ) : isInactive ? (
                      <span className="badge badge-soft-warning d-inline-flex align-items-center gap-1 fs-12">
                        <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: "#e67700", display: "inline-block" }} />
                        Inactive
                      </span>
                    ) : (
                      <span className="badge badge-soft-success d-inline-flex align-items-center gap-1 fs-12">
                        <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: "#12b76a", display: "inline-block" }} />
                        Active
                      </span>
                    )}
                  </div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    {party.distribution_category && (
                      <span className="badge fs-12" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                        {party.distribution_category.name}
                      </span>
                    )}
                    {party.distribution_sub_category && (
                      <span className="badge fs-12" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                        {party.distribution_sub_category.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="d-flex align-items-center gap-2">
                {isDeleted ? (
                  <button
                    type="button"
                    className="btn btn-outline-light shadow d-flex align-items-center gap-1"
                    style={{ height: 36 }}
                    onClick={() => handleRestore(Number(id))}
                  >
                    <i className="ti ti-refresh" style={{ fontSize: 14 }} />Restore
                  </button>
                ) : (
                  <div className="dropdown">
                    <button
                      type="button"
                      className="btn btn-outline-light dropdown-toggle shadow d-flex align-items-center gap-1"
                      style={{ height: 36 }}
                      data-bs-toggle="dropdown"
                    >
                      Actions
                    </button>
                    <div className="dropdown-menu dropdown-menu-end dropmenu-hover-primary">
                      <ul>
                        {canEdit && (
                          <li>
                            <button className="dropdown-item" onClick={() => navigate(`/distributors/${id}/edit`)}>
                              <i className="ti ti-pencil me-2" />Edit
                            </button>
                          </li>
                        )}
                        <li>
                          <button className="dropdown-item" onClick={handleToggleStatus}>
                            {party.is_active
                              ? <><i className="ti ti-circle-x me-2" />Mark as Inactive</>
                              : <><i className="ti ti-circle-check me-2" />Mark as Active</>
                            }
                          </button>
                        </li>
                        <li><hr className="dropdown-divider m-1" /></li>
                        {canDelete && (
                          <li>
                            <button className="dropdown-item text-danger" onClick={handleDelete}>
                              <i className="ti ti-trash me-2" />Delete
                            </button>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  className="btn btn-outline-light d-flex align-items-center justify-content-center shadow"
                  style={{ height: 36, width: 36 }}
                  onClick={handleRefresh}
                  disabled={refreshing}
                  title="Refresh"
                >
                  <i className={`ti ti-refresh${refreshing ? " spin-animation" : ""}`} style={{ fontSize: 16 }} />
                </button>
                <button
                  type="button"
                  className="btn btn-outline-light d-flex align-items-center justify-content-center shadow"
                  style={{ height: 36, width: 36 }}
                  onClick={() => navigate(route.distributors)}
                  title="Close"
                >
                  <i className="ti ti-x" style={{ fontSize: 16 }} />
                </button>
              </div>
            </div>

            {/* ── Tab nav ── */}
            <div className="mb-4 scrollbar-hidden" style={{ overflowX: "auto" }}>
              <div className="d-inline-flex rounded" style={{ background: "#f1f3f5", padding: 4, gap: 2 }}>
                {(
                  [
                    { key: "overview",      label: "Overview"      },
                    { key: "comments",      label: "Comments"      },
                    { key: "transactions",  label: "Transactions"  },
                    { key: "statement",     label: "Statement"     },
                    { key: "history",       label: "History"       },
                  ] as { key: Tab; label: string }[]
                ).map((t) => {
                  const isActive = activeTab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setActiveTab(t.key)}
                      style={{
                        padding: "6px 20px", borderRadius: 6, border: "none",
                        background: isActive ? "#fff" : "transparent",
                        color: isActive ? "#e03131" : "#6c757d",
                        fontWeight: isActive ? 600 : 400,
                        fontSize: 14,
                        boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                        transition: "all 0.15s", cursor: "pointer", whiteSpace: "nowrap",
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ══ Tab: Overview ══════════════════════════════════════════════════ */}
            {activeTab === "overview" && (
              <div>
                <div className="card border mb-3">
                  <div className="card-body p-0">

                    {/* Card header */}
                    <div className="px-4 py-3 border-bottom">
                      <h6 className="fw-semibold fs-15 mb-0">Party Information</h6>
                    </div>

                    {/* Two-column rows */}
                    <div className="row g-0 pt-2 pb-1">
                      <div className="col-md-6">
                        <PartyInfoRow
                          label="Name"
                          value={<span className="text-primary">{party.display_name}</span>}
                        />
                        <PartyInfoRow
                          label="Type"
                          value={
                            <span className={`badge fs-12 ${party.party_type === "individual" ? "badge-soft-secondary" : "badge-soft-primary"}`}>
                              {party.party_type === "individual" ? "Customer" : "Business"}
                            </span>
                          }
                        />
                        <PartyInfoRow label="Email" value={
                          party.email
                            ? <a href={`mailto:${party.email}`} className="text-primary text-decoration-none">{party.email}</a>
                            : <span className="text-muted">—</span>
                        } />
                        <PartyInfoRow label="Phone" value={
                          party.mobile
                            ? `${party.mobile_code ? party.mobile_code + " " : ""}${party.mobile}`
                            : "—"
                        } />
                      </div>

                      <div className="col-md-6">
                        <PartyInfoRow label="Party ID" value={party.party_id} />
                        <PartyInfoRow
                          label="Reporting To"
                          value={
                            party.parent
                              ? <span className="text-primary">{party.parent.display_name}</span>
                              : <span className="text-muted">—</span>
                          }
                        />
                        <PartyInfoRow
                          label="Distribution Category"
                          value={party.distribution_category?.name ?? "—"}
                        />
                        <PartyInfoRow
                          label="Sub Category"
                          value={party.distribution_sub_category?.name ?? "—"}
                        />
                        <PartyInfoRow
                          label="Assigned Locations"
                          value={
                            party.locations && party.locations.length > 0
                              ? (
                                <div className="d-flex flex-wrap gap-1">
                                  {party.locations.map((loc) => (
                                    <span
                                      key={loc.location_node_id}
                                      className="badge fs-12"
                                      style={{ background: "#f1f3f5", color: "#495057", fontWeight: 500 }}
                                    >
                                      <i className="ti ti-map-pin me-1" style={{ fontSize: 10 }} />
                                      {loc.location_node?.name ?? `#${loc.location_node_id}`}
                                    </span>
                                  ))}
                                </div>
                              )
                              : "—"
                          }
                        />
                        <PartyInfoRow
                          label="Portal Status"
                          value={
                            party.enable_portal
                              ? <span className="badge badge-soft-success fs-12 d-inline-flex align-items-center gap-1">
                                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#12b76a", display: "inline-block" }} />
                                  Enabled
                                </span>
                              : <span className="badge badge-soft-secondary fs-12">Disabled</span>
                          }
                        />
                        <PartyInfoRow
                          label="Status"
                          value={
                            isDeleted
                              ? <span className="badge badge-soft-danger fs-12 d-inline-flex align-items-center gap-1">
                                  <i className="ti ti-trash" style={{ fontSize: 10 }} />Deleted
                                </span>
                              : isInactive
                              ? <span className="badge badge-soft-warning fs-12 d-inline-flex align-items-center gap-1">
                                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#e67700", display: "inline-block" }} />
                                  Inactive
                                </span>
                              : <span className="badge badge-soft-success fs-12 d-inline-flex align-items-center gap-1">
                                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#12b76a", display: "inline-block" }} />
                                  Active
                                </span>
                          }
                        />
                      </div>
                    </div>

                    {/* Footer row — created on */}
                    <div className="d-flex align-items-center px-4 py-3 border-top" style={{ background: "#fafafa", borderRadius: "0 0 8px 8px" }}>
                      <span className="text-muted fs-14 flex-shrink-0" style={{ width: "22.5%" }}>Created On</span>
                      <span className="fs-14 fw-medium">{formatDate(party.created_at)}</span>
                    </div>

                  </div>
                </div>

                {/* Address card */}
                <div className="card border mb-3">
                  <div className="card-body p-0">
                    <div className="px-4 py-3 border-bottom">
                      <h6 className="fw-semibold fs-15 mb-0">Address</h6>
                    </div>
                    <div className="row g-0 pt-3 pb-3">

                      {/* Billing address */}
                      <div className="col-md-6 px-4" style={{ borderRight: "1px solid #f1f3f5" }}>
                        <div className="fs-13 fw-semibold text-uppercase mb-2" style={{ color: "#6c757d", letterSpacing: "0.04em" }}>
                          Billing Address
                        </div>
                        {party.billing_address && (
                          [
                            party.billing_address.attention,
                            party.billing_address.street1,
                            party.billing_address.street2,
                            [party.billing_address.city, party.billing_address.pin_code].filter(Boolean).join(", ") || null,
                            party.billing_address.state,
                            party.billing_address.country?.name ?? null,
                            party.billing_address.phone ? `Phone: ${party.billing_address.phone_code ? party.billing_address.phone_code + " " : ""}${party.billing_address.phone}` : null,
                          ].filter(Boolean)
                        ).length > 0 ? (
                          <div className="fs-14 text-muted" style={{ lineHeight: 1.9 }}>
                            {[
                              party.billing_address?.attention,
                              party.billing_address?.street1,
                              party.billing_address?.street2,
                              [party.billing_address?.city, party.billing_address?.pin_code].filter(Boolean).join(", ") || null,
                              party.billing_address?.state,
                              party.billing_address?.country?.name ?? null,
                              party.billing_address?.phone ? `Phone: ${party.billing_address.phone_code ? party.billing_address.phone_code + " " : ""}${party.billing_address.phone}` : null,
                            ].filter(Boolean).map((line, i) => (
                              <div key={i}>{line}</div>
                            ))}
                          </div>
                        ) : (
                          <span className="fs-14 text-muted">No billing address</span>
                        )}
                      </div>

                      {/* Shipping address */}
                      <div className="col-md-6 px-4">
                        <div className="fs-13 fw-semibold text-uppercase mb-2" style={{ color: "#6c757d", letterSpacing: "0.04em" }}>
                          Shipping Address
                        </div>
                        {party.shipping_address && (
                          [
                            party.shipping_address.attention,
                            party.shipping_address.street1,
                            party.shipping_address.street2,
                            [party.shipping_address.city, party.shipping_address.pin_code].filter(Boolean).join(", ") || null,
                            party.shipping_address.state,
                            party.shipping_address.country?.name ?? null,
                            party.shipping_address.phone ? `Phone: ${party.shipping_address.phone_code ? party.shipping_address.phone_code + " " : ""}${party.shipping_address.phone}` : null,
                          ].filter(Boolean)
                        ).length > 0 ? (
                          <div className="fs-14 text-muted" style={{ lineHeight: 1.9 }}>
                            {[
                              party.shipping_address?.attention,
                              party.shipping_address?.street1,
                              party.shipping_address?.street2,
                              [party.shipping_address?.city, party.shipping_address?.pin_code].filter(Boolean).join(", ") || null,
                              party.shipping_address?.state,
                              party.shipping_address?.country?.name ?? null,
                              party.shipping_address?.phone ? `Phone: ${party.shipping_address.phone_code ? party.shipping_address.phone_code + " " : ""}${party.shipping_address.phone}` : null,
                            ].filter(Boolean).map((line, i) => (
                              <div key={i}>{line}</div>
                            ))}
                          </div>
                        ) : (
                          <span className="fs-14 text-muted">No shipping address</span>
                        )}
                      </div>

                    </div>
                  </div>
                </div>

                {/* Receivables card */}
                <div className="mb-3">
                  <div style={{ border: "1px solid #dee2e6", borderRadius: 8, overflow: "hidden" }}>
                    <div style={{ background: "#fff0f2", padding: "12px 16px", borderBottom: "1px solid #dee2e6" }}>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E41F07", display: "inline-block", flexShrink: 0 }} />
                        <span className="fw-semibold fs-14">Receivables</span>
                      </div>
                      <p className="text-muted fs-13 mb-0">Outstanding amounts and unused credits for this party.</p>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table className="table mb-0" style={{ width: "100%" }}>
                        <thead>
                          <tr>
                            <th className="text-uppercase fs-12 fw-semibold text-muted" style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6" }}>Currency</th>
                            <th className="text-uppercase fs-12 fw-semibold text-muted text-end" style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6" }}>Outstanding Receivables</th>
                            <th className="text-uppercase fs-12 fw-semibold text-muted text-end" style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6" }}>Unused Credits</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ borderBottom: "1px solid #f5f5f5" }}>
                            <td className="fs-14" style={{ padding: "10px 16px", verticalAlign: "middle" }}>
                              {party.currency ? `${party.currency} - ${party.currency === "INR" ? "Indian Rupee" : party.currency}` : "INR - Indian Rupee"}
                            </td>
                            <td className="fs-14 fw-semibold text-end" style={{ padding: "10px 16px", verticalAlign: "middle", color: "#E41F07" }}>
                              {receivablesLoading ? (
                                <span className="spinner-border spinner-border-sm text-danger" style={{ width: 14, height: 14, borderWidth: 2 }} />
                              ) : (
                                <>₹{(receivables?.outstanding_receivables ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
                              )}
                            </td>
                            <td className="fs-14 fw-semibold text-end" style={{ padding: "10px 16px", verticalAlign: "middle", color: "#2f9e44" }}>
                              {receivablesLoading ? (
                                <span className="spinner-border spinner-border-sm text-success" style={{ width: 14, height: 14, borderWidth: 2 }} />
                              ) : (
                                <>₹{(receivables?.unused_credits ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Downstream Parties */}
                <div className="card border mb-3">
                  <div className="card-body p-0">
                    <div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between">
                      <h6 className="fw-semibold fs-15 mb-0">
                        Downstream Parties
                        {!childrenLoading && childParties.length > 0 && (
                          <span className="badge badge-soft-primary fs-11 ms-2">{childParties.length}</span>
                        )}
                      </h6>
                    </div>
                    <div className="px-3 py-3">
                      {childrenLoading ? (
                        <div className="text-center py-4">
                          <span className="spinner-border spinner-border-sm text-muted" style={{ width: 18, height: 18, borderWidth: 2 }} />
                        </div>
                      ) : childParties.length === 0 ? (
                        <div className="text-center py-4 text-muted fs-14">No downstream parties.</div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-sm mb-0" style={{ fontSize: 13 }}>
                            <thead>
                              <tr style={{ background: "#f8f9fa" }}>
                                <th className="fw-medium text-muted border-0 py-2 ps-3">Name</th>
                                <th className="fw-medium text-muted border-0 py-2">Category</th>
                                <th className="fw-medium text-muted border-0 py-2">Mobile</th>
                                <th className="fw-medium text-muted border-0 py-2">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {childParties.map((child) => (
                                <tr key={child.id}>
                                  <td className="py-2 ps-3">
                                    <span className="fw-medium text-primary" style={{ cursor: "pointer" }}
                                      onClick={() => navigate(route.distributorOverview.replace(":id", String(child.id)))}>
                                      {child.display_name}
                                    </span>
                                    <div className="text-muted" style={{ fontSize: 11 }}>{child.party_id}</div>
                                  </td>
                                  <td className="py-2 text-muted">{child.distribution_category?.name ?? "—"}</td>
                                  <td className="py-2 text-muted">{child.mobile ?? "—"}</td>
                                  <td className="py-2">
                                    {child.is_active
                                      ? <span className="badge badge-soft-success fs-11">Active</span>
                                      : <span className="badge badge-soft-secondary fs-11">Inactive</span>
                                    }
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="mb-3 mt-4">
                  <h6 className="fw-semibold fs-15 mb-4">Recent Activity</h6>
                  <div className="text-center py-5 text-muted" style={{ border: "1px dashed #dee2e6", borderRadius: 10 }}>
                    <i className="ti ti-activity fs-36 d-block mb-2 opacity-50" />
                    <p className="fs-14 mb-1">No recent activity yet.</p>
                    <p className="fs-13 text-muted mb-0">Transaction history will appear here once invoices or payments are recorded.</p>
                  </div>
                </div>

                {/* Last updated footer */}
                <div className="d-inline-flex align-items-center gap-2 mt-4 px-3 py-2 rounded"
                  style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}>
                  <i className="ti ti-clock text-muted fs-14" />
                  <span className="fs-14 text-muted">
                    Last updated on{" "}
                    <span className="fw-semibold" style={{ color: "#495057" }}>
                      {formatDate(party.updated_at ?? party.created_at)}
                    </span>
                  </span>
                </div>

              </div>
            )}

            {/* ══ Tab: History ═══════════════════════════════════════════════════ */}
            {activeTab === "history" && (
              <div>
                {/* Header */}
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div>
                    <h6 className="fw-semibold mb-0 fs-15">Activity History</h6>
                    {!auditLoading && (
                      <span className="fs-13 text-muted">{auditTotal} {auditTotal === 1 ? "record" : "records"}</span>
                    )}
                  </div>
                  {!auditLoading && auditLastPage > 1 && (
                    <div className="d-flex align-items-center gap-2">
                      <span className="fs-13 text-muted">Page {auditPage} of {auditLastPage}</span>
                      <button type="button" className="btn btn-sm btn-outline-light shadow"
                        disabled={auditPage <= 1} onClick={() => setAuditPage(p => p - 1)}
                        style={{ width: 30, height: 30, padding: 0 }}>
                        <i className="ti ti-chevron-left fs-14" />
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-light shadow"
                        disabled={auditPage >= auditLastPage} onClick={() => setAuditPage(p => p + 1)}
                        style={{ width: 30, height: 30, padding: 0 }}>
                        <i className="ti ti-chevron-right fs-14" />
                      </button>
                    </div>
                  )}
                </div>

                {auditLoading ? (
                  <div className="text-center py-5 text-muted">
                    <span className="spinner-border spinner-border-sm text-danger me-2" />
                    <span className="fs-14">Loading history…</span>
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="ti ti-history fs-36 d-block mb-2" />
                    <p className="fs-14 mb-0">No activity recorded yet.</p>
                  </div>
                ) : (
                  <div style={{ position: "relative", paddingLeft: 52 }}>
                    {/* Spine */}
                    <div style={{ position: "absolute", left: 17, top: 0, bottom: 0, width: 2, background: "#e9ecef", zIndex: 0 }} />

                    {auditLogs.map((log, idx) => {
                      const eventIcon: Record<string, string> = {
                        created:  "ti-plus",
                        updated:  "ti-pencil",
                        deleted:  "ti-trash",
                        restored: "ti-refresh",
                      };
                      const iconClass = eventIcon[log.event] ?? "ti-activity";

                      const SKIP_FIELDS = new Set(["updated_at", "created_at", "deleted_at"]);
                      const changedFields = Object.keys({ ...(log.old_values ?? {}), ...(log.new_values ?? {}) })
                        .filter(f => !SKIP_FIELDS.has(f));

                      const actor = log.user?.name ?? log.user?.email ?? "System";
                      const rawTs = log.created_at;
                      const utcTs = rawTs.replace(" ", "T").replace(/Z$|[+-]\d{2}:\d{2}$/, "");
                      const dateObj = new Date(utcTs);
                      const dateStr = dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                      const timeStr = dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

                      const fieldLabel: Record<string, string> = {
                        party_id:                    "Party ID",
                        party_type:                  "Party Type",
                        salutation:                  "Salutation",
                        first_name:                  "First Name",
                        last_name:                   "Last Name",
                        company_name:                "Company Name",
                        display_name:                "Display Name",
                        email:                       "Email",
                        mobile_code:                 "Phone Code",
                        mobile:                      "Phone",
                        language:                    "Language",
                        distribution_category_id:    "Distribution Category",
                        distribution_sub_category_id:"Distribution Sub Category",
                        pan:                         "PAN",
                        gst:                         "GST Number",
                        account_number:              "Account Number",
                        ifsc_code:                   "IFSC Code",
                        upi_number:                  "UPI Number",
                        currency:                    "Currency",
                        payment_terms:               "Payment Terms",
                        enable_portal:               "Portal Access",
                        is_active:                   "Status",
                        party_image:                 "Party Image",
                        remarks:                     "Remarks",
                        billing_address:             "Billing Address",
                        shipping_address:            "Shipping Address",
                      };

                      const parseIfStr = (v: any): any => {
                        if (typeof v === "string") { try { return JSON.parse(v); } catch { return v; } }
                        return v;
                      };

                      type DiffRow = { key: string; label: string; oldVal: any; newVal: any };

                      const diffRows: DiffRow[] = changedFields.flatMap((field): DiffRow[] => {
                        if (field === "refs") {
                          const rawOld = parseIfStr(log.old_values?.refs);
                          const rawNew = parseIfStr(log.new_values?.refs);
                          const oldS = (rawOld && typeof rawOld === "object" && !Array.isArray(rawOld)) ? rawOld : {};
                          const newS = (rawNew && typeof rawNew === "object" && !Array.isArray(rawNew)) ? rawNew : {};
                          const subLabels: Record<string, string> = {
                            distribution_category_id:     "Distribution Category",
                            distribution_sub_category_id: "Distribution Sub Category",
                          };
                          const changed = Object.keys({ ...oldS, ...newS }).filter(
                            (k) => String(oldS[k] ?? "") !== String(newS[k] ?? "")
                          );
                          if (changed.length === 0) return [];
                          return changed.map((k) => ({
                            key: `refs.${k}`, label: subLabels[k] ?? k,
                            oldVal: oldS[k] ?? null, newVal: newS[k] ?? null,
                          }));
                        }
                        if (field === "billing_address" || field === "shipping_address") {
                          const rawOld = parseIfStr(log.old_values?.[field]);
                          const rawNew = parseIfStr(log.new_values?.[field]);
                          if (JSON.stringify(rawOld ?? {}) === JSON.stringify(rawNew ?? {})) return [];
                          return [{ key: field, label: fieldLabel[field] ?? field, oldVal: null, newVal: "__address_updated" }];
                        }
                        const oldScalar = parseIfStr(log.old_values?.[field]);
                        const newScalar = parseIfStr(log.new_values?.[field]);
                        if (String(oldScalar ?? "") === String(newScalar ?? "")) return [];
                        return [{ key: field, label: fieldLabel[field] ?? field, oldVal: oldScalar, newVal: newScalar }];
                      });

                      if (log.event === "updated" && diffRows.length === 0) return null;

                      const eventMessages: Record<string, string> = {
                        created:  "Created party",
                        deleted:  "Deleted party",
                        restored: "Restored party",
                      };
                      let message = eventMessages[log.event];
                      if (!message && log.event === "updated") {
                        message = diffRows.length === 1
                          ? `Changed ${diffRows[0].label.toLowerCase()}`
                          : `Updated ${diffRows.length} fields`;
                      }
                      message = message ?? log.event.replace(/_/g, " ");

                      const isLast = idx === auditLogs.filter(Boolean).length - 1;

                      const boolFields = new Set(["enable_portal"]);
                      const enumMap: Record<string, Record<string, string>> = {
                        party_type:    { individual: "Individual", business: "Business" },
                        payment_terms: PAYMENT_LABELS,
                        language:      LANG_LABELS,
                        is_active:     { "1": "Active", "0": "Inactive", "true": "Active", "false": "Inactive" },
                      };

                      const fmtVal = (v: any, key: string): string => {
                        if (v === null || v === undefined || v === "") return "—";
                        const lk = key.split(".").at(-1) ?? key;
                        if (boolFields.has(lk)) return (v === true || v === 1 || v === "1") ? "Yes" : "No";
                        if (enumMap[lk]) return enumMap[lk][String(v)] ?? String(v);
                        if (typeof v === "boolean") return v ? "Yes" : "No";
                        return String(v);
                      };

                      return (
                        <div key={log.id} style={{ position: "relative", marginBottom: isLast ? 0 : 20 }}>
                          {/* Icon circle */}
                          <div style={{
                            position: "absolute", left: -52,
                            top: "50%", transform: "translateY(-50%)",
                            width: 36, height: 36, borderRadius: "50%",
                            background: "#fff4f4", border: "1.5px solid #e03131",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            zIndex: 1,
                          }}>
                            <i className={`ti ${iconClass}`} style={{ fontSize: 14, color: "#e03131" }} />
                          </div>

                          {/* Card */}
                          <div className="card border" style={{ borderRadius: 10 }}>
                            <div className="card-body" style={{ padding: "18px 20px" }}>
                              {/* Title + date */}
                              <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                                <span className="fw-semibold fs-15" style={{ color: "#212529" }}>{message}</span>
                                <div className="text-end flex-shrink-0">
                                  <div className="fs-13 fw-medium" style={{ color: "#495057" }}>{dateStr}</div>
                                  <div className="fs-12 text-muted">{timeStr}</div>
                                </div>
                              </div>

                              {/* Diff rows */}
                              {log.event === "updated" && diffRows.length > 0 && (
                                <div className="rounded mb-3 overflow-hidden" style={{ border: "1px solid #e9ecef" }}>
                                  {diffRows.map((row, ri) => {
                                    const rowBg = {
                                      padding: "10px 14px",
                                      background: ri % 2 === 0 ? "#fff" : "#fafafa",
                                      borderTop: ri > 0 ? "1px solid #f1f3f5" : "none",
                                    };

                                    // Party image — thumbnails with lightbox
                                    if (row.key === "party_image") {
                                      const toSrc = (v: any) => {
                                        if (!v) return null;
                                        const s = String(v);
                                        return s.startsWith("http") || s.startsWith("/") ? s : `/storage/${s}`;
                                      };
                                      const oldSrc = toSrc(row.oldVal);
                                      const newSrc = toSrc(row.newVal);
                                      return (
                                        <div key={row.key} className="d-flex align-items-center gap-3" style={{ ...rowBg, paddingTop: 12, paddingBottom: 12 }}>
                                          <span className="text-muted fs-13 flex-shrink-0" style={{ width: 150 }}>Party Image</span>
                                          {oldSrc
                                            ? <button type="button" onClick={() => setLightboxSrc(oldSrc)}
                                                style={{ padding: 0, border: "none", background: "none", cursor: "zoom-in", borderRadius: 6, position: "relative", flexShrink: 0 }}>
                                                <img src={oldSrc} alt="Previous" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6, border: "1px solid #dee2e6", opacity: 0.65, display: "block" }} />
                                                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, background: "rgba(0,0,0,0.18)" }}>
                                                  <i className="ti ti-zoom-in" style={{ color: "#fff", fontSize: 16 }} />
                                                </span>
                                              </button>
                                            : <span className="fs-13 text-muted">—</span>
                                          }
                                          <i className="ti ti-arrow-right flex-shrink-0" style={{ fontSize: 12, color: "#adb5bd" }} />
                                          {newSrc
                                            ? <button type="button" onClick={() => setLightboxSrc(newSrc)}
                                                style={{ padding: 0, border: "none", background: "none", cursor: "zoom-in", borderRadius: 6, position: "relative", flexShrink: 0 }}>
                                                <img src={newSrc} alt="New" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6, border: "1.5px solid #e03131", display: "block" }} />
                                                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, background: "rgba(0,0,0,0.18)" }}>
                                                  <i className="ti ti-zoom-in" style={{ color: "#fff", fontSize: 16 }} />
                                                </span>
                                              </button>
                                            : <span className="fs-13 text-muted">—</span>
                                          }
                                        </div>
                                      );
                                    }

                                    // Address — "Updated" badge only
                                    if (row.newVal === "__address_updated") {
                                      return (
                                        <div key={row.key} className="d-flex align-items-center gap-3" style={rowBg}>
                                          <span className="text-muted fs-13 flex-shrink-0" style={{ width: 150 }}>{row.label}</span>
                                          <span className="fs-13 fw-semibold px-2 py-1 rounded" style={{ background: "#fff4f4", color: "#e03131" }}>Updated</span>
                                        </div>
                                      );
                                    }

                                    return (
                                      <div key={row.key} className="d-flex align-items-center gap-3" style={rowBg}>
                                        <span className="text-muted fs-13 flex-shrink-0" style={{ width: 150 }}>{row.label}</span>
                                        <span className="fs-13 px-2 py-1 rounded text-decoration-line-through flex-shrink-0" style={{ background: "#f1f3f5", color: "#9ca3af" }}>{fmtVal(row.oldVal, row.key)}</span>
                                        <i className="ti ti-arrow-right flex-shrink-0" style={{ fontSize: 12, color: "#adb5bd" }} />
                                        <span className="fs-13 fw-semibold px-2 py-1 rounded" style={{ background: "#fff4f4", color: "#e03131" }}>{fmtVal(row.newVal, row.key)}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Actor */}
                              <div className="d-flex align-items-center gap-2 border-top pt-3">
                                <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 fw-semibold"
                                  style={{ width: 24, height: 24, background: "#f1f3f5", fontSize: 11, color: "#6c757d" }}>
                                  {actor.charAt(0).toUpperCase()}
                                </div>
                                <span className="fs-13 text-muted">{actor}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ══ Tab: Transactions ══════════════════════════════════════════════ */}
            {activeTab === "transactions" && (
              <div className="text-center py-5 text-muted">
                <i className="ti ti-file-invoice fs-40 d-block mb-3 opacity-50" />
                <h6 className="fw-semibold mb-1">No Transactions Yet</h6>
                <p className="fs-14 mb-0">Invoice and payment records for this party will appear here.</p>
              </div>
            )}

            {/* ══ Tab: Statement ══════════════════════════════════════════════════ */}
            {activeTab === "statement" && (
              <div className="text-center py-5 text-muted">
                <i className="ti ti-report-money fs-40 d-block mb-3 opacity-50" />
                <h6 className="fw-semibold mb-1">Statement Unavailable</h6>
                <p className="fs-14 mb-0">Account statement will be available once transactions are recorded.</p>
              </div>
            )}

            {/* ══ Tab: Comments ══════════════════════════════════════════════════ */}
            {activeTab === "comments" && (
              <div>
                {/* Editor */}
                <div
                  className="mb-4"
                  style={{ border: "1px solid #dee2e6", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
                >
                  {/* Toolbar */}
                  <div
                    className="d-flex align-items-center gap-1 px-3 py-2"
                    style={{ borderBottom: "1px solid #f1f3f5", background: "#f8f9fa" }}
                  >
                    {([
                      { cmd: "bold",      label: "B", style: { fontWeight: 700 } },
                      { cmd: "italic",    label: "I", style: { fontStyle: "italic" } },
                      { cmd: "underline", label: "U", style: { textDecoration: "underline" } },
                    ] as { cmd: string; label: string; style: React.CSSProperties }[]).map(({ cmd, label, style }) => {
                      const isActive = activeFormats.has(cmd);
                      return (
                        <button
                          key={cmd}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            document.execCommand(cmd);
                            editorRef.current?.focus();
                            const sel = window.getSelection();
                            if (sel && sel.rangeCount > 0) {
                              setActiveFormats((prev) => {
                                const next = new Set(prev);
                                document.queryCommandState(cmd) ? next.add(cmd) : next.delete(cmd);
                                return next;
                              });
                            }
                          }}
                          style={{
                            width: 32, height: 32, border: "none", borderRadius: 6, cursor: "pointer",
                            background: isActive ? "#fff0f2" : "transparent",
                            color: isActive ? "#e03131" : "#495057",
                            fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.15s",
                            ...style,
                          }}
                          title={cmd.charAt(0).toUpperCase() + cmd.slice(1)}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Editable area */}
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => {
                      setCommentText((e.currentTarget as HTMLDivElement).innerHTML);
                      const cmds = ["bold", "italic", "underline"];
                      const next = new Set<string>();
                      cmds.forEach((c) => { if (document.queryCommandState(c)) next.add(c); });
                      setActiveFormats(next);
                    }}
                    onKeyUp={() => {
                      const cmds = ["bold", "italic", "underline"];
                      const next = new Set<string>();
                      cmds.forEach((c) => { if (document.queryCommandState(c)) next.add(c); });
                      setActiveFormats(next);
                    }}
                    className="px-3 py-3 fs-14"
                    style={{ minHeight: 90, outline: "none", color: "#212529", lineHeight: 1.6 }}
                  />

                  {/* Footer — submit */}
                  <div
                    className="d-flex align-items-center justify-content-end px-3 py-2"
                    style={{ borderTop: "1px solid #f1f3f5", background: "#f8f9fa" }}
                  >
                    <button
                      type="button"
                      className="btn btn-sm btn-danger d-flex align-items-center gap-2"
                      style={{ height: 40, borderRadius: 6 }}
                      disabled={commentSubmitting || !commentText.replace(/<[^>]*>/g, "").trim()}
                      onClick={async () => {
                        const raw = commentText.replace(/<[^>]*>/g, "").trim();
                        if (!raw) return;
                        setCommentSubmitting(true);
                        const sanitized = sanitizeHtml(commentText);
                        const res = await storePartyComment(Number(id), sanitized);
                        if (res.success) {
                          setComments((prev) => [...prev, res.data]);
                          setCommentText("");
                          setActiveFormats(new Set());
                          if (editorRef.current) editorRef.current.innerHTML = "";
                        } else {
                          showToast("danger", res.message ?? "Failed to add comment.");
                        }
                        setCommentSubmitting(false);
                      }}
                    >
                      {commentSubmitting
                        ? <span className="spinner-border spinner-border-sm" />
                        : <i className="ti ti-send fs-14" />
                      }
                      Add Comment
                    </button>
                  </div>
                </div>

                {/* All comments */}
                <div>
                  <div className="d-flex align-items-center gap-2 mb-4">
                    <h6 className="fw-semibold fs-15 mb-0">All Comments</h6>
                    {comments.length > 0 && (
                      <span className="badge badge-soft-danger fs-12">{comments.length}</span>
                    )}
                  </div>

                  {commentsLoading ? (
                    <div className="text-center py-4 text-muted">
                      <span className="spinner-border spinner-border-sm me-2" />
                      <span className="fs-14">Loading comments…</span>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-4 text-muted fs-14">No comments yet.</div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {comments.map((c) => {
                        const ts = c.created_at.replace(" ", "T").replace(/Z$|[+-]\d{2}:\d{2}$/, "");
                        const d = new Date(ts);
                        const dateStr = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                        const timeStr = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
                        return (
                          <div className="card border" key={c.id} style={{ borderRadius: 10 }}>
                            <div className="card-body" style={{ padding: "18px 20px" }}>
                              {/* Title + date + delete */}
                              <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                                <span className="fw-semibold fs-15" style={{ color: "#212529" }}>{c.user?.name ?? "Unknown"}</span>
                                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                                  <div className="text-end">
                                    <div className="fs-13 fw-medium" style={{ color: "#495057" }}>{dateStr}</div>
                                    <div className="fs-12 text-muted">{timeStr}</div>
                                  </div>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-light"
                                    style={{ width: 30, height: 30, padding: 0 }}
                                    title="Delete comment"
                                    onClick={() => {
                                      setConfirmConfig({
                                        icon: "ti-trash", iconColor: "#e03131", iconBg: "#fff0f0",
                                        title: "Delete Comment?",
                                        message: "This comment will be permanently deleted.",
                                        confirmLabel: "Delete", confirmColor: "#e03131",
                                        onConfirm: async () => {
                                          const res = await destroyPartyComment(Number(id), c.id);
                                          if (res.success) setComments((prev) => prev.filter((x) => x.id !== c.id));
                                          else showToast("danger", res.message ?? "Failed to delete.");
                                        },
                                      });
                                    }}
                                  >
                                    <i className="ti ti-trash text-muted" style={{ fontSize: 13 }} />
                                  </button>
                                </div>
                              </div>
                              {/* Content */}
                              <div className="fs-14 text-muted" dangerouslySetInnerHTML={{ __html: sanitizeHtml(c.content) }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
          )}
        </div>

      </div>
      <Footer />

      {/* ── Toast ── */}
      <div className="position-fixed top-0 start-50 translate-middle-x pt-4" style={{ zIndex: 9999, pointerEvents: "none" }}>
        <Toast
          show={toast.show}
          onClose={() => setToast((t) => ({ ...t, show: false }))}
          role="alert" aria-live="assertive" aria-atomic="true"
          style={{ pointerEvents: "auto", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.10)", border: "none", minWidth: 320, background: "#fff" }}
        >
          <Toast.Body className="d-flex align-items-center gap-3 px-4 py-3">
            <span
              className={`d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 ${toast.type === "success" ? "bg-success" : "bg-danger"}`}
              style={{ width: 36, height: 36 }}
            >
              <i className={`ti fs-16 text-white ${toast.type === "success" ? "ti-check" : "ti-x"}`} />
            </span>
            <span className="fw-medium fs-14">{toast.message}</span>
          </Toast.Body>
        </Toast>
      </div>

    </div>

    {/* ── Image expanded view ── */}
    {imageExpanded && storageSrc(party?.party_image) && (
      <div
        onClick={() => setImageExpanded(false)}
        style={{
          position: "fixed", inset: 0, zIndex: 10000,
          background: "rgba(0,0,0,0.82)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "zoom-out",
        }}
      >
        <img
          src={storageSrc(party!.party_image)!}
          alt={party.display_name}
          style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: 8 }}
          onClick={(e) => e.stopPropagation()}
        />
        <button
          type="button"
          onClick={() => setImageExpanded(false)}
          style={{
            position: "absolute", top: 20, right: 24,
            background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%",
            width: 40, height: 40, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <i className="ti ti-x text-white fs-18" />
        </button>
      </div>
    )}

    <ConfirmDialog config={confirmConfig} onClose={() => setConfirmConfig(null)} />

    {/* ── History image lightbox ── */}
    {lightboxSrc && (
      <div
        onClick={() => setLightboxSrc(null)}
        style={{
          position: "fixed", inset: 0, zIndex: 10000,
          background: "rgba(0,0,0,0.82)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "zoom-out",
        }}
      >
        <img
          src={lightboxSrc}
          alt="History image"
          style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: 8 }}
          onClick={(e) => e.stopPropagation()}
        />
        <button
          type="button"
          onClick={() => setLightboxSrc(null)}
          style={{
            position: "absolute", top: 20, right: 24,
            background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%",
            width: 40, height: 40, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <i className="ti ti-x text-white fs-18" />
        </button>
      </div>
    )}
    </>
  );
};

export default PartyOverview;
