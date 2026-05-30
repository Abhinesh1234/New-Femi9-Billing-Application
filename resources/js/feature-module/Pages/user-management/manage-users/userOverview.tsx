import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PartiesExtraPermsModal, { type ExtraPermsValue } from "../roles-permissions/PartiesExtraPermsModal";
import { Toast } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import { all_routes } from "../../../../routes/all_routes";
import { usePermission } from "../../../../core/hooks/usePermission";
import {
  getUserList, readUserList,
  getUserDetail, readUserDetail,
  bustUserCache,
  type UserListItem, type UserDetail,
} from "../../../../core/cache/userCache";

const route = all_routes;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="d-flex align-items-start px-4 py-2">
      <span className="text-muted fs-14 flex-shrink-0" style={{ width: "45%" }}>{label}</span>
      <span className="fs-14 fw-medium">{value ?? "—"}</span>
    </div>
  );
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

function fmtDateTime(d: string | null | undefined): string {
  if (!d) return "—";
  const dt = new Date(d);
  return (
    dt.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) +
    ", " +
    dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
  );
}

function userInitials(name: string): string {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

const AVATAR_COLORS = ["#E41F07","#0d6efd","#198754","#fd7e14","#6f42c1","#20c997","#dc3545","#0dcaf0"];
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }

function UserAvatar({ user, size = 32 }: { user: { id: number; name: string }; size?: number }) {
  const color = avatarColor(user.id);
  return (
    <span style={{ width: size, height: size, borderRadius: "50%", background: color, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff", fontWeight: 600, fontSize: size * 0.38 }}>
      {userInitials(user.name)}
    </span>
  );
}

// ─── Permissions read-only ────────────────────────────────────────────────────

type PermKey = "full" | "view" | "create" | "edit" | "delete" | "others";
const PERM_KEYS:   PermKey[]               = ["full", "view", "create", "edit", "delete", "others"];
const PERM_LABELS: Record<PermKey, string> = { full: "Full", view: "View", create: "Create", edit: "Edit", delete: "Delete", others: "Others" };

const SECTION_DEFS = [
  {
    title: "Items",
    modules: [
      { key: "items",           label: "Items",           viewOnly: false, hasMorePerms: false },
      { key: "composite_items", label: "Composite Items", viewOnly: false, hasMorePerms: false },
      { key: "price_list",      label: "Price List",      viewOnly: false, hasMorePerms: false },
    ],
  },
  {
    title: "Inventory",
    modules: [
      { key: "inventory",             label: "Inventory",             viewOnly: true,  hasMorePerms: false },
      { key: "assemblies",            label: "Assemblies",            viewOnly: false, hasMorePerms: false },
      { key: "inventory_adjustments", label: "Inventory Adjustments", viewOnly: false, hasMorePerms: false },
      { key: "transfer_orders",       label: "Transfer Orders",       viewOnly: false, hasMorePerms: false },
    ],
  },
  {
    title: "Sales",
    modules: [
      { key: "parties",      label: "Parties",      viewOnly: false, hasMorePerms: true  },
      { key: "invoices",     label: "Invoices",     viewOnly: false, hasMorePerms: false },
      { key: "payments",     label: "Payments",     viewOnly: false, hasMorePerms: false },
      { key: "credit_notes", label: "Credit Notes", viewOnly: false, hasMorePerms: false },
    ],
  },
  {
    title: "Others",
    modules: [
      { key: "distribution_locations", label: "Distribution Locations", viewOnly: false, hasMorePerms: false },
    ],
  },
];

type PermRO = { can_view: boolean; can_create: boolean; can_edit: boolean; can_delete: boolean; can_others: boolean; others_data?: Record<string, unknown> | null };

function PermissionsReadOnly({ permsMap, permCount }: { permsMap: Map<string, PermRO>; permCount: number }) {
  const [modalModKey, setModalModKey] = useState<string | null>(null);

  return (
    <>
      <div className="card border mb-3">
        <div className="card-body p-0">
          <div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between">
            <h6 className="fw-semibold fs-15 mb-0">Permissions</h6>
            <span className="badge badge-soft-primary fs-12">
              {permCount} module{permCount !== 1 ? "s" : ""} granted
            </span>
          </div>
          <div className="px-4 pt-2 pb-4">
            {SECTION_DEFS.map(section => (
              <div key={section.title} className="mt-4" style={{ border: "1px solid #dee2e6", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ background: "#fff0f2", padding: "12px 16px", borderBottom: "1px solid #dee2e6" }}>
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E41F07", display: "inline-block", flexShrink: 0 }} />
                    <span className="fw-semibold fs-14">{section.title}</span>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                <table className="table mb-0" style={{ width: "100%", minWidth: 700, tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: 200 }} />
                    <col style={{ width: 70 }} />
                    <col style={{ width: 70 }} />
                    <col style={{ width: 80 }} />
                    <col style={{ width: 70 }} />
                    <col style={{ width: 80 }} />
                    <col style={{ width: 120 }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="text-uppercase fs-12 fw-semibold text-muted" style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6" }}>Particulars</th>
                      {PERM_KEYS.map(k => (
                        <th key={k} className="text-uppercase fs-12 fw-semibold text-muted text-center" style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6" }}>
                          {PERM_LABELS[k]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.modules.map(mod => {
                      const p      = permsMap.get(mod.key);
                      const rKeys  = mod.viewOnly ? (["full", "view"] as PermKey[]) : PERM_KEYS;
                      const isFull = mod.viewOnly
                        ? (p?.can_view ?? false)
                        : ((p?.can_view && p?.can_create && p?.can_edit && p?.can_delete) ?? false);
                      const vals: Record<PermKey, boolean> = {
                        full:   isFull,
                        view:   p?.can_view   ?? false,
                        create: p?.can_create ?? false,
                        edit:   p?.can_edit   ?? false,
                        delete: p?.can_delete ?? false,
                        others: p?.can_others ?? false,
                      };
                      return (
                        <tr key={mod.key} style={{ borderBottom: "1px solid #f5f5f5" }}>
                          <td className="fs-14" style={{ padding: "12px 16px", verticalAlign: "middle" }}>{mod.label}</td>
                          {PERM_KEYS.map(k => (
                            <td key={k} className="fs-14 text-center" style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                              {k === "others" && mod.hasMorePerms ? (
                                <button
                                  type="button"
                                  className="btn btn-link btn-sm p-0 fs-13"
                                  style={{ color: "#E41F07", textDecoration: "none", whiteSpace: "nowrap" }}
                                  onClick={() => setModalModKey(mod.key)}
                                >
                                  Permissions
                                  <i className="ti ti-external-link ms-1" style={{ fontSize: 11 }} />
                                </button>
                              ) : (
                                rKeys.includes(k) && vals[k]
                                  ? <i className="ti ti-check" style={{ color: "#16a34a", fontSize: 16 }} />
                                  : null
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modalModKey && (() => {
        const p  = permsMap.get(modalModKey);
        const od = p?.others_data as { party_category_ids?: number[] | null } | null | undefined;
        const val: ExtraPermsValue = { party_category_ids: od?.party_category_ids ?? [] };
        return (
          <PartiesExtraPermsModal
            show={!!modalModKey}
            onHide={() => setModalModKey(null)}
            value={val}
            readOnly
          />
        );
      })()}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const UserOverview = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canEdit  = usePermission("users", "edit");

  const [allUsers,    setAllUsers]    = useState<UserListItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listSearch,  setListSearch]  = useState("");

  const [user,          setUser]          = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError,   setDetailError]   = useState<string | null>(null);
  const [refreshing,    setRefreshing]    = useState(false);

  const refreshingRef  = useRef(false);
  const detailFetchRef = useRef(0);
  const activeItemRef  = useRef<HTMLDivElement>(null);

  // ── Toast ──
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger"; message: string }>({ show: false, type: "success", message: "" });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((type: "success" | "danger", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  }, []);
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // ── Fetch list ──
  useEffect(() => {
    const cached = readUserList();
    if (cached) { setAllUsers(cached.data); setListLoading(false); return; }
    setListLoading(true);
    getUserList()
      .then(res => setAllUsers(res.data))
      .catch(() => showToast("danger", "Failed to load users list."))
      .finally(() => setListLoading(false));
  }, []);

  // ── Fetch detail ──
  useEffect(() => {
    if (!id) { setUser(null); setDetailLoading(false); setDetailError(null); return; }
    const numId = Number(id);
    if (isNaN(numId)) { setDetailError("Invalid user ID."); setDetailLoading(false); return; }
    const token = ++detailFetchRef.current;

    setDetailLoading(true);
    setDetailError(null);

    const cached = readUserDetail(numId);
    if (cached) {
      if (token !== detailFetchRef.current) return;
      setUser(cached);
      setDetailLoading(false);
      getUserDetail(numId).then(data => {
        if (token !== detailFetchRef.current) return;
        setUser(data);
      }).catch(() => {});
      return;
    }

    getUserDetail(numId)
      .then(data => { if (token !== detailFetchRef.current) return; setUser(data); })
      .catch(() => { if (token !== detailFetchRef.current) return; setDetailError("Failed to load user details."); })
      .finally(() => { if (token !== detailFetchRef.current) return; setDetailLoading(false); });
  }, [id]);

  // ── Scroll active item into view ──
  useEffect(() => {
    const timer = setTimeout(() => activeItemRef.current?.scrollIntoView({ block: "center", behavior: "instant" }), 50);
    return () => clearTimeout(timer);
  }, [id, allUsers]);

  // ── Refresh ──
  const handleRefresh = useCallback(async () => {
    if (!id || refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    try {
      bustUserCache();
      const [listRes, detail] = await Promise.all([getUserList(), getUserDetail(Number(id))]);
      setAllUsers(listRes.data);
      setUser(detail);
    } catch {
      showToast("danger", "Network error during refresh.");
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }, [id, showToast]);

  // ── Window focus silent refresh ──
  useEffect(() => {
    const onFocus = () => {
      getUserList().then(res => setAllUsers(res.data)).catch(() => {});
      if (id) getUserDetail(Number(id)).then(data => setUser(data)).catch(() => {});
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [id]);

  // ── Filtered list ──
  const filteredList = useMemo(() => {
    const q = listSearch.trim().toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter(u =>
      u.name.toLowerCase().includes(q) ||
      (u.email ?? "").toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q)
    );
  }, [allUsers, listSearch]);

  return (
    <div
      className="page-wrapper"
      style={{ height: "calc(100vh - 57px)", minHeight: "unset", overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      {/* ── Toast ── */}
      <div className="position-fixed top-0 start-50 translate-middle-x pt-4" style={{ zIndex: 9999, pointerEvents: "none" }}>
        <Toast
          show={toast.show}
          onClose={() => setToast(t => ({ ...t, show: false }))}
          role="alert" aria-live="assertive" aria-atomic="true"
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

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Left panel ── */}
        <div
          className="d-none d-xl-flex"
          style={{ width: 340, minWidth: 340, flexDirection: "column", borderRight: "1px solid #dee2e6", background: "#fff", overflow: "hidden" }}
        >
          <div className="px-3 py-3" style={{ borderBottom: "1px solid #dee2e6", flexShrink: 0 }}>
            <div className="input-group">
              <span className="input-group-text border-end-0 bg-white">
                <i className="ti ti-search text-muted fs-13" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search users…"
                value={listSearch}
                onChange={e => setListSearch(e.target.value)}
              />
              {listSearch && (
                <button type="button" className="btn btn-sm btn-outline-light border-start-0" onClick={() => setListSearch("")}>
                  <i className="ti ti-x fs-12 text-muted" />
                </button>
              )}
            </div>
          </div>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {listLoading ? (
              <div className="text-center py-4 text-muted fs-13">
                <span className="spinner-border spinner-border-sm me-2" />Loading…
              </div>
            ) : filteredList.length === 0 ? (
              <div className="text-center py-4 text-muted fs-13">
                <i className="ti ti-mood-empty d-block fs-24 mb-1" />No users found
              </div>
            ) : filteredList.map(u => {
              const isActive = String(u.id) === id;
              return (
                <div
                  key={u.id}
                  ref={isActive ? activeItemRef : undefined}
                  onClick={() => navigate(route.userOverview.replace(":id", String(u.id)))}
                  className="d-flex align-items-center gap-2 px-3"
                  style={{ paddingTop: 14, paddingBottom: 14, cursor: "pointer", background: isActive ? "#fff1f0" : "transparent", borderBottom: "1px solid #f5f5f5" }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "#f8f9fa"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = isActive ? "#fff1f0" : "transparent"; }}
                >
                  <UserAvatar user={u} size={32} />
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="d-flex align-items-center justify-content-between gap-1 mb-1">
                      <span className="text-truncate fs-14" style={{ fontWeight: isActive ? 600 : 400, color: isActive ? "#E41F07" : "#212529" }}>
                        {u.name}
                      </span>
                      <span className={`badge fs-11 flex-shrink-0 ${u.is_active ? "badge-soft-success" : "badge-soft-danger"}`}>
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="text-truncate fs-12 text-muted">{u.role?.name ?? u.email ?? u.phone}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div style={{ flex: 1, overflowY: "auto", background: "#fff" }}>
          {!id ? (
            <div className="text-center py-5 text-muted">
              <i className="ti ti-users fs-36 d-block mb-2" />
              <p className="fs-14 mb-0">Select a user to view details.</p>
            </div>
          ) : detailLoading ? (
            <div className="text-center py-5 text-muted">
              <span className="spinner-border spinner-border-sm text-primary me-2" />
              <span className="fs-14">Loading user…</span>
            </div>
          ) : detailError ? (
            <div style={{ padding: "1.25rem" }}>
              <div className="alert alert-danger">{detailError}</div>
            </div>
          ) : !user ? (
            <div className="text-center py-5 text-muted">
              <i className="ti ti-users fs-36 d-block mb-2" />
              <p className="fs-14 mb-0">Select a user to view details.</p>
            </div>
          ) : (
            <div style={{ padding: "1.25rem" }}>

              {/* ── Header ── */}
              <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
                <div className="d-flex align-items-start gap-3">
                  <UserAvatar user={user} size={56} />
                  <div>
                    <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                      <h4 className="fw-bold mb-0 lh-sm">{user.name}</h4>
                      <span className={`badge fs-12 ${user.is_active ? "badge-soft-success" : "badge-soft-danger"}`}>
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      {user.role && (
                        <span className="badge fs-12" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                          <i className="ti ti-shield me-1" style={{ fontSize: 10 }} />
                          {user.role.name}
                        </span>
                      )}
                      <span className="badge fs-12" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                        <i className="ti ti-lock me-1" style={{ fontSize: 10 }} />
                        {user.permissions?.length ?? 0} modules
                      </span>
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <div className="dropdown">
                    <button
                      type="button"
                      className="btn btn-outline-light dropdown-toggle shadow d-flex align-items-center gap-1"
                      style={{ height: 36 }}
                      data-bs-toggle="dropdown"
                    >
                      Actions
                    </button>
                    <div className="dropdown-menu dropdown-menu-end dropmenu-hover-primary">
                      <ul>
                        {canEdit && (
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => id && navigate(route.editUser.replace(":id", id))}
                            >
                              <i className="ti ti-edit me-2" />Edit
                            </button>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-light d-flex align-items-center justify-content-center shadow"
                    style={{ height: 36, width: 36 }}
                    onClick={handleRefresh}
                    disabled={refreshing}
                    title="Refresh"
                  >
                    <i className={`ti ti-refresh${refreshing ? " spin-animation" : ""}`} style={{ fontSize: 16 }} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-light d-flex align-items-center justify-content-center shadow"
                    style={{ height: 36, width: 36 }}
                    onClick={() => navigate(route.manageusers)}
                    title="Close"
                  >
                    <i className="ti ti-x" style={{ fontSize: 16 }} />
                  </button>
                </div>
              </div>

              {/* ── Tab nav (pill) ── */}
              <div className="mb-4 scrollbar-hidden" style={{ overflowX: "auto" }}>
                <div className="d-inline-flex rounded" style={{ background: "#f1f3f5", padding: 4, gap: 2 }}>
                  <button
                    type="button"
                    style={{ padding: "6px 20px", borderRadius: 6, border: "none", background: "#fff", color: "#e03131", fontWeight: 600, fontSize: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.10)", transition: "all 0.15s", cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    Overview
                  </button>
                </div>
              </div>

              {/* ── Overview body ── */}

              {/* User Information card */}
              <div className="card border mb-3">
                <div className="card-body p-0">
                  <div className="px-4 py-3 border-bottom">
                    <h6 className="fw-semibold fs-15 mb-0">User Information</h6>
                  </div>
                  <div className="row g-0 pt-2 pb-1">
                    <div className="col-md-6">
                      <InfoRow label="Name"  value={user.name} />
                      <InfoRow label="Phone" value={user.phone} />
                      <InfoRow label="Email" value={user.email || "—"} />
                    </div>
                    <div className="col-md-6">
                      <InfoRow label="Role" value={
                        user.role
                          ? <span className="badge badge-soft-primary fs-12">{user.role.name}</span>
                          : "—"
                      } />
                      <InfoRow label="Status" value={
                        <span className={`badge fs-12 ${user.is_active ? "badge-soft-success" : "badge-soft-danger"}`}>
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      } />
                      <InfoRow label="Last Updated" value={fmtDateTime(user.updated_at)} />
                    </div>
                  </div>
                  <div
                    className="d-flex align-items-center px-4 py-3 border-top"
                    style={{ background: "#fafafa", borderRadius: "0 0 8px 8px" }}
                  >
                    <span className="text-muted fs-14 flex-shrink-0" style={{ width: "22.5%" }}>Created On</span>
                    <span className="fs-14 fw-medium">{fmtDateTime(user.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* ── Permissions card ── */}
              {(() => {
                const permsMap = new Map<string, PermRO>();
                (user.permissions ?? []).forEach(p => permsMap.set(p.module, p as any));
                return <PermissionsReadOnly permsMap={permsMap} permCount={permsMap.size} />;
              })()}

              {/* Last updated footer */}
              <div className="d-inline-flex align-items-center gap-2 mt-4 px-3 py-2 rounded"
                style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}>
                <i className="ti ti-clock text-muted fs-14" />
                <span className="fs-14 text-muted">
                  Last updated on{" "}
                  <span className="fw-semibold" style={{ color: "#495057" }}>
                    {fmtDate(user.updated_at ?? user.created_at)}
                    {", "}
                    {new Date(user.updated_at ?? user.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                  </span>
                </span>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default UserOverview;
