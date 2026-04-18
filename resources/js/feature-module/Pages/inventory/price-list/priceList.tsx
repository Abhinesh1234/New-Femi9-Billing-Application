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
import { fetchPriceLists } from "../../../../core/services/priceListApi";

const route = all_routes;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface PriceListRecord {
  id: number;
  name: string;
  transaction_type: "sales" | "purchase" | "both";
  price_list_type: "all_items" | "individual_items";
  customer_category_id: number | null;
  customer_category_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Column definitions ───────────────────────────────────────────────────────
interface ColDef {
  key:   string;
  label: string;
}

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
const COL_WIDTHS_LS_KEY = "femi9_price_lists_col_widths";
const VIEW_LS_KEY       = "femi9_price_lists_view";

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
const PriceList = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<"list" | "grid">(() => {
    try { return localStorage.getItem(VIEW_LS_KEY) === "grid" ? "grid" : "list"; }
    catch { return "list"; }
  });
  const [gridPage, setGridPage]             = useState(12);
  const [searchText, setSearchText]         = useState("");
  const [items, setItems]                   = useState<PriceListRecord[]>([]);
  const [total, setTotal]                   = useState(0);
  const [loading, setLoading]               = useState(true);
  const [typeFilter, setTypeFilter]         = useState<"all" | "all_items" | "individual_items">("all");

  // ── Customize Columns modal ──
  const [showColsModal, setShowColsModal] = useState(false);
  const [colSearch, setColSearch]         = useState("");
  const [colOrder, setColOrder]           = useState<ColDef[]>(INITIAL_COLS);
  const [visibleCols, setVisibleCols]     = useState<Set<string>>(new Set(DEFAULT_VISIBLE));
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

  const load = async () => {
    setLoading(true);
    const res = await fetchPriceLists({ per_page: 100 });
    if (res.success) {
      setItems(res.data.data);
      setTotal(res.data.total);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { localStorage.setItem(VIEW_LS_KEY, view); }, [view]);

  const filtered = typeFilter === "all"
    ? items
    : items.filter((i) => i.price_list_type === typeFilter);

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
        render: (_: string, record: PriceListRecord) => (
          <Link to="#" className="title-name fw-medium">{record.name}</Link>
        ),
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
        case "transaction_type":
          cols.push({
            title: "Transaction Type",
            key: "transaction_type",
            dataIndex: "transaction_type",
            width: colWidths["transaction_type"] ?? DEFAULT_COL_WIDTHS["transaction_type"],
            onHeaderCell: resizeCell("transaction_type"),
            render: (val: string) => {
              const map: Record<string, { label: string; cls: string }> = {
                sales:    { label: "Sales",    cls: "badge-soft-success" },
                purchase: { label: "Purchase", cls: "badge-soft-warning" },
                both:     { label: "Both",     cls: "badge-soft-info"    },
              };
              const m = map[val] ?? { label: val, cls: "badge-soft-secondary" };
              return <span className={`badge ${m.cls}`}>{m.label}</span>;
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
              <span className={`badge ${val === "all_items" ? "badge-soft-purple" : "badge-soft-info"}`}>
                {val === "all_items" ? "All Items" : "Individual Items"}
              </span>
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
              new Date(val).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          });
          break;
        default:
          cols.push(emptyCol(col.label, col.key));
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

          <PageHeader title="Price Lists" badgeCount={total} showModuleTile={false} showExport={true} />

          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <div className="input-icon input-icon-start position-relative">
                <span className="input-icon-addon text-dark">
                  <i className="ti ti-search" />
                </span>
                <SearchInput value={searchText} onChange={setSearchText} />
              </div>
              <Link to={route.newPriceList} className="btn btn-primary">
                <i className="ti ti-square-rounded-plus-filled me-1" />
                New Price List
              </Link>
            </div>

            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">

                {/* Left */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="dropdown">
                    <Link to="#" className="dropdown-toggle btn btn-outline-light px-2 fs-16 fw-bold border-0" data-bs-toggle="dropdown">
                      {typeFilter === "all" ? "All Price Lists" : typeFilter === "all_items" ? "All Items" : "Individual Items"}
                    </Link>
                    <div className="dropdown-menu">
                      <ul>
                        <li><button className="dropdown-item" onClick={() => setTypeFilter("all")}><i className="ti ti-dots-vertical me-1" /> All Price Lists</button></li>
                        <li><button className="dropdown-item" onClick={() => setTypeFilter("all_items")}><i className="ti ti-dots-vertical me-1" /> All Items</button></li>
                        <li><button className="dropdown-item" onClick={() => setTypeFilter("individual_items")}><i className="ti ti-dots-vertical me-1" /> Individual Items</button></li>
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
                    <div className="dropdown-menu">
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

              {loading ? (
                <div className="text-center py-5 text-muted">
                  <span className="spinner-border spinner-border-sm me-2" />
                  Loading price lists…
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
                    onRow={(record: PriceListRecord) => ({
                      onClick: () => navigate(`/price-list/${record.id}`),
                      style:   { cursor: "pointer" },
                    })}
                  />
                </div>
              ) : (
                /* ── Grid view ─────────────────────────────────────── */
                <>
                  {gridItems.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="ti ti-mood-empty fs-32 d-block mb-2" />
                      No price lists found
                    </div>
                  ) : (
                    <div className="row">
                      {gridItems.slice(0, gridPage).map((item) => {
                        const date = new Date(item.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        });
                        const txnMap: Record<string, { label: string; cls: string }> = {
                          sales:    { label: "Sales",    cls: "badge-soft-success" },
                          purchase: { label: "Purchase", cls: "badge-soft-warning" },
                          both:     { label: "Both",     cls: "badge-soft-info"    },
                        };
                        const txn = txnMap[item.transaction_type] ?? { label: item.transaction_type, cls: "badge-soft-secondary" };

                        return (
                          <div key={item.id} className="col-xxl-3 col-xl-4 col-md-6">
                            <div
                              className="card border shadow"
                              style={{ cursor: "pointer" }}
                              onClick={() => navigate(`/price-list/${item.id}`)}
                            >
                              <div className="card-body">

                                <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                                  <span className={`badge ${txn.cls}`}>{txn.label}</span>
                                  <span className={`badge ${item.is_active ? "badge-soft-success" : "badge-soft-danger"}`}>
                                    {item.is_active ? "Active" : "Inactive"}
                                  </span>
                                </div>

                                <div className="d-block">
                                  <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div>
                                      <h4 className="mb-1 fs-14 fw-semibold">{item.name}</h4>
                                      <p className="fs-13 mb-0">
                                        {item.price_list_type === "all_items" ? "All Items" : "Individual Items"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mb-3">
                                    <p className="d-flex align-items-center mb-2">
                                      <span className="me-2 text-dark">
                                        <i className="ti ti-tag fs-12" />
                                      </span>
                                      {item.customer_category_name ?? "No customer category"}
                                    </p>
                                    <p className="d-flex align-items-center mb-0">
                                      <span className="me-2 text-dark">
                                        <i className="ti ti-calendar fs-12" />
                                      </span>
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
      <Modal show={showColsModal} onHide={closeColsModal} centered size="md">
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

export default PriceList;
