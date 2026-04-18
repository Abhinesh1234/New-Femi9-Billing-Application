import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Toast } from "react-bootstrap";
import Footer from "../../../../components/footer/footer";
import { fetchPriceList, fetchPriceLists, type PriceListRecord } from "../../../../core/services/priceListApi";
import { fetchPriceListAuditLogs, type AuditLogEntry } from "../../../../core/services/auditLogApi";
import { all_routes } from "../../../../routes/all_routes";

const route = all_routes;

type Tab = "overview" | "history";

// ── Stock row helper ───────────────────────────────────────────────────────────
function StockRow({ label, value = "—" }: { label: string; value?: string }) {
  return (
    <div className="d-flex align-items-center justify-content-between py-1">
      <span
        className="fs-14 text-muted"
        style={{ textDecorationLine: "underline", textDecorationStyle: "dashed", textUnderlineOffset: 3 }}
      >
        {label}
      </span>
      <span className="fs-14 fw-medium">: {value}</span>
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

// ── Main component ─────────────────────────────────────────────────────────────
const PriceListOverview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [record, setRecord]     = useState<Record<string, any> | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // ── Left panel ──
  const [allLists, setAllLists]             = useState<PriceListRecord[]>([]);
  const [listFilter, setListFilter]         = useState<"all" | "sales" | "purchase" | "both">("all");
  const [listSearch, setListSearch]         = useState("");
  const [showListSearch, setShowListSearch] = useState(false);

  // ── Audit log (history tab) ──
  const [auditLogs,     setAuditLogs]     = useState<AuditLogEntry[]>([]);
  const [auditLoading,  setAuditLoading]  = useState(false);
  const [auditPage,     setAuditPage]     = useState(1);
  const [auditLastPage, setAuditLastPage] = useState(1);
  const [auditTotal,    setAuditTotal]    = useState(0);

  // ── Refs for scroll ──
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

  // Fetch current price list detail
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const res = await fetchPriceList(Number(id));
      if (res.success) {
        setRecord((res as any).data);
      } else {
        setError((res as any).message);
      }
      setLoading(false);
    })();
  }, [id]);

  // Fetch all price lists for the left panel
  useEffect(() => {
    (async () => {
      const res = await fetchPriceLists({ per_page: 200 });
      if (res.success) setAllLists((res as any).data.data);
    })();
  }, []);

  // Load audit logs when history tab is opened or page changes
  useEffect(() => {
    if (activeTab !== "history" || !id) return;
    (async () => {
      setAuditLoading(true);
      const res = await fetchPriceListAuditLogs(Number(id), auditPage);
      if (res.success) {
        setAuditLogs(res.data.data);
        setAuditLastPage(res.data.last_page);
        setAuditTotal(res.data.total);
      }
      setAuditLoading(false);
    })();
  }, [activeTab, id, auditPage]);

  // Scroll active item into view
  useEffect(() => {
    const timer = setTimeout(() => {
      activeItemRef.current?.scrollIntoView({ block: "center", behavior: "instant" });
    }, 50);
    return () => clearTimeout(timer);
  }, [id, allLists]);

  const filteredLists = useMemo(() => {
    let base = listFilter === "all" ? allLists : allLists.filter((l) => l.transaction_type === listFilter);
    if (listSearch.trim()) {
      const q = listSearch.toLowerCase();
      base = base.filter((l) => l.name.toLowerCase().includes(q));
    }
    return base;
  }, [allLists, listFilter, listSearch]);

  const fmt = (val: any) =>
    val === null || val === undefined || val === "" ? "—" : String(val);

  // ── Loading ──
  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
          <span className="spinner-border spinner-border-sm me-2 text-primary" />
          <span className="text-muted">Loading price list…</span>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Error ──
  if (error || !record) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="alert alert-danger">{error ?? "Price list not found."}</div>
          <Link to={route.priceList} className="btn btn-outline-light">
            <i className="ti ti-arrow-left me-1" /> Back to Price Lists
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

  const settings   = record.settings ?? {};
  const isAllItems = record.price_list_type === "all_items";
  const items      = record.items ?? [];

  const txnMap: Record<string, { label: string; cls: string }> = {
    sales:    { label: "Sales",    cls: "badge-soft-success" },
    purchase: { label: "Purchase", cls: "badge-soft-warning" },
    both:     { label: "Both",     cls: "badge-soft-info"    },
  };
  const txn = txnMap[record.transaction_type] ?? { label: record.transaction_type, cls: "badge-soft-secondary" };

  const filterLabel =
    listFilter === "all"      ? "All Price Lists" :
    listFilter === "sales"    ? "Sales"           :
    listFilter === "purchase" ? "Purchase"        : "Both";

  const createdStr = record.created_at
    ? new Date(record.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";
  const updatedStr = record.updated_at
    ? new Date(record.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    /* Override page-wrapper's min-height so it acts as a fixed viewport container */
    <div
      className="page-wrapper"
      style={{ height: "calc(100vh - 57px)", minHeight: "unset", overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      {/* ═══ Two-pane shell ═══════════════════════════════════════════════════ */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Left: Price Lists panel ───────────────────────────────────────── */}
        <div
          className="d-none d-md-flex"
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
              <div className="dropdown-menu">
                <ul>
                  <li><button className="dropdown-item" onClick={() => setListFilter("all")}>All Price Lists</button></li>
                  <li><button className="dropdown-item" onClick={() => setListFilter("sales")}>Sales</button></li>
                  <li><button className="dropdown-item" onClick={() => setListFilter("purchase")}>Purchase</button></li>
                  <li><button className="dropdown-item" onClick={() => setListFilter("both")}>Both</button></li>
                </ul>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary px-2"
              style={{ width: 28, height: 28, padding: 0, fontSize: 13 }}
              title="New Price List"
              onClick={() => navigate(route.newPriceList)}
            >
              <i className="ti ti-plus" />
            </button>
            <div className="dropdown">
              <button type="button" className="btn btn-icon btn-outline-light shadow" data-bs-toggle="dropdown" style={{ width: 28, height: 28, fontSize: 13 }}>
                <i className="ti ti-dots" />
              </button>
              <div className="dropdown-menu dropdown-menu-end">
                <ul>
                  <li>
                    <button className="dropdown-item fs-13" onClick={() => setShowListSearch((v) => !v)}>
                      <i className="ti ti-search me-2" />Search
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item fs-13" onClick={() => navigate(route.priceList)}>
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
                  placeholder="Search price lists…"
                  value={listSearch}
                  onChange={(e) => setListSearch(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Price Lists list */}
          <div ref={listScrollRef} style={{ overflowY: "auto", flex: 1 }}>
            {filteredLists.length === 0 ? (
              <div className="text-center py-4 text-muted fs-13">
                <i className="ti ti-mood-empty d-block fs-24 mb-1" />
                No price lists found
              </div>
            ) : (
              filteredLists.map((pl) => {
                const isActive = String(pl.id) === id;
                const plTxn = txnMap[pl.transaction_type] ?? { label: pl.transaction_type, cls: "badge-soft-secondary" };
                return (
                  <div
                    key={pl.id}
                    ref={isActive ? activeItemRef : undefined}
                    onClick={() => navigate(`/price-list/${pl.id}`)}
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
                    {/* Icon box */}
                    <div
                      className="rounded border d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 28, height: 28, background: "#f5f5f5" }}
                    >
                      <i className="ti ti-tag text-muted" style={{ fontSize: 12 }} />
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
                      {pl.name}
                    </span>
                    {/* Transaction type badge */}
                    <span className={`badge ${plTxn.cls} flex-shrink-0`} style={{ fontSize: 10 }}>
                      {plTxn.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right: Price List detail ───────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", background: "#fff" }}>
          <div style={{ padding: "1.25rem", flex: 1 }}>

            {/* ── Top action bar ── */}
            <div className="d-flex align-items-start justify-content-between mb-2 flex-wrap gap-2">
              <div>
                <h4 className="fw-semibold mb-2 lh-sm">{record.name}</h4>
                <div className="d-flex align-items-center gap-2">
                  <span className={`badge ${txn.cls}`}>{txn.label}</span>
                  <span className={`badge ${record.is_active ? "badge-soft-success" : "badge-soft-danger"}`}>
                    {record.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Link
                  to="#"
                  className="btn btn-outline-light shadow"
                  title="Edit"
                  style={{ height: 36, width: 36, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                  onClick={(e) => { e.preventDefault(); navigate(`/price-list/${id}/edit`); }}
                >
                  <i className="ti ti-pencil" />
                </Link>
                <div className="dropdown">
                  <button type="button" className="btn btn-outline-light dropdown-toggle shadow px-3" style={{ height: 36 }} data-bs-toggle="dropdown">
                    More
                  </button>
                  <div className="dropdown-menu dropdown-menu-end">
                    <ul>
                      <li><button className="dropdown-item text-danger"><i className="ti ti-trash me-2" />Delete</button></li>
                    </ul>
                  </div>
                </div>
                <Link
                  to={route.priceList}
                  className="btn btn-outline-light shadow"
                  title="Close"
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

            {/* ══ Tab: Overview ══════════════════════════════════════════════════ */}
            {activeTab === "overview" && (
              <div className="row g-3">

                {/* ── Left column ── */}
                <div className="col-lg-6">

                  {/* Primary Details */}
                  <h6 className="fw-semibold mb-3">Primary Details</h6>
                  <DetailRow
                    label="Name"
                    value={<span className="text-primary">{record.name}</span>}
                  />
                  <DetailRow
                    label="Transaction Type"
                    value={<span className={`badge ${txn.cls}`}>{txn.label}</span>}
                  />
                  <DetailRow
                    label="Price List Type"
                    value={
                      <span className={`badge ${isAllItems ? "badge-soft-purple" : "badge-soft-info"}`}>
                        {isAllItems ? "All Items" : "Individual Items"}
                      </span>
                    }
                  />
                  <DetailRow
                    label="Customer Category"
                    value={fmt(record.customer_category_name ?? record.customer_category_id)}
                  />
                  <DetailRow label="Description" value={fmt(record.description)} />
                  <DetailRow
                    label="Status"
                    value={
                      <span className={`badge ${record.is_active ? "badge-soft-success" : "badge-soft-danger"}`}>
                        {record.is_active ? "Active" : "Inactive"}
                      </span>
                    }
                  />
                  <DetailRow
                    label="Admin Only"
                    value={
                      record.admin_only
                        ? <span className="badge badge-soft-warning">Admins Only</span>
                        : <span className="text-muted fs-14">No</span>
                    }
                  />

                  {/* Pricing Settings */}
                  <h6 className="fw-semibold mt-4 mb-3">Pricing Settings</h6>

                  {isAllItems ? (
                    <>
                      <DetailRow
                        label="Adjustment Method"
                        value={settings.adjustment_method
                          ? String(settings.adjustment_method).charAt(0).toUpperCase() + String(settings.adjustment_method).slice(1)
                          : "—"}
                      />
                      <DetailRow
                        label="Percentage"
                        value={settings.percentage != null ? `${settings.percentage}%` : "—"}
                      />
                      <DetailRow label="Round Off" value={fmt(settings.round_off)} />
                    </>
                  ) : (
                    <>
                      <DetailRow
                        label="Pricing Scheme"
                        value={settings.pricing_scheme === "volume" ? "Volume Pricing" : "Unit Pricing"}
                      />
                      <DetailRow label="Currency" value={fmt(settings.currency)} />
                      <DetailRow
                        label="Include Discount"
                        value={settings.include_discount ? "Yes" : "No"}
                      />
                    </>
                  )}

                </div>

                {/* ── Right column ── */}
                <div className="col-lg-6">

                  {/* Summary box — mirrors image upload box from itemOverview */}
                  <div
                    className="border rounded d-flex flex-column align-items-center justify-content-center text-center mb-4 overflow-hidden"
                    style={{ background: "#fafafa", height: 280 }}
                  >
                    <i className="ti ti-tag text-primary fs-32 mb-2" />
                    <span className="fw-semibold fs-14 mb-2 px-4 w-100 text-center text-truncate">{record.name}</span>
                    <div className="d-flex align-items-center gap-2 flex-wrap justify-content-center px-3">
                      <span className={`badge ${txn.cls}`}>{txn.label}</span>
                      <span className={`badge ${record.is_active ? "badge-soft-success" : "badge-soft-danger"}`}>
                        {record.is_active ? "Active" : "Inactive"}
                      </span>
                      <span className={`badge ${isAllItems ? "badge-soft-purple" : "badge-soft-info"}`}>
                        {isAllItems ? "All Items" : "Individual Items"}
                      </span>
                    </div>
                    {isAllItems && settings.percentage != null && (
                      <p className="fs-13 text-muted mt-3 mb-0">
                        {settings.adjustment_method === "markup" ? "Markup" : "Markdown"}{" "}
                        <span className="fw-semibold">{settings.percentage}%</span> on all items
                      </p>
                    )}
                    {!isAllItems && (
                      <p className="fs-13 text-muted mt-3 mb-0">
                        <span className="fw-semibold">{items.length}</span>{" "}
                        item{items.length !== 1 ? "s" : ""} with custom pricing
                      </p>
                    )}
                  </div>

                  <hr className="my-3" />

                  {/* Created On — mirrors Opening Stock row */}
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <i className="ti ti-calendar-plus fs-16 text-primary" />
                    <span className="fs-14 text-primary fw-medium">Created On</span>
                    <i className="ti ti-info-circle fs-14 text-muted" />
                    <span className="ms-auto fs-14 fw-semibold">: {createdStr}</span>
                  </div>

                  {/* Last Updated — mirrors Opening Stock row */}
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <i className="ti ti-calendar-event fs-16 text-primary" />
                    <span className="fs-14 text-primary fw-medium">Last Updated</span>
                    <i className="ti ti-info-circle fs-14 text-muted" />
                    <span className="ms-auto fs-14 fw-semibold">: {updatedStr}</span>
                  </div>

                  <hr className="my-3" />

                  {/* Pricing Summary — mirrors Stock section */}
                  <div className="d-flex align-items-center gap-1 mb-2">
                    <span className="fs-14 fw-semibold">Pricing Summary</span>
                    <i className="ti ti-info-circle fs-14 text-muted" />
                  </div>

                  {isAllItems ? (
                    <>
                      <StockRow
                        label="Adjustment Method"
                        value={settings.adjustment_method
                          ? String(settings.adjustment_method).charAt(0).toUpperCase() + String(settings.adjustment_method).slice(1)
                          : "—"}
                      />
                      <StockRow
                        label="Adjustment %"
                        value={settings.percentage != null ? `${settings.percentage}%` : "—"}
                      />
                      <StockRow label="Round Off" value={fmt(settings.round_off)} />
                    </>
                  ) : (
                    <>
                      <StockRow
                        label="Pricing Scheme"
                        value={settings.pricing_scheme === "volume" ? "Volume Pricing" : "Unit Pricing"}
                      />
                      <StockRow label="Currency" value={fmt(settings.currency)} />
                      <StockRow label="Include Discount" value={settings.include_discount ? "Yes" : "No"} />
                    </>
                  )}

                </div>

                {/* ── Full-width: Item Pricing table — mirrors Sales Order Summary section ── */}
                {!isAllItems && (
                  <div className="col-12">
                    <hr className="mt-0 mb-3" />
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <h6 className="fw-semibold mb-0 fs-14">
                        Item Pricing <span className="text-muted fw-normal">(Custom Rates)</span>
                      </h6>
                    </div>

                    {items.length === 0 ? (
                      <div className="border rounded px-3 py-2 mt-2 d-flex align-items-center justify-content-center text-muted" style={{ minHeight: 80 }}>
                        <i className="ti ti-package me-2 fs-18" />
                        <span className="fs-14">No items added to this price list.</span>
                      </div>
                    ) : (
                      <>
                        <div className="table-responsive">
                          <table
                            className="table table-borderless align-middle mb-0"
                            style={{ minWidth: 500, tableLayout: "fixed", width: "100%" }}
                          >
                            <thead>
                              <tr style={{
                                fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                                color: "#888", letterSpacing: "0.05em", borderBottom: "1px solid #f0f0f0",
                              }}>
                                <th style={{ paddingBottom: 10 }}>Item</th>
                                <th style={{ paddingBottom: 10, width: 150 }}>Custom Rate</th>
                                {settings.include_discount && (
                                  <th style={{ paddingBottom: 10, width: 130 }}>Discount (%)</th>
                                )}
                                {settings.pricing_scheme === "volume" && (
                                  <th style={{ paddingBottom: 10, width: 100 }}>Ranges</th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {items.map((item: any) => (
                                <tr key={item.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                                  <td className="fs-14" style={{ paddingTop: 8, paddingBottom: 8 }}>
                                    {item.item?.name ?? `Item #${item.item_id}`}
                                  </td>
                                  <td className="fs-14" style={{ paddingTop: 8, paddingBottom: 8 }}>
                                    {item.custom_rate != null
                                      ? `₹${parseFloat(item.custom_rate).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                                      : <span className="text-muted">—</span>}
                                  </td>
                                  {settings.include_discount && (
                                    <td className="fs-14" style={{ paddingTop: 8, paddingBottom: 8 }}>
                                      {item.discount != null ? `${item.discount}%` : <span className="text-muted">—</span>}
                                    </td>
                                  )}
                                  {settings.pricing_scheme === "volume" && (
                                    <td className="fs-14" style={{ paddingTop: 8, paddingBottom: 8 }}>
                                      {item.volume_ranges?.length
                                        ? <span className="badge badge-soft-info">{item.volume_ranges.length} range{item.volume_ranges.length !== 1 ? "s" : ""}</span>
                                        : <span className="text-muted">—</span>}
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Summary legend box — mirrors chart legend box from itemOverview */}
                        <div className="border rounded px-3 py-2 mt-2 d-flex align-items-center justify-content-between">
                          <div>
                            <p className="fs-12 text-muted mb-1">Total Items</p>
                            <div className="d-flex align-items-center gap-2">
                              <span className="rounded-circle flex-shrink-0" style={{ width: 8, height: 8, background: "#0d6efd", display: "inline-block" }} />
                              <span className="fs-13 text-muted">Custom Pricing</span>
                            </div>
                          </div>
                          <span className="fs-16 fw-semibold">{items.length} item{items.length !== 1 ? "s" : ""}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}

              </div>
            )}

            {/* ══ Tab: History ══════════════════════════════════════════════════ */}
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
                    {/* Spine line */}
                    <div style={{ position: "absolute", left: 17, top: 18, bottom: 18, width: 2, background: "#dee2e6", zIndex: 0 }} />

                    {auditLogs.map((log, idx) => {
                      const isLast = idx === auditLogs.length - 1;

                      const eventColor: Record<string, string> = {
                        created:  "bg-success",
                        updated:  "bg-primary",
                        deleted:  "bg-danger",
                        restored: "bg-warning",
                      };
                      const eventIcon: Record<string, string> = {
                        created:  "ti-plus",
                        updated:  "ti-pencil",
                        deleted:  "ti-trash",
                        restored: "ti-refresh",
                      };
                      const eventLabel: Record<string, string> = {
                        created:  "Created",
                        updated:  "Updated",
                        deleted:  "Deleted",
                        restored: "Restored",
                      };

                      const bgClass   = eventColor[log.event] ?? "bg-secondary";
                      const iconClass = eventIcon[log.event]  ?? "ti-activity";
                      const label     = eventLabel[log.event] ?? log.event;

                      const changedFields = log.new_values ? Object.keys(log.new_values) : [];
                      const actor   = log.user?.name ?? log.user?.email ?? "System";
                      const dateObj = new Date(log.created_at);
                      const dateStr = dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                      const timeStr = dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

                      const fieldLabel: Record<string, string> = {
                        name:                 "Name",
                        transaction_type:     "Transaction Type",
                        price_list_type:      "Price List Type",
                        customer_category_id: "Customer Category",
                        description:          "Description",
                        is_active:            "Status",
                        admin_only:           "Admin Only",
                        created_by:           "Created By",
                        adjustment_method:    "Adjustment Method",
                        percentage:           "Percentage",
                        round_off:            "Round Off",
                        pricing_scheme:       "Pricing Scheme",
                        currency:             "Currency",
                        include_discount:     "Include Discount",
                        price_list_items:     "Item Pricing",
                      };

                      const enumMap: Record<string, Record<string, string>> = {
                        transaction_type:  { sales: "Sales", purchase: "Purchase", both: "Both" },
                        price_list_type:   { all_items: "All Items", individual_items: "Individual Items" },
                        adjustment_method: { markup: "Markup", markdown: "Markdown" },
                        pricing_scheme:    { unit: "Unit Pricing", volume: "Volume Pricing" },
                      };

                      const boolFields = new Set(["is_active", "include_discount", "admin_only"]);

                      const parseIfString = (v: any): Record<string, any> => {
                        if (typeof v === "string") { try { return JSON.parse(v); } catch { return {}; } }
                        return (v && typeof v === "object" && !Array.isArray(v)) ? v : {};
                      };

                      const parseIfStr = (v: any): any => {
                        if (typeof v === "string") { try { return JSON.parse(v); } catch { return v; } }
                        return v;
                      };

                      const fmtVal = (field: string, v: any): React.ReactNode => {
                        if (v === null || v === undefined || v === "") return <span className="text-muted fst-italic">empty</span>;

                        const leafKey = field.split(".").at(-1) ?? field;

                        if (boolFields.has(field) || boolFields.has(leafKey)) {
                          const isTrue = v === true || v === 1 || v === "1";
                          return (field === "is_active" || leafKey === "is_active")
                            ? (isTrue ? "Active" : "Inactive")
                            : (isTrue ? "Yes" : "No");
                        }

                        if (enumMap[field])   return enumMap[field][String(v)]   ?? String(v);
                        if (enumMap[leafKey]) return enumMap[leafKey][String(v)] ?? String(v);

                        if (typeof v === "boolean") return v ? "Yes" : "No";

                        if (leafKey === "custom_rate") {
                          const n = parseFloat(String(v));
                          return isNaN(n) ? String(v) : `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        }

                        if (field === "percentage" || leafKey === "discount") {
                          const n = parseFloat(String(v));
                          return isNaN(n) ? String(v) : `${n}%`;
                        }

                        if (leafKey === "volume_ranges") {
                          const arr = Array.isArray(v) ? v : (typeof v === "string" ? (() => { try { return JSON.parse(v); } catch { return null; } })() : null);
                          if (Array.isArray(arr)) return `${arr.length} range${arr.length !== 1 ? "s" : ""}`;
                          return "Updated";
                        }

                        if (field === "description") {
                          const s = String(v);
                          return s.length > 80 ? s.slice(0, 80) + "…" : s;
                        }

                        return String(v);
                      };

                      type DiffRow = { key: string; oldVal: any; newVal: any };
                      const diffRows: DiffRow[] = changedFields.flatMap((field) => {

                        if (field === "settings") {
                          const oldS = parseIfString(log.old_values?.[field]);
                          const newS = parseIfString(log.new_values?.[field]);
                          const allKeys = new Set([...Object.keys(oldS), ...Object.keys(newS)]);
                          const changed = [...allKeys].filter(
                            (k) => JSON.stringify(oldS[k]) !== JSON.stringify(newS[k])
                          );
                          if (changed.length === 0) return [];
                          return changed.map((k) => ({ key: k, oldVal: oldS[k], newVal: newS[k] }));
                        }

                        if (field === "price_list_items") {
                          const oldMap = parseIfStr(log.old_values?.price_list_items);
                          const newMap = parseIfStr(log.new_values?.price_list_items);
                          const safeOld = (oldMap && typeof oldMap === "object" && !Array.isArray(oldMap)) ? oldMap as Record<string, any> : {};
                          const safeNew = (newMap && typeof newMap === "object" && !Array.isArray(newMap)) ? newMap as Record<string, any> : {};
                          const allKeys = new Set([...Object.keys(safeOld), ...Object.keys(safeNew)]);
                          const rows: DiffRow[] = [];
                          for (const itemName of allKeys) {
                            const oldFields = safeOld[itemName];
                            const newFields = safeNew[itemName];
                            if (oldFields == null) {
                              rows.push({ key: `price_list_items.${itemName}.__add`, oldVal: null, newVal: null });
                            } else if (newFields == null) {
                              rows.push({ key: `price_list_items.${itemName}.__rem`, oldVal: null, newVal: null });
                            } else {
                              for (const f of Object.keys({ ...oldFields, ...newFields })) {
                                const ov = oldFields[f];
                                const nv = newFields[f];
                                if (JSON.stringify(ov) !== JSON.stringify(nv)) {
                                  rows.push({ key: `price_list_items.${itemName}.${f}`, oldVal: ov, newVal: nv });
                                }
                              }
                            }
                          }
                          return rows;
                        }

                        return [{ key: field, oldVal: log.old_values?.[field], newVal: log.new_values?.[field] }];
                      });

                      if (log.event === "updated" && diffRows.length === 0) return null;

                      const rowSummaryLabel = (key: string): string => {
                        if (fieldLabel[key]) return fieldLabel[key];
                        if (key.startsWith("price_list_items.")) return "Item Pricing";
                        return key;
                      };

                      const summaryText =
                        log.event === "created"  ? "Price list was created"  :
                        log.event === "deleted"  ? "Price list was deleted"  :
                        log.event === "restored" ? "Price list was restored" :
                        diffRows.length === 1
                          ? `${rowSummaryLabel(diffRows[0].key)} was changed`
                          : `${diffRows.length} field${diffRows.length !== 1 ? "s" : ""} updated`;

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
                                    <span className="fs-14 fw-medium text-dark">{summaryText}</span>
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

                                {/* Changed fields */}
                                {log.event === "updated" && diffRows.length > 0 && (
                                  <div className="mt-2 border-top pt-2">
                                    {diffRows.map((row) => {
                                      if (row.key.endsWith(".__add")) {
                                        const itemName = row.key.split(".").slice(1, -1).join(".");
                                        return (
                                          <div key={row.key} className="d-flex align-items-center gap-2 py-1 flex-wrap">
                                            <span className="fs-13 text-muted" style={{ minWidth: 150 }}>{itemName}</span>
                                            <span className="badge badge-soft-success fs-12">Added</span>
                                          </div>
                                        );
                                      }
                                      if (row.key.endsWith(".__rem")) {
                                        const itemName = row.key.split(".").slice(1, -1).join(".");
                                        return (
                                          <div key={row.key} className="d-flex align-items-center gap-2 py-1 flex-wrap">
                                            <span className="fs-13 text-muted" style={{ minWidth: 150 }}>{itemName}</span>
                                            <span className="badge badge-soft-danger fs-12">Removed</span>
                                          </div>
                                        );
                                      }

                                      const parts = row.key.split(".");
                                      const rowLabel = row.key.startsWith("price_list_items.")
                                        ? (() => {
                                            const f = parts.at(-1) ?? "";
                                            const itemName = parts.slice(1, -1).join(".");
                                            const fLabel: Record<string, string> = { custom_rate: "Custom Rate", discount: "Discount", volume_ranges: "Volume Ranges" };
                                            return `${itemName} · ${fLabel[f] ?? f}`;
                                          })()
                                        : (fieldLabel[row.key] ?? row.key);

                                      return (
                                        <div key={row.key} className="d-flex align-items-center gap-2 py-1 flex-wrap">
                                          <span className="fs-13 text-muted" style={{ minWidth: 150 }}>{rowLabel}</span>
                                          <span className="fs-13 text-danger text-decoration-line-through">{fmtVal(row.key, row.oldVal)}</span>
                                          <i className="ti ti-arrow-right fs-12 text-muted" />
                                          <span className="fs-13 text-success fw-medium">{fmtVal(row.key, row.newVal)}</span>
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
        </div>
      </div>

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

export default PriceListOverview;
