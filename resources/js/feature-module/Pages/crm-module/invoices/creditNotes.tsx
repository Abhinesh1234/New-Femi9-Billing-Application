import React, { useCallback, useEffect, useMemo, useRef, useState, type ThHTMLAttributes } from "react";
import { useNavigate } from "react-router";
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
import { type CreditNoteListItem } from "../../../../core/services/creditNoteApi";
import { readCreditNoteList, getCreditNoteList, bustAllCreditNoteCache } from "../../../../core/cache/creditNoteCache";
import { onMutation } from "../../../../core/cache/mutationEvents";
import { useWindowFocusRefresh } from "../../../../core/hooks/useWindowFocusRefresh";
import { exportToExcelFile, exportToPdfPrint } from "../../../../core/utils/exportUtils";

const route = all_routes;

// ─── Column definitions ───────────────────────────────────────────────────────
interface ColDef {
  key:   string;
  label: string;
}

const INITIAL_COLS: ColDef[] = [
  { key: "customer",          label: "Customer"        },
  { key: "credit_note_date",  label: "Date"            },
  { key: "grand_total",       label: "Amount"          },
  { key: "source_invoice",    label: "Source Invoice"  },
  { key: "status",            label: "Status"          },
];

const DEFAULT_VISIBLE = new Set(["customer", "credit_note_date", "grand_total", "source_invoice", "status"]);

// ─── Column resize ────────────────────────────────────────────────────────────
const DEFAULT_COL_WIDTHS: Record<string, number> = {
  credit_note_number: 220,
  customer:           200,
  credit_note_date:   150,
  grand_total:        150,
  source_invoice:     200,
  status:             120,
};
const COL_WIDTHS_LS_KEY  = "femi9_creditnotes_col_widths";
const COL_ORDER_LS_KEY   = "femi9_creditnotes_col_order";
const COL_VISIBLE_LS_KEY = "femi9_creditnotes_col_visible";
const VIEW_LS_KEY        = "femi9_creditnotes_view";

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
    opacity:    isDragging ? 0.5 : 1,
    background: isDragging ? "#f0f4ff" : undefined,
    zIndex:     isDragging ? 999 : undefined,
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

type SortOption = "newest" | "oldest" | "amount_high" | "amount_low";

// ─── Status badge ─────────────────────────────────────────────────────────────
const statusBadgeCls: Record<string, string> = {
  draft:  "badge-soft-warning",
  issued: "badge-soft-success",
};
function statusLabel(s: string) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : "—"; }

// ─── Main component ───────────────────────────────────────────────────────────
const CreditNotesList = () => {
  const navigate  = useNavigate();
  const [view, setView] = useState<"list" | "grid">(() => {
    try { return localStorage.getItem(VIEW_LS_KEY) === "grid" ? "grid" : "list"; }
    catch { return "list"; }
  });
  const [gridPage, setGridPage]           = useState(12);
  const [searchText, setSearchText]       = useState("");
  const [creditNotes, setCreditNotes]     = useState<CreditNoteListItem[]>([]);
  const [loading, setLoading]             = useState(true);
  const [statusFilter, setStatusFilter]   = useState<"all" | "draft" | "issued">("all");
  const [sortBy, setSortBy]               = useState<SortOption>("newest");
  const [loadError, setLoadError]         = useState<string | null>(null);
  const [total, setTotal]                 = useState(0);

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
    setColWidths((prev) => {
      const next = { ...prev, [key]: width };
      localStorage.setItem(COL_WIDTHS_LS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const openColsModal  = () => { setDraftOrder([...colOrder]); setDraftVisible(new Set(visibleCols)); setColSearch(""); setShowColsModal(true); };
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
      const result = await getCreditNoteList();
      setCreditNotes(result.data);
      setTotal(result.total);
    } catch (e: any) {
      setLoadError(e.message ?? "Failed to load credit notes.");
    }
    setLoading(false);
  }, []);

  const handleRefresh = useCallback(async () => {
    bustAllCreditNoteCache();
    try {
      const result = await getCreditNoteList();
      setCreditNotes(result.data);
      setTotal(result.total);
    } catch { /* keep existing data */ }
  }, []);

  useEffect(() => {
    const cached = readCreditNoteList();
    if (cached) { setCreditNotes(cached.data); setTotal(cached.total); setLoading(false); return; }
    loadFresh();
  }, []);

  useEffect(() => { localStorage.setItem(VIEW_LS_KEY, view); }, [view]);
  useEffect(() => { setGridPage(12); }, [statusFilter]);
  useEffect(() => onMutation("credit-notes:mutated", handleRefresh), [handleRefresh]);
  useWindowFocusRefresh(handleRefresh);

  useEffect(() => {
    const onFocus = () => {
      getCreditNoteList()
        .then(result => { setCreditNotes(result.data); setTotal(result.total); })
        .catch(() => {});
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // ── Filtered + sorted data ──
  const filtered = useMemo(() => {
    const base = statusFilter === "all"
      ? creditNotes
      : creditNotes.filter(cn => cn.status === statusFilter);
    return [...base].sort((a, b) => {
      switch (sortBy) {
        case "oldest":      return new Date(a.credit_note_date).getTime() - new Date(b.credit_note_date).getTime();
        case "amount_high": return parseFloat(b.grand_total) - parseFloat(a.grand_total);
        case "amount_low":  return parseFloat(a.grand_total) - parseFloat(b.grand_total);
        default:            return new Date(b.credit_note_date).getTime() - new Date(a.credit_note_date).getTime();
      }
    });
  }, [creditNotes, statusFilter, sortBy]);

  // ── Build table columns ──
  const columns = useMemo(() => {
    const resizeCell = (key: string) => () => ({
      colKey:       key,
      onResize:     handleResize,
      currentWidth: colWidths[key] ?? DEFAULT_COL_WIDTHS[key] ?? 160,
    });

    const cols: object[] = [
      {
        title:        "CN #",
        key:          "credit_note_number",
        dataIndex:    "credit_note_number",
        width:        colWidths["credit_note_number"] ?? DEFAULT_COL_WIDTHS["credit_note_number"],
        onHeaderCell: resizeCell("credit_note_number"),
        render: (text: string) => (
          <span className="fw-medium" style={{ color: "#e03131" }}>{text || "—"}</span>
        ),
      },
    ];

    for (const col of colOrder) {
      if (!visibleCols.has(col.key)) continue;
      switch (col.key) {

        case "customer":
          cols.push({
            title:        "Customer",
            key:          "customer",
            dataIndex:    "customer",
            width:        colWidths["customer"] ?? DEFAULT_COL_WIDTHS["customer"],
            onHeaderCell: resizeCell("customer"),
            render: (_: any, record: CreditNoteListItem) =>
              record.customer?.display_name
                ? <span>{record.customer.display_name}</span>
                : <span className="text-muted">—</span>,
          });
          break;

        case "credit_note_date":
          cols.push({
            title:        "Date",
            key:          "credit_note_date",
            dataIndex:    "credit_note_date",
            width:        colWidths["credit_note_date"] ?? DEFAULT_COL_WIDTHS["credit_note_date"],
            onHeaderCell: resizeCell("credit_note_date"),
            render: (text: string) =>
              text
                ? new Date(text).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                : <span className="text-muted">—</span>,
          });
          break;

        case "grand_total":
          cols.push({
            title:        "Amount",
            key:          "grand_total",
            dataIndex:    "grand_total",
            width:        colWidths["grand_total"] ?? DEFAULT_COL_WIDTHS["grand_total"],
            onHeaderCell: resizeCell("grand_total"),
            render: (text: string) =>
              text
                ? `₹${parseFloat(text).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                : <span className="text-muted">—</span>,
          });
          break;

        case "source_invoice":
          cols.push({
            title:        "Source Invoice",
            key:          "source_invoice",
            dataIndex:    "source_invoice",
            width:        colWidths["source_invoice"] ?? DEFAULT_COL_WIDTHS["source_invoice"],
            onHeaderCell: resizeCell("source_invoice"),
            render: (_: any, record: CreditNoteListItem) =>
              record.source_invoice?.invoice_number
                ? <span className="text-muted">{record.source_invoice.invoice_number}</span>
                : <span className="text-muted">—</span>,
          });
          break;

        case "status":
          cols.push({
            title:        "Status",
            key:          "status",
            dataIndex:    "status",
            width:        colWidths["status"] ?? DEFAULT_COL_WIDTHS["status"],
            onHeaderCell: resizeCell("status"),
            render: (text: string) =>
              text
                ? <span className={`badge ${statusBadgeCls[text] ?? "badge-soft-secondary"}`}>{statusLabel(text)}</span>
                : <span className="text-muted">—</span>,
          });
          break;
      }
    }

    // Last column: flush right, left-side resize handle
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
  const gridCreditNotes = useMemo(() => {
    if (!searchText.trim()) return filtered;
    const q = searchText.toLowerCase();
    return filtered.filter(cn =>
      Object.values(cn).some(v => String(v ?? "").toLowerCase().includes(q))
    );
  }, [filtered, searchText]);

  // ── Export helpers ──
  const fmtDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const fmtAmt  = (a: string) =>
    a ? `₹${parseFloat(a).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—";

  const exportHeaders = ["CN #", "Customer", "Date", "Amount", "Source Invoice", "Status"];
  const buildExportRows = () => filtered.map(cn => [
    cn.credit_note_number,
    cn.customer?.display_name ?? "—",
    fmtDate(cn.credit_note_date),
    fmtAmt(cn.grand_total),
    cn.source_invoice?.invoice_number ?? "—",
    statusLabel(cn.status),
  ]);

  const handleExportPdf = () => {
    try { exportToPdfPrint("Credit Notes", exportHeaders, buildExportRows()); }
    catch (e: any) { showToast("danger", e.message ?? "PDF export failed."); }
  };

  const handleExportExcel = () => {
    const rows = filtered.map(cn => ({
      credit_note_number: cn.credit_note_number,
      customer:           cn.customer?.display_name ?? "—",
      credit_note_date:   fmtDate(cn.credit_note_date),
      grand_total:        fmtAmt(cn.grand_total),
      source_invoice:     cn.source_invoice?.invoice_number ?? "—",
      status:             statusLabel(cn.status),
    }));
    exportToExcelFile("Credit Notes", [
      { header: "CN #",           key: "credit_note_number", width: 20 },
      { header: "Customer",       key: "customer",           width: 26 },
      { header: "Date",           key: "credit_note_date",   width: 16 },
      { header: "Amount",         key: "grand_total",        width: 16 },
      { header: "Source Invoice", key: "source_invoice",     width: 20 },
      { header: "Status",         key: "status",             width: 12 },
    ], rows).catch(() => showToast("danger", "Excel export failed."));
  };

  const filterLabel: Record<string, string> = {
    all:    "All Credit Notes",
    issued: "Issued",
    draft:  "Draft",
  };

  const sortLabel: Record<SortOption, string> = {
    newest:      "Newest",
    oldest:      "Oldest",
    amount_high: "Amount High–Low",
    amount_low:  "Amount Low–High",
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="content">

          <PageHeader
            title="Credit Notes"
            badgeCount={filtered.length}
            showModuleTile={false}
            showExport={true}
            onRefresh={handleRefresh}
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
            </div>

            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">

                {/* Left — filter */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="dropdown">
                    <button
                      type="button"
                      className="dropdown-toggle btn btn-outline-light px-2 fs-16 fw-bold border-0"
                      data-bs-toggle="dropdown"
                    >
                      {filterLabel[statusFilter]}
                    </button>
                    <div className="dropdown-menu dropmenu-hover-primary">
                      <ul>
                        <li><button className="dropdown-item" onClick={() => setStatusFilter("all")}><i className="ti ti-layout-list me-1" />All Credit Notes</button></li>
                        <li><button className="dropdown-item" onClick={() => setStatusFilter("issued")}><i className="ti ti-circle-check me-1" />Issued</button></li>
                        <li><button className="dropdown-item" onClick={() => setStatusFilter("draft")}><i className="ti ti-file-description me-1" />Draft</button></li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right — sort, manage columns, view toggle */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="dropdown">
                    <button type="button" className="dropdown-toggle btn btn-outline-light px-2 shadow" data-bs-toggle="dropdown">
                      <i className="ti ti-sort-ascending-2 me-2" />{sortLabel[sortBy]}
                    </button>
                    <div className="dropdown-menu dropmenu-hover-primary">
                      <ul>
                        <li><button className={`dropdown-item d-flex align-items-center gap-2${sortBy === "newest" ? " active" : ""}`} onClick={() => setSortBy("newest")}><i className="ti ti-clock-hour-3 fs-15" />Newest</button></li>
                        <li><button className={`dropdown-item d-flex align-items-center gap-2${sortBy === "oldest" ? " active" : ""}`} onClick={() => setSortBy("oldest")}><i className="ti ti-history fs-15" />Oldest</button></li>
                        <li><button className={`dropdown-item d-flex align-items-center gap-2${sortBy === "amount_high" ? " active" : ""}`} onClick={() => setSortBy("amount_high")}><i className="ti ti-sort-descending fs-15" />Amount High–Low</button></li>
                        <li><button className={`dropdown-item d-flex align-items-center gap-2${sortBy === "amount_low" ? " active" : ""}`} onClick={() => setSortBy("amount_low")}><i className="ti ti-sort-ascending fs-15" />Amount Low–High</button></li>
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
                <div className="payments-custom-table custom-table table-nowrap">
                  <Datatable
                    columns={columns}
                    dataSource={filtered}
                    Selection={false}
                    searchText={searchText}
                    components={TABLE_COMPONENTS}
                    scroll={{ x: "max-content" }}
                    rowKey="id"
                    onRow={(record: CreditNoteListItem) => ({
                      onClick: () => navigate(`/credit-notes/${record.id}`),
                      style: { cursor: "pointer" },
                    })}
                  />
                </div>
              ) : (
                /* ── Grid view ── */
                <>
                  {gridCreditNotes.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="ti ti-file-minus fs-40 d-block mb-4 text-muted opacity-50" />
                      <h6 className="fw-semibold mb-2">No Credit Notes</h6>
                      <p className="text-muted mb-4 fs-14">Credit notes are generated from invoices.</p>
                    </div>
                  ) : (
                    <div className="row">
                      {gridCreditNotes.slice(0, gridPage).map((cn) => {
                        const date = cn.credit_note_date
                          ? new Date(cn.credit_note_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                          : "—";
                        const amt  = cn.grand_total
                          ? `₹${parseFloat(cn.grand_total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                          : "—";

                        return (
                          <div key={cn.id} className="col-xxl-3 col-xl-4 col-md-6" style={{ cursor: "pointer" }} onClick={() => navigate(`/credit-notes/${cn.id}`)}>
                            <div className="card border shadow">
                              <div className="card-body">

                                {/* Header: CN # badge + status */}
                                <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                                  <span className="badge badge-soft-danger">{cn.credit_note_number}</span>
                                  <span className={`badge ${statusBadgeCls[cn.status] ?? "badge-soft-secondary"}`}>
                                    {statusLabel(cn.status)}
                                  </span>
                                </div>

                                {/* Title block */}
                                <div className="d-block">
                                  <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div>
                                      <h4 className="mb-1 fs-14 fw-semibold">
                                        {cn.customer?.display_name ?? "No Customer"}
                                      </h4>
                                      <p className="fs-13 mb-0 text-muted">
                                        {cn.source_invoice?.invoice_number
                                          ? `Invoice: ${cn.source_invoice.invoice_number}`
                                          : "No source invoice"}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Metadata rows */}
                                  <div className="mb-3">
                                    <p className="d-flex align-items-center mb-2">
                                      <span className="me-2 text-dark">
                                        <i className="ti ti-currency-rupee fs-12" />
                                      </span>
                                      {amt}
                                    </p>
                                    <p className="d-flex align-items-center mb-0">
                                      <span className="me-2 text-dark">
                                        <i className="ti ti-calendar fs-12" />
                                      </span>
                                      {date}
                                    </p>
                                  </div>
                                </div>

                                {/* Footer */}
                                <div className="rounded">
                                  <div className="d-flex align-items-center">
                                    <div
                                      className="avatar rounded-circle bg-white border me-2 d-flex align-items-center justify-content-center flex-shrink-0"
                                      style={{ width: 36, height: 36 }}
                                    >
                                      <i className="ti ti-file-minus text-muted fs-16" />
                                    </div>
                                    <div className="d-flex flex-column">
                                      <span className="d-block">Issued on</span>
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

                  {gridCreditNotes.length > gridPage && (
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

      {/* ── Customize Columns Modal ─────────────────────────────────────────────── */}
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
              <span className="fs-14 text-muted">CN #</span>
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

      {/* ── Toast ────────────────────────────────────────────────────────────────── */}
      <div className="position-fixed top-0 start-50 translate-middle-x pt-4" style={{ zIndex: 9999, pointerEvents: "none" }}>
        <Toast
          show={toast.show}
          onClose={() => setToast(t => ({ ...t, show: false }))}
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

export default CreditNotesList;
