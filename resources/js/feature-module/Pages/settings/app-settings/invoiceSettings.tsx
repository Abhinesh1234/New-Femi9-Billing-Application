import { useCallback, useEffect, useRef, useState } from "react";
import { Toast } from "react-bootstrap";
import { useSearchParams } from "react-router";
import Select from "react-select";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import FieldCustomizationTab from "../../../../components/field-customization/FieldCustomizationTab";
import CommonSelect from "../../../../components/common-select/commonSelect";
import { all_routes } from "../../../../routes/all_routes";
import { type InvoiceConfiguration } from "../../../../core/services/settingApi";
import { getSettings, updateSettings } from "../../../../core/cache/settingCache";
import ApprovalTab, { type ApprovalTabHandle } from "../../../../components/approval-tab/ApprovalTab";
import { fetchDistributionCategories, type DistributionCategory } from "../../../../core/services/distributionCategoryApi";

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULTS: InvoiceConfiguration = {
  allow_edit_sent_invoice:           true,
  invoice_order_number:              "sales_order_number",
  notify_online_payment:             true,
  include_payment_receipt_thank_you: true,
  automate_thank_you_note:           false,
  enable_qr_code:                    false,
  qr_code_type:                      "invoice_url",
  qr_upi_id:                         "",
  qr_upi_confirm:                    "",
  qr_description:                    "Scan the QR code to view the configured information.",
  qr_custom_content:                 "",
  hide_zero_value_line_items:        false,
  terms_and_conditions:              "",
  customer_notes:                    "Thanks for your business.",
  advanced_payment_enabled:          false,
  advanced_payment_categories:       [],
};

// ── Tab definitions ───────────────────────────────────────────────────────────

type TabId = "general" | "approvals" | "field_customization";

const TABS: { id: TabId; label: string; soon?: boolean }[] = [
  { id: "general",             label: "General" },
  { id: "approvals",           label: "Approvals" },
  { id: "field_customization", label: "Field Customization" },
];

// ── QR Code config data ───────────────────────────────────────────────────────

const QR_CODE_TYPES: { value: "upi_id" | "invoice_url" | "custom"; label: string; desc: string }[] = [
  { value: "upi_id",      label: "UPI ID",      desc: "Your UPI ID will be displayed as a QR code on invoices." },
  { value: "invoice_url", label: "Invoice URL",  desc: "When scanned, invoice URL will be displayed to the customer. Recommended if you provide online payment options." },
  { value: "custom",      label: "Custom",       desc: "When scanned, the custom URL you configure or the information you enter will be displayed." },
];

const QR_PLACEHOLDERS = [
  {
    group: "INVOICE",
    items: [
      { label: "InvoiceDate",        value: "{InvoiceDate}" },
      { label: "Invoice Issue Date", value: "{InvoiceIssueDate}" },
      { label: "InvoiceNumber",      value: "{InvoiceNumber}" },
      { label: "P.O. Number",        value: "{PONumber}" },
      { label: "Total",              value: "{Total}" },
      { label: "Due Date",           value: "{DueDate}" },
    ],
  },
  {
    group: "CUSTOMER",
    items: [
      { label: "Salutation",        value: "{Salutation}" },
      { label: "First Name",        value: "{FirstName}" },
      { label: "Last Name",         value: "{LastName}" },
      { label: "Email",             value: "{Email}" },
      { label: "Phone",             value: "{Phone}" },
      { label: "Mobile",            value: "{Mobile}" },
      { label: "Department",        value: "{Department}" },
      { label: "Designation",       value: "{Designation}" },
      { label: "Skype",             value: "{Skype}" },
      { label: "Name",              value: "{Name}" },
      { label: "Company Name",      value: "{CompanyName}" },
      { label: "Billing Attention", value: "{BillingAttention}" },
      { label: "Billing Address",   value: "{BillingAddress}" },
      { label: "Billing City",      value: "{BillingCity}" },
      { label: "Billing State",     value: "{BillingState}" },
      { label: "Billing Code",      value: "{BillingCode}" },
      { label: "Billing Country",   value: "{BillingCountry}" },
      { label: "Billing Phone",     value: "{BillingPhone}" },
    ],
  },
  {
    group: "ORGANIZATION",
    items: [
      { label: "Organization Name", value: "{OrgName}" },
      { label: "Logo",              value: "{Logo}" },
      { label: "Street Address1",   value: "{StreetAddress1}" },
      { label: "Street Address2",   value: "{StreetAddress2}" },
      { label: "City",              value: "{City}" },
      { label: "ZIP/Postal Code",   value: "{ZipCode}" },
      { label: "State/Province",    value: "{State}" },
      { label: "Country",           value: "{Country}" },
      { label: "Phone#",            value: "{OrgPhone}" },
      { label: "Fax#",              value: "{Fax}" },
      { label: "Website",           value: "{Website}" },
      { label: "Label 1",           value: "{Label1}" },
      { label: "Label 2",           value: "{Label2}" },
      { label: "Label 3",           value: "{Label3}" },
      { label: "Label 4",           value: "{Label4}" },
      { label: "Label 5",           value: "{Label5}" },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

const InvoiceSettings = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const t = searchParams.get("tab");
    if (t === "approvals") return "approvals";
    if (t === "field_customization") return "field_customization";
    return "general";
  });

  // General tab state
  const [config, setConfig]   = useState<InvoiceConfiguration>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  // Approvals tab
  const approvalTabRef = useRef<ApprovalTabHandle>(null);

  // Custom QR modal
  const [showCustomQrModal, setShowCustomQrModal] = useState(false);
  const [customQrDraft, setCustomQrDraft]         = useState("");
  const [showPlaceholders, setShowPlaceholders]   = useState(false);
  const [placeholderSearch, setPlaceholderSearch] = useState("");
  const customQrTextareaRef  = useRef<HTMLTextAreaElement>(null);
  const placeholderDropRef   = useRef<HTMLDivElement>(null);

  // Close placeholder dropdown on outside click
  useEffect(() => {
    if (!showPlaceholders) return;
    const handler = (e: MouseEvent) => {
      if (placeholderDropRef.current && !placeholderDropRef.current.contains(e.target as Node)) {
        setShowPlaceholders(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPlaceholders]);


  const insertPlaceholder = (value: string) => {
    const ta = customQrTextareaRef.current;
    if (!ta) {
      setCustomQrDraft((prev) => prev + value);
      setShowPlaceholders(false);
      return;
    }
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const next  = customQrDraft.slice(0, start) + value + customQrDraft.slice(end);
    setCustomQrDraft(next);
    setShowPlaceholders(false);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + value.length, start + value.length);
    }, 0);
  };

  // Field Customization tab refresh
  const [cfRefreshKey, setCfRefreshKey] = useState(0);
  const cfRefreshResolveRef = useRef<(() => void) | null>(null);

  // Distribution categories for Advanced Payment
  const [categories, setCategories]           = useState<DistributionCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  useEffect(() => {
    setCategoriesLoading(true);
    fetchDistributionCategories()
      .then((res) => { if (res.success) setCategories(res.data); })
      .finally(() => setCategoriesLoading(false));
  }, []);

  // Toast
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger" | "warning"; message: string }>({
    show: false, type: "success", message: "",
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  const showToast = (type: "success" | "danger" | "warning", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
  };

  // Load settings
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadErr(null);
    getSettings<InvoiceConfiguration>("invoices")
      .then((data) => { if (!cancelled) setConfig({ ...DEFAULTS, ...data }); })
      .catch((e)   => { if (!cancelled) setLoadErr(e?.message ?? "Failed to load settings."); })
      .finally(()  => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await updateSettings<InvoiceConfiguration>("invoices", config);
    setSaving(false);
    if (res.success) {
      showToast("success", "Invoice settings saved successfully.");
    } else {
      showToast("danger", res.message ?? "Failed to save settings.");
    }
  };

  const handleRefresh = useCallback((): Promise<void> => {
    return new Promise<void>((resolve) => {
      cfRefreshResolveRef.current = resolve;
      setCfRefreshKey((k) => k + 1);
    });
  }, []);

  const set = <K extends keyof InvoiceConfiguration>(key: K, value: InvoiceConfiguration[K]) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  const qrType = config.qr_code_type ?? "invoice_url";
  const qrTypeInfo = QR_CODE_TYPES.find((t) => t.value === qrType) ?? QR_CODE_TYPES[1];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <PageHeader
            title="Invoice Settings"
            badgeCount={false}
            showModuleTile={false}
            showExport={false}
            onRefresh={activeTab === "field_customization" ? handleRefresh : undefined}
          />

          <div className="row">
            <div className="col-12">
              <div className="card mb-0">
                <div className="card-body p-0">

                  {/* ── Tab strip ── */}
                  <div className="px-4 pt-3 pb-3">
                    <div className="d-inline-flex rounded" style={{ background: "#f1f3f5", padding: 4, gap: 2 }}>
                      {TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => !tab.soon && setActiveTab(tab.id)}
                            style={{
                              padding: "9px 20px", borderRadius: 6, border: "none",
                              background: isActive ? "#fff" : "transparent",
                              color: isActive ? "#e03131" : "#6c757d",
                              fontWeight: isActive ? 600 : 400,
                              fontSize: 14,
                              boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                              transition: "all 0.15s",
                              cursor: tab.soon ? "default" : "pointer",
                              opacity: tab.soon ? 0.45 : 1,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── General tab ── */}
                  {activeTab === "general" && (
                    <div className="p-4">

                      {loading && (
                        <div className="d-flex align-items-center gap-2 py-4 text-muted">
                          <div className="spinner-border spinner-border-sm text-primary" role="status" />
                          <span>Loading settings…</span>
                        </div>
                      )}

                      {!loading && loadErr && (
                        <div className="alert alert-danger d-flex align-items-center gap-2 py-2">
                          <i className="ti ti-alert-circle fs-16 flex-shrink-0" />
                          <span className="flex-grow-1">{loadErr}</span>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger ms-auto"
                            onClick={() => {
                              setLoadErr(null);
                              setLoading(true);
                              getSettings<InvoiceConfiguration>("invoices")
                                .then((d) => setConfig({ ...DEFAULTS, ...d }))
                                .catch((e) => setLoadErr(e?.message ?? "Failed to load."))
                                .finally(() => setLoading(false));
                            }}
                          >
                            Retry
                          </button>
                        </div>
                      )}

                      {!loading && !loadErr && (
                        <>
                          {/* Allow editing of Sent Invoice */}
                          <div className="border-bottom pb-3 mb-4">
                            <div className="form-check mb-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="allow_edit_sent"
                                checked={config.allow_edit_sent_invoice}
                                onChange={(e) => set("allow_edit_sent_invoice", e.target.checked)}
                              />
                              <label className="form-check-label" htmlFor="allow_edit_sent">
                                Allow editing of Sent Invoice?
                              </label>
                            </div>
                          </div>

                          {/* Invoice Order Number */}
                          <div className="border-bottom pb-4 mb-4">
                            <h6 className="fw-semibold mb-3">Invoice Order Number</h6>
                            <div className="form-check mb-2">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="invoice_order_number"
                                id="inv_order_so"
                                value="sales_order_number"
                                checked={config.invoice_order_number === "sales_order_number"}
                                onChange={() => set("invoice_order_number", "sales_order_number")}
                              />
                              <label className="form-check-label" htmlFor="inv_order_so">
                                Use Sales Order Number
                              </label>
                            </div>
                            <div className="form-check mb-0">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="invoice_order_number"
                                id="inv_order_sor"
                                value="sales_order_ref_number"
                                checked={config.invoice_order_number === "sales_order_ref_number"}
                                onChange={() => set("invoice_order_number", "sales_order_ref_number")}
                              />
                              <label className="form-check-label" htmlFor="inv_order_sor">
                                Use Sales Order Reference Number
                              </label>
                            </div>
                          </div>

                          {/* Invoice QR Code */}
                          <div className="border-bottom pb-4 mb-4">
                            {/* Header row — always visible */}
                            <div className="d-flex align-items-start justify-content-between gap-4" style={{ marginBottom: config.enable_qr_code ? 28 : 0 }}>
                              <div>
                                <h6 className="fw-semibold mb-2">Invoice QR Code</h6>
                                <p className="text-muted small mb-0" style={{ lineHeight: 1.7 }}>
                                  Enable and configure the QR code you want to display on the PDF copy of an Invoice.
                                  Your customers can scan the QR code using their device to access the URL or other
                                  information that you configure.
                                </p>
                              </div>
                              <div className="d-flex align-items-center gap-2 flex-shrink-0">
                                <span className="text-muted small" style={{ whiteSpace: "nowrap" }}>
                                  {config.enable_qr_code ? "Enabled" : "Disabled"}
                                </span>
                                <div className="form-check form-switch mb-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    checked={config.enable_qr_code}
                                    onChange={(e) => set("enable_qr_code", e.target.checked)}
                                    style={{ cursor: "pointer", width: 40, height: 22 }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Expanded config — only when enabled */}
                            {config.enable_qr_code && (
                              <div className="d-flex gap-4">
                                {/* Form area */}
                                <div style={{ flex: 1, minWidth: 0 }}>

                                  {/* QR Code Type */}
                                  <div className="d-flex align-items-start gap-3 mb-4">
                                    <span className="text-muted flex-shrink-0" style={{ width: 170, paddingTop: 8, fontSize: 14 }}>
                                      QR Code Type
                                    </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div className="d-flex align-items-center gap-2">
                                        <div style={{ width: 220 }}>
                                          <CommonSelect
                                            options={QR_CODE_TYPES}
                                            className="select"
                                            value={QR_CODE_TYPES.find((t) => t.value === qrType) ?? null}
                                            onChange={(opt) =>
                                              set("qr_code_type", (opt?.value ?? "invoice_url") as InvoiceConfiguration["qr_code_type"])
                                            }
                                          />
                                        </div>
                                        {qrType === "custom" && (
                                          <button
                                            type="button"
                                            className="btn btn-primary btn-sm"
                                            onClick={() => {
                                              setCustomQrDraft(config.qr_custom_content ?? "");
                                              setPlaceholderSearch("");
                                              setShowPlaceholders(false);
                                              setShowCustomQrModal(true);
                                            }}
                                          >
                                            Configure
                                          </button>
                                        )}
                                      </div>
                                      <p className="text-muted small mt-2 mb-0" style={{ lineHeight: 1.6 }}>{qrTypeInfo.desc}</p>
                                    </div>
                                  </div>

                                  {/* UPI ID fields */}
                                  {qrType === "upi_id" && (
                                    <>
                                      <div className="d-flex align-items-center gap-3 mb-3">
                                        <span className="text-muted small flex-shrink-0" style={{ width: 170 }}>
                                          Enter UPI ID
                                        </span>
                                        <div className="position-relative" style={{ maxWidth: 300, flex: 1 }}>
                                          <input
                                            type="text"
                                            className="form-control form-control-sm pe-5"
                                            value={config.qr_upi_id ?? ""}
                                            onChange={(e) => set("qr_upi_id", e.target.value)}
                                          />
                                          <span
                                            className="position-absolute text-muted"
                                            style={{ right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, fontWeight: 600, letterSpacing: "0.03em" }}
                                          >
                                            UPI
                                          </span>
                                        </div>
                                      </div>
                                      <div className="d-flex align-items-center gap-3 mb-2">
                                        <span className="text-muted small flex-shrink-0" style={{ width: 170 }}>
                                          Confirm UPI ID
                                        </span>
                                        <div className="position-relative" style={{ maxWidth: 300, flex: 1 }}>
                                          <input
                                            type="text"
                                            className="form-control form-control-sm pe-5"
                                            value={config.qr_upi_confirm ?? ""}
                                            onChange={(e) => set("qr_upi_confirm", e.target.value)}
                                          />
                                          <span
                                            className="position-absolute text-muted"
                                            style={{ right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, fontWeight: 600, letterSpacing: "0.03em" }}
                                          >
                                            UPI
                                          </span>
                                        </div>
                                      </div>
                                      <div className="d-flex gap-3 mb-4">
                                        <div className="flex-shrink-0" style={{ width: 170 }} />
                                        <p className="text-muted small mb-0" style={{ lineHeight: 1.6 }}>Payments received via UPI must be recorded manually.</p>
                                      </div>
                                    </>
                                  )}

                                  {/* QR Code Description */}
                                  <div className="d-flex align-items-start gap-3 mb-4">
                                    <span className="text-muted flex-shrink-0" style={{ width: 170, paddingTop: 8, fontSize: 14 }}>
                                      QR Code Description
                                    </span>
                                    <textarea
                                      className="form-control"
                                      rows={6}
                                      value={config.qr_description ?? ""}
                                      onChange={(e) => set("qr_description", e.target.value)}
                                      style={{ resize: "vertical", fontSize: 14 }}
                                    />
                                  </div>

                                  {/* Note */}
                                  <p className="small mb-0 mt-1" style={{ maxWidth: 600, lineHeight: 1.7 }}>
                                    <span className="fw-semibold">Note:</span>{" "}
                                    <span className="text-muted">
                                      You can display this QR code in your invoice PDFs. To do this, edit the invoice
                                      template from{" "}
                                      <a href="#" className="text-primary">PDF Templates in Settings</a>
                                      {" "}and select the <em>Show Invoice QR Code</em> checkbox in the Other Details section.
                                    </span>
                                  </p>
                                </div>

                                {/* Invoice preview — UPI ID only */}
                                {qrType === "upi_id" && (
                                  <div className="flex-shrink-0" style={{ width: 200 }}>
                                    <div
                                      className="rounded border d-flex flex-column"
                                      style={{ background: "#f8f9fa", padding: 12, minHeight: 200 }}
                                    >
                                      <div className="text-muted small fw-medium mb-2 text-center">Invoice</div>
                                      <div style={{ flex: 1, background: "#e9ecef", borderRadius: 4, marginBottom: 8 }} />
                                      <div className="d-flex align-items-center gap-2">
                                        <div
                                          className="d-flex align-items-center justify-content-center rounded border bg-white"
                                          style={{ width: 52, height: 52, flexShrink: 0 }}
                                        >
                                          <i className="ti ti-qrcode fs-20 text-muted" />
                                        </div>
                                        <span className="text-muted" style={{ fontSize: 10 }}>QR code will be displayed here</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Zero-Value Line Items */}
                          <div className="border-bottom pb-4 mb-4">
                            <h6 className="fw-semibold mb-3">Zero-Value Line Items</h6>
                            <div className="form-check mb-1">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="hide_zero_value"
                                checked={config.hide_zero_value_line_items}
                                onChange={(e) => set("hide_zero_value_line_items", e.target.checked)}
                              />
                              <label className="form-check-label" htmlFor="hide_zero_value">
                                Hide zero-value line items
                              </label>
                            </div>
                            <p className="text-muted small mb-0 ms-4">
                              Choose whether you want to hide zero-value line items in an invoice's PDF and the
                              Customer Portal. They will still be visible while editing an invoice. This setting
                              will not apply to invoices whose total is zero.
                            </p>
                          </div>

                          {/* Terms & Conditions */}
                          <div className="border-bottom pb-4 mb-4">
                            <h6 className="fw-semibold mb-3">Terms &amp; Conditions</h6>
                            <textarea
                              className="form-control"
                              rows={5}
                              value={config.terms_and_conditions}
                              onChange={(e) => set("terms_and_conditions", e.target.value)}
                              style={{ resize: "vertical" }}
                            />
                          </div>

                          {/* Customer Notes */}
                          <div className="border-bottom pb-4 mb-4">
                            <h6 className="fw-semibold mb-3">Customer Notes</h6>
                            <textarea
                              className="form-control"
                              rows={5}
                              value={config.customer_notes}
                              onChange={(e) => set("customer_notes", e.target.value)}
                              style={{ resize: "vertical" }}
                            />
                          </div>

                          {/* Advanced Payment */}
                          <div className="border-bottom pb-4 mb-4">
                            <div className="d-flex align-items-start justify-content-between gap-4" style={{ marginBottom: config.advanced_payment_enabled ? 20 : 0 }}>
                              <div>
                                <h6 className="fw-semibold mb-2">Advanced Payment</h6>
                                <p className="text-muted small mb-0" style={{ lineHeight: 1.7 }}>
                                  Enable advanced payment to allow specific distribution categories to use advance payment mode on invoices.
                                </p>
                              </div>
                              <div className="d-flex align-items-center gap-2 flex-shrink-0">
                                <span className="text-muted small" style={{ whiteSpace: "nowrap" }}>
                                  {config.advanced_payment_enabled ? "Enabled" : "Disabled"}
                                </span>
                                <div className="form-check form-switch mb-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    checked={config.advanced_payment_enabled}
                                    onChange={(e) => set("advanced_payment_enabled", e.target.checked)}
                                    style={{ cursor: "pointer", width: 40, height: 22 }}
                                  />
                                </div>
                              </div>
                            </div>

                            {config.advanced_payment_enabled && (
                              <div className="d-flex align-items-start gap-3">
                                <span className="text-muted flex-shrink-0" style={{ width: 200, paddingTop: 8, fontSize: 14 }}>
                                  Distribution Categories
                                </span>
                                <div style={{ flex: 1, minWidth: 0, maxWidth: 480 }}>
                                  <Select
                                    classNamePrefix="react-select"
                                    isMulti
                                    isLoading={categoriesLoading}
                                    options={categories.map((c) => ({ value: c.id, label: c.name }))}
                                    value={categories
                                      .filter((c) => (config.advanced_payment_categories ?? []).map(Number).includes(c.id))
                                      .map((c) => ({ value: c.id, label: c.name }))}
                                    onChange={(selected) =>
                                      set("advanced_payment_categories", selected ? selected.map((s) => Number(s.value)) : [])
                                    }
                                    placeholder="Select categories…"
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    components={{ IndicatorSeparator: () => null }}
                                    styles={{
                                      option: (base: object, state: { isSelected: boolean; isFocused: boolean }) => ({
                                        ...base,
                                        backgroundColor: state.isSelected ? "#E41F07" : state.isFocused ? "white" : "white",
                                        color: state.isSelected ? "#fff" : state.isFocused ? "#E41F07" : "#707070",
                                        cursor: "pointer",
                                        "&:hover": { backgroundColor: "#E41F07", color: "#fff" },
                                      }),
                                      menu: (base: object) => ({ ...base, zIndex: 9999 }),
                                      menuPortal: (base: object) => ({ ...base, zIndex: 9999 }),
                                    }}
                                  />
                                  <p className="text-muted small mt-2 mb-0">
                                    Only parties belonging to these categories will see the advance payment option.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* ── Approvals tab ── */}
                  {activeTab === "approvals" && (
                    <div className="p-4">
                      <ApprovalTab
                        ref={approvalTabRef}
                        module="invoices"
                        entityLabel="Invoice"
                        onToast={showToast}
                      />
                    </div>
                  )}


                  {/* Field Customization */}
                  {activeTab === "field_customization" && (
                    <FieldCustomizationTab
                      module="invoices"
                      addRoute={all_routes.invoiceCustomField + "?module=invoices"}
                      editRoute={all_routes.invoiceCustomFieldEdit}
                      refreshKey={cfRefreshKey}
                      onRefreshDone={() => {
                        cfRefreshResolveRef.current?.();
                        cfRefreshResolveRef.current = null;
                      }}
                      onToast={showToast}
                    />
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ Sticky Save bar — General + Approvals tabs ═══════════════════ */}
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

      {/* ── Configure Custom QR Code Modal ── */}
      {showCustomQrModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1060,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) { setShowCustomQrModal(false); setShowPlaceholders(false); }
          }}
        >
          <div
            style={{
              background: "#fff", borderRadius: 14, padding: "32px 28px 24px",
              width: 640, boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
              display: "flex", flexDirection: "column", alignItems: "center",
            }}
          >
            {/* Icon */}
            <div style={{
              width: 56, height: 56, borderRadius: "50%", background: "#fff5f5",
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
            }}>
              <i className="ti ti-qrcode" style={{ fontSize: 24, color: "#e03131" }} />
            </div>

            {/* Title */}
            <p style={{ margin: "0 0 20px", fontWeight: 600, fontSize: 16, color: "#0f172a", textAlign: "center" }}>
              Configure Custom QR Code
            </p>

            {/* Form content */}
            <div style={{ width: "100%" }}>

              {/* Insert Placeholders dropdown */}
              <div className="position-relative mb-3" ref={placeholderDropRef}>
                <button
                  type="button"
                  className="btn btn-light border d-flex align-items-center gap-2"
                  onClick={() => { setShowPlaceholders((v) => !v); setPlaceholderSearch(""); }}
                >
                  Insert Placeholders
                  <i className={`ti ti-chevron-${showPlaceholders ? "up" : "down"} fs-14`} />
                </button>

                {showPlaceholders && (
                  <div
                    className="position-absolute bg-white border rounded shadow"
                    style={{ top: "calc(100% + 2px)", left: 0, zIndex: 1070, minWidth: 480 }}
                  >
                    {/* Search — matches input format search bar */}
                    <div className="p-2 border-bottom">
                      <div className="input-group">
                        <span className="input-group-text bg-white border-end-0">
                          <i className="ti ti-search text-muted" />
                        </span>
                        <input
                          autoFocus
                          type="text"
                          className="form-control border-start-0 ps-0"
                          placeholder="Search"
                          value={placeholderSearch}
                          onChange={(e) => setPlaceholderSearch(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Items — input-format-option class for consistent hover/selected styling */}
                    <div style={{ maxHeight: 300, overflowY: "auto" }}>
                      {QR_PLACEHOLDERS.map((group) => {
                        const filtered = group.items.filter((item) =>
                          item.label.toLowerCase().includes(placeholderSearch.toLowerCase())
                        );
                        if (filtered.length === 0) return null;
                        return (
                          <div key={group.group}>
                            <div
                              className="px-3 pt-3 pb-1 text-muted fw-semibold"
                              style={{ fontSize: 11, letterSpacing: "0.07em" }}
                            >
                              {group.group}
                            </div>
                            <div className="row g-0">
                              {filtered.map((item) => (
                                <div key={item.label} className="col-6">
                                  <div
                                    className="input-format-option px-3 py-2"
                                    onClick={() => insertPlaceholder(item.value)}
                                  >
                                    <div className="input-format-option-label fw-medium">{item.label}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <hr className="my-1" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Textarea */}
              <textarea
                ref={customQrTextareaRef}
                className="form-control"
                rows={8}
                placeholder="Enter a custom URL or the information you want to display when they scan the QR code"
                value={customQrDraft}
                onChange={(e) => setCustomQrDraft(e.target.value)}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10, width: "100%", marginTop: 24 }}>
              <button
                type="button"
                className="btn btn-light flex-grow-1"
                style={{ fontWeight: 500, fontSize: 14, height: 44 }}
                onClick={() => { setShowCustomQrModal(false); setShowPlaceholders(false); }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn flex-grow-1"
                style={{ background: "#e03131", color: "#fff", fontWeight: 500, fontSize: 14, border: "none", height: 44 }}
                onClick={() => {
                  set("qr_custom_content", customQrDraft);
                  setShowCustomQrModal(false);
                  setShowPlaceholders(false);
                }}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div
        className="position-fixed top-0 start-50 translate-middle-x pt-4"
        style={{ zIndex: 9999, pointerEvents: "none" }}
      >
        <Toast
          show={toast.show}
          onClose={() => setToast((t) => ({ ...t, show: false }))}
          style={{
            pointerEvents: "auto",
            borderRadius: 12,
            boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
            border: "none",
            minWidth: 320,
            background: "#fff",
          }}
        >
          <Toast.Body className="d-flex align-items-center gap-3 px-4 py-3">
            <span
              className={`d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 ${toast.type === "success" ? "bg-success" : toast.type === "warning" ? "bg-warning" : "bg-danger"}`}
              style={{ width: 36, height: 36 }}
            >
              <i className={`ti fs-16 text-white ${toast.type === "success" ? "ti-check" : toast.type === "warning" ? "ti-alert-triangle" : "ti-x"}`} />
            </span>
            <span className="fw-medium fs-14">{toast.message}</span>
          </Toast.Body>
        </Toast>
      </div>
    </>
  );
};

export default InvoiceSettings;
