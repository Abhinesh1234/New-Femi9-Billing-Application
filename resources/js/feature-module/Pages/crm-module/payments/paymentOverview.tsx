import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePermission } from "../../../../core/hooks/usePermission";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../../../../core/redux/loaderSlice";
import { useNavigate, useParams } from "react-router";
import { Toast } from "react-bootstrap";
import { destroyPayment, fetchPaymentRefunds, destroyPaymentRefund, type PaymentListItem, type PaymentDetail } from "../../../../core/services/paymentApi";
import {
  getPaymentList, readPaymentList,
  getPaymentDetail, readPaymentDetail,
  getPaymentActivity,
  bustPayment, bustAllPaymentCache,
  type ActivityEntry,
} from "../../../../core/cache/paymentCache";
import { onMutation, emitMutation } from "../../../../core/cache/mutationEvents";
import ConfirmDialog, { type ConfirmConfig } from "../../../../components/confirm-dialog/ConfirmDialog";

type StatusFilter = "all" | "open" | "closed" | "draft";
type Tab = "overview" | "refunds" | "history";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "refunds",  label: "Refunds"  },
  { key: "history",  label: "History"  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(d: string | null): string {
  if (!d) return "—";
  const datePart = d.substring(0, 10);
  const [y, m, day] = datePart.split("-");
  if (!y || !m || !day) return d;
  return `${day}/${m}/${y}`;
}

function numToWordsIN(n: number): string {
  if (n === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const bH = (x: number): string =>
    x < 20 ? ones[x] : tens[Math.floor(x / 10)] + (x % 10 ? " " + ones[x % 10] : "");
  const bT = (x: number): string =>
    x < 100 ? bH(x) : ones[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " + bH(x % 100) : "");
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

const MODE_LABEL: Record<string, string> = {
  cash: "Cash", upi: "UPI", bank_transfer: "Bank Transfer",
  cheque: "Cheque", credit_card: "Card / POS", card: "Card / POS",
  advance_payment: "Advance Payment",
};

// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CLASS: Record<string, string> = {
  open:   "badge-soft-success",
  closed: "badge-soft-secondary",
  draft:  "badge-soft-warning",
};

const STATUS_LABEL: Record<string, string> = {
  open:   "Open",
  closed: "Closed",
  draft:  "Draft",
};

const FILTERS: { key: StatusFilter; label: string; icon: string }[] = [
  { key: "all",    label: "All Payments", icon: "ti-list" },
  { key: "open",   label: "Open",         icon: "ti-circle-check" },
  { key: "closed", label: "Closed",       icon: "ti-lock" },
  { key: "draft",  label: "Draft",        icon: "ti-file-description" },
];

const PaymentOverview = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canDelete = usePermission("payments", "delete");
  const dispatch = useDispatch();

  // ── List (left panel) ──
  const [allPayments, setAllPayments] = useState<PaymentListItem[]>([]);
  const [listFilter, setListFilter]   = useState<StatusFilter>("all");
  const [listSearch, setListSearch]   = useState("");
  const activeItemRef                 = useRef<HTMLDivElement>(null);

  // ── Detail (right panel) ──
  const [payment, setPayment]             = useState<PaymentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const detailFetchRef                    = useRef(0);

  // ── Active tab ──
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // ── Confirm dialog ──
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  // ── Print receipt ──
  const handlePrint = useCallback(() => { window.print(); }, []);

  // ── Activity log (history tab) ──
  const [activityLogs, setActivityLogs]       = useState<ActivityEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // ── Refunds ──
  const [refunds, setRefunds]               = useState<any[]>([]);
  const [refundsLoading, setRefundsLoading] = useState(false);
  const refundsFetchedForId                 = useRef<number | null>(null);

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

  // ── Load list (cache-first) ──
  useEffect(() => {
    const cached = readPaymentList(null);
    if (cached) setAllPayments(cached.data);
    getPaymentList()
      .then(result => setAllPayments(result.data))
      .catch(() => showToast("danger", "Network error loading payments list."));
  }, []);

  // ── Fetch detail when id changes (cache-first + token guard) ──
  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    if (isNaN(numId)) return;
    const token = ++detailFetchRef.current;

    const cached = readPaymentDetail(numId);
    if (cached) { setPayment(cached); setDetailLoading(false); }
    else { setDetailLoading(true); dispatch(startLoading("payment-detail")); }

    getPaymentDetail(numId)
      .then(detail => { if (token !== detailFetchRef.current) return; setPayment(detail); })
      .catch(() => {})
      .finally(() => {
        if (token !== detailFetchRef.current) return;
        setDetailLoading(false);
        dispatch(stopLoading("payment-detail"));
      });

    return () => { dispatch(stopLoading("payment-detail")); };
  }, [id]);

  // ── Scroll active row into view ──
  useEffect(() => {
    const timer = setTimeout(() => {
      activeItemRef.current?.scrollIntoView({ block: "center", behavior: "instant" });
    }, 50);
    return () => clearTimeout(timer);
  }, [id, allPayments]);

  // ── Navigate to first item when filter changes ──
  const filteredForNav = useCallback(() => {
    if (listFilter === "all") return allPayments;
    return allPayments.filter(p => p.status === listFilter);
  }, [allPayments, listFilter]);

  useEffect(() => {
    const base = filteredForNav();
    if (base.length > 0) navigate(`/payments/${base[0].id}`);
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
      bustPayment(numId);
      const fetches: Promise<any>[] = [
        getPaymentDetail(numId).then(detail => setPayment(detail)).catch(() => {}),
        getPaymentList().then(result => setAllPayments(result.data)).catch(() => {}),
      ];
      if (activeTab === "history") {
        fetches.push(getPaymentActivity(numId).then(logs => setActivityLogs(logs)).catch(() => {}));
      }
      await Promise.all(fetches);
    } catch {
      showToast("danger", "Network error during refresh.");
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }, [id, activeTab]);

  useEffect(() => onMutation("payments:mutated", handleRefresh), [handleRefresh]);

  // ── Reset activity logs when payment changes ──
  useEffect(() => { setActivityLogs([]); }, [id]);

  // ── Fetch activity when history tab opens or payment changes ──
  useEffect(() => {
    if (activeTab !== "history" || !id) return;
    const numId = Number(id);
    if (isNaN(numId)) return;
    setActivityLoading(true);
    getPaymentActivity(numId)
      .then(logs => setActivityLogs(logs))
      .catch(() => {})
      .finally(() => setActivityLoading(false));
  }, [activeTab, id]);

  // ── Fetch refunds whenever payment id changes (needed for header badge + tab) ──
  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    if (isNaN(numId)) return;
    setRefunds([]);
    refundsFetchedForId.current = null;
    setRefundsLoading(true);
    fetchPaymentRefunds(numId)
      .then(res => {
        refundsFetchedForId.current = numId;
        if (res.success) setRefunds((res as any).data ?? []);
      })
      .catch(() => {})
      .finally(() => setRefundsLoading(false));
  }, [id]);

  const filteredListItems = useMemo<PaymentListItem[]>(() => {
    let base = listFilter === "all"
      ? allPayments
      : allPayments.filter(p => p.status === listFilter);
    if (listSearch.trim()) {
      const q = listSearch.toLowerCase();
      base = base.filter(
        p => p.payment_number.toLowerCase().includes(q) ||
             (p.customer?.display_name ?? "").toLowerCase().includes(q)
      );
    }
    return base;
  }, [allPayments, listFilter, listSearch]);

  return (
    <>
      <div
        className="page-wrapper"
        style={{ height: "calc(100vh - 57px)", minHeight: "unset", overflow: "hidden", display: "flex", flexDirection: "column" }}
      >
        {/* Toast */}
        <div className="position-fixed top-0 start-50 translate-middle-x pt-4" style={{ zIndex: 9999, pointerEvents: "none" }}>
          <Toast
            show={toast.show}
            onClose={() => setToast(t => ({ ...t, show: false }))}
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

        {/* ═══ Two-pane shell ═══════════════════════════════════════════════════ */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* ── Left: Payments list panel ─────────────────────────────────────── */}
          <div
            className="d-none d-xl-flex"
            style={{ width: 340, minWidth: 340, flexDirection: "column", borderRight: "1px solid #dee2e6", background: "#fff", overflow: "hidden" }}
          >
            {/* Search + filter bar */}
            <div className="px-3 py-3" style={{ borderBottom: "1px solid #dee2e6", flexShrink: 0 }}>
              <div className="d-flex align-items-center gap-2">
                <div className="input-group flex-grow-1">
                  <span className="input-group-text border-end-0 bg-white">
                    <i className="ti ti-search text-muted fs-13" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Search payments…"
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
                    {FILTERS.map(f => (
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

            {/* Payment list */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              {filteredListItems.length === 0 ? (
                <div className="text-center py-4 text-muted fs-13">
                  <i className="ti ti-mood-empty d-block fs-24 mb-1" />
                  No payments found
                </div>
              ) : (
                filteredListItems.map(p => {
                  const isActive         = String(p.id) === id;
                  const pTotalRefunded   = parseFloat(p.refunds_sum_amount ?? "0");
                  const pIsFullRefunded  = pTotalRefunded > 0 && pTotalRefunded >= parseFloat(p.amount) - 0.005;
                  const pIsPartRefunded  = pTotalRefunded > 0 && !pIsFullRefunded;
                  return (
                    <div
                      key={p.id}
                      ref={isActive ? activeItemRef : undefined}
                      onClick={() => navigate(`/payments/${p.id}`)}
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
                      <div
                        className="rounded border d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 28, height: 28, background: "#f5f5f5" }}
                      >
                        <i className="ti ti-credit-card text-muted" style={{ fontSize: 12 }} />
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <div className="d-flex align-items-center justify-content-between gap-1 mb-1">
                          <span
                            className="text-truncate"
                            style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? "#e03131" : "#212529" }}
                          >
                            {p.payment_number}
                          </span>
                          {pIsFullRefunded ? (
                            <span className="badge badge-soft-warning fs-10 flex-shrink-0">Refunded</span>
                          ) : pIsPartRefunded ? (
                            <span className="badge badge-soft-danger fs-10 flex-shrink-0">Part. Refunded</span>
                          ) : (
                            <span className={`badge fs-10 flex-shrink-0 ${STATUS_CLASS[p.status] ?? "badge-soft-secondary"}`}>
                              {STATUS_LABEL[p.status] ?? p.status}
                            </span>
                          )}
                        </div>
                        <div className="d-flex align-items-center justify-content-between gap-1">
                          <span className="fs-12 text-muted text-truncate">{p.customer?.display_name ?? "—"}</span>
                          <span className="fs-12 text-muted flex-shrink-0">
                            ₹{parseFloat(p.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
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

              {!payment ? null : (
                <>
                  {/* ── Header ── */}
                  <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
                    <div className="d-flex align-items-start gap-3">

                      {/* Icon */}
                      <div
                        className="rounded border d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 72, height: 72, background: "#f5f5f5" }}
                      >
                        <i className="ti ti-credit-card fs-30 text-muted" />
                      </div>

                      <div>
                        {/* Customer name — small sub-heading above */}
                        <p className="fs-13 text-muted mb-1 lh-sm">
                          {payment.customer?.display_name ?? "—"}
                        </p>

                        {/* Payment number — main heading */}
                        <h4 className="fw-bold mb-2 lh-sm">{payment.payment_number}</h4>

                        {/* Status tags */}
                        {(() => {
                          const totalRefunded     = refunds.reduce((s: number, r: any) => s + parseFloat(r.amount ?? "0"), 0);
                          const pmtAmt            = parseFloat(payment.amount ?? "0");
                          const isFullyRefunded   = totalRefunded > 0 && totalRefunded >= pmtAmt - 0.005;
                          const isPartialRefunded = totalRefunded > 0 && !isFullyRefunded;
                          return (
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                              {isFullyRefunded ? (
                                <span className="badge badge-soft-warning fs-12 px-3 py-2 d-inline-flex align-items-center gap-1">
                                  <i className="ti ti-receipt-refund" style={{ fontSize: 12 }} />Refunded
                                </span>
                              ) : (
                                <>
                                  {payment.status === "draft" ? (
                                    <span className="badge badge-soft-secondary fs-12 px-3 py-2">Draft</span>
                                  ) : payment.status === "closed" ? (
                                    <span className="badge badge-soft-secondary fs-12 px-3 py-2 d-inline-flex align-items-center gap-1">
                                      <i className="ti ti-lock" style={{ fontSize: 12 }} />Closed
                                    </span>
                                  ) : (
                                    <>
                                      <span className="badge badge-soft-success fs-12 px-3 py-2 d-inline-flex align-items-center gap-1">
                                        <i className="ti ti-circle-check" style={{ fontSize: 12 }} />Open
                                      </span>
                                      {parseFloat(payment.unused_amount ?? "0") > 0 && (
                                        <span className="badge fs-12 px-3 py-2" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                                          ₹{parseFloat(payment.unused_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })} Unused
                                        </span>
                                      )}
                                    </>
                                  )}
                                  {isPartialRefunded && (
                                    <span className="badge badge-soft-danger fs-12 px-3 py-2 d-inline-flex align-items-center gap-1">
                                      <i className="ti ti-receipt-refund" style={{ fontSize: 12 }} />Partially Refunded
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="d-flex align-items-center gap-2">
                      <div className="dropdown">
                        <button
                          type="button"
                          className="btn btn-outline-light dropdown-toggle shadow d-flex align-items-center gap-1"
                          style={{ height: 36 }}
                          data-bs-toggle="dropdown"
                          data-bs-auto-close="outside"
                        >
                          Actions
                        </button>
                        <div className="dropdown-menu dropdown-menu-end dropmenu-hover-primary">
                          <ul>
                            <li>
                              <button className="dropdown-item" onClick={() => navigate(`/payments/${payment.id}/refund`)}>
                                <i className="ti ti-receipt-refund me-2" />Refund
                              </button>
                            </li>
                            <li>
                              <button className="dropdown-item" onClick={handlePrint}>
                                <i className="ti ti-printer me-2" />Print
                              </button>
                            </li>
                            {canDelete && (
                            <>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                              <button
                                className="dropdown-item text-danger"
                                onClick={() => {
                                  const invList = payment.invoices ?? [];
                                  const invText = invList.length > 0
                                    ? ` Applied invoices (${invList.map(i => i.invoice_number).join(", ")}) will be recalculated and reopened if needed.`
                                    : "";
                                  setConfirmConfig({
                                    icon: "ti-trash",
                                    iconColor: "#dc2626",
                                    iconBg: "#fef2f2",
                                    title: "Delete Payment",
                                    message: `Are you sure you want to delete ${payment.payment_number}? This action cannot be undone.${invText}`,
                                    confirmLabel: "Delete",
                                    confirmColor: "#dc2626",
                                    onConfirm: async () => {
                                      const res = await destroyPayment(payment.id);
                                      if (!res.success) {
                                        showToast("danger", (res as any).message ?? "Failed to delete payment.");
                                        return;
                                      }
                                      bustAllPaymentCache();
                                      showToast("success", `${payment.payment_number} deleted.`);
                                      const remaining = allPayments.filter(p => p.id !== payment.id);
                                      if (remaining.length > 0) navigate(`/payments/${remaining[0].id}`);
                                      else navigate("/crm/payments");
                                    },
                                  });
                                }}
                              >
                                <i className="ti ti-trash me-2" />Delete
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
                        onClick={() => navigate("/crm/payments")}
                        title="Close"
                      >
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

                  {/* ── Tab: Overview — Payment Receipt ── */}
                  {activeTab === "overview" && (() => {
                    const B  = "1px solid #bbb";
                    const Bs = "1px solid #ddd";
                    const fmtAmt = (v: string | null | undefined) =>
                      parseFloat(v ?? "0").toLocaleString("en-IN", { minimumFractionDigits: 2 });

                    const totalRefunded     = refunds.reduce((s: number, r: any) => s + parseFloat(r.amount ?? "0"), 0);
                    const pmtAmt            = parseFloat(payment.amount ?? "0");
                    const isFullyRefunded   = totalRefunded > 0 && totalRefunded >= pmtAmt - 0.005;
                    const isPartialRefunded = totalRefunded > 0 && !isFullyRefunded;

                    const statusCfg: Record<string, { label: string; color: string; shadow: string }> = {
                      open:   { label: "Open",   color: "#22c55e", shadow: "#22c55e40" },
                      closed: { label: "Closed", color: "#94a3b8", shadow: "#94a3b840" },
                      draft:  { label: "Draft",  color: "#f97316", shadow: "#f9731640" },
                    };
                    const sc = statusCfg[payment.status] ?? statusCfg.draft;

                    const stampToShow: { label: string; color: string; shadow: string } =
                      isFullyRefunded   ? { label: "Refunded",          color: "#d97706", shadow: "#d9770640" } :
                      isPartialRefunded ? { label: "Partially Refunded", color: "#ea580c", shadow: "#ea580c40" } :
                      sc;

                    const addr = payment.location?.address ?? {};
                    const invoices = payment.invoices ?? [];

                    return (
                      <div className="card shadow-sm" style={{ border: "1px solid #e0e0e0", borderRadius: 8, padding: 24 }}>

                        {/* Status stamp + Print */}
                        <div className="payment-print-hide" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                          <div style={{ display: "inline-flex", alignItems: "center", padding: "10px 10px 4px 10px" }}>
                            <div style={{
                              display: "inline-flex", alignItems: "center", justifyContent: "center",
                              border: `3px solid ${stampToShow.color}`,
                              outline: `1px solid ${stampToShow.color}`,
                              outlineOffset: 3,
                              borderRadius: 3,
                              padding: "3px 18px",
                              transform: "rotate(-6deg)",
                              color: stampToShow.color,
                              fontWeight: 900,
                              fontSize: 15,
                              letterSpacing: "0.22em",
                              textTransform: "uppercase",
                              opacity: 0.82,
                              userSelect: "none",
                              boxShadow: `2px 2px 0 ${stampToShow.shadow}`,
                              fontFamily: "Arial, Helvetica, sans-serif",
                            }}>
                              {stampToShow.label}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handlePrint}
                            style={{
                              background: "#f8fafc", border: "1px solid #e2e8f0",
                              borderRadius: 7, width: 34, height: 34,
                              cursor: "pointer", color: "#64748b",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                            title="Print Receipt"
                          >
                            <i className="ti ti-printer" style={{ fontSize: 15 }} />
                          </button>
                        </div>

                        {/* Receipt document */}
                        <div className="payment-receipt" style={{ border: B, background: "#fff", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 13, color: "#222" }}>

                          {/* Title */}
                          <div style={{ textAlign: "center", fontWeight: 700, fontSize: 16, padding: "8px 0", borderBottom: B, letterSpacing: "0.08em" }}>
                            PAYMENT RECEIPT
                          </div>

                          {/* Company + Amount box row */}
                          <div style={{ display: "flex", borderBottom: B }}>

                            {/* Company block */}
                            <div style={{ flex: 1, padding: "14px 16px", borderRight: B }}>
                              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                                {payment.location?.name ?? ""}
                              </div>
                              {addr.street1 && <div style={{ marginTop: 2 }}>{addr.street1}</div>}
                              {addr.street2 && <div>{addr.street2}</div>}
                              {(addr.city || addr.state) && (
                                <div>{[addr.city, addr.state].filter(Boolean).join(", ")}</div>
                              )}
                              {addr.country && <div>{addr.country}</div>}
                              {payment.location?.website_url && (
                                <div style={{ marginTop: 4 }}>{payment.location.website_url}</div>
                              )}
                            </div>

                            {/* Nothing on the right of company row — amount box sits below */}
                            <div style={{ width: 200 }} />
                          </div>

                          {/* Fields + Amount box */}
                          <div style={{ display: "flex", borderBottom: B }}>

                            {/* Left: field rows */}
                            <div style={{ flex: 1, borderRight: B }}>
                              {[
                                { label: "Payment Date",     value: formatDate(payment.payment_date) },
                                { label: "Payment Number",   value: payment.payment_number },
                                { label: "Payment Mode",     value: MODE_LABEL[payment.payment_mode] ?? payment.payment_mode },
                              ].map((row, i, arr) => (
                                <div
                                  key={row.label}
                                  style={{
                                    display: "flex",
                                    borderBottom: i < arr.length - 1 ? Bs : "none",
                                    minHeight: 36,
                                  }}
                                >
                                  <div style={{ width: 180, padding: "8px 14px", color: "#555", flexShrink: 0 }}>{row.label}</div>
                                  <div style={{ flex: 1, padding: "8px 14px", fontWeight: row.value ? 600 : 400 }}>{row.value || "—"}</div>
                                </div>
                              ))}
                            </div>

                            {/* Right: Amount Received box */}
                            <div style={{ width: 200, background: "#4a7c59", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 12px", gap: 6 }}>
                              <div style={{ color: "#d4f0df", fontSize: 12 }}>Amount Received</div>
                              <div style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>
                                ₹{fmtAmt(payment.amount)}
                              </div>
                            </div>
                          </div>

                          {/* Amount in words */}
                          <div style={{ padding: "8px 14px", borderBottom: B }}>
                            <span style={{ color: "#555" }}>Amount Received In Words: </span>
                            <strong>{amountInWords(payment.amount)}</strong>
                          </div>

                          {/* Received From + Authorized Signature */}
                          <div style={{ display: "flex", borderBottom: B, minHeight: 80 }}>
                            <div style={{ flex: 1, padding: "12px 14px", borderRight: B }}>
                              <div style={{ fontSize: 12, color: "#555", marginBottom: 6 }}>Received From</div>
                              {payment.customer && (
                                <div style={{ fontWeight: 700, color: "#222" }}>
                                  {payment.customer.display_name}
                                </div>
                              )}
                            </div>
                            <div style={{ width: 200, padding: "12px 14px", textAlign: "right" }}>
                              <div style={{ marginTop: 44, fontSize: 12, color: "#555" }}>Authorized Signature</div>
                            </div>
                          </div>

                          {/* Payment for (invoices table) */}
                          {invoices.length > 0 && (
                            <div>
                              <div style={{ padding: "10px 14px 6px", fontWeight: 700, fontSize: 14 }}>Payment for</div>
                              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                  <tr style={{ borderBottom: Bs }}>
                                    {["Invoice Number", "Invoice Date", "Invoice Amount", "Payment Amount"].map(h => (
                                      <th key={h} style={{ padding: "7px 14px", textAlign: h === "Invoice Number" || h === "Invoice Date" ? "left" : "right", fontWeight: 600, fontSize: 12, color: "#555", borderBottom: Bs }}>
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {invoices.map(inv => (
                                    <tr key={inv.id} style={{ borderBottom: Bs }}>
                                      <td style={{ padding: "8px 14px", color: "#222", fontWeight: 700 }}>
                                        {inv.invoice_number}
                                      </td>
                                      <td style={{ padding: "8px 14px" }}>
                                        {formatDate(inv.invoice_date ?? null)}
                                      </td>
                                      <td style={{ padding: "8px 14px", textAlign: "right" }}>
                                        ₹{fmtAmt(inv.grand_total)}
                                      </td>
                                      <td style={{ padding: "8px 14px", textAlign: "right" }}>
                                        ₹{fmtAmt(inv.pivot?.applied_amount ?? payment.amount)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {/* Footer */}
                          <div style={{ textAlign: "center", fontSize: 11, fontStyle: "italic", padding: "6px 0", borderTop: invoices.length > 0 ? Bs : "none" }}>
                            This is a Computer Generated Payment Receipt
                          </div>
                        </div>

                        {/* Last updated */}
                        <div className="d-inline-flex align-items-center gap-2 mt-4 px-3 py-2 rounded"
                          style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}>
                          <i className="ti ti-clock text-muted fs-14" />
                          <span className="fs-14 text-muted">
                            Last updated on{" "}
                            <span className="fw-semibold" style={{ color: "#495057" }}>
                              {new Date(payment.updated_at ?? payment.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                              {", "}
                              {new Date(payment.updated_at ?? payment.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                            </span>
                          </span>
                        </div>

                      </div>
                    );
                  })()}

                  {/* ── Tab: Refunds ── */}
                  {activeTab === "refunds" && (() => {
                    const fmtAmt = (v: string | number) =>
                      `₹${parseFloat(String(v)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
                    const totalRefundedAmt = refunds.reduce((s: number, r: any) => s + parseFloat(r.amount ?? "0"), 0);

                    return (
                      <div>
                        {refundsLoading ? (
                          <div className="d-flex align-items-center gap-2 text-muted fs-13 py-4">
                            <span className="spinner-border spinner-border-sm" />Loading refunds…
                          </div>
                        ) : refunds.length === 0 ? (
                          <div className="text-center py-5 text-muted">
                            <i className="ti ti-receipt-refund fs-36 d-block mb-2" />
                            <p className="fs-14 mb-0">No refunds recorded yet.</p>
                          </div>
                        ) : (
                          <div style={{ border: "1px solid #dee2e6", borderRadius: 8, overflow: "hidden" }}>
                            {/* Summary bar */}
                            <div style={{ background: "#fff0f2", padding: "12px 16px", borderBottom: "1px solid #dee2e6" }}>
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E41F07", display: "inline-block", flexShrink: 0 }} />
                                <span className="fw-semibold fs-14">
                                  {refunds.length} refund{refunds.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <p className="text-muted fs-13 mb-0">
                                Total refunded: <strong>{fmtAmt(totalRefundedAmt)}</strong>
                              </p>
                            </div>

                            {/* Table */}
                            <table className="table mb-0" style={{ width: "100%" }}>
                              <thead>
                                <tr>
                                  {["Date", "Mode", "Amount", "Reference #", "Description", ""].map((h, i) => (
                                    <th
                                      key={i}
                                      className={`text-uppercase fs-12 fw-semibold text-muted${i === 2 ? " text-end" : ""}`}
                                      style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", width: i === 5 ? 80 : undefined }}
                                    >
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {refunds.map((r: any, idx: number) => (
                                  <tr key={r.id ?? idx} style={{ borderBottom: "1px solid #f5f5f5" }}>
                                    <td className="fs-14" style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                                      {formatDate(r.refunded_on ?? null)}
                                    </td>
                                    <td className="fs-14" style={{ padding: "12px 16px" }}>
                                      {MODE_LABEL[r.payment_mode] ?? r.payment_mode ?? "—"}
                                    </td>
                                    <td className="fs-14 fw-semibold text-end" style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                                      {fmtAmt(r.amount ?? "0")}
                                    </td>
                                    <td className="fs-14 text-muted" style={{ padding: "12px 16px" }}>
                                      {r.reference_number || <span className="fst-italic">—</span>}
                                    </td>
                                    <td className="fs-14 text-muted" style={{ padding: "12px 16px" }}>
                                      {r.description || <span className="fst-italic">—</span>}
                                    </td>
                                    <td style={{ padding: "8px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                                      <button
                                        type="button"
                                        className="btn btn-link p-0 me-2"
                                        style={{ textDecoration: "none", color: "#6c757d" }}
                                        title="Edit refund"
                                        onClick={() => navigate(`/payments/${id}/refunds/${r.id}/edit`)}
                                      >
                                        <i className="ti ti-pencil fs-16" />
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-link p-0 text-danger"
                                        style={{ textDecoration: "none" }}
                                        title="Delete refund"
                                        onClick={() => setConfirmConfig({
                                          icon: "ti-trash",
                                          iconColor: "#e03131",
                                          iconBg: "#fff0f0",
                                          title: "Delete Refund?",
                                          message: `This refund of ${fmtAmt(r.amount ?? "0")} on ${formatDate(r.refunded_on ?? null)} will be permanently removed and the payment balance will be updated.`,
                                          confirmLabel: "Delete",
                                          confirmColor: "#e03131",
                                          onConfirm: async () => {
                                            if (!payment) return;
                                            const res = await destroyPaymentRefund(payment.id, r.id);
                                            if (!res.success) {
                                              showToast("danger", (res as any).message ?? "Failed to delete refund.");
                                              return;
                                            }
                                            showToast("success", "Refund deleted.");
                                            emitMutation("payments:mutated");
                                            refundsFetchedForId.current = null;
                                            fetchPaymentRefunds(payment.id)
                                              .then(res2 => { if (res2.success) setRefunds((res2 as any).data ?? []); })
                                              .catch(() => {});
                                          },
                                        })}
                                      >
                                        <i className="ti ti-trash fs-16" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
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
                          payment_created:   "ti-plus",
                          payment_updated:   "ti-pencil",
                          payment_deleted:   "ti-trash",
                          payment_applied:   "ti-cash",
                          payment_unapplied: "ti-receipt-off",
                        };
                        const EVENT_LABEL: Record<string, string> = {
                          payment_created:   "Payment Created",
                          payment_updated:   "Payment Updated",
                          payment_deleted:   "Payment Deleted",
                          payment_applied:   "Applied to Invoice",
                          payment_unapplied: "Removed from Invoice",
                        };
                        const PAYMENT_MODE: Record<string, string> = {
                          cash: "Cash", upi: "UPI", bank_transfer: "Bank Transfer",
                          cheque: "Cheque", card: "Card / POS", neft: "NEFT",
                          rtgs: "RTGS", imps: "IMPS", advance_payment: "Advance Payment",
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
                        const buildMeta = (log: ActivityEntry): MetaRow[] => {
                          const m = log.metadata ?? {};
                          const rows: MetaRow[] = [];
                          const add = (label: string, val: string | null | undefined) => {
                            if (val != null && String(val).trim() !== "") rows.push({ label, value: String(val) });
                          };
                          if (log.event_type === "payment_created") {
                            add("Amount",       fmtAmt(m.amount));
                            add("Mode",         m.payment_mode ? (PAYMENT_MODE[m.payment_mode] ?? m.payment_mode) : null);
                            add("Reference #",  m.reference_number ?? null);
                          } else if (log.event_type === "payment_applied") {
                            add("Invoice #",    m.invoice_number ?? null);
                            add("Amount",       fmtAmt(m.applied_amount));
                            add("Balance After", m.invoice_balance != null ? `₹${parseFloat(m.invoice_balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : null);
                          } else if (log.event_type === "payment_unapplied") {
                            add("Invoice #",    m.invoice_number ?? null);
                            add("Mode",         m.payment_mode ? (PAYMENT_MODE[m.payment_mode] ?? m.payment_mode) : null);
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

export default PaymentOverview;
