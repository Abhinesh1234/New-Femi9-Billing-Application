import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePermission } from "../../../../core/hooks/usePermission";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../../../../core/redux/loaderSlice";
import { useNavigate, useParams, useLocation as useRouterLocation } from "react-router";
import { Toast } from "react-bootstrap";
import { destroyInvoice, restoreInvoice, voidInvoice, deletePayment, unapplyPaymentFromInvoice, fetchAdvanceBalance, applyAdvanceToInvoice, fetchAvailableCreditsBalance, applyAvailableCredits, removeInvoiceCreditApplications, type InvoiceListItem, type InvoiceDetail, type InvoiceActivityEntry, type AvailableCreditRow } from "../../../../core/services/invoiceApi";
import {
  getInvoiceList, readInvoiceList,
  getInvoiceDetail, readInvoiceDetail, hydrateInvoiceDetail,
  getInvoiceActivity,
  bustInvoice, bustInvoiceList,
} from "../../../../core/cache/invoiceCache";
import { onMutation, emitMutation } from "../../../../core/cache/mutationEvents";
import { getSettings } from "../../../../core/cache/settingCache";
import ConfirmDialog, { type ConfirmConfig } from "../../../../components/confirm-dialog/ConfirmDialog";

type ListFilter = "all" | "draft" | "sent" | "paid" | "overdue" | "deleted";
type Tab        = "overview" | "payments" | "history";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview"  },
  { key: "payments", label: "Payments"  },
  { key: "history",  label: "History"   },
];

const STATUS_LABEL: Record<string, string> = {
  draft:          "Draft",
  sent:           "Sent",
  partially_paid: "Partially Paid",
  paid:           "Paid",
  overdue:        "Overdue",
  void:           "Void",
};

const STATUS_CLASS: Record<string, string> = {
  draft:          "badge-soft-secondary",
  sent:           "badge-soft-primary",
  partially_paid: "badge-soft-warning",
  paid:           "badge-soft-success",
  overdue:        "badge-soft-danger",
  void:           "badge-soft-dark",
};

function getOverdueDays(dueDate: string | null): number {
  if (!dueDate) return 0;
  const due   = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  const datePart = d.substring(0, 10);
  const [y, m, day] = datePart.split("-");
  if (!y || !m || !day) return d;
  return `${day}/${m}/${y}`;
}

const TERMS_LABEL: Record<string, string> = {
  due_on_receipt: "Due on Receipt",
  net_15: "Net 15", net_30: "Net 30",
  net_45: "Net 45", net_60: "Net 60", net_90: "Net 90",
  custom: "Custom",
};

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

const InvoiceOverview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canEdit   = usePermission("invoices", "edit");
  const canDelete = usePermission("invoices", "delete");
  const dispatch = useDispatch();
  const navState = useRouterLocation().state as { listFilter?: ListFilter } | null;

  // ── Invoice list (left panel) ──
  const [allInvoices, setAllInvoices]     = useState<InvoiceListItem[]>([]);
  const [deletedInvoices, setDeletedInvoices] = useState<InvoiceListItem[]>([]);
  const [deletedLoading, setDeletedLoading]   = useState(false);
  const [listFilter, setListFilter]       = useState<ListFilter>(navState?.listFilter ?? "all");
  const [listSearch, setListSearch]       = useState("");

  // ── Invoice detail (right panel) ──
  const [invoice, setInvoice]             = useState<InvoiceDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab]         = useState<Tab>("overview");

  // ── Soft refresh (no content wipe) ──
  const [refreshing, setRefreshing]   = useState(false);
  const refreshingRef                 = useRef(false);
  const detailFetchRef                = useRef(0);

  // ── Activity log (history tab) ──
  const [activityLogs, setActivityLogs]       = useState<InvoiceActivityEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // ── Confirm dialog (delete, restore, etc.) ──
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  // ── Apply Advance Balance ──
  const [advanceBalance, setAdvanceBalance]         = useState<number>(0);
  const [showAdvanceModal, setShowAdvanceModal]     = useState(false);
  const [advanceAmt, setAdvanceAmt]                 = useState("");
  const [applyingAdvance, setApplyingAdvance]       = useState(false);
  const advanceBalanceFetchedFor                    = useRef<number | null>(null);
  const [invoiceSettings, setInvoiceSettings]       = useState<Record<string, any> | null>(null);

  // ── Apply Available Credits (credit notes + excess payments) ──
  const [availableCreditsRows, setAvailableCreditsRows] = useState<AvailableCreditRow[]>([]);
  const [showCreditModal, setShowCreditModal]           = useState(false);
  const [applyAmounts, setApplyAmounts]                 = useState<Record<string, string>>({});
  const [applyingCredit, setApplyingCredit]             = useState(false);
  const creditBalanceFetchedFor                         = useRef<number | null>(null);


  // ── Toast ──
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger"; message: string }>({ show: false, type: "success", message: "" });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (type: "success" | "danger", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // ── Scroll active row into view ──
  const activeItemRef = useRef<HTMLDivElement>(null);

  // ── Pending nav after deleted list loads ──
  const pendingDeletedNav = useRef(false);

  // ── Suppresses the filter-change auto-nav when we handle navigation ourselves ──
  const suppressFilterNav = useRef(false);

  // ── Load active invoice list once on mount (cache-first) ──
  useEffect(() => {
    const cached = readInvoiceList(null, false);
    if (cached) setAllInvoices(cached.data);
    getInvoiceList()
      .then((result) => setAllInvoices(result.data))
      .catch(() => showToast("danger", "Network error loading invoices list."));
  }, []);

  // ── Fetch invoice detail when id changes (cache-first + token guard) ──
  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    if (isNaN(numId)) return;
    const token = ++detailFetchRef.current;

    // Show cached detail instantly while fresh data loads in background
    const cached = readInvoiceDetail(numId);
    if (cached) { setInvoice(cached); setDetailLoading(false); }
    else { setDetailLoading(true); dispatch(startLoading("invoice-detail")); }

    getInvoiceDetail(numId)
      .then((detail) => {
        if (token !== detailFetchRef.current) return;
        setInvoice(detail);
      })
      .catch(() => {})
      .finally(() => {
        if (token !== detailFetchRef.current) return;
        setDetailLoading(false);
        dispatch(stopLoading("invoice-detail"));
      });

    return () => { dispatch(stopLoading("invoice-detail")); };
  }, [id]);

  // ── Load invoice settings once (for advance payment category check) ──
  useEffect(() => {
    getSettings("invoices").then((s) => setInvoiceSettings(s as Record<string, any>)).catch(() => {});
  }, []);

  // ── Fetch advance balance whenever the invoice customer changes ──
  useEffect(() => {
    if (!invoice?.customer?.id) { setAdvanceBalance(0); return; }
    const cid = invoice.customer.id;
    if (advanceBalanceFetchedFor.current === cid) return;
    advanceBalanceFetchedFor.current = cid;
    fetchAdvanceBalance(cid).then((res) => {
      if (res.success) setAdvanceBalance(res.data.balance);
    }).catch(() => {});
  }, [invoice?.customer?.id]);

  // ── Fetch available credits whenever the invoice customer changes ──
  useEffect(() => {
    if (!invoice?.customer?.id) { setAvailableCreditsRows([]); return; }
    const cid = invoice.customer.id;
    if (creditBalanceFetchedFor.current === cid) return;
    creditBalanceFetchedFor.current = cid;
    fetchAvailableCreditsBalance(cid).then((res) => {
      if (res.success) setAvailableCreditsRows(res.data.rows ?? []);
    }).catch(() => {});
  }, [invoice?.customer?.id]);

  // ── Lazy-fetch deleted invoices when filter switches to "deleted" (cache-first) ──
  useEffect(() => {
    if (listFilter !== "deleted") return;
    const cached = readInvoiceList(null, true);
    if (cached) { setDeletedInvoices(cached.data); setDeletedLoading(false); return; }
    setDeletedLoading(true);
    getInvoiceList({ trashed: true })
      .then((result) => { setDeletedInvoices(result.data); })
      .catch(() => {})
      .finally(() => setDeletedLoading(false));
  }, [listFilter]);

  // ── Navigate to first item in the new view when filter changes ──
  useEffect(() => {
    if (listFilter === "deleted") {
      if (deletedInvoices.length > 0) {
        navigate(`/invoices/${deletedInvoices[0].id}`, { state: { listFilter: "deleted" } });
      } else {
        pendingDeletedNav.current = true;
      }
    } else {
      // Skip auto-nav when the restore handler has already set the destination
      if (suppressFilterNav.current) {
        suppressFilterNav.current = false;
        return;
      }
      const base = filteredForNav();
      if (base.length > 0) navigate(`/invoices/${base[0].id}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listFilter]);

  // ── Once deleted list loads, navigate to first ──
  useEffect(() => {
    if (!pendingDeletedNav.current) return;
    if (listFilter === "deleted" && !deletedLoading && deletedInvoices.length > 0) {
      pendingDeletedNav.current = false;
      navigate(`/invoices/${deletedInvoices[0].id}`, { state: { listFilter: "deleted" } });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedInvoices, deletedLoading]);

  // ── Scroll active row into view ──
  useEffect(() => {
    const timer = setTimeout(() => {
      activeItemRef.current?.scrollIntoView({ block: "center", behavior: "instant" });
    }, 50);
    return () => clearTimeout(timer);
  }, [id, allInvoices]);

  // ── Reset activity logs when invoice changes ──
  useEffect(() => {
    setActivityLogs([]);
  }, [id]);

  // ── Fetch activity when history tab opens or invoice changes (cache-first) ──
  useEffect(() => {
    if (activeTab !== "history") return;
    const numId = Number(id);
    if (!id || isNaN(numId)) return;
    setActivityLoading(true);
    getInvoiceActivity(numId)
      .then((logs) => setActivityLogs(logs))
      .catch(() => {})
      .finally(() => setActivityLoading(false));
  }, [activeTab, id]);

  // ── Soft refresh — busts caches then re-fetches all in parallel ──
  const handleRefresh = useCallback(async () => {
    if (!id || refreshingRef.current) return;
    const numId = Number(id);
    if (isNaN(numId)) return;
    refreshingRef.current = true;
    setRefreshing(true);
    try {
      bustInvoice(numId);
      if (listFilter === "deleted") bustInvoiceList();

      const fetches: Promise<void>[] = [
        getInvoiceDetail(numId).then((detail) => {
          setInvoice(detail);
          if (detail.customer?.id) {
            advanceBalanceFetchedFor.current = null;
            creditBalanceFetchedFor.current  = null;
            fetchAdvanceBalance(detail.customer.id).then((r) => {
              if (r.success) setAdvanceBalance(r.data.balance);
            }).catch(() => {});
            fetchAvailableCreditsBalance(detail.customer.id).then((r) => {
              if (r.success) setAvailableCredits({ creditNote: r.data.credit_note_balance, excess: r.data.excess_payment_balance, total: r.data.total });
            }).catch(() => {});
          }
        }).catch(() => {}),
        getInvoiceList().then((result) => setAllInvoices(result.data)).catch(() => {}),
      ];
      if (listFilter === "deleted") {
        fetches.push(getInvoiceList({ trashed: true }).then((result) => setDeletedInvoices(result.data)).catch(() => {}));
      }
      if (activeTab === "history") {
        fetches.push(getInvoiceActivity(numId).then((logs) => setActivityLogs(logs)).catch(() => {}));
      }
      await Promise.all(fetches);
    } catch {
      showToast("danger", "Network error during refresh.");
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }, [id, listFilter, activeTab]);

  // Reload when new invoice/payment saved from another page
  useEffect(() => onMutation("invoices:mutated", handleRefresh), [handleRefresh]);

  // ── Restore from deleted list ──
  const handleRestoreInvoice = async (invoiceId: number) => {
    try {
      const res = await restoreInvoice(invoiceId);
      if (res.success) {
        const remaining = deletedInvoices.filter((i) => i.id !== invoiceId);
        setDeletedInvoices(remaining);
        showToast("success", "Invoice restored.");

        if (listFilter === "deleted" && remaining.length === 0) {
          // Last deleted invoice restored — refresh the active list so the
          // restored invoice appears immediately without a manual reload.
          try {
            bustInvoice(invoiceId);
            const fresh = await getInvoiceList();
            setAllInvoices(fresh.data);
          } catch { /* non-fatal — list will be stale until next refresh */ }

          // Suppress the filter-change effect's auto-navigation so we can
          // navigate directly to the restored invoice ourselves.
          suppressFilterNav.current = true;
          setListFilter("all");
          navigate(`/invoices/${invoiceId}`);
        } else if (String(invoiceId) === id) {
          navigate(`/invoices/${remaining[0].id}`, { state: { listFilter: "deleted" } });
        }
      } else {
        const msg = (res as { message?: string }).message ?? "Failed to restore invoice.";
        showToast("danger", msg);
      }
    } catch {
      showToast("danger", "Network error restoring invoice.");
    }
  };

  function filteredForNav() {
    if (listFilter === "all") return allInvoices;
    return allInvoices.filter((i) => i.status === listFilter);
  }

  const filteredListItems = useMemo<InvoiceListItem[]>(() => {
    if (listFilter === "deleted") {
      if (!listSearch.trim()) return deletedInvoices;
      const q = listSearch.toLowerCase();
      return deletedInvoices.filter(
        (i) => i.invoice_number.toLowerCase().includes(q) || i.customer?.display_name?.toLowerCase().includes(q)
      );
    }
    let base = listFilter === "all"
      ? allInvoices
      : allInvoices.filter((i) => i.status === listFilter);
    if (listSearch.trim()) {
      const q = listSearch.toLowerCase();
      base = base.filter(
        (i) => i.invoice_number.toLowerCase().includes(q) || i.customer?.display_name?.toLowerCase().includes(q)
      );
    }
    return base;
  }, [allInvoices, deletedInvoices, listFilter, listSearch]);

  const FILTERS: { key: ListFilter; label: string; icon: string }[] = [
    { key: "all",     label: "All Invoices",      icon: "ti-list" },
    { key: "draft",   label: "Draft",              icon: "ti-file" },
    { key: "sent",    label: "Sent",               icon: "ti-send" },
    { key: "paid",    label: "Paid",               icon: "ti-circle-check" },
    { key: "overdue", label: "Overdue",             icon: "ti-clock-exclamation" },
    { key: "deleted", label: "Deleted Invoices",   icon: "ti-trash" },
  ];

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

      {/* ═══ Two-pane shell ═══════════════════════════════════════════════════ */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Left: Invoices list panel ────────────────────────────────────── */}
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
                  placeholder="Search invoices…"
                  value={listSearch}
                  onChange={(e) => setListSearch(e.target.value)}
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
                  {FILTERS.map((f) => (
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

          {/* Invoice list */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {listFilter === "deleted" ? (
              deletedLoading ? (
                <div className="text-center py-4 text-muted fs-13">
                  <span className="spinner-border spinner-border-sm me-2" />Loading…
                </div>
              ) : filteredListItems.length === 0 ? (
                <div className="text-center py-4 text-muted fs-13">
                  <i className="ti ti-trash d-block fs-24 mb-1" />No deleted invoices
                </div>
              ) : (
                filteredListItems.map((inv) => (
                  <div
                    key={inv.id}
                    className="d-flex align-items-center gap-2 px-3"
                    style={{ paddingTop: 11, paddingBottom: 11, cursor: "pointer", borderBottom: "1px solid #f0f2f5" }}
                    onClick={() => navigate(`/invoices/${inv.id}`, { state: { listFilter: "deleted" } })}
                    onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.background = "#f8f9fa"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                  >
                    <div
                      className="rounded border d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 28, height: 28, background: "#f5f5f5", opacity: 0.6 }}
                    >
                      <i className="ti ti-receipt text-muted" style={{ fontSize: 12 }} />
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <span className="fs-14 text-muted text-truncate d-block">{inv.invoice_number}</span>
                      <span className="fs-12 text-muted text-truncate d-block">{inv.customer?.display_name ?? "—"}</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm d-flex align-items-center gap-1 flex-shrink-0"
                      style={{ fontSize: 11, padding: "2px 8px", background: "#fff4f4", color: "#e03131", border: "1px solid #fde8e8", borderRadius: 6 }}
                      onClick={(e) => { e.stopPropagation(); handleRestoreInvoice(inv.id); }}
                      title="Restore"
                    >
                      <i className="ti ti-refresh" style={{ fontSize: 11 }} />Restore
                    </button>
                  </div>
                ))
              )
            ) : filteredListItems.length === 0 ? (
              <div className="text-center py-4 text-muted fs-13">
                <i className="ti ti-mood-empty d-block fs-24 mb-1" />
                No invoices found
              </div>
            ) : (
              filteredListItems.map((inv) => {
                const isActive = String(inv.id) === id;
                return (
                  <div
                    key={inv.id}
                    ref={isActive ? activeItemRef : undefined}
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                    className="d-flex align-items-center gap-2 px-3"
                    style={{
                      paddingTop: 11, paddingBottom: 11,
                      cursor: "pointer",
                      background: isActive ? "#fff1f0" : "transparent",
                      borderBottom: "1px solid #f5f5f5",
                    }}
                    onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "#f8f9fa"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = isActive ? "#fff1f0" : "transparent"; }}
                  >
                    <div
                      className="rounded border d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 28, height: 28, background: "#f5f5f5" }}
                    >
                      <i className="ti ti-receipt text-muted" style={{ fontSize: 12 }} />
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <div className="d-flex align-items-center justify-content-between gap-1 mb-1">
                        <span
                          className="text-truncate"
                          style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? "#e03131" : "#212529" }}
                        >
                          {inv.invoice_number}
                        </span>
                        <span className={`badge fs-10 flex-shrink-0 ${STATUS_CLASS[inv.status] ?? "badge-soft-secondary"}`}>
                          {STATUS_LABEL[inv.status] ?? inv.status}
                        </span>
                      </div>
                      <div className="d-flex align-items-center justify-content-between gap-1">
                        <span className="fs-12 text-muted text-truncate">{inv.customer?.display_name ?? "—"}</span>
                        <span className="fs-12 text-muted flex-shrink-0">
                          ₹{parseFloat(inv.grand_total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right: Invoice detail ────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", background: "#fff" }}>
          <div style={{ padding: "1.25rem" }}>
            {!invoice ? null : (
              <>
              {/* ── Header ── */}
              <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
                <div className="d-flex align-items-start gap-3">

                  {/* Receipt icon */}
                  <div
                    className="rounded border d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 72, height: 72, background: invoice.deleted_at ? "#fef2f2" : "#f5f5f5" }}
                  >
                    <i className="ti ti-receipt fs-30 text-muted" />
                  </div>

                  <div>
                    {/* Party name — small sub-heading above */}
                    <p className="fs-13 text-muted mb-1 lh-sm">
                      {invoice.customer?.display_name ?? "—"}
                    </p>

                    {/* Invoice number — main heading */}
                    <h4 className="fw-bold mb-2 lh-sm">{invoice.invoice_number}</h4>

                    {/* Status tags */}
                    <div className="d-flex align-items-center gap-2 flex-wrap">

                      {invoice.deleted_at ? (
                        /* Deleted */
                        <span className="badge badge-soft-danger d-inline-flex align-items-center gap-1 fs-12">
                          <i className="ti ti-trash" style={{ fontSize: 10 }} />Deleted
                        </span>
                      ) : invoice.status === "draft" ? (
                        /* Draft — show only this tag */
                        <span className="badge badge-soft-secondary fs-12 px-3 py-2">Draft</span>
                      ) : invoice.status === "paid" ? (
                        /* Paid — show only this tag */
                        <span className="badge badge-soft-success fs-12 px-3 py-2 d-inline-flex align-items-center gap-1">
                          <i className="ti ti-circle-check" style={{ fontSize: 12 }} />Paid
                        </span>
                      ) : invoice.status === "overdue" ? (
                        /* Overdue — show overdue days + balance */
                        <>
                          <span className="badge badge-soft-danger fs-12 px-3 py-2 d-inline-flex align-items-center gap-1">
                            <i className="ti ti-clock-exclamation" style={{ fontSize: 12 }} />
                            Overdue · {getOverdueDays(invoice.due_date)} day{getOverdueDays(invoice.due_date) !== 1 ? "s" : ""}
                          </span>
                          {parseFloat(invoice.balance_amount) > 0 && (
                            <span className="badge fs-12 px-3 py-2" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                              ₹{parseFloat(invoice.balance_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })} Due
                            </span>
                          )}
                        </>
                      ) : invoice.status === "partially_paid" ? (
                        /* Partially paid — show tag + balance */
                        <>
                          <span className="badge badge-soft-warning fs-12 px-3 py-2 d-inline-flex align-items-center gap-1">
                            <i className="ti ti-hourglass-half" style={{ fontSize: 12 }} />Partially Paid
                          </span>
                          {parseFloat(invoice.balance_amount) > 0 && (
                            <span className="badge fs-12 px-3 py-2" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                              ₹{parseFloat(invoice.balance_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })} Due
                            </span>
                          )}
                        </>
                      ) : (
                        /* Sent */
                        <>
                          <span className="badge badge-soft-primary fs-12 px-3 py-2 d-inline-flex align-items-center gap-1">
                            <i className="ti ti-send" style={{ fontSize: 12 }} />Sent
                          </span>
                          {parseFloat(invoice.balance_amount) > 0 && (
                            <span className="badge fs-12 px-3 py-2" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                              ₹{parseFloat(invoice.balance_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })} Due
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="d-flex align-items-center gap-2">
                  {invoice.deleted_at ? (
                    <button
                      type="button"
                      className="btn btn-outline-light shadow d-flex align-items-center gap-1"
                      style={{ height: 36 }}
                      onClick={() => handleRestoreInvoice(invoice.id)}
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
                        data-bs-auto-close="outside"
                      >
                        Actions
                      </button>
                      <div className="dropdown-menu dropdown-menu-end dropmenu-hover-primary">
                        <ul>
                          {canEdit && (
                            <li>
                              <button className="dropdown-item" onClick={() => navigate(`/invoices/${invoice.id}/edit`)}>
                                <i className="ti ti-pencil me-2" />Edit
                              </button>
                            </li>
                          )}
                          <li>
                            <button className="dropdown-item" onClick={() => window.print()}>
                              <i className="ti ti-printer me-2" />Print
                            </button>
                          </li>
                          {(invoice.status === "paid" || invoice.status === "partially_paid") && (
                            <>
                              <li><hr className="dropdown-divider" /></li>
                              <li>
                                <button
                                  className="dropdown-item"
                                  disabled={invoice.is_fully_credited === true}
                                  title={invoice.is_fully_credited === true ? "All items on this invoice have already been credited" : undefined}
                                  onClick={() => { if (!invoice.is_fully_credited) navigate(`/invoices/${invoice.id}/credit-note`); }}
                                >
                                  <i className="ti ti-receipt-refund me-2" />Create Credit Note
                                  {invoice.is_fully_credited && (
                                    <span className="ms-2 badge bg-light text-muted" style={{ fontSize: 10, fontWeight: 500 }}>Fully Credited</span>
                                  )}
                                </button>
                              </li>
                            </>
                          )}
                          <li><hr className="dropdown-divider" /></li>
                          <li className="dropstart">
                            <button
                              type="button"
                              className="dropdown-item d-flex align-items-center justify-content-between gap-3"
                              data-bs-toggle="dropdown"
                              data-bs-auto-close="outside"
                            >
                              <span className="d-flex align-items-center">
                                <i className="ti ti-share me-2" />Share
                              </span>
                              <i className="ti ti-chevron-right fs-11 text-muted" />
                            </button>
                            <ul className="dropdown-menu dropmenu-hover-primary" style={{ minWidth: 160 }}>
                              <li>
                                <button
                                  type="button"
                                  className="dropdown-item d-flex align-items-center gap-2"
                                  onClick={() => {
                                    const mobile = invoice.customer?.mobile ?? "";
                                    const num    = mobile.replace(/\D/g, "");
                                    if (!num) {
                                      showToast("danger", "No mobile number on file for this customer.");
                                      return;
                                    }
                                    const text = `Hi, please find your invoice ${invoice.invoice_number} for ₹${parseFloat(invoice.grand_total).toLocaleString("en-IN", { minimumFractionDigits: 2 })} attached.`;
                                    window.open(
                                      `https://wa.me/${num}?text=${encodeURIComponent(text)}`,
                                      "_blank"
                                    );
                                  }}
                                >
                                  <i className="ti ti-brand-whatsapp fs-16" style={{ color: "#25D366" }} />
                                  WhatsApp
                                </button>
                              </li>
                            </ul>
                          </li>
                          {invoice.status !== "void" && (
                            <li>
                              <button className="dropdown-item" onClick={() => {
                                const paidAmt = parseFloat(invoice.total_paid ?? "0");
                                const hasPaid = paidAmt > 0;
                                setConfirmConfig({
                                  icon: "ti-ban", iconColor: "#e67700", iconBg: "#fff9db",
                                  title: "Void Invoice",
                                  message: hasPaid
                                    ? `Remove the applied payment (₹${paidAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}) before voiding this invoice.`
                                    : `Void ${invoice.invoice_number}? All stock movements will be reversed. The invoice stays visible as voided.`,
                                  confirmLabel: hasPaid ? "OK" : "Void Invoice",
                                  confirmColor: "#e67700",
                                  onConfirm: hasPaid ? async () => {} : async () => {
                                    try {
                                      const res = await voidInvoice(invoice.id);
                                      if (res.success) {
                                        const updated = res.data;
                                        bustInvoice(invoice.id);
                                        hydrateInvoiceDetail(updated);
                                        setAllInvoices(prev => prev.map(i => i.id === updated.id ? { ...i, status: updated.status } : i));
                                        setInvoice(updated);
                                        showToast("success", `${invoice.invoice_number} has been voided.`);
                                        emitMutation("invoices:mutated");
                                        if (activeTab === "history") {
                                          getInvoiceActivity(updated.id).then(logs => setActivityLogs(logs)).catch(() => {});
                                        }
                                      } else {
                                        const msg = (res as { message?: string }).message ?? "Failed to void invoice.";
                                        showToast("danger", msg);
                                      }
                                    } catch {
                                      showToast("danger", "Network error voiding invoice.");
                                    }
                                  },
                                });
                              }}>
                                <i className="ti ti-ban me-2" />Void
                              </button>
                            </li>
                          )}
                          <li><hr className="dropdown-divider" /></li>
                          {canDelete && (
                          <li>
                            <button className="dropdown-item text-danger" onClick={() => {
                              setConfirmConfig({
                                icon: "ti-trash", iconColor: "#e03131", iconBg: "#fff0f0",
                                title: "Delete Invoice",
                                message: `Delete invoice ${invoice.invoice_number}? This cannot be undone.`,
                                confirmLabel: "Delete", confirmColor: "#e03131",
                                onConfirm: async () => {
                                  try {
                                    const res = await destroyInvoice(invoice.id);
                                    if (res.success) {
                                      bustInvoice(invoice.id);
                                      emitMutation("invoices:mutated");
                                      const remaining = allInvoices.filter((i) => i.id !== invoice.id);
                                      setAllInvoices(remaining);
                                      showToast("success", "Invoice deleted.");
                                      if (remaining.length > 0) {
                                        navigate(`/invoices/${remaining[0].id}`);
                                      } else {
                                        navigate("/invoices/new");
                                      }
                                    } else {
                                      const msg = (res as { message?: string }).message ?? "Failed to delete invoice.";
                                      showToast("danger", msg);
                                    }
                                  } catch {
                                    showToast("danger", "Network error deleting invoice.");
                                  }
                                },
                              });
                            }}>
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
                    onClick={() => navigate("/invoices/new")}
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

              {/* ── Tab: Overview — Invoice layout shell ── */}
              {activeTab === "overview" && (() => {
                const B  = "1px solid #bbb";   // section borders
                const Bs = "1px solid #ddd";   // inner row dividers
                const cell: React.CSSProperties  = { border: Bs, padding: "6px 8px" };
                const hCell: React.CSSProperties = { border: B, padding: "6px 8px", background: "#f7f7f7", fontWeight: 600, fontSize: 11 };
                const statusCfg: Record<string, { label: string; color: string; shadow: string }> = {
                  draft:          { label: "Draft",          color: "#94a3b8", shadow: "#94a3b840" },
                  sent:           { label: "Sent",           color: "#3b82f6", shadow: "#3b82f640" },
                  partially_paid: { label: "Partially Paid", color: "#f97316", shadow: "#f9731640" },
                  paid:           { label: "Paid",           color: "#22c55e", shadow: "#22c55e40" },
                  overdue:        { label: "Overdue",        color: "#ef4444", shadow: "#ef444440" },
                  void:           { label: "Void",           color: "#dc2626", shadow: "#dc262640" },
                };
                const sc = statusCfg[invoice.status] ?? statusCfg.draft;

                return (
                /* ── Card shell ── */
                <div className="card shadow-sm" style={{ border: "1px solid #e0e0e0", borderRadius: 8, padding: 24 }}>

                  {/* ── Status + Print row ── */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>

                    {/* Stamp-style status — rotated rectangular seal */}
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
                        fontWeight: 900,
                        fontSize: 15,
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        opacity: 0.82,
                        userSelect: "none",
                        boxShadow: `2px 2px 0 ${sc.shadow}`,
                        fontFamily: "Arial, Helvetica, sans-serif",
                      }}>
                        {sc.label}
                      </div>
                    </div>

                    {/* Print icon */}
                    <button
                      type="button"
                      onClick={() => window.print()}
                      style={{
                        background: "#f8fafc", border: "1px solid #e2e8f0",
                        borderRadius: 7, width: 34, height: 34,
                        cursor: "pointer", color: "#64748b",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                      title="Print Invoice"
                    >
                      <i className="ti ti-printer" style={{ fontSize: 15 }} />
                    </button>
                  </div>

                  {/* ── Invoice document ── */}
                  {(() => {
                    const addr     = invoice.location?.address ?? {};
                    const fmtAmt   = (v: string | null | undefined) =>
                      parseFloat(v ?? "0").toLocaleString("en-IN", { minimumFractionDigits: 2 });
                    const items    = invoice.items ?? [];
                    const totalQty = items.reduce((s, it) => s + parseFloat(it.quantity), 0);
                    const subTotal = parseFloat(invoice.sub_total ?? "0");
                    const docTitle = parseFloat(invoice.tax_amount ?? "0") !== 0 ? "Tax Invoice" : "Bill of Supply";

                    const metaRows = [
                      { label: "Invoice #",               value: invoice.invoice_number },
                      { label: "Invoice Date",             value: formatDate(invoice.invoice_date) },
                      { label: "Delivery Note",            value: "" },
                      { label: "Mode / Terms of Payment",  value: invoice.payment_terms ? (TERMS_LABEL[invoice.payment_terms] ?? invoice.payment_terms) : "" },
                      { label: "Reference No. & Date",     value: invoice.order_number ?? "" },
                      { label: "Due Date",                 value: invoice.due_date ? formatDate(invoice.due_date) : "" },
                      { label: "Salesperson",              value: invoice.salesperson ?? "" },
                    ];

                    return (
                    <div className="invoice-receipt" style={{ border: B, background: "#fff", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 13, color: "#222" }}>

                      {/* Title */}
                      <div style={{ textAlign: "center", fontWeight: 700, fontSize: 16, padding: "7px 0", borderBottom: B }}>
                        {docTitle}
                      </div>

                      {/* Header: company left + meta grid right */}
                      <table style={{ width: "100%", borderCollapse: "collapse", borderBottom: B }}>
                        <tbody>
                          <tr>
                            <td rowSpan={metaRows.length + 1} style={{ width: "42%", borderRight: B, verticalAlign: "top", padding: 0 }}>
                              {/* Company block */}
                              <div style={{ padding: "10px 12px", borderBottom: Bs }}>
                                <div style={{ fontWeight: 700, fontSize: 14 }}>{invoice.location?.name ?? ""}</div>
                                {addr.street1 && <div style={{ marginTop: 2 }}>{addr.street1}</div>}
                                {addr.street2 && <div>{addr.street2}</div>}
                                {(addr.city || addr.state || addr.pin_code) && (
                                  <div>{[addr.city, addr.state, addr.pin_code].filter(Boolean).join(", ")}</div>
                                )}
                                {addr.phone && <div style={{ marginTop: 4 }}>Contact : {addr.phone}</div>}
                                {invoice.location?.website_url && <div>Email : {invoice.location.website_url}</div>}
                              </div>
                              {/* Consignee (ship to) — same as buyer */}
                              <div style={{ padding: "3px 12px 1px", borderBottom: Bs, fontSize: 11, color: "#555" }}>Consignee (Ship to):</div>
                              <div style={{ padding: "6px 12px", borderBottom: Bs, minHeight: 56 }}>
                                {invoice.customer && (
                                  <>
                                    <div style={{ fontWeight: 700 }}>{invoice.customer.display_name}</div>
                                    {invoice.customer.gst && <div>GSTIN: {invoice.customer.gst}</div>}
                                    {invoice.customer.mobile && <div>Mobile: {invoice.customer.mobile}</div>}
                                  </>
                                )}
                              </div>
                              {/* Buyer (bill to) */}
                              <div style={{ padding: "3px 12px 1px", borderBottom: Bs, fontSize: 11, color: "#555" }}>Buyer (Bill to):</div>
                              <div style={{ padding: "6px 12px", minHeight: 56 }}>
                                {invoice.customer && (
                                  <>
                                    <div style={{ fontWeight: 700 }}>{invoice.customer.display_name}</div>
                                    {invoice.customer.gst && <div>GSTIN: {invoice.customer.gst}</div>}
                                    {invoice.customer.mobile && <div>Mobile: {invoice.customer.mobile}</div>}
                                  </>
                                )}
                              </div>
                            </td>
                            {/* First meta row */}
                            <td style={{ width: "29%", ...cell, borderTop: "none", borderLeft: "none", fontWeight: 700 }}>{metaRows[0].label}</td>
                            <td style={{ width: "29%", ...cell, borderTop: "none", borderRight: "none" }}>{metaRows[0].value}</td>
                          </tr>
                          {metaRows.slice(1).map((r, i) => (
                            <tr key={i}>
                              <td style={{ ...cell, borderLeft: "none", fontWeight: 700 }}>{r.label}</td>
                              <td style={{ ...cell, borderRight: "none" }}>{r.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Line items table */}
                      <table style={{ width: "100%", borderCollapse: "collapse", borderBottom: B }}>
                        <thead>
                          <tr>
                            <th style={{ ...hCell, width: 30, textAlign: "center" }}>Sl No.</th>
                            <th style={{ ...hCell }}>Description of Goods</th>
                            <th style={{ ...hCell, width: 68, textAlign: "center" }}>HSN/SAC</th>
                            <th style={{ ...hCell, width: 72, textAlign: "right" }}>MRP</th>
                            <th style={{ ...hCell, width: 68, textAlign: "center" }}>Quantity</th>
                            <th style={{ ...hCell, width: 72, textAlign: "right" }}>Rate</th>
                            <th style={{ ...hCell, width: 48, textAlign: "center" }}>GST(%)</th>
                            <th style={{ ...hCell, width: 64, textAlign: "right" }}>Disc</th>
                            <th style={{ ...hCell, width: 80, textAlign: "right" }}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, idx) => (
                            <tr key={item.id}>
                              <td style={{ ...cell, textAlign: "center" }}>{idx + 1}</td>
                              <td style={{ ...cell, fontWeight: 700 }}>{item.item_name}</td>
                              <td style={{ ...cell, textAlign: "center" }}></td>
                              <td style={{ ...cell, textAlign: "right" }}>{fmtAmt(item.base_rate)}</td>
                              <td style={{ ...cell, textAlign: "center" }}>{parseFloat(item.quantity).toLocaleString("en-IN")}</td>
                              <td style={{ ...cell, textAlign: "right" }}>{fmtAmt(item.unit_price)}</td>
                              <td style={{ ...cell, textAlign: "center" }}>{item.gst_rate ? `${parseFloat(item.gst_rate)}%` : "0%"}</td>
                              <td style={{ ...cell, textAlign: "right" }}>—</td>
                              <td style={{ ...cell, textAlign: "right" }}>{fmtAmt(item.amount)}</td>
                            </tr>
                          ))}
                          {/* Qty + subtotal row */}
                          <tr style={{ borderTop: "2px solid #777" }}>
                            <td style={{ border: "none" }} colSpan={4} />
                            <td style={{ ...cell, textAlign: "center", fontWeight: 700 }}>
                              {totalQty.toLocaleString("en-IN")}
                            </td>
                            <td style={{ border: "none" }} colSpan={3} />
                            <td style={{ ...cell, textAlign: "right", fontWeight: 700 }}>
                              ₹{fmtAmt(invoice.sub_total)}
                            </td>
                          </tr>
                          {/* Total row */}
                          <tr style={{ borderTop: Bs }}>
                            <td style={{ border: "none" }} colSpan={2} />
                            <td style={{ ...cell, border: "none", fontStyle: "italic", fontWeight: 700, textAlign: "right" }} colSpan={6}>
                              Total
                            </td>
                            <td style={{ ...cell, textAlign: "right", fontWeight: 700 }}>
                              ₹{fmtAmt(invoice.grand_total)}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Amount in words */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: B, padding: "5px 10px" }}>
                        <div>
                          <div style={{ fontSize: 11 }}>Amount Chargeable (in words)</div>
                          <div style={{ fontWeight: 700, fontStyle: "italic", marginTop: 2 }}>
                            {amountInWords(invoice.grand_total)}
                          </div>
                        </div>
                        <div style={{ fontSize: 11 }}>E. &amp; O.E</div>
                      </div>

                      {/* HSN / Taxable value summary */}
                      <table style={{ width: "100%", borderCollapse: "collapse", borderBottom: B }}>
                        <thead>
                          <tr>
                            <th style={{ ...hCell, width: "60%" }}>HSN/SAC</th>
                            <th style={{ ...hCell, textAlign: "right" }}>Taxable Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ ...cell }}></td>
                            <td style={{ ...cell, textAlign: "right" }}>{fmtAmt(invoice.sub_total)}</td>
                          </tr>
                          <tr style={{ borderTop: B }}>
                            <td style={{ ...cell, fontWeight: 700 }}>Total</td>
                            <td style={{ ...cell, textAlign: "right", fontWeight: 700 }}>{fmtAmt(invoice.sub_total)}</td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Tax words + Totals breakdown */}
                      <div style={{ display: "flex", borderBottom: B }}>
                        <div style={{ flex: 1, padding: "8px 12px", borderRight: B }}>
                          <div style={{ fontSize: 11 }}>
                            Tax Amount (in words):{" "}
                            <strong>
                              {parseFloat(invoice.tax_amount ?? "0") !== 0
                                ? amountInWords(invoice.tax_amount ?? "0")
                                : "Nil"}
                            </strong>
                          </div>
                          {invoice.customer_notes && (
                            <div style={{ marginTop: 6 }}>
                              <div style={{ fontWeight: 700, fontSize: 11 }}>Notes</div>
                              <div>{invoice.customer_notes}</div>
                            </div>
                          )}
                          {invoice.terms_conditions && (
                            <div style={{ marginTop: 6 }}>
                              <div style={{ fontWeight: 700, textDecoration: "underline", fontSize: 11 }}>Declaration:</div>
                              <div style={{ fontSize: 11 }}>{invoice.terms_conditions}</div>
                            </div>
                          )}
                        </div>
                        {/* Totals breakdown */}
                        <div style={{ width: 260, padding: "8px 12px", fontSize: 12 }}>
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <tbody>
                              <tr>
                                <td style={{ padding: "2px 0" }}>Sub Total</td>
                                <td style={{ padding: "2px 0", textAlign: "right" }}>{fmtAmt(invoice.sub_total)}</td>
                              </tr>
                              {parseFloat(invoice.discount_amount ?? "0") > 0 && (
                                <tr>
                                  <td style={{ padding: "2px 0" }}>Discount</td>
                                  <td style={{ padding: "2px 0", textAlign: "right", color: "#16a34a" }}>(-) {fmtAmt(invoice.discount_amount)}</td>
                                </tr>
                              )}
                              {parseFloat(invoice.tax_amount ?? "0") !== 0 && (
                                <tr>
                                  <td style={{ padding: "2px 0" }}>Tax</td>
                                  <td style={{ padding: "2px 0", textAlign: "right" }}>{fmtAmt(invoice.tax_amount)}</td>
                                </tr>
                              )}
                              {(invoice.charges_json ?? []).map((c, i) => (
                                <tr key={i}>
                                  <td style={{ padding: "2px 0" }}>{c.label}</td>
                                  <td style={{ padding: "2px 0", textAlign: "right" }}>{fmtAmt(String(c.amount))}</td>
                                </tr>
                              ))}
                              <tr style={{ borderTop: B }}>
                                <td style={{ padding: "4px 0", fontWeight: 700 }}>Total</td>
                                <td style={{ padding: "4px 0", textAlign: "right", fontWeight: 700 }}>₹{fmtAmt(invoice.grand_total)}</td>
                              </tr>
                              {parseFloat(invoice.total_paid) > 0 && (
                                <tr>
                                  <td style={{ padding: "2px 0" }}>Payment Made</td>
                                  <td style={{ padding: "2px 0", textAlign: "right", color: "#dc2626" }}>(-) {fmtAmt(invoice.total_paid)}</td>
                                </tr>
                              )}
                              {parseFloat(invoice.balance_amount) > 0 && (
                                <tr style={{ borderTop: B }}>
                                  <td style={{ padding: "4px 0", fontWeight: 700 }}>Balance Due</td>
                                  <td style={{ padding: "4px 0", textAlign: "right", fontWeight: 700 }}>₹{fmtAmt(invoice.balance_amount)}</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Signature row */}
                      <div style={{ display: "flex", borderBottom: B, minHeight: 64 }}>
                        <div style={{ flex: 1, padding: "8px 12px", borderRight: B }}>
                          <div style={{ fontSize: 11, color: "#555" }}>Customer's Seal and Signature</div>
                        </div>
                        <div style={{ width: 260, padding: "8px 12px", textAlign: "right" }}>
                          <div style={{ fontSize: 12 }}>for {invoice.location?.name ?? ""}</div>
                          <div style={{ marginTop: 36, fontSize: 11, color: "#555" }}>Authorised Signatory</div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div style={{ textAlign: "center", fontSize: 11, fontStyle: "italic", padding: "4px 0" }}>
                        This is a Computer Generated Invoice
                      </div>

                    </div>
                    );
                  })()}

                  {/* Last updated footer */}
                  <div className="d-inline-flex align-items-center gap-2 mt-4 px-3 py-2 rounded"
                    style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}>
                    <i className="ti ti-clock text-muted fs-14" />
                    <span className="fs-14 text-muted">
                      Last updated on{" "}
                      <span className="fw-semibold" style={{ color: "#495057" }}>
                        {new Date(invoice.updated_at ?? invoice.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                        {", "}
                        {new Date(invoice.updated_at ?? invoice.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                      </span>
                    </span>
                  </div>

                </div>
                );
              })()}

              {/* ── Tab: Payments ── */}
              {activeTab === "payments" && (() => {
                const payments      = invoice.payments ?? [];
                const balance       = parseFloat(invoice.balance_amount ?? "0");
                const creditApplied = parseFloat(invoice.credit_applied ?? "0");
                const MODE_LABEL: Record<string, string> = {
                  cash: "Cash", upi: "UPI", bank_transfer: "Bank Transfer",
                  cheque: "Cheque", credit_card: "Card / POS", advance_payment: "Advance Payment",
                };
                const fmtAmt = (v: string) =>
                  `₹${parseFloat(v).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

                // ── Advance-customer logic ───────────────────────────────────
                const catId = invoice.customer?.distribution_category_id;
                const isAdvanceCustomer = !!(
                  invoiceSettings?.advanced_payment_enabled &&
                  catId &&
                  (invoiceSettings?.advanced_payment_categories ?? []).map(Number).includes(Number(catId))
                );
                const chargesTotal      = parseFloat(invoice.total_charges ?? "0");
                const directPaymentsSum = payments
                  .filter(p => p.payment_mode !== "advance_payment")
                  .reduce((s, p) => s + parseFloat(p.pivot?.applied_amount ?? p.amount), 0);
                const canRecordMore  = isAdvanceCustomer
                  ? Math.max(0, chargesTotal - directPaymentsSum)
                  : balance;
                const productBalance = isAdvanceCustomer
                  ? Math.max(0, balance - canRecordMore)
                  : 0;

                const showRecordPayment  = !invoice.deleted_at && canRecordMore > 0.005;
                const showApplyAdvance   = !invoice.deleted_at && advanceBalance > 0 &&
                  (isAdvanceCustomer ? productBalance > 0.005 : balance > 0.005);
                const showAdvanceNeeded  = !invoice.deleted_at && isAdvanceCustomer
                  && canRecordMore <= 0.005 && balance > 0.005 && advanceBalance <= 0;
                const availCreditTotal   = availableCreditsRows.reduce((s, r) => s + r.credits_available, 0);
                const availCreditNote   = availableCreditsRows.filter(r => r.type === "credit_note").reduce((s, r) => s + r.credits_available, 0);
                const availExcess       = availableCreditsRows.filter(r => r.type === "excess_payment").reduce((s, r) => s + r.credits_available, 0);
                // For advance customers, credits can only offset extra charges (not product cost)
                const creditsCap        = isAdvanceCustomer ? canRecordMore : balance;
                const showApplyCredit   = !invoice.deleted_at && invoice.status !== "void"
                  && availCreditTotal > 0.005
                  && (isAdvanceCustomer ? canRecordMore > 0.005 : balance > 0.005);
                // ────────────────────────────────────────────────────────────

                return (
                  <div>
                    {/* Action bar */}
                    {!invoice.deleted_at && invoice.status !== "void" && balance > 0 && (
                      <div className="mb-4">

                        {isAdvanceCustomer ? (
                          <>
                            {/* ── Payment breakdown card ── */}
                            <div className="mb-3" style={{ border: "1px solid #dee2e6", borderRadius: 8, overflow: "hidden" }}>
                              {/* Summary bar — matches Recorded Payments header */}
                              <div style={{ background: "#fff0f2", padding: "12px 16px", borderBottom: "1px solid #dee2e6" }}>
                                <div className="d-flex align-items-center gap-2 mb-1">
                                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E41F07", display: "inline-block", flexShrink: 0 }} />
                                  <span className="fw-semibold fs-14">Payment Breakdown</span>
                                </div>
                                <p className="text-muted fs-13 mb-0">
                                  Total outstanding: <strong>{fmtAmt(invoice.balance_amount)}</strong>
                                </p>
                              </div>

                              {/* Breakdown table */}
                              <div style={{ overflowX: "auto" }}>
                              <table className="table mb-0" style={{ width: "100%", minWidth: 420 }}>
                                <thead>
                                  <tr>
                                    {["Type", "Amount", "Status"].map((h, i) => (
                                      <th key={i}
                                        className={`text-uppercase fs-12 fw-semibold text-muted${i > 0 ? " text-end" : ""}`}
                                        style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6" }}>
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {/* Extra charges row */}
                                  <tr style={{ borderBottom: "1px solid #f5f5f5" }}>
                                    <td className="fs-14" style={{ padding: "12px 16px" }}>
                                      Extra charges
                                      <span className="text-muted fs-12 ms-1">(courier, shipping etc.)</span>
                                    </td>
                                    <td className="fs-14 fw-semibold text-end" style={{ padding: "12px 16px" }}>
                                      ₹{chargesTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="text-end" style={{ padding: "12px 16px" }}>
                                      {chargesTotal <= 0 ? (
                                        <span className="badge badge-soft-secondary fs-11">No charges</span>
                                      ) : directPaymentsSum >= chargesTotal ? (
                                        <span className="badge badge-soft-success fs-11">Collected</span>
                                      ) : directPaymentsSum > 0 ? (
                                        <span className="badge badge-soft-warning fs-11">Partial</span>
                                      ) : (
                                        <span className="badge badge-soft-danger fs-11">Pending</span>
                                      )}
                                    </td>
                                  </tr>
                                  {/* Product cost row */}
                                  <tr>
                                    <td className="fs-14" style={{ padding: "12px 16px" }}>Product cost</td>
                                    <td className="fs-14 fw-semibold text-end" style={{ padding: "12px 16px" }}>
                                      ₹{(parseFloat(invoice.grand_total) - chargesTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="text-end" style={{ padding: "12px 16px" }}>
                                      {productBalance <= 0 ? (
                                        <span className="badge badge-soft-success fs-11">Settled</span>
                                      ) : (
                                        <span className="badge badge-soft-warning fs-11">Via advance</span>
                                      )}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              </div>
                            </div>

                            {/* ── No advance balance warning ── */}
                            {showAdvanceNeeded && (
                              <div className="rounded p-3 mt-3" style={{ background: "#fff8f0", border: "1px solid #ffe0b2" }}>
                                <span className="text-warning me-2"><i className="ti ti-alert-triangle" /></span>
                                ₹{productBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })} product cost is pending. No advance balance available — go to <strong>New Payment</strong> and record an advance payment for this customer first.
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-muted fs-14 mb-0">
                            Record and track all payments received for this invoice.{" "}
                            <strong>{fmtAmt(invoice.balance_amount)}</strong> is currently outstanding.
                          </p>
                        )}

                        {/* ── Credits Available ── */}
                        {showApplyCredit && (
                          <div style={{ background: "#fff0f2", padding: "12px 16px", borderRadius: 8, border: "1px solid #dee2e6", marginBottom: 16, marginTop: 16 }}>
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E41F07", display: "inline-block", flexShrink: 0 }} />
                              <span className="fw-semibold fs-14">Credits Available</span>
                              {isAdvanceCustomer && (
                                <span className="fs-12 text-muted ms-1">· Applicable to extra charges only</span>
                              )}
                            </div>
                            <p className="text-muted fs-13 mb-0">
                              <strong style={{ color: "#111827" }}>₹{availCreditTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
                              {availCreditNote > 0.005 && availExcess > 0.005 && (
                                <span className="ms-1">
                                  (₹{availCreditNote.toLocaleString("en-IN", { minimumFractionDigits: 2 })} credit notes &nbsp;+&nbsp; ₹{availExcess.toLocaleString("en-IN", { minimumFractionDigits: 2 })} excess payments)
                                </span>
                              )}
                              {availCreditNote > 0.005 && availExcess <= 0.005 && <span className="ms-1">from credit notes</span>}
                              {availExcess > 0.005 && availCreditNote <= 0.005 && <span className="ms-1">from excess payments</span>}
                              {isAdvanceCustomer && (
                                <span className="ms-1 text-muted">
                                  · up to <strong>₹{canRecordMore.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong> charges remaining
                                </span>
                              )}
                              &nbsp;·&nbsp;
                              <button
                                type="button"
                                className="btn btn-link p-0 fs-13 fw-semibold ms-1"
                                style={{ color: "#E41F07", verticalAlign: "baseline" }}
                                onClick={() => {
                                  const initial: Record<string, string> = {};
                                  let rem = creditsCap;
                                  for (const row of availableCreditsRows) {
                                    const key = `${row.type}_${row.id}`;
                                    const apply = Math.min(row.credits_available, rem);
                                    initial[key] = "";
                                    rem = Math.max(0, rem - apply);
                                  }
                                  setApplyAmounts(initial);
                                  setShowCreditModal(true);
                                }}
                              >
                                Apply Now
                              </button>
                            </p>
                          </div>
                        )}

                        {/* ── Action buttons ── */}
                        {(showRecordPayment || showApplyAdvance) && (
                          <div className="d-flex align-items-center gap-2 flex-wrap mt-3">
                            {showRecordPayment && (
                              <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => {
                                  const effectiveMax = parseFloat(Math.min(canRecordMore, balance).toFixed(2));
                                  const suggested = advanceBalance > 0
                                    ? Math.min(Math.max(0, balance - advanceBalance), effectiveMax)
                                    : effectiveMax;
                                  navigate(`/invoices/${invoice.id}/payment`, {
                                    state: {
                                      suggestedAmount: parseFloat(suggested.toFixed(2)),
                                      maxAmount: isAdvanceCustomer ? effectiveMax : undefined,
                                    },
                                  });
                                }}
                              >
                                <i className="ti ti-plus me-1" />
                                {isAdvanceCustomer ? "Record Extra Charges" : "Record Payment"}
                              </button>
                            )}

                            {showApplyAdvance && (
                              <div className="d-flex align-items-center gap-2">
                                <button
                                  type="button"
                                  className="btn btn-danger"
                                  onClick={() => {
                                    const applyAmt = isAdvanceCustomer
                                      ? Math.min(advanceBalance, productBalance > 0 ? productBalance : balance)
                                      : Math.min(advanceBalance, balance);
                                    setAdvanceAmt(applyAmt.toFixed(2));
                                    setShowAdvanceModal(true);
                                  }}
                                >
                                  <i className="ti ti-wallet me-1" />
                                  Apply Advance
                                </button>
                                <span className="text-muted fs-13">
                                  <span className="fw-semibold text-success">
                                    ₹{advanceBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                  </span>
                                  {" "}available
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Apply Available Credits Modal */}
                    {showCreditModal && (() => {
                      const amountToCredit = availableCreditsRows.reduce((sum, row) => {
                        const n = parseFloat(applyAmounts[`${row.type}_${row.id}`] ?? "");
                        return sum + (isNaN(n) || n < 0 ? 0 : n);
                      }, 0);
                      const invoiceBalanceDue = Math.max(0, creditsCap - amountToCredit);
                      return (
                        <div
                          style={{ position: "fixed", inset: 0, zIndex: 1060, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}
                          onClick={e => { if (e.target === e.currentTarget && !applyingCredit) setShowCreditModal(false); }}
                        >
                          <div style={{ background: "#fff", borderRadius: 14, width: 860, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "88vh" }}>
                            {/* Header */}
                            <div style={{ padding: "24px 28px 22px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "flex-start", gap: 14, flexShrink: 0 }}>
                              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <i className="ti ti-coin" style={{ fontSize: 22, color: "#ef4444" }} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 18, color: "#0f172a" }}>Apply Credits</p>
                                <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>
                                  {invoice.invoice_number} · {availableCreditsRows.length} credit{availableCreditsRows.length !== 1 ? "s" : ""} available
                                  {isAdvanceCustomer && <span className="ms-2 fs-12 text-muted">· Applicable to extra charges only</span>}
                                </p>
                              </div>
                              <button type="button" onClick={() => setShowCreditModal(false)} disabled={applyingCredit}
                                style={{ width: 34, height: 34, borderRadius: "50%", border: "1.5px solid #fecaca", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}>
                                <i className="ti ti-x" style={{ fontSize: 15, color: "#ef4444", lineHeight: 1 }} />
                              </button>
                            </div>

                            {/* Body — same bordered card as Cash Payments Received */}
                            <div style={{ overflowY: "auto", flex: 1, padding: "16px 24px" }}>
                              <div style={{ border: "1px solid #dee2e6", borderRadius: 8, overflow: "hidden" }}>
                                {/* Summary bar */}
                                <div style={{ background: "#fff0f2", padding: "12px 16px", borderBottom: "1px solid #dee2e6" }}>
                                  <div className="d-flex align-items-center gap-2 mb-1">
                                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E41F07", display: "inline-block", flexShrink: 0 }} />
                                    <span className="fw-semibold fs-14">{availableCreditsRows.length} credit{availableCreditsRows.length !== 1 ? "s" : ""} available</span>
                                  </div>
                                  <p className="text-muted fs-13 mb-0">
                                    Total available: <strong>₹{availCreditTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
                                    {isAdvanceCustomer
                                      ? <> &nbsp;·&nbsp; Charges remaining: <strong>₹{canRecordMore.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></>
                                      : balance > 0 && <> &nbsp;·&nbsp; Balance due: <strong>{fmtAmt(invoice.balance_amount)}</strong></>
                                    }
                                  </p>
                                </div>
                                {/* Table */}
                                <div style={{ overflowX: "auto" }}>
                                <table className="table mb-0" style={{ width: "100%", minWidth: 620 }}>
                                  <thead>
                                    <tr>
                                      {(["Transaction #", "Date", "Location", "Credit Amount", "Available", "Credits to Apply"] as const).map((h, i) => (
                                        <th key={h}
                                          className={`text-uppercase fs-12 fw-semibold text-muted${i >= 3 ? " text-end" : ""}`}
                                          style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", whiteSpace: "nowrap" }}>
                                          {h}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {availableCreditsRows.map((row) => {
                                      const key = `${row.type}_${row.id}`;
                                      const val = applyAmounts[key] ?? "";
                                      return (
                                        <tr key={key} style={{ borderBottom: "1px solid #f5f5f5" }}>
                                          <td className="fs-14 fw-medium" style={{ padding: "12px 16px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                              <span style={{ width: 7, height: 7, borderRadius: "50%", background: row.type === "credit_note" ? "#8b5cf6" : "#3b82f6", display: "inline-block", flexShrink: 0 }} />
                                              {row.transaction_number}
                                            </div>
                                            <div className="fs-12 text-muted" style={{ marginTop: 2, paddingLeft: 14 }}>
                                              {row.type === "credit_note" ? "Credit Note" : "Excess Payment"}
                                            </div>
                                          </td>
                                          <td className="fs-14" style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                                            {row.transaction_date ? formatDate(row.transaction_date) : "—"}
                                          </td>
                                          <td className="fs-14" style={{ padding: "12px 16px" }}>
                                            {row.location ?? "—"}
                                          </td>
                                          <td className="fs-14 text-end" style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                                            ₹{row.credit_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                          </td>
                                          <td className="fs-14 fw-semibold text-end" style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                                            ₹{row.credits_available.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                          </td>
                                          <td style={{ padding: "8px 16px", textAlign: "right" }}>
                                            <input
                                              type="number"
                                              className="form-control"
                                              style={{ width: 130, textAlign: "right", display: "inline-block", padding: "6px 10px" }}
                                              placeholder="0"
                                              min="0"
                                              step="0.01"
                                              max={row.credits_available.toFixed(2)}
                                              value={val}
                                              onChange={e => {
                                                const raw = e.target.value;
                                                if (raw === "" || raw === "-") { setApplyAmounts(prev => ({ ...prev, [key]: raw })); return; }
                                                const n = parseFloat(raw);
                                                if (isNaN(n)) return;
                                                const othersTotal = availableCreditsRows.reduce((sum, r) => {
                                                  if (`${r.type}_${r.id}` === key) return sum;
                                                  return sum + (parseFloat(applyAmounts[`${r.type}_${r.id}`] ?? "") || 0);
                                                }, 0);
                                                const maxAllowed = Math.min(row.credits_available, Math.max(0, creditsCap - othersTotal));
                                                if (n > maxAllowed) return;
                                                setApplyAmounts(prev => ({ ...prev, [key]: raw }));
                                              }}
                                            />
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                                </div>
                              </div>

                              {/* Summary box — inside body */}
                              <div className="border rounded p-3 mt-3" style={{ background: "#fafafa" }}>
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                  <span className="fs-14 fw-medium">Amount to Credit</span>
                                  <span className="fs-14 fw-medium">₹{amountToCredit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="border-top pt-2">
                                  <div className="d-flex align-items-center justify-content-between">
                                    <span className="fs-15 fw-semibold">{isAdvanceCustomer ? "Charges Due After Credits" : "Invoice Balance Due"}</span>
                                    <span className="fs-15 fw-bold" style={{ color: invoiceBalanceDue <= 0.005 ? "#16a34a" : "inherit" }}>
                                      ₹{invoiceBalanceDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Footer — buttons only */}
                            <div
                              className="bg-white border-top d-flex align-items-center gap-2"
                              style={{ padding: "16px 24px", flexShrink: 0 }}
                            >
                              <button
                                className="btn btn-danger"
                                disabled={applyingCredit || amountToCredit <= 0.005}
                                onClick={async () => {
                                  const credits = availableCreditsRows
                                    .map(row => ({ type: row.type, id: row.id, amount: parseFloat(applyAmounts[`${row.type}_${row.id}`] ?? "0") || 0 }))
                                    .filter(c => c.amount > 0.005);
                                  if (credits.length === 0) return;
                                  if (amountToCredit > creditsCap + 0.005) {
                                    showToast("danger", isAdvanceCustomer
                                      ? "Total credits to apply cannot exceed the extra charges remaining."
                                      : "Total credits to apply cannot exceed invoice balance.");
                                    return;
                                  }
                                  setApplyingCredit(true);
                                  try {
                                    const res = await applyAvailableCredits(invoice.id, credits);
                                    if (res.success) {
                                      setShowCreditModal(false);
                                      showToast("success", `₹${amountToCredit.toLocaleString("en-IN", { minimumFractionDigits: 2 })} credits applied successfully.`);
                                      creditBalanceFetchedFor.current = null;
                                      if (invoice.customer?.id) {
                                        fetchAvailableCreditsBalance(invoice.customer.id).then((r) => {
                                          if (r.success) setAvailableCreditsRows(r.data.rows ?? []);
                                        });
                                      }
                                      if (res.data) setInvoice(res.data as unknown as InvoiceDetail);
                                    } else {
                                      showToast("danger", res.message ?? "Failed to apply credits.");
                                    }
                                  } catch {
                                    showToast("danger", "Network error. Please try again.");
                                  } finally {
                                    setApplyingCredit(false);
                                  }
                                }}
                              >
                                {applyingCredit ? <><span className="spinner-border spinner-border-sm me-1" />Applying…</> : "Apply Credits"}
                              </button>
                              <button className="btn btn-outline-light" disabled={applyingCredit} onClick={() => setShowCreditModal(false)}>Cancel</button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Apply Advance Modal */}
                    {showAdvanceModal && (
                      <div
                        style={{ position: "fixed", inset: 0, zIndex: 1060, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}
                        onClick={e => { if (e.target === e.currentTarget && !applyingAdvance) setShowAdvanceModal(false); }}
                      >
                        <div style={{ background: "#fff", borderRadius: 14, width: 480, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                          {/* Header */}
                          <div style={{ padding: "20px 24px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "flex-start", gap: 12 }}>
                            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <i className="ti ti-wallet fs-18" style={{ color: "#ef4444" }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 16, color: "#0f172a" }}>Apply Advance Balance</p>
                              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                                ₹{advanceBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })} available · Invoice due {fmtAmt(invoice.balance_amount)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowAdvanceModal(false)}
                              disabled={applyingAdvance}
                              style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #fecaca", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}
                            >
                              <i className="ti ti-x" style={{ fontSize: 14, color: "#ef4444", lineHeight: 1 }} />
                            </button>
                          </div>

                          {/* Body */}
                          <div style={{ padding: "20px 24px" }}>
                            <label className="form-label">
                              Amount to Apply <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                              <span className="input-group-text">INR</span>
                              <input
                                type="number"
                                className="form-control"
                                placeholder="0.00"
                                min="0.01"
                                step="0.01"
                                max={Math.min(advanceBalance, isAdvanceCustomer ? productBalance : balance).toFixed(2)}
                                value={advanceAmt}
                                onChange={(e) => setAdvanceAmt(e.target.value)}
                                autoFocus
                              />
                            </div>
                            <small className="text-muted">
                              Maximum: ₹{Math.min(advanceBalance, isAdvanceCustomer ? productBalance : balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </small>
                          </div>

                          {/* Footer */}
                          <div style={{ padding: "16px 24px 22px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
                            <button
                              className="btn btn-danger me-2"
                              disabled={applyingAdvance || !advanceAmt || parseFloat(advanceAmt) <= 0}
                              onClick={async () => {
                                const amt = parseFloat(advanceAmt);
                                if (isNaN(amt) || amt <= 0) return;
                                const max = Math.min(advanceBalance, isAdvanceCustomer ? productBalance : balance);
                                if (amt > max + 0.005) return;
                                setApplyingAdvance(true);
                                try {
                                  const res = await applyAdvanceToInvoice(invoice.id, amt);
                                  if (res.success) {
                                    setShowAdvanceModal(false);
                                    showToast("success", `₹${amt.toLocaleString("en-IN", { minimumFractionDigits: 2 })} advance balance applied.`);
                                    const numId = Number(id);
                                    if (!isNaN(numId)) {
                                      bustInvoice(numId);
                                      emitMutation("invoices:mutated");
                                      advanceBalanceFetchedFor.current = null;
                                      getInvoiceDetail(numId).then((detail) => {
                                        setInvoice(detail);
                                        if (detail.customer?.id) {
                                          fetchAdvanceBalance(detail.customer.id).then((r) => {
                                            if (r.success) setAdvanceBalance(r.data.balance);
                                          }).catch(() => {});
                                        }
                                      }).catch(() => {});
                                    }
                                  } else {
                                    showToast("danger", (res as any).message ?? "Failed to apply advance balance.");
                                  }
                                } catch {
                                  showToast("danger", "Network error. Please try again.");
                                } finally {
                                  setApplyingAdvance(false);
                                }
                              }}
                            >
                              {applyingAdvance
                                ? <><span className="spinner-border spinner-border-sm me-1" />Applying…</>
                                : "Apply Balance"}
                            </button>
                            <button className="btn btn-outline-light" onClick={() => setShowAdvanceModal(false)} disabled={applyingAdvance}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payments content */}
                    {payments.length === 0 && creditApplied <= 0.005 && (
                      balance <= 0 ? (
                        <div className="text-center py-5 text-muted">
                          <i className="ti ti-circle-check fs-36 d-block mb-2" style={{ color: "#22c55e" }} />
                          <p className="fs-14 mb-0" style={{ color: "#16a34a" }}>This invoice is fully paid.</p>
                        </div>
                      ) : (
                        <div className="text-center py-5 text-muted">
                          <i className="ti ti-receipt-off fs-36 d-block mb-2" />
                          <p className="fs-14 mb-0">No payments recorded yet.</p>
                        </div>
                      )
                    )}

                    {/* ── Payments & Credits ── */}
                    {(payments.length > 0 || creditApplied > 0.005) && (
                      <div className="mt-4">
                        <h6 className="fw-semibold fs-15 mb-3">Cash Payments Received</h6>
                        <div style={{ border: "1px solid #dee2e6", borderRadius: 8, overflow: "hidden" }}>
                          <div style={{ background: "#fff0f2", padding: "12px 16px", borderBottom: "1px solid #dee2e6" }}>
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E41F07", display: "inline-block", flexShrink: 0 }} />
                              <span className="fw-semibold fs-14">
                                {payments.length} payment{payments.length !== 1 ? "s" : ""}
                                {creditApplied > 0.005 && <> &nbsp;·&nbsp; <span style={{ color: "#E41F07" }}>₹{parseFloat(invoice.credit_applied ?? "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })} credits applied</span></>}
                              </span>
                            </div>
                            <p className="text-muted fs-13 mb-0">
                              Cash received: <strong>{fmtAmt(invoice.total_paid)}</strong>
                              {balance > 0 && <> &nbsp;·&nbsp; Balance due: <strong>{fmtAmt(invoice.balance_amount)}</strong></>}
                            </p>
                          </div>
                          <div style={{ overflowX: "auto" }}>
                          <table className="table mb-0" style={{ width: "100%", minWidth: 480 }}>
                            <thead>
                              <tr>
                                {["Payment #", "Date", "Mode", "Amount", ""].map((h, i) => (
                                  <th key={i}
                                    className={`text-uppercase fs-12 fw-semibold text-muted${i === 2 || i === 3 ? " text-end" : ""}`}
                                    style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", width: i === 4 ? 60 : undefined }}>
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {payments.map((p) => (
                                <tr key={p.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                                  <td className="fs-14 fw-medium" style={{ padding: "12px 16px" }}>{p.payment_number}</td>
                                  <td className="fs-14" style={{ padding: "12px 16px" }}>{formatDate(p.payment_date)}</td>
                                  <td className="fs-14 text-end" style={{ padding: "12px 16px" }}>{MODE_LABEL[p.payment_mode] ?? p.payment_mode}</td>
                                  <td className="fs-14 fw-semibold text-end" style={{ padding: "12px 16px" }}>{fmtAmt(p.pivot?.applied_amount ?? p.amount)}</td>
                                  <td style={{ padding: "8px 16px", textAlign: "right" }}>
                                    <button
                                      type="button"
                                      className="btn btn-link p-0 text-danger"
                                      title={p.source === "invoice_record" ? "Delete payment" : "Remove from invoice"}
                                      style={{ textDecoration: "none" }}
                                      onClick={() => {
                                        const isInvoiceRecord = p.source === "invoice_record";
                                        setConfirmConfig({
                                          icon: "ti-trash",
                                          iconColor: "#e03131",
                                          iconBg: "#fff0f0",
                                          title: isInvoiceRecord ? "Delete Payment?" : "Remove from Invoice?",
                                          message: isInvoiceRecord
                                            ? `"${p.payment_number}" will be permanently deleted and the invoice balance will be updated.`
                                            : `"${p.payment_number}" will be unapplied from this invoice. The payment will remain in the payments table.`,
                                          confirmLabel: isInvoiceRecord ? "Delete" : "Remove",
                                          confirmColor: "#e03131",
                                          onConfirm: async () => {
                                            const numId = Number(id);
                                            if (isNaN(numId)) return;
                                            const res = isInvoiceRecord
                                              ? await deletePayment(p.id)
                                              : await unapplyPaymentFromInvoice(p.id, numId);
                                            if (!res.success) { showToast("danger", (res as any).message ?? "Failed."); return; }
                                            showToast("success", isInvoiceRecord ? "Payment deleted." : "Payment removed from invoice.");
                                            bustInvoice(numId);
                                            emitMutation("invoices:mutated");
                                            getInvoiceDetail(numId).then((detail) => setInvoice(detail)).catch(() => {});
                                          },
                                        });
                                      }}
                                    >
                                      <i className="ti ti-trash fs-16" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              {creditApplied > 0.005 && (
                                <tr style={{ borderBottom: "1px solid #f5f5f5", background: "#fff0f2" }}>
                                  <td className="fs-14 fw-medium" style={{ padding: "12px 16px", color: "#E41F07" }}>Credit Note Adjustment</td>
                                  <td className="fs-14" style={{ padding: "12px 16px" }}>—</td>
                                  <td className="fs-14 text-end" style={{ padding: "12px 16px", color: "#E41F07" }}>Credit Note</td>
                                  <td className="fs-14 fw-semibold text-end" style={{ padding: "12px 16px", color: "#E41F07" }}>{fmtAmt(invoice.credit_applied)}</td>
                                  <td style={{ padding: "8px 16px", textAlign: "right" }}>
                                    <button
                                      type="button"
                                      className="btn btn-link p-0 text-danger"
                                      title="Remove credit adjustment"
                                      style={{ textDecoration: "none" }}
                                      onClick={() => setConfirmConfig({
                                        icon: "ti-trash",
                                        iconColor: "#e03131",
                                        iconBg: "#fff0f0",
                                        title: "Remove Credit Adjustment?",
                                        message: "All applied credits will be removed and the invoice balance will be updated.",
                                        confirmLabel: "Remove",
                                        confirmColor: "#e03131",
                                        onConfirm: async () => {
                                          const numId = Number(id);
                                          if (isNaN(numId)) return;
                                          const res = await removeInvoiceCreditApplications(numId);
                                          if (!res.success) { showToast("danger", (res as any).message ?? "Failed to remove credits."); return; }
                                          showToast("success", "Credit adjustment removed.");
                                          bustInvoice(numId);
                                          emitMutation("invoices:mutated");
                                          getInvoiceDetail(numId).then((detail) => {
                                            setInvoice(detail);
                                            const cid = detail?.customer?.id;
                                            if (cid) {
                                              fetchAvailableCreditsBalance(cid).then((r) => {
                                                if (r.success) setAvailableCreditsRows(r.data.rows ?? []);
                                              });
                                            }
                                          }).catch(() => {});
                                        },
                                      })}
                                    >
                                      <i className="ti ti-trash fs-16" />
                                    </button>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                          </div>
                        </div>
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

                    // ── Config ─────────────────────────────────────────────────────────────
                    const EVENT_ICON: Record<string, string> = {
                      invoice_created:        "ti-plus",
                      invoice_updated:        "ti-pencil",
                      invoice_voided:         "ti-trash",
                      invoice_paid:           "ti-circle-check",
                      invoice_partially_paid: "ti-hourglass-half",
                      payment_applied:        "ti-cash",
                      payment_unapplied:      "ti-receipt-off",
                    };
                    const EVENT_LABEL: Record<string, string> = {
                      invoice_created:        "Invoice Created",
                      invoice_updated:        "Invoice Updated",
                      invoice_voided:         "Invoice Voided / Deleted",
                      invoice_paid:           "Invoice Fully Paid",
                      invoice_partially_paid: "Invoice Partially Paid",
                      payment_applied:        "Payment Received",
                      payment_unapplied:      "Payment Removed",
                    };
                    const PAYMENT_MODE: Record<string, string> = {
                      cash:          "Cash",
                      upi:           "UPI",
                      bank_transfer: "Bank Transfer",
                      cheque:        "Cheque",
                      card:          "Card / POS",
                      neft:          "NEFT",
                      rtgs:          "RTGS",
                      imps:          "IMPS",
                    };

                    // ── Deduplication ──────────────────────────────────────────────────────
                    // When an edit also triggers a status-change event at the same minute,
                    // keep only the status-change (more informative). Also suppress
                    // invoice_sent (it fires on creation and adds no value in this context).
                    const minuteKey = (ts: string) => ts.substring(0, 16); // "YYYY-MM-DD HH:MM"
                    const STATUS_EVENTS = new Set(["invoice_paid", "invoice_partially_paid"]);
                    const groupedByMinute: Record<string, InvoiceActivityEntry[]> = {};
                    for (const log of activityLogs) {
                      const k = minuteKey(log.created_at);
                      (groupedByMinute[k] ??= []).push(log);
                    }
                    const visibleLogs = activityLogs.filter((log) => {
                      // Always hide invoice_sent — it fires automatically and adds noise
                      if (log.event_type === "invoice_sent") return false;
                      // If this minute also has a status-change event, hide invoice_updated
                      if (log.event_type === "invoice_updated") {
                        const peers = groupedByMinute[minuteKey(log.created_at)] ?? [];
                        if (peers.some((p) => STATUS_EVENTS.has(p.event_type))) return false;
                      }
                      return true;
                    });

                    // ── Helpers ────────────────────────────────────────────────────────────
                    const fmtAmt = (v: any) => {
                      const n = parseFloat(String(v ?? ""));
                      return !isNaN(n) && n > 0
                        ? `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                        : null;
                    };
                    const parseTs = (ts: string) => {
                      const d = new Date(ts.replace(" ", "T").replace(/Z$|[+-]\d{2}:\d{2}$/, ""));
                      return {
                        dateStr: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
                        timeStr: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
                      };
                    };

                    // ── Helpers ────────────────────────────────────────────────────────────
                    const fmtRate = (v: any) => {
                      const n = parseFloat(String(v ?? ""));
                      return !isNaN(n) ? `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : null;
                    };

                    // ── Build metadata per event type ──────────────────────────────────────
                    type MetaRow = { label: string; value: string };
                    const buildMeta = (log: InvoiceActivityEntry): MetaRow[] => {
                      const m   = log.metadata ?? {};
                      const add = (rows: MetaRow[], label: string, val: string | null | undefined) => {
                        if (val != null && String(val).trim() !== "") rows.push({ label, value: String(val) });
                      };
                      const rows: MetaRow[] = [];

                      if (log.event_type === "invoice_created") {
                        add(rows, "Invoice Date",  m.invoice_date ? formatDate(m.invoice_date) : null);
                        add(rows, "Due Date",      m.due_date     ? formatDate(m.due_date)     : null);
                        add(rows, "Amount",        fmtAmt(m.grand_total));

                      } else if (log.event_type === "invoice_updated") {
                        // Items diff — show what was added, removed, or modified
                        const diff = m.items_diff as { added?: any[]; removed?: any[]; changed?: any[] } | undefined;
                        if (diff) {
                          for (const it of (diff.added ?? [])) {
                            add(rows, "Item Added", `${it.name} × ${it.qty}`);
                          }
                          for (const it of (diff.removed ?? [])) {
                            add(rows, "Item Removed", String(it.name));
                          }
                          for (const it of (diff.changed ?? [])) {
                            const parts: string[] = [];
                            if (it.changes?.qty)   parts.push(`Qty: ${it.changes.qty.from} → ${it.changes.qty.to}`);
                            if (it.changes?.price) parts.push(`Rate: ${fmtRate(it.changes.price.from)} → ${fmtRate(it.changes.price.to)}`);
                            add(rows, String(it.name), parts.join("  ·  "));
                          }
                        }
                        // Scalar field changes (date/amount)
                        for (const fc of (m.field_changes ?? []) as { field: string; from: any; to: any }[]) {
                          const isAmt = fc.field === "Amount";
                          const from  = isAmt ? fmtAmt(fc.from) : (fc.from ? formatDate(String(fc.from)) : "—");
                          const to    = isAmt ? fmtAmt(fc.to)   : (fc.to   ? formatDate(String(fc.to))   : "—");
                          add(rows, fc.field, `${from ?? "—"} → ${to}`);
                        }
                        // Fallback: no diff info (legacy logs or no actual changes detected)
                        if (!diff && !(m.field_changes as any[])?.length) {
                          add(rows, "Amount", fmtAmt(m.grand_total));
                          add(rows, "Status", m.status ? (STATUS_LABEL[m.status] ?? m.status) : null);
                        } else {
                          add(rows, "Status", m.status ? (STATUS_LABEL[m.status] ?? m.status) : null);
                        }

                      } else if (log.event_type === "invoice_voided") {
                        // Intentionally empty — the event title is self-explanatory

                      } else if (log.event_type === "invoice_paid" || log.event_type === "invoice_partially_paid") {
                        add(rows, "Amount Paid",   fmtAmt(m.total_paid));
                        add(rows, "Balance Due",   m.balance_amount != null && parseFloat(m.balance_amount) >= 0
                          ? `₹${parseFloat(m.balance_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : null);

                      } else if (log.event_type === "payment_applied") {
                        add(rows, "Payment #",     m.payment_number ?? null);
                        add(rows, "Mode",          m.payment_mode ? (PAYMENT_MODE[m.payment_mode] ?? m.payment_mode) : null);
                        add(rows, "Amount",        fmtAmt(m.applied_amount));
                        add(rows, "Reference",     m.reference_number ?? null);
                        add(rows, "Balance After", m.invoice_balance != null
                          ? `₹${parseFloat(m.invoice_balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : null);

                      } else if (log.event_type === "payment_unapplied") {
                        add(rows, "Payment #",     m.payment_number ?? null);
                        add(rows, "Mode",          m.payment_mode ? (PAYMENT_MODE[m.payment_mode] ?? m.payment_mode) : null);
                      }
                      return rows;
                    };

                    // ── Render ─────────────────────────────────────────────────────────────
                    return (
                      <div style={{ position: "relative", paddingLeft: 52 }}>
                        <div style={{ position: "absolute", left: 17, top: 0, bottom: 0, width: 2, background: "#e9ecef", zIndex: 0 }} />

                        {visibleLogs.map((log, idx) => {
                          const iconClass = EVENT_ICON[log.event_type] ?? "ti-activity";
                          const title     = EVENT_LABEL[log.event_type] ?? log.event_type.replace(/_/g, " ");
                          const actor     = log.performer?.name ?? "System";
                          const { dateStr, timeStr } = parseTs(log.created_at);
                          const metaRows  = buildMeta(log);
                          const isLast    = idx === visibleLogs.length - 1;

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
                                    <span className="fw-semibold fs-15" style={{ color: "#212529" }}>{title}</span>
                                    <div className="text-end flex-shrink-0">
                                      <div className="fs-13 fw-medium" style={{ color: "#495057" }}>{dateStr}</div>
                                      <div className="fs-12 text-muted">{timeStr}</div>
                                    </div>
                                  </div>

                                  {/* Metadata table */}
                                  {metaRows.length > 0 && (
                                    <div className="rounded mb-3 overflow-hidden" style={{ border: "1px solid #e9ecef" }}>
                                      {metaRows.map((row, ri) => (
                                        <div key={row.label}
                                          className="d-flex align-items-center gap-3"
                                          style={{
                                            padding: "8px 14px",
                                            background: ri % 2 === 0 ? "#fff" : "#fafafa",
                                            borderTop: ri > 0 ? "1px solid #f1f3f5" : "none",
                                          }}
                                        >
                                          <span className="text-muted fs-13 flex-shrink-0" style={{ width: 140 }}>{row.label}</span>
                                          <span className="fs-13 fw-medium" style={{ color: "#212529" }}>{row.value}</span>
                                        </div>
                                      ))}
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
    {/* end page-wrapper */}

    <ConfirmDialog config={confirmConfig} onClose={() => setConfirmConfig(null)} />
</>
  );
};

export default InvoiceOverview;
