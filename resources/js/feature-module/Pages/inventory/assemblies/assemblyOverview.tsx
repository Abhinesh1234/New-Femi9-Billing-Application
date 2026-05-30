import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Toast } from "react-bootstrap";
import { useNavigate, useParams, useLocation as useRouterLocation } from "react-router";
import {
  deleteAssembly,
  type AssemblyRecord,
} from "../../../../core/services/assemblyApi";
import {
  readAssemblyList,
  readAssemblyDetail,
  getAssemblyList,
  getAssemblyDetail,
  bustAssembly,
  bustAllAssemblyCache,
  hydrateAssemblyList,
} from "../../../../core/cache/assemblyCache";
import { emitMutation, onMutation } from "../../../../core/cache/mutationEvents";
import { all_routes } from "../../../../routes/all_routes";
import ConfirmDialog, { type ConfirmConfig } from "../../../../components/confirm-dialog/ConfirmDialog";

const route = all_routes;

type ListFilter = "all" | "completed" | "cancelled";

// ── Border shorthands used in the receipt ─────────────────────────────────────
const B  = "1px solid #d0d0d0";
const Bs = "1px solid #e8e8e8";
const cell: React.CSSProperties  = { border: B, padding: "6px 8px", fontSize: 13 };
const hCell: React.CSSProperties = { border: B, padding: "6px 8px", background: "#f7f7f7", fontWeight: 600, fontSize: 11, textTransform: "uppercase" as const };

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  const part = d.substring(0, 10);
  const [y, m, day] = part.split("-");
  if (!y || !m || !day) return d;
  return `${day}/${m}/${y}`;
}

function fmtAmt(v: string | number | null | undefined): string {
  return parseFloat(String(v ?? "0") || "0").toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

const AssemblyOverview = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const navState = useRouterLocation().state as { listFilter?: ListFilter } | null;

  // ── Assemblies list (left panel) ──
  const [allAssemblies, setAllAssemblies] = useState<AssemblyRecord[]>(() => readAssemblyList() ?? []);
  const [listLoading,   setListLoading]   = useState(() => (readAssemblyList() == null));
  const [listFilter,    setListFilter]    = useState<ListFilter>(navState?.listFilter ?? "all");
  const [listSearch,    setListSearch]    = useState("");

  // ── Assembly detail (right panel) ──
  const [assembly,      setAssembly]      = useState<AssemblyRecord | null>(() => {
    const n = Number(id); return isNaN(n) ? null : readAssemblyDetail(n) ?? null;
  });
  const [detailLoading, setDetailLoading] = useState(() => {
    const n = Number(id); return !isNaN(n) && readAssemblyDetail(n) == null;
  });
  const [detailError,   setDetailError]   = useState<string | null>(null);

  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  const [refreshing,    setRefreshing]    = useState(false);
  const refreshingRef  = useRef(false);
  // Stale-response guard — incremented on every id change
  const detailFetchRef = useRef(0);

  const activeItemRef = useRef<HTMLDivElement>(null);

  // ── Toast ──
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger"; message: string }>({ show: false, type: "success", message: "" });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((type: "success" | "danger", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  }, []);
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // ── Fetch list (cache-first) ──
  useEffect(() => {
    const cached = readAssemblyList();
    if (cached) { setAllAssemblies(cached); setListLoading(false); return; }
    getAssemblyList()
      .then(data => { setAllAssemblies(data); setListLoading(false); })
      .catch(() => { setListLoading(false); showToast("danger", "Failed to load assemblies list."); });
  }, []);

  // ── Fetch detail (cache-first + stale-response guard) ──
  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    if (isNaN(numId)) return;
    const token = ++detailFetchRef.current;

    const cached = readAssemblyDetail(numId);
    if (cached) {
      if (token !== detailFetchRef.current) return;
      setAssembly(cached); setDetailLoading(false); setDetailError(null);
      return;
    }

    setDetailLoading(true);
    setDetailError(null);
    getAssemblyDetail(numId)
      .then(data => {
        if (token !== detailFetchRef.current) return;
        setAssembly(data); setDetailLoading(false);
      })
      .catch((e: Error) => {
        if (token !== detailFetchRef.current) return;
        setDetailError(e.message ?? "Failed to load assembly.");
        setDetailLoading(false);
      });
  }, [id]);

  // ── Scroll active item into view ──
  useEffect(() => {
    const timer = setTimeout(() => {
      activeItemRef.current?.scrollIntoView({ block: "center", behavior: "instant" });
    }, 50);
    return () => clearTimeout(timer);
  }, [id, allAssemblies]);

  // ── Refresh (busts cache, re-fetches list + detail) ──
  const handleRefresh = useCallback(async () => {
    if (!id || refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    try {
      bustAllAssemblyCache();
      await Promise.all([
        getAssemblyList()
          .then(data => setAllAssemblies(data))
          .catch(() => showToast("danger", "Failed to reload assemblies list.")),
        getAssemblyDetail(Number(id))
          .then(data => setAssembly(data))
          .catch(() => showToast("danger", "Failed to reload assembly.")),
      ]);
    } catch {
      showToast("danger", "Network error during refresh.");
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }, [id, showToast]);

  // ── React to saves from New Assembly page (same or other tabs) ──
  useEffect(() => onMutation("assemblies:mutated", handleRefresh), [handleRefresh]);

  const handleDelete = useCallback(() => {
    if (!assembly) return;
    setConfirmConfig({
      icon: "ti-trash",
      iconColor: "#e03131",
      iconBg: "#fff0f0",
      title: "Delete Assembly?",
      message: assembly.status === "completed"
        ? `"${assembly.assembly_number}" is completed. Cancel it first to reverse stock before deleting.`
        : `"${assembly.assembly_number}" will be permanently deleted.`,
      confirmLabel: assembly.status === "completed" ? "OK" : "Delete",
      confirmColor: "#e03131",
      onConfirm: assembly.status === "completed" ? async () => {} : async () => {
        const res = await deleteAssembly(assembly.id);
        if (!res.success) {
          showToast("danger", (res as any).message ?? "Failed to delete assembly.");
          return;
        }
        bustAssembly(assembly.id);
        emitMutation("assemblies:mutated");
        const remaining = allAssemblies.filter(a => a.id !== assembly.id);
        setAllAssemblies(remaining);
        hydrateAssemblyList(remaining);
        showToast("success", `${assembly.assembly_number} deleted.`);
        if (remaining.length > 0) navigate(`/assemblies/${remaining[0].id}`);
        else navigate(route.assemblies);
      },
    });
  }, [assembly, allAssemblies, navigate, showToast]);

  const filteredList = useMemo(() => {
    let base = listFilter === "all"
      ? allAssemblies
      : allAssemblies.filter(a => a.status === listFilter);
    if (listSearch.trim()) {
      const q = listSearch.toLowerCase();
      base = base.filter(a =>
        a.assembly_number.toLowerCase().includes(q) ||
        (a.composite_item?.name ?? "").toLowerCase().includes(q)
      );
    }
    return base;
  }, [allAssemblies, listFilter, listSearch]);

  return (
    <div
      className="page-wrapper"
      style={{ height: "calc(100vh - 57px)", minHeight: "unset", overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      {/* Toast */}
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

        {/* ── Left: Assemblies list panel ─────────────────────────────────── */}
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
                  placeholder="Search assemblies…"
                  value={listSearch}
                  onChange={e => setListSearch(e.target.value)}
                />
                {listSearch && (
                  <button type="button" className="btn btn-sm btn-outline-light border-start-0" onClick={() => setListSearch("")}>
                    <i className="ti ti-x fs-12 text-muted" />
                  </button>
                )}
              </div>

              <div className="dropdown flex-shrink-0">
                <button type="button"
                  className="btn btn-outline-light d-flex align-items-center justify-content-center"
                  style={{ width: 38, height: 38, position: "relative" }}
                  data-bs-toggle="dropdown" title="Filter">
                  <i className="ti ti-filter fs-14 text-muted" />
                  {listFilter !== "all" && (
                    <span style={{ position: "absolute", top: 5, right: 5, width: 7, height: 7, borderRadius: "50%", background: "#e03131", border: "1.5px solid #fff" }} />
                  )}
                </button>
                <div className="dropdown-menu dropdown-menu-end dropmenu-hover-primary" style={{ minWidth: 180 }}>
                  {(["all", "completed", "cancelled"] as const).map(f => (
                    <button key={f}
                      className="dropdown-item d-flex align-items-center gap-2 fs-13"
                      style={{ fontWeight: listFilter === f ? 600 : 400, color: listFilter === f ? "#e03131" : undefined }}
                      onClick={() => setListFilter(f)}>
                      <i className={`ti ${f === "all" ? "ti-list" : f === "completed" ? "ti-check" : "ti-ban"} fs-13`} />
                      {f === "all" ? "All Assemblies" : f === "completed" ? "Completed" : "Cancelled"}
                      {listFilter === f && <i className="ti ti-check ms-auto fs-12" style={{ color: "#e03131" }} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Assemblies list */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {listLoading ? (
              <div className="text-center py-4 text-muted fs-13">
                <span className="spinner-border spinner-border-sm me-2" />Loading…
              </div>
            ) : filteredList.length === 0 ? (
              <div className="text-center py-4 text-muted fs-13">
                <i className="ti ti-mood-empty d-block fs-24 mb-1" />
                No assemblies found
              </div>
            ) : (
              filteredList.map(a => {
                const isActive = String(a.id) === id;
                const liImg    = a.composite_item?.image ? `/storage/${a.composite_item.image}` : null;
                return (
                  <div key={a.id}
                    ref={isActive ? activeItemRef : undefined}
                    onClick={() => navigate(`/assemblies/${a.id}`, { state: { listFilter } })}
                    className="d-flex align-items-center gap-2 px-3"
                    style={{ paddingTop: 11, paddingBottom: 11, cursor: "pointer", background: isActive ? "#fff1f0" : "transparent", borderBottom: "1px solid #f5f5f5" }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "#f8f9fa"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = isActive ? "#fff1f0" : "transparent"; }}
                  >
                    <div className="rounded border d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                      style={{ width: 28, height: 28, background: "#f5f5f5" }}>
                      {liImg
                        ? <img src={liImg} alt={a.composite_item?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <i className="ti ti-layers-intersect text-muted" style={{ fontSize: 12 }} />
                      }
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="text-truncate"
                        style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? "#e03131" : "#212529" }}>
                        {a.assembly_number}
                      </div>
                      {a.composite_item?.name && (
                        <div className="text-truncate fs-12 text-muted">{a.composite_item.name}</div>
                      )}
                    </div>
                    <span className={`badge flex-shrink-0 fs-11 ${a.status === "completed" ? "badge-soft-success" : "badge-soft-danger"}`}>
                      {a.status === "completed" ? "Done" : "Void"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right: Assembly detail ───────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", background: "#fff" }}>
          {detailLoading ? (
            <div className="text-center py-5 text-muted">
              <span className="spinner-border spinner-border-sm text-primary me-2" />
              <span className="fs-14">Loading assembly…</span>
            </div>
          ) : detailError ? (
            <div style={{ padding: "1.25rem" }}>
              <div className="alert alert-danger">{detailError}</div>
            </div>
          ) : !assembly ? (
            <div className="text-center py-5 text-muted">
              <i className="ti ti-layers-intersect fs-36 d-block mb-2" />
              <p className="fs-14 mb-0">Select an assembly to view details.</p>
            </div>
          ) : (
            <div style={{ padding: "1.25rem" }}>

              {/* ── Header ── */}
              <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
                <div className="d-flex align-items-start gap-3">
                  <div className="rounded border d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 56, height: 56, background: "#f5f5f5" }}>
                    <i className="ti ti-layers-intersect fs-24 text-muted" />
                  </div>
                  <div>
                    <h4 className="fw-bold mb-2 lh-sm">{assembly.assembly_number}</h4>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      {assembly.composite_item?.name && (
                        <span className="badge fs-12" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                          {assembly.composite_item.name}
                        </span>
                      )}
                      <span className={`badge fs-12 d-inline-flex align-items-center gap-1 ${assembly.status === "completed" ? "badge-soft-success" : "badge-soft-danger"}`}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: assembly.status === "completed" ? "#12b76a" : "#ef4444", display: "inline-block" }} />
                        {assembly.status === "completed" ? "Completed" : "Cancelled"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <div className="dropdown">
                    <button type="button" className="btn btn-outline-light dropdown-toggle shadow d-flex align-items-center gap-1"
                      style={{ height: 36 }} data-bs-toggle="dropdown">
                      Actions
                    </button>
                    <div className="dropdown-menu dropdown-menu-end dropmenu-hover-primary">
                      <ul>
                        <li>
                          <button className="dropdown-item" onClick={() => window.print()}>
                            <i className="ti ti-printer me-2" />Print
                          </button>
                        </li>
                        <li className="dropstart">
                          <button type="button"
                            className="dropdown-item d-flex align-items-center justify-content-between gap-3"
                            data-bs-toggle="dropdown" data-bs-auto-close="outside">
                            <span className="d-flex align-items-center">
                              <i className="ti ti-share me-2" />Share
                            </span>
                            <i className="ti ti-chevron-right fs-11 text-muted" />
                          </button>
                          <ul className="dropdown-menu dropmenu-hover-primary" style={{ minWidth: 160 }}>
                            <li>
                              <button type="button" className="dropdown-item d-flex align-items-center gap-2"
                                onClick={() => {
                                  const text = `Assembly ${assembly.assembly_number} — ${assembly.composite_item?.name ?? ""}, Qty: ${assembly.quantity_to_assemble}, Date: ${assembly.assembled_date ?? ""}`;
                                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                                }}>
                                <i className="ti ti-brand-whatsapp fs-16" style={{ color: "#25D366" }} />
                                WhatsApp
                              </button>
                            </li>
                          </ul>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button className="dropdown-item text-danger" onClick={handleDelete}>
                            <i className="ti ti-trash me-2" />Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <button type="button" className="btn btn-outline-light d-flex align-items-center justify-content-center shadow"
                    style={{ height: 36, width: 36 }} onClick={handleRefresh} disabled={refreshing} title="Refresh">
                    <i className={`ti ti-refresh${refreshing ? " spin-animation" : ""}`} style={{ fontSize: 16 }} />
                  </button>
                  <button type="button" className="btn btn-outline-light d-flex align-items-center justify-content-center shadow"
                    style={{ height: 36, width: 36 }} onClick={() => navigate(route.assemblies)} title="Close">
                    <i className="ti ti-x" style={{ fontSize: 16 }} />
                  </button>
                </div>
              </div>

              {/* ── Tab nav (pill) ── */}
              <div className="mb-4 scrollbar-hidden" style={{ overflowX: "auto" }}>
                <div className="d-inline-flex rounded" style={{ background: "#f1f3f5", padding: 4, gap: 2 }}>
                  <button type="button" style={{
                    padding: "6px 20px", borderRadius: 6, border: "none",
                    background: "#fff", color: "#e03131", fontWeight: 600, fontSize: 14,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.10)", transition: "all 0.15s", cursor: "pointer", whiteSpace: "nowrap",
                  }}>
                    Overview
                  </button>
                </div>
              </div>

              {/* ── Assembly receipt card ── */}
              {(() => {
                const items    = assembly.items ?? [];
                const qtyTotal = parseFloat(assembly.quantity_to_assemble ?? "0");
                const grandTotal = items.reduce((sum, it) => {
                  return sum + parseFloat(it.total_quantity ?? "0") * parseFloat(it.cost_price ?? "0");
                }, 0);

                const sc = assembly.status === "completed"
                  ? { label: "Assembled", color: "#22c55e", shadow: "#22c55e40" }
                  : { label: "Cancelled", color: "#dc2626", shadow: "#dc262640" };

                return (
                  <div className="card shadow-sm" style={{ border: "1px solid #e0e0e0", borderRadius: 8, padding: 24 }}>

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
                        title="Print Assembly">
                        <i className="ti ti-printer" style={{ fontSize: 15 }} />
                      </button>
                    </div>

                    {/* Receipt document */}
                    <div className="assembly-receipt" style={{ border: B, background: "#fff", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 13, color: "#222" }}>

                      <div style={{ textAlign: "center", fontWeight: 700, fontSize: 16, padding: "7px 0", borderBottom: B }}>
                        Assembly Details
                      </div>

                      <div style={{ display: "flex", borderBottom: B }}>
                        <div style={{ flex: 1, borderRight: B }}>
                          {[
                            { label: "Assembly #",     value: assembly.assembly_number },
                            { label: "Assembled Date", value: formatDate(assembly.assembled_date) },
                            { label: "Location",       value: assembly.location?.name ?? "—" },
                            { label: "Composite Item", value: assembly.composite_item?.name ?? "—" },
                            { label: "Description",    value: assembly.description ?? "—" },
                          ].map(row => (
                            <div key={row.label} style={{ display: "flex", borderBottom: Bs }}>
                              <div style={{ width: "38%", padding: "7px 10px", fontWeight: 600, fontSize: 12, color: "#555", borderRight: Bs }}>{row.label}</div>
                              <div style={{ flex: 1, padding: "7px 10px", fontSize: 13 }}>{row.value}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ width: 220, padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16, justifyContent: "center" }}>
                          <div>
                            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Total Cost</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>₹{fmtAmt(grandTotal)}</div>
                          </div>
                          <div style={{ borderTop: Bs, paddingTop: 14 }}>
                            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Quantity Assembled</div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>
                              {qtyTotal % 1 === 0 ? qtyTotal : qtyTotal.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {items.length > 0 && (
                        <table style={{ width: "100%", borderCollapse: "collapse", borderBottom: B }}>
                          <thead>
                            <tr>
                              <th style={{ ...hCell, width: 36, textAlign: "center" }}>#</th>
                              <th style={hCell}>Item Details</th>
                              <th style={{ ...hCell, width: 140, textAlign: "center" }}>Qty Consumed</th>
                              <th style={{ ...hCell, width: 130, textAlign: "center" }}>Total Qty</th>
                              <th style={{ ...hCell, width: 110, textAlign: "right" }}>Cost / Unit</th>
                              <th style={{ ...hCell, width: 110, textAlign: "right" }}>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((it, idx) => {
                              const tq = parseFloat(it.total_quantity ?? "0");
                              const cp = parseFloat(it.cost_price ?? "0");
                              const qr = parseFloat(it.quantity_required ?? "0");
                              return (
                                <tr key={it.id} style={{ borderBottom: Bs }}>
                                  <td style={{ ...cell, textAlign: "center", color: "#6b7280" }}>{idx + 1}</td>
                                  <td style={cell}>
                                    <div style={{ fontWeight: 600 }}>{it.item_name}</div>
                                    {it.item_unit && <div style={{ fontSize: 11, color: "#6b7280" }}>{it.item_unit}</div>}
                                  </td>
                                  <td style={{ ...cell, textAlign: "center" }}>
                                    {qr % 1 === 0 ? qr : qr.toFixed(2)} × {qtyTotal % 1 === 0 ? qtyTotal : qtyTotal.toFixed(2)}
                                  </td>
                                  <td style={{ ...cell, textAlign: "center" }}>
                                    {tq % 1 === 0 ? tq : tq.toFixed(2)}{it.item_unit ? ` ${it.item_unit}` : ""}
                                  </td>
                                  <td style={{ ...cell, textAlign: "right" }}>₹{fmtAmt(cp)}</td>
                                  <td style={{ ...cell, textAlign: "right", fontWeight: 600 }}>₹{fmtAmt(tq * cp)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr style={{ borderTop: "2px solid #aaa" }}>
                              <td colSpan={5} style={{ ...cell, textAlign: "right", fontWeight: 700, fontStyle: "italic" }}>Total</td>
                              <td style={{ ...cell, textAlign: "right", fontWeight: 700 }}>₹{fmtAmt(grandTotal)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      )}

                      <div style={{ textAlign: "center", fontSize: 11, fontStyle: "italic", padding: "6px 0", color: "#6b7280" }}>
                        This is a computer-generated assembly record
                      </div>
                    </div>

                    <div className="d-inline-flex align-items-center gap-2 mt-4 px-3 py-2 rounded"
                      style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}>
                      <i className="ti ti-clock text-muted fs-14" />
                      <span className="fs-14 text-muted">
                        Last updated on{" "}
                        <span className="fw-semibold" style={{ color: "#495057" }}>
                          {new Date(assembly.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                          {", "}
                          {new Date(assembly.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                        </span>
                      </span>
                    </div>

                  </div>
                );
              })()}

            </div>
          )}
        </div>

      </div>

      {confirmConfig && (
        <ConfirmDialog config={confirmConfig} onClose={() => setConfirmConfig(null)} />
      )}
    </div>
  );
};

export default AssemblyOverview;
