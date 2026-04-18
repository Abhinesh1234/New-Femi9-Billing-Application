import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Toast } from "react-bootstrap";
import Footer from "../../../../components/footer/footer";
import {
  showSeries,
  fetchSeries,
  destroySeries,
  type SeriesItem,
  type SeriesModule,
} from "../../../../core/services/seriesApi";
import { fetchSeriesAuditLogs, type AuditLogEntry } from "../../../../core/services/auditLogApi";
import { all_routes } from "../../../../routes/all_routes";

const route = all_routes;

type Tab = "overview" | "history";

// ── Module display order ───────────────────────────────────────────────────────
const MODULE_ORDER = [
  "Invoice", "Sales Order", "Sales Return", "Credit Note",
  "Customer Payment", "Delivery Challan", "Bill Of Supply",
  "Retainer Invoice", "Purchase Order", "Vendor Payment",
];

function formatModuleNumber(mod: SeriesModule): string {
  const startLen  = mod.starting_number.length;
  const formatted = String(mod.current_number).padStart(startLen, "0");
  return `${mod.prefix ?? ""}${formatted}`;
}

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
const TransactionSeriesOverview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [series, setSeries]       = useState<SeriesItem | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // ── Left panel ──
  const [allSeries, setAllSeries]           = useState<SeriesItem[]>([]);
  const [listSearch, setListSearch]         = useState("");
  const [showListSearch, setShowListSearch] = useState(false);

  // ── Left panel scroll ──
  const listScrollRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  // ── Audit log (history tab) ──
  const [auditLogs,     setAuditLogs]     = useState<AuditLogEntry[]>([]);
  const [auditLoading,  setAuditLoading]  = useState(false);
  const [auditPage,     setAuditPage]     = useState(1);
  const [auditLastPage, setAuditLastPage] = useState(1);
  const [auditTotal,    setAuditTotal]    = useState(0);

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

  // Fetch current series detail
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const res = await showSeries(Number(id));
      if (res.success) {
        setSeries(res.data);
      } else {
        setError(res.message);
      }
      setLoading(false);
    })();
  }, [id]);

  // Fetch all series for the left panel
  useEffect(() => {
    (async () => {
      const res = await fetchSeries();
      if (res.success) setAllSeries(res.data);
    })();
  }, []);

  // Scroll active item into view
  useEffect(() => {
    const timer = setTimeout(() => {
      activeItemRef.current?.scrollIntoView({ block: "center", behavior: "instant" });
    }, 50);
    return () => clearTimeout(timer);
  }, [id, allSeries]);

  // Load audit logs when history tab is opened or page changes
  useEffect(() => {
    if (activeTab !== "history" || !id) return;
    (async () => {
      setAuditLoading(true);
      const res = await fetchSeriesAuditLogs(Number(id), auditPage);
      if (res.success) {
        setAuditLogs(res.data.data);
        setAuditLastPage(res.data.last_page);
        setAuditTotal(res.data.total);
      }
      setAuditLoading(false);
    })();
  }, [activeTab, id, auditPage]);

  const filteredSeries = useMemo(() => {
    if (!listSearch.trim()) return allSeries;
    const q = listSearch.toLowerCase();
    return allSeries.filter((s) => s.name.toLowerCase().includes(q));
  }, [allSeries, listSearch]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
          <span className="spinner-border spinner-border-sm me-2 text-primary" />
          <span className="text-muted">Loading series…</span>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Error ──
  if (error || !series) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="alert alert-danger">{error ?? "Series not found."}</div>
          <Link to={route.transactionSeriesList} className="btn btn-outline-light">
            <i className="ti ti-arrow-left me-1" /> Back to Series
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

  const modules: SeriesModule[] = series.modules_config?.modules ?? [];
  const sortedModules = [...modules].sort((a, b) => {
    const ai = MODULE_ORDER.indexOf(a.module);
    const bi = MODULE_ORDER.indexOf(b.module);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  const activePrefixes  = modules.filter((m) => m.prefix && m.prefix.trim() !== "").length;
  const locCount        = series.locations_count ?? 0;
  const editPath        = route.editTransactionSeries.replace(":seriesId", String(id));

  const createdStr = series.created_at
    ? new Date(series.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";
  const updatedStr = series.updated_at
    ? new Date(series.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    /* Override page-wrapper's min-height so it acts as a fixed viewport container */
    <div
      className="page-wrapper"
      style={{ height: "calc(100vh - 57px)", minHeight: "unset", overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      {/* ═══ Two-pane shell ═══════════════════════════════════════════════════ */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Left: Series list panel ───────────────────────────────────────── */}
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
            <span className="fw-semibold fs-14 flex-grow-1 px-1">Transaction Series</span>
            <button
              type="button"
              className="btn btn-primary px-2"
              style={{ width: 28, height: 28, padding: 0, fontSize: 13 }}
              title="New Series"
              onClick={() => navigate(route.newTransactionSeries)}
            >
              <i className="ti ti-plus" />
            </button>
            <div className="dropdown">
              <button
                type="button"
                className="btn btn-icon btn-outline-light shadow"
                data-bs-toggle="dropdown"
                style={{ width: 28, height: 28, fontSize: 13 }}
              >
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
                    <button className="dropdown-item fs-13" onClick={() => navigate(route.transactionSeriesList)}>
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
                  placeholder="Search series…"
                  value={listSearch}
                  onChange={(e) => setListSearch(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Series list */}
          <div ref={listScrollRef} style={{ overflowY: "auto", flex: 1 }}>
            {filteredSeries.length === 0 ? (
              <div className="text-center py-4 text-muted fs-13">
                <i className="ti ti-mood-empty d-block fs-24 mb-1" />
                No series found
              </div>
            ) : (
              filteredSeries.map((s) => {
                const isActive = String(s.id) === id;
                return (
                  <div
                    key={s.id}
                    ref={isActive ? activeItemRef : undefined}
                    onClick={() => navigate(`/locations/series/${s.id}`)}
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
                      <i className="ti ti-hash text-muted" style={{ fontSize: 12 }} />
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
                      {s.name}
                    </span>
                    {/* Location count */}
                    {s.locations_count != null && s.locations_count > 0 && (
                      <span className="fs-12 text-muted flex-shrink-0">
                        {s.locations_count} loc{s.locations_count !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right: Series detail ───────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", background: "#fff" }}>
          <div style={{ padding: "1.25rem", flex: 1 }}>

            {/* ── Top action bar ── */}
            <div className="d-flex align-items-start justify-content-between mb-2 flex-wrap gap-2">
              <div>
                <h4 className="fw-semibold mb-2 lh-sm">{series.name}</h4>
                {locCount > 0 && (
                  <span className="text-muted fs-13 d-flex align-items-center gap-1 mb-0" style={{ lineHeight: "1.5" }}>
                    <i className="ti ti-map-pin fs-14" />
                    {locCount} location{locCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="d-flex align-items-center gap-2">
                <Link
                  to="#"
                  className="btn btn-outline-light shadow"
                  title="Edit"
                  style={{ height: 36, width: 36, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                  onClick={(e) => { e.preventDefault(); navigate(editPath); }}
                >
                  <i className="ti ti-pencil" />
                </Link>
                <div className="dropdown">
                  <button
                    type="button"
                    className="btn btn-outline-light dropdown-toggle shadow px-3"
                    style={{ height: 36 }}
                    data-bs-toggle="dropdown"
                  >
                    More
                  </button>
                  <div className="dropdown-menu dropdown-menu-end">
                    <ul>
                      <li>
                        <button
                          className="dropdown-item text-danger"
                          onClick={async () => {
                            if (!window.confirm(`Delete "${series.name}"?`)) return;
                            const res = await destroySeries(Number(id));
                            if (res.success) {
                              showToast("success", "Series deleted.");
                              setTimeout(() => navigate(route.transactionSeriesList), 1000);
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
                  to={route.transactionSeriesList}
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
                    label="Series Name"
                    value={<span className="text-primary">{series.name}</span>}
                  />
                  <DetailRow
                    label="Associated Locations"
                    value={locCount > 0
                      ? `${locCount} location${locCount !== 1 ? "s" : ""}`
                      : <span className="text-muted">—</span>}
                  />
                  <DetailRow
                    label="Modules Configured"
                    value={modules.length > 0
                      ? `${modules.length} module${modules.length !== 1 ? "s" : ""}`
                      : <span className="text-muted">—</span>}
                  />
                  <DetailRow
                    label="Active Prefixes"
                    value={activePrefixes > 0
                      ? `${activePrefixes} prefix${activePrefixes !== 1 ? "es" : ""}`
                      : <span className="text-muted">—</span>}
                  />
                  <DetailRow label="Created Source" value="User" />

                  {/* Module Overview — brief list of configured modules */}
                  {modules.length > 0 && (
                    <>
                      <h6 className="fw-semibold mt-4 mb-3">Configured Modules</h6>
                      {sortedModules.map((mod) => (
                        <DetailRow
                          key={mod.module}
                          label={mod.module}
                          value={
                            <span className="d-flex align-items-center gap-2 flex-wrap">
                              {mod.prefix && (
                                <code className="fs-12 bg-light px-2 py-0 rounded border">{mod.prefix}</code>
                              )}
                              <span className="text-muted fs-13">{formatModuleNumber(mod)}</span>
                            </span>
                          }
                        />
                      ))}
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
                    <i className="ti ti-receipt text-primary fs-32 mb-2" />
                    <span className="fw-semibold fs-14 mb-2 px-4 w-100 text-center text-truncate">{series.name}</span>
                    <div className="d-flex align-items-center gap-2 flex-wrap justify-content-center px-3">
                      <span className="badge badge-soft-info">
                        {modules.length} module{modules.length !== 1 ? "s" : ""}
                      </span>
                      {locCount > 0 && (
                        <span className="badge badge-soft-primary">
                          {locCount} location{locCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <p className="fs-13 text-muted mt-3 mb-0 px-3">
                      {activePrefixes > 0
                        ? `${activePrefixes} active prefix${activePrefixes !== 1 ? "es" : ""} configured`
                        : "No prefixes configured"}
                    </p>
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

                  {/* Series Summary — mirrors Stock section */}
                  <div className="d-flex align-items-center gap-1 mb-2">
                    <span className="fs-14 fw-semibold">Series Summary</span>
                    <i className="ti ti-info-circle fs-14 text-muted" />
                  </div>
                  <StockRow
                    label="Modules Configured"
                    value={modules.length > 0 ? String(modules.length) : "—"}
                  />
                  <StockRow
                    label="Locations Using"
                    value={locCount > 0 ? String(locCount) : "—"}
                  />
                  <StockRow
                    label="Active Prefixes"
                    value={activePrefixes > 0 ? String(activePrefixes) : "—"}
                  />

                </div>

                {/* ── Full-width: Module Configuration table — mirrors Sales Order Summary section ── */}
                <div className="col-12">
                  <hr className="mt-0 mb-3" />
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="fw-semibold mb-0 fs-14">
                      Module Configuration{" "}
                      <span className="text-muted fw-normal">(Transaction Numbering)</span>
                    </h6>
                  </div>

                  {sortedModules.length === 0 ? (
                    <div className="border rounded px-3 py-2 mt-2 d-flex align-items-center justify-content-center text-muted" style={{ minHeight: 80 }}>
                      <i className="ti ti-settings me-2 fs-18" />
                      <span className="fs-14">No modules configured for this series.</span>
                    </div>
                  ) : (
                    <>
                      <div className="table-responsive">
                        <table
                          className="table table-borderless align-middle mb-0"
                          style={{ minWidth: 520 }}
                        >
                          <thead>
                            <tr style={{
                              fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                              color: "#888", letterSpacing: "0.05em", borderBottom: "1px solid #f0f0f0",
                            }}>
                              <th style={{ paddingBottom: 10, whiteSpace: "nowrap" }}>Module</th>
                              <th style={{ paddingBottom: 10, whiteSpace: "nowrap" }}>Prefix</th>
                              <th style={{ paddingBottom: 10, whiteSpace: "nowrap" }}>Current Number</th>
                              <th style={{ paddingBottom: 10, whiteSpace: "nowrap" }}>Starting Number</th>
                              <th style={{ paddingBottom: 10, whiteSpace: "nowrap" }}>Restart Numbering</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedModules.map((mod) => (
                              <tr key={mod.module} style={{ borderBottom: "1px solid #f5f5f5" }}>
                                <td className="fs-14 fw-medium" style={{ paddingTop: 8, paddingBottom: 8, whiteSpace: "nowrap" }}>
                                  {mod.module}
                                </td>
                                <td className="fs-14" style={{ paddingTop: 8, paddingBottom: 8 }}>
                                  {mod.prefix
                                    ? <code className="fs-13 bg-light px-2 py-1 rounded border">{mod.prefix}</code>
                                    : <span className="text-muted">—</span>}
                                </td>
                                <td className="fs-14 fw-medium" style={{ paddingTop: 8, paddingBottom: 8, whiteSpace: "nowrap" }}>
                                  {formatModuleNumber(mod)}
                                </td>
                                <td className="fs-14 text-muted" style={{ paddingTop: 8, paddingBottom: 8, whiteSpace: "nowrap" }}>
                                  {mod.starting_number}
                                </td>
                                <td className="fs-14" style={{ paddingTop: 8, paddingBottom: 8 }}>
                                  {mod.restart_numbering && mod.restart_numbering !== "None"
                                    ? <span className="badge badge-soft-info">{mod.restart_numbering}</span>
                                    : <span className="text-muted">None</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Legend-style summary box — mirrors chart legend box */}
                      <div className="border rounded px-3 py-2 mt-2 d-flex align-items-center justify-content-between">
                        <div>
                          <p className="fs-12 text-muted mb-1">Total Modules</p>
                          <div className="d-flex align-items-center gap-2">
                            <span className="rounded-circle flex-shrink-0" style={{ width: 8, height: 8, background: "#0d6efd", display: "inline-block" }} />
                            <span className="fs-13 text-muted">Transaction Numbering</span>
                          </div>
                        </div>
                        <span className="fs-16 fw-semibold">{modules.length} module{modules.length !== 1 ? "s" : ""}</span>
                      </div>
                    </>
                  )}
                </div>

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
                        name: "Series Name",
                      };

                      const parseIfStr = (v: any): any => {
                        if (typeof v === "string") { try { return JSON.parse(v); } catch { return v; } }
                        return v;
                      };

                      type DiffRow = { key: string; label: string; oldVal: any; newVal: any };

                      const IGNORED = new Set(["id", "created_at", "updated_at", "deleted_at"]);

                      const diffRows: DiffRow[] = changedFields
                        .filter((f) => !IGNORED.has(f))
                        .filter((f) => JSON.stringify(log.old_values?.[f]) !== JSON.stringify(log.new_values?.[f]))
                        .map((field): DiffRow => ({
                          key:    field,
                          label:  fieldLabel[field] ?? field,
                          oldVal: parseIfStr(log.old_values?.[field]),
                          newVal: parseIfStr(log.new_values?.[field]),
                        }));

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
                                      {log.event === "created"  ? "Series was created"  :
                                       log.event === "deleted"  ? "Series was deleted"  :
                                       log.event === "restored" ? "Series was restored" :
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

                                {/* Changed fields (updated event) */}
                                {log.event === "updated" && diffRows.length > 0 && (
                                  <div className="mt-2 border-top pt-2">
                                    {diffRows.map((row) => {
                                      const fmtVal = (v: any): React.ReactNode => {
                                        if (v === null || v === undefined || v === "")
                                          return <span className="text-muted fst-italic">empty</span>;
                                        if (typeof v === "boolean") return v ? "Yes" : "No";
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

export default TransactionSeriesOverview;
