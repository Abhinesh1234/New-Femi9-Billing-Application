import React, { useCallback, useEffect, useMemo, useRef, useState, type ThHTMLAttributes } from "react";
import { Link, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { Toast } from "react-bootstrap";
import type { RootState } from "../../../../core/redux/store";
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
import { usePermission } from "../../../../core/hooks/usePermission";
import {
  readPriceListList,
  getPriceListList,
  bustAllPriceListCache,
  hydratePriceListDetail,
  type PriceListRecord,
} from "../../../../core/cache/priceListCache";
import { onMutation } from "../../../../core/cache/mutationEvents";
import { useWindowFocusRefresh } from "../../../../core/hooks/useWindowFocusRefresh";
import { exportToExcelFile, exportToPdfPrint } from "../../../../core/utils/exportUtils";

const route = all_routes;

// ─── Column definitions ───────────────────────────────────────────────────────
interface ColDef { key: string; label: string; }

const INITIAL_COLS: ColDef[] = [
  { key: "transaction_type",       label: "Transaction Type"   },
  { key: "price_list_type",        label: "Price List Type"    },
  { key: "customer_category_name", label: "Customer Category"  },
  { key: "is_active",              label: "Status"             },
  { key: "created_at",             label: "Created On"         },
];

const DEFAULT_VISIBLE = new Set(["transaction_type", "price_list_type", "customer_category_name", "is_active"]);

// ─── Column resize ────────────────────────────────────────────────────────────
const DEFAULT_COL_WIDTHS: Record<string, number> = {
  name:                    280,
  transaction_type:        180,
  price_list_type:         200,
  customer_category_name:  200,
  is_active:               120,
  created_at:              180,
};
const COL_WIDTHS_LS_KEY  = "femi9_price_lists_col_widths";
const COL_ORDER_LS_KEY   = "femi9_price_lists_col_order";
const COL_VISIBLE_LS_KEY = "femi9_price_lists_col_visible";
const VIEW_LS_KEY        = "femi9_price_lists_view";

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
      document.removeEventListener("mouseup",   onMouseUp);
      document.body.style.cursor     = "";
      document.body.style.userSelect = "";
      setHandleVisible(false);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup",   onMouseUp);
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

// ─── Sortable row inside the modal ────────────────────────────────────────────
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

type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";

// ─── Main component ───────────────────────────────────────────────────────────
const PriceList = () => {
  const navigate  = useNavigate();
  const authUser  = useSelector((state: RootState) => state.auth.user);
  const isParty   = authUser?.user_type === "party";
  const canCreate = usePermission("price_list", "create");

  const [view, setView] = useState<"list" | "grid">(() => {
    try { return localStorage.getItem(VIEW_LS_KEY) === "grid" ? "grid" : "list"; }
    catch { return "list"; }
  });
  const [gridPage,    setGridPage]    = useState(12);
  const [searchText,  setSearchText]  = useState("");
  const [items,       setItems]       = useState<PriceListRecord[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [loadError,   setLoadError]   = useState<string | null>(null);
  const [typeFilter,  setTypeFilter]  = useState<"all" | "sales" | "purchase" | "both" | "deleted">("all");
  const [sortBy,      setSortBy]      = useState<SortOption>("newest");
  const [deletedItems,   setDeletedItems]   = useState<PriceListRecord[]>([]);
  const [deletedLoading, setDeletedLoading] = useState(false);

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
  const [draftOrder,    setDraftOrder]    = useState<ColDef[]>(INITIAL_COLS);
  const [draftVisible,  setDraftVisible]  = useState<Set<string>>(new Set(DEFAULT_VISIBLE));

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
  const toggleDraft    = (key: string) => setDraftVisible(prev => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next; });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setDraftOrder(prev => {
        const oldIdx = prev.findIndex(c => c.key === active.id);
        const newIdx = prev.findIndex(c => c.key === over.id);
        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  };

  const filteredDraft = useMemo(
    () => draftOrder.filter(c => c.label.toLowerCase().includes(colSearch.toLowerCase())),
    [draftOrder, colSearch],
  );

  // ── Data loading ──
  const loadFresh = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getPriceListList();
      setItems(data);
    } catch (e: any) {
      setLoadError(e.message ?? "Failed to load price lists.");
    }
    setLoading(false);
  }, []);

  // Silent refresh — busts cache and updates data in place without wiping the table
  const silentRefresh = useCallback(async () => {
    bustAllPriceListCache();
    try {
      const data = await getPriceListList();
      setItems(data);
    } catch { /* ignore — data stays as is */ }
  }, []);

  // Cache-first mount
  useEffect(() => {
    const cached = readPriceListList();
    if (cached) { setItems(cached); setLoading(false); return; }
    loadFresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { localStorage.setItem(VIEW_LS_KEY, view); }, [view]);

  // Reload when any page mutates price list data — silent so table stays visible
  useEffect(() => onMutation("price-lists:mutated", silentRefresh), [silentRefresh]);
  useWindowFocusRefresh(silentRefresh);

  // Party users cannot access the deleted filter
  useEffect(() => { if (isParty && typeFilter === "deleted") setTypeFilter("all"); }, [isParty, typeFilter]);

  // Reset grid "load more" count when filter changes
  useEffect(() => { setGridPage(12); }, [typeFilter]);

  // Reload on window focus (cache-first — no network hit if data still fresh)
  useEffect(() => {
    const onFocus = () => {
      getPriceListList()
        .then(data => { setItems(data); })
        .catch(() => {});
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // Lazy-fetch deleted price lists when filter switches to "deleted" (cache-first)
  useEffect(() => {
    if (typeFilter !== "deleted") return;
    const cached = readPriceListList(true);
    if (cached) { setDeletedItems(cached); return; }
    setDeletedLoading(true);
    getPriceListList(true)
      .then(data => { setDeletedItems(data); setDeletedLoading(false); })
      .catch(() => setDeletedLoading(false));
  }, [typeFilter]);

  // ── Filtered + sorted rows (no search — Datatable handles search in list view) ──
  const filtered = useMemo(() => {
    const base = typeFilter === "deleted"
      ? deletedItems
      : typeFilter === "all"
        ? items
        : items.filter(i => i.transaction_type === typeFilter);
    const sorted = [...base].sort((a, b) => {
      switch (sortBy) {
        case "oldest":    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "name_asc":  return a.name.localeCompare(b.name);
        case "name_desc": return b.name.localeCompare(a.name);
        default:          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    if (!isParty) return sorted;
    return [
      ...sorted.filter(i => !i.is_company_list),
      ...sorted.filter(i =>  i.is_company_list),
    ];
  }, [items, deletedItems, typeFilter, sortBy, isParty]);

  // ── Grid search filter (Datatable handles search in list view) ──
  const gridItems = useMemo(() => {
    if (!searchText.trim()) return filtered;
    const q = searchText.trim().toLowerCase();
    return filtered.filter(i =>
      Object.values(i).some(v => String(v ?? "").toLowerCase().includes(q))
    );
  }, [filtered, searchText]);

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
        render: (_: string, record: PriceListRecord) =>
          record.is_company_list ? (
            <span className="d-flex align-items-center gap-2 text-muted">
              <i className="ti ti-lock fs-13" />
              {record.name}
            </span>
          ) : (
            <Link
              to={`/price-list/${record.id}`}
              className="title-name fw-medium"
              onClick={e => e.stopPropagation()}
            >
              {record.name}
            </Link>
          ),
      },
    ];

    for (const col of colOrder) {
      if (!visibleCols.has(col.key)) continue;
      switch (col.key) {
        case "transaction_type":
          cols.push({
            title: "Transaction Type",
            key: "transaction_type",
            dataIndex: "transaction_type",
            width: colWidths["transaction_type"] ?? DEFAULT_COL_WIDTHS["transaction_type"],
            onHeaderCell: resizeCell("transaction_type"),
            render: (val: string) => {
              const labels: Record<string, string> = { sales: "Sales", purchase: "Purchase", both: "Both" };
              return <span className="text-dark">{labels[val] ?? val}</span>;
            },
          });
          break;
        case "price_list_type":
          cols.push({
            title: "Price List Type",
            key: "price_list_type",
            dataIndex: "price_list_type",
            width: colWidths["price_list_type"] ?? DEFAULT_COL_WIDTHS["price_list_type"],
            onHeaderCell: resizeCell("price_list_type"),
            render: (val: string) => (
              <span className="text-dark">{val === "all_items" ? "All Items" : "Individual Items"}</span>
            ),
          });
          break;
        case "customer_category_name":
          cols.push({
            title: "Customer Category",
            key: "customer_category_name",
            dataIndex: "customer_category_name",
            width: colWidths["customer_category_name"] ?? DEFAULT_COL_WIDTHS["customer_category_name"],
            onHeaderCell: resizeCell("customer_category_name"),
            render: (val: string | null) =>
              val ? <span>{val}</span> : <span className="text-muted">—</span>,
          });
          break;
        case "is_active":
          cols.push({
            title: "Status",
            key: "is_active",
            dataIndex: "is_active",
            width: colWidths["is_active"] ?? DEFAULT_COL_WIDTHS["is_active"],
            onHeaderCell: resizeCell("is_active"),
            render: (val: boolean) => (
              <span className={`badge ${val ? "badge-soft-success" : "badge-soft-danger"}`}>
                {val ? "Active" : "Inactive"}
              </span>
            ),
          });
          break;
        case "created_at":
          cols.push({
            title: "Created On",
            key: "created_at",
            dataIndex: "created_at",
            width: colWidths["created_at"] ?? DEFAULT_COL_WIDTHS["created_at"],
            onHeaderCell: resizeCell("created_at"),
            render: (val: string) =>
              val
                ? new Date(val).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                : <span className="text-muted">—</span>,
          });
          break;
      }
    }

    // Last column: fill remaining space, left-side resize handle
    if (cols.length > 1) {
      const lastCol     = cols[cols.length - 1] as any;
      const prevCol     = cols[cols.length - 2] as any;
      const adjacentKey = prevCol.key as string;
      lastCol.onHeaderCell = () => ({
        colKey: adjacentKey,
        onResize: handleResize,
        currentWidth: colWidths[adjacentKey] ?? DEFAULT_COL_WIDTHS[adjacentKey] ?? 160,
        handleSide: "left",
      });
      delete lastCol.width;
    } else if (cols.length === 1) {
      delete (cols[0] as any).width;
    }

    return cols;
  }, [visibleCols, colOrder, colWidths, handleResize]);

  // ── Export handlers ──
  const txnLabel = (v: string) => ({ sales: "Sales", purchase: "Purchase", both: "Both" }[v] ?? v);
  const plLabel  = (v: string) => v === "all_items" ? "All Items" : "Individual Items";
  const fmtDate  = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  const plExportHeaders = ["Name", "Transaction Type", "Price List Type", "Customer Category", "Status", "Created On"];
  const buildPlExportRows = () => filtered.map(r => [
    r.name,
    txnLabel(r.transaction_type),
    plLabel(r.price_list_type),
    r.customer_category_name ?? "—",
    r.is_active ? "Active" : "Inactive",
    fmtDate(r.created_at),
  ]);

  const handleExportPdf = () => {
    try { exportToPdfPrint("Price Lists", plExportHeaders, buildPlExportRows()); }
    catch (e: any) { showToast("danger", e.message ?? "PDF export failed."); }
  };

  const handleExportExcel = () => {
    const rows = filtered.map(r => ({
      name:             r.name,
      transaction_type: txnLabel(r.transaction_type),
      price_list_type:  plLabel(r.price_list_type),
      customer_cat:     r.customer_category_name ?? "—",
      status:           r.is_active ? "Active" : "Inactive",
      created_at:       fmtDate(r.created_at),
    }));
    exportToExcelFile("Price_Lists", [
      { header: "Name",              key: "name",             width: 28 },
      { header: "Transaction Type",  key: "transaction_type", width: 18 },
      { header: "Price List Type",   key: "price_list_type",  width: 20 },
      { header: "Customer Category", key: "customer_cat",     width: 22 },
      { header: "Status",            key: "status",           width: 12 },
      { header: "Created On",        key: "created_at",       width: 18 },
    ], rows).catch(() => showToast("danger", "Export failed."));
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <PageHeader
            title="Price Lists"
            badgeCount={filtered.length}
            showModuleTile={false}
            showExport={true}
            onRefresh={silentRefresh}
            onExportPdf={handleExportPdf}
            onExportExcel={handleExportExcel}
          />

          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <div className="input-icon input-icon-start position-relative">
                <span className="input-icon-addon text-dark">
                  <i className="ti ti-search" />
                </span>
                <SearchInput value={searchText} onChange={setSearchText} />
              </div>
              {canCreate && (
                <Link to={route.newPriceList} className="btn btn-primary">
                  <i className="ti ti-square-rounded-plus-filled me-1" />
                  New Price List
                </Link>
              )}
            </div>

            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">

                {/* Left — type filter */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="dropdown">
                    <Link
                      to="#"
                      className="dropdown-toggle btn btn-outline-light px-2 fs-16 fw-bold border-0"
                      data-bs-toggle="dropdown"
                    >
                      {typeFilter === "all" ? "All Price Lists" : typeFilter === "sales" ? "Sales" : typeFilter === "purchase" ? "Purchase" : typeFilter === "both" ? "Both" : "Deleted Price Lists"}
                    </Link>
                    <div className="dropdown-menu dropmenu-hover-primary">
                      <ul>
                        <li>
                          <button className="dropdown-item" onClick={() => setTypeFilter("all")}>
                            <i className="ti ti-layout-list me-1" />All Price Lists
                          </button>
                        </li>
                        <li>
                          <button className="dropdown-item" onClick={() => setTypeFilter("sales")}>
                            <i className="ti ti-trending-up me-1" />Sales
                          </button>
                        </li>
                        <li>
                          <button className="dropdown-item" onClick={() => setTypeFilter("purchase")}>
                            <i className="ti ti-trending-down me-1" />Purchase
                          </button>
                        </li>
                        <li>
                          <button className="dropdown-item" onClick={() => setTypeFilter("both")}>
                            <i className="ti ti-arrows-exchange me-1" />Both
                          </button>
                        </li>
                        {!isParty && (
                          <li>
                            <button className="dropdown-item" onClick={() => setTypeFilter("deleted")}>
                              <i className="ti ti-trash me-1" />Deleted Price Lists
                            </button>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right — sort + manage cols + view toggle */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="dropdown">
                    <button type="button" className="dropdown-toggle btn btn-outline-light px-2 shadow" data-bs-toggle="dropdown">
                      <i className="ti ti-sort-ascending-2 me-2" />
                      {{ newest: "Newest", oldest: "Oldest", name_asc: "Name A–Z", name_desc: "Name Z–A" }[sortBy]}
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

              {(loading || (typeFilter === "deleted" && deletedLoading)) ? null : view === "list" ? (
                <div className="custom-table table-nowrap">
                  <Datatable
                    columns={columns}
                    dataSource={filtered}
                    Selection={false}
                    searchText={searchText}
                    components={TABLE_COMPONENTS}
                    scroll={{ x: "max-content" }}
                    rowKey="id"
                    onRow={(record: PriceListRecord) => ({
                      onClick: () => {
                        if (record.is_company_list) return;
                        hydratePriceListDetail(record);
                        navigate(`/price-list/${record.id}`, { state: typeFilter === "deleted" ? { listFilter: "deleted" } : undefined });
                      },
                      style: { cursor: record.is_company_list ? "default" : "pointer" },
                    })}
                  />
                </div>
              ) : (
                /* ── Grid view ─────────────────────────────────────────── */
                <>
                  {gridItems.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="ti ti-tag fs-40 d-block mb-4 text-muted opacity-50" />
                      <h6 className="fw-semibold mb-2">No Price Lists</h6>
                      <p className="text-muted mb-4 fs-14">Get started by creating your first price list.</p>
                      {canCreate && (
                        <Link to={route.newPriceList} className="btn btn-primary px-4">
                          <i className="ti ti-square-rounded-plus-filled me-1" />
                          Add New Price List
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="row">
                      {gridItems.slice(0, gridPage).map(item => {
                        const date = new Date(item.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        });
                        const txnLabels: Record<string, string> = { sales: "Sales", purchase: "Purchase", both: "Both" };

                        return (
                          <div key={item.id} className="col-xxl-3 col-xl-4 col-md-6">
                            <div
                              className="card border shadow"
                              style={{ cursor: item.is_company_list ? "default" : "pointer", opacity: item.is_company_list ? 0.7 : 1 }}
                              onClick={() => { if (!item.is_company_list) { hydratePriceListDetail(item); navigate(`/price-list/${item.id}`, { state: typeFilter === "deleted" ? { listFilter: "deleted" } : undefined }); } }}
                            >
                              <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                                  <span className="fs-13 text-muted">{txnLabels[item.transaction_type] ?? item.transaction_type}</span>
                                  <div className="d-flex align-items-center gap-2">
                                    {item.is_company_list && (
                                      <span className="badge badge-soft-secondary fs-11">
                                        <i className="ti ti-lock me-1 fs-11" />Company
                                      </span>
                                    )}
                                    <span className={`badge ${item.is_active ? "badge-soft-success" : "badge-soft-danger"}`}>
                                      {item.is_active ? "Active" : "Inactive"}
                                    </span>
                                  </div>
                                </div>

                                <div className="d-block">
                                  <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div>
                                      <h4 className="mb-1 fs-14 fw-semibold">{item.name}</h4>
                                      <p className="fs-13 mb-0 text-muted">
                                        {item.price_list_type === "all_items" ? "All Items" : "Individual Items"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mb-3">
                                    <p className="d-flex align-items-center mb-2">
                                      <span className="me-2 text-dark"><i className="ti ti-tag fs-12" /></span>
                                      {item.customer_category_name ?? "No customer category"}
                                    </p>
                                    <p className="d-flex align-items-center mb-0">
                                      <span className="me-2 text-dark"><i className="ti ti-calendar fs-12" /></span>
                                      Created {date}
                                    </p>
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
                        onClick={() => setGridPage(p => p + 12)}
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
              <button
                type="button"
                onClick={closeColsModal}
                style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #fecaca", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}
              >
                <i className="ti ti-x" style={{ fontSize: 14, color: "#ef4444", lineHeight: 1 }} />
              </button>
            </div>
            <div style={{ padding: "14px 24px 10px", flexShrink: 0 }}>
              <div className="input-icon input-icon-start position-relative">
                <span className="input-icon-addon text-muted" style={{ left: 12 }}>
                  <i className="ti ti-search fs-15" />
                </span>
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Search columns…"
                  value={colSearch}
                  onChange={e => setColSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="d-flex align-items-center gap-3 px-4 py-3 border-bottom bg-light" style={{ flexShrink: 0 }}>
              <i className="ti ti-grip-vertical text-muted fs-16" style={{ opacity: 0.3 }} />
              <i className="ti ti-lock text-muted fs-15" />
              <span className="fs-14 text-muted">Name</span>
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

      {/* ── Toast notification ───────────────────────────────────────────────── */}
      <div className="position-fixed top-0 start-50 translate-middle-x pt-4" style={{ zIndex: 9999, pointerEvents: "none" }}>
        <Toast
          show={toast.show}
          onClose={() => setToast((t) => ({ ...t, show: false }))}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{ pointerEvents: "auto", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.10)", border: "none", minWidth: 320, background: "#fff" }}
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

export default PriceList;
