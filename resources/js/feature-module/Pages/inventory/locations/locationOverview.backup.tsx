import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Toast } from "react-bootstrap";
import Footer from "../../../../components/footer/footer";
import {
  fetchLocation,
  fetchLocations,
  destroyLocation,
  type LocationListItem,
} from "../../../../core/services/locationApi";
import {
  fetchLocationAuditLogs,
  type AuditLogEntry,
} from "../../../../core/services/auditLogApi";
import { all_routes } from "../../../../routes/all_routes";

const route = all_routes;

// ── Label lookups ──────────────────────────────────────────────────────────────
const STATE_LABELS: Record<string, string> = {
  AN: "Andaman & Nicobar", AP: "Andhra Pradesh", AR: "Arunachal Pradesh",
  AS: "Assam", BR: "Bihar", CH: "Chandigarh", CT: "Chhattisgarh",
  DL: "Delhi", GA: "Goa", GJ: "Gujarat", HR: "Haryana", HP: "Himachal Pradesh",
  JK: "Jammu & Kashmir", JH: "Jharkhand", KA: "Karnataka", KL: "Kerala",
  LA: "Ladakh", MP: "Madhya Pradesh", MH: "Maharashtra", MN: "Manipur",
  ML: "Meghalaya", MZ: "Mizoram", NL: "Nagaland", OR: "Odisha", PB: "Punjab",
  PY: "Puducherry", RJ: "Rajasthan", SK: "Sikkim", TN: "Tamil Nadu",
  TG: "Telangana", TR: "Tripura", UP: "Uttar Pradesh", UK: "Uttarakhand", WB: "West Bengal",
};
const COUNTRY_LABELS: Record<string, string> = {
  IN: "India", US: "United States", GB: "United Kingdom",
  AE: "United Arab Emirates", SG: "Singapore",
};

function fmtDate(dateStr: string | null | undefined, withTime = false): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const date = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  if (!withTime) return date;
  const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${date}, ${time}`;
}

// ── Tree types & helpers ───────────────────────────────────────────────────────
interface TreeNode extends LocationListItem { children: TreeNode[]; }

function buildTree(locs: LocationListItem[], parentId: number | null = null): TreeNode[] {
  return locs
    .filter(l => (l.parent_id ?? null) === parentId)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(l => ({ ...l, children: buildTree(locs, l.id) }));
}

function getAncestorIds(locs: LocationListItem[], id: number): number[] {
  const byId = new Map(locs.map(l => [l.id, l]));
  const out: number[] = [];
  let cur = byId.get(id);
  while (cur?.parent_id) { out.push(cur.parent_id); cur = byId.get(cur.parent_id); }
  return out;
}

// ── Tree Row component ─────────────────────────────────────────────────────────
interface TreeRowProps {
  node: TreeNode;
  depth: number;
  isSelected: boolean;
  isExpanded: boolean;
  onToggle: (id: number) => void;
  onNavigate: (id: number) => void;
}

const INDENT = 20;

const TreeRow = ({ node, depth, isSelected, isExpanded, onToggle, onNavigate }: TreeRowProps) => {
  const hasChildren = node.children.length > 0;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const pl = 12 + depth * INDENT;

  return (
    <div
      className={`loc-tree-row d-flex align-items-center gap-1 py-2 pe-2${isSelected ? " loc-tree-row--active" : ""}`}
      style={{ paddingLeft: pl, cursor: "pointer", minHeight: 44, position: "relative" }}
      onClick={() => onNavigate(node.id)}
    >
      {/* Expand toggle */}
      <button
        type="button"
        style={{
          background: "none", border: "none", padding: 0,
          width: 20, height: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          visibility: hasChildren ? "visible" : "hidden",
          color: "#64748b", cursor: "pointer", flexShrink: 0,
        }}
        onClick={e => { e.stopPropagation(); onToggle(node.id); }}
      >
        <i className={`ti ${isExpanded ? "ti-chevron-down" : "ti-chevron-right"} fs-13`} />
      </button>

      {/* Circle connector for leaf child nodes */}
      {depth > 0 && !hasChildren && (
        <span
          style={{
            width: 7, height: 7, borderRadius: "50%",
            border: "1.5px solid #94a3b8", marginRight: 2, flexShrink: 0,
          }}
        />
      )}

      {/* Icon */}
      <div
        className="rounded border d-flex align-items-center justify-content-center flex-shrink-0"
        style={{ width: 34, height: 34, background: isSelected ? "#fff" : "#f8fafc", overflow: "hidden" }}
      >
        {node.logo_path
          ? <img src={`/storage/${node.logo_path}`} alt={node.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <i className="ti ti-building fs-15 text-muted" />}
      </div>

      {/* Name */}
      <span
        className={`flex-grow-1 fs-14 fw-medium text-truncate ms-1${isSelected ? " text-primary" : ""}`}
        style={{ minWidth: 0 }}
      >
        {node.name}
      </span>

      {/* Star (primary) */}
      {node.is_primary && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )}

      {/* Three-dot menu */}
      <div ref={menuRef} className="flex-shrink-0 position-relative" onClick={e => e.stopPropagation()}>
        <button
          type="button"
          style={{ width: 28, height: 28, background: menuOpen ? "#f1f5f9" : "transparent", border: "none", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
        >
          <i className="ti ti-dots-vertical fs-15 text-muted" />
        </button>
        {menuOpen && (
          <div
            className="border rounded shadow-sm bg-white"
            style={{ position: "absolute", right: 0, top: "100%", zIndex: 200, minWidth: 140, marginTop: 4 }}
          >
            <Link
              className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 fs-13"
              to={`/locations/${node.id}`}
              onClick={() => setMenuOpen(false)}
            >
              <i className="ti ti-eye fs-14" /> View
            </Link>
            <Link
              className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 fs-13"
              to={`/locations/${node.id}/edit`}
              onClick={() => setMenuOpen(false)}
            >
              <i className="ti ti-edit fs-14" /> Edit
            </Link>
            <button
              className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 fs-13 text-danger w-100 text-start"
              onClick={() => setMenuOpen(false)}
            >
              <i className="ti ti-trash fs-14" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Tabs definition ────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview", label: "Overview" },
  { id: "history",  label: "History" },
];

// ── Overview tab ───────────────────────────────────────────────────────────────
const OverviewTab = ({ location }: { location: Record<string, any> }) => {
  const addr = location.address ?? {};
  const addrParts = [
    addr.attention,
    addr.street1,
    addr.street2,
    [addr.city, STATE_LABELS[addr.state] ?? addr.state, addr.pin_code ? `– ${addr.pin_code}` : null]
      .filter(Boolean).join(", "),
    COUNTRY_LABELS[addr.country] ?? addr.country,
  ].filter(Boolean);

  const infoRows: { label: string; value: React.ReactNode; email?: boolean; full?: boolean }[] = [
    { label: "Location Code", value: location.code ?? "—" },
    { label: "Phone",         value: addr.phone ?? "—" },
    {
      label: "Type",
      value: (
        <span className={`badge ${location.type === "business" ? "badge-soft-info" : "badge-soft-warning"}`}>
          {location.type === "business" ? "Business" : "Warehouse"}
        </span>
      ),
    },
    { label: "Email",           value: location.email ?? "—", email: !!location.email },
    { label: "Parent Location", value: location.parent?.name ?? "—" },
    { label: "GSTIN",           value: location.gstin ?? "—" },
    {
      label: "Status",
      value: (
        <span className={`badge ${location.is_active ? "badge-soft-success" : "badge-soft-danger"}`}>
          {location.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    { label: "Created By", value: location.created_by?.name ?? "—" },
    { label: "Created On", value: fmtDate(location.created_at, true), full: true },
  ];

  const seriesName: string = location.default_txn_series?.name ?? (location as any).txn_series?.name ?? "Default Transaction Series";

  return (
    <>
      {/* Location Information */}
      <div className="card border shadow mb-4">
        <div className="card-body p-3 p-md-4">
          <h6 className="fw-semibold fs-15 mb-3">Location Information</h6>
          <div className="row g-0">
            {infoRows.map(({ label, value, email, full }, i) => (
              <div
                key={label}
                className={`${full ? "col-12" : "col-12 col-md-6"} d-flex align-items-start py-2`}
                style={{ borderBottom: i < infoRows.length - 1 ? "1px solid #f1f5f9" : undefined }}
              >
                <span className="text-muted fs-13 flex-shrink-0" style={{ minWidth: 130, paddingRight: 8 }}>
                  {label}
                </span>
                <span className="fs-13 fw-medium text-dark">
                  {email
                    ? <a href={`mailto:${value}`} className="text-primary">{value}</a>
                    : value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Address + Transaction Series cards */}
      <div className="row g-3">
        {/* Address card */}
        <div className="col-12 col-md-6">
          <div className="card border shadow h-100">
            <div className="card-body p-3 p-md-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span
                  className="d-flex align-items-center justify-content-center rounded flex-shrink-0"
                  style={{ width: 32, height: 32, background: "#f1f5f9" }}
                >
                  <i className="ti ti-map-pin fs-16 text-muted" />
                </span>
                <h6 className="fw-semibold mb-0 fs-14">Address</h6>
              </div>
              {addrParts.length > 0 ? (
                <div className="text-dark fs-13 mb-3" style={{ lineHeight: 1.7 }}>
                  {addrParts.map((line, i) => <div key={i}>{line}</div>)}
                </div>
              ) : (
                <p className="text-muted fs-13 mb-3">No address recorded.</p>
              )}
              <button type="button" className="btn btn-sm btn-outline-light d-inline-flex align-items-center gap-1">
                <i className="ti ti-map fs-14" /> View on Map
              </button>
            </div>
          </div>
        </div>

        {/* Transaction Series card */}
        <div className="col-12 col-md-6">
          <div className="card border shadow h-100">
            <div className="card-body p-3 p-md-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span
                  className="d-flex align-items-center justify-content-center rounded flex-shrink-0"
                  style={{ width: 32, height: 32, background: "#f1f5f9" }}
                >
                  <i className="ti ti-file-invoice fs-16 text-muted" />
                </span>
                <h6 className="fw-semibold mb-0 fs-14">Transaction Series</h6>
              </div>
              <div className="d-flex align-items-center justify-content-between py-2">
                <span className="fs-14 fw-medium text-dark">General</span>
                <div className="d-flex align-items-center gap-1">
                  <span className="text-muted fs-13">{seriesName}</span>
                  <i className="ti ti-chevron-right text-muted fs-12" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ── History tab ───────────────────────────────────────────────────────────────
const FIELD_LABEL: Record<string, string> = {
  name:                    "Name",
  code:                    "Location Code",
  type:                    "Location Type",
  parent_id:               "Parent Location",
  logo_type:               "Logo Type",
  logo_path:               "Logo",
  website_url:             "Website URL",
  email:                   "Email",
  gstin:                   "GSTIN",
  is_active:               "Status",
  txn_series_id:           "Transaction Series",
  default_txn_series_id:   "Default Transaction Series",
  address:                 "Address",
  access_users:            "Location Access",
};

const ADDR_LABEL: Record<string, string> = {
  attention: "Attention", street1: "Street 1", street2: "Street 2",
  city: "City", pin_code: "Pin Code", country: "Country",
  state: "State", phone: "Phone", fax: "Fax",
};

const EVENT_COLOR: Record<string, string> = {
  created:        "bg-success",
  updated:        "bg-primary",
  deleted:        "bg-danger",
  restored:       "bg-warning",
  set_primary:    "bg-warning",
  series_created: "bg-info",
  series_updated: "bg-primary",
  series_deleted: "bg-danger",
};
const EVENT_ICON: Record<string, string> = {
  created:        "ti-plus",
  updated:        "ti-pencil",
  deleted:        "ti-trash",
  restored:       "ti-refresh",
  set_primary:    "ti-star",
  series_created: "ti-file-invoice",
  series_updated: "ti-file-invoice",
  series_deleted: "ti-file-invoice",
};
const EVENT_LABEL: Record<string, string> = {
  created:        "Created",
  updated:        "Updated",
  deleted:        "Deleted",
  restored:       "Restored",
  set_primary:    "Set Primary",
  series_created: "Series Created",
  series_updated: "Series Updated",
  series_deleted: "Series Deleted",
};

// Events with a fixed summary — never show diff rows for these
const STATIC_SUMMARY: Record<string, string> = {
  created:        "Location was created",
  deleted:        "Location was deleted",
  restored:       "Location was restored",
  set_primary:    "Location set as primary",
  // Series events carry fields belonging to the series record, not the location — show summary only
  series_created: "Transaction series was assigned to this location",
  series_updated: "Transaction series details were updated",
  series_deleted: "Transaction series was removed from this location",
};

type DiffRow = { key: string; label: string; oldVal: any; newVal: any };

function parseIfStr(v: any): any {
  if (typeof v === "string") { try { return JSON.parse(v); } catch { return v; } }
  return v;
}

// Fields we never want to surface in the diff (internal / noise)
const SKIP_FIELDS = new Set(["updated_at", "created_at", "id", "is_primary"]);

function buildDiffRows(log: AuditLogEntry): DiffRow[] {
  const changedFields = log.new_values ? Object.keys(log.new_values) : [];

  return changedFields.flatMap((field): DiffRow[] => {
    if (SKIP_FIELDS.has(field)) return [];

    // address: diff sub-fields individually
    if (field === "address") {
      const rawOld = parseIfStr(log.old_values?.address);
      const rawNew = parseIfStr(log.new_values?.address);
      const oldS = (rawOld && typeof rawOld === "object" && !Array.isArray(rawOld)) ? rawOld : {};
      const newS = (rawNew && typeof rawNew === "object" && !Array.isArray(rawNew)) ? rawNew : {};
      const changed = Object.keys({ ...oldS, ...newS }).filter(
        k => String(oldS[k] ?? "") !== String(newS[k] ?? "")
      );
      if (changed.length === 0) return [];
      return changed.map(k => ({
        key:    `address.${k}`,
        label:  ADDR_LABEL[k] ?? k,
        oldVal: oldS[k] ?? null,
        newVal: newS[k] ?? null,
      }));
    }

    // access_users: flag as changed only if actually different
    if (field === "access_users") {
      const oldStr = JSON.stringify(parseIfStr(log.old_values?.access_users));
      const newStr = JSON.stringify(parseIfStr(log.new_values?.access_users));
      if (oldStr === newStr) return [];
      return [{ key: "access_users", label: "Location Access", oldVal: null, newVal: null }];
    }

    // scalar: skip if unchanged
    const oldVal = parseIfStr(log.old_values?.[field]);
    const newVal = parseIfStr(log.new_values?.[field]);
    if (String(oldVal ?? "") === String(newVal ?? "")) return [];

    return [{
      key:    field,
      label:  FIELD_LABEL[field] ?? field.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      oldVal,
      newVal,
    }];
  });
}

function fmtAuditVal(key: string, v: any): React.ReactNode {
  if (v === null || v === undefined || v === "")
    return <span className="text-muted fst-italic">—</span>;

  // Boolean / status
  if (key === "is_active")
    return (v === true || v === 1 || v === "1") ? "Active" : "Inactive";

  // Location type enum
  if (key === "type")
    return v === "business" ? "Business" : "Warehouse";

  // Logo — don't show a raw path
  if (key === "logo_path" || key === "logo_type")
    return <span className="text-muted fst-italic">Updated</span>;

  // FK IDs — show as human-readable references instead of raw integers
  if (key === "txn_series_id" || key === "default_txn_series_id")
    return (typeof v === "number" || (typeof v === "string" && /^\d+$/.test(v)))
      ? `Series #${v}`
      : String(v);

  if (key === "parent_id")
    return (typeof v === "number" || (typeof v === "string" && /^\d+$/.test(v)))
      ? `Location #${v}`
      : String(v);

  // Boolean fallback
  if (typeof v === "boolean") return v ? "Yes" : "No";

  // State / country codes → human label
  if (key === "address.state")   return STATE_LABELS[String(v)]   ?? String(v);
  if (key === "address.country") return COUNTRY_LABELS[String(v)] ?? String(v);

  // Objects / arrays — never render as [object Object]
  if (Array.isArray(v))
    return v.length > 0 ? `${v.length} item${v.length !== 1 ? "s" : ""}` : <span className="text-muted fst-italic">—</span>;
  if (typeof v === "object")
    return <span className="text-muted fst-italic">Updated</span>;

  return String(v);
}

const HistoryTab = ({ locationId }: { locationId: number }) => {
  const [logs,      setLogs]      = useState<AuditLogEntry[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [page,      setPage]      = useState(1);
  const [lastPage,  setLastPage]  = useState(1);
  const [total,     setTotal]     = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchLocationAuditLogs(locationId, page).then(res => {
      if (res.success) {
        setLogs(res.data.data);
        setLastPage(res.data.last_page);
        setTotal(res.data.total);
      }
      setLoading(false);
    });
  }, [locationId, page]);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5 text-muted">
        <span className="spinner-border spinner-border-sm text-primary me-2" />
        <span className="fs-14">Loading history…</span>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted">
        <i className="ti ti-history fs-40 mb-3" style={{ opacity: 0.3 }} />
        <span className="fs-14">No history recorded yet.</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h6 className="fw-semibold mb-0">Activity History</h6>
          <span className="fs-13 text-muted">{total} {total === 1 ? "entry" : "entries"}</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="position-relative">
        {/* Spine line */}
        <div style={{ position: "absolute", left: 17, top: 18, bottom: 18, width: 2, background: "#dee2e6", zIndex: 0 }} />

        {logs.map((log, idx) => {
          const isLast    = idx === logs.length - 1;
          const bgClass   = EVENT_COLOR[log.event] ?? "bg-secondary";
          const iconClass = EVENT_ICON[log.event]  ?? "ti-activity";
          const label     = EVENT_LABEL[log.event] ?? log.event.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

          // Only compute diff rows for events that actually represent field changes
          const diffRows = STATIC_SUMMARY[log.event] !== undefined ? [] : buildDiffRows(log);
          // Skip phantom "updated" entries where nothing visible changed
          if (log.event === "updated" && diffRows.length === 0) return null;

          const actor   = log.user?.name ?? log.user?.email ?? "System";
          const dateObj = new Date(log.created_at);
          const dateStr = dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
          const timeStr = dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

          const summary: string =
            STATIC_SUMMARY[log.event] ??
            (diffRows.length === 1
               ? `${diffRows[0].label} was changed`
               : diffRows.length > 1
                 ? `${diffRows.length} fields updated`
                 : label);

          return (
            <div key={log.id} className={`d-flex gap-3 align-items-center position-relative${isLast ? "" : " mb-4"}`}>
              {/* Icon dot */}
              <div style={{ width: 36, flexShrink: 0, zIndex: 1 }}>
                <div
                  className={`d-flex align-items-center justify-content-center rounded-circle ${bgClass} text-white`}
                  style={{ width: 36, height: 36, fontSize: 15 }}
                >
                  <i className={`ti ${iconClass}`} />
                </div>
              </div>

              {/* Card */}
              <div className="flex-grow-1">
                <div className="card mb-0" style={{ borderRadius: 10, border: "1px solid #e2e5ea" }}>
                  <div className="card-body p-3">

                    {/* Top row */}
                    <div className="d-flex align-items-start justify-content-between mb-2 flex-wrap gap-1">
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span className={`badge ${bgClass} fs-12`}>{label}</span>
                        <span className="fs-14 fw-medium text-dark">{summary}</span>
                      </div>
                      <div className="text-end flex-shrink-0">
                        <div className="fs-13 fw-medium text-muted">{dateStr}</div>
                        <div className="fs-12 text-muted">{timeStr}</div>
                      </div>
                    </div>

                    {/* Actor */}
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span
                        className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light text-muted fw-semibold flex-shrink-0"
                        style={{ width: 26, height: 26, fontSize: 12 }}
                      >
                        {actor.charAt(0).toUpperCase()}
                      </span>
                      <span className="fs-13 text-muted">{actor}</span>
                      {log.ip_address && (
                        <span className="fs-12 text-muted ms-1">· {log.ip_address}</span>
                      )}
                    </div>

                    {/* Changed fields — shown for any event that has diff rows */}
                    {diffRows.length > 0 && (
                      <div className="mt-2 border-top pt-2">
                        {diffRows.map(row => {
                          // access_users — special display
                          if (row.key === "access_users") {
                            return (
                              <div key={row.key} className="d-flex align-items-center gap-2 py-1">
                                <span className="fs-13 text-muted" style={{ minWidth: 160 }}>{row.label}</span>
                                <span className="badge badge-soft-primary fs-12">Updated</span>
                              </div>
                            );
                          }
                          const hasOld = row.oldVal !== null && row.oldVal !== undefined && row.oldVal !== "";
                          return (
                            <div key={row.key} className="d-flex align-items-center gap-2 py-1 flex-wrap">
                              <span className="fs-13 text-muted" style={{ minWidth: 160 }}>{row.label}</span>
                              {hasOld && (
                                <>
                                  <span className="fs-13 text-danger text-decoration-line-through">
                                    {fmtAuditVal(row.key, row.oldVal)}
                                  </span>
                                  <i className="ti ti-arrow-right fs-12 text-muted" />
                                </>
                              )}
                              <span className="fs-13 text-success fw-medium">
                                {fmtAuditVal(row.key, row.newVal)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="d-flex align-items-center justify-content-between mt-4 pt-3 border-top">
          <button
            type="button"
            className="btn btn-sm btn-outline-light shadow"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            <i className="ti ti-chevron-left me-1" />Prev
          </button>
          <span className="fs-13 text-muted">Page {page} of {lastPage}</span>
          <button
            type="button"
            className="btn btn-sm btn-outline-light shadow"
            disabled={page >= lastPage}
            onClick={() => setPage(p => p + 1)}
          >
            Next<i className="ti ti-chevron-right ms-1" />
          </button>
        </div>
      )}
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
const LocationOverview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const numId = Number(id);

  // All locations (tree)
  const [allLocations, setAllLocations] = useState<LocationListItem[]>([]);
  const [treeLoading, setTreeLoading]   = useState(true);

  // Selected location detail
  const [location, setLocation] = useState<Record<string, any> | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  // UI state
  const [expanded,   setExpanded]   = useState<Set<number>>(new Set());
  const [treeSearch, setTreeSearch] = useState("");
  const [activeTab,  setActiveTab]  = useState("overview");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger"; message: string }>({
    show: false, type: "success", message: "",
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (type: "success" | "danger", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // Load all locations once
  useEffect(() => {
    fetchLocations().then(res => {
      if (res.success) setAllLocations(res.data);
      setTreeLoading(false);
    });
  }, []);

  // Auto-expand ancestors + selected node when ID or tree data changes
  useEffect(() => {
    if (!numId || allLocations.length === 0) return;
    const ancestors = getAncestorIds(allLocations, numId);
    setExpanded(prev => new Set([...prev, numId, ...ancestors]));
  }, [numId, allLocations]);

  // Load selected location detail
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetchLocation(numId).then(res => {
      if (res.success) setLocation((res as any).data);
      else setError((res as any).message ?? "Failed to load location.");
      setLoading(false);
    });
  }, [id]);

  // Build tree
  const tree = useMemo(() => buildTree(allLocations), [allLocations]);

  // Tree search visible IDs
  const visibleTreeIds = useMemo<Set<number> | null>(() => {
    if (!treeSearch.trim()) return null;
    const q = treeSearch.toLowerCase();
    const byId = new Map(allLocations.map(l => [l.id, l]));
    const visible = new Set<number>();
    for (const loc of allLocations) {
      if (loc.name.toLowerCase().includes(q)) {
        visible.add(loc.id);
        let cur: LocationListItem | undefined = loc;
        while (cur?.parent_id) { visible.add(cur.parent_id); cur = byId.get(cur.parent_id); }
      }
    }
    return visible;
  }, [treeSearch, allLocations]);

  const toggleExpand = (nodeId: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId);
      return next;
    });
  };

  const renderTree = (nodes: TreeNode[], depth = 0): JSX.Element[] =>
    nodes.flatMap(node => {
      if (visibleTreeIds && !visibleTreeIds.has(node.id)) return [];
      const isExpanded = expanded.has(node.id);
      return [
        <TreeRow
          key={node.id}
          node={node}
          depth={depth}
          isSelected={node.id === numId}
          isExpanded={isExpanded}
          onToggle={toggleExpand}
          onNavigate={id => navigate(`/locations/${id}`)}
        />,
        ...(isExpanded && node.children.length > 0 ? renderTree(node.children, depth + 1) : []),
      ];
    });

  // Compute depth level of selected location
  const locationLevel = useMemo(() => {
    if (!numId || allLocations.length === 0) return 1;
    return getAncestorIds(allLocations, numId).length + 1;
  }, [numId, allLocations]);

  // Delete handler
  const handleDelete = async () => {
    setDeleting(true);
    const res = await destroyLocation(numId);
    setDeleting(false);
    setShowDeleteModal(false);
    if (res.success) {
      showToast("success", "Location deleted.");
      setTimeout(() => navigate(route.locations), 800);
    } else {
      showToast("danger", (res as any).message ?? "Failed to delete location.");
    }
  };

  return (
    <>
      <style>{`
        .loc-tree-row { transition: background .12s; user-select: none; }
        .loc-tree-row:hover { background: #f8fafc; }
        .loc-tree-row--active { background: #eff6ff; border-left: 3px solid #3b82f6; }
        .loc-tree-row--active:hover { background: #dbeafe; }
        .loc-tab-btn { background: none; border: none; padding: 10px 14px; font-size: 14px; color: #64748b; border-bottom: 2px solid transparent; font-weight: 500; cursor: pointer; white-space: nowrap; }
        .loc-tab-btn.active { color: #E41F3B; border-bottom-color: #E41F3B; }
        .loc-tab-btn:hover:not(.active) { color: #1e293b; }
      `}</style>

      {/*
        Same viewport-filling pattern as itemOverview:
        - page-wrapper fills exactly the space below the top navbar
        - left panel hidden on mobile / tablet (d-none d-xl-flex)
        - right panel independently scrollable
      */}
      <div
        className="page-wrapper"
        style={{ height: "calc(100vh - 57px)", minHeight: "unset", overflow: "hidden", display: "flex", flexDirection: "column" }}
      >

        {/* ── Page header — always visible, never scrolls away ──────────────── */}
        <div style={{ padding: "1.25rem", flexShrink: 0, borderBottom: "1px solid #dee2e6" }}>
          <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
            <div>
              <h4 className="mb-1">Locations</h4>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0 p-0">
                  <li className="breadcrumb-item">
                    <Link to={route.dealsDashboard}>Home</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to={route.locations}>Locations</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    {location?.name ?? "…"}
                  </li>
                </ol>
              </nav>
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              <div className="dropdown">
                <button
                  type="button"
                  className="btn btn-primary d-flex align-items-center gap-1 fs-14 dropdown-toggle"
                  data-bs-toggle="dropdown"
                >
                  <i className="ti ti-plus fs-14" />
                  <span className="d-none d-sm-inline">Create Location</span>
                  <span className="d-sm-none">New</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to={route.addLocation}>
                      <i className="ti ti-building me-2" />New Business Location
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to={route.addLocation}>
                      <i className="ti ti-building-warehouse me-2" />New Warehouse Location
                    </Link>
                  </li>
                </ul>
              </div>
              <Link
                to="#"
                className="btn btn-icon btn-outline-light shadow"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                data-bs-title="Refresh"
                aria-label="Refresh"
                onClick={e => { e.preventDefault(); window.location.reload(); }}
              >
                <i className="ti ti-refresh" />
              </Link>
              <Link
                to={route.locations}
                className="btn btn-icon btn-outline-light shadow"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                data-bs-title="Close"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Two-pane shell ────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* ── LEFT: Tree panel — hidden on mobile/tablet, visible xl+ ──── */}
          <div
            className="d-none d-xl-flex flex-column border-end"
            style={{ width: 340, minWidth: 340, flexShrink: 0, background: "#fff" }}
          >
            {/* Search + filter */}
            <div className="p-3 d-flex align-items-center gap-2" style={{ borderBottom: "1px solid #dee2e6", flexShrink: 0 }}>
              <div className="flex-grow-1 position-relative">
                <span
                  className="position-absolute"
                  style={{ left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", zIndex: 1 }}
                >
                  <i className="ti ti-search text-muted fs-14" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: 34 }}
                  placeholder="Search location"
                  value={treeSearch}
                  onChange={e => setTreeSearch(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn btn-outline-light d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 38, height: 38, padding: 0 }}
              >
                <i className="ti ti-adjustments-horizontal text-muted fs-16" />
              </button>
            </div>

            {/* Tree list */}
            <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
              {treeLoading ? (
                <div className="d-flex align-items-center justify-content-center py-5 text-muted">
                  <span className="spinner-border spinner-border-sm me-2" />
                  Loading…
                </div>
              ) : allLocations.length === 0 ? (
                <div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted">
                  <i className="ti ti-building-off fs-36 mb-2" style={{ opacity: 0.4 }} />
                  <span className="fs-13">No locations found</span>
                </div>
              ) : (
                renderTree(tree)
              )}
            </div>

          </div>

          {/* ── RIGHT: Detail panel — full width on mobile, flex-1 on xl+ ── */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", background: "#fff", minWidth: 0 }}>

            {loading ? (
              <div className="d-flex align-items-center justify-content-center flex-grow-1" style={{ minHeight: 300 }}>
                <span className="spinner-border spinner-border-sm me-2 text-primary" />
                <span className="text-muted">Loading location…</span>
              </div>
            ) : error || !location ? (
              <div className="p-4">
                <div className="alert alert-danger">{error ?? "Location not found."}</div>
                <Link to={route.locations} className="btn btn-outline-light">
                  <i className="ti ti-arrow-left me-1" /> Back to Locations
                </Link>
              </div>
            ) : (
              <>
                {/* Detail header */}
                <div className="px-3 px-md-4 pt-3 pb-3" style={{ borderBottom: "1px solid #dee2e6", flexShrink: 0 }}>
                  <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
                    <div className="d-flex align-items-center gap-3">
                      {/* Logo / icon */}
                      <div
                        className="border rounded d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                        style={{ width: 48, height: 48, background: "#f8fafc" }}
                      >
                        {location.logo_path
                          ? <img src={`/storage/${location.logo_path}`} alt={location.name}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <i className="ti ti-building fs-22 text-muted" />}
                      </div>
                      <div>
                        <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                          <h5 className="mb-0 fw-bold fs-16">{location.name}</h5>
                          <span className={`badge fs-12 ${location.is_active ? "badge-soft-success" : "badge-soft-danger"}`}>
                            {location.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span className="badge badge-soft-secondary fs-12 fw-normal">
                            Type: {location.type === "business" ? "Business" : "Warehouse"}
                          </span>
                          <span className="text-muted fs-13">Level: {locationLevel}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="dropdown flex-shrink-0">
                      <button
                        type="button"
                        className="btn btn-outline-light d-flex align-items-center gap-1 dropdown-toggle"
                        data-bs-toggle="dropdown"
                      >
                        Actions
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <Link className="dropdown-item d-flex align-items-center gap-2" to={`/locations/${id}/edit`}>
                            <i className="ti ti-edit fs-14" /> Edit Location
                          </Link>
                        </li>
                        <li>
                          <Link
                            className="dropdown-item d-flex align-items-center gap-2"
                            to={route.addLocation}
                            state={{ parentId: location.id, parentName: location.name }}
                          >
                            <i className="ti ti-plus fs-14" /> Add Child Location
                          </Link>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button
                            className="dropdown-item d-flex align-items-center gap-2 text-danger w-100"
                            onClick={() => setShowDeleteModal(true)}
                          >
                            <i className="ti ti-trash fs-14" /> Delete Location
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Tabs — horizontally scrollable on small screens */}
                <div style={{ borderBottom: "1px solid #dee2e6", overflowX: "auto", flexShrink: 0 }}>
                  <div className="d-flex px-2" style={{ whiteSpace: "nowrap" }}>
                    {TABS.map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        className={`loc-tab-btn${activeTab === tab.id ? " active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab content */}
                <div className="p-3 p-md-4" style={{ flex: 1 }}>
                  {activeTab === "overview" && <OverviewTab location={location} />}
                  {activeTab === "history"  && <HistoryTab locationId={numId} />}
                </div>

                {/* Last updated + footer */}
                <div className="px-3 px-md-4 py-2" style={{ borderTop: "1px solid #dee2e6", flexShrink: 0 }}>
                  <span className="text-muted fs-14">
                    Last updated on {fmtDate(location.updated_at ?? location.created_at, true)}
                  </span>
                </div>
              </>
            )}

          </div>
        </div>
        <Footer />
      </div>

      {/* ── Delete confirmation modal ──────────────────────────────────────── */}
      {showDeleteModal && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,.4)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header px-4 py-3">
                <h5 className="modal-title fw-semibold">Delete Location</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)} />
              </div>
              <div className="modal-body px-4 py-3">
                <p className="fs-14 text-muted mb-0">
                  Are you sure you want to delete <strong>{location?.name}</strong>?
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer px-4 py-3 justify-content-start gap-2">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting
                    ? <><span className="spinner-border spinner-border-sm me-1" />Deleting…</>
                    : "Delete"}
                </button>
                <button type="button" className="btn btn-outline-light" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
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
            pointerEvents: "auto", borderRadius: 12,
            boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
            border: "none", minWidth: 320, background: "#fff",
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

export default LocationOverview;
