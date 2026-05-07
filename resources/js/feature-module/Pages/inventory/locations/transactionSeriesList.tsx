import React, { useCallback, useEffect, useMemo, useRef, useState, type ThHTMLAttributes } from "react";
import { Link, useNavigate } from "react-router";
import { Modal, Toast } from "react-bootstrap";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import Datatable from "../../../../components/dataTable";
import SearchInput from "../../../../components/dataTable/dataTableSearch";
import { all_routes } from "../../../../routes/all_routes";
import { type SeriesItem, type SeriesModule } from "../../../../core/services/seriesApi";
import { readSeriesList, getSeriesList, bustSeriesLists } from "../../../../core/cache/seriesCache";
import { onMutation } from "../../../../core/cache/mutationEvents";
import { exportToExcelFile, exportToPdfPrint } from "../../../../core/utils/exportUtils";

const route = all_routes;

type SeriesFilter = "active" | "deleted";

// ─── Module column map (key → backend module name, in display order) ──────────
const MODULE_COLS = [
  { key: "sales_return",       label: "Sales Return",       module: "Sales Return"      },
  { key: "vendor_payment",     label: "Vendor Payment",     module: "Vendor Payment"    },
  { key: "retainer_invoice",   label: "Retainer Invoice",   module: "Retainer Invoice"  },
  { key: "purchase_order",     label: "Purchase Order",     module: "Purchase Order"    },
  { key: "credit_note",        label: "Credit Note",        module: "Credit Note"       },
  { key: "customer_payment",   label: "Customer Payment",   module: "Customer Payment"  },
  { key: "delivery_challan",   label: "Delivery Challan",   module: "Delivery Challan"  },
  { key: "bill_of_supply",     label: "Bill Of Supply",     module: "Bill Of Supply"    },
  { key: "invoice",            label: "Invoice",            module: "Invoice"           },
  { key: "sales_order",        label: "Sales Order",        module: "Sales Order"       },
  { key: "associated_locations", label: "Associated Locations", module: ""             },
] as const;

type ModuleColKey = typeof MODULE_COLS[number]["key"];

// ─── Column definitions ───────────────────────────────────────────────────────
interface ColDef {
  key:   string;
  label: string;
}

const INITIAL_COLS: ColDef[] = MODULE_COLS.map(({ key, label }) => ({ key, label }));
const DEFAULT_VISIBLE = new Set<string>(INITIAL_COLS.map((c) => c.key));

// ─── Column widths ────────────────────────────────────────────────────────────
const DEFAULT_COL_WIDTHS: Record<string, number> = {
  name:                  240,
  sales_return:          160,
  vendor_payment:        160,
  retainer_invoice:      160,
  purchase_order:        160,
  credit_note:           160,
  customer_payment:      160,
  delivery_challan:      160,
  bill_of_supply:        160,
  invoice:               160,
  sales_order:           160,
  associated_locations:  180,
};

const COL_WIDTHS_LS_KEY  = "femi9_txn_series_col_widths";
const COL_ORDER_LS_KEY   = "femi9_txn_series_col_order";
const COL_VISIBLE_LS_KEY = "femi9_txn_series_col_visible";
const VIEW_LS_KEY        = "femi9_txn_series_view";

// ─── Helper: render prefix + padded current_number for a module ───────────────
function formatModuleNumber(mod: SeriesModule): string {
  const prefix    = mod.prefix ?? "";
  const startLen  = mod.starting_number.length;
  const formatted = String(mod.current_number).padStart(startLen, "0");
  return `${prefix}${formatted}`;
}

function renderModuleCell(moduleName: string, record: SeriesItem): React.ReactNode {
  const mod = record.modules_config?.modules?.find((m) => m.module === moduleName);
  if (!mod) return <span className="text-muted">—</span>;
  return <span>{formatModuleNumber(mod)}</span>;
}

// ─── Column resize ────────────────────────────────────────────────────────────
interface ResizableTitleProps extends ThHTMLAttributes<HTMLTableCellElement> {
  onResize?: (key: string, width: number) => void;
  colKey?: string;
  currentWidth?: number;
  handleSide?: "left" | "right";
}

function ResizableTitle({ onResize, colKey, currentWidth, handleSide = "right", ...restProps }: ResizableTitleProps) {
  const thRef      = useRef<HTMLTableCellElement>(null);
  const [handleVisible, setHandleVisible] = useState(false);
  const isDragging = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!onResize || !colKey) return;
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startWidth = handleSide === "left"
      ? (currentWidth ?? 130)
      : (thRef.current?.offsetWidth ?? currentWidth ?? 130);
    isDragging.current = true;
    setHandleVisible(true);

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const newWidth = Math.max(60, startWidth + ev.clientX - startX);
      onResize(colKey, newWidth);
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor    = "";
      document.body.style.userSelect = "";
      setHandleVisible(false);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.body.style.cursor    = "col-resize";
    document.body.style.userSelect = "none";
  };

  const canResize = !!onResize && !!colKey;
  const handleEdge = handleSide === "left"
    ? { left: 0, right: "auto" as const }
    : { right: 0, left: "auto" as const };

  return (
    <th
      ref={thRef}
      {...restProps}
      style={{ ...restProps.style, position: "relative", userSelect: "none" }}
    >
      {restProps.children}
      {canResize && (
        <span
          onMouseDown={handleMouseDown}
          onMouseEnter={() => setHandleVisible(true)}
          onMouseLeave={() => !isDragging.current && setHandleVisible(false)}
          style={{
            position:       "absolute",
            top:            0,
            ...handleEdge,
            bottom:         0,
            width:          8,
            cursor:         "col-resize",
            zIndex:         3,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              width:         2,
              height:        handleVisible ? "55%" : 0,
              background:    "var(--bs-primary, #0d6efd)",
              borderRadius:  2,
              transition:    "height 0.15s ease",
              pointerEvents: "none",
              opacity:       handleVisible ? 0.7 : 0,
            }}
          />
        </span>
      )}
    </th>
  );
}

const TABLE_COMPONENTS = { header: { cell: ResizableTitle } };

// ─── Sortable row inside the modal ────────────────────────────────────────────
function SortableColRow({ col, checked, onToggle }: { col: ColDef; checked: boolean; onToggle: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: col.key });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? "#f0f4ff" : undefined,
    zIndex: isDragging ? 999 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="d-flex align-items-center gap-3 px-4 py-3 border-bottom"
    >
      <span
        {...attributes}
        {...listeners}
        style={{ cursor: "grab", touchAction: "none" }}
        className="text-muted flex-shrink-0"
      >
        <i className="ti ti-grip-vertical fs-16" />
      </span>
      <input
        className="form-check-input m-0 flex-shrink-0"
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        style={{ width: 17, height: 17 }}
      />
      <span className="fs-14">{col.label}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const TransactionSeriesList = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<"list" | "grid">(() => {
    try { return localStorage.getItem(VIEW_LS_KEY) === "grid" ? "grid" : "list"; }
    catch { return "list"; }
  });
  const [gridPage, setGridPage]   = useState(12);
  const [searchText, setSearchText] = useState("");
  const [items, setItems]                 = useState<SeriesItem[]>([]);
  const [deletedItems, setDeletedItems]   = useState<SeriesItem[]>([]);
  const [deletedLoading, setDeletedLoading] = useState(false);
  const [total, setTotal]                 = useState(0);
  const [loading, setLoading]             = useState(true);
  const [seriesFilter, setSeriesFilter]   = useState<SeriesFilter>("active");
  const [loadError, setLoadError]         = useState<string | null>(null);

  // ── Toast ──
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false, message: "", type: "success",
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (message: string, type: "success" | "error" = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // ── Customize Columns modal ──
  const [showColsModal, setShowColsModal] = useState(false);
  const [colSearch, setColSearch]         = useState("");
  const [colOrder, setColOrder] = useState<ColDef[]>(() => {
    try {
      const saved = localStorage.getItem(COL_ORDER_LS_KEY);
      if (saved) {
        const savedKeys: string[] = JSON.parse(saved);
        const ordered = savedKeys.map(k => INITIAL_COLS.find(c => c.key === k)).filter(Boolean) as ColDef[];
        const savedSet = new Set(savedKeys);
        return [...ordered, ...INITIAL_COLS.filter(c => !savedSet.has(c.key))];
      }
    } catch {}
    return INITIAL_COLS;
  });
  const [visibleCols, setVisibleCols] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(COL_VISIBLE_LS_KEY);
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        const validKeys = new Set(INITIAL_COLS.map(c => c.key));
        return new Set<string>(parsed.filter(k => validKeys.has(k)));
      }
    } catch {}
    return new Set(DEFAULT_VISIBLE);
  });
  const [draftOrder, setDraftOrder]       = useState<ColDef[]>(INITIAL_COLS);
  const [draftVisible, setDraftVisible]   = useState<Set<string>>(new Set(DEFAULT_VISIBLE));

  // ── Column widths (resizable) ──
  const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(COL_WIDTHS_LS_KEY);
      return saved ? { ...DEFAULT_COL_WIDTHS, ...JSON.parse(saved) } : { ...DEFAULT_COL_WIDTHS };
    } catch {
      return { ...DEFAULT_COL_WIDTHS };
    }
  });

  const handleResize = useCallback((key: string, width: number) => {
    setColWidths((prev) => {
      const next = { ...prev, [key]: width };
      localStorage.setItem(COL_WIDTHS_LS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const openColsModal = () => {
    setDraftOrder([...colOrder]);
    setDraftVisible(new Set(visibleCols));
    setColSearch("");
    setShowColsModal(true);
  };
  const closeColsModal = () => setShowColsModal(false);
  const saveColsModal  = () => {
    const newOrder = [...draftOrder];
    const newVisible = new Set(draftVisible);
    setColOrder(newOrder);
    setVisibleCols(newVisible);
    try {
      localStorage.setItem(COL_ORDER_LS_KEY, JSON.stringify(newOrder.map(c => c.key)));
      localStorage.setItem(COL_VISIBLE_LS_KEY, JSON.stringify([...newVisible]));
    } catch {}
    setShowColsModal(false);
  };

  const toggleDraft = (key: string) => {
    setDraftVisible((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setDraftOrder((prev) => {
        const oldIndex = prev.findIndex((c) => c.key === active.id);
        const newIndex = prev.findIndex((c) => c.key === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const filteredDraft = useMemo(
    () => draftOrder.filter((c) => c.label.toLowerCase().includes(colSearch.toLowerCase())),
    [draftOrder, colSearch],
  );

  const loadFresh = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    bustSeriesLists();
    try {
      const data = await getSeriesList();
      setItems(data);
      setTotal(data.length);
    } catch (e: any) {
      setLoadError(e.message ?? "Failed to load series.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const cached = readSeriesList();
    if (cached) { setItems(cached); setTotal(cached.length); setLoading(false); return; }
    loadFresh();
  }, []);
  useEffect(() => { localStorage.setItem(VIEW_LS_KEY, view); }, [view]);

  useEffect(() => {
    if (seriesFilter !== "deleted") return;
    const cached = readSeriesList(true);
    if (cached) { setDeletedItems(cached); return; }
    setDeletedLoading(true);
    getSeriesList(true)
      .then(data => { setDeletedItems(data); setDeletedLoading(false); })
      .catch((e: any) => {
        setLoadError(e.message ?? "Failed to load deleted series.");
        setDeletedLoading(false);
      });
  }, [seriesFilter]);

  // Reload when any page mutates series data
  useEffect(() => onMutation("series:mutated", loadFresh), [loadFresh]);

  // Reload on window focus: cache-first so no network hit if data is still fresh
  useEffect(() => {
    const onFocus = () => {
      getSeriesList()
        .then(data => { setItems(data); setTotal(data.length); })
        .catch(() => {});
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // ── Build table columns in the saved order ──
  const columns = useMemo(() => {
    const resizeCell = (key: string) => () => ({
      colKey: key,
      onResize: handleResize,
      currentWidth: colWidths[key] ?? DEFAULT_COL_WIDTHS[key] ?? 160,
    });

    // Fixed: Series Name
    const cols: object[] = [
      {
        title: "Series Name",
        key: "name",
        dataIndex: "name",
        width: colWidths["name"] ?? DEFAULT_COL_WIDTHS["name"],
        onHeaderCell: resizeCell("name"),
        render: (_: string, record: SeriesItem) => (
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded border d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 40, height: 40, background: "#f5f5f5" }}
            >
              <i className="ti ti-replace text-muted fs-18" />
            </div>
            <Link
              to={`/locations/series/${record.id}`}
              className="title-name fw-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {record.name}
            </Link>
          </div>
        ),
      },
    ];

    // Module + associated_locations columns (in user-controlled order)
    for (const col of colOrder) {
      if (!visibleCols.has(col.key)) continue;

      if (col.key === "associated_locations") {
        cols.push({
          title: "Associated Locations",
          key: "associated_locations",
          dataIndex: "locations_count",
          width: colWidths["associated_locations"] ?? DEFAULT_COL_WIDTHS["associated_locations"],
          onHeaderCell: resizeCell("associated_locations"),
          render: (val: number | undefined) => (
            val ? (
              <Link to="#" className="text-primary fw-medium">{val}</Link>
            ) : (
              <span className="text-muted">0</span>
            )
          ),
        });
        continue;
      }

      // Module column — look up by name in MODULE_COLS
      const moduleDef = MODULE_COLS.find((m) => m.key === col.key);
      if (!moduleDef || !moduleDef.module) continue;

      const moduleName = moduleDef.module;
      cols.push({
        title: col.label,
        key: col.key,
        dataIndex: col.key,
        width: colWidths[col.key] ?? DEFAULT_COL_WIDTHS[col.key] ?? 160,
        onHeaderCell: resizeCell(col.key),
        render: (_: unknown, record: SeriesItem) => renderModuleCell(moduleName, record),
      });
    }

    // Last-column left-side resize handle
    if (cols.length > 1) {
      const lastCol     = cols[cols.length - 1] as any;
      const prevCol     = cols[cols.length - 2] as any;
      const adjacentKey = prevCol.key as string;
      lastCol.onHeaderCell = () => ({
        colKey:       adjacentKey,
        onResize:     handleResize,
        currentWidth: colWidths[adjacentKey] ?? DEFAULT_COL_WIDTHS[adjacentKey] ?? 160,
        handleSide:   "left",
      });
      delete lastCol.width;
    } else if (cols.length === 1) {
      delete (cols[0] as any).width;
    }

    return cols;
  }, [visibleCols, colOrder, colWidths, handleResize]);

  // ── Active vs deleted data source ──
  const filteredItems = useMemo(
    () => seriesFilter === "deleted" ? deletedItems : items,
    [seriesFilter, items, deletedItems],
  );

  // ── Grid search filter ──
  const gridItems = useMemo(() => {
    if (!searchText.trim()) return filteredItems;
    const q = searchText.toLowerCase();
    return filteredItems.filter(item => item.name.toLowerCase().includes(q));
  }, [filteredItems, searchText]);

  // ── Export handlers ──
  const seriesExportTitle = seriesFilter === "deleted" ? "Deleted Transaction Series" : "Transaction Number Series";
  const seriesExportFilename = seriesFilter === "deleted" ? "Deleted_Transaction_Series" : "Transaction_Series";

  const moduleExportCols = MODULE_COLS.filter(c => c.key !== "associated_locations");

  const buildSeriesExportRows = () => gridItems.map(item => {
    const base = [item.name];
    for (const col of moduleExportCols) {
      const mod = item.modules_config?.modules?.find(m => m.module === col.module);
      base.push(mod ? formatModuleNumber(mod) : "—");
    }
    base.push(String(item.locations_count ?? 0));
    return base;
  });

  const seriesExportHeaders = ["Series Name", ...moduleExportCols.map(c => c.label), "Locations"];

  const handleExportPdf = () => {
    try { exportToPdfPrint(seriesExportTitle, seriesExportHeaders, buildSeriesExportRows()); }
    catch (e: any) { showToast(e.message ?? "PDF export failed.", "error"); }
  };

  const handleExportExcel = () => {
    const columns = [
      { header: "Series Name", key: "name", width: 26 },
      ...moduleExportCols.map(c => ({ header: c.label, key: c.key, width: 18 })),
      { header: "Locations", key: "locations", width: 14 },
    ];
    const rows = gridItems.map(item => {
      const row: Record<string, string | number | null> = { name: item.name };
      for (const col of moduleExportCols) {
        const mod = item.modules_config?.modules?.find(m => m.module === col.module);
        row[col.key] = mod ? formatModuleNumber(mod) : "—";
      }
      row["locations"] = item.locations_count ?? 0;
      return row;
    });
    exportToExcelFile(seriesExportFilename, columns, rows)
      .catch(() => showToast("Excel export failed.", "error"));
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="content">

          <PageHeader title="Transaction Number Series" badgeCount={total} showModuleTile={false} showExport={true} onRefresh={loadFresh} onExportPdf={handleExportPdf} onExportExcel={handleExportExcel} />

          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2">
              <div className="input-icon input-icon-start position-relative">
                <span className="input-icon-addon text-dark">
                  <i className="ti ti-search" />
                </span>
                <SearchInput value={searchText} onChange={setSearchText} />
              </div>
              <Link to={route.newTransactionSeries} className="btn btn-primary flex-shrink-0">
                <i className="ti ti-square-rounded-plus-filled me-1" />
                New Series
              </Link>
            </div>

            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">

                {/* Left — series filter */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="dropdown">
                    <Link to="#" className="dropdown-toggle btn btn-outline-light px-2 fs-16 fw-bold border-0" data-bs-toggle="dropdown">
                      {seriesFilter === "active" ? "Active Transaction Series" : "Deleted Transaction Series"}
                    </Link>
                    <div className="dropdown-menu dropmenu-hover-primary">
                      <ul>
                        <li><button className="dropdown-item" onClick={() => setSeriesFilter("active")}><i className="ti ti-circle-check me-1" />Active Transaction Series</button></li>
                        <li><button className="dropdown-item" onClick={() => setSeriesFilter("deleted")}><i className="ti ti-trash me-1" />Deleted Transaction Series</button></li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right — manage cols + view toggle */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                {view === "list" && (
                  <button type="button" className="btn bg-soft-indigo px-2 border-0" onClick={openColsModal}>
                    <i className="ti ti-columns-3 me-2" />Manage Columns
                  </button>
                )}

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
                </div>{/* end right controls */}
              </div>{/* end controls row */}

              {loadError && (
                <div className="alert alert-danger mx-3 mt-3 mb-0 d-flex align-items-center gap-2">
                  <i className="ti ti-alert-circle" />
                  {loadError}
                  <button type="button" className="btn btn-sm btn-outline-danger ms-auto" onClick={loadFresh}>Retry</button>
                </div>
              )}
              {(loading || (seriesFilter === "deleted" && deletedLoading)) ? (
                <div className="text-center py-5 text-muted">
                  <span className="spinner-border spinner-border-sm me-2" />
                  {seriesFilter === "deleted" ? "Loading deleted series…" : "Loading…"}
                </div>
              ) : view === "list" ? (
                <div className="custom-table table-nowrap">
                  <Datatable
                    columns={columns}
                    dataSource={filteredItems.map(r => ({ ...r, key: r.id }))}
                    Selection={false}
                    searchText={searchText}
                    components={TABLE_COMPONENTS}
                    scroll={{ x: "max-content" }}
                    onRow={(record: SeriesItem) => ({
                      onClick: () => navigate(`/locations/series/${record.id}`),
                      style: { cursor: "pointer" },
                    })}
                  />
                </div>
              ) : (
                /* ── Grid view ─────────────────────────────────────── */
                <>
                  {gridItems.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="ti ti-mood-empty fs-32 d-block mb-2" />
                      No series found
                    </div>
                  ) : (
                    <div className="row">
                      {gridItems.slice(0, gridPage).map((item) => {
                        const mods = item.modules_config?.modules ?? [];
                        const date = new Date(item.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        });

                        return (
                          <div key={item.id} className="col-xxl-3 col-xl-4 col-md-6">
                            <div
                              className="card border shadow"
                              style={{ cursor: "pointer" }}
                              onClick={() => navigate(`/locations/series/${item.id}`)}
                            >
                              <div className="card-body">

                                {/* Header: locations count */}
                                <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                                  <h4 className="mb-1 fs-14 fw-semibold">{item.name}</h4>
                                  <span className="badge badge-soft-info ms-2">
                                    {item.locations_count ?? 0} location{(item.locations_count ?? 0) !== 1 ? "s" : ""}
                                  </span>
                                </div>

                                {/* Module codes */}
                                <div className="mb-3">
                                  {mods.slice(0, 4).map((mod) => (
                                    <div key={mod.module} className="d-flex align-items-center justify-content-between mb-1">
                                      <span className="text-muted fs-12">{mod.module}</span>
                                      <span className="fs-12 fw-medium">{formatModuleNumber(mod)}</span>
                                    </div>
                                  ))}
                                  {mods.length > 4 && (
                                    <div className="text-muted fs-12 mt-1">+{mods.length - 4} more</div>
                                  )}
                                </div>

                                {/* Footer */}
                                <div className="border-top pt-3">
                                  <span className="text-muted fs-12">Created on {date}</span>
                                </div>

                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {gridItems.length > gridPage && (
                    <div className="load-btn text-center mt-3">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setGridPage((p) => p + 12)}
                      >
                        <i className="ti ti-loader me-1" />
                        Load More
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

      {/* ── Customize Columns Modal ─────────────────────────────────────────── */}
      <Modal show={showColsModal} onHide={closeColsModal} centered size="lg">
        <Modal.Header className="px-4 py-3 border-bottom">
          <div className="d-flex align-items-center justify-content-between w-100">
            <div className="d-flex align-items-center gap-2">
              <i className="ti ti-adjustments-horizontal fs-20 text-muted" />
              <Modal.Title className="fs-17 fw-semibold mb-0">Customize Columns</Modal.Title>
            </div>
            <div className="d-flex align-items-center gap-3">
              <span className="text-muted fs-14">
                {draftVisible.size + 1} of {INITIAL_COLS.length + 1} Selected
              </span>
              <button type="button" className="btn-close" onClick={closeColsModal} aria-label="Close" />
            </div>
          </div>
        </Modal.Header>

        <Modal.Body className="p-0">
          {/* Search */}
          <div className="px-4 pt-3 pb-2">
            <div className="input-icon input-icon-start position-relative">
              <span className="input-icon-addon text-muted" style={{ left: 12 }}>
                <i className="ti ti-search fs-15" />
              </span>
              <input
                type="text"
                className="form-control ps-5"
                placeholder="Search columns…"
                value={colSearch}
                onChange={(e) => setColSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Fixed: Series Name */}
          <div className="d-flex align-items-center gap-3 px-4 py-3 border-bottom bg-light">
            <i className="ti ti-grip-vertical text-muted fs-16" style={{ opacity: 0.3 }} />
            <i className="ti ti-lock text-muted fs-15" />
            <span className="fs-14 text-muted">Series Name</span>
            <span className="ms-auto badge badge-soft-secondary fs-11">Fixed</span>
          </div>

          {/* Sortable list */}
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={filteredDraft.map((c) => c.key)}
                strategy={verticalListSortingStrategy}
              >
                {filteredDraft.map((col) => (
                  <SortableColRow
                    key={col.key}
                    col={col}
                    checked={draftVisible.has(col.key)}
                    onToggle={() => toggleDraft(col.key)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>

          {/* Fixed: Action */}
          <div className="d-flex align-items-center gap-3 px-4 py-3 border-top bg-light">
            <i className="ti ti-grip-vertical text-muted fs-16" style={{ opacity: 0.3 }} />
            <i className="ti ti-lock text-muted fs-15" />
            <span className="fs-14 text-muted">Action</span>
            <span className="ms-auto badge badge-soft-secondary fs-11">Fixed</span>
          </div>
        </Modal.Body>

        <Modal.Footer className="px-4 py-3 border-top justify-content-start gap-2">
          <button type="button" className="btn btn-sm btn-primary" onClick={saveColsModal}>Save</button>
          <button type="button" className="btn btn-cancel btn-sm" onClick={closeColsModal}>Cancel</button>
        </Modal.Footer>
      </Modal>

      {/* ── Toast notification ───────────────────────────────────────────────── */}
      <div
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
            borderRadius: 12,
            boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
            border: "none",
            minWidth: 320,
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

export default TransactionSeriesList;
