import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Toast } from "react-bootstrap";
import Footer from "../../../../components/footer/footer";
import {
  destroySeries,
  restoreSeries,
  type SeriesItem,
  type SeriesModule,
} from "../../../../core/services/seriesApi";
import { type AuditLogEntry } from "../../../../core/services/auditLogApi";
import {
  readSeriesList,
  readSeriesDetail,
  readSeriesAuditLogs,
  getSeriesList,
  getSeriesDetail,
  getSeriesAuditLogs,
  bustSeries,
  bustAllSeriesCache,
  hydrateSeriesDetail,
  hydrateSeriesList,
} from "../../../../core/cache/seriesCache";
import { emitMutation } from "../../../../core/cache/mutationEvents";
import { all_routes } from "../../../../routes/all_routes";

const route = all_routes;

type Tab        = "overview" | "history";
type ListFilter = "active" | "deleted";

// ── Module display order ───────────────────────────────────────────────────────
const MODULE_ORDER = [
  "Invoice", "Sales Order", "Sales Return", "Credit Note",
  "Customer Payment", "Delivery Challan", "Bill Of Supply",
  "Retainer Invoice", "Purchase Order", "Vendor Payment",
];

function formatModuleNumber(mod: SeriesModule): string {
  const startLen  = mod.starting_number.length;
  const formatted = String(mod.current_number).padStart(startLen, "0");
  return `${mod.prefix ?? ""}${formatted}`;
}

// ── Confirmation dialog ────────────────────────────────────────────────────────
interface ConfirmConfig {
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm: () => Promise<void>;
}

function ConfirmDialog({
  config,
  onClose,
}: {
  config: ConfirmConfig | null;
  onClose: () => void;
}) {
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => { setBusy(false); }, [config]);

  if (!config) return null;

  const handleConfirm = async () => {
    setBusy(true);
    try { await config.onConfirm(); } finally { setBusy(false); }
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1060,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)",
      }}
      onClick={e => { if (e.target === e.currentTarget && !busy) onClose(); }}
    >
      <div
        style={{
          background: "#fff", borderRadius: 14, padding: "32px 28px 24px",
          width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
        }}
      >
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: config.iconBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 16,
        }}>
          <i className={`ti ${config.icon}`} style={{ fontSize: 24, color: config.iconColor }} />
        </div>
        <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 16, color: "#0f172a", textAlign: "center" }}>
          {config.title}
        </p>
        <p style={{ margin: "0 0 24px", fontSize: 13.5, color: "#64748b", textAlign: "center", lineHeight: 1.55 }}>
          {config.message}
        </p>
        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <button
            className="btn btn-light flex-grow-1"
            style={{ fontWeight: 500, fontSize: 14, height: 44 }}
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            className="btn flex-grow-1"
            style={{ background: config.confirmColor, color: "#fff", fontWeight: 500, fontSize: 14, border: "none", height: 44 }}
            onClick={handleConfirm}
            disabled={busy}
          >
            {busy
              ? <><span className="spinner-border spinner-border-sm me-2" style={{ width: 14, height: 14, borderWidth: 2 }} />{config.confirmLabel}…</>
              : config.confirmLabel
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Info row ──────────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="d-flex align-items-center px-4 py-2">
      <span className="text-muted fs-14 flex-shrink-0" style={{ width: "45%" }}>{label}</span>
      <span className="fs-14 fw-medium">{value}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
const TransactionSeriesOverview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [series, setSeries]       = useState<SeriesItem | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // ── Left panel ──
  const [allSeries, setAllSeries]           = useState<SeriesItem[]>([]);
  const [deletedSeries, setDeletedSeries]   = useState<SeriesItem[]>([]);
  const [deletedLoading, setDeletedLoading] = useState(false);
  const [listSearch, setListSearch]         = useState("");
  const [listFilter, setListFilter]         = useState<ListFilter>("active");
  const pendingDeletedNav                   = useRef(false);

  // ── Stale-fetch guard ──
  const detailFetchRef = useRef(0);

  // ── Left panel scroll ──
  const listScrollRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  // ── Audit log ──
  const [auditLogs,     setAuditLogs]     = useState<AuditLogEntry[]>([]);
  const [auditLoading,  setAuditLoading]  = useState(false);
  const [auditPage,     setAuditPage]     = useState(1);
  const [auditLastPage, setAuditLastPage] = useState(1);
  const [auditTotal,    setAuditTotal]    = useState(0);

  // ── Confirmation dialog ──
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  // ── Soft refresh ──
  const [refreshing, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);

  // ── Toast ──
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

  const handleRefresh = useCallback(async () => {
    if (!id || refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    try {
      const numId = Number(id);
      bustAllSeriesCache();

      const fetches: Promise<void>[] = [
        getSeriesList()
          .then(data => setAllSeries(data))
          .catch(() => showToast("danger", "Failed to reload series list.")),
        getSeriesDetail(numId)
          .then(data => { setSeries(data); hydrateSeriesDetail(data); setError(null); })
          .catch(() => showToast("danger", "Failed to reload series.")),
      ];

      if (listFilter === "deleted") {
        fetches.push(
          getSeriesList(true)
            .then(data => setDeletedSeries(data))
            .catch(() => {})
        );
      }

      if (activeTab === "history") {
        fetches.push(
          getSeriesAuditLogs(numId, auditPage)
            .then(entry => {
              setAuditLogs(entry.logs);
              setAuditLastPage(entry.lastPage);
              setAuditTotal(entry.total);
            })
            .catch(() => showToast("danger", "Failed to reload history."))
        );
      }

      await Promise.all(fetches);
    } catch {
      showToast("danger", "Network error during refresh. Please try again.");
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, activeTab, auditPage, listFilter]);

  // Fetch current series detail
  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    const token = ++detailFetchRef.current;

    const cached = readSeriesDetail(numId);
    if (cached) {
      if (token !== detailFetchRef.current) return;
      setSeries(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    getSeriesDetail(numId)
      .then(data => {
        if (token !== detailFetchRef.current) return;
        setSeries(data);
        setLoading(false);
      })
      .catch((e: Error) => {
        if (token !== detailFetchRef.current) return;
        setError(e.message ?? "Failed to load series.");
        setLoading(false);
      });
  }, [id]);

  // Fetch all series for left panel
  useEffect(() => {
    const cached = readSeriesList();
    if (cached) { setAllSeries(cached); return; }
    getSeriesList()
      .then(data => setAllSeries(data))
      .catch(() => showToast("danger", "Network error loading series list."));
  }, []);

  // Scroll active item into view
  useEffect(() => {
    const timer = setTimeout(() => {
      activeItemRef.current?.scrollIntoView({ block: "center", behavior: "instant" });
    }, 50);
    return () => clearTimeout(timer);
  }, [id, allSeries]);

  // Reset audit page on id change
  useEffect(() => { setAuditPage(1); }, [id]);

  // Auto-switch left panel to "deleted" when the viewed series is soft-deleted
  useEffect(() => {
    if (series?.deleted_at) setListFilter("deleted");
  }, [series?.deleted_at]);

  // Load audit logs — cached per (seriesId, page), no re-fetch on repeated tab switches
  useEffect(() => {
    if (activeTab !== "history" || !id) return;
    const numId = Number(id);

    const cached = readSeriesAuditLogs(numId, auditPage);
    if (cached) {
      setAuditLogs(cached.logs);
      setAuditLastPage(cached.lastPage);
      setAuditTotal(cached.total);
      return;
    }

    setAuditLoading(true);
    getSeriesAuditLogs(numId, auditPage)
      .then(entry => {
        setAuditLogs(entry.logs);
        setAuditLastPage(entry.lastPage);
        setAuditTotal(entry.total);
        setAuditLoading(false);
      })
      .catch(() => {
        setAuditLoading(false);
        showToast("danger", "Network error loading activity history.");
      });
  }, [activeTab, id, auditPage]);

  // Lazy-fetch deleted series when filter switches to "deleted"
  useEffect(() => {
    if (listFilter !== "deleted") return;
    const cached = readSeriesList(true);
    if (cached) { setDeletedSeries(cached); return; }
    setDeletedLoading(true);
    getSeriesList(true)
      .then(data => { setDeletedSeries(data); setDeletedLoading(false); })
      .catch(() => setDeletedLoading(false));
  }, [listFilter]);

  // Navigate to first item in the new filter view
  useEffect(() => {
    if (listFilter === "deleted") {
      if (deletedSeries.length > 0) {
        navigate(`/locations/series/${deletedSeries[0].id}`);
      } else {
        pendingDeletedNav.current = true;
      }
    } else {
      if (allSeries.length > 0) navigate(`/locations/series/${allSeries[0].id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listFilter]);

  // Once deleted series load, navigate to first — only if triggered by a filter switch
  useEffect(() => {
    if (!pendingDeletedNav.current) return;
    if (listFilter === "deleted" && !deletedLoading && deletedSeries.length > 0) {
      pendingDeletedNav.current = false;
      navigate(`/locations/series/${deletedSeries[0].id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedSeries, deletedLoading]);

  const filteredSeries = useMemo(() => {
    const base = listFilter === "deleted" ? deletedSeries : allSeries;
    if (!listSearch.trim()) return base;
    const q = listSearch.toLowerCase();
    return base.filter(s => s.name.toLowerCase().includes(q));
  }, [allSeries, deletedSeries, listSearch, listFilter]);

  // ── Handlers (defined before early returns so they are stable useCallbacks) ──

  const handleRestore = useCallback((targetId: number) => {
    const target = deletedSeries.find(s => s.id === targetId);
    setConfirmConfig({
      icon: "ti-refresh",
      iconColor: "#2f9e44",
      iconBg: "#ebfbee",
      title: "Restore Series?",
      message: `"${target?.name ?? "This series"}" will be restored and become active again.`,
      confirmLabel: "Restore",
      confirmColor: "#2f9e44",
      onConfirm: async () => {
        const res = await restoreSeries(targetId);
        if (!res.success) {
          showToast("danger", (res as any).message ?? "Restore failed.");
          return;
        }
        bustSeries(targetId);
        emitMutation("series:mutated");
        showToast("success", "Series restored.");
        const [activeData, deletedData] = await Promise.all([
          getSeriesList(), getSeriesList(true),
        ]);
        hydrateSeriesList(activeData);
        hydrateSeriesList(deletedData, true);
        setAllSeries(activeData);
        setDeletedSeries(deletedData);
        setListFilter("active");
        navigate(`/locations/series/${targetId}`);
      },
    });
  }, [deletedSeries, navigate, setConfirmConfig]);

  const handleDelete = useCallback(() => {
    if (!series) return;
    const numId = Number(id);
    setConfirmConfig({
      icon: "ti-trash",
      iconColor: "#e03131",
      iconBg: "#fff0f0",
      title: "Delete Series?",
      message: `"${series.name}" will be deleted and can be restored later.`,
      confirmLabel: "Delete",
      confirmColor: "#e03131",
      onConfirm: async () => {
        const res = await destroySeries(numId);
        if (!res.success) {
          showToast("danger", (res as any).message ?? "Delete failed.");
          return;
        }
        bustSeries(numId);
        emitMutation("series:mutated");
        showToast("success", "Series deleted.");
        const [freshActive, freshDeleted] = await Promise.all([
          getSeriesList(), getSeriesList(true),
        ]);
        hydrateSeriesList(freshActive);
        hydrateSeriesList(freshDeleted, true);
        setAllSeries(freshActive);
        setDeletedSeries(freshDeleted);
        if (freshActive.length > 0) {
          navigate(`/locations/series/${freshActive[0].id}`);
        } else {
          navigate(route.transactionSeriesList);
        }
      },
    });
  }, [series, id, navigate, setConfirmConfig]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
          <span className="spinner-border spinner-border-sm me-2 text-primary" />
          <span className="text-muted">Loading series…</span>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Error ──
  if (error || !series) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="alert alert-danger">{error ?? "Series not found."}</div>
          <Link to={route.transactionSeriesList} className="btn btn-outline-light">
            <i className="ti ti-arrow-left me-1" /> Back to Series
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "history",  label: "History"  },
  ];

  const modules: SeriesModule[]  = series.modules_config?.modules ?? [];
  const sortedModules = [...modules].sort((a, b) => {
    const ai = MODULE_ORDER.indexOf(a.module);
    const bi = MODULE_ORDER.indexOf(b.module);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
  const activePrefixes = modules.filter(m => m.prefix && m.prefix.trim() !== "").length;
  const locCount       = series.locations_count ?? 0;
  const editPath       = route.editTransactionSeries.replace(":seriesId", String(id));

  return (
    <>
    <div
      className="page-wrapper"
      style={{ height: "calc(100vh - 57px)", minHeight: "unset", overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      {/* ═══ Two-pane shell ═══════════════════════════════════════════════════ */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Left: Series list panel ───────────────────────────────────────── */}
        <div
          className="d-none d-xl-flex"
          style={{
            width: 340, minWidth: 340, flexDirection: "column",
            borderRight: "1px solid #dee2e6", background: "#fff", overflow: "hidden",
          }}
        >
          {/* Search bar + filter */}
          <div className="px-3 py-3" style={{ borderBottom: "1px solid #dee2e6", flexShrink: 0 }}>
            <div className="d-flex align-items-center gap-2">
              <div className="input-group flex-grow-1">
                <span className="input-group-text border-end-0 bg-white">
                  <i className="ti ti-search text-muted fs-13" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search series…"
                  value={listSearch}
                  onChange={e => setListSearch(e.target.value)}
                />
                {listSearch && (
                  <button type="button" className="btn btn-sm btn-outline-light border-start-0" onClick={() => setListSearch("")}>
                    <i className="ti ti-x fs-12 text-muted" />
                  </button>
                )}
              </div>

              {/* Filter dropdown */}
              <div className="dropdown flex-shrink-0">
                <button
                  type="button"
                  className="btn btn-outline-light d-flex align-items-center justify-content-center"
                  style={{ width: 38, height: 38, position: "relative" }}
                  data-bs-toggle="dropdown"
                  title="Filter"
                >
                  <i className="ti ti-filter fs-14 text-muted" />
                  {listFilter !== "active" && (
                    <span style={{
                      position: "absolute", top: 5, right: 5,
                      width: 7, height: 7, borderRadius: "50%",
                      background: "#e03131", border: "1.5px solid #fff",
                    }} />
                  )}
                </button>
                <div className="dropdown-menu dropdown-menu-end dropmenu-hover-primary" style={{ minWidth: 210 }}>
                  {(["active", "deleted"] as ListFilter[]).map(f => (
                    <button
                      key={f}
                      className="dropdown-item d-flex align-items-center gap-2 fs-13"
                      style={{ fontWeight: listFilter === f ? 600 : 400, color: listFilter === f ? "#e03131" : undefined }}
                      onClick={() => setListFilter(f)}
                    >
                      <i className={`ti ${f === "active" ? "ti-circle-check" : "ti-trash"} fs-13`} />
                      {f === "active" ? "Active Transaction Series" : "Deleted Transaction Series"}
                      {listFilter === f && <i className="ti ti-check ms-auto fs-12" style={{ color: "#e03131" }} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Series list */}
          <div ref={listScrollRef} style={{ overflowY: "auto", flex: 1 }}>
            {deletedLoading ? (
              <div className="text-center py-4 text-muted fs-13">
                <span className="spinner-border spinner-border-sm me-2" />Loading…
              </div>
            ) : filteredSeries.length === 0 ? (
              <div className="text-center py-4 text-muted fs-13">
                {listFilter === "deleted"
                  ? <><i className="ti ti-trash d-block fs-24 mb-1" />No deleted series</>
                  : <><i className="ti ti-mood-empty d-block fs-24 mb-1" />No series found</>
                }
              </div>
            ) : listFilter === "deleted" ? (
              filteredSeries.map(s => (
                <div
                  key={s.id}
                  className="d-flex align-items-center gap-2 px-3"
                  style={{ paddingTop: 11, paddingBottom: 11, borderBottom: "1px solid #f0f2f5", cursor: "pointer" }}
                  onClick={() => navigate(`/locations/series/${s.id}`)}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#f8f9fa"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                >
                  <div className="rounded border d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 28, height: 28, background: "#f5f5f5", opacity: 0.6 }}>
                    <i className="ti ti-hash text-muted" style={{ fontSize: 12 }} />
                  </div>
                  <span className="flex-grow-1 text-truncate fs-14 text-muted">{s.name}</span>
                  <button
                    type="button"
                    className="btn btn-sm d-flex align-items-center gap-1 flex-shrink-0"
                    style={{ fontSize: 11, padding: "2px 8px", background: "#fff4f4", color: "#e03131", border: "1px solid #fde8e8", borderRadius: 6 }}
                    onClick={e => { e.stopPropagation(); handleRestore(s.id); }}
                    title="Restore"
                  >
                    <i className="ti ti-refresh" style={{ fontSize: 11 }} />Restore
                  </button>
                </div>
              ))
            ) : (
              filteredSeries.map(s => {
                const isActive = String(s.id) === id;
                return (
                  <div
                    key={s.id}
                    ref={isActive ? activeItemRef : undefined}
                    onClick={() => navigate(`/locations/series/${s.id}`)}
                    className="d-flex align-items-center gap-2"
                    style={{
                      paddingLeft: 12, paddingRight: 10, paddingTop: 11, paddingBottom: 11,
                      cursor: "pointer",
                      background: isActive ? "#fff1f0" : "transparent",
                      borderBottom: "1px solid #f5f5f5",
                    }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "#f8f9fa"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = isActive ? "#fff1f0" : "transparent"; }}
                  >
                    <div className="rounded border d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 28, height: 28, background: "#f5f5f5" }}>
                      <i className="ti ti-hash text-muted" style={{ fontSize: 12 }} />
                    </div>
                    <span className="flex-grow-1 text-truncate"
                      style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? "#e03131" : "#212529" }}>
                      {s.name}
                    </span>
                    {s.locations_count != null && s.locations_count > 0 && (
                      <span className="fs-12 text-muted flex-shrink-0">
                        {s.locations_count} loc{s.locations_count !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right: Series detail ──────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", background: "#fff" }}>
          <div style={{ padding: "1.25rem", flex: 1 }}>

            {/* ── Header ── */}
            <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
              <div className="d-flex align-items-start gap-3">
                {/* Series icon */}
                <div
                  className="rounded border d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                  style={{ width: 56, height: 56, background: "#f5f5f5" }}
                >
                  <i className="ti ti-receipt fs-24 text-muted" />
                </div>
                {/* Name + info tags */}
                <div>
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                    <h4 className="fw-bold mb-0 lh-sm">{series.name}</h4>
                    {series.deleted_at && (
                      <span className="badge badge-soft-danger d-inline-flex align-items-center gap-1 fs-12">
                        <i className="ti ti-trash" style={{ fontSize: 10 }} />Deleted
                      </span>
                    )}
                  </div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="badge fs-12" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                      Modules: {modules.length}
                    </span>
                    {locCount > 0 && (
                      <span className="badge fs-12" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                        Locations: {locCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions + Refresh + Close */}
              <div className="d-flex align-items-center gap-2">
                {series.deleted_at ? (
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
                      <li>
                        <button className="dropdown-item" onClick={() => navigate(editPath)}>
                          <i className="ti ti-pencil me-2" />Edit
                        </button>
                      </li>
                      <li><hr className="dropdown-divider m-1" /></li>
                      <li>
                        <button className="dropdown-item text-danger" onClick={handleDelete}>
                          <i className="ti ti-trash me-2" />Delete
                        </button>
                      </li>
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
                  onClick={() => navigate(route.transactionSeriesList)}
                  title="Close"
                >
                  <i className="ti ti-x" style={{ fontSize: 16 }} />
                </button>
              </div>
            </div>

            {/* ── Tab nav ── */}
            <div className="mb-4">
              <div className="d-inline-flex rounded" style={{ background: "#f1f3f5", padding: 4, gap: 2 }}>
                {tabs.map(t => {
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
                        fontWeight: isActive ? 600 : 400, fontSize: 14,
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

            {/* ── Tab: Overview ── */}
            {activeTab === "overview" && (
              <div>

                {/* Series Information card */}
                <div className="card border mb-3">
                  <div className="card-body p-0">
                    <div className="px-4 py-3 border-bottom">
                      <h6 className="fw-semibold fs-15 mb-0">Series Information</h6>
                    </div>
                    <div className="row g-0 pt-2 pb-1">
                      <div className="col-md-6">
                        <InfoRow label="Series Name"        value={<span className="text-primary">{series.name}</span>} />
                        <InfoRow label="Modules Configured" value={modules.length > 0 ? `${modules.length} module${modules.length !== 1 ? "s" : ""}` : "—"} />
                        <InfoRow label="Active Prefixes"    value={activePrefixes > 0 ? `${activePrefixes} prefix${activePrefixes !== 1 ? "es" : ""}` : "—"} />
                      </div>
                      <div className="col-md-6">
                        <InfoRow label="Created Source" value="User" />
                      </div>
                    </div>
                    <div className="d-flex align-items-center px-4 py-3 border-top" style={{ background: "#fafafa", borderRadius: "0 0 8px 8px" }}>
                      <span className="text-muted fs-14 flex-shrink-0" style={{ width: "22.5%" }}>Created On</span>
                      <span className="fs-14 fw-medium">
                        {series.created_at
                          ? <>{new Date(series.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}{", "}{new Date(series.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}</>
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom cards */}
                <div className="row g-3">

                  {/* Module Numbers */}
                  <div className="col-lg-6">
                    <div className="card border h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <i className="ti ti-hash text-muted fs-18" />
                          <h6 className="fw-semibold fs-15 mb-0">Module Numbers</h6>
                        </div>
                        {sortedModules.length === 0 ? (
                          <p className="text-muted fs-14 mb-0">No modules configured.</p>
                        ) : (
                          <div style={{ lineHeight: 2 }}>
                            {sortedModules.map(mod => (
                              <div key={mod.module} className="d-flex align-items-center justify-content-between">
                                <span className="text-muted fs-14">{mod.module}</span>
                                <span className="fs-14 fw-medium">{formatModuleNumber(mod)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Associated Locations */}
                  <div className="col-lg-6">
                    <div className="card border h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <i className="ti ti-map-pin text-muted fs-18" />
                          <h6 className="fw-semibold fs-15 mb-0">Associated Locations</h6>
                        </div>
                        {(series.locations ?? []).length === 0 ? (
                          <p className="text-muted fs-14 mb-0">No locations assigned to this series.</p>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {(series.locations ?? []).map(loc => (
                              <Link
                                key={loc.id}
                                to={`/locations/${loc.id}`}
                                className="d-flex align-items-center gap-2 text-decoration-none"
                                style={{ color: "#344054" }}
                              >
                                <i className="ti ti-building text-muted flex-shrink-0" style={{ fontSize: 13 }} />
                                <span className="fs-14">{loc.name}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Module Configuration table */}
                <div className="card border mt-3">
                  <div className="card-body p-0">
                    <div className="px-4 py-3 border-bottom">
                      <h6 className="fw-semibold fs-15 mb-0">
                        Module Configuration{" "}
                        <span className="text-muted fw-normal fs-14">(Transaction Numbering)</span>
                      </h6>
                    </div>
                    {sortedModules.length === 0 ? (
                      <div className="d-flex align-items-center justify-content-center text-muted px-4 py-4">
                        <i className="ti ti-settings me-2 fs-18" />
                        <span className="fs-14">No modules configured for this series.</span>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-borderless align-middle mb-0" style={{ minWidth: 520 }}>
                          <thead>
                            <tr style={{
                              fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                              color: "#aaa", letterSpacing: "0.06em", borderBottom: "2px solid #f0f0f0",
                            }}>
                              <th className="px-4" style={{ paddingTop: 10, paddingBottom: 10, whiteSpace: "nowrap" }}>Module</th>
                              <th style={{ paddingTop: 10, paddingBottom: 10, whiteSpace: "nowrap" }}>Prefix</th>
                              <th style={{ paddingTop: 10, paddingBottom: 10, whiteSpace: "nowrap" }}>Current Number</th>
                              <th style={{ paddingTop: 10, paddingBottom: 10, whiteSpace: "nowrap" }}>Starting Number</th>
                              <th style={{ paddingTop: 10, paddingBottom: 10, whiteSpace: "nowrap" }}>Restart Numbering</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedModules.map(mod => (
                              <tr key={mod.module} style={{ borderBottom: "1px solid #f5f5f5" }}>
                                <td className="fs-14 fw-medium px-4" style={{ paddingTop: 10, paddingBottom: 10, whiteSpace: "nowrap" }}>{mod.module}</td>
                                <td className="fs-14" style={{ paddingTop: 10, paddingBottom: 10 }}>
                                  {mod.prefix ? <code className="fs-13 bg-light px-2 py-1 rounded border">{mod.prefix}</code> : <span className="text-muted">—</span>}
                                </td>
                                <td className="fs-14 fw-medium" style={{ paddingTop: 10, paddingBottom: 10, whiteSpace: "nowrap" }}>{formatModuleNumber(mod)}</td>
                                <td className="fs-14 text-muted" style={{ paddingTop: 10, paddingBottom: 10, whiteSpace: "nowrap" }}>{mod.starting_number}</td>
                                <td className="fs-14" style={{ paddingTop: 10, paddingBottom: 10 }}>
                                  {mod.restart_numbering && mod.restart_numbering !== "None"
                                    ? <span className="badge badge-soft-info">{mod.restart_numbering}</span>
                                    : <span className="text-muted">None</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Last Updated pill */}
                <div
                  className="d-inline-flex align-items-center gap-2 mt-4 px-3 py-2 rounded"
                  style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}
                >
                  <i className="ti ti-clock text-muted fs-14" />
                  <span className="fs-14 text-muted">
                    Last updated on{" "}
                    <span className="fw-semibold" style={{ color: "#495057" }}>
                      {series.updated_at
                        ? <>{new Date(series.updated_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}{", "}{new Date(series.updated_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}</>
                        : "—"}
                    </span>
                  </span>
                </div>

              </div>
            )}

            {/* ── Tab: History ── */}
            {activeTab === "history" && (
              <div>
                {/* Header */}
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div>
                    <h6 className="fw-semibold mb-0 fs-15">Activity History</h6>
                    {!auditLoading && (
                      <span className="fs-13 text-muted">
                        {auditTotal} {auditTotal === 1 ? "record" : "records"}
                      </span>
                    )}
                  </div>
                  {!auditLoading && auditLastPage > 1 && (
                    <div className="d-flex align-items-center gap-2">
                      <span className="fs-13 text-muted">Page {auditPage} of {auditLastPage}</span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-light shadow"
                        disabled={auditPage <= 1}
                        onClick={() => setAuditPage(p => p - 1)}
                        style={{ width: 30, height: 30, padding: 0 }}
                      >
                        <i className="ti ti-chevron-left fs-14" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-light shadow"
                        disabled={auditPage >= auditLastPage}
                        onClick={() => setAuditPage(p => p + 1)}
                        style={{ width: 30, height: 30, padding: 0 }}
                      >
                        <i className="ti ti-chevron-right fs-14" />
                      </button>
                    </div>
                  )}
                </div>

                {auditLoading ? (
                  <div className="text-center py-5 text-muted">
                    <span className="spinner-border spinner-border-sm text-primary me-2" />
                    <span className="fs-14">Loading history…</span>
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="ti ti-history fs-36 d-block mb-2" />
                    <p className="fs-14 mb-0">No activity recorded yet.</p>
                  </div>
                ) : (
                  <div style={{ position: "relative", paddingLeft: 52 }}>
                    {/* Single continuous vertical line */}
                    <div style={{
                      position: "absolute", left: 17, top: 0, bottom: 0,
                      width: 2, background: "#e9ecef", zIndex: 0,
                    }} />

                    {auditLogs.map((log, idx) => {
                      const SKIP_FIELDS = new Set(["updated_at", "created_at", "deleted_at", "remember_token", "email_verified_at"]);
                      const FIELD_LABELS: Record<string, string> = {
                        name:              "Series Name",
                        customer_category: "Customer Category",
                      };
                      const CUSTOMER_CATEGORY_LABELS: Record<string, string> = {
                        retail: "Retail", wholesale: "Wholesale", vip: "VIP",
                        corporate: "Corporate", distributor: "Distributor",
                      };
                      const MOD_SUB_LABELS: Record<string, string> = {
                        prefix:             "Prefix",
                        starting_number:    "Starting No.",
                        restart_numbering:  "Restart Numbering",
                      };

                      const parseIfStr = (v: any): any => {
                        if (typeof v === "string") { try { return JSON.parse(v); } catch { return v; } }
                        return v;
                      };

                      const fmtAuditVal = (v: any, key = ""): string => {
                        if (v === null || v === undefined || v === "") return "—";
                        if (typeof v === "boolean") return v ? "Yes" : "No";
                        if (key === "customer_category") return CUSTOMER_CATEGORY_LABELS[String(v)] ?? String(v);
                        return String(v);
                      };

                      type DiffRow = { key: string; label: string; oldVal: string; newVal: string };

                      const changedFields = log.new_values
                        ? Object.keys(log.new_values).filter(f => !SKIP_FIELDS.has(f))
                        : [];
                      const diffRows: DiffRow[] = changedFields.flatMap((field): DiffRow[] => {
                        if (field === "modules_config") {
                          const rawOld = parseIfStr(log.old_values?.modules_config);
                          const rawNew = parseIfStr(log.new_values?.modules_config);
                          const oldMods: any[] = rawOld?.modules ?? (Array.isArray(rawOld) ? rawOld : []);
                          const newMods: any[] = rawNew?.modules ?? (Array.isArray(rawNew) ? rawNew : []);
                          const rows: DiffRow[] = [];
                          for (const newMod of newMods) {
                            const oldMod = oldMods.find((m: any) => m.module === newMod.module) ?? {};
                            for (const subKey of ["prefix", "starting_number", "restart_numbering"]) {
                              const oldStr = fmtAuditVal(oldMod[subKey] ?? "", subKey);
                              const newStr = fmtAuditVal(newMod[subKey] ?? "", subKey);
                              if (oldStr !== newStr) {
                                rows.push({
                                  key:    `${newMod.module}_${subKey}`,
                                  label:  `${newMod.module} – ${MOD_SUB_LABELS[subKey] ?? subKey}`,
                                  oldVal: oldStr,
                                  newVal: newStr,
                                });
                              }
                            }
                          }
                          return rows;
                        }
                        const oldStr = fmtAuditVal(parseIfStr(log.old_values?.[field]), field);
                        const newStr = fmtAuditVal(parseIfStr(log.new_values?.[field]), field);
                        if (oldStr === newStr) return [];
                        return [{ key: field, label: FIELD_LABELS[field] ?? field, oldVal: oldStr, newVal: newStr }];
                      });

                      const noDetails = log.event === "updated" && diffRows.length === 0;

                      const eventIcon: Record<string, string> = {
                        created: "ti-plus", updated: "ti-pencil",
                        deleted: "ti-trash", restored: "ti-refresh",
                      };
                      const iconClass = eventIcon[log.event] ?? "ti-activity";

                      const modelRaw   = log.auditable_type.split("\\").pop() ?? "Record";
                      const modelLabel = modelRaw.replace(/([A-Z])/g, " $1").trim().toLowerCase();

                      const actor   = log.user?.name ?? log.user?.email ?? "System";
                      const rawTs   = log.created_at;
                      const utcTs   = /Z$|[+-]\d{2}:\d{2}$/.test(rawTs) ? rawTs : rawTs.replace(" ", "T") + "Z";
                      const dateObj = new Date(utcTs);
                      const dateStr = dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                      const timeStr = dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

                      const eventMessages: Record<string, string> = {
                        created:  `Created ${modelLabel}`,
                        deleted:  `Deleted ${modelLabel}`,
                        restored: `Restored ${modelLabel}`,
                      };
                      let message = eventMessages[log.event];
                      if (!message && log.event === "updated") {
                        if (noDetails) {
                          message = "Updated series settings";
                        } else {
                          const allModuleChanges = diffRows.every(r => r.key.includes("_"));
                          if (allModuleChanges && diffRows.length > 0) {
                            message = diffRows.length === 1
                              ? `Changed ${diffRows[0].label}`
                              : `Updated module settings (${diffRows.length} change${diffRows.length !== 1 ? "s" : ""})`;
                          } else {
                            message = diffRows.length === 1
                              ? `Changed ${diffRows[0].label.toLowerCase()}`
                              : `Updated ${diffRows.length} field${diffRows.length !== 1 ? "s" : ""}`;
                          }
                        }
                      }
                      message = message ?? log.event.replace(/_/g, " ");

                      const isLast = idx === auditLogs.filter(Boolean).length - 1;

                      return (
                        <div key={log.id} style={{ position: "relative", marginBottom: isLast ? 0 : 20 }}>

                          {/* Icon: absolutely centered to this card's height */}
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

                              {/* No-details note for legacy records */}
                              {noDetails && (
                                <p className="fs-13 text-muted mb-3" style={{ fontStyle: "italic" }}>
                                  Detailed changes were not recorded for this update.
                                </p>
                              )}

                              {/* Diff rows */}
                              {log.event === "updated" && diffRows.length > 0 && (
                                <div className="rounded mb-3 overflow-hidden" style={{ border: "1px solid #e9ecef" }}>
                                  {diffRows.map((row, ri) => (
                                    <div
                                      key={row.key}
                                      className="d-flex align-items-center gap-3"
                                      style={{
                                        padding: "10px 14px",
                                        background: ri % 2 === 0 ? "#fff" : "#fafafa",
                                        borderTop: ri > 0 ? "1px solid #f1f3f5" : "none",
                                      }}
                                    >
                                      <span className="text-muted fs-13 flex-shrink-0" style={{ width: 150 }}>{row.label}</span>
                                      <span
                                        className="fs-13 px-2 py-1 rounded text-decoration-line-through flex-shrink-0"
                                        style={{ background: "#f1f3f5", color: "#9ca3af" }}
                                      >
                                        {row.oldVal}
                                      </span>
                                      <i className="ti ti-arrow-right flex-shrink-0" style={{ fontSize: 12, color: "#adb5bd" }} />
                                      <span
                                        className="fs-13 fw-semibold px-2 py-1 rounded"
                                        style={{ background: "#fff4f4", color: "#e03131" }}
                                      >
                                        {row.newVal}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Footer: actor */}
                              <div className="d-flex align-items-center gap-2 border-top pt-3">
                                <div
                                  className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 fw-semibold"
                                  style={{ width: 24, height: 24, background: "#f1f3f5", fontSize: 11, color: "#6c757d" }}
                                >
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

          </div>
        </div>

      </div>
      <Footer />

      {/* ── Toast Notifications ── */}
      <div className="position-fixed top-0 start-50 translate-middle-x pt-4" style={{ zIndex: 9999, pointerEvents: "none" }}>
        <Toast
          show={toast.show}
          onClose={() => setToast(t => ({ ...t, show: false }))}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
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

    {/* ── Confirmation dialog ── */}
    <ConfirmDialog config={confirmConfig} onClose={() => setConfirmConfig(null)} />
    </>
  );
};

export default TransactionSeriesOverview;
