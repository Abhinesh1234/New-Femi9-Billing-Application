import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Toast } from "react-bootstrap";
import Footer from "../../../../components/footer/footer";
import { fetchItem, fetchItems, uploadItemImage, updateItem, type ItemListRecord } from "../../../../core/services/itemApi";
import { fetchSettings, type ProductConfiguration } from "../../../../core/services/settingApi";
import { fetchItemAuditLogs, type AuditLogEntry } from "../../../../core/services/auditLogApi";
import { fetchCustomFields } from "../../../../core/services/customFieldApi";
import { fetchLocations, type LocationListItem } from "../../../../core/services/locationApi";
import { fetchItemStock, type ItemStockRow } from "../../../../core/services/openingStockApi";
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

// ── Main component ─────────────────────────────────────────────────────────────
const ItemOverview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const navState = useLocation().state as { tab?: Tab } | null;
  const [item, setItem] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(navState?.tab ?? "overview");

  // ── Items list (left panel) ──
  const [allItems, setAllItems] = useState<ItemListRecord[]>([]);
  const [listFilter, setListFilter] = useState<"all" | "goods" | "service">("all");
  const [listSearch, setListSearch] = useState("");
  const [showListSearch, setShowListSearch] = useState(false);

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
  const listScrollRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  // ── Toast ──
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger"; message: string }>({ show: false, type: "success", message: "" });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (type: "success" | "danger", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // Fetch current item detail
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const res = await fetchItem(Number(id));
      if (res.success) {
        const data = (res as any).data;
        setItem(data);
        setImagePreview(data?.image ? `/storage/${data.image}` : null);
      } else {
        setError((res as any).message);
      }
      setLoading(false);
    })();
  }, [id]);

  // Fetch all items for the left panel
  useEffect(() => {
    (async () => {
      const res = await fetchItems({ per_page: 200 });
      if (res.success) setAllItems((res as any).data.data);
    })();
  }, []);

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

  // Load audit logs when history tab is opened or page changes
  useEffect(() => {
    if (activeTab !== "history" || !id) return;
    (async () => {
      setAuditLoading(true);
      const res = await fetchItemAuditLogs(Number(id), auditPage);
      if (res.success) {
        setAuditLogs(res.data.data);
        setAuditLastPage(res.data.last_page);
        setAuditTotal(res.data.total);
      }
      setAuditLoading(false);
    })();
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

  const filteredListItems = useMemo(() => {
    let base = listFilter === "all" ? allItems : allItems.filter((i) => i.item_type === listFilter);
    if (listSearch.trim()) {
      const q = listSearch.toLowerCase();
      base = base.filter((i) => i.name.toLowerCase().includes(q));
    }
    return base;
  }, [allItems, listFilter, listSearch]);

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

  const filterLabel = listFilter === "all" ? "All Items" : listFilter === "goods" ? "Goods" : "Services";

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
          style={{
            width: 300,
            minWidth: 300,
            flexDirection: "column",
            borderRight: "1px solid #dee2e6",
            background: "#fff",
            overflow: "hidden",
          }}
        >
          {/* Panel header */}
          <div
            className="d-flex align-items-center gap-2 px-3 py-2"
            style={{ borderBottom: "1px solid #dee2e6", flexShrink: 0, minHeight: 48 }}
          >
            <div className="dropdown flex-grow-1">
              <button
                type="button"
                className="btn btn-sm btn-outline-light border-0 fw-semibold fs-14 px-1 dropdown-toggle"
                data-bs-toggle="dropdown"
              >
                {filterLabel}
              </button>
              <div className="dropdown-menu dropmenu-hover-primary">
                <ul>
                  <li><button className="dropdown-item" onClick={() => setListFilter("all")}>All Items</button></li>
                  <li><button className="dropdown-item" onClick={() => setListFilter("goods")}>Goods</button></li>
                  <li><button className="dropdown-item" onClick={() => setListFilter("service")}>Services</button></li>
                </ul>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary px-2"
              style={{ width: 28, height: 28, padding: 0, fontSize: 13 }}
              title="New Item"
              onClick={() => navigate(route.addItem)}
            >
              <i className="ti ti-plus" />
            </button>
            <div className="dropdown">
              <button type="button" className="btn btn-icon btn-outline-light shadow" data-bs-toggle="dropdown" style={{ width: 28, height: 28, fontSize: 13 }}>
                <i className="ti ti-dots" />
              </button>
              <div className="dropdown-menu dropdown-menu-end dropmenu-hover-primary">
                <ul>
                  <li>
                    <button
                      className="dropdown-item fs-13"
                      onClick={() => setShowListSearch((v) => !v)}
                    >
                      <i className="ti ti-search me-2" />Search
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item fs-13" onClick={() => navigate(route.itemsList)}>
                      <i className="ti ti-list me-2" />Full List View
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Search box (toggle) */}
          {showListSearch && (
            <div className="px-3 py-2" style={{ borderBottom: "1px solid #dee2e6", flexShrink: 0 }}>
              <div className="input-group input-group-sm">
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
              </div>
            </div>
          )}

          {/* Items list */}
          <div ref={listScrollRef} style={{ overflowY: "auto", flex: 1 }}>
            {filteredListItems.length === 0 ? (
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
                    className="d-flex align-items-center gap-2 px-3 py-2"
                    style={{
                      cursor: "pointer",
                      background: isActive ? "#fff1f0" : "transparent",
                      borderBottom: "1px solid #f0f2f5",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "#f8f9fa"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = isActive ? "#fff1f0" : "transparent"; }}
                  >
                    {/* Thumbnail */}
                    <div
                      className="rounded border d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                      style={{ width: 28, height: 28, background: "#f5f5f5" }}
                    >
                      {liImg
                        ? <img src={liImg} alt={li.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <i className="ti ti-photo text-muted" style={{ fontSize: 12 }} />
                      }
                    </div>
                    {/* Name */}
                    <span
                      className="flex-grow-1 text-truncate"
                      style={{
                        fontSize: 14,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? "#e03131" : "#212529",
                      }}
                    >
                      {li.name}
                    </span>
                    {/* Price */}
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

        {/* ── Right: Item overview detail ───────────────────────────────────── */}
        {/* Right: independently scrollable detail panel */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", background: "#fff" }}>
          <div style={{ padding: "1.25rem", flex: 1 }}>

            {/* ── Top action bar ── */}
            <div className="d-flex align-items-start justify-content-between mb-2 flex-wrap gap-2">
              <div>
                <h4 className="fw-semibold mb-2 lh-sm">{item.name}</h4>
                {item.is_returnable && (
                  <span className="text-muted fs-13 d-flex align-items-center gap-1 mb-0" style={{ lineHeight: "1.5" }}>
                    <i className="ti ti-refresh fs-14" />
                    Returnable Item
                  </span>
                )}
              </div>
              <div className="d-flex align-items-center gap-2">
                <Link
                  to="#"
                  className="btn btn-outline-light shadow"
                  title="Edit"
                  style={{ height: 36, width: 36, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                  onClick={(e) => { e.preventDefault(); navigate(item.is_composite ? `/composite-items/${id}/edit` : `/items/${id}/edit`); }}
                >
                  <i className="ti ti-pencil" />
                </Link>
                <button type="button" className="btn btn-primary" style={{ height: 36 }}>
                  <i className="ti ti-adjustments-horizontal me-1" />
                  Adjust Stock
                </button>
                <div className="dropdown">
                  <button type="button" className="btn btn-outline-light dropdown-toggle shadow px-3" style={{ height: 36 }} data-bs-toggle="dropdown">
                    More
                  </button>
                  <div className="dropdown-menu dropdown-menu-end dropmenu-hover-primary">
                    <ul>
                      <li><button className="dropdown-item"><i className="ti ti-copy me-2" />Duplicate</button></li>
                      <li><button className="dropdown-item text-danger"><i className="ti ti-trash me-2" />Delete</button></li>
                    </ul>
                  </div>
                </div>
                <Link to={route.itemsList} className="btn btn-outline-light shadow" title="Close"
                  style={{ height: 36, width: 36, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <i className="ti ti-x" />
                </Link>
              </div>
            </div>

            {/* ── Tab nav ── */}
            <div className="border-bottom mb-3 mt-5 mt-md-4">
              <ul className="nav" style={{ gap: 0, marginLeft: -10 }}>
                {tabs.map((t) => (
                  <li key={t.key} className="nav-item">
                    <button
                      type="button"
                      onClick={() => setActiveTab(t.key)}
                      className="nav-link border-0 bg-transparent"
                      style={{
                        color: activeTab === t.key ? "#e03131" : "#6c757d",
                        fontWeight: activeTab === t.key ? 600 : 400,
                        fontSize: 14,
                        lineHeight: "1.5",
                        padding: "5px 10px",
                        borderBottom: activeTab === t.key ? "2px solid #e03131" : "2px solid transparent",
                        borderRadius: 0,
                        marginBottom: -1,
                        transition: "color 0.15s, border-color 0.15s",
                      }}
                    >
                      {t.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Tab: Overview ── */}
            {activeTab === "overview" && (
              <div className="row g-3">

                {/* ── Left column ── */}
                <div className="col-lg-6">

                  {/* Primary Details */}
                  <h6 className="fw-semibold mb-3">Primary Details</h6>
                  <DetailRow
                    label="Item Name"
                    value={<span className="text-primary">{item.name}</span>}
                  />
                  <DetailRow
                    label="Item Type"
                    value={item.item_type === "goods" ? "Inventory Items" : "Service"}
                  />
                  <DetailRow label="Unit" value={fmt(item.unit)} />
                  <DetailRow label="Created Source" value="User" />
                  <DetailRow
                    label="Inventory Account"
                    value={fmt(item.inventory_account ?? item.account_name)}
                  />
                  {item.track_inventory && item.valuation_method && (
                    <DetailRow
                      label="Inventory Valuation Method"
                      value={VALUATION_LABELS[item.valuation_method] ?? item.valuation_method}
                    />
                  )}

                  {/* Purchase Information */}
                  {(item.cost_price || item.purchase_account) && (
                    <>
                      <h6 className="fw-semibold mt-4 mb-3">Purchase Information</h6>
                      <DetailRow label="Cost Price" value={fmtPrice(item.cost_price)} />
                      <DetailRow label="Purchase Account" value={fmt(item.purchase_account ?? "Cost of Goods Sold")} />
                    </>
                  )}

                  {/* Sales Information */}
                  {(item.selling_price || item.sales_account) && (
                    <>
                      <h6 className="fw-semibold mt-4 mb-3">Sales Information</h6>
                      <DetailRow label="Selling Price" value={fmtPrice(item.selling_price)} />
                      <DetailRow label="Sales Account" value={fmt(item.sales_account ?? "Sales")} />
                    </>
                  )}

                  {/* Reporting Tags */}
                  <h6 className="fw-semibold mt-4 mb-3">Reporting Tags</h6>
                  <p className="fs-14 text-muted mb-0">No reporting tag has been associated with this item.</p>

                  {/* Associated Price Lists */}
                  <div className="mt-4">
                    <Link to="#" className="fs-14 text-primary d-flex align-items-center gap-1">
                      Associated Price Lists
                      <i className="ti ti-chevron-right fs-14" />
                    </Link>
                  </div>

                </div>

                {/* ── Right column ── */}
                <div className="col-lg-6">

                  {/* Image upload */}
                  <label
                    htmlFor="overview_image_input"
                    className="border rounded d-flex flex-column align-items-center justify-content-center text-center mb-4 overflow-hidden position-relative"
                    style={{ cursor: imageUploading ? "wait" : "pointer", background: "#fafafa", height: 280 }}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt={item.name}
                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", padding: 12 }}
                      />
                    ) : (
                      <>
                        <i className="ti ti-photo-up text-primary fs-32 mb-2" />
                        <span className="fw-semibold fs-14">Item Image</span>
                        <small className="text-muted mt-1">Click to upload — PNG, JPG up to 10 MB</small>
                      </>
                    )}
                    {imageUploading && (
                      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: "rgba(255,255,255,0.7)" }}>
                        <span className="spinner-border spinner-border-sm text-primary" />
                      </div>
                    )}
                    {imagePreview && !imageUploading && (
                      <button
                        type="button"
                        className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 p-1 lh-1"
                        style={{ fontSize: 12, zIndex: 1 }}
                        onClick={async (e) => {
                          e.preventDefault();
                          const prevPreview = imagePreview;
                          setImagePreview(null);
                          setImageFile(null);
                          const res = await updateItem(Number(id), { image: null } as any);
                          if (!res.success) {
                            setImagePreview(prevPreview);
                            showToast("danger", res.message || "Failed to remove image.");
                          } else {
                            showToast("success", "Image removed successfully.");
                          }
                        }}
                      >
                        <i className="ti ti-x" />
                      </button>
                    )}
                  </label>
                  <input
                    id="overview_image_input"
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const prevPreview = imagePreview;
                      setImagePreview(URL.createObjectURL(file));
                      setImageFile(file);
                      setImageUploading(true);
                      const uploadRes = await uploadItemImage(file);
                      if (!uploadRes.success) {
                        setImageUploading(false);
                        setImagePreview(prevPreview);
                        setImageFile(null);
                        showToast("danger", uploadRes.message || "Failed to upload image.");
                        return;
                      }
                      const imagePath = (uploadRes as any).path as string;
                      const updateRes = await updateItem(Number(id), { image: imagePath } as any);
                      setImageUploading(false);
                      if (!updateRes.success) {
                        setImagePreview(prevPreview);
                        setImageFile(null);
                        showToast("danger", updateRes.message || "Failed to save image.");
                      } else {
                        showToast("success", "Image updated successfully.");
                      }
                    }}
                  />

                  <hr className="my-3" />

                  {/* Opening stock */}
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <i className="ti ti-building-warehouse fs-16 text-primary" />
                    <Link to="#" className="fs-14 text-primary fw-medium">Opening Stock</Link>
                    <i className="ti ti-info-circle fs-14 text-muted" />
                    <span className="ms-auto fs-14 fw-semibold">: 0.00</span>
                  </div>

                  {/* Stock */}
                  <div className="d-flex align-items-center gap-1 mb-2">
                    <span className="fs-14 fw-semibold">Stock</span>
                    <i className="ti ti-info-circle fs-14 text-muted" />
                  </div>
                  <StockRow label="Stock on Hand" />
                  <StockRow label="Committed Stock" />
                  <StockRow label="Available for Sale" />

                  <hr className="my-3" />

                  {/* Reorder Point */}
                  <p className="fs-14 fw-semibold mb-2" style={{ textDecorationLine: "underline", textDecorationStyle: "dashed", textUnderlineOffset: 3 }}>
                    Reorder Point
                  </p>

                  {notifyReorderEnabled ? (
                    /* ── Enabled: show value or + Add ── */
                    <div className="position-relative mb-4">
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

                      {/* Inline popover */}
                      {reorderPopoverOpen && (
                        <>
                          <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 99 }} onClick={() => setReorderPopoverOpen(false)} />
                          <div
                            className="position-absolute border rounded shadow bg-white p-3"
                            style={{ top: 32, left: 0, zIndex: 100, minWidth: 240 }}
                          >
                          <p className="fs-14 fw-semibold mb-3">Reorder Point</p>
                          <label className="fs-13 fw-medium text-danger mb-1">Set Reorder point*</label>
                          <input
                            type="number"
                            className="form-control form-control-sm mb-3"
                            min={0}
                            step={0.01}
                            value={reorderInput}
                            onChange={(e) => setReorderInput(e.target.value)}
                            autoFocus
                          />
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-danger me-2"
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
                                  showToast("danger", res.message || "Failed to update reorder point.");
                                }
                              }}
                            >
                              {reorderSaving ? <span className="spinner-border spinner-border-sm" /> : "Update"}
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-light"
                              onClick={() => setReorderPopoverOpen(false)}
                            >
                              Cancel
                            </button>
                          </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    /* ── Disabled: prompt to enable in settings ── */
                    <div className="rounded p-3 mb-4" style={{ background: "#fff8f0", border: "1px solid #fde8c8" }}>
                      <p className="fs-14 mb-0" style={{ color: "#7a5c2e" }}>
                        You have to enable reorder notification before setting reorder point for items.{" "}
                        <Link to={`${route.projectSettings}?highlight=notify-reorder`} className="text-primary">Click here</Link>
                      </p>
                    </div>
                  )}


                </div>

                {/* ── Full-width: Associated Components (composite items only) ── */}
                {item.is_composite && Array.isArray(item.components) && (item.components as any[]).length > 0 && (
                  <div className="col-12">
                    <hr className="mt-0 mb-3" />
                    <h6 className="fw-semibold fs-14 mb-3">
                      Associated Products
                      <span className="ms-2 badge badge-soft-secondary fs-12 fw-medium">
                        {item.composite_type === "assembly" ? "Assembly" : item.composite_type === "kit" ? "Kit" : ""}
                      </span>
                    </h6>

                    <div style={{ border: "1px solid #dee2e6", borderRadius: 8, overflow: "hidden" }}>

                      {/* Header */}
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
                              <th className="text-uppercase fs-12 fw-semibold text-muted" style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", width: 56, whiteSpace: "nowrap" }} />
                              <th className="text-uppercase fs-12 fw-semibold text-muted" style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", whiteSpace: "nowrap" }}>Item Name</th>
                              <th className="text-uppercase fs-12 fw-semibold text-muted" style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", width: 100, whiteSpace: "nowrap" }}>Type</th>
                              <th className="text-uppercase fs-12 fw-semibold text-muted" style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", width: 120, whiteSpace: "nowrap" }}>SKU</th>
                              <th className="text-uppercase fs-12 fw-semibold text-muted" style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", width: 80, whiteSpace: "nowrap" }}>Unit</th>
                              <th className="text-uppercase fs-12 fw-semibold text-muted text-end" style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", width: 80, whiteSpace: "nowrap" }}>Qty</th>
                              <th className="text-uppercase fs-12 fw-semibold text-muted text-end" style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", width: 120, whiteSpace: "nowrap" }}>Selling (₹)</th>
                              <th className="text-uppercase fs-12 fw-semibold text-muted text-end" style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", width: 120, whiteSpace: "nowrap" }}>Cost (₹)</th>
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
                                  {/* Thumbnail */}
                                  <td style={{ padding: "10px 16px", verticalAlign: "middle" }}>
                                    <div
                                      className="rounded border d-flex align-items-center justify-content-center overflow-hidden"
                                      style={{ width: 36, height: 36, background: "#f8f9fa", flexShrink: 0 }}
                                    >
                                      {ciImg
                                        ? <img src={ciImg} alt={ci.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        : <i className="ti ti-photo text-muted" style={{ fontSize: 14 }} />
                                      }
                                    </div>
                                  </td>
                                  {/* Name */}
                                  <td style={{ padding: "10px 16px", verticalAlign: "middle" }}>
                                    <div className="fw-medium fs-14">{ci.name ?? "—"}</div>
                                    {ci.sku && <div className="fs-12 text-muted">{ci.sku}</div>}
                                  </td>
                                  {/* Type */}
                                  <td style={{ padding: "10px 16px", verticalAlign: "middle" }}>
                                    <span className={`badge ${comp.component_type === "service" ? "badge-soft-primary" : "badge-soft-secondary"} fs-12`}>
                                      {comp.component_type === "service" ? "Service" : "Item"}
                                    </span>
                                  </td>
                                  {/* SKU */}
                                  <td className="fs-13 text-muted" style={{ padding: "10px 16px", verticalAlign: "middle" }}>{ci.sku ?? "—"}</td>
                                  {/* Unit */}
                                  <td className="fs-13 text-muted" style={{ padding: "10px 16px", verticalAlign: "middle" }}>{ci.unit ?? "—"}</td>
                                  {/* Qty */}
                                  <td className="fs-14 fw-medium text-end" style={{ padding: "10px 16px", verticalAlign: "middle" }}>
                                    {qty % 1 === 0 ? qty : qty.toFixed(2)}
                                  </td>
                                  {/* Selling Price */}
                                  <td className="fs-14 text-end" style={{ padding: "10px 16px", verticalAlign: "middle" }}>
                                    {sp != null ? `₹${sp.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : <span className="text-muted">—</span>}
                                  </td>
                                  {/* Cost Price */}
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

                {/* ── Full-width: Sales Order Summary chart ── */}
                <div className="col-12">
                  <hr className="mt-0 mb-3" />
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="fw-semibold mb-0 fs-14">
                      Sales Order Summary <span className="text-muted fw-normal">(In INR)</span>
                    </h6>
                    <div className="dropdown">
                      <button type="button" className="btn btn-sm btn-outline-light shadow dropdown-toggle px-2 fs-12" data-bs-toggle="dropdown">
                        This Month
                      </button>
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

              </div>
            )}

            {/* ── Tab: Locations ── */}
            {activeTab === "locations" && (
              <div>
                {/* Header */}
                <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <h6 className="fw-semibold fs-15 mb-0">Stock Locations</h6>
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
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <h6 className="fw-semibold mb-0">Activity History</h6>
                    {!auditLoading && (
                      <span className="fs-13 text-muted">{auditTotal} {auditTotal === 1 ? "entry" : "entries"}</span>
                    )}
                  </div>
                </div>

                {auditLoading ? (
                  <div className="text-center py-5 text-muted">
                    <span className="spinner-border spinner-border-sm text-primary me-2" />
                    <span className="fs-14">Loading history…</span>
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="ti ti-history fs-40 d-block mb-2" />
                    <p className="fs-14 mb-0">No history recorded yet.</p>
                  </div>
                ) : (
                  <div className="position-relative">
                    {/* Single continuous spine line from first icon centre to last icon centre */}
                    <div style={{ position: "absolute", left: 17, top: 18, bottom: 18, width: 2, background: "#dee2e6", zIndex: 0 }} />
                    {auditLogs.map((log, idx) => {
                      const isLast = idx === auditLogs.length - 1;
                      const eventColor: Record<string, string> = {
                        created:              "bg-success",
                        updated:              "bg-primary",
                        deleted:              "bg-danger",
                        restored:             "bg-warning",
                        opening_stock_saved:  "bg-info",
                      };
                      const eventIcon: Record<string, string> = {
                        created:              "ti-plus",
                        updated:              "ti-pencil",
                        deleted:              "ti-trash",
                        restored:             "ti-refresh",
                        opening_stock_saved:  "ti-building-warehouse",
                      };
                      const eventLabel: Record<string, string> = {
                        created:              "Created",
                        updated:              "Updated",
                        deleted:              "Deleted",
                        restored:             "Restored",
                        opening_stock_saved:  "Opening Stock Saved",
                      };
                      const bgClass   = eventColor[log.event] ?? "bg-secondary";
                      const iconClass = eventIcon[log.event]  ?? "ti-activity";
                      const label     = eventLabel[log.event] ?? log.event.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

                      const changedFields = log.new_values ? Object.keys(log.new_values) : [];
                      const actor = log.user?.name ?? log.user?.email ?? "System";
                      const dateObj = new Date(log.created_at);
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
                        return [{
                          key:    field,
                          label:  fieldLabel[field] ?? field,
                          oldVal: parseIfStr(log.old_values?.[field]),
                          newVal: parseIfStr(log.new_values?.[field]),
                        }];
                      });

                      // Skip phantom "updated" entries where nothing visible changed
                      if (log.event === "updated" && diffRows.length === 0) return null;

                      // Opening stock entries for rendering
                      const openingEntries: { location_name: string; opening_stock: number; opening_stock_value: number }[] =
                        log.event === "opening_stock_saved" && Array.isArray(log.new_values?.entries)
                          ? log.new_values.entries
                          : [];

                      return (
                        <div key={log.id} className={`d-flex gap-3 align-items-center position-relative ${isLast ? "" : "mb-4"}`}>
                          {/* Icon dot — sits on top of the spine line */}
                          <div style={{ width: 36, flexShrink: 0, zIndex: 1 }}>
                            <div
                              className={`d-flex align-items-center justify-content-center rounded-circle ${bgClass} text-white`}
                              style={{ width: 36, height: 36, fontSize: 15 }}
                            >
                              <i className={`ti ${iconClass}`} />
                            </div>
                          </div>

                          {/* Entry card */}
                          <div className="flex-grow-1">
                            <div className="card mb-0" style={{ borderRadius: 10, background: "#fff", border: "1px solid #e2e5ea" }}>
                              <div className="card-body p-3">
                                {/* Top row: event label + date/time */}
                                <div className="d-flex align-items-start justify-content-between mb-2 flex-wrap gap-1">
                                  <div className="d-flex align-items-center gap-2">
                                    <span className={`badge ${bgClass} fs-12`}>{label}</span>
                                    <span className="fs-14 fw-medium text-dark">
                                      {log.event === "created"             ? "Item was created"  :
                                       log.event === "deleted"             ? "Item was deleted"  :
                                       log.event === "restored"            ? "Item was restored" :
                                       log.event === "opening_stock_saved" ? `Opening stock set for ${openingEntries.length} location${openingEntries.length !== 1 ? "s" : ""}` :
                                       diffRows.length === 1
                                         ? `${diffRows[0].label} was changed`
                                         : `${diffRows.length} field${diffRows.length !== 1 ? "s" : ""} updated`}
                                    </span>
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

                                {/* Opening stock entries */}
                                {log.event === "opening_stock_saved" && openingEntries.length > 0 && (
                                  <div className="mt-2 border-top pt-2">
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                      <thead>
                                        <tr>
                                          {["Location", "Opening Stock", "Value / Unit"].map((h) => (
                                            <th key={h} className="fs-12 text-uppercase text-muted fw-semibold" style={{ padding: "4px 8px", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {openingEntries.map((e, i) => (
                                          <tr key={i}>
                                            <td className="fs-13" style={{ padding: "4px 8px" }}>{e.location_name}</td>
                                            <td className="fs-13 fw-medium" style={{ padding: "4px 8px" }}>{Number(e.opening_stock).toFixed(2)}</td>
                                            <td className="fs-13 fw-medium" style={{ padding: "4px 8px" }}>₹{Number(e.opening_stock_value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}

                                {/* Changed fields (updated event) */}
                                {log.event === "updated" && diffRows.length > 0 && (
                                  <div className="mt-2 border-top pt-2">
                                    {diffRows.map((row) => {
                                      // ── Add / Remove markers (variant add/remove) ──────────────
                                      if (row.key.endsWith(".__add")) {
                                        return (
                                          <div key={row.key} className="d-flex align-items-center gap-2 py-1 flex-wrap">
                                            <span className="fs-13 text-muted" style={{ minWidth: 150 }}>{row.label}</span>
                                            <span className="badge badge-soft-success fs-12">Added</span>
                                          </div>
                                        );
                                      }
                                      if (row.key.endsWith(".__rem")) {
                                        return (
                                          <div key={row.key} className="d-flex align-items-center gap-2 py-1 flex-wrap">
                                            <span className="fs-13 text-muted" style={{ minWidth: 150 }}>{row.label}</span>
                                            <span className="badge badge-soft-danger fs-12">Removed</span>
                                          </div>
                                        );
                                      }

                                      // ── Field key helpers ─────────────────────────────────────
                                      // e.g. "variants.Red-S.selling_price" → "selling_price"
                                      const leafKey = row.key.split(".").at(-1) ?? row.key;

                                      const boolFields  = new Set(["track_inventory", "is_returnable", "has_sales_info", "has_purchase_info"]);
                                      const priceFields = new Set(["selling_price", "cost_price"]);
                                      const enumMap: Record<string, Record<string, string>> = {
                                        item_type:        { goods: "Goods", service: "Service" },
                                        form_type:        { single: "Single Item", variants: "Variants" },
                                        valuation_method: { fifo: "FIFO", average: "Weighted Average" },
                                      };
                                      const longFields  = new Set(["description", "sales_description", "purchase_description"]);

                                      const fmt = (v: any): React.ReactNode => {
                                        if (v === null || v === undefined || v === "")
                                          return <span className="text-muted fst-italic">empty</span>;

                                        // Boolean fields — stored as 0/1 integers in raw audit values
                                        if (boolFields.has(leafKey))
                                          return (v === true || v === 1 || v === "1") ? "Yes" : "No";

                                        // ENUM pretty labels
                                        if (enumMap[row.key])
                                          return enumMap[row.key][String(v)] ?? String(v);

                                        // Price fields — stored as decimal strings e.g. "100.0000"
                                        if (priceFields.has(leafKey)) {
                                          const n = parseFloat(String(v));
                                          if (!isNaN(n))
                                            return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                        }

                                        // Boolean (actual JS boolean)
                                        if (typeof v === "boolean") return v ? "Yes" : "No";

                                        // Image
                                        if (row.key === "image") return (
                                          <a href={`/storage/${v}`} target="_blank" rel="noreferrer" download
                                            className="d-inline-flex align-items-center gap-1 fs-13 text-primary" style={{ textDecoration: "none" }}>
                                            <i className="ti ti-photo fs-13" /> View image
                                          </a>
                                        );

                                        // Long text — truncate descriptions
                                        if (longFields.has(row.key)) {
                                          const s = String(v);
                                          return s.length > 80 ? s.slice(0, 80) + "…" : s;
                                        }

                                        return String(v);
                                      };

                                      return (
                                        <div key={row.key} className="d-flex align-items-center gap-2 py-1 flex-wrap">
                                          <span className="fs-13 text-muted" style={{ minWidth: 150 }}>{row.label}</span>
                                          <span className="fs-13 text-danger text-decoration-line-through">{fmt(row.oldVal)}</span>
                                          <i className="ti ti-arrow-right fs-12 text-muted" />
                                          <span className="fs-13 text-success fw-medium">{fmt(row.newVal)}</span>
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
                )}

                {/* Pagination */}
                {!auditLoading && auditLastPage > 1 && (
                  <div className="d-flex align-items-center justify-content-between mt-4 pt-3 border-top">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-light shadow"
                      disabled={auditPage <= 1}
                      onClick={() => setAuditPage((p) => p - 1)}
                    >
                      <i className="ti ti-chevron-left me-1" />Prev
                    </button>
                    <span className="fs-13 text-muted">Page {auditPage} of {auditLastPage}</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-light shadow"
                      disabled={auditPage >= auditLastPage}
                      onClick={() => setAuditPage((p) => p + 1)}
                    >
                      Next<i className="ti ti-chevron-right ms-1" />
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
          <Footer />
        </div>{/* end right scroll area */}
      </div>{/* end two-pane shell */}

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
  );
};

export default ItemOverview;
