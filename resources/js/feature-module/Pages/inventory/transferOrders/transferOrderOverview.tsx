import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Toast } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import {
  initiateTransferOrder,
  markTransferOrderAsTransferred,
  cancelTransferOrder,
  type TransferOrderRecord,
  type TransferOrderDetail,
  type TransferOrderStatus,
} from "../../../../core/services/transferOrderApi";
import {
  readTransferOrderList,
  readTransferOrderDetail,
  getTransferOrderList,
  getTransferOrderDetail,
  bustAllTransferOrderCache,
} from "../../../../core/cache/transferOrderCache";
import { onMutation, emitMutation } from "../../../../core/cache/mutationEvents";
import { all_routes } from "../../../../routes/all_routes";

const route = all_routes;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  const part = d.substring(0, 10);
  const [y, m, day] = part.split("-");
  if (!y || !m || !day) return d;
  return `${day}/${m}/${y}`;
}

function fmtQty(v: number | string | null | undefined): string {
  const n = parseFloat(String(v ?? "0") || "0");
  return n % 1 === 0 ? String(n) : n.toFixed(2);
}

const STATUS_BADGE: Record<TransferOrderStatus, string> = {
  draft:       "badge-soft-secondary",
  in_transit:  "badge-soft-warning",
  transferred: "badge-soft-success",
  cancelled:   "badge-soft-danger",
};

const STATUS_LABEL: Record<TransferOrderStatus, string> = {
  draft:       "Draft",
  in_transit:  "In Transit",
  transferred: "Transferred",
  cancelled:   "Cancelled",
};

// Receipt constants
const B  = "1px solid #d0d0d0";
const Bs = "1px solid #e8e8e8";
const cell:  React.CSSProperties = { border: B, padding: "6px 8px", fontSize: 13 };
const hCell: React.CSSProperties = { border: B, padding: "6px 8px", background: "#f7f7f7", fontWeight: 600, fontSize: 11, textTransform: "uppercase" as const };

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="d-flex align-items-start px-4 py-2">
      <span className="text-muted fs-14 flex-shrink-0" style={{ width: "45%" }}>{label}</span>
      <span className="fs-14 fw-medium">{value}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const TransferOrderOverview = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ── Left panel list ──
  const [allOrders,   setAllOrders]   = useState<TransferOrderRecord[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listSearch,  setListSearch]  = useState("");
  const [listFilter,  setListFilter]  = useState<"all" | TransferOrderStatus>("all");

  // ── Right panel detail ──
  const [order,         setOrder]         = useState<TransferOrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [detailError,   setDetailError]   = useState<string | null>(null);

  // ── Action states ──
  const [actioning, setActioning] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason,    setCancelReason]    = useState("");

  const [refreshing,   setRefreshing]   = useState(false);
  const refreshingRef  = useRef(false);
  const detailFetchRef = useRef(0);
  const activeItemRef  = useRef<HTMLDivElement>(null);

  // ── Toast ──
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger"; message: string }>({ show: false, type: "success", message: "" });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((type: "success" | "danger", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  }, []);
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // ── Fetch list ──
  useEffect(() => {
    const cached = readTransferOrderList();
    if (cached) { setAllOrders(cached); setListLoading(false); return; }
    setListLoading(true);
    getTransferOrderList()
      .then(data => setAllOrders(data))
      .catch(() => {})
      .finally(() => setListLoading(false));
  }, []);

  // ── Fetch detail ──
  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    if (isNaN(numId)) return;
    const token = ++detailFetchRef.current;

    setDetailLoading(true);
    setDetailError(null);
    const cached = readTransferOrderDetail(numId);
    if (cached) {
      if (token !== detailFetchRef.current) return;
      setOrder(cached);
      setDetailLoading(false);
      // Silently refresh in background to keep detail fresh
      getTransferOrderDetail(numId).then(data => {
        if (token !== detailFetchRef.current) return;
        setOrder(data);
      }).catch(() => {});
      return;
    }
    getTransferOrderDetail(numId)
      .then(data => {
        if (token !== detailFetchRef.current) return;
        setOrder(data);
      })
      .catch(() => {
        if (token !== detailFetchRef.current) return;
        setDetailError("Failed to load transfer order.");
      })
      .finally(() => {
        if (token !== detailFetchRef.current) return;
        setDetailLoading(false);
      });
  }, [id]);

  // ── Scroll active item into view ──
  useEffect(() => {
    const timer = setTimeout(() => {
      activeItemRef.current?.scrollIntoView({ block: "center", behavior: "instant" });
    }, 50);
    return () => clearTimeout(timer);
  }, [id, allOrders]);

  // ── Refresh ──
  const handleRefresh = useCallback(async () => {
    if (!id || refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    try {
      bustAllTransferOrderCache();
      const [list, detail] = await Promise.all([
        getTransferOrderList(),
        getTransferOrderDetail(Number(id)),
      ]);
      setAllOrders(list);
      setOrder(detail);
    } catch {
      showToast("danger", "Network error during refresh.");
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }, [id, showToast]);

  useEffect(() => onMutation("transfer-orders:mutated", handleRefresh), [handleRefresh]);

  // Reload on window focus — cache-first, no network hit if data is still fresh
  useEffect(() => {
    const onFocus = () => {
      getTransferOrderList().then(data => setAllOrders(data)).catch(() => {});
      if (id) {
        getTransferOrderDetail(Number(id)).then(data => setOrder(data)).catch(() => {});
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [id]);

  // ── Actions ──
  const handleInitiate = async () => {
    if (!order || actioning) return;
    setActioning(true);
    const res = await initiateTransferOrder(order.id);
    if (res.success) {
      showToast("success", "Transfer order initiated successfully.");
      bustAllTransferOrderCache();
      emitMutation("transfer-orders:mutated");
      getTransferOrderDetail(order.id).then(d => setOrder(d)).catch(() => {});
    } else {
      showToast("danger", (res as any).message ?? "Failed to initiate transfer order.");
    }
    setActioning(false);
  };

  const handleMarkTransferred = async () => {
    if (!order || actioning) return;
    setActioning(true);
    const res = await markTransferOrderAsTransferred(order.id);
    if (res.success) {
      showToast("success", "Transfer order marked as transferred. Stock movements applied.");
      bustAllTransferOrderCache();
      emitMutation("transfer-orders:mutated");
      getTransferOrderDetail(order.id).then(d => setOrder(d)).catch(() => {});
    } else {
      showToast("danger", (res as any).message ?? "Failed to complete transfer.");
    }
    setActioning(false);
  };

  const handleCancel = async () => {
    if (!order || actioning) return;
    setActioning(true);
    const res = await cancelTransferOrder(order.id, cancelReason || undefined);
    if (res.success) {
      showToast("success", "Transfer order cancelled.");
      bustAllTransferOrderCache();
      emitMutation("transfer-orders:mutated");
      setShowCancelModal(false);
      setCancelReason("");
      const [detail, list] = await Promise.all([
        getTransferOrderDetail(order.id),
        getTransferOrderList(),
      ]);
      setOrder(detail);
      setAllOrders(list);
    } else {
      showToast("danger", (res as any).message ?? "Failed to cancel transfer order.");
    }
    setActioning(false);
  };

  const LIST_FILTERS: { key: "all" | TransferOrderStatus; label: string; icon: string }[] = [
    { key: "all",         label: "All Orders",   icon: "ti-list"           },
    { key: "draft",       label: "Draft",        icon: "ti-file"           },
    { key: "in_transit",  label: "In Transit",   icon: "ti-truck"          },
    { key: "transferred", label: "Transferred",  icon: "ti-circle-check"   },
    { key: "cancelled",   label: "Cancelled",    icon: "ti-circle-x"       },
  ];

  // ── Filtered list ──
  const filteredList = useMemo(() => {
    let base = listFilter === "all" ? allOrders : allOrders.filter(o => o.status === listFilter);
    const q  = listSearch.trim().toLowerCase();
    if (!q) return base;
    return base.filter(o =>
      o.transfer_number.toLowerCase().includes(q) ||
      (o.source_location?.name ?? "").toLowerCase().includes(q) ||
      (o.destination_location?.name ?? "").toLowerCase().includes(q)
    );
  }, [allOrders, listSearch, listFilter]);

  // ── Receipt stamp config ──
  const stampConfig: Record<TransferOrderStatus, { label: string; color: string; shadow: string }> = {
    draft:       { label: "Draft",       color: "#94a3b8", shadow: "#94a3b840" },
    in_transit:  { label: "In Transit",  color: "#f59e0b", shadow: "#f59e0b40" },
    transferred: { label: "Transferred", color: "#22c55e", shadow: "#22c55e40" },
    cancelled:   { label: "Cancelled",   color: "#ef4444", shadow: "#ef444440" },
  };

  return (
    <div
      className="page-wrapper"
      style={{ height: "calc(100vh - 57px)", minHeight: "unset", overflow: "hidden", display: "flex", flexDirection: "column" }}
    >

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      <div className="position-fixed top-0 start-50 translate-middle-x pt-4" style={{ zIndex: 9999, pointerEvents: "none" }}>
        <Toast show={toast.show} onClose={() => setToast(t => ({ ...t, show: false }))}
          role="alert" aria-live="assertive" aria-atomic="true"
          style={{ pointerEvents: "auto", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.10)", border: "none", minWidth: 320, background: "#fff" }}>
          <Toast.Body className="d-flex align-items-center gap-3 px-4 py-3">
            <span className={`d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 ${toast.type === "success" ? "bg-success" : "bg-danger"}`}
              style={{ width: 36, height: 36 }}>
              <i className={`ti fs-16 text-white ${toast.type === "success" ? "ti-check" : "ti-x"}`} />
            </span>
            <span className="fw-medium fs-14">{toast.message}</span>
          </Toast.Body>
        </Toast>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Left panel ────────────────────────────────────────────────────── */}
        <div
          className="d-none d-xl-flex"
          style={{ width: 340, minWidth: 340, flexDirection: "column", borderRight: "1px solid #dee2e6", background: "#fff", overflow: "hidden" }}
        >
          <div className="px-3 py-3" style={{ borderBottom: "1px solid #dee2e6", flexShrink: 0 }}>
            <div className="d-flex align-items-center gap-2">
              <div className="input-group flex-grow-1">
                <span className="input-group-text border-end-0 bg-white">
                  <i className="ti ti-search text-muted fs-13" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search transfer orders…"
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
                  {LIST_FILTERS.map(f => (
                    <button
                      key={f.key}
                      className="dropdown-item d-flex align-items-center gap-2 fs-13"
                      style={{ fontWeight: listFilter === f.key ? 600 : 400, color: listFilter === f.key ? "#e03131" : undefined }}
                      onClick={() => setListFilter(f.key)}
                    >
                      <i className={`ti ${f.icon} fs-13`} />
                      {f.label}
                      {listFilter === f.key && <i className="ti ti-check ms-auto fs-12" style={{ color: "#e03131" }} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {listLoading ? (
              <div className="text-center py-4 text-muted fs-13">
                <span className="spinner-border spinner-border-sm me-2" />Loading…
              </div>
            ) : filteredList.length === 0 ? (
              <div className="text-center py-4 text-muted fs-13">
                <i className="ti ti-mood-empty d-block fs-24 mb-1" />
                No transfer orders found
              </div>
            ) : (
              filteredList.map(o => {
                const isActive = String(o.id) === id;
                return (
                  <div
                    key={o.id}
                    ref={isActive ? activeItemRef : undefined}
                    onClick={() => navigate(route.transferOrderOverview.replace(":id", String(o.id)))}
                    className="d-flex align-items-center gap-2 px-3"
                    style={{ paddingTop: 16, paddingBottom: 16, cursor: "pointer", background: isActive ? "#fff1f0" : "transparent", borderBottom: "1px solid #f5f5f5" }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "#f8f9fa"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = isActive ? "#fff1f0" : "transparent"; }}
                  >
                    <div
                      className="rounded border d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 28, height: 28, background: "#f5f5f5" }}
                    >
                      <i className="ti ti-transfer text-muted" style={{ fontSize: 12 }} />
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="d-flex align-items-center justify-content-between gap-1 mb-1">
                        <div
                          className="text-truncate"
                          style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? "#e03131" : "#212529" }}
                        >
                          {o.transfer_number}
                        </div>
                        <span className={`badge ${STATUS_BADGE[o.status]} fs-11 flex-shrink-0`} style={{ fontSize: 10 }}>
                          {STATUS_LABEL[o.status]}
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-1 fs-12 text-muted text-truncate">
                        <i className="ti ti-map-pin" style={{ fontSize: 10, flexShrink: 0 }} />
                        <span className="text-truncate">{o.source_location?.name ?? "—"}</span>
                        <i className="ti ti-arrow-right" style={{ fontSize: 10, flexShrink: 0 }} />
                        <span className="text-truncate">{o.destination_location?.name ?? "—"}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right panel ───────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", background: "#fff" }}>
          {detailLoading ? (
            <div className="text-center py-5 text-muted">
              <span className="spinner-border spinner-border-sm text-primary me-2" />
              <span className="fs-14">Loading transfer order…</span>
            </div>
          ) : detailError ? (
            <div style={{ padding: "1.25rem" }}>
              <div className="alert alert-danger">{detailError}</div>
            </div>
          ) : !order ? (
            <div className="text-center py-5 text-muted">
              <i className="ti ti-transfer fs-36 d-block mb-2" />
              <p className="fs-14 mb-0">Select a transfer order to view details.</p>
            </div>
          ) : (
            <div style={{ padding: "1.25rem" }}>

              {/* ── Header ── */}
              <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">

                {/* Left: icon + title + badges */}
                <div className="d-flex align-items-start gap-3">
                  <div
                    className="rounded border d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 56, height: 56, background: "#f5f5f5" }}
                  >
                    <i className="ti ti-transfer fs-24 text-muted" />
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                      <h4 className="fw-bold mb-0 lh-sm">{order.transfer_number}</h4>
                      <span className={`badge fs-12 ${STATUS_BADGE[order.status]}`}>
                        {STATUS_LABEL[order.status]}
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="badge fs-12" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                        <i className="ti ti-calendar me-1" style={{ fontSize: 10 }} />
                        {fmtDate(order.transfer_date)}
                      </span>
                      <span className="badge fs-12" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                        <i className="ti ti-map-pin me-1" style={{ fontSize: 10 }} />
                        {order.source_location?.name ?? "—"}
                      </span>
                      <i className="ti ti-arrow-right text-muted" style={{ fontSize: 12 }} />
                      <span className="badge fs-12" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                        <i className="ti ti-map-pin-check me-1" style={{ fontSize: 10 }} />
                        {order.destination_location?.name ?? "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: action buttons + refresh + close */}
                <div className="d-flex align-items-center gap-2 flex-wrap">

                  {/* Status-based action buttons */}
                  {order.status === "draft" && (
                    <button
                      type="button"
                      className="btn btn-primary d-flex align-items-center gap-1"
                      style={{ height: 36 }}
                      onClick={handleInitiate}
                      disabled={actioning}
                    >
                      {actioning
                        ? <span className="spinner-border spinner-border-sm me-1" />
                        : <i className="ti ti-truck me-1" />}
                      Initiate Transfer
                    </button>
                  )}

                  {/* Actions dropdown */}
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
                          <button className="dropdown-item" onClick={() => window.print()}>
                            <i className="ti ti-printer me-2" />Print
                          </button>
                        </li>
                        {order.status === "transferred" && (
                          <>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                              <button
                                className="dropdown-item text-danger"
                                onClick={() => setShowCancelModal(true)}
                              >
                                <i className="ti ti-ban me-2" />Cancel Order
                              </button>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>

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
                    onClick={() => navigate(route.transferOrders)}
                    title="Close"
                  >
                    <i className="ti ti-x" style={{ fontSize: 16 }} />
                  </button>
                </div>
              </div>

              {/* ── Tab nav (pill) ── */}
              <div className="mb-4 scrollbar-hidden" style={{ overflowX: "auto" }}>
                <div className="d-inline-flex rounded" style={{ background: "#f1f3f5", padding: 4, gap: 2 }}>
                  <button
                    type="button"
                    style={{
                      padding: "6px 20px", borderRadius: 6, border: "none",
                      background: "#fff", color: "#e03131", fontWeight: 600, fontSize: 14,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.10)", transition: "all 0.15s",
                      cursor: "pointer", whiteSpace: "nowrap",
                    }}
                  >
                    Overview
                  </button>
                </div>
              </div>

              {/* ── Overview tab body ── */}
              <div>

                {/* Transfer Information card */}
                <div className="card border mb-3">
                  <div className="card-body p-0">
                    <div className="px-4 border-bottom d-flex align-items-center justify-content-between" style={{ height: 52 }}>
                      <h6 className="fw-semibold fs-15 mb-0">Transfer Information</h6>
                      {(order.status === "in_transit" || order.status === "draft") && (
                        <div className="d-flex align-items-center gap-2">
                          {order.status === "in_transit" && (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm d-flex align-items-center gap-1"
                              style={{ height: 34, fontSize: 13 }}
                              onClick={handleMarkTransferred}
                              disabled={actioning}
                            >
                              {actioning
                                ? <span className="spinner-border spinner-border-sm" />
                                : <i className="ti ti-circle-check" />}
                              Mark as Transferred
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
                            style={{ height: 34, fontSize: 13 }}
                            onClick={() => setShowCancelModal(true)}
                            disabled={actioning}
                          >
                            <i className="ti ti-x" />Cancel
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="row g-0 pt-2 pb-1">
                      <div className="col-md-6">
                        <InfoRow label="Transfer #" value={order.transfer_number} />
                        <InfoRow label="Date" value={fmtDate(order.transfer_date)} />
                        <InfoRow label="Status" value={
                          <span className={`badge fs-12 ${STATUS_BADGE[order.status]}`}>
                            {STATUS_LABEL[order.status]}
                          </span>
                        } />
                        <InfoRow label="Source Location" value={
                          <span className="d-flex align-items-center gap-1">
                            <i className="ti ti-map-pin fs-13 text-muted" />
                            {order.source_location?.name ?? "—"}
                          </span>
                        } />
                        <InfoRow label="Destination Location" value={
                          <span className="d-flex align-items-center gap-1">
                            <i className="ti ti-map-pin-check fs-13 text-muted" />
                            {order.destination_location?.name ?? "—"}
                          </span>
                        } />
                      </div>
                      <div className="col-md-6">
                        <InfoRow label="Notes" value={order.reason || "—"} />
                        <InfoRow label="Items" value={`${order.lines?.length ?? 0} item${(order.lines?.length ?? 0) !== 1 ? "s" : ""}`} />
                        {order.created_by && (
                          <InfoRow label="Created By" value={(order.created_by as any).name ?? "—"} />
                        )}
                        {order.initiated_by && (
                          <InfoRow label="Initiated By" value={(order.initiated_by as any).name ?? "—"} />
                        )}
                        {order.transferred_by && (
                          <InfoRow label="Transferred By" value={(order.transferred_by as any).name ?? "—"} />
                        )}
                        {order.cancelled_by && (
                          <InfoRow label="Cancelled By" value={(order.cancelled_by as any).name ?? "—"} />
                        )}
                        {order.cancellation_reason && (
                          <InfoRow label="Cancel Reason" value={order.cancellation_reason} />
                        )}
                      </div>
                    </div>
                    {/* Timeline footer */}
                    <div className="d-flex align-items-center flex-wrap gap-3 px-4 py-3 border-top" style={{ background: "#fafafa", borderRadius: "0 0 8px 8px" }}>
                      {order.created_at && (
                        <span className="fs-13 text-muted d-flex align-items-center gap-1">
                          <i className="ti ti-plus-circle fs-13 text-danger" />
                          Created&nbsp;
                          <span className="fw-medium" style={{ color: "#495057" }}>
                            {new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                        </span>
                      )}
                      {order.initiated_at && (
                        <>
                          <i className="ti ti-arrow-right text-muted fs-12" />
                          <span className="fs-13 text-muted d-flex align-items-center gap-1">
                            <i className="ti ti-truck fs-13 text-danger" />
                            Initiated&nbsp;
                            <span className="fw-medium" style={{ color: "#495057" }}>
                              {new Date(order.initiated_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                          </span>
                        </>
                      )}
                      {order.transferred_at && (
                        <>
                          <i className="ti ti-arrow-right text-muted fs-12" />
                          <span className="fs-13 text-muted d-flex align-items-center gap-1">
                            <i className="ti ti-circle-check fs-13 text-danger" />
                            Transferred&nbsp;
                            <span className="fw-medium" style={{ color: "#495057" }}>
                              {new Date(order.transferred_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                          </span>
                        </>
                      )}
                      {order.cancelled_at && (
                        <>
                          <i className="ti ti-arrow-right text-muted fs-12" />
                          <span className="fs-13 text-muted d-flex align-items-center gap-1">
                            <i className="ti ti-ban fs-13 text-danger" style={{ color: "#e03131" }} />
                            Cancelled&nbsp;
                            <span className="fw-medium" style={{ color: "#495057" }}>
                              {new Date(order.cancelled_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Transfer receipt ── */}
                {(() => {
                  const lines = order.lines ?? [];
                  const sc    = stampConfig[order.status];

                  return (
                    <div className="card shadow-sm mb-3" style={{ border: "1px solid #e0e0e0", borderRadius: 8, padding: 24 }}>

                      {/* Stamp + print */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                        <div style={{ display: "inline-flex", alignItems: "center", padding: "10px 10px 4px 10px" }}>
                          <div style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            border: `3px solid ${sc.color}`, outline: `1px solid ${sc.color}`, outlineOffset: 3,
                            borderRadius: 3, padding: "3px 18px", transform: "rotate(-6deg)",
                            color: sc.color, fontWeight: 900, fontSize: 15, letterSpacing: "0.22em",
                            textTransform: "uppercase", opacity: 0.82, userSelect: "none",
                            boxShadow: `2px 2px 0 ${sc.shadow}`, fontFamily: "Arial, Helvetica, sans-serif",
                          }}>
                            {sc.label}
                          </div>
                        </div>
                        <button type="button" onClick={() => window.print()}
                          style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 7, width: 34, height: 34, cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}
                          title="Print">
                          <i className="ti ti-printer" style={{ fontSize: 15 }} />
                        </button>
                      </div>

                      {/* Receipt document */}
                      <div className="transfer-receipt" style={{ border: B, background: "#fff", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 13, color: "#222" }}>

                        <div style={{ textAlign: "center", fontWeight: 700, fontSize: 16, padding: "7px 0", borderBottom: B }}>
                          Transfer Order
                        </div>

                        <div style={{ display: "flex", borderBottom: B }}>
                          <div style={{ flex: 1, borderRight: B }}>
                            {[
                              { label: "Transfer #",   value: order.transfer_number },
                              { label: "Date",         value: fmtDate(order.transfer_date) },
                              { label: "Source",       value: order.source_location?.name ?? "—" },
                              { label: "Destination",  value: order.destination_location?.name ?? "—" },
                              { label: "Notes",        value: order.reason ?? "—" },
                            ].map(row => (
                              <div key={row.label} style={{ display: "flex", borderBottom: Bs }}>
                                <div style={{ width: "38%", padding: "7px 10px", fontWeight: 600, fontSize: 12, color: "#555", borderRight: Bs }}>{row.label}</div>
                                <div style={{ flex: 1, padding: "7px 10px", fontSize: 13 }}>{row.value}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{ width: 200, padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16, justifyContent: "center" }}>
                            <div>
                              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Total Items</div>
                              <div style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>{lines.length}</div>
                            </div>
                            <div style={{ borderTop: Bs, paddingTop: 14 }}>
                              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Total Qty</div>
                              <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>
                                {fmtQty(lines.reduce((s, l) => s + (l.qty_to_transfer ?? 0), 0))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {lines.length > 0 && (
                          <table style={{ width: "100%", borderCollapse: "collapse", borderBottom: B }}>
                            <thead>
                              <tr>
                                <th style={{ ...hCell, width: 36, textAlign: "center" }}>#</th>
                                <th style={hCell}>Item</th>
                                <th style={{ ...hCell, width: 90 }}>SKU</th>
                                <th style={{ ...hCell, width: 70 }}>Unit</th>
                                <th style={{ ...hCell, width: 110, textAlign: "center" }}>Qty to Transfer</th>
                                <th style={{ ...hCell, width: 110, textAlign: "center" }}>Source Stock</th>
                                <th style={{ ...hCell, width: 110, textAlign: "center" }}>Dest. Stock</th>
                                <th style={{ ...hCell, width: 180 }}>Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {lines.map((line, idx) => (
                                <tr key={line.id} style={{ borderBottom: Bs }}>
                                  <td style={{ ...cell, textAlign: "center", color: "#6b7280" }}>{idx + 1}</td>
                                  <td style={cell}>
                                    <div style={{ fontWeight: 600 }}>{line.item?.name ?? `Item #${line.item_id}`}</div>
                                  </td>
                                  <td style={{ ...cell, color: "#6b7280" }}>{line.item?.sku ?? "—"}</td>
                                  <td style={{ ...cell, color: "#6b7280" }}>{line.item?.unit ?? "—"}</td>
                                  <td style={{ ...cell, textAlign: "center", fontWeight: 700, color: "#2563eb" }}>
                                    {fmtQty(line.qty_to_transfer)}
                                  </td>
                                  <td style={{ ...cell, textAlign: "center", color: "#6b7280" }}>
                                    {line.source_qty_snapshot != null ? fmtQty(line.source_qty_snapshot) : "—"}
                                  </td>
                                  <td style={{ ...cell, textAlign: "center", color: "#6b7280" }}>
                                    {line.dest_qty_snapshot != null ? fmtQty(line.dest_qty_snapshot) : "—"}
                                  </td>
                                  <td style={{ ...cell, color: "#6b7280" }}>{line.description ?? "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr style={{ borderTop: "2px solid #aaa" }}>
                                <td colSpan={4} style={{ ...cell, textAlign: "right", fontWeight: 700, fontStyle: "italic" }}>Total</td>
                                <td style={{ ...cell, textAlign: "center", fontWeight: 700 }}>
                                  {fmtQty(lines.reduce((s, l) => s + (l.qty_to_transfer ?? 0), 0))}
                                </td>
                                <td colSpan={3} style={cell} />
                              </tr>
                            </tfoot>
                          </table>
                        )}

                        <div style={{ textAlign: "center", fontSize: 11, fontStyle: "italic", padding: "6px 0", color: "#6b7280" }}>
                          This is a computer-generated transfer order record
                        </div>
                      </div>

                      <div className="d-inline-flex align-items-center gap-2 mt-4 px-3 py-2 rounded"
                        style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}>
                        <i className="ti ti-clock text-muted fs-14" />
                        <span className="fs-14 text-muted">
                          Created on{" "}
                          <span className="fw-semibold" style={{ color: "#495057" }}>
                            {new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                            {", "}
                            {new Date(order.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                          </span>
                        </span>
                      </div>

                    </div>
                  );
                })()}

              </div>

            </div>
          )}
        </div>

      </div>

      {/* ── Cancel confirmation modal ─────────────────────────────────────────── */}
      {showCancelModal && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 1060, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}
          onClick={e => { if (e.target === e.currentTarget) { setShowCancelModal(false); setCancelReason(""); } }}
        >
          <div style={{ background: "#fff", borderRadius: 14, width: 480, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="ti ti-ban fs-18" style={{ color: "#ef4444" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 16, color: "#0f172a" }}>Cancel Transfer Order</p>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                  {order?.status === "in_transit"
                    ? "This will release committed stock back to available."
                    : "This will reverse stock movements."}
                </p>
              </div>
              <button type="button" onClick={() => { setShowCancelModal(false); setCancelReason(""); }}
                style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #fecaca", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}>
                <i className="ti ti-x" style={{ fontSize: 14, color: "#ef4444" }} />
              </button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <label className="form-label fs-14 fw-medium">Reason for cancellation (optional)</label>
              <textarea
                className="form-control fs-14"
                rows={3}
                placeholder="Enter reason…"
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
              />
            </div>
            <div style={{ padding: "0 24px 22px", display: "flex", alignItems: "center", gap: 8 }}>
              <button className="btn btn-danger me-2" onClick={handleCancel} disabled={actioning}>
                {actioning ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                Confirm Cancel
              </button>
              <button className="btn btn-outline-light" onClick={() => { setShowCancelModal(false); setCancelReason(""); }}>
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TransferOrderOverview;
