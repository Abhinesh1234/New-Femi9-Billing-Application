import React, { useCallback, useEffect, useRef, useState } from "react";
import { Toast } from "react-bootstrap";
import { createPortal } from "react-dom"; // used by CompositeDropdown
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import CommonSelect, { type Option } from "../../../../components/common-select/commonSelect";
import CommonDatePicker from "../../../../components/common-datePicker/commonDatePicker";
import { getLocationList } from "../../../../core/cache/locationCache";
import { getSettings } from "../../../../core/cache/settingCache";
import { type ProductConfiguration } from "../../../../core/services/settingApi";
import {
  fetchCompositeItems,
  fetchCompositeItem,
  type CompositeItemRecord,
} from "../../../../core/services/compositeItemApi";
import {
  fetchItemStock,
} from "../../../../core/services/itemApi";
import {
  fetchNextAssemblyNumber,
  storeAssembly,
} from "../../../../core/services/assemblyApi";
import { bustAllAssemblyCache } from "../../../../core/cache/assemblyCache";
import { emitMutation } from "../../../../core/cache/mutationEvents";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PanelRect {
  top: number; bottom: number; left: number; width: number; spaceBelow: number;
}

interface AssemblyRow {
  id:                 number;
  item_id:            number | null;
  item_name:          string;
  item_image:         string | null;
  item_unit:          string | null;
  item_description:   string;
  quantity:           string;
  cost_price:         string;
  available_for_sale: string | null;
}

// ─── Composite item inline search dropdown ────────────────────────────────────

interface CompositeDropdownProps {
  value: string;
  onChange: (item: CompositeItemRecord) => void;
}

const CompositeDropdown = ({ value, onChange }: CompositeDropdownProps) => {
  const [open,      setOpen]      = useState(false);
  const [search,    setSearch]    = useState("");
  const [results,   setResults]   = useState<CompositeItemRecord[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [panelRect, setPanelRect] = useState<PanelRect | null>(null);

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
    fetchCompositeItems({ search: q, composite_type: "assembly", per_page: 20 })
      .then(res => {
        setResults(res.success ? (res as any).data as CompositeItemRecord[] : []);
        setLoading(false);
      })
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

  const dropUp = panelRect ? panelRect.spaceBelow < 240 : false;
  const panelStyle: React.CSSProperties = panelRect
    ? { position: "fixed", left: panelRect.left, width: panelRect.width, zIndex: 9999, ...(dropUp ? { bottom: panelRect.bottom, top: "auto" } : { top: panelRect.top + 4, bottom: "auto" }) }
    : { display: "none" };

  const select = (item: CompositeItemRecord) => {
    onChange(item); setOpen(false); setSearch(""); abortRef.current?.abort();
  };

  return (
    <div ref={wrapRef} className="position-relative">
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Select Composite Item"
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
          <div className="p-2 border-bottom position-relative">
            <input
              autoFocus
              type="text"
              className="form-control"
              placeholder="Search composite items…"
              style={{ height: 42, paddingRight: loading ? 36 : undefined }}
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
          <div style={{ maxHeight: 180, overflowY: "auto", paddingBottom: 8 }}>
            {loading && results.length === 0 ? null : results.length === 0 ? (
              <p className="text-muted fs-15 text-center py-3 mb-0">No results</p>
            ) : results.map(item => {
              const isActive = item.name === value;
              return (
                <div
                  key={item.id}
                  className="px-3 py-2"
                  style={{ cursor: "pointer", background: isActive ? "#E41F07" : "transparent", color: isActive ? "#fff" : "#707070" }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "#E41F07"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "#707070"; }}
                  onClick={() => select(item)}
                >
                  <div className="fs-15 fw-medium">{item.name}</div>
                  {item.sku && (
                    <div className="fs-12" style={{ color: isActive ? "rgba(255,255,255,0.75)" : "#aaa" }}>
                      SKU: {item.sku}
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

// ─── Main component ───────────────────────────────────────────────────────────

const emptyRow = (id: number): AssemblyRow => ({
  id, item_id: null, item_name: "", item_image: null, item_unit: null,
  item_description: "", quantity: "1", cost_price: "0.00", available_for_sale: null,
});

const NewAssembly = () => {
  const navigate = useNavigate();

  const todayISO = new Date().toISOString().split("T")[0];

  // ── Composite item ──────────────────────────────────────────────────────────
  const [selectedItem, setSelectedItem] = useState<CompositeItemRecord | null>(null);
  const [itemName, setItemName]         = useState("");

  // ── Assembly fields ─────────────────────────────────────────────────────────
  const [assemblyNumber, setAssemblyNumber] = useState("");
  const [description, setDescription]       = useState("");
  const [assembledDate, setAssembledDate]   = useState(todayISO);
  const [quantity, setQuantity]             = useState("1");

  // ── Location ────────────────────────────────────────────────────────────────
  const [locationId, setLocationId]           = useState<number | null>(null);
  const [locationOptions, setLocationOptions] = useState<Option[]>([]);

  // ── Assembly rows (Bill of Materials) — auto-populated from composite item ──
  const [assemblyRows, setAssemblyRows] = useState<AssemblyRow[]>([]);
  const rowNextId = useRef(1);
  const [itemImgErrors, setItemImgErrors] = useState<Record<number, boolean>>({});

  const updateRow = useCallback((id: number, field: keyof Omit<AssemblyRow, "id">, value: string | number | null) =>
    setAssemblyRows(p => p.map(r => r.id === id ? { ...r, [field]: value } : r)), []);

  // Fetch full composite item detail → populate rows
  useEffect(() => {
    if (!selectedItem) { setAssemblyRows([]); return; }
    fetchCompositeItem(selectedItem.id).then(res => {
      if (!res.success) return;
      const components = res.data.components ?? [];
      const rows: AssemblyRow[] = components.map((c, i) => ({
        id:                 i + 1,
        item_id:            c.component_item_id,
        item_name:          c.component_item?.name ?? "",
        item_image:         c.component_item?.image ?? null,
        item_unit:          c.component_item?.unit ?? null,
        item_description:   "",
        quantity:           c.quantity,
        cost_price:         c.cost_price ?? c.component_item?.cost_price ?? "0.00",
        available_for_sale: null,
      }));
      rowNextId.current = rows.length + 1;
      setAssemblyRows(rows);
      setItemImgErrors({});
    }).catch(() => {});
  }, [selectedItem]);

  // Refresh available stock when location or rows change
  useEffect(() => {
    if (!locationId || assemblyRows.length === 0) return;
    assemblyRows.forEach(row => {
      if (!row.item_id) return;
      fetchItemStock(row.item_id).then(res => {
        if (!res.success) return;
        const entry = res.data.find(s => s.location_id === locationId);
        updateRow(row.id, "available_for_sale", entry != null ? String(entry.available_for_sale) : null);
      }).catch(() => {});
    });
  }, [locationId, assemblyRows.length]);

  // ── Decimal setting ─────────────────────────────────────────────────────────
  const [decimalRate, setDecimalRate] = useState(2);
  useEffect(() => {
    getSettings<ProductConfiguration>("products")
      .then(data => setDecimalRate(data.decimal_rate ?? 2))
      .catch(() => {});
  }, []);

  // ── Submission state ────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);

  // ── Toast state ─────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger"; message: string }>({ show: false, type: "success", message: "" });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (type: "success" | "danger", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // ── Load assembly number on mount ───────────────────────────────────────────
  useEffect(() => {
    fetchNextAssemblyNumber().then(res => {
      if (res.success) setAssemblyNumber((res.data as { assembly_number: string }).assembly_number);
    }).catch(() => {});
  }, []);

  // ── Load locations ──────────────────────────────────────────────────────────
  useEffect(() => {
    getLocationList().then(locs => {
      const active = locs.filter(l => l.is_active);
      setLocationOptions(active.map(l => ({ value: String(l.id), label: l.name })));
      const primary = active.find(l => l.is_primary) ?? active[0];
      if (primary) setLocationId(primary.id);
    }).catch(() => {});
  }, []);

  const fieldDisabled = !selectedItem;
  const assemblyQty   = parseFloat(quantity) || 1;

  const handleAssemble = async () => {
    if (!selectedItem)  { showToast("danger", "Please select a composite item."); return; }
    if (!locationId)    { showToast("danger", "Please select a location."); return; }
    if (!assembledDate) { showToast("danger", "Please enter the assembled date."); return; }
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) { showToast("danger", "Quantity to assemble must be greater than zero."); return; }
    if (assemblyRows.filter(r => r.item_id !== null).length === 0) {
      showToast("danger", "No component items found. Select a composite item with components.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await storeAssembly({
        composite_item_id:    selectedItem.id,
        location_id:          locationId,
        assembled_date:       assembledDate,
        quantity_to_assemble: qty,
        description:          description || null,
        items: assemblyRows
          .filter(r => r.item_id !== null)
          .map(r => ({
            item_id:           r.item_id!,
            item_name:         r.item_name,
            item_unit:         r.item_unit ?? null,
            quantity_required: parseFloat(r.quantity) || 0,
            total_quantity:    (parseFloat(r.quantity) || 0) * qty,
            cost_price:        parseFloat(r.cost_price) || 0,
          })),
      });

      if (res.success) {
        bustAllAssemblyCache();
        emitMutation("assemblies:mutated");
        showToast("success", "Assembly saved successfully.");
        setTimeout(() => navigate("/assemblies"), 1200);
      } else {
        showToast("danger", res.message || "Failed to save assembly.");
      }
    } catch {
      showToast("danger", "Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Max assemblable units = min(available ÷ qty_required) across all components
  const maxAssemblable = (() => {
    if (assemblyRows.length === 0) return null;
    if (assemblyRows.some(r => r.available_for_sale === null)) return null; // still loading
    const values = assemblyRows.map(r => {
      const avail = parseFloat(r.available_for_sale ?? "0") || 0;
      const qty   = parseFloat(r.quantity) || 1;
      return avail / qty;
    });
    return Math.min(...values);
  })();


  return (
    <>
      <div className="page-wrapper">
        <div className="content">

          <PageHeader
            title="New Assembly"
            showModuleTile={false}
            showExport={false}
            showClose
            onClose={() => navigate(-1)}
          />

          <div className="card mb-0">
            <div className="card-body p-4">

              {/* ── Composite Item ─────────────────────────────────────────── */}
              <div className="mb-4" style={{ width: "50%" }}>
                <label className="form-label fw-medium fs-14 text-danger">
                  Composite Item <span>*</span>
                </label>
                <CompositeDropdown
                  value={itemName}
                  onChange={item => { setSelectedItem(item); setItemName(item.name); }}
                />
              </div>

              {/* ── Assembly Details ───────────────────────────────────────── */}
              <div
                className="border-top pt-4 mb-4"
                style={fieldDisabled ? { opacity: 0.45, pointerEvents: "none" } : undefined}
              >

                {/* Assembly # */}
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-2 col-form-label fw-medium fs-14">Assembly #</label>
                  <div className="col-sm-4">
                    <div className="input-group">
                      <input
                        className="form-control bg-light"
                        value={assemblyNumber}
                        readOnly
                        placeholder="Auto-generated"
                        style={{ cursor: "default" }}
                      />
                      <span className="input-group-text bg-light text-muted" title="Auto-generated">
                        <i className="ti ti-settings fs-14" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="row mb-3 align-items-start">
                  <label className="col-sm-2 col-form-label fw-medium fs-14">Description</label>
                  <div className="col-sm-4">
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Enter description"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                    />
                  </div>
                </div>

                {/* Assembled Date */}
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-2 col-form-label text-danger fw-medium fs-14">
                    Assembled Date <span>*</span>
                  </label>
                  <div className="col-sm-4">
                    <CommonDatePicker
                      value={assembledDate ? dayjs(assembledDate) : null}
                      onChange={date => setAssembledDate(date ? date.format("YYYY-MM-DD") : "")}
                      format="DD/MM/YYYY"
                      placeholder="DD/MM/YYYY"
                    />
                  </div>
                </div>

                {/* Quantity to Assemble */}
                <div className="row mb-3 align-items-start">
                  <label className="col-sm-2 col-form-label text-danger fw-medium fs-14">
                    Quantity to Assemble <span>*</span>
                  </label>
                  <div className="col-sm-4">
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      step="1"
                      value={quantity}
                      onChange={e => setQuantity(e.target.value)}
                    />
                    {selectedItem && (
                      <small className="mt-1 d-block fs-12">
                        {!locationId
                          ? <span className="text-muted">Select a location to see how many units you can assemble.</span>
                          : maxAssemblable === null
                          ? <span className="text-muted">Calculating available stock…</span>
                          : <span className={maxAssemblable <= 0 ? "text-danger" : "text-muted"}>
                              You can assemble <strong>{maxAssemblable.toFixed(decimalRate)}</strong> unit{maxAssemblable !== 1 ? "s" : ""} from the available stock.
                            </span>
                        }
                      </small>
                    )}
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
                      onChange={opt => {
                        const o = opt as Option | null;
                        setLocationId(o ? Number(o.value) : null);
                      }}
                      placeholder="Add Location"
                    />
                  </div>
                </div>

                <hr className="mt-1 mb-0" />

              </div>

              {/* ── Associated Items Table ─────────────────────────────────── */}
              <div
                className="pt-4 mb-4"
                style={fieldDisabled ? { opacity: 0.45, pointerEvents: "none" } : undefined}
              >
                {/* Section label */}
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="fw-semibold fs-14 text-danger">Associated Items <span>*</span></span>
                </div>

                {/* Table */}
                <div style={{ overflowX: "auto" }}>
                  <div className="border rounded overflow-hidden" style={{ minWidth: 780 }}>

                    {/* Header */}
                    <div className="d-flex align-items-stretch border-bottom" style={{ background: "#f8f9fa" }}>
                      <div className="d-none d-sm-flex align-items-center px-3 py-2" style={{ width: 80, flexShrink: 0, borderRight: "1px solid #dee2e6" }}>
                        <span className="fw-semibold fs-12 text-uppercase">Image</span>
                      </div>
                      <div className="d-flex align-items-center px-3 py-2" style={{ flex: 1, borderRight: "1px solid #dee2e6" }}>
                        <span className="fw-semibold fs-12 text-uppercase">Item Details</span>
                      </div>
                      <div className="d-flex align-items-center px-3 py-2" style={{ width: 170, flexShrink: 0, borderRight: "1px solid #dee2e6" }}>
                        <span className="fw-semibold fs-12 text-uppercase">Quantity Required</span>
                      </div>
                      <div className="d-flex align-items-center px-3 py-2" style={{ width: 170, flexShrink: 0, borderRight: "1px solid #dee2e6" }}>
                        <span className="fw-semibold fs-12 text-uppercase">Total Qty Required</span>
                      </div>
                      <div className="d-flex align-items-center px-3 py-2" style={{ width: 160, flexShrink: 0 }}>
                        <span className="fw-semibold fs-12 text-uppercase">Quantity Available</span>
                      </div>
                    </div>

                    {/* Empty state */}
                    {assemblyRows.length === 0 && (
                      <div className="text-center py-5 text-muted">
                        <i className="ti ti-box-off fs-36 d-block mb-2" />
                        <p className="fs-14 mb-0">Select a composite item to load its associated components.</p>
                      </div>
                    )}

                    {/* Rows */}
                    {assemblyRows.map(row => {
                      const qtyRequired  = parseFloat(row.quantity) || 0;
                      const totalQty     = qtyRequired * assemblyQty;
                      const available    = row.available_for_sale !== null ? parseFloat(row.available_for_sale) : null;
                      const insufficient = available !== null && available < totalQty;

                      return (
                        <React.Fragment key={row.id}>

                          {/* Main row */}
                          <div className="d-flex align-items-stretch border-bottom">

                            {/* Image */}
                            <div className="d-none d-sm-flex align-items-center justify-content-center" style={{ width: 80, flexShrink: 0, borderRight: "1px solid #dee2e6", padding: 12 }}>
                              <div
                                className="border rounded d-flex align-items-center justify-content-center overflow-hidden"
                                style={{ width: 56, height: 56, background: "#f8f9fa" }}
                              >
                                {row.item_image && !itemImgErrors[row.id] ? (
                                  <img
                                    src={row.item_image}
                                    alt=""
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    onError={() => setItemImgErrors(p => ({ ...p, [row.id]: true }))}
                                  />
                                ) : (
                                  <i className="ti ti-photo text-muted" style={{ fontSize: 22 }} />
                                )}
                              </div>
                            </div>

                            {/* Item name — read-only */}
                            <div
                              className="d-flex flex-column justify-content-center"
                              style={{ flex: 1, borderRight: "1px solid #dee2e6", padding: 12 }}
                            >
                              <div className="fw-medium fs-15">{row.item_name || <span className="text-muted">—</span>}</div>
                              {row.item_unit && <div className="fs-12 text-muted mt-1">{row.item_unit}</div>}
                            </div>

                            {/* Quantity Required */}
                            <div
                              className="d-flex flex-column justify-content-center align-items-end"
                              style={{ width: 170, flexShrink: 0, borderRight: "1px solid #dee2e6", padding: "14px 16px" }}
                            >
                              <span className="fs-15 fw-medium">
                                {(parseFloat(row.quantity) || 0).toFixed(decimalRate)}
                              </span>
                              <span className="fs-12 text-muted mt-1">x {assemblyQty} assemblies</span>
                            </div>

                            {/* Total Qty Required */}
                            <div
                              className="d-flex flex-column justify-content-center align-items-end"
                              style={{ width: 170, flexShrink: 0, borderRight: "1px solid #dee2e6", padding: "14px 16px" }}
                            >
                              <span className="fs-15 fw-medium">{totalQty.toFixed(decimalRate)}</span>
                              {insufficient && (
                                <i className="ti ti-alert-triangle fs-16 mt-1 text-danger" />
                              )}
                            </div>

                            {/* Quantity Available */}
                            <div
                              className="d-flex flex-column justify-content-center align-items-end"
                              style={{ width: 160, flexShrink: 0, padding: "14px 16px" }}
                            >
                              {row.available_for_sale !== null ? (
                                <span className="fs-15" style={{ color: insufficient ? "#E41F07" : "#374151" }}>
                                  {(parseFloat(row.available_for_sale) || 0).toFixed(decimalRate)}{row.item_unit ? ` ${row.item_unit}` : ""}
                                </span>
                              ) : (
                                <span className="text-muted fs-14">—</span>
                              )}
                            </div>

                          </div>

                          {/* Cost Price sub-row */}
                          <div
                            className="d-flex align-items-center border-bottom px-3 py-2"
                            style={{ background: "#fafafa" }}
                          >
                            <i className="ti ti-tag fs-13 me-1 text-danger" />
                            <span className="fs-12 text-muted me-1">Cost Price :</span>
                            <span className="fs-12 fw-medium text-danger">
                              {row.cost_price && parseFloat(row.cost_price) > 0
                                ? `₹${parseFloat(row.cost_price).toFixed(decimalRate)}`
                                : "—"}
                            </span>
                          </div>

                        </React.Fragment>
                      );
                    })}


                  </div>
                </div>
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
            onClick={handleAssemble}
            disabled={submitting}
          >
            {submitting ? "Assembling…" : "Assemble"}
          </button>

          <button type="button" className="btn btn-outline-light" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>

        <Footer />
      </div>

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

export default NewAssembly;
