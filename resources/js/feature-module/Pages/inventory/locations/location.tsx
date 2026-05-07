import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams, useLocation as useRouterLocation } from "react-router";
import { Toast, Modal } from "react-bootstrap";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import CommonSelect, { Option } from "../../../../components/common-select/commonSelect";
import { fetchLocation, storeLocation, updateLocation, uploadLocationLogo } from "../../../../core/services/locationApi";
import { storeSeries } from "../../../../core/services/seriesApi";
import { getLocationList, bustLocationLists, bustLocation } from "../../../../core/cache/locationCache";
import { getSeriesList, bustSeriesLists } from "../../../../core/cache/seriesCache";
import { emitMutation } from "../../../../core/cache/mutationEvents";
import { fetchUsers, type UserListItem } from "../../../../core/services/authApi";

/* ── Static option data ────────────────────────────────────────── */

type LocationType = "business" | "warehouse";

const logoOptions: Option[] = [
  { value: "org",    label: "Same as Organization Logo" },
  { value: "custom", label: "Upload a New Logo" },
];

const countryOptions: Option[] = [
  { value: "IN", label: "India" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "SG", label: "Singapore" },
];

const stateOptions: Record<string, Option[]> = {
  IN: [
    { value: "AN", label: "Andaman and Nicobar Islands" },
    { value: "AP", label: "Andhra Pradesh" },
    { value: "AR", label: "Arunachal Pradesh" },
    { value: "AS", label: "Assam" },
    { value: "BR", label: "Bihar" },
    { value: "CH", label: "Chandigarh" },
    { value: "CT", label: "Chhattisgarh" },
    { value: "DL", label: "Delhi" },
    { value: "GA", label: "Goa" },
    { value: "GJ", label: "Gujarat" },
    { value: "HR", label: "Haryana" },
    { value: "HP", label: "Himachal Pradesh" },
    { value: "JK", label: "Jammu and Kashmir" },
    { value: "JH", label: "Jharkhand" },
    { value: "KA", label: "Karnataka" },
    { value: "KL", label: "Kerala" },
    { value: "LA", label: "Ladakh" },
    { value: "MP", label: "Madhya Pradesh" },
    { value: "MH", label: "Maharashtra" },
    { value: "MN", label: "Manipur" },
    { value: "ML", label: "Meghalaya" },
    { value: "MZ", label: "Mizoram" },
    { value: "NL", label: "Nagaland" },
    { value: "OR", label: "Odisha" },
    { value: "PB", label: "Punjab" },
    { value: "PY", label: "Puducherry" },
    { value: "RJ", label: "Rajasthan" },
    { value: "SK", label: "Sikkim" },
    { value: "TN", label: "Tamil Nadu" },
    { value: "TG", label: "Telangana" },
    { value: "TR", label: "Tripura" },
    { value: "UP", label: "Uttar Pradesh" },
    { value: "UK", label: "Uttarakhand" },
    { value: "WB", label: "West Bengal" },
  ],
  US: [
    { value: "CA", label: "California" },
    { value: "NY", label: "New York" },
    { value: "TX", label: "Texas" },
  ],
  GB: [
    { value: "ENG", label: "England" },
    { value: "SCT", label: "Scotland" },
    { value: "WLS", label: "Wales" },
  ],
  AE: [
    { value: "DXB", label: "Dubai" },
    { value: "AUH", label: "Abu Dhabi" },
  ],
  SG: [
    { value: "SG", label: "Singapore" },
  ],
};

interface SeriesEntry { id: number; name: string; }

/* ── Module-level users cache ──────────────────────────────────── */
let allUsersCache: UserListItem[] | null = null;

interface AccessUser extends UserListItem { role: string; }

/* ── Transaction series module config ──────────────────────────── */
interface SeriesModule {
  module: string;
  prefix: string;
  startingNumber: string;
  restartNumbering: string;
}

const DEFAULT_MODULES: SeriesModule[] = [
  { module: "Credit Note",       prefix: "CN-",   startingNumber: "00001",  restartNumbering: "None" },
  { module: "Customer Payment",  prefix: "",      startingNumber: "1",      restartNumbering: "None" },
  { module: "Purchase Order",    prefix: "PO-",   startingNumber: "00001",  restartNumbering: "None" },
  { module: "Sales Order",       prefix: "SO-",   startingNumber: "00001",  restartNumbering: "None" },
  { module: "Vendor Payment",    prefix: "",      startingNumber: "1",      restartNumbering: "None" },
  { module: "Retainer Invoice",  prefix: "RET-",  startingNumber: "00001",  restartNumbering: "None" },
  { module: "Bill Of Supply",    prefix: "BOS-",  startingNumber: "000001", restartNumbering: "None" },
  { module: "Invoice",           prefix: "INV-",  startingNumber: "000001", restartNumbering: "None" },
  { module: "Sales Return",      prefix: "RMA-",  startingNumber: "00001",  restartNumbering: "None" },
  { module: "Delivery Challan",  prefix: "DC-",   startingNumber: "00001",  restartNumbering: "None" },
];

const RESTART_OPTIONS = ["None", "Every Month", "Every Year"];

const PLACEHOLDER_ITEMS: { label: string; token?: string; sub: { label: string; token: string }[] | null }[] = [
  { label: "Fiscal Year Start", sub: [{ label: "YY", token: "%FYS_YY%" }, { label: "YYYY", token: "%FYS_YYYY%" }] },
  { label: "Fiscal Year End",   sub: [{ label: "YY", token: "%FYE_YY%" }, { label: "YYYY", token: "%FYE_YYYY%" }] },
  { label: "Transaction Year",  sub: [{ label: "YY", token: "%TY_YY%"  }, { label: "YYYY", token: "%TY_YYYY%"  }] },
  { label: "Transaction Date",  token: "%TD%",  sub: null },
  { label: "Transaction Month", token: "%TM%",  sub: null },
];

const resolveTokens = (prefix: string): string => {
  const now = new Date();
  const mo = now.getMonth();
  const y  = now.getFullYear();
  const fysYear = mo >= 3 ? y : y - 1;
  const fyeYear = fysYear + 1;
  const pad2 = (n: number) => String(n).slice(-2);
  return prefix
    .replace(/%FYS_YYYY%/g, String(fysYear))  .replace(/%FYS_YY%/g,   pad2(fysYear))
    .replace(/%FYE_YYYY%/g, String(fyeYear))  .replace(/%FYE_YY%/g,   pad2(fyeYear))
    .replace(/%TY_YYYY%/g,  String(y))        .replace(/%TY_YY%/g,    pad2(y))
    .replace(/%TD%/g,  String(now.getDate()).padStart(2, "0"))
    .replace(/%TM%/g,  String(now.getMonth() + 1).padStart(2, "0"));
};

const seriesPvw = (prefix: string, num: string) => {
  const r = resolveTokens(prefix);
  return r ? `${r}${num}` : num;
};

// ─── Add Series Modal ─────────────────────────────────────────────────────────
interface AddSeriesModalProps {
  show: boolean;
  onHide: () => void;
  onCreated: (entry: SeriesEntry) => void;
}

const AddSeriesModal = ({ show, onHide, onCreated }: AddSeriesModalProps) => {
  const [seriesName,         setSeriesName]         = useState("");
  const [modules,            setModules]            = useState<SeriesModule[]>(DEFAULT_MODULES.map(m => ({ ...m })));
  const [nameError,          setNameError]          = useState("");
  const [apiError,           setApiError]           = useState("");
  const [saving,             setSaving]             = useState(false);
  const [placeholderTarget,  setPlaceholderTarget]  = useState<{ rowIdx: number; top: number; left: number; right: number } | null>(null);
  const [hoveredPlaceholder, setHoveredPlaceholder] = useState<number | null>(null);

  useEffect(() => {
    if (!show) {
      setSeriesName(""); setModules(DEFAULT_MODULES.map(m => ({ ...m })));
      setNameError(""); setApiError(""); setSaving(false);
      setPlaceholderTarget(null); setHoveredPlaceholder(null);
    }
  }, [show]);

  const setMod = (i: number, key: keyof SeriesModule, v: string) =>
    setModules(prev => prev.map((m, idx) => idx === i ? { ...m, [key]: v } : m));

  const insertToken = (token: string) => {
    if (placeholderTarget === null) return;
    setMod(placeholderTarget.rowIdx, "prefix", modules[placeholderTarget.rowIdx].prefix + token);
    setPlaceholderTarget(null); setHoveredPlaceholder(null);
  };

  const handleSave = async () => {
    if (!seriesName.trim()) { setNameError("Series name is required."); return; }
    setNameError(""); setApiError(""); setSaving(true);
    try {
      const res = await storeSeries({
        name: seriesName.trim(),
        modules: modules.map(m => ({
          module:            m.module,
          prefix:            m.prefix,
          starting_number:   m.startingNumber,
          restart_numbering: m.restartNumbering,
        })),
      });
      if (res.success) {
        onCreated({ id: (res as any).data.id, name: (res as any).data.name });
        onHide();
      } else {
        setApiError((res as any).message ?? "Failed to save series.");
      }
    } catch {
      setApiError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Modal show={show} onHide={onHide} centered size="xl" scrollable>
        <Modal.Header closeButton className="px-4 py-3">
          <div>
            <Modal.Title className="fs-17 fw-semibold mb-0">New Transaction Series</Modal.Title>
            <p className="text-muted fs-13 mb-0 mt-1">
              Configure prefix, numbering and restart settings for each transaction type.
            </p>
          </div>
        </Modal.Header>

        <Modal.Body className="px-4 py-4">
          {apiError && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-4 fs-14 rounded" role="alert">
              <i className="ti ti-alert-circle fs-16 flex-shrink-0" />
              {apiError}
            </div>
          )}

          {/* Series Name */}
          <div className="row mb-4 align-items-center">
            <label className="col-sm-3 col-form-label fw-semibold fs-14 text-danger">
              Series Name<span className="ms-1">*</span>
            </label>
            <div className="col-sm-9">
              <input
                autoFocus
                type="text"
                className={`form-control${nameError ? " is-invalid" : ""}`}
                placeholder="e.g. Default Transaction Series"
                value={seriesName}
                onChange={e => { setSeriesName(e.target.value); setNameError(""); }}
                onKeyDown={e => { if (e.key === "Enter") handleSave(); }}
              />
              {nameError && <div className="invalid-feedback">{nameError}</div>}
            </div>
          </div>

          {/* Divider */}
          <div className="d-flex align-items-center gap-3 mb-3">
            <span className="text-uppercase fw-semibold fs-11 text-muted" style={{ letterSpacing: "0.07em", whiteSpace: "nowrap" }}>
              Module Settings
            </span>
            <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
          </div>

          {/* Modules table */}
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <div className="border rounded overflow-hidden" style={{ minWidth: 860 }}>

              {/* Header */}
              <div
                className="d-flex align-items-center px-3 py-2 border-bottom"
                style={{ background: "#f8f9fa", gap: 24 }}
              >
                <div style={{ width: 150, flexShrink: 0 }}>
                  <span className="fw-semibold fs-12 text-uppercase text-muted">Module</span>
                </div>
                <div style={{ flex: 3 }}>
                  <span className="fw-semibold fs-12 text-uppercase text-muted">Prefix</span>
                </div>
                <div style={{ flex: 2 }}>
                  <span className="fw-semibold fs-12 text-uppercase text-muted">Starting No.</span>
                </div>
                <div style={{ flex: 2 }}>
                  <span className="fw-semibold fs-12 text-uppercase text-muted">Restart Numbering</span>
                </div>
                <div style={{ flex: 2 }}>
                  <span className="fw-semibold fs-12 text-uppercase text-muted">Preview</span>
                </div>
              </div>

              {/* Rows */}
              {modules.map((m, i) => (
                <div
                  key={m.module}
                  className="d-flex align-items-center px-3 border-bottom"
                  style={{ gap: 24, paddingTop: 10, paddingBottom: 10, background: "#fff" }}
                >
                  {/* Module name */}
                  <div className="fs-14 fw-medium" style={{ width: 150, flexShrink: 0, color: "#344054", whiteSpace: "nowrap" }}>
                    {m.module}
                  </div>

                  {/* Prefix + variable button */}
                  <div style={{ flex: 3 }}>
                    <div className="input-group" style={{ flexWrap: "nowrap" }}>
                      <input
                        type="text"
                        className="form-control fs-14"
                        style={{ height: 37 }}
                        value={m.prefix}
                        onChange={e => setMod(i, "prefix", e.target.value)}
                        placeholder="e.g. INV-"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-danger d-flex align-items-center justify-content-center"
                        style={{ width: 40, padding: 0, flexShrink: 0 }}
                        title="Insert variable placeholder"
                        onClick={e => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setPlaceholderTarget({ rowIdx: i, top: rect.bottom + 4, left: rect.left, right: window.innerWidth - rect.right });
                        }}
                      >
                        <i className="ti ti-plus fs-14" />
                      </button>
                    </div>
                  </div>

                  {/* Starting number */}
                  <div style={{ flex: 2 }}>
                    <input
                      type="text"
                      className="form-control fs-14"
                      style={{ height: 37 }}
                      value={m.startingNumber}
                      onChange={e => setMod(i, "startingNumber", e.target.value)}
                      placeholder="00001"
                    />
                  </div>

                  {/* Restart numbering */}
                  <div style={{ flex: 2 }}>
                    <select
                      className="form-select fs-14"
                      style={{ height: 37 }}
                      value={m.restartNumbering}
                      onChange={e => setMod(i, "restartNumbering", e.target.value)}
                    >
                      {RESTART_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  {/* Preview */}
                  <div
                    className="fs-13 text-muted"
                    style={{ flex: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    title={seriesPvw(m.prefix, m.startingNumber)}
                  >
                    {seriesPvw(m.prefix, m.startingNumber) || <span style={{ color: "#ccc" }}>—</span>}
                  </div>
                </div>
              ))}

            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="px-4 py-3 border-top justify-content-start gap-2">
          <button
            type="button"
            className="btn btn-danger px-4"
            onClick={handleSave}
            disabled={saving}
            style={{ height: 44, minWidth: 120 }}
          >
            {saving
              ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</>
              : "Save Series"}
          </button>
          <button
            type="button"
            className="btn btn-outline-light px-4"
            onClick={onHide}
            disabled={saving}
            style={{ height: 44 }}
          >
            Cancel
          </button>
        </Modal.Footer>
      </Modal>

      {/* Placeholder variable dropdown (portal) */}
      {placeholderTarget !== null && createPortal(
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 9998 }}
            onClick={() => { setPlaceholderTarget(null); setHoveredPlaceholder(null); }}
          />
          {(() => {
            const menuWidth    = 220;
            const subWidth     = 100;
            const vw           = window.innerWidth;
            const anchorLeft   = placeholderTarget.left + menuWidth <= vw - 8;
            const subOpensLeft = placeholderTarget.left + menuWidth + subWidth > vw - 8;
            return (
              <div
                className="bg-white border rounded shadow-sm"
                style={{
                  position: "fixed", top: placeholderTarget.top,
                  ...(anchorLeft ? { left: placeholderTarget.left } : { right: placeholderTarget.right }),
                  zIndex: 9999, minWidth: menuWidth,
                }}
                onClick={e => e.stopPropagation()}
              >
                {PLACEHOLDER_ITEMS.map((item, idx) => (
                  <div
                    key={item.label}
                    style={{ position: "relative" }}
                    onMouseEnter={() => setHoveredPlaceholder(idx)}
                    onMouseLeave={() => setHoveredPlaceholder(null)}
                  >
                    <div
                      className="px-3 py-2 fs-15 d-flex align-items-center justify-content-between"
                      style={{ cursor: "pointer", background: hoveredPlaceholder === idx ? "#f5f5f5" : "" }}
                      onClick={() => { if (!item.sub && item.token) insertToken(item.token); }}
                    >
                      <span>{item.label}</span>
                      {item.sub && <i className={`ti ti-chevron-${subOpensLeft ? "left" : "right"} fs-13 text-muted`} />}
                    </div>
                    {item.sub && hoveredPlaceholder === idx && (
                      <div
                        className="bg-white border rounded shadow-sm"
                        style={{
                          position: "absolute", top: 0,
                          ...(subOpensLeft ? { right: "100%" } : { left: "100%" }),
                          zIndex: 10000, minWidth: subWidth,
                        }}
                      >
                        {item.sub.map(s => (
                          <div
                            key={s.label}
                            className="px-3 py-2 fs-15"
                            style={{ cursor: "pointer" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#f5f5f5")}
                            onMouseLeave={e => (e.currentTarget.style.background = "")}
                            onClick={() => insertToken(s.token)}
                          >
                            {s.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </>,
        document.body,
      )}
    </>
  );
};

// ─── Series dropdown (matches the Brand dropdown style from items page) ────────
interface SeriesFieldProps {
  value: Option[];
  onChange: (opts: Option[]) => void;
  items: SeriesEntry[];
  placeholder?: string;
  isInvalid?: boolean;
  onAddSeries: () => void;
}

const SeriesField = ({ value, onChange, items, placeholder = "Select Series", isInvalid, onAddSeries }: SeriesFieldProps) => {
  const [open, setOpen]     = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef             = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = () => {
    if (!open && wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      setDropUp(window.innerHeight - rect.bottom < 300);
    }
    setOpen(o => !o);
    setSearch("");
  };

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const isSelected = (id: number) => value.some(v => v.value === String(id));

  const toggle_ = (item: SeriesEntry) => {
    if (isSelected(item.id)) {
      onChange(value.filter(v => v.value !== String(item.id)));
    } else {
      onChange([...value, { value: String(item.id), label: item.name }]);
    }
  };

  const triggerLabel = value.length === 0
    ? ""
    : value.length === 1
      ? value[0].label
      : `${value.length} series selected`;

  return (
    <div ref={wrapRef} className="position-relative" style={open ? { zIndex: 10 } : undefined}>
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          style={{
            cursor: "pointer",
            border: isInvalid ? "1px solid #dc3545" : "1px solid #e8e8e8",
            borderRight: "none",
            boxShadow: isInvalid ? "0 0 0 0.25rem rgba(220,53,69,.25)" : "0px 4px 4px 0px rgba(219,219,219,0.25)",
          }}
          placeholder={placeholder}
          value={triggerLabel}
          readOnly
          onClick={toggle}
        />
        <button
          type="button"
          className="btn btn-outline-light"
          style={{
            border: isInvalid ? "1px solid #dc3545" : "1px solid #e8e8e8",
            borderLeft: "none",
            boxShadow: isInvalid ? "0 0 0 0.25rem rgba(220,53,69,.25)" : "0px 4px 4px 0px rgba(219,219,219,0.25)",
          }}
          onClick={toggle}
        >
          <i className={`ti ti-chevron-${open ? "up" : "down"}`} />
        </button>
      </div>

      {open && (
        <div
          className="position-absolute bg-white border rounded shadow-sm"
          style={{
            ...(dropUp
              ? { bottom: "calc(100% + 4px)", top: "auto" }
              : { top: "calc(100% + 4px)", bottom: "auto" }),
            left: 0, right: 0, zIndex: 1050, minWidth: 220,
          }}
        >
          {/* Search */}
          <div className="p-2 border-bottom">
            <input
              autoFocus
              type="text"
              className="form-control fs-14"
              style={{ height: 42 }}
              placeholder="Search series…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Items */}
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <p className="text-muted fs-13 text-center py-2 mb-0">No results</p>
            ) : filtered.map(item => {
              const active = isSelected(item.id);
              return (
                <div
                  key={item.id}
                  className="px-3 py-2 fs-15 d-flex align-items-center gap-2"
                  style={{
                    cursor: "pointer",
                    background: active ? "#E41F07" : "transparent",
                    color: active ? "#fff" : "#707070",
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#E41F07"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = "#707070"; }}
                  onClick={() => toggle_(item)}
                >
                  <i className={`ti ${active ? "ti-check" : "ti-circle"} fs-13 flex-shrink-0`} />
                  {item.name}
                </div>
              );
            })}
          </div>

          {/* Add Series footer */}
          <div className="border-top px-3 py-2">
            <button
              type="button"
              className="btn btn-link p-0 fs-14 fw-medium"
              style={{ textDecoration: "none", color: "#E41F07" }}
              onClick={() => { setOpen(false); setSearch(""); onAddSeries(); }}
            >
              + Add Series
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════
   Add / Edit Location Page
   ══════════════════════════════════════════════════════════════════ */

const AddLocation = () => {
  const navigate     = useNavigate();
  const { id }       = useParams<{ id: string }>();
  const isEdit       = !!id;
  const routerState  = useRouterLocation().state as { parentId?: number; parentName?: string } | null;

  /* ── Page load ────────────────────────────────────────────────── */
  const [pageLoading, setPageLoading] = useState(true);

  /* ── Location type toggle ─────────────────────────────────────── */
  const [locationType, setLocationType] = useState<LocationType>("business");

  /* ── Form state ───────────────────────────────────────────────── */
  const [logo, setLogo]               = useState<Option | null>(logoOptions[0]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile]       = useState<File | null>(null);
  const logoBlobRef = useRef<string | null>(null);
  const [existingLogoPath, setExistingLogoPath] = useState<string | null>(null);

  const [name, setName]                   = useState("");
  const [isChild, setIsChild]             = useState(false);
  const [parentLocation, setParentLocation] = useState<Option | null>(null);

  // Address
  const [attention, setAttention] = useState("");
  const [street1,   setStreet1]   = useState("");
  const [street2,   setStreet2]   = useState("");
  const [city,      setCity]      = useState("");
  const [pinCode,   setPinCode]   = useState("");
  const [country,   setCountry]   = useState<Option | null>(countryOptions[0]);
  const [state,     setState]     = useState<Option | null>(null);
  const [phone,     setPhone]     = useState("");
  const [fax,       setFax]       = useState("");

  const [websiteUrl, setWebsiteUrl] = useState("");

  const [selectedTxnSeries,        setSelectedTxnSeries]        = useState<Option[]>([]);
  const [selectedDefaultTxnSeries, setSelectedDefaultTxnSeries] = useState<Option | null>(null);

  /* ── Dropdown options (populated from API + cache) ───────────── */
  const [availableLocations,  setAvailableLocations]  = useState<Option[]>([]);
  const [seriesEntries,       setSeriesEntries]       = useState<SeriesEntry[]>([]);
  const [showAddSeriesModal,  setShowAddSeriesModal]  = useState(false);

  /* ── Location Access ─────────────────────────────────────────── */
  const [accessUsers,    setAccessUsers]    = useState<AccessUser[]>([]);
  const [allUsers,       setAllUsers]       = useState<UserListItem[]>([]);
  const [userSearch,   setUserSearch]   = useState("");
  const [userDropOpen, setUserDropOpen] = useState(false);
  const [dropPos,      setDropPos]      = useState({ top: 0, left: 0, width: 0 });
  const userSearchWrapRef = useRef<HTMLDivElement>(null);

  const openUserDrop = useCallback(() => {
    if (!userSearchWrapRef.current) return;
    const r = userSearchWrapRef.current.getBoundingClientRect();
    setDropPos({ top: r.bottom + 2, left: r.left, width: r.width });
    setUserDropOpen(true);
  }, []);

  useEffect(() => {
    if (!userDropOpen) return;
    const close = () => setUserDropOpen(false);
    window.addEventListener("scroll", close, true);
    return () => window.removeEventListener("scroll", close, true);
  }, [userDropOpen]);

  const removeAccessUser = (userId: number) =>
    setAccessUsers(prev => prev.filter(u => u.id !== userId));

  const addAccessUser = (user: UserListItem) => {
    if (accessUsers.some(u => u.id === user.id)) return;
    setAccessUsers(prev => [...prev, { ...user, role: "Staff" }]);
    setUserSearch("");
    setUserDropOpen(false);
  };

  const updateAccessUserRole = (userId: number, role: string) =>
    setAccessUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));

  const filteredUsers = allUsers.filter(u =>
    !accessUsers.some(a => a.id === u.id) &&
    (u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
     (u.email ?? "").toLowerCase().includes(userSearch.toLowerCase()))
  );

  /* ── Soft refresh: reload dropdowns without resetting form ───── */
  const handleRefresh = useCallback(async () => {
    bustLocationLists();
    bustSeriesLists();
    allUsersCache = null;

    const [locsData, serData, usersRes] = await Promise.all([
      getLocationList().catch(() => null),
      getSeriesList().catch(() => null),
      fetchUsers({ all: true }),
    ]);

    if (locsData) {
      const locs = locsData
        .filter(l => l.is_active)
        .map(l => ({ value: String(l.id), label: l.name }));
      setAvailableLocations(locs);
    }

    if (serData) {
      setSeriesEntries(serData.map(s => ({ id: s.id, name: s.name })));
    }

    if (usersRes.success) {
      const users = (usersRes as any).data as UserListItem[];
      allUsersCache = users;
      setAllUsers(users);
    }
  }, []);

  /* ── Called when AddSeriesModal saves successfully ────────────── */
  const onSeriesCreated = (entry: SeriesEntry) => {
    setSeriesEntries(prev => [...prev, entry]);
    bustSeriesLists();
    setSelectedTxnSeries(prev => [...prev, { value: String(entry.id), label: entry.name }]);
    clr("transactionSeries");
  };

  /* ── Validation ───────────────────────────────────────────────── */
  const [errors, setErrors] = useState<Record<string, string>>({});
  const clr = (key: string) =>
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });

  /* ── Saving / Toast ───────────────────────────────────────────── */
  const [saving, setSaving] = useState(false);
  const [toast, setToast]   = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false, message: "", type: "success",
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(
      () => setToast(t => ({ ...t, show: false })), 4000,
    );
  };

  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);
  useEffect(() => () => { if (logoBlobRef.current) URL.revokeObjectURL(logoBlobRef.current); }, []);

  /* ── Single parallel load on mount ───────────────────────────── */
  useEffect(() => {
    (async () => {
      setPageLoading(true);

      const [locsData, serData, usersRes, editRes] = await Promise.all([
        getLocationList().catch(() => null),
        getSeriesList().catch(() => null),
        allUsersCache
          ? Promise.resolve({ success: true as const, data: [] as UserListItem[] })
          : fetchUsers({ all: true }),
        isEdit ? fetchLocation(Number(id)) : Promise.resolve(null),
      ]);

      // Locations options
      let locs: Option[] = [];
      if (locsData) {
        locs = locsData
          .filter(l => l.is_active)
          .map(l => ({ value: String(l.id), label: l.name }));
      } else {
        showToast("Failed to load locations.", "error");
      }
      const filteredLocs = isEdit && id ? locs.filter(l => l.value !== String(id)) : locs;
      setAvailableLocations(filteredLocs);

      // Series entries
      let series: SeriesEntry[] = [];
      if (serData) {
        series = serData.map(s => ({ id: s.id, name: s.name }));
      } else {
        showToast("Failed to load transaction series.", "error");
      }
      setSeriesEntries(series);

      // Users (for Location Access)
      let users = allUsersCache;
      if (!users) {
        if (usersRes && usersRes.success) {
          users = (usersRes as any).data as UserListItem[];
          allUsersCache = users;
        } else {
          showToast("Failed to load users for location access.", "error");
          users = [];
        }
      }
      setAllUsers(users ?? []);

      // Pre-fill parent when navigated via "Add Child" flow
      if (!isEdit && routerState?.parentId) {
        setIsChild(true);
        setParentLocation({ value: String(routerState.parentId), label: routerState.parentName ?? "" });
      }

      // Pre-fill form for edit mode — done once, all data is available here
      if (isEdit && editRes) {
        if (!editRes.success) {
          showToast((editRes as any).message ?? "Failed to load location data.", "error");
        } else {
          const d = (editRes as any).data;

          setLocationType(d.type ?? "business");
          setName(d.name ?? "");
          setWebsiteUrl(d.website_url ?? "");

          // Logo
          const logoOpt = logoOptions.find(o => o.value === d.logo_type) ?? logoOptions[0];
          setLogo(logoOpt);
          if (d.logo_path) {
            setLogoPreview(`/storage/${d.logo_path}`);
            setExistingLogoPath(d.logo_path);
          }

          // Parent
          if (d.parent_id && d.parent) {
            setParentLocation({ value: String(d.parent.id), label: d.parent.name });
            if (d.type === "business") setIsChild(true);
          }

          // Address
          const addr = d.address ?? {};
          setAttention(addr.attention ?? "");
          setStreet1(addr.street1    ?? "");
          setStreet2(addr.street2    ?? "");
          setCity(addr.city          ?? "");
          setPinCode(addr.pin_code   ?? "");
          setPhone(addr.phone        ?? "");
          setFax(addr.fax            ?? "");

          const countryOpt = countryOptions.find(o => o.value === addr.country) ?? null;
          setCountry(countryOpt);
          if (addr.state && addr.country) {
            setState((stateOptions[addr.country] ?? []).find(o => o.value === addr.state) ?? null);
          }

          // Transaction series — entries are already loaded above
          if (series.length > 0) {
            if (Array.isArray(d.txn_series_ids) && d.txn_series_ids.length > 0) {
              const selected = (d.txn_series_ids as number[])
                .map(sid => series.find(e => e.id === sid))
                .filter(Boolean)
                .map(s => ({ value: String(s!.id), label: s!.name }));
              setSelectedTxnSeries(selected);
            } else if (d.txn_series_id) {
              const s = series.find(e => e.id === d.txn_series_id);
              if (s) setSelectedTxnSeries([{ value: String(s.id), label: s.name }]);
            }
            if (d.default_txn_series_id) {
              const s = series.find(e => e.id === d.default_txn_series_id);
              if (s) setSelectedDefaultTxnSeries({ value: String(s.id), label: s.name });
            }
          }

          // Access users — match saved user_ids to full user objects
          if (Array.isArray(d.access_users) && users && users.length > 0) {
            const prefilled: AccessUser[] = (d.access_users as { user_id: number; role: string }[])
              .map(au => {
                const found = users!.find(u => u.id === au.user_id);
                return found ? { ...found, role: au.role } : null;
              })
              .filter(Boolean) as AccessUser[];
            setAccessUsers(prefilled);
          }
        }
      }

      setPageLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Validation ───────────────────────────────────────────────── */
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = "Name is required";

    if (websiteUrl.trim() && !/^https?:\/\//i.test(websiteUrl.trim()))
      errs.websiteUrl = "URL must start with http:// or https://";

    if (locationType === "business" && isChild && !parentLocation)
      errs.parentLocation = "Parent Location is required";

    if (locationType === "warehouse" && !parentLocation)
      errs.parentLocation = "Parent Location is required";

    if (locationType === "business") {
      if (selectedTxnSeries.length === 0) errs.transactionSeries = "Transaction Number Series is required";
      if (!selectedDefaultTxnSeries) errs.defaultTransactionSeries = "Default Transaction Number Series is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Save handler ─────────────────────────────────────────────── */
  const handleSave = async () => {
    if (!validate()) {
      showToast("Please fill in all required fields before saving.", "error");
      return;
    }
    setSaving(true);

    try {
      // Logo: preserve existing path if no new file was selected
      let resolvedLogoPath: string | null = existingLogoPath;

      if (logo?.value === "custom" && logoFile) {
        const uploadRes = await uploadLocationLogo(logoFile);
        if (!uploadRes.success) {
          showToast(uploadRes.message ?? "Logo upload failed", "error");
          setSaving(false);
          return;
        }
        resolvedLogoPath = uploadRes.path ?? null;
      } else if (logo?.value !== "custom") {
        // Switched away from custom — clear any stored path
        resolvedLogoPath = null;
      }

      const payload = {
        name:      name.trim(),
        type:      locationType,
        parent_id: parentLocation ? Number(parentLocation.value) : null,
        logo_type: logo?.value ?? "org",
        logo_path: resolvedLogoPath,
        website_url: websiteUrl || undefined,
        is_active: true,
        address: {
          attention: attention || undefined,
          street1:   street1   || undefined,
          street2:   street2   || undefined,
          city:      city      || undefined,
          pin_code:  pinCode   || undefined,
          country:   country?.value ?? undefined,
          state:     state?.value   ?? undefined,
          phone:     phone     || undefined,
          fax:       fax       || undefined,
        },
        access_users: accessUsers.map(u => ({ user_id: u.id, role: u.role })),
        ...(locationType === "business" && {
          txn_series_ids:        selectedTxnSeries.map(o => Number(o.value)),
          default_txn_series_id: selectedDefaultTxnSeries ? Number(selectedDefaultTxnSeries.value) : undefined,
        }),
      };

      const res = isEdit
        ? await updateLocation(Number(id), payload)
        : await storeLocation(payload);

      if (res.success) {
        if (isEdit) {
          bustLocation(Number(id));
        } else {
          bustLocationLists();
        }
        bustSeriesLists();
        emitMutation("locations:mutated");
        showToast(isEdit ? "Location updated successfully" : "Location created successfully", "success");
        const targetId = isEdit ? id : (res as any).data.id;
        setTimeout(() => navigate(`/locations/${targetId}`), 1500);
      } else {
        showToast(res.message ?? (isEdit ? "Failed to update location" : "Failed to create location"), "error");
      }
    } catch {
      showToast(isEdit ? "Failed to update location" : "Failed to create location", "error");
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate("/"));

  const currentStates = stateOptions[country?.value ?? ""] ?? [];

  /* ── Render ───────────────────────────────────────────────────── */
  if (pageLoading) {
    return (
      <div className="page-wrapper">
        <div className="content d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
          <span className="spinner-border spinner-border-sm me-2 text-primary" />
          <span className="text-muted">Loading…</span>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <div className="page-wrapper">
        <div className="content">

          {/* ── Page header ──────────────────────────────────────── */}
          <PageHeader
            title={isEdit ? "Edit Location" : "Add Location"}
            badgeCount={false}
            showModuleTile={false}
            showExport={false}
            showClose
            onClose={goBack}
            onRefresh={handleRefresh}
          />

          {/* ── Main Card ────────────────────────────────────────── */}
          <div className="card mb-0">
            <div className="card-body p-4">

              {/* ══ Location Type ═══════════════════════════════════ */}
              <div className="row mb-3 align-items-start">
                <label className="col-sm-2 col-form-label fw-medium fs-14 pt-2">Location Type</label>
                <div className="col-sm-10">
                  <div className="d-flex gap-3">
                    {([
                      {
                        value: "business" as LocationType,
                        label: "Business Location",
                        desc:  "A Business Location represents your organization or office's operational location. It is used to record transactions, assess regional performance, and monitor stock levels for items stored at this location.",
                      },
                      {
                        value: "warehouse" as LocationType,
                        label: "Warehouse Only Location",
                        desc:  "A Warehouse Only Location refers to where your items are stored. It helps track and monitor stock levels for items stored at this location.",
                      },
                    ]).map(opt => {
                      const active = locationType === opt.value;
                      return (
                        <div
                          key={opt.value}
                          onClick={() => setLocationType(opt.value)}
                          style={{
                            border: `2px solid ${active ? "#E41F3B" : "#dee2e6"}`,
                            borderRadius: 8,
                            padding: "16px 20px",
                            background: active ? "rgba(228,31,59,0.03)" : "#fff",
                            cursor: "pointer",
                            flex: 1,
                            transition: "all .15s",
                          }}
                        >
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <span
                              style={{
                                width: 18, height: 18, borderRadius: "50%",
                                border: `2px solid ${active ? "#E41F3B" : "#adb5bd"}`,
                                display: "inline-flex", alignItems: "center",
                                justifyContent: "center", flexShrink: 0,
                              }}
                            >
                              {active && (
                                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#E41F3B" }} />
                              )}
                            </span>
                            <span className="fw-semibold fs-14">{opt.label}</span>
                          </div>
                          <p className="text-muted fs-13 mb-0" style={{ lineHeight: 1.5 }}>
                            {opt.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ══ Logo (Business only) ════════════════════════════ */}
              {locationType === "business" && (
                <>
                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-2 col-form-label fw-medium fs-14">Logo</label>
                    <div className="col-sm-10">
                      <CommonSelect
                        className="select"
                        options={logoOptions}
                        defaultValue={logoOptions[0]}
                        value={logo}
                        onChange={v => setLogo(v)}
                      />
                    </div>
                  </div>

                  {logo?.value === "custom" && (
                    <div className="row mb-3">
                      <div className="col-sm-2" />
                      <div className="col-sm-10">
                        <div className="d-flex gap-4 align-items-start">
                          <label
                            htmlFor="location_logo_input"
                            className="border rounded d-flex flex-column align-items-center justify-content-center text-center position-relative overflow-hidden"
                            style={{ cursor: "pointer", background: "#fafafa", width: 240, height: 200 }}
                          >
                            {logoPreview ? (
                              <>
                                <img
                                  src={logoPreview}
                                  alt="Location logo preview"
                                  className="rounded"
                                  style={{ height: "100%", width: "100%", objectFit: "contain", padding: 8 }}
                                />
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 p-1 lh-1"
                                  style={{ fontSize: 12 }}
                                  onClick={e => {
                                    e.preventDefault();
                                    if (logoBlobRef.current) { URL.revokeObjectURL(logoBlobRef.current); logoBlobRef.current = null; }
                                    setLogoPreview(null);
                                    setLogoFile(null);
                                    setExistingLogoPath(null);
                                  }}
                                >
                                  <i className="ti ti-x" />
                                </button>
                              </>
                            ) : (
                              <>
                                <i className="ti ti-photo-up text-primary fs-32 mb-2" />
                                <span className="fw-semibold fs-14">Upload your Location Logo</span>
                                <small className="text-muted mt-1">Click to upload — PNG, JPG up to 1 MB</small>
                              </>
                            )}
                          </label>
                          <input
                            id="location_logo_input"
                            type="file"
                            accept="image/*"
                            className="d-none"
                            onClick={e => { (e.target as HTMLInputElement).value = ""; }}
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (file.size > 1024 * 1024) {
                                showToast("File size must be 1 MB or less.", "error");
                                e.target.value = "";
                                return;
                              }
                              if (logoBlobRef.current) URL.revokeObjectURL(logoBlobRef.current);
                              const blobUrl = URL.createObjectURL(file);
                              logoBlobRef.current = blobUrl;
                              setLogoFile(file);
                              setLogoPreview(blobUrl);
                              setExistingLogoPath(null);
                            }}
                          />
                          <div>
                            <p className="fw-medium fs-14 mb-1">
                              This logo will be displayed in transaction PDFs and email notifications.
                            </p>
                            <p className="text-primary fs-13 mb-1">
                              Preferred Image Dimensions: 240 × 240 pixels @ 72 DPI
                            </p>
                            <p className="text-muted fs-13 mb-1">Supported Files: jpg, jpeg, png, gif, bmp</p>
                            <p className="text-muted fs-13 mb-0">Maximum File Size: 1MB</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ══ Name ═══════════════════════════════════════════ */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label fw-medium fs-14 text-danger">
                  Name<span className="ms-1">*</span>
                </label>
                <div className="col-sm-10">
                  <input
                    type="text"
                    className={`form-control${errors.name ? " is-invalid" : ""}`}
                    placeholder="Location Name"
                    maxLength={100}
                    value={name}
                    onChange={e => { setName(e.target.value); clr("name"); }}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
              </div>

              {/* ══ Child / Parent Location ═════════════════════════ */}
              {locationType === "business" ? (
                <>
                  <div className="row mb-3 align-items-center">
                    <div className="col-sm-2" />
                    <div className="col-sm-10">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isChildLocation"
                          checked={isChild}
                          onChange={e => setIsChild(e.target.checked)}
                        />
                        <label className="form-check-label fw-medium fs-14" htmlFor="isChildLocation">
                          This is a Child Location
                        </label>
                      </div>
                    </div>
                  </div>

                  {isChild && (
                    <div className="row mb-3 align-items-center">
                      <label className="col-sm-2 col-form-label fw-medium fs-14 text-danger">
                        Parent Location<span className="ms-1">*</span>
                      </label>
                      <div className="col-sm-10">
                        <CommonSelect
                          className="select"
                          options={availableLocations}
                          value={parentLocation}
                          onChange={v => { setParentLocation(v); clr("parentLocation"); }}
                        />
                        {errors.parentLocation && <div className="text-danger fs-12 mt-1">{errors.parentLocation}</div>}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-2 col-form-label fw-medium fs-14 text-danger">
                    Parent Location<span className="ms-1">*</span>
                  </label>
                  <div className="col-sm-10">
                    <CommonSelect
                      className="select"
                      options={availableLocations}
                      value={parentLocation}
                      onChange={v => { setParentLocation(v); clr("parentLocation"); }}
                    />
                    {errors.parentLocation && <div className="text-danger fs-12 mt-1">{errors.parentLocation}</div>}
                  </div>
                </div>
              )}

              {/* ══ Address ═════════════════════════════════════════ */}
              <div className="row mb-3 align-items-start">
                <label className="col-sm-2 col-form-label fw-medium fs-14 pt-2">Address</label>
                <div className="col-sm-10">
                  <div className="d-flex flex-column gap-3">
                    <input type="text" className="form-control" placeholder="Attention"
                      maxLength={100} value={attention} onChange={e => setAttention(e.target.value)} />
                    <input type="text" className="form-control" placeholder="Street 1"
                      maxLength={255} value={street1} onChange={e => setStreet1(e.target.value)} />
                    <input type="text" className="form-control" placeholder="Street 2"
                      maxLength={255} value={street2} onChange={e => setStreet2(e.target.value)} />
                    <div className="d-flex gap-3">
                      <input type="text" className="form-control" placeholder="City"
                        maxLength={100} value={city} onChange={e => setCity(e.target.value)} />
                      <input type="text" className="form-control" placeholder="Pin Code"
                        maxLength={10} value={pinCode} onChange={e => setPinCode(e.target.value)} />
                    </div>
                    <CommonSelect
                      className="select"
                      options={countryOptions}
                      defaultValue={countryOptions[0]}
                      value={country}
                      onChange={v => { setCountry(v); setState(null); }}
                    />
                    <div className="d-flex gap-3">
                      <div style={{ flex: 1 }}>
                        <CommonSelect
                          className="select"
                          options={currentStates}
                          value={state}
                          onChange={v => setState(v)}
                        />
                      </div>
                      <input type="text" className="form-control" placeholder="Phone"
                        maxLength={20} value={phone} onChange={e => setPhone(e.target.value)} style={{ flex: 1 }} />
                    </div>
                    <input type="text" className="form-control" placeholder="Fax Number"
                      maxLength={20} value={fax} onChange={e => setFax(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* ══ Website URL ═════════════════════════════════════ */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label fw-medium fs-14">Website URL</label>
                <div className="col-sm-10">
                  <input
                    type="url"
                    className={`form-control${errors.websiteUrl ? " is-invalid" : ""}`}
                    placeholder="https://example.com"
                    maxLength={500}
                    value={websiteUrl}
                    onChange={e => { setWebsiteUrl(e.target.value); clr("websiteUrl"); }}
                  />
                  {errors.websiteUrl && <div className="invalid-feedback">{errors.websiteUrl}</div>}
                </div>
              </div>

              {/* ══ Transaction Number Series (Business only) ══════ */}
              {locationType === "business" && (
                <>
                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-2 col-form-label fw-medium fs-14 text-danger">
                      Transaction Number Series<span className="ms-1">*</span>
                    </label>
                    <div className="col-sm-10">
                      <SeriesField
                        items={seriesEntries}
                        value={selectedTxnSeries}
                        placeholder="Select Series"
                        isInvalid={!!errors.transactionSeries}
                        onChange={opts => { setSelectedTxnSeries(opts); clr("transactionSeries"); }}
                        onAddSeries={() => setShowAddSeriesModal(true)}
                      />
                      {errors.transactionSeries && <div className="text-danger fs-12 mt-1">{errors.transactionSeries}</div>}
                    </div>
                  </div>
                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-2 col-form-label fw-medium fs-14 text-danger">
                      Default Transaction Number Series<span className="ms-1">*</span>
                    </label>
                    <div className="col-sm-10">
                      <CommonSelect
                        className="select"
                        options={seriesEntries.map(s => ({ value: String(s.id), label: s.name }))}
                        value={selectedDefaultTxnSeries}
                        placeholder="Select Default Series"
                        onChange={v => { setSelectedDefaultTxnSeries(v); clr("defaultTransactionSeries"); }}
                      />
                      {errors.defaultTransactionSeries && <div className="text-danger fs-12 mt-1">{errors.defaultTransactionSeries}</div>}
                    </div>
                  </div>
                </>
              )}

              {/* ══ Location Access ═════════════════════════════════ */}
              <div className="row mb-4 align-items-start">
                <label className="col-sm-2 col-form-label fw-medium fs-14 pt-2">Location Access</label>
                <div className="col-sm-10">
                  <div style={{ border: "1px solid #dee2e6", borderRadius: 8, overflow: "hidden" }}>

                    {/* Header + search */}
                    <div style={{ background: "#fff0f2", padding: "12px 16px", borderBottom: "1px solid #dee2e6" }}>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E41F3B" }} />
                          <span className="fw-semibold fs-14">{accessUsers.length} user(s) selected</span>
                        </div>
                      </div>
                      <p className="text-muted fs-13 mb-2">
                        Selected users can create and access transactions for this location.
                      </p>

                      {/* User search to add */}
                      <div ref={userSearchWrapRef}>
                        <div className="input-group">
                          <span className="input-group-text bg-white border-end-0">
                            <i className="ti ti-user-search fs-15 text-muted" />
                          </span>
                          <input
                            type="text"
                            className="form-control border-start-0 ps-0 fs-14"
                            placeholder="Search users to add…"
                            value={userSearch}
                            onChange={e => { setUserSearch(e.target.value); openUserDrop(); }}
                            onFocus={openUserDrop}
                            onBlur={() => setTimeout(() => setUserDropOpen(false), 150)}
                          />
                        </div>
                      </div>

                      {userDropOpen && (userSearch.trim() !== "" || filteredUsers.length > 0) && createPortal(
                        <div style={{
                          position: "fixed",
                          top: dropPos.top, left: dropPos.left, width: dropPos.width,
                          zIndex: 9999,
                          background: "#fff", border: "1px solid #dee2e6", borderRadius: 6,
                          boxShadow: "0 4px 16px rgba(0,0,0,0.12)", maxHeight: 240, overflowY: "auto",
                        }}>
                          {filteredUsers.length === 0 ? (
                            <div className="px-3 py-2 text-muted fs-13">No users found.</div>
                          ) : filteredUsers.map(u => (
                            <button
                              key={u.id}
                              type="button"
                              className="w-100 text-start px-3 py-2 border-0 bg-transparent d-flex align-items-center gap-2"
                              style={{ cursor: "pointer" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#f8f9fa")}
                              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                              onMouseDown={() => addAccessUser(u)}
                            >
                              <span
                                className="d-flex align-items-center justify-content-center rounded-circle bg-light flex-shrink-0"
                                style={{ width: 32, height: 32, fontSize: 13, fontWeight: 600, color: "#6c757d", overflow: "hidden" }}
                              >
                                {u.avatar
                                  ? <img src={u.avatar} alt={u.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                  : u.name.charAt(0).toUpperCase()
                                }
                              </span>
                              <div>
                                <div className="fw-medium fs-14">{u.name}</div>
                                {u.email && <div className="text-muted fs-12">{u.email}</div>}
                              </div>
                              <span className="ms-auto badge bg-light text-muted" style={{ fontSize: 11 }}>
                                {u.user_type.replace("_", " ")}
                              </span>
                            </button>
                          ))}
                        </div>,
                        document.body,
                      )}
                    </div>

                    {/* Table */}
                    <table className="table mb-0" style={{ tableLayout: "fixed" }}>
                      <thead>
                        <tr>
                          <th className="text-uppercase fs-12 fw-semibold text-muted"
                            style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6" }}>
                            Users
                          </th>
                          <th className="text-uppercase fs-12 fw-semibold text-muted"
                            style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", width: 150 }}>
                            Role
                          </th>
                          <th style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", width: 48 }} />
                        </tr>
                      </thead>
                      <tbody>
                        {accessUsers.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="text-center text-muted py-4" style={{ fontSize: 15 }}>
                              No users assigned. Search above to add users.
                            </td>
                          </tr>
                        ) : accessUsers.map(user => (
                          <tr key={user.id}>
                            <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                              <div className="d-flex align-items-center gap-3">
                                <span
                                  className="d-flex align-items-center justify-content-center rounded-circle bg-light flex-shrink-0"
                                  style={{ width: 36, height: 36, fontSize: 14, fontWeight: 600, color: "#6c757d", overflow: "hidden" }}
                                >
                                  {user.avatar
                                    ? <img src={user.avatar} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    : user.name.charAt(0).toUpperCase()
                                  }
                                </span>
                                <div>
                                  <div className="fw-medium fs-14">{user.name}</div>
                                  <div className="text-muted fs-13">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "8px 16px", verticalAlign: "middle" }}>
                              <input
                                type="text"
                                className="form-control fs-13"
                                style={{ background: "#f8f9fa", cursor: "default" }}
                                value={user.role}
                                readOnly
                                placeholder="Role"
                              />
                            </td>
                            <td style={{ padding: "12px 16px", verticalAlign: "middle", textAlign: "center" }}>
                              <button
                                type="button"
                                className="btn btn-sm btn-light d-flex align-items-center justify-content-center"
                                style={{ width: 28, height: 28, padding: 0 }}
                                title="Remove user"
                                onClick={() => removeAccessUser(user.id)}
                              >
                                <i className="ti ti-x fs-13 text-danger" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>{/* card-body */}
          </div>{/* card */}

        </div>{/* content */}

        {/* ══ Sticky Save / Cancel bar ═════════════════════════════ */}
        <div
          className="bg-white border-top d-flex align-items-center gap-2 px-4"
          style={{ position: "sticky", bottom: 0, zIndex: 100, height: 60 }}
        >
          <button type="button" className="btn btn-danger me-2" onClick={handleSave} disabled={saving}>
            {saving
              ? <><span className="spinner-border spinner-border-sm me-1" role="status" />{isEdit ? "Updating…" : "Saving…"}</>
              : (isEdit ? "Update" : "Save")
            }
          </button>
          <button type="button" className="btn btn-outline-light" onClick={goBack} disabled={saving}>
            Cancel
          </button>
        </div>

        <Footer />
      </div>

      {/* ── Toast Notifications ─────────────────────────────────── */}
      <div className="position-fixed top-0 start-50 translate-middle-x pt-4" style={{ zIndex: 9999, pointerEvents: "none" }}>
        <Toast
          show={toast.show}
          onClose={() => setToast(t => ({ ...t, show: false }))}
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

      {/* ── Add Series Modal ─────────────────────────────────────── */}
      <AddSeriesModal
        show={showAddSeriesModal}
        onHide={() => setShowAddSeriesModal(false)}
        onCreated={onSeriesCreated}
      />

    </>
  );
};

export default AddLocation;
