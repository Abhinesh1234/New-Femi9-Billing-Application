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
import { getRoleList, readRoleList, bustAllRoleCache, type RoleListItem } from "../../../../core/cache/roleCache";
import { exportToExcelFile, exportToPdfPrint } from "../../../../core/utils/exportUtils";

const route = all_routes;

// ─── Column definitions ───────────────────────────────────────────────────────
interface ColDef { key: string; label: string; }

const INITIAL_COLS: ColDef[] = [
  { key: "permissions_count", label: "Modules" },
  { key: "created_by",        label: "Created By" },
  { key: "created_at",        label: "Created On" },
];

const DEFAULT_VISIBLE = new Set(["permissions_count", "created_by", "created_at"]);

const DEFAULT_COL_WIDTHS: Record<string, number> = {
  name:              240,
  permissions_count: 140,
  created_by:        200,
  created_at:        160,
};

const COL_WIDTHS_LS_KEY  = "femi9_roles_col_widths";
const COL_ORDER_LS_KEY   = "femi9_roles_col_order";
const COL_VISIBLE_LS_KEY = "femi9_roles_col_visible";
const VIEW_LS_KEY        = "femi9_roles_view";

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

type SortOption = "name_asc" | "name_desc" | "newest" | "oldest";

// ─── Main component ───────────────────────────────────────────────────────────
const RolesPermissions = () => {
  const canCreate = usePermission("roles", "create");
  const canEdit   = usePermission("roles", "edit");
  const canDelete = usePermission("roles", "delete");
  const navigate = useNavigate();

  const [view, setView] = useState<"list" | "grid">(() => {
    try { return localStorage.getItem(VIEW_LS_KEY) === "grid" ? "grid" : "list"; }
    catch { return "list"; }
  });
  const [gridPage, setGridPage]     = useState(12);
  const [roles, setRoles]           = useState<RoleListItem[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy]         = useState<SortOption>("name_asc");
  const [showDeleted, setShowDeleted] = useState(false);


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

  const openColsModal  = () => { setDraftOrder([...colOrder]); setDraftVisible(new Set(visibleCols)); setColSearch(""); setShowColsModal(true); };
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
  const loadRoles = useCallback(async (deleted = false) => {
    const cached = readRoleList(deleted);
    if (cached) {
      setRoles(cached.data);
      setTotal(cached.total);
      setLoadError(null);
      setLoading(false);
    } else {
      setLoading(true);
      setLoadError(null);
    }
    try {
      const result = await getRoleList(deleted);
      setRoles(result.data);
      setTotal(result.total);
    } catch (e: any) { setLoadError(e.message ?? "Failed to load roles."); }
    setLoading(false);
  }, []);

  useEffect(() => { loadRoles(showDeleted); }, [showDeleted]);
  useEffect(() => { localStorage.setItem(VIEW_LS_KEY, view); }, [view]);
  useEffect(() => { setGridPage(12); }, [showDeleted]);

  const silentRefresh = useCallback(async () => {
    try {
      bustAllRoleCache();
      const result = await getRoleList(showDeleted);
      setRoles(result.data);
      setTotal(result.total);
    } catch { /* ignore */ }
  }, [showDeleted]);

  useEffect(() => {
    const onFocus = () => silentRefresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [silentRefresh]);

  const handleRefresh = useCallback(() => silentRefresh(), [silentRefresh]);


  // ── Filter + sort ──
  const filtered = useMemo(() => {
    let base = [...roles];
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      base = base.filter(r =>
        r.name.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q)
      );
    }
    return [...base].sort((a, b) => {
      switch (sortBy) {
        case "name_desc": return b.name.localeCompare(a.name);
        case "newest":    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:          return a.name.localeCompare(b.name);
      }
    });
  }, [roles, searchText, sortBy]);

  // ── Table columns ──
  const columns = useMemo(() => {
    const resizeCell = (key: string) => () => ({
      colKey: key, onResize: handleResize,
      currentWidth: colWidths[key] ?? DEFAULT_COL_WIDTHS[key] ?? 160,
    });

    const cols: object[] = [
      {
        title: "Role Name", key: "name", dataIndex: "name",
        width: colWidths["name"] ?? DEFAULT_COL_WIDTHS["name"],
        onHeaderCell: resizeCell("name"),
        render: (text: string, record: RoleListItem) => (
          <span className="d-flex align-items-center gap-2">
            <span className="title-name fw-medium" style={{ cursor: "pointer" }}
              onClick={() => navigate(route.roleOverview.replace(":id", String(record.id)))}>
              {text}
            </span>
            {record.is_system && (
              <span className="badge badge-soft-warning fs-11">
                <i className="ti ti-lock me-1" style={{ fontSize: 10 }} />System
              </span>
            )}
          </span>
        ),
      },
    ];

    for (const col of colOrder) {
      if (!visibleCols.has(col.key)) continue;
      switch (col.key) {
        case "permissions_count":
          cols.push({
            title: "Modules", key: "permissions_count", dataIndex: "permissions_count",
            width: colWidths["permissions_count"] ?? DEFAULT_COL_WIDTHS["permissions_count"],
            onHeaderCell: resizeCell("permissions_count"),
            render: (v: number) => (
              <span className="badge badge-soft-primary">{v ?? 0} module{v !== 1 ? "s" : ""}</span>
            ),
          }); break;
        case "created_by":
          cols.push({
            title: "Created By", key: "created_by", dataIndex: "created_by",
            width: colWidths["created_by"] ?? DEFAULT_COL_WIDTHS["created_by"],
            onHeaderCell: resizeCell("created_by"),
            render: (v: { name: string } | number | null) => (
              <span className="text-muted">
                {v && typeof v === "object" ? v.name : "—"}
              </span>
            ),
          }); break;
        case "created_at":
          cols.push({
            title: "Created On", key: "created_at", dataIndex: "created_at",
            width: colWidths["created_at"] ?? DEFAULT_COL_WIDTHS["created_at"],
            onHeaderCell: resizeCell("created_at"),
            render: (v: string) => <span className="text-muted">{fmtDate(v)}</span>,
          }); break;
      }
    }

    // Fix last column resize handle
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
  }, [visibleCols, colOrder, colWidths, handleResize, navigate]);

  // ── Export ──
  const exportHeaders = ["Role Name", "Description", "Modules", "Created By", "Created On"];
  const buildExportRows = () => filtered.map(r => [
    r.name,
    r.description ?? "—",
    String(r.permissions_count ?? 0),
    r.created_by_user?.name ?? "—",
    fmtDate(r.created_at),
  ]);

  const handleExportPdf = () => {
    try { exportToPdfPrint("Roles & Permissions", exportHeaders, buildExportRows()); }
    catch (e: any) { showToast(e.message ?? "PDF export failed.", "danger"); }
  };

  const handleExportExcel = () => {
    const rows = filtered.map(r => ({
      name:              r.name,
      description:       r.description ?? "—",
      permissions_count: r.permissions_count ?? 0,
      created_by:        r.created_by_user?.name ?? "—",
      created_at:        fmtDate(r.created_at),
    }));
    exportToExcelFile("Roles", [
      { header: "Role Name",   key: "name",              width: 24 },
      { header: "Description", key: "description",       width: 36 },
      { header: "Modules",     key: "permissions_count", width: 14 },
      { header: "Created By",  key: "created_by",        width: 20 },
      { header: "Created On",  key: "created_at",        width: 16 },
    ], rows).catch(() => showToast("Excel export failed.", "danger"));
  };

  const sortLabel: Record<SortOption, string> = {
    name_asc:  "Name A–Z",
    name_desc: "Name Z–A",
    newest:    "Newest",
    oldest:    "Oldest",
  };

  const activeFilterLabel = showDeleted ? "Deleted Roles" : "All Roles";

  return (
    <>
      <div className="page-wrapper">
        <div className="content">

          <PageHeader
            title="Roles & Permissions"
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
                <Link to={route.newRole} className="btn btn-primary">
                  <i className="ti ti-square-rounded-plus-filled me-1" />
                  New Role
                </Link>
              )}
            </div>

            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">

                {/* Filter */}
                <div className="dropdown">
                  <button type="button" className="dropdown-toggle btn btn-outline-light px-2 fs-16 fw-bold border-0" data-bs-toggle="dropdown">
                    {activeFilterLabel}
                  </button>
                  <div className="dropdown-menu dropmenu-hover-primary">
                    <ul>
                      <li>
                        <button className={`dropdown-item${!showDeleted ? " active" : ""}`} onClick={() => setShowDeleted(false)}>
                          <i className="ti ti-layout-list me-1" />All Roles
                        </button>
                      </li>
                      <li><hr className="dropdown-divider my-1" /></li>
                      <li>
                        <button className={`dropdown-item${showDeleted ? " active" : ""}`} onClick={() => setShowDeleted(true)}>
                          <i className="ti ti-trash me-1" />Deleted Roles
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
                    onRow={(record: RoleListItem) => ({
                      onClick: () => navigate(route.roleOverview.replace(":id", String(record.id))),
                      style: { cursor: "pointer" },
                    })}
                  />
                </div>
              ) : (
                /* ── Grid view ── */
                <>
                  {filtered.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="ti ti-shield-lock fs-40 d-block mb-4 text-muted opacity-50" />
                      <h6 className="fw-semibold mb-2">{showDeleted ? "No Deleted Roles" : "No Roles"}</h6>
                      <p className="text-muted mb-4 fs-14">
                        {showDeleted ? "No deleted roles found." : "Create your first role to get started."}
                      </p>
                      {!showDeleted && canCreate && (
                        <Link to={route.newRole} className="btn btn-primary px-4">
                          <i className="ti ti-square-rounded-plus-filled me-1" />New Role
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="row">
                      {filtered.slice(0, gridPage).map(role => (
                        <div key={role.id} className="col-xxl-3 col-xl-4 col-md-6">
                          <div className="card border shadow" style={{ cursor: "pointer" }} onClick={() => navigate(route.roleOverview.replace(":id", String(role.id)))}>
                            <div className="card-body">
                              {/* Header */}
                              <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                                <div className="d-flex align-items-center gap-2">
                                  <span style={{ width: 34, height: 34, borderRadius: "50%", background: "#fff0f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <i className="ti ti-shield-lock fs-16" style={{ color: "#E41F07" }} />
                                  </span>
                                  <span className="fs-14 fw-semibold">{role.name}</span>
                                  {role.is_system && (
                                    <span className="badge badge-soft-warning ms-1 fs-11">
                                      <i className="ti ti-lock me-1" style={{ fontSize: 10 }} />System
                                    </span>
                                  )}
                                </div>
                                <span className="badge badge-soft-primary">{role.permissions_count ?? 0} modules</span>
                              </div>

                              {/* Description */}
                              <p className="fs-13 text-muted mb-3" style={{ minHeight: 36, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                                {role.description || "No description provided."}
                              </p>

                              {/* Footer */}
                              <div className="d-flex align-items-center">
                                <span className="fs-12 text-muted d-flex align-items-center gap-1">
                                  <i className="ti ti-calendar fs-13" />{fmtDate(role.created_at)}
                                </span>
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
              <span className="fs-14 text-muted">Role Name</span>
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

export default RolesPermissions;
