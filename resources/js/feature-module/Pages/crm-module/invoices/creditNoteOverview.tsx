import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePermission } from "../../../../core/hooks/usePermission";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../../../../core/redux/loaderSlice";
import { useNavigate, useParams } from "react-router";
import { Toast } from "react-bootstrap";
import { destroyCreditNote, type CreditNoteListItem, type CreditNoteDetail } from "../../../../core/services/creditNoteApi";
import {
  getCreditNoteList, readCreditNoteList,
  getCreditNoteDetail, readCreditNoteDetail,
  getCreditNoteActivity,
  bustCreditNote, bustAllCreditNoteCache,
  type CreditNoteActivityEntry,
} from "../../../../core/cache/creditNoteCache";
import { onMutation, emitMutation } from "../../../../core/cache/mutationEvents";
import ConfirmDialog, { type ConfirmConfig } from "../../../../components/confirm-dialog/ConfirmDialog";

type StatusFilter = "all" | "draft" | "issued";
type Tab = "overview" | "invoices" | "history";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview"  },
  { key: "invoices", label: "Invoices"  },
  { key: "history",  label: "History"   },
];

const STATUS_CLASS: Record<string, string> = {
  draft:  "badge-soft-secondary",
  issued: "badge-soft-success",
};
const STATUS_LABEL: Record<string, string> = {
  draft:  "Draft",
  issued: "Issued",
};

const FILTERS: { key: StatusFilter; label: string; icon: string }[] = [
  { key: "all",    label: "All Credit Notes", icon: "ti-list"              },
  { key: "issued", label: "Issued",           icon: "ti-circle-check"      },
  { key: "draft",  label: "Draft",            icon: "ti-file-description"  },
];

function formatDate(d: string | null): string {
  if (!d) return "—";
  const dp = d.substring(0, 10);
  const [y, m, day] = dp.split("-");
  if (!y || !m || !day) return d;
  return `${day}/${m}/${y}`;
}

function numToWordsIN(n: number): string {
  if (n === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const bH = (x: number): string => x < 20 ? ones[x] : tens[Math.floor(x / 10)] + (x % 10 ? " " + ones[x % 10] : "");
  const bT = (x: number): string => x < 100 ? bH(x) : ones[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " + bH(x % 100) : "");
  let result = "";
  if (n >= 10000000) { result += bT(Math.floor(n / 10000000)) + " Crore "; n %= 10000000; }
  if (n >= 100000)   { result += bT(Math.floor(n / 100000))   + " Lakh ";  n %= 100000;   }
  if (n >= 1000)     { result += bH(Math.floor(n / 1000))     + " Thousand "; n %= 1000;  }
  if (n > 0)         { result += bT(n); }
  return result.trim();
}
function amountInWords(amount: string): string {
  const num    = parseFloat(amount) || 0;
  const rupees = Math.floor(num);
  const paise  = Math.round((num - rupees) * 100);
  let words    = "Indian Rupee " + numToWordsIN(rupees);
  if (paise > 0) words += " and " + numToWordsIN(paise) + " Paise";
  return words + " Only";
}

// ── Main component ────────────────────────────────────────────────────────────

const CreditNoteOverview = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canDelete = usePermission("credit_notes", "delete");
  const dispatch = useDispatch();

  // ── List (left panel) ──
  const [allCreditNotes, setAllCreditNotes] = useState<CreditNoteListItem[]>([]);
  const [listFilter, setListFilter]         = useState<StatusFilter>("all");
  const [listSearch, setListSearch]         = useState("");
  const activeItemRef                       = useRef<HTMLDivElement>(null);

  // ── Detail (right panel) ──
  const [creditNote, setCreditNote]         = useState<CreditNoteDetail | null>(null);
  const [detailLoading, setDetailLoading]   = useState(false);
  const detailFetchRef                      = useRef(0);

  // ── Active tab ──
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // ── Activity log (history tab) ──
  const [activityLogs, setActivityLogs]       = useState<CreditNoteActivityEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // ── Confirm dialog ──
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  // ── Soft refresh ──
  const [refreshing, setRefreshing] = useState(false);
  const refreshingRef               = useRef(false);

  // ── Toast ──
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger"; message: string }>({ show: false, type: "success", message: "" });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (type: "success" | "danger", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // ── Load list ──
  useEffect(() => {
    const cached = readCreditNoteList();
    if (cached) setAllCreditNotes(cached.data);
    getCreditNoteList()
      .then(r => setAllCreditNotes(r.data))
      .catch(() => showToast("danger", "Network error loading credit notes list."));
  }, []);

  // ── Fetch detail when id changes ──
  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    if (isNaN(numId)) return;
    const token = ++detailFetchRef.current;

    const cached = readCreditNoteDetail(numId);
    if (cached) { setCreditNote(cached); setDetailLoading(false); }
    else { setDetailLoading(true); dispatch(startLoading("credit-note-detail")); }

    getCreditNoteDetail(numId)
      .then(detail => { if (token !== detailFetchRef.current) return; setCreditNote(detail); })
      .catch(() => {})
      .finally(() => {
        if (token !== detailFetchRef.current) return;
        setDetailLoading(false);
        dispatch(stopLoading("credit-note-detail"));
      });

    return () => { dispatch(stopLoading("credit-note-detail")); };
  }, [id]);

  // ── Scroll active row into view ──
  useEffect(() => {
    const timer = setTimeout(() => { activeItemRef.current?.scrollIntoView({ block: "center", behavior: "instant" }); }, 50);
    return () => clearTimeout(timer);
  }, [id, allCreditNotes]);

  // ── Navigate to first item when filter changes ──
  const filteredForNav = useCallback(() => {
    let base = listFilter === "all" ? allCreditNotes : allCreditNotes.filter(cn => cn.status === listFilter);
    return base;
  }, [allCreditNotes, listFilter]);

  useEffect(() => {
    const base = filteredForNav();
    if (base.length > 0) navigate(`/credit-notes/${base[0].id}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listFilter]);

  // ── Soft refresh ──
  const handleRefresh = useCallback(async () => {
    if (!id || refreshingRef.current) return;
    const numId = Number(id);
    if (isNaN(numId)) return;
    refreshingRef.current = true;
    setRefreshing(true);
    try {
      bustCreditNote(numId);
      const fetches: Promise<any>[] = [
        getCreditNoteDetail(numId).then(detail => setCreditNote(detail)).catch(() => {}),
        getCreditNoteList().then(r => setAllCreditNotes(r.data)).catch(() => {}),
      ];
      if (activeTab === "history") {
        fetches.push(getCreditNoteActivity(numId).then(logs => setActivityLogs(logs)).catch(() => {}));
      }
      await Promise.all(fetches);
    } catch {
      showToast("danger", "Network error during refresh.");
    } finally { refreshingRef.current = false; setRefreshing(false); }
  }, [id, activeTab]);

  useEffect(() => onMutation("credit-notes:mutated", handleRefresh), [handleRefresh]);

  // ── Reset activity logs when credit note changes ──
  useEffect(() => { setActivityLogs([]); }, [id]);

  // ── Fetch activity when history tab opens or credit note changes ──
  useEffect(() => {
    if (activeTab !== "history" || !id) return;
    const numId = Number(id);
    if (isNaN(numId)) return;
    setActivityLoading(true);
    getCreditNoteActivity(numId)
      .then(logs => setActivityLogs(logs))
      .catch(() => {})
      .finally(() => setActivityLoading(false));
  }, [activeTab, id]);

  const filteredListItems = useMemo<CreditNoteListItem[]>(() => {
    let base = listFilter === "all" ? allCreditNotes : allCreditNotes.filter(cn => cn.status === listFilter);
    if (listSearch.trim()) {
      const q = listSearch.toLowerCase();
      base = base.filter(
        cn => (cn.credit_note_number ?? "").toLowerCase().includes(q) ||
              (cn.customer?.display_name ?? "").toLowerCase().includes(q),
      );
    }
    return base;
  }, [allCreditNotes, listFilter, listSearch]);

  return (
    <>
      <div className="page-wrapper" style={{ height: "calc(100vh - 57px)", minHeight: "unset", overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* Toast */}
        <div className="position-fixed top-0 start-50 translate-middle-x pt-4" style={{ zIndex: 9999, pointerEvents: "none" }}>
          <Toast show={toast.show} onClose={() => setToast(t => ({ ...t, show: false }))} role="alert" aria-live="assertive" aria-atomic="true"
            style={{ pointerEvents: "auto", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.10)", border: "none", minWidth: 320, background: "#fff" }}>
            <Toast.Body className="d-flex align-items-center gap-3 px-4 py-3">
              <span className={`d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 ${toast.type === "success" ? "bg-success" : "bg-danger"}`} style={{ width: 36, height: 36 }}>
                <i className={`ti fs-16 text-white ${toast.type === "success" ? "ti-check" : "ti-x"}`} />
              </span>
              <span className="fw-medium fs-14">{toast.message}</span>
            </Toast.Body>
          </Toast>
        </div>

        {/* ═══ Two-pane shell ═══════════════════════════════════════════════════ */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* ── Left: Credit Notes list panel ─────────────────────────────────── */}
          <div className="d-none d-xl-flex" style={{ width: 340, minWidth: 340, flexDirection: "column", borderRight: "1px solid #dee2e6", background: "#fff", overflow: "hidden" }}>
            {/* Search + filter bar */}
            <div className="px-3 py-3" style={{ borderBottom: "1px solid #dee2e6", flexShrink: 0 }}>
              <div className="d-flex align-items-center gap-2">
                <div className="input-group flex-grow-1">
                  <span className="input-group-text border-end-0 bg-white">
                    <i className="ti ti-search text-muted fs-13" />
                  </span>
                  <input type="text" className="form-control border-start-0 ps-0" placeholder="Search credit notes…"
                    value={listSearch} onChange={e => setListSearch(e.target.value)} />
                  {listSearch && (
                    <button type="button" className="btn btn-sm btn-outline-light border-start-0" onClick={() => setListSearch("")}>
                      <i className="ti ti-x fs-12 text-muted" />
                    </button>
                  )}
                </div>
                <div className="dropdown flex-shrink-0">
                  <button type="button" className="btn btn-outline-light d-flex align-items-center justify-content-center"
                    style={{ width: 38, height: 38, position: "relative" }} data-bs-toggle="dropdown" title="Filter">
                    <i className="ti ti-filter fs-14 text-muted" />
                    {listFilter !== "all" && (
                      <span style={{ position: "absolute", top: 5, right: 5, width: 7, height: 7, borderRadius: "50%", background: "#e03131", border: "1.5px solid #fff" }} />
                    )}
                  </button>
                  <div className="dropdown-menu dropdown-menu-end dropmenu-hover-primary" style={{ minWidth: 180 }}>
                    {FILTERS.map(f => (
                      <button key={f.key} className="dropdown-item d-flex align-items-center gap-2 fs-13"
                        style={{ fontWeight: listFilter === f.key ? 600 : 400, color: listFilter === f.key ? "#e03131" : undefined }}
                        onClick={() => setListFilter(f.key)}>
                        <i className={`ti ${f.icon} fs-13`} />
                        {f.label}
                        {listFilter === f.key && <i className="ti ti-check ms-auto fs-12" style={{ color: "#e03131" }} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Credit note list */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              {filteredListItems.length === 0 ? (
                <div className="text-center py-4 text-muted fs-13">
                  <i className="ti ti-mood-empty d-block fs-24 mb-1" />No credit notes found
                </div>
              ) : (
                filteredListItems.map(cn => {
                  const isActive = String(cn.id) === id;
                  return (
                    <div
                      key={cn.id}
                      ref={isActive ? activeItemRef : undefined}
                      onClick={() => navigate(`/credit-notes/${cn.id}`)}
                      className="d-flex align-items-center gap-2 px-3"
                      style={{ paddingTop: 11, paddingBottom: 11, cursor: "pointer", background: isActive ? "#fff1f0" : "transparent", borderBottom: "1px solid #f5f5f5" }}
                      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "#f8f9fa"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = isActive ? "#fff1f0" : "transparent"; }}
                    >
                      <div className="rounded border d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 28, height: 28, background: "#f5f5f5" }}>
                        <i className="ti ti-file-minus text-muted" style={{ fontSize: 12 }} />
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <div className="d-flex align-items-center justify-content-between gap-1 mb-1">
                          <span className="text-truncate" style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? "#e03131" : "#212529" }}>
                            {cn.credit_note_number}
                          </span>
                          <span className={`badge fs-10 flex-shrink-0 ${STATUS_CLASS[cn.status] ?? "badge-soft-secondary"}`}>
                            {STATUS_LABEL[cn.status] ?? cn.status}
                          </span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between gap-1">
                          <span className="fs-12 text-muted text-truncate">{cn.customer?.display_name ?? "—"}</span>
                          <span className="fs-12 text-muted flex-shrink-0">
                            ₹{parseFloat(cn.grand_total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Right: Detail panel ──────────────────────────────────────────── */}
          <div style={{ flex: 1, overflowY: "auto", background: "#fff" }}>
            <div style={{ padding: "1.25rem" }}>

              {!creditNote ? null : (
                <>
                  {/* ── Header ── */}
                  <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
                    <div className="d-flex align-items-start gap-3">
                      <div className="rounded border d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 72, height: 72, background: "#f5f5f5" }}>
                        <i className="ti ti-file-minus fs-30 text-muted" />
                      </div>
                      <div>
                        <p className="fs-13 text-muted mb-1 lh-sm">{creditNote.customer?.display_name ?? "—"}</p>
                        <h4 className="fw-bold mb-2 lh-sm">{creditNote.credit_note_number}</h4>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span className={`badge ${STATUS_CLASS[creditNote.status] ?? "badge-soft-secondary"} fs-12 px-3 py-2 d-inline-flex align-items-center gap-1`}>
                            {creditNote.status === "issued"
                              ? <><i className="ti ti-circle-check" style={{ fontSize: 12 }} />Issued</>
                              : <><i className="ti ti-file-description" style={{ fontSize: 12 }} />Draft</>}
                          </span>
                          {creditNote.source_invoice && (
                            <span className="fs-12 text-muted d-inline-flex align-items-center gap-1">
                              <i className="ti ti-link fs-12" />For {creditNote.source_invoice.invoice_number}
                            </span>
                          )}
                          {creditNote.customerCredit ? (
                            <span className="badge badge-soft-success fs-12 px-2 py-1 d-inline-flex align-items-center gap-1">
                              <i className="ti ti-coin" style={{ fontSize: 11 }} />
                              Credits: ₹{parseFloat(creditNote.customerCredit.unused_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })} unused
                            </span>
                          ) : (
                            <span className="badge badge-soft-secondary fs-12 px-2 py-1 d-inline-flex align-items-center gap-1">
                              <i className="ti ti-coin-off" style={{ fontSize: 11 }} />No credits released
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="d-flex align-items-center gap-2">
                      <div className="dropdown">
                        <button type="button" className="btn btn-outline-light dropdown-toggle shadow d-flex align-items-center gap-1" style={{ height: 36 }}
                          data-bs-toggle="dropdown" data-bs-auto-close="outside">
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
                            {canDelete && (
                            <li>
                              <button className="dropdown-item text-danger"
                                onClick={() => {
                                  setConfirmConfig({
                                    icon: "ti-trash",
                                    iconColor: "#dc2626",
                                    iconBg: "#fef2f2",
                                    title: "Delete Credit Note",
                                    message: `Are you sure you want to delete ${creditNote.credit_note_number}? This action cannot be undone.`,
                                    confirmLabel: "Delete",
                                    confirmColor: "#dc2626",
                                    onConfirm: async () => {
                                      const res = await destroyCreditNote(creditNote.id);
                                      if (!res.success) {
                                        showToast("danger", (res as any).message ?? "Failed to delete credit note.");
                                        return;
                                      }
                                      bustAllCreditNoteCache();
                                      emitMutation("credit-notes:mutated");
                                      showToast("success", `${creditNote.credit_note_number} deleted.`);
                                      const remaining = allCreditNotes.filter(cn => cn.id !== creditNote.id);
                                      if (remaining.length > 0) navigate(`/credit-notes/${remaining[0].id}`);
                                      else navigate("/credit-notes");
                                    },
                                  });
                                }}
                              >
                                <i className="ti ti-trash me-2" />Delete
                              </button>
                            </li>
                            )}
                          </ul>
                        </div>
                      </div>

                      <button type="button" className="btn btn-outline-light d-flex align-items-center justify-content-center shadow"
                        style={{ height: 36, width: 36 }} onClick={handleRefresh} disabled={refreshing} title="Refresh">
                        <i className={`ti ti-refresh${refreshing ? " spin-animation" : ""}`} style={{ fontSize: 16 }} />
                      </button>

                      <button type="button" className="btn btn-outline-light d-flex align-items-center justify-content-center shadow"
                        style={{ height: 36, width: 36 }} onClick={() => navigate("/credit-notes")} title="Close">
                        <i className="ti ti-x" style={{ fontSize: 16 }} />
                      </button>
                    </div>
                  </div>

                  {/* ── Tab nav (pill) ── */}
                  <div className="mb-4 scrollbar-hidden" style={{ overflowX: "auto" }}>
                    <div className="d-inline-flex rounded" style={{ background: "#f1f3f5", padding: 4, gap: 2 }}>
                      {TABS.map((t) => {
                        const isActive = activeTab === t.key;
                        return (
                          <button key={t.key} type="button" onClick={() => setActiveTab(t.key)}
                            style={{ padding: "6px 20px", borderRadius: 6, border: "none", background: isActive ? "#fff" : "transparent", color: isActive ? "#e03131" : "#6c757d", fontWeight: isActive ? 600 : 400, fontSize: 14, boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.10)" : "none", transition: "all 0.15s", cursor: "pointer", whiteSpace: "nowrap" }}>
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Tab: Overview — Credit Note Document ── */}
                  {activeTab === "overview" && (() => {
                    const B   = "1px solid #bbb";
                    const Bs  = "1px solid #ddd";
                    const cell = { padding: "6px 10px", borderBottom: Bs, borderLeft: B, borderRight: "none" as const, verticalAlign: "top" as const, fontSize: 13 };
                    const fmtAmt = (v: string | null | undefined) =>
                      parseFloat(v ?? "0").toLocaleString("en-IN", { minimumFractionDigits: 2 });

                    const addr    = creditNote.location?.address ?? {};
                    const items   = creditNote.items ?? [];

                    const statusCfg: Record<string, { label: string; color: string; shadow: string }> = {
                      issued: { label: "Issued", color: "#22c55e", shadow: "#22c55e40" },
                      draft:  { label: "Draft",  color: "#f97316", shadow: "#f9731640" },
                    };
                    const sc = statusCfg[creditNote.status] ?? statusCfg.issued;

                    return (
                      <div className="card shadow-sm" style={{ border: "1px solid #e0e0e0", borderRadius: 8, padding: 24 }}>

                        {/* Status stamp + Print */}
                        <div className="payment-print-hide" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                          <div style={{ display: "inline-flex", alignItems: "center", padding: "10px 10px 4px 10px" }}>
                            <div style={{
                              display: "inline-flex", alignItems: "center", justifyContent: "center",
                              border: `3px solid ${sc.color}`,
                              outline: `1px solid ${sc.color}`,
                              outlineOffset: 3,
                              borderRadius: 3,
                              padding: "3px 18px",
                              transform: "rotate(-6deg)",
                              color: sc.color,
                              fontWeight: 900, fontSize: 15, letterSpacing: "0.22em",
                              textTransform: "uppercase" as const,
                              opacity: 0.82, userSelect: "none" as const,
                              boxShadow: `2px 2px 0 ${sc.shadow}`,
                              fontFamily: "Arial, Helvetica, sans-serif",
                            }}>
                              {sc.label}
                            </div>
                          </div>
                          <button type="button" onClick={() => window.print()}
                            style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 7, width: 34, height: 34, cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}
                            title="Print Credit Note">
                            <i className="ti ti-printer" style={{ fontSize: 15 }} />
                          </button>
                        </div>

                        {/* ── Credit Note document ── */}
                        <div className="invoice-receipt" style={{ border: B, background: "#fff", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 13, color: "#222" }}>

                          {/* Title */}
                          <div style={{ textAlign: "center", fontWeight: 700, fontSize: 16, padding: "7px 0", borderBottom: B }}>
                            CREDIT NOTE
                          </div>

                          {/* Header: company + meta */}
                          <table style={{ width: "100%", borderCollapse: "collapse", borderBottom: B }}>
                            <tbody>
                              <tr>
                                <td rowSpan={3} style={{ width: "42%", borderRight: B, verticalAlign: "top", padding: 0 }}>
                                  <div style={{ padding: "10px 12px", borderBottom: Bs }}>
                                    <div style={{ fontWeight: 700, fontSize: 14 }}>{creditNote.location?.name ?? ""}</div>
                                    {addr.street1 && <div style={{ marginTop: 2 }}>{addr.street1}</div>}
                                    {addr.street2 && <div>{addr.street2}</div>}
                                    {(addr.city || addr.state || addr.pin_code) && (
                                      <div>{[addr.city, addr.state, addr.pin_code].filter(Boolean).join(", ")}</div>
                                    )}
                                    {addr.phone && <div style={{ marginTop: 4 }}>Contact : {addr.phone}</div>}
                                    {creditNote.location?.website_url && <div>Email : {creditNote.location.website_url}</div>}
                                  </div>
                                  <div style={{ padding: "3px 12px 1px", borderBottom: Bs, fontSize: 11, color: "#555" }}>Issued To:</div>
                                  <div style={{ padding: "6px 12px", minHeight: 56 }}>
                                    {creditNote.customer && (
                                      <>
                                        <div style={{ fontWeight: 700 }}>{creditNote.customer.display_name}</div>
                                        {creditNote.customer.gst && <div>GSTIN: {creditNote.customer.gst}</div>}
                                        {creditNote.customer.mobile && <div>Mobile: {creditNote.customer.mobile}</div>}
                                      </>
                                    )}
                                  </div>
                                </td>
                                <td style={{ width: "29%", ...cell, borderTop: "none", borderLeft: "none", fontWeight: 700 }}>Credit Note #</td>
                                <td style={{ width: "29%", ...cell, borderTop: "none", borderRight: "none" }}>{creditNote.credit_note_number}</td>
                              </tr>
                              <tr>
                                <td style={{ ...cell, borderLeft: "none", fontWeight: 700 }}>Date</td>
                                <td style={{ ...cell, borderRight: "none" }}>{formatDate(creditNote.credit_note_date)}</td>
                              </tr>
                              <tr>
                                <td style={{ ...cell, borderLeft: "none", fontWeight: 700 }}>Source Invoice</td>
                                <td style={{ ...cell, borderRight: "none" }}>{creditNote.source_invoice?.invoice_number ?? "—"}</td>
                              </tr>
                              <tr>
                                <td style={{ ...cell, borderLeft: "none", fontWeight: 700 }}>Salesperson</td>
                                <td style={{ ...cell, borderRight: "none" }}>{creditNote.salesperson ?? ""}</td>
                              </tr>
                            </tbody>
                          </table>

                          {/* Line items table */}
                          <table style={{ width: "100%", borderCollapse: "collapse", borderBottom: B }}>
                            <thead>
                              <tr style={{ borderBottom: B }}>
                                <th style={{ padding: "7px 10px", width: 36, textAlign: "center", fontWeight: 700, fontSize: 12, color: "#555", borderRight: Bs }}>#</th>
                                <th style={{ padding: "7px 10px", fontWeight: 700, fontSize: 12, color: "#555", borderRight: Bs }}>Description</th>
                                <th style={{ padding: "7px 10px", width: 80, textAlign: "center", fontWeight: 700, fontSize: 12, color: "#555", borderRight: Bs }}>Qty</th>
                                <th style={{ padding: "7px 10px", width: 110, textAlign: "right", fontWeight: 700, fontSize: 12, color: "#555", borderRight: Bs }}>Rate</th>
                                <th style={{ padding: "7px 10px", width: 60, textAlign: "center", fontWeight: 700, fontSize: 12, color: "#555", borderRight: Bs }}>GST%</th>
                                <th style={{ padding: "7px 10px", width: 110, textAlign: "right", fontWeight: 700, fontSize: 12, color: "#555" }}>Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: "10px", textAlign: "center", color: "#999" }}>No items</td></tr>
                              ) : (
                                items.map((it, idx) => (
                                  <tr key={it.id} style={{ borderBottom: Bs }}>
                                    <td style={{ padding: "7px 10px", textAlign: "center", borderRight: Bs }}>{idx + 1}</td>
                                    <td style={{ padding: "7px 10px", borderRight: Bs }}>{it.item_name}</td>
                                    <td style={{ padding: "7px 10px", textAlign: "center", borderRight: Bs }}>{parseFloat(it.quantity).toLocaleString("en-IN", { maximumFractionDigits: 4 })}</td>
                                    <td style={{ padding: "7px 10px", textAlign: "right", borderRight: Bs }}>₹{fmtAmt(it.unit_price)}</td>
                                    <td style={{ padding: "7px 10px", textAlign: "center", borderRight: Bs }}>{it.gst_rate ? parseFloat(it.gst_rate).toFixed(0) + "%" : "—"}</td>
                                    <td style={{ padding: "7px 10px", textAlign: "right" }}>₹{fmtAmt(it.amount)}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>

                          {/* Totals */}
                          <table style={{ width: "100%", borderCollapse: "collapse", borderBottom: B }}>
                            <tbody>
                              {(() => {
                                const rows: { label: string; value: string }[] = [];
                                rows.push({ label: "Sub Total", value: `₹${fmtAmt(creditNote.sub_total)}` });
                                if (parseFloat(creditNote.discount_amount ?? "0") !== 0) {
                                  rows.push({ label: `Discount (${creditNote.discount_type === "percent" ? parseFloat(creditNote.discount_value ?? "0").toFixed(2) + "%" : "Amount"})`, value: `- ₹${fmtAmt(creditNote.discount_amount)}` });
                                }
                                if (creditNote.tax_amount && parseFloat(creditNote.tax_amount) !== 0) {
                                  rows.push({ label: `${creditNote.tax_type?.toUpperCase() ?? "Tax"} (${parseFloat(creditNote.tax_rate ?? "0").toFixed(2)}%)`, value: `₹${fmtAmt(creditNote.tax_amount)}` });
                                }
                                if (creditNote.charges_json && creditNote.charges_json.length > 0) {
                                  creditNote.charges_json.forEach(ch => rows.push({ label: ch.label, value: `₹${ch.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` }));
                                }
                                return rows.map((r, i) => (
                                  <tr key={i} style={{ borderBottom: Bs }}>
                                    <td style={{ padding: "6px 10px" }} />
                                    <td style={{ padding: "6px 10px", fontWeight: 600, fontSize: 13, textAlign: "right", width: 220 }}>{r.label}</td>
                                    <td style={{ padding: "6px 10px", textAlign: "right", width: 130, borderLeft: Bs }}>{r.value}</td>
                                  </tr>
                                ));
                              })()}
                              <tr style={{ background: "#f8f9fa" }}>
                                <td style={{ padding: "8px 10px" }} />
                                <td style={{ padding: "8px 10px", fontWeight: 700, fontSize: 14, textAlign: "right" }}>Total</td>
                                <td style={{ padding: "8px 10px", fontWeight: 700, fontSize: 14, textAlign: "right", borderLeft: Bs }}>₹{fmtAmt(creditNote.grand_total)}</td>
                              </tr>
                            </tbody>
                          </table>

                          {/* Amount in words */}
                          <div style={{ padding: "8px 10px", borderBottom: B }}>
                            <span style={{ color: "#555" }}>Total Credit Amount In Words: </span>
                            <strong>{amountInWords(creditNote.grand_total)}</strong>
                          </div>

                          {/* Notes + footer */}
                          {(creditNote.customer_notes || creditNote.terms_conditions) && (
                            <div style={{ display: "flex", borderBottom: B }}>
                              {creditNote.customer_notes && (
                                <div style={{ flex: 1, padding: "8px 10px", borderRight: creditNote.terms_conditions ? Bs : "none" }}>
                                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Notes</div>
                                  <div style={{ color: "#555", whiteSpace: "pre-line" }}>{creditNote.customer_notes}</div>
                                </div>
                              )}
                              {creditNote.terms_conditions && (
                                <div style={{ flex: 1, padding: "8px 10px" }}>
                                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Terms & Conditions</div>
                                  <div style={{ color: "#555", whiteSpace: "pre-line" }}>{creditNote.terms_conditions}</div>
                                </div>
                              )}
                            </div>
                          )}

                          <div style={{ textAlign: "center", fontSize: 11, fontStyle: "italic", padding: "6px 0" }}>
                            This is a Computer Generated Credit Note
                          </div>
                        </div>

                        {/* Last updated */}
                        <div className="d-inline-flex align-items-center gap-2 mt-4 px-3 py-2 rounded" style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}>
                          <i className="ti ti-clock text-muted fs-14" />
                          <span className="fs-14 text-muted">
                            Last updated on{" "}
                            <span className="fw-semibold" style={{ color: "#495057" }}>
                              {new Date(creditNote.updated_at ?? creditNote.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                              {", "}
                              {new Date(creditNote.updated_at ?? creditNote.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                            </span>
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ── Tab: Invoices ── */}
                  {activeTab === "invoices" && (() => {
                    const fmtAmt = (v: string | null | undefined) =>
                      `₹${parseFloat(v ?? "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
                    const applications = creditNote.customerCredit?.applications ?? [];
                    const statusBadge: Record<string, string> = {
                      draft: "badge-soft-secondary", sent: "badge-soft-primary",
                      partially_paid: "badge-soft-warning", paid: "badge-soft-success",
                      overdue: "badge-soft-danger", void: "badge-soft-dark",
                    };
                    const statusLabel: Record<string, string> = {
                      draft: "Draft", sent: "Sent", partially_paid: "Partially Paid",
                      paid: "Paid", overdue: "Overdue", void: "Void",
                    };
                    return (
                      <div>
                        {/* ── Source Invoice ── */}
                        <div className="mb-4">
                          <h6 className="fw-semibold fs-15 mb-3">Source Invoice</h6>
                          {creditNote.source_invoice ? (
                            <div style={{ border: "1px solid #dee2e6", borderRadius: 8, overflow: "hidden" }}>
                              <div style={{ background: "#fff0f2", padding: "12px 16px", borderBottom: "1px solid #dee2e6" }}>
                                <div className="d-flex align-items-center gap-2 mb-1">
                                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E41F07", display: "inline-block", flexShrink: 0 }} />
                                  <span className="fw-semibold fs-14">Source Invoice</span>
                                </div>
                                <p className="text-muted fs-13 mb-0">This credit note was issued against the invoice below</p>
                              </div>
                              <div style={{ overflowX: "auto" }}>
                                <table className="table mb-0" style={{ width: "100%", minWidth: 360 }}>
                                  <thead>
                                    <tr>
                                      <th className="text-uppercase fs-12 fw-semibold text-muted"
                                        style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6" }}>
                                        Invoice #
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td style={{ padding: "12px 16px" }}>
                                        <div className="d-flex align-items-center justify-content-between">
                                          <span className="fs-14 fw-medium" style={{ color: "#E41F07" }}>
                                            {creditNote.source_invoice.invoice_number}
                                          </span>
                                          <i className="ti ti-file-invoice fs-16 text-muted" />
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-muted border rounded" style={{ background: "#fafafa" }}>
                              <i className="ti ti-file-off d-block fs-24 mb-1" />
                              <span className="fs-13">No source invoice linked</span>
                            </div>
                          )}
                        </div>

                        {/* ── Applied To Invoices ── */}
                        <div>
                          <h6 className="fw-semibold fs-15 mb-3">Applied To</h6>
                          {applications.length === 0 ? (
                            <div className="text-center py-4 text-muted border rounded" style={{ background: "#fafafa" }}>
                              <i className="ti ti-coin-off d-block fs-24 mb-1" />
                              <span className="fs-13">This credit has not been applied to any invoice yet</span>
                            </div>
                          ) : (
                            <div style={{ border: "1px solid #dee2e6", borderRadius: 8, overflow: "hidden" }}>
                              {/* Summary bar */}
                              <div style={{ background: "#fff0f2", padding: "12px 16px", borderBottom: "1px solid #dee2e6" }}>
                                <div className="d-flex align-items-center gap-2 mb-1">
                                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E41F07", display: "inline-block", flexShrink: 0 }} />
                                  <span className="fw-semibold fs-14">
                                    {applications.length} invoice{applications.length !== 1 ? "s" : ""}
                                    {" · "}
                                    <span style={{ color: "#E41F07" }}>
                                      {fmtAmt(applications.reduce((s, a) => s + parseFloat(a.applied_amount || "0"), 0).toFixed(2))} credits applied
                                    </span>
                                  </span>
                                </div>
                                <p className="text-muted fs-13 mb-0">
                                  Remaining (unused): <strong>{fmtAmt(creditNote.customerCredit?.unused_amount)}</strong>
                                </p>
                              </div>

                              {/* Table */}
                              <div style={{ overflowX: "auto" }}>
                                <table className="table mb-0" style={{ width: "100%", minWidth: 520 }}>
                                  <thead>
                                    <tr>
                                      {["Invoice #", "Invoice Date", "Invoice Amount", "Credit Applied"].map((h, i) => (
                                        <th key={i}
                                          className={`text-uppercase fs-12 fw-semibold text-muted${i >= 2 ? " text-end" : ""}`}
                                          style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6" }}>
                                          {h}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {applications.map((app, idx) => (
                                      <tr key={app.id ?? idx} style={{ borderBottom: "1px solid #f5f5f5" }}>
                                        <td className="fs-14 fw-medium" style={{ padding: "12px 16px" }}>
                                          <div className="d-flex align-items-center gap-2">
                                            <span style={{ color: "#E41F07" }}>{app.invoice?.invoice_number ?? `Invoice #${app.invoice_id}`}</span>
                                            {app.invoice?.status && (
                                              <span className={`badge ${statusBadge[app.invoice.status] ?? "badge-soft-secondary"} fs-11`}>
                                                {statusLabel[app.invoice.status] ?? app.invoice.status}
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                        <td className="fs-14" style={{ padding: "12px 16px" }}>
                                          {app.invoice?.invoice_date
                                            ? new Date(app.invoice.invoice_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                                            : "—"}
                                        </td>
                                        <td className="fs-14 fw-semibold text-end" style={{ padding: "12px 16px" }}>
                                          {app.invoice ? fmtAmt(app.invoice.grand_total) : "—"}
                                        </td>
                                        <td className="fs-14 fw-semibold text-end" style={{ padding: "12px 16px", color: "#E41F07" }}>
                                          {fmtAmt(app.applied_amount)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* ── Tab: History ── */}
                  {activeTab === "history" && (
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-4">
                        <div>
                          <h6 className="fw-semibold mb-0 fs-15">Activity History</h6>
                          {!activityLoading && (
                            <span className="fs-13 text-muted">
                              {activityLogs.length} {activityLogs.length === 1 ? "record" : "records"}
                            </span>
                          )}
                        </div>
                      </div>

                      {activityLoading ? (
                        <div className="text-center py-5 text-muted">
                          <span className="spinner-border spinner-border-sm text-primary me-2" />
                          <span className="fs-14">Loading history…</span>
                        </div>
                      ) : activityLogs.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                          <i className="ti ti-history fs-36 d-block mb-2" />
                          <p className="fs-14 mb-0">No activity recorded yet.</p>
                        </div>
                      ) : (() => {
                        const EVENT_ICON: Record<string, string> = {
                          credit_note_created:  "ti-plus",
                          credit_note_updated:  "ti-pencil",
                          credit_note_deleted:  "ti-trash",
                          credit_note_applied:  "ti-coin",
                          credit_note_unapplied: "ti-coin-off",
                        };
                        const EVENT_LABEL: Record<string, string> = {
                          credit_note_created:   "Credit Note Created",
                          credit_note_updated:   "Credit Note Updated",
                          credit_note_deleted:   "Credit Note Deleted",
                          credit_note_applied:   "Credit Applied to Invoice",
                          credit_note_unapplied: "Credit Removed from Invoice",
                        };

                        const parseTs = (ts: string) => {
                          const d = new Date(ts.replace(" ", "T").replace(/Z$|[+-]\d{2}:\d{2}$/, ""));
                          return {
                            dateStr: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
                            timeStr: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
                          };
                        };
                        const fmtAmt = (v: any) => {
                          const n = parseFloat(String(v ?? ""));
                          return !isNaN(n) && n > 0 ? `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : null;
                        };

                        type MetaRow = { label: string; value: string };
                        const buildMeta = (log: CreditNoteActivityEntry): MetaRow[] => {
                          const m = log.metadata ?? {};
                          const rows: MetaRow[] = [];
                          const add = (label: string, val: string | null | undefined) => {
                            if (val != null && String(val).trim() !== "") rows.push({ label, value: String(val) });
                          };
                          if (log.event_type === "credit_note_created") {
                            add("Amount",         fmtAmt(m.grand_total));
                            add("Source Invoice", m.source_invoice ?? null);
                            add("Date",           m.credit_note_date ? formatDate(m.credit_note_date) : null);
                          } else if (log.event_type === "credit_note_updated") {
                            add("Amount", fmtAmt(m.grand_total));
                          } else if (log.event_type === "credit_note_applied") {
                            add("Invoice #",      m.invoice_number ?? null);
                            add("Amount Applied", fmtAmt(m.applied_amount));
                            add("Balance After",  m.invoice_balance != null ? `₹${parseFloat(m.invoice_balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : null);
                          } else if (log.event_type === "credit_note_unapplied") {
                            add("Invoice #", m.invoice_number ?? null);
                          }
                          return rows;
                        };

                        return (
                          <div style={{ position: "relative", paddingLeft: 52 }}>
                            <div style={{ position: "absolute", left: 17, top: 0, bottom: 0, width: 2, background: "#e9ecef", zIndex: 0 }} />
                            {activityLogs.map((log, idx) => {
                              const iconClass = EVENT_ICON[log.event_type] ?? "ti-activity";
                              const title     = EVENT_LABEL[log.event_type] ?? log.event_type.replace(/_/g, " ");
                              const actor     = log.performer?.name ?? "System";
                              const { dateStr, timeStr } = parseTs(log.created_at);
                              const metaRows  = buildMeta(log);
                              const isLast    = idx === activityLogs.length - 1;
                              return (
                                <div key={log.id} style={{ position: "relative", marginBottom: isLast ? 0 : 20 }}>
                                  <div style={{ position: "absolute", left: -52, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "#fff4f4", border: "1.5px solid #e03131", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                                    <i className={`ti ${iconClass}`} style={{ fontSize: 14, color: "#e03131" }} />
                                  </div>
                                  <div className="card border" style={{ borderRadius: 10 }}>
                                    <div className="card-body" style={{ padding: "18px 20px" }}>
                                      <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                                        <span className="fw-semibold fs-15" style={{ color: "#212529" }}>{title}</span>
                                        <div className="text-end flex-shrink-0">
                                          <div className="fs-13 fw-medium" style={{ color: "#495057" }}>{dateStr}</div>
                                          <div className="fs-12 text-muted">{timeStr}</div>
                                        </div>
                                      </div>
                                      {metaRows.length > 0 && (
                                        <div className="rounded mb-3 overflow-hidden" style={{ border: "1px solid #e9ecef" }}>
                                          {metaRows.map((row, ri) => (
                                            <div key={row.label} className="d-flex align-items-center gap-3"
                                              style={{ padding: "8px 14px", background: ri % 2 === 0 ? "#fff" : "#fafafa", borderTop: ri > 0 ? "1px solid #f1f3f5" : "none" }}>
                                              <span className="text-muted fs-13 flex-shrink-0" style={{ width: 140 }}>{row.label}</span>
                                              <span className="fs-13 fw-medium" style={{ color: "#212529" }}>{row.value}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
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
                        );
                      })()}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </div>
      <ConfirmDialog config={confirmConfig} onClose={() => setConfirmConfig(null)} />
    </>
  );
};

export default CreditNoteOverview;
