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
import { type ItemListRecord } from "../../../../core/services/itemApi";
import { readItemList, getItemList } from "../../../../core/cache/itemCache";
import { onMutation } from "../../../../core/cache/mutationEvents";
import { exportToExcelFile, exportToPdfPrint } from "../../../../core/utils/exportUtils";

const route = all_routes;

// ─── Column definitions ───────────────────────────────────────────────────────
interface ColDef {
  key:   string;
  label: string;
}

const INITIAL_COLS: ColDef[] = [
  { key: "sku",                  label: "SKU" },
  { key: "item_type",            label: "Type" },
  { key: "selling_price",        label: "Selling Price" },
  { key: "track_inventory",      label: "Stock On Hand" },
  { key: "reorder_point",        label: "Reorder Level" },
  { key: "account_name",         label: "Account Name" },
  { key: "brand",                label: "Brand" },
  { key: "description",          label: "Description" },
  { key: "dimensions",           label: "Dimensions" },
  { key: "ean",                  label: "EAN" },
  { key: "isbn",                 label: "ISBN" },
  { key: "mpn",                  label: "MPN" },
  { key: "manufacturer",         label: "Manufacturer" },
  { key: "product",              label: "Product" },
  { key: "purchase_account",     label: "Purchase Account Name" },
  { key: "purchase_description", label: "Purchase Description" },
  { key: "purchase_rate",        label: "Purchase Rate" },
  { key: "rate",                 label: "Rate" },
  { key: "show_in_store",        label: "Show In Store" },
  { key: "upc",                  label: "UPC" },
  { key: "usage_unit",           label: "Usage Unit" },
  { key: "weight",               label: "Weight" },
];

const DEFAULT_VISIBLE = new Set(["sku", "item_type", "selling_price", "track_inventory", "reorder_point"]);

// ─── Column resize ────────────────────────────────────────────────────────────
const DEFAULT_COL_WIDTHS: Record<string, number> = {
  name:            280,
  sku:             160,
  item_type:       140,
  selling_price:   200,
  track_inventory: 200,
  reorder_point:   200,
};
const COL_WIDTHS_LS_KEY  = "femi9_items_col_widths";
const COL_ORDER_LS_KEY   = "femi9_items_col_order";
const COL_VISIBLE_LS_KEY = "femi9_items_col_visible";
const VIEW_LS_KEY        = "femi9_items_view";

interface ResizableTitleProps extends ThHTMLAttributes<HTMLTableCellElement> {
  onResize?: (key: string, width: number) => void;
  colKey?: string;
  currentWidth?: number;
  /** "right" = normal columns; "left" = last column (handle sits at left boundary,
   *  resizes the adjacent/previous column so the last column stays flush at the right border) */
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
    // Left-side handle: startWidth is the stored width of the adjacent (second-to-last)
    // column passed via currentWidth — thRef here is the last column, not the one being resized.
    // Right-side handle: read actual rendered width of this column.
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

// Table components object is stable — defined once outside the component
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
      {/* Drag handle */}
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

type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";

// ─── Main component ───────────────────────────────────────────────────────────
const ItemsList = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<"list" | "grid">(() => {
    try { return localStorage.getItem(VIEW_LS_KEY) === "grid" ? "grid" : "list"; }
    catch { return "list"; }
  });
  const [gridPage, setGridPage] = useState(12);
  const [searchText, setSearchText]         = useState("");
  const [items, setItems]                   = useState<ItemListRecord[]>([]);
  const [total, setTotal]                   = useState(0);
  const [loading, setLoading]               = useState(true);
  const [itemTypeFilter, setItemTypeFilter] = useState<"all" | "goods" | "service" | "deleted">("all");
  const [sortBy, setSortBy]                 = useState<SortOption>("newest");
  const [deletedItems, setDeletedItems]     = useState<ItemListRecord[]>([]);
  const [deletedLoading, setDeletedLoading] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
  const [folderBtnLeft, setFolderBtnLeft]     = useState(48);

  // ── Toast ──
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" });
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

  const [loadError, setLoadError] = useState<string | null>(null);

  const loadFresh = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getItemList();
      setItems(data);
      setTotal(data.length);
    } catch (e: any) {
      setLoadError(e.message ?? "Failed to load items.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const cached = readItemList();
    if (cached) { setItems(cached); setTotal(cached.length); setLoading(false); return; }
    loadFresh();
  }, []);
  useEffect(() => { localStorage.setItem(VIEW_LS_KEY, view); }, [view]);

  // Reset grid page when filter changes
  useEffect(() => { setGridPage(12); }, [itemTypeFilter]);

  // Reload when any page mutates item data (cache already busted by the mutating page)
  useEffect(() => onMutation("items:mutated", loadFresh), [loadFresh]);

  // Reload on window focus — cache-first so no network hit if data is still fresh
  useEffect(() => {
    const onFocus = () => {
      getItemList()
        .then(data => { setItems(data); setTotal(data.length); })
        .catch(() => {});
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // Lazy-fetch deleted items when filter switches to "deleted" (cache-first)
  useEffect(() => {
    if (itemTypeFilter !== "deleted") return;
    const cached = readItemList(true);
    if (cached) { setDeletedItems(cached); return; }
    setDeletedLoading(true);
    getItemList(true)
      .then(data => { setDeletedItems(data); setDeletedLoading(false); })
      .catch(() => setDeletedLoading(false));
  }, [itemTypeFilter]);

  // Measure folder button position so tree lines align exactly under it at runtime.
  useEffect(() => {
    if (items.length === 0) return;
    const raf = requestAnimationFrame(() => {
      const btn     = document.querySelector(".items-folder-btn") as HTMLElement | null;
      const tableEl = document.querySelector(".items-custom-table table") as HTMLElement | null;
      if (btn && tableEl) {
        const x = Math.round(btn.getBoundingClientRect().left - tableEl.getBoundingClientRect().left);
        if (x > 0) setFolderBtnLeft(x);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [items]);

  const filtered = useMemo(() => {
    const base = itemTypeFilter === "deleted"
      ? deletedItems
      : itemTypeFilter === "all"
        ? items
        : items.filter(i => i.item_type === itemTypeFilter);
    return [...base].sort((a, b) => {
      switch (sortBy) {
        case "oldest":   return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "name_asc": return a.name.localeCompare(b.name);
        case "name_desc":return b.name.localeCompare(a.name);
        default:         return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [items, deletedItems, itemTypeFilter, sortBy]);

  // ── Build table columns in the saved order ──
  const columns = useMemo(() => {
    // Helper to build the onHeaderCell callback for a given column key
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
        render: (_: string, record: ItemListRecord) => {
          if (record.is_composite) {
            const isExpanded    = expandedRowKeys.includes(record.id);
            const hasComponents = (record.components?.length ?? 0) > 0;
            return (
              <div className="d-flex align-items-center gap-2">
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <button
                    type="button"
                    className="btn btn-sm border-0 p-0 d-flex align-items-center justify-content-center items-folder-btn"
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
                <Link to={`/items/${record.id}`} className="title-name fw-medium">{record.name}</Link>
              </div>
            );
          }

          // Regular (non-composite) item — image thumbnail
          const img = record.image ? `/storage/${record.image}` : null;
          return (
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded border d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                style={{ width: 36, height: 36, background: "#f5f5f5" }}
              >
                {img
                  ? <img src={img} alt={record.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <i className="ti ti-photo text-muted fs-16" />
                }
              </div>
              <Link to={`/items/${record.id}`} className="title-name fw-medium">{record.name}</Link>
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
        case "item_type":
          cols.push({
            title: "Type",
            key: "item_type",
            dataIndex: "item_type",
            width: colWidths["item_type"] ?? DEFAULT_COL_WIDTHS["item_type"],
            onHeaderCell: resizeCell("item_type"),
            render: (text: string) => (
              <span className={`badge ${text === "goods" ? "badge-soft-info" : "badge-soft-purple"}`}>
                {text === "goods" ? "Goods" : "Service"}
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
        case "track_inventory":
          cols.push({
            title: "Stock on Hand",
            key: "track_inventory",
            dataIndex: "track_inventory",
            width: colWidths["track_inventory"] ?? DEFAULT_COL_WIDTHS["track_inventory"],
            onHeaderCell: resizeCell("track_inventory"),
            render: (_: boolean, record: ItemListRecord) =>
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

    // Last column: always fills remaining space (flush with right table border).
    // Its resize handle sits on the LEFT edge and controls the second-to-last column's
    // width — so dragging left widens the last column, dragging right narrows it,
    // and the right border of the table never moves.
    if (cols.length > 1) {
      const lastCol      = cols[cols.length - 1] as any;
      const prevCol      = cols[cols.length - 2] as any;
      const adjacentKey  = prevCol.key as string;
      lastCol.onHeaderCell = () => ({
        colKey:       adjacentKey,
        onResize:     handleResize,
        currentWidth: colWidths[adjacentKey] ?? DEFAULT_COL_WIDTHS[adjacentKey] ?? 160,
        handleSide:   "left",
      });
      delete lastCol.width;
    } else if (cols.length === 1) {
      // Single column — just fill the space, no resize needed.
      delete (cols[0] as any).width;
    }

    return cols;
  }, [visibleCols, colOrder, colWidths, handleResize, expandedRowKeys]);

  // ── Grid search filter (mirrors Datatable's internal search for grid view) ──
  const gridItems = useMemo(() => {
    const base = filtered;
    if (!searchText.trim()) return base;
    const q = searchText.toLowerCase();
    return base.filter((item) =>
      Object.values(item).some((v) => String(v ?? "").toLowerCase().includes(q))
    );
  }, [filtered, searchText]);

  // ── Export handlers ──
  const exportHeaders = ["Name", "SKU", "Type", "Selling Price", "Stock Tracked", "Reorder Level", "Added On"];
  const buildExportRows = () => filtered.map(item => {
    const fmt = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
    return [
      item.name,
      item.sku || "—",
      item.item_type === "goods" ? "Goods" : "Service",
      item.selling_price ? `₹${parseFloat(item.selling_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—",
      item.track_inventory ? "Yes" : "No",
      item.reorder_point != null ? String(item.reorder_point) : "—",
      fmt(item.created_at),
    ];
  });

  const handleExportPdf = () => {
    try { exportToPdfPrint("Items", exportHeaders, buildExportRows()); }
    catch (e: any) { showToast(e.message ?? "PDF export failed.", "error"); }
  };

  const handleExportExcel = () => {
    const fmt = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
    const rows = filtered.map(item => ({
      name:          item.name,
      sku:           item.sku || "—",
      type:          item.item_type === "goods" ? "Goods" : "Service",
      selling_price: item.selling_price ? `₹${parseFloat(item.selling_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—",
      stock_tracked: item.track_inventory ? "Yes" : "No",
      reorder_level: item.reorder_point != null ? String(item.reorder_point) : "—",
      added_on:      fmt(item.created_at),
    }));
    exportToExcelFile("Items", [
      { header: "Name",          key: "name",          width: 30 },
      { header: "SKU",           key: "sku",           width: 16 },
      { header: "Type",          key: "type",          width: 12 },
      { header: "Selling Price", key: "selling_price", width: 18 },
      { header: "Stock Tracked", key: "stock_tracked", width: 14 },
      { header: "Reorder Level", key: "reorder_level", width: 16 },
      { header: "Added On",      key: "added_on",      width: 16 },
    ], rows).catch(() => showToast("Excel export failed.", "error"));
  };

  const sortLabel: Record<SortOption, string> = {
    newest:    "Newest",
    oldest:    "Oldest",
    name_asc:  "Name A–Z",
    name_desc: "Name Z–A",
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="content">

          <PageHeader title="Items" badgeCount={total} showModuleTile={false} showExport={true} onRefresh={loadFresh} onExportPdf={handleExportPdf} onExportExcel={handleExportExcel} />

          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <div className="input-icon input-icon-start position-relative">
                <span className="input-icon-addon text-dark">
                  <i className="ti ti-search" />
                </span>
                <SearchInput value={searchText} onChange={setSearchText} />
              </div>
              <Link to={route.addItem} className="btn btn-primary">
                <i className="ti ti-square-rounded-plus-filled me-1" />
                New Item
              </Link>
            </div>

            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">

                {/* Left */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="dropdown">
                    <Link to="#" className="dropdown-toggle btn btn-outline-light px-2 fs-16 fw-bold border-0" data-bs-toggle="dropdown">
                      {itemTypeFilter === "all" ? "All Items" : itemTypeFilter === "goods" ? "Goods" : itemTypeFilter === "service" ? "Services" : "Deleted Items"}
                    </Link>
                    <div className="dropdown-menu dropmenu-hover-primary">
                      <ul>
                        <li><button className="dropdown-item" onClick={() => setItemTypeFilter("all")}><i className="ti ti-layout-list me-1" />All Items</button></li>
                        <li><button className="dropdown-item" onClick={() => setItemTypeFilter("goods")}><i className="ti ti-box me-1" />Goods</button></li>
                        <li><button className="dropdown-item" onClick={() => setItemTypeFilter("service")}><i className="ti ti-settings me-1" />Services</button></li>
                        <li><button className="dropdown-item" onClick={() => setItemTypeFilter("deleted")}><i className="ti ti-trash me-1" />Deleted Items</button></li>
                      </ul>
                    </div>
                  </div>

                </div>

                {/* Right */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="dropdown">
                    <button type="button" className="dropdown-toggle btn btn-outline-light px-2 shadow" data-bs-toggle="dropdown">
                      <i className="ti ti-sort-ascending-2 me-2" />{sortLabel[sortBy]}
                    </button>
                    <div className="dropdown-menu dropmenu-hover-primary">
                      <ul>
                        <li><button className={`dropdown-item d-flex align-items-center gap-2${sortBy === "newest" ? " active" : ""}`} onClick={() => setSortBy("newest")}><i className="ti ti-clock-hour-3 fs-15" />Newest</button></li>
                        <li><button className={`dropdown-item d-flex align-items-center gap-2${sortBy === "oldest" ? " active" : ""}`} onClick={() => setSortBy("oldest")}><i className="ti ti-history fs-15" />Oldest</button></li>
                        <li><button className={`dropdown-item d-flex align-items-center gap-2${sortBy === "name_asc" ? " active" : ""}`} onClick={() => setSortBy("name_asc")}><i className="ti ti-sort-ascending-letters fs-15" />Name A–Z</button></li>
                        <li><button className={`dropdown-item d-flex align-items-center gap-2${sortBy === "name_desc" ? " active" : ""}`} onClick={() => setSortBy("name_desc")}><i className="ti ti-sort-descending-letters fs-15" />Name Z–A</button></li>
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
                  <button type="button" className="btn btn-sm btn-outline-danger ms-auto" onClick={loadFresh}>Retry</button>
                </div>
              )}
              {(loading || (itemTypeFilter === "deleted" && deletedLoading)) ? (
                <div className="text-center py-5 text-muted">
                  <span className="spinner-border spinner-border-sm me-2" />
                  {itemTypeFilter === "deleted" ? "Loading deleted items…" : "Loading items…"}
                </div>
              ) : view === "list" ? (
                <div className="items-custom-table custom-table table-nowrap">
                  <Datatable
                    columns={columns}
                    dataSource={filtered}
                    Selection={false}
                    searchText={searchText}
                    components={TABLE_COMPONENTS}
                    scroll={{ x: "max-content" }}
                    rowKey="id"
                    onRow={(record: ItemListRecord) => ({
                      onClick: () => navigate(`/items/${record.id}`, { state: itemTypeFilter === "deleted" ? { listFilter: "deleted" } : undefined }),
                      style: { cursor: "pointer" },
                    })}
                    expandable={{
                      expandedRowKeys,
                      showExpandColumn: false,
                      expandIcon: () => null,
                      expandedRowRender: (record: ItemListRecord) => {
                        const comps = record.components ?? [];
                        if (comps.length === 0) return null;
                        return (
                          <div>
                            {comps.map((comp, idx) => {
                              const isLast = idx === comps.length - 1;
                              const name   = comp.component_item?.name ?? `Item #${comp.component_item_id}`;
                              const qty    = parseFloat(comp.quantity);
                              const unit   = comp.component_item?.unit
                                ? comp.component_item.unit
                                : comp.component_type === "service" ? "service" : "unit";
                              return (
                                <div key={comp.id} className="composite-tree-row">
                                  <div className="tree-cell-pad" style={{ width: folderBtnLeft }} />
                                  <div className="tree-icon-col">
                                    <div className="tree-vline" style={{ height: isLast ? "50%" : "100%" }} />
                                    <div className="tree-hline" />
                                  </div>
                                  <div className="tree-gap" />
                                  <span className="tree-name">{name}</span>
                                  <span className="tree-qty">( {qty} {unit} )</span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      },
                      rowExpandable: (record: ItemListRecord) =>
                        record.is_composite && (record.components?.length ?? 0) > 0,
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
                        const price = item.selling_price
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
                              onClick={() => navigate(`/items/${item.id}`, { state: itemTypeFilter === "deleted" ? { listFilter: "deleted" } : undefined })}
                            >
                              <div className="card-body">

                                {/* Header: SKU badge — mirrors proposals #ID badge */}
                                <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                                  <div className="flex-shrink-0">
                                    <span className="badge badge-soft-info">{item.sku || "No SKU"}</span>
                                  </div>
                                </div>

                                {/* Title block — exact proposals template structure */}
                                <div className="d-block">
                                  <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div>
                                      <h4 className="mb-1 fs-14 fw-semibold">{item.name}</h4>
                                      <p className="fs-13 mb-0">
                                        {item.form_type === "variants" ? "With Variants" : "Single Item"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className={`badge ${item.item_type === "goods" ? "badge-soft-info" : "badge-soft-purple"}`}>
                                        {item.item_type === "goods" ? "Goods" : "Service"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Metadata rows — exact proposals template icon pattern */}
                                  <div className="mb-3">
                                    <p className="d-flex align-items-center mb-2">
                                      <span className="me-2 text-dark">
                                        <i className="ti ti-currency-rupee fs-12" />
                                      </span>
                                      {price ?? "No selling price"}
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

                                {/* Footer: image avatar + date — exact proposals "Sent to" pattern */}
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

                  {/* Load More */}
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

          {/* Fixed: Name */}
          <div className="d-flex align-items-center gap-3 px-4 py-3 border-bottom bg-light">
            <i className="ti ti-grip-vertical text-muted fs-16" style={{ opacity: 0.3 }} />
            <i className="ti ti-lock text-muted fs-15" />
            <span className="fs-14 text-muted">Name</span>
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
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1090 }}>
        <Toast
          show={toast.show}
          onClose={() => setToast(t => ({ ...t, show: false }))}
          delay={4000}
          autohide
          style={{ minWidth: 320, borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.13)" }}
        >
          <Toast.Body className="d-flex align-items-center gap-3 px-4 py-3">
            <span style={{ width: 36, height: 36, borderRadius: "50%", background: toast.type === "success" ? "#e6f9ee" : "#fff0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className={`ti ${toast.type === "success" ? "ti-check text-success" : "ti-x"} fs-18`} style={toast.type === "error" ? { color: "#e03131" } : {}} />
            </span>
            <span className="fs-14 fw-medium text-dark">{toast.message}</span>
            <button type="button" className="btn-close ms-auto" style={{ fontSize: 11 }} onClick={() => setToast(t => ({ ...t, show: false }))} />
          </Toast.Body>
        </Toast>
      </div>
    </>
  );
};

export default ItemsList;
