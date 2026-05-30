import { useCallback, useEffect, useMemo, useRef, useState, type ThHTMLAttributes } from "react";
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
import { type DistributionCategory as Category, readDistributionCategories as readCategories, getDistributionCategories as getCategories, bustDistributionCategories as bustCategories } from "../../../../core/cache/distributionCategoryCache";
import { onMutation } from "../../../../core/cache/mutationEvents";
import { exportToExcelFile, exportToPdfPrint } from "../../../../core/utils/exportUtils";
import { usePermission } from "../../../../core/hooks/usePermission";

const route = all_routes;

// ─── Column definitions ───────────────────────────────────────────────────────
interface ColDef { key: string; label: string; }

const INITIAL_COLS: ColDef[] = [
  { key: "parent", label: "Parent Category" },
];

const DEFAULT_VISIBLE = new Set(["parent"]);

// ─── Column resize ────────────────────────────────────────────────────────────
const DEFAULT_COL_WIDTHS: Record<string, number> = {
  name:   280,
  parent: 240,
};
const COL_WIDTHS_LS_KEY  = "femi9_customer_categories_col_widths";
const COL_ORDER_LS_KEY   = "femi9_customer_categories_col_order";
const COL_VISIBLE_LS_KEY = "femi9_customer_categories_col_visible";
const VIEW_LS_KEY        = "femi9_customer_categories_view";

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
      onResize(colKey, Math.max(60, startWidth + ev.clientX - startX));
    };
    const onMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      setHandleVisible(false);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const canResize = !!onResize && !!colKey;
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
type FilterOption = "all" | "root" | "child";

// ─── Main component ───────────────────────────────────────────────────────────
const DistributionCategoryList = () => {
  const navigate = useNavigate();
  const canCreate = usePermission("parties", "create");

  const [view, setView] = useState<"list" | "grid">(() => {
    try { return localStorage.getItem(VIEW_LS_KEY) === "grid" ? "grid" : "list"; }
    catch { return "list"; }
  });
  const [gridPage, setGridPage]         = useState(12);
  const [searchText, setSearchText]     = useState("");
  const [items, setItems]               = useState<Category[]>([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [loadError, setLoadError]       = useState<string | null>(null);
  const [typeFilter, setTypeFilter]     = useState<FilterOption>("all");
  const [sortBy, setSortBy]             = useState<SortOption>("newest");

  // ── Toast ──
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "danger" }>({ show: false, message: "", type: "success" });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (message: string, type: "success" | "danger" = "success") => {
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
  const [draftOrder, setDraftOrder]     = useState<ColDef[]>(INITIAL_COLS);
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
        const oldIndex = prev.findIndex(c => c.key === active.id);
        const newIndex = prev.findIndex(c => c.key === over.id);
        return arrayMove(prev, oldIndex, newIndex);
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
      bustCategories();
      const data = await getCategories();
      setItems(data);
      setTotal(data.length);
    } catch (e: any) {
      setLoadError(e.message ?? "Failed to load categories.");
    }
    setLoading(false);
  }, []);

  // Silent refresh — updates data in place without wiping the table
  const silentRefresh = useCallback(async () => {
    bustCategories();
    try {
      const data = await getCategories();
      setItems(data);
      setTotal(data.length);
    } catch { /* ignore — data stays as is */ }
  }, []);

  useEffect(() => {
    const cached = readCategories();
    if (cached) { setItems(cached); setTotal(cached.length); setLoading(false); return; }
    getCategories()
      .then(data => { setItems(data); setTotal(data.length); setLoading(false); })
      .catch((e: any) => { setLoadError(e.message ?? "Failed to load categories."); setLoading(false); });
  }, []);

  useEffect(() => { localStorage.setItem(VIEW_LS_KEY, view); }, [view]);
  useEffect(() => { setGridPage(12); }, [typeFilter]);
  useEffect(() => onMutation("distribution-categories:mutated", silentRefresh), [silentRefresh]);

  useEffect(() => {
    let seq = 0;
    const onFocus = () => {
      const current = ++seq;
      getCategories()
        .then(data => { if (current === seq) { setItems(data); setTotal(data.length); } })
        .catch(() => {});
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // ── Filtering + sorting ──
  const filtered = useMemo(() => {
    const base = typeFilter === "root"
      ? items.filter(i => i.parent_id === null)
      : typeFilter === "child"
        ? items.filter(i => i.parent_id !== null)
        : items;
    return [...base].sort((a, b) => {
      switch (sortBy) {
        case "name_asc":  return a.name.localeCompare(b.name);
        case "name_desc": return b.name.localeCompare(a.name);
        case "oldest":    return a.id - b.id;
        default:          return b.id - a.id;
      }
    });
  }, [items, typeFilter, sortBy]);

  // ── Table columns ──
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
        render: (_: string, record: Category) => (
          <Link to={`/distribution-categories/${record.id}/edit`} className="title-name fw-medium">{record.name}</Link>
        ),
      },
    ];

    for (const col of colOrder) {
      if (!visibleCols.has(col.key)) continue;
      if (col.key === "parent") {
        cols.push({
          title: "Parent Category",
          key: "parent",
          dataIndex: "parent",
          width: colWidths["parent"] ?? DEFAULT_COL_WIDTHS["parent"],
          onHeaderCell: resizeCell("parent"),
          render: (_: any, record: Category) =>
            record.parent
              ? <span>{record.parent.name}</span>
              : <span className="text-muted">—</span>,
        });
      }
    }

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

  // ── Grid search ──
  const gridItems = useMemo(() => {
    if (!searchText.trim()) return filtered;
    const q = searchText.toLowerCase();
    return filtered.filter(i =>
      i.name.toLowerCase().includes(q) ||
      (i.parent?.name ?? "").toLowerCase().includes(q)
    );
  }, [filtered, searchText]);

  // ── Export ──
  const exportHeaders = ["Name", "Parent Category"];
  const buildExportRows = () => filtered.map(i => [i.name, i.parent?.name ?? "—"]);

  const handleExportPdf = () => {
    try { exportToPdfPrint("Distribution Categories", exportHeaders, buildExportRows()); }
    catch (e: any) { showToast(e.message ?? "PDF export failed.", "danger"); }
  };

  const handleExportExcel = () => {
    exportToExcelFile("Distribution Categories", [
      { header: "Name",            key: "name",   width: 30 },
      { header: "Parent Category", key: "parent", width: 24 },
    ], filtered.map(i => ({ name: i.name, parent: i.parent?.name ?? "—" })))
      .catch(() => showToast("Excel export failed.", "danger"));
  };

  const sortLabel: Record<SortOption, string> = { newest: "Newest", oldest: "Oldest", name_asc: "Name A–Z", name_desc: "Name Z–A" };
  const filterLabel: Record<FilterOption, string> = { all: "All Categories", root: "Root Categories", child: "Sub-Categories" };

  return (
    <>
      <div className="page-wrapper">
        <div className="content">

          <PageHeader
            title="Distribution Categories"
            badgeCount={total}
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
                <Link to={route.addDistributionCategory} className="btn btn-primary">
                  <i className="ti ti-square-rounded-plus-filled me-1" />
                  New Category
                </Link>
              )}
            </div>

            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">

                {/* Left — type filter */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="dropdown">
                    <Link to="#" className="dropdown-toggle btn btn-outline-light px-2 fs-16 fw-bold border-0" data-bs-toggle="dropdown">
                      {filterLabel[typeFilter]}
                    </Link>
                    <div className="dropdown-menu dropmenu-hover-primary">
                      <ul>
                        <li><button className="dropdown-item" onClick={() => setTypeFilter("all")}><i className="ti ti-layout-list me-1" />All Categories</button></li>
                        <li><button className="dropdown-item" onClick={() => setTypeFilter("root")}><i className="ti ti-folder me-1" />Root Categories</button></li>
                        <li><button className="dropdown-item" onClick={() => setTypeFilter("child")}><i className="ti ti-folder-open me-1" />Sub-Categories</button></li>
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

              {loading ? null : view === "list" ? (
                <div className="custom-table table-nowrap">
                  <Datatable
                    columns={columns}
                    dataSource={filtered}
                    Selection={false}
                    searchText={searchText}
                    components={TABLE_COMPONENTS}
                    scroll={{ x: "max-content" }}
                    rowKey="id"
                    onRow={(record: Category) => ({
                      onClick: () => navigate(`/distribution-categories/${record.id}/edit`),
                      style: { cursor: "pointer" },
                    })}
                  />
                </div>
              ) : (
                <>
                  {gridItems.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="ti ti-mood-empty fs-32 d-block mb-2" />
                      No categories found
                    </div>
                  ) : (
                    <div className="row">
                      {gridItems.slice(0, gridPage).map(item => (
                        <div key={item.id} className="col-xxl-3 col-xl-4 col-md-6">
                          <div
                            className="card border shadow"
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate(`/distribution-categories/${item.id}/edit`)}
                          >
                            <div className="card-body">

                              <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                                <span className="badge badge-soft-info">
                                  {item.parent_id === null ? "Root" : "Sub-Category"}
                                </span>
                              </div>

                              <div className="d-block">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                  <div>
                                    <h4 className="mb-1 fs-14 fw-semibold">{item.name}</h4>
                                    <p className="fs-13 mb-0 text-muted">
                                      {item.parent ? `Under: ${item.parent.name}` : "Top-level category"}
                                    </p>
                                  </div>
                                </div>

                                <div className="mb-3">
                                  <p className="d-flex align-items-center mb-0">
                                    <span className="me-2 text-dark">
                                      <i className="ti ti-sitemap fs-12" />
                                    </span>
                                    {item.parent ? `Level ${2}` : "Level 1"}
                                  </p>
                                </div>
                              </div>

                              <div className="rounded">
                                <div className="d-flex align-items-center">
                                  <div className="avatar rounded-circle bg-white border me-2 d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0">
                                    <i className="ti ti-tag text-muted fs-16" />
                                  </div>
                                  <div className="d-flex flex-column">
                                    <span className="d-block">Category ID</span>
                                    <span className="text-default">#{item.id}</span>
                                  </div>
                                </div>
                              </div>

                            </div>
                          </div>
                        </div>
                      ))}
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
              <button
                type="button"
                onClick={closeColsModal}
                style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #fecaca", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}
              >
                <i className="ti ti-x" style={{ fontSize: 14, color: "#ef4444", lineHeight: 1 }} />
              </button>
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
                onChange={e => setColSearch(e.target.value)}
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
              <SortableContext items={filteredDraft.map(c => c.key)} strategy={verticalListSortingStrategy}>
                {filteredDraft.map(col => (
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

      {/* ── Toast ────────────────────────────────────────────────────────────── */}
      <div role="region" aria-live="polite" className="position-fixed top-0 start-50 translate-middle-x pt-4" style={{ zIndex: 9999, pointerEvents: "none" }}>
        <Toast
          show={toast.show}
          onClose={() => setToast(t => ({ ...t, show: false }))}
          delay={4000}
          autohide
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{ minWidth: 320, borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.13)" }}
        >
          <Toast.Body className="d-flex align-items-center gap-3 px-4 py-3">
            <span style={{ width: 36, height: 36, borderRadius: "50%", background: toast.type === "success" ? "#e6f9ee" : "#fff0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className={`ti ${toast.type === "success" ? "ti-check text-success" : "ti-x"} fs-18`} style={toast.type === "danger" ? { color: "#e03131" } : {}} />
            </span>
            <span className="fs-14 fw-medium text-dark">{toast.message}</span>
            <button type="button" className="btn-close ms-auto" style={{ fontSize: 11 }} onClick={() => setToast(t => ({ ...t, show: false }))} />
          </Toast.Body>
        </Toast>
      </div>
    </>
  );
};

export default DistributionCategoryList;
