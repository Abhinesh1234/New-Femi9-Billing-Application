import { createPortal } from "react-dom";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Toast } from "react-bootstrap";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import Footer from "../../../../components/footer/footer";
import CustomFieldsPanel, { type CustomFieldsPanelHandle } from "../../../../components/custom-fields/CustomFieldsPanel";
import PageHeader from "../../../../components/page-header/pageHeader";
import CommonSelect, { type Option } from "../../../../components/common-select/commonSelect";
import CommonDatePicker from "../../../../components/common-datePicker/commonDatePicker";
import { searchParties, type PartySearchResult } from "../../../../core/services/partyApi";
import { getSettings } from "../../../../core/cache/settingCache";
import { type InvoiceConfiguration } from "../../../../core/services/settingApi";
import { getLocationList, bustLocationLists } from "../../../../core/cache/locationCache";
import CustomerDrawer from "../invoices/CustomerDrawer";
import {
  fetchInvoices,
  uploadPaymentAttachment,
  type InvoiceListItem,
} from "../../../../core/services/invoiceApi";
import { emitMutation } from "../../../../core/cache/mutationEvents";
import axios from "axios";
import { PAYMENT_MODE_OPTIONS, ADVANCE_PAYMENT_OPTION } from "../../../../core/data/paymentModeOptions";
import { compressPickedFiles } from "../../../../core/utils/imageCompression";

// ── Types ──────────────────────────────────────────────────────────────────────

interface DropdownEntry {
  id:          number;
  name:        string;
  mobile?:     string | null;
  category?:   string | null;
  category_id?: number | null;
}

interface PanelRect {
  top: number; bottom: number; left: number; width: number; spaceBelow: number;
}

// ── Payment mode options ───────────────────────────────────────────────────────

const pmtModeOptions = PAYMENT_MODE_OPTIONS;

// ── Customer inline search dropdown ───────────────────────────────────────────

interface CustomerDropdownProps {
  value:    string;
  onChange: (name: string, id: number, item: DropdownEntry) => void;
}

const CustomerDropdown = ({ value, onChange }: CustomerDropdownProps) => {
  const [open, setOpen]             = useState(false);
  const [search, setSearch]         = useState("");
  const [asyncItems, setAsyncItems] = useState<DropdownEntry[]>([]);
  const [loading, setLoading]       = useState(false);
  const [panelRect, setPanelRect]   = useState<PanelRect | null>(null);

  const wrapRef     = useRef<HTMLDivElement>(null);
  const panelRef    = useRef<HTMLDivElement>(null);
  const abortRef    = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const calcRect = useCallback(() => {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    setPanelRect({ top: r.bottom, bottom: window.innerHeight - r.top, left: r.left, width: r.width, spaceBelow: window.innerHeight - r.bottom });
  }, []);

  const fetchResults = useCallback((q: string) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    searchParties(q, 20, abortRef.current.signal)
      .then((results: PartySearchResult[]) => {
        setAsyncItems(results.map((r) => ({ id: r.id, name: r.name, mobile: r.mobile, category: r.category, category_id: r.category_id })));
        setLoading(false);
      })
      .catch(() => {});
  }, []);

  const toggle = () => {
    if (!open) { calcRect(); fetchResults(""); }
    else { abortRef.current?.abort(); if (debounceRef.current) clearTimeout(debounceRef.current); }
    setOpen((o) => !o);
    setSearch("");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearch(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(q), 250);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!wrapRef.current?.contains(t) && !panelRef.current?.contains(t)) {
        abortRef.current?.abort(); setOpen(false); setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const update = () => calcRect();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update, true); window.removeEventListener("resize", update); };
  }, [open, calcRect]);

  useEffect(() => () => { abortRef.current?.abort(); if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const dropUp = panelRect ? panelRect.spaceBelow < 240 : false;
  const panelStyle: React.CSSProperties = panelRect
    ? { position: "fixed", left: panelRect.left, width: panelRect.width, zIndex: 9999, ...(dropUp ? { bottom: panelRect.bottom, top: "auto" } : { top: panelRect.top + 4, bottom: "auto" }) }
    : { display: "none" };

  const select = (item: DropdownEntry) => { onChange(item.name, item.id, item); setOpen(false); setSearch(""); abortRef.current?.abort(); };

  return (
    <div ref={wrapRef} className="position-relative">
      <div className="input-group">
        <input type="text" className="form-control" placeholder="Select Customer" value={value} readOnly style={{ cursor: "pointer" }} onClick={toggle} />
        <button type="button" className="btn btn-outline-light" onClick={toggle}>
          <i className={`ti ti-chevron-${open ? "up" : "down"}`} />
        </button>
      </div>
      {open && panelRect && createPortal(
        <div ref={panelRef} className="bg-white border rounded shadow-sm overflow-hidden" style={panelStyle}>
          <div className="p-2 border-bottom position-relative">
            <input
              autoFocus type="text" className="form-control" placeholder="Search customer…"
              style={{ height: 42, paddingRight: loading ? 36 : undefined }}
              value={search} onChange={handleSearchChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && asyncItems.length > 0) { e.preventDefault(); select(asyncItems[0]); }
                if (e.key === "Escape") { setOpen(false); setSearch(""); }
              }}
            />
            {loading && <span className="position-absolute top-50 translate-middle-y" style={{ right: 20 }}><span className="spinner-border spinner-border-sm text-secondary" role="status" /></span>}
          </div>
          <div style={{ maxHeight: 180, overflowY: "auto", paddingBottom: 8 }}>
            {loading && asyncItems.length === 0 ? null : asyncItems.length === 0 ? (
              <p className="text-muted fs-15 text-center py-3 mb-0">No results</p>
            ) : asyncItems.map((item) => {
              const isActive = item.name === value;
              return (
                <div key={item.id} className="px-3 py-2"
                  style={{ cursor: "pointer", background: isActive ? "#E41F07" : "transparent", color: isActive ? "#fff" : "#707070" }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "#E41F07"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "#707070"; }}
                  onClick={() => select(item)}>
                  <div className="fs-15 fw-medium">{item.name}</div>
                  {(item.mobile || item.category) && (
                    <div className="fs-12" style={{ color: isActive ? "rgba(255,255,255,0.75)" : "#aaa" }}>
                      {item.mobile ? `${item.mobile}${item.category ? ` (${item.category})` : ""}` : item.category}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (file: File): { icon: string; color: string } => {
  if (file.type.startsWith("image/")) return { icon: "ti-photo", color: "#3b82f6" };
  if (file.type === "application/pdf") return { icon: "ti-file-type-pdf", color: "#ef4444" };
  if (file.type.includes("word")) return { icon: "ti-file-type-doc", color: "#2563eb" };
  if (file.type.includes("sheet") || file.type.includes("excel")) return { icon: "ti-file-type-xls", color: "#16a34a" };
  return { icon: "ti-paperclip", color: "#6b7280" };
};

const SALUTATIONS = ["mr.", "mrs.", "ms.", "dr.", "prof."];
function getInitial(name: string): string {
  const lower = name.toLowerCase();
  for (const sal of SALUTATIONS) {
    if (lower.startsWith(sal + " ")) return name.charAt(sal.length + 1).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
}

const fmt = (v: string | number) => {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return isNaN(n) ? "0.00" : n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// ── Main component ─────────────────────────────────────────────────────────────

const NewPayment = () => {
  const navigate = useNavigate();

  // ── Customer ────────────────────────────────────────────────────────────────
  const [customerId, setCustomerId]         = useState<number | null>(null);
  const [customerName, setCustomerName]     = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<DropdownEntry | null>(null);
  const [drawerOpen, setDrawerOpen]         = useState(false);

  // ── Location ────────────────────────────────────────────────────────────────
  const [locationId, setLocationId]         = useState<number | null>(null);
  const [locationName, setLocationName]     = useState("");
  const [locationOptions, setLocationOptions] = useState<Option[]>([]);

  // ── Payment number ──────────────────────────────────────────────────────────
  const [pmtNumber, setPmtNumber]           = useState("");

  // ── Payment fields ──────────────────────────────────────────────────────────
  const todayISO = new Date().toISOString().split("T")[0];
  const [pmtAmount, setPmtAmount]           = useState("");
  const [pmtBankCharges, setPmtBankCharges] = useState("");
  const [pmtTaxDeducted, setPmtTaxDeducted] = useState(false);
  const [pmtDate, setPmtDate]               = useState(todayISO);
  const [pmtMode, setPmtMode]               = useState("cash");
  const [pmtRef, setPmtRef]                 = useState("");
  const [pmtNotes, setPmtNotes]             = useState("");
  const [attachments, setAttachments]       = useState<File[]>([]);
  const attachFileRef                       = useRef<HTMLInputElement>(null);
  const cfPanelRef                          = useRef<CustomFieldsPanelHandle>(null);

  // ── Unpaid invoices ─────────────────────────────────────────────────────────
  const [invoices, setInvoices]             = useState<InvoiceListItem[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [paymentAmounts, setPaymentAmounts] = useState<Record<number, string>>({});
  const [receivedFull, setReceivedFull]     = useState(false);

  // ── Invoice settings (for advance payment gate) ─────────────────────────────
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceConfiguration | null>(null);

  // ── Save / error state ──────────────────────────────────────────────────────
  const [saving, setSaving]                 = useState(false);
  const [errors, setErrors]                 = useState<Record<string, string>>({});
  const [drafterOpen, setDrafterOpen]       = useState(false);

  // ── Toast ───────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger"; message: string }>({ show: false, type: "success", message: "" });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (type: "success" | "danger", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // ── Close drafter dropdown on outside click ──────────────────────────────
  useEffect(() => {
    if (!drafterOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Element;
      if (!t.closest(".drafter-group")) setDrafterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [drafterOpen]);

  const handleRefresh = useCallback(async () => {
    bustLocationLists();
    const locs = await getLocationList().catch(() => []);
    const active = locs.filter((l) => l.is_active);
    setLocationOptions(active.map((l) => ({ value: String(l.id), label: l.name })));
  }, []);

  const clrErr = (key: string) => setErrors((p) => { const n = { ...p }; delete n[key]; return n; });

  // ── Load invoice settings (advance payment gate) ───────────────────────────
  useEffect(() => {
    getSettings("invoices").then((s) => setInvoiceSettings(s as InvoiceConfiguration)).catch(() => {});
  }, []);

  // ── Load locations ──────────────────────────────────────────────────────────
  useEffect(() => {
    getLocationList().then((locs) => {
      const active = locs.filter((l) => l.is_active);
      setLocationOptions(active.map((l) => ({ value: String(l.id), label: l.name })));
      const primary = active.find((l) => l.is_primary) ?? active[0];
      if (primary) { setLocationId(primary.id); setLocationName(primary.name); }
    }).catch(() => {});
  }, []);

  // ── Fetch next payment number ───────────────────────────────────────────────
  useEffect(() => {
    axios.get<{ success: boolean; data: { payment_number: string } }>("/api/payments/next-number")
      .then((res) => { if (res.data.success) setPmtNumber(res.data.data.payment_number); })
      .catch(() => {});
  }, []);

  // ── Fetch unpaid invoices when customer selected ────────────────────────────
  useEffect(() => {
    if (!customerId) { setInvoices([]); setPaymentAmounts({}); setReceivedFull(false); setPmtAmount(""); return; }
    setInvoicesLoading(true);
    setReceivedFull(false);
    fetchInvoices({ customer_id: customerId, per_page: 500 }).then((res) => {
      if (res.success) {
        const unpaid = res.data.data.filter(
          (inv) => inv.status !== "paid" && parseFloat(inv.balance_amount) > 0
        );
        setInvoices(unpaid);
        const initial: Record<number, string> = {};
        unpaid.forEach((inv) => { initial[inv.id] = ""; });
        setPaymentAmounts(initial);
      }
    }).finally(() => setInvoicesLoading(false));
  }, [customerId]);

  // ── Derived summary ─────────────────────────────────────────────────────────
  const totalPending  = invoices.reduce((s, inv) => s + parseFloat(inv.balance_amount), 0);
  const totalReceived = parseFloat(pmtAmount) || 0;
  const totalUsed     = Object.values(paymentAmounts).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const excess        = totalReceived - totalUsed;

  // ── Per-invoice helpers ─────────────────────────────────────────────────────
  const setInvoiceAmt = (invoiceId: number, value: string) =>
    setPaymentAmounts((prev) => ({ ...prev, [invoiceId]: value }));

  const payInFull = (inv: InvoiceListItem) => {
    const bal   = parseFloat(inv.balance_amount);
    const avail = totalReceived - (totalUsed - (parseFloat(paymentAmounts[inv.id]) || 0));
    const apply = Math.min(bal, Math.max(0, avail));
    setPaymentAmounts((prev) => ({ ...prev, [inv.id]: apply > 0 ? apply.toFixed(2) : bal.toFixed(2) }));
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!customerId) errs.customer  = "Please select a customer.";
    if (!pmtDate)    errs.pmtDate   = "Payment date is required.";
    const amt = parseFloat(pmtAmount);
    if (isNaN(amt) || amt <= 0) errs.pmtAmount = "Enter a valid amount greater than zero.";
    if (totalUsed > totalReceived + 0.01) errs.allocation = "Allocated amount exceeds amount received.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async (status: "open" | "draft" = "open") => {
    if (!validate()) return;
    if (cfPanelRef.current && !cfPanelRef.current.validate()) return;
    setSaving(true);
    try {
      const amt     = parseFloat(pmtAmount);
      const charges = pmtBankCharges ? parseFloat(pmtBankCharges) : null;

      const { data: pmtRes } = await axios.post<{ success: boolean; data: { id: number }; message?: string }>(
        "/api/payments",
        {
          customer_id:      customerId,
          location_id:      locationId ?? null,
          payment_date:     pmtDate,
          amount:           amt,
          bank_charges:     charges,
          tax_deducted:     pmtTaxDeducted,
          payment_mode:     pmtMode,
          reference_number: pmtRef.trim() || null,
          notes:            pmtNotes.trim() || null,
          status,
        }
      );

      if (!pmtRes.success) { showToast("danger", pmtRes.message ?? "Failed to create payment."); return; }

      const paymentId = pmtRes.data.id;

      if (status !== "draft") {
        for (const [invId, v] of Object.entries(paymentAmounts)) {
          const applied = parseFloat(v);
          if (applied > 0) await axios.post(`/api/payments/${paymentId}/apply`, { invoice_id: Number(invId), applied_amount: applied });
        }
      }

      for (const file of attachments) {
        await uploadPaymentAttachment(paymentId, file);
      }

      emitMutation("payments:mutated");
      showToast("success", status === "draft" ? "Payment saved as draft." : "Payment saved successfully.");
      setTimeout(() => navigate(`/payments/${paymentId}`), 1200);
    } catch {
      showToast("danger", "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const fieldDisabled = !customerId;

  return (
    <>
      <style>{`
        .invoice-fields-row {
          display: flex;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 16px;
        }
        .invoice-field-customer { flex: 0 0 480px; min-width: 0; }
        .invoice-field-location { flex: 0 0 340px; min-width: 0; }

        @media (min-width: 768px) {
          .invoice-fields-row  { position: relative; padding-right: 246px; }
          .invoice-field-panel {
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
          }
        }

        @media (max-width: 767px) {
          .invoice-field-customer { flex: 1 1 100%; }
          .invoice-field-location { flex: 1 1 100%; }
          .invoice-field-panel    { flex: 1 1 100%; }
          .invoice-customer-details { min-width: 0 !important; width: 100% !important; }
          .invoice-customer-details .card-body { padding: 8px 10px !important; }
          .invoice-customer-details .inv-cust-avatar { width: 26px !important; height: 26px !important; font-size: 11px !important; }
          .invoice-customer-details .fs-14 { font-size: 12px !important; }
        }
      `}</style>

      <div className="page-wrapper">
        <div className="content">

          <PageHeader title="New Payment" showModuleTile={false} showExport={false} showClose onRefresh={handleRefresh} onClose={() => navigate(-1)} />

          <div className="card mb-0">
            <div className="card-body p-4">

              {/* ══ Customer Info ══════════════════════════════════════════════ */}
              <div className="invoice-fields-row mb-4">

                {/* Customer Name */}
                <div className="invoice-field-customer">
                  <label className="form-label fw-medium fs-14 text-danger">
                    Customer Name <span>*</span>
                  </label>
                  <div className={errors.customer ? "is-invalid" : undefined}>
                    <CustomerDropdown
                      value={customerName}
                      onChange={(name, id, item) => {
                        setCustomerName(name); setCustomerId(id); setSelectedCustomer(item);
                        clrErr("customer");
                      }}
                    />
                  </div>
                  {errors.customer && <div className="invalid-feedback d-block">{errors.customer}</div>}
                </div>

                {/* Location */}
                <div className="invoice-field-location">
                  <label className="form-label fw-medium fs-14">Location</label>
                  <CommonSelect
                    className="select"
                    options={locationOptions}
                    value={locationId ? locationOptions.find((o) => o.value === String(locationId)) ?? null : null}
                    onChange={(opt) => {
                      const o = opt as Option | null;
                      setLocationId(o ? Number(o.value) : null);
                      setLocationName(o?.label ?? "");
                    }}
                    placeholder="Select Location"
                  />
                </div>

                {/* Customer details card — far right */}
                {selectedCustomer && (
                  <div className="invoice-field-panel" style={{ zIndex: 10 }}>
                    <div
                      className="card border shadow invoice-customer-details mb-0"
                      style={{ cursor: "pointer", width: 230 }}
                      onClick={() => setDrawerOpen(true)}
                    >
                      <div className="card-body p-3">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="inv-cust-avatar rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: 36, height: 36, background: "#E41F07", color: "#fff", fontWeight: 700, fontSize: 14, userSelect: "none" }}
                          >
                            {getInitial(selectedCustomer.name)}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div className="fs-14 fw-semibold text-truncate" style={{ width: "100%" }}>
                              {selectedCustomer.name}
                            </div>
                            <div className="d-flex align-items-center gap-1 mt-1">
                              {invoicesLoading
                                ? <span className="spinner-border spinner-border-sm text-danger" role="status" />
                                : <span className="badge badge-soft-danger">{invoices.length} Unpaid</span>
                              }
                            </div>
                          </div>
                          <i className="ti ti-chevron-right ms-2 text-muted fs-14 flex-shrink-0" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* ══ Amount Details ════════════════════════════════════════════ */}
              <div className="border-top pt-4 mb-4" style={fieldDisabled ? { opacity: 0.45, pointerEvents: "none" } : undefined}>
                <h6 className="fw-semibold fs-15 mb-3">Amount Details</h6>

                <div className="row mb-3 align-items-start">
                  <label className="col-sm-2 col-form-label text-danger fw-medium fs-14">
                    Amount Received <span>*</span>
                  </label>
                  <div className="col-sm-4">
                    <div className="input-group">
                      <span className="input-group-text bg-white fs-13">INR</span>
                      <input
                        type="number"
                        className={`form-control border-start-0${errors.pmtAmount ? " is-invalid" : ""}${receivedFull ? " bg-light" : ""}`}
                        placeholder="0.00"
                        min="0.01"
                        step="0.01"
                        value={pmtAmount}
                        readOnly={receivedFull}
                        onChange={(e) => { if (!receivedFull) { setPmtAmount(e.target.value); clrErr("pmtAmount"); } }}
                      />
                      {errors.pmtAmount && <div className="invalid-feedback">{errors.pmtAmount}</div>}
                    </div>
                    {customerId && !invoicesLoading && totalPending > 0 && (
                      <div className="form-check mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="receivedFullChk"
                          checked={receivedFull}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setReceivedFull(checked);
                            if (checked) {
                              setPmtAmount(totalPending.toFixed(2));
                              clrErr("pmtAmount");
                            } else {
                              setPmtAmount("");
                            }
                          }}
                        />
                        <label className="form-check-label fs-13 text-muted" htmlFor="receivedFullChk">
                          Received full amount (₹{totalPending.toLocaleString("en-IN", { minimumFractionDigits: 2 })})
                        </label>
                      </div>
                    )}
                  </div>
                  <label className="col-sm-2 col-form-label fw-medium fs-14 text-sm-end">
                    Bank Charges (if any)
                  </label>
                  <div className="col-sm-4">
                    <div className="input-group">
                      <span className="input-group-text bg-white fs-13">INR</span>
                      <input
                        type="number"
                        className="form-control border-start-0"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={pmtBankCharges}
                        onChange={(e) => setPmtBankCharges(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="row align-items-center mb-3">
                  <label className="col-sm-2 col-form-label fw-medium fs-14">Tax Deducted?</label>
                  <div className="col-sm-10">
                    <div className="d-flex align-items-center gap-4">
                      <div className="form-check mb-0">
                        <input className="form-check-input" type="radio" id="ptaxNo" name="pmtTax" checked={!pmtTaxDeducted} onChange={() => setPmtTaxDeducted(false)} />
                        <label className="form-check-label" htmlFor="ptaxNo">No Tax Deducted</label>
                      </div>
                      <div className="form-check mb-0">
                        <input className="form-check-input" type="radio" id="ptaxYes" name="pmtTax" checked={pmtTaxDeducted} onChange={() => setPmtTaxDeducted(true)} />
                        <label className="form-check-label" htmlFor="ptaxYes">Yes, TDS (Income Tax)</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ══ Payment Details ═══════════════════════════════════════════ */}
              <div className="border-top pt-4 mb-4" style={fieldDisabled ? { opacity: 0.45, pointerEvents: "none" } : undefined}>
                <h6 className="fw-semibold fs-15 mb-3">Payment Details</h6>

                <div className="row mb-3 align-items-center">
                  <label className="col-sm-2 col-form-label fw-medium fs-14">Payment #</label>
                  <div className="col-sm-4">
                    <div className="input-group">
                      <input
                        className="form-control bg-light"
                        value={pmtNumber}
                        readOnly
                        placeholder="Loading…"
                        style={{ cursor: "default" }}
                      />
                      <span className="input-group-text bg-light text-muted" title="Auto-generated">
                        <i className="ti ti-refresh fs-14" />
                      </span>
                    </div>
                  </div>
                </div>

                <div className="row mb-3 align-items-center">
                  <label className="col-sm-2 col-form-label text-danger fw-medium fs-14">
                    Payment Date <span>*</span>
                  </label>
                  <div className="col-sm-4">
                    <CommonDatePicker
                      value={pmtDate ? dayjs(pmtDate) : null}
                      onChange={(date) => { setPmtDate(date ? date.format("YYYY-MM-DD") : ""); clrErr("pmtDate"); }}
                      format="DD/MM/YYYY"
                      placeholder="DD/MM/YYYY"
                    />
                    {errors.pmtDate && <div className="invalid-feedback d-block">{errors.pmtDate}</div>}
                  </div>
                  <label className="col-sm-2 col-form-label fw-medium fs-14 text-sm-end">Payment Mode</label>
                  <div className="col-sm-4">
                    {(() => {
                      const showAdvance =
                        !!(invoiceSettings?.advanced_payment_enabled) &&
                        !!(selectedCustomer?.category_id) &&
                        (invoiceSettings?.advanced_payment_categories ?? []).map(Number).includes(Number(selectedCustomer!.category_id!));
                      const options = showAdvance
                        ? [...pmtModeOptions, ADVANCE_PAYMENT_OPTION]
                        : pmtModeOptions;
                      return (
                        <CommonSelect
                          className="select"
                          options={options}
                          value={options.find((o) => o.value === pmtMode) ?? null}
                          onChange={(opt) => setPmtMode((opt as Option | null)?.value ?? "cash")}
                        />
                      );
                    })()}
                  </div>
                </div>

                <div className="row mb-3 align-items-center">
                  <label className="col-sm-2 col-form-label fw-medium fs-14">Reference #</label>
                  <div className="col-sm-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="UTR / Cheque no."
                      value={pmtRef}
                      onChange={(e) => setPmtRef(e.target.value)}
                    />
                  </div>
                </div>

                <div className="row mb-3 align-items-start">
                  <label className="col-sm-2 col-form-label fw-medium fs-14">Notes</label>
                  <div className="col-sm-10">
                    <textarea className="form-control" rows={3} value={pmtNotes} onChange={(e) => setPmtNotes(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* ══ Invoice Allocation ════════════════════════════════════════ */}
              {customerId && (
                <div className="border-top pt-4 mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <h6 className="fw-semibold fs-15 mb-0">Unpaid Invoices</h6>
                      {invoicesLoading && <span className="spinner-border spinner-border-sm text-secondary" role="status" />}
                    </div>
                    {!invoicesLoading && invoices.length > 0 && (
                      <button
                        type="button"
                        className="btn btn-link p-0 fs-13 text-danger"
                        style={{ textDecoration: "none" }}
                        onClick={() => setPaymentAmounts(Object.fromEntries(invoices.map((inv) => [inv.id, ""])))}
                      >
                        Clear Applied Amount
                      </button>
                    )}
                  </div>

                  {errors.allocation && (
                    <div className="alert alert-danger py-2 px-3 fs-13 mb-3">{errors.allocation}</div>
                  )}

                  {!invoicesLoading && invoices.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="ti ti-receipt-off fs-36 d-block mb-2" />
                      <p className="fs-14 mb-0">No unpaid invoices for this customer.</p>
                    </div>
                  ) : (
                    <>
                      {/* Flex-table matching items table style */}
                      <div style={{ overflowX: "auto" }} className="mb-4">
                        <div className="border rounded overflow-hidden" style={{ minWidth: 980 }}>

                          {/* Header */}
                          <div className="d-flex align-items-stretch border-bottom" style={{ background: "#f8f9fa" }}>
                            <div className="d-flex align-items-center px-3 py-2" style={{ width: 130, flexShrink: 0, borderRight: "1px solid #dee2e6" }}>
                              <span className="fw-semibold fs-12 text-uppercase">Date</span>
                            </div>
                            <div className="d-flex align-items-center px-3 py-2" style={{ flex: 1, borderRight: "1px solid #dee2e6" }}>
                              <span className="fw-semibold fs-12 text-uppercase">Invoice #</span>
                            </div>
                            <div className="d-flex align-items-center px-3 py-2" style={{ width: 150, flexShrink: 0, borderRight: "1px solid #dee2e6" }}>
                              <span className="fw-semibold fs-12 text-uppercase">Location</span>
                            </div>
                            <div className="d-flex align-items-center px-3 py-2" style={{ width: 160, flexShrink: 0, borderRight: "1px solid #dee2e6" }}>
                              <span className="fw-semibold fs-12 text-uppercase">Invoice Amount</span>
                            </div>
                            <div className="d-flex align-items-center px-3 py-2" style={{ width: 145, flexShrink: 0, borderRight: "1px solid #dee2e6" }}>
                              <span className="fw-semibold fs-12 text-uppercase">Amount Due</span>
                            </div>
                            <div className="d-flex align-items-center px-3 py-2" style={{ width: 240, flexShrink: 0 }}>
                              <span className="fw-semibold fs-12 text-uppercase">Payment</span>
                            </div>
                          </div>

                          {/* Rows */}
                          {invoices.map((inv) => {
                            const bal     = parseFloat(inv.balance_amount);
                            const entered = parseFloat(paymentAmounts[inv.id] ?? "") || 0;
                            return (
                              <div key={inv.id} className="d-flex align-items-stretch border-bottom">
                                {/* Date */}
                                <div className="d-flex flex-column justify-content-center" style={{ width: 130, flexShrink: 0, borderRight: "1px solid #dee2e6", padding: "18px 14px" }}>
                                  <span className="fs-15">
                                    {inv.invoice_date
                                      ? new Date(inv.invoice_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                                      : "—"}
                                  </span>
                                </div>
                                {/* Invoice # */}
                                <div className="d-flex flex-column justify-content-center" style={{ flex: 1, borderRight: "1px solid #dee2e6", padding: "18px 14px" }}>
                                  <span className="fw-semibold fs-15">{inv.invoice_number}</span>
                                </div>
                                {/* Location */}
                                <div className="d-flex flex-column justify-content-center" style={{ width: 150, flexShrink: 0, borderRight: "1px solid #dee2e6", padding: "18px 14px" }}>
                                  <span className="fs-15">{inv.location?.name ?? "—"}</span>
                                </div>
                                {/* Invoice Amount */}
                                <div className="d-flex flex-column justify-content-center" style={{ width: 160, flexShrink: 0, borderRight: "1px solid #dee2e6", padding: "18px 14px" }}>
                                  <span className="fs-15">₹{fmt(inv.grand_total)}</span>
                                </div>
                                {/* Amount Due */}
                                <div className="d-flex flex-column justify-content-center" style={{ width: 145, flexShrink: 0, borderRight: "1px solid #dee2e6", padding: "18px 14px" }}>
                                  <span className="fs-15 fw-medium text-danger">₹{fmt(inv.balance_amount)}</span>
                                </div>
                                {/* Payment input */}
                                <div className="d-flex flex-column justify-content-center" style={{ width: 240, flexShrink: 0, padding: "18px 14px" }}>
                                  <div className="d-flex align-items-center gap-2">
                                    <div className="input-group" style={{ width: 160 }}>
                                      <span className="input-group-text bg-white fs-14">INR</span>
                                      <input
                                        type="number"
                                        className="form-control border-start-0 text-end fs-15"
                                        placeholder="0.00"
                                        min="0"
                                        max={bal.toFixed(2)}
                                        step="any"
                                        value={paymentAmounts[inv.id] ?? ""}
                                        onChange={(e) => {
                                          const raw = e.target.value;
                                          const num = parseFloat(raw);
                                          setInvoiceAmt(inv.id, !isNaN(num) && num > bal ? bal.toFixed(2) : raw);
                                        }}
                                      />
                                    </div>
                                    {entered < bal && (
                                      <button
                                        type="button"
                                        className="btn btn-link p-0 fs-13 text-danger text-nowrap"
                                        style={{ textDecoration: "none" }}
                                        onClick={() => payInFull(inv)}
                                      >
                                        Pay in Full
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {/* Footer totals row */}
                          <div style={{ background: "#fafafa" }}>
                            <div className="d-flex align-items-center" style={{ padding: "12px 0" }}>
                              <div style={{ width: 130, flexShrink: 0 }} />
                              <div style={{ flex: 1, padding: "0 14px" }}>
                                <span className="fs-14 fw-medium text-muted">Total Applied (₹)</span>
                              </div>
                              <div style={{ width: 150, flexShrink: 0 }} />
                              <div style={{ width: 160, flexShrink: 0 }} />
                              <div style={{ width: 145, flexShrink: 0 }} />
                              <div style={{ width: 240, flexShrink: 0, padding: "0 14px" }}>
                                <span className="fs-15 fw-semibold">₹{fmt(totalUsed)}</span>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Summary */}
                      <div className="d-flex justify-content-end mt-2">
                        <div style={{ width: "100%", maxWidth: 520 }}>
                          <div className="border rounded" style={{ background: "#fafafa", padding: "20px 24px" }}>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <span className="fs-14 fw-medium">Amount Received</span>
                              <span className="fs-14 fw-medium">₹{fmt(totalReceived)}</span>
                            </div>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <span className="fs-14 fw-medium">Amount Used for Payments</span>
                              <span className="fs-14 fw-medium">₹{fmt(totalUsed)}</span>
                            </div>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <span className="fs-14 fw-medium">Amount Refunded</span>
                              <span className="fs-14 fw-medium">₹0.00</span>
                            </div>
                            <div className="border-top mt-2 pt-3">
                              <div className="d-flex align-items-center justify-content-between">
                                <span className="fs-15 fw-semibold">Amount in Excess</span>
                                <span className={`fs-15 fw-bold ${excess > 0 ? "text-warning" : excess < 0 ? "text-danger" : ""}`}>
                                  ₹{fmt(excess)}
                                </span>
                              </div>
                              {excess > 0 && (
                                <p className="fs-12 text-muted mb-0 mt-1">₹{fmt(excess)} will be added to this customer's unused credits.</p>
                              )}
                              {excess < 0 && (
                                <p className="fs-12 text-danger mb-0 mt-1">Applied amount exceeds the amount received.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ══ Attachments ══════════════════════════════════════════════ */}
              <div className="border-top pt-4">
                <p className="form-label fw-medium fs-14 mb-2">Attach File(s) to Payment</p>

                {/* Clickable attach box */}
                <label
                  htmlFor="payment_attach_input"
                  className="border rounded d-flex align-items-center gap-3 px-3 position-relative w-100"
                  style={{ cursor: "pointer", background: "#fafafa", minHeight: 56 }}
                >
                  <i className="ti ti-paperclip fs-20 text-muted flex-shrink-0" />
                  {attachments.length > 0 ? (
                    <div className="d-flex flex-column py-2">
                      <span className="fw-medium fs-13">
                        {attachments.length} file{attachments.length > 1 ? "s" : ""} attached
                      </span>
                      <small className="text-muted">Click to add more</small>
                    </div>
                  ) : (
                    <div className="d-flex flex-column py-2">
                      <span className="fw-medium fs-13">Click to attach files</span>
                      <small className="text-muted">All files — up to 10 files, 10 MB each</small>
                    </div>
                  )}
                </label>

                <input
                  id="payment_attach_input"
                  ref={attachFileRef}
                  type="file"
                  multiple
                  className="d-none"
                  onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
                  onChange={async (e) => {
                    const picked = Array.from(e.target.files ?? []);
                    const compressed = await compressPickedFiles(picked);
                    setAttachments((prev) => [...prev, ...compressed].slice(0, 10));
                  }}
                />

                {/* Attached files list */}
                {attachments.length > 0 && (
                  <div className="mt-2 border rounded" style={{ background: "#fff" }}>
                    {attachments.map((file, idx) => {
                      const { icon, color } = getFileIcon(file);
                      return (
                        <div
                          key={idx}
                          className={`d-flex align-items-center gap-2 px-3 py-2${idx < attachments.length - 1 ? " border-bottom" : ""}`}
                          style={{ fontSize: 13 }}
                        >
                          <i className={`ti ${icon} fs-18 flex-shrink-0`} style={{ color }} />
                          <div className="flex-grow-1 overflow-hidden">
                            <div className="fw-medium text-truncate">{file.name}</div>
                            <div className="text-muted" style={{ fontSize: 11 }}>{formatFileSize(file.size)}</div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-danger text-decoration-none ms-auto p-0 flex-shrink-0"
                            onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                          >
                            <i className="ti ti-x fs-16" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Additional Fields ──────────────────────────────────────── */}
              <div className="border-top pt-4 mb-4">
                <p className="form-label fw-medium fs-14 mb-3">Additional Fields</p>
                <CustomFieldsPanel ref={cfPanelRef} module="payments" />
              </div>

            </div>
          </div>
        </div>

        {/* ══ Sticky footer ══════════════════════════════════════════════════ */}
        <div
          className="bg-white border-top d-flex align-items-center gap-2 px-4"
          style={{ position: "sticky", bottom: 0, zIndex: 100, height: 60 }}
        >
          {/* Split button: Save + Save as Draft */}
          <div className="btn-group position-relative drafter-group">
            <button
              type="button"
              className="btn btn-danger"
              disabled={saving}
              onClick={() => handleSave("open")}
            >
              {saving
                ? <><span className="spinner-border spinner-border-sm me-1" role="status" />Saving…</>
                : "Save"}
            </button>
            <button
              type="button"
              className="btn btn-danger dropdown-toggle dropdown-toggle-split px-2"
              disabled={saving}
              onClick={() => setDrafterOpen((o) => !o)}
              aria-label="More save options"
            >
              <span className="visually-hidden">Toggle dropdown</span>
            </button>
            {drafterOpen && (
              <div
                className="dropdown-menu show"
                style={{ position: "absolute", bottom: "100%", left: 0, top: "auto", minWidth: 180, marginBottom: 4 }}
              >
                <button
                  type="button"
                  className="dropdown-item"
                  style={{ fontSize: 15, padding: "10px 20px" }}
                  onClick={() => { setDrafterOpen(false); handleSave("draft"); }}
                >
                  <i className="ti ti-file-text me-2" />
                  Save as Draft
                </button>
              </div>
            )}
          </div>

          <button type="button" className="btn btn-outline-light" onClick={() => navigate(-1)} disabled={saving}>
            Cancel
          </button>
        </div>

        <Footer />
      </div>

      {/* Toast */}
      <div role="region" aria-live="polite" className="position-fixed top-0 start-50 translate-middle-x pt-4" style={{ zIndex: 9999, pointerEvents: "none" }}>
        <Toast
          show={toast.show}
          onClose={() => setToast((t) => ({ ...t, show: false }))}
          style={{ pointerEvents: "auto", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.10)", border: "none", minWidth: 320, background: "#fff" }}
        >
          <Toast.Body className="d-flex align-items-center gap-3 px-4 py-3">
            <span className={`d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 ${toast.type === "success" ? "bg-success" : "bg-danger"}`} style={{ width: 36, height: 36 }}>
              <i className={`ti fs-16 text-white ${toast.type === "success" ? "ti-check" : "ti-x"}`} />
            </span>
            <span className="fs-14 fw-medium text-dark">{toast.message}</span>
          </Toast.Body>
        </Toast>
      </div>

      {/* Customer drawer */}
      {drawerOpen && customerId && (
        <CustomerDrawer customerId={customerId} customerName={customerName} onClose={() => setDrawerOpen(false)} />
      )}
    </>
  );
};

export default NewPayment;
