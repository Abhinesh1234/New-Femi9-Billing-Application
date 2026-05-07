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
import { setPrimaryLocation, type LocationListItem } from "../../../../core/services/locationApi";
import {
  readLocationList,
  getLocationList,
  bustLocationLists,
  hydrateLocationList,
} from "../../../../core/cache/locationCache";
import { onMutation } from "../../../../core/cache/mutationEvents";
import { exportToExcelFile, exportToPdfPrint } from "../../../../core/utils/exportUtils";

const route = all_routes;

// ── Address label lookups ─────────────────────────────────────────────────────
const STATE_LABELS: Record<string, string> = {
  AN: "Andaman & Nicobar", AP: "Andhra Pradesh",  AR: "Arunachal Pradesh",
  AS: "Assam",             BR: "Bihar",            CH: "Chandigarh",
  CT: "Chhattisgarh",      DL: "Delhi",            GA: "Goa",
  GJ: "Gujarat",           HR: "Haryana",          HP: "Himachal Pradesh",
  JK: "Jammu & Kashmir",   JH: "Jharkhand",        KA: "Karnataka",
  KL: "Kerala",            LA: "Ladakh",           MP: "Madhya Pradesh",
  MH: "Maharashtra",       MN: "Manipur",          ML: "Meghalaya",
  MZ: "Mizoram",           NL: "Nagaland",         OR: "Odisha",
  PB: "Punjab",            PY: "Puducherry",       RJ: "Rajasthan",
  SK: "Sikkim",            TN: "Tamil Nadu",       TG: "Telangana",
  TR: "Tripura",           UP: "Uttar Pradesh",    UK: "Uttarakhand",
  WB: "West Bengal",
};
const COUNTRY_LABELS: Record<string, string> = {
  IN: "India",   US: "United States",
  GB: "United Kingdom",    AE: "United Arab Emirates",    SG: "Singapore",
};

function formatAddress(address: LocationListItem["address"]): string {
  if (!address) return "—";
  const parts: string[] = [];
  if (address.city)    parts.push(address.city);
  if (address.state)   parts.push(STATE_LABELS[address.state]    ?? address.state);
  if (address.country) parts.push(COUNTRY_LABELS[address.country] ?? address.country);
  return parts.join(" ") || "—";
}

// ── Tree builder ──────────────────────────────────────────────────────────────
interface TreeNode extends LocationListItem {
  depth:         number;
  isLastSibling: boolean;
  ancestorLast:  boolean[];
  hasChildren:   boolean;
}

function buildTree(locations: LocationListItem[]): TreeNode[] {
  const byParent = new Map<number | null, LocationListItem[]>();
  for (const loc of locations) {
    const key = loc.parent_id ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(loc);
  }
  for (const [, kids] of byParent) kids.sort((a, b) => a.name.localeCompare(b.name));

  const result: TreeNode[] = [];
  function walk(parentId: number | null, depth: number, ancestorLast: boolean[]) {
    const kids = byParent.get(parentId) ?? [];
    kids.forEach((loc, i) => {
      const isLastSibling = i === kids.length - 1;
      const hasChildren   = (byParent.get(loc.id)?.length ?? 0) > 0;
      result.push({ ...loc, depth, isLastSibling, ancestorLast: [...ancestorLast], hasChildren });
      walk(loc.id, depth + 1, [...ancestorLast, isLastSibling]);
    });
  }
  walk(null, 0, []);
  return result;
}

// ── Column definitions ────────────────────────────────────────────────────────
interface ColDef { key: string; label: string; }

const INITIAL_COLS: ColDef[] = [
  { key: "default_txn_series", label: "Default Transaction Series" },
  { key: "type",               label: "Type" },
  { key: "address",            label: "Address Details" },
  { key: "parent",             label: "Parent Location" },
  { key: "created_by",         label: "Created By" },
  { key: "is_active",          label: "Status" },
  { key: "created_at",         label: "Created Date" },
];

const DEFAULT_VISIBLE = new Set(["default_txn_series", "type", "address"]);

// ── Column resize ─────────────────────────────────────────────────────────────
const DEFAULT_COL_WIDTHS: Record<string, number> = {
  name:                240,
  default_txn_series:  240,
  type:                130,
  address:             200,
  parent:              180,
  created_by:          160,
  is_active:           100,
  created_at:          160,
};
const COL_WIDTHS_LS_KEY   = "femi9_locations_col_widths";
const COL_ORDER_LS_KEY    = "femi9_locations_col_order";
const COL_VISIBLE_LS_KEY  = "femi9_locations_col_visible";
const VIEW_LS_KEY         = "femi9_locations_view";

interface ResizableTitleProps extends ThHTMLAttributes<HTMLTableCellElement> {
  onResize?:    (key: string, width: number) => void;
  colKey?:      string;
  currentWidth?: number;
  handleSide?:  "left" | "right";
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

// ── Sortable column row in the modal ──────────────────────────────────────────
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

// ── Star button (primary location toggle) ────────────────────────────────────
function StarButton({ isPrimary, loading, onClick }: {
  isPrimary: boolean;
  loading:   boolean;
  onClick:   (e: React.MouseEvent) => void;
}) {
  if (loading) {
    return (
      <span className="loc-star--outline" style={{ display: "inline-flex", flexShrink: 0 }}>
        <i className="ti ti-loader-2" style={{ fontSize: 17, color: "#94a3b8" }} />
      </span>
    );
  }
  if (isPrimary) {
    return (
      <span title="Primary location" style={{ display: "inline-flex", flexShrink: 0, cursor: "default" }}>
        <svg width="16" height="16" viewBox="0 0 24 24"
          fill="#f59e0b" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      title="Set as primary location"
      className="loc-star--outline"
      style={{ background: "none", border: "none", padding: 0, lineHeight: 1, flexShrink: 0, cursor: "pointer", display: "inline-flex" }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
}

// ── Confirmation dialog ───────────────────────────────────────────────────────
interface ConfirmConfig {
  icon:         string;
  iconColor:    string;
  iconBg:       string;
  title:        string;
  message:      string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm:    () => Promise<void>;
}

function ConfirmDialog({ config, onClose }: { config: ConfirmConfig | null; onClose: () => void }) {
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => { setBusy(false); }, [config]);
  if (!config) return null;

  const handleConfirm = async () => {
    setBusy(true);
    try { await config.onConfirm(); } finally { setBusy(false); }
    onClose();
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1060, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}
      onClick={e => { if (e.target === e.currentTarget && !busy) onClose(); }}
    >
      <div style={{ background: "#fff", borderRadius: 14, padding: "32px 28px 24px", width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: config.iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <i className={`ti ${config.icon}`} style={{ fontSize: 24, color: config.iconColor }} />
        </div>
        <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 16, color: "#0f172a", textAlign: "center" }}>{config.title}</p>
        <p style={{ margin: "0 0 24px", fontSize: 13.5, color: "#64748b", textAlign: "center", lineHeight: 1.55 }}>{config.message}</p>
        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <button className="btn btn-light flex-grow-1" style={{ fontWeight: 500, fontSize: 14, height: 44 }} onClick={onClose} disabled={busy}>Cancel</button>
          <button
            className="btn flex-grow-1"
            style={{ background: config.confirmColor, color: "#fff", fontWeight: 500, fontSize: 14, border: "none", height: 44 }}
            onClick={handleConfirm}
            disabled={busy}
          >
            {busy
              ? <><span className="spinner-border spinner-border-sm me-2" style={{ width: 14, height: 14, borderWidth: 2 }} />{config.confirmLabel}…</>
              : config.confirmLabel
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const LocationList = () => {
  const navigate = useNavigate();

  const [view, setView] = useState<"list" | "grid">(() => {
    try { return localStorage.getItem(VIEW_LS_KEY) === "grid" ? "grid" : "list"; }
    catch { return "list"; }
  });
  const [gridPage, setGridPage] = useState(12);

  const [searchText,        setSearchText]        = useState("");
  const [locations,         setLocations]         = useState<LocationListItem[]>([]);
  const [deletedLocations,  setDeletedLocations]  = useState<LocationListItem[]>([]);
  const [deletedLoading,    setDeletedLoading]    = useState(false);
  const [total,             setTotal]             = useState(0);
  const [loading,           setLoading]           = useState(true);
  const [listFilter,        setListFilter]        = useState<"active" | "deleted">("active");
  const [settingPrimary,   setSettingPrimary]   = useState<number | null>(null);
  const [confirmConfig,    setConfirmConfig]    = useState<ConfirmConfig | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false, message: "", type: "success",
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (message: string, type: "success" | "error" = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  const tableWrapRef = useRef<HTMLDivElement>(null);

  // ── Customize Columns modal ──
  const [showColsModal,  setShowColsModal]  = useState(false);
  const [colSearch,      setColSearch]      = useState("");
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
  const [draftOrder,     setDraftOrder]     = useState<ColDef[]>(INITIAL_COLS);
  const [draftVisible,   setDraftVisible]   = useState<Set<string>>(new Set(DEFAULT_VISIBLE));

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

  const [loadError, setLoadError] = useState<string | null>(null);

  const loadFresh = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    bustLocationLists();
    try {
      const data = await getLocationList();
      setLocations(data);
      setTotal(data.length);
    } catch (e: any) {
      setLoadError(e.message ?? "Failed to load locations.");
    }
    setLoading(false);
  }, []);

  const handleSetPrimary = useCallback(async (targetId: number) => {
    setSettingPrimary(targetId);
    let snapshot: LocationListItem[] = [];
    setLocations(prev => {
      snapshot = prev;
      const updated = prev.map(l => ({ ...l, is_primary: l.id === targetId }));
      hydrateLocationList(updated); // optimistic cache update
      return updated;
    });
    const res = await setPrimaryLocation(targetId);
    if (res.success) {
      showToast("The location has been marked as primary.");
    } else {
      bustLocationLists();
      try {
        const freshData = await getLocationList();
        setLocations(freshData);
        showToast("Failed to update primary location. Please try again.", "error");
      } catch {
        setLocations(snapshot);
        hydrateLocationList(snapshot);
        showToast("Could not verify update. State restored — please refresh.", "error");
      }
    }
    setSettingPrimary(null);
  }, []);

  useEffect(() => {
    const cached = readLocationList();
    if (cached) { setLocations(cached); setTotal(cached.length); setLoading(false); return; }
    loadFresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { localStorage.setItem(VIEW_LS_KEY, view); }, [view]);

  // Lazy-fetch soft-deleted locations when filter switches to "deleted"
  useEffect(() => {
    if (listFilter !== "deleted") return;
    const cached = readLocationList(true);
    if (cached) { setDeletedLocations(cached); return; }
    setDeletedLoading(true);
    getLocationList(true)
      .then(data => { setDeletedLocations(data); setDeletedLoading(false); })
      .catch(() => setDeletedLoading(false));
  }, [listFilter]);

  // Reload when any page mutates location data (e.g. save/delete from edit or overview)
  useEffect(() => onMutation("locations:mutated", loadFresh), [loadFresh]);

  // Reload on window focus: cache-first so no network hit if data is still fresh
  useEffect(() => {
    const onFocus = () => {
      getLocationList()
        .then(data => { setLocations(data); setTotal(data.length); })
        .catch(() => {});
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);


  // ── Build filtered tree ──
  const treeRows = useMemo((): TreeNode[] => {
    // Show all non-deleted locations (active + inactive) in the default view.
    // Inactive ones render with a badge; both are distinct from soft-deleted.
    const base = listFilter === "deleted" ? deletedLocations : locations;
    return buildTree(base);
  }, [locations, deletedLocations, listFilter]);

  // Search filters the tree rows (keep ancestors of matches)
  const filteredRows = useMemo((): TreeNode[] => {
    if (!searchText.trim()) return treeRows;
    const q = (search: string) => search.toLowerCase();
    const matchIds = new Set(treeRows.filter(l => l.name.toLowerCase().includes(q(searchText))).map(l => l.id));
    const sourceList = listFilter === "deleted" ? deletedLocations : locations;
    const allById  = new Map(sourceList.map(l => [l.id, l]));
    const expanded = new Set<number>(matchIds);
    for (const id of matchIds) {
      let cur = allById.get(id);
      while (cur?.parent_id) { expanded.add(cur.parent_id); cur = allById.get(cur.parent_id); }
    }
    return treeRows.filter(l => expanded.has(l.id));
  }, [treeRows, searchText, locations, deletedLocations, listFilter]);


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
        onCell: () => ({ style: { position: "relative", overflow: "visible" } as React.CSSProperties }),
        render: (_: string, record: TreeNode) => {
          const { depth, isLastSibling, hasChildren, ancestorLast } = record;

          const STEP = 24;
          const cX = (d: number) => 10 + d * STEP; // circle centre at depth d
          const cx = cX(depth);      // this node's circle centre
          const px = cX(depth - 1);  // parent's circle centre

          const hasTree = depth > 0 || hasChildren;
          const paddingLeft = hasTree ? cx - 5 : 0;

          return (
            <div className="d-flex align-items-center" style={{ gap: 8, paddingLeft, position: "relative" }}>

              {/* ── Pass-through lines: for every ancestor at depth d (0..depth-2) that is
                  NOT the last sibling, draw a full-height vertical line so the trunk
                  continues through rows belonging to deeper sub-trees ── */}
              {Array.from({ length: Math.max(0, depth - 1) }, (_, d) =>
                !ancestorLast[d] ? (
                  <div key={`pt-${d}`} style={{
                    position: "absolute",
                    left: cX(d) - 0.75,
                    top: -50, bottom: -50,
                    width: 1.5,
                    background: "#cbd5e1",
                    pointerEvents: "none",
                  }} />
                ) : null
              )}

              {/* ── This node's own connector (depth > 0) ── */}
              {depth > 0 && (
                <>
                  {/* Vertical: from above (top bleed) to centre; continues below if not last sibling */}
                  <div style={{
                    position: "absolute",
                    left: px - 0.75,
                    top: -50,
                    bottom: isLastSibling ? "50%" : -50,
                    width: 1.5,
                    background: "#cbd5e1",
                    pointerEvents: "none",
                  }} />
                  {/* Horizontal elbow: parent trunk → just before this node's circle */}
                  <div style={{
                    position: "absolute",
                    left: px,
                    top: "calc(50% - 0.75px)",
                    width: cx - px - 5,
                    height: 1.5,
                    background: "#cbd5e1",
                    pointerEvents: "none",
                  }} />
                </>
              )}

              {/* ── Trunk down from this node's circle to the first child row ── */}
              {hasChildren && (
                <div style={{
                  position: "absolute",
                  left: cx - 0.75,
                  top: "50%",
                  bottom: -50,
                  width: 1.5,
                  background: "#cbd5e1",
                  pointerEvents: "none",
                }} />
              )}

              {/* ── Circle (only for nodes with children) ── */}
              {hasChildren && (
                <svg width={10} height={10} viewBox="0 0 10 10" style={{ flexShrink: 0, zIndex: 1, position: "relative" }}>
                  <circle cx={5} cy={5} r={4} fill="white" stroke="#94a3b8" strokeWidth={1.5} />
                </svg>
              )}

              <div className="rounded border d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                style={{ width: 40, height: 40, background: "#f5f5f5" }}>
                {record.logo_path
                  ? <img src={`/storage/${record.logo_path}`} alt={record.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <i className="ti ti-building text-muted fs-18" />}
              </div>
              <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
                <Link to={`/locations/${record.id}`} className="title-name fw-medium" onClick={e => e.stopPropagation()}>
                  {record.name}
                </Link>
                <StarButton
                  isPrimary={!!record.is_primary}
                  loading={settingPrimary === record.id}
                  onClick={e => {
                    e.stopPropagation();
                    setConfirmConfig({
                      icon:         "ti-star",
                      iconColor:    "#f59e0b",
                      iconBg:       "#fef3c7",
                      title:        "Set as Primary Location?",
                      message:      `"${record.name}" will become the primary location. The current primary will be unset.`,
                      confirmLabel: "Set Primary",
                      confirmColor: "#f59e0b",
                      onConfirm:    () => handleSetPrimary(record.id),
                    });
                  }}
                />
              </div>
              {!record.is_active && <span className="badge badge-soft-danger ms-2 fs-11">Inactive</span>}
            </div>
          );
        },
      },
    ];

    for (const col of colOrder) {
      if (!visibleCols.has(col.key)) continue;
      switch (col.key) {
        case "default_txn_series":
          cols.push({
            title: "Default Transaction Series",
            key: "default_txn_series",
            dataIndex: "default_txn_series",
            width: colWidths["default_txn_series"] ?? DEFAULT_COL_WIDTHS["default_txn_series"],
            onHeaderCell: resizeCell("default_txn_series"),
            render: (val: any) => <span className="text-dark">{val?.name ?? <span className="text-muted">—</span>}</span>,
          });
          break;
        case "type":
          cols.push({
            title: "Type",
            key: "type",
            dataIndex: "type",
            width: colWidths["type"] ?? DEFAULT_COL_WIDTHS["type"],
            onHeaderCell: resizeCell("type"),
            render: (val: string) => (
              <span className={`badge ${val === "business" ? "badge-soft-info" : "badge-soft-warning"}`}>
                {val === "business" ? "Business" : "Warehouse"}
              </span>
            ),
          });
          break;
        case "address":
          cols.push({
            title: "Address Details",
            key: "address",
            dataIndex: "address",
            width: colWidths["address"] ?? DEFAULT_COL_WIDTHS["address"],
            onHeaderCell: resizeCell("address"),
            render: (val: LocationListItem["address"]) => <span className="text-muted">{formatAddress(val)}</span>,
          });
          break;
        case "parent":
          cols.push({
            title: "Parent Location",
            key: "parent",
            dataIndex: "parent",
            width: colWidths["parent"] ?? DEFAULT_COL_WIDTHS["parent"],
            onHeaderCell: resizeCell("parent"),
            render: (val: any) => val?.name ?? <span className="text-muted">—</span>,
          });
          break;
        case "created_by":
          cols.push({
            title: "Created By",
            key: "created_by",
            dataIndex: "created_by",
            width: colWidths["created_by"] ?? DEFAULT_COL_WIDTHS["created_by"],
            onHeaderCell: resizeCell("created_by"),
            render: (val: any) => val?.name ?? <span className="text-muted">—</span>,
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
  }, [visibleCols, colOrder, colWidths, handleResize, handleSetPrimary, settingPrimary, setConfirmConfig]);

  // Grid search filter — only match meaningful text fields, not IDs or nested objects
  const gridRows = useMemo(() => {
    if (!searchText.trim()) return filteredRows;
    const q = searchText.trim().toLowerCase();
    return filteredRows.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.type.toLowerCase().includes(q) ||
      (l.parent?.name ?? "").toLowerCase().includes(q) ||
      (l.default_txn_series?.name ?? "").toLowerCase().includes(q) ||
      (l.address?.city ?? "").toLowerCase().includes(q) ||
      (l.address?.state ?? "").toLowerCase().includes(q) ||
      (l.address?.country ?? "").toLowerCase().includes(q) ||
      (l.created_by?.name ?? "").toLowerCase().includes(q)
    );
  }, [filteredRows, searchText]);

  // ── Export handlers ──
  const exportTitle = listFilter === "deleted" ? "Deleted Locations" : "Locations";
  const exportFilename = listFilter === "deleted" ? "Deleted_Locations" : "Locations";

  const exportHeaders = ["Name", "Type", "Address", "Parent Location", "Default Series", "Status", "Created On"];
  const buildExportRows = () => filteredRows.map(r => {
    const indent = "  ".repeat(r.depth * 2);
    const fmt    = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
    return [
      indent + r.name,
      r.type === "business" ? "Business" : "Warehouse",
      formatAddress(r.address),
      r.parent?.name ?? "—",
      r.default_txn_series?.name ?? "—",
      r.is_active ? "Active" : "Inactive",
      fmt(r.created_at),
    ];
  });

  const handleExportPdf = () => {
    try { exportToPdfPrint(exportTitle, exportHeaders, buildExportRows()); }
    catch (e: any) { showToast(e.message ?? "PDF export failed.", "error"); }
  };

  const handleExportExcel = () => {
    const fmt = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
    const rows = filteredRows.map(r => ({
      name:           "  ".repeat(r.depth * 2) + r.name,
      type:           r.type === "business" ? "Business" : "Warehouse",
      address:        formatAddress(r.address),
      parent:         r.parent?.name ?? "—",
      default_series: r.default_txn_series?.name ?? "—",
      status:         r.is_active ? "Active" : "Inactive",
      created_at:     fmt(r.created_at),
    }));
    exportToExcelFile(exportFilename, [
      { header: "Name",            key: "name",           width: 30 },
      { header: "Type",            key: "type",           width: 14 },
      { header: "Address",         key: "address",        width: 28 },
      { header: "Parent Location", key: "parent",         width: 22 },
      { header: "Default Series",  key: "default_series", width: 24 },
      { header: "Status",          key: "status",         width: 12 },
      { header: "Created On",      key: "created_at",     width: 18 },
    ], rows).catch(() => showToast("Excel export failed.", "error"));
  };

  return (
    <>
      <style>{`
        .loc-star--outline { opacity: 0; }
        tr[data-star-hover] .loc-star--outline { opacity: 1; }
        .custom-table .ant-table-tbody > tr > td:first-child { overflow: visible !important; }
      `}</style>
      <div className="page-wrapper">
        <div className="content">
          <PageHeader title="Locations" badgeCount={total} showModuleTile={false} showExport={true} onRefresh={loadFresh} onExportPdf={handleExportPdf} onExportExcel={handleExportExcel} />

          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2">
              <div className="input-icon input-icon-start position-relative">
                <span className="input-icon-addon text-dark">
                  <i className="ti ti-search" />
                </span>
                <SearchInput value={searchText} onChange={setSearchText} />
              </div>
              <div className="d-flex align-items-center gap-3 flex-shrink-0">
                <Link to={route.transactionSeriesList} className="fs-14 text-primary">
                  Transaction Series Preferences
                </Link>
                <Link to={route.addLocation} className="btn btn-primary">
                  <i className="ti ti-square-rounded-plus-filled me-1" />
                  New Location
                </Link>
              </div>
            </div>

            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">

                {/* Left — list filter */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="dropdown">
                    <Link to="#" className="dropdown-toggle btn btn-outline-light px-2 fs-16 fw-bold border-0" data-bs-toggle="dropdown">
                      {listFilter === "active" ? "Active Locations" : "Deleted Locations"}
                    </Link>
                    <div className="dropdown-menu dropmenu-hover-primary">
                      <ul>
                        <li><button className="dropdown-item" onClick={() => setListFilter("active")}><i className="ti ti-circle-check me-1" />Active Locations</button></li>
                        <li><button className="dropdown-item" onClick={() => setListFilter("deleted")}><i className="ti ti-trash me-1" />Deleted Locations</button></li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right — manage cols + view toggle */}
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

              {loadError && (
                <div className="alert alert-danger mx-3 mt-3 mb-0 d-flex align-items-center gap-2">
                  <i className="ti ti-alert-circle" />
                  {loadError}
                  <button type="button" className="btn btn-sm btn-outline-danger ms-auto" onClick={loadFresh}>Retry</button>
                </div>
              )}
              {(loading || (listFilter === "deleted" && deletedLoading)) ? (
                <div className="text-center py-5 text-muted">
                  <span className="spinner-border spinner-border-sm me-2" />
                  {listFilter === "deleted" ? "Loading deleted locations…" : "Loading locations…"}
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
                    onRow={(record: TreeNode) => ({
                      onClick: () => navigate(`/locations/${record.id}`),
                      style: { cursor: "pointer" },
                      onMouseEnter: (e: React.MouseEvent<HTMLElement>) => e.currentTarget.setAttribute('data-star-hover', '1'),
                      onMouseLeave: (e: React.MouseEvent<HTMLElement>) => e.currentTarget.removeAttribute('data-star-hover'),
                    })}
                  />
                </div>
              ) : (
                /* ── Grid view ───────────────────────────────────────────── */
                <>
                  {gridRows.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="ti ti-building-off fs-32 d-block mb-2" />
                      No locations found
                    </div>
                  ) : (
                    <div className="row">
                      {gridRows.slice(0, gridPage).map(loc => {
                        const logo = loc.logo_path ? `/storage/${loc.logo_path}` : null;
                        const date = new Date(loc.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
                        return (
                          <div key={loc.id} className="col-xxl-3 col-xl-4 col-md-6">
                            <div className="card border shadow" style={{ cursor: "pointer" }} onClick={() => navigate(`/locations/${loc.id}`)}>
                              <div className="card-body">

                                {/* Header */}
                                <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                                  <span className={`badge ${loc.type === "business" ? "badge-soft-info" : "badge-soft-warning"}`}>
                                    {loc.type === "business" ? "Business" : "Warehouse"}
                                  </span>
                                  {!loc.is_active && <span className="badge badge-soft-danger">Inactive</span>}
                                </div>

                                {/* Title */}
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                  <div>
                                    <h4 className="mb-1 fs-14 fw-semibold">{loc.name}</h4>
                                    <p className="fs-13 mb-0 text-muted">
                                      {(loc as any).parent?.name ?? "Root Location"}
                                    </p>
                                  </div>
                                  <div
                                    className="rounded border d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                                    style={{ width: 40, height: 40, background: "#f5f5f5" }}
                                  >
                                    {logo
                                      ? <img src={logo} alt={loc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                      : <i className="ti ti-building text-muted fs-18" />
                                    }
                                  </div>
                                </div>

                                {/* Meta rows */}
                                <div className="mb-3">
                                  <p className="d-flex align-items-center mb-2">
                                    <span className="me-2 text-dark"><i className="ti ti-map-pin fs-12" /></span>
                                    {formatAddress(loc.address)}
                                  </p>
                                  <p className="d-flex align-items-center mb-0">
                                    <span className="me-2 text-dark"><i className="ti ti-file-invoice fs-12" /></span>
                                    {(loc as any).default_txn_series?.name ?? "No default series"}
                                  </p>
                                </div>

                                {/* Footer */}
                                <div className="d-flex align-items-center">
                                  <div className="avatar rounded-circle bg-white border me-2 d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0" style={{ width: 32, height: 32 }}>
                                    <i className="ti ti-user text-muted fs-14" />
                                  </div>
                                  <div className="d-flex flex-column">
                                    <span className="d-block fs-12 text-muted">Added on</span>
                                    <span className="text-default fs-13">{date}</span>
                                  </div>
                                </div>

                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {gridRows.length > gridPage && (
                    <div className="load-btn text-center mt-3">
                      <button type="button" className="btn btn-primary" onClick={() => setGridPage(p => p + 12)}>
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
                onChange={e => setColSearch(e.target.value)}
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

          {/* Sortable columns */}
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filteredDraft.map(c => c.key)} strategy={verticalListSortingStrategy}>
                {filteredDraft.map(col => (
                  <SortableColRow key={col.key} col={col} checked={draftVisible.has(col.key)} onToggle={() => toggleDraft(col.key)} />
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

      {/* ── Confirmation dialog ──────────────────────────────────────────────── */}
      <ConfirmDialog config={confirmConfig} onClose={() => setConfirmConfig(null)} />

      {/* ── Toast notification ───────────────────────────────────────────────── */}
      <div
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

export default LocationList;
