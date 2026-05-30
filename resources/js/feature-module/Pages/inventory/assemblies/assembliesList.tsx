import React, { useCallback, useEffect, useMemo, useRef, useState, type ThHTMLAttributes } from "react";
import { Link, useNavigate } from "react-router";
import { Toast } from "react-bootstrap";
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
import { fetchAssemblies, cancelAssembly, type AssemblyRecord } from "../../../../core/services/assemblyApi";
import { bustAllAssemblyCache } from "../../../../core/cache/assemblyCache";
import { onMutation } from "../../../../core/cache/mutationEvents";
import { exportToExcelFile, exportToPdfPrint } from "../../../../core/utils/exportUtils";

const route = all_routes;

// ─── Column definitions ───────────────────────────────────────────────────────
interface ColDef { key: string; label: string; }

const INITIAL_COLS: ColDef[] = [
  { key: "composite_item", label: "Composite Item" },
  { key: "location",       label: "Location" },
  { key: "assembled_date", label: "Assembled Date" },
  { key: "quantity",       label: "Qty Assembled" },
  { key: "status",         label: "Status" },
  { key: "description",    label: "Description" },
];

const DEFAULT_VISIBLE = new Set(["composite_item", "location", "assembled_date", "quantity", "status"]);

const DEFAULT_COL_WIDTHS: Record<string, number> = {
  assembly_number: 200,
  composite_item:  260,
  location:        200,
  assembled_date:  180,
  quantity:        160,
  status:          140,
  description:     260,
};
const COL_WIDTHS_LS_KEY  = "femi9_assemblies_col_widths";
const COL_ORDER_LS_KEY   = "femi9_assemblies_col_order";
const COL_VISIBLE_LS_KEY = "femi9_assemblies_col_visible";
const VIEW_LS_KEY        = "femi9_assemblies_view";

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
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, background: isDragging ? "#f0f4ff" : undefined, zIndex: isDragging ? 999 : undefined }}
      className="d-flex align-items-center gap-3 px-4 py-3 border-bottom">
      <span {...attributes} {...listeners} style={{ cursor: "grab", touchAction: "none" }} className="text-muted flex-shrink-0">
        <i className="ti ti-grip-vertical fs-16" />
      </span>
      <input className="form-check-input m-0 flex-shrink-0" type="checkbox" checked={checked} onChange={onToggle} style={{ width: 17, height: 17 }} />
      <span className="fs-14">{col.label}</span>
    </div>
  );
}

type SortOption = "newest" | "oldest" | "num_asc" | "num_desc";
type StatusFilter = "all" | "completed" | "cancelled";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

// ─── Main component ───────────────────────────────────────────────────────────
const AssembliesList = () => {
  const navigate = useNavigate();

  const [view, setView] = useState<"list" | "grid">(() => {
    try { return localStorage.getItem(VIEW_LS_KEY) === "grid" ? "grid" : "list"; } catch { return "list"; }
  });
  const [gridPage,      setGridPage]     = useState(12);
  const [searchText,    setSearchText]   = useState("");
  const [assemblies,    setAssemblies]   = useState<AssemblyRecord[]>([]);
  const [loading,       setLoading]      = useState(true);
  const [loadError,     setLoadError]    = useState<string | null>(null);
  const [statusFilter,  setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy,        setSortBy]       = useState<SortOption>("newest");

  // ── Cancel confirm modal ──
  const [cancelTarget,  setCancelTarget]  = useState<AssemblyRecord | null>(null);
  const [cancelling,    setCancelling]    = useState(false);

  // ── Toast ──
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger"; message: string }>({ show: false, type: "success", message: "" });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (type: "success" | "danger", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

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

  const openColsModal = () => { setDraftOrder([...colOrder]); setDraftVisible(new Set(visibleCols)); setColSearch(""); setShowColsModal(true); };
  const closeColsModal = () => setShowColsModal(false);
  const saveColsModal  = () => {
    setColOrder([...draftOrder]);
    setVisibleCols(new Set(draftVisible));
    try {
      localStorage.setItem(COL_ORDER_LS_KEY, JSON.stringify(draftOrder.map(c => c.key)));
      localStorage.setItem(COL_VISIBLE_LS_KEY, JSON.stringify([...draftVisible]));
    } catch {}
    setShowColsModal(false);
  };
  const toggleDraft = (key: string) => setDraftVisible(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

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
  const filteredDraft = useMemo(() => draftOrder.filter(c => c.label.toLowerCase().includes(colSearch.toLowerCase())), [draftOrder, colSearch]);

  // ── Data loading ──
  const loadFresh = useCallback(async () => {
    setLoading(true); setLoadError(null);
    try {
      const res = await fetchAssemblies({ per_page: 500 });
      if (res.success) setAssemblies(Array.isArray(res.data) ? (res.data as any) : []);
      else setLoadError((res as any).message ?? "Failed to load assemblies.");
    } catch { setLoadError("Failed to load assemblies."); }
    setLoading(false);
  }, []);

  const handleRefresh = useCallback(async () => {
    bustAllAssemblyCache();
    try {
      const res = await fetchAssemblies({ per_page: 500 });
      if (res.success) setAssemblies(Array.isArray(res.data) ? (res.data as any) : []);
      else showToast("danger", (res as any).message ?? "Failed to refresh assemblies.");
    } catch { showToast("danger", "Failed to refresh assemblies."); }
  }, []);

  useEffect(() => { loadFresh(); }, []);
  useEffect(() => onMutation("assemblies:mutated", handleRefresh), [handleRefresh]);
  useEffect(() => { localStorage.setItem(VIEW_LS_KEY, view); }, [view]);
  useEffect(() => { setGridPage(12); }, [statusFilter]);

  // ── Cancel action ──
  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    const res = await cancelAssembly(cancelTarget.id);
    setCancelling(false);
    if (res.success) {
      setAssemblies(prev => prev.map(a => a.id === cancelTarget.id ? { ...a, status: "cancelled" } : a));
      bustAllAssemblyCache();
      showToast("success", `Assembly ${cancelTarget.assembly_number} cancelled.`);
    } else {
      showToast("danger", (res as any).message ?? "Failed to cancel assembly.");
    }
    setCancelTarget(null);
  };

  // ── Filtered + sorted data ──
  const filtered = useMemo(() => {
    const base = statusFilter === "all" ? assemblies : assemblies.filter(a => a.status === statusFilter);
    const q    = searchText.trim().toLowerCase();
    const searched = q
      ? base.filter(a =>
          a.assembly_number.toLowerCase().includes(q) ||
          (a.composite_item?.name ?? "").toLowerCase().includes(q) ||
          (a.location?.name ?? "").toLowerCase().includes(q)
        )
      : base;
    return [...searched].sort((a, b) => {
      switch (sortBy) {
        case "oldest":   return new Date(a.assembled_date).getTime() - new Date(b.assembled_date).getTime();
        case "num_asc":  return a.assembly_number.localeCompare(b.assembly_number);
        case "num_desc": return b.assembly_number.localeCompare(a.assembly_number);
        default:         return new Date(b.assembled_date).getTime() - new Date(a.assembled_date).getTime();
      }
    });
  }, [assemblies, statusFilter, searchText, sortBy]);

  // ── Grid search mirrors list search ──
  const gridItems = filtered;

  // ── Table columns ──
  const columns = useMemo(() => {
    const resizeCell = (key: string) => () => ({
      colKey: key, onResize: handleResize,
      currentWidth: colWidths[key] ?? DEFAULT_COL_WIDTHS[key] ?? 160,
    });

    const cols: object[] = [
      {
        title: "Assembly #",
        key: "assembly_number",
        dataIndex: "assembly_number",
        width: colWidths["assembly_number"] ?? DEFAULT_COL_WIDTHS["assembly_number"],
        onHeaderCell: resizeCell("assembly_number"),
        render: (text: string) => (
          <span className="fw-semibold fs-14">{text}</span>
        ),
      },
    ];

    for (const col of colOrder) {
      if (!visibleCols.has(col.key)) continue;
      switch (col.key) {
        case "composite_item":
          cols.push({
            title: "Composite Item",
            key: "composite_item",
            dataIndex: "composite_item",
            width: colWidths["composite_item"] ?? DEFAULT_COL_WIDTHS["composite_item"],
            onHeaderCell: resizeCell("composite_item"),
            render: (_: unknown, record: AssemblyRecord) => (
              <span className="fw-medium fs-14">{record.composite_item?.name ?? "—"}</span>
            ),
          });
          break;
        case "location":
          cols.push({
            title: "Location",
            key: "location",
            dataIndex: "location",
            width: colWidths["location"] ?? DEFAULT_COL_WIDTHS["location"],
            onHeaderCell: resizeCell("location"),
            render: (_: unknown, record: AssemblyRecord) =>
              record.location?.name
                ? <span className="d-flex align-items-center gap-1"><i className="ti ti-map-pin fs-13 text-muted" />{record.location.name}</span>
                : <span className="text-muted">—</span>,
          });
          break;
        case "assembled_date":
          cols.push({
            title: "Assembled Date",
            key: "assembled_date",
            dataIndex: "assembled_date",
            width: colWidths["assembled_date"] ?? DEFAULT_COL_WIDTHS["assembled_date"],
            onHeaderCell: resizeCell("assembled_date"),
            render: (text: string) => <span>{fmtDate(text)}</span>,
          });
          break;
        case "quantity":
          cols.push({
            title: "Qty Assembled",
            key: "quantity_to_assemble",
            dataIndex: "quantity_to_assemble",
            width: colWidths["quantity"] ?? DEFAULT_COL_WIDTHS["quantity"],
            onHeaderCell: resizeCell("quantity"),
            render: (text: string) => <span className="fw-medium">{parseFloat(text).toLocaleString("en-IN")}</span>,
          });
          break;
        case "status":
          cols.push({
            title: "Status",
            key: "status",
            dataIndex: "status",
            width: colWidths["status"] ?? DEFAULT_COL_WIDTHS["status"],
            onHeaderCell: resizeCell("status"),
            render: (text: string) => (
              <span className={`badge ${text === "completed" ? "badge-soft-success" : "badge-soft-danger"}`}>
                {text === "completed" ? "Completed" : "Cancelled"}
              </span>
            ),
          });
          break;
        case "description":
          cols.push({
            title: "Description",
            key: "description",
            dataIndex: "description",
            width: colWidths["description"] ?? DEFAULT_COL_WIDTHS["description"],
            onHeaderCell: resizeCell("description"),
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
  const exportHeaders = ["Assembly #", "Composite Item", "Location", "Assembled Date", "Qty Assembled", "Status"];
  const buildExportRows = () => filtered.map(a => [
    a.assembly_number,
    a.composite_item?.name ?? "—",
    a.location?.name ?? "—",
    fmtDate(a.assembled_date),
    parseFloat(a.quantity_to_assemble).toLocaleString("en-IN"),
    a.status === "completed" ? "Completed" : "Cancelled",
  ]);

  const handleExportPdf = () => {
    try { exportToPdfPrint("Assemblies", exportHeaders, buildExportRows()); }
    catch (e: any) { showToast("danger", e.message ?? "PDF export failed."); }
  };

  const handleExportExcel = () => {
    const rows = filtered.map(a => ({
      assembly_number: a.assembly_number,
      composite_item:  a.composite_item?.name ?? "—",
      location:        a.location?.name ?? "—",
      assembled_date:  fmtDate(a.assembled_date),
      quantity:        parseFloat(a.quantity_to_assemble).toLocaleString("en-IN"),
      status:          a.status === "completed" ? "Completed" : "Cancelled",
    }));
    exportToExcelFile("Assemblies", [
      { header: "Assembly #",     key: "assembly_number", width: 18 },
      { header: "Composite Item", key: "composite_item",  width: 28 },
      { header: "Location",       key: "location",        width: 22 },
      { header: "Assembled Date", key: "assembled_date",  width: 18 },
      { header: "Qty Assembled",  key: "quantity",        width: 16 },
      { header: "Status",         key: "status",          width: 14 },
    ], rows).catch(() => showToast("danger", "Excel export failed."));
  };

  const sortLabel: Record<SortOption, string> = {
    newest:   "Newest",
    oldest:   "Oldest",
    num_asc:  "Number A–Z",
    num_desc: "Number Z–A",
  };

  const filterLabel: Record<StatusFilter, string> = {
    all:       "All Assemblies",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="content">

          <PageHeader
            title="Assemblies"
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
              <Link to={route.newAssembly} className="btn btn-primary">
                <i className="ti ti-square-rounded-plus-filled me-1" />New Assembly
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
                        <li><button className="dropdown-item" onClick={() => setStatusFilter("all")}><i className="ti ti-layout-list me-1" />All Assemblies</button></li>
                        <li><button className="dropdown-item" onClick={() => setStatusFilter("completed")}><i className="ti ti-circle-check me-1" />Completed</button></li>
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
                        <li><button className={`dropdown-item d-flex align-items-center gap-2${sortBy === "num_asc" ? " active" : ""}`} onClick={() => setSortBy("num_asc")}><i className="ti ti-sort-ascending-letters fs-15" />Number A–Z</button></li>
                        <li><button className={`dropdown-item d-flex align-items-center gap-2${sortBy === "num_desc" ? " active" : ""}`} onClick={() => setSortBy("num_desc")}><i className="ti ti-sort-descending-letters fs-15" />Number Z–A</button></li>
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
                      <div className="rounded" style={{ width: 140, height: 16, background: "#f1f5f9", animation: "pulse 1.4s ease-in-out infinite" }} />
                      <div className="rounded" style={{ width: 200, height: 16, background: "#f1f5f9", animation: "pulse 1.4s ease-in-out infinite", animationDelay: "0.1s" }} />
                      <div className="rounded" style={{ width: 140, height: 16, background: "#f1f5f9", animation: "pulse 1.4s ease-in-out infinite", animationDelay: "0.2s" }} />
                      <div className="rounded ms-auto" style={{ width: 80, height: 22, background: "#f1f5f9", animation: "pulse 1.4s ease-in-out infinite", animationDelay: "0.15s", borderRadius: 20 }} />
                    </div>
                  ))}
                </div>
              )}

              {/* ── List view ─────────────────────────────────────────────── */}
              {!loading && view === "list" && filtered.length === 0 && !loadError && (
                <div className="text-center py-5">
                  <i className="ti ti-box-off fs-40 d-block mb-4 text-muted opacity-50" />
                  <h6 className="fw-semibold mb-2">No Assemblies</h6>
                  <p className="text-muted mb-4 fs-14">
                    {searchText || statusFilter !== "all"
                      ? "No assemblies match your current filters."
                      : "Start by assembling your first composite item."}
                  </p>
                  {!searchText && statusFilter === "all" && (
                    <Link to={route.newAssembly} className="btn btn-primary px-4">
                      <i className="ti ti-square-rounded-plus-filled me-1" />New Assembly
                    </Link>
                  )}
                </div>
              )}
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
                    onRow={(record: AssemblyRecord) => ({
                      onClick: () => navigate(`/assemblies/${record.id}`),
                      style: { cursor: "pointer" },
                    })}
                  />
                </div>
              )}

              {/* ── Grid view ─────────────────────────────────────────────── */}
              {!loading && view === "grid" && (
                <>
                  {gridItems.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="ti ti-box-off fs-40 d-block mb-4 text-muted opacity-50" />
                      <h6 className="fw-semibold mb-2">No Assemblies</h6>
                      <p className="text-muted mb-4 fs-14">Start by assembling your first composite item.</p>
                      <Link to={route.newAssembly} className="btn btn-primary px-4">
                        <i className="ti ti-square-rounded-plus-filled me-1" />New Assembly
                      </Link>
                    </div>
                  ) : (
                    <div className="row">
                      {gridItems.slice(0, gridPage).map(a => (
                        <div key={a.id} className="col-xxl-3 col-xl-4 col-md-6">
                          <div
                            className="card border shadow"
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate(`/assemblies/${a.id}`)}
                          >
                            <div className="card-body">

                              {/* Header: assembly number badge */}
                              <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                                <span className="badge badge-soft-danger fs-12">{a.assembly_number}</span>
                                <span className={`badge ${a.status === "completed" ? "badge-soft-success" : "badge-soft-danger"}`}>
                                  {a.status === "completed" ? "Completed" : "Cancelled"}
                                </span>
                              </div>

                              {/* Title block */}
                              <div className="d-block">
                                <div className="d-flex align-items-start justify-content-between mb-3">
                                  <div>
                                    <h4 className="mb-1 fs-14 fw-semibold">{a.composite_item?.name ?? "—"}</h4>
                                    <p className="fs-13 text-muted mb-0">{a.location?.name ?? "No location"}</p>
                                  </div>
                                  <span className="fs-14 fw-bold text-danger ms-2">
                                    ×{parseFloat(a.quantity_to_assemble).toLocaleString("en-IN")}
                                  </span>
                                </div>

                                <div className="mb-3">
                                  <p className="d-flex align-items-center mb-2">
                                    <span className="me-2 text-dark"><i className="ti ti-calendar fs-12" /></span>
                                    {fmtDate(a.assembled_date)}
                                  </p>
                                  {a.description && (
                                    <p className="d-flex align-items-center mb-0 text-truncate">
                                      <span className="me-2 text-dark"><i className="ti ti-notes fs-12" /></span>
                                      <span className="text-truncate">{a.description}</span>
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Footer: cancel button */}

                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {gridItems.length > gridPage && (
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
                <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>{draftVisible.size + 1} of {INITIAL_COLS.length + 1} columns visible</p>
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
              <span className="fs-14 text-muted">Assembly #</span>
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

      {/* ── Cancel Confirm Modal ──────────────────────────────────────────────── */}
      {cancelTarget && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 1060, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}
          onClick={e => { if (e.target === e.currentTarget && !cancelling) setCancelTarget(null); }}
        >
          <div style={{ background: "#fff", borderRadius: 14, width: 460, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", padding: "28px 28px 24px" }}>
            <div className="d-flex align-items-start gap-3 mb-4">
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="ti ti-alert-triangle fs-20" style={{ color: "#ef4444" }} />
              </div>
              <div>
                <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 16, color: "#0f172a" }}>Cancel Assembly?</p>
                <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>
                  This will reverse all stock movements for <strong>{cancelTarget.assembly_number}</strong>. Components will be returned and the assembled quantity deducted. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-outline-light" onClick={() => setCancelTarget(null)} disabled={cancelling}>Keep</button>
              <button className="btn btn-danger" onClick={handleConfirmCancel} disabled={cancelling}>
                {cancelling ? "Cancelling…" : "Yes, Cancel Assembly"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ────────────────────────────────────────────────────────────── */}
      <div className="position-fixed top-0 start-50 translate-middle-x pt-4" style={{ zIndex: 9999, pointerEvents: "none" }}>
        <Toast show={toast.show} onClose={() => setToast(t => ({ ...t, show: false }))}
          role="alert" aria-live="assertive" aria-atomic="true"
          style={{ pointerEvents: "auto", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.10)", border: "none", minWidth: 320, background: "#fff" }}>
          <Toast.Body className="d-flex align-items-center gap-3 px-4 py-3">
            <span className={`d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 ${toast.type === "success" ? "bg-success" : "bg-danger"}`} style={{ width: 36, height: 36 }}>
              <i className={`ti fs-16 text-white ${toast.type === "success" ? "ti-check" : "ti-x"}`} />
            </span>
            <span className="fw-medium fs-14">{toast.message}</span>
          </Toast.Body>
        </Toast>
      </div>
    </>
  );
};

export default AssembliesList;
