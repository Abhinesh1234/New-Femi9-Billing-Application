import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Toast } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import {
  readAdjustmentList,
  readAdjustmentDetail,
  getAdjustmentList,
  getAdjustmentDetail,
  bustAllAdjustmentCache,
  type AdjustmentRecord,
} from "../../../../core/cache/adjustmentCache";
import { onMutation } from "../../../../core/cache/mutationEvents";
import { all_routes } from "../../../../routes/all_routes";

const route = all_routes;

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="d-flex align-items-start px-4 py-2">
      <span className="text-muted fs-14 flex-shrink-0" style={{ width: "45%" }}>{label}</span>
      <span className="fs-14 fw-medium">{value}</span>
    </div>
  );
}

// ── Receipt styling constants ─────────────────────────────────────────────────
const B  = "1px solid #d0d0d0";
const Bs = "1px solid #e8e8e8";
const cell: React.CSSProperties  = { border: B, padding: "6px 8px", fontSize: 13 };
const hCell: React.CSSProperties = { border: B, padding: "6px 8px", background: "#f7f7f7", fontWeight: 600, fontSize: 11, textTransform: "uppercase" as const };

function fmtAmt(v: string | number | null | undefined): string {
  return parseFloat(String(v ?? "0") || "0").toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  const part = d.substring(0, 10);
  const [y, m, day] = part.split("-");
  if (!y || !m || !day) return d;
  return `${day}/${m}/${y}`;
}

const InventoryAdjustmentOverview = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ── Left panel list ──
  const [allAdjustments, setAllAdjustments] = useState<AdjustmentRecord[]>([]);
  const [listLoading,    setListLoading]    = useState(true);
  const [listSearch,     setListSearch]     = useState("");

  // ── Right panel detail ──
  const [adjustment,    setAdjustment]    = useState<AdjustmentRecord | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [detailError,   setDetailError]   = useState<string | null>(null);

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
    const cached = readAdjustmentList();
    if (cached) { setAllAdjustments(cached); setListLoading(false); return; }
    setListLoading(true);
    getAdjustmentList()
      .then(data => setAllAdjustments(data))
      .catch(() => showToast("danger", "Failed to load adjustments list."))
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
    const cached = readAdjustmentDetail(numId);
    if (cached) {
      if (token !== detailFetchRef.current) return;
      setAdjustment(cached);
      setDetailLoading(false);
      // Silently refresh in background to keep detail fresh
      getAdjustmentDetail(numId).then(data => {
        if (token !== detailFetchRef.current) return;
        setAdjustment(data);
      }).catch(() => {});
      return;
    }
    getAdjustmentDetail(numId)
      .then(data => {
        if (token !== detailFetchRef.current) return;
        setAdjustment(data);
      })
      .catch(() => {
        if (token !== detailFetchRef.current) return;
        setDetailError("Failed to load adjustment.");
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
  }, [id, allAdjustments]);

  // ── Refresh ──
  const handleRefresh = useCallback(async () => {
    if (!id || refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    try {
      bustAllAdjustmentCache();
      const [list, detail] = await Promise.all([
        getAdjustmentList(),
        getAdjustmentDetail(Number(id)),
      ]);
      setAllAdjustments(list);
      setAdjustment(detail);
    } catch {
      showToast("danger", "Network error during refresh.");
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }, [id, showToast]);

  useEffect(() => onMutation("adjustments:mutated", handleRefresh), [handleRefresh]);

  // Reload on window focus — cache-first, no network hit if data is still fresh
  useEffect(() => {
    const onFocus = () => {
      getAdjustmentList().then(data => setAllAdjustments(data)).catch(() => {});
      if (id) {
        getAdjustmentDetail(Number(id)).then(data => setAdjustment(data)).catch(() => {});
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [id]);

  // ── Filtered list ──
  const filteredList = useMemo(() => {
    if (!listSearch.trim()) return allAdjustments;
    const q = listSearch.toLowerCase();
    return allAdjustments.filter(a =>
      (a.reference_number ?? "").toLowerCase().includes(q) ||
      a.reason_name.toLowerCase().includes(q) ||
      (a.location?.name ?? "").toLowerCase().includes(q)
    );
  }, [allAdjustments, listSearch]);

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
          {/* Search bar */}
          <div className="px-3 py-3" style={{ borderBottom: "1px solid #dee2e6", flexShrink: 0 }}>
            <div className="input-group">
              <span className="input-group-text border-end-0 bg-white">
                <i className="ti ti-search text-muted fs-13" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search adjustments…"
                value={listSearch}
                onChange={e => setListSearch(e.target.value)}
              />
              {listSearch && (
                <button type="button" className="btn btn-sm btn-outline-light border-start-0" onClick={() => setListSearch("")}>
                  <i className="ti ti-x fs-12 text-muted" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {listLoading ? (
              <div className="text-center py-4 text-muted fs-13">
                <span className="spinner-border spinner-border-sm me-2" />Loading…
              </div>
            ) : filteredList.length === 0 ? (
              <div className="text-center py-4 text-muted fs-13">
                <i className="ti ti-mood-empty d-block fs-24 mb-1" />
                No adjustments found
              </div>
            ) : (
              filteredList.map(a => {
                const isActive = String(a.id) === id;
                const label    = a.reference_number ?? fmtDate(a.adjustment_date);
                return (
                  <div
                    key={a.id}
                    ref={isActive ? activeItemRef : undefined}
                    onClick={() => navigate(`/inventory-adjustments/${a.id}`)}
                    className="d-flex align-items-center gap-2 px-3"
                    style={{ paddingTop: 11, paddingBottom: 11, cursor: "pointer", background: isActive ? "#fff1f0" : "transparent", borderBottom: "1px solid #f5f5f5" }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "#f8f9fa"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = isActive ? "#fff1f0" : "transparent"; }}
                  >
                    <div
                      className="rounded border d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 28, height: 28, background: "#f5f5f5" }}
                    >
                      <i className="ti ti-adjustments text-muted" style={{ fontSize: 12 }} />
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <div
                        className="text-truncate"
                        style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? "#e03131" : "#212529" }}
                      >
                        {label}
                      </div>
                      <div className="text-truncate fs-12 text-muted">{a.reason_name}</div>
                      {a.location?.name && (
                        <div className="text-truncate fs-12 text-muted d-flex align-items-center gap-1">
                          <i className="ti ti-map-pin" style={{ fontSize: 10 }} />{a.location.name}
                        </div>
                      )}
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
              <span className="fs-14">Loading adjustment…</span>
            </div>
          ) : detailError ? (
            <div style={{ padding: "1.25rem" }}>
              <div className="alert alert-danger">{detailError}</div>
            </div>
          ) : !adjustment ? (
            <div className="text-center py-5 text-muted">
              <i className="ti ti-adjustments fs-36 d-block mb-2" />
              <p className="fs-14 mb-0">Select an adjustment to view details.</p>
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
                    <i className="ti ti-adjustments fs-24 text-muted" />
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                      <h4 className="fw-bold mb-0 lh-sm">
                        {adjustment.reference_number ?? fmtDate(adjustment.adjustment_date)}
                      </h4>
                    </div>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="badge fs-12" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                        {fmtDate(adjustment.adjustment_date)}
                      </span>
                      {adjustment.location?.name && (
                        <span className="badge fs-12" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                          <i className="ti ti-map-pin me-1" style={{ fontSize: 10 }} />
                          {adjustment.location.name}
                        </span>
                      )}
                      {adjustment.reason_name && (
                        <span className="badge fs-12" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                          {adjustment.reason_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: actions + refresh + close */}
                <div className="d-flex align-items-center gap-2">
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
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button className="dropdown-item text-danger">
                            <i className="ti ti-trash me-2" />Delete
                          </button>
                        </li>
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
                    onClick={() => navigate(route.inventoryAdjustments)}
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

                {/* Adjustment Information */}
                <div className="card border mb-3">
                  <div className="card-body p-0">
                    <div className="px-4 py-3 border-bottom">
                      <h6 className="fw-semibold fs-15 mb-0">Adjustment Information</h6>
                    </div>
                    <div className="row g-0 pt-2 pb-1">
                      <div className="col-md-6">
                        <InfoRow label="Reference #" value={adjustment.reference_number ?? "—"} />
                        <InfoRow label="Date" value={fmtDate(adjustment.adjustment_date)} />
                        <InfoRow label="Status" value={
                          <span className={`badge fs-12 ${adjustment.status === "committed" ? "badge-soft-success" : "badge-soft-secondary"}`}>
                            {adjustment.status === "committed" ? "Committed" : "Draft"}
                          </span>
                        } />
                        <InfoRow label="Location" value={adjustment.location?.name ?? "—"} />
                        <InfoRow label="Reason" value={adjustment.reason_name || "—"} />
                      </div>
                      <div className="col-md-6">
                        {adjustment.party && (
                          <InfoRow label="Party" value={adjustment.party.display_name} />
                        )}
                        <InfoRow label="Description" value={adjustment.description || "—"} />
                        <InfoRow label="Items" value={
                          adjustment.items?.length != null
                            ? `${adjustment.items.length} item${adjustment.items.length !== 1 ? "s" : ""}`
                            : adjustment.items_count != null
                            ? `${adjustment.items_count} item${adjustment.items_count !== 1 ? "s" : ""}`
                            : "—"
                        } />
                        {adjustment.createdBy && (
                          <InfoRow label="Created By" value={adjustment.createdBy.name} />
                        )}
                      </div>
                    </div>
                    <div className="d-flex align-items-center px-4 py-3 border-top" style={{ background: "#fafafa", borderRadius: "0 0 8px 8px" }}>
                      <span className="text-muted fs-14 flex-shrink-0" style={{ width: "22.5%" }}>Created On</span>
                      <span className="fs-14 fw-medium">
                        {adjustment.created_at
                          ? new Date(adjustment.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) + ", " +
                            new Date(adjustment.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Adjustment receipt ── */}
                {(() => {
                  const items      = adjustment.items ?? [];
                  const totalItems = items.length;
                  const grandTotal = items.reduce((sum, line) => {
                    return sum + Math.abs(parseFloat(line.qty_adjusted ?? "0")) * parseFloat(line.cost_price ?? "0");
                  }, 0);

                  const sc = adjustment.status === "committed"
                    ? { label: "Committed", color: "#22c55e", shadow: "#22c55e40" }
                    : { label: "Draft",     color: "#94a3b8", shadow: "#94a3b840" };

                  return (
                    <div className="card shadow-sm mb-3" style={{ border: "1px solid #e0e0e0", borderRadius: 8, padding: 24 }}>

                      {/* Status stamp + print */}
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
                          title="Print Adjustment">
                          <i className="ti ti-printer" style={{ fontSize: 15 }} />
                        </button>
                      </div>

                      {/* Receipt document */}
                      <div className="adjustment-receipt" style={{ border: B, background: "#fff", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 13, color: "#222" }}>

                        <div style={{ textAlign: "center", fontWeight: 700, fontSize: 16, padding: "7px 0", borderBottom: B }}>
                          Inventory Adjustment
                        </div>

                        <div style={{ display: "flex", borderBottom: B }}>
                          <div style={{ flex: 1, borderRight: B }}>
                            {[
                              { label: "Reference #", value: adjustment.reference_number ?? "—" },
                              { label: "Date",        value: fmtDate(adjustment.adjustment_date) },
                              { label: "Location",    value: adjustment.location?.name ?? "—" },
                              { label: "Reason",      value: adjustment.reason_name || "—" },
                              { label: "Description", value: adjustment.description ?? "—" },
                            ].map(row => (
                              <div key={row.label} style={{ display: "flex", borderBottom: Bs }}>
                                <div style={{ width: "38%", padding: "7px 10px", fontWeight: 600, fontSize: 12, color: "#555", borderRight: Bs }}>{row.label}</div>
                                <div style={{ flex: 1, padding: "7px 10px", fontSize: 13 }}>{row.value}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{ width: 220, padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16, justifyContent: "center" }}>
                            <div>
                              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Total Cost Impact</div>
                              <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>₹{fmtAmt(grandTotal)}</div>
                            </div>
                            <div style={{ borderTop: Bs, paddingTop: 14 }}>
                              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Items Adjusted</div>
                              <div style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>{totalItems}</div>
                            </div>
                          </div>
                        </div>

                        {items.length > 0 && (
                          <table style={{ width: "100%", borderCollapse: "collapse", borderBottom: B }}>
                            <thead>
                              <tr>
                                <th style={{ ...hCell, width: 36, textAlign: "center" }}>#</th>
                                <th style={hCell}>Item Details</th>
                                <th style={{ ...hCell, width: 90 }}>SKU</th>
                                <th style={{ ...hCell, width: 110, textAlign: "center" }}>Qty Adjusted</th>
                                <th style={{ ...hCell, width: 120, textAlign: "center" }}>New Qty on Hand</th>
                                <th style={{ ...hCell, width: 110, textAlign: "right" }}>Cost / Unit</th>
                                <th style={{ ...hCell, width: 110, textAlign: "right" }}>Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.map((line, idx) => {
                                const adj = parseFloat(line.qty_adjusted ?? "0");
                                const cp  = parseFloat(line.cost_price  ?? "0");
                                const amt = Math.abs(adj) * cp;
                                const isPos = adj > 0;
                                const isNeg = adj < 0;
                                return (
                                  <tr key={line.id} style={{ borderBottom: Bs }}>
                                    <td style={{ ...cell, textAlign: "center", color: "#6b7280" }}>{idx + 1}</td>
                                    <td style={cell}>
                                      <div style={{ fontWeight: 600 }}>{line.item_name}</div>
                                      {line.item_unit && <div style={{ fontSize: 11, color: "#6b7280" }}>{line.item_unit}</div>}
                                    </td>
                                    <td style={{ ...cell, color: "#6b7280" }}>{line.item_sku ?? "—"}</td>
                                    <td style={{ ...cell, textAlign: "center", fontWeight: 700, color: isPos ? "#16a34a" : isNeg ? "#dc2626" : "#374151" }}>
                                      {isPos ? "+" : ""}{adj % 1 === 0 ? adj : adj.toFixed(2)}
                                    </td>
                                    <td style={{ ...cell, textAlign: "center" }}>
                                      {(() => { const n = parseFloat(line.new_qty_on_hand ?? "0"); return n % 1 === 0 ? n : n.toFixed(2); })()}
                                    </td>
                                    <td style={{ ...cell, textAlign: "right" }}>₹{fmtAmt(cp)}</td>
                                    <td style={{ ...cell, textAlign: "right", fontWeight: 600 }}>₹{fmtAmt(amt)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot>
                              <tr style={{ borderTop: "2px solid #aaa" }}>
                                <td colSpan={6} style={{ ...cell, textAlign: "right", fontWeight: 700, fontStyle: "italic" }}>Total</td>
                                <td style={{ ...cell, textAlign: "right", fontWeight: 700 }}>₹{fmtAmt(grandTotal)}</td>
                              </tr>
                            </tfoot>
                          </table>
                        )}

                        <div style={{ textAlign: "center", fontSize: 11, fontStyle: "italic", padding: "6px 0", color: "#6b7280" }}>
                          This is a computer-generated inventory adjustment record
                        </div>
                      </div>

                      <div className="d-inline-flex align-items-center gap-2 mt-4 px-3 py-2 rounded"
                        style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}>
                        <i className="ti ti-clock text-muted fs-14" />
                        <span className="fs-14 text-muted">
                          Created on{" "}
                          <span className="fw-semibold" style={{ color: "#495057" }}>
                            {new Date(adjustment.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                            {", "}
                            {new Date(adjustment.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                          </span>
                        </span>
                      </div>

                    </div>
                  );
                })()}

                {/* Attachments */}
                {adjustment.attachments && adjustment.attachments.length > 0 && (
                  <div className="card border">
                    <div className="card-body p-0">
                      <div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between">
                        <h6 className="fw-semibold fs-15 mb-0">Attachments</h6>
                        <span className="badge badge-soft-secondary fs-12">{adjustment.attachments.length}</span>
                      </div>
                      <div className="px-4 py-2">
                        {adjustment.attachments.map((att, idx) => (
                          <div
                            key={att.id}
                            className="d-flex align-items-center gap-3 py-2"
                            style={{ borderBottom: idx < adjustment.attachments!.length - 1 ? "1px solid #f5f5f5" : "none" }}
                          >
                            <i className="ti ti-paperclip text-muted fs-16 flex-shrink-0" />
                            <a
                              href={`/storage/${att.file_path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="fs-14 text-primary text-truncate flex-grow-1"
                            >
                              {att.file_name}
                            </a>
                            <span className="fs-12 text-muted flex-shrink-0">
                              {(att.file_size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default InventoryAdjustmentOverview;
