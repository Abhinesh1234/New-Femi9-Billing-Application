import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Toast } from "react-bootstrap";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import CommonSelect, { Option } from "../../../../components/common-select/commonSelect";
import { fetchLocation, fetchLocations, storeLocation, updateLocation, uploadLocationLogo } from "../../../../core/services/locationApi";
import { fetchSeries } from "../../../../core/services/seriesApi";

/* ── Static option data ────────────────────────────────────────── */

type LocationType = "business" | "warehouse";

const logoOptions: Option[] = [
  { value: "org", label: "Same as Organization Logo" },
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

const contactOptions: Option[] = [
  { value: "zebron", label: "zebron <a2zideas1@gmail.com>" },
];


const resolveTokens = (prefix: string): string => {
  const now = new Date();
  const m = now.getMonth(); // 0-based
  const y = now.getFullYear();

  // Fiscal year: April–March (start = April of current or previous year)
  const fysYear = m >= 3 ? y : y - 1;       // April = month 3
  const fyeYear = fysYear + 1;

  const pad2 = (n: number) => String(n).slice(-2);

  return prefix
    .replace(/%FYS_YYYY%/g, String(fysYear))
    .replace(/%FYS_YY%/g,   pad2(fysYear))
    .replace(/%FYE_YYYY%/g, String(fyeYear))
    .replace(/%FYE_YY%/g,   pad2(fyeYear))
    .replace(/%TY_YYYY%/g,  String(y))
    .replace(/%TY_YY%/g,    pad2(y))
    .replace(/%TD%/g,        String(now.getDate()).padStart(2, "0"))
    .replace(/%TM%/g,        String(m + 1).padStart(2, "0"));
};

const pvw = (prefix: string, num: string) => {
  const resolved = resolveTokens(prefix);
  return resolved ? `${resolved}${num}` : num;
};

/* parentLocationOptions populated dynamically — see useEffect in AddLocation */

/* ── Dummy user for Location Access ────────────────────────────── */

interface AccessUser {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

const defaultUsers: AccessUser[] = [
  {
    id: 1,
    name: "zebron",
    email: "a2zideas1@gmail.com",
    avatar: "",
    role: "Admin",
  },
];

/* ══════════════════════════════════════════════════════════════════
   Add Location Page
   ══════════════════════════════════════════════════════════════════ */

const AddLocation = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  /* ── Raw edit data (populated when id is present) ─────────────── */
  const [editRawData, setEditRawData]   = useState<any>(null);
  const [pageLoading, setPageLoading]   = useState(isEdit);

  /* ── Location type toggle ─────────────────────────────────────── */
  const [locationType, setLocationType] = useState<LocationType>("business");

  /* ── Form state ───────────────────────────────────────────────── */
  const [logo, setLogo] = useState<Option | null>(logoOptions[0]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [isChild, setIsChild] = useState(false);
  const [parentLocation, setParentLocation] = useState<Option | null>(null);

  // Address
  const [attention, setAttention] = useState("");
  const [street1, setStreet1] = useState("");
  const [street2, setStreet2] = useState("");
  const [city, setCity] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [country, setCountry] = useState<Option | null>(countryOptions[0]);
  const [state, setState] = useState<Option | null>(null);
  const [phone, setPhone] = useState("");
  const [fax, setFax] = useState("");

  const [websiteUrl, setWebsiteUrl] = useState("");
  const [primaryContact, setPrimaryContact] = useState<Option | null>(null);
  const [primaryContactText, setPrimaryContactText] = useState("");
  const [selectedTxnSeries, setSelectedTxnSeries] = useState<Option | null>(null);
  const [selectedDefaultTxnSeries, setSelectedDefaultTxnSeries] = useState<Option | null>(null);

  /* ── Available parent locations (fetched from API) ───────────── */
  const [availableLocations, setAvailableLocations] = useState<Option[]>([]);

  useEffect(() => {
    fetchLocations({ active_only: true }).then(res => {
      if (res.success) {
        setAvailableLocations(res.data.map(l => ({ value: String(l.id), label: l.name })));
      } else {
        showToast((res as any).message ?? "Failed to load locations.", "error");
      }
    }).catch(() => showToast("Failed to load locations.", "error"));
  }, []);

  /* ── Transaction Series (loaded from API) ────────────────────── */
  const [seriesOptions, setSeriesOptions] = useState<Option[]>([]);

  useEffect(() => {
    fetchSeries().then(res => {
      if (res.success) {
        setSeriesOptions(res.data.map(s => ({ value: String(s.id), label: s.name })));
      } else {
        showToast((res as any).message ?? "Failed to load transaction series.", "error");
      }
    }).catch(() => showToast("Failed to load transaction series.", "error"));
  }, []);

  /* ── Fetch existing location when editing ─────────────────────── */
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setPageLoading(true);
      const res = await fetchLocation(Number(id));
      if (res.success) {
        setEditRawData((res as any).data);
      } else {
        showToast((res as any).message ?? "Failed to load location data.", "error");
      }
      setPageLoading(false);
    })();
  }, [id]);

  /* ── Pre-fill form once raw data + options are ready ─────────── */
  useEffect(() => {
    if (!editRawData) return;
    const d = editRawData;

    setLocationType(d.type ?? "business");
    setName(d.name ?? "");
    setWebsiteUrl(d.website_url ?? "");

    // Logo
    const logoOpt = logoOptions.find(o => o.value === d.logo_type) ?? logoOptions[0];
    setLogo(logoOpt);
    if (d.logo_path) setLogoPreview(`/storage/${d.logo_path}`);

    // Parent (business = optional child, warehouse = required parent)
    if (d.parent_id && d.parent) {
      setParentLocation({ value: String(d.parent.id), label: d.parent.name });
      if (d.type === "business") setIsChild(true);
    }

    // Address
    const addr = d.address ?? {};
    setAttention(addr.attention ?? "");
    setStreet1(addr.street1 ?? "");
    setStreet2(addr.street2 ?? "");
    setCity(addr.city ?? "");
    setPinCode(addr.pin_code ?? "");
    setPhone(addr.phone ?? "");
    setFax(addr.fax ?? "");
    const countryOpt = countryOptions.find(o => o.value === addr.country) ?? null;
    setCountry(countryOpt);
    if (addr.state && addr.country) {
      const stateOpt = (stateOptions[addr.country] ?? []).find(o => o.value === addr.state) ?? null;
      setState(stateOpt);
    }

    // Transaction series — resolved once seriesOptions are loaded
    if (seriesOptions.length > 0) {
      if (d.txn_series_id) {
        setSelectedTxnSeries(seriesOptions.find(o => o.value === String(d.txn_series_id)) ?? null);
      }
      if (d.default_txn_series_id) {
        setSelectedDefaultTxnSeries(seriesOptions.find(o => o.value === String(d.default_txn_series_id)) ?? null);
      }
    }
  }, [editRawData, seriesOptions]);

  /* ── Location Access ──────────────────────────────────────────── */
  const [accessUsers] = useState<AccessUser[]>(defaultUsers);

  /* ── Validation ───────────────────────────────────────────────── */
  const [errors, setErrors] = useState<Record<string, string>>({});
  const clr = (key: string) => setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });

  /* ── Saving state ─────────────────────────────────────────────── */
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false, message: "", type: "success",
  });

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (message: string, type: "success" | "error" = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  /* ── Validation logic ─────────────────────────────────────────── */
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = "Name is required";

    if (locationType === "business") {
      if (isChild && !parentLocation) errs.parentLocation = "Parent Location is required";
      if (!primaryContact) errs.primaryContact = "Primary Contact is required";
      if (!selectedTxnSeries) errs.transactionSeries = "Transaction Number Series is required";
      if (!selectedDefaultTxnSeries) errs.defaultTransactionSeries = "Default Transaction Number Series is required";
      // Note: series are org-level — created separately via Transaction Series Preferences
    }

    if (locationType === "warehouse") {
      if (!parentLocation) errs.parentLocation = "Parent Location is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Save handler ─────────────────────────────────────────────── */
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    try {
      // Upload custom logo first if selected
      let resolvedLogoPath: string | null = null;
      if (logo?.value === "custom" && logoFile) {
        const uploadRes = await uploadLocationLogo(logoFile);
        if (!uploadRes.success) {
          showToast(uploadRes.message ?? "Logo upload failed", "error");
          setSaving(false);
          return;
        }
        resolvedLogoPath = uploadRes.path ?? null;
      }

      const payload = {
        name:                   name.trim(),
        type:                   locationType,
        parent_id:              parentLocation ? Number(parentLocation.value) : null,
        logo_type:              logo?.value ?? "org",
        logo_path:              resolvedLogoPath,
        website_url:            websiteUrl || undefined,
        is_active:              true,
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
          txn_series_id:         selectedTxnSeries        ? Number(selectedTxnSeries.value)        : undefined,
          default_txn_series_id: selectedDefaultTxnSeries ? Number(selectedDefaultTxnSeries.value) : undefined,
        }),
      };

      const res = isEdit
        ? await updateLocation(Number(id), payload)
        : await storeLocation(payload);

      if (res.success) {
        showToast(isEdit ? "Location updated successfully" : "Location created successfully", "success");
        setTimeout(() => navigate(isEdit ? `/locations/${id}` : -1 as any), 600);
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
          <span className="text-muted">Loading location…</span>
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
                        desc: "A Business Location represents your organization or office's operational location. It is used to record transactions, assess regional performance, and monitor stock levels for items stored at this location.",
                      },
                      {
                        value: "warehouse" as LocationType,
                        label: "Warehouse Only Location",
                        desc: "A Warehouse Only Location refers to where your items are stored. It helps track and monitor stock levels for items stored at this location.",
                      },
                    ]).map((opt) => {
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
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                border: `2px solid ${active ? "#E41F3B" : "#adb5bd"}`,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {active && (
                                <span
                                  style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    background: "#E41F3B",
                                  }}
                                />
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
                        onChange={(v) => setLogo(v)}
                      />
                    </div>
                  </div>

                  {/* Upload area – shown when "Upload a New Logo" is selected */}
                  {logo?.value === "custom" && (
                    <div className="row mb-3">
                      <div className="col-sm-2" />
                      <div className="col-sm-10">
                        <div className="d-flex gap-4 align-items-start">
                          {/* Clickable upload box */}
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
                                  onClick={(e) => { e.preventDefault(); setLogoPreview(null); setLogoFile(null); }}
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
                            onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); }
                            }}
                          />

                          {/* Info text */}
                          <div>
                            <p className="fw-medium fs-14 mb-1">
                              This logo will be displayed in transaction PDFs and email notifications.
                            </p>
                            <p className="text-primary fs-13 mb-1">
                              Preferred Image Dimensions: 240 × 240 pixels @ 72 DPI
                            </p>
                            <p className="text-muted fs-13 mb-1">
                              Supported Files: jpg, jpeg, png, gif, bmp
                            </p>
                            <p className="text-muted fs-13 mb-0">
                              Maximum File Size: 1MB
                            </p>
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
                    value={name}
                    onChange={(e) => { setName(e.target.value); clr("name"); }}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
              </div>

              {/* ══ Child Location checkbox (Business) / Parent Location (Warehouse) ══ */}
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
                          onChange={(e) => setIsChild(e.target.checked)}
                        />
                        <label className="form-check-label fw-medium fs-14" htmlFor="isChildLocation">
                          This is a Child Location
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Parent Location – shown when child checkbox is checked */}
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
                          onChange={(v) => { setParentLocation(v); clr("parentLocation"); }}
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
                      onChange={(v) => { setParentLocation(v); clr("parentLocation"); }}
                    />
                    {errors.parentLocation && <div className="text-danger fs-12 mt-1">{errors.parentLocation}</div>}
                  </div>
                </div>
              )}

              {/* ══ Address Section ═════════════════════════════════ */}
              <div className="row mb-3 align-items-start">
                <label className="col-sm-2 col-form-label fw-medium fs-14 pt-2">Address</label>
                <div className="col-sm-10">
                  <div className="d-flex flex-column gap-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Attention"
                      value={attention}
                      onChange={(e) => setAttention(e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Street 1"
                      value={street1}
                      onChange={(e) => setStreet1(e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Street 2"
                      value={street2}
                      onChange={(e) => setStreet2(e.target.value)}
                    />
                    <div className="d-flex gap-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Pin Code"
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value)}
                      />
                    </div>
                    <CommonSelect
                      className="select"
                      options={countryOptions}
                      defaultValue={countryOptions[0]}
                      value={country}
                      onChange={(v) => { setCountry(v); setState(null); }}
                    />
                    <div className="d-flex gap-3">
                      <div style={{ flex: 1 }}>
                        <CommonSelect
                          className="select"
                          options={currentStates}
                          value={state}
                          onChange={(v) => setState(v)}
                        />
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{ flex: 1 }}
                      />
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Fax Number"
                      value={fax}
                      onChange={(e) => setFax(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* ══ Website URL ═════════════════════════════════════ */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label fw-medium fs-14">Website URL</label>
                <div className="col-sm-10">
                  <input
                    type="url"
                    className="form-control"
                    placeholder="Website URL"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                  />
                </div>
              </div>

              {/* ══ Primary Contact ═════════════════════════════════ */}
              {locationType === "business" ? (
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-2 col-form-label fw-medium fs-14 text-danger">
                    Primary Contact<span className="ms-1">*</span>
                  </label>
                  <div className="col-sm-10">
                    <CommonSelect
                      className="select"
                      options={contactOptions}
                      value={primaryContact}
                      onChange={(v) => { setPrimaryContact(v); clr("primaryContact"); }}
                    />
                    {errors.primaryContact && <div className="text-danger fs-12 mt-1">{errors.primaryContact}</div>}
                  </div>
                </div>
              ) : (
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-2 col-form-label fw-medium fs-14">Primary Contact</label>
                  <div className="col-sm-10">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Email or Contact"
                      value={primaryContactText}
                      onChange={(e) => setPrimaryContactText(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* ══ Transaction Number Series (Business only) ══════ */}
              {locationType === "business" && (
                <>
                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-2 col-form-label fw-medium fs-14 text-danger">
                      Transaction Number Series<span className="ms-1">*</span>
                    </label>
                    <div className="col-sm-10">
                      <CommonSelect
                        className="select"
                        options={seriesOptions}
                        value={selectedTxnSeries}
                        placeholder="Select Series"
                        onChange={v => { setSelectedTxnSeries(v); clr("transactionSeries"); }}
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
                        options={seriesOptions}
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
                  <div
                    style={{
                      border: "1px solid #dee2e6",
                      borderRadius: 8,
                      overflow: "hidden",
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        background: "#fff0f2",
                        padding: "12px 16px",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#E41F3B",
                          }}
                        />
                        <span className="fw-semibold fs-14">
                          {accessUsers.length} user(s) selected
                        </span>
                      </div>
                      <p className="text-muted fs-13 mb-0">
                        Selected users can create and access transactions for this location.
                      </p>
                    </div>

                    {/* Table */}
                    <table className="table mb-0" style={{ tableLayout: "fixed" }}>
                      <thead>
                        <tr>
                          <th
                            className="text-uppercase fs-12 fw-semibold text-muted"
                            style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6" }}
                          >
                            Users
                          </th>
                          <th
                            className="text-uppercase fs-12 fw-semibold text-muted"
                            style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", width: 140 }}
                          >
                            Role
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {accessUsers.map((user) => (
                          <tr key={user.id}>
                            <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                              <div className="d-flex align-items-center gap-3">
                                <span
                                  className="d-flex align-items-center justify-content-center rounded-circle bg-light"
                                  style={{
                                    width: 36,
                                    height: 36,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: "#6c757d",
                                    flexShrink: 0,
                                    overflow: "hidden",
                                  }}
                                >
                                  {user.avatar ? (
                                    <img
                                      src={user.avatar}
                                      alt={user.name}
                                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                  ) : (
                                    user.name.charAt(0).toUpperCase()
                                  )}
                                </span>
                                <div>
                                  <div className="fw-medium fs-14">{user.name}</div>
                                  <div className="text-muted fs-13">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td
                              className="fw-medium fs-14"
                              style={{ padding: "12px 16px", verticalAlign: "middle" }}
                            >
                              {user.role}
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
          <button
            type="button"
            className="btn btn-danger me-2"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" />
                {isEdit ? "Updating…" : "Saving…"}
              </>
            ) : (isEdit ? "Update" : "Save")}
          </button>
          <button
            type="button"
            className="btn btn-outline-light"
            onClick={goBack}
            disabled={saving}
          >
            Cancel
          </button>
        </div>

        <Footer />
      </div>

      {/* ── Toast Notifications ─────────────────────────────────── */}
      <div
        className="position-fixed top-0 start-50 translate-middle-x pt-4"
        style={{ zIndex: 9999, pointerEvents: "none" }}
      >
        <Toast
          show={toast.show}
          onClose={() => setToast((t) => ({ ...t, show: false }))}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{
            pointerEvents: "auto",
            borderRadius: "12px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
            border: "none",
            minWidth: "320px",
            background: "#fff",
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

export default AddLocation;
