import React, { useCallback, useEffect, useMemo, useRef, useState, type ThHTMLAttributes } from "react";
import { Link, useNavigate } from "react-router";
import { Modal } from "react-bootstrap";
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
import { fetchCompositeItems, type CompositeItemRecord } from "../../../../core/services/compositeItemApi";

const route = all_routes;

// ─── Column definitions ───────────────────────────────────────────────────────
interface ColDef {
  key:   string;
  label: string;
}

const INITIAL_COLS: ColDef[] = [
  { key: "sku",            label: "SKU" },
  { key: "composite_type", label: "Type" },
  { key: "selling_price",  label: "Selling Price" },
  { key: "cost_price",     label: "Cost Price" },
  { key: "track_inventory", label: "Stock On Hand" },
  { key: "reorder_point",  label: "Reorder Level" },
  { key: "item_type",      label: "Item Type" },
  { key: "description",    label: "Description" },
  { key: "account_name",   label: "Account Name" },
];

const DEFAULT_VISIBLE = new Set(["sku", "composite_type", "selling_price", "cost_price", "track_inventory", "reorder_point"]);

// ─── Column resize ────────────────────────────────────────────────────────────
const DEFAULT_COL_WIDTHS: Record<string, number> = {
  name:            280,
  sku:             160,
  composite_type:  140,
  selling_price:   180,
  cost_price:      180,
  track_inventory: 180,
  reorder_point:   180,
};
const COL_WIDTHS_LS_KEY = "femi9_composite_items_col_widths";
const VIEW_LS_KEY       = "femi9_composite_items_view";

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
const CompositeItemsList = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<"list" | "grid">(() => {
    try { return localStorage.getItem(VIEW_LS_KEY) === "grid" ? "grid" : "list"; }
    catch { return "list"; }
  });
  const [gridPage, setGridPage]             = useState(12);
  const [searchText, setSearchText]         = useState("");
  const [items, setItems]                   = useState<CompositeItemRecord[]>([]);
  const [total, setTotal]                   = useState(0);
  const [loading, setLoading]               = useState(true);
  const [typeFilter, setTypeFilter]         = useState<"all" | "assembly" | "kit">("all");
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
  // Measured left-edge of the folder button relative to the <table> element.
  // Used so tree connector lines land exactly under the folder icon regardless of
  // how Ant Design renders the selection column + cell padding at runtime.
  const [folderBtnLeft, setFolderBtnLeft] = useState(48); // safe default

  // ── Customize Columns modal ──
  const [showColsModal, setShowColsModal]   = useState(false);
  const [colSearch, setColSearch]           = useState("");
  const [colOrder, setColOrder]             = useState<ColDef[]>(INITIAL_COLS);
  const [visibleCols, setVisibleCols]       = useState<Set<string>>(new Set(DEFAULT_VISIBLE));
  const [draftOrder, setDraftOrder]         = useState<ColDef[]>(INITIAL_COLS);
  const [draftVisible, setDraftVisible]     = useState<Set<string>>(new Set(DEFAULT_VISIBLE));

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
    setColOrder([...draftOrder]);
    setVisibleCols(new Set(draftVisible));
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

  const [loadError, setLoadError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    const res = await fetchCompositeItems({ per_page: 100 });
    if (res.success) {
      setItems(res.data.data);
      setTotal(res.data.total);
    } else {
      setLoadError((res as any).message ?? "Failed to load composite items.");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { localStorage.setItem(VIEW_LS_KEY, view); }, [view]);

  // After items load, measure the actual pixel offset of the folder button inside
  // the <table> so the tree connector lines align exactly regardless of how Ant
  // Design renders the selection column / cell padding at runtime.
  useEffect(() => {
    if (items.length === 0) return;
    const raf = requestAnimationFrame(() => {
      const btn      = document.querySelector(".composite-folder-btn") as HTMLElement | null;
      const tableEl  = document.querySelector(".custom-table table")   as HTMLElement | null;
      if (btn && tableEl) {
        const x = Math.round(btn.getBoundingClientRect().left - tableEl.getBoundingClientRect().left);
        if (x > 0) setFolderBtnLeft(x);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [items]);

  const filtered = typeFilter === "all"
    ? items
    : items.filter((i) => i.composite_type === typeFilter);

  // ── Build table columns ──
  const columns = useMemo(() => {
    const resizeCell = (key: string) => () => ({
      colKey: key,
      onResize: handleResize,
      currentWidth: colWidths[key] ?? DEFAULT_COL_WIDTHS[key] ?? 160,
    });

    const cols: object[] = [
      {
        title: "Name",
        key: "name",
        dataIndex: "name",
        width: colWidths["name"] ?? DEFAULT_COL_WIDTHS["name"],
        onHeaderCell: resizeCell("name"),
        render: (_: string, record: CompositeItemRecord) => {
          const isExpanded = expandedRowKeys.includes(record.id);
          const hasComponents = (record.components?.length ?? 0) > 0;
          return (
            <div className="d-flex align-items-center gap-2">
              {/* Wrapper gives us a position context for the connector tail */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <button
                  type="button"
                  className="btn btn-sm border-0 p-0 d-flex align-items-center justify-content-center composite-folder-btn"
                  style={{
                    width: 28, height: 28,
                    background: isExpanded ? "#fff1f0" : "#f5f5f5",
                    borderRadius: 6,
                    cursor: hasComponents ? "pointer" : "default",
                    opacity: hasComponents ? 1 : 0.45,
                    position: "relative",
                    zIndex: 1,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!hasComponents) return;
                    setExpandedRowKeys((prev) =>
                      prev.includes(record.id)
                        ? prev.filter((k) => k !== record.id)
                        : [...prev, record.id]
                    );
                  }}
                  title={hasComponents ? (isExpanded ? "Collapse" : "Expand components") : "No components"}
                >
                  <i
                    className={`ti ${isExpanded ? "ti-folder-open" : "ti-folder"} fs-15`}
                    style={{ color: isExpanded ? "#e03131" : "#6c757d" }}
                  />
                </button>
                {/* Connector tail: draws a line from folder-button centre to the cell bottom,
                    so the tree vline in the expanded row appears to originate from the folder.
                    Height = half button (14px) + cell bottom padding (16px) = 30px */}
                {isExpanded && hasComponents && (
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: "translateX(-50%)",
                      width: 1,
                      height: 30,
                      background: "#ced4da",
                      pointerEvents: "none",
                    }}
                  />
                )}
              </div>
              <Link to="#" className="title-name fw-medium">{record.name}</Link>
            </div>
          );
        },
      },
    ];

    const emptyCol = (title: string, key: string) => ({
      title,
      key,
      dataIndex: key,
      width: colWidths[key] ?? DEFAULT_COL_WIDTHS[key] ?? 160,
      onHeaderCell: resizeCell(key),
      render: () => <span className="text-muted">—</span>,
    });

    for (const col of colOrder) {
      if (!visibleCols.has(col.key)) continue;
      switch (col.key) {
        case "sku":
          cols.push({
            title: "SKU",
            key: "sku",
            dataIndex: "sku",
            width: colWidths["sku"] ?? DEFAULT_COL_WIDTHS["sku"],
            onHeaderCell: resizeCell("sku"),
            render: (text: string | null) => <span className="text-muted">{text || "—"}</span>,
          });
          break;
        case "composite_type":
          cols.push({
            title: "Type",
            key: "composite_type",
            dataIndex: "composite_type",
            width: colWidths["composite_type"] ?? DEFAULT_COL_WIDTHS["composite_type"],
            onHeaderCell: resizeCell("composite_type"),
            render: (text: string) => (
              <span className={`badge ${text === "assembly" ? "badge-soft-info" : "badge-soft-purple"}`}>
                {text === "assembly" ? "Assembly" : "Kit"}
              </span>
            ),
          });
          break;
        case "selling_price":
          cols.push({
            title: "Selling Price",
            key: "selling_price",
            dataIndex: "selling_price",
            width: colWidths["selling_price"] ?? DEFAULT_COL_WIDTHS["selling_price"],
            onHeaderCell: resizeCell("selling_price"),
            render: (text: string | null) =>
              text ? `₹${parseFloat(text).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—",
          });
          break;
        case "cost_price":
          cols.push({
            title: "Cost Price",
            key: "cost_price",
            dataIndex: "cost_price",
            width: colWidths["cost_price"] ?? DEFAULT_COL_WIDTHS["cost_price"],
            onHeaderCell: resizeCell("cost_price"),
            render: (text: string | null) =>
              text ? `₹${parseFloat(text).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—",
          });
          break;
        case "track_inventory":
          cols.push({
            title: "Stock on Hand",
            key: "track_inventory",
            dataIndex: "track_inventory",
            width: colWidths["track_inventory"] ?? DEFAULT_COL_WIDTHS["track_inventory"],
            onHeaderCell: resizeCell("track_inventory"),
            render: (_: boolean, record: CompositeItemRecord) =>
              record.track_inventory ? "0.00" : <span className="text-muted">—</span>,
          });
          break;
        case "reorder_point":
          cols.push({
            title: "Reorder Level",
            key: "reorder_point",
            dataIndex: "reorder_point",
            width: colWidths["reorder_point"] ?? DEFAULT_COL_WIDTHS["reorder_point"],
            onHeaderCell: resizeCell("reorder_point"),
            render: (val: number | null) =>
              val != null ? val : <span className="text-muted">—</span>,
          });
          break;
        default:
          cols.push(emptyCol(col.label, col.key));
      }
    }

    // Last column: flush right, left-side resize handle controls second-to-last column
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
  }, [visibleCols, colOrder, colWidths, handleResize, expandedRowKeys]);

  // ── Grid search filter ──
  const gridItems = useMemo(() => {
    const base = filtered;
    if (!searchText.trim()) return base;
    const q = searchText.toLowerCase();
    return base.filter((item) =>
      Object.values(item).some((v) => String(v ?? "").toLowerCase().includes(q))
    );
  }, [filtered, searchText]);

  return (
    <>
      <div className="page-wrapper">
        <div className="content">

          <PageHeader title="Composite Items" badgeCount={total} showModuleTile={false} showExport={true} />

          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <div className="input-icon input-icon-start position-relative">
                <span className="input-icon-addon text-dark">
                  <i className="ti ti-search" />
                </span>
                <SearchInput value={searchText} onChange={setSearchText} />
              </div>
              <Link to={route.addCompositeItem} className="btn btn-primary">
                <i className="ti ti-square-rounded-plus-filled me-1" />
                New Composite Item
              </Link>
            </div>

            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">

                {/* Left — type filter */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="dropdown">
                    <Link to="#" className="dropdown-toggle btn btn-outline-light px-2 fs-16 fw-bold border-0" data-bs-toggle="dropdown">
                      {typeFilter === "all" ? "All Types" : typeFilter === "assembly" ? "Assembly" : "Kit"}
                    </Link>
                    <div className="dropdown-menu dropmenu-hover-primary">
                      <ul>
                        <li><button className="dropdown-item" onClick={() => setTypeFilter("all")}><i className="ti ti-dots-vertical me-1" /> All Types</button></li>
                        <li><button className="dropdown-item" onClick={() => setTypeFilter("assembly")}><i className="ti ti-dots-vertical me-1" /> Assembly</button></li>
                        <li><button className="dropdown-item" onClick={() => setTypeFilter("kit")}><i className="ti ti-dots-vertical me-1" /> Kit</button></li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="dropdown">
                    <Link to="#" className="dropdown-toggle btn btn-outline-light px-2 shadow" data-bs-toggle="dropdown">
                      <i className="ti ti-sort-ascending-2 me-2" />Sort By
                    </Link>
                    <div className="dropdown-menu dropmenu-hover-primary">
                      <ul>
                        <li><Link to="#" className="dropdown-item">Newest</Link></li>
                        <li><Link to="#" className="dropdown-item">Oldest</Link></li>
                        <li><Link to="#" className="dropdown-item">Name A–Z</Link></li>
                        <li><Link to="#" className="dropdown-item">Name Z–A</Link></li>
                      </ul>
                    </div>
                  </div>

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
                </div>
              </div>

              {loadError && (
                <div className="alert alert-danger mx-3 mt-3 mb-0 d-flex align-items-center gap-2">
                  <i className="ti ti-alert-circle" />
                  {loadError}
                  <button type="button" className="btn btn-sm btn-outline-danger ms-auto" onClick={load}>Retry</button>
                </div>
              )}
              {loading ? (
                <div className="text-center py-5 text-muted">
                  <span className="spinner-border spinner-border-sm me-2" />
                  Loading items…
                </div>
              ) : view === "list" ? (
                <div className="custom-table table-nowrap">
                  <Datatable
                    columns={columns}
                    dataSource={filtered}
                    Selection={true}
                    searchText={searchText}
                    components={TABLE_COMPONENTS}
                    scroll={{ x: "max-content" }}
                    rowKey="id"
                    onRow={(record: CompositeItemRecord) => ({
                      onClick: () => navigate(`/composite-items/${record.id}`),
                      style: { cursor: "pointer" },
                    })}
                    expandable={{
                      expandedRowKeys,
                      showExpandColumn: false,
                      expandIcon: () => null,
                      expandedRowRender: (record: CompositeItemRecord) => {
                        const comps = record.components ?? [];
                        if (comps.length === 0) return null;
                        return (
                          <div>
                            {comps.map((comp, idx) => {
                              const isLast = idx === comps.length - 1;
                              const name = comp.component_item?.name ?? `Item #${comp.component_item_id}`;
                              const qty  = parseFloat(comp.quantity);
                              const unit = comp.component_item?.unit
                                ? comp.component_item.unit
                                : comp.component_type === "service" ? "service" : "unit";
                              return (
                                <div key={comp.id} className="composite-tree-row">
                                  {/* Width = measured left-edge of folder button, so the
                                      tree-icon-col centre lands directly under the folder */}
                                  <div className="tree-cell-pad" style={{ width: folderBtnLeft }} />
                                  {/* 28px — same as folder button width; tree lines live here */}
                                  <div className="tree-icon-col">
                                    <div className="tree-vline" style={{ height: isLast ? "50%" : "100%" }} />
                                    <div className="tree-hline" />
                                  </div>
                                  {/* 8px gap — matches gap-2 in the Name cell flex row */}
                                  <div className="tree-gap" />
                                  <span className="tree-name">{name}</span>
                                  <span className="tree-qty">( {qty} {unit} )</span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      },
                      rowExpandable: (record: CompositeItemRecord) => (record.components?.length ?? 0) > 0,
                    }}
                  />
                </div>
              ) : (
                /* ── Grid view ─────────────────────────────────────── */
                <>
                  {gridItems.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="ti ti-mood-empty fs-32 d-block mb-2" />
                      No items found
                    </div>
                  ) : (
                    <div className="row">
                      {gridItems.slice(0, gridPage).map((item) => {
                        const img = item.image ? `/storage/${item.image}` : null;
                        const sellingPrice = item.selling_price
                          ? `₹${parseFloat(item.selling_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                          : null;
                        const date = new Date(item.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        });

                        return (
                          <div key={item.id} className="col-xxl-3 col-xl-4 col-md-6">
                            <div
                              className="card border shadow"
                              style={{ cursor: "pointer" }}
                              onClick={() => navigate(`/composite-items/${item.id}`)}
                            >
                              <div className="card-body">

                                <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                                  <div className="flex-shrink-0">
                                    <span className="badge badge-soft-info">{item.sku || "No SKU"}</span>
                                  </div>
                                </div>

                                <div className="d-block">
                                  <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div>
                                      <h4 className="mb-1 fs-14 fw-semibold">{item.name}</h4>
                                      <p className="fs-13 mb-0">
                                        {item.item_type === "goods" ? "Goods" : "Service"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className={`badge ${item.composite_type === "assembly" ? "badge-soft-info" : "badge-soft-purple"}`}>
                                        {item.composite_type === "assembly" ? "Assembly" : "Kit"}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="mb-3">
                                    <p className="d-flex align-items-center mb-2">
                                      <span className="me-2 text-dark">
                                        <i className="ti ti-currency-rupee fs-12" />
                                      </span>
                                      {sellingPrice ?? "No selling price"}
                                    </p>
                                    <p className="d-flex align-items-center mb-2">
                                      <span className="me-2 text-dark">
                                        <i className="ti ti-building-warehouse fs-12" />
                                      </span>
                                      {item.track_inventory ? "Stock Tracked" : "Inventory not tracked"}
                                    </p>
                                    <p className="d-flex align-items-center">
                                      <span className="me-2 text-dark">
                                        <i className="ti ti-alert-triangle fs-12" />
                                      </span>
                                      {item.reorder_point != null
                                        ? `Reorder at ${item.reorder_point}`
                                        : "No reorder level"
                                      }
                                    </p>
                                  </div>
                                </div>

                                <div className="rounded">
                                  <div className="d-flex align-items-center">
                                    <div className="avatar rounded-circle bg-white border me-2 d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0">
                                      {img
                                        ? <img src={img} alt={item.name} className="w-auto h-auto" style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                                        : <i className="ti ti-photo text-muted fs-16" />
                                      }
                                    </div>
                                    <div className="d-flex flex-column">
                                      <span className="d-block">Added on</span>
                                      <span className="text-default">{date}</span>
                                    </div>
                                  </div>
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
                {draftVisible.size + 2} of {INITIAL_COLS.length + 2} Selected
              </span>
              <button type="button" className="btn-close" onClick={closeColsModal} aria-label="Close" />
            </div>
          </div>
        </Modal.Header>

        <Modal.Body className="p-0">
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

          <div className="d-flex align-items-center gap-3 px-4 py-3 border-bottom bg-light">
            <i className="ti ti-grip-vertical text-muted fs-16" style={{ opacity: 0.3 }} />
            <i className="ti ti-lock text-muted fs-15" />
            <span className="fs-14 text-muted">Name</span>
            <span className="ms-auto badge badge-soft-secondary fs-11">Fixed</span>
          </div>

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
    </>
  );
};

export default CompositeItemsList;
