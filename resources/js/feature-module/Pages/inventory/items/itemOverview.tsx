import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useLocation as useRouterLocation } from "react-router";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Toast } from "react-bootstrap";
import Footer from "../../../../components/footer/footer";
import { restoreItem, deleteItem, uploadItemImage, updateItem, type ItemListRecord } from "../../../../core/services/itemApi";
import { fetchSettings, type ProductConfiguration } from "../../../../core/services/settingApi";
import { type AuditLogEntry } from "../../../../core/services/auditLogApi";
import { fetchCustomFields } from "../../../../core/services/customFieldApi";
import { fetchLocations, type LocationListItem } from "../../../../core/services/locationApi";
import { fetchItemStock, type ItemStockRow } from "../../../../core/services/openingStockApi";
import {
  readItemList, readItemDetail, readItemAuditLogs,
  getItemList, getItemDetail, getItemAuditLogs,
  bustItem, bustAllItemCache,
  hydrateItemList,
} from "../../../../core/cache/itemCache";
import { emitMutation, onMutation } from "../../../../core/cache/mutationEvents";
import { all_routes } from "../../../../routes/all_routes";

const route = all_routes;

type Tab = "overview" | "locations" | "transactions" | "history";

const VALUATION_LABELS: Record<string, string> = {
  fifo: "FIFO (First In First Out)",
  average: "Weighted Average",
};

// ── Sales summary chart ────────────────────────────────────────────────────────
const xLabels = Array.from({ length: 15 }, (_, i) => {
  const d = i * 2 + 1;
  return `${String(d).padStart(2, "0")} Apr`;
});

const chartOptions: ApexOptions = {
  chart: {
    type: "area",
    height: 200,
    toolbar: { show: false },
    zoom: { enabled: false },
    sparkline: { enabled: false },
  },
  dataLabels: { enabled: false },
  stroke: { curve: "smooth", width: 2 },
  fill: {
    type: "gradient",
    gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0.02 },
  },
  colors: ["#0d6efd"],
  grid: {
    borderColor: "#f0f0f0",
    strokeDashArray: 4,
    padding: { left: 4, right: 4 },
  },
  xaxis: {
    categories: xLabels,
    labels: { style: { fontSize: "10px", colors: "#9aa0ac" } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: { fontSize: "10px", colors: "#9aa0ac" },
      formatter: (v: number) => (v >= 1000 ? `${v / 1000}K` : String(v)),
    },
    min: 0,
    max: 5000,
    tickAmount: 5,
  },
  tooltip: { y: { formatter: (v: number) => `₹${v.toLocaleString("en-IN")}` } },
  legend: { show: false },
};

const chartSeries = [{ name: "Direct Sales", data: Array(15).fill(0) }];

// ── Stock row helper ───────────────────────────────────────────────────────────
function StockRow({ label, value = "0.00" }: { label: string; value?: string }) {
  return (
    <div className="d-flex align-items-center justify-content-between py-1">
      <span className="fs-14 text-muted" style={{ textDecorationLine: "underline", textDecorationStyle: "dashed", textUnderlineOffset: 3 }}>
        {label}
      </span>
      <span className="fs-14 fw-medium">: {value}</span>
    </div>
  );
}

// ── Qty tile helper ────────────────────────────────────────────────────────────
function QtyTile({ qty = 0, label }: { qty?: number; label: string }) {
  return (
    <div className="p-3 border rounded text-center" style={{ flex: "1 1 calc(50% - 6px)" }}>
      <div className="fw-bold fs-20 lh-1">{qty}</div>
      <div className="fs-11 text-muted mt-1">Qty</div>
      <div className="fs-12 text-muted mt-1">{label}</div>
    </div>
  );
}

// ── Detail row (label : value) ─────────────────────────────────────────────────
function DetailRow({ label, value, valueClass = "" }: { label: string; value: React.ReactNode; valueClass?: string }) {
  return (
    <div className="row g-0 py-2">
      <div className="col-5">
        <span className="fs-14 text-muted">{label}</span>
      </div>
      <div className="col-7">
        <span className={`fs-14 fw-medium ${valueClass}`}>{value}</span>
      </div>
    </div>
  );
}

// ── Item info row (2-col grid inside cards) ───────────────────────────────────
function ItemInfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="d-flex align-items-center px-4 py-2">
      <span className="text-muted fs-14 flex-shrink-0" style={{ width: "45%" }}>{label}</span>
      <span className="fs-14 fw-medium">{value}</span>
    </div>
  );
}

// ── Upload placeholder box ─────────────────────────────────────────────────────
function UploadBox({ label, icon = "ti-upload", img }: { label: string; icon?: string; img?: string | null }) {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center gap-1 rounded text-muted"
      style={{
        border: "1.5px dashed #c8d0d8",
        minHeight: 88,
        padding: 12,
        cursor: "pointer",
        background: "#fafbfc",
        fontSize: 12,
      }}
    >
      {img
        ? <img src={img} alt={label} style={{ width: "100%", maxHeight: 72, objectFit: "contain" }} />
        : (
          <>
            <i className={`ti ${icon} fs-18`} />
            <span className="text-center" style={{ fontSize: 11 }}>{label}</span>
          </>
        )
      }
    </div>
  );
}

// ── Confirmation dialog ────────────────────────────────────────────────────────
interface ConfirmConfig {
  icon: string; iconColor: string; iconBg: string;
  title: string; message: string;
  confirmLabel: string; confirmColor: string;
  onConfirm: () => Promise<void>;
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
      <div style={{ background: "#fff", borderRadius: 14, padding: "32px 28px 24px", width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: config.iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <i className={`ti ${config.icon}`} style={{ fontSize: 24, color: config.iconColor }} />
        </div>
        <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 16, color: "#0f172a", textAlign: "center" }}>{config.title}</p>
        <p style={{ margin: "0 0 24px", fontSize: 13.5, color: "#64748b", textAlign: "center", lineHeight: 1.55 }}>{config.message}</p>
        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <button className="btn btn-light flex-grow-1" style={{ fontWeight: 500, fontSize: 14, height: 44 }} onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn flex-grow-1" style={{ background: config.confirmColor, color: "#fff", fontWeight: 500, fontSize: 14, border: "none", height: 44 }} onClick={handleConfirm} disabled={busy}>
            {busy ? <><span className="spinner-border spinner-border-sm me-2" style={{ width: 14, height: 14, borderWidth: 2 }} />{config.confirmLabel}…</> : config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
const ItemOverview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const navState = useRouterLocation().state as { tab?: Tab; listFilter?: "all" | "goods" | "service" | "deleted" } | null;
  const [item, setItem] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(navState?.tab ?? "overview");

  // ── Items list (left panel) ──
  const [allItems, setAllItems] = useState<ItemListRecord[]>([]);
  const [listFilter, setListFilter] = useState<"all" | "goods" | "service" | "deleted">(
    navState?.listFilter ?? "all"
  );
  const [deletedItems,   setDeletedItems]   = useState<ItemListRecord[]>([]);
  const [deletedLoading, setDeletedLoading] = useState(false);
  const [listSearch, setListSearch] = useState("");

  // ── Image upload ──
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  // ── Product settings ──
  const [notifyReorderEnabled, setNotifyReorderEnabled] = useState(false);

  // ── Reorder point inline edit ──
  const [reorderPoint, setReorderPoint] = useState<number | null>(null);
  const [reorderPopoverOpen, setReorderPopoverOpen] = useState(false);
  const [reorderInput, setReorderInput] = useState("");
  const [reorderSaving, setReorderSaving] = useState(false);

  // ── Confirmation dialog ──
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  // ── Image lightbox ──
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // ── Audit log (history tab) ──
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const [auditLastPage, setAuditLastPage] = useState(1);
  const [auditTotal, setAuditTotal] = useState(0);
  // field_key → human-readable label for custom fields (module=products)
  const [cfLabels, setCfLabels] = useState<Record<string, string>>({});

  // ── Locations tab ──
  const [locations, setLocations] = useState<LocationListItem[]>([]);
  const [stockMap, setStockMap] = useState<Record<number, ItemStockRow>>({});
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationsLoaded, setLocationsLoaded] = useState(false);

  // ── Left panel scroll ──
  const activeItemRef = useRef<HTMLDivElement>(null);
  // Stale-response guard — incremented on every id change
  const detailFetchRef = useRef(0);

  // ── Toast ──
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger"; message: string }>({ show: false, type: "success", message: "" });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (type: "success" | "danger", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // Close lightbox on ESC
  useEffect(() => {
    if (!lightboxSrc) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setLightboxSrc(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxSrc]);

  // ── Refresh ──
  const [refreshing, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);

  const handleRefresh = useCallback(async () => {
    if (!id || refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    try {
      const numId = Number(id);
      bustAllItemCache();

      const fetches: Promise<void>[] = [
        getItemList()
          .then(data => setAllItems(data))
          .catch(() => showToast("danger", "Failed to reload items list.")),
        getItemDetail(numId)
          .then(data => {
            setItem(data);
            setImagePreview(data?.image ? `/storage/${data.image}` : null);
            setError(null);
          })
          .catch(() => showToast("danger", "Failed to reload item.")),
      ];

      if (listFilter === "deleted") {
        fetches.push(
          getItemList(true)
            .then(data => setDeletedItems(data))
            .catch(() => {})
        );
      }

      if (activeTab === "history") {
        fetches.push(
          getItemAuditLogs(numId, auditPage)
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

  // Fetch current item detail (cache-first, stale-response guarded)
  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    const token = ++detailFetchRef.current;

    const cached = readItemDetail(numId);
    if (cached) {
      if (token !== detailFetchRef.current) return;
      setItem(cached);
      setImagePreview(cached?.image ? `/storage/${cached.image}` : null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    getItemDetail(numId)
      .then(data => {
        if (token !== detailFetchRef.current) return;
        setItem(data);
        setImagePreview(data?.image ? `/storage/${data.image}` : null);
        setLoading(false);
      })
      .catch((e: Error) => {
        if (token !== detailFetchRef.current) return;
        setError(e.message ?? "Failed to load item.");
        setLoading(false);
      });
  }, [id]);

  // Reset audit page when item changes
  useEffect(() => { setAuditPage(1); }, [id]);

  // Fetch all items for the left panel (cache-first)
  useEffect(() => {
    const cached = readItemList();
    if (cached) { setAllItems(cached); return; }
    getItemList()
      .then(data => setAllItems(data))
      .catch(() => showToast("danger", "Network error loading items list."));
  }, []);

  // Listen for external mutations (e.g. edit page saves) and refresh
  useEffect(() => {
    return onMutation("items:mutated", handleRefresh);
  }, [handleRefresh]);

  // Fetch product settings (for notify_reorder_point flag)
  useEffect(() => {
    (async () => {
      const res = await fetchSettings<ProductConfiguration>("products");
      if (res.success && res.configuration) {
        setNotifyReorderEnabled(res.configuration.notify_reorder_point ?? false);
      }
    })();
  }, []);

  // Sync reorder point from item data
  useEffect(() => {
    if (item) setReorderPoint(item.reorder_point ?? null);
  }, [item]);

  // Load custom field definitions once when history tab is first opened
  useEffect(() => {
    if (activeTab !== "history") return;
    if (Object.keys(cfLabels).length > 0) return; // already loaded
    (async () => {
      const res = await fetchCustomFields("products");
      if (res.success) {
        const map: Record<string, string> = {};
        res.data.forEach((cf) => {
          if (cf.config?.field_key && cf.config?.label) {
            map[cf.config.field_key] = cf.config.label;
          }
        });
        setCfLabels(map);
      }
    })();
  }, [activeTab]);

  // Load audit logs when history tab is opened or page changes (cache-first)
  useEffect(() => {
    if (activeTab !== "history" || !id) return;
    const numId = Number(id);

    const cached = readItemAuditLogs(numId, auditPage);
    if (cached) {
      setAuditLogs(cached.logs);
      setAuditLastPage(cached.lastPage);
      setAuditTotal(cached.total);
      return;
    }

    setAuditLoading(true);
    getItemAuditLogs(numId, auditPage)
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

  // Load locations + current stock when locations tab first opened
  useEffect(() => {
    if (activeTab !== "locations" || locationsLoaded) return;
    (async () => {
      setLocationsLoading(true);
      const [locRes, stockRes] = await Promise.all([
        fetchLocations({ active_only: true }),
        fetchItemStock(Number(id)),
      ]);
      if (locRes.success) setLocations(locRes.data);
      if (stockRes.success) {
        const map: Record<number, ItemStockRow> = {};
        stockRes.data.forEach((r) => { map[r.location_id] = r; });
        setStockMap(map);
      }
      setLocationsLoaded(true);
      setLocationsLoading(false);
    })();
  }, [activeTab]);

  // Scroll active item into view in left panel
  useEffect(() => {
    // Small delay so the DOM has rendered the active item
    const timer = setTimeout(() => {
      activeItemRef.current?.scrollIntoView({ block: "center", behavior: "instant" });
    }, 50);
    return () => clearTimeout(timer);
  }, [id, allItems]);

  // Lazy-fetch deleted items when filter switches to "deleted" (cache-first)
  useEffect(() => {
    if (listFilter !== "deleted") return;
    const cached = readItemList(true);
    if (cached) { setDeletedItems(cached); return; }
    setDeletedLoading(true);
    getItemList(true)
      .then(data => { setDeletedItems(data); setDeletedLoading(false); })
      .catch(() => setDeletedLoading(false));
  }, [listFilter]);

  // Navigate to first item in the new view when filter changes
  const pendingDeletedNav = useRef(false);
  useEffect(() => {
    if (listFilter === "deleted") {
      if (deletedItems.length > 0) {
        navigate(`/items/${deletedItems[0].id}`, { state: { listFilter: "deleted" } });
      } else {
        pendingDeletedNav.current = true;
      }
    } else {
      const base = listFilter === "all" ? allItems : allItems.filter(i => i.item_type === listFilter);
      if (base.length > 0) navigate(`/items/${base[0].id}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listFilter]);

  // Once deleted items finish loading, navigate to first (if triggered by filter switch)
  useEffect(() => {
    if (!pendingDeletedNav.current) return;
    if (listFilter === "deleted" && !deletedLoading && deletedItems.length > 0) {
      pendingDeletedNav.current = false;
      navigate(`/items/${deletedItems[0].id}`, { state: { listFilter: "deleted" } });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedItems, deletedLoading]);

  const handleRestoreItem = async (itemId: number) => {
    const res = await restoreItem(itemId);
    if (res.success) {
      bustItem(itemId);
      emitMutation("items:mutated");
      const remainingDeleted = deletedItems.filter(i => i.id !== itemId);
      setDeletedItems(remainingDeleted);
      showToast("success", "Item restored.");
      if (listFilter === "deleted" && remainingDeleted.length === 0) {
        // Last deleted item — switch to all items view
        setListFilter("all");
      } else if (String(itemId) === id) {
        // Restored the currently viewed item but more deleted items remain
        navigate(`/items/${remainingDeleted[0].id}`, { state: { listFilter: "deleted" } });
      }
    } else {
      showToast("danger", (res as any).message ?? "Failed to restore item.");
    }
  };

  const handleDeleteCurrentItem = () => {
    if (!item) return;
    setConfirmConfig({
      icon: "ti-trash",
      iconColor: "#e03131",
      iconBg: "#fff0f0",
      title: "Delete Item?",
      message: `"${item.name}" will be soft-deleted and can be restored later.`,
      confirmLabel: "Delete",
      confirmColor: "#e03131",
      onConfirm: async () => {
        const numId = Number(id);
        const res = await deleteItem(numId);
        if (!res.success) { showToast("danger", (res as any).message ?? "Failed to delete item."); return; }
        bustItem(numId);
        emitMutation("items:mutated");
        setAllItems(prev => prev.filter(i => i.id !== numId));
        showToast("success", "Item deleted.");
        const remaining = allItems.filter(i => i.id !== numId);
        if (remaining.length > 0) navigate(`/items/${remaining[0].id}`);
        else navigate(route.itemsList);
      },
    });
  };

  const handleRestoreCurrentItem = () => {
    if (!item) return;
    setConfirmConfig({
      icon: "ti-refresh",
      iconColor: "#2f9e44",
      iconBg: "#ebfbee",
      title: "Restore Item?",
      message: `"${item.name}" will be restored and made active again.`,
      confirmLabel: "Restore",
      confirmColor: "#2f9e44",
      onConfirm: async () => {
        const numId = Number(id);
        const res = await restoreItem(numId);
        if (!res.success) { showToast("danger", (res as any).message ?? "Failed to restore item."); return; }

        // Remove from deleted list
        const remainingDeleted = deletedItems.filter(i => i.id !== numId);
        setDeletedItems(remainingDeleted);

        // Build an ItemListRecord from the detail object and add to active list
        const restoredRecord: ItemListRecord = {
          id:              numId,
          name:            item.name,
          item_type:       item.item_type,
          form_type:       item.form_type,
          sku:             item.sku ?? null,
          selling_price:   item.selling_price ?? null,
          cost_price:      item.cost_price ?? null,
          image:           item.image ?? null,
          refs:            item.refs ?? null,
          track_inventory: !!item.track_inventory,
          reorder_point:   item.reorder_point ?? null,
          created_at:      item.created_at,
          is_composite:    !!item.is_composite,
          composite_type:  item.composite_type ?? null,
          components:      item.components ?? [],
        };
        setAllItems(prev =>
          prev.some(i => i.id === numId)
            ? prev.map(i => i.id === numId ? restoredRecord : i)
            : [...prev, restoredRecord]
        );

        // Update the detail panel in-place and sync cache
        const restoredDetail = { ...item, deleted_at: null };
        setItem(restoredDetail);
        bustItem(numId);
        hydrateItemList([...allItems.filter(i => i.id !== numId), restoredRecord]);
        hydrateItemList(remainingDeleted, true);
        emitMutation("items:mutated");

        showToast("success", "Item restored.");

        // Mirror locationOverview: if viewing deleted list and it's now empty, switch filter;
        // otherwise stay on this item's detail page
        if (listFilter === "deleted" && remainingDeleted.length === 0) {
          setListFilter("all");
        } else {
          navigate(`/items/${numId}`);
        }
      },
    });
  };

  const filteredListItems = useMemo(() => {
    if (listFilter === "deleted") {
      if (!listSearch.trim()) return deletedItems;
      const q = listSearch.toLowerCase();
      return deletedItems.filter(i => i.name.toLowerCase().includes(q));
    }
    let base = listFilter === "all" ? allItems : allItems.filter((i) => i.item_type === listFilter);
    if (listSearch.trim()) {
      const q = listSearch.toLowerCase();
      base = base.filter((i) => i.name.toLowerCase().includes(q));
    }
    return base;
  }, [allItems, deletedItems, listFilter, listSearch]);

  const fmtPrice = (val: any) =>
    val ? `₹${parseFloat(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—";

  const fmt = (val: any) =>
    val === null || val === undefined || val === "" ? "—" : String(val);

  const img = useMemo(() => item?.image ? `/storage/${item.image}` : null, [item]);

  // ── Loading / Error (shown in full-width, no two-pane needed yet) ──
  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
          <span className="spinner-border spinner-border-sm me-2 text-primary" />
          <span className="text-muted">Loading item…</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="alert alert-danger">{error ?? "Item not found."}</div>
          <Link to={route.itemsList} className="btn btn-outline-light">
            <i className="ti ti-arrow-left me-1" /> Back to Items
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "locations", label: "Locations" },
    { key: "transactions", label: "Transactions" },
    { key: "history", label: "History" },
  ];

  return (
    /* Override page-wrapper's min-height so it acts as a fixed viewport container */
    <div
      className="page-wrapper"
      style={{ height: "calc(100vh - 57px)", minHeight: "unset", overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      {/* ═══ Two-pane shell — fills the fixed height exactly ═════════════════ */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* ── Left: Items list panel ───────────────────────────────────────── */}
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
                  placeholder="Search items…"
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
                  {(["all", "goods", "service", "deleted"] as const).map(f => (
                    <button
                      key={f}
                      className="dropdown-item d-flex align-items-center gap-2 fs-13"
                      style={{ fontWeight: listFilter === f ? 600 : 400, color: listFilter === f ? "#e03131" : undefined }}
                      onClick={() => setListFilter(f)}
                    >
                      <i className={`ti ${f === "all" ? "ti-list" : f === "goods" ? "ti-box" : f === "service" ? "ti-settings" : "ti-trash"} fs-13`} />
                      {f === "all" ? "All Items" : f === "goods" ? "Goods" : f === "service" ? "Services" : "Deleted Items"}
                      {listFilter === f && <i className="ti ti-check ms-auto fs-12" style={{ color: "#e03131" }} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Items list */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {listFilter === "deleted" ? (
              deletedLoading ? (
                <div className="text-center py-4 text-muted fs-13">
                  <span className="spinner-border spinner-border-sm me-2" />Loading…
                </div>
              ) : filteredListItems.length === 0 ? (
                <div className="text-center py-4 text-muted fs-13">
                  <i className="ti ti-trash d-block fs-24 mb-1" />No deleted items
                </div>
              ) : (
                filteredListItems.map(li => (
                  <div key={li.id}
                    className="d-flex align-items-center gap-2 px-3"
                    style={{ paddingTop: 11, paddingBottom: 11, cursor: "pointer", borderBottom: "1px solid #f0f2f5" }}
                    onClick={() => navigate(`/items/${li.id}`, { state: { listFilter: "deleted" } })}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#f8f9fa"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                  >
                    <div className="rounded border d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                      style={{ width: 28, height: 28, background: "#f5f5f5", opacity: 0.6 }}>
                      <i className="ti ti-photo text-muted" style={{ fontSize: 12 }} />
                    </div>
                    <span className="flex-grow-1 text-truncate fs-14 text-muted">{li.name}</span>
                    <button
                      type="button"
                      className="btn btn-sm d-flex align-items-center gap-1 flex-shrink-0"
                      style={{ fontSize: 11, padding: "2px 8px", background: "#fff4f4", color: "#e03131", border: "1px solid #fde8e8", borderRadius: 6 }}
                      onClick={e => { e.stopPropagation(); handleRestoreItem(li.id); }}
                      title="Restore"
                    >
                      <i className="ti ti-refresh" style={{ fontSize: 11 }} />Restore
                    </button>
                  </div>
                ))
              )
            ) : filteredListItems.length === 0 ? (
              <div className="text-center py-4 text-muted fs-13">
                <i className="ti ti-mood-empty d-block fs-24 mb-1" />
                No items found
              </div>
            ) : (
              filteredListItems.map((li) => {
                const isActive = String(li.id) === id;
                const liImg = li.image ? `/storage/${li.image}` : null;
                return (
                  <div
                    key={li.id}
                    ref={isActive ? activeItemRef : undefined}
                    onClick={() => navigate(`/items/${li.id}`)}
                    className="d-flex align-items-center gap-2 px-3"
                    style={{
                      paddingTop: 11, paddingBottom: 11,
                      cursor: "pointer",
                      background: isActive ? "#fff1f0" : "transparent",
                      borderBottom: "1px solid #f5f5f5",
                    }}
                    onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "#f8f9fa"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = isActive ? "#fff1f0" : "transparent"; }}
                  >
                    <div
                      className="rounded border d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                      style={{ width: 28, height: 28, background: "#f5f5f5" }}
                    >
                      {liImg
                        ? <img src={liImg} alt={li.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <i className="ti ti-photo text-muted" style={{ fontSize: 12 }} />
                      }
                    </div>
                    <span
                      className="flex-grow-1 text-truncate"
                      style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? "#e03131" : "#212529" }}
                    >
                      {li.name}
                    </span>
                    {li.selling_price && (
                      <span className="fs-12 text-muted flex-shrink-0">
                        ₹{parseFloat(li.selling_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right: Item detail ─────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", background: "#fff" }}>
          <div style={{ padding: "1.25rem" }}>

            {/* ── Header ── */}
            <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
              <div className="d-flex align-items-start gap-3">
                <div className="rounded border d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                  style={{ width: 56, height: 56, background: "#f5f5f5" }}>
                  {img
                    ? <img src={img} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} />
                    : <i className="ti ti-package fs-24 text-muted" />
                  }
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                    <h4 className="fw-bold mb-0 lh-sm">{item.name}</h4>
                    {item.deleted_at ? (
                      <span className="badge badge-soft-danger d-inline-flex align-items-center gap-1 fs-12">
                        <i className="ti ti-trash" style={{ fontSize: 10 }} />Deleted
                      </span>
                    ) : (
                      <span className={`badge d-inline-flex align-items-center gap-1 fs-12 ${item.is_active !== false ? "badge-soft-success" : "badge-soft-danger"}`}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: item.is_active !== false ? "#12b76a" : "#ef4444", display: "inline-block" }} />
                        {item.is_active !== false ? "Active" : "Inactive"}
                      </span>
                    )}
                    {item.is_returnable && (
                      <span className="badge badge-soft-info fs-12">Returnable</span>
                    )}
                  </div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="badge fs-12" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                      Type: {item.item_type === "goods" ? "Goods" : "Service"}
                    </span>
                    {item.unit && (
                      <span className="badge fs-12" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                        Unit: {item.unit}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                {item.deleted_at ? (
                  <button
                    type="button"
                    className="btn btn-outline-light shadow d-flex align-items-center gap-1"
                    style={{ height: 36 }}
                    onClick={handleRestoreCurrentItem}
                  >
                    <i className="ti ti-refresh" style={{ fontSize: 14 }} />Restore
                  </button>
                ) : (
                  <div className="dropdown">
                    <button type="button" className="btn btn-outline-light dropdown-toggle shadow d-flex align-items-center gap-1"
                      style={{ height: 36 }} data-bs-toggle="dropdown">
                      Actions
                    </button>
                    <div className="dropdown-menu dropdown-menu-end dropmenu-hover-primary">
                      <ul>
                        <li>
                          <button className="dropdown-item" onClick={() => navigate(item.is_composite ? `/composite-items/${id}/edit` : `/items/${id}/edit`)}>
                            <i className="ti ti-pencil me-2" />Edit
                          </button>
                        </li>
                        <li>
                          <button className="dropdown-item" onClick={() => navigate(`/items/${id}/opening-stock`)}>
                            <i className="ti ti-adjustments-horizontal me-2" />Adjust Stock
                          </button>
                        </li>
                        <li>
                          <button className="dropdown-item text-danger" onClick={handleDeleteCurrentItem}>
                            <i className="ti ti-trash me-2" />Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
                <button type="button" className="btn btn-outline-light d-flex align-items-center justify-content-center shadow"
                  style={{ height: 36, width: 36 }} onClick={handleRefresh} disabled={refreshing} title="Refresh">
                  <i className={`ti ti-refresh${refreshing ? " spin-animation" : ""}`} style={{ fontSize: 16 }} />
                </button>
                <button type="button" className="btn btn-outline-light d-flex align-items-center justify-content-center shadow"
                  style={{ height: 36, width: 36 }} onClick={() => navigate(route.itemsList)} title="Close">
                  <i className="ti ti-x" style={{ fontSize: 16 }} />
                </button>
              </div>
            </div>

            {/* ── Tab nav (pill) ── */}
            <div className="mb-4">
              <div className="d-inline-flex rounded" style={{ background: "#f1f3f5", padding: 4, gap: 2 }}>
                {tabs.map(t => {
                  const isActive = activeTab === t.key;
                  return (
                    <button key={t.key} type="button" onClick={() => setActiveTab(t.key)}
                      style={{
                        padding: "6px 20px", borderRadius: 6, border: "none",
                        background: isActive ? "#fff" : "transparent",
                        color: isActive ? "#e03131" : "#6c757d",
                        fontWeight: isActive ? 600 : 400,
                        fontSize: 14,
                        boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                        transition: "all 0.15s", cursor: "pointer", whiteSpace: "nowrap",
                      }}>
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Tab: Overview ── */}
            {activeTab === "overview" && (
              <div>

                {/* Item Information card */}
                <div className="card border mb-3">
                  <div className="card-body p-0">
                    <div className="px-4 py-3 border-bottom">
                      <h6 className="fw-semibold fs-15 mb-0">Item Information</h6>
                    </div>
                    <div className="row g-0 pt-2 pb-1">
                      <div className="col-md-6">
                        <ItemInfoRow label="Item Name" value={<span className="text-primary">{item.name}</span>} />
                        <ItemInfoRow label="Item Type" value={
                          <span className={`badge fs-12 ${item.item_type === "goods" ? "badge-soft-secondary" : "badge-soft-primary"}`}>
                            {item.item_type === "goods" ? "Goods" : "Service"}
                          </span>
                        } />
                        <ItemInfoRow label="Unit" value={fmt(item.unit)} />
                        <ItemInfoRow label="Status" value={
                          <span className={`badge fs-12 ${item.is_active !== false ? "badge-soft-success" : "badge-soft-danger"}`}>
                            {item.is_active !== false ? "Active" : "Inactive"}
                          </span>
                        } />
                        <ItemInfoRow label="Returnable" value={item.is_returnable ? "Yes" : "No"} />
                        {item.track_inventory && item.valuation_method && (
                          <ItemInfoRow label="Valuation Method" value={VALUATION_LABELS[item.valuation_method] ?? item.valuation_method} />
                        )}
                      </div>
                      <div className="col-md-6">
                        <ItemInfoRow label="SKU" value={fmt(item.sku)} />
                        <ItemInfoRow label="Selling Price" value={fmtPrice(item.selling_price)} />
                        <ItemInfoRow label="Cost Price" value={fmtPrice(item.cost_price)} />
                        <ItemInfoRow label="Inventory Account" value={fmt(item.inventory_account ?? item.account_name)} />
                        <ItemInfoRow label="Created By" value={fmt(item.created_by?.name ?? item.created_by)} />
                      </div>
                    </div>
                    <div className="d-flex align-items-center px-4 py-3 border-top" style={{ background: "#fafafa", borderRadius: "0 0 8px 8px" }}>
                      <span className="text-muted fs-14 flex-shrink-0" style={{ width: "22.5%" }}>Created On</span>
                      <span className="fs-14 fw-medium">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) + ", " +
                            new Date(item.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom cards */}
                <div className="row g-3">

                  {/* Image */}
                  <div className="col-lg-6">
                    <div className="card border h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <i className="ti ti-photo text-muted fs-18" />
                          <h6 className="fw-semibold fs-15 mb-0">Item Image</h6>
                        </div>
                        <label htmlFor="overview_image_input"
                          className="border rounded d-flex flex-column align-items-center justify-content-center text-center overflow-hidden position-relative"
                          style={{ cursor: imageUploading ? "wait" : "pointer", background: "#fafafa", height: 180 }}>
                          {imagePreview ? (
                            <img src={imagePreview} alt={item.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", padding: 12 }} />
                          ) : (
                            <>
                              <i className="ti ti-photo-up text-primary fs-32 mb-2" />
                              <span className="fw-semibold fs-14">Upload Image</span>
                              <small className="text-muted mt-1">PNG, JPG up to 10 MB</small>
                            </>
                          )}
                          {imageUploading && (
                            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: "rgba(255,255,255,0.7)" }}>
                              <span className="spinner-border spinner-border-sm text-primary" />
                            </div>
                          )}
                          {imagePreview && !imageUploading && (
                            <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 p-1 lh-1"
                              style={{ fontSize: 12, zIndex: 1 }}
                              onClick={async (e) => {
                                e.preventDefault();
                                const prevPreview = imagePreview;
                                setImagePreview(null); setImageFile(null);
                                const res = await updateItem(Number(id), { image: null } as any);
                                if (!res.success) { setImagePreview(prevPreview); showToast("danger", res.message || "Failed to remove image."); }
                                else showToast("success", "Image removed successfully.");
                              }}>
                              <i className="ti ti-x" />
                            </button>
                          )}
                        </label>
                        <input id="overview_image_input" type="file" accept="image/*" className="d-none"
                          onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const prevPreview = imagePreview;
                            setImagePreview(URL.createObjectURL(file)); setImageFile(file); setImageUploading(true);
                            const uploadRes = await uploadItemImage(file);
                            if (!uploadRes.success) {
                              setImageUploading(false); setImagePreview(prevPreview); setImageFile(null);
                              showToast("danger", uploadRes.message || "Failed to upload image."); return;
                            }
                            const imagePath = (uploadRes as any).path as string;
                            const updateRes = await updateItem(Number(id), { image: imagePath } as any);
                            setImageUploading(false);
                            if (!updateRes.success) { setImagePreview(prevPreview); setImageFile(null); showToast("danger", updateRes.message || "Failed to save image."); }
                            else showToast("success", "Image updated successfully.");
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stock Summary */}
                  <div className="col-lg-6">
                    <div className="card border h-100">
                      <div className="card-body position-relative">
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <i className="ti ti-building-warehouse text-muted fs-18" />
                          <h6 className="fw-semibold fs-15 mb-0">Stock Summary</h6>
                        </div>

                        {/* Opening Stock — shown separately */}
                        <div className="d-flex align-items-center py-2 mb-1" style={{ background: "#f8f9fa", borderRadius: 6, padding: "8px 12px" }}>
                          <span className="text-muted fs-14 flex-shrink-0" style={{ width: "60%" }}>Opening Stock</span>
                          <span className="fs-14 fw-semibold">0.00</span>
                        </div>

                        <hr className="my-2" />

                        {[
                          { label: "Stock on Hand",      value: "0.00" },
                          { label: "Committed Stock",    value: "0.00" },
                          { label: "Available for Sale", value: "0.00" },
                        ].map(row => (
                          <div key={row.label} className="d-flex align-items-center py-2 border-bottom">
                            <span className="text-muted fs-14 flex-shrink-0" style={{ width: "60%" }}>{row.label}</span>
                            <span className="fs-14 fw-medium">{row.value}</span>
                          </div>
                        ))}

                        <hr className="my-3" />

                        <p className="fs-14 fw-semibold mb-2" style={{ textDecorationLine: "underline", textDecorationStyle: "dashed", textUnderlineOffset: 3 }}>
                          Reorder Point
                        </p>

                        {notifyReorderEnabled ? (
                          <div className="position-relative">
                            {reorderPoint !== null ? (
                              <div className="d-flex align-items-center gap-2">
                                <span className="fs-15 fw-semibold">{parseFloat(String(reorderPoint)).toFixed(2)}</span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-light border shadow-sm p-1 lh-1"
                                  style={{ width: 26, height: 26 }}
                                  onClick={() => { setReorderInput(String(reorderPoint)); setReorderPopoverOpen(true); }}
                                >
                                  <i className="ti ti-pencil fs-12" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-link p-0 fs-14 text-primary text-decoration-none"
                                onClick={() => { setReorderInput(""); setReorderPopoverOpen(true); }}
                              >
                                + Add
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="rounded p-3" style={{ background: "#fff8f0", border: "1px solid #fde8c8" }}>
                            <p className="fs-14 mb-0" style={{ color: "#7a5c2e" }}>
                              You have to enable reorder notification before setting reorder point for items.{" "}
                              <Link to={`${route.projectSettings}?highlight=notify-reorder`} className="text-primary">Click here</Link>
                            </p>
                          </div>
                        )}

                        {reorderPopoverOpen && (
                          <div
                            style={{ position: "fixed", inset: 0, zIndex: 1060, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}
                            onClick={e => { if (e.target === e.currentTarget) setReorderPopoverOpen(false); }}
                          >
                            <div style={{ background: "#fff", borderRadius: 14, padding: "32px 28px 24px", width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
                              <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 16, color: "#0f172a" }}>Reorder Point</p>
                              <p style={{ margin: "0 0 20px", fontSize: 13.5, color: "#64748b", lineHeight: 1.55 }}>Set a reorder point for this item.</p>
                              <label className="fs-13 fw-medium text-danger mb-1">Set Reorder point*</label>
                              <input
                                type="number"
                                className="form-control mb-4"
                                min={0}
                                step={0.01}
                                value={reorderInput}
                                onChange={e => setReorderInput(e.target.value)}
                                autoFocus
                              />
                              <div style={{ display: "flex", gap: 10, width: "100%" }}>
                                <button type="button" className="btn btn-light flex-grow-1" style={{ fontWeight: 500, fontSize: 14, height: 44 }} onClick={() => setReorderPopoverOpen(false)} disabled={reorderSaving}>Cancel</button>
                                <button
                                  type="button"
                                  className="btn flex-grow-1"
                                  style={{ background: "#e03131", color: "#fff", fontWeight: 500, fontSize: 14, border: "none", height: 44 }}
                                  disabled={reorderSaving || reorderInput.trim() === ""}
                                  onClick={async () => {
                                    const val = parseFloat(reorderInput);
                                    if (isNaN(val) || val < 0) return;
                                    setReorderSaving(true);
                                    const res = await updateItem(Number(id), { reorder_point: val } as any);
                                    setReorderSaving(false);
                                    if (res.success) {
                                      setReorderPoint(val);
                                      setReorderPopoverOpen(false);
                                      showToast("success", "Reorder point updated.");
                                    } else {
                                      showToast("danger", (res as any).message || "Failed to update reorder point.");
                                    }
                                  }}
                                >
                                  {reorderSaving ? <><span className="spinner-border spinner-border-sm me-2" style={{ width: 14, height: 14, borderWidth: 2 }} />Saving…</> : "Update"}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Associated Components (composite items only) */}
                {item.is_composite && Array.isArray(item.components) && (item.components as any[]).length > 0 && (
                  <div className="mt-3">
                    <hr className="mt-0 mb-3" />
                    <h6 className="fw-semibold fs-14 mb-3">
                      Associated Products
                      <span className="ms-2 badge badge-soft-secondary fs-12 fw-medium">
                        {item.composite_type === "assembly" ? "Assembly" : item.composite_type === "kit" ? "Kit" : ""}
                      </span>
                    </h6>
                    <div style={{ border: "1px solid #dee2e6", borderRadius: 8, overflow: "hidden" }}>
                      <div style={{ background: "#fff0f2", padding: "12px 16px", borderBottom: "1px solid #dee2e6" }}>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E41F07", display: "inline-block", flexShrink: 0 }} />
                          <span className="fw-semibold fs-14">{(item.components as any[]).length} component{(item.components as any[]).length !== 1 ? "s" : ""}</span>
                        </div>
                        <p className="text-muted fs-13 mb-0">Items and services that make up this composite product.</p>
                      </div>
                      <div style={{ overflowX: "auto" }}>
                        <table className="table mb-0" style={{ minWidth: 640, width: "100%" }}>
                          <thead>
                            <tr>
                              <th className="text-uppercase fs-12 fw-semibold text-muted" style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", width: 56 }} />
                              <th className="text-uppercase fs-12 fw-semibold text-muted" style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6" }}>Item Name</th>
                              <th className="text-uppercase fs-12 fw-semibold text-muted" style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", width: 100 }}>Type</th>
                              <th className="text-uppercase fs-12 fw-semibold text-muted" style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", width: 120 }}>SKU</th>
                              <th className="text-uppercase fs-12 fw-semibold text-muted" style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", width: 80 }}>Unit</th>
                              <th className="text-uppercase fs-12 fw-semibold text-muted text-end" style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", width: 80 }}>Qty</th>
                              <th className="text-uppercase fs-12 fw-semibold text-muted text-end" style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", width: 120 }}>Selling (₹)</th>
                              <th className="text-uppercase fs-12 fw-semibold text-muted text-end" style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", width: 120 }}>Cost (₹)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(item.components as any[]).map((comp: any) => {
                              const ci = comp.component_item ?? {};
                              const ciImg = ci.image ? `/storage/${ci.image}` : null;
                              const qty = comp.quantity ? parseFloat(comp.quantity) : 0;
                              const sp  = comp.selling_price != null ? parseFloat(comp.selling_price) : null;
                              const cp  = comp.cost_price    != null ? parseFloat(comp.cost_price)    : null;
                              return (
                                <tr key={comp.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                                  <td style={{ padding: "10px 16px", verticalAlign: "middle" }}>
                                    <div className="rounded border d-flex align-items-center justify-content-center overflow-hidden"
                                      style={{ width: 36, height: 36, background: "#f8f9fa", flexShrink: 0 }}>
                                      {ciImg ? <img src={ciImg} alt={ci.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                             : <i className="ti ti-photo text-muted" style={{ fontSize: 14 }} />}
                                    </div>
                                  </td>
                                  <td style={{ padding: "10px 16px", verticalAlign: "middle" }}>
                                    <div className="fw-medium fs-14">{ci.name ?? "—"}</div>
                                    {ci.sku && <div className="fs-12 text-muted">{ci.sku}</div>}
                                  </td>
                                  <td style={{ padding: "10px 16px", verticalAlign: "middle" }}>
                                    <span className={`badge ${comp.component_type === "service" ? "badge-soft-primary" : "badge-soft-secondary"} fs-12`}>
                                      {comp.component_type === "service" ? "Service" : "Item"}
                                    </span>
                                  </td>
                                  <td className="fs-13 text-muted" style={{ padding: "10px 16px", verticalAlign: "middle" }}>{ci.sku ?? "—"}</td>
                                  <td className="fs-13 text-muted" style={{ padding: "10px 16px", verticalAlign: "middle" }}>{ci.unit ?? "—"}</td>
                                  <td className="fs-14 fw-medium text-end" style={{ padding: "10px 16px", verticalAlign: "middle" }}>
                                    {qty % 1 === 0 ? qty : qty.toFixed(2)}
                                  </td>
                                  <td className="fs-14 text-end" style={{ padding: "10px 16px", verticalAlign: "middle" }}>
                                    {sp != null ? `₹${sp.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : <span className="text-muted">—</span>}
                                  </td>
                                  <td className="fs-14 text-end" style={{ padding: "10px 16px", verticalAlign: "middle" }}>
                                    {cp != null ? `₹${cp.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : <span className="text-muted">—</span>}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sales Order Summary chart */}
                <div className="mt-3">
                  <hr className="mt-0 mb-3" />
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="fw-semibold mb-0 fs-14">Sales Order Summary <span className="text-muted fw-normal">(In INR)</span></h6>
                    <div className="dropdown">
                      <button type="button" className="btn btn-sm btn-outline-light shadow dropdown-toggle px-2 fs-12" data-bs-toggle="dropdown">This Month</button>
                      <div className="dropdown-menu dropdown-menu-end dropmenu-hover-primary">
                        <ul>
                          <li><button className="dropdown-item fs-13">This Week</button></li>
                          <li><button className="dropdown-item fs-13">This Month</button></li>
                          <li><button className="dropdown-item fs-13">This Quarter</button></li>
                          <li><button className="dropdown-item fs-13">This Year</button></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <Chart options={chartOptions} series={chartSeries} type="area" height={300} />
                  <div className="border rounded px-3 py-2 mt-2 d-flex align-items-center justify-content-between">
                    <div>
                      <p className="fs-12 text-muted mb-1">Total Sales</p>
                      <div className="d-flex align-items-center gap-2">
                        <span className="rounded-circle flex-shrink-0" style={{ width: 8, height: 8, background: "#0d6efd", display: "inline-block" }} />
                        <span className="fs-13 text-muted">Direct Sales</span>
                      </div>
                    </div>
                    <span className="fs-16 fw-semibold">₹0.00</span>
                  </div>
                </div>

                {/* Last updated footer */}
                <div className="d-inline-flex align-items-center gap-2 mt-4 px-3 py-2 rounded"
                  style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}>
                  <i className="ti ti-clock text-muted fs-14" />
                  <span className="fs-14 text-muted">
                    Last updated on{" "}
                    <span className="fw-semibold" style={{ color: "#495057" }}>
                      {new Date(item.updated_at ?? item.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                      {", "}
                      {new Date(item.updated_at ?? item.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                    </span>
                  </span>
                </div>

              </div>
            )}

            {/* ── Tab: Locations ── */}
            {activeTab === "locations" && (
              <div>
                {/* Header */}
                <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <h6 className="fw-semibold fs-15 mb-0">Stock Locations</h6>
                    {/* Hide opening stock for composite items — their stock is derived from components */}
                    {!item.is_composite && (
                      <div className="dropdown">
                        <button
                          type="button"
                          className="btn btn-outline-light shadow"
                          data-bs-toggle="dropdown"
                          style={{ height: 36, width: 36, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <i className="ti ti-settings fs-14" />
                        </button>
                        <div className="dropdown-menu dropdown-menu-start dropmenu-hover-primary">
                          <ul>
                            <li>
                              <button className="dropdown-item fs-13" onClick={() => navigate(`/items/${id}/opening-stock`)}>
                                <i className="ti ti-plus me-2" />Add Opening Stock
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Table */}
                {locationsLoading ? (
                  <div className="text-center py-5 text-muted">
                    <span className="spinner-border spinner-border-sm text-primary me-2" />
                    <span className="fs-14">Loading locations…</span>
                  </div>
                ) : locations.length === 0 ? (
                  <div className="text-center py-5 text-muted border rounded">
                    <i className="ti ti-building-warehouse fs-32 d-block mb-2" />
                    <p className="fs-14 mb-0">No active locations found.</p>
                  </div>
                ) : (
                  <div style={{ border: "1px solid #dee2e6", borderRadius: 8, overflow: "hidden" }}>

                    {/* Header */}
                    <div style={{ background: "#fff0f2", padding: "12px 16px", borderBottom: "1px solid #dee2e6" }}>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E41F07", display: "inline-block", flexShrink: 0 }} />
                        <span className="fw-semibold fs-14">{locations.length} location(s)</span>
                      </div>
                      <p className="text-muted fs-13 mb-0">Stock levels across all active locations for this item.</p>
                    </div>

                    <table className="table mb-0" style={{ width: "100%" }}>
                      <thead>
                        <tr>
                          <th
                            className="text-uppercase fs-12 fw-semibold text-muted"
                            style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6" }}
                          >
                            Location Name
                          </th>
                          <th
                            className="text-uppercase fs-12 fw-semibold text-muted text-end"
                            style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", width: 150 }}
                          >
                            Stock on Hand
                          </th>
                          <th
                            className="text-uppercase fs-12 fw-semibold text-muted text-end"
                            style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", width: 160 }}
                          >
                            Committed Stock
                          </th>
                          <th
                            className="text-uppercase fs-12 fw-semibold text-muted text-end"
                            style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", width: 170 }}
                          >
                            Available for Sale
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {locations.map((loc) => {
                          const s = stockMap[loc.id];
                          const fmt = (v?: number) => v != null ? Number(v).toFixed(2) : "—";
                          return (
                            <tr key={loc.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                              <td className="fs-14" style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                                <div className="d-flex align-items-center gap-1">
                                  <span>{loc.name}</span>
                                  {!!loc.is_primary && (
                                    <span title="Primary location" style={{ display: "inline-flex", flexShrink: 0 }}>
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                      </svg>
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="fs-14 text-end" style={{ padding: "12px 16px", verticalAlign: "middle", color: s ? "inherit" : "#bbb" }}>
                                {fmt(s?.stock_on_hand)}
                              </td>
                              <td className="fs-14 text-end" style={{ padding: "12px 16px", verticalAlign: "middle", color: s ? "inherit" : "#bbb" }}>
                                {fmt(s?.committed_stock)}
                              </td>
                              <td className="fs-14 text-end" style={{ padding: "12px 16px", verticalAlign: "middle", color: s ? "inherit" : "#bbb" }}>
                                {fmt(s?.available_for_sale)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Transactions ── */}
            {activeTab === "transactions" && (
              <div className="card border">
                <div className="card-body text-center py-5 text-muted">
                  <i className="ti ti-receipt fs-32 d-block mb-2" />
                  <p className="mb-0 fs-14">Transactions — coming soon</p>
                </div>
              </div>
            )}

            {/* ── Tab: History ── */}
            {activeTab === "history" && (
              <div>
                {/* Header row */}
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div>
                    <h6 className="fw-semibold mb-0 fs-15">Activity History</h6>
                    {!auditLoading && (
                      <span className="fs-13 text-muted">{auditTotal} {auditTotal === 1 ? "record" : "records"}</span>
                    )}
                  </div>
                  {!auditLoading && auditLastPage > 1 && (
                    <div className="d-flex align-items-center gap-2">
                      <span className="fs-13 text-muted">Page {auditPage} of {auditLastPage}</span>
                      <button type="button" className="btn btn-sm btn-outline-light shadow" disabled={auditPage <= 1}
                        onClick={() => setAuditPage(p => p - 1)} style={{ width: 30, height: 30, padding: 0 }}>
                        <i className="ti ti-chevron-left fs-14" />
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-light shadow" disabled={auditPage >= auditLastPage}
                        onClick={() => setAuditPage(p => p + 1)} style={{ width: 30, height: 30, padding: 0 }}>
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
                    {/* Continuous spine */}
                    <div style={{ position: "absolute", left: 17, top: 0, bottom: 0, width: 2, background: "#e9ecef", zIndex: 0 }} />
                    {auditLogs.map((log, idx) => {
                      const eventIcon: Record<string, string> = {
                        created:             "ti-plus",
                        updated:             "ti-pencil",
                        deleted:             "ti-trash",
                        restored:            "ti-refresh",
                        opening_stock_saved: "ti-building-warehouse",
                      };
                      const iconClass = eventIcon[log.event] ?? "ti-activity";

                      const SKIP_FIELDS = new Set(["updated_at", "created_at", "deleted_at", "entries"]);
                      const changedFields = Object.keys({ ...(log.old_values ?? {}), ...(log.new_values ?? {}) })
                        .filter(f => !SKIP_FIELDS.has(f));
                      const actor = log.user?.name ?? log.user?.email ?? "System";
                      const rawTs = log.created_at;
                      const utcTs = /Z$|[+-]\d{2}:\d{2}$/.test(rawTs) ? rawTs : rawTs.replace(' ', 'T') + 'Z';
                      const dateObj = new Date(utcTs);
                      const dateStr = dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                      const timeStr = dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

                      // Human-readable labels for top-level columns
                      const fieldLabel: Record<string, string> = {
                        name: "Item Name", item_type: "Item Type", unit: "Unit", sku: "SKU",
                        description: "Description", image: "Image", selling_price: "Selling Price",
                        cost_price: "Cost Price", track_inventory: "Track Inventory",
                        reorder_point: "Reorder Point", valuation_method: "Valuation Method",
                        is_returnable: "Returnable", has_sales_info: "Sales Info",
                        has_purchase_info: "Purchase Info", sales_description: "Sales Description",
                        purchase_description: "Purchase Description", preferred_vendor: "Preferred Vendor",
                        form_type: "Form Type", product_tag: "Product Tag",
                        variants: "Variants",
                      };

                      // Sub-key labels for known object JSON columns
                      const subKeyLabels: Record<string, Record<string, string>> = {
                        refs: {
                          brand_id:             "Brand",
                          category_id:          "Category",
                          hsn_code_id:          "HSN Code",
                          gst_rate_id:          "GST Rate",
                          sales_account_id:     "Sales Account",
                          purchase_account_id:  "Purchase Account",
                          inventory_account_id: "Inventory Account",
                        },
                        dimensions: { length: "Length", width: "Width", height: "Height", unit: "Dimension Unit" },
                        weight:     { value: "Weight",  unit: "Weight Unit" },
                        identifiers: { upc: "UPC", mpn: "MPN", ean: "EAN", isbn: "ISBN" },
                      };

                      const parseIfStr = (v: any): any => {
                        if (typeof v === "string") { try { return JSON.parse(v); } catch { return v; } }
                        return v;
                      };

                      type DiffRow = { key: string; label: string; oldVal: any; newVal: any };

                      const diffRows: DiffRow[] = changedFields.flatMap((field): DiffRow[] => {

                        // ── refs: backend already replaced IDs with names ──────────────────────
                        if (field === "refs") {
                          const rawOld = parseIfStr(log.old_values?.refs);
                          const rawNew = parseIfStr(log.new_values?.refs);
                          const oldS = (rawOld && typeof rawOld === "object" && !Array.isArray(rawOld)) ? rawOld : {};
                          const newS = (rawNew && typeof rawNew === "object" && !Array.isArray(rawNew)) ? rawNew : {};
                          const changed = Object.keys({ ...oldS, ...newS }).filter(
                            (k) => String(oldS[k] ?? "") !== String(newS[k] ?? "")
                          );
                          if (changed.length === 0) return [];
                          return changed.map((k) => ({
                            key:    `refs.${k}`,
                            label:  subKeyLabels.refs[k] ?? k,
                            oldVal: oldS[k] ?? null,
                            newVal: newS[k] ?? null,
                          }));
                        }

                        // ── dimensions: show numeric values with unit suffix ────────────────────
                        if (field === "dimensions") {
                          const rawOld = parseIfStr(log.old_values?.dimensions);
                          const rawNew = parseIfStr(log.new_values?.dimensions);
                          const oldS = (rawOld && typeof rawOld === "object" && !Array.isArray(rawOld)) ? rawOld : {};
                          const newS = (rawNew && typeof rawNew === "object" && !Array.isArray(rawNew)) ? rawNew : {};
                          const changed = Object.keys({ ...oldS, ...newS }).filter(
                            (k) => JSON.stringify(oldS[k]) !== JSON.stringify(newS[k])
                          );
                          if (changed.length === 0) return [];
                          const ctxUnit = newS.unit || oldS.unit || "";
                          return changed.map((k) => {
                            const withUnit = (v: any) =>
                              v != null && k !== "unit" && ctxUnit ? `${v} ${ctxUnit}` : v;
                            return {
                              key:    `dimensions.${k}`,
                              label:  subKeyLabels.dimensions[k] ?? k,
                              oldVal: withUnit(oldS[k] ?? null),
                              newVal: withUnit(newS[k] ?? null),
                            };
                          });
                        }

                        // ── weight: show value with unit suffix ───────────────────────────────
                        if (field === "weight") {
                          const rawOld = parseIfStr(log.old_values?.weight);
                          const rawNew = parseIfStr(log.new_values?.weight);
                          const oldS = (rawOld && typeof rawOld === "object" && !Array.isArray(rawOld)) ? rawOld : {};
                          const newS = (rawNew && typeof rawNew === "object" && !Array.isArray(rawNew)) ? rawNew : {};
                          const changed = Object.keys({ ...oldS, ...newS }).filter(
                            (k) => JSON.stringify(oldS[k]) !== JSON.stringify(newS[k])
                          );
                          if (changed.length === 0) return [];
                          const ctxUnit = newS.unit || oldS.unit || "";
                          return changed.map((k) => {
                            const withUnit = (v: any) =>
                              v != null && k === "value" && ctxUnit ? `${v} ${ctxUnit}` : v;
                            return {
                              key:    `weight.${k}`,
                              label:  subKeyLabels.weight[k] ?? k,
                              oldVal: withUnit(oldS[k] ?? null),
                              newVal: withUnit(newS[k] ?? null),
                            };
                          });
                        }

                        // ── identifiers: plain string values, no FKs ──────────────────────────
                        if (field === "identifiers") {
                          const rawOld = parseIfStr(log.old_values?.identifiers);
                          const rawNew = parseIfStr(log.new_values?.identifiers);
                          const oldS = (rawOld && typeof rawOld === "object" && !Array.isArray(rawOld)) ? rawOld : {};
                          const newS = (rawNew && typeof rawNew === "object" && !Array.isArray(rawNew)) ? rawNew : {};
                          const changed = Object.keys({ ...oldS, ...newS }).filter(
                            (k) => String(oldS[k] ?? "") !== String(newS[k] ?? "")
                          );
                          if (changed.length === 0) return [];
                          return changed.map((k) => ({
                            key:    `identifiers.${k}`,
                            label:  subKeyLabels.identifiers[k] ?? k.toUpperCase(),
                            oldVal: oldS[k] ?? null,
                            newVal: newS[k] ?? null,
                          }));
                        }

                        // ── custom_fields: use loaded label map for human-readable names ───────
                        if (field === "custom_fields") {
                          const rawOld = parseIfStr(log.old_values?.custom_fields);
                          const rawNew = parseIfStr(log.new_values?.custom_fields);
                          const oldS = (rawOld && typeof rawOld === "object" && !Array.isArray(rawOld)) ? rawOld : {};
                          const newS = (rawNew && typeof rawNew === "object" && !Array.isArray(rawNew)) ? rawNew : {};
                          const changed = Object.keys({ ...oldS, ...newS }).filter(
                            (k) => String(oldS[k] ?? "") !== String(newS[k] ?? "")
                          );
                          if (changed.length === 0) return [];
                          return changed.map((k) => ({
                            key:    `custom_fields.${k}`,
                            label:  cfLabels[k] ?? k,
                            oldVal: oldS[k] ?? null,
                            newVal: newS[k] ?? null,
                          }));
                        }

                        // ── variants: combo_key → { name, sku, cost_price, selling_price } ──
                        if (field === "variants") {
                          const oldV = parseIfStr(log.old_values?.variants);
                          const newV = parseIfStr(log.new_values?.variants);
                          const oldMap: Record<string, any> = (oldV && typeof oldV === "object" && !Array.isArray(oldV)) ? oldV : {};
                          const newMap: Record<string, any> = (newV && typeof newV === "object" && !Array.isArray(newV)) ? newV : {};
                          const allKeys = new Set([...Object.keys(oldMap), ...Object.keys(newMap)]);
                          const variantFieldLabel: Record<string, string> = {
                            name: "Name", sku: "SKU", cost_price: "Cost Price", selling_price: "Selling Price",
                          };
                          const rows: DiffRow[] = [];
                          for (const comboKey of allKeys) {
                            const oldFields = oldMap[comboKey];
                            const newFields = newMap[comboKey];
                            if (oldFields === null || oldFields === undefined) {
                              rows.push({ key: `variants.${comboKey}.__add`, label: comboKey, oldVal: null, newVal: "Added" });
                            } else if (newFields === null || newFields === undefined) {
                              rows.push({ key: `variants.${comboKey}.__rem`, label: comboKey, oldVal: "Removed", newVal: null });
                            } else {
                              for (const f of Object.keys({ ...oldFields, ...newFields })) {
                                const ov = oldFields[f];
                                const nv = newFields[f];
                                if (String(ov ?? "") !== String(nv ?? "")) {
                                  rows.push({
                                    key:    `variants.${comboKey}.${f}`,
                                    label:  `${comboKey} · ${variantFieldLabel[f] ?? f}`,
                                    oldVal: ov,
                                    newVal: nv,
                                  });
                                }
                              }
                            }
                          }
                          return rows;
                        }

                        // ── variation_config: array of {attribute, options[]} — diff by name ──
                        if (field === "variation_config") {
                          const rawOld = parseIfStr(log.old_values?.variation_config);
                          const rawNew = parseIfStr(log.new_values?.variation_config);
                          const oldArr: { attribute: string; options: string[] }[] = Array.isArray(rawOld) ? rawOld : [];
                          const newArr: { attribute: string; options: string[] }[] = Array.isArray(rawNew) ? rawNew : [];
                          const oldMap: Record<string, string[]> = {};
                          const newMap: Record<string, string[]> = {};
                          oldArr.forEach((a) => { oldMap[a.attribute] = a.options; });
                          newArr.forEach((a) => { newMap[a.attribute] = a.options; });
                          const allAttrs = new Set([...Object.keys(oldMap), ...Object.keys(newMap)]);
                          const changedAttrs = [...allAttrs].filter(
                            (a) => JSON.stringify(oldMap[a]) !== JSON.stringify(newMap[a])
                          );
                          if (changedAttrs.length === 0) return [];
                          return changedAttrs.map((attr) => ({
                            key:    `variation_config.${attr}`,
                            label:  `${attr} (Variant Options)`,
                            oldVal: oldMap[attr] != null ? oldMap[attr].join(", ") : null,
                            newVal: newMap[attr] != null ? newMap[attr].join(", ") : null,
                          }));
                        }

                        // ── Scalar fields ─────────────────────────────────────────────────────
                        const oldScalar = parseIfStr(log.old_values?.[field]);
                        const newScalar = parseIfStr(log.new_values?.[field]);
                        if (String(oldScalar ?? "") === String(newScalar ?? "")) return [];
                        return [{
                          key:    field,
                          label:  fieldLabel[field] ?? field,
                          oldVal: oldScalar,
                          newVal: newScalar,
                        }];
                      });

                      // Skip phantom "updated" entries where nothing visible changed
                      if (log.event === "updated" && diffRows.length === 0) return null;

                      const openingEntries: { location_name: string; opening_stock: number; opening_stock_value: number }[] =
                        log.event === "opening_stock_saved" && Array.isArray(log.new_values?.entries)
                          ? log.new_values.entries : [];

                      const eventMessages: Record<string, string> = {
                        created:             "Created item",
                        deleted:             "Deleted item",
                        restored:            "Restored item",
                        opening_stock_saved: `Opening stock set for ${openingEntries.length} location${openingEntries.length !== 1 ? "s" : ""}`,
                      };
                      let message = eventMessages[log.event];
                      if (!message && log.event === "updated") {
                        message = diffRows.length === 1
                          ? `Changed ${diffRows[0].label.toLowerCase()}`
                          : `Updated ${diffRows.length} fields`;
                      }
                      message = message ?? log.event.replace(/_/g, " ");

                      const isLast = idx === auditLogs.filter(Boolean).length - 1;

                      // ── Value formatter (string output for locationOverview-style spans) ──
                      const leafKey = (key: string) => key.split(".").at(-1) ?? key;
                      const boolFields  = new Set(["track_inventory", "is_returnable", "has_sales_info", "has_purchase_info"]);
                      const priceFields = new Set(["selling_price", "cost_price"]);
                      const enumMap: Record<string, Record<string, string>> = {
                        item_type:        { goods: "Goods", service: "Service" },
                        form_type:        { single: "Single Item", variants: "Variants" },
                        valuation_method: { fifo: "FIFO", average: "Weighted Average" },
                      };
                      const longFields = new Set(["description", "sales_description", "purchase_description"]);

                      const fmtVal = (v: any, key: string): string => {
                        if (v === null || v === undefined || v === "") return "—";
                        const lk = leafKey(key);
                        if (boolFields.has(lk)) return (v === true || v === 1 || v === "1") ? "Yes" : "No";
                        if (enumMap[lk]) return enumMap[lk][String(v)] ?? String(v);
                        if (priceFields.has(lk)) { const n = parseFloat(String(v)); if (!isNaN(n)) return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
                        if (typeof v === "boolean") return v ? "Yes" : "No";
                        if (longFields.has(key)) { const s = String(v); return s.length > 80 ? s.slice(0, 80) + "…" : s; }
                        return String(v);
                      };

                      return (
                        <div key={log.id} style={{ position: "relative", marginBottom: isLast ? 0 : 20 }}>

                          {/* Red icon circle */}
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

                              {/* Opening stock table */}
                              {log.event === "opening_stock_saved" && openingEntries.length > 0 && (
                                <div className="rounded mb-3 overflow-hidden" style={{ border: "1px solid #e9ecef" }}>
                                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                      <tr>
                                        {["Location", "Opening Stock", "Value / Unit"].map(h => (
                                          <th key={h} className="fs-12 text-uppercase text-muted fw-semibold"
                                            style={{ padding: "8px 14px", borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>{h}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {openingEntries.map((e, i) => (
                                        <tr key={i}>
                                          <td className="fs-13" style={{ padding: "8px 14px" }}>{e.location_name}</td>
                                          <td className="fs-13 fw-medium" style={{ padding: "8px 14px" }}>{Number(e.opening_stock).toFixed(2)}</td>
                                          <td className="fs-13 fw-medium" style={{ padding: "8px 14px" }}>₹{Number(e.opening_stock_value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}

                              {/* Diff rows */}
                              {log.event === "updated" && diffRows.length > 0 && (
                                <div className="rounded mb-3 overflow-hidden" style={{ border: "1px solid #e9ecef" }}>
                                  {diffRows.map((row, ri) => {
                                    const rowBg = { padding: "10px 14px", background: ri % 2 === 0 ? "#fff" : "#fafafa", borderTop: ri > 0 ? "1px solid #f1f3f5" : "none" };
                                    // Image field — render thumbnails instead of text
                                    if (row.key === "image") {
                                      const toSrc = (v: any) => {
                                        if (!v) return null;
                                        const s = String(v);
                                        return s.startsWith("http") || s.startsWith("/") ? s : `/storage/${s}`;
                                      };
                                      const oldSrc = toSrc(row.oldVal);
                                      const newSrc = toSrc(row.newVal);
                                      return (
                                        <div key={row.key} className="d-flex align-items-center gap-3" style={{ ...rowBg, paddingTop: 12, paddingBottom: 12 }}>
                                          <span className="text-muted fs-13 flex-shrink-0" style={{ width: 150 }}>Image</span>
                                          {oldSrc
                                            ? (
                                              <button type="button" onClick={() => setLightboxSrc(oldSrc)}
                                                style={{ padding: 0, border: "none", background: "none", cursor: "zoom-in", borderRadius: 6, position: "relative", flexShrink: 0 }}
                                                title="Click to enlarge">
                                                <img src={oldSrc} alt="Previous image" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6, border: "1px solid #dee2e6", opacity: 0.65, display: "block" }} />
                                                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, background: "rgba(0,0,0,0.18)" }}>
                                                  <i className="ti ti-zoom-in" style={{ color: "#fff", fontSize: 16 }} />
                                                </span>
                                              </button>
                                            )
                                            : <span className="fs-13 text-muted">—</span>
                                          }
                                          <i className="ti ti-arrow-right flex-shrink-0" style={{ fontSize: 12, color: "#adb5bd" }} />
                                          {newSrc
                                            ? (
                                              <button type="button" onClick={() => setLightboxSrc(newSrc)}
                                                style={{ padding: 0, border: "none", background: "none", cursor: "zoom-in", borderRadius: 6, position: "relative", flexShrink: 0 }}
                                                title="Click to enlarge">
                                                <img src={newSrc} alt="New image" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6, border: "1.5px solid #e03131", display: "block" }} />
                                                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, background: "rgba(0,0,0,0.18)" }}>
                                                  <i className="ti ti-zoom-in" style={{ color: "#fff", fontSize: 16 }} />
                                                </span>
                                              </button>
                                            )
                                            : <span className="fs-13 text-muted">—</span>
                                          }
                                        </div>
                                      );
                                    }
                                    if (row.key.endsWith(".__add")) return (
                                      <div key={row.key} className="d-flex align-items-center gap-3" style={rowBg}>
                                        <span className="text-muted fs-13 flex-shrink-0" style={{ width: 150 }}>{row.label}</span>
                                        <span className="fs-13 fw-semibold px-2 py-1 rounded" style={{ background: "#f0fff4", color: "#2f9e44" }}>Added</span>
                                      </div>
                                    );
                                    if (row.key.endsWith(".__rem")) return (
                                      <div key={row.key} className="d-flex align-items-center gap-3" style={rowBg}>
                                        <span className="text-muted fs-13 flex-shrink-0" style={{ width: 150 }}>{row.label}</span>
                                        <span className="fs-13 fw-semibold px-2 py-1 rounded" style={{ background: "#fff4f4", color: "#e03131" }}>Removed</span>
                                      </div>
                                    );
                                    return (
                                      <div key={row.key} className="d-flex align-items-center gap-3" style={rowBg}>
                                        <span className="text-muted fs-13 flex-shrink-0" style={{ width: 150 }}>{row.label}</span>
                                        <span className="fs-13 px-2 py-1 rounded text-decoration-line-through flex-shrink-0" style={{ background: "#f1f3f5", color: "#9ca3af" }}>{fmtVal(row.oldVal, row.key)}</span>
                                        <i className="ti ti-arrow-right flex-shrink-0" style={{ fontSize: 12, color: "#adb5bd" }} />
                                        <span className="fs-13 fw-semibold px-2 py-1 rounded" style={{ background: "#fff4f4", color: "#e03131" }}>{fmtVal(row.newVal, row.key)}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Actor */}
                              <div className="d-flex align-items-center gap-2 border-top pt-3">
                                <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 fw-semibold"
                                  style={{ width: 24, height: 24, background: "#f1f3f5", fontSize: 11, color: "#6c757d" }}>
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
      </div>{/* end two-pane shell */}
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

      {/* ── Confirm Dialog ── */}
      <ConfirmDialog config={confirmConfig} onClose={() => setConfirmConfig(null)} />

      {/* ── Image Lightbox ── */}
      {lightboxSrc && (
        <div
          onClick={() => setLightboxSrc(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 10000,
            background: "rgba(0,0,0,0.82)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "zoom-out",
          }}
        >
          <button
            type="button"
            onClick={() => setLightboxSrc(null)}
            style={{
              position: "absolute", top: 16, right: 20,
              background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%",
              width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff",
            }}
            title="Close"
          >
            <i className="ti ti-x" style={{ fontSize: 18 }} />
          </button>
          <img
            src={lightboxSrc}
            alt="Enlarged view"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw", maxHeight: "88vh",
              objectFit: "contain", borderRadius: 10,
              boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
              cursor: "default",
            }}
          />
        </div>
      )}

    </div>
  );
};

export default ItemOverview;
