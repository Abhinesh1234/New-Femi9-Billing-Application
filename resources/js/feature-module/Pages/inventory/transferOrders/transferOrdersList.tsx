import React, { useCallback, useEffect, useMemo, useRef, useState, type ThHTMLAttributes } from "react";
import { Link, useNavigate } from "react-router";
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
import {
  type TransferOrderRecord,
  type TransferOrderStatus,
} from "../../../../core/services/transferOrderApi";
import {
  readTransferOrderList,
  getTransferOrderList,
  bustAllTransferOrderCache,
} from "../../../../core/cache/transferOrderCache";
import { onMutation } from "../../../../core/cache/mutationEvents";
import { useWindowFocusRefresh } from "../../../../core/hooks/useWindowFocusRefresh";
import { exportToExcelFile, exportToPdfPrint } from "../../../../core/utils/exportUtils";

const route = all_routes;

// ─── Column definitions ───────────────────────────────────────────────────────
interface ColDef { key: string; label: string; }

const INITIAL_COLS: ColDef[] = [
  { key: "source_location",      label: "Source"         },
  { key: "destination_location", label: "Destination"    },
  { key: "status",               label: "Status"         },
  { key: "lines_count",          label: "Items"          },
  { key: "reason",               label: "Notes"          },
];

const DEFAULT_VISIBLE = new Set(["source_location", "destination_location", "status", "lines_count"]);

const DEFAULT_COL_WIDTHS: Record<string, number> = {
  transfer_number:       180,
  transfer_date:         150,
  source_location:       200,
  destination_location:  200,
  status:                130,
  lines_count:           90,
  reason:                260,
};

const COL_WIDTHS_LS_KEY  = "femi9_transfer_orders_col_widths";
const COL_ORDER_LS_KEY   = "femi9_transfer_orders_col_order";
const COL_VISIBLE_LS_KEY = "femi9_transfer_orders_col_visible";
const VIEW_LS_KEY        = "femi9_transfer_orders_view";

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_BADGE: Record<TransferOrderStatus, string> = {
  draft:       "badge-soft-secondary",
  in_transit:  "badge-soft-warning",
  transferred: "badge-soft-success",
  cancelled:   "badge-soft-danger",
};

const STATUS_LABEL: Record<TransferOrderStatus, string> = {
  draft:       "Draft",
  in_transit:  "In Transit",
  transferred: "Transferred",
  cancelled:   "Cancelled",
};

// ─── Resizable column header ──────────────────────────────────────────────────
interface ResizableTitleProps extends ThHTMLAttributes<HTMLTableCellElement> {
  onResize?:     (key: string, width: number) => void;
  colKey?:       string;
  currentWidth?: number;
  handleSide?:   "left" | "right";
}

function ResizableTitle({ onResize, colKey, currentWidth, handleSide = "right", ...restProps }: ResizableTitleProps) {
  const thRef = useRef<HTMLTableCellElement>(null);
  const [handleVisible, setHandleVisible] = useState(false);
  const isDragging = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!onResize || !colKey) return;
    e.preventDefault(); e.stopPropagation();
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
      document.body.style.cursor = ""; document.body.style.userSelect = "";
      setHandleVisible(false);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none";
  };

  const canResize  = !!onResize && !!colKey;
  const handleEdge = handleSide === "left" ? { left: 0, right: "auto" as const } : { right: 0, left: "auto" as const };

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
          <span style={{ width: 2, height: handleVisible ? "55%" : 0, background: "var(--bs-primary,#0d6efd)", borderRadius: 2, transition: "height 0.15s ease", pointerEvents: "none", opacity: handleVisible ? 0.7 : 0 }} />
        </span>
      )}
    </th>
  );
}

const TABLE_COMPONENTS = { header: { cell: ResizableTitle } };

// ─── Sortable row inside the Customize Columns modal ─────────────────────────
function SortableColRow({ col, checked, onToggle }: { col: ColDef; checked: boolean; onToggle: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: col.key });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, background: isDragging ? "#f0f4ff" : undefined, zIndex: isDragging ? 999 : undefined }}
      className="d-flex align-items-center gap-3 px-4 py-3 border-bottom"
    >
      <span {...attributes} {...listeners} style={{ cursor: "grab", touchAction: "none" }} className="text-muted flex-shrink-0">
        <i className="ti ti-grip-vertical fs-16" />
      </span>
      <input className="form-check-input m-0 flex-shrink-0" type="checkbox" checked={checked} onChange={onToggle} style={{ width: 17, height: 17 }} />
      <span className="fs-14">{col.label}</span>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
type StatusFilter = "all" | TransferOrderStatus;
type SortOption   = "newest" | "oldest";

const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

// ─── Main component ───────────────────────────────────────────────────────────
const TransferOrdersList = () => {
  const navigate = useNavigate();

  // ── View ──
  const [view, setView] = useState<"list" | "grid">(() => {
    try { return localStorage.getItem(VIEW_LS_KEY) === "grid" ? "grid" : "list"; } catch { return "list"; }
  });
  const [gridPage, setGridPage] = useState(12);

  // ── Data ──
  const [orders,    setOrders]    = useState<TransferOrderRecord[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Filters ──
  const [searchText,   setSearchText]   = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy,       setSortBy]       = useState<SortOption>("newest");

  // ── Customize Columns modal ──
  const [showColsModal, setShowColsModal] = useState(false);
  const [colSearch,     setColSearch]     = useState("");

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

  const [draftOrder,   setDraftOrder]   = useState<ColDef[]>(INITIAL_COLS);
  const [draftVisible, setDraftVisible] = useState<Set<string>>(new Set(DEFAULT_VISIBLE));

  // ── Column widths ──
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

  // ── Columns modal handlers ──
  const openColsModal  = () => { setDraftOrder([...colOrder]); setDraftVisible(new Set(visibleCols)); setColSearch(""); setShowColsModal(true); };
  const closeColsModal = () => setShowColsModal(false);
  const saveColsModal  = () => {
    setColOrder([...draftOrder]);
    setVisibleCols(new Set(draftVisible));
    try {
      localStorage.setItem(COL_ORDER_LS_KEY,   JSON.stringify(draftOrder.map(c => c.key)));
      localStorage.setItem(COL_VISIBLE_LS_KEY, JSON.stringify([...draftVisible]));
    } catch {}
    setShowColsModal(false);
  };
  const toggleDraft = (key: string) => setDraftVisible(prev => {
    const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n;
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setDraftOrder(prev => {
        const oi = prev.findIndex(c => c.key === active.id);
        const ni = prev.findIndex(c => c.key === over.id);
        return arrayMove(prev, oi, ni);
      });
    }
  };
  const filteredDraft = useMemo(
    () => draftOrder.filter(c => c.label.toLowerCase().includes(colSearch.toLowerCase())),
    [draftOrder, colSearch]
  );

  // ── Data loading ──
  const loadFresh = useCallback(async () => {
    setLoading(true); setLoadError(null);
    try {
      const data = await getTransferOrderList();
      setOrders(data);
    } catch (e: any) { setLoadError(e.message ?? "Failed to load transfer orders."); }
    setLoading(false);
  }, []);

  const handleRefresh = useCallback(async () => {
    bustAllTransferOrderCache();
    try { setOrders(await getTransferOrderList()); } catch {}
  }, []);

  useEffect(() => {
    const cached = readTransferOrderList();
    if (cached) { setOrders(cached); setLoading(false); return; }
    loadFresh();
  }, []);
  useEffect(() => onMutation("transfer-orders:mutated", handleRefresh), [handleRefresh]);
  useWindowFocusRefresh(handleRefresh);

  // Reload on window focus — cache-first, no network hit if data is still fresh
  useEffect(() => {
    const onFocus = () => {
      getTransferOrderList().then(data => setOrders(data)).catch(() => {});
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);
  useEffect(() => { localStorage.setItem(VIEW_LS_KEY, view); }, [view]);
  useEffect(() => { setGridPage(12); }, [statusFilter]);

  // ── Filtered + sorted data ──
  const filtered = useMemo(() => {
    let base = statusFilter === "all" ? orders : orders.filter(o => o.status === statusFilter);
    const q  = searchText.trim().toLowerCase();
    if (q) {
      base = base.filter(o =>
        o.transfer_number.toLowerCase().includes(q) ||
        (o.source_location?.name ?? "").toLowerCase().includes(q) ||
        (o.destination_location?.name ?? "").toLowerCase().includes(q) ||
        (o.reason ?? "").toLowerCase().includes(q)
      );
    }
    return [...base].sort((a, b) =>
      sortBy === "oldest"
        ? new Date(a.transfer_date).getTime() - new Date(b.transfer_date).getTime()
        : new Date(b.transfer_date).getTime() - new Date(a.transfer_date).getTime()
    );
  }, [orders, statusFilter, searchText, sortBy]);

  // ── Table columns ──
  const columns = useMemo(() => {
    const resizeCell = (key: string) => () => ({
      colKey: key, onResize: handleResize,
      currentWidth: colWidths[key] ?? DEFAULT_COL_WIDTHS[key] ?? 160,
    });

    const cols: object[] = [
      {
        title: "Transfer #",
        key: "transfer_number",
        dataIndex: "transfer_number",
        width: colWidths["transfer_number"] ?? DEFAULT_COL_WIDTHS["transfer_number"],
        onHeaderCell: resizeCell("transfer_number"),
        render: (text: string) => (
          <span className="fw-semibold fs-14">{text}</span>
        ),
      },
      {
        title: "Date",
        key: "transfer_date",
        dataIndex: "transfer_date",
        width: colWidths["transfer_date"] ?? DEFAULT_COL_WIDTHS["transfer_date"],
        onHeaderCell: resizeCell("transfer_date"),
        render: (text: string) => (
          <span className="fs-14">{fmtDate(text)}</span>
        ),
      },
    ];

    for (const col of colOrder) {
      if (!visibleCols.has(col.key)) continue;
      switch (col.key) {
        case "source_location":
          cols.push({
            title: "Source", key: "source_location", dataIndex: "source_location",
            width: colWidths["source_location"] ?? DEFAULT_COL_WIDTHS["source_location"],
            onHeaderCell: resizeCell("source_location"),
            render: (_: unknown, record: TransferOrderRecord) =>
              record.source_location?.name
                ? <span className="d-flex align-items-center gap-1"><i className="ti ti-map-pin fs-13 text-muted" />{record.source_location.name}</span>
                : <span className="text-muted">—</span>,
          });
          break;
        case "destination_location":
          cols.push({
            title: "Destination", key: "destination_location", dataIndex: "destination_location",
            width: colWidths["destination_location"] ?? DEFAULT_COL_WIDTHS["destination_location"],
            onHeaderCell: resizeCell("destination_location"),
            render: (_: unknown, record: TransferOrderRecord) =>
              record.destination_location?.name
                ? <span className="d-flex align-items-center gap-1"><i className="ti ti-map-pin-check fs-13 text-muted" />{record.destination_location.name}</span>
                : <span className="text-muted">—</span>,
          });
          break;
        case "status":
          cols.push({
            title: "Status", key: "status", dataIndex: "status",
            width: colWidths["status"] ?? DEFAULT_COL_WIDTHS["status"],
            onHeaderCell: resizeCell("status"),
            render: (val: TransferOrderStatus) => (
              <span className={`badge ${STATUS_BADGE[val] ?? "badge-soft-secondary"} fs-12`}>
                {STATUS_LABEL[val] ?? val}
              </span>
            ),
          });
          break;
        case "lines_count":
          cols.push({
            title: "Items", key: "lines_count", dataIndex: "lines_count",
            width: colWidths["lines_count"] ?? DEFAULT_COL_WIDTHS["lines_count"],
            onHeaderCell: resizeCell("lines_count"),
            render: (val: number | undefined) => (
              <span className="badge badge-soft-secondary">{val ?? 0}</span>
            ),
          });
          break;
        case "reason":
          cols.push({
            title: "Notes", key: "reason", dataIndex: "reason",
            width: colWidths["reason"] ?? DEFAULT_COL_WIDTHS["reason"],
            onHeaderCell: resizeCell("reason"),
            render: (text: string | null) =>
              text
                ? <span className="text-truncate d-block" style={{ maxWidth: 240 }} title={text}>{text}</span>
                : <span className="text-muted">—</span>,
          });
          break;
      }
    }

    // Last-col resize handle fix
    if (cols.length > 1) {
      const lastCol     = cols[cols.length - 1] as any;
      const prevCol     = cols[cols.length - 2] as any;
      const adjacentKey = prevCol.key as string;
      lastCol.onHeaderCell = () => ({
        colKey: adjacentKey, onResize: handleResize,
        currentWidth: colWidths[adjacentKey] ?? DEFAULT_COL_WIDTHS[adjacentKey] ?? 160,
        handleSide: "left",
      });
      delete lastCol.width;
    }

    return cols;
  }, [visibleCols, colOrder, colWidths, handleResize]);

  // ── Export ──
  const exportHeaders = ["Transfer #", "Date", "Source", "Destination", "Status", "Items"];
  const buildExportRows = () => filtered.map(o => [
    o.transfer_number,
    fmtDate(o.transfer_date),
    o.source_location?.name ?? "—",
    o.destination_location?.name ?? "—",
    STATUS_LABEL[o.status] ?? o.status,
    String(o.lines_count ?? 0),
  ]);

  const handleExportPdf = () => {
    try { exportToPdfPrint("Transfer Orders", exportHeaders, buildExportRows()); }
    catch (e: any) { console.error(e); }
  };

  const handleExportExcel = () => {
    const rows = filtered.map(o => ({
      transfer_number: o.transfer_number,
      date:            fmtDate(o.transfer_date),
      source:          o.source_location?.name ?? "—",
      destination:     o.destination_location?.name ?? "—",
      status:          STATUS_LABEL[o.status] ?? o.status,
      lines:           String(o.lines_count ?? 0),
    }));
    exportToExcelFile("Transfer Orders", [
      { header: "Transfer #",   key: "transfer_number", width: 18 },
      { header: "Date",         key: "date",            width: 16 },
      { header: "Source",       key: "source",          width: 22 },
      { header: "Destination",  key: "destination",     width: 22 },
      { header: "Status",       key: "status",          width: 14 },
      { header: "Items",        key: "lines",           width: 10 },
    ], rows).catch(() => {});
  };

  const filterLabel: Record<StatusFilter, string> = {
    all:         "All Orders",
    draft:       "Draft",
    in_transit:  "In Transit",
    transferred: "Transferred",
    cancelled:   "Cancelled",
  };

  const sortLabel: Record<SortOption, string> = {
    newest: "Newest",
    oldest: "Oldest",
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="content">

          <PageHeader
            title="Transfer Orders"
            badgeCount={filtered.length}
            showModuleTile={false}
            showExport
            onRefresh={handleRefresh}
            onExportPdf={handleExportPdf}
            onExportExcel={handleExportExcel}
          />

          <div className="card border-0 rounded-0">

            {/* ── Toolbar ──────────────────────────────────────────────────── */}
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <div className="input-icon input-icon-start position-relative">
                <span className="input-icon-addon text-dark"><i className="ti ti-search" /></span>
                <SearchInput value={searchText} onChange={setSearchText} />
              </div>
              <Link to={route.newTransferOrder} className="btn btn-primary">
                <i className="ti ti-square-rounded-plus-filled me-1" />New Transfer Order
              </Link>
            </div>

            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">

                {/* Left: status filter */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="dropdown">
                    <Link to="#" className="dropdown-toggle btn btn-outline-light px-2 fs-16 fw-bold border-0" data-bs-toggle="dropdown">
                      {filterLabel[statusFilter]}
                    </Link>
                    <div className="dropdown-menu dropmenu-hover-primary">
                      <ul>
                        <li><button className="dropdown-item" onClick={() => setStatusFilter("all")}><i className="ti ti-layout-list me-1" />All Orders</button></li>
                        <li><button className="dropdown-item" onClick={() => setStatusFilter("draft")}><i className="ti ti-clock-edit me-1" />Draft</button></li>
                        <li><button className="dropdown-item" onClick={() => setStatusFilter("in_transit")}><i className="ti ti-truck me-1" />In Transit</button></li>
                        <li><button className="dropdown-item" onClick={() => setStatusFilter("transferred")}><i className="ti ti-circle-check me-1" />Transferred</button></li>
                        <li><button className="dropdown-item" onClick={() => setStatusFilter("cancelled")}><i className="ti ti-circle-x me-1" />Cancelled</button></li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right: sort + manage cols + view toggle */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="dropdown">
                    <button type="button" className="dropdown-toggle btn btn-outline-light px-2 shadow" data-bs-toggle="dropdown">
                      <i className="ti ti-sort-ascending-2 me-2" />{sortLabel[sortBy]}
                    </button>
                    <div className="dropdown-menu dropmenu-hover-primary">
                      <ul>
                        <li><button className={`dropdown-item d-flex align-items-center gap-2${sortBy === "newest" ? " active" : ""}`} onClick={() => setSortBy("newest")}><i className="ti ti-clock-hour-3 fs-15" />Newest</button></li>
                        <li><button className={`dropdown-item d-flex align-items-center gap-2${sortBy === "oldest" ? " active" : ""}`} onClick={() => setSortBy("oldest")}><i className="ti ti-history fs-15" />Oldest</button></li>
                      </ul>
                    </div>
                  </div>

                  {view === "list" && (
                    <button type="button" className="btn bg-soft-indigo px-2 border-0" onClick={openColsModal}>
                      <i className="ti ti-columns-3 me-2" />Manage Columns
                    </button>
                  )}

                  <div className="d-flex align-items-center shadow rounded border view-icons bg-white">
                    <button type="button" className={`btn btn-sm m-1 px-2 border-0 fs-14${view === "list" ? " active" : ""}`} onClick={() => setView("list")} title="List view">
                      <i className="ti ti-list-tree" />
                    </button>
                    <button type="button" className={`btn btn-sm m-1 px-2 border-0 fs-14${view === "grid" ? " active" : ""}`} onClick={() => { setView("grid"); setGridPage(12); }} title="Grid view">
                      <i className="ti ti-grid-dots" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Error ─────────────────────────────────────────────────── */}
              {loadError && (
                <div className="alert alert-danger mx-3 mt-3 mb-0 d-flex align-items-center gap-2">
                  <i className="ti ti-alert-circle" />{loadError}
                  <button type="button" className="btn btn-sm btn-outline-danger ms-auto" onClick={loadFresh}>Retry</button>
                </div>
              )}

              {/* ── Loading skeleton ───────────────────────────────────────── */}
              {loading && (
                <div className="px-3 pt-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="d-flex align-items-center gap-3 py-3 border-bottom">
                      <div className="rounded" style={{ width: 160, height: 16, background: "#f1f5f9", animation: "pulse 1.4s ease-in-out infinite" }} />
                      <div className="rounded" style={{ width: 120, height: 16, background: "#f1f5f9", animation: "pulse 1.4s ease-in-out infinite", animationDelay: "0.1s" }} />
                      <div className="rounded" style={{ width: 180, height: 16, background: "#f1f5f9", animation: "pulse 1.4s ease-in-out infinite", animationDelay: "0.2s" }} />
                      <div className="rounded" style={{ width: 180, height: 16, background: "#f1f5f9", animation: "pulse 1.4s ease-in-out infinite", animationDelay: "0.25s" }} />
                      <div className="rounded ms-auto" style={{ width: 80, height: 22, background: "#f1f5f9", animation: "pulse 1.4s ease-in-out infinite", animationDelay: "0.15s", borderRadius: 20 }} />
                    </div>
                  ))}
                </div>
              )}

              {/* ── Empty state ────────────────────────────────────────────── */}
              {!loading && view === "list" && filtered.length === 0 && !loadError && (
                <div className="text-center py-5">
                  <i className="ti ti-transfer fs-40 d-block mb-4 text-muted opacity-50" />
                  <h6 className="fw-semibold mb-2">No Transfer Orders</h6>
                  <p className="text-muted mb-4 fs-14">
                    {searchText || statusFilter !== "all"
                      ? "No transfer orders match your current filters."
                      : "Start by creating your first transfer order."}
                  </p>
                  {!searchText && statusFilter === "all" && (
                    <Link to={route.newTransferOrder} className="btn btn-primary px-4">
                      <i className="ti ti-square-rounded-plus-filled me-1" />New Transfer Order
                    </Link>
                  )}
                </div>
              )}

              {/* ── List view ─────────────────────────────────────────────── */}
              {!loading && view === "list" && filtered.length > 0 && (
                <div className="items-custom-table custom-table table-nowrap">
                  <Datatable
                    columns={columns}
                    dataSource={filtered}
                    Selection={false}
                    searchText={searchText}
                    components={TABLE_COMPONENTS}
                    scroll={{ x: "max-content" }}
                    rowKey="id"
                    onRow={(record: TransferOrderRecord) => ({
                      onClick: () => navigate(route.transferOrderOverview.replace(":id", String(record.id))),
                      style: { cursor: "pointer" },
                    })}
                  />
                </div>
              )}

              {/* ── Grid view ─────────────────────────────────────────────── */}
              {!loading && view === "grid" && (
                <>
                  {filtered.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="ti ti-transfer fs-40 d-block mb-4 text-muted opacity-50" />
                      <h6 className="fw-semibold mb-2">No Transfer Orders</h6>
                      <p className="text-muted mb-4 fs-14">Start by creating your first transfer order.</p>
                      <Link to={route.newTransferOrder} className="btn btn-primary px-4">
                        <i className="ti ti-square-rounded-plus-filled me-1" />New Transfer Order
                      </Link>
                    </div>
                  ) : (
                    <div className="row">
                      {filtered.slice(0, gridPage).map(o => (
                        <div key={o.id} className="col-xxl-3 col-xl-4 col-md-6">
                          <div
                            className="card border shadow"
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate(route.transferOrderOverview.replace(":id", String(o.id)))}
                          >
                            <div className="card-body">
                              <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                                <span className="badge badge-soft-danger fs-12">{o.transfer_number}</span>
                                <span className={`badge ${STATUS_BADGE[o.status] ?? "badge-soft-secondary"} fs-12`}>
                                  {STATUS_LABEL[o.status] ?? o.status}
                                </span>
                              </div>
                              <div className="mb-2">
                                <div className="d-flex align-items-center gap-2 fs-13 mb-1">
                                  <i className="ti ti-map-pin fs-13 text-muted flex-shrink-0" />
                                  <span className="text-truncate fw-medium">{o.source_location?.name ?? "—"}</span>
                                </div>
                                <div className="d-flex align-items-center gap-2 fs-13">
                                  <i className="ti ti-map-pin-check fs-13 text-muted flex-shrink-0" />
                                  <span className="text-truncate text-muted">{o.destination_location?.name ?? "—"}</span>
                                </div>
                              </div>
                              <div className="d-flex align-items-center justify-content-between mt-3 pt-2 border-top">
                                <p className="d-flex align-items-center mb-0 fs-13 text-muted">
                                  <i className="ti ti-calendar fs-12 me-1" />{fmtDate(o.transfer_date)}
                                </p>
                                <span className="badge badge-soft-secondary fs-12">{o.lines_count ?? 0} items</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
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

      {/* ── Customize Columns Modal ───────────────────────────────────────────── */}
      {showColsModal && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 1060, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}
          onClick={e => { if (e.target === e.currentTarget) closeColsModal(); }}
        >
          <div style={{ background: "#fff", borderRadius: 14, width: 580, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "85vh" }}>
            <div style={{ padding: "20px 24px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "flex-start", gap: 12, flexShrink: 0 }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="ti ti-adjustments-horizontal fs-18" style={{ color: "#ef4444" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 16, color: "#0f172a" }}>Customize Columns</p>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>{draftVisible.size + 2} of {INITIAL_COLS.length + 2} columns visible</p>
              </div>
              <button type="button" onClick={closeColsModal}
                style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #fecaca", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}>
                <i className="ti ti-x" style={{ fontSize: 14, color: "#ef4444" }} />
              </button>
            </div>
            <div style={{ padding: "14px 24px 10px", flexShrink: 0 }}>
              <div className="input-icon input-icon-start position-relative">
                <span className="input-icon-addon text-muted" style={{ left: 12 }}><i className="ti ti-search fs-15" /></span>
                <input type="text" className="form-control ps-5" placeholder="Search columns…" value={colSearch} onChange={e => setColSearch(e.target.value)} />
              </div>
            </div>
            <div className="d-flex align-items-center gap-3 px-4 py-3 border-bottom bg-light" style={{ flexShrink: 0 }}>
              <i className="ti ti-grip-vertical text-muted fs-16" style={{ opacity: 0.3 }} />
              <i className="ti ti-lock text-muted fs-15" />
              <span className="fs-14 text-muted">Transfer # &amp; Date</span>
              <span className="ms-auto badge badge-soft-secondary fs-11">Fixed</span>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={filteredDraft.map(c => c.key)} strategy={verticalListSortingStrategy}>
                  {filteredDraft.map(col => (
                    <SortableColRow key={col.key} col={col} checked={draftVisible.has(col.key)} onToggle={() => toggleDraft(col.key)} />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
            <div style={{ padding: "16px 24px 22px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <button className="btn btn-danger me-2" onClick={saveColsModal}>Save</button>
              <button className="btn btn-outline-light" onClick={closeColsModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default TransferOrdersList;
