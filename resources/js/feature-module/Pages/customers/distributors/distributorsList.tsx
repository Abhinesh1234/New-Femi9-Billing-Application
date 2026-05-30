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
import { type PartyListItem } from "../../../../core/services/partyApi";
import { getPartyPage, bustAllPartyCache } from "../../../../core/cache/partyCache";
import { onMutation } from "../../../../core/cache/mutationEvents";
import { useWindowFocusRefresh } from "../../../../core/hooks/useWindowFocusRefresh";
import { exportToExcelFile, exportToPdfPrint } from "../../../../core/utils/exportUtils";
import { fetchDistributionCategories } from "../../../../core/services/distributionCategoryApi";

const route = all_routes;

// ─── Column definitions ───────────────────────────────────────────────────────
interface ColDef {
  key:   string;
  label: string;
}

const INITIAL_COLS: ColDef[] = [
  { key: "party_id",                    label: "Party ID" },
  { key: "party_type",                  label: "Type" },
  { key: "email",                       label: "Email" },
  { key: "mobile",                      label: "Mobile" },
  { key: "distribution_category",       label: "Category" },
  { key: "distribution_sub_category",   label: "Sub Category" },
  { key: "parent_party",                label: "Reporting To" },
  { key: "created_by_info",             label: "Created By" },
  { key: "payment_terms",               label: "Payment Terms" },
  { key: "currency",                    label: "Currency" },
  { key: "is_active",                   label: "Status" },
  { key: "created_at",                  label: "Added On" },
];

const DEFAULT_VISIBLE = new Set(["party_id", "party_type", "distribution_category", "is_active", "mobile", "created_by_info"]);

// ─── Column resize ────────────────────────────────────────────────────────────
const DEFAULT_COL_WIDTHS: Record<string, number> = {
  name:                      280,
  party_id:                  160,
  party_type:                140,
  email:                     220,
  mobile:                    160,
  distribution_category:     180,
  distribution_sub_category: 180,
  parent_party:              200,
  created_by_info:           230,
  payment_terms:             160,
  currency:                  120,
  is_active:                 120,
  created_at:                160,
};
const COL_WIDTHS_LS_KEY  = "femi9_parties_col_widths";
const COL_ORDER_LS_KEY   = "femi9_parties_col_order";
const COL_VISIBLE_LS_KEY = "femi9_parties_col_visible";
const VIEW_LS_KEY        = "femi9_parties_view";

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

  const canResize   = !!onResize && !!colKey;
  const handleEdge  = handleSide === "left"
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

// ─── Sortable row inside the columns modal ────────────────────────────────────
function SortableColRow({ col, checked, onToggle }: { col: ColDef; checked: boolean; onToggle: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: col.key });
  const style = {
    transform:  CSS.Transform.toString(transform),
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

type CreatorFilter = "all" | "company" | "party";

// ─── Main component ───────────────────────────────────────────────────────────
const DistributorsList = () => {
  const canCreate = usePermission("parties", "create");
  const navigate  = useNavigate();
  const authUser  = useSelector((state: RootState) => state.auth.user);
  const isParty   = authUser?.user_type === "party";

  const [view, setView] = useState<"list" | "grid">(() => {
    try { return localStorage.getItem(VIEW_LS_KEY) === "grid" ? "grid" : "list"; }
    catch { return "list"; }
  });
  // Grid accumulated data (server-side load-more)
  const [gridItems, setGridItems]             = useState<PartyListItem[]>([]);
  const [gridHasMore, setGridHasMore]         = useState(false);
  const [gridMoreLoading, setGridMoreLoading] = useState(false);
  const gridReqRef       = useRef(0);
  const gridLoadedRef    = useRef(0); // total items loaded so far (for next-page calc)
  const [searchText, setSearchText]         = useState("");
  const [loading, setLoading]               = useState(true);
  const [partyTypeFilter, setPartyTypeFilter] = useState<"all" | "business" | "individual" | "deleted">("all");
  const [creatorFilter, setCreatorFilter]   = useState<CreatorFilter>("company");
  const [categoryOpts, setCategoryOpts]     = useState<{ value: string; label: string }[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Server-side pagination state
  const [parties, setParties]               = useState<PartyListItem[]>([]);
  const [serverTotal, setServerTotal]       = useState(0);
  const [serverPage, setServerPage]         = useState(1);
  const [serverPageSize, setServerPageSize] = useState(10);

  // Deleted parties pagination
  const [deletedParties, setDeletedParties] = useState<PartyListItem[]>([]);
  const [deletedPage, setDeletedPage]       = useState(1);
  const [deletedTotal, setDeletedTotal]     = useState(0);
  const [deletedLoading, setDeletedLoading] = useState(false);

  // Debounced search
  const debouncedSearchRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ── Toast ──
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "danger" }>({ show: false, message: "", type: "success" });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (type: "success" | "danger", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // ── Load distribution category options (filtered for party users) ──
  useEffect(() => {
    fetchDistributionCategories().then(r => {
      if (!r.success) return;
      const ids = authUser?.permissions?.invoices?.others_data?.party_category_ids;
      const allowed: number[] | null = Array.isArray(ids) && ids.length > 0 ? ids : null;
      let opts = r.data.map(c => ({ value: String(c.id), label: c.name }));
      if (isParty && allowed) opts = opts.filter(o => allowed.includes(Number(o.value)));
      setCategoryOpts(opts);
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    } catch {
      return { ...DEFAULT_COL_WIDTHS };
    }
  });

  const colWidthsRef = useRef(colWidths);
  useEffect(() => { colWidthsRef.current = colWidths; }, [colWidths]);

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
    const newOrder   = [...draftOrder];
    const newVisible = new Set(draftVisible);
    setColOrder(newOrder);
    setVisibleCols(newVisible);
    try {
      localStorage.setItem(COL_ORDER_LS_KEY,   JSON.stringify(newOrder.map(c => c.key)));
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

  // ── Debounce search ──
  useEffect(() => {
    if (debouncedSearchRef.current) clearTimeout(debouncedSearchRef.current);
    debouncedSearchRef.current = setTimeout(() => {
      setDebouncedSearch(searchText);
      setServerPage(1); // reset to page 1 on new search
    }, 400);
    return () => { if (debouncedSearchRef.current) clearTimeout(debouncedSearchRef.current); };
  }, [searchText]);

  // ── Load page (request-ID guard prevents stale responses from overwriting fresh ones) ──
  const requestIdRef = useRef(0);

  const loadPage = useCallback(async (
    trashed: boolean, page: number, perPage: number,
    search: string, creator: CreatorFilter, categoryId: string | null, silent = false,
  ) => {
    const id = ++requestIdRef.current;
    if (!silent) {
      if (trashed) {
        setDeletedLoading(true);
      } else {
        setLoading(true);
      }
    }
    setLoadError(null);
    try {
      const result = await getPartyPage(
        trashed, page, perPage, search.trim(),
        "display_name", "asc",
        categoryId ? Number(categoryId) : undefined,
        creator !== "all" ? creator : undefined,
      );
      if (id !== requestIdRef.current) return; // stale response — a newer request is in flight
      if (trashed) {
        setDeletedParties(result.data);
        setDeletedTotal(result.meta.total);
      } else {
        setParties(result.data);
        setServerTotal(result.meta.total);
        setServerPage(result.meta.current_page);
      }
    } catch (e: any) {
      if (id !== requestIdRef.current) return;
      setLoadError(e.message ?? "Failed to load parties.");
    }
    if (id !== requestIdRef.current) return;
    if (trashed) {
      setDeletedLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  // ── Grid load (accumulates data for card view) ──
  const loadGrid = useCallback(async (reset: boolean) => {
    const reqId = ++gridReqRef.current;
    const trashed = partyTypeFilter === "deleted";
    setLoadError(null);
    if (reset) {
      setLoading(true);
      gridLoadedRef.current = 0;
    } else {
      setGridMoreLoading(true);
    }
    const page = reset ? 1 : Math.floor(gridLoadedRef.current / 12) + 1;
    try {
      const result = await getPartyPage(
        trashed, page, 12, debouncedSearch.trim(),
        "display_name", "asc",
        categoryFilter ? Number(categoryFilter) : undefined,
        creatorFilter !== "all" ? creatorFilter : undefined,
      );
      if (reqId !== gridReqRef.current) return;
      if (reset) {
        setGridItems(result.data);
      } else {
        setGridItems(prev => [...prev, ...result.data]);
      }
      gridLoadedRef.current = reset ? result.data.length : gridLoadedRef.current + result.data.length;
      setGridHasMore(gridLoadedRef.current < result.meta.total);
      if (reset) setServerTotal(result.meta.total);
    } catch (e: any) {
      if (reqId !== gridReqRef.current) return;
      if (reset) setLoadError(e.message ?? "Failed to load parties.");
    }
    if (reqId !== gridReqRef.current) return;
    if (reset) setLoading(false);
    else setGridMoreLoading(false);
  }, [partyTypeFilter, debouncedSearch, categoryFilter, creatorFilter]);

  // ── Main data load effect (list view) ──
  useEffect(() => {
    if (view === "grid") return;
    const trashed = partyTypeFilter === "deleted";
    const page = trashed ? deletedPage : serverPage;
    loadPage(trashed, page, serverPageSize, debouncedSearch, creatorFilter, categoryFilter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, partyTypeFilter, serverPage, deletedPage, serverPageSize, debouncedSearch, creatorFilter, categoryFilter]);

  // ── Grid load effect (grid view) ──
  useEffect(() => {
    if (view !== "grid") return;
    loadGrid(true);
  }, [view, loadGrid]);

  // ── Reset list pages when filter changes ──
  useEffect(() => {
    setServerPage(1);
    setDeletedPage(1);
  }, [partyTypeFilter]);

  useEffect(() => {
    setServerPage(1);
    setDeletedPage(1);
  }, [categoryFilter]);

  useEffect(() => {
    setServerPage(1);
    setDeletedPage(1);
  }, [creatorFilter]);

  useEffect(() => { localStorage.setItem(VIEW_LS_KEY, view); }, [view]);

  // ── handleRefresh ──
  const handleRefresh = useCallback(async () => {
    bustAllPartyCache();
    if (view === "grid") {
      loadGrid(true);
    } else {
      const trashed = partyTypeFilter === "deleted";
      const page = trashed ? deletedPage : serverPage;
      loadPage(trashed, page, serverPageSize, debouncedSearch, creatorFilter, categoryFilter, true);
    }
  }, [view, partyTypeFilter, serverPage, deletedPage, serverPageSize, debouncedSearch, creatorFilter, categoryFilter, loadPage, loadGrid]);

  useEffect(() => onMutation("parties:mutated", handleRefresh), [handleRefresh]);
  useWindowFocusRefresh(handleRefresh);

  // ── Build table columns ──
  // colWidthsRef keeps current widths without being a useMemo dependency,
  // preventing the entire column array from being rebuilt on every resize pixel.
  const columns = useMemo(() => {
    const resizeCell = (key: string) => () => ({
      colKey:       key,
      onResize:     handleResize,
      currentWidth: colWidthsRef.current[key] ?? DEFAULT_COL_WIDTHS[key] ?? 160,
    });

    const cols: object[] = [
      {
        title:      "Name",
        key:        "name",
        dataIndex:  "display_name",
        width:      colWidths["name"] ?? DEFAULT_COL_WIDTHS["name"],
        onHeaderCell: resizeCell("name"),
        render: (_: string, record: PartyListItem) => {
          const img = record.party_image ? `/storage/${record.party_image}` : null;
          return (
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle border d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                style={{ width: 36, height: 36, background: "#f5f5f5" }}
              >
                {img
                  ? <img src={img} alt={record.display_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <i className="ti ti-user text-muted fs-16" />
                }
              </div>
              <Link to={`/distributors/${record.id}`} className="title-name fw-medium">{record.display_name}</Link>
            </div>
          );
        },
      },
    ];

    for (const col of colOrder) {
      if (!visibleCols.has(col.key)) continue;
      switch (col.key) {
        case "party_id":
          cols.push({
            title: "Party ID", key: "party_id", dataIndex: "party_id",
            width: colWidths["party_id"] ?? DEFAULT_COL_WIDTHS["party_id"],
            onHeaderCell: resizeCell("party_id"),
            render: (text: string) => <span className="text-muted">{text || "—"}</span>,
          });
          break;
        case "party_type":
          cols.push({
            title: "Type", key: "party_type", dataIndex: "party_type",
            width: colWidths["party_type"] ?? DEFAULT_COL_WIDTHS["party_type"],
            onHeaderCell: resizeCell("party_type"),
            render: (text: string) => (
              <span className={`badge ${text === "business" ? "badge-soft-info" : "badge-soft-purple"}`}>
                {text === "business" ? "Business" : "Individual"}
              </span>
            ),
          });
          break;
        case "email":
          cols.push({
            title: "Email", key: "email", dataIndex: "email",
            width: colWidths["email"] ?? DEFAULT_COL_WIDTHS["email"],
            onHeaderCell: resizeCell("email"),
            render: (text: string | null) => <span className="text-muted">{text || "—"}</span>,
          });
          break;
        case "mobile":
          cols.push({
            title: "Mobile", key: "mobile", dataIndex: "mobile",
            width: colWidths["mobile"] ?? DEFAULT_COL_WIDTHS["mobile"],
            onHeaderCell: resizeCell("mobile"),
            render: (_: string | null, record: PartyListItem) =>
              record.mobile
                ? <span className="text-muted">{record.mobile_code ? `${record.mobile_code} ` : ""}{record.mobile}</span>
                : <span className="text-muted">—</span>,
          });
          break;
        case "distribution_category":
          cols.push({
            title: "Category", key: "distribution_category", dataIndex: "distribution_category",
            width: colWidths["distribution_category"] ?? DEFAULT_COL_WIDTHS["distribution_category"],
            onHeaderCell: resizeCell("distribution_category"),
            render: (_: any, record: PartyListItem) =>
              record.distribution_category
                ? <span className="text-muted">{record.distribution_category.name}</span>
                : <span className="text-muted">—</span>,
          });
          break;
        case "distribution_sub_category":
          cols.push({
            title: "Sub Category", key: "distribution_sub_category", dataIndex: "distribution_sub_category",
            width: colWidths["distribution_sub_category"] ?? DEFAULT_COL_WIDTHS["distribution_sub_category"],
            onHeaderCell: resizeCell("distribution_sub_category"),
            render: (_: any, record: PartyListItem) =>
              record.distribution_sub_category
                ? <span className="text-muted">{record.distribution_sub_category.name}</span>
                : <span className="text-muted">—</span>,
          });
          break;
        case "parent_party":
          cols.push({
            title: "Reporting To", key: "parent_party", dataIndex: "parent_party",
            width: colWidths["parent_party"] ?? DEFAULT_COL_WIDTHS["parent_party"],
            onHeaderCell: resizeCell("parent_party"),
            render: (_: any, record: PartyListItem) =>
              record.parent
                ? <span className="text-muted">{record.parent.display_name}</span>
                : <span className="text-muted">—</span>,
          });
          break;
        case "created_by_info":
          cols.push({
            title: "Created By", key: "created_by_info", dataIndex: "created_by_info",
            width: colWidths["created_by_info"] ?? DEFAULT_COL_WIDTHS["created_by_info"],
            onHeaderCell: resizeCell("created_by_info"),
            render: (_: any, record: PartyListItem) => {
              if (record.parent) {
                const phone = record.parent.mobile
                  ? `${record.parent.mobile_code ? record.parent.mobile_code + " " : ""}${record.parent.mobile}`
                  : null;
                return (
                  <div className="d-flex flex-column gap-1">
                    <span className="fw-medium text-dark">{record.parent.display_name}</span>
                    {phone && <span className="text-muted fs-12">{phone}</span>}
                    {record.parent.distribution_category && (
                      <span className="badge badge-soft-info fs-11" style={{ width: "fit-content" }}>
                        {record.parent.distribution_category.name}
                      </span>
                    )}
                  </div>
                );
              }
              if (record.created_by) {
                return <span className="text-muted">{record.created_by.name}</span>;
              }
              return <span className="text-muted">—</span>;
            },
          });
          break;
        case "payment_terms":
          cols.push({
            title: "Payment Terms", key: "payment_terms", dataIndex: "payment_terms",
            width: colWidths["payment_terms"] ?? DEFAULT_COL_WIDTHS["payment_terms"],
            onHeaderCell: resizeCell("payment_terms"),
            render: (text: string | null) => <span className="text-muted">{text || "—"}</span>,
          });
          break;
        case "currency":
          cols.push({
            title: "Currency", key: "currency", dataIndex: "currency",
            width: colWidths["currency"] ?? DEFAULT_COL_WIDTHS["currency"],
            onHeaderCell: resizeCell("currency"),
            render: (text: string | null) => <span className="text-muted">{text || "—"}</span>,
          });
          break;
        case "is_active":
          cols.push({
            title: "Status", key: "is_active", dataIndex: "is_active",
            width: colWidths["is_active"] ?? DEFAULT_COL_WIDTHS["is_active"],
            onHeaderCell: resizeCell("is_active"),
            render: (val: boolean) => (
              <span className={`badge ${val ? "badge-soft-success" : "badge-soft-warning"}`}>
                {val ? "Active" : "Inactive"}
              </span>
            ),
          });
          break;
        case "created_at":
          cols.push({
            title: "Added On", key: "created_at", dataIndex: "created_at",
            width: colWidths["created_at"] ?? DEFAULT_COL_WIDTHS["created_at"],
            onHeaderCell: resizeCell("created_at"),
            render: (text: string) =>
              text
                ? new Date(text).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                : "—",
          });
          break;
      }
    }

    // Last column fills remaining space; handle sits on left edge
    if (cols.length > 1) {
      const lastCol     = cols[cols.length - 1] as any;
      const prevCol     = cols[cols.length - 2] as any;
      const adjacentKey = prevCol.key as string;
      lastCol.onHeaderCell = () => ({
        colKey:       adjacentKey,
        onResize:     handleResize,
        currentWidth: colWidthsRef.current[adjacentKey] ?? DEFAULT_COL_WIDTHS[adjacentKey] ?? 160,
        handleSide:   "left",
      });
      delete lastCol.width;
    } else if (cols.length === 1) {
      delete (cols[0] as any).width;
    }

    return cols;
  }, [visibleCols, colOrder, handleResize]);

  // ── Grid search (local filter over accumulated grid items for instant feedback) ──
  const gridParties = useMemo(() => {
    if (!searchText.trim()) return gridItems;
    const q = searchText.toLowerCase();
    return gridItems.filter(p =>
      [
        p.display_name,
        p.company_name,
        p.first_name,
        p.last_name,
        p.email,
        p.mobile,
        p.party_id,
        p.distribution_category?.name,
        p.distribution_sub_category?.name,
        p.parent?.display_name,
        p.parent?.mobile,
        p.created_by?.name,
      ].some(v => v && String(v).toLowerCase().includes(q))
    );
  }, [gridItems, searchText]);

  // ── Export (current page data) ──
  const exportHeaders = ["Name", "Party ID", "Type", "Email", "Mobile", "Category", "Status", "Added On"];
  const buildExportRows = () => {
    const base = partyTypeFilter === "deleted" ? deletedParties : parties;
    return base.map(p => {
      const fmt = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
      return [
        p.display_name,
        p.party_id,
        p.party_type === "business" ? "Business" : "Individual",
        p.email || "—",
        p.mobile ? `${p.mobile_code ?? ""} ${p.mobile}`.trim() : "—",
        p.distribution_category?.name || "—",
        p.is_active ? "Active" : "Inactive",
        fmt(p.created_at),
      ];
    });
  };

  const handleExportPdf = () => {
    try { exportToPdfPrint("Parties", exportHeaders, buildExportRows()); }
    catch (e: any) { showToast("danger", e.message ?? "PDF export failed."); }
  };

  const handleExportExcel = () => {
    const fmt = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
    const base = partyTypeFilter === "deleted" ? deletedParties : parties;
    const rows = base.map(p => ({
      name:        p.display_name,
      party_id:    p.party_id,
      type:        p.party_type === "business" ? "Business" : "Individual",
      email:       p.email || "—",
      mobile:      p.mobile ? `${p.mobile_code ?? ""} ${p.mobile}`.trim() : "—",
      category:    p.distribution_category?.name || "—",
      status:      p.is_active ? "Active" : "Inactive",
      added_on:    fmt(p.created_at),
    }));
    exportToExcelFile("Parties", [
      { header: "Name",      key: "name",     width: 30 },
      { header: "Party ID",  key: "party_id", width: 18 },
      { header: "Type",      key: "type",     width: 14 },
      { header: "Email",     key: "email",    width: 26 },
      { header: "Mobile",    key: "mobile",   width: 18 },
      { header: "Category",  key: "category", width: 20 },
      { header: "Status",    key: "status",   width: 14 },
      { header: "Added On",  key: "added_on", width: 16 },
    ], rows).catch(() => showToast("danger", "Excel export failed."));
  };

  const filterLabel: Record<typeof partyTypeFilter, string> = {
    all:        "All Parties",
    business:   "Business",
    individual: "Individual",
    deleted:    "Deleted",
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="content">

          <PageHeader
            title="Parties"
            badgeCount={serverTotal}
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
                <Link to={route.addNewDistributors} className="btn btn-primary">
                  <i className="ti ti-square-rounded-plus-filled me-1" />
                  New Party
                </Link>
              )}
            </div>

            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">

                {/* Left — filter */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="dropdown">
                    <Link to="#" className="dropdown-toggle btn btn-outline-light px-2 fs-16 fw-bold border-0" data-bs-toggle="dropdown">
                      {partyTypeFilter === "deleted"
                        ? "Deleted"
                        : categoryFilter
                          ? (categoryOpts.find(o => o.value === categoryFilter)?.label ?? "All Parties")
                          : "All Parties"}
                    </Link>
                    <div className="dropdown-menu dropmenu-hover-primary">
                      <ul>
                        <li>
                          <button
                            className={`dropdown-item d-flex align-items-center gap-2${partyTypeFilter !== "deleted" && !categoryFilter ? " active" : ""}`}
                            onClick={() => { setPartyTypeFilter("all"); setCategoryFilter(null); }}
                          >
                            <i className="ti ti-layout-list fs-15" />All Parties
                          </button>
                        </li>
                        {categoryOpts.map(opt => (
                          <li key={opt.value}>
                            <button
                              className={`dropdown-item d-flex align-items-center gap-2${categoryFilter === opt.value ? " active" : ""}`}
                              onClick={() => { setCategoryFilter(opt.value); setPartyTypeFilter("all"); }}
                            >
                              <i className="ti ti-tag fs-15" />{opt.label}
                            </button>
                          </li>
                        ))}
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button
                            className={`dropdown-item d-flex align-items-center gap-2${partyTypeFilter === "deleted" ? " active" : ""}`}
                            onClick={() => { setPartyTypeFilter("deleted"); setCategoryFilter(null); }}
                          >
                            <i className="ti ti-trash fs-15" />Deleted
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right — sort / columns / view toggle */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {!isParty && (
                    <div className="dropdown">
                      <button type="button" className="dropdown-toggle btn btn-outline-light px-2 shadow" data-bs-toggle="dropdown">
                        <i className="ti ti-filter me-2" />
                        {creatorFilter === "company" ? "Company" : creatorFilter === "party" ? "Party" : "All"}
                      </button>
                      <div className="dropdown-menu dropmenu-hover-primary">
                        <ul>
                          <li>
                            <button
                              className={`dropdown-item d-flex align-items-center gap-2${creatorFilter === "all" ? " active" : ""}`}
                              onClick={() => setCreatorFilter("all")}
                            >
                              <i className="ti ti-layout-list fs-15" />All
                            </button>
                          </li>
                          <li>
                            <button
                              className={`dropdown-item d-flex align-items-center gap-2${creatorFilter === "company" ? " active" : ""}`}
                              onClick={() => setCreatorFilter("company")}
                            >
                              <i className="ti ti-building fs-15" />Company
                            </button>
                          </li>
                          <li>
                            <button
                              className={`dropdown-item d-flex align-items-center gap-2${creatorFilter === "party" ? " active" : ""}`}
                              onClick={() => setCreatorFilter("party")}
                            >
                              <i className="ti ti-users fs-15" />Party
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

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
                      onClick={() => setView("grid")}
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
                  <button type="button" className="btn btn-sm btn-outline-danger ms-auto" onClick={handleRefresh}>Retry</button>
                </div>
              )}

              {(loading || (partyTypeFilter === "deleted" && deletedLoading)) ? null : view === "list" ? (
                (partyTypeFilter === "deleted" ? deletedParties : parties).length === 0 && !loadError ? (
                  <div className="text-center py-5">
                    <i className="ti ti-users fs-40 d-block mb-4 text-muted opacity-50" />
                    <h6 className="fw-semibold mb-2">
                      {partyTypeFilter === "deleted" ? "No Deleted Parties" : "No Parties Found"}
                    </h6>
                    <p className="text-muted mb-4 fs-14">
                      {partyTypeFilter === "deleted"
                        ? "No deleted parties match your search."
                        : debouncedSearch
                          ? "No parties match your search. Try a different keyword."
                          : "Get started by adding your first party."}
                    </p>
                    {!debouncedSearch && partyTypeFilter !== "deleted" && creatorFilter !== "party" && (
                      <Link to={route.addNewDistributors} className="btn btn-primary px-4">
                        <i className="ti ti-square-rounded-plus-filled me-1" />
                        Add New Party
                      </Link>
                    )}
                  </div>
                ) : (
                <div className="items-custom-table custom-table table-nowrap">
                  <Datatable
                    columns={columns}
                    dataSource={partyTypeFilter === "deleted" ? deletedParties : parties}
                    Selection={false}
                    searchText=""
                    components={TABLE_COMPONENTS}
                    scroll={{ x: "max-content" }}
                    rowKey="id"
                    serverTotal={partyTypeFilter === "deleted" ? deletedTotal : serverTotal}
                    serverPage={partyTypeFilter === "deleted" ? deletedPage : serverPage}
                    serverPageSize={serverPageSize}
                    onServerPageChange={(page, size) => {
                      setServerPageSize(size);
                      if (partyTypeFilter === "deleted") setDeletedPage(page);
                      else setServerPage(page);
                    }}
                    onRow={(record: PartyListItem) => ({
                      onClick: () => navigate(`/distributors/${record.id}`, {
                        state: partyTypeFilter === "deleted" ? { listFilter: "deleted" } : undefined,
                      }),
                      style: { cursor: "pointer" },
                    })}
                  />
                </div>
                )
              ) : (
                /* ── Grid view ───────────────────────────────────────── */
                <>
                  {gridParties.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="ti ti-users fs-40 d-block mb-4 text-muted opacity-50" />
                      <h6 className="fw-semibold mb-2">
                        {partyTypeFilter === "deleted" ? "No Deleted Parties" : "No Parties Found"}
                      </h6>
                      <p className="text-muted mb-4 fs-14">
                        {partyTypeFilter === "deleted"
                          ? "No deleted parties match your search."
                          : searchText.trim()
                            ? "No parties match your search. Try a different keyword."
                            : "Get started by adding your first party."}
                      </p>
                      {!searchText.trim() && partyTypeFilter !== "deleted" && creatorFilter !== "party" && (
                        <Link to={route.addNewDistributors} className="btn btn-primary px-4">
                          <i className="ti ti-square-rounded-plus-filled me-1" />
                          Add New Party
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="row">
                      {gridParties.map((party) => {
                        const img  = party.party_image ? `/storage/${party.party_image}` : null;
                        const date = new Date(party.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        });
                        return (
                          <div key={party.id} className="col-xxl-3 col-xl-4 col-md-6">
                            <div
                              className="card border shadow"
                              style={{ cursor: "pointer" }}
                              onClick={() => navigate(`/distributors/${party.id}`, {
                                state: partyTypeFilter === "deleted" ? { listFilter: "deleted" } : undefined,
                              })}
                            >
                              <div className="card-body">

                                {/* Header: Party ID badge */}
                                <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                                  <span className="badge badge-soft-info">{party.party_id}</span>
                                  <span className={`badge ${party.is_active ? "badge-soft-success" : "badge-soft-warning"}`}>
                                    {party.is_active ? "Active" : "Inactive"}
                                  </span>
                                </div>

                                {/* Title block */}
                                <div className="d-block">
                                  <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div>
                                      <h4 className="mb-1 fs-14 fw-semibold">{party.display_name}</h4>
                                      <p className="fs-13 mb-0 text-muted">{party.company_name || (party.first_name ? `${party.first_name} ${party.last_name ?? ""}`.trim() : "—")}</p>
                                    </div>
                                    <span className={`badge ${party.party_type === "business" ? "badge-soft-info" : "badge-soft-purple"}`}>
                                      {party.party_type === "business" ? "Business" : "Individual"}
                                    </span>
                                  </div>

                                  {/* Metadata rows */}
                                  <div className="mb-3">
                                    <p className="d-flex align-items-center mb-2">
                                      <span className="me-2 text-dark"><i className="ti ti-mail fs-12" /></span>
                                      <span className="text-muted text-truncate">{party.email || "No email"}</span>
                                    </p>
                                    <p className="d-flex align-items-center mb-2">
                                      <span className="me-2 text-dark"><i className="ti ti-phone fs-12" /></span>
                                      <span className="text-muted">
                                        {party.mobile ? `${party.mobile_code ?? ""} ${party.mobile}`.trim() : "No mobile"}
                                      </span>
                                    </p>
                                    <p className="d-flex align-items-center">
                                      <span className="me-2 text-dark"><i className="ti ti-tag fs-12" /></span>
                                      <span className="text-muted">
                                        {party.distribution_category?.name || "No category"}
                                      </span>
                                    </p>
                                  </div>
                                </div>

                                {/* Footer: avatar + date */}
                                <div className="rounded">
                                  <div className="d-flex align-items-center">
                                    <div className="avatar rounded-circle bg-white border me-2 d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0">
                                      {img
                                        ? <img src={img} alt={party.display_name} className="w-auto h-auto" style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                                        : <i className="ti ti-user text-muted fs-16" />
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

                  {gridHasMore && (
                    <div className="load-btn text-center mt-3">
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={gridMoreLoading}
                        onClick={() => loadGrid(false)}
                      >
                        {gridMoreLoading
                          ? <><i className="ti ti-loader-2 me-1" />Loading...</>
                          : <><i className="ti ti-loader me-1" />Load More</>}
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
          onClose={() => setToast(t => ({ ...t, show: false }))}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{ pointerEvents: "auto", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.10)", border: "none", minWidth: 320, background: "#fff" }}
        >
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

export default DistributorsList;
