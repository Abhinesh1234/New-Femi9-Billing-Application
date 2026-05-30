import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import { Toast } from "react-bootstrap";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import CommonDatePicker from "../../../../components/common-datePicker/commonDatePicker";
import { fetchLocations } from "../../../../core/services/locationApi";
import {
  fetchNextTransferOrderNumber,
  storeTransferOrder,
  initiateTransferOrder,
  markTransferOrderAsTransferred,
} from "../../../../core/services/transferOrderApi";
import { all_routes } from "../../../../routes/all_routes";
import {
  fetchItems,
  fetchItemStock,
  type ItemListRecord,
  type ItemListResponse,
} from "../../../../core/services/itemApi";

interface LocationEntry { id: number; name: string; party_id: number | null; }

// ─── Transfer row ─────────────────────────────────────────────────────────────
interface TransferRow {
  id:              number;
  item_id:         number | null;
  item_name:       string;
  item_image:      string | null;
  item_unit:       string | null;
  item_sku:        string | null;
  source_qty:      string | null;
  dest_qty:        string | null;
  qty_to_transfer: string;
}

const emptyRow = (id: number): TransferRow => ({
  id, item_id: null, item_name: "", item_image: null,
  item_unit: null, item_sku: null, source_qty: null, dest_qty: null, qty_to_transfer: "",
});

// ─── Location dropdown (Brand-style) ─────────────────────────────────────────
const LocationField = ({
  label, value, onChange, items,
}: {
  label:    string;
  value:    string;
  onChange: (name: string, id: number) => void;
  items:    LocationEntry[];
}) => {
  const [open,   setOpen]   = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef             = useRef<HTMLDivElement>(null);

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
      setDropUp(window.innerHeight - rect.bottom < 280);
    }
    setOpen(o => !o); setSearch("");
  };

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const select = (item: LocationEntry) => { onChange(item.name, item.id); setOpen(false); setSearch(""); };

  return (
    <div ref={wrapRef} className="position-relative" style={open ? { zIndex: 10 } : undefined}>
      <div className="input-group">
        <input type="text" className="form-control" placeholder={`Select ${label}`}
          value={value} readOnly style={{ cursor: "pointer" }} onClick={toggle} />
        <button type="button" className="btn btn-outline-light" onClick={toggle}>
          <i className={`ti ti-chevron-${open ? "up" : "down"}`} />
        </button>
      </div>
      {open && (
        <div className="position-absolute bg-white border rounded shadow-sm overflow-hidden"
          style={{
            ...(dropUp ? { bottom: "calc(100% + 4px)", top: "auto" } : { top: "calc(100% + 4px)", bottom: "auto" }),
            left: 0, right: 0, zIndex: 1050, minWidth: 220,
          }}>
          <div className="p-2 border-bottom">
            <input autoFocus type="text" className="form-control fs-14" style={{ height: 42 }}
              placeholder={`Search ${label}…`} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ maxHeight: 180, overflowY: "auto", paddingBottom: 8 }}>
            {filtered.length === 0 ? (
              <p className="text-muted fs-15 text-center py-3 mb-0">No results</p>
            ) : (() => {
              const own   = filtered.filter(i => i.party_id === null);
              const other = filtered.filter(i => i.party_id !== null);
              const renderItem = (item: LocationEntry) => {
                const isActive = item.name === value;
                return (
                  <div key={item.id} className="px-3 py-2 fs-15"
                    style={{ cursor: "pointer", background: isActive ? "#E41F07" : "transparent", color: isActive ? "#fff" : "#707070" }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "#E41F07"; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "#707070"; }}
                    onClick={() => select(item)}>
                    {item.name}
                  </div>
                );
              };
              return (
                <>
                  {own.length > 0 && (
                    <>
                      <div className="px-3 pt-2 pb-1 fs-12 fw-semibold text-uppercase" style={{ color: "#aaa", letterSpacing: "0.05em" }}>My Company</div>
                      {own.map(renderItem)}
                    </>
                  )}
                  {own.length > 0 && other.length > 0 && (
                    <div style={{ borderTop: "1px solid #f0f0f0", margin: "4px 0" }} />
                  )}
                  {other.length > 0 && (
                    <>
                      <div className="px-3 pt-2 pb-1 fs-12 fw-semibold text-uppercase" style={{ color: "#aaa", letterSpacing: "0.05em" }}>Others</div>
                      {other.map(renderItem)}
                    </>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── File helpers ────────────────────────────────────────────────────────────
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

// ─── Page ─────────────────────────────────────────────────────────────────────
const NewTransferOrder = () => {
  const navigate = useNavigate();

  // ── Header fields ────────────────────────────────────────────────────────────
  const [transferOrderNumber, setTransferOrderNumber] = useState("");
  const [transferDate,        setTransferDate]        = useState(dayjs().format("YYYY-MM-DD"));
  const [reason,              setReason]              = useState("");

  const [allLocations,     setAllLocations]     = useState<LocationEntry[]>([]);
  const [sourceName,       setSourceName]       = useState("");
  const [sourceLocationId, setSourceLocationId] = useState<number | null>(null);
  const [destName,         setDestName]         = useState("");
  const [destLocationId,   setDestLocationId]   = useState<number | null>(null);

  // ── Rows ─────────────────────────────────────────────────────────────────────
  const [rows,          setRows]          = useState<TransferRow[]>([emptyRow(1)]);
  const rowNextId                         = useRef(2);
  const [itemImgErrors, setItemImgErrors] = useState<Record<number, boolean>>({});

  // ── Item search dropdown ──────────────────────────────────────────────────────
  const [itemOpenId,      setItemOpenId]      = useState<number | null>(null);
  const [itemSearchText,  setItemSearchText]  = useState<Record<number, string>>({});
  const [itemDropItems,   setItemDropItems]   = useState<ItemListRecord[]>([]);
  const [itemDropLoading, setItemDropLoading] = useState(false);
  const [itemDropPos,     setItemDropPos]     = useState<{ top: number; left: number; width: number } | null>(null);
  const itemWrapRefs    = useRef<Record<number, HTMLDivElement | null>>({});
  const itemInputRefs   = useRef<Record<number, HTMLDivElement | null>>({});
  const itemPortalRef   = useRef<HTMLDivElement>(null);
  const itemSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Attachments ──────────────────────────────────────────────────────────────
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const attachFileRef = useRef<HTMLInputElement>(null);

  // ── Save / toast state ───────────────────────────────────────────────────────
  const [saving,      setSaving]      = useState(false);
  const [drafterOpen, setDrafterOpen] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger"; message: string }>({ show: false, type: "success", message: "" });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (type: "success" | "danger", message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ show: true, type, message });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const route = all_routes;

  const handleSave = async (action: "initiate" | "transferred") => {
    // ── Validation ─────────────────────────────────────────────────────────────
    if (!sourceLocationId)   { showToast("danger", "Please select a source location.");      return; }
    if (!destLocationId)     { showToast("danger", "Please select a destination location."); return; }
    if (!transferDate)       { showToast("danger", "Please enter the transfer date.");       return; }

    const validLines = rows.filter(r => r.item_id !== null && parseFloat(r.qty_to_transfer || "0") > 0);
    if (validLines.length === 0) {
      showToast("danger", "Please add at least one item with a transfer quantity greater than zero.");
      return;
    }

    setSaving(true);
    try {
      // ── Step 1: store as draft ────────────────────────────────────────────
      const storeRes = await storeTransferOrder({
        transfer_number:         transferOrderNumber,
        transfer_date:           transferDate,
        source_location_id:      sourceLocationId,
        destination_location_id: destLocationId,
        reason:                  reason || null,
        lines: validLines.map(r => ({
          item_id:         r.item_id as number,
          qty_to_transfer: parseFloat(r.qty_to_transfer),
          description:     r.description || null,
        })),
      });

      if (!storeRes.success) {
        showToast("danger", storeRes.message ?? "Failed to save transfer order.");
        return;
      }

      const orderId = (storeRes as any).data?.id as number;

      // ── Step 2: initiate (draft → in_transit) ─────────────────────────────
      const initRes = await initiateTransferOrder(orderId);
      if (!initRes.success) {
        showToast("danger", initRes.message ?? "Failed to initiate transfer order.");
        return;
      }

      // ── Step 3 (optional): mark as transferred immediately ────────────────
      if (action === "transferred") {
        const transferRes = await markTransferOrderAsTransferred(orderId);
        if (!transferRes.success) {
          showToast("danger", transferRes.message ?? "Failed to mark as transferred.");
          // Order was initiated — redirect to overview so user can retry from there
          navigate(route.transferOrderOverview.replace(":id", String(orderId)));
          return;
        }
      }

      navigate(route.transferOrderOverview.replace(":id", String(orderId)));

    } catch {
      showToast("danger", "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };


  // ── Init fetches ──────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchNextTransferOrderNumber().then(res => {
      if (res.success && res.data) setTransferOrderNumber(res.data.transfer_number);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchLocations({ active_only: true, all_locations: true }).then(res => {
      if (res.success) {
        const mapped = res.data.map(l => ({ id: l.id, name: l.name, party_id: l.party_id ?? null }));
        // Company's own locations (party_id = null) first, then third-party, both sorted by name
        mapped.sort((a, b) => {
          const aOwn = a.party_id === null ? 0 : 1;
          const bOwn = b.party_id === null ? 0 : 1;
          if (aOwn !== bOwn) return aOwn - bOwn;
          return a.name.localeCompare(b.name);
        });
        setAllLocations(mapped);
      }
    }).catch(() => {});
  }, []);

  // ── Derived location option lists (mutual exclusion) ─────────────────────────
  const sourceItems = useMemo(
    () => allLocations.filter(l => l.id !== destLocationId),
    [allLocations, destLocationId]
  );
  const destItems = useMemo(
    () => allLocations.filter(l => l.id !== sourceLocationId),
    [allLocations, sourceLocationId]
  );

  const swapLocations = () => {
    setSourceName(destName);         setSourceLocationId(destLocationId);
    setDestName(sourceName);         setDestLocationId(sourceLocationId);
  };

  const locationsSelected = !!sourceLocationId && !!destLocationId;

  // ── Item dropdown helpers ─────────────────────────────────────────────────────
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
      item_unit: null, item_sku: null, source_qty: null, dest_qty: null, qty_to_transfer: "",
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

  // ── Row actions ───────────────────────────────────────────────────────────────
  const addRow    = useCallback(() => { const id = rowNextId.current++; setRows(p => [...p, emptyRow(id)]); }, []);
  const removeRow = useCallback((id: number) => setRows(p => p.filter(r => r.id !== id)), []);

  // ── Fetch both source + destination stock when locations or items change ──────
  useEffect(() => {
    rows.forEach(row => {
      if (!row.item_id) return;
      fetchItemStock(row.item_id).then(res => {
        if (!res.success) return;
        const data     = res.data as any[];
        const srcEntry = sourceLocationId ? data.find(s => s.location_id === sourceLocationId) : null;
        const dstEntry = destLocationId   ? data.find(s => s.location_id === destLocationId)   : null;
        setRows(p => p.map(r => r.id === row.id ? {
          ...r,
          source_qty: srcEntry != null ? String(srcEntry.available_for_sale) : null,
          dest_qty:   dstEntry != null ? String(dstEntry.available_for_sale) : null,
        } : r));
      }).catch(() => {});
    });
  }, [sourceLocationId, destLocationId, rows.length]);

  return (
    <>
      <div className="page-wrapper">
        <div className="content">

          <PageHeader
            title="New Transfer Order"
            showModuleTile={false}
            showExport={false}
            showClose
            onClose={() => navigate(-1)}
          />

          <div className="card mb-0">
            <div className="card-body p-4">

              {/* Transfer Order # */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label fw-medium fs-14 text-danger">
                  Transfer Order# <span aria-hidden="true">*</span>
                </label>
                <div className="col-sm-4">
                  <input type="text" className="form-control bg-light" placeholder="Auto-generated"
                    value={transferOrderNumber} readOnly style={{ cursor: "default" }} />
                </div>
              </div>

              {/* Date */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label fw-medium fs-14">Date</label>
                <div className="col-sm-4">
                  <CommonDatePicker
                    value={transferDate ? dayjs(transferDate) : null}
                    onChange={date => setTransferDate(date ? date.format("YYYY-MM-DD") : "")}
                    format="DD/MM/YYYY" placeholder="DD/MM/YYYY"
                  />
                </div>
              </div>

              {/* Reason */}
              <div className="row mb-3 align-items-start">
                <label className="col-sm-2 col-form-label fw-medium fs-14">Reason</label>
                <div className="col-sm-4">
                  <textarea className="form-control" rows={3} placeholder="Enter reason for transfer"
                    value={reason} onChange={e => setReason(e.target.value)} />
                </div>
              </div>

              {/* Source / Destination Locations */}
              <div className="border-top pt-4 mt-2 mb-4">
                <div className="d-flex align-items-end gap-3">
                  <div style={{ flex: 1 }}>
                    <label className="form-label fw-medium fs-14 text-danger mb-1">
                      Source Location <span aria-hidden="true">*</span>
                    </label>
                    <LocationField label="Source Location" value={sourceName} items={sourceItems}
                      onChange={(name, id) => { setSourceName(name); setSourceLocationId(id); }} />
                  </div>
                  <div className="flex-shrink-0 pb-1">
                    <button type="button" onClick={swapLocations}
                      className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: 38, height: 38 }} title="Swap locations">
                      <i className="ti ti-arrows-exchange fs-18 text-muted" />
                    </button>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="form-label fw-medium fs-14 text-danger mb-1">
                      Destination Location <span aria-hidden="true">*</span>
                    </label>
                    <LocationField label="Destination Location" value={destName} items={destItems}
                      onChange={(name, id) => { setDestName(name); setDestLocationId(id); }} />
                  </div>
                </div>
              </div>

              <hr className="my-4" />

              {/* ── Item Table ──────────────────────────────────────────────── */}
              <div style={!locationsSelected ? { opacity: 0.45, pointerEvents: "none", userSelect: "none" } : undefined}>
              <p className="fw-bold fs-15 mb-3">Item Details</p>

              <div className="border rounded overflow-hidden mb-4">

                <div style={{ overflowX: "auto" }}>
                <div style={{ minWidth: 860 }}>

                  {/* Column headers */}
                  <div className="d-flex align-items-stretch border-bottom" style={{ background: "#f8f9fa" }}>
                    <div className="d-flex align-items-center justify-content-center px-3 py-2" style={{ width: 80, flexShrink: 0, borderRight: "1px solid #dee2e6" }}>
                      <span className="fw-semibold fs-12 text-uppercase">Image</span>
                    </div>
                    <div className="d-flex align-items-center px-3 py-2" style={{ flex: 1, borderRight: "1px solid #dee2e6" }}>
                      <span className="fw-semibold fs-12 text-uppercase">Item Details</span>
                    </div>
                    <div style={{ width: 320, flexShrink: 0, borderRight: "1px solid #dee2e6" }}>
                      <div className="text-center fw-semibold fs-12 text-uppercase pt-2 pb-1"
                        style={{ borderBottom: "1px solid #dee2e6" }}>
                        Current Availability
                      </div>
                      <div className="d-flex">
                        <div className="text-center py-1 fw-semibold fs-12 text-uppercase"
                          style={{ flex: 1, borderRight: "1px solid #dee2e6" }}>
                          Source Stock
                        </div>
                        <div className="text-center py-1 fw-semibold fs-12 text-uppercase"
                          style={{ flex: 1 }}>
                          Dest. Stock
                        </div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center px-3 py-2" style={{ width: 180, flexShrink: 0 }}>
                      <span className="fw-semibold fs-12 text-uppercase">Qty to Transfer</span>
                    </div>
                    <div style={{ width: 48, flexShrink: 0 }} />
                  </div>

                  {/* Rows */}
                  {rows.map(row => (
                    <React.Fragment key={row.id}>
                      <div className="d-flex align-items-stretch border-bottom">

                        {/* Image */}
                        <div className="d-flex align-items-center justify-content-center"
                          style={{ width: 80, flexShrink: 0, borderRight: "1px solid #dee2e6", padding: "12px" }}>
                          <div className="border rounded d-flex align-items-center justify-content-center overflow-hidden"
                            style={{ width: 48, height: 48, background: "#f8f9fa" }}>
                            {row.item_image && !itemImgErrors[row.id] ? (
                              <img src={row.item_image} alt=""
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                onError={() => setItemImgErrors(p => ({ ...p, [row.id]: true }))} />
                            ) : (
                              <i className="ti ti-photo text-muted" style={{ fontSize: 18 }} />
                            )}
                          </div>
                        </div>

                        {/* Item Details */}
                        <div className="d-flex flex-column justify-content-center"
                          style={{ flex: 1, borderRight: "1px solid #dee2e6", padding: "12px" }}
                          ref={el => { itemWrapRefs.current[row.id] = el; }}>
                          <div className="input-group" ref={el => { itemInputRefs.current[row.id] = el; }}>
                            <input type="text" className="form-control"
                              placeholder="Type or click to select an item."
                              value={row.item_name} readOnly style={{ cursor: "pointer" }}
                              onClick={() => toggleItemDrop(row.id)} />
                            {row.item_name && (
                              <button type="button" className="btn btn-outline-light" title="Clear"
                                onClick={() => clearItemRow(row.id)}>
                                <i className="ti ti-x" style={{ fontSize: 13 }} />
                              </button>
                            )}
                            <button type="button" className="btn btn-outline-light"
                              onClick={() => toggleItemDrop(row.id)}>
                              <i className={`ti ti-chevron-${itemOpenId === row.id ? "up" : "down"}`} />
                            </button>
                          </div>
                          {row.item_unit && (
                            <span className="fs-12 text-muted mt-1">{row.item_unit}</span>
                          )}
                        </div>

                        {/* Source Stock */}
                        <div className="d-flex flex-column justify-content-center align-items-center"
                          style={{ width: 160, flexShrink: 0, borderRight: "1px solid #dee2e6", padding: "12px 16px" }}>
                          {row.item_id ? (
                            row.source_qty !== null
                              ? <span className="fs-15 fw-medium">{parseFloat(row.source_qty).toFixed(2)}</span>
                              : <span className="text-muted fs-14">{sourceLocationId ? "…" : "—"}</span>
                          ) : null}
                        </div>

                        {/* Destination Stock */}
                        <div className="d-flex flex-column justify-content-center align-items-center"
                          style={{ width: 160, flexShrink: 0, borderRight: "1px solid #dee2e6", padding: "12px 16px" }}>
                          {row.item_id ? (
                            row.dest_qty !== null
                              ? <span className="fs-15 fw-medium">{parseFloat(row.dest_qty).toFixed(2)}</span>
                              : <span className="text-muted fs-14">{destLocationId ? "…" : "—"}</span>
                          ) : null}
                        </div>

                        {/* Qty to Transfer */}
                        <div className="d-flex flex-column justify-content-center"
                          style={{ width: 180, flexShrink: 0, padding: "12px" }}>
                          <input type="number" className="form-control text-end" step="any" min={0}
                            placeholder="0.00"
                            value={row.qty_to_transfer}
                            onChange={e => setRows(p => p.map(r =>
                              r.id === row.id ? { ...r, qty_to_transfer: e.target.value } : r
                            ))}
                            onBlur={e => {
                              if (e.target.value.trim() && isNaN(parseFloat(e.target.value))) {
                                setRows(p => p.map(r => r.id === row.id ? { ...r, qty_to_transfer: "" } : r));
                              }
                            }}
                          />
                        </div>

                        {/* Remove */}
                        <div className="d-flex align-items-center justify-content-center" style={{ width: 48, flexShrink: 0 }}>
                          <button type="button" className="btn p-0 border-0 bg-transparent text-danger"
                            title="Remove" disabled={rows.length === 1} onClick={() => removeRow(row.id)}>
                            <i className="ti ti-circle-x fs-18" />
                          </button>
                        </div>

                      </div>
                    </React.Fragment>
                  ))}

                  {/* Footer */}
                  <div className="d-flex align-items-center px-3 py-2" style={{ background: "#fff" }}>
                    <button type="button"
                      className="btn btn-link p-0 fs-13 text-danger d-flex align-items-center gap-1"
                      style={{ textDecoration: "none", whiteSpace: "nowrap" }}
                      onClick={addRow}>
                      <i className="ti ti-circle-plus fs-15" />
                      Add New Row
                    </button>
                  </div>

                </div>
                </div>
              </div>
              </div>{/* end locationsSelected wrapper */}

            {/* ── Attach Files ──────────────────────────────────────────────── */}
            <div className="border-top pt-4">
              <p className="form-label fw-medium fs-14 mb-2">Attach File(s) to Transfer Order</p>

              <label
                htmlFor="transfer_attach_input"
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
                id="transfer_attach_input"
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

        {/* Sticky action bar */}
        <div
          className="bg-white border-top d-flex align-items-center gap-2 px-4"
          style={{ position: "sticky", bottom: 0, zIndex: 100, height: 60 }}
        >
          {/* Split button: Save + dropup with Mark as Transferred */}
          <div className="btn-group position-relative">
            <button
              type="button"
              className="btn btn-danger"
              disabled={saving}
              onClick={() => handleSave("initiate")}
              aria-label="Save transfer order"
            >
              {saving ? (
                <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />Saving…</>
              ) : "Initiate Transfer"}
            </button>
            <button
              type="button"
              className="btn btn-danger dropdown-toggle dropdown-toggle-split px-2"
              disabled={saving}
              onClick={() => setDrafterOpen(o => !o)}
              aria-label="More save options"
            >
              <span className="visually-hidden">Toggle dropdown</span>
            </button>
            {drafterOpen && (
              <div
                className="dropdown-menu show"
                style={{ position: "absolute", bottom: "100%", left: 0, top: "auto", minWidth: 200, marginBottom: 4 }}
              >
                <button
                  type="button"
                  className="dropdown-item"
                  style={{ fontSize: 15, padding: "10px 20px" }}
                  onClick={() => { setDrafterOpen(false); handleSave("transferred"); }}
                >
                  <i className="ti ti-arrows-transfer-up me-2" />
                  Mark as Transferred
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn btn-outline-light"
            disabled={saving}
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Item search portal */}
      {itemOpenId !== null && itemDropPos !== null && createPortal(
        <div ref={itemPortalRef} className="bg-white border rounded shadow-sm"
          style={{ position: "absolute", top: itemDropPos.top, left: itemDropPos.left, width: itemDropPos.width, zIndex: 9999, minWidth: 220 }}>
          <div className="p-2 border-bottom">
            <input autoFocus type="text" className="form-control fs-14" style={{ height: 42 }}
              placeholder="Search Items…"
              value={itemSearchText[itemOpenId] ?? ""}
              onChange={e => {
                const v = e.target.value;
                setItemSearchText(s => ({ ...s, [itemOpenId!]: v }));
                if (itemSearchTimer.current) clearTimeout(itemSearchTimer.current);
                itemSearchTimer.current = setTimeout(() => loadItemDropItems(v), 300);
              }} />
          </div>
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {(() => {
              const usedIds  = new Set(rows.filter(r => r.item_id !== null && r.id !== itemOpenId).map(r => r.item_id as number));
              const available = itemDropItems.filter(item => !usedIds.has(item.id));
              return itemDropLoading ? (
                <p className="text-muted fs-13 text-center py-2 mb-0">Loading…</p>
              ) : available.length === 0 ? (
                <p className="text-muted fs-13 text-center py-2 mb-0">No results</p>
              ) : available.map(item => (
                <div key={item.id} className="px-3 py-2 fs-15"
                  style={{ cursor: "pointer", color: "#707070" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#E41F07"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#707070"; }}
                  onClick={() => {
                    const rowId = itemOpenId as number;
                    setRows(p => p.map(r => r.id === rowId ? {
                      ...r, item_id: item.id, item_name: item.name, item_image: item.image,
                      item_unit: item.unit, item_sku: item.sku, source_qty: null, dest_qty: null, qty_to_transfer: "",
                    } : r));
                    setItemImgErrors(s => { const n = { ...s }; delete n[rowId]; return n; });
                    setItemOpenId(null); setItemDropPos(null);
                    if (sourceLocationId || destLocationId) {
                      fetchItemStock(item.id).then(res => {
                        if (!res.success) return;
                        const data     = res.data as any[];
                        const srcEntry = sourceLocationId ? data.find(s => s.location_id === sourceLocationId) : null;
                        const dstEntry = destLocationId   ? data.find(s => s.location_id === destLocationId)   : null;
                        setRows(p => p.map(r => r.id === rowId ? {
                          ...r,
                          source_qty: srcEntry != null ? String(srcEntry.available_for_sale) : null,
                          dest_qty:   dstEntry != null ? String(dstEntry.available_for_sale) : null,
                        } : r));
                      }).catch(() => {});
                    }
                  }}>
                  <div className="fw-medium">{item.name}</div>
                  {item.sku && <div className="fs-12" style={{ color: "#aaa" }}>SKU: {item.sku}</div>}
                </div>
              ));
            })()}
          </div>
        </div>,
        document.body
      )}

      {/* Toast */}
      <div aria-live="polite" className="position-fixed top-0 start-50 translate-middle-x pt-4" style={{ zIndex: 9999, pointerEvents: "none" }}>
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

    </>
  );
};

export default NewTransferOrder;
