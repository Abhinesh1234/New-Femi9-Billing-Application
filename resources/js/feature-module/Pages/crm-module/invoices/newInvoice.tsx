import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../../../../core/redux/loaderSlice";
import { createPortal } from "react-dom";
import { Modal, Toast } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import { fetchInvoice, fetchAdvanceBalance } from "../../../../core/services/invoiceApi";
import axios from "axios";
import dayjs from "dayjs";
import Footer from "../../../../components/footer/footer";
import CustomFieldsPanel, { type CustomFieldsPanelHandle } from "../../../../components/custom-fields/CustomFieldsPanel";
import PageHeader from "../../../../components/page-header/pageHeader";
import { searchParties, fetchParty, type PartySearchResult } from "../../../../core/services/partyApi";
import { getSettings } from "../../../../core/cache/settingCache";
import { type InvoiceConfiguration, type ProductConfiguration } from "../../../../core/services/settingApi";
import { getLocationList, bustLocationLists } from "../../../../core/cache/locationCache";
import { bustSeriesLists } from "../../../../core/cache/seriesCache";
import AddPartyModal from "../../customers/distributors/AddPartyModal";
import CustomerDrawer from "./CustomerDrawer";
import CommonSelect, { type Option } from "../../../../components/common-select/commonSelect";
import CommonDatePicker from "../../../../components/common-datePicker/commonDatePicker";
import { fetchSeriesForLocation, type SeriesItem } from "../../../../core/services/seriesApi";
import { fetchPriceLists, fetchPriceList, type PriceListRecord } from "../../../../core/services/priceListApi";
import { fetchItems, fetchItem, fetchItemStock, fetchStockBatch, type ItemListRecord } from "../../../../core/services/itemApi";
import { emitMutation } from "../../../../core/cache/mutationEvents";

interface DropdownEntry {
  id:        number;
  name:      string;
  mobile?:   string | null;
  category?: string | null;
}

interface InvoiceRow {
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
  pricelist_id:       number | null;
}


interface InlineDropdownProps {
  label:     string;
  value:     string;
  onChange:  (name: string, id: number, item: DropdownEntry) => void;
  items?:    DropdownEntry[];                                          // static mode
  onSearch?: (q: string, signal: AbortSignal) => Promise<DropdownEntry[]>; // async mode
  onAdd?:    (query: string) => void;
}

interface PanelRect {
  top: number; bottom: number; left: number; width: number; spaceBelow: number;
}

const InlineDropdown = ({ label, value, onChange, items, onSearch, onAdd }: InlineDropdownProps) => {
  const isAsync = !!onSearch;

  const [open, setOpen]           = useState(false);
  const [search, setSearch]       = useState("");
  const [asyncItems, setAsyncItems] = useState<DropdownEntry[]>([]);
  const [loading, setLoading]     = useState(false);
  const [panelRect, setPanelRect] = useState<PanelRect | null>(null);

  const wrapRef    = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);
  const abortRef   = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── position helpers ────────────────────────────────────────────────────────
  const calcRect = useCallback(() => {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    setPanelRect({
      top: r.bottom, bottom: window.innerHeight - r.top,
      left: r.left,  width: r.width,
      spaceBelow: window.innerHeight - r.bottom,
    });
  }, []);

  // ── async fetch ─────────────────────────────────────────────────────────────
  const fetchResults = useCallback((q: string) => {
    if (!onSearch) return;
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    onSearch(q, abortRef.current.signal).then((results) => {
      setAsyncItems(results);
      setLoading(false);
    }).catch(() => {
      // aborted — ignore
    });
  }, [onSearch]);

  // ── open / toggle ───────────────────────────────────────────────────────────
  const toggle = () => {
    if (!open) {
      calcRect();
      if (isAsync) fetchResults("");
    } else {
      abortRef.current?.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    }
    setOpen((o) => !o);
    setSearch("");
  };

  // ── debounced search input ──────────────────────────────────────────────────
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearch(q);
    if (!isAsync) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(q), 250);
  };

  // ── outside click ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideWrap  = wrapRef.current?.contains(target) ?? false;
      const insidePanel = panelRef.current?.contains(target) ?? false;
      if (!insideWrap && !insidePanel) {
        abortRef.current?.abort();
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // ── reposition on scroll / resize ──────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const update = () => calcRect();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, calcRect]);

  // ── cleanup on unmount ──────────────────────────────────────────────────────
  useEffect(() => () => {
    abortRef.current?.abort();
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  // ── derived display list ────────────────────────────────────────────────────
  const displayItems = isAsync
    ? asyncItems
    : (items ?? []).filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  const dropUp = panelRect ? panelRect.spaceBelow < 240 : false;

  const panelStyle: React.CSSProperties = panelRect
    ? {
        position: "fixed",
        left:  panelRect.left,
        width: panelRect.width,
        zIndex: 9999,
        ...(dropUp
          ? { bottom: panelRect.bottom, top: "auto" }
          : { top: panelRect.top + 4,   bottom: "auto" }),
      }
    : { display: "none" };

  const select = (item: DropdownEntry) => {
    onChange(item.name, item.id, item);
    setOpen(false);
    setSearch("");
    abortRef.current?.abort();
  };

  return (
    <div ref={wrapRef} className="position-relative">
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder={`Select or Add ${label}`}
          value={value}
          readOnly
          style={{ cursor: "pointer" }}
          onClick={toggle}
        />
        <button type="button" className="btn btn-outline-light" onClick={toggle}>
          <i className={`ti ti-chevron-${open ? "up" : "down"}`} />
        </button>
      </div>

      {open && panelRect && createPortal(
        <div ref={panelRef} className="bg-white border rounded shadow-sm overflow-hidden" style={panelStyle}>

          {/* Search input */}
          <div className="p-2 border-bottom position-relative">
            <input
              autoFocus
              type="text"
              className="form-control"
              style={{ height: 42, paddingRight: loading ? 36 : undefined }}
              placeholder={`Search ${label}…`}
              value={search}
              onChange={handleSearchChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && displayItems.length > 0) { e.preventDefault(); select(displayItems[0]); }
                if (e.key === "Escape") { setOpen(false); setSearch(""); }
              }}
            />
            {loading && (
              <span
                className="position-absolute top-50 translate-middle-y"
                style={{ right: 20 }}
              >
                <span className="spinner-border spinner-border-sm text-secondary" role="status" />
              </span>
            )}
          </div>

          {/* Items list */}
          <div style={{ maxHeight: 180, overflowY: "auto", paddingBottom: 8 }}>
            {loading && displayItems.length === 0 ? null : displayItems.length === 0 ? (
              <p className="text-muted fs-15 text-center py-3 mb-0">No results</p>
            ) : (
              displayItems.map((item) => {
                const isActive = item.name === value;
                return (
                  <div
                    key={item.id}
                    className="px-3 py-2"
                    style={{
                      cursor:     "pointer",
                      background: isActive ? "#E41F07" : "transparent",
                      color:      isActive ? "#fff"    : "#707070",
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "#E41F07"; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "#707070"; }}
                    onClick={() => select(item)}
                  >
                    <div className="fs-15 fw-medium">{item.name}</div>
                    {(item.mobile || item.category) && (
                      <div
                        className="fs-12"
                        style={{ color: isActive ? "rgba(255,255,255,0.75)" : "#aaa" }}
                      >
                        {item.mobile ? `${item.mobile}${item.category ? ` (${item.category})` : ""}` : item.category}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Add footer */}
          {onAdd && (
            <div className="border-top px-3 py-2">
              <button
                type="button"
                className="btn btn-link p-0 fs-14 text-primary fw-medium"
                style={{ textDecoration: "none" }}
                onClick={() => { const q = search; setOpen(false); setSearch(""); onAdd(q); }}
              >
                Add Party
              </button>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

// ── Entity dropdown (same pattern as Brand dropdown in new items page) ────────

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
      const rect     = wrapRef.current.getBoundingClientRect();
      const willUp   = window.innerHeight - rect.bottom < 280;
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

  const select = (item: DropdownEntry) => {
    onChange(item.name, item.id);
    setOpen(false);
    setSearch("");
  };

  const dropdown = open ? (
    <div
      ref={portalRef}
      className="bg-white border rounded shadow-sm overflow-hidden"
      style={usePortal && dropPos ? {
        position: "fixed",
        ...(dropUp ? { bottom: dropPos.bottom } : { top: dropPos.top }),
        left: dropPos.left,
        width: dropPos.width,
        zIndex: 9999,
        minWidth: 220,
      } : {
        position: "absolute",
        ...(dropUp ? { bottom: "calc(100% + 4px)", top: "auto" } : { top: "calc(100% + 4px)", bottom: "auto" }),
        left: 0, right: 0, zIndex: 1050, minWidth: 220,
      }}
    >
      <div className="p-2 border-bottom">
        <input
          autoFocus
          type="text"
          className="form-control fs-14"
          style={{ height: 42 }}
          placeholder={`Search ${label}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div style={{ maxHeight: 180, overflowY: "auto", paddingBottom: 8 }}>
        {filtered.length === 0 ? (
          <p className="text-muted fs-15 text-center py-3 mb-0">No results</p>
        ) : (
          filtered.map((item) => {
            const isActive = item.name === value;
            return (
              <div
                key={item.id}
                className="px-3 py-2"
                style={{
                  cursor: "pointer",
                  background: isActive ? "#E41F07" : "transparent",
                  color:      isActive ? "#fff"    : "#707070",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "#E41F07"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "#707070"; }}
                onClick={() => select(item)}
              >
                <div className="fs-15 fw-medium">{item.name}</div>
                {item.mobile && (
                  <div className="fs-12" style={{ color: isActive ? "rgba(255,255,255,0.75)" : "#aaa" }}>
                    {item.mobile}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      {onManage && (
        <div className="border-top px-3 py-2">
          <button
            type="button"
            className="btn btn-link p-0 fs-14 text-primary fw-medium"
            style={{ textDecoration: "none" }}
            onClick={() => { setOpen(false); setSearch(""); onManage(); }}
          >
            {manageLabel ?? `Add ${label}`}
          </button>
        </div>
      )}
    </div>
  ) : null;

  return (
    <div ref={wrapRef} className={`position-relative${wrapperClassName ? ` ${wrapperClassName}` : ""}`} style={open ? { zIndex: 10 } : undefined}>
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder={`Select or Add ${label}`}
          value={value}
          readOnly
          style={{ cursor: "pointer" }}
          onClick={toggle}
        />
        <button type="button" className="btn btn-outline-light" onClick={toggle}>
          <i className={`ti ti-chevron-${open ? "up" : "down"}`} />
        </button>
      </div>
      {usePortal ? (dropdown && createPortal(dropdown, document.body)) : dropdown}
    </div>
  );
};

// ── Add Reference Modal ───────────────────────────────────────────────────────

interface AddReferenceModalProps {
  show:           boolean;
  onHide:         () => void;
  items:          DropdownEntry[];
  onSaveAndSelect:(entry: DropdownEntry) => void;
  onUpdate:       (id: number, name: string, phone: string) => void;
  onDelete:       (id: number) => void;
}

const AddReferenceModal = ({ show, onHide, items, onSaveAndSelect, onUpdate, onDelete }: AddReferenceModalProps) => {
  const [showForm, setShowForm]   = useState(false);
  const [newName, setNewName]     = useState("");
  const [newPhone, setNewPhone]   = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName]   = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  useEffect(() => {
    if (!show) {
      setShowForm(false); setNewName(""); setNewPhone("");
      setEditingId(null); setEditName(""); setEditPhone("");
    }
  }, [show]);

  const handleSaveAndSelect = () => {
    if (!newName.trim()) return;
    const entry: DropdownEntry = { id: Date.now(), name: newName.trim(), mobile: newPhone.trim() || undefined };
    onSaveAndSelect(entry);
    onHide();
  };

  const startEdit = (item: DropdownEntry) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPhone(item.mobile ?? "");
    setShowForm(false);
  };

  const commitEdit = () => {
    if (editingId !== null && editName.trim()) {
      onUpdate(editingId, editName.trim(), editPhone.trim());
      setEditingId(null);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdropClassName="blurred-backdrop">
      <Modal.Header closeButton={false} style={{ padding: "20px 24px 18px", borderBottom: "1px solid #f1f5f9", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <i className="ti ti-address-book fs-18" style={{ color: "#ef4444" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 16, color: "#0f172a" }}>Add Reference</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onHide}
          style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #fecaca", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}
        >
          <i className="ti ti-x" style={{ fontSize: 14, color: "#ef4444", lineHeight: 1 }} />
        </button>
      </Modal.Header>

      <Modal.Body className="p-0">
        {/* + New Reference button */}
        {!showForm && (
          <div className="px-4 pt-3 pb-3 border-bottom">
            <button
              type="button"
              className="btn btn-outline-light d-flex align-items-center gap-2"
              onClick={() => { setShowForm(true); setEditingId(null); }}
            >
              <i className="ti ti-plus fs-16" />
              <span className="fs-14 fw-medium">New Reference</span>
            </button>
          </div>
        )}

        {/* Inline new form */}
        {showForm && (
          <div className="px-4 pt-3 pb-3 border-bottom">
            <div className="mb-3">
              <label className="form-label fw-medium fs-14 mb-1 text-danger">Name <span>*</span></label>
              <input
                autoFocus
                type="text"
                className="form-control"
                placeholder="Enter name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveAndSelect(); if (e.key === "Escape") { setShowForm(false); setNewName(""); setNewPhone(""); } }}
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-medium fs-14 mb-1">Phone Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter phone number"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveAndSelect(); if (e.key === "Escape") { setShowForm(false); setNewName(""); setNewPhone(""); } }}
              />
            </div>
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-danger" onClick={handleSaveAndSelect}>Save and Select</button>
              <button type="button" className="btn btn-outline-light" onClick={() => { setShowForm(false); setNewName(""); setNewPhone(""); }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Existing references list */}
        <div className="px-4 pt-3 pb-2">
          <p className="text-uppercase text-muted fw-semibold fs-12 mb-2" style={{ letterSpacing: "0.06em" }}>References</p>
          {items.length === 0 && <p className="text-muted fs-14 text-center py-3">No references yet.</p>}
          {items.map((item) => (
            <div key={item.id}>
              {editingId === item.id ? (
                <div className="py-3 border-bottom">
                  <div className="mb-3">
                    <label className="form-label fw-medium fs-14 mb-1 text-danger">Name <span>*</span></label>
                    <input
                      autoFocus
                      type="text"
                      className="form-control"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingId(null); }}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium fs-14 mb-1">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingId(null); }}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-danger" onClick={commitEdit}>Save</button>
                    <button type="button" className="btn btn-outline-light" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div
                  className="d-flex align-items-center justify-content-between py-2 px-2 rounded"
                  style={{ background: hoveredId === item.id ? "#f5f5f5" : "transparent" }}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div>
                    <div className="fs-15">{item.name}</div>
                    {item.mobile && <div className="fs-12 text-muted">{item.mobile}</div>}
                  </div>
                  <div className="d-flex gap-2" style={{ visibility: hoveredId === item.id ? "visible" : "hidden" }}>
                    <button
                      type="button"
                      className="btn btn-outline-light"
                      style={{ width: 34, height: 34, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                      onClick={() => startEdit(item)}
                    >
                      <i className="ti ti-pencil fs-15" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      style={{ width: 34, height: 34, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                      onClick={() => onDelete(item.id)}
                    >
                      <i className="ti ti-trash fs-15" />
                    </button>
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

// ── Tax entry type ────────────────────────────────────────────────────────────

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
  show:            boolean;
  onHide:          () => void;
  items:           TaxEntry[];
  onSave:          (name: string, rate: string) => TaxEntry;
  onUpdate:        (id: number, name: string, rate: string) => void;
  onDelete:        (id: number) => void;
  onSaveAndSelect: (entry: TaxEntry) => void;
}

const ManageTaxesModal = ({
  show, onHide, items, onSave, onUpdate, onDelete, onSaveAndSelect,
}: ManageTaxesModalProps) => {
  const [hoveredId, setHoveredId]     = useState<number | null>(null);
  const [editingId, setEditingId]     = useState<number | null>(null);
  const [editName, setEditName]       = useState("");
  const [editRate, setEditRate]       = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName]         = useState("");
  const [newRate, setNewRate]         = useState("");

  useEffect(() => {
    if (!show) {
      setHoveredId(null); setEditingId(null);
      setEditName(""); setEditRate("");
      setShowNewForm(false); setNewName(""); setNewRate("");
    }
  }, [show]);

  const startEdit = (item: TaxEntry) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditRate(item.rate);
    setShowNewForm(false);
  };

  const commitEdit = () => {
    if (editingId !== null && editName.trim()) {
      onUpdate(editingId, editName.trim(), editRate.trim());
      setEditingId(null);
    }
  };

  const handleSaveAndSelect = () => {
    if (!newName.trim()) return;
    const entry = onSave(newName.trim(), newRate.trim());
    onSaveAndSelect(entry);
    onHide();
  };

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
        <button
          type="button"
          onClick={onHide}
          style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #fecaca", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}
        >
          <i className="ti ti-x" style={{ fontSize: 14, color: "#ef4444", lineHeight: 1 }} />
        </button>
      </Modal.Header>

      <Modal.Body className="p-0">
        {/* + New Tax button */}
        {!showNewForm && (
          <div className="px-4 pt-3 pb-3 border-bottom">
            <button
              type="button"
              className="btn btn-outline-light d-flex align-items-center gap-2"
              onClick={() => { setShowNewForm(true); setEditingId(null); }}
            >
              <i className="ti ti-plus fs-16" />
              <span className="fs-14 fw-medium">New Tax</span>
            </button>
          </div>
        )}

        {/* New tax inline form */}
        {showNewForm && (
          <div className="px-4 pt-3 pb-3 border-bottom">
            <div className="row g-3 mb-3">
              <div className="col-7">
                <label className="form-label fw-medium fs-14 mb-1 text-danger">Tax Name <span>*</span></label>
                <input
                  autoFocus
                  type="text"
                  className="form-control"
                  placeholder="e.g. TDS Basic"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveAndSelect(); if (e.key === "Escape") { setShowNewForm(false); setNewName(""); setNewRate(""); } }}
                />
              </div>
              <div className="col-5">
                <label className="form-label fw-medium fs-14 mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 10"
                  min={0}
                  step="any"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveAndSelect(); if (e.key === "Escape") { setShowNewForm(false); setNewName(""); setNewRate(""); } }}
                />
              </div>
            </div>
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-danger" onClick={handleSaveAndSelect}>Save and Select</button>
              <button type="button" className="btn btn-outline-light" onClick={() => { setShowNewForm(false); setNewName(""); setNewRate(""); }}>Cancel</button>
            </div>
          </div>
        )}

        {/* List */}
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
                      <input
                        autoFocus
                        type="text"
                        className="form-control"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingId(null); }}
                      />
                    </div>
                    <div className="col-5">
                      <label className="form-label fw-medium fs-14 mb-1">Tax Rate (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        min={0}
                        step="any"
                        value={editRate}
                        onChange={(e) => setEditRate(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingId(null); }}
                      />
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-danger" onClick={commitEdit}>Save</button>
                    <button type="button" className="btn btn-outline-light" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div
                  className="d-flex align-items-center justify-content-between py-2 px-2 rounded"
                  style={{ cursor: "default", background: hoveredId === item.id ? "#f5f5f5" : "transparent" }}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div>
                    <span className="fs-15">{item.name}</span>
                    {item.rate && <span className="fs-12 text-muted ms-2">{item.rate}%</span>}
                  </div>
                  <div className="d-flex gap-2" style={{ visibility: hoveredId === item.id ? "visible" : "hidden" }}>
                    <button
                      type="button"
                      className="btn btn-outline-light"
                      style={{ width: 34, height: 34, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                      onClick={() => startEdit(item)}
                    >
                      <i className="ti ti-pencil fs-15" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      style={{ width: 34, height: 34, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                      onClick={() => onDelete(item.id)}
                    >
                      <i className="ti ti-trash fs-15" />
                    </button>
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

const fetchCustomers = (q: string, signal: AbortSignal): Promise<PartySearchResult[]> =>
  searchParties(q, 20, signal);

const TERMS_LABEL: Record<string, string> = {
  due_on_receipt: "Due on Receipt",
  net_15: "Net 15", net_30: "Net 30",
  net_45: "Net 45", net_60: "Net 60", net_90: "Net 90",
  custom: "Custom",
};

const TERMS_DAYS: Record<string, number> = {
  due_on_receipt: 0, net_15: 15, net_30: 30,
  net_45: 45, net_60: 60, net_90: 90,
};

function calcDueDate(invoiceDate: string, terms: string): string {
  if (!invoiceDate || terms === "custom") return invoiceDate;
  const days = TERMS_DAYS[terms] ?? 0;
  return dayjs(invoiceDate).add(days, "day").format("YYYY-MM-DD");
}

const SALUTATIONS = ["mr.", "mrs.", "ms.", "dr.", "prof."];
function getInitial(name: string): string {
  const lower = name.toLowerCase();
  for (const sal of SALUTATIONS) {
    if (lower.startsWith(sal + " ")) return name.charAt(sal.length + 1).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
}


const NewInvoice = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { id }    = useParams<{ id?: string }>();
  const isEdit    = !!id && id !== "new";
  const editId    = isEdit ? Number(id) : null;

  const [customerId, setCustomerId]         = useState<number | null>(null);
  const [customerName, setCustomerName]     = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<DropdownEntry | null>(null);
  const [locationId, setLocationId]         = useState<number | null>(null);
  const [locationName, setLocationName]     = useState("");
  const [locationOptions, setLocationOptions] = useState<DropdownEntry[]>([]);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [partyModalQuery, setPartyModalQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const todayISO = new Date().toISOString().split("T")[0];
  const [invoiceNumber, setInvoiceNumber] = useState("INV-000001");
  const [orderNumber, setOrderNumber]     = useState("");
  const [invoiceDate, setInvoiceDate]     = useState(todayISO);
  const [paymentTerms, setPaymentTerms]   = useState("due_on_receipt");
  const [dueDate, setDueDate]             = useState(todayISO);
  const [salesperson, setSalesperson]       = useState("");
  const [reference, setReference]           = useState("");
  const [referenceItems, setReferenceItems] = useState<DropdownEntry[]>([]);
  const [showRefModal, setShowRefModal]     = useState(false);
  const [pricelistData, setPricelistData]   = useState<PriceListRecord[]>([]);
  const [pricelistId, setPricelistId]       = useState<number | null>(null);
  const [pricelistName, setPricelistName]   = useState("");


  // ── Invoice line items ────────────────────────────────────────────────────
  const [invoiceRows, setInvoiceRows] = useState<InvoiceRow[]>([
    { id: 1, item_id: null, item_name: "", item_image: null, quantity: "1", rate: "0.00", base_rate: "0.00", gst_rate: "0", stock_on_hand: null, available_for_sale: null, pricelist_id: null },
  ]);
  const invoiceNextId = useRef(2);
  const addInvoiceRow    = () => setInvoiceRows((p) => [...p, { id: invoiceNextId.current++, item_id: null, item_name: "", item_image: null, quantity: "1", rate: "0.00", base_rate: "0.00", gst_rate: "0", stock_on_hand: null, pricelist_id: null }]);
  const removeInvoiceRow = (id: number) => setInvoiceRows((p) => p.filter((r) => r.id !== id));
  const updateInvoiceRow = useCallback((id: number, field: keyof Omit<InvoiceRow, "id">, value: string | number | null) =>
    setInvoiceRows((p) => p.map((r) => r.id === id ? { ...r, [field]: value } : r)), []);
  const invoiceTotal = invoiceRows.reduce((s, r) => s + (parseFloat(r.rate) || 0) * (parseFloat(r.quantity) || 0), 0);
  const totalQty     = invoiceRows.reduce((s, r) => s + (r.item_id ? (parseFloat(r.quantity) || 0) : 0), 0);

  const [discount, setDiscount]               = useState("0");
  const [discountType, setDiscountType]       = useState<"amount" | "percent">("amount");
  const [taxType, setTaxType]                 = useState<"tds" | "tcs">("tds");
  const [selectedTax, setSelectedTax]         = useState("");
  const [taxItems, setTaxItems]               = useState<TaxEntry[]>([]);
  const [showTaxModal, setShowTaxModal]       = useState(false);
  const taxNextId                             = useRef(1);
  const [chargeRows, setChargeRows] = useState([{ id: 1, label: "Courier Charge", amount: "", editingLabel: false }]);
  const chargeNextId = useRef(2);

  const [customerNotes, setCustomerNotes]       = useState("Thanks for your business.");
  const [termsConditions, setTermsConditions]   = useState("");

  const [attachedFiles, setAttachedFiles]       = useState<File[]>([]);
  const attachFileRef                           = useRef<HTMLInputElement>(null);
  const cfPanelRef                              = useRef<CustomFieldsPanelHandle>(null);

  const [paymentReceived, setPaymentReceived]   = useState(true);
  const [paymentRows, setPaymentRows]           = useState([{ id: 1, mode: "Cash", amount: "" }]);
  const paymentNextId                           = useRef(2);

  // Advanced payment settings
  const [invoiceSettings, setInvoiceSettings]   = useState<InvoiceConfiguration | null>(null);
  const [customerCategoryId, setCustomerCategoryId] = useState<number | null>(null);
  const [decimalRate, setDecimalRate]           = useState(2);
  const [advanceBalance, setAdvanceBalance]     = useState<number | null>(null);
  const [advanceBalanceLoading, setAdvanceBalanceLoading] = useState(false);

  // ── Stock conflict warning modal ─────────────────────────────────────────
  type StockWarning = {
    item_name: string; location_name: string;
    available_for_sale: number; stock_on_hand: number;
    is_seller: boolean; is_buyer: boolean;
  };
  const [stockWarnings, setStockWarnings]       = useState<StockWarning[]>([]);
  const [showStockModal, setShowStockModal]     = useState(false);
  const pendingSaveStatus                       = useRef<"sent" | "draft" | null>(null);
  const stockWarningConfirmed                   = useRef(false);

  // ── Form / save state ────────────────────────────────────────────────────
  const [saving, setSaving]                     = useState(false);
  const [pageReady, setPageReady]               = useState(false);
  const [errors, setErrors]                     = useState<Record<string, string>>({});
  const clr = (key: string) => setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  const [toast, setToast]                       = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [invoiceNumChecking, setInvoiceNumChecking] = useState(false);
  const [invoiceNumDuplicate, setInvoiceNumDuplicate] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const isDirtyRef = useRef(false);
  const markDirty = useCallback(() => { if (!isDirtyRef.current) { isDirtyRef.current = true; setIsDirty(true); } }, []);
  const clearDirty = useCallback(() => { isDirtyRef.current = false; setIsDirty(false); }, []);

  const showToast = useCallback((message: string, type: "success" | "error" = "error") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  }, []);

  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  const discountAmt  = discountType === "amount"
    ? (parseFloat(discount) || 0)
    : invoiceTotal * (parseFloat(discount) || 0) / 100;
  const totalCharges  = chargeRows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const taxBase       = invoiceTotal - discountAmt;
  const selectedTaxEntry = taxItems.find((t) => t.name === selectedTax);
  const taxRate       = parseFloat(selectedTaxEntry?.rate ?? "0") || 0;
  const taxAmt        = taxRate > 0 ? Math.abs(taxBase * taxRate / 100) : 0;
  const signedTaxAmt  = taxType === "tds" ? -taxAmt : taxAmt;
  const grandTotal    = invoiceTotal - discountAmt + totalCharges + signedTaxAmt;

  // Advanced payment derived flag
  const isAdvancePayment =
    !!(invoiceSettings?.advanced_payment_enabled) &&
    customerCategoryId !== null &&
    (invoiceSettings?.advanced_payment_categories ?? []).map(Number).includes(Number(customerCategoryId));
  const advancePaymentAmount = (invoiceTotal - discountAmt).toFixed(decimalRate);

  const toStorageUrl = (path: string | null | undefined): string | null => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("/storage/") || path.startsWith("data:")) return path;
    return `/storage/${path}`;
  };

  // ── Item search dropdown ──────────────────────────────────────────────────
  const [itemOpenId, setItemOpenId]           = useState<number | null>(null);
  const [itemSearchText, setItemSearchText]   = useState<Record<number, string>>({});
  const [itemDropItems, setItemDropItems]     = useState<ItemListRecord[]>([]);
  const [itemDropLoading, setItemDropLoading] = useState(false);
  const [itemDropPos, setItemDropPos]         = useState<{ top: number; left: number; width: number } | null>(null);
  const [itemImgErrors, setItemImgErrors]     = useState<Record<number, boolean>>({});
  const itemSearchTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemWrapRefs       = useRef<Record<number, HTMLDivElement | null>>({});
  const itemInputRefs      = useRef<Record<number, HTMLDivElement | null>>({});
  const itemPortalRef      = useRef<HTMLDivElement>(null);

  // ── Bulk add modal ────────────────────────────────────────────────────────
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkSearch, setBulkSearch]       = useState("");
  const [bulkItems, setBulkItems]         = useState<ItemListRecord[]>([]);
  const [bulkLoading, setBulkLoading]     = useState(false);
  const [bulkSelected, setBulkSelected]   = useState<Record<number, string>>({}); // item_id → qty
  const [bulkStocks, setBulkStocks]       = useState<Record<number, string | null>>({}); // item_id → stock_on_hand
  const bulkSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadBulkItems = useCallback(async (q: string, loc?: number | null) => {
    setBulkLoading(true);
    setBulkStocks({});
    const res = await fetchItems({ search: q, per_page: 50 });
    const items = res.success ? res.data.data : [];
    setBulkItems(items);
    setBulkLoading(false);
    if (loc && items.length > 0) {
      fetchStockBatch(items.map((it) => it.id), loc).then((stockRes) => {
        if (!stockRes.success) return;
        const map: Record<number, string | null> = {};
        items.forEach((it) => {
          map[it.id] = stockRes.data[String(it.id)] ?? null;
        });
        setBulkStocks(map);
      });
    }
  }, []);

  const openBulkModal = () => {
    setBulkSearch("");
    setBulkSelected({});
    setBulkItems([]);
    setBulkStocks({});
    setShowBulkModal(true);
    loadBulkItems("", locationId);
  };

  const toggleBulkItem = (itemId: number) => {
    setBulkSelected((prev) => {
      if (prev[itemId] !== undefined) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: "1" };
    });
  };

  const handleAddBulk = async () => {
    const entries = Object.entries(bulkSelected).map(([id, qty]) => ({ id: Number(id), qty }));
    if (entries.length === 0) return;
    markDirty();

    const alreadyUsed = new Set(invoiceRows.filter((r) => r.item_id !== null).map((r) => r.item_id as number));

    setInvoiceRows((prev) => prev.filter((r) => r.item_id !== null || prev.length === 1));

    for (const { id, qty } of entries) {
      if (alreadyUsed.has(id)) continue;
      alreadyUsed.add(id);

      const itemRecord = bulkItems.find((it) => it.id === id);
      const newRowId   = invoiceNextId.current++;

      setInvoiceRows((prev) => [
        ...prev.filter((r) => r.item_id !== null),
        { id: newRowId, item_id: id, item_name: itemRecord?.name ?? "", item_image: null, quantity: qty || "1", rate: "0.00", base_rate: "0.00", gst_rate: "0", stock_on_hand: null, available_for_sale: null, pricelist_id: pricelistId },
      ]);

      fetchItem(id).then((res) => {
        if (!res.success) return;
        const d = res.data as Record<string, unknown>;
        const baseRateVal = String(d.selling_price ?? "0.00");
        const gstRate     = String(d.gst_rate ?? "0");
        const imgPath     = d.image_path as string | null | undefined;
        updateInvoiceRow(newRowId, "item_image", imgPath ?? null);
        updateInvoiceRow(newRowId, "base_rate", baseRateVal);
        updateInvoiceRow(newRowId, "gst_rate", gstRate);
        if (pricelistId) {
          fetchPriceList(pricelistId).then((plRes) => {
            if (!plRes.success) { updateInvoiceRow(newRowId, "rate", baseRateVal); return; }
            const pd = plRes.data as Record<string, unknown>;
            const plType = pd.price_list_type as string | undefined;
            const plItms = pd.items as Array<{ item_id: number; custom_rate?: string | null; discount?: string | null }> | undefined;
            const base = parseFloat(baseRateVal) || 0;
            let rateVal = baseRateVal;
            if (plType === "individual_items" && plItms) {
              const entry = plItms.find((it) => it.item_id === id);
              if (entry?.custom_rate) rateVal = entry.custom_rate;
              else if (entry?.discount) rateVal = (base * (1 - (parseFloat(entry.discount) || 0) / 100)).toFixed(decimalRate);
            } else if (plType === "all_items") {
              const gr = pd.custom_rate as string | null | undefined;
              const gd = pd.discount as string | null | undefined;
              if (gr) rateVal = gr;
              else if (gd) rateVal = (base * (1 - (parseFloat(gd) || 0) / 100)).toFixed(decimalRate);
            }
            updateInvoiceRow(newRowId, "rate", rateVal);
          });
        } else {
          updateInvoiceRow(newRowId, "rate", baseRateVal);
        }
      });

      if (locationId) {
        fetchItemStock(id).then((res) => {
          if (!res.success) return;
          const entry = res.data.find((s) => s.location_id === locationId);
          updateInvoiceRow(newRowId, "stock_on_hand",      entry != null ? String(entry.stock_on_hand)      : null);
          updateInvoiceRow(newRowId, "available_for_sale", entry != null ? String(entry.available_for_sale) : null);
        });
      }
    }

    setShowBulkModal(false);
  };

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
    loadItemDropItems("");
  };

  const clearItemRow = (rowId: number) => {
    updateInvoiceRow(rowId, "item_id", null);
    updateInvoiceRow(rowId, "item_name", "");
    updateInvoiceRow(rowId, "item_image", null);
    updateInvoiceRow(rowId, "rate", "0.00");
    updateInvoiceRow(rowId, "base_rate", "0.00");
    updateInvoiceRow(rowId, "gst_rate", "0");
    updateInvoiceRow(rowId, "stock_on_hand",      null);
    updateInvoiceRow(rowId, "available_for_sale", null);
    updateInvoiceRow(rowId, "pricelist_id", null);
    setItemSearchText((s) => { const n = { ...s }; delete n[rowId]; return n; });
    setItemImgErrors((s) => { const n = { ...s }; delete n[rowId]; return n; });
  };

  useEffect(() => {
    if (itemOpenId === null) return;
    const handler = (e: MouseEvent) => {
      const wrapEl   = itemWrapRefs.current[itemOpenId];
      const portalEl = itemPortalRef.current;
      if (
        wrapEl && !wrapEl.contains(e.target as Node) &&
        (!portalEl || !portalEl.contains(e.target as Node))
      ) {
        setItemOpenId(null);
        setItemDropPos(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [itemOpenId]);

  const [drafterOpen, setDrafterOpen] = useState(false);

  useEffect(() => {
    if (!drafterOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest(".btn-group")) setDrafterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [drafterOpen]);

  // Unsaved-changes guard (browser refresh / tab close)
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // In-app navigation: intercept sidebar link clicks while dirty
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const pendingNavRef = useRef<(() => void) | null>(null);

  const tryNavigate = useCallback((action: () => void) => {
    if (isDirtyRef.current) { pendingNavRef.current = action; setShowUnsavedModal(true); }
    else action();
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
      e.preventDefault();
      e.stopPropagation();
      const path = url.pathname + url.search + url.hash;
      pendingNavRef.current = () => navigate(path);
      setShowUnsavedModal(true);
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [navigate]);

  const [seriesOptions, setSeriesOptions]     = useState<SeriesItem[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null);
  const selectedSeriesIdRef = useRef<number | null>(null);

  // Configure Invoice Number modal
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configMode, setConfigMode]           = useState<"auto" | "manual">("auto");
  const [configPrefix, setConfigPrefix]       = useState("INV-");
  const [configNextNumber, setConfigNextNumber] = useState("000001");

  const applySeriesSelection = useCallback(async (series: SeriesItem) => {
    setSelectedSeriesId(series.id);
    selectedSeriesIdRef.current = series.id;

    // Seed UI immediately from cached series data while the live fetch is in-flight
    const mod = series.modules_config?.modules?.find((m) => m.module === "Invoice");
    if (mod) {
      const padLen = mod.starting_number.length;
      const numStr = String(mod.current_number).padStart(padLen, "0");
      setConfigPrefix(mod.prefix);
      setConfigNextNumber(numStr);
      setInvoiceNumber(`${mod.prefix}${numStr}`);
    }

    // Fetch the live current_number from the DB (never stale)
    try {
      const { data } = await axios.get<{ success: boolean; data?: { invoice_number: string; prefix: string; current_number: number; pad_length: number } }>(
        `/api/series/${series.id}/next-number`,
        { params: { module: "Invoice" } },
      );
      // Only apply if this series is still selected (user may have changed it)
      if (data.success && data.data && selectedSeriesIdRef.current === series.id) {
        setConfigPrefix(data.data.prefix);
        setConfigNextNumber(String(data.data.current_number).padStart(data.data.pad_length, "0"));
        setInvoiceNumber(data.data.invoice_number);
      }
    } catch { /* keep the cache-seeded value on network error */ }
  }, []);

  const openConfigModal = () => {
    // Pre-fill from the currently active series' Invoice module
    const series = seriesOptions.find((s) => s.id === selectedSeriesId);
    if (series) {
      const mod = series.modules_config?.modules?.find((m) => m.module === "Invoice");
      if (mod) {
        setConfigPrefix(mod.prefix);
        setConfigNextNumber(String(mod.current_number).padStart(mod.starting_number.length, "0"));
      }
    }
    setConfigModalOpen(true);
  };

  const saveConfigModal = () => {
    if (configMode === "auto") {
      setInvoiceNumber(`${configPrefix}${configNextNumber}`);
    }
    setConfigModalOpen(false);
  };

  useEffect(() => {
    dispatch(startLoading("invoice-form"));
    getLocationList()
      .then((locs) => {
        const active = locs.filter((l) => l.is_active);
        setLocationOptions(active.map((l) => ({ id: l.id, name: l.name })));
        const primary = active.find((l) => l.is_primary) ?? active[0];
        if (primary) {
          setLocationId(primary.id);
          setLocationName(primary.name);
        }
      })
      .catch(() => showToast("Failed to load locations. Please refresh.", "error"))
      .finally(() => { setPageReady(true); dispatch(stopLoading("invoice-form")); });
  }, []);

  // ── Edit mode: hydrate form from existing invoice ────────────────────────
  useEffect(() => {
    if (!isEdit || !editId || !pageReady) return;
    fetchInvoice(editId).then((res) => {
      if (!res.success) return;
      const inv = res.data;
      setInvoiceNumber(inv.invoice_number);
      setOrderNumber(inv.order_number ?? "");
      setInvoiceDate(inv.invoice_date);
      setPaymentTerms(inv.payment_terms ?? "due_on_receipt");
      setDueDate(inv.due_date ?? inv.invoice_date);
      setSalesperson(inv.salesperson ?? "");
      setCustomerNotes(inv.customer_notes ?? "");
      setTermsConditions(inv.terms_conditions ?? "");
      setDiscount(inv.discount_value ?? "0");
      setDiscountType((inv.discount_type as "amount" | "percent") ?? "amount");

      if (inv.customer) {
        setCustomerId(inv.customer.id);
        setCustomerName(inv.customer.display_name);
      }
      if (inv.location) {
        setLocationId(inv.location.id);
        setLocationName(inv.location.name);
      }

      // Reference
      if (inv.reference) {
        setReference(inv.reference.name);
        setReferenceItems([{ id: inv.reference.id, name: inv.reference.name, mobile: inv.reference.phone ?? undefined }]);
      }

      // Tax
      if (inv.tax_type) setTaxType(inv.tax_type as "tds" | "tcs");
      if (inv.tax) {
        setSelectedTax(inv.tax.name);
        setTaxItems([{ id: inv.tax.id, name: inv.tax.name, rate: inv.tax.rate }]);
        taxNextId.current = inv.tax.id + 1;
      }

      // Charges — always keep the default "Courier Charge" row as idx 0
      if (inv.charges_json && inv.charges_json.length > 0) {
        setChargeRows(inv.charges_json.map((c, i) => ({ id: i + 1, label: c.label, amount: String(c.amount), editingLabel: false })));
        chargeNextId.current = inv.charges_json.length + 1;
      } else {
        setChargeRows([{ id: 1, label: "Courier Charge", amount: "", editingLabel: false }]);
        chargeNextId.current = 2;
      }

      // Pricelist — fetch name from the API
      if (inv.pricelist_id) {
        setPricelistId(inv.pricelist_id);
        fetchPriceList(inv.pricelist_id).then((plRes) => {
          if (plRes.success) {
            const pd = plRes.data as Record<string, unknown>;
            setPricelistName((pd.name as string) ?? "");
          }
        });
      }

      // Payments already recorded — don't show payment entry UI in edit mode
      setPaymentReceived(false);

      if (inv.items && inv.items.length > 0) {
        const rows: typeof invoiceRows = inv.items.map((item, idx) => ({
          id: idx + 1,
          item_id:       item.item_id,
          item_name:     item.item_name,
          item_image:    null,
          quantity:      item.quantity,
          rate:          item.unit_price,
          base_rate:     item.base_rate,
          gst_rate:           item.gst_rate ?? "0",
          stock_on_hand:      null,
          available_for_sale: null,
          pricelist_id:       inv.pricelist_id ?? null,
        }));
        invoiceNextId.current = rows.length + 1;
        setInvoiceRows(rows);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, editId, pageReady]);

  // Refresh stock for all rows that already have an item selected when location changes
  useEffect(() => {
    if (!locationId) return;
    invoiceRows.forEach((row) => {
      if (!row.item_id) return;
      fetchItemStock(row.item_id).then((res) => {
        if (!res.success) return;
        const entry = res.data.find((s) => s.location_id === locationId);
        updateInvoiceRow(row.id, "stock_on_hand",      entry ? String(entry.stock_on_hand)      : null);
        updateInvoiceRow(row.id, "available_for_sale", entry ? String(entry.available_for_sale) : null);
      });
    });
  }, [locationId]);

  // Fetch series whenever location changes and auto-select the best option
  useEffect(() => {
    if (!locationId) return;
    setSelectedSeriesId(null);
    selectedSeriesIdRef.current = null;
    setSeriesOptions([]);
    fetchSeriesForLocation(locationId).then((res) => {
      if (!res.success) { showToast("Failed to load transaction series.", "error"); return; }
      const options = res.data;
      setSeriesOptions(options);
      // In edit mode, just load options — don't overwrite the existing invoice number
      if (isEdit) return;
      // Auto-select: prefer the only location-specific series, otherwise the system default
      const locationSpecific = options.filter((s) => !s.is_system_default);
      const toSelect = locationSpecific.length === 1
        ? locationSpecific[0]
        : options.find((s) => s.is_system_default) ?? options[0] ?? null;
      if (toSelect) applySeriesSelection(toSelect);
    }).catch(() => showToast("Failed to load transaction series.", "error"));
  }, [locationId]);

  // Fetch all active pricelists once on mount
  useEffect(() => {
    fetchPriceLists({ per_page: 1000, transaction_type: "sales" }).then((res) => {
      if (res.success) setPricelistData(res.data.data);
    }).catch(() => {});
  }, []);

  // Auto-select pricelist when customer or loaded data changes
  useEffect(() => {
    if (pricelistData.length === 0) return;
    const cat = selectedCustomer?.category?.toLowerCase();
    if (!cat) {
      setPricelistId(null);
      setPricelistName("");
      setInvoiceRows((rows) => rows.map((r) => ({ ...r, rate: r.base_rate || "0.00", pricelist_id: null })));
      return;
    }
    const matched = pricelistData.filter((p) => p.customer_category_name?.toLowerCase() === cat);
    if (matched.length === 1) {
      const pl = matched[0];
      setPricelistId(pl.id);
      setPricelistName(pl.name);
      fetchPriceList(pl.id).then((res) => {
        if (!res.success) return;
        const d = res.data as Record<string, unknown>;
        const plType = d.price_list_type as string | undefined;
        const plItems = d.items as Array<{ item_id: number; custom_rate?: string | null; discount?: string | null }> | undefined;
        setInvoiceRows((rows) => rows.map((r) => {
          if (!r.item_id) return { ...r, pricelist_id: pl.id };
          const baseRate = parseFloat(r.base_rate) || 0;
          let rateVal = r.base_rate;
          if (plType === "individual_items" && plItems) {
            const entry = plItems.find((it) => it.item_id === r.item_id);
            if (entry?.custom_rate) rateVal = entry.custom_rate;
            else if (entry?.discount) rateVal = (baseRate * (1 - (parseFloat(entry.discount) || 0) / 100)).toFixed(decimalRate);
          } else if (plType === "all_items") {
            const gr = d.custom_rate as string | null | undefined;
            const gd = d.discount as string | null | undefined;
            if (gr) rateVal = gr;
            else if (gd) rateVal = (baseRate * (1 - (parseFloat(gd) || 0) / 100)).toFixed(decimalRate);
          }
          return { ...r, rate: rateVal, pricelist_id: pl.id };
        }));
      });
    } else {
      setPricelistId(null);
      setPricelistName("");
      setInvoiceRows((rows) => rows.map((r) => ({ ...r, rate: r.base_rate || "0.00", pricelist_id: null })));
    }
  }, [selectedCustomer, pricelistData]);

  // Refresh: bust caches and reload location list + series for current location
  const handleRefresh = useCallback(async () => {
    bustLocationLists();
    bustSeriesLists();
    const locs = await getLocationList().catch(() => []);
    const active = locs.filter((l) => l.is_active);
    setLocationOptions(active.map((l) => ({ id: l.id, name: l.name })));
  }, []);

  // Load invoice and product settings once on mount
  useEffect(() => {
    const loadInvoiceSettings = () =>
      getSettings<InvoiceConfiguration>("invoices")
        .then((data) => setInvoiceSettings(data))
        .catch(() => getSettings<InvoiceConfiguration>("invoices")
          .then((data) => setInvoiceSettings(data))
          .catch(() => {}));

    loadInvoiceSettings();
    getSettings<ProductConfiguration>("products")
      .then((data) => setDecimalRate(data.decimal_rate ?? 2))
      .catch(() => {});
  }, []);

  // When customer changes, fetch their distribution_category_id
  useEffect(() => {
    if (!customerId) { setCustomerCategoryId(null); return; }
    fetchParty(customerId).then((res) => {
      if (res.success) setCustomerCategoryId(res.data.distribution_category_id);
      else setCustomerCategoryId(null);
    }).catch(() => setCustomerCategoryId(null));
  }, [customerId]);

  // Fetch advance balance when customer is in advance-payment category
  useEffect(() => {
    if (!isAdvancePayment || !customerId) { setAdvanceBalance(null); return; }
    setAdvanceBalanceLoading(true);
    fetchAdvanceBalance(customerId)
      .then((res) => setAdvanceBalance(res.success ? res.data.balance : 0))
      .catch(() => setAdvanceBalance(0))
      .finally(() => setAdvanceBalanceLoading(false));
  }, [isAdvancePayment, customerId]);

  // Derived pricelist display state
  const pricelistCatMatches = (() => {
    const cat = selectedCustomer?.category?.toLowerCase();
    if (!cat) return [];
    return pricelistData.filter((p) => p.customer_category_name?.toLowerCase() === cat);
  })();
  const isAutoSelectedPricelist = pricelistCatMatches.length === 1 && pricelistId !== null;
  const pricelistOptions = pricelistCatMatches.length >= 2 ? pricelistCatMatches : pricelistData;

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!customerId)           errs.customer_id    = "Please select a customer.";
    if (!invoiceNumber.trim()) errs.invoice_number = "Invoice number is required.";
    if (invoiceNumDuplicate)   errs.invoice_number = "This invoice number is already in use.";
    const filledRows = invoiceRows.filter((r) => r.item_id || r.item_name.trim());
    if (filledRows.length === 0) errs.items = "At least one line item is required.";
    const advanceRequired = invoiceTotal - discountAmt;
    if (isAdvancePayment && advanceBalance !== null && advanceBalance < advanceRequired - 0.01) {
      errs.payments = `Insufficient advance balance. Available: ₹${advanceBalance.toFixed(2)}, Required: ₹${advanceRequired.toFixed(2)}.`;
    }
    if (!isAdvancePayment && paymentReceived) {
      const totalPaid = paymentRows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
      if (totalPaid <= 0)              errs.payments = "Enter at least one payment amount.";
      if (totalPaid > grandTotal + 0.01) errs.payments = "Total payment cannot exceed the grand total.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const PAYMENT_MODE_MAP: Record<string, string> = {
    "Cash": "cash", "Cheque": "cheque", "Bank Transfer": "bank_transfer",
    "Credit Card": "credit_card", "UPI": "upi", "Advance Payment": "advance_payment",
  };

  const buildPayload = (status: "sent" | "draft") => {
    const refEntry  = referenceItems.find((r) => r.name === reference);
    const filledRows = invoiceRows.filter((r) => r.item_id || r.item_name.trim());
    return {
      invoice_number:   invoiceNumber.trim(),
      status,
      customer_id:      customerId,
      location_id:      locationId,
      series_id:        selectedSeriesId,
      reference_id:     refEntry?.id ?? null,
      pricelist_id:     pricelistId,
      order_number:     orderNumber.trim() || null,
      invoice_date:     invoiceDate,
      payment_terms:    paymentTerms,
      due_date:         dueDate || null,
      salesperson:      salesperson.trim() || null,
      sub_total:        invoiceTotal,
      discount_type:    discountType,
      discount_value:   parseFloat(discount) || 0,
      discount_amount:  discountAmt,
      tax_type:         selectedTax ? taxType : null,
      tax_id:           selectedTaxEntry?.id ?? null,
      tax_rate:         taxRate || null,
      tax_amount:       signedTaxAmt,
      charges_json:     chargeRows.filter((r) => r.amount).map((r) => ({ label: r.label, amount: parseFloat(r.amount) || 0 })),
      total_charges:    totalCharges,
      grand_total:      grandTotal,
      customer_notes:   customerNotes.trim() || null,
      terms_conditions: termsConditions.trim() || null,
      items: filledRows.map((r, i) => {
        const qty  = parseFloat(r.quantity) || 0;
        const rate = parseFloat(r.rate)     || 0;
        const gst  = parseFloat(r.gst_rate) || 0;
        return {
          item_id:      r.item_id,
          item_name:    r.item_name,
          pricelist_id: r.pricelist_id,
          quantity:     qty,
          unit_price:   rate,
          base_rate:    parseFloat(r.base_rate) || 0,
          gst_rate:     gst,
          gst_amount:   parseFloat(((qty * rate * gst) / 100).toFixed(decimalRate)),
          amount:       parseFloat((qty * rate).toFixed(decimalRate)),
          sort_order:   i,
        };
      }),
      payments: paymentReceived
        ? paymentRows
            .filter((r) => parseFloat(r.amount) > 0)
            .map((r, idx) => {
              const isLocked = isAdvancePayment && idx === 0;
              return {
                payment_mode:     PAYMENT_MODE_MAP[isLocked ? "Advance Payment" : r.mode] ?? "cash",
                amount:           isLocked ? parseFloat(advancePaymentAmount) : parseFloat(r.amount),
                reference_number: null,
              };
            })
        : [],
    };
  };

  const handleSave = async (status: "sent" | "draft" = "sent") => {
    if (!validate()) {
      showToast("Please fill in all required fields before saving.", "error");
      return;
    }
    if (cfPanelRef.current && !cfPanelRef.current.validate()) {
      showToast("Please fill in all required custom fields before saving.", "error");
      return;
    }

    // On edit: pre-check stock impact — show warning modal if conflicts exist
    // Skip if user already confirmed via the warning modal
    if (isEdit && editId && status !== "draft" && !stockWarningConfirmed.current) {
      const filledRows = invoiceRows.filter((r) => r.item_id || r.item_name.trim());
      try {
        const impactRes = await axios.post<{ success: boolean; warnings: StockWarning[] }>(
          `/api/invoices/${editId}/stock-impact`,
          { items: filledRows.map((r) => ({ item_id: r.item_id, quantity: parseFloat(r.quantity) || 0 })) }
        );
        if (impactRes.data.success && impactRes.data.warnings.length > 0) {
          setStockWarnings(impactRes.data.warnings);
          pendingSaveStatus.current = status;
          setShowStockModal(true);
          return; // wait for user confirmation
        }
      } catch { /* non-blocking — proceed if impact check fails */ }
    }
    stockWarningConfirmed.current = false; // reset for next save

    setSaving(true);
    try {
      const payload = buildPayload(status);
      const url     = isEdit ? `/api/invoices/${editId}` : "/api/invoices";
      const { data } = isEdit
        ? await axios.put<{ success: boolean; data: { id: number }; message?: string }>(url, payload)
        : await axios.post<{ success: boolean; data: { id: number }; message?: string }>(url, payload);
      if (!data.success) { showToast(data.message ?? "Failed to save invoice.", "error"); return; }

      // Upload any staged attachments
      if (attachedFiles.length > 0) {
        for (const file of attachedFiles) {
          const form = new FormData();
          form.append("file", file);
          try {
            await axios.post(`/api/invoices/${data.data.id}/attachments`, form);
          } catch {
            showToast("Invoice saved, but one or more attachments failed to upload.", "error");
            clearDirty();
            emitMutation("invoices:mutated");
            setTimeout(() => navigate(`/invoices/${data.data.id}`), 800);
            return;
          }
        }
      }

      clearDirty();
      showToast(isEdit ? "Invoice updated successfully!" : "Invoice saved successfully!", "success");
      emitMutation("invoices:mutated");
      setTimeout(() => navigate(`/invoices/${data.data.id}`), 800);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        const body = err.response.data as { message?: string; errors?: Record<string, string[]> };
        showToast(body.message ?? "Failed to save invoice.", "error");
        if (body.errors) {
          const mapped: Record<string, string> = {};
          Object.entries(body.errors).forEach(([k, v]) => { mapped[k] = v[0]; });
          setErrors(mapped);
        }
      } else {
        showToast("Network error. Please check your connection.", "error");
      }
    } finally {
      setSaving(false);
    }
  };

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
          .invoice-fields-row   { position: relative; padding-right: 246px; }
          .invoice-field-panel  {
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
      {/* Toast notification */}
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

      <div className="page-wrapper">
        <div className="content">

          <PageHeader
            title={isEdit ? "Edit Invoice" : "New Invoice"}
            showModuleTile={false}
            showExport={false}
            showClose
            onRefresh={handleRefresh}
            onClose={() => tryNavigate(() => (window.history.length > 1 ? navigate(-1) : navigate("/")))}
          />

          {/* Form */}
          <div className="row" onChangeCapture={markDirty}>
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  {/* Single flex row: Customer Name | Location | Details panel far right */}
                  <div className="invoice-fields-row">

                    {/* Customer Name */}
                    <div className="invoice-field-customer">
                      <label className="form-label fw-medium fs-14 text-danger" htmlFor="inv-customer">
                        Customer Name <span aria-hidden="true">*</span>
                      </label>
                      <div className={errors.customer_id ? "is-invalid" : undefined}>
                        <InlineDropdown
                          label="Customer"
                          value={customerName}
                          onChange={(name, id, item) => { markDirty(); setCustomerName(name); setCustomerId(id); setSelectedCustomer(item); clr("customer_id"); }}
                          onSearch={fetchCustomers}
                          onAdd={(q) => { setPartyModalQuery(q); setShowPartyModal(true); }}
                        />
                      </div>
                      {errors.customer_id && <div className="invalid-feedback d-block">{errors.customer_id}</div>}
                    </div>

                    {/* Location */}
                    <div className="invoice-field-location">
                      <label className="form-label fw-medium fs-14">Location</label>
                      <InlineDropdown
                        label="Location"
                        value={locationName}
                        onChange={(name, id) => { markDirty(); setLocationName(name); setLocationId(id); }}
                        items={locationOptions}
                      />
                    </div>

                    {/* Customer details panel — pushed to far right */}
                    {selectedCustomer && (
                      <div className="invoice-field-panel" style={{ zIndex: 10 }}>
                        <div className="card border shadow invoice-customer-details mb-0" style={{ cursor: "pointer", width: 230 }} onClick={() => setDrawerOpen(true)}>
                          <div className="card-body p-3">
                            <div className="d-flex align-items-center gap-2">

                              {/* Avatar */}
                              <div
                                className="inv-cust-avatar rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{ width: 36, height: 36, background: "#E41F07", color: "#fff", fontWeight: 700, fontSize: 14, userSelect: "none" }}
                              >
                                {getInitial(selectedCustomer.name)}
                              </div>

                              {/* Name + unpaid */}
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div className="fs-14 fw-semibold text-truncate" style={{ width: "100%" }}>
                                  {selectedCustomer.name}
                                </div>
                                <div className="d-flex align-items-center gap-1 mt-1">
                                  <span className="badge badge-soft-danger">1 Unpaid</span>
                                </div>
                              </div>

                              <i className="ti ti-chevron-right ms-2 text-muted fs-14 flex-shrink-0" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Divider */}
                  <div className="border-top mt-4" />

                  {/* Invoice fields */}
                  <div className="pt-4">

                    {/* Invoice# */}
                    <div className="row mb-3 align-items-center">
                      <label className="col-sm-2 col-form-label fw-medium fs-14 text-danger">
                        Invoice#&nbsp;<span>*</span>
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
                            : null
                          }
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
                        <div className={`input-group${errors.invoice_number || invoiceNumDuplicate ? " is-invalid" : ""}`}>
                          <input
                            type="text"
                            id="inv-number"
                            className={`form-control${errors.invoice_number || invoiceNumDuplicate ? " is-invalid" : ""}`}
                            value={invoiceNumber}
                            maxLength={50}
                            aria-label="Invoice number"
                            readOnly={configMode === "auto"}
                            style={configMode === "auto" ? { background: "#f8f9fa", cursor: "default" } : undefined}
                            onChange={(e) => {
                              if (configMode !== "manual") return;
                              markDirty();
                              setInvoiceNumber(e.target.value);
                              setInvoiceNumDuplicate(false);
                              clr("invoice_number");
                            }}
                            onBlur={async () => {
                              if (configMode !== "manual" || !invoiceNumber.trim()) return;
                              setInvoiceNumChecking(true);
                              try {
                                const { data } = await axios.get<{ success: boolean; data?: { available: boolean } }>("/api/invoices/check-number", { params: { invoice_number: invoiceNumber.trim() } });
                                const dup = data.success ? !(data.data?.available) : false;
                                setInvoiceNumDuplicate(dup);
                                if (dup) setErrors((prev) => ({ ...prev, invoice_number: "This invoice number is already in use." }));
                              } catch { /* ignore */ }
                              finally { setInvoiceNumChecking(false); }
                            }}
                          />
                          {invoiceNumChecking && <span className="input-group-text"><span className="spinner-border spinner-border-sm" /></span>}
                          <button type="button" className="btn btn-outline-light" title="Configure" onClick={openConfigModal} aria-label="Configure invoice number">
                            <i className="ti ti-settings fs-15" />
                          </button>
                        </div>
                        {(errors.invoice_number || invoiceNumDuplicate) && (
                          <div className="invalid-feedback d-block">{errors.invoice_number ?? "This invoice number is already in use."}</div>
                        )}
                      </div>
                    </div>

                    {/* Order Number */}
                    <div className="row mb-3 align-items-center">
                      <label className="col-sm-2 col-form-label fw-medium fs-14">Order Number</label>
                      <div className="col-sm-4">
                        <input
                          type="text"
                          className="form-control"
                          value={orderNumber}
                          onChange={(e) => setOrderNumber(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Invoice Date | Terms | Due Date */}
                    <div className="row mb-3 align-items-center">
                      <label className="col-sm-2 col-form-label fw-medium fs-14 text-danger">
                        Invoice Date&nbsp;<span>*</span>
                      </label>
                      <div className="col-sm-2">
                        <CommonDatePicker
                          value={invoiceDate ? dayjs(invoiceDate) : null}
                          onChange={(date) => {
                            markDirty();
                            const newDate = date ? date.format("YYYY-MM-DD") : "";
                            setInvoiceDate(newDate);
                            if (newDate && paymentTerms !== "custom") {
                              setDueDate(calcDueDate(newDate, paymentTerms));
                            }
                          }}
                          disabledDate={(current) => current.isAfter(dayjs(), "day")}
                          format="DD/MM/YYYY"
                          placeholder="DD/MM/YYYY"
                        />
                      </div>
                      <label className="col-sm-1 col-form-label fw-medium fs-14 text-sm-end">Terms</label>
                      <div className="col-sm-2">
                        <CommonSelect
                          className="select"
                          options={[
                            { value: "due_on_receipt", label: "Due on Receipt" },
                            { value: "net_15",         label: "Net 15"         },
                            { value: "net_30",         label: "Net 30"         },
                            { value: "net_45",         label: "Net 45"         },
                            { value: "net_60",         label: "Net 60"         },
                            { value: "net_90",         label: "Net 90"         },
                            { value: "custom",         label: "Custom"         },
                          ]}
                          value={{ value: paymentTerms, label: TERMS_LABEL[paymentTerms] ?? paymentTerms }}
                          onChange={(opt: Option | null) => {
                            markDirty();
                            const terms = opt?.value ?? "due_on_receipt";
                            setPaymentTerms(terms);
                            if (terms !== "custom" && invoiceDate) {
                              setDueDate(calcDueDate(invoiceDate, terms));
                            }
                          }}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                        />
                      </div>
                      <label className="col-sm-1 col-form-label fw-medium fs-14 text-sm-end" style={{ whiteSpace: "nowrap" }}>Due Date</label>
                      <div className="col-sm-2">
                        <CommonDatePicker
                          value={dueDate ? dayjs(dueDate) : null}
                          onChange={(date) => {
                            markDirty();
                            setDueDate(date ? date.format("YYYY-MM-DD") : "");
                            setPaymentTerms("custom");
                          }}
                          disabledDate={(current) => !!invoiceDate && current.isBefore(dayjs(invoiceDate), "day")}
                          format="DD/MM/YYYY"
                          placeholder="DD/MM/YYYY"
                        />
                      </div>
                    </div>

                    <div className="border-top mt-2 mb-4" />

                    {/* Salesperson | Reference# */}
                    <div className="row mb-3 align-items-center">
                      <label className="col-sm-2 col-form-label fw-medium fs-14">Salesperson</label>
                      <div className="col-sm-4">
                        <EntityField
                          label="Salesperson"
                          value={salesperson}
                          onChange={(name) => { markDirty(); setSalesperson(name); }}
                          items={[]}
                        />
                      </div>
                      <label className="col-sm-1 col-form-label fw-medium fs-14 text-sm-end" style={{ whiteSpace: "nowrap" }}>Reference</label>
                      <div className="col-sm-4">
                        <EntityField
                          label="Reference"
                          value={reference}
                          onChange={(name) => { markDirty(); setReference(name); }}
                          items={referenceItems}
                          onManage={() => setShowRefModal(true)}
                          manageLabel="Add Reference"
                        />
                      </div>
                    </div>

                    {/* Items table */}
                    <div className="border-top pt-4 mb-4">
                      {/* Pricelist */}
                      <div className="d-flex align-items-center gap-2 mb-3" style={{ marginLeft: 16 }}>
                        <i className="ti ti-tag fs-14" style={{ color: "#9ca3af" }} />
                        <span className="fs-12" style={{ color: "#9ca3af" }}>Pricelist</span>

                        {isAutoSelectedPricelist ? (
                          <div className="d-inline-flex align-items-center gap-1">
                            <span className="fs-13 fw-medium" style={{ color: "#374151" }}>{pricelistName}</span>
                            <span className="badge badge-soft-success" style={{ fontSize: 10 }}>Auto</span>
                            <button
                              type="button"
                              className="btn p-0 border-0 bg-transparent"
                              style={{ lineHeight: 1, marginLeft: 2 }}
                              title="Clear"
                              onClick={() => {
                              setPricelistId(null);
                              setPricelistName("");
                              setInvoiceRows((rows) => rows.map((r) => ({ ...r, rate: r.base_rate || "0.00", pricelist_id: null })));
                            }}
                            >
                              <i className="ti ti-x fs-11" style={{ color: "#9ca3af" }} />
                            </button>
                          </div>
                        ) : (
                          <div className="position-relative d-inline-flex align-items-center">
                            <select
                              style={{
                                background: "transparent",
                                border: "none",
                                borderBottom: "1.5px dashed #d1d5db",
                                outline: "none",
                                cursor: "pointer",
                                appearance: "none",
                                WebkitAppearance: "none",
                                color: pricelistId ? "#374151" : "#9ca3af",
                                fontWeight: pricelistId ? 500 : 400,
                                fontSize: 13,
                                padding: "2px 20px 2px 2px",
                              }}
                              value={pricelistId ?? ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (!val) {
                                  setPricelistId(null);
                                  setPricelistName("");
                                  setInvoiceRows((rows) => rows.map((r) => ({ ...r, rate: r.base_rate || "0.00", pricelist_id: null })));
                                  return;
                                }
                                const plId = Number(val);
                                setPricelistId(plId);
                                setPricelistName(e.target.options[e.target.selectedIndex].text);
                                fetchPriceList(plId).then((res) => {
                                  if (!res.success) return;
                                  const d = res.data as Record<string, unknown>;
                                  const plType = d.price_list_type as string | undefined;
                                  const plItems = d.items as Array<{ item_id: number; custom_rate?: string | null; discount?: string | null }> | undefined;
                                  setInvoiceRows((rows) => rows.map((r) => {
                                    if (!r.item_id) return { ...r, pricelist_id: plId };
                                    const baseRate = parseFloat(r.base_rate) || 0;
                                    let rateVal = r.base_rate;
                                    if (plType === "individual_items" && plItems) {
                                      const entry = plItems.find((it) => it.item_id === r.item_id);
                                      if (entry?.custom_rate) rateVal = entry.custom_rate;
                                      else if (entry?.discount) rateVal = (baseRate * (1 - (parseFloat(entry.discount) || 0) / 100)).toFixed(decimalRate);
                                    } else if (plType === "all_items") {
                                      const gr = d.custom_rate as string | null | undefined;
                                      const gd = d.discount as string | null | undefined;
                                      if (gr) rateVal = gr;
                                      else if (gd) rateVal = (baseRate * (1 - (parseFloat(gd) || 0) / 100)).toFixed(decimalRate);
                                    }
                                    return { ...r, rate: rateVal, pricelist_id: plId };
                                  }));
                                });
                              }}
                            >
                              <option value="">-- None --</option>
                              {pricelistOptions.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                            <i className="ti ti-chevron-down position-absolute fs-12" style={{ right: 0, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
                          </div>
                        )}
                      </div>

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

                        {/* Empty state hint */}
                        {errors.items && (
                          <div className="d-flex align-items-center gap-2 px-4 py-3 border-bottom" style={{ background: "#fff8f8" }}>
                            <i className="ti ti-alert-circle text-danger fs-16" />
                            <span className="fs-13 text-danger">{errors.items}</span>
                          </div>
                        )}

                        {/* Rows */}
                        {invoiceRows.map((row) => (
                          <div key={row.id} className="d-flex align-items-stretch border-bottom">
                            {/* Image */}
                            <div className="d-none d-sm-flex align-items-center justify-content-center" style={{ width: 80, flexShrink: 0, borderRight: "1px solid #dee2e6", padding: "12px" }}>
                              <div
                                className="border rounded d-flex align-items-center justify-content-center overflow-hidden"
                                style={{ width: 56, height: 56, background: "#f8f9fa" }}
                              >
                                {row.item_image && !itemImgErrors[row.id] ? (
                                  <img
                                    src={row.item_image}
                                    alt=""
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    onError={() => setItemImgErrors((p) => ({ ...p, [row.id]: true }))}
                                  />
                                ) : (
                                  <i className="ti ti-photo text-muted" style={{ fontSize: 22 }} />
                                )}
                              </div>
                            </div>
                            {/* Item selector */}
                            <div
                              className="d-flex flex-column justify-content-center"
                              style={{ flex: 1, borderRight: "1px solid #dee2e6", padding: "12px" }}
                              ref={(el) => { itemWrapRefs.current[row.id] = el; }}
                            >
                              <div
                                className="input-group w-100"
                                ref={(el) => { itemInputRefs.current[row.id] = el; }}
                              >
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Select or Add Item"
                                  value={row.item_name}
                                  readOnly
                                  style={{ cursor: "pointer" }}
                                  onClick={() => toggleItemDrop(row.id)}
                                />
                                {row.item_name && (
                                  <button type="button" className="btn btn-outline-light" title="Clear selection" onClick={() => clearItemRow(row.id)}>
                                    <i className="ti ti-x" style={{ fontSize: 13 }} />
                                  </button>
                                )}
                                <button type="button" className="btn btn-outline-light" onClick={() => toggleItemDrop(row.id)}>
                                  <i className={`ti ti-chevron-${itemOpenId === row.id ? "up" : "down"}`} />
                                </button>
                              </div>
                              <span style={{ display: "block", fontSize: 11, lineHeight: 1.3, marginTop: 4, minHeight: "28px", visibility: "hidden" }}>x</span>
                            </div>
                            {/* Quantity */}
                            <div className="d-flex flex-column justify-content-center" style={{ width: 110, flexShrink: 0, borderRight: "1px solid #dee2e6", padding: "16px 12px" }}>
                              <input
                                type="number"
                                className="form-control text-center"
                                min={0.0001}
                                step="any"
                                value={row.quantity}
                                onChange={(e) => updateInvoiceRow(row.id, "quantity", e.target.value)}
                                onBlur={(e) => {
                                  const v = parseFloat(e.target.value);
                                  if (!e.target.value.trim() || isNaN(v) || v <= 0)
                                    updateInvoiceRow(row.id, "quantity", "1");
                                }}
                              />
                              <span style={{ display: "block", fontSize: 12, lineHeight: 1.3, marginTop: 10, minHeight: "28px", textAlign: "center", visibility: row.available_for_sale !== null ? "visible" : "hidden", color: parseFloat(row.available_for_sale ?? "0") < 0 ? "#ef4444" : "#9ca3af" }}>
                                Available: {row.available_for_sale ?? "0"}
                              </span>
                            </div>
                            {/* Rate */}
                            <div className="d-flex flex-column justify-content-center" style={{ width: 170, flexShrink: 0, borderRight: "1px solid #dee2e6", padding: "16px 12px" }}>
                              <input
                                type="number"
                                className="form-control"
                                min={0}
                                step="any"
                                value={row.rate}
                                onChange={(e) => updateInvoiceRow(row.id, "rate", e.target.value)}
                                onBlur={(e) => {
                                  const v = parseFloat(e.target.value);
                                  if (!e.target.value.trim() || isNaN(v) || v < 0)
                                    updateInvoiceRow(row.id, "rate", "0.00");
                                }}
                              />
                              {row.item_id ? (
                                <div className="d-flex align-items-center gap-2" style={{ marginTop: 10, minHeight: "28px" }}>
                                  <span className="fs-12" style={{ color: "#9ca3af" }}>Pricelist</span>
                                  <div className="position-relative d-inline-flex align-items-center">
                                    <select
                                      style={{
                                        background: "transparent",
                                        border: "none",
                                        borderBottom: "1.5px dashed #d1d5db",
                                        outline: "none",
                                        cursor: "pointer",
                                        appearance: "none",
                                        WebkitAppearance: "none",
                                        color: row.pricelist_id ? "#374151" : "#9ca3af",
                                        fontWeight: row.pricelist_id ? 500 : 400,
                                        fontSize: 13,
                                        padding: "2px 20px 2px 2px",
                                      }}
                                      value={row.pricelist_id ?? ""}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        if (!val) {
                                          updateInvoiceRow(row.id, "pricelist_id", null);
                                          updateInvoiceRow(row.id, "rate", row.base_rate || "0.00");
                                          return;
                                        }
                                        const plId = Number(val);
                                        updateInvoiceRow(row.id, "pricelist_id", plId);
                                        fetchPriceList(plId).then((res) => {
                                          if (!res.success) return;
                                          const d = res.data as Record<string, unknown>;
                                          const plType = d.price_list_type as string | undefined;
                                          const items = d.items as Array<{ item_id: number; custom_rate?: string | null; discount?: string | null }> | undefined;
                                          const baseRate = parseFloat(row.base_rate) || 0;
                                          if (plType === "individual_items" && items) {
                                            const entry = items.find((it) => it.item_id === row.item_id);
                                            if (entry?.custom_rate) {
                                              updateInvoiceRow(row.id, "rate", entry.custom_rate);
                                            } else if (entry?.discount) {
                                              updateInvoiceRow(row.id, "rate", (baseRate * (1 - (parseFloat(entry.discount) || 0) / 100)).toFixed(decimalRate));
                                            }
                                          } else if (plType === "all_items") {
                                            const globalRate = d.custom_rate as string | null | undefined;
                                            const globalDiscount = d.discount as string | null | undefined;
                                            if (globalRate) {
                                              updateInvoiceRow(row.id, "rate", globalRate);
                                            } else if (globalDiscount) {
                                              updateInvoiceRow(row.id, "rate", (baseRate * (1 - (parseFloat(globalDiscount) || 0) / 100)).toFixed(decimalRate));
                                            }
                                          }
                                        });
                                      }}
                                    >
                                      <option value="">-- None --</option>
                                      {pricelistData.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                      ))}
                                    </select>
                                    <i className="ti ti-chevron-down position-absolute fs-12" style={{ right: 0, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
                                  </div>
                                </div>
                              ) : (
                                <span style={{ display: "block", fontSize: 11, lineHeight: 1.3, marginTop: 10, minHeight: "28px", visibility: "hidden" }}>x</span>
                              )}
                            </div>
                            {/* GST — read only */}
                            <div className="d-flex flex-column justify-content-center" style={{ width: 120, flexShrink: 0, borderRight: "1px solid #dee2e6", padding: "12px" }}>
                              <div className="form-control bg-light text-muted" style={{ userSelect: "none", cursor: "default" }}>
                                {(() => {
                                  const qty = parseFloat(row.quantity) || 0;
                                  const rate = parseFloat(row.rate) || 0;
                                  const gst = parseFloat(row.gst_rate) || 0;
                                  return (qty * rate * gst / 100).toFixed(decimalRate);
                                })()}
                              </div>
                              <span style={{ display: "block", fontSize: 11, lineHeight: 1.3, marginTop: 4, minHeight: "28px", visibility: "hidden" }}>x</span>
                            </div>
                            {/* Amount */}
                            <div className="d-flex flex-column justify-content-center" style={{ width: 150, flexShrink: 0, padding: "12px" }}>
                              <div className="form-control bg-light text-muted" style={{ userSelect: "none", cursor: "default" }}>
                                {((parseFloat(row.quantity) || 0) * (parseFloat(row.rate) || 0)).toFixed(decimalRate)}
                              </div>
                              <span style={{ display: "block", fontSize: 11, lineHeight: 1.3, marginTop: 4, minHeight: "28px", visibility: "hidden" }}>x</span>
                            </div>
                            {/* Remove */}
                            <div className="d-flex flex-column align-items-center justify-content-center" style={{ width: 48, flexShrink: 0 }}>
                              <button
                                type="button"
                                className="btn p-0 border-0 bg-transparent text-danger"
                                title="Remove"
                                disabled={invoiceRows.length === 1}
                                onClick={() => { markDirty(); removeInvoiceRow(row.id); }}
                              >
                                <i className="ti ti-circle-x fs-18" />
                              </button>
                              <span style={{ display: "block", fontSize: 11, lineHeight: 1.3, marginTop: 4, minHeight: "28px", visibility: "hidden" }}>x</span>
                            </div>
                          </div>
                        ))}

                        {/* Footer */}
                        <div style={{ background: "#fafafa" }}>
                          <div className="d-flex align-items-center gap-3 pt-2 pb-2 px-3">
                            <button
                              type="button"
                              className="btn btn-link p-0 fs-13 text-danger d-flex align-items-center gap-1"
                              style={{ textDecoration: "none", whiteSpace: "nowrap" }}
                              onClick={() => { markDirty(); addInvoiceRow(); }}
                            >
                              <i className="ti ti-circle-plus fs-15" />
                              Add New Row
                            </button>
                            <button
                              type="button"
                              className="btn btn-link p-0 fs-13 text-danger d-flex align-items-center gap-1"
                              style={{ textDecoration: "none", whiteSpace: "nowrap" }}
                              onClick={openBulkModal}
                            >
                              <i className="ti ti-playlist-add fs-15" />
                              Add Bulk Items
                            </button>
                          </div>
                          {/* Totals row */}
                          <div className="d-flex align-items-center pb-2">
                            <div className="d-none d-sm-block" style={{ width: 80, flexShrink: 0 }} />
                            <div className="px-3" style={{ flex: 1, minWidth: 0 }}>
                              <span className="fs-13 text-muted fw-medium">Total (₹)</span>
                            </div>
                            <div style={{ width: 110, flexShrink: 0 }} />
                            <div style={{ width: 170, flexShrink: 0 }} />
                            <div style={{ width: 120, flexShrink: 0 }} />
                            <div className="px-3" style={{ width: 150, flexShrink: 0 }}>
                              <span className="fs-14 fw-semibold">{invoiceTotal.toFixed(decimalRate)}</span>
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
                            <span className="fs-14 fw-medium">{invoiceTotal.toFixed(decimalRate)}</span>
                          </div>
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <span className="fs-14 fw-medium">Discount</span>
                            <div className="d-flex align-items-center gap-2">
                              <div className="input-group" style={{ width: 170 }}>
                                <input
                                  type="number"
                                  className="form-control text-end"
                                  min={0}
                                  step="any"
                                  style={{ height: 38 }}
                                  value={discount}
                                  onChange={(e) => setDiscount(e.target.value)}
                                  onBlur={(e) => { if (!e.target.value.trim() || isNaN(parseFloat(e.target.value))) setDiscount("0"); }}
                                />
                                <select
                                  className="form-select"
                                  style={{ maxWidth: 65, height: 38 }}
                                  value={discountType}
                                  onChange={(e) => setDiscountType(e.target.value as "amount" | "percent")}
                                >
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
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  id="tax-tds"
                                  checked={taxType === "tds"}
                                  onChange={() => setTaxType("tds")}
                                />
                                <label className="form-check-label fs-14 fw-medium" htmlFor="tax-tds">TDS</label>
                              </div>
                              <div className="form-check mb-0">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  id="tax-tcs"
                                  checked={taxType === "tcs"}
                                  onChange={() => setTaxType("tcs")}
                                />
                                <label className="form-check-label fs-14 fw-medium" htmlFor="tax-tcs">TCS</label>
                              </div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <div style={{ width: 170 }}>
                                <EntityField
                                  label="Tax"
                                  value={selectedTax}
                                  onChange={(name) => { markDirty(); setSelectedTax(name); }}
                                  items={taxItems.map((t) => ({ id: t.id, name: t.name, mobile: t.rate ? `${t.rate}%` : undefined }))}
                                  onManage={() => setShowTaxModal(true)}
                                  manageLabel="Manage Taxes"
                                />
                              </div>
                              <span
                                className="fs-14 fw-medium"
                                style={{ minWidth: 50, textAlign: "right", whiteSpace: "nowrap", color: signedTaxAmt < 0 ? "#E41F07" : signedTaxAmt > 0 ? "#16a34a" : "#6b7280" }}
                              >
                                {signedTaxAmt > 0 ? `+${signedTaxAmt.toFixed(decimalRate)}` : signedTaxAmt < 0 ? `-${Math.abs(signedTaxAmt).toFixed(decimalRate)}` : (0).toFixed(decimalRate)}
                              </span>
                            </div>
                          </div>

                          {/* Charge rows */}
                          {chargeRows.map((row, idx) => (
                            <div key={row.id} className="d-flex align-items-center justify-content-between mb-2" style={{ gap: 8 }}>
                              <div className="d-flex align-items-center gap-2" style={{ flex: "1 1 auto", minWidth: 0 }}>
                                {idx === 0 ? (
                                  <span className="fs-14 fw-medium" style={{ minHeight: 38, display: "flex", alignItems: "center", wordBreak: "break-word" }}>{row.label}</span>
                                ) : row.editingLabel ? (
                                  <input
                                    autoFocus
                                    type="text"
                                    className="form-control"
                                    style={{ height: 38, width: 130, fontSize: 13 }}
                                    value={row.label}
                                    onChange={(e) => setChargeRows((p) => p.map((r) => r.id === row.id ? { ...r, label: e.target.value } : r))}
                                    onBlur={() => setChargeRows((p) => p.map((r) => r.id === row.id ? { ...r, editingLabel: false, label: r.label.trim() || "Charge" } : r))}
                                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setChargeRows((p) => p.map((r) => r.id === row.id ? { ...r, editingLabel: false, label: r.label.trim() || "Charge" } : r)); }}
                                  />
                                ) : (
                                  <span
                                    className="fs-14 fw-medium"
                                    style={{ cursor: "pointer", borderBottom: "1.5px dashed #d1d5db", minHeight: 38, display: "flex", alignItems: "center", wordBreak: "break-word" }}
                                    onClick={() => setChargeRows((p) => p.map((r) => r.id === row.id ? { ...r, editingLabel: true } : r))}
                                    title="Click to rename"
                                  >
                                    {row.label}
                                  </span>
                                )}
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                <input
                                  type="number"
                                  className="form-control text-end"
                                  step="any"
                                  style={{ width: 170, height: 38 }}
                                  value={row.amount}
                                  onChange={(e) => setChargeRows((p) => p.map((r) => r.id === row.id ? { ...r, amount: e.target.value } : r))}
                                  placeholder="0.00"
                                />
                                <span className="fs-14 fw-medium" style={{ minWidth: 50, textAlign: "right", whiteSpace: "nowrap" }}>
                                  {(parseFloat(row.amount) || 0).toFixed(decimalRate)}
                                </span>
                                {idx > 0 && (
                                  <button
                                    type="button"
                                    className="btn p-0 border-0 bg-transparent text-danger"
                                    title="Remove"
                                    onClick={() => setChargeRows((p) => p.filter((r) => r.id !== row.id))}
                                  >
                                    <i className="ti ti-circle-x fs-16" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Add Charge button */}
                          {chargeRows.length < 5 && (
                            <div className="mt-1">
                              <button
                                type="button"
                                className="btn btn-link p-0 fs-13 text-danger d-flex align-items-center gap-1"
                                style={{ textDecoration: "none", whiteSpace: "nowrap" }}
                                onClick={() => setChargeRows((p) => [...p, { id: chargeNextId.current++, label: "Charge", amount: "", editingLabel: false }])}
                              >
                                <i className="ti ti-circle-plus fs-15" />
                                Add Charge
                              </button>
                            </div>
                          )}

                          {/* Divider + Total */}
                          <div className="border-top mt-3 pt-3">
                            <div className="d-flex align-items-center justify-content-between">
                              <span className="fs-15 fw-semibold">Total (₹)</span>
                              <span className="fs-15 fw-bold">{grandTotal.toFixed(decimalRate)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>


                  <div className="border-top mt-4 pt-4">
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label fw-medium fs-14 mb-1">Customer Notes</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          placeholder="Thanks for your business."
                          value={customerNotes}
                          onChange={(e) => setCustomerNotes(e.target.value)}
                        />
                        <p className="fs-12 text-muted mt-1 mb-0">Will be displayed on the invoice</p>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-medium fs-14 mb-1">Terms &amp; Conditions</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          placeholder="Enter the terms and conditions of your business to be displayed in your transaction"
                          value={termsConditions}
                          onChange={(e) => setTermsConditions(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── Payment Received ──────────────────────────────────── */}
                  <div className="border-top mt-4 pt-4">

                    {/* Checkbox */}
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="payment_received_chk"
                        checked={isAdvancePayment ? true : paymentReceived}
                        disabled={isAdvancePayment}
                        onChange={(e) => { if (!isAdvancePayment) setPaymentReceived(e.target.checked); }}
                      />
                      <label className="form-check-label fw-semibold fs-14" htmlFor="payment_received_chk">
                        I have received the payment
                        {isAdvancePayment && (
                          <span className="ms-2 badge bg-danger-subtle text-danger fs-11 fw-medium">Advance Payment</span>
                        )}
                      </label>
                    </div>
                    {isAdvancePayment && (() => {
                      const required = invoiceTotal - discountAmt;
                      const isShort  = advanceBalance !== null && advanceBalance < required - 0.01;
                      return (
                        <div
                          className="mb-3 rounded-2 px-3 py-2"
                          style={{ border: "1px solid #e9ecef", background: "#fafafa" }}
                        >
                          {advanceBalanceLoading ? (
                            <div className="d-flex align-items-center gap-2 text-muted fs-14">
                              <span className="spinner-border" style={{ width: 14, height: 14, borderWidth: 2 }} />
                              Checking advance balance…
                            </div>
                          ) : advanceBalance !== null ? (
                            <div className="d-flex align-items-center gap-4">
                              <div>
                                <div className="fs-13 text-muted mb-1">Available Balance</div>
                                <div className={`fs-15 fw-semibold ${isShort ? "text-danger" : "text-success"}`}>
                                  ₹{advanceBalance.toFixed(2)}
                                </div>
                              </div>
                              <div style={{ width: 1, height: 34, background: "#dee2e6" }} />
                              <div>
                                <div className="fs-13 text-muted mb-1">Required</div>
                                <div className="fs-15 fw-semibold" style={{ color: "#374151" }}>₹{required.toFixed(2)}</div>
                              </div>
                              <div className="ms-auto d-flex align-items-center gap-1 fs-14 fw-semibold" style={{ color: isShort ? "#dc2626" : "#16a34a" }}>
                                <i className={`ti ${isShort ? "ti-alert-circle" : "ti-circle-check"} fs-16`} />
                                {isShort ? "Insufficient" : "Sufficient"}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })()}

                    {/* Payment table */}
                    {paymentReceived && (() => {
                      const totalPaid    = paymentRows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
                      const balanceAmt   = grandTotal - totalPaid;
                      const paymentModeItems: DropdownEntry[] = [
                        { id: 1, name: "Cash" },
                        { id: 2, name: "Cheque" },
                        { id: 3, name: "Bank Transfer" },
                        { id: 4, name: "Credit Card" },
                        { id: 5, name: "UPI" },
                        { id: 6, name: "Advance Payment" },
                      ];
                      return (
                        <div style={{ overflowX: "auto" }}>
                          <div className="border rounded" style={{ minWidth: 560 }}>

                            {/* Header */}
                            <div className="d-flex align-items-stretch border-bottom" style={{ background: "#f8f9fa" }}>
                              <div className="d-flex align-items-center px-3 py-2" style={{ flex: 1, borderRight: "1px solid #dee2e6" }}>
                                <span className="fw-semibold fs-12 text-uppercase">Payment Mode</span>
                              </div>
                              <div className="d-flex align-items-center px-3 py-2" style={{ width: 180, flexShrink: 0, borderRight: "1px solid #dee2e6" }}>
                                <span className="fw-semibold fs-12 text-uppercase">Amount Received</span>
                              </div>
                              <div style={{ width: 40, flexShrink: 0 }} />
                            </div>

                            {/* Rows */}
                            {paymentRows.map((row, idx) => {
                              const isLockedRow = isAdvancePayment && idx === 0;
                              const rowMode     = isLockedRow ? "Advance Payment" : row.mode;
                              const rowAmount   = isLockedRow ? advancePaymentAmount : row.amount;
                              return (
                                <div key={row.id} className="d-flex align-items-stretch border-bottom">
                                  <div className="d-flex align-items-center" style={{ flex: 1, borderRight: "1px solid #dee2e6", padding: "8px 10px" }}>
                                    {isLockedRow ? (
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={rowMode}
                                        readOnly
                                        style={{ background: "#f8f9fa", cursor: "default", color: "#374151" }}
                                      />
                                    ) : (
                                      <EntityField
                                        label="Payment Mode"
                                        value={row.mode}
                                        onChange={(name) => setPaymentRows((p) => p.map((r) => r.id === row.id ? { ...r, mode: name } : r))}
                                        items={paymentModeItems}
                                        wrapperClassName="w-100"
                                        usePortal
                                      />
                                    )}
                                  </div>
                                  <div className="d-flex align-items-center" style={{ width: 180, flexShrink: 0, borderRight: "1px solid #dee2e6", padding: "10px 12px" }}>
                                    <input
                                      type="number"
                                      className="form-control text-end p-0"
                                      style={{
                                        border: "none", outline: "none", boxShadow: "none",
                                        background: isLockedRow ? "#f8f9fa" : "transparent",
                                        cursor: isLockedRow ? "default" : "text",
                                        WebkitAppearance: "none", MozAppearance: "textfield",
                                      } as React.CSSProperties}
                                      placeholder="0"
                                      min={0}
                                      step="any"
                                      value={rowAmount}
                                      readOnly={isLockedRow}
                                      onChange={(e) => {
                                        if (!isLockedRow) setPaymentRows((p) => p.map((r) => r.id === row.id ? { ...r, amount: e.target.value } : r));
                                      }}
                                    />
                                  </div>
                                  <div className="d-flex align-items-center justify-content-center" style={{ width: 40, flexShrink: 0 }}>
                                    {idx > 0 && (
                                      <button
                                        type="button"
                                        className="btn p-0 border-0 bg-transparent text-danger"
                                        title="Remove"
                                        onClick={() => setPaymentRows((p) => p.filter((r) => r.id !== row.id))}
                                      >
                                        <i className="ti ti-circle-x fs-16" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}

                            {/* Footer */}
                            <div className="d-flex align-items-center justify-content-between px-3 py-2" style={{ background: "#fafafa" }}>
                              {!isAdvancePayment && paymentRows.length < 3 && (
                                <button
                                  type="button"
                                  className="btn btn-link p-0 fs-13 text-danger d-flex align-items-center gap-1"
                                  style={{ textDecoration: "none" }}
                                  onClick={() => setPaymentRows((p) => [...p, { id: paymentNextId.current++, mode: "Cash", amount: "" }])}
                                >
                                  <i className="ti ti-circle-plus fs-15" /> Add Split Payment
                                </button>
                              )}
                              {(isAdvancePayment || paymentRows.length >= 3) && <span />}
                              <div className="d-flex flex-column align-items-end gap-1">
                                <div className="d-flex align-items-center gap-3">
                                  <span className="fs-15 fw-semibold text-muted">Total (₹) :</span>
                                  <span className="fs-15 fw-bold" style={{ minWidth: 80, textAlign: "right" }}>{totalPaid.toFixed(decimalRate)}</span>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                  <span className="fs-15 fw-semibold" style={{ color: "#E41F07" }}>Balance Amount (₹) :</span>
                                  <span className="fs-15 fw-bold" style={{ color: "#E41F07", minWidth: 80, textAlign: "right" }}>{balanceAmt.toFixed(decimalRate)}</span>
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>
                      );
                    })()}
                    {errors.payments && (
                      <div className="d-flex align-items-center gap-2 mt-2">
                        <i className="ti ti-alert-circle text-danger fs-14" />
                        <span className="fs-13 text-danger">{errors.payments}</span>
                      </div>
                    )}
                  </div>

                  {/* ── Attachments ────────────────────────────────────────── */}
                  <div className="border-top mt-4 pt-4">
                    <p className="form-label fw-medium fs-14 mb-2">Attach File(s) to Invoice</p>

                    {/* Clickable attach box */}
                    <label
                      htmlFor="invoice_attach_input"
                      className="border rounded d-flex align-items-center gap-3 px-3 position-relative w-100"
                      style={{ cursor: "pointer", background: "#fafafa", minHeight: 56 }}
                    >
                      <i className="ti ti-paperclip fs-20 text-muted flex-shrink-0" />
                      {attachedFiles.length > 0 ? (
                        <div className="d-flex flex-column py-2">
                          <span className="fw-medium fs-13">
                            {attachedFiles.length} file{attachedFiles.length > 1 ? "s" : ""} attached
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
                      id="invoice_attach_input"
                      ref={attachFileRef}
                      type="file"
                      multiple
                      className="d-none"
                      onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
                      onChange={(e) => {
                        const picked = Array.from(e.target.files ?? []);
                        setAttachedFiles((prev) => [...prev, ...picked].slice(0, 10));
                      }}
                    />

                    {/* Attached files list */}
                    {attachedFiles.length > 0 && (
                      <div className="mt-2 border rounded" style={{ background: "#fff" }}>
                        {attachedFiles.map((file, idx) => {
                          const { icon, color } = getFileIcon(file);
                          return (
                            <div
                              key={idx}
                              className={`d-flex align-items-center gap-2 px-3 py-2${idx < attachedFiles.length - 1 ? " border-bottom" : ""}`}
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
                                onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))}
                              >
                                <i className="ti ti-x fs-16" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* ── Additional Fields ──────────────────────────────────── */}
                  <div className="border-top mt-4 pt-4">
                    <p className="form-label fw-medium fs-14 mb-3">Additional Fields</p>
                    <CustomFieldsPanel ref={cfPanelRef} module="invoices" skipSystemFields />
                  </div>

                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Sticky action bar */}
        <div
          className="bg-white border-top d-flex align-items-center gap-2 px-4"
          style={{ position: "sticky", bottom: 0, zIndex: 100, height: 60 }}
        >
          {/* Split button: Save (primary) + dropup with Save as Draft */}
          <div className="btn-group position-relative">
            <button
              type="button"
              className="btn btn-danger"
              disabled={saving}
              onClick={() => handleSave("sent")}
              aria-label="Save invoice"
            >
              {saving ? (
                <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />Saving…</>
              ) : "Save"}
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

          <button
            type="button"
            className="btn btn-outline-light"
            disabled={saving}
            onClick={() => tryNavigate(() => (window.history.length > 1 ? navigate(-1) : navigate("/")))}
          >
            Cancel
          </button>

          <div className="ms-auto d-flex flex-column align-items-end" style={{ lineHeight: 1.5 }}>
            <span className="fs-14 text-dark fw-semibold">Total Amount: ₹ {grandTotal.toFixed(decimalRate)}</span>
            <span className="fs-13 text-muted">Total Quantity: {totalQty % 1 === 0 ? totalQty : totalQty.toFixed(2)}</span>
          </div>
        </div>

        <Footer />
      </div>

      {drawerOpen && customerId && (
        <CustomerDrawer
          customerId={customerId}
          customerName={customerName}
          onClose={() => setDrawerOpen(false)}
        />
      )}

      {showPartyModal && (
        <AddPartyModal
          onClose={() => setShowPartyModal(false)}
          onSaved={(id, name) => {
            setCustomerId(id);
            setCustomerName(name);
            setSelectedCustomer({ id, name });
            setShowPartyModal(false);
          }}
          prefillQuery={partyModalQuery}
        />
      )}

      <AddReferenceModal
        show={showRefModal}
        onHide={() => setShowRefModal(false)}
        items={referenceItems}
        onSaveAndSelect={(entry) => {
          setReferenceItems((prev) => [...prev, entry]);
          setReference(entry.name);
        }}
        onUpdate={(id, name, phone) => {
          setReferenceItems((prev) =>
            prev.map((r) => r.id === id ? { ...r, name, mobile: phone || undefined } : r)
          );
          if (referenceItems.find((r) => r.id === id)?.name === reference) setReference(name);
        }}
        onDelete={(id) => {
          setReferenceItems((prev) => prev.filter((r) => r.id !== id));
          const deleted = referenceItems.find((r) => r.id === id);
          if (deleted?.name === reference) setReference("");
        }}
      />

      <ManageTaxesModal
        show={showTaxModal}
        onHide={() => setShowTaxModal(false)}
        items={taxItems}
        onSave={(name, rate) => {
          const entry: TaxEntry = { id: taxNextId.current++, name, rate };
          setTaxItems((prev) => [...prev, entry]);
          return entry;
        }}
        onUpdate={(id, name, rate) => {
          setTaxItems((prev) => prev.map((t) => t.id === id ? { ...t, name, rate } : t));
          if (taxItems.find((t) => t.id === id)?.name === selectedTax) setSelectedTax(name);
        }}
        onDelete={(id) => {
          const deleted = taxItems.find((t) => t.id === id);
          setTaxItems((prev) => prev.filter((t) => t.id !== id));
          if (deleted?.name === selectedTax) setSelectedTax("");
        }}
        onSaveAndSelect={(entry) => setSelectedTax(entry.name)}
      />

      {/* ── Item search dropdown portal ───────────────────────────────────── */}
      {itemOpenId !== null && itemDropPos !== null && createPortal(
        <div
          ref={itemPortalRef}
          className="bg-white border rounded shadow-sm"
          style={{
            position: "absolute",
            top:   itemDropPos.top,
            left:  itemDropPos.left,
            width: itemDropPos.width,
            zIndex: 9999,
            minWidth: 220,
          }}
        >
          <div className="p-2 border-bottom">
            <input
              autoFocus
              type="text"
              className="form-control fs-14"
              style={{ height: 42 }}
              placeholder="Search Items…"
              value={itemSearchText[itemOpenId] ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setItemSearchText((s) => ({ ...s, [itemOpenId!]: v }));
                if (itemSearchTimer.current) clearTimeout(itemSearchTimer.current);
                itemSearchTimer.current = setTimeout(() => loadItemDropItems(v), 300);
              }}
            />
          </div>
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {(() => {
              const usedIds = new Set(
                invoiceRows
                  .filter((r) => r.item_id !== null && r.id !== itemOpenId)
                  .map((r) => r.item_id as number)
              );
              const availableItems = itemDropItems.filter((item) => !usedIds.has(item.id));
              return itemDropLoading ? (
                <p className="text-muted fs-13 text-center py-2 mb-0">Loading…</p>
              ) : availableItems.length === 0 ? (
                <p className="text-muted fs-13 text-center py-2 mb-0">No results</p>
              ) : (
              availableItems.map((item) => (
                <div
                  key={item.id}
                  className="px-3 py-2 fs-15"
                  style={{ cursor: "pointer", color: "#707070" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#E41F07"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#707070"; }}
                  onClick={() => {
                    markDirty();
                    const rowId = itemOpenId as number;
                    updateInvoiceRow(rowId, "item_id", item.id);
                    updateInvoiceRow(rowId, "item_name", item.name);
                    setItemSearchText((s) => ({ ...s, [rowId]: item.name }));
                    setItemImgErrors((s) => { const n = { ...s }; delete n[rowId]; return n; });
                    setItemOpenId(null);
                    setItemDropPos(null);
                    updateInvoiceRow(rowId, "pricelist_id", pricelistId);
                    fetchItem(item.id).then((res) => {
                      let baseRateVal: string;
                      if (res.success) {
                        const d = res.data as Record<string, unknown>;
                        const refs = d.refs as Record<string, unknown> | null | undefined;
                        const gstObj = refs?.gst_rate as { rate?: string | number } | null | undefined;
                        baseRateVal = d.selling_price != null ? String(d.selling_price) : (item.selling_price ?? "0.00");
                        updateInvoiceRow(rowId, "item_image", toStorageUrl(d.image as string | null));
                        updateInvoiceRow(rowId, "base_rate", baseRateVal);
                        updateInvoiceRow(rowId, "gst_rate", gstObj?.rate != null ? String(gstObj.rate) : "0");
                      } else {
                        baseRateVal = item.selling_price ?? "0.00";
                        updateInvoiceRow(rowId, "item_image", toStorageUrl(item.image));
                        updateInvoiceRow(rowId, "base_rate", baseRateVal);
                        updateInvoiceRow(rowId, "gst_rate", "0");
                      }
                      if (pricelistId) {
                        fetchPriceList(pricelistId).then((plRes) => {
                          if (!plRes.success) { updateInvoiceRow(rowId, "rate", baseRateVal); return; }
                          const pd = plRes.data as Record<string, unknown>;
                          const plType = pd.price_list_type as string | undefined;
                          const plItems = pd.items as Array<{ item_id: number; custom_rate?: string | null; discount?: string | null }> | undefined;
                          const baseRate = parseFloat(baseRateVal) || 0;
                          let rateVal = baseRateVal;
                          if (plType === "individual_items" && plItems) {
                            const entry = plItems.find((it) => it.item_id === item.id);
                            if (entry?.custom_rate) rateVal = entry.custom_rate;
                            else if (entry?.discount) rateVal = (baseRate * (1 - (parseFloat(entry.discount) || 0) / 100)).toFixed(decimalRate);
                          } else if (plType === "all_items") {
                            const gr = pd.custom_rate as string | null | undefined;
                            const gd = pd.discount as string | null | undefined;
                            if (gr) rateVal = gr;
                            else if (gd) rateVal = (baseRate * (1 - (parseFloat(gd) || 0) / 100)).toFixed(decimalRate);
                          }
                          updateInvoiceRow(rowId, "rate", rateVal);
                        });
                      } else {
                        updateInvoiceRow(rowId, "rate", baseRateVal);
                      }
                    });
                    if (item.item_type === "goods") {
                      fetchItemStock(item.id).then((res) => {
                        if (res.success && locationId) {
                          const entry = res.data.find((s) => s.location_id === locationId);
                          updateInvoiceRow(rowId, "stock_on_hand",      entry != null ? String(entry.stock_on_hand)      : null);
                          updateInvoiceRow(rowId, "available_for_sale", entry != null ? String(entry.available_for_sale) : null);
                        } else {
                          updateInvoiceRow(rowId, "stock_on_hand",      null);
                          updateInvoiceRow(rowId, "available_for_sale", null);
                        }
                      });
                    } else {
                      updateInvoiceRow(rowId, "stock_on_hand",      null);
                      updateInvoiceRow(rowId, "available_for_sale", null);
                    }
                  }}
                >
                  {item.name}
                </div>
              ))
              );
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
          <button
            type="button"
            onClick={() => setShowBulkModal(false)}
            style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #fecaca", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}
          >
            <i className="ti ti-x" style={{ fontSize: 14, color: "#ef4444", lineHeight: 1 }} />
          </button>
        </Modal.Header>

        {/* Search — not scrollable */}
        <div style={{ padding: "14px 24px 10px", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
          <div className="input-icon input-icon-start position-relative">
            <span className="input-icon-addon text-muted" style={{ left: 12 }}>
              <i className="ti ti-search fs-15" />
            </span>
            <input
              autoFocus
              type="text"
              className="form-control ps-5"
              placeholder="Search items…"
              value={bulkSearch}
              onChange={(e) => {
                const v = e.target.value;
                setBulkSearch(v);
                if (bulkSearchTimer.current) clearTimeout(bulkSearchTimer.current);
                bulkSearchTimer.current = setTimeout(() => loadBulkItems(v, locationId), 300);
              }}
            />
          </div>
        </div>

        {/* Scrollable item list */}
        <Modal.Body style={{ padding: 0, maxHeight: "55vh", overflowY: "auto" }}>
          {(() => {
            const usedIds = new Set(invoiceRows.filter((r) => r.item_id !== null).map((r) => r.item_id as number));
            const available = bulkItems.filter((it) => !usedIds.has(it.id));
            if (bulkLoading) return <p className="text-muted fs-14 text-center py-4 mb-0">Loading…</p>;
            if (available.length === 0) return <p className="text-muted fs-14 text-center py-4 mb-0">No items found</p>;
            return available.map((item) => {
              const checked  = bulkSelected[item.id] !== undefined;
              const stockVal = bulkStocks[item.id]; // undefined = fetching, null = not tracked, string = value
              const stockQty = typeof stockVal === "string" ? parseFloat(stockVal) : null;
              return (
                <div
                  key={item.id}
                  className="d-flex align-items-center gap-3 px-4 border-bottom"
                  style={{ cursor: "pointer", background: checked ? "#fef2f2" : undefined, minHeight: 68, paddingTop: 14, paddingBottom: 14 }}
                  onClick={() => toggleBulkItem(item.id)}
                >
                  <input
                    type="checkbox"
                    className="form-check-input m-0 flex-shrink-0"
                    checked={checked}
                    onChange={() => toggleBulkItem(item.id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: 18, height: 18 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="fs-15 d-block" style={{ fontWeight: checked ? 600 : 400 }}>{item.name}</span>
                    {locationId && (
                      stockVal === undefined
                        ? <span className="fs-13" style={{ color: "#9ca3af" }}>Checking stock…</span>
                        : stockVal === null
                          ? <span className="fs-13" style={{ color: "#9ca3af" }}>Not tracked</span>
                          : <span className="fs-13 fw-medium" style={{ color: stockQty! > 0 ? "#16a34a" : "#ef4444" }}>
                              {stockQty! > 0 ? `Stock: ${stockQty!.toFixed(decimalRate)}` : "Out of stock"}
                            </span>
                    )}
                  </div>
                  <div onClick={(e) => e.stopPropagation()} style={{ width: 156, flexShrink: 0 }}>
                    {checked ? (
                      <div className="input-group" style={{ height: 40 }}>
                        <button
                          type="button"
                          className="btn btn-outline-light"
                          style={{ height: 40, width: 38, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            const cur = parseFloat(bulkSelected[item.id]) || 1;
                            setBulkSelected((prev) => ({ ...prev, [item.id]: String(Math.max(1, cur - 1)) }));
                          }}
                        >
                          <i className="ti ti-minus fs-13" />
                        </button>
                        <input
                          type="number"
                          className="form-control text-center"
                          min={1}
                          step="any"
                          value={bulkSelected[item.id]}
                          onChange={(e) => setBulkSelected((prev) => ({ ...prev, [item.id]: e.target.value }))}
                          onClick={(e) => e.stopPropagation()}
                          style={{ height: 40, fontSize: 15 }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-light"
                          style={{ height: 40, width: 38, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            const cur = parseFloat(bulkSelected[item.id]) || 0;
                            setBulkSelected((prev) => ({ ...prev, [item.id]: String(cur + 1) }));
                          }}
                        >
                          <i className="ti ti-plus fs-13" />
                        </button>
                      </div>
                    ) : (
                      <span className="fs-15 text-muted d-block text-center">—</span>
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </Modal.Body>

        <Modal.Footer style={{ padding: "16px 24px 22px", borderTop: "1px solid #f1f5f9", justifyContent: "flex-start", gap: 8 }}>
          <button
            type="button"
            className="btn btn-danger me-2"
            disabled={Object.keys(bulkSelected).length === 0}
            onClick={handleAddBulk}
          >
            Add {Object.keys(bulkSelected).length > 0 ? Object.keys(bulkSelected).length : ""} Item{Object.keys(bulkSelected).length !== 1 ? "s" : ""}
          </button>
          <button type="button" className="btn btn-outline-light" onClick={() => setShowBulkModal(false)}>Cancel</button>
        </Modal.Footer>
      </Modal>

      {/* Configure Invoice Number Preferences modal */}
      <Modal show={configModalOpen} onHide={() => setConfigModalOpen(false)} centered size="lg" backdropClassName="blurred-backdrop">
        <Modal.Header closeButton={false} style={{ padding: "20px 24px 18px", borderBottom: "1px solid #f1f5f9", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className="ti ti-settings fs-18" style={{ color: "#ef4444" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 16, color: "#0f172a" }}>Configure Invoice Number Preferences</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setConfigModalOpen(false)}
            style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #fecaca", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}
          >
            <i className="ti ti-x" style={{ fontSize: 14, color: "#ef4444", lineHeight: 1 }} />
          </button>
        </Modal.Header>

        <Modal.Body className="px-4 pt-3 pb-2">
          {/* Location / Series row */}
          <div className="mb-3">
            <div className="row" style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", color: "#888", letterSpacing: "0.05em", marginBottom: 6 }}>
              <div className="col-5">Location</div>
              <div className="col-7">Associated Series</div>
            </div>
            <div className="row fs-14" style={{ color: "#374151" }}>
              <div className="col-5">{locationName || "—"}</div>
              <div className="col-7">{seriesOptions.find((s) => s.id === selectedSeriesId)?.name ?? "—"}</div>
            </div>
          </div>

          <hr style={{ borderColor: "#f1f5f9", margin: "16px 0" }} />

          <p className="fs-14 mb-3" style={{ color: "#6b7280" }}>
            Your invoice numbers are set on auto-generate mode to save your time.<br />
            Are you sure about changing this setting?
          </p>

          {/* Auto-generate option */}
          <div className="mb-3">
            <div className="form-check mb-2">
              <input className="form-check-input" type="radio" id="cfg-auto"
                checked={configMode === "auto"} onChange={() => setConfigMode("auto")} />
              <label className="form-check-label fw-medium fs-14" htmlFor="cfg-auto">
                Continue auto-generating invoice numbers&nbsp;
                <i className="ti ti-info-circle fs-14" style={{ color: "#9ca3af" }} title="Invoice numbers will be auto-incremented for each new invoice." />
              </label>
            </div>
            {configMode === "auto" && (
              <div className="row g-3 ms-3 mt-0">
                <div className="col-auto">
                  <label className="form-label fs-13 mb-1 fw-medium" style={{ color: "#374151" }}>Prefix</label>
                  <input type="text" className="form-control" style={{ width: 130 }}
                    value={configPrefix} onChange={(e) => setConfigPrefix(e.target.value)} />
                </div>
                <div className="col">
                  <label className="form-label fs-13 mb-1 fw-medium" style={{ color: "#374151" }}>Next Number</label>
                  <input type="text" className="form-control"
                    value={configNextNumber} onChange={(e) => setConfigNextNumber(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          {/* Manual option */}
          <div className="form-check mb-1">
            <input className="form-check-input" type="radio" id="cfg-manual"
              checked={configMode === "manual"} onChange={() => setConfigMode("manual")} />
            <label className="form-check-label fw-medium fs-14" htmlFor="cfg-manual">
              Enter invoice numbers manually
            </label>
          </div>
        </Modal.Body>

        <Modal.Footer style={{ padding: "14px 24px", borderTop: "1px solid #f1f5f9", justifyContent: "flex-start", gap: 8 }}>
          <button type="button" className="btn btn-danger" onClick={saveConfigModal}>Save</button>
          <button type="button" className="btn btn-outline-light" onClick={() => setConfigModalOpen(false)}>Cancel</button>
        </Modal.Footer>
      </Modal>

      {/* Unsaved Changes modal */}
      {showUnsavedModal && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 1060, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowUnsavedModal(false); pendingNavRef.current = null; } }}
        >
          <div style={{ background: "#fff", borderRadius: 14, padding: "32px 28px 24px", width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <i className="ti ti-alert-triangle" style={{ fontSize: 24, color: "#f97316" }} />
            </div>
            <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 16, color: "#0f172a", textAlign: "center" }}>
              Unsaved Changes
            </p>
            <p style={{ margin: "0 0 24px", fontSize: 13.5, color: "#64748b", textAlign: "center", lineHeight: 1.55 }}>
              Your changes won't be saved if you leave this page.
            </p>
            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              <button
                type="button"
                className="btn btn-light flex-grow-1"
                style={{ fontWeight: 500, fontSize: 14, height: 44 }}
                disabled={saving}
                onClick={() => { setShowUnsavedModal(false); handleSave("draft"); }}
              >
                {saving ? <><span className="spinner-border spinner-border-sm me-2" style={{ width: 14, height: 14, borderWidth: 2 }} />Saving…</> : "Save as Draft"}
              </button>
              <button
                type="button"
                className="btn flex-grow-1"
                style={{ background: "#ef4444", color: "#fff", fontWeight: 500, fontSize: 14, border: "none", height: 44 }}
                onClick={() => { clearDirty(); setShowUnsavedModal(false); pendingNavRef.current?.(); pendingNavRef.current = null; }}
              >
                Discard &amp; Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stock conflict warning modal ─────────────────────────────────── */}
      {showStockModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.45)", zIndex: 1060 }}
        >
          <div className="bg-white rounded-3 shadow-lg" style={{ width: "100%", maxWidth: 560, margin: "0 16px" }}>
            {/* Header */}
            <div className="d-flex align-items-center gap-2 px-4 pt-4 pb-3 border-bottom">
              <i className="ti ti-alert-triangle fs-20 text-warning" />
              <div>
                <div className="fw-semibold fs-15">Stock Conflict Warning</div>
                <div className="fs-12 text-muted">This edit will affect stock at the following locations</div>
              </div>
            </div>

            {/* Warning rows */}
            <div className="px-4 py-3" style={{ maxHeight: 280, overflowY: "auto" }}>
              {stockWarnings.map((w, i) => (
                <div key={i} className="d-flex align-items-start gap-3 mb-3 pb-3 border-bottom last-child-no-border">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 32, height: 32, background: w.available_for_sale < 0 ? "#fee2e2" : "#fef3c7" }}
                  >
                    <i className={`ti ${w.available_for_sale < 0 ? "ti-alert-circle text-danger" : "ti-alert-triangle text-warning"} fs-14`} />
                  </div>
                  <div className="flex-grow-1">
                    <div className="fs-14 fw-semibold">{w.item_name}</div>
                    <div className="fs-12 text-muted mb-1">
                      {w.is_buyer ? "Buyer" : "Seller"} · {w.location_name}
                    </div>
                    <div className="d-flex gap-3 fs-12">
                      <span>
                        On hand: <span className={`fw-semibold ${w.stock_on_hand < 0 ? "text-danger" : ""}`}>{w.stock_on_hand.toFixed(2)}</span>
                      </span>
                      <span>
                        Available: <span className={`fw-semibold ${w.available_for_sale < 0 ? "text-danger" : ""}`}>{w.available_for_sale.toFixed(2)}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 pb-4 pt-2">
              <div className="fs-13 text-muted mb-3">
                Proceeding will allow negative stock. Affected parties will be notified via stock warnings on their dashboard.
              </div>
              <div className="d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-light px-4"
                  onClick={() => { setShowStockModal(false); pendingSaveStatus.current = null; setStockWarnings([]); }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger px-4"
                  onClick={() => {
                    const st = pendingSaveStatus.current ?? "sent";
                    setShowStockModal(false);
                    setStockWarnings([]);
                    pendingSaveStatus.current = null;
                    stockWarningConfirmed.current = true; // skip re-check
                    handleSave(st);
                  }}
                >
                  Proceed Anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default NewInvoice;
