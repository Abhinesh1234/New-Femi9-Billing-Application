import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useLocation as useRouterLocation } from "react-router";
import { Toast } from "react-bootstrap";
import Footer from "../../../../components/footer/footer";
import {
  destroyPriceList,
  restorePriceList,
  type PriceListRecord,
} from "../../../../core/services/priceListApi";
import { type AuditLogEntry } from "../../../../core/services/auditLogApi";
import {
  readPriceListList,
  readPriceListDetail,
  readPriceListAuditLogs,
  getPriceListList,
  getPriceListDetail,
  getPriceListAuditLogs,
  bustPriceList,
  bustAllPriceListCache,
  hydratePriceListList,
} from "../../../../core/cache/priceListCache";
import { emitMutation, onMutation } from "../../../../core/cache/mutationEvents";
import { all_routes } from "../../../../routes/all_routes";

const route = all_routes;

type Tab        = "overview" | "history";
type ListFilter = "all" | "sales" | "purchase" | "both" | "deleted";

// Detail API returns extra fields not in the list record
interface PriceListDetail extends PriceListRecord {
  description: string | null;
  settings:    Record<string, any> | null;
  items?:      any[];
  created_by?: { id: number; name: string; email: string } | null;
}

// ── Confirmation dialog ────────────────────────────────────────────────────────
interface ConfirmConfig {
  icon:         string;
  iconColor:    string;
  iconBg:       string;
  title:        string;
  message:      string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm:    () => Promise<void>;
}

function ConfirmDialog({ config, onClose }: { config: ConfirmConfig | null; onClose: () => void }) {
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
          width: 56, height: 56, borderRadius: "50%", background: config.iconBg,
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
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
          <button className="btn btn-light flex-grow-1" style={{ fontWeight: 500, fontSize: 14, height: 44 }} onClick={onClose} disabled={busy}>
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
              : config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Info row (2-col grid inside cards) ────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="d-flex align-items-center px-4 py-2">
      <span className="text-muted fs-14 flex-shrink-0" style={{ width: "45%" }}>{label}</span>
      <span className="fs-14 fw-medium">{value}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
const PriceListOverview = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const navState = useRouterLocation().state as { tab?: Tab; listFilter?: ListFilter } | null;

  const [record,    setRecord]    = useState<PriceListDetail | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(navState?.tab ?? "overview");

  // ── Left panel ──
  const [allLists,      setAllLists]      = useState<PriceListRecord[]>([]);
  const [listFilter,    setListFilter]    = useState<ListFilter>(navState?.listFilter ?? "all");
  const [listSearch,    setListSearch]    = useState("");
  const [deletedLists,  setDeletedLists]  = useState<PriceListRecord[]>([]);
  const [deletedLoading, setDeletedLoading] = useState(false);

  // ── Audit log ──
  const [auditLogs,     setAuditLogs]     = useState<AuditLogEntry[]>([]);
  const [auditLoading,  setAuditLoading]  = useState(false);
  const [auditPage,     setAuditPage]     = useState(1);
  const [auditLastPage, setAuditLastPage] = useState(1);
  const [auditTotal,    setAuditTotal]    = useState(0);

  // ── Refs ──
  const activeItemRef  = useRef<HTMLDivElement>(null);
  const detailFetchRef = useRef(0);

  // ── Confirmation dialog ──
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  // ── Toast ──
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger"; message: string }>({
    show: false, type: "success", message: "",
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (type: "success" | "danger", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // ── Refresh ──
  const [refreshing,  setRefreshing]  = useState(false);
  const refreshingRef = useRef(false);

  const handleRefresh = useCallback(async () => {
    if (!id || refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    try {
      const numId = Number(id);
      bustAllPriceListCache();

      const fetches: Promise<void>[] = [
        getPriceListList()
          .then(data => setAllLists(data))
          .catch(() => showToast("danger", "Failed to reload price lists.")),
        getPriceListDetail(numId)
          .then(data => { setRecord(data as PriceListDetail); setError(null); })
          .catch(() => showToast("danger", "Failed to reload price list.")),
      ];

      if (listFilter === "deleted") {
        fetches.push(
          getPriceListList(true)
            .then(data => setDeletedLists(data))
            .catch(() => {}),
        );
      }

      if (activeTab === "history") {
        fetches.push(
          getPriceListAuditLogs(numId, auditPage)
            .then(entry => {
              setAuditLogs(entry.logs);
              setAuditLastPage(entry.lastPage);
              setAuditTotal(entry.total);
            })
            .catch(() => showToast("danger", "Failed to reload history.")),
        );
      }

      await Promise.all(fetches);
    } catch {
      showToast("danger", "Network error during refresh. Please try again.");
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }, [id, listFilter, activeTab, auditPage]);

  // Fetch detail — stale-fetch guard via incrementing token
  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    const token = ++detailFetchRef.current;

    const cached = readPriceListDetail(numId);
    if (cached) {
      if (token !== detailFetchRef.current) return;
      setRecord(cached as PriceListDetail);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    getPriceListDetail(numId)
      .then(data => {
        if (token !== detailFetchRef.current) return;
        setRecord(data as PriceListDetail);
        setLoading(false);
      })
      .catch((e: Error) => {
        if (token !== detailFetchRef.current) return;
        setError(e.message ?? "Failed to load price list.");
        setLoading(false);
      });
  }, [id]);

  // Fetch all price lists for left panel
  useEffect(() => {
    const cached = readPriceListList();
    if (cached) { setAllLists(cached); return; }
    getPriceListList()
      .then(data => setAllLists(data))
      .catch(() => showToast("danger", "Network error loading price lists."));
  }, []);

  // Load audit logs — cached per (id, page)
  useEffect(() => {
    if (activeTab !== "history" || !id) return;
    const numId = Number(id);

    const cached = readPriceListAuditLogs(numId, auditPage);
    if (cached) {
      setAuditLogs(cached.logs);
      setAuditLastPage(cached.lastPage);
      setAuditTotal(cached.total);
      return;
    }

    setAuditLoading(true);
    getPriceListAuditLogs(numId, auditPage)
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

  // Scroll active item into view in left panel
  useEffect(() => {
    const timer = setTimeout(() => {
      activeItemRef.current?.scrollIntoView({ block: "center", behavior: "instant" });
    }, 50);
    return () => clearTimeout(timer);
  }, [id, allLists]);

  // Reset audit page on id change
  useEffect(() => { setAuditPage(1); }, [id]);

  // Lazy-fetch deleted price lists when filter switches to "deleted" (cache-first)
  useEffect(() => {
    if (listFilter !== "deleted") return;
    const cached = readPriceListList(true);
    if (cached) { setDeletedLists(cached); return; }
    setDeletedLoading(true);
    getPriceListList(true)
      .then(data => { setDeletedLists(data); setDeletedLoading(false); })
      .catch(() => setDeletedLoading(false));
  }, [listFilter]);

  // Navigate to first item in the new view when filter changes
  const pendingDeletedNav = useRef(false);
  useEffect(() => {
    if (listFilter === "deleted") {
      if (deletedLists.length > 0) {
        navigate(`/price-list/${deletedLists[0].id}`, { state: { listFilter: "deleted" } });
      } else {
        pendingDeletedNav.current = true;
      }
    } else {
      const base = listFilter === "all" ? allLists : allLists.filter(l => l.transaction_type === listFilter);
      if (base.length > 0) navigate(`/price-list/${base[0].id}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listFilter]);

  // Once deleted lists finish loading, navigate to first (if triggered by filter switch)
  useEffect(() => {
    if (!pendingDeletedNav.current) return;
    if (listFilter === "deleted" && !deletedLoading && deletedLists.length > 0) {
      pendingDeletedNav.current = false;
      navigate(`/price-list/${deletedLists[0].id}`, { state: { listFilter: "deleted" } });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedLists, deletedLoading]);

  // ── Restore ──
  const executeRestore = async (plId: number) => {
    const res = await restorePriceList(plId);
    if (!res.success) {
      showToast("danger", (res as any).message ?? "Failed to restore price list.");
      return;
    }
    const fromDeleted      = deletedLists.find(l => l.id === plId);
    const remainingDeleted = deletedLists.filter(l => l.id !== plId);
    setDeletedLists(remainingDeleted);
    if (fromDeleted) {
      const restored = { ...fromDeleted, deleted_at: null };
      const updated  = [...allLists.filter(l => l.id !== plId), restored];
      setAllLists(updated);
      hydratePriceListList(updated);
    }
    hydratePriceListList(remainingDeleted, true);
    bustPriceList(plId);
    emitMutation("price-lists:mutated");
    showToast("success", "Price list restored.");
    if (listFilter === "deleted" && remainingDeleted.length === 0) {
      setListFilter("all");
    } else {
      navigate(`/price-list/${plId}`);
    }
  };

  const handleRestore = (plId: number) => {
    const target = deletedLists.find(l => l.id === plId) ?? record ?? null;
    setConfirmConfig({
      icon: "ti-refresh", iconColor: "#2f9e44", iconBg: "#ebfbee",
      title: "Restore Price List?",
      message: `"${target?.name ?? "This price list"}" will be restored and made active again.`,
      confirmLabel: "Restore",
      confirmColor: "#2f9e44",
      onConfirm: () => executeRestore(plId),
    });
  };

  // Re-fetch when any page mutates price list data (e.g. save in newPriceList)
  useEffect(() => onMutation("price-lists:mutated", handleRefresh), [handleRefresh]);

  const filteredLists = useMemo(() => {
    if (listFilter === "deleted") {
      if (!listSearch.trim()) return deletedLists;
      const q = listSearch.toLowerCase();
      return deletedLists.filter(l => l.name.toLowerCase().includes(q));
    }
    let base = listFilter === "all" ? allLists : allLists.filter(l => l.transaction_type === listFilter);
    if (listSearch.trim()) {
      const q = listSearch.toLowerCase();
      base = base.filter(l => l.name.toLowerCase().includes(q));
    }
    return base;
  }, [allLists, deletedLists, listFilter, listSearch]);

  const fmt = (val: any) => (val === null || val === undefined || val === "" ? "—" : String(val));

  // ── Delete ──
  const executeDelete = async () => {
    if (!id) return;
    const numId = Number(id);
    const res   = await destroyPriceList(numId);
    if (!res.success) {
      showToast("danger", (res as any).message ?? "Failed to delete price list.");
      return;
    }
    const updated = allLists.filter(l => l.id !== numId);
    setAllLists(updated);
    hydratePriceListList(updated);

    // Optimistically push the just-deleted record into the deleted list
    const deletedRecord = allLists.find(l => l.id === numId);
    if (deletedRecord) {
      const withTimestamp = { ...deletedRecord, deleted_at: new Date().toISOString() };
      const newDeleted    = [withTimestamp, ...deletedLists];
      setDeletedLists(newDeleted);
      hydratePriceListList(newDeleted, true);
    }

    bustPriceList(numId);
    emitMutation("price-lists:mutated");
    showToast("success", "Price list deleted.");
    const fallback = updated[0];
    setTimeout(() => navigate(fallback ? `/price-list/${fallback.id}` : route.priceList), 600);
  };

  const handleDelete = () => {
    if (!record) return;
    setConfirmConfig({
      icon: "ti-trash", iconColor: "#e03131", iconBg: "#fff0f0",
      title: "Delete Price List?",
      message: `"${record.name}" will be permanently deleted and cannot be recovered.`,
      confirmLabel: "Delete", confirmColor: "#e03131",
      onConfirm: executeDelete,
    });
  };

  // ── Loading / Error ──
  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
          <span className="spinner-border spinner-border-sm me-2 text-primary" />
          <span className="text-muted">Loading price list…</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="alert alert-danger">{error ?? "Price list not found."}</div>
          <Link to={route.priceList} className="btn btn-outline-light">
            <i className="ti ti-arrow-left me-1" /> Back to Price Lists
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

  const settings   = record.settings ?? {};
  const isAllItems = record.price_list_type === "all_items";
  const items      = record.items ?? [];

  const txnTypeLabel: Record<string, string> = { sales: "Sales", purchase: "Purchase", both: "Both" };
  const txnLabel = txnTypeLabel[record.transaction_type] ?? record.transaction_type;

  const txnBadgeCls: Record<string, string> = {
    sales: "badge-soft-success", purchase: "badge-soft-warning", both: "badge-soft-info",
  };

  return (
    <>
    <div
      className="page-wrapper"
      style={{ height: "calc(100vh - 57px)", minHeight: "unset", overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      {/* ═══ Two-pane shell ═══════════════════════════════════════════════════ */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Left: Price Lists panel ─────────────────────────────────────── */}
        <div
          className="d-none d-xl-flex"
          style={{ width: 340, minWidth: 340, flexDirection: "column", borderRight: "1px solid #dee2e6", background: "#fff", overflow: "hidden" }}
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
                  placeholder="Search price list…"
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
                  {listFilter !== "all" && (
                    <span style={{
                      position: "absolute", top: 5, right: 5,
                      width: 7, height: 7, borderRadius: "50%",
                      background: "#e03131", border: "1.5px solid #fff",
                    }} />
                  )}
                </button>
                <div className="dropdown-menu dropdown-menu-end dropmenu-hover-primary" style={{ minWidth: 180 }}>
                  {(["all", "sales", "purchase", "both", "deleted"] as ListFilter[]).map(f => (
                    <button
                      key={f}
                      className="dropdown-item d-flex align-items-center gap-2 fs-13"
                      style={{ fontWeight: listFilter === f ? 600 : 400, color: listFilter === f ? "#e03131" : undefined }}
                      onClick={() => setListFilter(f)}
                    >
                      <i className={`ti ${f === "all" ? "ti-list" : f === "sales" ? "ti-trending-up" : f === "purchase" ? "ti-trending-down" : f === "both" ? "ti-arrows-exchange" : "ti-trash"} fs-13`} />
                      {f === "all" ? "All" : f === "sales" ? "Sales" : f === "purchase" ? "Purchase" : f === "both" ? "Both" : "Deleted"}
                      {listFilter === f && <i className="ti ti-check ms-auto fs-12" style={{ color: "#e03131" }} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* List items */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {listFilter === "deleted" ? (
              deletedLoading ? (
                <div className="text-center py-4 text-muted fs-13">
                  <span className="spinner-border spinner-border-sm me-2" />Loading…
                </div>
              ) : filteredLists.length === 0 ? (
                <div className="text-center py-4 text-muted fs-13">
                  <i className="ti ti-trash d-block fs-24 mb-1" />No deleted price lists
                </div>
              ) : (
                filteredLists.map(pl => (
                  <div key={pl.id}
                    className="d-flex align-items-center gap-2 px-3"
                    style={{ paddingTop: 11, paddingBottom: 11, borderBottom: "1px solid #f0f2f5", cursor: "pointer" }}
                    onClick={() => navigate(`/price-list/${pl.id}`, { state: { listFilter: "deleted" } })}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#f8f9fa"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                  >
                    <div className="rounded border d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 28, height: 28, background: "#f5f5f5", opacity: 0.6 }}>
                      <i className="ti ti-tag text-muted" style={{ fontSize: 12 }} />
                    </div>
                    <span className="flex-grow-1 text-truncate fs-14 text-muted">{pl.name}</span>
                    <button
                      type="button"
                      className="btn btn-sm d-flex align-items-center gap-1 flex-shrink-0"
                      style={{ fontSize: 11, padding: "2px 8px", background: "#fff4f4", color: "#e03131", border: "1px solid #fde8e8", borderRadius: 6 }}
                      onClick={e => { e.stopPropagation(); handleRestore(pl.id); }}
                      title="Restore"
                    >
                      <i className="ti ti-refresh" style={{ fontSize: 11 }} />Restore
                    </button>
                  </div>
                ))
              )
            ) : filteredLists.length === 0 ? (
              <div className="text-center py-4 text-muted fs-13">
                <i className="ti ti-mood-empty d-block fs-24 mb-1" />No price lists found
              </div>
            ) : (
              filteredLists.map(pl => {
                const isActive   = String(pl.id) === id;
                const plTxnLabel = txnTypeLabel[pl.transaction_type] ?? pl.transaction_type;
                return (
                  <div
                    key={pl.id}
                    ref={isActive ? activeItemRef : undefined}
                    onClick={() => navigate(`/price-list/${pl.id}`)}
                    className="d-flex align-items-center gap-2 px-3"
                    style={{
                      paddingTop: 11, paddingBottom: 11,
                      cursor: "pointer",
                      background: isActive ? "#fff1f0" : "transparent",
                      borderBottom: "1px solid #f5f5f5",
                    }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "#f8f9fa"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = isActive ? "#fff1f0" : "transparent"; }}
                  >
                    <div className="rounded border d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 28, height: 28, background: "#f5f5f5" }}>
                      <i className="ti ti-tag text-muted" style={{ fontSize: 12 }} />
                    </div>
                    <span className="flex-grow-1 text-truncate"
                      style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? "#e03131" : "#212529" }}>
                      {pl.name}
                    </span>
                    <span className="fs-13 text-muted flex-shrink-0">{plTxnLabel}</span>
                  </div>
                );
              })
            )}
          </div> {/* end list items */}
        </div>

        {/* ── Right: Price List detail ─────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", background: "#fff" }}>
          <div style={{ padding: "1.25rem" }}>

            {/* ── Header ── */}
            <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
              <div className="d-flex align-items-start gap-3">
                {/* Icon box */}
                <div
                  className="rounded border d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 56, height: 56, background: "#f5f5f5" }}
                >
                  <i className="ti ti-tag fs-24 text-muted" />
                </div>
                {/* Name + status + type tags */}
                <div>
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                    <h4 className="fw-bold mb-0 lh-sm">{record.name}</h4>
                    {record.deleted_at ? (
                      <span className="badge badge-soft-danger d-inline-flex align-items-center gap-1 fs-12">
                        <i className="ti ti-trash" style={{ fontSize: 10 }} />Deleted
                      </span>
                    ) : (
                      <span className={`badge d-inline-flex align-items-center gap-1 fs-12 ${record.is_active ? "badge-soft-success" : "badge-soft-danger"}`}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: record.is_active ? "#12b76a" : "#ef4444", display: "inline-block" }} />
                        {record.is_active ? "Active" : "Inactive"}
                      </span>
                    )}
                  </div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="badge fs-12" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                      Type: {txnLabel}
                    </span>
                    <span className="badge fs-12" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                      {isAllItems ? "All Items" : "Individual Items"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions + Refresh + Close */}
              <div className="d-flex align-items-center gap-2">
                {record.deleted_at ? (
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
                        <button className="dropdown-item" onClick={() => navigate(`/price-list/${id}/edit`)}>
                          <i className="ti ti-pencil me-2" />Edit
                        </button>
                      </li>
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
                  onClick={() => navigate(route.priceList)}
                  title="Close"
                >
                  <i className="ti ti-x" style={{ fontSize: 16 }} />
                </button>
              </div>
            </div>

            {/* ── Tab nav (pill) ── */}
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

                {/* Price List Information card */}
                <div className="card border mb-3">
                  <div className="card-body p-0">
                    <div className="px-4 py-3 border-bottom">
                      <h6 className="fw-semibold fs-15 mb-0">Price List Information</h6>
                    </div>
                    <div className="row g-0 pt-2 pb-1">
                      <div className="col-md-6">
                        <InfoRow
                          label="Transaction Type"
                          value={<span className={`badge fs-12 ${txnBadgeCls[record.transaction_type] ?? "badge-soft-secondary"}`}>{txnLabel}</span>}
                        />
                        <InfoRow
                          label="Price List Type"
                          value={<span className={`badge fs-12 ${isAllItems ? "badge-soft-secondary" : "badge-soft-primary"}`}>{isAllItems ? "All Items" : "Individual Items"}</span>}
                        />
                        <InfoRow
                          label="Status"
                          value={<span className={`badge fs-12 ${record.is_active ? "badge-soft-success" : "badge-soft-danger"}`}>{record.is_active ? "Active" : "Inactive"}</span>}
                        />
                        <InfoRow label="Admin Only" value={record.admin_only ? "Yes" : "No"} />
                      </div>
                      <div className="col-md-6">
                        <InfoRow label="Customer Category" value={fmt(record.customer_category_name ?? record.customer_category_id)} />
                        <InfoRow label="Description" value={fmt((record as any).description)} />
                        <InfoRow label="Created By" value={fmt((record as any).created_by?.name)} />
                      </div>
                    </div>
                    {/* Footer: Created On */}
                    <div className="d-flex align-items-center px-4 py-3 border-top" style={{ background: "#fafafa", borderRadius: "0 0 8px 8px" }}>
                      <span className="text-muted fs-14 flex-shrink-0" style={{ width: "22.5%" }}>Created On</span>
                      <span className="fs-14 fw-medium">
                        {new Date(record.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                        {", "}
                        {new Date(record.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom cards */}
                <div className="row g-3">

                  {/* Pricing Settings */}
                  <div className="col-lg-6">
                    <div className="card border h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <i className="ti ti-adjustments text-muted fs-18" />
                          <h6 className="fw-semibold fs-15 mb-0">Pricing Settings</h6>
                        </div>
                        {isAllItems ? (
                          <>
                            {[
                              { label: "Adjustment Method", value: settings.adjustment_method ? String(settings.adjustment_method).charAt(0).toUpperCase() + String(settings.adjustment_method).slice(1) : "—" },
                              { label: "Percentage",        value: settings.percentage != null ? `${settings.percentage}%` : "—" },
                              { label: "Round Off",         value: fmt(settings.round_off) },
                            ].map(row => (
                              <div key={row.label} className="d-flex align-items-center py-2 border-bottom">
                                <span className="text-muted fs-14 flex-shrink-0" style={{ width: "50%" }}>{row.label}</span>
                                <span className="fs-14 fw-medium">{row.value}</span>
                              </div>
                            ))}
                          </>
                        ) : (
                          <>
                            {[
                              { label: "Pricing Scheme",    value: settings.pricing_scheme === "volume" ? "Volume Pricing" : "Unit Pricing" },
                              { label: "Currency",          value: fmt(settings.currency) },
                              { label: "Include Discount",  value: settings.include_discount ? "Yes" : "No" },
                            ].map(row => (
                              <div key={row.label} className="d-flex align-items-center py-2 border-bottom">
                                <span className="text-muted fs-14 flex-shrink-0" style={{ width: "50%" }}>{row.label}</span>
                                <span className="fs-14 fw-medium">{row.value}</span>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="col-lg-6">
                    <div className="card border h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <i className="ti ti-chart-pie text-muted fs-18" />
                          <h6 className="fw-semibold fs-15 mb-0">Summary</h6>
                        </div>
                        <div className="d-flex flex-column align-items-center justify-content-center py-2 gap-3">
                          <div className="rounded border d-flex align-items-center justify-content-center"
                            style={{ width: 52, height: 52, background: "#fff0f0" }}>
                            <i className="ti ti-tag" style={{ fontSize: 22, color: "#e03131" }} />
                          </div>
                          <span className="fw-semibold fs-15 text-center px-2">{record.name}</span>
                          <div className="d-flex gap-2 flex-wrap justify-content-center">
                            <span className={`badge fs-12 ${txnBadgeCls[record.transaction_type] ?? "badge-soft-secondary"}`}>{txnLabel}</span>
                            <span className={`badge fs-12 ${record.is_active ? "badge-soft-success" : "badge-soft-danger"}`}>{record.is_active ? "Active" : "Inactive"}</span>
                            <span className={`badge fs-12 ${isAllItems ? "badge-soft-secondary" : "badge-soft-primary"}`}>{isAllItems ? "All Items" : "Individual Items"}</span>
                          </div>
                          {isAllItems && settings.percentage != null && (
                            <p className="fs-13 text-muted mb-0 text-center">
                              {settings.adjustment_method === "markup" ? "Markup" : "Markdown"}{" "}
                              <span className="fw-semibold">{settings.percentage}%</span> on all items
                            </p>
                          )}
                          {!isAllItems && (
                            <p className="fs-13 text-muted mb-0 text-center">
                              <span className="fw-semibold">{items.length}</span>{" "}
                              item{items.length !== 1 ? "s" : ""} with custom pricing
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Last updated footer */}
                <div
                  className="d-inline-flex align-items-center gap-2 mt-4 px-3 py-2 rounded"
                  style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}
                >
                  <i className="ti ti-clock text-muted fs-14" />
                  <span className="fs-14 text-muted">
                    Last updated on{" "}
                    <span className="fw-semibold" style={{ color: "#495057" }}>
                      {new Date(record.updated_at ?? record.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                      {", "}
                      {new Date(record.updated_at ?? record.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                    </span>
                  </span>
                </div>

              </div>
            )}

            {/* ══ Tab: History ══════════════════════════════════════════════════ */}
            {activeTab === "history" && (
              <div>
                {/* Header row */}
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
                      <button type="button" className="btn btn-sm btn-outline-light shadow" disabled={auditPage <= 1} onClick={() => setAuditPage(p => p - 1)} style={{ width: 30, height: 30, padding: 0 }}>
                        <i className="ti ti-chevron-left fs-14" />
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-light shadow" disabled={auditPage >= auditLastPage} onClick={() => setAuditPage(p => p + 1)} style={{ width: 30, height: 30, padding: 0 }}>
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
                    {/* Continuous spine line */}
                    <div style={{ position: "absolute", left: 17, top: 0, bottom: 0, width: 2, background: "#e9ecef", zIndex: 0 }} />

                    {auditLogs.map((log, idx) => {
                      // ── Field labels and formatting ──────────────────────────────
                      const fieldLabel: Record<string, string> = {
                        name:                 "Name",
                        transaction_type:     "Transaction Type",
                        price_list_type:      "Price List Type",
                        customer_category_id: "Customer Category",
                        description:          "Description",
                        is_active:            "Status",
                        admin_only:           "Admin Only",
                        adjustment_method:    "Adjustment Method",
                        percentage:           "Percentage",
                        round_off:            "Round Off",
                        pricing_scheme:       "Pricing Scheme",
                        currency:             "Currency",
                        include_discount:     "Include Discount",
                        price_list_items:     "Item Pricing",
                      };
                      const SKIP_FIELDS = new Set(["updated_at", "created_at", "deleted_at"]);
                      const enumMap: Record<string, Record<string, string>> = {
                        transaction_type:  { sales: "Sales", purchase: "Purchase", both: "Both" },
                        price_list_type:   { all_items: "All Items", individual_items: "Individual Items" },
                        adjustment_method: { markup: "Markup", markdown: "Markdown" },
                        pricing_scheme:    { unit: "Unit Pricing", volume: "Volume Pricing" },
                      };
                      const boolFields = new Set(["is_active", "include_discount", "admin_only"]);

                      const parseIfStr = (v: any): any => {
                        if (typeof v === "string") { try { return JSON.parse(v); } catch { return v; } }
                        return v;
                      };
                      const parseIfString = (v: any): Record<string, any> => {
                        if (typeof v === "string") { try { return JSON.parse(v); } catch { return {}; } }
                        return (v && typeof v === "object" && !Array.isArray(v)) ? v : {};
                      };

                      const fmtAuditVal = (field: string, v: any): string => {
                        if (v === null || v === undefined || v === "") return "—";
                        const leafKey = field.split(".").at(-1) ?? field;
                        if (boolFields.has(field) || boolFields.has(leafKey)) {
                          const isTrue = v === true || v === 1 || v === "1";
                          return (field === "is_active" || leafKey === "is_active") ? (isTrue ? "Active" : "Inactive") : (isTrue ? "Yes" : "No");
                        }
                        if (enumMap[field])   return enumMap[field][String(v)]   ?? String(v);
                        if (enumMap[leafKey]) return enumMap[leafKey][String(v)] ?? String(v);
                        if (typeof v === "boolean") return v ? "Yes" : "No";
                        if (leafKey === "custom_rate") {
                          const n = parseFloat(String(v));
                          return isNaN(n) ? String(v) : `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        }
                        if (field === "percentage" || leafKey === "discount") {
                          const n = parseFloat(String(v));
                          return isNaN(n) ? String(v) : `${n}%`;
                        }
                        if (leafKey === "volume_ranges") {
                          const arr = Array.isArray(v) ? v : (typeof v === "string" ? (() => { try { return JSON.parse(v); } catch { return null; } })() : null);
                          if (Array.isArray(arr)) return `${arr.length} range${arr.length !== 1 ? "s" : ""}`;
                          return "Updated";
                        }
                        if (field === "description") { const s = String(v); return s.length > 80 ? s.slice(0, 80) + "…" : s; }
                        return String(v);
                      };

                      type DiffRow = { key: string; label: string; oldVal: string; newVal: string };
                      const changedFields = log.new_values ? Object.keys(log.new_values).filter(f => !SKIP_FIELDS.has(f)) : [];
                      const diffRows: DiffRow[] = changedFields.flatMap((field): DiffRow[] => {
                        if (field === "settings") {
                          const oldS = parseIfString(log.old_values?.[field]);
                          const newS = parseIfString(log.new_values?.[field]);
                          const allKeys = new Set([...Object.keys(oldS), ...Object.keys(newS)]);
                          return [...allKeys]
                            .filter(k => JSON.stringify(oldS[k]) !== JSON.stringify(newS[k]))
                            .map(k => ({ key: k, label: fieldLabel[k] ?? k, oldVal: fmtAuditVal(k, oldS[k]), newVal: fmtAuditVal(k, newS[k]) }));
                        }
                        if (field === "price_list_items") {
                          const oldMap = parseIfStr(log.old_values?.price_list_items);
                          const newMap = parseIfStr(log.new_values?.price_list_items);
                          const safeOld = (oldMap && typeof oldMap === "object" && !Array.isArray(oldMap)) ? oldMap as Record<string, any> : {};
                          const safeNew = (newMap && typeof newMap === "object" && !Array.isArray(newMap)) ? newMap as Record<string, any> : {};
                          const allKeys = new Set([...Object.keys(safeOld), ...Object.keys(safeNew)]);
                          const rows: DiffRow[] = [];
                          for (const itemName of allKeys) {
                            const oldF = safeOld[itemName];
                            const newF = safeNew[itemName];
                            if (oldF == null) {
                              rows.push({ key: `__add__${itemName}`, label: itemName, oldVal: "", newVal: "Added" });
                            } else if (newF == null) {
                              rows.push({ key: `__rem__${itemName}`, label: itemName, oldVal: "Removed", newVal: "" });
                            } else {
                              const fLabelMap: Record<string, string> = { custom_rate: "Custom Rate", discount: "Discount", volume_ranges: "Volume Ranges" };
                              for (const f of Object.keys({ ...oldF, ...newF })) {
                                if (JSON.stringify(oldF[f]) !== JSON.stringify(newF[f])) {
                                  rows.push({ key: `${itemName}.${f}`, label: `${itemName} · ${fLabelMap[f] ?? f}`, oldVal: fmtAuditVal(f, oldF[f]), newVal: fmtAuditVal(f, newF[f]) });
                                }
                              }
                            }
                          }
                          return rows;
                        }
                        const oldStr = fmtAuditVal(field, parseIfStr(log.old_values?.[field]));
                        const newStr = fmtAuditVal(field, parseIfStr(log.new_values?.[field]));
                        if (oldStr === newStr) return [];
                        return [{ key: field, label: fieldLabel[field] ?? field, oldVal: oldStr, newVal: newStr }];
                      });

                      if (log.event === "updated" && diffRows.length === 0) return null;

                      const eventIcon: Record<string, string> = {
                        created: "ti-plus", updated: "ti-pencil", deleted: "ti-trash", restored: "ti-refresh",
                      };
                      const iconClass = eventIcon[log.event] ?? "ti-activity";

                      const actor  = log.user?.name ?? log.user?.email ?? "System";
                      const rawTs  = log.created_at;
                      const utcTs  = /Z$|[+-]\d{2}:\d{2}$/.test(rawTs) ? rawTs : rawTs.replace(' ', 'T') + 'Z';
                      const dateObj = new Date(utcTs);
                      const dateStr = dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                      const timeStr = dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

                      const eventMessages: Record<string, string> = {
                        created: "Created price list", deleted: "Deleted price list", restored: "Restored price list",
                      };
                      let message = eventMessages[log.event];
                      if (!message && log.event === "updated") {
                        message = diffRows.length === 1
                          ? `Changed ${diffRows[0].label.toLowerCase()}`
                          : `Updated ${diffRows.length} fields`;
                      }
                      message = message ?? log.event.replace(/_/g, " ");

                      const isLast = idx === auditLogs.filter(Boolean).length - 1;

                      return (
                        <div key={log.id} style={{ position: "relative", marginBottom: isLast ? 0 : 20 }}>

                          {/* Red icon circle */}
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
                                    const rowBg = { padding: "10px 14px", background: ri % 2 === 0 ? "#fff" : "#fafafa", borderTop: ri > 0 ? "1px solid #f1f3f5" : "none" };
                                    if (row.key.startsWith("__add__")) {
                                      return (
                                        <div key={row.key} className="d-flex align-items-center gap-3" style={rowBg}>
                                          <span className="text-muted fs-13 flex-shrink-0" style={{ width: 150 }}>{row.label}</span>
                                          <span className="fs-13 fw-semibold px-2 py-1 rounded" style={{ background: "#f0fff4", color: "#2f9e44" }}>Added</span>
                                        </div>
                                      );
                                    }
                                    if (row.key.startsWith("__rem__")) {
                                      return (
                                        <div key={row.key} className="d-flex align-items-center gap-3" style={rowBg}>
                                          <span className="text-muted fs-13 flex-shrink-0" style={{ width: 150 }}>{row.label}</span>
                                          <span className="fs-13 fw-semibold px-2 py-1 rounded" style={{ background: "#fff4f4", color: "#e03131" }}>Removed</span>
                                        </div>
                                      );
                                    }
                                    return (
                                      <div key={row.key} className="d-flex align-items-center gap-3" style={rowBg}>
                                        <span className="text-muted fs-13 flex-shrink-0" style={{ width: 150 }}>{row.label}</span>
                                        <span className="fs-13 px-2 py-1 rounded text-decoration-line-through flex-shrink-0" style={{ background: "#f1f3f5", color: "#9ca3af" }}>{row.oldVal}</span>
                                        <i className="ti ti-arrow-right flex-shrink-0" style={{ fontSize: 12, color: "#adb5bd" }} />
                                        <span className="fs-13 fw-semibold px-2 py-1 rounded" style={{ background: "#fff4f4", color: "#e03131" }}>{row.newVal}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Actor */}
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

export default PriceListOverview;
