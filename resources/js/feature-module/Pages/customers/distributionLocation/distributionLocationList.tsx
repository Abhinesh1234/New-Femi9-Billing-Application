import React, { useCallback, useEffect, useMemo, useRef, useState, type ThHTMLAttributes } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
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
import { exportToExcelFile, exportToPdfPrint } from "../../../../core/utils/exportUtils";
import {
  type Country,
  type LayerSchema,
  type DistributionLocationNode,
  extractApiError,
  getCountry,
  upsertLayerSchema,
  deleteLayerSchema,
  getNodeAncestors,
  createCountry,
  updateCountry,
  deleteCountry,
  bulkDeleteCountries,
  bulkRestoreCountries,
  restoreCountry,
  createNode,
  updateNode,
  deleteNode,
  bulkDeleteNodes,
  bulkRestoreNodes,
  restoreNode,
  suggestCountries,
  type CountrySuggestion,
} from "../../../../core/services/distributionLocationApi";
import {
  readCountryList,
  readNodeList,
  readLayerSchema,
  getCountryList,
  getNodeList,
  getCachedLayerSchema,
  hydrateCountryList,
  hydrateNodeList,
  hydrateLayerSchema,
  bustDistributionList,
  bustLayerSchema,
} from "../../../../core/cache/distributionLocationCache";
import { emitMutation, onMutation } from "../../../../core/cache/mutationEvents";
import { usePermission } from "../../../../core/hooks/usePermission";

// ── Types ─────────────────────────────────────────────────────────────────────

interface DynRow {
  id: number;
  name: string;
  code: string | null;
  is_active: boolean;
  children_count: number;
  created_at: string;
  deleted_at?: string | null;
  // Country-only fields
  phone_code?: string | null;
  currency_code?: string | null;
  currency_symbol?: string | null;
  phone_digits?: number | null;
}

// Phone number digit count by ISO alpha-2 country code
const PHONE_DIGITS_MAP: Record<string, number> = {
  AF:10,AL: 9,DZ: 9,AD: 9,AO: 9,AG:10,AR:10,AM: 8,AU: 9,AT:10,
  AZ: 9,BS:10,BH: 8,BD:10,BB:10,BY: 9,BE: 9,BZ: 7,BJ: 8,BT: 8,
  BO: 8,BA: 8,BW: 7,BR:11,BN: 7,BG: 9,BF: 8,BI: 8,CV: 7,KH: 9,
  CM: 9,CA:10,CF: 8,TD: 8,CL: 9,CN:11,CO:10,KM: 7,CG: 9,CD: 9,
  CR: 8,CI: 8,HR: 9,CU: 8,CY: 8,CZ: 9,DK: 8,DJ: 8,DM:10,DO:10,
  EC: 9,EG:10,SV: 8,GQ: 9,ER: 7,EE: 7,SZ: 8,ET: 9,FJ: 7,FI: 9,
  FR: 9,GA: 7,GM: 7,GE: 9,DE:10,GH: 9,GR:10,GD:10,GT: 8,GN: 9,
  GW: 7,GY: 7,HT: 8,HN: 8,HU: 9,IS: 7,IN:10,ID:10,IR:10,IQ:10,
  IE: 9,IL: 9,IT:10,JM:10,JP:10,JO: 9,KZ:10,KE:10,KI: 8,KW: 8,
  KG: 9,LA: 9,LV: 8,LB: 8,LS: 8,LR: 7,LY: 9,LI: 7,LT: 8,LU: 9,
  MG: 9,MW: 9,MY: 9,MV: 7,ML: 8,MT: 8,MH: 7,MR: 8,MU: 8,MX:10,
  FM: 7,MD: 8,MC: 8,MN: 8,ME: 8,MA: 9,MZ: 9,MM: 9,NA: 9,NR: 7,
  NP:10,NL: 9,NZ: 9,NI: 8,NE: 8,NG:10,NO: 8,OM: 8,PK:10,PW: 7,
  PA: 8,PG: 8,PY: 9,PE: 9,PH:10,PL: 9,PT: 9,QA: 8,RO: 9,RU:10,
  RW: 9,KN:10,LC:10,VC:10,WS: 7,SM: 8,ST: 7,SA: 9,SN: 9,RS: 9,
  SC: 7,SL: 8,SG: 8,SK: 9,SI: 8,SB: 7,SO: 9,ZA: 9,SS: 9,ES: 9,
  LK: 9,SD: 9,SR: 7,SE: 9,CH: 9,SY: 9,TW: 9,TJ: 9,TZ: 9,TH: 9,
  TL: 8,TG: 8,TO: 7,TT:10,TN: 8,TR:10,TM: 8,TV: 7,UG: 9,UA: 9,
  AE: 9,GB:10,US:10,UY: 9,UZ: 9,VU: 7,VE:10,VN:10,YE: 9,ZM: 9,ZW: 9,
};

interface Crumb {
  label: string;
  url: string;
}

type ModalState =
  | { type: "none" }
  | { type: "add_edit"; row: DynRow | null }
  | { type: "define_layer" }
  | { type: "layer_names" }
  | { type: "delete"; row: DynRow }
  | { type: "bulk_delete"; count: number };

// ── Column definitions ────────────────────────────────────────────────────────

interface ColDef { key: string; label: string; }

const INITIAL_COLS: ColDef[] = [
  { key: "code",          label: "Code"          },
  { key: "sub_locations", label: "Sub-locations" },
  { key: "is_active",     label: "Status"        },
  { key: "created_at",    label: "Created Date"  },
];

const DEFAULT_VISIBLE = new Set(["sub_locations", "is_active"]);

const DEFAULT_COL_WIDTHS: Record<string, number> = {
  name:          240,
  code:          120,
  sub_locations: 160,
  is_active:     110,
  created_at:    160,
};

const COL_WIDTHS_LS_KEY  = "femi9_dynloc_col_widths";
const COL_ORDER_LS_KEY   = "femi9_dynloc_col_order";
const COL_VISIBLE_LS_KEY = "femi9_dynloc_col_visible";
const VIEW_LS_KEY        = "femi9_dynloc_view";

// ── ResizableTitle ────────────────────────────────────────────────────────────

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
          <span style={{ width: 2, height: handleVisible ? "55%" : 0, background: "var(--bs-primary, #0d6efd)", borderRadius: 2, transition: "height 0.15s ease", pointerEvents: "none", opacity: handleVisible ? 0.7 : 0 }} />
        </span>
      )}
    </th>
  );
}

const TABLE_COMPONENTS = { header: { cell: ResizableTitle } };

// ── SortableColRow ────────────────────────────────────────────────────────────

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

// ── Main component ────────────────────────────────────────────────────────────

const DynamicLocationList = () => {
  const { "*": wildcard } = useParams();
  const navLocation = useLocation();
  const navigate    = useNavigate();
  const canCreate = usePermission("locations", "create");
  const canEdit   = usePermission("locations", "edit");
  const canDelete = usePermission("locations", "delete");

  // ── URL parsing ──
  const segments = useMemo(
    () => (wildcard ?? "").split("/").filter(Boolean),
    [wildcard],
  );
  const isRoot        = segments.length === 0;
  const countryId     = segments.length >= 1 ? Number(segments[0]) : null;
  const currentNodeId = segments.length >= 2 ? Number(segments[segments.length - 1]) : null;
  const currentDepth  = segments.length; // 0=countries, 1=first layer, 2=second, …

  // ── Data state ──
  const [rows,        setRows]        = useState<DynRow[]>([]);
  const [deletedRows, setDeletedRows] = useState<DynRow[]>([]);
  const [layerSchema, setLayerSchema] = useState<LayerSchema[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<Crumb[]>([
    { label: "Distribution Locations", url: "/distribution-locations" },
  ]);
  const [loading,     setLoading]     = useState(true);
  const [loadError,   setLoadError]   = useState<string | null>(null);
  const [refreshKey,  setRefreshKey]  = useState(0);
  const triggerRefresh = useCallback(() => {
    bustDistributionList(countryId, currentNodeId);
    setDeletedRows([]);
    setRefreshKey(k => k + 1);
  }, [countryId, currentNodeId]);

  // ── Selection state ──
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkRestoring, setBulkRestoring] = useState(false);
  const [restoringId, setRestoringId] = useState<number | null>(null);

  // ── Layer names panel state ──
  const [layerEditDepth,          setLayerEditDepth]          = useState<number | null>(null);
  const [layerEditName,           setLayerEditName]           = useState("");
  const [layerEditSaving,         setLayerEditSaving]         = useState(false);
  const [layerDeleteConfirmDepth,    setLayerDeleteConfirmDepth]    = useState<number | null>(null);
  const [layerDeleting,              setLayerDeleting]              = useState(false);
  const [defineLayerDeleteConfirm,   setDefineLayerDeleteConfirm]   = useState(false);

  // ── UI state ──
  const [searchText, setSearchText] = useState("");
  const [listFilter, setListFilter] = useState<"active" | "deleted">("active");
  const [view, setView] = useState<"list" | "grid">(() => {
    try { return localStorage.getItem(VIEW_LS_KEY) === "grid" ? "grid" : "list"; }
    catch { return "list"; }
  });
  const [gridPage, setGridPage] = useState(12);

  const tableWrapRef = useRef<HTMLDivElement>(null);

  // ── Toast ──
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "danger" }>({
    show: false, message: "", type: "success",
  });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (message: string, type: "success" | "danger" = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ show: true, message, type });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  // ── Columns modal state ──
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
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        const valid = new Set(INITIAL_COLS.map(c => c.key));
        return new Set<string>(parsed.filter(k => valid.has(k)));
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

  // ── DnD sensors for cols modal ──
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

  // ── Modal state ──
  const [modal,            setModal]            = useState<ModalState>({ type: "none" });
  const [formName,         setFormName]         = useState("");
  const [formCode,         setFormCode]         = useState("");
  const [formActive,       setFormActive]       = useState(true);
  const [formLayerName,    setFormLayerName]    = useState("");
  const [formApplyToAll,   setFormApplyToAll]   = useState(true);
  const [formSaving,       setFormSaving]       = useState(false);
  const [formErrors,       setFormErrors]       = useState<Record<string, string>>({});
  // Country-only extra fields
  const [formPhoneCode,      setFormPhoneCode]      = useState("");
  const [formCurrencyCode,   setFormCurrencyCode]   = useState("");
  const [formCurrencySymbol, setFormCurrencySymbol] = useState("");
  const [formPhoneDigits,    setFormPhoneDigits]    = useState("");
  // Country name autocomplete (proxied through backend)
  const [countrySuggestions,        setCountrySuggestions]        = useState<CountrySuggestion[]>([]);
  const [countrySuggestionsLoading, setCountrySuggestionsLoading] = useState(false);
  const [showCountrySuggestions,    setShowCountrySuggestions]    = useState(false);
  const countrySearchTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countrySearchAbort  = useRef<AbortController | null>(null);

  // Clean up timer on unmount to avoid setState on unmounted component
  useEffect(() => () => {
    if (countrySearchTimer.current) clearTimeout(countrySearchTimer.current);
    if (countrySearchAbort.current) countrySearchAbort.current.abort();
  }, []);

  const fetchCountrySuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) { setCountrySuggestions([]); setShowCountrySuggestions(false); return; }
    if (countrySearchAbort.current) countrySearchAbort.current.abort();
    const controller = new AbortController();
    countrySearchAbort.current = controller;
    setCountrySuggestionsLoading(true);
    try {
      const results = await suggestCountries(query.trim(), controller.signal);
      setCountrySuggestions(results.slice(0, 6));
      setShowCountrySuggestions(true);
    } catch (err) {
      if ((err as Error).name !== "AbortError" && (err as Error).name !== "CanceledError")
        setCountrySuggestions([]);
    } finally {
      setCountrySuggestionsLoading(false);
    }
  }, []);

  const applyCountrySuggestion = (s: CountrySuggestion) => {
    const digits = PHONE_DIGITS_MAP[s.code ?? ""] ?? 10;
    setFormName(s.name);
    setFormCode(s.code ?? "");
    setFormPhoneCode(s.phone_code ?? "");
    setFormCurrencyCode(s.currency_code ?? "");
    setFormCurrencySymbol(s.currency_symbol ?? "");
    setFormPhoneDigits(String(digits));
    setShowCountrySuggestions(false);
    setCountrySuggestions([]);
  };

  const clearFormError = (key: string) =>
    setFormErrors(prev => { const n = { ...prev }; delete n[key]; return n; });

  // ── Derived labels ──
  // Prefer a node-specific schema (parent_node_id matches current parent) over the global one
  const specificLayerDef = currentNodeId !== null
    ? layerSchema.find(s => s.depth === currentDepth && s.parent_node_id === currentNodeId)
    : null;
  const globalLayerDef   = layerSchema.find(s => s.depth === currentDepth && s.parent_node_id === 0);
  const currentLayerDef  = specificLayerDef ?? globalLayerDef;
  const currentLayerName = isRoot ? "Country" : (currentLayerDef?.layer_name ?? "");
  const hasLayerDefined  = isRoot || !!currentLayerDef;

  const pluralLabel = (name: string) => name ? (name.endsWith("y") ? name.slice(0, -1) + "ies" : name + "s") : "Items";

  const applyToAllLabel = "Inherit from global";

  // ── Persist view ──
  useEffect(() => { localStorage.setItem(VIEW_LS_KEY, view); }, [view]);

  // ── Clear selection on filter/data change ──
  useEffect(() => { setSelectedIds(new Set()); }, [listFilter, refreshKey, wildcard]);

  // ── Data loading ──
  useEffect(() => {
    const controller = new AbortController();

    const fetchAll = async () => {
      // Cache-first: render immediately from cache if available, skip spinner
      const cached = isRoot
        ? readCountryList(false)
        : countryId !== null ? readNodeList(countryId, currentNodeId, false) : undefined;
      if (cached) {
        setRows(cached as unknown as DynRow[]);
        setLoading(false);
      } else {
        setLoading(true);
      }

      setLoadError(null);
      setListFilter("active");
      setSearchText("");
      setGridPage(12);

      try {
        // Breadcrumbs: use navigate state if available (fast path), else fetch from API
        const navState = navLocation.state as { breadcrumbs?: Crumb[] } | null;
        const navCrumbs = navState?.breadcrumbs;
        if (navCrumbs) {
          setBreadcrumbs(navCrumbs);
        } else {
          const base: Crumb[] = [{ label: "Distribution Locations", url: "/distribution-locations" }];
          if (!isRoot && countryId) {
            try {
              const country = await getCountry(countryId);
              if (controller.signal.aborted) return;
              base.push({ label: country.name, url: `/distribution-locations/${segments[0]}` });

              if (currentNodeId !== null) {
                const { ancestors, current } = await getNodeAncestors(currentNodeId);
                if (controller.signal.aborted) return;
                for (let i = 0; i < ancestors.length; i++) {
                  const path = segments.slice(0, i + 2).join("/");
                  base.push({ label: ancestors[i].name, url: `/distribution-locations/${path}` });
                }
                base.push({ label: current.name, url: `/distribution-locations/${segments.join("/")}` });
              }
            } catch { /* breadcrumb best-effort */ }
          }
          if (!controller.signal.aborted) setBreadcrumbs(base);
        }

        // Layer schema — cache-first
        if (!isRoot && countryId) {
          try {
            const cachedSchema = readLayerSchema(countryId);
            if (cachedSchema && !controller.signal.aborted) setLayerSchema(cachedSchema);
            const schema = await getCachedLayerSchema(countryId);
            if (!controller.signal.aborted) { setLayerSchema(schema); hydrateLayerSchema(countryId, schema); }
          } catch {
            if (!controller.signal.aborted) setLayerSchema([]);
          }
        } else {
          setLayerSchema([]);
        }

        // Active rows — cache-first, then network, then hydrate
        if (isRoot) {
          const active = await getCountryList(false);
          if (!controller.signal.aborted) {
            setRows(active as unknown as DynRow[]);
            setDeletedRows([]);
            hydrateCountryList(active);
          }
        } else if (countryId !== null) {
          const active = await getNodeList(countryId, currentNodeId, false);
          if (!controller.signal.aborted) {
            setRows(active as unknown as DynRow[]);
            setDeletedRows([]);
            hydrateNodeList(countryId, currentNodeId, active);
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setRows([]); setDeletedRows([]);
          setLoadError(extractApiError(err).message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchAll();
    return () => { controller.abort(); };
  }, [wildcard, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Lazy-load deleted rows when filter switches to "deleted" — cache-first ──
  useEffect(() => {
    if (listFilter !== "deleted" || deletedRows.length > 0) return;

    // Serve from cache immediately if available
    const cachedDeleted = isRoot
      ? readCountryList(true)
      : countryId !== null ? readNodeList(countryId, currentNodeId, true) : undefined;
    if (cachedDeleted) { setDeletedRows(cachedDeleted as unknown as DynRow[]); return; }

    let cancelled = false;
    const load = async () => {
      try {
        if (isRoot) {
          const deleted = await getCountryList(true);
          if (!cancelled) { setDeletedRows(deleted as unknown as DynRow[]); hydrateCountryList(deleted, true); }
        } else if (countryId !== null) {
          const deleted = await getNodeList(countryId, currentNodeId, true);
          if (!cancelled) { setDeletedRows(deleted as unknown as DynRow[]); hydrateNodeList(countryId, currentNodeId, deleted, true); }
        }
      } catch { /* non-critical — user sees empty deleted list */ }
    };
    load();
    return () => { cancelled = true; };
  }, [listFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Window focus reload — cache-first, no extra network hit if data is still fresh ──
  useEffect(() => {
    const onFocus = () => {
      if (isRoot) {
        getCountryList(false)
          .then(data => { setRows(data as unknown as DynRow[]); })
          .catch(() => {});
      } else if (countryId !== null) {
        getNodeList(countryId, currentNodeId, false)
          .then(data => { setRows(data as unknown as DynRow[]); })
          .catch(() => {});
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [isRoot, countryId, currentNodeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cross-page mutation listener ──
  useEffect(() => onMutation("distribution-locations:mutated", triggerRefresh), [triggerRefresh]);

  // ── Filtered rows ──
  const displaySource = listFilter === "deleted" ? deletedRows : rows;
  const filteredRows = useMemo(() => {
    if (!searchText.trim()) return displaySource;
    const q = searchText.toLowerCase();
    return displaySource.filter(r =>
      r.name.toLowerCase().includes(q) ||
      (r.code ?? "").toLowerCase().includes(q),
    );
  }, [displaySource, searchText]);

  // ── Table columns ──
  const columns = useMemo(() => {
    const resizeCell = (key: string) => () => ({
      colKey: key,
      onResize: handleResize,
      currentWidth: colWidths[key] ?? DEFAULT_COL_WIDTHS[key] ?? 160,
    });

    const allVisible = filteredRows.length > 0 && filteredRows.every(r => selectedIds.has(r.id));
    const someSelected = filteredRows.some(r => selectedIds.has(r.id));

    const cols: object[] = [
      {
        title: (
          <input
            type="checkbox"
            className="form-check-input"
            style={{ accentColor: "#ef4444" }}
            checked={allVisible}
            ref={(el) => { if (el) el.indeterminate = someSelected && !allVisible; }}
            onChange={() => {
              if (allVisible) {
                setSelectedIds(prev => { const n = new Set(prev); filteredRows.forEach(r => n.delete(r.id)); return n; });
              } else {
                setSelectedIds(prev => { const n = new Set(prev); filteredRows.forEach(r => n.add(r.id)); return n; });
              }
            }}
            onClick={e => e.stopPropagation()}
          />
        ),
        key: "select",
        width: 48,
        render: (_: any, record: DynRow) => (
          <input
            type="checkbox"
            className="form-check-input"
            style={{ accentColor: "#ef4444" }}
            checked={selectedIds.has(record.id)}
            onChange={() => {
              setSelectedIds(prev => {
                const n = new Set(prev);
                n.has(record.id) ? n.delete(record.id) : n.add(record.id);
                return n;
              });
            }}
            onClick={e => e.stopPropagation()}
          />
        ),
      },
      {
        title: "Name",
        key: "name",
        dataIndex: "name",
        width: colWidths["name"] ?? DEFAULT_COL_WIDTHS["name"],
        onHeaderCell: resizeCell("name"),
        render: (_: string, record: DynRow) => (
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded border d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 36, height: 36, background: "#f5f5f5" }}
            >
              <i className={`ti ${isRoot ? "ti-flag-3" : "ti-map-pin"} text-muted fs-16`} />
            </div>
            <div style={{ minWidth: 0 }}>
              <span className="fw-medium title-name">{record.name}</span>
              {record.code && <span className="text-muted fs-12 ms-2">({record.code})</span>}
            </div>
            {!record.is_active && <span className="badge badge-soft-danger ms-1 fs-11">Inactive</span>}
            {listFilter !== "deleted" && record.children_count > 0 && (
              <i className="ti ti-chevron-right fs-13 text-muted ms-auto flex-shrink-0" />
            )}
          </div>
        ),
      },
    ];

    for (const col of colOrder) {
      if (!visibleCols.has(col.key)) continue;
      switch (col.key) {
        case "code":
          cols.push({
            title: "Code",
            key: "code",
            dataIndex: "code",
            width: colWidths["code"] ?? DEFAULT_COL_WIDTHS["code"],
            onHeaderCell: resizeCell("code"),
            render: (val: string | null) => val
              ? <span className="text-dark">{val}</span>
              : <span className="text-muted">—</span>,
          });
          break;
        case "sub_locations":
          cols.push({
            title: "Sub-locations",
            key: "sub_locations",
            dataIndex: "children_count",
            width: colWidths["sub_locations"] ?? DEFAULT_COL_WIDTHS["sub_locations"],
            onHeaderCell: resizeCell("sub_locations"),
            render: (val: number) => val > 0
              ? <span className="badge badge-soft-secondary">{val}</span>
              : <span className="text-muted">—</span>,
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
            title: "Created Date",
            key: "created_at",
            dataIndex: "created_at",
            width: colWidths["created_at"] ?? DEFAULT_COL_WIDTHS["created_at"],
            onHeaderCell: resizeCell("created_at"),
            render: (val: string) => val
              ? new Date(val).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
              : <span className="text-muted">—</span>,
          });
          break;
      }
    }

    // Actions column (always last, fixed)
    const actionsCol: any = {
      title: "Actions",
      key: "actions",
      render: (_: any, record: DynRow) => (
        <div className="d-flex align-items-center gap-1" onClick={e => e.stopPropagation()}>
          {listFilter !== "deleted" && canEdit && (
            <button
              className="btn btn-sm btn-icon border-0"
              title="Edit"
              onClick={() => openEditModal(record)}
            >
              <i className="ti ti-edit fs-18 text-muted" />
            </button>
          )}
          {listFilter === "deleted" ? (
            canDelete && (
              <button
                className="btn btn-sm btn-icon border-0"
                title="Restore"
                disabled={restoringId !== null}
                onClick={() => handleRestore(record)}
              >
                {restoringId === record.id
                  ? <span className="spinner-border spinner-border-sm text-success" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  : <i className="ti ti-restore fs-18 text-success" />}
              </button>
            )
          ) : (
            canDelete && (
              <button
                className="btn btn-sm btn-icon border-0"
                title={record.children_count > 0 ? `Cannot delete: has ${record.children_count} sub-location(s)` : "Delete"}
                disabled={record.children_count > 0}
                style={record.children_count > 0 ? { opacity: 0.35, cursor: "not-allowed" } : undefined}
                onClick={() => setModal({ type: "delete", row: record })}
              >
                <i className="ti ti-trash fs-18 text-danger" />
              </button>
            )
          )}
        </div>
      ),
    };

    cols.push(actionsCol);

    // Actions is the last column — its left-edge handle resizes the column before it.
    // Delete width from Actions (not the previous col) so Actions fills remaining space.
    if (cols.length > 1) {
      const lastCol = cols[cols.length - 1] as any;   // actionsCol
      const prevCol = cols[cols.length - 2] as any;   // last content col
      lastCol.onHeaderCell = () => ({
        colKey:       prevCol.key as string,
        onResize:     handleResize,
        currentWidth: colWidths[prevCol.key] ?? DEFAULT_COL_WIDTHS[prevCol.key] ?? 160,
        handleSide:   "left",
      });
      delete lastCol.width;
    }

    return cols;
  }, [visibleCols, colOrder, colWidths, handleResize, listFilter, isRoot, selectedIds, filteredRows]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Navigation ──
  const drillDown = (row: DynRow) => {
    if (listFilter === "deleted") return;
    const newSegments = isRoot
      ? [String(row.id)]
      : [...segments, String(row.id)];
    const newUrl  = `/distribution-locations/${newSegments.join("/")}`;
    const newCrumb: Crumb = { label: row.name, url: newUrl };
    navigate(newUrl, {
      state: { breadcrumbs: [...breadcrumbs, newCrumb] },
    });
  };

  // ── Modal openers ──
  const openAddModal = () => {
    setFormName(""); setFormCode(""); setFormActive(true); setFormErrors({});
    setFormPhoneCode(""); setFormCurrencyCode(""); setFormCurrencySymbol(""); setFormPhoneDigits("");
    setCountrySuggestions([]); setShowCountrySuggestions(false);
    setModal({ type: "add_edit", row: null });
  };

  const openEditModal = (row: DynRow) => {
    setFormName(row.name); setFormCode(row.code ?? ""); setFormActive(row.is_active); setFormErrors({});
    setFormPhoneCode(row.phone_code ?? "");
    setFormCurrencyCode(row.currency_code ?? "");
    setFormCurrencySymbol(row.currency_symbol ?? "");
    setFormPhoneDigits(row.phone_digits != null ? String(row.phone_digits) : "");
    setCountrySuggestions([]); setShowCountrySuggestions(false);
    setModal({ type: "add_edit", row });
  };

  const openDefineLayerModal = () => {
    setFormLayerName(currentLayerDef?.layer_name ?? "");
    setFormApplyToAll(!specificLayerDef);
    setFormErrors({});
    setDefineLayerDeleteConfirm(false);
    setModal({ type: "define_layer" });
  };

  // ── Save add/edit ──
  const handleSave = async () => {
    if (!formName.trim()) {
      setFormErrors({ name: "Name is required." });
      return;
    }
    setFormSaving(true);
    try {
      if (modal.type !== "add_edit") return;
      const basePayload = {
        name:      formName.trim(),
        code:      formCode.trim() || undefined,
        is_active: formActive,
      };
      const countryPayload = isRoot ? {
        ...basePayload,
        phone_code:      formPhoneCode.trim() || undefined,
        currency_code:   formCurrencyCode.trim() || undefined,
        currency_symbol: formCurrencySymbol.trim() || undefined,
        phone_digits:    formPhoneDigits ? Number(formPhoneDigits) : null,
      } : basePayload;
      if (isRoot) {
        if (modal.row) await updateCountry(modal.row.id, countryPayload);
        else           await createCountry(countryPayload);
      } else {
        if (modal.row) {
          await updateNode(modal.row.id, basePayload);
        } else {
          await createNode({
            country_id: countryId!,
            parent_id:  currentNodeId,
            depth:      currentDepth,
            ...basePayload,
          });
        }
      }
      emitMutation("distribution-locations:mutated");
      triggerRefresh();
      setModal({ type: "none" });
      showToast(modal.row ? "Updated successfully." : `${currentLayerName || "Item"} added.`);
    } catch (err) {
      const e = extractApiError(err);
      if (e.errors && Object.keys(e.errors).length > 0) {
        // Map every field-level error returned by the server into form state
        const mapped: Record<string, string> = {};
        const fieldMap: Record<string, string> = {
          name: "name", code: "code",
          phone_code: "phone_code", currency_code: "currency_code",
          currency_symbol: "currency_symbol", phone_digits: "phone_digits",
        };
        Object.entries(e.errors).forEach(([field, msgs]) => {
          const key = fieldMap[field] ?? field;
          mapped[key] = msgs[0];
        });
        setFormErrors(mapped);
        // If none of the errors map to a visible field, fall back to toast
        if (Object.keys(mapped).length === 0) showToast(e.message, "danger");
      } else {
        showToast(e.message, "danger");
      }
    } finally {
      setFormSaving(false);
    }
  };

  // ── Save layer name ──
  const handleDefineLayer = async () => {
    // "Inherit from global" checked: remove any node-specific override then close; no name needed
    if (formApplyToAll) {
      if (!specificLayerDef) { setModal({ type: "none" }); return; }
      setFormSaving(true);
      try {
        await deleteLayerSchema(countryId!, currentDepth, currentNodeId ?? 0);
        bustLayerSchema(countryId!);
        const schema = await getCachedLayerSchema(countryId!);
        setLayerSchema(schema);
        setModal({ type: "none" });
        showToast("Override removed — reverted to global.");
      } catch (err) {
        showToast(extractApiError(err).message, "danger");
      } finally {
        setFormSaving(false);
      }
      return;
    }

    if (!formLayerName.trim()) {
      setFormErrors({ layer: "Layer name is required." });
      return;
    }
    setFormSaving(true);
    try {
      const parentNodeId = formApplyToAll ? 0 : (currentNodeId ?? 0);
      await upsertLayerSchema(countryId!, currentDepth, formLayerName.trim(), parentNodeId);
      bustLayerSchema(countryId!);
      const schema = await getCachedLayerSchema(countryId!);
      setLayerSchema(schema);
      setModal({ type: "none" });
      showToast(`Layer named "${formLayerName.trim()}".`);
    } catch (err) {
      const e = extractApiError(err);
      if (e.errors?.layer_name) setFormErrors({ layer: e.errors.layer_name[0] });
      else showToast(e.message, "danger");
    } finally {
      setFormSaving(false);
    }
  };

  // ── Delete current layer name ──
  const handleDeleteCurrentLayer = async () => {
    // specificLayerDef = node-specific override; globalLayerDef = global schema
    // Deleting an override just reverts to global (no node guard). Deleting global guards against existing nodes.
    const parentNodeId = specificLayerDef ? (currentNodeId ?? 0) : 0;
    setFormSaving(true);
    try {
      await deleteLayerSchema(countryId!, currentDepth, parentNodeId);
      bustLayerSchema(countryId!);
      const schema = await getCachedLayerSchema(countryId!);
      setLayerSchema(schema);
      setModal({ type: "none" });
      showToast(specificLayerDef ? "Override removed — reverted to global." : "Layer name removed.");
    } catch (err) {
      const e = extractApiError(err);
      setDefineLayerDeleteConfirm(false);
      setFormErrors({ layer: e.message });
    } finally {
      setFormSaving(false);
    }
  };

  // ── Restore ──
  const handleRestore = async (row: DynRow) => {
    if (restoringId !== null) return;
    setRestoringId(row.id);
    try {
      if (isRoot) await restoreCountry(row.id);
      else        await restoreNode(row.id);
      emitMutation("distribution-locations:mutated");
      triggerRefresh();
      showToast("Restored successfully.");
    } catch (err) {
      showToast(extractApiError(err).message, "danger");
    } finally {
      setRestoringId(null);
    }
  };

  // ── Confirm delete ──
  const handleConfirmDelete = async () => {
    if (modal.type !== "delete") return;
    setFormSaving(true);
    try {
      if (isRoot) await deleteCountry(modal.row.id);
      else        await deleteNode(modal.row.id);
      emitMutation("distribution-locations:mutated");
      triggerRefresh();
      setModal({ type: "none" });
      showToast("Deleted successfully.");
    } catch (err) {
      const e = extractApiError(err);
      showToast(e.message, "danger");
      setModal({ type: "none" });
    } finally {
      setFormSaving(false);
    }
  };

  // ── Bulk delete ──
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      if (isRoot) await bulkDeleteCountries(ids);
      else        await bulkDeleteNodes(ids);
      setSelectedIds(new Set());
      setModal({ type: "none" });
      emitMutation("distribution-locations:mutated");
      triggerRefresh();
      showToast(`${ids.length} ${ids.length === 1 ? currentLayerName || "item" : pluralLabel(currentLayerName || "item")} deleted.`);
    } catch (err) {
      showToast(extractApiError(err).message, "danger");
    } finally {
      setBulkDeleting(false);
    }
  };

  // ── Bulk restore ──
  const handleBulkRestore = async () => {
    if (selectedIds.size === 0) return;
    setBulkRestoring(true);
    try {
      const ids = Array.from(selectedIds);
      if (isRoot) await bulkRestoreCountries(ids);
      else        await bulkRestoreNodes(ids);
      setSelectedIds(new Set());
      emitMutation("distribution-locations:mutated");
      triggerRefresh();
      showToast(`${ids.length} ${ids.length === 1 ? currentLayerName || "item" : pluralLabel(currentLayerName || "item")} restored.`);
    } catch (err) {
      showToast(extractApiError(err).message, "danger");
    } finally {
      setBulkRestoring(false);
    }
  };

  // ── Global layer names panel ──
  const openLayerNamesPanel = () => {
    setLayerEditDepth(null);
    setLayerEditName("");
    setLayerDeleteConfirmDepth(null);
    setModal({ type: "layer_names" });
  };

  const handleSaveGlobalLayer = async (depth: number) => {
    const name = layerEditName.trim();
    if (!name) return;
    setLayerEditSaving(true);
    try {
      await upsertLayerSchema(countryId!, depth, name, 0);
      bustLayerSchema(countryId!);
      const schema = await getCachedLayerSchema(countryId!);
      setLayerSchema(schema);
      setLayerEditDepth(null);
      setLayerEditName("");
      showToast(`Level ${depth} named "${name}".`);
    } catch (err) {
      showToast(extractApiError(err).message, "danger");
    } finally {
      setLayerEditSaving(false);
    }
  };

  const handleDeleteGlobalLayer = async (depth: number) => {
    setLayerDeleting(true);
    try {
      await deleteLayerSchema(countryId!, depth);
      bustLayerSchema(countryId!);
      const schema = await getCachedLayerSchema(countryId!);
      setLayerSchema(schema);
      setLayerDeleteConfirmDepth(null);
      showToast(`Level ${depth} removed.`);
    } catch (err) {
      showToast(extractApiError(err).message, "danger");
    } finally {
      setLayerDeleting(false);
    }
  };

  // ── Columns modal ──
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
  const toggleDraft = (key: string) =>
    setDraftVisible(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  // ── Export ──
  const exportTitle    = listFilter === "deleted"
    ? `Deleted ${pluralLabel(currentLayerName)}`
    : pluralLabel(currentLayerName);
  const exportFilename = exportTitle.replace(/\s+/g, "_");

  const buildExportRows = () => filteredRows.map(r => {
    const fmt = (d: string) => d
      ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
      : "—";
    return [r.name, r.code ?? "—", String(r.children_count), r.is_active ? "Active" : "Inactive", fmt(r.created_at)];
  });

  const handleExportPdf = () => {
    try { exportToPdfPrint(exportTitle, ["Name", "Code", "Sub-locations", "Status", "Created On"], buildExportRows()); }
    catch (e: any) { showToast(e.message ?? "PDF export failed.", "danger"); }
  };

  const handleExportExcel = () => {
    const fmt = (d: string) => d
      ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
      : "—";
    const rows = filteredRows.map(r => ({
      name:          r.name,
      code:          r.code ?? "—",
      sub_locations: r.children_count,
      status:        r.is_active ? "Active" : "Inactive",
      created_at:    fmt(r.created_at),
    }));
    exportToExcelFile(exportFilename, [
      { header: "Name",          key: "name",          width: 30 },
      { header: "Code",          key: "code",          width: 14 },
      { header: "Sub-locations", key: "sub_locations", width: 14 },
      { header: "Status",        key: "status",        width: 12 },
      { header: "Created On",    key: "created_at",    width: 18 },
    ], rows).catch(() => showToast("Excel export failed.", "danger"));
  };

  // ── Page title ──
  const pageTitle = isRoot
    ? "Distribution Locations"
    : (currentLayerName ? pluralLabel(currentLayerName) : "Distribution Locations");

  // ── Render ──
  return (
    <>
      <style>{`
        .custom-table .ant-table-tbody > tr > td:first-child { overflow: visible !important; }
        .dynloc-row-drillable:hover td { background: #f8f9fa !important; }
      `}</style>
      <div className="page-wrapper">
        <div className="content">

          <PageHeader
            title={pageTitle}
            badgeCount={listFilter === "active" ? rows.length : deletedRows.length}
            showModuleTile={false}
            showExport
            onExportPdf={handleExportPdf}
            onExportExcel={handleExportExcel}
            onRefresh={triggerRefresh}
          />

          {/* Breadcrumb */}
          {breadcrumbs.length > 1 && (
            <nav aria-label="breadcrumb" className="mb-3">
              <ol className="breadcrumb mb-0">
                {breadcrumbs.map((crumb, i) =>
                  i < breadcrumbs.length - 1 ? (
                    <li key={i} className="breadcrumb-item">
                      <Link to={crumb.url}>{crumb.label}</Link>
                    </li>
                  ) : (
                    <li key={i} className="breadcrumb-item active" aria-current="page">
                      {crumb.label}
                    </li>
                  ),
                )}
              </ol>
            </nav>
          )}

          <div className="card border-0 rounded-0">

            {/* Card header: search + action buttons */}
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <div className="input-icon input-icon-start position-relative">
                <span className="input-icon-addon text-dark"><i className="ti ti-search" /></span>
                <SearchInput value={searchText} onChange={setSearchText} />
              </div>

              <div className="d-flex align-items-center gap-2 flex-shrink-0">
                {/* Configure layer names — only when inside a country */}
                {countryId !== null && (
                  <button
                    type="button"
                    className="btn btn-icon btn-outline-light"
                    title="Configure layer names"
                    onClick={openLayerNamesPanel}
                  >
                    <i className="ti ti-settings" />
                  </button>
                )}

                {/* Layer name button when not root */}
                {!isRoot && (
                  <button
                    type="button"
                    className="btn btn-outline-light border px-3 fs-13"
                    style={{ height: 38 }}
                    title={hasLayerDefined ? `Rename layer "${currentLayerName}"` : "Name this layer"}
                    onClick={openDefineLayerModal}
                  >
                    <i className="ti ti-layers-intersect me-1 fs-14" />
                    {hasLayerDefined ? currentLayerName : "Name Layer"}
                  </button>
                )}

                {/* Primary add button */}
                {canCreate && (
                  <button type="button" className="btn btn-primary" style={{ height: 38 }} onClick={openAddModal}>
                    <i className="ti ti-square-rounded-plus-filled me-1" />
                    Add {currentLayerName || "Item"}
                  </button>
                )}
              </div>
            </div>

            <div className="card-body">

              {/* Filter + view toggle row */}
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">

                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="dropdown">
                    <Link
                      to="#"
                      className="dropdown-toggle btn btn-outline-light px-2 fs-16 fw-bold border-0"
                      data-bs-toggle="dropdown"
                    >
                      {listFilter === "active"
                        ? `Active ${pluralLabel(currentLayerName)}`
                        : `Deleted ${pluralLabel(currentLayerName)}`}
                    </Link>
                    <div className="dropdown-menu dropmenu-hover-primary">
                      <ul>
                        <li>
                          <button className="dropdown-item" onClick={() => setListFilter("active")}>
                            <i className="ti ti-circle-check me-1" />
                            Active {pluralLabel(currentLayerName)}
                          </button>
                        </li>
                        <li>
                          <button className="dropdown-item" onClick={() => setListFilter("deleted")}>
                            <i className="ti ti-trash me-1" />
                            Deleted {pluralLabel(currentLayerName)}
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 flex-wrap">
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

              {/* Bulk action bar */}
              {selectedIds.size > 0 && (
                <div
                  className="d-flex align-items-center gap-3 px-4 mb-2 rounded"
                  style={{
                    background: listFilter === "deleted" ? "#f0fdf4" : "#fef2f2",
                    border: `1px solid ${listFilter === "deleted" ? "#bbf7d0" : "#fecaca"}`,
                    minHeight: 52,
                  }}
                >
                  <span className={`fs-14 fw-medium ${listFilter === "deleted" ? "text-success" : "text-danger"}`}>
                    {selectedIds.size} {selectedIds.size === 1 ? currentLayerName || "item" : pluralLabel(currentLayerName || "item")} selected
                  </span>
                  {listFilter === "deleted" ? (
                    <button
                      className="btn btn-success"
                      style={{ height: 36, fontSize: 13, padding: "0 16px" }}
                      onClick={handleBulkRestore}
                      disabled={bulkRestoring}
                    >
                      {bulkRestoring
                        ? <><span className="spinner-border spinner-border-sm me-2" style={{ width: 13, height: 13, borderWidth: 2 }} />Restoring…</>
                        : <><i className="ti ti-restore me-1" />Restore Selected</>}
                    </button>
                  ) : (
                    <button
                      className="btn btn-danger"
                      style={{ height: 36, fontSize: 13, padding: "0 16px" }}
                      onClick={() => setModal({ type: "bulk_delete", count: selectedIds.size })}
                      disabled={bulkDeleting}
                    >
                      <i className="ti ti-trash me-1" />Delete Selected
                    </button>
                  )}
                  <button
                    className={`btn ms-auto ${listFilter === "deleted" ? "btn-outline-success" : "btn-outline-danger"}`}
                    style={{ height: 36, fontSize: 13, padding: "0 16px" }}
                    onClick={() => setSelectedIds(new Set())}
                    disabled={bulkDeleting || bulkRestoring}
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Content */}
              {loading ? null : loadError ? (
                <div className="text-center py-5">
                  <i className="ti ti-wifi-off fs-32 text-danger d-block mb-2" />
                  <p className="text-muted mb-3">{loadError}</p>
                  <button className="btn btn-outline-danger btn-sm" onClick={triggerRefresh}>
                    <i className="ti ti-refresh me-1" />Retry
                  </button>
                </div>
              ) : view === "list" ? (
                <div ref={tableWrapRef} className="custom-table table-nowrap">
                  <Datatable
                    columns={columns}
                    dataSource={filteredRows.map(r => ({ ...r, key: r.id }))}
                    Selection={false}
                    searchText={searchText}
                    components={TABLE_COMPONENTS}
                    scroll={{ x: "max-content" }}
                    onRow={(record: DynRow) => ({
                      className: listFilter !== "deleted" ? "dynloc-row-drillable" : "",
                      onClick:   () => drillDown(record),
                      style:     { cursor: listFilter !== "deleted" ? "pointer" : "default" },
                    })}
                  />
                </div>
              ) : (
                <>
                  {filteredRows.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className={`ti ${isRoot ? "ti-flag-3" : "ti-map-pin"} fs-32 d-block mb-2`} />
                      No {pluralLabel(currentLayerName).toLowerCase()} found
                    </div>
                  ) : (
                    <div className="row">
                      {filteredRows.slice(0, gridPage).map(row => {
                        const addedOn = new Date(row.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        });
                        return (
                          <div key={row.id} className="col-xxl-3 col-xl-4 col-md-6">
                            <div
                              className="card border shadow"
                              style={{ cursor: listFilter !== "deleted" ? "pointer" : "default" }}
                              onClick={() => drillDown(row)}
                            >
                              <div className="card-body">

                                {/* Header: status badge + action buttons */}
                                <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                                  <div className="d-flex align-items-center gap-2" onClick={e => e.stopPropagation()}>
                                    <input
                                      type="checkbox"
                                      className="form-check-input mt-0"
                                      style={{ accentColor: "#ef4444" }}
                                      checked={selectedIds.has(row.id)}
                                      onChange={() => setSelectedIds(prev => {
                                        const n = new Set(prev);
                                        n.has(row.id) ? n.delete(row.id) : n.add(row.id);
                                        return n;
                                      })}
                                    />
                                    <span className={`badge ${row.is_active ? "badge-soft-success" : "badge-soft-danger"}`}>
                                      {row.is_active ? "Active" : "Inactive"}
                                    </span>
                                  </div>
                                  <div className="d-flex gap-1" onClick={e => e.stopPropagation()}>
                                    {listFilter !== "deleted" && canEdit && (
                                      <button
                                        className="btn btn-sm btn-icon border-0"
                                        title="Edit"
                                        onClick={() => openEditModal(row)}
                                      >
                                        <i className="ti ti-pencil fs-18 text-muted" />
                                      </button>
                                    )}
                                    {listFilter === "deleted" ? (
                                      canDelete && (
                                        <button
                                          className="btn btn-sm btn-icon border-0"
                                          title="Restore"
                                          disabled={restoringId !== null}
                                          onClick={() => handleRestore(row)}
                                        >
                                          {restoringId === row.id
                                            ? <span className="spinner-border spinner-border-sm text-success" style={{ width: 14, height: 14, borderWidth: 2 }} />
                                            : <i className="ti ti-restore fs-18 text-success" />}
                                        </button>
                                      )
                                    ) : (
                                      canDelete && (
                                        <button
                                          className="btn btn-sm btn-icon border-0"
                                          title={row.children_count > 0 ? `Cannot delete: has ${row.children_count} sub-location(s)` : "Delete"}
                                          disabled={row.children_count > 0}
                                          style={row.children_count > 0 ? { opacity: 0.35, cursor: "not-allowed" } : undefined}
                                          onClick={() => setModal({ type: "delete", row })}
                                        >
                                          <i className="ti ti-trash fs-18 text-danger" />
                                        </button>
                                      )
                                    )}
                                  </div>
                                </div>

                                {/* Title block */}
                                <div className="d-block">
                                  <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                      <h4 className="mb-1 fs-14 fw-semibold text-truncate">{row.name}</h4>
                                      <p className="fs-13 mb-0 text-muted">
                                        {isRoot ? "Country" : (currentLayerName || "Location")}
                                      </p>
                                    </div>
                                    <div className="flex-shrink-0 ms-2">
                                      <div
                                        className="avatar rounded-circle d-flex align-items-center justify-content-center border"
                                        style={{ width: 36, height: 36, background: "#f8fafc" }}
                                      >
                                        <i className={`ti ${isRoot ? "ti-flag-3" : "ti-map-pin"} text-muted fs-16`} />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Metadata rows */}
                                  <div className="mb-3">
                                    {row.code && (
                                      <p className="d-flex align-items-center mb-2">
                                        <span className="me-2 text-dark"><i className="ti ti-hash fs-12" /></span>
                                        <span className="fs-13 text-muted">{row.code}</span>
                                      </p>
                                    )}
                                    <p className="d-flex align-items-center mb-0">
                                      <span className="me-2 text-dark"><i className="ti ti-layers fs-12" /></span>
                                      <span className="fs-13 text-muted">
                                        {row.children_count > 0
                                          ? `${row.children_count} sub-location${row.children_count !== 1 ? "s" : ""}`
                                          : "No sub-locations"}
                                      </span>
                                    </p>
                                  </div>
                                </div>

                                {/* Footer: added on date */}
                                <div className="d-flex align-items-center">
                                  <div
                                    className="avatar rounded-circle bg-white border me-2 d-flex align-items-center justify-content-center flex-shrink-0"
                                    style={{ width: 32, height: 32 }}
                                  >
                                    <i className="ti ti-calendar text-muted fs-14" />
                                  </div>
                                  <div className="d-flex flex-column">
                                    <span className="d-block fs-12 text-muted">Added on</span>
                                    <span className="fs-13 text-default">{addedOn}</span>
                                  </div>
                                </div>

                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {filteredRows.length > gridPage && (
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

      {/* ── Add / Edit Modal ──────────────────────────────────────────────────── */}
      {modal.type === "add_edit" && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 1060, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}
          onClick={e => { if (e.target === e.currentTarget && !formSaving) { setShowCountrySuggestions(false); setModal({ type: "none" }); } }}
        >
          <div style={{ background: "#fff", borderRadius: 14, width: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.18)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className={`ti ${isRoot ? "ti-flag-3" : "ti-map-pin"} fs-18`} style={{ color: "#ef4444" }} />
              </div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 16, color: "#0f172a", flex: 1 }}>
                {modal.row ? `Edit ${currentLayerName || "Item"}` : `Add ${currentLayerName || "Item"}`}
              </p>
              <button
                type="button"
                onClick={() => !formSaving && setModal({ type: "none" })}
                style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #fecaca", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: formSaving ? "not-allowed" : "pointer", flexShrink: 0, padding: 0, opacity: formSaving ? 0.5 : 1 }}
              >
                <i className="ti ti-x" style={{ fontSize: 14, color: "#ef4444", lineHeight: 1 }} />
              </button>
            </div>
            <div style={{ padding: "22px 24px 8px" }}>

              {/* Name field — with RestCountries autocomplete when isRoot */}
              <div className="mb-3" style={{ position: "relative" }}>
                <label className="form-label fw-medium fs-14 text-danger">Name <span>*</span></label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    className={`form-control${formErrors.name ? " is-invalid" : ""}`}
                    placeholder={isRoot ? "e.g. India — auto-fills details" : `Enter ${(currentLayerName || "item").toLowerCase()} name`}
                    value={formName}
                    onChange={e => {
                      const v = e.target.value;
                      setFormName(v);
                      clearFormError("name");
                      if (isRoot) {
                        if (countrySearchTimer.current) clearTimeout(countrySearchTimer.current);
                        countrySearchTimer.current = setTimeout(() => fetchCountrySuggestions(v), 400);
                      }
                    }}
                    onFocus={() => { if (isRoot && countrySuggestions.length > 0) setShowCountrySuggestions(true); }}
                    onBlur={() => setTimeout(() => setShowCountrySuggestions(false), 180)}
                    maxLength={150}
                    autoFocus
                    style={{ paddingRight: 36 }}
                  />
                  {isRoot && countrySuggestionsLoading && (
                    <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)" }}>
                      <span className="spinner-border spinner-border-sm text-muted" style={{ width: 14, height: 14, borderWidth: 2 }} />
                    </span>
                  )}
                  {isRoot && !countrySuggestionsLoading && formName.trim().length >= 2 && (
                    <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 13 }}>
                      <i className="ti ti-search fs-14" />
                    </span>
                  )}
                </div>
                {formErrors.name && <div className="invalid-feedback d-block">{formErrors.name}</div>}
                {/* Suggestions dropdown */}
                {isRoot && showCountrySuggestions && countrySuggestions.length > 0 && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 1080, background: "#fff", borderRadius: 8, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", border: "1px solid #f1f5f9", overflow: "hidden", marginTop: 2 }}>
                    {countrySuggestions.map(s => (
                      <div
                        key={s.code ?? s.name}
                        onMouseDown={() => applyCountrySuggestion(s)}
                        style={{ padding: "9px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #f8fafc" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
                        onMouseLeave={e => (e.currentTarget.style.background = "")}
                      >
                        <span className="fw-medium fs-14" style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                        {s.phone_code    && <span className="fs-12 text-muted">{s.phone_code}</span>}
                        {s.currency_code && <span className="badge badge-soft-secondary fs-11">{s.currency_code}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Code */}
              <div className="mb-3">
                <label className="form-label fw-medium fs-14">
                  {isRoot ? "Country Code" : "Code"}
                  <span className="text-muted fw-normal fs-13 ms-1">(optional)</span>
                </label>
                <input
                  type="text"
                  className={`form-control${formErrors.code ? " is-invalid" : ""}`}
                  placeholder={isRoot ? "e.g. IN" : "e.g. MH"}
                  value={formCode}
                  onChange={e => { setFormCode(e.target.value.toUpperCase()); clearFormError("code"); }}
                  maxLength={10}
                />
                {formErrors.code && <div className="invalid-feedback">{formErrors.code}</div>}
              </div>

              {/* Country-only extra fields */}
              {isRoot && (
                <>
                  <div className="row mb-3 g-2">
                    <div className="col-6">
                      <label className="form-label fw-medium fs-14">Phone Code</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Auto-filled"
                        value={formPhoneCode}
                        readOnly
                        style={{ background: "#f8fafc", cursor: "default" }}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-medium fs-14">Phone Digits</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Auto-filled"
                        value={formPhoneDigits}
                        readOnly
                        style={{ background: "#f8fafc", cursor: "default" }}
                      />
                    </div>
                  </div>
                  <div className="row mb-3 g-2">
                    <div className="col-6">
                      <label className="form-label fw-medium fs-14">Currency Code</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Auto-filled"
                        value={formCurrencyCode}
                        readOnly
                        style={{ background: "#f8fafc", cursor: "default" }}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-medium fs-14">Currency Symbol</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Auto-filled"
                        value={formCurrencySymbol}
                        readOnly
                        style={{ background: "#f8fafc", cursor: "default" }}
                        maxLength={10}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="mb-1">
                <label className="form-label fw-medium fs-14">Active</label>
                <div className="form-check form-switch mb-0 mt-1">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="dynFormActive"
                    checked={formActive}
                    onChange={e => setFormActive(e.target.checked)}
                  />
                  <label className="form-check-label text-muted fs-13" htmlFor="dynFormActive">
                    {formActive ? "Yes" : "No"}
                  </label>
                </div>
              </div>
            </div>
            <div style={{ padding: "16px 24px 22px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
              <button
                className="btn btn-danger me-2"
                onClick={handleSave}
                disabled={formSaving}
              >
                {formSaving
                  ? <><span className="spinner-border spinner-border-sm me-1" />{modal.row ? "Saving…" : "Adding…"}</>
                  : modal.row ? "Save Changes" : `Add ${currentLayerName || "Item"}`}
              </button>
              <button
                className="btn btn-outline-light"
                onClick={() => setModal({ type: "none" })}
                disabled={formSaving}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Layer Names Panel ─────────────────────────────────────────────────── */}
      {modal.type === "layer_names" && (() => {
        const globalSchemas = layerSchema
          .filter(s => s.parent_node_id === 0)
          .sort((a, b) => a.depth - b.depth);
        const nextDepth = globalSchemas.length > 0
          ? Math.max(...globalSchemas.map(s => s.depth)) + 1
          : 1;
        const countryName = breadcrumbs[1]?.label ?? "this country";

        return (
          <div
            style={{ position: "fixed", inset: 0, zIndex: 1060, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}
            onClick={e => { if (e.target === e.currentTarget && !layerEditSaving) setModal({ type: "none" }); }}
          >
            <div style={{ background: "#fff", borderRadius: 14, width: 480, maxHeight: "80vh", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", overflow: "hidden" }}>

              {/* Header */}
              <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <i className="ti ti-settings" style={{ fontSize: 20, color: "#ef4444" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: "#0f172a" }}>Layer Names</p>
                  <p style={{ margin: 0, fontSize: 12.5, color: "#64748b" }}>Global defaults for {countryName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => !layerEditSaving && setModal({ type: "none" })}
                  disabled={layerEditSaving}
                  style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #fecaca", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}
                >
                  <i className="ti ti-x" style={{ fontSize: 14, color: "#ef4444", lineHeight: 1 }} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: "8px 0", overflowY: "auto", flex: 1 }}>
                {globalSchemas.length === 0 && (
                  <p style={{ margin: "24px 24px 8px", fontSize: 13.5, color: "#94a3b8", textAlign: "center" }}>
                    No layer names defined yet. Add one below.
                  </p>
                )}

                {globalSchemas.map(schema => (
                  <div key={schema.depth} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 24px", borderBottom: "1px solid #f8fafc" }}>
                    <span style={{ width: 60, fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em", flexShrink: 0 }}>
                      Level {schema.depth}
                    </span>

                    {layerEditDepth === schema.depth ? (
                      <>
                        <input
                          type="text"
                          className="form-control"
                          style={{ flex: 1, fontSize: 14, height: 36 }}
                          value={layerEditName}
                          onChange={e => setLayerEditName(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") handleSaveGlobalLayer(schema.depth); if (e.key === "Escape") { setLayerEditDepth(null); setLayerEditName(""); } }}
                          autoFocus
                          maxLength={50}
                          disabled={layerEditSaving}
                        />
                        <button
                          className="btn btn-icon btn-danger"
                          style={{ flexShrink: 0 }}
                          onClick={() => handleSaveGlobalLayer(schema.depth)}
                          disabled={layerEditSaving || !layerEditName.trim()}
                        >
                          {layerEditSaving
                            ? <span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} />
                            : <i className="ti ti-check fs-15" />}
                        </button>
                        <button
                          className="btn btn-icon btn-outline-light"
                          style={{ flexShrink: 0 }}
                          onClick={() => { setLayerEditDepth(null); setLayerEditName(""); }}
                          disabled={layerEditSaving}
                        >
                          <i className="ti ti-x fs-15" />
                        </button>
                      </>
                    ) : layerDeleteConfirmDepth === schema.depth ? (
                      <>
                        <span style={{ flex: 1, fontSize: 13, color: "#ef4444", fontWeight: 500 }}>
                          Delete Level {schema.depth}?
                        </span>
                        <button
                          className="btn btn-danger px-3"
                          style={{ height: 36, flexShrink: 0, fontSize: 13 }}
                          onClick={() => handleDeleteGlobalLayer(schema.depth)}
                          disabled={layerDeleting}
                        >
                          {layerDeleting
                            ? <span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} />
                            : "Yes, Delete"}
                        </button>
                        <button
                          className="btn btn-icon btn-outline-light"
                          style={{ flexShrink: 0 }}
                          onClick={() => setLayerDeleteConfirmDepth(null)}
                          disabled={layerDeleting}
                        >
                          <i className="ti ti-x fs-15" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "#0f172a" }}>{schema.layer_name}</span>
                        <button
                          className="btn btn-icon btn-outline-light"
                          style={{ flexShrink: 0 }}
                          title="Rename"
                          onClick={() => { setLayerDeleteConfirmDepth(null); setLayerEditDepth(schema.depth); setLayerEditName(schema.layer_name); }}
                        >
                          <i className="ti ti-pencil fs-15" />
                        </button>
                        <button
                          className="btn btn-icon btn-outline-light"
                          style={{ flexShrink: 0, color: "#ef4444", borderColor: "#fecaca" }}
                          title="Delete layer"
                          onClick={() => { setLayerEditDepth(null); setLayerDeleteConfirmDepth(schema.depth); }}
                        >
                          <i className="ti ti-trash fs-15" />
                        </button>
                      </>
                    )}
                  </div>
                ))}

                {/* Add next level row */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 24px" }}>
                  <span style={{ width: 60, fontSize: 12, fontWeight: 600, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.04em", flexShrink: 0 }}>
                    Level {nextDepth}
                  </span>
                  {layerEditDepth === nextDepth ? (
                    <>
                      <input
                        type="text"
                        className="form-control"
                        style={{ flex: 1, fontSize: 14, height: 36 }}
                        value={layerEditName}
                        onChange={e => setLayerEditName(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handleSaveGlobalLayer(nextDepth); if (e.key === "Escape") { setLayerEditDepth(null); setLayerEditName(""); } }}
                        autoFocus
                        placeholder="e.g. Taluk"
                        maxLength={50}
                        disabled={layerEditSaving}
                      />
                      <button
                        className="btn btn-icon btn-danger"
                        style={{ flexShrink: 0 }}
                        onClick={() => handleSaveGlobalLayer(nextDepth)}
                        disabled={layerEditSaving || !layerEditName.trim()}
                      >
                        {layerEditSaving
                          ? <span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} />
                          : <i className="ti ti-check fs-15" />}
                      </button>
                      <button
                        className="btn btn-icon btn-outline-light"
                        style={{ flexShrink: 0 }}
                        onClick={() => { setLayerEditDepth(null); setLayerEditName(""); }}
                        disabled={layerEditSaving}
                      >
                        <i className="ti ti-x fs-15" />
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-outline-danger px-3"
                      style={{ height: 36, fontSize: 13 }}
                      onClick={() => { setLayerEditDepth(nextDepth); setLayerEditName(""); }}
                    >
                      <i className="ti ti-plus me-1 fs-13" />Add Level {nextDepth}
                    </button>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: "12px 24px", borderTop: "1px solid #f1f5f9" }}>
                <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
                  These are the global defaults. Drill into any node and uncheck "Inherit from global" to set a local override for that node only.
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Define Layer Modal ────────────────────────────────────────────────── */}
      {modal.type === "define_layer" && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 1060, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}
          onClick={e => { if (e.target === e.currentTarget && !formSaving) setModal({ type: "none" }); }}
        >
          <div style={{ background: "#fff", borderRadius: 14, width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.18)", overflow: "hidden" }}>
            <div style={{ padding: "28px 28px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <i className="ti ti-layers-intersect fs-24" style={{ color: "#ef4444" }} />
              </div>
              <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 16, color: "#0f172a", textAlign: "center" }}>
                {hasLayerDefined ? "Rename Layer" : "Name this Classification Layer"}
              </p>
              <p style={{ margin: "0 0 22px", fontSize: 13.5, color: "#64748b", textAlign: "center", lineHeight: 1.55 }}>
                What would you like to call items at this level?<br />
                <span className="fs-12">e.g. State, District, Taluk, City, Zone, Region…</span>
              </p>
              {/* Checkbox — shown at all depths inside a country */}
              {currentDepth > 0 && (
                <div
                  style={{ width: "100%", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0", cursor: "pointer", userSelect: "none" }}
                  onClick={() => { setFormApplyToAll(v => !v); clearFormError("layer"); }}
                >
                  <div style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, border: `2px solid ${formApplyToAll ? "#ef4444" : "#adb5bd"}`, background: formApplyToAll ? "#ef4444" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {formApplyToAll && <i className="ti ti-check" style={{ color: "#fff", fontSize: 11, lineHeight: 1 }} />}
                  </div>
                  <span style={{ fontSize: 13.5, color: "#374151" }}>{applyToAllLabel}</span>
                </div>
              )}

              {/* Global name preview — shown when inheriting */}
              {currentDepth > 0 && formApplyToAll && (
                <div style={{ width: "100%", marginBottom: 4, padding: "10px 12px", borderRadius: 8, background: globalLayerDef ? "#f0fdf4" : "#fffbeb", border: `1px solid ${globalLayerDef ? "#bbf7d0" : "#fde68a"}` }}>
                  {globalLayerDef ? (
                    <span style={{ fontSize: 13.5, color: "#166534" }}>
                      <i className="ti ti-circle-check me-1" style={{ fontSize: 14 }} />
                      Using global: <strong>{globalLayerDef.layer_name}</strong>
                    </span>
                  ) : (
                    <span style={{ fontSize: 13.5, color: "#92400e" }}>
                      <i className="ti ti-alert-triangle me-1" style={{ fontSize: 14 }} />
                      No global name set — configure one in Layer Names settings.
                    </span>
                  )}
                </div>
              )}

              {/* Name input — hidden when inheriting global */}
              {!formApplyToAll && (
                <div style={{ width: "100%", marginBottom: 4 }}>
                  <label className="form-label fw-medium fs-14 text-danger">Layer Name <span>*</span></label>
                  <input
                    type="text"
                    className={`form-control${formErrors.layer ? " is-invalid" : ""}`}
                    placeholder="e.g. State"
                    value={formLayerName}
                    onChange={e => { setFormLayerName(e.target.value); clearFormError("layer"); }}
                    maxLength={50}
                    autoFocus
                  />
                  {formErrors.layer && <div className="invalid-feedback">{formErrors.layer}</div>}
                </div>
              )}
            </div>
            <div style={{ padding: "0 28px 28px", display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Delete confirm row — only when a layer name already exists */}
              {hasLayerDefined && !isRoot && defineLayerDeleteConfirm && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca" }}>
                  <i className="ti ti-alert-triangle" style={{ color: "#ef4444", fontSize: 15, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: "#7f1d1d" }}>
                    {specificLayerDef ? "Remove this override? Will revert to global." : "Remove this layer name entirely?"}
                  </span>
                  <button
                    className="btn btn-danger btn-sm px-3"
                    onClick={handleDeleteCurrentLayer}
                    disabled={formSaving}
                  >
                    {formSaving ? <span className="spinner-border spinner-border-sm" style={{ width: 13, height: 13, borderWidth: 2 }} /> : "Yes, Remove"}
                  </button>
                  <button
                    className="btn btn-outline-light btn-sm px-2"
                    onClick={() => setDefineLayerDeleteConfirm(false)}
                    disabled={formSaving}
                  >
                    <i className="ti ti-x fs-13" />
                  </button>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  className="btn btn-danger me-2"
                  style={{ height: 44 }}
                  onClick={handleDefineLayer}
                  disabled={formSaving}
                >
                  {formSaving && !defineLayerDeleteConfirm
                    ? <><span className="spinner-border spinner-border-sm me-1" />Saving…</>
                    : formApplyToAll
                      ? (specificLayerDef ? "Remove Override" : "Confirm")
                      : hasLayerDefined ? "Rename" : "Define Layer"}
                </button>
                <button
                  className="btn btn-outline-light"
                  style={{ height: 44 }}
                  onClick={() => setModal({ type: "none" })}
                  disabled={formSaving}
                >
                  Cancel
                </button>
                {hasLayerDefined && !isRoot && !defineLayerDeleteConfirm && (
                  <button
                    className="btn btn-outline-light ms-auto"
                    style={{ color: "#ef4444", borderColor: "#fecaca", height: 44, padding: "0 16px" }}
                    title="Remove layer name"
                    onClick={() => setDefineLayerDeleteConfirm(true)}
                    disabled={formSaving}
                  >
                    <i className="ti ti-trash fs-16" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ──────────────────────────────────────────────── */}
      {modal.type === "delete" && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 1060, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}
          onClick={e => { if (e.target === e.currentTarget && !formSaving) setModal({ type: "none" }); }}
        >
          <div style={{ background: "#fff", borderRadius: 14, padding: "32px 28px 24px", width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <i className="ti ti-trash" style={{ fontSize: 24, color: "#ef4444" }} />
            </div>
            <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 16, color: "#0f172a", textAlign: "center" }}>
              Delete "{modal.row.name}"?
            </p>
            <p style={{ margin: "0 0 16px", fontSize: 13.5, color: "#64748b", textAlign: "center", lineHeight: 1.55 }}>
              This can be restored later from the Deleted view.
            </p>
            {modal.row.children_count > 0 && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", marginBottom: 16, borderRadius: 8, background: "#fff7ed", border: "1px solid #fed7aa", width: "100%" }}>
                <i className="ti ti-alert-triangle" style={{ fontSize: 15, color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 13, color: "#92400e", lineHeight: 1.5 }}>
                  This has {modal.row.children_count} sub-location{modal.row.children_count !== 1 ? "s" : ""} — delete will be blocked until they are removed.
                </span>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              <button
                className="btn btn-light flex-grow-1"
                style={{ fontWeight: 500, fontSize: 14, height: 44 }}
                onClick={() => setModal({ type: "none" })}
                disabled={formSaving}
              >
                Cancel
              </button>
              <button
                className="btn flex-grow-1"
                style={{ background: "#ef4444", color: "#fff", fontWeight: 500, fontSize: 14, border: "none", height: 44 }}
                onClick={handleConfirmDelete}
                disabled={formSaving}
              >
                {formSaving
                  ? <><span className="spinner-border spinner-border-sm me-2" style={{ width: 14, height: 14, borderWidth: 2 }} />Deleting…</>
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Delete Confirm Modal ─────────────────────────────────────────── */}
      {modal.type === "bulk_delete" && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 1060, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}
          onClick={e => { if (e.target === e.currentTarget && !bulkDeleting) setModal({ type: "none" }); }}
        >
          <div style={{ background: "#fff", borderRadius: 14, padding: "32px 28px 24px", width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <i className="ti ti-trash" style={{ fontSize: 24, color: "#ef4444" }} />
            </div>
            <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 16, color: "#0f172a", textAlign: "center" }}>
              Delete {modal.count} {modal.count === 1 ? currentLayerName || "item" : pluralLabel(currentLayerName || "item")}?
            </p>
            <p style={{ margin: "0 0 24px", fontSize: 13.5, color: "#64748b", textAlign: "center", lineHeight: 1.55 }}>
              These can be restored later from the Deleted view.
            </p>
            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              <button
                className="btn btn-light flex-grow-1"
                style={{ fontWeight: 500, fontSize: 14, height: 44 }}
                onClick={() => setModal({ type: "none" })}
                disabled={bulkDeleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger flex-grow-1"
                style={{ fontWeight: 500, fontSize: 14, height: 44 }}
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
              >
                {bulkDeleting
                  ? <><span className="spinner-border spinner-border-sm me-2" style={{ width: 14, height: 14, borderWidth: 2 }} />Deleting…</>
                  : "Delete All"}
              </button>
            </div>
          </div>
        </div>
      )}

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
            <div className="d-flex align-items-center gap-3 px-4 py-3 border-top bg-light" style={{ flexShrink: 0 }}>
              <i className="ti ti-grip-vertical text-muted fs-16" style={{ opacity: 0.3 }} />
              <i className="ti ti-lock text-muted fs-15" />
              <span className="fs-14 text-muted">Actions</span>
              <span className="ms-auto badge badge-soft-secondary fs-11">Fixed</span>
            </div>
            <div style={{ padding: "16px 24px 22px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <button className="btn btn-danger me-2" onClick={saveColsModal}>Save</button>
              <button className="btn btn-outline-light" onClick={closeColsModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ────────────────────────────────────────────────────────────── */}
      <div
        role="region"
        aria-live="polite"
        className="position-fixed top-0 start-50 translate-middle-x pt-4"
        style={{ zIndex: 9999, pointerEvents: "none" }}
      >
        <Toast
          show={toast.show}
          onClose={() => setToast(t => ({ ...t, show: false }))}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{
            pointerEvents: "auto",
            borderRadius: 12,
            boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
            border: "none",
            minWidth: 320,
            background: "#fff",
          }}
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

export default DynamicLocationList;
