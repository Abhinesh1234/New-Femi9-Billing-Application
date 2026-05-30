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
import { usePermission } from "../../../../core/hooks/usePermission";
import { type InvoiceListItem } from "../../../../core/services/invoiceApi";
import {
  getInvoiceList,
  readInvoiceList,
  bustInvoiceList,
} from "../../../../core/cache/invoiceCache";
import {
  getDistributionCategories,
  type DistributionCategory,
} from "../../../../core/cache/distributionCategoryCache";
import { onMutation } from "../../../../core/cache/mutationEvents";
import { useWindowFocusRefresh } from "../../../../core/hooks/useWindowFocusRefresh";
import { exportToExcelFile, exportToPdfPrint } from "../../../../core/utils/exportUtils";

const route = all_routes;

// ─── Column definitions ───────────────────────────────────────────────────────
interface ColDef { key: string; label: string; }

const INITIAL_COLS: ColDef[] = [
  { key: "customer",               label: "Customer" },
  { key: "distribution_category",  label: "Distribution Category" },
  { key: "location",               label: "Location" },
  { key: "invoice_date",           label: "Invoice Date" },
  { key: "due_date",               label: "Due Date" },
  { key: "grand_total",            label: "Total Amount" },
  { key: "total_paid",             label: "Paid Amount" },
  { key: "balance_amount",         label: "Balance" },
  { key: "status",                 label: "Status" },
];

const DEFAULT_VISIBLE = new Set(["customer", "invoice_date", "grand_total", "balance_amount", "status"]);

const DEFAULT_COL_WIDTHS: Record<string, number> = {
  invoice_number:        200,
  customer:              220,
  distribution_category: 200,
  location:              180,
  invoice_date:          150,
  due_date:              150,
  grand_total:           160,
  total_paid:            160,
  balance_amount:        160,
  status:                130,
};

const COL_WIDTHS_LS_KEY  = "femi9_invoices_col_widths";
const COL_ORDER_LS_KEY   = "femi9_invoices_col_order";
const COL_VISIBLE_LS_KEY = "femi9_invoices_col_visible";
const VIEW_LS_KEY        = "femi9_invoices_view";

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  draft:          "Draft",
  sent:           "Sent",
  partially_paid: "Partially Paid",
  paid:           "Paid",
  overdue:        "Overdue",
};

const STATUS_BADGE: Record<string, string> = {
  draft:          "badge-soft-secondary",
  sent:           "badge-soft-info",
  partially_paid: "badge-soft-warning",
  paid:           "badge-soft-success",
  overdue:        "badge-soft-danger",
};

const fmt = (n: string | number) =>
  `₹${parseFloat(String(n)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

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
          <span style={{ width: 2, height: handleVisible ? "55%" : 0, background: "var(--bs-primary,#0d6efd)", borderRadius: 2, transition: "height 0.15s ease", pointerEvents: "none", opacity: handleVisible ? 0.7 : 0 }} />
        </span>
      )}
    </th>
  );
}

const TABLE_COMPONENTS = { header: { cell: ResizableTitle } };

// ─── Sortable row in column modal ─────────────────────────────────────────────
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

type SortOption = "newest" | "oldest" | "customer_asc" | "amount_desc" | "amount_asc";

// ─── Main component ───────────────────────────────────────────────────────────
const InvoicesList = () => {
  const canCreate = usePermission("invoices", "create");
  const navigate = useNavigate();

  const [view, setView] = useState<"list" | "grid">(() => {
    try { return localStorage.getItem(VIEW_LS_KEY) === "grid" ? "grid" : "list"; }
    catch { return "list"; }
  });
  const [gridPage, setGridPage]           = useState(12);
  const [invoices, setInvoices]           = useState<InvoiceListItem[]>([]);
  const [total, setTotal]                 = useState(0);
  const [loading, setLoading]             = useState(true);
  const [loadError, setLoadError]         = useState<string | null>(null);
  const [searchText, setSearchText]       = useState("");
  const [sortBy, setSortBy]               = useState<SortOption>("newest");
  const [categories, setCategories]         = useState<DistributionCategory[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [showDeleted, setShowDeleted]       = useState(false);

  // ── Toast ──
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "danger" }>({ show: false, message: "", type: "success" });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (message: string, type: "success" | "danger" = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // ── Column widths ──
  const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
    try { const s = localStorage.getItem(COL_WIDTHS_LS_KEY); return s ? { ...DEFAULT_COL_WIDTHS, ...JSON.parse(s) } : { ...DEFAULT_COL_WIDTHS }; }
    catch { return { ...DEFAULT_COL_WIDTHS }; }
  });
  const handleResize = useCallback((key: string, width: number) => {
    setColWidths(prev => { const next = { ...prev, [key]: width }; localStorage.setItem(COL_WIDTHS_LS_KEY, JSON.stringify(next)); return next; });
  }, []);

  // ── Customize Columns modal ──
  const [showColsModal, setShowColsModal] = useState(false);
  const [colSearch, setColSearch]         = useState("");
  const [colOrder, setColOrder] = useState<ColDef[]>(() => {
    try {
      const saved = localStorage.getItem(COL_ORDER_LS_KEY);
      if (saved) {
        const keys: string[] = JSON.parse(saved);
        const ordered = keys.map(k => INITIAL_COLS.find(c => c.key === k)).filter(Boolean) as ColDef[];
        const savedSet = new Set(keys);
        return [...ordered, ...INITIAL_COLS.filter(c => !savedSet.has(c.key))];
      }
    } catch {}
    return INITIAL_COLS;
  });
  const [visibleCols, setVisibleCols] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(COL_VISIBLE_LS_KEY);
      if (saved) { const parsed: string[] = JSON.parse(saved); const valid = new Set(INITIAL_COLS.map(c => c.key)); return new Set<string>(parsed.filter(k => valid.has(k))); }
    } catch {}
    return new Set(DEFAULT_VISIBLE);
  });
  const [draftOrder, setDraftOrder]     = useState<ColDef[]>(INITIAL_COLS);
  const [draftVisible, setDraftVisible] = useState<Set<string>>(new Set(DEFAULT_VISIBLE));

  const openColsModal = () => { setDraftOrder([...colOrder]); setDraftVisible(new Set(visibleCols)); setColSearch(""); setShowColsModal(true); };
  const closeColsModal = () => setShowColsModal(false);
  const saveColsModal  = () => {
    setColOrder([...draftOrder]); setVisibleCols(new Set(draftVisible));
    try { localStorage.setItem(COL_ORDER_LS_KEY, JSON.stringify(draftOrder.map(c => c.key))); localStorage.setItem(COL_VISIBLE_LS_KEY, JSON.stringify([...draftVisible])); } catch {}
    setShowColsModal(false);
  };
  const toggleDraft = (key: string) => setDraftVisible(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id)
      setDraftOrder(prev => arrayMove(prev, prev.findIndex(c => c.key === active.id), prev.findIndex(c => c.key === over.id)));
  };
  const filteredDraft = useMemo(() => draftOrder.filter(c => c.label.toLowerCase().includes(colSearch.toLowerCase())), [draftOrder, colSearch]);

  // ── Data loading ──
  const loadInvoices = useCallback(async (catId: number | null = null, deleted = false) => {
    // Serve cached data instantly to avoid blank-screen flash
    const cached = readInvoiceList(catId, deleted);
    if (cached) {
      setInvoices(cached.data);
      setTotal(cached.total);
      setLoadError(null);
      setLoading(false);
    } else {
      setLoading(true);
      setLoadError(null);
    }
    try {
      const result = await getInvoiceList({ distribution_category_id: catId, trashed: deleted });
      setInvoices(result.data);
      setTotal(result.total);
    } catch (e: any) { setLoadError(e.message ?? "Failed to load invoices."); }
    setLoading(false);
  }, []);

  // Fetch categories (cached) once on mount
  useEffect(() => {
    getDistributionCategories().then(data => setCategories(data)).catch(() => {});
  }, []);

  // Re-fetch invoices when filter changes
  useEffect(() => { loadInvoices(categoryFilter, showDeleted); }, [categoryFilter, showDeleted]);
  useEffect(() => { localStorage.setItem(VIEW_LS_KEY, view); }, [view]);
  useEffect(() => { setGridPage(12); }, [categoryFilter, showDeleted]);

  // Silent refresh — busts list cache then re-fetches so data is always fresh
  const silentRefresh = useCallback(async () => {
    try {
      bustInvoiceList();
      const result = await getInvoiceList({ distribution_category_id: categoryFilter, trashed: showDeleted });
      setInvoices(result.data);
      setTotal(result.total);
    } catch { /* ignore — data stays as is */ }
  }, [categoryFilter, showDeleted]);

  // Window focus reload (silent)
  useEffect(() => {
    const onFocus = () => silentRefresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [silentRefresh]);

  // Cross-page mutation listener (new invoice / payment recorded → silent reload)
  useEffect(() => onMutation("invoices:mutated", silentRefresh), [silentRefresh]);
  useWindowFocusRefresh(silentRefresh);

  const handleRefresh = useCallback(() => silentRefresh(), [silentRefresh]);

  // ── Filter + sort ──
  const filtered = useMemo(() => {
    let base = [...invoices];
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      base = base.filter(inv =>
        inv.invoice_number.toLowerCase().includes(q) ||
        (inv.customer?.display_name ?? "").toLowerCase().includes(q) ||
        (inv.location?.name ?? "").toLowerCase().includes(q)
      );
    }
    return [...base].sort((a, b) => {
      switch (sortBy) {
        case "oldest":       return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "customer_asc": return (a.customer?.display_name ?? "").localeCompare(b.customer?.display_name ?? "");
        case "amount_desc":  return parseFloat(b.grand_total) - parseFloat(a.grand_total);
        case "amount_asc":   return parseFloat(a.grand_total) - parseFloat(b.grand_total);
        default:             return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [invoices, searchText, sortBy]);

  // ── Table columns ──
  const columns = useMemo(() => {
    const resizeCell = (key: string) => () => ({
      colKey: key, onResize: handleResize,
      currentWidth: colWidths[key] ?? DEFAULT_COL_WIDTHS[key] ?? 160,
    });

    const cols: object[] = [
      {
        title: "Invoice #", key: "invoice_number", dataIndex: "invoice_number",
        width: colWidths["invoice_number"] ?? DEFAULT_COL_WIDTHS["invoice_number"],
        onHeaderCell: resizeCell("invoice_number"),
        render: (text: string) => (
          <span className="title-name fw-medium d-flex align-items-center gap-2">
            <i className="ti ti-file-invoice text-muted fs-15" />
            {text}
          </span>
        ),
      },
    ];

    for (const col of colOrder) {
      if (!visibleCols.has(col.key)) continue;
      switch (col.key) {
        case "customer":
          cols.push({
            title: "Customer", key: "customer", dataIndex: "customer",
            width: colWidths["customer"] ?? DEFAULT_COL_WIDTHS["customer"],
            onHeaderCell: resizeCell("customer"),
            render: (_: any, record: InvoiceListItem) =>
              record.customer
                ? <span className="fw-medium">{record.customer.display_name}</span>
                : <span className="text-muted">—</span>,
          }); break;
        case "distribution_category":
          cols.push({
            title: "Distribution Category", key: "distribution_category", dataIndex: "customer",
            width: colWidths["distribution_category"] ?? DEFAULT_COL_WIDTHS["distribution_category"],
            onHeaderCell: resizeCell("distribution_category"),
            render: (_: any, record: InvoiceListItem) =>
              record.customer?.distribution_category
                ? <span className="text-muted">{record.customer.distribution_category.name}</span>
                : <span className="text-muted">—</span>,
          }); break;
        case "location":
          cols.push({
            title: "Location", key: "location", dataIndex: "location",
            width: colWidths["location"] ?? DEFAULT_COL_WIDTHS["location"],
            onHeaderCell: resizeCell("location"),
            render: (_: any, record: InvoiceListItem) =>
              record.location
                ? <span className="text-muted">{record.location.name}</span>
                : <span className="text-muted">—</span>,
          }); break;
        case "invoice_date":
          cols.push({
            title: "Invoice Date", key: "invoice_date", dataIndex: "invoice_date",
            width: colWidths["invoice_date"] ?? DEFAULT_COL_WIDTHS["invoice_date"],
            onHeaderCell: resizeCell("invoice_date"),
            render: (v: string) => <span className="text-muted">{fmtDate(v)}</span>,
          }); break;
        case "due_date":
          cols.push({
            title: "Due Date", key: "due_date", dataIndex: "due_date",
            width: colWidths["due_date"] ?? DEFAULT_COL_WIDTHS["due_date"],
            onHeaderCell: resizeCell("due_date"),
            render: (v: string | null) =>
              v ? <span className="text-muted">{fmtDate(v)}</span> : <span className="text-muted">—</span>,
          }); break;
        case "grand_total":
          cols.push({
            title: "Total Amount", key: "grand_total", dataIndex: "grand_total",
            width: colWidths["grand_total"] ?? DEFAULT_COL_WIDTHS["grand_total"],
            onHeaderCell: resizeCell("grand_total"),
            render: (v: string) => <span>{fmt(v)}</span>,
          }); break;
        case "total_paid":
          cols.push({
            title: "Paid Amount", key: "total_paid", dataIndex: "total_paid",
            width: colWidths["total_paid"] ?? DEFAULT_COL_WIDTHS["total_paid"],
            onHeaderCell: resizeCell("total_paid"),
            render: (v: string) => <span className="text-muted">{fmt(v)}</span>,
          }); break;
        case "balance_amount":
          cols.push({
            title: "Balance", key: "balance_amount", dataIndex: "balance_amount",
            width: colWidths["balance_amount"] ?? DEFAULT_COL_WIDTHS["balance_amount"],
            onHeaderCell: resizeCell("balance_amount"),
            render: (v: string) => <span className="fw-medium">{fmt(v)}</span>,
          }); break;
        case "status":
          cols.push({
            title: "Status", key: "status", dataIndex: "status",
            width: colWidths["status"] ?? DEFAULT_COL_WIDTHS["status"],
            onHeaderCell: resizeCell("status"),
            render: (v: string) => (
              <span className={`badge ${STATUS_BADGE[v] ?? "badge-soft-secondary"}`}>
                {STATUS_LABELS[v] ?? v}
              </span>
            ),
          }); break;
      }
    }

    // Last column resize handle on left boundary
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
    } else if (cols.length === 1) {
      delete (cols[0] as any).width;
    }

    return cols;
  }, [visibleCols, colOrder, colWidths, handleResize]);

  // ── Export ──
  const exportHeaders = ["Invoice #", "Customer", "Location", "Invoice Date", "Due Date", "Total", "Paid", "Balance", "Status"];
  const buildExportRows = () => filtered.map(inv => [
    inv.invoice_number,
    inv.customer?.display_name ?? "—",
    inv.location?.name ?? "—",
    fmtDate(inv.invoice_date),
    fmtDate(inv.due_date),
    fmt(inv.grand_total),
    fmt(inv.total_paid),
    fmt(inv.balance_amount),
    STATUS_LABELS[inv.status] ?? inv.status,
  ]);

  const handleExportPdf = () => {
    try { exportToPdfPrint("Invoices", exportHeaders, buildExportRows()); }
    catch (e: any) { showToast(e.message ?? "PDF export failed.", "danger"); }
  };

  const handleExportExcel = () => {
    const rows = filtered.map(inv => ({
      invoice_number: inv.invoice_number,
      customer:       inv.customer?.display_name ?? "—",
      location:       inv.location?.name ?? "—",
      invoice_date:   fmtDate(inv.invoice_date),
      due_date:       fmtDate(inv.due_date),
      grand_total:    fmt(inv.grand_total),
      total_paid:     fmt(inv.total_paid),
      balance_amount: fmt(inv.balance_amount),
      status:         STATUS_LABELS[inv.status] ?? inv.status,
    }));
    exportToExcelFile("Invoices", [
      { header: "Invoice #",    key: "invoice_number", width: 18 },
      { header: "Customer",     key: "customer",       width: 26 },
      { header: "Location",     key: "location",       width: 22 },
      { header: "Invoice Date", key: "invoice_date",   width: 16 },
      { header: "Due Date",     key: "due_date",       width: 16 },
      { header: "Total",        key: "grand_total",    width: 16 },
      { header: "Paid",         key: "total_paid",     width: 16 },
      { header: "Balance",      key: "balance_amount", width: 16 },
      { header: "Status",       key: "status",         width: 16 },
    ], rows).catch(() => showToast("Excel export failed.", "danger"));
  };

  const sortLabel: Record<SortOption, string> = {
    newest:       "Newest",
    oldest:       "Oldest",
    customer_asc: "Customer A–Z",
    amount_desc:  "Amount ↓",
    amount_asc:   "Amount ↑",
  };

  const activeFilterLabel = showDeleted
    ? "Deleted Invoices"
    : categoryFilter === null
    ? "All Invoices"
    : (categories.find(c => c.id === categoryFilter)?.name ?? "All Invoices");

  return (
    <>
      <div className="page-wrapper">
        <div className="content">

          <PageHeader
            title="Invoices"
            badgeCount={total}
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
              {canCreate && (
                <Link to={route.newInvoice} className="btn btn-primary">
                  <i className="ti ti-square-rounded-plus-filled me-1" />
                  New Invoice
                </Link>
              )}
            </div>

            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">

                {/* Category filter */}
                <div className="dropdown">
                  <button type="button" className="dropdown-toggle btn btn-outline-light px-2 fs-16 fw-bold border-0" data-bs-toggle="dropdown">
                    {activeFilterLabel}
                  </button>
                  <div className="dropdown-menu dropmenu-hover-primary" style={{ maxHeight: 320, overflowY: "auto" }}>
                    <ul>
                      <li>
                        <button className={`dropdown-item${!showDeleted && categoryFilter === null ? " active" : ""}`} onClick={() => { setShowDeleted(false); setCategoryFilter(null); }}>
                          <i className="ti ti-layout-list me-1" />All Invoices
                        </button>
                      </li>
                      {categories.map(cat => (
                        <li key={cat.id}>
                          <button className={`dropdown-item${!showDeleted && categoryFilter === cat.id ? " active" : ""}`} onClick={() => { setShowDeleted(false); setCategoryFilter(cat.id); }}>
                            <i className="ti ti-category me-1" />{cat.name}
                          </button>
                        </li>
                      ))}
                      <li><hr className="dropdown-divider my-1" /></li>
                      <li>
                        <button className={`dropdown-item${showDeleted ? " active" : ""}`} onClick={() => { setShowDeleted(true); setCategoryFilter(null); }}>
                          <i className="ti ti-trash me-1" />Deleted Invoices
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {/* Sort */}
                  <div className="dropdown">
                    <button type="button" className="dropdown-toggle btn btn-outline-light px-2 shadow" data-bs-toggle="dropdown">
                      <i className="ti ti-sort-ascending-2 me-2" />{sortLabel[sortBy]}
                    </button>
                    <div className="dropdown-menu dropmenu-hover-primary dropdown-menu-end">
                      <ul>
                        {(Object.entries(sortLabel) as [SortOption, string][]).map(([k, label]) => (
                          <li key={k}>
                            <button className={`dropdown-item d-flex align-items-center gap-2${sortBy === k ? " active" : ""}`} onClick={() => setSortBy(k)}>
                              {label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Manage columns — list view only */}
                  {view === "list" && (
                    <button type="button" className="btn bg-soft-indigo px-2 border-0" onClick={openColsModal}>
                      <i className="ti ti-columns-3 me-2" />Manage Columns
                    </button>
                  )}

                  {/* View toggle */}
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

              {/* Error */}
              {loadError && (
                <div className="alert alert-danger d-flex align-items-center gap-2">
                  <i className="ti ti-alert-circle" />{loadError}
                  <button type="button" className="btn btn-sm btn-outline-danger ms-auto" onClick={handleRefresh}>Retry</button>
                </div>
              )}

              {loading ? null : view === "list" ? (
                /* ── List view ── */
                <div className="custom-table table-nowrap">
                  <Datatable
                    columns={columns}
                    dataSource={filtered}
                    Selection={false}
                    searchText=""
                    components={TABLE_COMPONENTS}
                    scroll={{ x: "max-content" }}
                    rowKey="id"
                    onRow={(record: InvoiceListItem) => ({
                      onClick: () => navigate(`/invoices/${record.id}`),
                      style: { cursor: "pointer" },
                    })}
                  />
                </div>
              ) : (
                /* ── Grid view ── */
                <>
                  {filtered.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="ti ti-file-invoice fs-40 d-block mb-4 text-muted opacity-50" />
                      <h6 className="fw-semibold mb-2">
                        {showDeleted ? "No Deleted Invoices" : categoryFilter !== null ? "No Invoices in this Category" : "No Invoices"}
                      </h6>
                      <p className="text-muted mb-4 fs-14">
                        {showDeleted ? "No deleted invoices found." : categoryFilter !== null ? "No invoices found for the selected distribution category." : "Create your first invoice to get started."}
                      </p>
                      {!showDeleted && (
                        <Link to={route.newInvoice} className="btn btn-primary px-4">
                          <i className="ti ti-square-rounded-plus-filled me-1" />New Invoice
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="row">
                      {filtered.slice(0, gridPage).map(inv => (
                        <div key={inv.id} className="col-xxl-3 col-xl-4 col-md-6">
                          <div className="card border shadow" style={{ cursor: "pointer" }} onClick={() => navigate(`/invoices/${inv.id}`)}>
                            <div className="card-body">
                              {/* Header */}
                              <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                                <span className="fs-13 fw-semibold">{inv.invoice_number}</span>
                                <span className="badge badge-soft-secondary">
                                  {STATUS_LABELS[inv.status] ?? inv.status}
                                </span>
                              </div>

                              {/* Body */}
                              <div className="mb-3">
                                <h4 className="mb-1 fs-14 fw-semibold">{inv.customer?.display_name ?? "—"}</h4>
                                <p className="fs-13 mb-0 text-muted">{inv.location?.name ?? "—"}</p>
                              </div>

                              <div className="mb-3">
                                <p className="d-flex align-items-center mb-2 fs-13 text-muted">
                                  <i className="ti ti-calendar me-2" />
                                  {fmtDate(inv.invoice_date)}
                                </p>
                                <p className="d-flex align-items-center mb-2 fs-13 text-muted">
                                  <i className="ti ti-currency-rupee me-2" />
                                  <span className="fw-semibold text-dark">{fmt(inv.grand_total)}</span>
                                </p>
                                <p className="d-flex align-items-center mb-0 fs-13 text-muted">
                                  <i className="ti ti-wallet me-2" />
                                  Balance: <span className="ms-1 fw-semibold text-dark">{fmt(inv.balance_amount)}</span>
                                </p>
                              </div>

                              {/* Footer */}
                              <div className="d-flex align-items-center">
                                <span className="fs-12 text-muted">{fmtDate(inv.invoice_date)}</span>
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

      {/* ── Customize Columns Modal ── */}
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
                <i className="ti ti-x" style={{ fontSize: 14, color: "#ef4444", lineHeight: 1 }} />
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
              <span className="fs-14 text-muted">Invoice #</span>
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

      {/* ── Toast ── */}
      <div role="region" aria-live="polite" className="position-fixed top-0 start-50 translate-middle-x pt-4" style={{ zIndex: 9999, pointerEvents: "none" }}>
        <Toast show={toast.show} onClose={() => setToast(t => ({ ...t, show: false }))} delay={4000} autohide
          style={{ minWidth: 320, borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.13)" }}>
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

export default InvoicesList;
