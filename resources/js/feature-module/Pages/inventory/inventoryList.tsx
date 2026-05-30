import React, { useCallback, useEffect, useMemo, useRef, useState, type ThHTMLAttributes } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import dayjs from "dayjs";
import Footer from "../../../components/footer/footer";
import PageHeader from "../../../components/page-header/pageHeader";
import SearchInput from "../../../components/dataTable/dataTableSearch";
import Datatable from "../../../components/dataTable";
import CommonDatePicker from "../../../components/common-datePicker/commonDatePicker";
import { getLocationList, bustLocationLists } from "../../../core/cache/locationCache";
import { searchParties, type PartySearchResult } from "../../../core/services/partyApi";
import { fetchLocations } from "../../../core/services/locationApi";
import { fetchInventorySummary } from "../../../core/services/inventoryApi";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface InventoryRow {
  item_id:            number;
  item_name:          string;
  sku:                string | null;
  unit:               string | null;
  image:              string | null;
  stock_on_hand:      number;
  committed:          number;
  available_for_sale: number;
}

// ─── Customer filter (same pattern as InlineDropdown in newInvoice) ──────────
interface CustomerFilterProps {
  value:    PartySearchResult;
  onChange: (party: PartySearchResult | null) => void;
}

const CustomerFilter = ({ value, onChange }: CustomerFilterProps) => {
  const [open,       setOpen]       = useState(false);
  const [search,     setSearch]     = useState("");
  const [results,    setResults]    = useState<PartySearchResult[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [panelRect,  setPanelRect]  = useState<{ top: number; bottom: number; left: number; width: number; spaceBelow: number } | null>(null);

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
        abortRef.current?.abort();
        setOpen(false);
        setSearch("");
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
    ? { position: "fixed", left: panelRect.left, width: Math.max(panelRect.width, 280), zIndex: 9999, ...(dropUp ? { bottom: panelRect.bottom, top: "auto" } : { top: panelRect.top + 4, bottom: "auto" }) }
    : { display: "none" };

  const select = (party: PartySearchResult | null) => {
    onChange(party);
    setOpen(false);
    setSearch("");
    abortRef.current?.abort();
  };

  return (
    <div ref={wrapRef} style={{ minWidth: 220 }}>
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          value={value?.name ?? "Company"}
          readOnly
          style={{ cursor: "pointer" }}
          onClick={toggle}
        />
        {value && value.id !== 0 && (
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
              placeholder="Search companies…"
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
              style={{ cursor: "pointer", background: value?.id === 0 ? "#E41F07" : "transparent", color: value?.id === 0 ? "#fff" : "#707070" }}
              onMouseEnter={e => { if (value?.id !== 0) e.currentTarget.style.color = "#E41F07"; }}
              onMouseLeave={e => { if (value?.id !== 0) e.currentTarget.style.color = "#707070"; }}
              onClick={() => select(COMPANY)}
            >
              <div className="fs-15 fw-medium">Company</div>
            </div>
            {loading && results.length === 0 ? null : results.length === 0 && search.trim() ? (
              <p className="text-muted fs-15 text-center py-3 mb-0">No results</p>
            ) : results.map(p => {
              const isActive = value?.id === p.id;
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

// Company sentinel — id=0 means "the organisation itself" (not a party)
const COMPANY: PartySearchResult = { id: 0, name: "Company", mobile: null, category: null, category_id: null };

interface FilterLocation { id: number; name: string; }

const VIEW_LS_KEY = "femi9_inventory_view";

// ─── Column widths ────────────────────────────────────────────────────────────
const DEFAULT_COL_WIDTHS: Record<string, number> = {
  name:              280,
  sku:               160,
  unit:              120,
  stock_on_hand:     180,
  committed:         160,
};
const COL_WIDTHS_LS_KEY = "femi9_inventory_col_widths";

// ─── Resizable column header ──────────────────────────────────────────────────
interface ResizableTitleProps extends ThHTMLAttributes<HTMLTableCellElement> {
  onResize?:     (key: string, width: number) => void;
  colKey?:       string;
  currentWidth?: number;
  handleSide?:   "left" | "right";
}

function ResizableTitle({ onResize, colKey, currentWidth, handleSide = "right", ...restProps }: ResizableTitleProps) {
  const thRef      = useRef<HTMLTableCellElement>(null);
  const [handleVisible, setHandleVisible] = useState(false);
  const isDragging = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!onResize || !colKey) return;
    e.preventDefault();
    e.stopPropagation();
    const startX     = e.clientX;
    const startWidth = handleSide === "left"
      ? (currentWidth ?? 130)
      : (thRef.current?.offsetWidth ?? currentWidth ?? 130);
    isDragging.current = true;
    setHandleVisible(true);
    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      onResize(colKey, Math.max(60, startWidth + ev.clientX - startX));
    };
    const onMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor     = "";
      document.body.style.userSelect = "";
      setHandleVisible(false);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.body.style.cursor     = "col-resize";
    document.body.style.userSelect = "none";
  };

  const canResize  = !!onResize && !!colKey;
  const handleEdge = handleSide === "left"
    ? { left: 0, right: "auto" as const }
    : { right: 0, left: "auto" as const };

  return (
    <th ref={thRef} {...restProps} style={{ ...restProps.style, position: "relative", userSelect: "none" }}>
      {restProps.children}
      {canResize && (
        <span
          onMouseDown={handleMouseDown}
          onMouseEnter={() => setHandleVisible(true)}
          onMouseLeave={() => !isDragging.current && setHandleVisible(false)}
          style={{ position: "absolute", top: 0, ...handleEdge, bottom: 0, width: 8, cursor: "col-resize", zIndex: 3, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <span style={{ width: 2, height: handleVisible ? "55%" : 0, background: "var(--bs-primary, #0d6efd)", borderRadius: 2, transition: "height 0.15s ease", pointerEvents: "none", opacity: handleVisible ? 0.7 : 0 }} />
        </span>
      )}
    </th>
  );
}

const TABLE_COMPONENTS = { header: { cell: ResizableTitle } };

const fmtQty = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Main component ───────────────────────────────────────────────────────────
const InventoryList = () => {
  const [searchText,       setSearchText]       = useState("");
  const [view,             setView]             = useState<"list" | "grid">(() => {
    try { return localStorage.getItem(VIEW_LS_KEY) === "grid" ? "grid" : "list"; } catch { return "list"; }
  });
  const [gridPage, setGridPage] = useState(12);
  const [availableLocations, setAvailableLocations] = useState<FilterLocation[]>([]);
  const [selectedLocation,   setSelectedLocation]   = useState<FilterLocation | null>(null);
  const [asOfDate,         setAsOfDate]         = useState(dayjs().format("YYYY-MM-DD"));
  const [rows,             setRows]             = useState<InventoryRow[]>([]);

  // ── Customer filter — defaults to Company sentinel ──
  const [selectedParty, setSelectedParty] = useState<PartySearchResult>(COMPANY);

  const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(COL_WIDTHS_LS_KEY);
      return saved ? { ...DEFAULT_COL_WIDTHS, ...JSON.parse(saved) } : { ...DEFAULT_COL_WIDTHS };
    } catch { return { ...DEFAULT_COL_WIDTHS }; }
  });

  const handleResize = useCallback((key: string, width: number) => {
    setColWidths(prev => {
      const next = { ...prev, [key]: width };
      localStorage.setItem(COL_WIDTHS_LS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleRefresh = useCallback(async () => {
    bustLocationLists();
    if (selectedParty.id === 0) {
      const locs = await getLocationList().catch(() => []);
      setAvailableLocations(locs.map(l => ({ id: l.id, name: l.name })));
    }
    const params: { location_id?: number; as_of_date?: string; party_id?: number } = {};
    if (selectedLocation)     params.location_id = selectedLocation.id;
    if (asOfDate)             params.as_of_date  = asOfDate;
    if (selectedParty.id > 0) params.party_id    = selectedParty.id;
    const res = await fetchInventorySummary(params).catch(() => null);
    if (res?.success) setRows(res.data);
  }, [selectedParty.id, selectedLocation, asOfDate]);

  // ── Load locations based on selected party ──
  useEffect(() => {
    setSelectedLocation(null);
    if (selectedParty.id === 0) {
      // Company: show company-owned stock locations (party_id IS NULL)
      getLocationList()
        .then(locs => setAvailableLocations(locs.map(l => ({ id: l.id, name: l.name }))))
        .catch(() => {});
    } else {
      // Customer: show their auto-created stock location (party_id = customer id)
      fetchLocations({ party_id: selectedParty.id }).then(res => {
        if (res.success) {
          setAvailableLocations(res.data.map(l => ({ id: l.id, name: l.name })));
        }
      }).catch(() => {});
    }
  }, [selectedParty.id]);

  // ── Fetch inventory summary when filters change ──
  useEffect(() => {
    const params: { location_id?: number; as_of_date?: string; party_id?: number } = {};
    if (selectedLocation)       params.location_id = selectedLocation.id;
    if (asOfDate)               params.as_of_date  = asOfDate;
    if (selectedParty.id > 0)   params.party_id    = selectedParty.id;

    fetchInventorySummary(params)
      .then(res => { if (res.success) setRows(res.data); })
      .catch(() => {});
  }, [selectedParty.id, selectedLocation?.id, asOfDate]);

  useEffect(() => { localStorage.setItem(VIEW_LS_KEY, view); }, [view]);
  useEffect(() => { setGridPage(12); }, [selectedLocation?.id, selectedParty.id, asOfDate]);

  const locationLabel = selectedLocation ? selectedLocation.name : "All Locations";

  const filtered = useMemo(() => {
    if (!searchText.trim()) return rows;
    const q = searchText.toLowerCase();
    return rows.filter(r =>
      r.item_name.toLowerCase().includes(q) ||
      (r.sku  ?? "").toLowerCase().includes(q) ||
      (r.unit ?? "").toLowerCase().includes(q),
    );
  }, [rows, searchText]);

  // ─── Table columns ────────────────────────────────────────────────────────
  const columns = useMemo(() => {
    const resizeCell = (key: string) => () => ({
      colKey:       key,
      onResize:     handleResize,
      currentWidth: colWidths[key] ?? DEFAULT_COL_WIDTHS[key] ?? 160,
    });

    const cols: object[] = [
      {
        title:      "Name",
        key:        "item_name",
        dataIndex:  "item_name",
        width:      colWidths["name"] ?? DEFAULT_COL_WIDTHS["name"],
        onHeaderCell: resizeCell("name"),
        render: (_: string, record: InventoryRow) => {
          const img = record.image ? `/storage/${record.image}` : null;
          return (
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded border d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                style={{ width: 36, height: 36, background: "#f5f5f5" }}
              >
                {img
                  ? <img src={img} alt={record.item_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <i className="ti ti-photo text-muted fs-16" />
                }
              </div>
              <Link to={`/items/${record.item_id}`} className="title-name fw-medium">
                {record.item_name}
              </Link>
            </div>
          );
        },
      },
      {
        title:      "SKU",
        key:        "sku",
        dataIndex:  "sku",
        width:      colWidths["sku"] ?? DEFAULT_COL_WIDTHS["sku"],
        onHeaderCell: resizeCell("sku"),
        render: (val: string | null) => <span className="text-muted">{val || "—"}</span>,
      },
      {
        title:      "Unit",
        key:        "unit",
        dataIndex:  "unit",
        width:      colWidths["unit"] ?? DEFAULT_COL_WIDTHS["unit"],
        onHeaderCell: resizeCell("unit"),
        render: (val: string | null) => val ? val : <span className="text-muted">—</span>,
      },
      {
        title:      "Stock on Hand",
        key:        "stock_on_hand",
        dataIndex:  "stock_on_hand",
        width:      colWidths["stock_on_hand"] ?? DEFAULT_COL_WIDTHS["stock_on_hand"],
        onHeaderCell: resizeCell("stock_on_hand"),
        render: (val: number) => fmtQty(val),
      },
      {
        title:      "Committed Stock",
        key:        "committed",
        dataIndex:  "committed",
        width:      colWidths["committed"] ?? DEFAULT_COL_WIDTHS["committed"],
        onHeaderCell: resizeCell("committed"),
        render: (val: number) =>
          val > 0 ? fmtQty(val) : <span className="text-muted">—</span>,
      },
      {
        title:     "Available for Sale",
        key:       "available_for_sale",
        dataIndex: "available_for_sale",
        onHeaderCell: () => ({
          colKey:       "committed",
          onResize:     handleResize,
          currentWidth: colWidths["committed"] ?? DEFAULT_COL_WIDTHS["committed"] ?? 160,
          handleSide:   "left",
        }),
        render: (val: number) => fmtQty(val),
      },
    ];

    return cols;
  }, [colWidths, handleResize]);

  return (
    <>
      <div className="page-wrapper">
        <div className="content">

          <PageHeader
            title="Inventory"
            badgeCount={filtered.length}
            showModuleTile={false}
            showExport={true}
            onRefresh={handleRefresh}
            onExportPdf={() => {}}
            onExportExcel={() => {}}
          />

          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <div className="input-icon input-icon-start position-relative">
                  <span className="input-icon-addon text-dark">
                    <i className="ti ti-search" />
                  </span>
                  <SearchInput value={searchText} onChange={setSearchText} />
                </div>

                {/* Customer filter */}
                <CustomerFilter
                  value={selectedParty}
                  onChange={party => { setSelectedParty(party ?? COMPANY); }}
                />
              </div>
            </div>

            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">

                {/* Left — location filter */}
                <div className="d-flex align-items-center gap-2 flex-wrap">

                  {/* Location */}
                  <div className="dropdown">
                    <Link
                      to="#"
                      className="dropdown-toggle btn btn-outline-light px-2 fs-16 fw-bold border-0"
                      data-bs-toggle="dropdown"
                    >
                      {selectedLocation ? selectedLocation.name : "All Locations"}
                    </Link>
                    <div className="dropdown-menu dropmenu-hover-primary">
                      <ul>
                        <li>
                          <button className="dropdown-item" onClick={() => setSelectedLocation(null)}>
                            <i className="ti ti-layout-list me-1" />All Locations
                          </button>
                        </li>
                        {availableLocations.map(loc => (
                          <li key={loc.id}>
                            <button className="dropdown-item" onClick={() => setSelectedLocation(loc)}>
                              <i className="ti ti-map-pin me-1" />{loc.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                </div>

                {/* Right */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div style={{ minWidth: 160 }}>
                    <CommonDatePicker
                      value={asOfDate ? dayjs(asOfDate) : null}
                      onChange={date => setAsOfDate(date ? date.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"))}
                      format="DD/MM/YYYY"
                      placeholder="As of date"
                      placement="bottomRight"
                    />
                  </div>

                  <div className="d-flex align-items-center shadow rounded border view-icons bg-white">
                    <button
                      type="button"
                      className={`btn btn-sm m-1 px-2 border-0 fs-14${view === "list" ? " active" : ""}`}
                      onClick={() => setView("list")}
                      title="List view"
                    >
                      <i className="ti ti-list-tree" />
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm m-1 px-2 border-0 fs-14${view === "grid" ? " active" : ""}`}
                      onClick={() => { setView("grid"); setGridPage(12); }}
                      title="Grid view"
                    >
                      <i className="ti ti-grid-dots" />
                    </button>
                  </div>
                </div>

              </div>

              {/* ── List view ───────────────────────────────────────── */}
              {view === "list" && (
                <div className="items-custom-table custom-table table-nowrap">
                  <Datatable
                    columns={columns}
                    dataSource={filtered}
                    Selection={false}
                    searchText={searchText}
                    components={TABLE_COMPONENTS}
                    scroll={{ x: "max-content" }}
                    rowKey="item_id"
                  />
                </div>
              )}

              {/* ── Grid view ───────────────────────────────────────── */}
              {view === "grid" && (
                <>
                  {filtered.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="ti ti-box-off fs-40 d-block mb-4 text-muted opacity-50" />
                      <h6 className="fw-semibold mb-2">No Items Found</h6>
                      <p className="text-muted mb-0 fs-14">
                        {searchText ? "No items match your current search." : "No inventory data to display."}
                      </p>
                    </div>
                  ) : (
                    <div className="row">
                      {filtered.slice(0, gridPage).map(item => {
                        const img = item.image ? `/storage/${item.image}` : null;
                        const avail = item.available_for_sale;
                        const low   = avail <= 0;

                        return (
                          <div key={item.item_id} className="col-xxl-3 col-xl-4 col-md-6">
                            <Link to={`/items/${item.item_id}`} style={{ textDecoration: "none" }}>
                              <div className="card border shadow" style={{ cursor: "pointer" }}>
                                <div className="card-body">

                                  {/* Header: SKU badge + stock status */}
                                  <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                                    <span className="badge badge-soft-info">{item.sku || "No SKU"}</span>
                                    <span className={`badge ${low ? "badge-soft-danger" : "badge-soft-success"}`}>
                                      {low ? "Low Stock" : "In Stock"}
                                    </span>
                                  </div>

                                  {/* Title + unit */}
                                  <div className="d-block">
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                      <div>
                                        <h4 className="mb-1 fs-14 fw-semibold text-dark">{item.item_name}</h4>
                                        <p className="fs-13 text-muted mb-0">{item.unit || "—"}</p>
                                      </div>
                                    </div>

                                    {/* Stock figures */}
                                    <div className="mb-3">
                                      <p className="d-flex align-items-center justify-content-between mb-2">
                                        <span className="d-flex align-items-center gap-1 text-muted fs-13">
                                          <i className="ti ti-building-warehouse fs-12" />
                                          Stock on Hand
                                        </span>
                                        <span className="fw-medium fs-13 text-dark">{fmtQty(item.stock_on_hand)}</span>
                                      </p>
                                      <p className="d-flex align-items-center justify-content-between mb-2">
                                        <span className="d-flex align-items-center gap-1 text-muted fs-13">
                                          <i className="ti ti-lock fs-12" />
                                          Committed
                                        </span>
                                        <span className="fw-medium fs-13 text-dark">
                                          {item.committed > 0 ? fmtQty(item.committed) : "—"}
                                        </span>
                                      </p>
                                      <p className="d-flex align-items-center justify-content-between mb-0">
                                        <span className="d-flex align-items-center gap-1 text-muted fs-13">
                                          <i className="ti ti-check fs-12" />
                                          Available
                                        </span>
                                        <span className={`fw-semibold fs-13 ${low ? "text-danger" : "text-success"}`}>
                                          {fmtQty(avail)}
                                        </span>
                                      </p>
                                    </div>
                                  </div>

                                  {/* Footer: image avatar */}
                                  <div className="rounded">
                                    <div className="d-flex align-items-center">
                                      <div className="avatar rounded-circle bg-white border me-2 d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0">
                                        {img
                                          ? <img src={img} alt={item.item_name} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                                          : <i className="ti ti-photo text-muted fs-16" />
                                        }
                                      </div>
                                      <div className="d-flex flex-column">
                                        <span className="d-block text-muted fs-12">Location</span>
                                        <span className="text-default fs-13">{locationLabel}</span>
                                      </div>
                                    </div>
                                  </div>

                                </div>
                              </div>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {filtered.length > gridPage && (
                    <div className="load-btn text-center mt-3">
                      <button type="button" className="btn btn-primary" onClick={() => setGridPage(p => p + 12)}>
                        <i className="ti ti-loader me-1" />Load More
                      </button>
                    </div>
                  )}
                </>
              )}

            </div>
          </div>

        </div>
        <Footer />
      </div>
    </>
  );
};

export default InventoryList;
