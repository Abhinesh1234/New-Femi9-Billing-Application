import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useLocation as useRouterLocation } from "react-router";
import { Toast } from "react-bootstrap";
import Footer from "../../../../components/footer/footer";
import {
  destroyLocation,
  restoreLocation,
  setPrimaryLocation,
  type LocationListItem,
} from "../../../../core/services/locationApi";
import { type AuditLogEntry } from "../../../../core/services/auditLogApi";
import {
  readLocationList,
  readLocationDetail,
  readLocationAuditLogs,
  getLocationList,
  getLocationDetail,
  getLocationAuditLogs,
  bustLocation,
  bustAllLocationCache,
  hydrateLocationList,
  hydrateLocationDetail,
} from "../../../../core/cache/locationCache";
import { emitMutation, onMutation } from "../../../../core/cache/mutationEvents";
import { all_routes } from "../../../../routes/all_routes";

const route = all_routes;

type Tab = "overview" | "history";

// ── Code → label lookup maps (mirrors location.tsx form options) ──────────────
const COUNTRY_LABELS: Record<string, string> = {
  IN: "India", US: "United States", GB: "United Kingdom",
  AE: "United Arab Emirates", SG: "Singapore",
};

const STATE_LABELS: Record<string, string> = {
  AN: "Andaman and Nicobar Islands", AP: "Andhra Pradesh", AR: "Arunachal Pradesh",
  AS: "Assam", BR: "Bihar", CH: "Chandigarh", CT: "Chhattisgarh", DL: "Delhi",
  GA: "Goa", GJ: "Gujarat", HR: "Haryana", HP: "Himachal Pradesh",
  JK: "Jammu and Kashmir", JH: "Jharkhand", KA: "Karnataka", KL: "Kerala",
  LA: "Ladakh", MP: "Madhya Pradesh", MH: "Maharashtra", MN: "Manipur",
  ML: "Meghalaya", MZ: "Mizoram", NL: "Nagaland", OR: "Odisha", PB: "Punjab",
  PY: "Puducherry", RJ: "Rajasthan", SK: "Sikkim", TN: "Tamil Nadu",
  TG: "Telangana", TR: "Tripura", UP: "Uttar Pradesh", UK: "Uttarakhand",
  WB: "West Bengal",
  CA: "California", NY: "New York", TX: "Texas",
  ENG: "England", SCT: "Scotland", WLS: "Wales",
  DXB: "Dubai", AUH: "Abu Dhabi",
};

const decodeState   = (code?: string) => (code ? STATE_LABELS[code]   ?? code : undefined);
const decodeCountry = (code?: string) => (code ? COUNTRY_LABELS[code] ?? code : undefined);

interface TreeNode { location: LocationListItem; children: TreeNode[]; }

function collectDescendants(all: LocationListItem[], rootId: number): Set<number> {
  const ids = new Set<number>([rootId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const l of all) {
      if (l.parent_id && ids.has(l.parent_id) && !ids.has(l.id)) {
        ids.add(l.id); changed = true;
      }
    }
  }
  return ids;
}

type ListFilter = "all" | "active" | "deleted";

// ── Confirmation dialog ────────────────────────────────────────────────────────
interface ConfirmConfig {
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm: () => Promise<void>;
}

function ConfirmDialog({
  config,
  onClose,
}: {
  config: ConfirmConfig | null;
  onClose: () => void;
}) {
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
      style={{
        position: "fixed", inset: 0, zIndex: 1060,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)",
      }}
      onClick={e => { if (e.target === e.currentTarget && !busy) onClose(); }}
    >
      <div
        style={{
          background: "#fff", borderRadius: 14, padding: "32px 28px 24px",
          width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
        }}
      >
        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: config.iconBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 16,
        }}>
          <i className={`ti ${config.icon}`} style={{ fontSize: 24, color: config.iconColor }} />
        </div>

        {/* Title */}
        <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 16, color: "#0f172a", textAlign: "center" }}>
          {config.title}
        </p>

        {/* Message */}
        <p style={{ margin: "0 0 24px", fontSize: 13.5, color: "#64748b", textAlign: "center", lineHeight: 1.55 }}>
          {config.message}
        </p>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <button
            className="btn btn-light flex-grow-1"
            style={{ fontWeight: 500, fontSize: 14, height: 44 }}
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
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

// ── Location info row (2-col grid inside the Location Information card) ───────
function LocInfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="d-flex align-items-center px-4 py-2">
      <span className="text-muted fs-14 flex-shrink-0" style={{ width: "45%" }}>{label}</span>
      <span className="fs-14 fw-medium">{value}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
const LocationOverview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const navState = useRouterLocation().state as { tab?: Tab } | null;

  const [location, setLocation] = useState<LocationListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(navState?.tab ?? "overview");

  // ── Locations list (left panel) ──
  const [allLocations, setAllLocations] = useState<LocationListItem[]>([]);
  const [listSearch, setListSearch] = useState("");
  const [listFilter, setListFilter] = useState<ListFilter>("all");
  const [deletedLocations, setDeletedLocations] = useState<LocationListItem[]>([]);
  const [deletedLoading, setDeletedLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // ── Audit log (history tab) ──
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const [auditLastPage, setAuditLastPage] = useState(1);
  const [auditTotal, setAuditTotal] = useState(0);

  // ── Left panel scroll ──
  const activeItemRef = useRef<HTMLDivElement>(null);
  // Increments on every id change — responses from previous fetches are discarded
  const detailFetchRef = useRef(0);

  // ── Confirmation dialog ──
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  // ── Toast ──
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger"; message: string }>({
    show: false, type: "success", message: "",
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (type: "success" | "danger", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // ── Soft refresh ──
  const [refreshing, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);

  const handleRefresh = useCallback(async () => {
    if (!id || refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);

    try {
      const numId = Number(id);
      bustAllLocationCache();

      const fetches: Promise<void>[] = [
        getLocationList()
          .then(data => setAllLocations(data))
          .catch(() => showToast("danger", "Failed to reload locations list.")),
        getLocationDetail(numId)
          .then(data => { setLocation(data); setError(null); })
          .catch(() => showToast("danger", "Failed to reload location.")),
      ];

      if (listFilter === "deleted") {
        fetches.push(
          getLocationList(true)
            .then(data => setDeletedLocations(data))
            .catch(() => {})
        );
      }

      if (activeTab === "history") {
        fetches.push(
          getLocationAuditLogs(numId, auditPage)
            .then(entry => {
              setAuditLogs(entry.logs);
              setAuditLastPage(entry.lastPage);
              setAuditTotal(entry.total);
            })
            .catch(() => showToast("danger", "Failed to reload history."))
        );
      }

      await Promise.all(fetches);
    } catch {
      showToast("danger", "Network error during refresh. Please try again.");
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }, [id, listFilter, activeTab, auditPage]);

  // Reload when any page mutates location data
  useEffect(() => onMutation("locations:mutated", handleRefresh), [handleRefresh]);

  // Fetch current location detail — counter guards against stale responses from rapid navigation
  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    const token = ++detailFetchRef.current;

    const cached = readLocationDetail(numId);
    if (cached) {
      if (token !== detailFetchRef.current) return;
      setLocation(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    getLocationDetail(numId)
      .then(data => {
        if (token !== detailFetchRef.current) return;
        setLocation(data);
        setLoading(false);
      })
      .catch((e: Error) => {
        if (token !== detailFetchRef.current) return;
        setError(e.message ?? "Failed to load location.");
        setLoading(false);
      });
  }, [id]);

  // Fetch all locations for the left panel — served from TTL cache on remounts
  useEffect(() => {
    const cached = readLocationList();
    if (cached) { setAllLocations(cached); return; }
    getLocationList()
      .then(data => setAllLocations(data))
      .catch(() => showToast("danger", "Network error loading locations list."));
  }, []);

  // Load audit logs — cached per (locationId, page), no re-fetch on repeated tab switches
  useEffect(() => {
    if (activeTab !== "history" || !id) return;
    const numId = Number(id);

    const cached = readLocationAuditLogs(numId, auditPage);
    if (cached) {
      setAuditLogs(cached.logs);
      setAuditLastPage(cached.lastPage);
      setAuditTotal(cached.total);
      return;
    }

    setAuditLoading(true);
    getLocationAuditLogs(numId, auditPage)
      .then(entry => {
        setAuditLogs(entry.logs);
        setAuditLastPage(entry.lastPage);
        setAuditTotal(entry.total);
        setAuditLoading(false);
      })
      .catch(() => {
        setAuditLoading(false);
        showToast("danger", "Network error loading activity history.");
      });
  }, [activeTab, id, auditPage]);

  // Scroll active location into view in left panel
  useEffect(() => {
    const timer = setTimeout(() => {
      activeItemRef.current?.scrollIntoView({ block: "center", behavior: "instant" });
    }, 50);
    return () => clearTimeout(timer);
  }, [id, allLocations]);

  // Reset audit page when id changes
  useEffect(() => {
    setAuditPage(1);
  }, [id]);

  // Lazy-fetch deleted (trashed) locations when filter switches to "deleted"
  useEffect(() => {
    if (listFilter !== "deleted") return;
    const cached = readLocationList(true);
    if (cached) { setDeletedLocations(cached); return; }
    setDeletedLoading(true);
    getLocationList(true)
      .then(data => { setDeletedLocations(data); setDeletedLoading(false); })
      .catch(() => setDeletedLoading(false));
  }, [listFilter]);

  // Navigate to first item in the new view when the filter changes
  const pendingDeletedNav = useRef(false);
  useEffect(() => {
    if (listFilter === "deleted") {
      if (deletedLocations.length > 0) {
        navigate(`/locations/${deletedLocations[0].id}`);
      } else {
        // Still loading — set flag so the load-complete effect can navigate
        pendingDeletedNav.current = true;
      }
    } else {
      const base = listFilter === "active"
        ? allLocations.filter(l => l.is_active)
        : allLocations;
      if (base.length > 0) navigate(`/locations/${base[0].id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listFilter]);

  // Once deleted locations finish loading, navigate to first — only if triggered by a filter switch
  useEffect(() => {
    if (!pendingDeletedNav.current) return;
    if (listFilter === "deleted" && !deletedLoading && deletedLocations.length > 0) {
      pendingDeletedNav.current = false;
      navigate(`/locations/${deletedLocations[0].id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedLocations, deletedLoading]);

  const treeBase = useMemo(
    () => listFilter === "active" ? allLocations.filter(l => l.is_active) : allLocations,
    [allLocations, listFilter]
  );

  const tree = useMemo((): TreeNode[] => {
    const map = new Map<number, TreeNode>();
    treeBase.forEach(l => map.set(l.id, { location: l, children: [] }));
    const roots: TreeNode[] = [];
    map.forEach(node => {
      const l = node.location;
      if (l.parent_id && map.has(l.parent_id)) map.get(l.parent_id)!.children.push(node);
      else roots.push(node);
    });
    return roots;
  }, [treeBase]);

  const filteredFlatLocations = useMemo(() => {
    if (!listSearch.trim()) return null;
    const q = listSearch.toLowerCase();
    const base = listFilter === "deleted" ? deletedLocations : treeBase;
    return base.filter(l => l.name.toLowerCase().includes(q));
  }, [treeBase, deletedLocations, listSearch, listFilter]);

  // Auto-expand all parents that have children (must be before early returns)
  useEffect(() => {
    if (allLocations.length === 0) return;
    const withChildren = new Set<number>();
    allLocations.forEach(l => { if (l.parent_id) withChildren.add(l.parent_id); });
    setExpandedIds(withChildren);
  }, [allLocations]);

  const fmt = (val: any) =>
    val === null || val === undefined || val === "" ? "—" : String(val);

  // ── Handle Make Primary ──
  const executeMakePrimary = async () => {
    if (!id) return;
    const res = await setPrimaryLocation(Number(id));
    if (res.success) {
      const updated = allLocations.map(l => ({ ...l, is_primary: l.id === Number(id) }));
      setLocation(prev => prev ? { ...prev, is_primary: true } : prev);
      setAllLocations(updated);
      hydrateLocationList(updated);
      emitMutation("locations:mutated");
      showToast("success", "Location set as primary.");
    } else {
      showToast("danger", (res as any).message ?? "Failed to set primary.");
    }
  };

  const handleMakePrimary = () => {
    if (!id || location?.is_primary) return;
    setConfirmConfig({
      icon: "ti-star",
      iconColor: "#f59e0b",
      iconBg: "#fef3c7",
      title: "Set as Primary Location?",
      message: `"${location?.name}" will become the primary location. The current primary will be unset.`,
      confirmLabel: "Set Primary",
      confirmColor: "#f59e0b",
      onConfirm: executeMakePrimary,
    });
  };

  // ── Handle Delete (shared by the Actions dropdown and the left-panel 3-dot menu) ──
  const executeDelete = async (targetId: number) => {
    const res = await destroyLocation(targetId);
    if (!res.success) {
      showToast("danger", (res as any).message ?? "Failed to delete location.");
      return;
    }

    // Remove the deleted location and every descendant from state immediately
    const toRemove = collectDescendants(allLocations, targetId);
    const updated   = allLocations.filter(l => !toRemove.has(l.id));
    setAllLocations(updated);

    // Bust detail + audit for each removed location
    for (const removedId of toRemove) bustLocation(removedId);
    // Bust parent's audit too — backend writes a child_deleted entry there
    const deletedLoc = allLocations.find(l => l.id === targetId);
    if (deletedLoc?.parent_id) bustLocation(deletedLoc.parent_id);

    // Add deleted records to the deleted locations list immediately
    const removedItems = allLocations.filter(l => toRemove.has(l.id));
    const withTimestamp = removedItems.map(l => ({ ...l, deleted_at: new Date().toISOString() }));
    const newDeleted = [...withTimestamp, ...deletedLocations.filter(l => !toRemove.has(l.id))];
    setDeletedLocations(newDeleted);

    // Hydrate both list caches with the known-correct data
    hydrateLocationList(updated);
    hydrateLocationList(newDeleted, true);
    emitMutation("locations:mutated");
    showToast("success", "Location deleted.");

    // If the currently viewed location was among those deleted, navigate away
    if (toRemove.has(Number(id))) {
      const parentId  = location?.parent?.id;
      const fallback  = updated[0];
      const destination = parentId
        ? `/locations/${parentId}`
        : fallback
          ? `/locations/${fallback.id}`
          : route.locations;
      setTimeout(() => navigate(destination), 600);
    }
  };

  const deleteLocation = (targetId: number) => {
    const target = allLocations.find(l => l.id === targetId);
    const childCount = collectDescendants(allLocations, targetId).size - 1;
    const extra = childCount > 0
      ? ` This will also delete ${childCount} sub-location${childCount > 1 ? "s" : ""}.`
      : "";
    setConfirmConfig({
      icon: "ti-trash",
      iconColor: "#e03131",
      iconBg: "#fff0f0",
      title: "Delete Location?",
      message: `"${target?.name ?? "This location"}" will be soft-deleted and can be restored later.${extra}`,
      confirmLabel: "Delete",
      confirmColor: "#e03131",
      onConfirm: () => executeDelete(targetId),
    });
  };

  // ── Handle Restore ──
  const executeRestore = async (targetId: number) => {
    const res = await restoreLocation(targetId);
    if (!res.success) {
      showToast("danger", (res as any).message ?? "Failed to restore location.");
      return;
    }
    const restored   = (res as any).data as LocationListItem;
    const restoredIds: number[] = (res as any).restored_ids ?? [targetId];
    const restoredSet = new Set(restoredIds);

    // Remove every restored ID from deleted list, add them to active list
    const fromDeleted = deletedLocations.filter(l => restoredSet.has(l.id));
    const newDeleted  = deletedLocations.filter(l => !restoredSet.has(l.id));
    setDeletedLocations(newDeleted);

    const reactivated = fromDeleted.map(l => ({ ...l, deleted_at: null }));
    // Ensure the primary record is present even if it wasn't in deletedLocations state yet
    const alreadyHave = new Set(reactivated.map(l => l.id));
    if (!alreadyHave.has(restored.id)) reactivated.push({ ...restored, deleted_at: null });

    const newActive = [...allLocations, ...reactivated];
    setAllLocations(newActive);

    // Bust detail + audit for all restored IDs and the parent
    for (const rid of restoredIds) bustLocation(rid);
    if (restored.parent_id) bustLocation(restored.parent_id);

    // Hydrate both list caches with known-correct data
    hydrateLocationList(newActive);
    hydrateLocationList(newDeleted, true);
    emitMutation("locations:mutated");
    showToast("success", "Location restored.");

    const remainingDeleted = deletedLocations.filter(l => !restoredSet.has(l.id));
    if (listFilter === "deleted" && remainingDeleted.length === 0) {
      setListFilter("active");
    } else {
      navigate(`/locations/${targetId}`);
    }
  };

  const handleRestore = (targetId: number) => {
    const target = deletedLocations.find(l => l.id === targetId);
    setConfirmConfig({
      icon: "ti-refresh",
      iconColor: "#2f9e44",
      iconBg: "#ebfbee",
      title: "Restore Location?",
      message: `"${target?.name ?? "This location"}" and any deleted sub-locations will be restored and made active again.`,
      confirmLabel: "Restore",
      confirmColor: "#2f9e44",
      onConfirm: () => executeRestore(targetId),
    });
  };

  // ── Loading / Error ──
  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
          <span className="spinner-border spinner-border-sm me-2 text-primary" />
          <span className="text-muted">Loading location…</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="alert alert-danger">{error ?? "Location not found."}</div>
          <Link to={route.locations} className="btn btn-outline-light">
            <i className="ti ti-arrow-left me-1" /> Back to Locations
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "history",  label: "History"  },
  ];

  const logoSrc = location.logo_path ? `/storage/${location.logo_path}` : null;

  const toggleExpand = (locId: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(locId) ? next.delete(locId) : next.add(locId);
      return next;
    });
  };

  const renderTreeNodes = (nodes: TreeNode[], depth: number): React.ReactNode =>
    nodes.map((node, idx) => {
      const loc         = node.location;
      const isActive    = String(loc.id) === id;
      const isExpanded  = expandedIds.has(loc.id);
      const hasChildren = node.children.length > 0;
      const locLogo     = loc.logo_path ? `/storage/${loc.logo_path}` : null;
      const indent      = 12 + depth * 28;
      const isLast      = idx === nodes.length - 1;
      // x-position of this node's circle center (used for connector lines)
      const lineX       = indent + 4;

      return (
        <div key={loc.id} style={{ position: "relative" }}>

          {/* ── Row ── rendered first so its background sits below the connector lines */}
          <div
            ref={isActive ? activeItemRef : undefined}
            className="d-flex align-items-center gap-2"
            style={{
              paddingLeft: indent, paddingRight: 10,
              paddingTop: 11, paddingBottom: 11,
              cursor: "pointer",
              background: isActive ? "#fff1f0" : "transparent",
              borderBottom: "1px solid #f5f5f5",
              position: "relative",
            }}
            onClick={() => navigate(`/locations/${loc.id}`)}
            onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "#f8f9fa"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = isActive ? "#fff1f0" : "transparent"; }}
          >
            {depth === 0 ? (
              /* Expand/collapse chevron for root nodes */
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleExpand(loc.id); }}
                style={{ width: 20, height: 20, flexShrink: 0, background: "none", border: "none", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                {hasChildren
                  ? <i className={`ti ${isExpanded ? "ti-chevron-down" : "ti-chevron-right"} text-muted`} style={{ fontSize: 12 }} />
                  : <span style={{ width: 20, display: "inline-block" }} />}
              </button>
            ) : (
              /* Circle dot — zIndex: 1 so it paints above the connector lines */
              <div style={{
                width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                border: `1.5px solid ${isActive ? "#e03131" : "#ced4da"}`,
                background: isActive ? "#e03131" : "#fff",
                position: "relative", zIndex: 1,
              }} />
            )}

            {/* Icon */}
            <div className="rounded border d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 28, height: 28, background: "#f5f5f5" }}>
              {locLogo
                ? <img src={locLogo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 2 }} />
                : <i className={`ti ${loc.type === "warehouse" ? "ti-building-warehouse" : "ti-building"} text-muted`} style={{ fontSize: 12 }} />
              }
            </div>

            {/* Name */}
            <span className="flex-grow-1 text-truncate" style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? "#e03131" : "#212529" }}>
              {loc.name}
            </span>

            {/* Primary star */}
            {loc.is_primary && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            )}

            {/* Three-dot actions */}
            <div className="dropdown" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="btn p-0 d-flex align-items-center justify-content-center text-muted"
                style={{ width: 22, height: 22, background: "none", border: "none" }} data-bs-toggle="dropdown">
                <i className="ti ti-dots-vertical" style={{ fontSize: 14 }} />
              </button>
              <div className="dropdown-menu dropdown-menu-end dropmenu-hover-primary">
                <ul>
                  <li><button className="dropdown-item fs-13" onClick={() => navigate(`/locations/${loc.id}/edit`)}><i className="ti ti-pencil me-2" />Edit</button></li>
                  <li><button className="dropdown-item fs-13" onClick={() => navigate(route.addLocation, { state: { parentId: loc.id, parentName: loc.name } })}><i className="ti ti-plus me-2" />Add Sub-Location</button></li>
                  <li><hr className="dropdown-divider m-1" /></li>
                  <li><button className="dropdown-item fs-13 text-danger" onClick={() => deleteLocation(loc.id)}><i className="ti ti-trash me-2" />Delete</button></li>
                </ul>
              </div>
            </div>
          </div>

          {/* ── Children ── */}
          {hasChildren && isExpanded && renderTreeNodes(node.children, depth + 1)}

          {/* ── Connector lines — rendered LAST so they paint above the row's hover background ── */}
          {depth > 0 && (
            <>
              {/* Upper stub: top of wrapper → circle center */}
              <div style={{ position: "absolute", left: lineX, top: 0, height: 25, width: 1.5, background: "#dee2e6", pointerEvents: "none" }} />
              {/* Lower continuation: circle center → bottom (through any expanded children), non-last siblings only */}
              {!isLast && (
                <div style={{ position: "absolute", left: lineX, top: 25, bottom: 0, width: 1.5, background: "#dee2e6", pointerEvents: "none" }} />
              )}
            </>
          )}
        </div>
      );
    });

  return (
    <>
    <div
      className="page-wrapper"
      style={{ height: "calc(100vh - 57px)", minHeight: "unset", overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      {/* ═══ Two-pane shell ═════════════════════════════════════════════════════ */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Left: Locations tree panel ────────────────────────────────────── */}
        <div
          className="d-none d-xl-flex"
          style={{ width: 340, minWidth: 340, flexDirection: "column", borderRight: "1px solid #dee2e6", background: "#fff", overflow: "hidden" }}
        >
          {/* Search bar + filter */}
          <div className="px-3 py-3" style={{ borderBottom: "1px solid #dee2e6", flexShrink: 0 }}>
            <div className="d-flex align-items-center gap-2">
              <div className="input-group flex-grow-1">
                <span className="input-group-text border-end-0 bg-white">
                  <i className="ti ti-search text-muted fs-13" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search location…"
                  value={listSearch}
                  onChange={(e) => setListSearch(e.target.value)}
                />
                {listSearch && (
                  <button type="button" className="btn btn-sm btn-outline-light border-start-0" onClick={() => setListSearch("")}>
                    <i className="ti ti-x fs-12 text-muted" />
                  </button>
                )}
              </div>

              {/* Filter dropdown */}
              <div className="dropdown flex-shrink-0">
                <button
                  type="button"
                  className="btn btn-outline-light d-flex align-items-center justify-content-center"
                  style={{ width: 38, height: 38, position: "relative" }}
                  data-bs-toggle="dropdown"
                  title="Filter"
                >
                  <i className="ti ti-filter fs-14 text-muted" />
                  {listFilter !== "all" && (
                    <span style={{
                      position: "absolute", top: 5, right: 5,
                      width: 7, height: 7, borderRadius: "50%",
                      background: "#e03131", border: "1.5px solid #fff",
                    }} />
                  )}
                </button>
                <div className="dropdown-menu dropdown-menu-end dropmenu-hover-primary" style={{ minWidth: 180 }}>
                  {(["active", "deleted"] as ListFilter[]).map(f => (
                    <button
                      key={f}
                      className="dropdown-item d-flex align-items-center gap-2 fs-13"
                      style={{ fontWeight: listFilter === f ? 600 : 400, color: listFilter === f ? "#e03131" : undefined }}
                      onClick={() => setListFilter(f)}
                    >
                      <i className={`ti ${f === "active" ? "ti-circle-check" : "ti-trash"} fs-13`} />
                      {f === "active" ? "Active Locations" : "Deleted Locations"}
                      {listFilter === f && <i className="ti ti-check ms-auto fs-12" style={{ color: "#e03131" }} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tree / flat search results / deleted list */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {listFilter === "deleted" ? (
              deletedLoading ? (
                <div className="text-center py-4 text-muted fs-13">
                  <span className="spinner-border spinner-border-sm me-2" />Loading…
                </div>
              ) : (filteredFlatLocations ?? deletedLocations).length === 0 ? (
                <div className="text-center py-4 text-muted fs-13">
                  <i className="ti ti-trash d-block fs-24 mb-1" />No deleted locations
                </div>
              ) : (
                (filteredFlatLocations ?? deletedLocations).map(loc => (
                  <div key={loc.id}
                    className="d-flex align-items-center gap-2 px-3"
                    style={{ paddingTop: 11, paddingBottom: 11, borderBottom: "1px solid #f0f2f5", cursor: "pointer" }}
                    onClick={() => navigate(`/locations/${loc.id}`)}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#f8f9fa"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                  >
                    <div className="rounded border d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 28, height: 28, background: "#f5f5f5", opacity: 0.6 }}>
                      <i className={`ti ${loc.type === "warehouse" ? "ti-building-warehouse" : "ti-building"} text-muted`} style={{ fontSize: 12 }} />
                    </div>
                    <span className="flex-grow-1 text-truncate fs-14 text-muted">{loc.name}</span>
                    <button
                      type="button"
                      className="btn btn-sm d-flex align-items-center gap-1 flex-shrink-0"
                      style={{ fontSize: 11, padding: "2px 8px", background: "#fff4f4", color: "#e03131", border: "1px solid #fde8e8", borderRadius: 6 }}
                      onClick={e => { e.stopPropagation(); handleRestore(loc.id); }}
                      title="Restore"
                    >
                      <i className="ti ti-refresh" style={{ fontSize: 11 }} />Restore
                    </button>
                  </div>
                ))
              )
            ) : filteredFlatLocations !== null ? (
              filteredFlatLocations.length === 0 ? (
                <div className="text-center py-4 text-muted fs-13">
                  <i className="ti ti-mood-empty d-block fs-24 mb-1" />No locations found
                </div>
              ) : (
                filteredFlatLocations.map((loc) => {
                  const isActive = String(loc.id) === id;
                  return (
                    <div key={loc.id} onClick={() => navigate(`/locations/${loc.id}`)}
                      className="d-flex align-items-center gap-2 px-3"
                      style={{ paddingTop: 11, paddingBottom: 11, cursor: "pointer", background: isActive ? "#fff1f0" : "transparent", borderBottom: "1px solid #f0f2f5" }}
                      onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "#f8f9fa"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = isActive ? "#fff1f0" : "transparent"; }}
                    >
                      <div className="rounded border d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 28, height: 28, background: "#f5f5f5" }}>
                        <i className={`ti ${loc.type === "warehouse" ? "ti-building-warehouse" : "ti-building"} text-muted`} style={{ fontSize: 12 }} />
                      </div>
                      <span className="flex-grow-1 text-truncate" style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? "#e03131" : "#212529" }}>
                        {loc.name}
                      </span>
                      {loc.is_primary && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      )}
                    </div>
                  );
                })
              )
            ) : tree.length === 0 ? (
              <div className="text-center py-4 text-muted fs-13">
                <i className="ti ti-mood-empty d-block fs-24 mb-1" />No locations found
              </div>
            ) : (
              renderTreeNodes(tree, 0)
            )}
          </div>

        </div>

        {/* ── Right: Location detail (independently scrollable) ─────────────── */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", background: "#fff" }}>
          <div style={{ padding: "1.25rem", flex: 1 }}>

            {/* ── Header ── */}
            <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
              <div className="d-flex align-items-start gap-3">
                {/* Location icon / logo */}
                <div
                  className="rounded border d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                  style={{ width: 56, height: 56, background: "#f5f5f5" }}
                >
                  {logoSrc
                    ? <img src={logoSrc} alt={location.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} />
                    : <i className="ti ti-building fs-24 text-muted" />
                  }
                </div>
                {/* Name + status badge + type/level tags */}
                <div>
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                    <h4 className="fw-bold mb-0 lh-sm">{location.name}</h4>
                    {location.is_primary && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", flexShrink: 0 }}>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    )}
                    {location.deleted_at ? (
                      <span className="badge badge-soft-danger d-inline-flex align-items-center gap-1 fs-12">
                        <i className="ti ti-trash" style={{ fontSize: 10 }} />Deleted
                      </span>
                    ) : (
                      <span className={`badge d-inline-flex align-items-center gap-1 fs-12 ${location.is_active ? "badge-soft-success" : "badge-soft-danger"}`}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: location.is_active ? "#12b76a" : "#ef4444", display: "inline-block" }} />
                        {location.is_active ? "Active" : "Inactive"}
                      </span>
                    )}
                  </div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="badge fs-12" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                      Type: {location.type === "warehouse" ? "Warehouse" : "Business"}
                    </span>
                    <span className="badge fs-12" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                      Level: {location.parent ? "2" : "1"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions / Restore + Close */}
              <div className="d-flex align-items-center gap-2">
              {location.deleted_at ? (
                <button
                  type="button"
                  className="btn btn-outline-light shadow d-flex align-items-center gap-1"
                  style={{ height: 36 }}
                  onClick={() => handleRestore(Number(id))}
                >
                  <i className="ti ti-refresh" style={{ fontSize: 14 }} />Restore
                </button>
              ) : (
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
                    <li>
                      <button className="dropdown-item" onClick={() => navigate(`/locations/${id}/edit`)}>
                        <i className="ti ti-pencil me-2" />Edit
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => navigate(route.addLocation, { state: { parentId: Number(id), parentName: location.name } })}
                      >
                        <i className="ti ti-plus me-2" />Add Sub-Location
                      </button>
                    </li>
                    {!location.is_primary && (
                      <li>
                        <button className="dropdown-item" onClick={handleMakePrimary}>
                          <i className="ti ti-star me-2" />Make Primary
                        </button>
                      </li>
                    )}
                    <li><hr className="dropdown-divider m-1" /></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={() => deleteLocation(Number(id))}>
                        <i className="ti ti-trash me-2" />Delete
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              )}
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
                  onClick={() => navigate(route.locations)}
                  title="Close"
                >
                  <i className="ti ti-x" style={{ fontSize: 16 }} />
                </button>
              </div>
            </div>

            {/* ── Tab nav ── */}
            <div className="mb-4">
              <div
                className="d-inline-flex rounded"
                style={{ background: "#f1f3f5", padding: 4, gap: 2 }}
              >
                {tabs.map((t) => {
                  const isActive = activeTab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setActiveTab(t.key)}
                      style={{
                        padding: "6px 20px",
                        borderRadius: 6,
                        border: "none",
                        background: isActive ? "#fff" : "transparent",
                        color: isActive ? "#e03131" : "#6c757d",
                        fontWeight: isActive ? 600 : 400,
                        fontSize: 14,
                        boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                        transition: "all 0.15s",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Tab: Overview ── */}
            {activeTab === "overview" && (
              <div>

                {/* ── Location Information card ── */}
                <div className="card border mb-3">
                  <div className="card-body p-0">

                    <div className="px-4 py-3 border-bottom">
                      <h6 className="fw-semibold fs-15 mb-0">Location Information</h6>
                    </div>

                    {/* 2-column detail rows */}
                    <div className="row g-0 pt-2 pb-1">
                      {/* Left column */}
                      <div className="col-md-6">
                        <LocInfoRow
                          label="Type"
                          value={
                            <span className={`badge fs-12 ${location.type === "warehouse" ? "badge-soft-secondary" : "badge-soft-primary"}`}>
                              {location.type === "warehouse" ? "Warehouse" : "Business"}
                            </span>
                          }
                        />
                        <LocInfoRow
                          label="Parent Location"
                          value={
                            location.parent
                              ? <Link to={`/locations/${location.parent.id}`} className="text-primary">{location.parent.name}</Link>
                              : "—"
                          }
                        />
                        <LocInfoRow
                          label="Status"
                          value={
                            <span className={`badge fs-12 ${location.is_active ? "badge-soft-success" : "badge-soft-danger"}`}>
                              {location.is_active ? "Active" : "Inactive"}
                            </span>
                          }
                        />
                        <LocInfoRow
                          label="Primary Location"
                          value={location.is_primary ? "Yes" : "No"}
                        />
                      </div>

                      {/* Right column */}
                      <div className="col-md-6">
                        <LocInfoRow label="Phone"      value={fmt(location.address?.phone)} />
                        <LocInfoRow
                          label="Logo"
                          value={
                            location.logo_type === "custom"
                              ? "Custom Logo"
                              : location.logo_type === "org"
                              ? "Organisation Logo"
                              : "—"
                          }
                        />
                        <LocInfoRow label="Created By" value={fmt(location.created_by?.name)} />
                      </div>
                    </div>

                    {/* Full-width bottom row: Created On */}
                    <div className="d-flex align-items-center px-4 py-3 border-top" style={{ background: "#fafafa", borderRadius: "0 0 8px 8px" }}>
                      <span className="text-muted fs-14 flex-shrink-0" style={{ width: "22.5%" }}>Created On</span>
                      <span className="fs-14 fw-medium">
                        {new Date(location.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                        {", "}
                        {new Date(location.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                      </span>
                    </div>

                  </div>
                </div>

                {/* ── Bottom cards: Address + Transaction Series Summary ── */}
                <div className="row g-3">

                  {/* Address */}
                  <div className="col-lg-6">
                    <div className="card border h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <i className="ti ti-map-pin text-muted fs-18" />
                          <h6 className="fw-semibold fs-15 mb-0">Address</h6>
                        </div>

                        {location.address && Object.values(location.address).some(Boolean) ? (
                          <>
                            <div className="text-muted fs-14" style={{ lineHeight: 2 }}>
                              {[
                                location.address.attention,
                                location.address.street1,
                                location.address.street2,
                                [location.address.city, location.address.pin_code].filter(Boolean).join(", "),
                                decodeState(location.address.state),
                                decodeCountry(location.address.country),
                              ].filter(Boolean).map((line, i) => (
                                <div key={i}>{line}</div>
                              ))}
                            </div>
                            <div className="mt-3">
                              <button
                                type="button"
                                className="btn btn-outline-light d-flex align-items-center gap-2 fs-13"
                                onClick={() => {
                                  const addr = location.address!;
                                  const parts = [
                                    addr.attention,
                                    addr.street1,
                                    addr.street2,
                                    addr.city,
                                    addr.pin_code,
                                    decodeState(addr.state),
                                    decodeCountry(addr.country),
                                  ].filter(Boolean).join(", ");
                                  window.open(
                                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts)}`,
                                    "_blank",
                                    "noopener,noreferrer",
                                  );
                                }}
                              >
                                <i className="ti ti-map-2 fs-15" />
                                View on Map
                              </button>
                            </div>
                          </>
                        ) : (
                          <p className="text-muted fs-14 mb-0">No address provided.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Transaction Series Summary */}
                  <div className="col-lg-6">
                    <div className="card border h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <i className="ti ti-receipt-2 text-muted fs-18" />
                          <h6 className="fw-semibold fs-15 mb-0">Transaction Series</h6>
                        </div>
                        {location.default_txn_series ? (
                          <Link
                            to={`/locations/series/${location.default_txn_series.id}`}
                            className="fw-medium fs-14 text-primary d-block"
                          >
                            {location.default_txn_series.name}
                          </Link>
                        ) : (
                          <span className="fw-medium fs-14">Default Transaction Series</span>
                        )}
                        <p className="text-muted fs-12 mb-0 mt-1">Applied across Sales, Purchases &amp; Inventory</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Last updated footer */}
                <div
                  className="d-inline-flex align-items-center gap-2 mt-4 px-3 py-2 rounded"
                  style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}
                >
                  <i className="ti ti-clock text-muted fs-14" />
                  <span className="fs-14 text-muted">
                    Last updated on{" "}
                    <span className="fw-semibold" style={{ color: "#495057" }}>
                      {new Date(location.updated_at ?? location.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                      {", "}
                      {new Date(location.updated_at ?? location.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                    </span>
                  </span>
                </div>

              </div>
            )}

            {/* ── Tab: History ── */}
            {activeTab === "history" && (
              <div>
                {/* Header */}
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div>
                    <h6 className="fw-semibold mb-0 fs-15">Activity History</h6>
                    {!auditLoading && (
                      <span className="fs-13 text-muted">
                        {auditTotal} {auditTotal === 1 ? "record" : "records"}
                      </span>
                    )}
                  </div>
                  {!auditLoading && auditLastPage > 1 && (
                    <div className="d-flex align-items-center gap-2">
                      <span className="fs-13 text-muted">Page {auditPage} of {auditLastPage}</span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-light shadow"
                        disabled={auditPage <= 1}
                        onClick={() => setAuditPage((p) => p - 1)}
                        style={{ width: 30, height: 30, padding: 0 }}
                      >
                        <i className="ti ti-chevron-left fs-14" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-light shadow"
                        disabled={auditPage >= auditLastPage}
                        onClick={() => setAuditPage((p) => p + 1)}
                        style={{ width: 30, height: 30, padding: 0 }}
                      >
                        <i className="ti ti-chevron-right fs-14" />
                      </button>
                    </div>
                  )}
                </div>

                {auditLoading ? (
                  <div className="text-center py-5 text-muted">
                    <span className="spinner-border spinner-border-sm text-primary me-2" />
                    <span className="fs-14">Loading history…</span>
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="ti ti-history fs-36 d-block mb-2" />
                    <p className="fs-14 mb-0">No activity recorded yet.</p>
                  </div>
                ) : (
                  <div style={{ position: "relative", paddingLeft: 52 }}>
                    {/* Single continuous vertical line — runs full height of the list */}
                    <div style={{
                      position: "absolute", left: 17, top: 0, bottom: 0,
                      width: 2, background: "#e9ecef", zIndex: 0,
                    }} />

                    {auditLogs.map((log, idx) => {
                      const SKIP_FIELDS = new Set(["updated_at", "created_at", "deleted_at", "remember_token", "email_verified_at"]);
                      const FIELD_LABELS: Record<string, string> = {
                        name:                  "Name",
                        type:                  "Type",
                        parent_id:             "Parent Location",
                        logo_type:             "Logo",
                        logo_path:             "Logo Image",
                        is_active:             "Status",
                        is_primary:            "Primary Location",
                        website_url:           "Website",
                        txn_series_id:         "Transaction Series",
                        default_txn_series_id: "Default Transaction Series",
                      };
                      const ADDR_LABELS: Record<string, string> = {
                        attention: "Attention", street1: "Street 1", street2: "Street 2",
                        city: "City", pin_code: "PIN", state: "State",
                        country: "Country", phone: "Phone", fax: "Fax",
                      };

                      const parseIfStr = (v: any): any => {
                        if (typeof v === "string") { try { return JSON.parse(v); } catch { return v; } }
                        return v;
                      };

                      const fmtAuditVal = (v: any, key: string): string => {
                        if (v === null || v === undefined || v === "") return "—";
                        if (key === "is_active")  return (v === true || v === 1 || v === "1") ? "Active" : "Inactive";
                        if (key === "is_primary") return (v === true || v === 1 || v === "1") ? "Yes"    : "No";
                        const enumMap: Record<string, Record<string, string>> = {
                          type:      { business: "Business", warehouse: "Warehouse" },
                          logo_type: { org: "Organisation Logo", custom: "Custom Logo" },
                        };
                        if (enumMap[key]) return enumMap[key][String(v)] ?? String(v);
                        if (key === "state")   return decodeState(String(v))   ?? String(v);
                        if (key === "country") return decodeCountry(String(v)) ?? String(v);
                        return String(v);
                      };

                      type DiffRow = { key: string; label: string; oldVal: string; newVal: string };

                      const changedFields = log.new_values
                        ? Object.keys(log.new_values).filter((f) => !SKIP_FIELDS.has(f))
                        : [];
                      const diffRows: DiffRow[] = changedFields.flatMap((field): DiffRow[] => {
                        if (field === "address") {
                          const rawOld = parseIfStr(log.old_values?.address);
                          const rawNew = parseIfStr(log.new_values?.address);
                          const oldS = (rawOld && typeof rawOld === "object") ? rawOld : {};
                          const newS = (rawNew && typeof rawNew === "object") ? rawNew : {};
                          const changed = Object.keys({ ...oldS, ...newS }).filter(
                            (k) => String(oldS[k] ?? "") !== String(newS[k] ?? "")
                          );
                          return changed.map((k) => ({
                            key: k, label: ADDR_LABELS[k] ?? k,
                            oldVal: fmtAuditVal(oldS[k], k),
                            newVal: fmtAuditVal(newS[k], k),
                          }));
                        }
                        const oldStr = fmtAuditVal(parseIfStr(log.old_values?.[field]), field);
                        const newStr = fmtAuditVal(parseIfStr(log.new_values?.[field]), field);
                        if (oldStr === newStr) return [];
                        return [{ key: field, label: FIELD_LABELS[field] ?? field, oldVal: oldStr, newVal: newStr }];
                      });

                      if (log.event === "updated" && diffRows.length === 0) return null;

                      const eventIcon: Record<string, string> = {
                        created: "ti-plus", updated: "ti-pencil",
                        deleted: "ti-trash", restored: "ti-refresh",
                        child_deleted: "ti-folder-minus", child_restored: "ti-folder-check",
                      };
                      const iconClass = eventIcon[log.event] ?? "ti-activity";

                      const modelRaw   = log.auditable_type.split("\\").pop() ?? "Record";
                      const modelLabel = modelRaw.replace(/([A-Z])/g, " $1").trim().toLowerCase();

                      const actor   = log.user?.name ?? log.user?.email ?? "System";
                      // Normalise to UTC: append Z if no timezone indicator present
                      const rawTs   = log.created_at;
                      const utcTs   = /Z$|[+-]\d{2}:\d{2}$/.test(rawTs) ? rawTs : rawTs.replace(' ', 'T') + 'Z';
                      const dateObj = new Date(utcTs);
                      const dateStr = dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                      const timeStr = dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

                      const eventMessages: Record<string, string> = {
                        created:       `Created ${modelLabel}`,
                        deleted:       `Deleted ${modelLabel}`,
                        restored:      `Restored ${modelLabel}`,
                        child_deleted: "Sub-location removed",
                        child_restored: "Sub-location restored",
                      };
                      let message = eventMessages[log.event];
                      if (!message && log.event === "updated") {
                        message = diffRows.length === 1
                          ? `Changed ${diffRows[0].label.toLowerCase()}`
                          : `Updated ${diffRows.length} fields`;
                      }
                      message = message ?? log.event.replace(/_/g, " ");

                      const isLast = idx === auditLogs.filter(Boolean).length - 1;

                      return (
                        <div key={log.id} style={{ position: "relative", marginBottom: isLast ? 0 : 20 }}>

                          {/* Icon: absolutely centered to this card's height */}
                          <div style={{
                            position: "absolute", left: -52,
                            top: "50%", transform: "translateY(-50%)",
                            width: 36, height: 36, borderRadius: "50%",
                            background: "#fff4f4", border: "1.5px solid #e03131",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            zIndex: 1,
                          }}>
                            <i className={`ti ${iconClass}`} style={{ fontSize: 14, color: "#e03131" }} />
                          </div>

                          {/* Card */}
                          <div className="card border" style={{ borderRadius: 10 }}>
                            <div className="card-body" style={{ padding: "18px 20px" }}>

                              {/* Title + date */}
                              <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                                <span className="fw-semibold fs-15" style={{ color: "#212529" }}>{message}</span>
                                <div className="text-end flex-shrink-0">
                                  <div className="fs-13 fw-medium" style={{ color: "#495057" }}>{dateStr}</div>
                                  <div className="fs-12 text-muted">{timeStr}</div>
                                </div>
                              </div>

                              {/* Diff rows */}
                              {log.event === "updated" && diffRows.length > 0 && (
                                <div className="rounded mb-3 overflow-hidden" style={{ border: "1px solid #e9ecef" }}>
                                  {diffRows.map((row, ri) => (
                                    <div
                                      key={row.key}
                                      className="d-flex align-items-center gap-3"
                                      style={{
                                        padding: "10px 14px",
                                        background: ri % 2 === 0 ? "#fff" : "#fafafa",
                                        borderTop: ri > 0 ? "1px solid #f1f3f5" : "none",
                                      }}
                                    >
                                      <span className="text-muted fs-13 flex-shrink-0" style={{ width: 150 }}>{row.label}</span>
                                      <span
                                        className="fs-13 px-2 py-1 rounded text-decoration-line-through flex-shrink-0"
                                        style={{ background: "#f1f3f5", color: "#9ca3af" }}
                                      >
                                        {row.oldVal}
                                      </span>
                                      <i className="ti ti-arrow-right flex-shrink-0" style={{ fontSize: 12, color: "#adb5bd" }} />
                                      <span
                                        className="fs-13 fw-semibold px-2 py-1 rounded"
                                        style={{ background: "#fff4f4", color: "#e03131" }}
                                      >
                                        {row.newVal}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* child_deleted / child_restored: show which sub-location changed */}
                              {(log.event === "child_deleted" && log.old_values?.child_name) || (log.event === "child_restored" && log.new_values?.child_name) ? (
                                <div
                                  className="d-flex align-items-center gap-2 rounded mb-3 px-3 py-2"
                                  style={{ background: "#fff4f4", border: "1px solid #fde8e8" }}
                                >
                                  <i className="ti ti-building flex-shrink-0" style={{ fontSize: 13, color: "#e03131" }} />
                                  <span className="fs-13 fw-medium" style={{ color: "#e03131" }}>
                                    {log.old_values?.child_name ?? log.new_values?.child_name}
                                  </span>
                                </div>
                              ) : null}

                              {/* Footer: actor */}
                              <div className="d-flex align-items-center gap-2 border-top pt-3">
                                <div
                                  className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 fw-semibold"
                                  style={{ width: 24, height: 24, background: "#f1f3f5", fontSize: 11, color: "#6c757d" }}
                                >
                                  {actor.charAt(0).toUpperCase()}
                                </div>
                                <span className="fs-13 text-muted">{actor}</span>
                              </div>

                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
      <Footer />

      {/* ── Toast Notifications ── */}
      <div className="position-fixed top-0 start-50 translate-middle-x pt-4" style={{ zIndex: 9999, pointerEvents: "none" }}>
        <Toast
          show={toast.show}
          onClose={() => setToast((t) => ({ ...t, show: false }))}
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

    </div>

    {/* ── Confirmation dialog ──────────────────────────────────────────────── */}
    <ConfirmDialog config={confirmConfig} onClose={() => setConfirmConfig(null)} />
    </>
  );
};

export default LocationOverview;
