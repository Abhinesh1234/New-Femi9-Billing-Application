import React, { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Toast } from "react-bootstrap";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import CommonSelect, { type Option } from "../../../../components/common-select/commonSelect";
import CommonDatePicker from "../../../../components/common-datePicker/commonDatePicker";
import { getLocationList } from "../../../../core/cache/locationCache";
import { getSettings } from "../../../../core/cache/settingCache";
import { type ProductConfiguration } from "../../../../core/services/settingApi";
import { searchParties, fetchParty, type PartySearchResult } from "../../../../core/services/partyApi";
import {
  fetchItems,
  fetchItemStock,
  type ItemListRecord,
  type ItemListResponse,
} from "../../../../core/services/itemApi";
import {
  fetchAdjustmentReasons,
  storeAdjustmentReason,
  updateAdjustmentReason,
  destroyAdjustmentReason,
  storeAdjustment,
  uploadAdjustmentAttachment,
  type AdjustmentReason,
} from "../../../../core/services/adjustmentApi";
import { emitMutation } from "../../../../core/cache/mutationEvents";

// ─── Reason entries ───────────────────────────────────────────────────────────
interface ReasonEntry { id: number; name: string; }

// ─── Manage Reasons Modal ─────────────────────────────────────────────────────
interface ManageReasonsModalProps {
  show:            boolean;
  onHide:          () => void;
  items:           ReasonEntry[];
  onSave:          (name: string) => Promise<ReasonEntry | null>;
  onUpdate:        (id: number, name: string) => Promise<boolean>;
  onDelete:        (id: number) => Promise<boolean>;
  onSaveAndSelect: (entry: ReasonEntry) => void;
}

const ManageReasonsModal = ({ show, onHide, items, onSave, onUpdate, onDelete, onSaveAndSelect }: ManageReasonsModalProps) => {
  const [hoveredId,    setHoveredId]    = useState<number | null>(null);
  const [editingId,    setEditingId]    = useState<number | null>(null);
  const [editName,     setEditName]     = useState("");
  const [showNewForm,  setShowNewForm]  = useState(false);
  const [newName,      setNewName]      = useState("");
  const [modalSaving,  setModalSaving]  = useState(false);

  useEffect(() => {
    if (!show) {
      setHoveredId(null); setEditingId(null); setEditName("");
      setShowNewForm(false); setNewName(""); setModalSaving(false);
    }
  }, [show]);

  const startEdit = (item: ReasonEntry) => {
    setEditingId(item.id); setEditName(item.name); setShowNewForm(false);
  };

  const commitEdit = async () => {
    if (editingId !== null && editName.trim()) {
      setModalSaving(true);
      const ok = await onUpdate(editingId, editName.trim());
      setModalSaving(false);
      if (ok) setEditingId(null);
    }
  };

  const handleSaveAndSelect = async () => {
    if (!newName.trim()) return;
    setModalSaving(true);
    const entry = await onSave(newName.trim());
    setModalSaving(false);
    if (entry) { onSaveAndSelect(entry); onHide(); }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdropClassName="blurred-backdrop">
      <Modal.Header closeButton={false} style={{ padding: "20px 24px 18px", borderBottom: "1px solid #f1f5f9", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <i className="ti ti-adjustments fs-18" style={{ color: "#ef4444" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 16, color: "#0f172a" }}>Manage Reasons</p>
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
        {!showNewForm && (
          <div className="px-4 pt-3 pb-3 border-bottom">
            <button
              type="button"
              className="btn btn-outline-light d-flex align-items-center gap-2"
              style={{ textDecoration: "none" }}
              onClick={() => { setShowNewForm(true); setEditingId(null); }}
            >
              <i className="ti ti-plus fs-16" />
              <span className="fs-14 fw-medium">New Reason</span>
            </button>
          </div>
        )}

        {showNewForm && (
          <div className="px-4 pt-3 pb-3 border-bottom">
            <label className="form-label fw-medium fs-14 mb-1 text-danger">
              Reason Name <span>*</span>
            </label>
            <input
              autoFocus
              type="text"
              className="form-control mb-3"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") handleSaveAndSelect();
                if (e.key === "Escape") { setShowNewForm(false); setNewName(""); }
              }}
            />
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-danger me-2" onClick={handleSaveAndSelect} disabled={modalSaving}>
                {modalSaving ? <><span className="spinner-border spinner-border-sm me-1" />Saving…</> : "Save and Select"}
              </button>
              <button
                type="button"
                className="btn btn-outline-light"
                onClick={() => { setShowNewForm(false); setNewName(""); }}
                disabled={modalSaving}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="px-4 pt-3 pb-2">
          <p className="text-uppercase text-muted fw-semibold fs-12 mb-2" style={{ letterSpacing: "0.06em" }}>
            Reasons
          </p>
          {items.length === 0 && (
            <p className="text-muted fs-14 text-center py-3">No reasons yet.</p>
          )}
          {items.map(item => (
            <div key={item.id}>
              {editingId === item.id ? (
                <div className="py-3 border-bottom">
                  <label className="form-label fw-medium fs-14 mb-1 text-danger">
                    Reason Name <span>*</span>
                  </label>
                  <input
                    autoFocus
                    type="text"
                    className="form-control mb-3"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") commitEdit();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-danger me-2" onClick={commitEdit} disabled={modalSaving}>
                      {modalSaving ? <><span className="spinner-border spinner-border-sm me-1" />Saving…</> : "Save"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-light"
                      onClick={() => setEditingId(null)}
                      disabled={modalSaving}
                    >Cancel</button>
                  </div>
                </div>
              ) : (
                <div
                  className="d-flex align-items-center justify-content-between py-2 px-2 rounded"
                  style={{ cursor: "default", background: hoveredId === item.id ? "#f5f5f5" : "transparent" }}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <span className="fs-15">{item.name}</span>
                  <div className="d-flex gap-2" style={{ visibility: hoveredId === item.id ? "visible" : "hidden" }}>
                    <button
                      type="button"
                      title="Edit"
                      className="btn btn-outline-light"
                      style={{ width: 34, height: 34, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                      onClick={() => startEdit(item)}
                    >
                      <i className="ti ti-pencil fs-15" />
                    </button>
                    <button
                      type="button"
                      title="Delete"
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

// ─── Reason dropdown — exact EntityField pattern from new items page ──────────
interface ReasonDropdownProps {
  value:     string;
  items:     ReasonEntry[];
  onChange:  (name: string, id: string) => void;
  onManage?: () => void;
}

const ReasonDropdown = ({ value, items, onChange, onManage }: ReasonDropdownProps) => {
  const [open,   setOpen]   = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false); setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = () => {
    if (!open && wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      setDropUp(window.innerHeight - rect.bottom < 320);
    }
    setOpen(o => !o);
    setSearch("");
  };

  const filtered = items.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  const select = (item: ReasonEntry) => {
    onChange(item.name, String(item.id)); setOpen(false); setSearch("");
  };

  return (
    <div ref={wrapRef} className="position-relative" style={open ? { zIndex: 10 } : undefined}>
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Select a reason"
          value={value}
          readOnly
          style={{ cursor: "pointer" }}
          onClick={toggle}
        />
        <button type="button" className="btn btn-outline-light" onClick={toggle}>
          <i className={`ti ti-chevron-${open ? "up" : "down"}`} />
        </button>
      </div>

      {open && (
        <div
          className="position-absolute bg-white border rounded shadow-sm overflow-hidden"
          style={{
            ...(dropUp
              ? { bottom: "calc(100% + 4px)", top: "auto" }
              : { top: "calc(100% + 4px)", bottom: "auto" }),
            left: 0, right: 0, zIndex: 1050, minWidth: 220,
          }}
        >
          <div className="p-2 border-bottom">
            <input
              autoFocus
              type="text"
              className="form-control fs-14"
              style={{ height: 42 }}
              placeholder="Search reason…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && filtered.length > 0) { e.preventDefault(); select(filtered[0]); }
                if (e.key === "Escape") { setOpen(false); setSearch(""); }
              }}
            />
          </div>

          <div style={{ maxHeight: 180, overflowY: "auto", paddingBottom: 8 }}>
            {filtered.length === 0 ? (
              <p className="text-muted fs-15 text-center py-3 mb-0">No results</p>
            ) : filtered.map(item => {
              const isActive = item.name === value;
              return (
                <div
                  key={item.id}
                  className="px-3 py-2 fs-15"
                  style={{
                    cursor: "pointer",
                    background: isActive ? "#E41F07" : "transparent",
                    color:      isActive ? "#fff"    : "#707070",
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "#E41F07"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "#707070"; }}
                  onClick={() => select(item)}
                >
                  {item.name}
                </div>
              );
            })}
          </div>

          {onManage && (
            <div className="border-top px-3 py-2">
              <button
                type="button"
                className="btn btn-link p-0 fs-14 text-primary fw-medium"
                style={{ textDecoration: "none" }}
                onClick={() => { setOpen(false); setSearch(""); onManage(); }}
              >
                Manage Reasons
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Company sentinel (id=0 means "company stock, no party") ─────────────────
const COMPANY: PartySearchResult = { id: 0, name: "Company", mobile: null, category: null, category_id: null };

// ─── Customer selector dropdown ───────────────────────────────────────────────

interface PanelRect {
  top: number; bottom: number; left: number; width: number; spaceBelow: number;
}

interface CustomerSelectorProps {
  value:    PartySearchResult;
  onChange: (party: PartySearchResult) => void;
}

const CustomerSelector = ({ value, onChange }: CustomerSelectorProps) => {
  const [open,       setOpen]       = useState(false);
  const [search,     setSearch]     = useState("");
  const [results,    setResults]    = useState<PartySearchResult[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [panelRect,  setPanelRect]  = useState<PanelRect | null>(null);

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
      .then(res => { setResults(res); setLoading(false); })
      .catch(() => {});
  }, []);

  const toggle = () => {
    if (!open) { calcRect(); fetchResults(""); }
    else { abortRef.current?.abort(); if (debounceRef.current) clearTimeout(debounceRef.current); }
    setOpen(o => !o);
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

  useEffect(() => () => {
    abortRef.current?.abort();
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const select = (party: PartySearchResult) => {
    onChange(party); setOpen(false); setSearch(""); abortRef.current?.abort();
  };

  const dropUp = panelRect ? panelRect.spaceBelow < 240 : false;
  const panelStyle: React.CSSProperties = panelRect
    ? { position: "fixed", left: panelRect.left, width: Math.max(panelRect.width, 280), zIndex: 9999, ...(dropUp ? { bottom: panelRect.bottom, top: "auto" } : { top: panelRect.top + 4, bottom: "auto" }) }
    : { display: "none" };

  return (
    <div ref={wrapRef}>
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Select or Add Party"
          value={value.name}
          readOnly
          style={{ cursor: "pointer" }}
          onClick={toggle}
        />
        {value.id !== 0 && (
          <button type="button" className="btn btn-outline-light" onClick={() => select(COMPANY)} title="Reset to Company">
            <i className="ti ti-x fs-14" />
          </button>
        )}
        <button type="button" className="btn btn-outline-light" onClick={toggle}>
          <i className={`ti ti-chevron-${open ? "up" : "down"}`} />
        </button>
      </div>

      {open && panelRect && createPortal(
        <div ref={panelRef} className="bg-white border rounded shadow-sm overflow-hidden" style={panelStyle}>

          <div className="p-2 border-bottom position-relative">
            <input
              autoFocus
              type="text"
              className="form-control"
              style={{ height: 42, paddingRight: loading ? 36 : undefined }}
              placeholder="Search parties…"
              value={search}
              onChange={handleSearchChange}
              onKeyDown={e => {
                if (e.key === "Enter" && results.length > 0) { e.preventDefault(); select(results[0]); }
                if (e.key === "Escape") { setOpen(false); setSearch(""); }
              }}
            />
            {loading && (
              <span className="position-absolute top-50 translate-middle-y" style={{ right: 20 }}>
                <span className="spinner-border spinner-border-sm text-secondary" role="status" />
              </span>
            )}
          </div>

          <div style={{ maxHeight: 200, overflowY: "auto", paddingBottom: 8 }}>

            <div
              className="px-3 py-2"
              style={{ cursor: "pointer", background: value.id === 0 ? "#E41F07" : "transparent", color: value.id === 0 ? "#fff" : "#707070" }}
              onMouseEnter={e => { if (value.id !== 0) e.currentTarget.style.color = "#E41F07"; }}
              onMouseLeave={e => { if (value.id !== 0) e.currentTarget.style.color = "#707070"; }}
              onClick={() => select(COMPANY)}
            >
              <div className="fs-15 fw-medium">Company</div>
            </div>

            {loading && results.length === 0 ? null : results.length === 0 && search.trim() ? (
              <p className="text-muted fs-15 text-center py-3 mb-0">No results</p>
            ) : results.map(p => {
              const isActive = value.id === p.id;
              return (
                <div
                  key={p.id}
                  className="px-3 py-2"
                  style={{ cursor: "pointer", background: isActive ? "#E41F07" : "transparent", color: isActive ? "#fff" : "#707070" }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "#E41F07"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "#707070"; }}
                  onClick={() => select(p)}
                >
                  <div className="fs-15 fw-medium">{p.name}</div>
                  {(p.mobile || p.category) && (
                    <div className="fs-12" style={{ color: isActive ? "rgba(255,255,255,0.75)" : "#aaa" }}>
                      {p.mobile ? `${p.mobile}${p.category ? ` (${p.category})` : ""}` : p.category}
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

// ─── File helpers (same as newInvoice) ───────────────────────────────────────

const formatFileSize = (bytes: number) => {
  if (bytes < 1024)           return `${bytes} B`;
  if (bytes < 1024 * 1024)   return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getFileIcon = (file: File): { icon: string; color: string } => {
  if (file.type.startsWith("image/"))               return { icon: "ti-photo",          color: "#3b82f6" };
  if (file.type === "application/pdf")              return { icon: "ti-file-type-pdf",  color: "#ef4444" };
  if (file.type.includes("word"))                   return { icon: "ti-file-type-doc",  color: "#2563eb" };
  if (file.type.includes("sheet") || file.type.includes("excel")) return { icon: "ti-file-type-xls", color: "#16a34a" };
  return { icon: "ti-paperclip", color: "#6b7280" };
};

// ─── Adjustment row interface ─────────────────────────────────────────────────

interface AdjustmentRow {
  id:              number;
  item_id:         number | null;
  item_name:       string;
  item_image:      string | null;
  item_unit:       string | null;
  item_sku:        string | null;
  cost_price:      string;
  qty_available:   string | null;  // current stock at location (read-only)
  new_qty_on_hand: string;         // user-entered new target quantity
  qty_adjusted:    string;         // = new_qty_on_hand − qty_available (bidirectional)
}

const emptyAdjRow = (id: number): AdjustmentRow => ({
  id, item_id: null, item_name: "", item_image: null, item_unit: null,
  item_sku: null, cost_price: "0.00", qty_available: null,
  new_qty_on_hand: "0.00", qty_adjusted: "0.00",
});


// ─── Main component ───────────────────────────────────────────────────────────

const NewInventoryAdjustment = () => {
  const navigate = useNavigate();

  // ── Form fields ─────────────────────────────────────────────────────────────
  const [selectedParty,   setSelectedParty]   = useState<PartySearchResult>(COMPANY);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [adjustmentDate,  setAdjustmentDate]  = useState(new Date().toISOString().split("T")[0]);
  const [reasonLabel,     setReasonLabel]     = useState("");
  const [reasonValue,     setReasonValue]     = useState("");
  const [locationId,      setLocationId]      = useState<number | null>(null);
  const [locationOptions, setLocationOptions] = useState<Option[]>([]);
  const allLocationOptions = useRef<Option[]>([]);
  const [description,     setDescription]     = useState("");

  // ── Reasons (API-backed) ────────────────────────────────────────────────────
  const [reasons,           setReasons]           = useState<ReasonEntry[]>([]);
  const [showManageReasons, setShowManageReasons] = useState(false);

  useEffect(() => {
    fetchAdjustmentReasons().then(list => setReasons(list)).catch(() => {});
  }, []);

  const handleReasonSave = async (name: string): Promise<ReasonEntry | null> => {
    const res = await storeAdjustmentReason(name);
    if (!res.success) return null;
    const entry = (res as any).data as AdjustmentReason;
    setReasons(p => [...p, entry]);
    return entry;
  };
  const handleReasonUpdate = async (id: number, name: string): Promise<boolean> => {
    const res = await updateAdjustmentReason(id, name);
    if (!res.success) return false;
    setReasons(p => p.map(r => r.id === id ? { ...r, name } : r));
    if (reasons.find(r => r.id === id)?.name === reasonLabel) setReasonLabel(name);
    return true;
  };
  const handleReasonDelete = async (id: number): Promise<boolean> => {
    const res = await destroyAdjustmentReason(id);
    if (!res.success) return false;
    if (reasons.find(r => r.id === id)?.name === reasonLabel) { setReasonLabel(""); setReasonValue(""); }
    setReasons(p => p.filter(r => r.id !== id));
    return true;
  };
  const handleReasonSaveAndSelect = (entry: ReasonEntry) => {
    setReasonLabel(entry.name); setReasonValue(String(entry.id));
  };

  // ── Rows ────────────────────────────────────────────────────────────────────
  const [rows,               setRows]               = useState<AdjustmentRow[]>([emptyAdjRow(1)]);
  const rowNextId                                    = useRef(2);
  const [itemImgErrors,      setItemImgErrors]      = useState<Record<number, boolean>>({});

  // ── Item dropdown (invoice-style) ───────────────────────────────────────────
  const [itemOpenId,      setItemOpenId]      = useState<number | null>(null);
  const [itemSearchText,  setItemSearchText]  = useState<Record<number, string>>({});
  const [itemDropItems,   setItemDropItems]   = useState<ItemListRecord[]>([]);
  const [itemDropLoading, setItemDropLoading] = useState(false);
  const [itemDropPos,     setItemDropPos]     = useState<{ top: number; left: number; width: number } | null>(null);
  const itemWrapRefs   = useRef<Record<number, HTMLDivElement | null>>({});
  const itemInputRefs  = useRef<Record<number, HTMLDivElement | null>>({});
  const itemPortalRef  = useRef<HTMLDivElement>(null);
  const itemSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadItemDropItems = useCallback(async (q: string) => {
    setItemDropLoading(true);
    const res = await fetchItems({ search: q, per_page: 30 });
    setItemDropItems(res.success ? (res as ItemListResponse).data.data : []);
    setItemDropLoading(false);
  }, []);

  const toggleItemDrop = (rowId: number) => {
    if (itemOpenId === rowId) { setItemOpenId(null); setItemDropPos(null); return; }
    const el = itemInputRefs.current[rowId];
    if (el) {
      const rect = el.getBoundingClientRect();
      setItemDropPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, width: rect.width });
    }
    setItemSearchText(s => ({ ...s, [rowId]: "" }));
    setItemOpenId(rowId);
    loadItemDropItems("");
  };

  const clearItemRow = useCallback((rowId: number) => {
    setRows(p => p.map(r => r.id === rowId ? {
      ...r, item_id: null, item_name: "", item_image: null,
      item_unit: null, item_sku: null, cost_price: "0.00",
      qty_available: null, new_qty_on_hand: "0.00", qty_adjusted: "0.00",
    } : r));
    setItemImgErrors(s => { const n = { ...s }; delete n[rowId]; return n; });
    setItemSearchText(s => { const n = { ...s }; delete n[rowId]; return n; });
  }, []);

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

  // ── Settings ────────────────────────────────────────────────────────────────
  const [decimalRate, setDecimalRate] = useState(2);

  // ── Attachments ─────────────────────────────────────────────────────────────
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const attachFileRef = useRef<HTMLInputElement>(null);

  // ── Submit / toast ──────────────────────────────────────────────────────────
  const [submitting,  setSubmitting]  = useState(false);
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger"; message: string }>({ show: false, type: "success", message: "" });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (type: "success" | "danger", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // ── Load locations ──────────────────────────────────────────────────────────
  useEffect(() => {
    getLocationList().then(locs => {
      const active = locs.filter(l => l.is_active);
      const opts   = active.map(l => ({ value: String(l.id), label: l.name }));
      allLocationOptions.current = opts;
      setLocationOptions(opts);
      const primary = active.find(l => l.is_primary) ?? active[0];
      if (primary) setLocationId(primary.id);
    }).catch(() => {});
  }, []);

  // ── Filter locations by selected party ──────────────────────────────────────
  useEffect(() => {
    if (selectedParty.id === 0) {
      // Company: restore all locations
      setLocationOptions(allLocationOptions.current);
      return;
    }
    fetchParty(selectedParty.id).then(res => {
      if (!res.success) return;
      const partyLocs = res.data.locations;
      if (!partyLocs || partyLocs.length === 0) {
        // Party has no location assignments — show all
        setLocationOptions(allLocationOptions.current);
        return;
      }
      const allowedIds = new Set(partyLocs.map(pl => pl.location_node_id));
      const filtered   = allLocationOptions.current.filter(o => allowedIds.has(Number(o.value)));
      setLocationOptions(filtered.length > 0 ? filtered : allLocationOptions.current);
      // Reset location selection if current one is no longer in the filtered set
      setLocationId(prev => {
        if (prev !== null && allowedIds.has(prev)) return prev;
        const first = filtered[0];
        return first ? Number(first.value) : null;
      });
    }).catch(() => {});
  }, [selectedParty]);

  // ── Load decimal setting ────────────────────────────────────────────────────
  useEffect(() => {
    getSettings<ProductConfiguration>("products")
      .then(data => setDecimalRate(data.decimal_rate ?? 2))
      .catch(() => {});
  }, []);

  // ── Row management ──────────────────────────────────────────────────────────
  const updateRow = useCallback((id: number, field: keyof Omit<AdjustmentRow, "id">, value: string | number | null) =>
    setRows(p => p.map(r => r.id === id ? { ...r, [field]: value } : r)), []);

  const addRow = useCallback(() => {
    const id = rowNextId.current++;
    setRows(p => [...p, emptyAdjRow(id)]);
  }, []);

  const removeRow = useCallback((id: number) =>
    setRows(p => p.filter(r => r.id !== id)), []);

  // ── Fetch stock on hand when location or rows change ───────────────────────
  useEffect(() => {
    if (!locationId || rows.length === 0) return;
    rows.forEach(row => {
      if (!row.item_id) return;
      fetchItemStock(row.item_id).then(res => {
        if (!res.success) return;
        const entry = (res.data as any[]).find(s => s.location_id === locationId);
        const val = entry != null ? String(entry.stock_on_hand) : null;
        setRows(p => p.map(r => {
          if (r.id !== row.id) return r;
          const onHand = val !== null ? parseFloat(val) : null;
          const newQty = parseFloat(r.new_qty_on_hand) || 0;
          const adjVal = onHand !== null ? String(newQty - onHand) : r.qty_adjusted;
          return { ...r, qty_available: val, qty_adjusted: adjVal };
        }));
      }).catch(() => {});
    });
  }, [locationId, rows.length]);

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!locationId)     { showToast("danger", "Please select a location."); return; }
    if (!adjustmentDate) { showToast("danger", "Please enter the adjustment date."); return; }
    if (!reasonLabel)    { showToast("danger", "Please select a reason."); return; }
    const validRows = rows.filter(r => r.item_id !== null || r.item_name.trim() !== "");
    if (validRows.length === 0) {
      showToast("danger", "Please add at least one item to adjust."); return;
    }
    setSubmitting(true);
    try {
      const payload = {
        reference_number: referenceNumber.trim() || null,
        adjustment_date:  adjustmentDate,
        reason_id:        reasonValue ? Number(reasonValue) : null,
        reason_name:      reasonLabel,
        location_id:      locationId,
        party_id:         selectedParty.id !== 0 ? selectedParty.id : null,
        description:      description.trim() || null,
        status:           "committed" as const,
        items:            validRows.map((r, i) => ({
          item_id:         r.item_id,
          item_name:       r.item_name,
          item_sku:        r.item_sku,
          item_unit:       r.item_unit,
          cost_price:      parseFloat(r.cost_price) || 0,
          qty_available:   r.qty_available !== null ? parseFloat(r.qty_available) : null,
          new_qty_on_hand: parseFloat(r.new_qty_on_hand) || 0,
          qty_adjusted:    parseFloat(r.qty_adjusted) || 0,
          sort_order:      i,
        })),
      };

      const res = await storeAdjustment(payload);
      if (!res.success) {
        showToast("danger", (res as any).message ?? "Failed to save adjustment.");
        return;
      }

      const savedId = ((res as any).data as any)?.id as number | undefined;

      if (savedId && attachedFiles.length > 0) {
        for (const file of attachedFiles) {
          await uploadAdjustmentAttachment(savedId, file);
        }
      }

      emitMutation("adjustments:mutated");
      showToast("success", "Inventory adjustment saved.");
      setTimeout(() => navigate(-1), 1200);
    } catch {
      showToast("danger", "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="content">

          <PageHeader
            title="New Inventory Adjustment"
            showModuleTile={false}
            showExport={false}
            showClose
            onClose={() => navigate(-1)}
          />

          <div className="card mb-0">
            <div className="card-body p-4">

              {/* ── Party ───────────────────────────────────────────────────── */}
              <div className="mb-4" style={{ maxWidth: 480 }}>
                <label className="form-label fw-medium fs-14 text-danger">
                  Party <span aria-hidden="true">*</span>
                </label>
                <CustomerSelector
                  value={selectedParty}
                  onChange={setSelectedParty}
                />
              </div>

              <div className="border-top pt-4 mb-4">

                {/* Reference Number */}
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-2 col-form-label fw-medium fs-14">Reference Number</label>
                  <div className="col-sm-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter reference number"
                      value={referenceNumber}
                      onChange={e => setReferenceNumber(e.target.value)}
                    />
                  </div>
                </div>

                {/* Date */}
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-2 col-form-label text-danger fw-medium fs-14">
                    Date <span>*</span>
                  </label>
                  <div className="col-sm-4">
                    <CommonDatePicker
                      value={adjustmentDate ? dayjs(adjustmentDate) : null}
                      onChange={date => setAdjustmentDate(date ? date.format("YYYY-MM-DD") : "")}
                      format="DD/MM/YYYY"
                      placeholder="DD/MM/YYYY"
                    />
                  </div>
                </div>

                {/* Reason */}
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-2 col-form-label text-danger fw-medium fs-14">
                    Reason <span>*</span>
                  </label>
                  <div className="col-sm-4">
                    <ReasonDropdown
                      value={reasonLabel}
                      items={reasons}
                      onChange={(name, id) => { setReasonLabel(name); setReasonValue(id); }}
                      onManage={() => setShowManageReasons(true)}
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-2 col-form-label text-danger fw-medium fs-14">
                    Location <span>*</span>
                  </label>
                  <div className="col-sm-4">
                    <CommonSelect
                      className="select"
                      options={locationOptions}
                      value={locationId ? locationOptions.find(o => o.value === String(locationId)) ?? null : null}
                      onChange={opt => setLocationId(opt ? Number((opt as Option).value) : null)}
                      placeholder="Select location"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="row mb-3 align-items-start">
                  <label className="col-sm-2 col-form-label fw-medium fs-14">Description</label>
                  <div className="col-sm-4">
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Max. 500 characters"
                      maxLength={500}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                    />
                  </div>
                </div>

              </div>

              {/* ── Item Table ──────────────────────────────────────────────── */}
              <div className="border rounded overflow-hidden mb-4">

                {/* Section header */}
                <div className="px-3 py-2 border-bottom" style={{ background: "#f8f9fa" }}>
                  <span className="fw-semibold fs-14">Item Table</span>
                </div>

                <div style={{ overflowX: "auto" }}>
                <div style={{ minWidth: 820 }}>

                  {/* Column header */}
                  <div className="d-flex align-items-stretch border-bottom" style={{ background: "#f8f9fa" }}>
                    <div className="d-flex align-items-center px-3 py-2" style={{ flex: 1, borderRight: "1px solid #dee2e6" }}>
                      <span className="fw-semibold fs-12 text-uppercase">Item Details</span>
                    </div>
                    <div className="d-flex align-items-center px-3 py-2" style={{ width: 160, flexShrink: 0, borderRight: "1px solid #dee2e6" }}>
                      <span className="fw-semibold fs-12 text-uppercase">Stock on Hand</span>
                    </div>
                    <div className="d-flex align-items-center px-3 py-2" style={{ width: 170, flexShrink: 0, borderRight: "1px solid #dee2e6" }}>
                      <span className="fw-semibold fs-12 text-uppercase">New Quantity on Hand</span>
                    </div>
                    <div className="d-flex align-items-center px-3 py-2" style={{ width: 150, flexShrink: 0 }}>
                      <span className="fw-semibold fs-12 text-uppercase">Quantity Adjusted</span>
                    </div>
                    <div style={{ width: 48, flexShrink: 0 }} />
                  </div>

                  {/* Rows */}
                  {rows.map(row => {
                    const qtyAvail = row.qty_available !== null ? parseFloat(row.qty_available) : null;
                    const adjNum   = parseFloat(row.qty_adjusted);
                    const adjColor = !isNaN(adjNum) && adjNum > 0 ? "#16a34a" : !isNaN(adjNum) && adjNum < 0 ? "#E41F07" : undefined;

                    return (
                      <React.Fragment key={row.id}>
                        <div className="d-flex align-items-stretch border-bottom">

                          {/* Item Details — image embedded */}
                          <div
                            className="d-flex flex-column justify-content-center"
                            style={{ flex: 1, borderRight: "1px solid #dee2e6", padding: "12px" }}
                            ref={el => { itemWrapRefs.current[row.id] = el; }}
                          >
                            <div className="d-flex align-items-center gap-3">
                              {/* Image */}
                              <div
                                className="border rounded d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                                style={{ width: 48, height: 48, background: "#f8f9fa" }}
                              >
                                {row.item_image && !itemImgErrors[row.id] ? (
                                  <img
                                    src={row.item_image}
                                    alt=""
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    onError={() => setItemImgErrors(p => ({ ...p, [row.id]: true }))}
                                  />
                                ) : (
                                  <i className="ti ti-photo text-muted" style={{ fontSize: 18 }} />
                                )}
                              </div>
                              {/* Input */}
                              <div className="input-group" style={{ flex: 1 }} ref={el => { itemInputRefs.current[row.id] = el; }}>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Type or click to select an item."
                                  value={row.item_name}
                                  readOnly
                                  style={{ cursor: "pointer" }}
                                  onClick={() => toggleItemDrop(row.id)}
                                />
                                {row.item_name && (
                                  <button type="button" className="btn btn-outline-light" title="Clear" onClick={() => clearItemRow(row.id)}>
                                    <i className="ti ti-x" style={{ fontSize: 13 }} />
                                  </button>
                                )}
                                <button type="button" className="btn btn-outline-light" onClick={() => toggleItemDrop(row.id)}>
                                  <i className={`ti ti-chevron-${itemOpenId === row.id ? "up" : "down"}`} />
                                </button>
                              </div>
                            </div>
                            {row.item_unit && (
                              <span className="fs-12 text-muted mt-1" style={{ paddingLeft: 60 }}>{row.item_unit}</span>
                            )}
                          </div>

                          {/* Quantity Available */}
                          <div className="d-flex flex-column justify-content-center align-items-end" style={{ width: 160, flexShrink: 0, borderRight: "1px solid #dee2e6", padding: "12px 16px" }}>
                            {row.item_id ? (
                              qtyAvail !== null ? (
                                <span className="fs-15 fw-medium">{qtyAvail.toFixed(decimalRate)}</span>
                              ) : (
                                <span className="text-muted fs-14">{locationId ? "…" : "—"}</span>
                              )
                            ) : (
                              <span className="text-muted fs-14" />
                            )}
                          </div>

                          {/* New Quantity on Hand */}
                          <div className="d-flex flex-column justify-content-center" style={{ width: 170, flexShrink: 0, borderRight: "1px solid #dee2e6", padding: "12px" }}>
                            <input
                              type="number"
                              className="form-control text-end"
                              step="any"
                              min={0}
                              value={row.new_qty_on_hand}
                              onChange={e => {
                                const val = e.target.value;
                                setRows(p => p.map(r => {
                                  if (r.id !== row.id) return r;
                                  const onHand = r.qty_available !== null ? parseFloat(r.qty_available) : null;
                                  const newQty = parseFloat(val);
                                  const adjVal = onHand !== null && !isNaN(newQty) ? String(newQty - onHand) : r.qty_adjusted;
                                  return { ...r, new_qty_on_hand: val, qty_adjusted: adjVal };
                                }));
                              }}
                              onBlur={e => {
                                if (!e.target.value.trim() || isNaN(parseFloat(e.target.value))) {
                                  setRows(p => p.map(r => {
                                    if (r.id !== row.id) return r;
                                    const onHand = r.qty_available !== null ? parseFloat(r.qty_available) : null;
                                    const adjVal = onHand !== null ? String(0 - onHand) : "0.00";
                                    return { ...r, new_qty_on_hand: "0.00", qty_adjusted: adjVal };
                                  }));
                                }
                              }}
                            />
                          </div>

                          {/* Quantity Adjusted */}
                          <div className="d-flex flex-column justify-content-center" style={{ width: 150, flexShrink: 0, padding: "12px" }}>
                            <input
                              type="number"
                              className="form-control text-end"
                              step="any"
                              value={row.qty_adjusted}
                              style={{ color: adjColor }}
                              onChange={e => {
                                const val = e.target.value;
                                setRows(p => p.map(r => {
                                  if (r.id !== row.id) return r;
                                  const onHand = r.qty_available !== null ? parseFloat(r.qty_available) : null;
                                  const adjQty = parseFloat(val);
                                  const newVal = onHand !== null && !isNaN(adjQty) ? String(onHand + adjQty) : r.new_qty_on_hand;
                                  return { ...r, qty_adjusted: val, new_qty_on_hand: newVal };
                                }));
                              }}
                              onBlur={e => {
                                if (!e.target.value.trim() || isNaN(parseFloat(e.target.value))) {
                                  setRows(p => p.map(r => {
                                    if (r.id !== row.id) return r;
                                    const onHand = r.qty_available !== null ? parseFloat(r.qty_available) : null;
                                    return { ...r, qty_adjusted: "0.00", new_qty_on_hand: onHand !== null ? String(onHand) : "0.00" };
                                  }));
                                }
                              }}
                            />
                          </div>

                          {/* Remove */}
                          <div className="d-flex align-items-center justify-content-center" style={{ width: 48, flexShrink: 0 }}>
                            <button
                              type="button"
                              className="btn p-0 border-0 bg-transparent text-danger"
                              title="Remove"
                              disabled={rows.length === 1}
                              onClick={() => removeRow(row.id)}
                            >
                              <i className="ti ti-circle-x fs-18" />
                            </button>
                          </div>

                        </div>


                      </React.Fragment>
                    );
                  })}

                  {/* Footer */}
                  <div className="d-flex align-items-center px-3 py-2" style={{ background: "#fff" }}>
                    <button
                      type="button"
                      className="btn btn-link p-0 fs-13 text-danger d-flex align-items-center gap-1"
                      style={{ textDecoration: "none", whiteSpace: "nowrap" }}
                      onClick={addRow}
                    >
                      <i className="ti ti-circle-plus fs-15" />
                      Add New Row
                    </button>
                  </div>

                </div>
                </div>

              </div>

            {/* ── Attach Files ────────────────────────────────────────────── */}
            <div className="border-top pt-4">
              <p className="form-label fw-medium fs-14 mb-2">Attach File(s) to Adjustment</p>

              <label
                htmlFor="adjustment_attach_input"
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
                id="adjustment_attach_input"
                ref={attachFileRef}
                type="file"
                multiple
                className="d-none"
                onClick={e => { (e.target as HTMLInputElement).value = ""; }}
                onChange={e => {
                  const picked = Array.from(e.target.files ?? []);
                  setAttachedFiles(prev => [...prev, ...picked].slice(0, 10));
                }}
              />

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
                          onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))}
                        >
                          <i className="ti ti-x fs-16" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            </div>
          </div>

        </div>

        {/* ── Sticky footer ──────────────────────────────────────────────────── */}
        <div
          className="bg-white border-top d-flex align-items-center gap-2 px-4"
          style={{ position: "sticky", bottom: 0, zIndex: 100, height: 60 }}
        >
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleSave}
            disabled={submitting}
          >
            {submitting ? "Saving…" : "Save Adjustment"}
          </button>
          <button type="button" className="btn btn-outline-light" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>

        <Footer />
      </div>

      {/* ── Item search dropdown portal ───────────────────────────────────── */}
      {itemOpenId !== null && itemDropPos !== null && createPortal(
        <div
          ref={itemPortalRef}
          className="bg-white border rounded shadow-sm"
          style={{
            position: "absolute",
            top:    itemDropPos.top,
            left:   itemDropPos.left,
            width:  itemDropPos.width,
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
              onChange={e => {
                const v = e.target.value;
                setItemSearchText(s => ({ ...s, [itemOpenId!]: v }));
                if (itemSearchTimer.current) clearTimeout(itemSearchTimer.current);
                itemSearchTimer.current = setTimeout(() => loadItemDropItems(v), 300);
              }}
            />
          </div>
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {(() => {
              const usedIds = new Set(
                rows.filter(r => r.item_id !== null && r.id !== itemOpenId).map(r => r.item_id as number)
              );
              const available = itemDropItems.filter(item => !usedIds.has(item.id));
              return itemDropLoading ? (
                <p className="text-muted fs-13 text-center py-2 mb-0">Loading…</p>
              ) : available.length === 0 ? (
                <p className="text-muted fs-13 text-center py-2 mb-0">No results</p>
              ) : available.map(item => (
                <div
                  key={item.id}
                  className="px-3 py-2 fs-15"
                  style={{ cursor: "pointer", color: "#707070" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#E41F07"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#707070"; }}
                  onClick={() => {
                    const rowId = itemOpenId as number;
                    setRows(p => p.map(r => r.id === rowId ? {
                      ...r,
                      item_id:         item.id,
                      item_name:       item.name,
                      item_image:      item.image,
                      item_unit:       item.unit,
                      item_sku:        item.sku,
                      cost_price:      item.cost_price ?? "0.00",
                      qty_available:   null,
                      new_qty_on_hand: "0.00",
                      qty_adjusted:    "0.00",
                    } : r));
                    setItemImgErrors(s => { const n = { ...s }; delete n[rowId]; return n; });
                    setItemOpenId(null);
                    setItemDropPos(null);
                    if (locationId) {
                      fetchItemStock(item.id).then(res => {
                        if (!res.success) return;
                        const entry = (res.data as any[]).find(s => s.location_id === locationId);
                        const val = entry != null ? String(entry.stock_on_hand) : null;
                        const onHand = val !== null ? parseFloat(val) : null;
                        setRows(p => p.map(r => {
                          if (r.id !== rowId) return r;
                          const adjVal = onHand !== null ? "0.00" : "0.00";
                          return { ...r, qty_available: val, new_qty_on_hand: val ?? "0.00", qty_adjusted: adjVal };
                        }));
                      }).catch(() => {});
                    }
                  }}
                >
                  <div className="fw-medium">{item.name}</div>
                  {item.sku && <div className="fs-12" style={{ color: "#aaa" }}>SKU: {item.sku}</div>}
                </div>
              ));
            })()}
          </div>
        </div>,
        document.body
      )}

      {/* ── Manage Reasons Modal ────────────────────────────────── */}
      <ManageReasonsModal
        show={showManageReasons}
        onHide={() => setShowManageReasons(false)}
        items={reasons}
        onSave={handleReasonSave}
        onUpdate={handleReasonUpdate}
        onDelete={handleReasonDelete}
        onSaveAndSelect={handleReasonSaveAndSelect}
      />

      {/* ── Toast Notifications ─────────────────────────────────── */}
      <div
        role="region"
        aria-live="polite"
        className="position-fixed top-0 start-50 translate-middle-x pt-4"
        style={{ zIndex: 9999, pointerEvents: "none" }}
      >
        <Toast
          show={toast.show}
          onClose={() => setToast(t => ({ ...t, show: false }))}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{
            pointerEvents: "auto",
            borderRadius: "12px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
            border: "none",
            minWidth: "320px",
            background: "#fff",
          }}
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

    </>
  );
};

export default NewInventoryAdjustment;
