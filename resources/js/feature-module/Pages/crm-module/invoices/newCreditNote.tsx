import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../../../../core/redux/loaderSlice";
import { createPortal } from "react-dom";
import { Modal, Toast } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import { fetchInvoice, type InvoiceLineItem } from "../../../../core/services/invoiceApi";
import axios from "axios";
import Footer from "../../../../components/footer/footer";
import CustomFieldsPanel, { type CustomFieldsPanelHandle } from "../../../../components/custom-fields/CustomFieldsPanel";
import PageHeader from "../../../../components/page-header/pageHeader";
import CommonSelect, { type Option } from "../../../../components/common-select/commonSelect";
import { fetchSeriesForLocation, type SeriesItem } from "../../../../core/services/seriesApi";
import { bustSeriesLists } from "../../../../core/cache/seriesCache";

import { fetchItems, fetchItem, fetchItemStock, fetchStockBatch, type ItemListRecord } from "../../../../core/services/itemApi";
import { getSettings } from "../../../../core/cache/settingCache";
import { type ProductConfiguration } from "../../../../core/services/settingApi";
import { emitMutation } from "../../../../core/cache/mutationEvents";
import { compressPickedFiles } from "../../../../core/utils/imageCompression";

interface DropdownEntry {
  id:        number;
  name:      string;
  mobile?:   string | null;
  category?: string | null;
}

interface CreditNoteRow {
  id:                 number;
  item_id:            number | null;
  item_name:          string;
  item_image:         string | null;
  quantity:           string;
  rate:               string;
  base_rate:          string;
  gst_rate:           string;
  stock_on_hand:      string | null;
  available_for_sale: string | null;
  max_qty:            number | null;
}

// ── EntityField (Tax, Salesperson, Reference) ─────────────────────────────────
interface EntityFieldProps {
  label:             string;
  value:             string;
  onChange:          (name: string, id: number) => void;
  items:             DropdownEntry[];
  onManage?:         () => void;
  manageLabel?:      string;
  wrapperClassName?: string;
  usePortal?:        boolean;
}

const EntityField = ({ label, value, onChange, items, onManage, manageLabel, wrapperClassName, usePortal = false }: EntityFieldProps) => {
  const [open, setOpen]       = useState(false);
  const [dropUp, setDropUp]   = useState(false);
  const [search, setSearch]   = useState("");
  const [dropPos, setDropPos] = useState<{ top: number; bottom: number; left: number; width: number } | null>(null);
  const wrapRef               = useRef<HTMLDivElement>(null);
  const portalRef             = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const inWrap   = wrapRef.current?.contains(e.target as Node);
      const inPortal = portalRef.current?.contains(e.target as Node);
      if (!inWrap && !inPortal) { setOpen(false); setSearch(""); }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = () => {
    if (!open && wrapRef.current) {
      const rect   = wrapRef.current.getBoundingClientRect();
      const willUp = window.innerHeight - rect.bottom < 280;
      setDropUp(willUp);
      setDropPos({ top: rect.bottom + 4, bottom: window.innerHeight - rect.top + 4, left: rect.left, width: rect.width });
    }
    setOpen((o) => !o);
    setSearch("");
  };

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.mobile ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const select = (item: DropdownEntry) => { onChange(item.name, item.id); setOpen(false); setSearch(""); };

  const dropdown = open ? (
    <div
      ref={portalRef}
      className="bg-white border rounded shadow-sm overflow-hidden"
      style={usePortal && dropPos ? {
        position: "fixed",
        ...(dropUp ? { bottom: dropPos.bottom } : { top: dropPos.top }),
        left: dropPos.left, width: dropPos.width, zIndex: 9999, minWidth: 220,
      } : {
        position: "absolute",
        ...(dropUp ? { bottom: "calc(100% + 4px)", top: "auto" } : { top: "calc(100% + 4px)", bottom: "auto" }),
        left: 0, right: 0, zIndex: 1050, minWidth: 220,
      }}
    >
      <div className="p-2 border-bottom">
        <input autoFocus type="text" className="form-control fs-14" style={{ height: 42 }}
          placeholder={`Search ${label}…`} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div style={{ maxHeight: 180, overflowY: "auto", paddingBottom: 8 }}>
        {filtered.length === 0 ? (
          <p className="text-muted fs-15 text-center py-3 mb-0">No results</p>
        ) : filtered.map((item) => {
          const isActive = item.name === value;
          return (
            <div key={item.id} className="px-3 py-2"
              style={{ cursor: "pointer", background: isActive ? "#E41F07" : "transparent", color: isActive ? "#fff" : "#707070" }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "#E41F07"; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "#707070"; }}
              onClick={() => select(item)}
            >
              <div className="fs-15 fw-medium">{item.name}</div>
              {item.mobile && <div className="fs-12" style={{ color: isActive ? "rgba(255,255,255,0.75)" : "#aaa" }}>{item.mobile}</div>}
            </div>
          );
        })}
      </div>
      {onManage && (
        <div className="border-top px-3 py-2">
          <button type="button" className="btn btn-link p-0 fs-14 text-primary fw-medium" style={{ textDecoration: "none" }}
            onClick={() => { setOpen(false); setSearch(""); onManage(); }}>
            {manageLabel ?? `Add ${label}`}
          </button>
        </div>
      )}
    </div>
  ) : null;

  return (
    <div ref={wrapRef} className={`position-relative${wrapperClassName ? ` ${wrapperClassName}` : ""}`} style={open ? { zIndex: 10 } : undefined}>
      <div className="input-group">
        <input type="text" className="form-control" placeholder={`Select or Add ${label}`}
          value={value} readOnly style={{ cursor: "pointer" }} onClick={toggle} />
        <button type="button" className="btn btn-outline-light" onClick={toggle}>
          <i className={`ti ti-chevron-${open ? "up" : "down"}`} />
        </button>
      </div>
      {usePortal ? (dropdown && createPortal(dropdown, document.body)) : dropdown}
    </div>
  );
};

// ── Tax entry type ─────────────────────────────────────────────────────────────
interface TaxEntry { id: number; name: string; rate: string; }

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getFileIcon = (file: File): { icon: string; color: string } => {
  if (file.type.startsWith("image/")) return { icon: "ti-photo", color: "#3b82f6" };
  if (file.type === "application/pdf") return { icon: "ti-file-type-pdf", color: "#ef4444" };
  if (file.type.includes("word")) return { icon: "ti-file-type-doc", color: "#2563eb" };
  if (file.type.includes("sheet") || file.type.includes("excel")) return { icon: "ti-file-type-xls", color: "#16a34a" };
  return { icon: "ti-paperclip", color: "#6b7280" };
};

// ── Manage Taxes Modal ────────────────────────────────────────────────────────
interface ManageTaxesModalProps {
  show: boolean; onHide: () => void; items: TaxEntry[];
  onSave: (name: string, rate: string) => TaxEntry;
  onUpdate: (id: number, name: string, rate: string) => void;
  onDelete: (id: number) => void;
  onSaveAndSelect: (entry: TaxEntry) => void;
}

const ManageTaxesModal = ({ show, onHide, items, onSave, onUpdate, onDelete, onSaveAndSelect }: ManageTaxesModalProps) => {
  const [hoveredId, setHoveredId]     = useState<number | null>(null);
  const [editingId, setEditingId]     = useState<number | null>(null);
  const [editName, setEditName]       = useState("");
  const [editRate, setEditRate]       = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName]         = useState("");
  const [newRate, setNewRate]         = useState("");

  useEffect(() => {
    if (!show) { setHoveredId(null); setEditingId(null); setEditName(""); setEditRate(""); setShowNewForm(false); setNewName(""); setNewRate(""); }
  }, [show]);

  const startEdit = (item: TaxEntry) => { setEditingId(item.id); setEditName(item.name); setEditRate(item.rate); setShowNewForm(false); };
  const commitEdit = () => { if (editingId !== null && editName.trim()) { onUpdate(editingId, editName.trim(), editRate.trim()); setEditingId(null); } };
  const handleSaveAndSelect = () => { if (!newName.trim()) return; const entry = onSave(newName.trim(), newRate.trim()); onSaveAndSelect(entry); onHide(); };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdropClassName="blurred-backdrop">
      <Modal.Header closeButton={false} style={{ padding: "20px 24px 18px", borderBottom: "1px solid #f1f5f9", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <i className="ti ti-receipt-tax fs-18" style={{ color: "#ef4444" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 16, color: "#0f172a" }}>Manage Taxes</p>
          </div>
        </div>
        <button type="button" onClick={onHide}
          style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #fecaca", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}>
          <i className="ti ti-x" style={{ fontSize: 14, color: "#ef4444", lineHeight: 1 }} />
        </button>
      </Modal.Header>
      <Modal.Body className="p-0">
        {!showNewForm && (
          <div className="px-4 pt-3 pb-3 border-bottom">
            <button type="button" className="btn btn-outline-light d-flex align-items-center gap-2"
              onClick={() => { setShowNewForm(true); setEditingId(null); }}>
              <i className="ti ti-plus fs-16" /><span className="fs-14 fw-medium">New Tax</span>
            </button>
          </div>
        )}
        {showNewForm && (
          <div className="px-4 pt-3 pb-3 border-bottom">
            <div className="row g-3 mb-3">
              <div className="col-7">
                <label className="form-label fw-medium fs-14 mb-1 text-danger">Tax Name <span>*</span></label>
                <input autoFocus type="text" className="form-control" placeholder="e.g. TDS Basic" value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveAndSelect(); if (e.key === "Escape") { setShowNewForm(false); setNewName(""); setNewRate(""); } }} />
              </div>
              <div className="col-5">
                <label className="form-label fw-medium fs-14 mb-1">Tax Rate (%)</label>
                <input type="number" className="form-control" placeholder="e.g. 10" min={0} step="any" value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveAndSelect(); if (e.key === "Escape") { setShowNewForm(false); setNewName(""); setNewRate(""); } }} />
              </div>
            </div>
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-danger" onClick={handleSaveAndSelect}>Save and Select</button>
              <button type="button" className="btn btn-outline-light" onClick={() => { setShowNewForm(false); setNewName(""); setNewRate(""); }}>Cancel</button>
            </div>
          </div>
        )}
        <div className="px-4 pt-3 pb-2">
          <p className="text-uppercase text-muted fw-semibold fs-12 mb-2" style={{ letterSpacing: "0.06em" }}>Taxes</p>
          {items.length === 0 && <p className="text-muted fs-14 text-center py-3">No taxes yet.</p>}
          {items.map((item) => (
            <div key={item.id}>
              {editingId === item.id ? (
                <div className="py-3 border-bottom">
                  <div className="row g-3 mb-3">
                    <div className="col-7">
                      <label className="form-label fw-medium fs-14 mb-1 text-danger">Tax Name <span>*</span></label>
                      <input autoFocus type="text" className="form-control" value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingId(null); }} />
                    </div>
                    <div className="col-5">
                      <label className="form-label fw-medium fs-14 mb-1">Tax Rate (%)</label>
                      <input type="number" className="form-control" min={0} step="any" value={editRate}
                        onChange={(e) => setEditRate(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingId(null); }} />
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-danger" onClick={commitEdit}>Save</button>
                    <button type="button" className="btn btn-outline-light" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="d-flex align-items-center justify-content-between py-2 px-2 rounded"
                  style={{ cursor: "default", background: hoveredId === item.id ? "#f5f5f5" : "transparent" }}
                  onMouseEnter={() => setHoveredId(item.id)} onMouseLeave={() => setHoveredId(null)}>
                  <div>
                    <span className="fs-15">{item.name}</span>
                    {item.rate && <span className="fs-12 text-muted ms-2">{item.rate}%</span>}
                  </div>
                  <div className="d-flex gap-2" style={{ visibility: hoveredId === item.id ? "visible" : "hidden" }}>
                    <button type="button" className="btn btn-outline-light"
                      style={{ width: 34, height: 34, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                      onClick={() => startEdit(item)}><i className="ti ti-pencil fs-15" /></button>
                    <button type="button" className="btn btn-outline-danger"
                      style={{ width: 34, height: 34, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                      onClick={() => onDelete(item.id)}><i className="ti ti-trash fs-15" /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const NewCreditNote = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id }   = useParams<{ id: string }>();
  const sourceInvoiceId = id ? Number(id) : null;

  // ── Prefilled read-only fields (from source invoice) ─────────────────────
  const [customerId, setCustomerId]     = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [locationId, setLocationId]     = useState<number | null>(null);
  const [locationName, setLocationName] = useState("");
  const [sourceLoading, setSourceLoading] = useState(true);
  const [invoiceItems, setInvoiceItems]   = useState<InvoiceLineItem[] | null>(null);

  const [creditNoteNumber, setCreditNoteNumber] = useState("CN-000001");

  const [salesperson, setSalesperson]           = useState("");


  // ── Line items ─────────────────────────────────────────────────────────────
  const [rows, setRows] = useState<CreditNoteRow[]>([
    { id: 1, item_id: null, item_name: "", item_image: null, quantity: "1", rate: "0.00", base_rate: "0.00", gst_rate: "0", stock_on_hand: null, available_for_sale: null, max_qty: null },
  ]);
  const rowNextId = useRef(2);
  const addRow    = () => setRows((p) => [...p, { id: rowNextId.current++, item_id: null, item_name: "", item_image: null, quantity: "1", rate: (0).toFixed(decimalRate), base_rate: (0).toFixed(decimalRate), gst_rate: "0", stock_on_hand: null, available_for_sale: null, max_qty: null }]);
  const removeRow = (rowId: number) => setRows((p) => p.filter((r) => r.id !== rowId));
  const updateRow = useCallback((rowId: number, field: keyof Omit<CreditNoteRow, "id">, value: string | number | null) =>
    setRows((p) => p.map((r) => r.id === rowId ? { ...r, [field]: value } : r)), []);

  const subTotal  = rows.reduce((s, r) => s + (parseFloat(r.rate) || 0) * (parseFloat(r.quantity) || 0), 0);
  const totalQty  = rows.reduce((s, r) => s + (r.item_id ? (parseFloat(r.quantity) || 0) : 0), 0);

  const [discount, setDiscount]           = useState("0");
  const [discountType, setDiscountType]   = useState<"amount" | "percent">("amount");
  const [taxType, setTaxType]             = useState<"tds" | "tcs">("tds");
  const [selectedTax, setSelectedTax]     = useState("");
  const [taxItems, setTaxItems]           = useState<TaxEntry[]>([]);
  const [showTaxModal, setShowTaxModal]   = useState(false);
  const taxNextId                         = useRef(1);
  const [chargeRows, setChargeRows]       = useState([{ id: 1, label: "Adjustments", amount: "", editingLabel: false }]);
  const chargeNextId                      = useRef(2);

  const [customerNotes, setCustomerNotes]     = useState("Thanks for your business.");
  const [termsConditions, setTermsConditions] = useState("");
  const [attachedFiles, setAttachedFiles]     = useState<File[]>([]);
  const attachFileRef                         = useRef<HTMLInputElement>(null);
  const cfPanelRef                            = useRef<CustomFieldsPanelHandle>(null);

  // ── Series / numbering ─────────────────────────────────────────────────────
  const [seriesOptions, setSeriesOptions]       = useState<SeriesItem[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null);
  const selectedSeriesIdRef                     = useRef<number | null>(null);
  const [configModalOpen, setConfigModalOpen]   = useState(false);
  const [configMode, setConfigMode]             = useState<"auto" | "manual">("auto");
  const [configPrefix, setConfigPrefix]         = useState("CN-");
  const [configNextNumber, setConfigNextNumber] = useState("000001");
  const [cnNumChecking, setCnNumChecking]       = useState(false);
  const [cnNumDuplicate, setCnNumDuplicate]     = useState(false);

  // ── Decimal rate ───────────────────────────────────────────────────────────
  const [decimalRate, setDecimalRate] = useState(2);

  // ── Item search ────────────────────────────────────────────────────────────
  const [itemOpenId, setItemOpenId]           = useState<number | null>(null);
  const [itemSearchText, setItemSearchText]   = useState<Record<number, string>>({});
  const [itemDropItems, setItemDropItems]     = useState<ItemListRecord[]>([]);
  const [itemDropLoading, setItemDropLoading] = useState(false);
  const [itemDropPos, setItemDropPos]         = useState<{ top: number; left: number; width: number } | null>(null);
  const [itemImgErrors, setItemImgErrors]     = useState<Record<number, boolean>>({});
  const itemSearchTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemWrapRefs      = useRef<Record<number, HTMLDivElement | null>>({});
  const itemInputRefs     = useRef<Record<number, HTMLDivElement | null>>({});
  const itemPortalRef     = useRef<HTMLDivElement>(null);

  // ── Bulk add ───────────────────────────────────────────────────────────────
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkSearch, setBulkSearch]       = useState("");
  const [bulkItems, setBulkItems]         = useState<ItemListRecord[]>([]);
  const [bulkLoading, setBulkLoading]     = useState(false);
  const [bulkSelected, setBulkSelected]   = useState<Record<number, string>>({});
  const [bulkStocks, setBulkStocks]       = useState<Record<number, string | null>>({});
  const bulkSearchTimer                   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Save / form state ──────────────────────────────────────────────────────
  const [saving, setSaving]                       = useState(false);
  const [pageReady, setPageReady]                 = useState(false);
  const [errors, setErrors]                       = useState<Record<string, string>>({});
  const clr = (key: string) => setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  const [toast, setToast]                         = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" });
  const toastTimerRef                             = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isDirty, setIsDirty]                     = useState(false);
  const isDirtyRef                                = useRef(false);
  const markDirty   = useCallback(() => { if (!isDirtyRef.current) { isDirtyRef.current = true; setIsDirty(true); } }, []);
  const clearDirty  = useCallback(() => { isDirtyRef.current = false; setIsDirty(false); }, []);
  const [drafterOpen, setDrafterOpen]             = useState(false);
  const [showUnsavedModal, setShowUnsavedModal]   = useState(false);
  const pendingNavRef                             = useRef<(() => void) | null>(null);
  const [showCreditModal, setShowCreditModal]     = useState(false);
  const pendingSaveStatusRef                      = useRef<"issued" | "draft">("issued");

  const showToast = useCallback((message: string, type: "success" | "error" = "error") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  }, []);

  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // ── Derived totals ─────────────────────────────────────────────────────────
  const discountAmt         = discountType === "amount" ? (parseFloat(discount) || 0) : subTotal * (parseFloat(discount) || 0) / 100;
  const totalCharges        = chargeRows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const taxBase             = subTotal - discountAmt;
  const selectedTaxEntry    = taxItems.find((t) => t.name === selectedTax);
  const taxRate             = parseFloat(selectedTaxEntry?.rate ?? "0") || 0;
  const taxAmt              = taxRate > 0 ? Math.abs(taxBase * taxRate / 100) : 0;
  const signedTaxAmt        = taxType === "tds" ? -taxAmt : taxAmt;
  const grandTotal          = subTotal - discountAmt + totalCharges + signedTaxAmt;

  const toStorageUrl = (path: string | null | undefined): string | null => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("/storage/") || path.startsWith("data:")) return path;
    return `/storage/${path}`;
  };

  // ── Load source invoice on mount (prefill customer + location) ─────────────
  useEffect(() => {
    dispatch(startLoading("credit-note-form"));
    if (!sourceInvoiceId) { setSourceLoading(false); setPageReady(true); dispatch(stopLoading("credit-note-form")); return; }
    fetchInvoice(sourceInvoiceId).then((res) => {
      if (res.success && res.data) {
        const inv = res.data;
        if (inv.customer) { setCustomerId(inv.customer.id); setCustomerName(inv.customer.display_name); }
        if (inv.location) { setLocationId(inv.location.id); setLocationName(inv.location.name); }
        if (inv.items && inv.items.length > 0) {
          setInvoiceItems(inv.items);
          const prefilled: CreditNoteRow[] = inv.items.map((it, idx) => ({
            id:                 idx + 1,
            item_id:            it.item_id,
            item_name:          it.item_name,
            item_image:         null,
            quantity:           String(Math.round(parseFloat(it.quantity)) || 1),
            rate:               parseFloat(it.unit_price).toFixed(decimalRate),
            base_rate:          parseFloat(it.base_rate).toFixed(decimalRate),
            gst_rate:           it.gst_rate ?? "0",
            stock_on_hand:      null,
            available_for_sale: null,
            max_qty:            Math.round(parseFloat(it.quantity)) || null,
          }));
          setRows(prefilled);
          rowNextId.current = prefilled.length + 1;
        }
      }
    }).catch(() => {}).finally(() => { setSourceLoading(false); dispatch(stopLoading("credit-note-form")); });
  }, [sourceInvoiceId]);

  // ── Load series when location is known ────────────────────────────────────
  const applySeriesSelection = useCallback(async (series: SeriesItem) => {
    setSelectedSeriesId(series.id);
    selectedSeriesIdRef.current = series.id;

    const mod = series.modules_config?.modules?.find((m) => m.module === "CreditNote");
    if (mod) {
      const padLen = mod.starting_number.length;
      const numStr = String(mod.current_number).padStart(padLen, "0");
      setConfigPrefix(mod.prefix);
      setConfigNextNumber(numStr);
      setCreditNoteNumber(`${mod.prefix}${numStr}`);
    }

    try {
      const { data } = await axios.get<{ success: boolean; data?: { invoice_number: string; prefix: string; current_number: number; pad_length: number } }>(
        `/api/series/${series.id}/next-number`,
        { params: { module: "CreditNote" } },
      );
      if (data.success && data.data && selectedSeriesIdRef.current === series.id) {
        setConfigPrefix(data.data.prefix);
        setConfigNextNumber(String(data.data.current_number).padStart(data.data.pad_length, "0"));
        setCreditNoteNumber(data.data.invoice_number);
      }
    } catch { /* keep cache-seeded value */ }
  }, []);

  useEffect(() => {
    if (!locationId) return;
    setSelectedSeriesId(null);
    selectedSeriesIdRef.current = null;
    setSeriesOptions([]);
    fetchSeriesForLocation(locationId).then((res) => {
      if (!res.success) return;
      const options = res.data;
      setSeriesOptions(options);
      const locationSpecific = options.filter((s) => !s.is_system_default);
      const toSelect = locationSpecific.length === 1
        ? locationSpecific[0]
        : options.find((s) => s.is_system_default) ?? options[0] ?? null;
      if (toSelect) applySeriesSelection(toSelect);
    }).catch(() => {});
  }, [locationId, applySeriesSelection]);

  // Refresh: bust series cache and re-load series for the current location
  const handleRefresh = useCallback(async () => {
    bustSeriesLists();
    if (locationId) {
      const res = await fetchSeriesForLocation(locationId).catch(() => null);
      if (!res?.success) return;
      const options = res.data;
      setSeriesOptions(options);
      const toSelect = options.find((s) => !s.is_system_default) ?? options.find((s) => s.is_system_default) ?? options[0] ?? null;
      if (toSelect) applySeriesSelection(toSelect);
    }
  }, [locationId, applySeriesSelection]);

  // Mark page ready when source loading completes
  useEffect(() => { if (!sourceLoading) setPageReady(true); }, [sourceLoading]);

  // ── Settings ───────────────────────────────────────────────────────────────
  useEffect(() => {
    getSettings<ProductConfiguration>("products")
      .then((data) => setDecimalRate(data.decimal_rate ?? 2))
      .catch(() => {});
  }, []);

  // ── Refresh stock when location changes ────────────────────────────────────
  useEffect(() => {
    if (!locationId) return;
    rows.forEach((row) => {
      if (!row.item_id) return;
      fetchItemStock(row.item_id).then((res) => {
        if (!res.success) return;
        const entry = res.data.find((s) => s.location_id === locationId);
        updateRow(row.id, "stock_on_hand",      entry ? String(entry.stock_on_hand)      : null);
        updateRow(row.id, "available_for_sale", entry ? String(entry.available_for_sale) : null);
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId]);

  // ── Unsaved-changes guard ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!isDirtyRef.current) return;
      const anchor = (e.target as Element).closest("a") as HTMLAnchorElement | null;
      if (!anchor?.href) return;
      let url: URL;
      try { url = new URL(anchor.href); } catch { return; }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;
      e.preventDefault(); e.stopPropagation();
      const path = url.pathname + url.search + url.hash;
      pendingNavRef.current = () => navigate(path);
      setShowUnsavedModal(true);
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [navigate]);

  const tryNavigate = useCallback((action: () => void) => {
    if (isDirtyRef.current) { pendingNavRef.current = action; setShowUnsavedModal(true); }
    else action();
  }, []);

  useEffect(() => {
    if (!drafterOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest(".btn-group")) setDrafterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [drafterOpen]);

  // ── Item drop handlers ─────────────────────────────────────────────────────
  const loadItemDropItems = useCallback(async (q: string) => {
    setItemDropLoading(true);
    const res = await fetchItems({ search: q, per_page: 30 });
    setItemDropItems(res.success ? res.data.data : []);
    setItemDropLoading(false);
  }, []);

  const toggleItemDrop = (rowId: number) => {
    if (itemOpenId === rowId) { setItemOpenId(null); setItemDropPos(null); return; }
    const el = itemInputRefs.current[rowId];
    if (el) {
      const rect = el.getBoundingClientRect();
      setItemDropPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, width: rect.width });
    }
    setItemSearchText((s) => ({ ...s, [rowId]: "" }));
    setItemOpenId(rowId);
    if (!invoiceItems) loadItemDropItems("");
  };

  const clearItemRow = (rowId: number) => {
    updateRow(rowId, "item_id", null); updateRow(rowId, "item_name", "");
    updateRow(rowId, "item_image", null); updateRow(rowId, "rate", "0.00");
    updateRow(rowId, "base_rate", "0.00"); updateRow(rowId, "gst_rate", "0");
    updateRow(rowId, "stock_on_hand", null); updateRow(rowId, "available_for_sale", null);
    updateRow(rowId, "max_qty", null);
    setItemSearchText((s) => { const n = { ...s }; delete n[rowId]; return n; });
    setItemImgErrors((s) => { const n = { ...s }; delete n[rowId]; return n; });
  };

  useEffect(() => {
    if (itemOpenId === null) return;
    const handler = (e: MouseEvent) => {
      const wrapEl   = itemWrapRefs.current[itemOpenId];
      const portalEl = itemPortalRef.current;
      if (wrapEl && !wrapEl.contains(e.target as Node) && (!portalEl || !portalEl.contains(e.target as Node))) {
        setItemOpenId(null); setItemDropPos(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [itemOpenId]);

  // ── Bulk add ───────────────────────────────────────────────────────────────
  const loadBulkItems = useCallback(async (q: string, loc?: number | null) => {
    setBulkLoading(true); setBulkStocks({});
    const res = await fetchItems({ search: q, per_page: 50 });
    const items = res.success ? res.data.data : [];
    setBulkItems(items); setBulkLoading(false);
    if (loc && items.length > 0) {
      fetchStockBatch(items.map((it) => it.id), loc).then((stockRes) => {
        if (!stockRes.success) return;
        const map: Record<number, string | null> = {};
        items.forEach((it) => { map[it.id] = stockRes.data[String(it.id)] ?? null; });
        setBulkStocks(map);
      });
    }
  }, []);

  const openBulkModal = () => {
    setBulkSearch(""); setBulkSelected({}); setBulkItems([]); setBulkStocks({});
    setShowBulkModal(true); loadBulkItems("", locationId);
  };

  const toggleBulkItem = (itemId: number) => {
    setBulkSelected((prev) => {
      if (prev[itemId] !== undefined) { const next = { ...prev }; delete next[itemId]; return next; }
      return { ...prev, [itemId]: "1" };
    });
  };

  const handleAddBulk = async () => {
    const entries = Object.entries(bulkSelected).map(([id, qty]) => ({ id: Number(id), qty }));
    if (entries.length === 0) return;
    markDirty();
    const alreadyUsed = new Set(rows.filter((r) => r.item_id !== null).map((r) => r.item_id as number));
    setRows((prev) => prev.filter((r) => r.item_id !== null || prev.length === 1));
    for (const { id, qty } of entries) {
      if (alreadyUsed.has(id)) continue;
      alreadyUsed.add(id);
      const itemRecord = bulkItems.find((it) => it.id === id);
      const newRowId   = rowNextId.current++;
      setRows((prev) => [...prev.filter((r) => r.item_id !== null),
        { id: newRowId, item_id: id, item_name: itemRecord?.name ?? "", item_image: null, quantity: qty || "1", rate: "0.00", base_rate: "0.00", gst_rate: "0", stock_on_hand: null, available_for_sale: null, max_qty: null },
      ]);
      fetchItem(id).then((res) => {
        if (!res.success) return;
        const d = res.data as Record<string, unknown>;
        const baseRateVal = parseFloat(String(d.selling_price ?? "0")).toFixed(decimalRate);
        updateRow(newRowId, "item_image", (d.image_path as string | null | undefined) ?? null);
        updateRow(newRowId, "base_rate", baseRateVal);
        updateRow(newRowId, "gst_rate", String(d.gst_rate ?? "0"));
        updateRow(newRowId, "rate", baseRateVal);
      });
      if (locationId) {
        fetchItemStock(id).then((res) => {
          if (!res.success) return;
          const entry = res.data.find((s) => s.location_id === locationId);
          updateRow(newRowId, "stock_on_hand",      entry != null ? String(entry.stock_on_hand)      : null);
          updateRow(newRowId, "available_for_sale", entry != null ? String(entry.available_for_sale) : null);
        });
      }
    }
    setShowBulkModal(false);
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!customerId)               errs.customer_id      = "Customer is required.";
    if (!creditNoteNumber.trim())  errs.credit_note_number = "Credit note number is required.";
    if (cnNumDuplicate)            errs.credit_note_number = "This credit note number is already in use.";
    const filledRows = rows.filter((r) => r.item_id || r.item_name.trim());
    if (filledRows.length === 0)   errs.items = "At least one line item is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Build payload ──────────────────────────────────────────────────────────
  const buildPayload = (status: "issued" | "draft") => {
    const filledRows = rows.filter((r) => r.item_id || r.item_name.trim());
    return {
      credit_note_number: creditNoteNumber.trim(),
      status,
      customer_id:        customerId,
      location_id:        locationId,
      series_id:          selectedSeriesId,
      source_invoice_id:  sourceInvoiceId,
      credit_note_date:   new Date().toISOString().split("T")[0],
      salesperson:        salesperson.trim() || null,
      sub_total:          subTotal,
      discount_type:      discountType,
      discount_value:     parseFloat(discount) || 0,
      discount_amount:    discountAmt,
      tax_type:           selectedTax ? taxType : null,
      tax_id:             selectedTaxEntry?.id ?? null,
      tax_rate:           taxRate || null,
      tax_amount:         signedTaxAmt,
      charges_json:       chargeRows.filter((r) => r.amount).map((r) => ({ label: r.label, amount: parseFloat(r.amount) || 0 })),
      total_charges:      totalCharges,
      grand_total:        grandTotal,
      customer_notes:     customerNotes.trim() || null,
      terms_conditions:   termsConditions.trim() || null,
      items: filledRows.map((r, i) => {
        const qty  = parseFloat(r.quantity) || 0;
        const rate = parseFloat(r.rate)     || 0;
        const gst  = parseFloat(r.gst_rate) || 0;
        return {
          item_id:      r.item_id,
          item_name:    r.item_name,
          quantity:     qty,
          unit_price:   rate,
          base_rate:    parseFloat(r.base_rate) || 0,
          gst_rate:     gst,
          gst_amount:   parseFloat(((qty * rate * gst) / 100).toFixed(decimalRate)),
          amount:       parseFloat((qty * rate).toFixed(decimalRate)),
          sort_order:   i,
        };
      }),
    };
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = (status: "issued" | "draft" = "issued") => {
    if (!validate()) { showToast("Please fill in all required fields before saving.", "error"); return; }
    if (cfPanelRef.current && !cfPanelRef.current.validate()) {
      showToast("Please fill in all required custom fields before saving.", "error"); return;
    }
    pendingSaveStatusRef.current = status;
    // Drafts never release credits — skip the confirmation modal
    if (status === "draft") { executeSave(false); return; }
    setShowCreditModal(true);
  };

  const executeSave = async (releaseCredit: boolean) => {
    setShowCreditModal(false);
    const status = pendingSaveStatusRef.current;
    setSaving(true);
    try {
      const payload   = { ...buildPayload(status), release_credit: releaseCredit };
      const { data }  = await axios.post<{ success: boolean; data: { id: number }; message?: string }>("/api/credit-notes", payload);
      if (!data.success) { showToast(data.message ?? "Failed to save credit note.", "error"); return; }

      if (attachedFiles.length > 0) {
        for (const file of attachedFiles) {
          const form = new FormData();
          form.append("file", file);
          try {
            await axios.post(`/api/credit-notes/${data.data.id}/attachments`, form);
          } catch {
            showToast("Credit note saved, but one or more attachments failed to upload.", "error");
            clearDirty();
            emitMutation("credit-notes:mutated");
            setTimeout(() => navigate(`/credit-notes/${data.data.id}`), 800);
            return;
          }
        }
      }

      clearDirty();
      showToast("Credit note saved successfully!", "success");
      emitMutation("credit-notes:mutated");
      setTimeout(() => navigate(`/credit-notes/${data.data.id}`), 800);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        const body = err.response.data as { message?: string; errors?: Record<string, string[]> };
        showToast(body.message ?? "Failed to save credit note.", "error");
        if (body.errors) {
          const mapped: Record<string, string> = {};
          Object.entries(body.errors).forEach(([k, v]) => { mapped[k] = v[0]; });
          setErrors(mapped);
        }
      } else {
        showToast("Network error. Please check your connection.", "error");
      }
    } finally { setSaving(false); }
  };

  // ── Configure CN# modal save ───────────────────────────────────────────────
  const openConfigModal = () => {
    const series = seriesOptions.find((s) => s.id === selectedSeriesId);
    if (series) {
      const mod = series.modules_config?.modules?.find((m) => m.module === "CreditNote");
      if (mod) {
        setConfigPrefix(mod.prefix);
        setConfigNextNumber(String(mod.current_number).padStart(mod.starting_number.length, "0"));
      }
    }
    setConfigModalOpen(true);
  };

  const saveConfigModal = () => {
    if (configMode === "auto") setCreditNoteNumber(`${configPrefix}${configNextNumber}`);
    setConfigModalOpen(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        .invoice-fields-row {
          display: flex; align-items: flex-start; flex-wrap: wrap; gap: 16px;
        }
        .invoice-field-customer { flex: 0 0 480px; min-width: 0; }
        .invoice-field-location { flex: 0 0 340px; min-width: 0; }
        @media (max-width: 767px) {
          .invoice-field-customer { flex: 1 1 100%; }
          .invoice-field-location { flex: 1 1 100%; }
        }
      `}</style>

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

      <div className="page-wrapper">
        <div className="content">
          <PageHeader title="New Credit Note" showModuleTile={false} showExport={false} showClose
            onRefresh={handleRefresh}
            onClose={() => tryNavigate(() => (window.history.length > 1 ? navigate(-1) : navigate("/")))} />

          <div className="row" onChangeCapture={markDirty}>
            <div className="col-12">
              <div className="card">
                <div className="card-body">

                  {/* Customer + Location (read-only) */}
                  <div className="invoice-fields-row">
                    <div className="invoice-field-customer">
                      <label className="form-label fw-medium fs-14 text-danger">Customer Name <span>*</span></label>
                      <div className={errors.customer_id ? "is-invalid" : undefined}>
                        <input type="text" className={`form-control${errors.customer_id ? " is-invalid" : ""}`}
                          value={customerName} readOnly
                          style={{ background: "#f8f9fa", cursor: "default", fontWeight: 500 }} />
                      </div>
                      {errors.customer_id && <div className="invalid-feedback d-block">{errors.customer_id}</div>}
                    </div>
                    <div className="invoice-field-location">
                      <label className="form-label fw-medium fs-14">Location</label>
                      <input type="text" className="form-control" value={locationName} readOnly
                        style={{ background: "#f8f9fa", cursor: "default" }} />
                    </div>
                  </div>

                  <div className="border-top mt-4" />

                  {/* Form fields */}
                  <div className="pt-4">

                    {/* Credit Note # */}
                    <div className="row mb-3 align-items-center">
                      <label className="col-sm-2 col-form-label fw-medium fs-14 text-danger">
                        Credit Note#&nbsp;<span>*</span>
                      </label>
                      <div className="col-sm-4 mb-2 mb-sm-0">
                        <CommonSelect
                          className="select"
                          options={seriesOptions.map((s) => ({
                            value: String(s.id),
                            label: s.is_system_default ? `${s.name} (Default)` : s.name,
                          }))}
                          value={selectedSeriesId !== null
                            ? (() => {
                                const s = seriesOptions.find((x) => x.id === selectedSeriesId);
                                return s ? { value: String(s.id), label: s.is_system_default ? `${s.name} (Default)` : s.name } : null;
                              })()
                            : null}
                          onChange={(opt: Option | null) => {
                            if (!opt) return;
                            markDirty();
                            const s = seriesOptions.find((x) => String(x.id) === opt.value);
                            if (s) applySeriesSelection(s);
                          }}
                          placeholder="Select Series"
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                        />
                      </div>
                      <div className="col-sm-3">
                        <div className={`input-group${errors.credit_note_number || cnNumDuplicate ? " is-invalid" : ""}`}>
                          <input type="text" className={`form-control${errors.credit_note_number || cnNumDuplicate ? " is-invalid" : ""}`}
                            value={creditNoteNumber} maxLength={50} aria-label="Credit note number"
                            readOnly={configMode === "auto"}
                            style={configMode === "auto" ? { background: "#f8f9fa", cursor: "default" } : undefined}
                            onChange={(e) => {
                              if (configMode !== "manual") return;
                              markDirty(); setCreditNoteNumber(e.target.value); setCnNumDuplicate(false); clr("credit_note_number");
                            }}
                            onBlur={async () => {
                              if (configMode !== "manual" || !creditNoteNumber.trim()) return;
                              setCnNumChecking(true);
                              try {
                                const { data } = await axios.get<{ success: boolean; data?: { available: boolean } }>(
                                  "/api/credit-notes/check-number",
                                  { params: { credit_note_number: creditNoteNumber.trim() } }
                                );
                                const dup = data.success ? !(data.data?.available) : false;
                                setCnNumDuplicate(dup);
                                if (dup) setErrors((prev) => ({ ...prev, credit_note_number: "This credit note number is already in use." }));
                              } catch { /* ignore */ }
                              finally { setCnNumChecking(false); }
                            }}
                          />
                          {cnNumChecking && <span className="input-group-text"><span className="spinner-border spinner-border-sm" /></span>}
                          <button type="button" className="btn btn-outline-light" title="Configure" onClick={openConfigModal}>
                            <i className="ti ti-settings fs-15" />
                          </button>
                        </div>
                        {(errors.credit_note_number || cnNumDuplicate) && (
                          <div className="invalid-feedback d-block">{errors.credit_note_number ?? "This credit note number is already in use."}</div>
                        )}
                      </div>
                    </div>

                    <div className="border-top mt-2 mb-4" />

                    {/* Salesperson */}
                    <div className="row mb-3 align-items-center">
                      <label className="col-sm-2 col-form-label fw-medium fs-14">Salesperson</label>
                      <div className="col-sm-4">
                        <EntityField label="Salesperson" value={salesperson}
                          onChange={(name) => { markDirty(); setSalesperson(name); }} items={[]} />
                      </div>
                    </div>

                    {/* Items table */}
                    <div className="border-top pt-4 mb-4">
                      <h6 className="fw-semibold fs-15 mb-3">Item Details</h6>

                      <div style={{ overflowX: "auto" }}>
                        <div className="border rounded overflow-hidden" style={{ minWidth: 878 }}>
                          {/* Header */}
                          <div className="d-flex align-items-stretch border-bottom" style={{ background: "#f8f9fa" }}>
                            <div className="d-none d-sm-flex align-items-center px-3 py-2" style={{ width: 80, flexShrink: 0, borderRight: "1px solid #dee2e6" }}>
                              <span className="fw-semibold fs-12 text-uppercase">Image</span>
                            </div>
                            <div className="d-flex align-items-center px-3 py-2" style={{ flex: 1, borderRight: "1px solid #dee2e6" }}>
                              <span className="fw-semibold fs-12 text-uppercase">Item Details</span>
                            </div>
                            <div className="d-flex align-items-center px-3 py-2" style={{ width: 110, flexShrink: 0, borderRight: "1px solid #dee2e6" }}>
                              <span className="fw-semibold fs-12 text-uppercase">Qty</span>
                            </div>
                            <div className="d-flex align-items-center px-3 py-2" style={{ width: 170, flexShrink: 0, borderRight: "1px solid #dee2e6" }}>
                              <span className="fw-semibold fs-12 text-uppercase">Rate (₹)</span>
                            </div>
                            <div className="d-flex align-items-center px-3 py-2" style={{ width: 120, flexShrink: 0, borderRight: "1px solid #dee2e6" }}>
                              <span className="fw-semibold fs-12 text-uppercase">GST (₹)</span>
                            </div>
                            <div className="d-flex align-items-center px-3 py-2" style={{ width: 150, flexShrink: 0 }}>
                              <span className="fw-semibold fs-12 text-uppercase">Amount (₹)</span>
                            </div>
                            <div style={{ width: 48, flexShrink: 0 }} />
                          </div>

                          {errors.items && (
                            <div className="d-flex align-items-center gap-2 px-4 py-3 border-bottom" style={{ background: "#fff8f8" }}>
                              <i className="ti ti-alert-circle text-danger fs-16" />
                              <span className="fs-13 text-danger">{errors.items}</span>
                            </div>
                          )}

                          {/* Rows */}
                          {rows.map((row) => (
                            <div key={row.id} className="d-flex align-items-stretch border-bottom">
                              {/* Image */}
                              <div className="d-none d-sm-flex align-items-center justify-content-center" style={{ width: 80, flexShrink: 0, borderRight: "1px solid #dee2e6", padding: "12px" }}>
                                <div className="border rounded d-flex align-items-center justify-content-center overflow-hidden" style={{ width: 56, height: 56, background: "#f8f9fa" }}>
                                  {row.item_image && !itemImgErrors[row.id] ? (
                                    <img src={row.item_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                      onError={() => setItemImgErrors((p) => ({ ...p, [row.id]: true }))} />
                                  ) : (
                                    <i className="ti ti-photo text-muted" style={{ fontSize: 22 }} />
                                  )}
                                </div>
                              </div>
                              {/* Item selector */}
                              <div className="d-flex flex-column justify-content-center"
                                style={{ flex: 1, borderRight: "1px solid #dee2e6", padding: "12px" }}
                                ref={(el) => { itemWrapRefs.current[row.id] = el; }}>
                                <div className="input-group w-100" ref={(el) => { itemInputRefs.current[row.id] = el; }}>
                                  <input type="text" className="form-control" placeholder="Select or Add Item"
                                    value={row.item_name} readOnly style={{ cursor: "pointer" }}
                                    onClick={() => toggleItemDrop(row.id)} />
                                  {row.item_name && (
                                    <button type="button" className="btn btn-outline-light" title="Clear" onClick={() => clearItemRow(row.id)}>
                                      <i className="ti ti-x" style={{ fontSize: 13 }} />
                                    </button>
                                  )}
                                  <button type="button" className="btn btn-outline-light" onClick={() => toggleItemDrop(row.id)}>
                                    <i className={`ti ti-chevron-${itemOpenId === row.id ? "up" : "down"}`} />
                                  </button>
                                </div>
                                <span style={{ display: "block", fontSize: 11, lineHeight: 1.3, marginTop: 4, minHeight: "28px", visibility: "hidden" }}>x</span>
                              </div>
                              {/* Qty */}
                              <div className="d-flex flex-column justify-content-center" style={{ width: 110, flexShrink: 0, borderRight: "1px solid #dee2e6", padding: "16px 12px" }}>
                                <input type="number" className="form-control text-center" min={1} step={1}
                                  max={row.max_qty ?? undefined}
                                  value={row.quantity}
                                  onChange={(e) => updateRow(row.id, "quantity", e.target.value)}
                                  onBlur={(e) => {
                                    const v = Math.round(parseFloat(e.target.value));
                                    if (!e.target.value.trim() || isNaN(v) || v <= 0) {
                                      updateRow(row.id, "quantity", "1");
                                    } else if (row.max_qty !== null && v > row.max_qty) {
                                      updateRow(row.id, "quantity", String(Math.round(row.max_qty)));
                                    } else {
                                      updateRow(row.id, "quantity", String(v));
                                    }
                                  }} />
                                <span style={{ display: "block", fontSize: 12, lineHeight: 1.3, marginTop: 10, minHeight: "28px", textAlign: "center", visibility: (row.max_qty !== null || row.available_for_sale !== null) ? "visible" : "hidden", color: row.max_qty !== null ? "#dc2626" : parseFloat(row.available_for_sale ?? "0") < 0 ? "#ef4444" : "#9ca3af" }}>
                                  {row.max_qty !== null ? `Max: ${row.max_qty}` : `Available: ${row.available_for_sale ?? "0"}`}
                                </span>
                              </div>
                              {/* Rate */}
                              <div className="d-flex flex-column justify-content-center" style={{ width: 170, flexShrink: 0, borderRight: "1px solid #dee2e6", padding: "12px" }}>
                                <input type="number" className="form-control" min={0} step={(1 / Math.pow(10, decimalRate)).toString()}
                                  value={row.rate}
                                  readOnly={invoiceItems !== null}
                                  style={invoiceItems !== null ? { background: "#f8f9fa", cursor: "default" } : undefined}
                                  onChange={(e) => { if (invoiceItems !== null) return; updateRow(row.id, "rate", e.target.value); }}
                                  onBlur={(e) => {
                                    if (invoiceItems !== null) return;
                                    const v = parseFloat(e.target.value);
                                    updateRow(row.id, "rate", (!e.target.value.trim() || isNaN(v) || v < 0 ? 0 : v).toFixed(decimalRate));
                                  }} />
                                <span style={{ display: "block", fontSize: 11, marginTop: 4, minHeight: "28px", visibility: "hidden" }}>x</span>
                              </div>
                              {/* GST */}
                              <div className="d-flex flex-column justify-content-center" style={{ width: 120, flexShrink: 0, borderRight: "1px solid #dee2e6", padding: "12px" }}>
                                <div className="form-control bg-light text-muted" style={{ userSelect: "none", cursor: "default" }}>
                                  {(() => { const qty = parseFloat(row.quantity) || 0; const rate = parseFloat(row.rate) || 0; const gst = parseFloat(row.gst_rate) || 0; return (qty * rate * gst / 100).toFixed(decimalRate); })()}
                                </div>
                                <span style={{ display: "block", fontSize: 11, marginTop: 4, minHeight: "28px", visibility: "hidden" }}>x</span>
                              </div>
                              {/* Amount */}
                              <div className="d-flex flex-column justify-content-center" style={{ width: 150, flexShrink: 0, padding: "12px" }}>
                                <div className="form-control bg-light text-muted" style={{ userSelect: "none", cursor: "default" }}>
                                  {((parseFloat(row.quantity) || 0) * (parseFloat(row.rate) || 0)).toFixed(decimalRate)}
                                </div>
                                <span style={{ display: "block", fontSize: 11, marginTop: 4, minHeight: "28px", visibility: "hidden" }}>x</span>
                              </div>
                              {/* Remove */}
                              <div className="d-flex flex-column align-items-center justify-content-center" style={{ width: 48, flexShrink: 0 }}>
                                <button type="button" className="btn p-0 border-0 bg-transparent text-danger" title="Remove"
                                  disabled={rows.length === 1}
                                  onClick={() => { markDirty(); removeRow(row.id); }}>
                                  <i className="ti ti-circle-x fs-18" />
                                </button>
                                <span style={{ display: "block", fontSize: 11, marginTop: 4, minHeight: "28px", visibility: "hidden" }}>x</span>
                              </div>
                            </div>
                          ))}

                          {/* Footer */}
                          <div style={{ background: "#fafafa" }}>
                            <div className="d-flex align-items-center gap-3 pt-2 pb-2 px-3">
                              <button type="button" className="btn btn-link p-0 fs-13 text-danger d-flex align-items-center gap-1" style={{ textDecoration: "none", whiteSpace: "nowrap" }}
                                onClick={() => { markDirty(); addRow(); }}>
                                <i className="ti ti-circle-plus fs-15" />Add New Row
                              </button>
                              {!invoiceItems && (
                                <button type="button" className="btn btn-link p-0 fs-13 text-danger d-flex align-items-center gap-1" style={{ textDecoration: "none", whiteSpace: "nowrap" }}
                                  onClick={openBulkModal}>
                                  <i className="ti ti-playlist-add fs-15" />Add Bulk Items
                                </button>
                              )}
                            </div>
                            <div className="d-flex align-items-center pb-2">
                              <div className="d-none d-sm-block" style={{ width: 80, flexShrink: 0 }} />
                              <div className="px-3" style={{ flex: 1, minWidth: 0 }}>
                                <span className="fs-13 text-muted fw-medium">Total (₹)</span>
                              </div>
                              <div style={{ width: 110, flexShrink: 0 }} />
                              <div style={{ width: 170, flexShrink: 0 }} />
                              <div style={{ width: 120, flexShrink: 0 }} />
                              <div className="px-3" style={{ width: 150, flexShrink: 0 }}>
                                <span className="fs-14 fw-semibold">{subTotal.toFixed(decimalRate)}</span>
                              </div>
                              <div style={{ width: 48, flexShrink: 0 }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Summary box */}
                    <div className="d-flex justify-content-end mt-4">
                      <div style={{ width: "100%", maxWidth: 400 }}>
                        <div className="border rounded p-3" style={{ background: "#fafafa" }}>
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="fs-14 fw-medium">Sub Total</span>
                            <span className="fs-14 fw-medium">{subTotal.toFixed(decimalRate)}</span>
                          </div>
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <span className="fs-14 fw-medium">Discount</span>
                            <div className="d-flex align-items-center gap-2">
                              <div className="input-group" style={{ width: 170 }}>
                                <input type="number" className="form-control text-end" min={0} step="any" style={{ height: 38 }}
                                  value={discount} onChange={(e) => setDiscount(e.target.value)}
                                  onBlur={(e) => { if (!e.target.value.trim() || isNaN(parseFloat(e.target.value))) setDiscount("0"); }} />
                                <select className="form-select" style={{ maxWidth: 65, height: 38 }} value={discountType}
                                  onChange={(e) => setDiscountType(e.target.value as "amount" | "percent")}>
                                  <option value="amount">₹</option>
                                  <option value="percent">%</option>
                                </select>
                              </div>
                              <span className="fs-14 fw-medium" style={{ minWidth: 50, textAlign: "right", whiteSpace: "nowrap" }}>{discountAmt.toFixed(decimalRate)}</span>
                            </div>
                          </div>

                          {/* TDS / TCS */}
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="d-flex align-items-center gap-3">
                              <div className="form-check mb-0">
                                <input className="form-check-input" type="radio" id="cn-tax-tds" checked={taxType === "tds"} onChange={() => setTaxType("tds")} />
                                <label className="form-check-label fs-14 fw-medium" htmlFor="cn-tax-tds">TDS</label>
                              </div>
                              <div className="form-check mb-0">
                                <input className="form-check-input" type="radio" id="cn-tax-tcs" checked={taxType === "tcs"} onChange={() => setTaxType("tcs")} />
                                <label className="form-check-label fs-14 fw-medium" htmlFor="cn-tax-tcs">TCS</label>
                              </div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <div style={{ width: 170 }}>
                                <EntityField label="Tax" value={selectedTax}
                                  onChange={(name) => { markDirty(); setSelectedTax(name); }}
                                  items={taxItems.map((t) => ({ id: t.id, name: t.name, mobile: t.rate ? `${t.rate}%` : undefined }))}
                                  onManage={() => setShowTaxModal(true)} manageLabel="Manage Taxes" />
                              </div>
                              <span className="fs-14 fw-medium" style={{ minWidth: 50, textAlign: "right", whiteSpace: "nowrap", color: signedTaxAmt < 0 ? "#E41F07" : signedTaxAmt > 0 ? "#16a34a" : "#6b7280" }}>
                                {signedTaxAmt > 0 ? `+${signedTaxAmt.toFixed(decimalRate)}` : signedTaxAmt < 0 ? `-${Math.abs(signedTaxAmt).toFixed(decimalRate)}` : (0).toFixed(decimalRate)}
                              </span>
                            </div>
                          </div>

                          {/* Charges */}
                          {chargeRows.map((row, idx) => (
                            <div key={row.id} className="d-flex align-items-center justify-content-between mb-2" style={{ gap: 8 }}>
                              <div className="d-flex align-items-center gap-2" style={{ flex: "1 1 auto", minWidth: 0 }}>
                                {idx === 0 ? (
                                  <span className="fs-14 fw-medium" style={{ minHeight: 38, display: "flex", alignItems: "center" }}>{row.label}</span>
                                ) : row.editingLabel ? (
                                  <input autoFocus type="text" className="form-control" style={{ height: 38, width: 130, fontSize: 13 }}
                                    value={row.label}
                                    onChange={(e) => setChargeRows((p) => p.map((r) => r.id === row.id ? { ...r, label: e.target.value } : r))}
                                    onBlur={() => setChargeRows((p) => p.map((r) => r.id === row.id ? { ...r, editingLabel: false, label: r.label.trim() || "Charge" } : r))}
                                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setChargeRows((p) => p.map((r) => r.id === row.id ? { ...r, editingLabel: false, label: r.label.trim() || "Charge" } : r)); }} />
                                ) : (
                                  <span className="fs-14 fw-medium" style={{ cursor: "pointer", borderBottom: "1.5px dashed #d1d5db", minHeight: 38, display: "flex", alignItems: "center" }}
                                    onClick={() => setChargeRows((p) => p.map((r) => r.id === row.id ? { ...r, editingLabel: true } : r))}>
                                    {row.label}
                                  </span>
                                )}
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                <input type="number" className="form-control text-end" step="any" style={{ width: 170, height: 38 }}
                                  value={row.amount} placeholder="0.00"
                                  onChange={(e) => setChargeRows((p) => p.map((r) => r.id === row.id ? { ...r, amount: e.target.value } : r))} />
                                <span className="fs-14 fw-medium" style={{ minWidth: 50, textAlign: "right", whiteSpace: "nowrap" }}>
                                  {(parseFloat(row.amount) || 0).toFixed(decimalRate)}
                                </span>
                                {idx > 0 && (
                                  <button type="button" className="btn p-0 border-0 bg-transparent text-danger" title="Remove"
                                    onClick={() => setChargeRows((p) => p.filter((r) => r.id !== row.id))}>
                                    <i className="ti ti-circle-x fs-16" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}

                          {chargeRows.length < 5 && (
                            <div className="mt-1">
                              <button type="button" className="btn btn-link p-0 fs-13 text-danger d-flex align-items-center gap-1" style={{ textDecoration: "none", whiteSpace: "nowrap" }}
                                onClick={() => setChargeRows((p) => [...p, { id: chargeNextId.current++, label: "Charge", amount: "", editingLabel: false }])}>
                                <i className="ti ti-circle-plus fs-15" />Add Charge
                              </button>
                            </div>
                          )}

                          <div className="border-top mt-3 pt-3">
                            <div className="d-flex align-items-center justify-content-between">
                              <span className="fs-15 fw-semibold">Total (₹)</span>
                              <span className="fs-15 fw-bold">{grandTotal.toFixed(decimalRate)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="border-top mt-4 pt-4">
                      <div className="row g-4">
                        <div className="col-md-6">
                          <label className="form-label fw-medium fs-14 mb-1">Customer Notes</label>
                          <textarea className="form-control" rows={3} placeholder="Thanks for your business."
                            value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} />
                          <p className="fs-12 text-muted mt-1 mb-0">Will be displayed on the credit note</p>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-medium fs-14 mb-1">Terms &amp; Conditions</label>
                          <textarea className="form-control" rows={3} placeholder="Enter the terms and conditions"
                            value={termsConditions} onChange={(e) => setTermsConditions(e.target.value)} />
                        </div>
                      </div>
                    </div>

                    {/* Attachments */}
                    <div className="border-top mt-4 pt-4">
                      <p className="form-label fw-medium fs-14 mb-2">Attach File(s) to Credit Note</p>
                      <label htmlFor="cn_attach_input" className="border rounded d-flex align-items-center gap-3 px-3 position-relative w-100"
                        style={{ cursor: "pointer", background: "#fafafa", minHeight: 56 }}>
                        <i className="ti ti-paperclip fs-20 text-muted flex-shrink-0" />
                        {attachedFiles.length > 0 ? (
                          <div className="d-flex flex-column py-2">
                            <span className="fw-medium fs-13">{attachedFiles.length} file{attachedFiles.length > 1 ? "s" : ""} attached</span>
                            <small className="text-muted">Click to add more</small>
                          </div>
                        ) : (
                          <div className="d-flex flex-column py-2">
                            <span className="fw-medium fs-13">Click to attach files</span>
                            <small className="text-muted">All files — up to 10 files, 10 MB each</small>
                          </div>
                        )}
                      </label>
                      <input id="cn_attach_input" ref={attachFileRef} type="file" multiple className="d-none"
                        onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
                        onChange={async (e) => {
                          const picked = Array.from(e.target.files ?? []);
                          const compressed = await compressPickedFiles(picked);
                          setAttachedFiles((prev) => [...prev, ...compressed].slice(0, 10));
                        }} />
                      {attachedFiles.length > 0 && (
                        <div className="mt-2 border rounded" style={{ background: "#fff" }}>
                          {attachedFiles.map((file, idx) => {
                            const { icon, color } = getFileIcon(file);
                            return (
                              <div key={idx} className={`d-flex align-items-center gap-2 px-3 py-2${idx < attachedFiles.length - 1 ? " border-bottom" : ""}`} style={{ fontSize: 13 }}>
                                <i className={`ti ${icon} fs-18 flex-shrink-0`} style={{ color }} />
                                <div className="flex-grow-1 overflow-hidden">
                                  <div className="fw-medium text-truncate">{file.name}</div>
                                  <div className="text-muted" style={{ fontSize: 11 }}>{formatFileSize(file.size)}</div>
                                </div>
                                <button type="button" className="btn btn-sm btn-link text-danger text-decoration-none ms-auto p-0 flex-shrink-0"
                                  onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))}>
                                  <i className="ti ti-x fs-16" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Additional Fields */}
                    <div className="border-top mt-4 pt-4">
                      <p className="form-label fw-medium fs-14 mb-3">Additional Fields</p>
                      <CustomFieldsPanel ref={cfPanelRef} module="credit_note" skipSystemFields />
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky action bar */}
        <div className="bg-white border-top d-flex align-items-center gap-2 px-4" style={{ position: "sticky", bottom: 0, zIndex: 100, height: 60 }}>
          <div className="btn-group position-relative">
            <button type="button" className="btn btn-danger" disabled={saving} onClick={() => handleSave("issued")}>
              {saving ? (<><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />Saving…</>) : "Save"}
            </button>
            <button type="button" className="btn btn-danger dropdown-toggle dropdown-toggle-split px-2" disabled={saving}
              onClick={() => setDrafterOpen((o) => !o)}>
              <span className="visually-hidden">Toggle dropdown</span>
            </button>
            {drafterOpen && (
              <div className="dropdown-menu show" style={{ position: "absolute", bottom: "100%", left: 0, top: "auto", minWidth: 180, marginBottom: 4 }}>
                <button type="button" className="dropdown-item" style={{ fontSize: 15, padding: "10px 20px" }}
                  onClick={() => { setDrafterOpen(false); handleSave("draft"); }}>
                  <i className="ti ti-file-text me-2" />Save as Draft
                </button>
              </div>
            )}
          </div>
          <button type="button" className="btn btn-outline-light" disabled={saving}
            onClick={() => tryNavigate(() => (window.history.length > 1 ? navigate(-1) : navigate("/")))}>
            Cancel
          </button>
          <div className="ms-auto d-flex flex-column align-items-end" style={{ lineHeight: 1.5 }}>
            <span className="fs-14 text-dark fw-semibold">Total Amount: ₹ {grandTotal.toFixed(decimalRate)}</span>
            <span className="fs-13 text-muted">Total Quantity: {totalQty % 1 === 0 ? totalQty : totalQty.toFixed(2)}</span>
          </div>
        </div>

        <Footer />
      </div>

      {/* Manage Taxes Modal */}
      <ManageTaxesModal show={showTaxModal} onHide={() => setShowTaxModal(false)} items={taxItems}
        onSave={(name, rate) => { const entry: TaxEntry = { id: taxNextId.current++, name, rate }; setTaxItems((prev) => [...prev, entry]); return entry; }}
        onUpdate={(id, name, rate) => { setTaxItems((prev) => prev.map((t) => t.id === id ? { ...t, name, rate } : t)); if (taxItems.find((t) => t.id === id)?.name === selectedTax) setSelectedTax(name); }}
        onDelete={(id) => { const deleted = taxItems.find((t) => t.id === id); setTaxItems((prev) => prev.filter((t) => t.id !== id)); if (deleted?.name === selectedTax) setSelectedTax(""); }}
        onSaveAndSelect={(entry) => setSelectedTax(entry.name)} />

      {/* Item search portal */}
      {itemOpenId !== null && itemDropPos !== null && createPortal(
        <div ref={itemPortalRef} className="bg-white border rounded shadow-sm"
          style={{ position: "absolute", top: itemDropPos.top, left: itemDropPos.left, width: itemDropPos.width, zIndex: 9999, minWidth: 220 }}>
          <div className="p-2 border-bottom">
            <input autoFocus type="text" className="form-control fs-14" style={{ height: 42 }} placeholder="Search Items…"
              value={itemSearchText[itemOpenId] ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setItemSearchText((s) => ({ ...s, [itemOpenId!]: v }));
                if (!invoiceItems) {
                  if (itemSearchTimer.current) clearTimeout(itemSearchTimer.current);
                  itemSearchTimer.current = setTimeout(() => loadItemDropItems(v), 300);
                }
              }} />
          </div>
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {(() => {
              if (invoiceItems !== null) {
                const usedNames = new Set(rows.filter((r) => r.id !== itemOpenId && r.item_name).map((r) => r.item_name));
                const searchTxt = (itemSearchText[itemOpenId!] ?? "").toLowerCase();
                const available = invoiceItems.filter((it) =>
                  !usedNames.has(it.item_name) && it.item_name.toLowerCase().includes(searchTxt)
                );
                return available.length === 0 ? (
                  <p className="text-muted fs-13 text-center py-2 mb-0">No results</p>
                ) : available.map((invItem, idx) => (
                  <div key={invItem.item_id ?? `fi-${idx}`} className="px-3 py-2 fs-15" style={{ cursor: "pointer", color: "#707070" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#E41F07"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#707070"; }}
                    onClick={() => {
                      markDirty();
                      const rowId = itemOpenId as number;
                      updateRow(rowId, "item_id",            invItem.item_id);
                      updateRow(rowId, "item_name",          invItem.item_name);
                      updateRow(rowId, "base_rate",          parseFloat(invItem.base_rate).toFixed(decimalRate));
                      updateRow(rowId, "rate",               parseFloat(invItem.unit_price).toFixed(decimalRate));
                      updateRow(rowId, "gst_rate",           invItem.gst_rate ?? "0");
                      updateRow(rowId, "quantity",           String(Math.round(parseFloat(invItem.quantity)) || 1));
                      updateRow(rowId, "max_qty",            Math.round(parseFloat(invItem.quantity)) || null);
                      updateRow(rowId, "stock_on_hand",      null);
                      updateRow(rowId, "available_for_sale", null);
                      setItemSearchText((s) => ({ ...s, [rowId]: invItem.item_name }));
                      setItemImgErrors((s) => { const n = { ...s }; delete n[rowId]; return n; });
                      setItemOpenId(null); setItemDropPos(null);
                      if (invItem.item_id && locationId) {
                        fetchItemStock(invItem.item_id).then((res) => {
                          if (res.success) {
                            const entry = res.data.find((s) => s.location_id === locationId);
                            updateRow(rowId, "stock_on_hand",      entry != null ? String(entry.stock_on_hand)      : null);
                            updateRow(rowId, "available_for_sale", entry != null ? String(entry.available_for_sale) : null);
                          }
                        });
                      }
                    }}>{invItem.item_name}</div>
                ));
              }
              const usedIds = new Set(rows.filter((r) => r.item_id !== null && r.id !== itemOpenId).map((r) => r.item_id as number));
              const available = itemDropItems.filter((item) => !usedIds.has(item.id));
              return itemDropLoading ? (
                <p className="text-muted fs-13 text-center py-2 mb-0">Loading…</p>
              ) : available.length === 0 ? (
                <p className="text-muted fs-13 text-center py-2 mb-0">No results</p>
              ) : available.map((item) => (
                <div key={item.id} className="px-3 py-2 fs-15" style={{ cursor: "pointer", color: "#707070" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#E41F07"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#707070"; }}
                  onClick={() => {
                    markDirty();
                    const rowId = itemOpenId as number;
                    updateRow(rowId, "item_id", item.id);
                    updateRow(rowId, "item_name", item.name);
                    setItemSearchText((s) => ({ ...s, [rowId]: item.name }));
                    setItemImgErrors((s) => { const n = { ...s }; delete n[rowId]; return n; });
                    setItemOpenId(null); setItemDropPos(null);
                    fetchItem(item.id).then((res) => {
                      let baseRateVal: string;
                      if (res.success) {
                        const d = res.data as Record<string, unknown>;
                        const refs = d.refs as Record<string, unknown> | null | undefined;
                        const gstObj = refs?.gst_rate as { rate?: string | number } | null | undefined;
                        baseRateVal = parseFloat(d.selling_price != null ? String(d.selling_price) : (item.selling_price ?? "0")).toFixed(decimalRate);
                        updateRow(rowId, "item_image", toStorageUrl(d.image as string | null));
                        updateRow(rowId, "base_rate", baseRateVal);
                        updateRow(rowId, "gst_rate", gstObj?.rate != null ? String(gstObj.rate) : "0");
                      } else {
                        baseRateVal = parseFloat(item.selling_price ?? "0").toFixed(decimalRate);
                        updateRow(rowId, "item_image", toStorageUrl(item.image));
                        updateRow(rowId, "base_rate", baseRateVal);
                        updateRow(rowId, "gst_rate", "0");
                      }
                      updateRow(rowId, "rate", baseRateVal);
                    });
                    if (item.item_type === "goods") {
                      fetchItemStock(item.id).then((res) => {
                        if (res.success && locationId) {
                          const entry = res.data.find((s) => s.location_id === locationId);
                          updateRow(rowId, "stock_on_hand",      entry != null ? String(entry.stock_on_hand)      : null);
                          updateRow(rowId, "available_for_sale", entry != null ? String(entry.available_for_sale) : null);
                        } else { updateRow(rowId, "stock_on_hand", null); updateRow(rowId, "available_for_sale", null); }
                      });
                    } else { updateRow(rowId, "stock_on_hand", null); updateRow(rowId, "available_for_sale", null); }
                  }}>{item.name}</div>
              ));
            })()}
          </div>
        </div>,
        document.body
      )}

      {/* Bulk Add Items modal */}
      <Modal show={showBulkModal} onHide={() => setShowBulkModal(false)} centered size="lg" backdropClassName="blurred-backdrop">
        <Modal.Header closeButton={false} style={{ padding: "20px 24px 18px", borderBottom: "1px solid #f1f5f9", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className="ti ti-playlist-add fs-18" style={{ color: "#ef4444" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 16, color: "#0f172a" }}>Add Bulk Items</p>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                {Object.keys(bulkSelected).length > 0
                  ? `${Object.keys(bulkSelected).length} item${Object.keys(bulkSelected).length > 1 ? "s" : ""} selected`
                  : "Select items and set quantities to add multiple at once."}
              </p>
            </div>
          </div>
          <button type="button" onClick={() => setShowBulkModal(false)}
            style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #fecaca", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}>
            <i className="ti ti-x" style={{ fontSize: 14, color: "#ef4444", lineHeight: 1 }} />
          </button>
        </Modal.Header>
        <div style={{ padding: "14px 24px 10px", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
          <div className="input-icon input-icon-start position-relative">
            <span className="input-icon-addon text-muted" style={{ left: 12 }}><i className="ti ti-search fs-15" /></span>
            <input autoFocus type="text" className="form-control ps-5" placeholder="Search items…" value={bulkSearch}
              onChange={(e) => {
                const v = e.target.value; setBulkSearch(v);
                if (bulkSearchTimer.current) clearTimeout(bulkSearchTimer.current);
                bulkSearchTimer.current = setTimeout(() => loadBulkItems(v, locationId), 300);
              }} />
          </div>
        </div>
        <Modal.Body style={{ padding: 0, maxHeight: "55vh", overflowY: "auto" }}>
          {(() => {
            const usedIds = new Set(rows.filter((r) => r.item_id !== null).map((r) => r.item_id as number));
            const available = bulkItems.filter((it) => !usedIds.has(it.id));
            if (bulkLoading) return <p className="text-muted fs-14 text-center py-4 mb-0">Loading…</p>;
            if (available.length === 0) return <p className="text-muted fs-14 text-center py-4 mb-0">No items found</p>;
            return available.map((item) => {
              const checked  = bulkSelected[item.id] !== undefined;
              const stockVal = bulkStocks[item.id];
              const stockQty = typeof stockVal === "string" ? parseFloat(stockVal) : null;
              return (
                <div key={item.id} className="d-flex align-items-center gap-3 px-4 border-bottom"
                  style={{ cursor: "pointer", background: checked ? "#fef2f2" : undefined, minHeight: 68, paddingTop: 14, paddingBottom: 14 }}
                  onClick={() => toggleBulkItem(item.id)}>
                  <input type="checkbox" className="form-check-input m-0 flex-shrink-0" checked={checked}
                    onChange={() => toggleBulkItem(item.id)} onClick={(e) => e.stopPropagation()} style={{ width: 18, height: 18 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="fs-15 d-block" style={{ fontWeight: checked ? 600 : 400 }}>{item.name}</span>
                    {locationId && (
                      stockVal === undefined ? <span className="fs-13" style={{ color: "#9ca3af" }}>Checking stock…</span>
                        : stockVal === null ? <span className="fs-13" style={{ color: "#9ca3af" }}>Not tracked</span>
                        : <span className="fs-13 fw-medium" style={{ color: stockQty! > 0 ? "#16a34a" : "#ef4444" }}>
                            {stockQty! > 0 ? `Stock: ${stockQty!.toFixed(decimalRate)}` : "Out of stock"}
                          </span>
                    )}
                  </div>
                  <div onClick={(e) => e.stopPropagation()} style={{ width: 156, flexShrink: 0 }}>
                    {checked ? (
                      <div className="input-group" style={{ height: 40 }}>
                        <button type="button" className="btn btn-outline-light" style={{ height: 40, width: 38, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                          onClick={(e) => { e.stopPropagation(); const cur = parseFloat(bulkSelected[item.id]) || 1; setBulkSelected((prev) => ({ ...prev, [item.id]: String(Math.max(1, cur - 1)) })); }}>
                          <i className="ti ti-minus fs-13" />
                        </button>
                        <input type="number" className="form-control text-center" min={1} step={1} value={bulkSelected[item.id]}
                          onChange={(e) => setBulkSelected((prev) => ({ ...prev, [item.id]: e.target.value }))}
                          onClick={(e) => e.stopPropagation()} style={{ height: 40, fontSize: 15 }} />
                        <button type="button" className="btn btn-outline-light" style={{ height: 40, width: 38, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                          onClick={(e) => { e.stopPropagation(); const cur = parseFloat(bulkSelected[item.id]) || 0; setBulkSelected((prev) => ({ ...prev, [item.id]: String(cur + 1) })); }}>
                          <i className="ti ti-plus fs-13" />
                        </button>
                      </div>
                    ) : <span className="fs-15 text-muted d-block text-center">—</span>}
                  </div>
                </div>
              );
            });
          })()}
        </Modal.Body>
        <Modal.Footer style={{ padding: "16px 24px 22px", borderTop: "1px solid #f1f5f9", justifyContent: "flex-start", gap: 8 }}>
          <button type="button" className="btn btn-danger me-2" disabled={Object.keys(bulkSelected).length === 0} onClick={handleAddBulk}>
            Add {Object.keys(bulkSelected).length > 0 ? Object.keys(bulkSelected).length : ""} Item{Object.keys(bulkSelected).length !== 1 ? "s" : ""}
          </button>
          <button type="button" className="btn btn-outline-light" onClick={() => setShowBulkModal(false)}>Cancel</button>
        </Modal.Footer>
      </Modal>

      {/* Configure CN# modal */}
      <Modal show={configModalOpen} onHide={() => setConfigModalOpen(false)} centered size="lg" backdropClassName="blurred-backdrop">
        <Modal.Header closeButton={false} style={{ padding: "20px 24px 18px", borderBottom: "1px solid #f1f5f9", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className="ti ti-settings fs-18" style={{ color: "#ef4444" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 16, color: "#0f172a" }}>Credit Note Number Preferences</p>
            </div>
          </div>
          <button type="button" onClick={() => setConfigModalOpen(false)}
            style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #fecaca", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}>
            <i className="ti ti-x" style={{ fontSize: 14, color: "#ef4444", lineHeight: 1 }} />
          </button>
        </Modal.Header>
        <Modal.Body style={{ padding: "20px 24px" }}>
          <div className="mb-3">
            <div className="form-check mb-2">
              <input className="form-check-input" type="radio" id="cn-mode-auto" checked={configMode === "auto"} onChange={() => setConfigMode("auto")} />
              <label className="form-check-label fw-medium fs-14" htmlFor="cn-mode-auto">Auto (prefix + sequence)</label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="radio" id="cn-mode-manual" checked={configMode === "manual"} onChange={() => setConfigMode("manual")} />
              <label className="form-check-label fw-medium fs-14" htmlFor="cn-mode-manual">Manual entry</label>
            </div>
          </div>
          {configMode === "auto" && (
            <div className="row g-3">
              <div className="col-5">
                <label className="form-label fw-medium fs-14 mb-1">Prefix</label>
                <input type="text" className="form-control" value={configPrefix} onChange={(e) => setConfigPrefix(e.target.value)} />
              </div>
              <div className="col-7">
                <label className="form-label fw-medium fs-14 mb-1">Next Number</label>
                <input type="text" className="form-control" value={configNextNumber} onChange={(e) => setConfigNextNumber(e.target.value)} />
              </div>
              <div className="col-12">
                <p className="text-muted fs-13 mb-0">Preview: <strong>{configPrefix}{configNextNumber}</strong></p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ padding: "16px 24px 22px", borderTop: "1px solid #f1f5f9", justifyContent: "flex-start", gap: 8 }}>
          <button type="button" className="btn btn-danger me-2" onClick={saveConfigModal}>Apply</button>
          <button type="button" className="btn btn-outline-light" onClick={() => setConfigModalOpen(false)}>Cancel</button>
        </Modal.Footer>
      </Modal>

      {/* Unsaved changes modal */}
      {/* Release Credit? confirmation modal */}
      {showCreditModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1060, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}>
          <div style={{ background: "#fff", borderRadius: 16, width: 480, maxWidth: "95vw", boxShadow: "0 24px 64px rgba(0,0,0,0.20)", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ padding: "22px 24px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="ti ti-coin fs-20" style={{ color: "#ef4444" }} />
              </div>
              <div style={{ flex: 1, paddingTop: 2 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 17, color: "#0f172a" }}>Add to Customer Credits?</p>
                <p style={{ margin: "5px 0 0", fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
                  Do you want to add <strong>₹{grandTotal.toFixed(decimalRate)}</strong> to{" "}
                  <strong>{customerName}</strong>'s unused credit balance?
                </p>
              </div>
            </div>
            {/* Info cards */}
            <div style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0" }}>
                <i className="ti ti-check fs-16 mt-1 flex-shrink-0" style={{ color: "#16a34a" }} />
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#15803d" }}>Yes — Add to unused credits</p>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: "#166534", lineHeight: 1.4 }}>
                    ₹{grandTotal.toFixed(decimalRate)} will be added to {customerName}'s credit balance and can be applied against future invoices.
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <i className="ti ti-x fs-16 mt-1 flex-shrink-0" style={{ color: "#64748b" }} />
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#334155" }}>No — Save only</p>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>
                    Credit note will be saved but the amount will not be added to the customer's credit balance.
                  </p>
                </div>
              </div>
            </div>
            {/* Actions */}
            <div style={{ padding: "0 24px 22px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-outline-light" style={{ minWidth: 100 }}
                onClick={() => executeSave(false)}>
                No, Save Only
              </button>
              <button className="btn btn-danger" style={{ minWidth: 140 }}
                onClick={() => executeSave(true)}>
                <i className="ti ti-coin me-2" />Yes, Add Credits
              </button>
            </div>
          </div>
        </div>
      )}

      {showUnsavedModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1060, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}>
          <div style={{ background: "#fff", borderRadius: 14, width: 420, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="ti ti-alert-triangle fs-18" style={{ color: "#ef4444" }} />
              </div>
              <div style={{ paddingTop: 4 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 16, color: "#0f172a" }}>Unsaved Changes</p>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>You have unsaved changes. Are you sure you want to leave?</p>
              </div>
            </div>
            <div style={{ padding: "16px 24px 22px", display: "flex", gap: 8 }}>
              <button className="btn btn-danger me-2" onClick={() => { clearDirty(); setShowUnsavedModal(false); pendingNavRef.current?.(); pendingNavRef.current = null; }}>Leave</button>
              <button className="btn btn-outline-light" onClick={() => { setShowUnsavedModal(false); pendingNavRef.current = null; }}>Stay</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NewCreditNote;
