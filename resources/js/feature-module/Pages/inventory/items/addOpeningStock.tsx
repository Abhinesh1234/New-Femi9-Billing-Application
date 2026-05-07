import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate, useParams } from "react-router";
import { Toast } from "react-bootstrap";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import type { LocationListItem } from "../../../../core/services/locationApi";
import { getLocationList } from "../../../../core/cache/locationCache";
import { readItemDetail, getItemDetail, bustItem } from "../../../../core/cache/itemCache";
import { emitMutation } from "../../../../core/cache/mutationEvents";
import { fetchOpeningStock, saveOpeningStock } from "../../../../core/services/openingStockApi";

interface StockRow {
  id: number;
  location_id: number | null;
  location_name: string;
  opening_stock: string;
  opening_stock_value: string;
  locked: boolean;
}

interface RowError {
  location_id?: string;
  opening_stock?: string;
  opening_stock_value?: string;
}

let _nextRowId = 1;

// ── Location dropdown ─────────────────────────────────────────────────────────
interface LocationFieldProps {
  value: string;
  onChange: (name: string, id: number) => void;
  locations: LocationListItem[];
  error?: string;
  disabledIds?: number[];
}

const LocationField = ({ value, onChange, locations, error, disabledIds = [] }: LocationFieldProps) => {
  const [open, setOpen]           = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const [search, setSearch]       = useState("");
  const wrapRef   = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const listRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const calcPosition = () => {
    if (!wrapRef.current) return;
    const rect       = wrapRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropHeight = 240;
    if (spaceBelow < dropHeight) {
      setMenuStyle({ position: "fixed", bottom: window.innerHeight - rect.top + 4, top: "auto", left: rect.left, width: rect.width, zIndex: 9999 });
    } else {
      setMenuStyle({ position: "fixed", top: rect.bottom + 4, left: rect.left, width: rect.width, zIndex: 9999 });
    }
  };

  const toggle = () => {
    if (!open) calcPosition();
    setOpen((o) => !o);
    setSearch("");
  };

  // Keep dropdown anchored to trigger while scrolling/resizing
  useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", calcPosition, true);
    window.addEventListener("resize", calcPosition);
    return () => {
      window.removeEventListener("scroll", calcPosition, true);
      window.removeEventListener("resize", calcPosition);
    };
  }, [open]);

  useEffect(() => {
    if (open && activeRef.current && listRef.current) {
      const list = listRef.current;
      const item = activeRef.current;
      const itemTop    = item.offsetTop;
      const itemBottom = itemTop + item.offsetHeight;
      const listHeight = list.clientHeight;
      if (itemTop < list.scrollTop || itemBottom > list.scrollTop + listHeight) {
        list.scrollTop = itemTop - listHeight / 2 + item.offsetHeight / 2;
      }
    }
  }, [open]);

  const filtered = locations.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  const select = (loc: LocationListItem) => {
    onChange(loc.name, loc.id);
    setOpen(false);
    setSearch("");
  };

  const menu = open ? ReactDOM.createPortal(
    <div
      className="bg-white border rounded shadow-sm"
      style={menuStyle}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="p-2 border-bottom">
        <input
          autoFocus
          type="text"
          className="form-control fs-14"
          style={{ height: 42 }}
          placeholder="Search locations…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div ref={listRef} style={{ maxHeight: 180, overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <p className="text-muted fs-13 text-center py-2 mb-0">No results</p>
        ) : (
          filtered.map((loc) => {
            const isActive   = loc.name === value;
            const isDisabled = disabledIds.includes(loc.id);
            return (
              <div
                key={loc.id}
                ref={isActive ? activeRef : undefined}
                className="px-3 py-2 fs-15 d-flex align-items-center justify-content-between"
                style={{
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  background: isActive ? "#E41F07" : "transparent",
                  color: isActive ? "#fff" : isDisabled ? "#bbb" : "#707070",
                  opacity: isDisabled ? 0.6 : 1,
                }}
                onMouseEnter={(e) => { if (!isActive && !isDisabled) e.currentTarget.style.color = "#E41F07"; }}
                onMouseLeave={(e) => { if (!isActive && !isDisabled) e.currentTarget.style.color = "#707070"; }}
                onClick={() => { if (!isDisabled) select(loc); }}
              >
                <span>{loc.name}</span>
                {isDisabled && <span className="fs-11 text-muted ms-2">Already used</span>}
              </div>
            );
          })
        )}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div ref={wrapRef}>
      <div className={`input-group${error ? " is-invalid" : ""}`}>
        <input
          type="text"
          className={`form-control${error ? " is-invalid" : ""}`}
          placeholder="Select Location"
          value={value}
          readOnly
          style={{ cursor: "pointer" }}
          onClick={toggle}
        />
        <button type="button" className="btn btn-outline-light" onClick={toggle}>
          <i className={`ti ti-chevron-${open ? "up" : "down"}`} />
        </button>
      </div>
      {error && <div className="invalid-feedback d-block">{error}</div>}
      {menu}
    </div>
  );
};

// ── Validation ────────────────────────────────────────────────────────────────
function validateRows(rows: StockRow[]): { errors: Record<number, RowError>; valid: boolean } {
  const errors: Record<number, RowError> = {};
  const seenLocations = new Set<number>();
  let valid = true;

  rows.forEach((row) => {
    const rowErr: RowError = {};

    if (!row.location_id) {
      rowErr.location_id = "Please select a location.";
      valid = false;
    } else if (seenLocations.has(row.location_id)) {
      rowErr.location_id = "Each location can only appear once.";
      valid = false;
    } else {
      seenLocations.add(row.location_id);
    }

    const qty = row.opening_stock.trim();
    if (qty === "") {
      rowErr.opening_stock = "Required.";
      valid = false;
    } else if (isNaN(Number(qty)) || Number(qty) < 0) {
      rowErr.opening_stock = "Must be a non-negative number.";
      valid = false;
    }

    const val = row.opening_stock_value.trim();
    if (val === "") {
      rowErr.opening_stock_value = "Required.";
      valid = false;
    } else if (isNaN(Number(val)) || Number(val) < 0) {
      rowErr.opening_stock_value = "Must be a non-negative number.";
      valid = false;
    }

    if (Object.keys(rowErr).length > 0) errors[row.id] = rowErr;
  });

  return { errors, valid };
}

// ── Main component ────────────────────────────────────────────────────────────
const AddOpeningStock = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [itemName, setItemName]     = useState<string>("");
  const [locations, setLocations]   = useState<LocationListItem[]>([]);
  const [rows, setRows]             = useState<StockRow[]>([]);
  const [rowErrors, setRowErrors]   = useState<Record<number, RowError>>({});
  const [saving, setSaving]         = useState(false);
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState<string | null>(null);

  const loadRef = useRef(0);

  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger"; message: string }>({ show: false, type: "success", message: "" });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (type: "success" | "danger", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // ── Cache-first data load (item name + locations + existing stock) ──────────
  useEffect(() => {
    const numId = Number(id);
    if (!id || isNaN(numId) || numId <= 0) {
      setLoadError("Invalid item ID.");
      setLoading(false);
      return;
    }

    const token = ++loadRef.current;
    setLoading(true);
    setLoadError(null);

    // Sync cache hit for item name — avoid empty flash
    const cachedItem = readItemDetail(numId);
    if (cachedItem) setItemName(cachedItem.name ?? "");

    Promise.all([
      getItemDetail(numId).catch(() => null),
      getLocationList().catch(() => [] as LocationListItem[]),
      fetchOpeningStock(numId),
    ]).then(([itemData, allLocs, stockRes]) => {
      if (token !== loadRef.current) return;

      // Item name (fallback if not already set from sync cache)
      if (itemData && !cachedItem) setItemName((itemData as any).name ?? "");

      // Active locations only — locked locations still show even if inactive
      const locs = allLocs.filter((l) => l.is_active !== false);

      if (locs.length === 0) {
        setLoadError("No active locations found. Please add an active location first.");
        setLoading(false);
        return;
      }
      setLocations(locs);

      // Pre-populate from existing saved stock, or default to first row
      if (stockRes.success && Array.isArray((stockRes as any).data) && (stockRes as any).data.length > 0) {
        const existing = (stockRes as any).data as {
          location_id: number; location_name: string;
          opening_stock: number; opening_stock_value: number;
        }[];
        setRows(existing.map((e) => ({
          id: _nextRowId++,
          location_id: e.location_id,
          location_name: e.location_name,
          opening_stock: String(e.opening_stock),
          opening_stock_value: String(e.opening_stock_value),
          locked: true,
        })));
      } else {
        const primary = locs.find((l) => !!l.is_primary) ?? locs[0];
        setRows([{
          id: _nextRowId++,
          location_id: primary?.id ?? null,
          location_name: primary?.name ?? "",
          opening_stock: "",
          opening_stock_value: "",
          locked: false,
        }]);
      }

      setLoading(false);
    }).catch(() => {
      if (token !== loadRef.current) return;
      setLoadError("Failed to load page data. Please refresh and try again.");
      setLoading(false);
    });
  }, [id]);

  const updateRow = (rowId: number, field: keyof StockRow, val: any) => {
    setRows((prev) => prev.map((r) => r.id === rowId ? { ...r, [field]: val } : r));
    // Clear field error on change
    if (rowErrors[rowId]) {
      setRowErrors((prev) => {
        const updated = { ...prev };
        if (updated[rowId]) {
          delete (updated[rowId] as any)[field];
          if (Object.keys(updated[rowId]).length === 0) delete updated[rowId];
        }
        return updated;
      });
    }
  };

  const copyStockToAll = () => {
    const first = rows[0]?.opening_stock ?? "";
    setRows((prev) => prev.map((r) => ({ ...r, opening_stock: first })));
  };

  const copyValueToAll = () => {
    const first = rows[0]?.opening_stock_value ?? "";
    setRows((prev) => prev.map((r) => ({ ...r, opening_stock_value: first })));
  };

  const handleSave = async () => {
    const numId   = Number(id);
    const newRows = rows.filter((r) => !r.locked);
    if (newRows.length === 0) return;

    const { errors, valid } = validateRows(newRows);
    setRowErrors(errors);
    if (!valid) return;

    setSaving(true);
    try {
      const result = await saveOpeningStock(numId, {
        entries: newRows.map((r) => ({
          location_id: r.location_id!,
          opening_stock: Number(r.opening_stock),
          opening_stock_value: Number(r.opening_stock_value),
        })),
      });

      if (result.success) {
        // Invalidate item cache so overview/list pages reflect the new stock
        bustItem(numId);
        emitMutation("items:mutated");
        navigate(`/items/${id}`, { state: { tab: "locations" } });
        return;
      }

      showToast("danger", (result as any).message ?? "Failed to save opening stock.");

      // Map server-side field errors back to row IDs
      const serverErrors = (result as any).errors as Record<string, string[]> | undefined;
      if (serverErrors) {
        const mapped: Record<number, RowError> = {};
        Object.entries(serverErrors).forEach(([key, msgs]) => {
          const match = key.match(/^entries\.(\d+)\.(\w+)$/);
          if (match) {
            const idx   = parseInt(match[1], 10);
            const field = match[2] as keyof RowError;
            const row   = newRows[idx];
            if (row) {
              if (!mapped[row.id]) mapped[row.id] = {};
              mapped[row.id][field] = msgs[0];
            }
          }
        });
        if (Object.keys(mapped).length > 0) setRowErrors(mapped);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">

        <PageHeader
          title="Add Opening Stock"
          moduleTitle="Items"
          showModuleTile={true}
          showClose={true}
          onClose={() => navigate(`/items/${id}`)}
        />

        <div className="card border-0 rounded-0">
          <div className="card-body">

            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
              <span className="btn btn-outline-light px-2 fs-16 fw-bold border-0">{itemName || "—"}</span>
            </div>

            {loading ? (
              <div className="text-center py-4 text-muted fs-14">Loading…</div>
            ) : loadError ? (
              <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center">
                <i className="ti ti-alert-circle fs-36 text-danger mb-2" />
                <p className="fs-14 text-muted mb-3">{loadError}</p>
                <button
                  type="button"
                  className="btn btn-outline-light btn-sm"
                  onClick={() => navigate(`/items/${id}`)}
                >
                  Back to Item
                </button>
              </div>
            ) : (
              <>
                <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" as any }}>
                  <div className="border rounded" style={{ minWidth: 540 }}>

                    {/* Header */}
                    <div className="d-flex align-items-start px-3 py-2 border-bottom" style={{ background: "#f8f9fa", gap: 12, borderRadius: "6px 6px 0 0" }}>
                      <div style={{ flex: 3 }}>
                        <span className="fw-semibold fs-12 text-uppercase">Location</span>
                      </div>
                      <div style={{ flex: 2 }}>
                        <span className="fw-semibold fs-12 text-uppercase">Opening Stock</span>
                        {rows.filter((r) => !r.locked).length > 1 && (
                          <div>
                            <button type="button" className="btn btn-link p-0 fs-12 text-danger mt-1" style={{ textDecoration: "none" }} onClick={copyStockToAll}>
                              Copy to All
                            </button>
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 2 }}>
                        <span className="fw-semibold fs-12 text-uppercase">Opening Stock Value Per Unit</span>
                        {rows.filter((r) => !r.locked).length > 1 && (
                          <div>
                            <button type="button" className="btn btn-link p-0 fs-12 text-danger mt-1" style={{ textDecoration: "none" }} onClick={copyValueToAll}>
                              Copy to All
                            </button>
                          </div>
                        )}
                      </div>
                      <div style={{ width: 40, flexShrink: 0 }} />
                    </div>

                    {/* Rows */}
                    {(() => {
                      // Locked rows' IDs + other unlocked rows' IDs are disabled per-row
                      const lockedIds    = rows.filter((r) => r.locked && r.location_id).map((r) => r.location_id!);
                      const unlockedCount = rows.filter((r) => !r.locked).length;
                      return rows.map((row) => {
                        const err = rowErrors[row.id] ?? {};
                        if (row.locked) {
                          return (
                            <div key={row.id} className="d-flex align-items-center px-3 py-3 border-bottom" style={{ gap: 12, background: "#f8f9fa" }}>
                              <div style={{ flex: 3 }} className="d-flex align-items-center gap-2">
                                <i className="ti ti-lock fs-14 text-muted" />
                                <span className="fs-14 text-body">{row.location_name}</span>
                              </div>
                              <div style={{ flex: 2 }}>
                                <span className="fs-14 text-body">{row.opening_stock}</span>
                              </div>
                              <div style={{ flex: 2 }}>
                                <span className="fs-14 text-body">{row.opening_stock_value}</span>
                              </div>
                              <div style={{ width: 40, flexShrink: 0 }} />
                            </div>
                          );
                        }

                        // Disable locked IDs + every other unlocked row's selected location
                        const otherUnlockedIds = rows
                          .filter((r) => !r.locked && r.id !== row.id && r.location_id !== null)
                          .map((r) => r.location_id!);
                        const disabledIds = [...lockedIds, ...otherUnlockedIds];

                        return (
                          <div key={row.id} className="d-flex align-items-start px-3 py-3 border-bottom" style={{ gap: 12 }}>
                            <div style={{ flex: 3 }}>
                              <LocationField
                                value={row.location_name}
                                locations={locations}
                                error={err.location_id}
                                disabledIds={disabledIds}
                                onChange={(name, locId) => {
                                  setRows((prev) => prev.map((r) =>
                                    r.id === row.id ? { ...r, location_id: locId, location_name: name } : r
                                  ));
                                  if (rowErrors[row.id]?.location_id) {
                                    setRowErrors((prev) => {
                                      const upd = { ...prev };
                                      if (upd[row.id]) {
                                        delete upd[row.id].location_id;
                                        if (Object.keys(upd[row.id]).length === 0) delete upd[row.id];
                                      }
                                      return upd;
                                    });
                                  }
                                }}
                              />
                            </div>
                            <div style={{ flex: 2 }}>
                              <input
                                type="number"
                                className={`form-control${err.opening_stock ? " is-invalid" : ""}`}
                                placeholder="0"
                                min={0}
                                step="any"
                                value={row.opening_stock}
                                onChange={(e) => updateRow(row.id, "opening_stock", e.target.value)}
                              />
                              {err.opening_stock && <div className="invalid-feedback">{err.opening_stock}</div>}
                            </div>
                            <div style={{ flex: 2 }}>
                              <input
                                type="number"
                                className={`form-control${err.opening_stock_value ? " is-invalid" : ""}`}
                                placeholder="0"
                                min={0}
                                step="any"
                                value={row.opening_stock_value}
                                onChange={(e) => updateRow(row.id, "opening_stock_value", e.target.value)}
                              />
                              {err.opening_stock_value && <div className="invalid-feedback">{err.opening_stock_value}</div>}
                            </div>
                            <div style={{ width: 40, flexShrink: 0, display: "flex", justifyContent: "center", paddingTop: 8 }}>
                              <button
                                type="button"
                                className="btn p-0 border-0 bg-transparent text-danger"
                                title="Remove row"
                                disabled={unlockedCount === 1}
                                onClick={() => setRows((prev) => prev.filter((r) => r.id !== row.id))}
                              >
                                <i className="ti ti-trash fs-16" />
                              </button>
                            </div>
                          </div>
                        );
                      });
                    })()}

                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-link p-0 text-primary fs-13 d-flex align-items-center gap-1 mt-3"
                  style={{ textDecoration: "none" }}
                  onClick={() => {
                    setRows((prev) => [...prev, {
                      id: _nextRowId++,
                      location_id: null,
                      location_name: "",
                      opening_stock: "",
                      opening_stock_value: "",
                      locked: false,
                    }]);
                  }}
                >
                  <i className="ti ti-circle-plus" />
                  Add Row
                </button>
              </>
            )}

          </div>
        </div>

      </div>

      {/* ── Sticky bottom bar ─────────────────────────────────────────────────── */}
      <div
        className="bg-white border-top d-flex align-items-center gap-2 px-4"
        style={{ position: "sticky", bottom: 0, zIndex: 100, height: 60 }}
      >
        <button
          type="button"
          className="btn btn-danger me-2"
          disabled={saving || loading || !!loadError || rows.every((r) => r.locked)}
          onClick={handleSave}
        >
          {saving ? (
            <><span className="spinner-border spinner-border-sm me-1" role="status" />Saving…</>
          ) : "Save"}
        </button>
        <button
          type="button"
          className="btn btn-outline-light"
          disabled={saving}
          onClick={() => navigate(`/items/${id}`)}
        >
          Cancel
        </button>
      </div>

      {/* ── Toast ─────────────────────────────────────────────────────────────── */}
      <div
        role="region"
        aria-live="polite"
        aria-atomic="true"
        className="position-fixed top-0 start-50 translate-middle-x pt-4"
        style={{ zIndex: 9999, pointerEvents: "none" }}
      >
        <Toast
          show={toast.show}
          onClose={() => setToast((t) => ({ ...t, show: false }))}
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

      <Footer />
    </div>
  );
};

export default AddOpeningStock;
