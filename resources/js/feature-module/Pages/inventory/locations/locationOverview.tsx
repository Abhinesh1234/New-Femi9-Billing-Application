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
import { fetchLocationAuditLogs, type AuditLogEntry } from "../../../../core/services/auditLogApi";
import { all_routes } from "../../../../routes/all_routes";

const route = all_routes;

type Tab = "overview" | "history";

// ── State / country label maps ─────────────────────────────────────────────────
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
  IN: "India", US: "United States", GB: "United Kingdom",
  AE: "United Arab Emirates", SG: "Singapore",
};

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
const LocationOverview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [location, setLocation]   = useState<Record<string, any> | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // ── Left panel ──
  const [allLocations, setAllLocations]       = useState<LocationListItem[]>([]);
  const [listFilter, setListFilter]           = useState<"all" | "business" | "warehouse">("all");
  const [listSearch, setListSearch]           = useState("");
  const [showListSearch, setShowListSearch]   = useState(false);

  // ── Audit log (history tab) ──
  const [auditLogs,     setAuditLogs]     = useState<AuditLogEntry[]>([]);
  const [auditLoading,  setAuditLoading]  = useState(false);
  const [auditPage,     setAuditPage]     = useState(1);
  const [auditLastPage, setAuditLastPage] = useState(1);
  const [auditTotal,    setAuditTotal]    = useState(0);

  // ── Left panel scroll ──
  const listScrollRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

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

  // Fetch current location detail
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const res = await fetchLocation(Number(id));
      if (res.success) {
        setLocation((res as any).data);
      } else {
        setError((res as any).message);
      }
      setLoading(false);
    })();
  }, [id]);

  // Fetch all locations for the left panel
  useEffect(() => {
    (async () => {
      const res = await fetchLocations();
      if (res.success) setAllLocations((res as any).data);
    })();
  }, []);

  // Load audit logs when history tab opens or page changes
  useEffect(() => {
    if (activeTab !== "history" || !id) return;
    (async () => {
      setAuditLoading(true);
      const res = await fetchLocationAuditLogs(Number(id), auditPage);
      if (res.success) {
        setAuditLogs(res.data.data);
        setAuditLastPage(res.data.last_page);
        setAuditTotal(res.data.total);
      }
      setAuditLoading(false);
    })();
  }, [activeTab, id, auditPage]);

  // Scroll active location into view
  useEffect(() => {
    const timer = setTimeout(() => {
      activeItemRef.current?.scrollIntoView({ block: "center", behavior: "instant" });
    }, 50);
    return () => clearTimeout(timer);
  }, [id, allLocations]);

  const filteredLocations = useMemo(() => {
    let base = listFilter === "all" ? allLocations : allLocations.filter((l) => l.type === listFilter);
    if (listSearch.trim()) {
      const q = listSearch.toLowerCase();
      base = base.filter((l) => l.name.toLowerCase().includes(q));
    }
    return base;
  }, [allLocations, listFilter, listSearch]);

  const fmt = (val: any) =>
    val === null || val === undefined || val === "" ? "—" : String(val);

  // ── Loading ──
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

  // ── Error ──
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

  const filterLabel =
    listFilter === "all"       ? "All Locations" :
    listFilter === "business"  ? "Business"      : "Warehouse";

  const address    = location.address ?? {};
  const hasAddress = Object.values(address).some(Boolean);

  const createdStr = location.created_at
    ? new Date(location.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";
  const updatedStr = location.updated_at
    ? new Date(location.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  const typeIcon = location.type === "business" ? "ti-building" : "ti-building-warehouse";
  const typeBadgeCls = location.type === "business" ? "badge-soft-primary" : "badge-soft-secondary";
  const typeLabel = location.type === "business" ? "Business" : "Warehouse";

  const cityStateLine = [
    address.city,
    address.state ? (STATE_LABELS[address.state] ?? address.state) : null,
  ].filter(Boolean).join(", ");

  return (
    /* Override page-wrapper's min-height so it acts as a fixed viewport container */
    <div
      className="page-wrapper"
      style={{ height: "calc(100vh - 57px)", minHeight: "unset", overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      {/* ═══ Two-pane shell ═══════════════════════════════════════════════════ */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Left: Locations list panel ────────────────────────────────────── */}
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
                  <li><button className="dropdown-item" onClick={() => setListFilter("all")}>All Locations</button></li>
                  <li><button className="dropdown-item" onClick={() => setListFilter("business")}>Business</button></li>
                  <li><button className="dropdown-item" onClick={() => setListFilter("warehouse")}>Warehouse</button></li>
                </ul>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary px-2"
              style={{ width: 28, height: 28, padding: 0, fontSize: 13 }}
              title="New Location"
              onClick={() => navigate(route.addLocation)}
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
                    <button className="dropdown-item fs-13" onClick={() => navigate(route.locations)}>
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
                  placeholder="Search locations…"
                  value={listSearch}
                  onChange={(e) => setListSearch(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Locations list */}
          <div ref={listScrollRef} style={{ overflowY: "auto", flex: 1 }}>
            {filteredLocations.length === 0 ? (
              <div className="text-center py-4 text-muted fs-13">
                <i className="ti ti-mood-empty d-block fs-24 mb-1" />
                No locations found
              </div>
            ) : (
              filteredLocations.map((loc) => {
                const isActive = String(loc.id) === id;
                const locCityState = [
                  loc.address?.city,
                  loc.address?.state ? (STATE_LABELS[loc.address.state] ?? loc.address.state) : null,
                ].filter(Boolean).join(", ");
                return (
                  <div
                    key={loc.id}
                    ref={isActive ? activeItemRef : undefined}
                    onClick={() => navigate(`/locations/${loc.id}`)}
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
                      <i
                        className={`ti ${loc.type === "business" ? "ti-building" : "ti-building-warehouse"} text-muted`}
                        style={{ fontSize: 12 }}
                      />
                    </div>
                    {/* Name + city */}
                    <div className="flex-grow-1 overflow-hidden">
                      <div
                        className="text-truncate"
                        style={{
                          fontSize: 14,
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? "#e03131" : "#212529",
                        }}
                      >
                        {loc.name}
                      </div>
                      {locCityState && (
                        <div className="fs-12 text-muted text-truncate">{locCityState}</div>
                      )}
                    </div>
                    {/* Primary badge */}
                    {loc.is_primary && (
                      <span className="badge badge-soft-warning flex-shrink-0" style={{ fontSize: 10 }}>Primary</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right: Location detail ─────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", background: "#fff" }}>
          <div style={{ padding: "1.25rem", flex: 1 }}>

            {/* ── Top action bar ── */}
            <div className="d-flex align-items-start justify-content-between mb-2 flex-wrap gap-2">
              <div>
                <h4 className="fw-semibold mb-2 lh-sm">{location.name}</h4>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className={`badge ${typeBadgeCls}`}>{typeLabel}</span>
                  <span className={`badge ${location.is_active ? "badge-soft-success" : "badge-soft-danger"}`}>
                    {location.is_active ? "Active" : "Inactive"}
                  </span>
                  {location.is_primary && (
                    <span className="badge badge-soft-warning">Primary</span>
                  )}
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-outline-light shadow"
                  title="Edit"
                  style={{ height: 36, width: 36, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                  onClick={() => navigate(`/locations/${id}/edit`)}
                >
                  <i className="ti ti-pencil" />
                </button>
                <div className="dropdown">
                  <button type="button" className="btn btn-outline-light dropdown-toggle shadow px-3" style={{ height: 36 }} data-bs-toggle="dropdown">
                    More
                  </button>
                  <div className="dropdown-menu dropdown-menu-end">
                    <ul>
                      <li>
                        <button
                          className="dropdown-item text-danger"
                          onClick={async () => {
                            if (!window.confirm(`Delete "${location.name}"?`)) return;
                            const res = await destroyLocation(Number(id));
                            if (res.success) {
                              showToast("success", "Location deleted.");
                              setTimeout(() => navigate(route.locations), 1000);
                            } else {
                              showToast("danger", (res as any).message ?? "Delete failed.");
                            }
                          }}
                        >
                          <i className="ti ti-trash me-2" />Delete
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                <Link
                  to={route.locations}
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
                    value={<span className="text-primary">{location.name}</span>}
                  />
                  <DetailRow
                    label="Type"
                    value={<span className={`badge ${typeBadgeCls}`}>{typeLabel}</span>}
                  />
                  <DetailRow
                    label="Status"
                    value={
                      <span className={`badge ${location.is_active ? "badge-soft-success" : "badge-soft-danger"}`}>
                        {location.is_active ? "Active" : "Inactive"}
                      </span>
                    }
                  />
                  <DetailRow
                    label="Primary"
                    value={
                      location.is_primary
                        ? <span className="badge badge-soft-warning">Yes</span>
                        : <span className="text-muted fs-14">No</span>
                    }
                  />
                  <DetailRow
                    label="Website"
                    value={
                      location.website_url
                        ? <a href={location.website_url} target="_blank" rel="noreferrer" className="text-primary">{location.website_url}</a>
                        : <span className="text-muted">—</span>
                    }
                  />
                  <DetailRow
                    label="Parent Location"
                    value={location.parent?.name ?? <span className="text-muted">—</span>}
                  />
                  <DetailRow label="Default Txn Series" value={fmt(location.default_txn_series?.name)} />
                  <DetailRow label="Created By"          value={fmt(location.created_by?.name)} />

                  {/* Address */}
                  <h6 className="fw-semibold mt-4 mb-3">Address</h6>
                  {hasAddress ? (
                    <>
                      {address.attention && <DetailRow label="Attention" value={fmt(address.attention)} />}
                      {address.street1   && <DetailRow label="Street 1"  value={fmt(address.street1)} />}
                      {address.street2   && <DetailRow label="Street 2"  value={fmt(address.street2)} />}
                      <DetailRow label="City"     value={fmt(address.city)} />
                      <DetailRow label="PIN Code" value={fmt(address.pin_code)} />
                      <DetailRow label="State"    value={address.state ? (STATE_LABELS[address.state] ?? address.state) : "—"} />
                      <DetailRow label="Country"  value={address.country ? (COUNTRY_LABELS[address.country] ?? address.country) : "—"} />
                      {address.phone && <DetailRow label="Phone" value={fmt(address.phone)} />}
                      {address.fax   && <DetailRow label="Fax"   value={fmt(address.fax)} />}
                    </>
                  ) : (
                    <p className="fs-14 text-muted mb-0">No address on file.</p>
                  )}

                </div>

                {/* ── Right column ── */}
                <div className="col-lg-6">

                  {/* Summary box — mirrors image upload box from itemOverview */}
                  <div
                    className="border rounded d-flex flex-column align-items-center justify-content-center text-center mb-4 overflow-hidden"
                    style={{ background: "#fafafa", height: 280 }}
                  >
                    <i className={`ti ${typeIcon} text-primary fs-32 mb-2`} />
                    <span className="fw-semibold fs-14 mb-2 px-4 w-100 text-center text-truncate">{location.name}</span>
                    <div className="d-flex align-items-center gap-2 flex-wrap justify-content-center px-3">
                      <span className={`badge ${typeBadgeCls}`}>{typeLabel}</span>
                      <span className={`badge ${location.is_active ? "badge-soft-success" : "badge-soft-danger"}`}>
                        {location.is_active ? "Active" : "Inactive"}
                      </span>
                      {location.is_primary && (
                        <span className="badge badge-soft-warning">Primary</span>
                      )}
                    </div>
                    {cityStateLine ? (
                      <p className="fs-13 text-muted mt-3 mb-0 px-3">
                        <i className="ti ti-map-pin me-1" />
                        {cityStateLine}
                        {address.country ? `, ${COUNTRY_LABELS[address.country] ?? address.country}` : ""}
                      </p>
                    ) : (
                      <p className="fs-13 text-muted mt-3 mb-0">No address on file</p>
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

                  {/* Address Summary — mirrors Stock section */}
                  <div className="d-flex align-items-center gap-1 mb-2">
                    <span className="fs-14 fw-semibold">Address Summary</span>
                    <i className="ti ti-info-circle fs-14 text-muted" />
                  </div>
                  <StockRow
                    label="City"
                    value={fmt(address.city)}
                  />
                  <StockRow
                    label="State"
                    value={address.state ? (STATE_LABELS[address.state] ?? address.state) : "—"}
                  />
                  <StockRow
                    label="Country"
                    value={address.country ? (COUNTRY_LABELS[address.country] ?? address.country) : "—"}
                  />
                  <StockRow label="PIN Code" value={fmt(address.pin_code)} />

                </div>

                {/* ── Full-width: Full Address card — mirrors Sales Order Summary section ── */}
                {hasAddress && (
                  <div className="col-12">
                    <hr className="mt-0 mb-3" />
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <h6 className="fw-semibold mb-0 fs-14">
                        Full Address <span className="text-muted fw-normal">(Postal Details)</span>
                      </h6>
                    </div>

                    <div className="border rounded p-3" style={{ background: "#fafbfc" }}>
                      <p className="fs-14 fw-medium mb-1" style={{ color: "#212529" }}>
                        {location.name}
                      </p>
                      {address.attention && (
                        <p className="fs-13 text-muted mb-1">Attn: {address.attention}</p>
                      )}
                      {(address.street1 || address.street2) && (
                        <p className="fs-13 text-muted mb-1">
                          {[address.street1, address.street2].filter(Boolean).join(", ")}
                        </p>
                      )}
                      {(address.city || address.state || address.pin_code) && (
                        <p className="fs-13 text-muted mb-1">
                          {[
                            address.city,
                            address.state ? (STATE_LABELS[address.state] ?? address.state) : null,
                            address.pin_code,
                          ].filter(Boolean).join(", ")}
                        </p>
                      )}
                      {address.country && (
                        <p className="fs-13 text-muted mb-0">
                          {COUNTRY_LABELS[address.country] ?? address.country}
                        </p>
                      )}
                    </div>

                    {/* Legend-style info box — mirrors chart legend box */}
                    <div className="border rounded px-3 py-2 mt-2 d-flex align-items-center justify-content-between">
                      <div>
                        <p className="fs-12 text-muted mb-1">Contact</p>
                        <div className="d-flex align-items-center gap-2">
                          <span className="rounded-circle flex-shrink-0" style={{ width: 8, height: 8, background: "#0d6efd", display: "inline-block" }} />
                          <span className="fs-13 text-muted">
                            {address.phone ? address.phone : "No phone on file"}
                          </span>
                        </div>
                      </div>
                      <span className="fs-16 fw-semibold">
                        {address.pin_code ? address.pin_code : "—"}
                      </span>
                    </div>
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
                    {/* Single continuous spine line */}
                    <div style={{ position: "absolute", left: 17, top: 18, bottom: 18, width: 2, background: "#dee2e6", zIndex: 0 }} />

                    {auditLogs.map((log, idx) => {
                      const isLast = idx === auditLogs.length - 1;

                      const eventColor: Record<string, string> = {
                        created:        "bg-success",
                        updated:        "bg-primary",
                        deleted:        "bg-danger",
                        restored:       "bg-warning",
                        set_primary:    "bg-info",
                        access_updated: "bg-secondary",
                      };
                      const eventIcon: Record<string, string> = {
                        created:        "ti-plus",
                        updated:        "ti-pencil",
                        deleted:        "ti-trash",
                        restored:       "ti-refresh",
                        set_primary:    "ti-star",
                        access_updated: "ti-users",
                      };
                      const eventLabel: Record<string, string> = {
                        created:        "Created",
                        updated:        "Updated",
                        deleted:        "Deleted",
                        restored:       "Restored",
                        set_primary:    "Set Primary",
                        access_updated: "Access",
                      };

                      const bgClass   = eventColor[log.event] ?? "bg-secondary";
                      const iconClass = eventIcon[log.event]  ?? "ti-activity";
                      const label     = eventLabel[log.event] ?? log.event;

                      const actor   = log.user?.name ?? log.user?.email ?? "System";
                      const dateObj = new Date(log.created_at);
                      const dateStr = dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                      const timeStr = dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

                      const fieldLabel: Record<string, string> = {
                        name:                  "Name",
                        type:                  "Type",
                        parent_id:             "Parent Location",
                        logo_type:             "Logo Type",
                        logo_path:             "Logo",
                        website_url:           "Website URL",
                        primary_contact_id:    "Primary Contact",
                        txn_series_id:         "Transaction Series",
                        default_txn_series_id: "Default Txn Series",
                        is_active:             "Status",
                        is_primary:            "Primary",
                        created_by:            "Created By",
                        attention: "Attention", street1: "Street 1", street2: "Street 2",
                        city: "City", pin_code: "PIN Code", state: "State",
                        country: "Country", phone: "Phone", fax: "Fax",
                        access_users: "Access Users",
                      };

                      const enumMap: Record<string, Record<string, string>> = {
                        type:      { business: "Business", warehouse: "Warehouse" },
                        logo_type: { org: "Organisation Logo", custom: "Custom Logo" },
                      };

                      const boolFields = new Set(["is_active", "is_primary"]);

                      const parseIfStr = (v: any): any => {
                        if (typeof v === "string") { try { return JSON.parse(v); } catch { return v; } }
                        return v;
                      };

                      const systemFields = new Set(["id", "created_at", "updated_at", "deleted_at"]);
                      const changedFields = (() => {
                        if (!log.new_values) return [];
                        if (log.event !== "updated" || !log.old_values) {
                          return Object.keys(log.new_values).filter((k) => !systemFields.has(k));
                        }
                        return Object.keys(log.new_values).filter((k) => {
                          if (systemFields.has(k)) return false;
                          return JSON.stringify(log.old_values![k]) !== JSON.stringify(log.new_values![k]);
                        });
                      })();

                      type DiffRow = { key: string; label: string; oldVal: any; newVal: any };

                      const diffRows: DiffRow[] = changedFields.flatMap((field): DiffRow[] => {

                        if (field === "address") {
                          const rawOld = parseIfStr(log.old_values?.[field]);
                          const rawNew = parseIfStr(log.new_values?.[field]);
                          const safeOld = (rawOld && typeof rawOld === "object" && !Array.isArray(rawOld)) ? rawOld as Record<string, any> : {};
                          const safeNew = (rawNew && typeof rawNew === "object" && !Array.isArray(rawNew)) ? rawNew as Record<string, any> : {};
                          const allKeys = new Set([...Object.keys(safeOld), ...Object.keys(safeNew)]);
                          const changed = [...allKeys].filter(
                            (k) => JSON.stringify(safeOld[k]) !== JSON.stringify(safeNew[k])
                          );
                          if (changed.length === 0) return [];
                          return changed.map((k) => ({
                            key:    `address.${k}`,
                            label:  fieldLabel[k] ?? k,
                            oldVal: safeOld[k] ?? null,
                            newVal: safeNew[k] ?? null,
                          }));
                        }

                        if (field === "access_users") {
                          const oldArr  = parseIfStr(log.old_values?.[field]);
                          const newArr  = parseIfStr(log.new_values?.[field]);
                          const oldCount = Array.isArray(oldArr) ? oldArr.length : 0;
                          const newCount = Array.isArray(newArr) ? newArr.length : 0;
                          if (oldCount === newCount && JSON.stringify(oldArr) === JSON.stringify(newArr)) return [];
                          return [{
                            key:    "access_users",
                            label:  "Access Users",
                            oldVal: `${oldCount} user${oldCount !== 1 ? "s" : ""}`,
                            newVal: `${newCount} user${newCount !== 1 ? "s" : ""}`,
                          }];
                        }

                        return [{
                          key:    field,
                          label:  fieldLabel[field] ?? field,
                          oldVal: log.old_values?.[field],
                          newVal: log.new_values?.[field],
                        }];
                      });

                      if (log.event === "updated" && diffRows.length === 0) return null;

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
                                {/* Top row: event badge + summary + date/time */}
                                <div className="d-flex align-items-start justify-content-between mb-2 flex-wrap gap-1">
                                  <div className="d-flex align-items-center gap-2">
                                    <span className={`badge ${bgClass} fs-12`}>{label}</span>
                                    <span className="fs-14 fw-medium text-dark">
                                      {log.event === "created"        ? "Location was created"      :
                                       log.event === "deleted"        ? "Location was deleted"      :
                                       log.event === "restored"       ? "Location was restored"     :
                                       log.event === "set_primary"    ? "Set as primary location"   :
                                       log.event === "access_updated" ? "Access users were updated" :
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

                                {/* Changed fields (updated event only) */}
                                {log.event === "updated" && diffRows.length > 0 && (
                                  <div className="mt-2 border-top pt-2">
                                    {diffRows.map((row) => {
                                      const leafKey = row.key.split(".").at(-1) ?? row.key;

                                      const fmtVal = (v: any): React.ReactNode => {
                                        if (v === null || v === undefined || v === "")
                                          return <span className="text-muted fst-italic">empty</span>;

                                        if (boolFields.has(row.key) || boolFields.has(leafKey)) {
                                          const isTrue = v === true || v === 1 || v === "1";
                                          if (row.key === "is_active" || leafKey === "is_active")
                                            return isTrue ? "Active" : "Inactive";
                                          return isTrue ? "Yes" : "No";
                                        }

                                        if (enumMap[row.key])  return enumMap[row.key][String(v)]  ?? String(v);
                                        if (enumMap[leafKey])  return enumMap[leafKey][String(v)]  ?? String(v);

                                        if (typeof v === "boolean") return v ? "Yes" : "No";

                                        if (leafKey === "state")   return STATE_LABELS[String(v)]   ?? String(v);
                                        if (leafKey === "country") return COUNTRY_LABELS[String(v)] ?? String(v);

                                        return String(v);
                                      };

                                      return (
                                        <div key={row.key} className="d-flex align-items-center gap-2 py-1 flex-wrap">
                                          <span className="fs-13 text-muted" style={{ minWidth: 150 }}>{row.label}</span>
                                          <span className="fs-13 text-danger text-decoration-line-through">{fmtVal(row.oldVal)}</span>
                                          <i className="ti ti-arrow-right fs-12 text-muted" />
                                          <span className="fs-13 text-success fw-medium">{fmtVal(row.newVal)}</span>
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

export default LocationOverview;
