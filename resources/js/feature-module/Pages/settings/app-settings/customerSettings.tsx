import { useCallback, useEffect, useRef, useState } from "react";
import ApprovalTab, { type ApprovalTabHandle } from "../../../../components/approval-tab/ApprovalTab";
import { OverlayTrigger, Toast, Tooltip } from "react-bootstrap";
import { Link, useNavigate, useSearchParams } from "react-router";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import { all_routes } from "../../../../routes/all_routes";
import {
  validateCustomerSettings,
  type CustomerConfiguration,
  type ValidationErrors,
} from "../../../../core/services/settingApi";
import { getSettings, updateSettings, bustSettings } from "../../../../core/cache/settingCache";
import FieldCustomizationTab from "../../../../components/field-customization/FieldCustomizationTab";
import { getDistributionCategories, bustDistributionCategories, type DistributionCategory } from "../../../../core/cache/distributionCategoryCache";
import { destroyDistributionCategory } from "../../../../core/services/distributionCategoryApi";
import { getDistributionSubCategories, bustDistributionSubCategories, type DistributionSubCategory } from "../../../../core/cache/distributionSubCategoryCache";
import { destroyDistributionSubCategory } from "../../../../core/services/distributionSubCategoryApi";

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_BILLING_FORMAT =
  "${CONTACT.CONTACT_DISPLAYNAME}\n${CONTACT.CONTACT_ADDRESS}\n${CONTACT.CONTACT_CITY}\n${CONTACT.CONTACT_CODE} ${CONTACT.CONTACT_STATE}\n${CONTACT.CONTACT_COUNTRY}";

const DEFAULT_SHIPPING_FORMAT =
  "${CONTACT.CONTACT_ADDRESS}\n${CONTACT.CONTACT_CITY}\n${CONTACT.CONTACT_CODE} ${CONTACT.CONTACT_STATE}\n${CONTACT.CONTACT_COUNTRY}";

const DEFAULTS: CustomerConfiguration = {
  allow_duplicate_names: false,
  default_customer_type: "business",
  credit_limit_enabled: false,
  credit_limit_action: "warn",
  include_sales_orders_in_credit: false,
  billing_address_format: DEFAULT_BILLING_FORMAT,
  shipping_address_format: DEFAULT_SHIPPING_FORMAT,
};

const PLACEHOLDERS_CONTACT = [
  { label: "Display Name",   value: "${CONTACT.CONTACT_DISPLAYNAME}" },
  { label: "Company Name",   value: "${CONTACT.COMPANY_NAME}" },
  { label: "Website",        value: "${CONTACT.WEBSITE}" },
  { label: "Salutation",     value: "${CONTACT.SALUTATION}" },
  { label: "First Name",     value: "${CONTACT.FIRST_NAME}" },
  { label: "Last Name",      value: "${CONTACT.LAST_NAME}" },
  { label: "Contact Email",  value: "${CONTACT.CONTACT_EMAIL}" },
  { label: "Mobile Phone",   value: "${CONTACT.MOBILE_PHONE}" },
  { label: "Phone Label",    value: "${CONTACT.PHONE_LABEL}" },
  { label: "Phone",          value: "${CONTACT.CONTACT_PHONE}" },
  { label: "Department",     value: "${CONTACT.DEPARTMENT}" },
  { label: "Designation",    value: "${CONTACT.DESIGNATION}" },
  { label: "PAN Label",      value: "${CONTACT.PAN_LABEL}" },
  { label: "PAN",            value: "${CONTACT.PAN}" },
];

const PLACEHOLDERS_ADDRESS = [
  { label: "Attention",       value: "${ADDRESS.ATTENTION}" },
  { label: "Street Address",  value: "${ADDRESS.STREET}" },
  { label: "Street Address1", value: "${ADDRESS.STREET1}" },
  { label: "Street Address2", value: "${ADDRESS.STREET2}" },
  { label: "City",            value: "${ADDRESS.CITY}" },
  { label: "State/Province",  value: "${ADDRESS.STATE}" },
  { label: "Country",         value: "${ADDRESS.COUNTRY}" },
  { label: "ZIP/Postal Code", value: "${ADDRESS.ZIP}" },
  { label: "Fax Label",       value: "${ADDRESS.FAX_LABEL}" },
  { label: "Phone",           value: "${ADDRESS.PHONE}" },
  { label: "Fax",             value: "${ADDRESS.FAX}" },
];

// ── Component ─────────────────────────────────────────────────────────────────

const CustomerSettings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"general" | "approvals" | "field" | "distribution" | "distributionSub">(() => {
    const t = searchParams.get("tab");
    if (t === "approvals") return "approvals";
    if (t === "field") return "field";
    if (t === "distribution") return "distribution";
    if (t === "distributionSub") return "distributionSub";
    return "general";
  });

  const handleTabChange = useCallback((tab: "general" | "approvals" | "field" | "distribution" | "distributionSub") => {
    setActiveTab((prev) => {
      if (prev === "distribution") bustDistributionCategories();
      if (prev === "distributionSub") bustDistributionSubCategories();
      return tab;
    });
    setFieldErrors({});
  }, []);

  // Approvals tab
  const approvalTabRef = useRef<ApprovalTabHandle>(null);

  const [loading, setLoading]         = useState(true);
  const [loadError, setLoadError]     = useState<string | null>(null);
  const [saving, setSaving]           = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [cfRefreshKey, setCfRefreshKey] = useState(0);
  const cfRefreshResolveRef = useRef<(() => void) | null>(null);

  // ── Distribution Categories state ─────────────────────────────────────────────
  const [distCategories, setDistCategories]   = useState<DistributionCategory[]>([]);
  const [distLoading, setDistLoading]         = useState(false);
  const [distFetchError, setDistFetchError]   = useState<string | null>(null);
  const [distActionId, setDistActionId]       = useState<number | null>(null);
  const [distDeleteModal, setDistDeleteModal] = useState<{ show: boolean; record: DistributionCategory | null; deleting: boolean }>({ show: false, record: null, deleting: false });

  // ── Distribution Sub Categories state ────────────────────────────────────────
  const [hasDistCategories, setHasDistCategories]   = useState<boolean | null>(null);
  const [distSubCategories, setDistSubCategories]   = useState<DistributionSubCategory[]>([]);
  const [distSubLoading, setDistSubLoading]         = useState(false);
  const [distSubFetchError, setDistSubFetchError]   = useState<string | null>(null);
  const [distSubDeleteModal, setDistSubDeleteModal] = useState<{ show: boolean; record: DistributionSubCategory | null; deleting: boolean }>({ show: false, record: null, deleting: false });
  const [distSubCategoryFilter, setDistSubCategoryFilter] = useState<number | null>(() => {
    try { const v = sessionStorage.getItem("distSubCategoryFilter"); return v !== null ? Number(v) : null; }
    catch { return null; }
  });

  const handleDistSubFilterChange = (id: number | null) => {
    setDistSubCategoryFilter(id);
    try {
      if (id === null) sessionStorage.removeItem("distSubCategoryFilter");
      else sessionStorage.setItem("distSubCategoryFilter", String(id));
    } catch {}
  };

  // ── Toast ────────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger" | "warning"; message: string }>({
    show: false, type: "success", message: "",
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (type: "success" | "danger" | "warning", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // ── Form state ───────────────────────────────────────────────────────────────
  const [allowDuplicateNames, setAllowDuplicateNames]         = useState(DEFAULTS.allow_duplicate_names);
  const [defaultCustomerType, setDefaultCustomerType]         = useState<"business" | "individual">(DEFAULTS.default_customer_type);
  const [creditLimitEnabled, setCreditLimitEnabled]                     = useState(DEFAULTS.credit_limit_enabled);
  const [creditLimitAction, setCreditLimitAction]                       = useState<"restrict" | "warn">(DEFAULTS.credit_limit_action);
  const [includeSalesOrdersInCredit, setIncludeSalesOrdersInCredit]     = useState(DEFAULTS.include_sales_orders_in_credit);
  const [billingAddressFormat, setBillingAddressFormat]       = useState(DEFAULTS.billing_address_format);
  const [shippingAddressFormat, setShippingAddressFormat]     = useState(DEFAULTS.shipping_address_format);


  // ── Refs for placeholder insertion ────────────────────────────────────────────
  const billingRef  = useRef<HTMLTextAreaElement>(null);
  const shippingRef = useRef<HTMLTextAreaElement>(null);

  const [billingDropOpen, setBillingDropOpen]   = useState(false);
  const [shippingDropOpen, setShippingDropOpen] = useState(false);
  const [billingSearch, setBillingSearch]       = useState("");
  const [shippingSearch, setShippingSearch]     = useState("");
  const billingDropRef  = useRef<HTMLDivElement>(null);
  const shippingDropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (billingDropRef.current && !billingDropRef.current.contains(e.target as Node)) {
        setBillingDropOpen(false); setBillingSearch("");
      }
      if (shippingDropRef.current && !shippingDropRef.current.contains(e.target as Node)) {
        setShippingDropOpen(false); setShippingSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);



  // ── Load settings ─────────────────────────────────────────────────────────────
  const applyConfig = useCallback((c: CustomerConfiguration) => {
    setAllowDuplicateNames(c.allow_duplicate_names ?? false);
    setDefaultCustomerType(c.default_customer_type ?? "business");
    setCreditLimitEnabled(c.credit_limit_enabled ?? false);
    setCreditLimitAction(c.credit_limit_action ?? "warn");
    setIncludeSalesOrdersInCredit(c.include_sales_orders_in_credit ?? false);
    setBillingAddressFormat(c.billing_address_format ?? DEFAULT_BILLING_FORMAT);
    setShippingAddressFormat(c.shipping_address_format ?? DEFAULT_SHIPPING_FORMAT);
  }, []);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const c = await getSettings<CustomerConfiguration>("customers");
      applyConfig(c);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load settings.");
    }
    setLoading(false);
  }, [applyConfig]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const loadDistributionCategories = useCallback(async () => {
    setDistLoading(true);
    setDistFetchError(null);
    try {
      bustDistributionCategories();
      const data = await getDistributionCategories();
      setDistCategories(data);
      setHasDistCategories(data.length > 0);
    } catch (e: any) {
      setDistFetchError(e.message ?? "Failed to load distribution categories.");
    }
    setDistLoading(false);
  }, []);

  // Silently check whether any categories exist so the sub-category tab can be
  // enabled/disabled without requiring the user to visit the categories tab first.
  useEffect(() => {
    getDistributionCategories()
      .then(data => setHasDistCategories(data.length > 0))
      .catch(() => setHasDistCategories(false));
  }, []);

  useEffect(() => {
    if (activeTab !== "distribution") return;
    loadDistributionCategories();
  }, [activeTab, loadDistributionCategories]);

  // If categories are removed and the user is still on the sub-category tab, redirect.
  useEffect(() => {
    if (hasDistCategories === false && activeTab === "distributionSub") {
      handleTabChange("distribution");
    }
  }, [hasDistCategories, activeTab]);

  const loadDistributionSubCategories = useCallback(async () => {
    setDistSubLoading(true);
    setDistSubFetchError(null);
    try {
      bustDistributionSubCategories();
      const data = await getDistributionSubCategories();
      setDistSubCategories(data);
    } catch (e: any) {
      setDistSubFetchError(e.message ?? "Failed to load distribution sub-categories.");
    }
    setDistSubLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab !== "distributionSub") return;
    loadDistributionSubCategories();
    if (distCategories.length === 0) {
      getDistributionCategories().then(data => setDistCategories(data)).catch(() => {});
    }
  }, [activeTab, loadDistributionSubCategories]);

  const handleDistSubDelete = async () => {
    const { record } = distSubDeleteModal;
    if (!record) return;
    setDistSubDeleteModal((m) => ({ ...m, deleting: true }));
    const res = await destroyDistributionSubCategory(record.id);
    if (res.success) {
      setDistSubCategories((prev) => prev.filter((c) => c.id !== record.id));
      setDistSubDeleteModal({ show: false, record: null, deleting: false });
      showToast("success", "Distribution sub-category deleted successfully.");
    } else {
      setDistSubDeleteModal((m) => ({ ...m, deleting: false }));
      showToast("danger", (res as any).message ?? "Failed to delete.");
    }
  };

  const handleDistDelete = async () => {
    const { record } = distDeleteModal;
    if (!record) return;
    setDistDeleteModal((m) => ({ ...m, deleting: true }));
    const res = await destroyDistributionCategory(record.id);
    if (res.success) {
      setDistCategories((prev) => prev.filter((c) => c.id !== record.id));
      setDistDeleteModal({ show: false, record: null, deleting: false });
      showToast("success", "Distribution category deleted successfully.");
    } else {
      setDistDeleteModal((m) => ({ ...m, deleting: false }));
      showToast("danger", (res as any).message ?? "Failed to delete.");
    }
  };

  const handleRefresh = useCallback((): Promise<void> | void => {
    if (activeTab === "field") {
      return new Promise<void>((resolve) => {
        cfRefreshResolveRef.current = resolve;
        setCfRefreshKey((k) => k + 1);
      });
    }
    if (activeTab === "distribution") return loadDistributionCategories();
    if (activeTab === "distributionSub") return loadDistributionSubCategories();
    bustSettings("customers");
    return loadSettings();
  }, [activeTab, loadSettings, loadDistributionCategories, loadDistributionSubCategories]);

  // ── Insert placeholder into focused textarea ──────────────────────────────────
  const insertPlaceholder = (placeholder: string, target: "billing" | "shipping") => {
    const ref     = target === "billing" ? billingRef : shippingRef;
    const setter  = target === "billing" ? setBillingAddressFormat : setShippingAddressFormat;
    const current = target === "billing" ? billingAddressFormat : shippingAddressFormat;
    const el      = ref.current;

    if (el) {
      const start = el.selectionStart ?? current.length;
      const end   = el.selectionEnd   ?? current.length;
      const next  = current.slice(0, start) + placeholder + current.slice(end);
      setter(next);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + placeholder.length, start + placeholder.length);
      }, 0);
    } else {
      setter(current + placeholder);
    }
  };

  // ── Build payload ─────────────────────────────────────────────────────────────
  const buildPayload = (): CustomerConfiguration => ({
    allow_duplicate_names:   allowDuplicateNames,
    default_customer_type:   defaultCustomerType,
    credit_limit_enabled:           creditLimitEnabled,
    credit_limit_action:            creditLimitEnabled ? creditLimitAction : "warn",
    include_sales_orders_in_credit: creditLimitEnabled ? includeSalesOrdersInCredit : false,
    billing_address_format:         billingAddressFormat,
    shipping_address_format: shippingAddressFormat,
  });

  // ── Save ──────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const payload = buildPayload();

    // Client-side validation first
    const errors = validateCustomerSettings(payload);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showToast("warning", "Please fix the highlighted fields before saving.");
      return;
    }

    setFieldErrors({});
    setSaving(true);

    try {
      const res = await updateSettings<CustomerConfiguration>("customers", payload);
      if (res.success) {
        if (res.configuration) applyConfig(res.configuration);
        showToast("success", res.message ?? "Customer settings saved successfully.");
      } else {
        // Map server-side field errors if returned
        if (res.errors) {
          const mapped: ValidationErrors = {};
          Object.entries(res.errors).forEach(([key, msgs]) => {
            mapped[key] = (msgs as string[])[0];
          });
          setFieldErrors(mapped);
        }
        showToast("danger", res.message);
      }
    } catch {
      showToast("danger", "Network error. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <PageHeader
            title="Customers"
            badgeCount={false}
            showModuleTile={false}
            showExport={false}
            onRefresh={handleRefresh}
          />

          <div className="row">
            <div className="col-12">
              <div className="card mb-0">
                <div className="card-body p-0">

                  {/* ── Tab nav ── */}
                  <div className="px-4 pt-3 pb-3">
                    <div
                      className="scrollbar-hidden"
                      style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
                    >
                    <div className="d-inline-flex rounded flex-nowrap" style={{ background: "#f1f3f5", padding: 4, gap: 2, minWidth: "max-content" }}>
                      {([
                        { key: "general"         as const, label: "General",                      disabled: false },
                        { key: "approvals"       as const, label: "Approvals",                    disabled: false },
                        { key: "field"           as const, label: "Field Customization",           disabled: false },
                        { key: "distribution"    as const, label: "Distribution Categories",       disabled: false },
                        { key: "distributionSub" as const, label: "Distribution Sub Category",    disabled: !hasDistCategories },
                      ] as const).map(t => {
                        const isActive = activeTab === t.key;
                        return (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() => { if (!t.disabled) handleTabChange(t.key); }}
                            disabled={t.disabled ?? false}
                            title={t.disabled ? "Add at least one distribution category first" : undefined}
                            style={{
                              padding: "9px 20px", borderRadius: 6, border: "none",
                              background: isActive ? "#fff" : "transparent",
                              color: isActive ? "#e03131" : "#6c757d",
                              fontWeight: isActive ? 600 : 400,
                              fontSize: 14,
                              boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                              transition: "all 0.15s",
                              cursor: t.disabled ? "not-allowed" : "pointer",
                              whiteSpace: "nowrap",
                              opacity: t.disabled ? 0.5 : 1,
                            }}
                          >
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                    </div>
                  </div>

                  {/* ── Loading ── */}

                  {/* ── Load error ── */}
                  {!loading && loadError && (
                    <div className="m-4 alert alert-danger d-flex align-items-center gap-2 py-2">
                      <i className="ti ti-alert-circle fs-16 flex-shrink-0" />
                      <span className="flex-grow-1">{loadError}</span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger ms-auto"
                        onClick={loadSettings}
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {/* ════════════════════════════════════════════════════════
                      GENERAL TAB
                  ════════════════════════════════════════════════════════ */}
                  {!loading && !loadError && activeTab === "general" && (
                    <div className="p-4">

                      {/* ── Allow Duplicate Display Names ── */}
                      <div className="border-bottom pb-4 mb-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="allowDuplicateNames"
                            checked={allowDuplicateNames}
                            onChange={(e) => setAllowDuplicateNames(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="allowDuplicateNames">
                            Allow duplicates for customers display name.
                          </label>
                        </div>
                      </div>

                      {/* ── Default Customer Type ── */}
                      <div className="border-bottom pb-4 mb-4">
                        <h6 className="fw-semibold mb-3">Default Customer Type</h6>
                        <p className="text-muted small mb-3">
                          Select the default customer type based on the kind of customers you usually sell your products or services to. The default customer type will be pre-selected in the customer creation form.
                        </p>
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="defaultCustomerType"
                            id="typeBusiness"
                            checked={defaultCustomerType === "business"}
                            onChange={() => setDefaultCustomerType("business")}
                          />
                          <label className="form-check-label" htmlFor="typeBusiness">
                            Business
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="defaultCustomerType"
                            id="typeIndividual"
                            checked={defaultCustomerType === "individual"}
                            onChange={() => setDefaultCustomerType("individual")}
                          />
                          <label className="form-check-label" htmlFor="typeIndividual">
                            Individual
                          </label>
                        </div>
                      </div>

                      {/* ── Customer Credit Limit ── */}
                      <div className="border-bottom pb-4 mb-4">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <h6 className="fw-semibold mb-0">Customer Credit Limit</h6>
                          <div className="d-flex align-items-center gap-2">
                            <span className="text-muted small">
                              {creditLimitEnabled ? "Enabled" : "Disabled"}
                            </span>
                            <div className="form-check form-switch mb-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id="creditLimitEnabled"
                                checked={creditLimitEnabled}
                                onChange={(e) => setCreditLimitEnabled(e.target.checked)}
                                style={{ cursor: "pointer", width: 40, height: 22 }}
                              />
                            </div>
                          </div>
                        </div>
                        <p className="text-muted small mb-0">
                          Credit Limit enables you to set limit on the outstanding receivable amount of the customers.
                        </p>

                        {creditLimitEnabled && (
                          <div className="ms-4 mt-3">
                            {/* What to do when exceeded */}
                            <div className="border rounded p-3 mb-3">
                              <p className="fw-medium small mb-2">What do you want to do when credit limit is exceeded?</p>
                              <div className="form-check mb-2">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="creditLimitAction"
                                  id="creditLimitRestrict"
                                  checked={creditLimitAction === "restrict"}
                                  onChange={() => setCreditLimitAction("restrict")}
                                />
                                <label className="form-check-label" htmlFor="creditLimitRestrict">
                                  Restrict creating or updating invoices
                                </label>
                              </div>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="creditLimitAction"
                                  id="creditLimitWarn"
                                  checked={creditLimitAction === "warn"}
                                  onChange={() => setCreditLimitAction("warn")}
                                />
                                <label className="form-check-label" htmlFor="creditLimitWarn">
                                  Show a warning and allow users to proceed
                                </label>
                              </div>
                            </div>

                            {/* Include sales orders */}
                            <div className="form-check mb-1">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="includeSalesOrdersInCredit"
                                checked={includeSalesOrdersInCredit}
                                onChange={(e) => setIncludeSalesOrdersInCredit(e.target.checked)}
                              />
                              <label className="form-check-label" htmlFor="includeSalesOrdersInCredit">
                                Include sales orders' amount in limiting the credit given to customers
                              </label>
                            </div>
                            {includeSalesOrdersInCredit && (
                              <p className="text-muted small mb-0 ms-4">
                                Credit Limit will not affect the creation of sales orders from marketplace, POS Registers and Commerce.
                              </p>
                            )}

                            {/* Note */}
                            <div className="rounded p-3 d-flex align-items-start gap-2 mt-3" style={{ background: "#fff8f0", border: "1px solid #ffe0b2" }}>
                              <span className="text-warning mt-1"><i className="ti ti-info-circle" /></span>
                              <span>Go to the respective customer's contact details to set the credit limit.</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ── Billing Address Format ── */}
                      <div className="border-bottom pb-4 mb-4">
                        <h6 className="fw-semibold mb-2 d-flex align-items-center gap-1">
                          Customers Billing Address Format
                          <span className="fw-normal text-muted" style={{ fontSize: 13 }}>(Displayed in PDF only)</span>
                          <OverlayTrigger placement="right" overlay={<Tooltip>This format is used when printing billing addresses on PDFs</Tooltip>}>
                            <i className="ti ti-info-circle text-muted fs-14" style={{ cursor: "pointer" }} />
                          </OverlayTrigger>
                        </h6>
                        <div className="border rounded">
                          <div className="px-4 py-3 position-relative" ref={billingDropRef} style={{ background: "#f8f9fa", borderBottom: "1px solid #dee2e6", borderRadius: "6px 6px 0 0" }}>
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => { setBillingDropOpen((o) => !o); setBillingSearch(""); }}
                            >
                              Insert Placeholders <i className={`ti ti-chevron-${billingDropOpen ? "up" : "down"} ms-1`} />
                            </button>
                            {billingDropOpen && (
                              <div
                                className="position-absolute bg-white border rounded shadow-sm"
                                style={{ top: "calc(100% + 4px)", left: 16, zIndex: 1050, minWidth: 480 }}
                              >
                                <div className="p-2 border-bottom">
                                  <input
                                    autoFocus
                                    type="text"
                                    className="form-control fs-14"
                                    style={{ height: 42 }}
                                    placeholder="Search…"
                                    value={billingSearch}
                                    onChange={(e) => setBillingSearch(e.target.value)}
                                  />
                                </div>
                                <div className="d-flex" style={{ maxHeight: 280, overflowY: "auto" }}>
                                  <div className="flex-1 border-end" style={{ minWidth: 0, flex: 1 }}>
                                    <div className="px-3 pt-2 pb-1 text-uppercase fw-semibold" style={{ fontSize: 11, color: "var(--gray-500)", letterSpacing: "0.05em" }}>Contact</div>
                                    {PLACEHOLDERS_CONTACT.filter(p => p.label.toLowerCase().includes(billingSearch.toLowerCase())).map((p) => (
                                      <div
                                        key={p.value}
                                        className="px-3 py-2 fs-14"
                                        style={{ cursor: "pointer", color: "#707070" }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = "#E41F07"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = "#707070"; }}
                                        onClick={() => { insertPlaceholder(p.value, "billing"); setBillingDropOpen(false); setBillingSearch(""); }}
                                      >
                                        {p.label}
                                      </div>
                                    ))}
                                  </div>
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <div className="px-3 pt-2 pb-1 text-uppercase fw-semibold" style={{ fontSize: 11, color: "var(--gray-500)", letterSpacing: "0.05em" }}>Address</div>
                                    {PLACEHOLDERS_ADDRESS.filter(p => p.label.toLowerCase().includes(billingSearch.toLowerCase())).map((p) => (
                                      <div
                                        key={p.value}
                                        className="px-3 py-2 fs-14"
                                        style={{ cursor: "pointer", color: "#707070" }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = "#E41F07"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = "#707070"; }}
                                        onClick={() => { insertPlaceholder(p.value, "billing"); setBillingDropOpen(false); setBillingSearch(""); }}
                                      >
                                        {p.label}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <textarea
                            ref={billingRef}
                            className="form-control border-0"
                            rows={10}
                            value={billingAddressFormat}
                            onChange={(e) => setBillingAddressFormat(e.target.value)}
                            style={{ resize: "vertical", fontFamily: "monospace", fontSize: 15, borderRadius: "0 0 6px 6px" }}
                          />
                        </div>
                        {fieldErrors.billing_address_format && (
                          <div className="text-danger small mt-1">{fieldErrors.billing_address_format}</div>
                        )}
                      </div>

                      {/* ── Shipping Address Format ── */}
                      <div className="pb-4 mb-2">
                        <h6 className="fw-semibold mb-2 d-flex align-items-center gap-1">
                          Customers Shipping Address Format
                          <span className="fw-normal text-muted" style={{ fontSize: 13 }}>(Displayed in PDF only)</span>
                          <OverlayTrigger placement="right" overlay={<Tooltip>This format is used when printing shipping addresses on PDFs</Tooltip>}>
                            <i className="ti ti-info-circle text-muted fs-14" style={{ cursor: "pointer" }} />
                          </OverlayTrigger>
                        </h6>
                        <div className="border rounded">
                          <div className="px-4 py-3 position-relative" ref={shippingDropRef} style={{ background: "#f8f9fa", borderBottom: "1px solid #dee2e6", borderRadius: "6px 6px 0 0" }}>
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => { setShippingDropOpen((o) => !o); setShippingSearch(""); }}
                            >
                              Insert Placeholders <i className={`ti ti-chevron-${shippingDropOpen ? "up" : "down"} ms-1`} />
                            </button>
                            {shippingDropOpen && (
                              <div
                                className="position-absolute bg-white border rounded shadow-sm"
                                style={{ top: "calc(100% + 4px)", left: 16, zIndex: 1050, minWidth: 480 }}
                              >
                                <div className="p-2 border-bottom">
                                  <input
                                    autoFocus
                                    type="text"
                                    className="form-control fs-14"
                                    style={{ height: 42 }}
                                    placeholder="Search…"
                                    value={shippingSearch}
                                    onChange={(e) => setShippingSearch(e.target.value)}
                                  />
                                </div>
                                <div className="d-flex" style={{ maxHeight: 280, overflowY: "auto" }}>
                                  <div className="flex-1 border-end" style={{ minWidth: 0, flex: 1 }}>
                                    <div className="px-3 pt-2 pb-1 text-uppercase fw-semibold" style={{ fontSize: 11, color: "var(--gray-500)", letterSpacing: "0.05em" }}>Contact</div>
                                    {PLACEHOLDERS_CONTACT.filter(p => p.label.toLowerCase().includes(shippingSearch.toLowerCase())).map((p) => (
                                      <div
                                        key={p.value}
                                        className="px-3 py-2 fs-14"
                                        style={{ cursor: "pointer", color: "#707070" }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = "#E41F07"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = "#707070"; }}
                                        onClick={() => { insertPlaceholder(p.value, "shipping"); setShippingDropOpen(false); setShippingSearch(""); }}
                                      >
                                        {p.label}
                                      </div>
                                    ))}
                                  </div>
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <div className="px-3 pt-2 pb-1 text-uppercase fw-semibold" style={{ fontSize: 11, color: "var(--gray-500)", letterSpacing: "0.05em" }}>Address</div>
                                    {PLACEHOLDERS_ADDRESS.filter(p => p.label.toLowerCase().includes(shippingSearch.toLowerCase())).map((p) => (
                                      <div
                                        key={p.value}
                                        className="px-3 py-2 fs-14"
                                        style={{ cursor: "pointer", color: "#707070" }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = "#E41F07"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = "#707070"; }}
                                        onClick={() => { insertPlaceholder(p.value, "shipping"); setShippingDropOpen(false); setShippingSearch(""); }}
                                      >
                                        {p.label}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <textarea
                            ref={shippingRef}
                            className="form-control border-0"
                            rows={10}
                            value={shippingAddressFormat}
                            onChange={(e) => setShippingAddressFormat(e.target.value)}
                            style={{ resize: "vertical", fontFamily: "monospace", fontSize: 15, borderRadius: "0 0 6px 6px" }}
                          />
                        </div>
                        {fieldErrors.shipping_address_format && (
                          <div className="text-danger small mt-1">{fieldErrors.shipping_address_format}</div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* Approvals Tab */}
                  {activeTab === "approvals" && (
                    <div className="p-4">
                      <ApprovalTab
                        ref={approvalTabRef}
                        module="customers"
                        entityLabel="Customer"
                        onToast={showToast}
                      />
                    </div>
                  )}

                  {/* Field Customization Tab */}
                  {!loading && !loadError && activeTab === "field" && (
                    <FieldCustomizationTab
                      module="customers"
                      addRoute={all_routes.customerCustomField + "?module=customers"}
                      editRoute={all_routes.customerCustomFieldEdit}
                      refreshKey={cfRefreshKey}
                      onRefreshDone={() => { cfRefreshResolveRef.current?.(); cfRefreshResolveRef.current = null; }}
                      onToast={showToast}
                    />
                  )}

                  {/* Distribution Sub Category Tab */}
                  {activeTab === "distributionSub" && (
                    <div className="p-4">
                      {/* Header */}
                      <div className="border-bottom mb-3 pb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <div className="dropdown">
                          <Link to="#" className="dropdown-toggle btn btn-outline-light px-2 fs-16 fw-bold border-0" data-bs-toggle="dropdown">
                            {distSubCategoryFilter === null
                              ? "All Sub Categories"
                              : distCategories.find(c => c.id === distSubCategoryFilter)?.name ?? "All Sub Categories"
                            }
                          </Link>
                          <div className="dropdown-menu dropmenu-hover-primary">
                            <ul>
                              <li>
                                <button className="dropdown-item" onClick={() => handleDistSubFilterChange(null)}>
                                  <i className="ti ti-layout-list me-1" />All Sub Categories
                                </button>
                              </li>
                              {distCategories.map(c => (
                                <li key={c.id}>
                                  <button className="dropdown-item" onClick={() => handleDistSubFilterChange(c.id)}>
                                    <i className="ti ti-category me-1" />{c.name}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => navigate(all_routes.addDistributionSubCategory)}
                        >
                          <i className="ti ti-square-rounded-plus-filled me-1" />
                          Add New Sub Category
                        </button>
                      </div>

                      {/* Loading */}
                      {distSubLoading && (
                        <div className="d-flex align-items-center gap-2 py-4 text-muted">
                          <div className="spinner-border spinner-border-sm text-primary" role="status" />
                          <span>Loading distribution sub-categories…</span>
                        </div>
                      )}

                      {/* Fetch error */}
                      {!distSubLoading && distSubFetchError && (
                        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3">
                          <i className="ti ti-alert-circle fs-16 flex-shrink-0" />
                          <span className="flex-grow-1">{distSubFetchError}</span>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger ms-auto"
                            onClick={loadDistributionSubCategories}
                          >
                            Retry
                          </button>
                        </div>
                      )}

                      {/* Empty state */}
                      {!distSubLoading && !distSubFetchError && distSubCategories.filter(c => distSubCategoryFilter === null || c.distribution_category_id === distSubCategoryFilter).length === 0 && (
                        <div className="text-center py-5">
                          <i className="ti ti-category-2 fs-40 d-block mb-4 text-muted opacity-50" />
                          <h6 className="fw-semibold mb-2">No Distribution Sub Categories</h6>
                          <p className="text-muted mb-4 fs-14">Get started by creating your first distribution sub category.</p>
                          <button
                            type="button"
                            className="btn btn-primary px-4"
                            onClick={() => navigate(all_routes.addDistributionSubCategory)}
                          >
                            <i className="ti ti-square-rounded-plus-filled me-1" />
                            Add New Sub Category
                          </button>
                        </div>
                      )}

                      {/* Table */}
                      {!distSubLoading && !distSubFetchError && distSubCategories.filter(c => distSubCategoryFilter === null || c.distribution_category_id === distSubCategoryFilter).length > 0 && (
                        <div className="table-responsive">
                          <table className="table table-nowrap">
                            <thead className="table-light">
                              <tr>
                                <th>Name</th>
                                <th>Parent Distribution Category</th>
                                <th>Level</th>
                                <th style={{ width: "1%", whiteSpace: "nowrap" }}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {distSubCategories.filter(c => distSubCategoryFilter === null || c.distribution_category_id === distSubCategoryFilter).map((cat) => (
                                <tr key={cat.id}>
                                  <td>{cat.name}</td>
                                  <td>{cat.distribution_category?.name ?? <span className="text-muted">—</span>}</td>
                                  <td>{cat.level}</td>
                                  <td style={{ width: "1%", whiteSpace: "nowrap" }}>
                                    <div className="dropdown">
                                      <button
                                        type="button"
                                        className="btn btn-outline-light d-flex align-items-center justify-content-center"
                                        style={{ width: 38, height: 38 }}
                                        data-bs-toggle="dropdown"
                                        data-bs-strategy="fixed"
                                      >
                                        <i className="ti ti-dots-vertical fs-14 text-muted" />
                                      </button>
                                      <div className="dropdown-menu dropdown-menu-right dropmenu-hover-primary" style={{ zIndex: 999 }}>
                                        <button
                                          className="dropdown-item d-flex align-items-center gap-2 fs-13"
                                          onClick={() => navigate(all_routes.editDistributionSubCategory.replace(":id", String(cat.id)))}
                                        >
                                          <i className="ti ti-edit fs-13" /> Edit
                                        </button>
                                        <hr className="dropdown-divider m-1" />
                                        <button
                                          className="dropdown-item d-flex align-items-center gap-2 fs-13 text-danger"
                                          onClick={() => setDistSubDeleteModal({ show: true, record: cat, deleting: false })}
                                        >
                                          <i className="ti ti-trash fs-13" /> Delete
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Distribution Categories Tab */}
                  {activeTab === "distribution" && (
                    <div className="p-4">
                      {/* Header */}
                      <div className="border-bottom mb-3 pb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <h5 className="mb-0 fs-17">Distribution Categories</h5>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => navigate(all_routes.addDistributionCategory)}
                        >
                          <i className="ti ti-square-rounded-plus-filled me-1" />
                          Add New Category
                        </button>
                      </div>

                      {/* Loading */}
                      {distLoading && (
                        <div className="d-flex align-items-center gap-2 py-4 text-muted">
                          <div className="spinner-border spinner-border-sm text-primary" role="status" />
                          <span>Loading distribution categories…</span>
                        </div>
                      )}

                      {/* Fetch error */}
                      {!distLoading && distFetchError && (
                        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3">
                          <i className="ti ti-alert-circle fs-16 flex-shrink-0" />
                          <span className="flex-grow-1">{distFetchError}</span>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger ms-auto"
                            onClick={loadDistributionCategories}
                          >
                            Retry
                          </button>
                        </div>
                      )}

                      {/* Empty state */}
                      {!distLoading && !distFetchError && distCategories.length === 0 && (
                        <div className="text-center py-5">
                          <i className="ti ti-category-2 fs-40 d-block mb-4 text-muted opacity-50" />
                          <h6 className="fw-semibold mb-2">No Distribution Categories</h6>
                          <p className="text-muted mb-4 fs-14">Get started by creating your first distribution category.</p>
                          <button
                            type="button"
                            className="btn btn-primary px-4"
                            onClick={() => navigate(all_routes.addDistributionCategory)}
                          >
                            <i className="ti ti-square-rounded-plus-filled me-1" />
                            Add New Category
                          </button>
                        </div>
                      )}

                      {/* Table */}
                      {!distLoading && !distFetchError && distCategories.length > 0 && (
                        <div className="table-responsive">
                          <table className="table table-nowrap">
                            <thead className="table-light">
                              <tr>
                                <th>Name</th>
                                <th>Code</th>
                                <th>Parent Category</th>
                                <th>Level</th>
                                <th style={{ width: "1%", whiteSpace: "nowrap" }}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {distCategories.map((cat) => {
                                const isActing = distActionId === cat.id;
                                return (
                                  <tr key={cat.id} style={{ opacity: isActing ? 0.5 : 1, transition: "opacity 0.2s" }}>
                                    <td>{cat.name}</td>
                                    <td>{cat.code ?? <span className="text-muted">—</span>}</td>
                                    <td>{cat.parent?.name ?? <span className="text-muted">—</span>}</td>
                                    <td>{cat.level}</td>
                                    <td style={{ width: "1%", whiteSpace: "nowrap" }}>
                                      <div className="dropdown">
                                        <button
                                          type="button"
                                          className="btn btn-outline-light d-flex align-items-center justify-content-center"
                                          style={{ width: 38, height: 38 }}
                                          data-bs-toggle="dropdown"
                                          data-bs-strategy="fixed"
                                          disabled={isActing}
                                        >
                                          <i className="ti ti-dots-vertical fs-14 text-muted" />
                                        </button>
                                        <div className="dropdown-menu dropdown-menu-right dropmenu-hover-primary" style={{ zIndex: 999 }}>
                                          <button
                                            className="dropdown-item d-flex align-items-center gap-2 fs-13"
                                            onClick={() => navigate(all_routes.editDistributionCategory.replace(":id", String(cat.id)))}
                                            disabled={isActing}
                                          >
                                            <i className="ti ti-edit fs-13" /> Edit
                                          </button>
                                          <hr className="dropdown-divider m-1" />
                                          <button
                                            className="dropdown-item d-flex align-items-center gap-2 fs-13 text-danger"
                                            onClick={() => setDistDeleteModal({ show: true, record: cat, deleting: false })}
                                            disabled={isActing}
                                          >
                                            <i className="ti ti-trash fs-13" /> Delete
                                          </button>
                                        </div>
                                      </div>
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

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sticky save bar (General + Approvals tabs) ── */}
        {(activeTab === "general" || activeTab === "approvals") && (
          <div
            className="bg-white border-top d-flex align-items-center gap-2 px-4"
            style={{ position: "sticky", bottom: 0, zIndex: 100, height: 60 }}
          >
            <button
              type="button"
              className="btn btn-primary me-2"
              onClick={
                activeTab === "general"
                  ? handleSave
                  : async () => {
                      setSaving(true);
                      try { await approvalTabRef.current?.save(); } finally { setSaving(false); }
                    }
              }
              disabled={saving || (activeTab === "general" && loading)}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" />
                  Saving…
                </>
              ) : "Save"}
            </button>
          </div>
        )}

        <Footer />
      </div>

      {/* ── Toast ── */}
      <div role="region" aria-live="polite" className="position-fixed top-0 start-50 translate-middle-x pt-4" style={{ zIndex: 9999, pointerEvents: "none" }}>
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
              className={`d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 ${
                toast.type === "success" ? "bg-success" : toast.type === "danger" ? "bg-danger" : "bg-warning"
              }`}
              style={{ width: "36px", height: "36px" }}
            >
              <i
                className={`ti fs-16 text-white ${
                  toast.type === "success" ? "ti-check" : toast.type === "danger" ? "ti-x" : "ti-alert-triangle"
                }`}
              />
            </span>
            <span className="fw-medium fs-14">{toast.message}</span>
          </Toast.Body>
        </Toast>
      </div>

      {/* Distribution Category delete confirmation */}
      {distDeleteModal.show && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 1060, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}
          onClick={(e) => { if (e.target === e.currentTarget && !distDeleteModal.deleting) setDistDeleteModal((m) => ({ ...m, show: false })); }}
        >
          <div style={{ background: "#fff", borderRadius: 14, padding: "32px 28px 24px", width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <i className="ti ti-trash" style={{ fontSize: 24, color: "#ef4444" }} />
            </div>
            <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 16, color: "#0f172a", textAlign: "center" }}>
              Delete "{distDeleteModal.record?.name}"?
            </p>
            <p style={{ margin: "0 0 24px", fontSize: 13.5, color: "#64748b", textAlign: "center", lineHeight: 1.55 }}>
              This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              <button
                className="btn btn-light flex-grow-1"
                style={{ fontWeight: 500, fontSize: 14, height: 44 }}
                onClick={() => setDistDeleteModal((m) => ({ ...m, show: false }))}
                disabled={distDeleteModal.deleting}
              >
                Cancel
              </button>
              <button
                className="btn flex-grow-1"
                style={{ background: "#ef4444", color: "#fff", fontWeight: 500, fontSize: 14, border: "none", height: 44 }}
                onClick={handleDistDelete}
                disabled={distDeleteModal.deleting}
              >
                {distDeleteModal.deleting
                  ? <><span className="spinner-border spinner-border-sm me-2" style={{ width: 14, height: 14, borderWidth: 2 }} />Deleting…</>
                  : "Delete"
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Distribution Sub Category delete confirmation */}
      {distSubDeleteModal.show && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 1060, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}
          onClick={(e) => { if (e.target === e.currentTarget && !distSubDeleteModal.deleting) setDistSubDeleteModal((m) => ({ ...m, show: false })); }}
        >
          <div style={{ background: "#fff", borderRadius: 14, padding: "32px 28px 24px", width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <i className="ti ti-trash" style={{ fontSize: 24, color: "#ef4444" }} />
            </div>
            <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 16, color: "#0f172a", textAlign: "center" }}>
              Delete "{distSubDeleteModal.record?.name}"?
            </p>
            <p style={{ margin: "0 0 24px", fontSize: 13.5, color: "#64748b", textAlign: "center", lineHeight: 1.55 }}>
              This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              <button
                className="btn btn-light flex-grow-1"
                style={{ fontWeight: 500, fontSize: 14, height: 44 }}
                onClick={() => setDistSubDeleteModal((m) => ({ ...m, show: false }))}
                disabled={distSubDeleteModal.deleting}
              >
                Cancel
              </button>
              <button
                className="btn flex-grow-1"
                style={{ background: "#ef4444", color: "#fff", fontWeight: 500, fontSize: 14, border: "none", height: 44 }}
                onClick={handleDistSubDelete}
                disabled={distSubDeleteModal.deleting}
              >
                {distSubDeleteModal.deleting
                  ? <><span className="spinner-border spinner-border-sm me-2" style={{ width: 14, height: 14, borderWidth: 2 }} />Deleting…</>
                  : "Delete"
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerSettings;
