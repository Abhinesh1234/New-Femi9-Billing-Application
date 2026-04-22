import { useEffect, useRef, useState, useCallback } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Modal, OverlayTrigger, Toast, Tooltip } from "react-bootstrap";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import CommonSelect from "../../../../components/common-select/commonSelect";
import CommonDatePicker from "../../../../components/common-datePicker/commonDatePicker";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Input_Type, Module } from "../../../../core/json/selectOption";
import { all_routes } from "../../../../routes/all_routes";
import {
  fetchSettings,
  saveSettings,
  validateProductSettings,
  type ProductConfiguration,
  type ValidationErrors,
} from "../../../../core/services/settingApi";
import {
  fetchCustomFields,
  updateCustomField,
  deleteCustomField,
  type CustomField,
  type CustomFieldConfig,
} from "../../../../core/services/customFieldApi";

const DATA_TYPE_LABELS: Record<string, string> = {
  text_single:   "Text Box (Single Line)",
  text_multi:    "Text Box (Multi-line)",
  email:         "Email",
  url:           "URL",
  phone:         "Phone",
  number:        "Number",
  decimal:       "Decimal",
  amount:        "Amount",
  percent:       "Percent",
  date:          "Date",
  datetime:      "Date and Time",
  checkbox:      "Check Box",
  auto_generate: "Auto-Generate Number",
  dropdown:      "Dropdown",
  multiselect:   "Multi-select",
  lookup:        "Lookup",
  attachment:    "Attachment",
  image:         "Image",
};

const dimensionOptions = [
  { value: "cm", label: "cm" },
  { value: "mm", label: "mm" },
  { value: "in", label: "in" },
  { value: "ft", label: "ft" },
];

const weightOptions = [
  { value: "kg", label: "kg" },
  { value: "g", label: "g" },
  { value: "lb", label: "lb" },
  { value: "oz", label: "oz" },
];

const barcodeOptions = [
  { value: "sku", label: "SKU" },
  { value: "upc", label: "UPC" },
  { value: "ean", label: "EAN" },
  { value: "isbn", label: "ISBN" },
];

const decimalRateOptions = [
  { value: "0", label: "0" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6" },
];

const notifyEmailOptions = [
  { value: "abhikongu1@gmail.com", label: "abhikongu1@gmail.com" },
];

const trackingOptions = [
  { value: "packages", label: "Packages, Purchase Receives & Return Receipts" },
  { value: "invoices", label: "Invoices, Bills & Credit Notes" },
];

const trackingBullets: Record<string, string[]> = {
  packages: ["Creating a package", "Recording a purchase receive", "Recording a return receipt"],
  invoices: ["Creating an invoice", "Recording a bill", "Recording a credit note"],
};


const DEFAULTS: ProductConfiguration = {
  decimal_rate: 2,
  dimension_unit: "cm",
  weight_unit: "kg",
  barcode_scan_using: "sku",
  allow_duplicate_names: false,
  enhanced_search: false,
  enable_price_lists: false,
  apply_price_list_line_item: false,
  enable_composite_items: false,
  inventory_start_date: "2026-01-02",
  enable_serial_tracking: false,
  enable_batch_tracking: false,
  tracking_preference: "packages",
  mandate_tracking: true,
  allow_duplicate_batch: false,
  allow_qty_to_sold_batch: false,
  allow_diff_selling_price: false,
  prevent_stock_below_zero: true,
  stock_level: "org",
  out_of_stock_warning: false,
  notify_reorder_point: false,
  notify_to_email: "",
  track_landed_cost: false,
};

const ProjectSettings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"general" | "field">(
    searchParams.get("tab") === "field" ? "field" : "general"
  );
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});

  // ── Toast state ──────────────────────────────────────────────────────────
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

  // ── Form state ──────────────────────────────────────────────────────────
  const [decimalRate, setDecimalRate]                       = useState(DEFAULTS.decimal_rate);
  const [dimensionUnit, setDimensionUnit]                   = useState(DEFAULTS.dimension_unit);
  const [weightUnit, setWeightUnit]                         = useState(DEFAULTS.weight_unit);
  const [barcodeScanUsing, setBarcodeScanUsing]             = useState(DEFAULTS.barcode_scan_using);
  const [allowDuplicateNames, setAllowDuplicateNames]       = useState(DEFAULTS.allow_duplicate_names);
  const [enhancedSearch, setEnhancedSearch]                 = useState(DEFAULTS.enhanced_search);
  const [enablePriceLists, setEnablePriceLists]             = useState(DEFAULTS.enable_price_lists);
  const [applyPriceListLineItem, setApplyPriceListLineItem] = useState(DEFAULTS.apply_price_list_line_item);
  const [enableCompositeItems, setEnableCompositeItems]     = useState(DEFAULTS.enable_composite_items);
  const [inventoryStartDate, setInventoryStartDate]         = useState<Dayjs>(dayjs(DEFAULTS.inventory_start_date));
  const [enableSerialTracking, setEnableSerialTracking]     = useState(DEFAULTS.enable_serial_tracking);
  const [enableBatchTracking, setEnableBatchTracking]       = useState(DEFAULTS.enable_batch_tracking);
  const [preventBelowZero, setPreventBelowZero]             = useState(DEFAULTS.prevent_stock_below_zero);
  const [stockLevel, setStockLevel]                         = useState<"org" | "location">(DEFAULTS.stock_level);
  const [outOfStockWarning, setOutOfStockWarning]           = useState(DEFAULTS.out_of_stock_warning);
  const [notifyReorderPoint, setNotifyReorderPoint]         = useState(DEFAULTS.notify_reorder_point);
  const [trackLandedCost, setTrackLandedCost]               = useState(DEFAULTS.track_landed_cost);

  // ── Inventory Tracking Preferences modal ────────────────────────────────
  const [showTrackingModal, setShowTrackingModal]   = useState(false);
  const [trackedInValue, setTrackedInValue]         = useState("packages");
  const [mandatoryTracking, setMandatoryTracking]   = useState(true);
  const [modalTrackedIn, setModalTrackedIn]         = useState("packages");
  const [modalMandate, setModalMandate]             = useState(true);

  // ── Batch tracking sub-options ───────────────────────────────────────────
  const [allowDuplicateBatch, setAllowDuplicateBatch]     = useState(false);
  const [allowQtyToSoldBatch, setAllowQtyToSoldBatch]     = useState(false);
  const [allowDiffSellingPrice, setAllowDiffSellingPrice] = useState(false);

  // ── Reorder point notification ───────────────────────────────────────────
  const [notifyToEmail, setNotifyToEmail] = useState("abhikongu1@gmail.com");
  const [flashReorder, setFlashReorder] = useState(false);

  // ── Custom Fields tab ────────────────────────────────────────────────────
  const [customFields, setCustomFields]     = useState<CustomField[]>([]);
  const [cfLoading, setCfLoading]           = useState(false);
  const [cfFetchError, setCfFetchError]     = useState<string | null>(null);
  const [cfActionId, setCfActionId]         = useState<number | null>(null);

  type DeleteModal = { show: boolean; field: CustomField | null; deleting: boolean };
  const [deleteModal, setDeleteModal] = useState<DeleteModal>({
    show: false, field: null, deleting: false,
  });


  // ── Load custom fields when Field Customization tab is opened ───────────
  const loadCustomFields = async () => {
    setCfLoading(true);
    setCfFetchError(null);
    const res = await fetchCustomFields("products");
    if (res.success) {
      setCustomFields(res.data);
    } else {
      setCfFetchError(res.message);
    }
    setCfLoading(false);
  };

  useEffect(() => {
    if (activeTab !== "field") return;
    if (customFields.length > 0 && !cfFetchError) return;
    loadCustomFields();
  }, [activeTab]);

  // ── Scroll + flash highlight when arriving from reorder point link ────────
  // Run only after settings have loaded (element is in the DOM)
  useEffect(() => {
    if (loading) return;
    if (searchParams.get("highlight") !== "notify-reorder") return;
    const el = document.getElementById("notify-reorder-section");
    if (!el) return;
    const t = setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setFlashReorder(true);
      setTimeout(() => setFlashReorder(false), 1800);
    }, 100);
    return () => clearTimeout(t);
  }, [loading, searchParams]);

  // ── Load saved settings on mount ────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetchSettings<ProductConfiguration>("products");
      if (res.success && res.configuration) {
        const c = res.configuration;
        setDecimalRate(c.decimal_rate);
        setDimensionUnit(c.dimension_unit);
        setWeightUnit(c.weight_unit);
        setBarcodeScanUsing(c.barcode_scan_using);
        setAllowDuplicateNames(c.allow_duplicate_names ?? false);
        setEnhancedSearch(c.enhanced_search ?? false);
        setEnablePriceLists(c.enable_price_lists ?? false);
        setApplyPriceListLineItem(c.apply_price_list_line_item ?? false);
        setEnableCompositeItems(c.enable_composite_items ?? false);
        setInventoryStartDate(dayjs(c.inventory_start_date));
        setEnableSerialTracking(c.enable_serial_tracking ?? false);
        setEnableBatchTracking(c.enable_batch_tracking ?? false);
        setTrackedInValue(c.tracking_preference ?? "packages");
        setMandatoryTracking(c.mandate_tracking ?? true);
        setAllowDuplicateBatch(c.allow_duplicate_batch ?? false);
        setAllowQtyToSoldBatch(c.allow_qty_to_sold_batch ?? false);
        setAllowDiffSellingPrice(c.allow_diff_selling_price ?? false);
        setPreventBelowZero(c.prevent_stock_below_zero ?? true);
        setStockLevel(c.stock_level ?? "org");
        setOutOfStockWarning(c.out_of_stock_warning ?? false);
        setNotifyReorderPoint(c.notify_reorder_point ?? false);
        setNotifyToEmail(c.notify_to_email);
        setTrackLandedCost(c.track_landed_cost);
      }
      setLoading(false);
    })();
  }, []);

  // ── Custom field action handlers ─────────────────────────────────────────

  const handleCfAction = async (field: CustomField, patch: Partial<CustomFieldConfig>) => {
    setCfActionId(field.id);
    const res = await updateCustomField(field.id, { ...field.config, ...patch });
    if (res.success) {
      setCustomFields((prev) => prev.map((f) => (f.id === field.id ? res.data : f)));
      showToast("success", res.message);
    } else {
      showToast("danger", res.message);
    }
    setCfActionId(null);
  };

  const openDeleteModal = (field: CustomField) => {
    setDeleteModal({ show: true, field, deleting: false });
  };

  const handleDeleteConfirm = async () => {
    const { field } = deleteModal;
    if (!field) return;

    setDeleteModal((m) => ({ ...m, deleting: true }));
    const res = await deleteCustomField(field.id);

    if (res.success) {
      setCustomFields((prev) => prev.filter((f) => f.id !== field.id));
      setDeleteModal({ show: false, field: null, deleting: false });
      showToast("success", "Custom field deleted successfully.");
    } else {
      setDeleteModal((m) => ({ ...m, deleting: false }));
      showToast("danger", res.message);
    }
  };

  // ── Build payload from current state ────────────────────────────────────
  const buildPayload = (): ProductConfiguration => ({
    decimal_rate: decimalRate,
    dimension_unit: dimensionUnit,
    weight_unit: weightUnit,
    barcode_scan_using: barcodeScanUsing,
    allow_duplicate_names: allowDuplicateNames,
    enhanced_search: enhancedSearch,
    enable_price_lists: enablePriceLists,
    apply_price_list_line_item: applyPriceListLineItem,
    enable_composite_items: enableCompositeItems,
    inventory_start_date: inventoryStartDate.format("YYYY-MM-DD"),
    enable_serial_tracking: enableSerialTracking,
    enable_batch_tracking: enableBatchTracking,
    tracking_preference: trackedInValue,
    mandate_tracking: mandatoryTracking,
    allow_duplicate_batch: enableBatchTracking ? allowDuplicateBatch : false,
    allow_qty_to_sold_batch: enableBatchTracking ? allowQtyToSoldBatch : false,
    allow_diff_selling_price: enableBatchTracking ? allowDiffSellingPrice : false,
    prevent_stock_below_zero: preventBelowZero,
    stock_level: stockLevel,
    out_of_stock_warning: outOfStockWarning,
    notify_reorder_point: notifyReorderPoint,
    notify_to_email: notifyReorderPoint ? notifyToEmail : "",
    track_landed_cost: trackLandedCost,
  });

  // ── Save handler ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    const payload = buildPayload();

    // Client-side validation first
    const errors = validateProductSettings(payload);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showToast("warning", "Please fix the highlighted fields before saving.");
      return;
    }

    setFieldErrors({});
    setSaving(true);

    const res = await saveSettings<ProductConfiguration>("products", payload);
    if (res.success) {
      setSaving(false);
      showToast("success", res.message ?? "Product settings saved successfully.");
    } else {
      // Show server-side field errors if returned
      if (res.errors) {
        const mapped: ValidationErrors = {};
        Object.entries(res.errors).forEach(([key, msgs]) => {
          mapped[key] = msgs[0];
        });
        setFieldErrors(mapped);
      }
      setSaving(false);
      showToast("danger", res.message);
    }
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <PageHeader
            title="Product Settings"
            badgeCount={false}
            showModuleTile={false}
            showExport={false}
          />
          <div className="row">
            <div className="col-12">
              <div className="card mb-0">
                <div className="card-body p-0">

                  {/* Internal Tabs */}
                  <div className="border-bottom px-4 pt-3">
                    <ul className="nav nav-tabs border-0">
                      <li className="nav-item me-3">
                        <button
                          className={`nav-link px-0 pb-3 border-0 rounded-0 fw-medium bg-transparent ${activeTab === "general" ? "active text-primary border-bottom border-3 border-primary" : "text-muted"}`}
                          onClick={() => setActiveTab("general")}
                        >
                          General
                        </button>
                      </li>
                      <li className="nav-item">
                        <button
                          className={`nav-link px-0 pb-3 border-0 rounded-0 fw-medium bg-transparent ${activeTab === "field" ? "active text-primary border-bottom border-3 border-primary" : "text-muted"}`}
                          onClick={() => setActiveTab("field")}
                        >
                          Field Customization
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Loading overlay */}
                  {loading && (
                    <div className="d-flex align-items-center justify-content-center py-5">
                      <div className="spinner-border text-primary me-2" role="status" />
                      <span className="text-muted">Loading settings…</span>
                    </div>
                  )}

                  {/* General Tab */}
                  {!loading && activeTab === "general" && (
                    <div className="p-4">

                      {/* Settings Rows */}
                      <div className="border-bottom mb-4">
                        <div className="row align-items-center py-3 border-bottom">
                          <div className="col-md-8">
                            <span className="fw-medium">Set a decimal rate for your item quantity</span>
                          </div>
                          <div className="col-md-4">
                            <CommonSelect
                              options={decimalRateOptions}
                              className="select"
                              defaultValue={decimalRateOptions.find((o) => Number(o.value) === decimalRate)}
                              onChange={(opt) => setDecimalRate(Number(opt?.value ?? 2))}
                            />
                            {fieldErrors.decimal_rate && <div className="text-danger small mt-1">{fieldErrors.decimal_rate}</div>}
                          </div>
                        </div>
                        <div className="row align-items-center py-3 border-bottom">
                          <div className="col-md-8">
                            <span className="fw-medium">Measure item dimensions in:</span>
                          </div>
                          <div className="col-md-4">
                            <CommonSelect
                              options={dimensionOptions}
                              className="select"
                              defaultValue={dimensionOptions.find((o) => o.value === dimensionUnit)}
                              onChange={(opt) => setDimensionUnit(opt?.value ?? "cm")}
                            />
                            {fieldErrors.dimension_unit && <div className="text-danger small mt-1">{fieldErrors.dimension_unit}</div>}
                          </div>
                        </div>
                        <div className="row align-items-center py-3 border-bottom">
                          <div className="col-md-8">
                            <span className="fw-medium">Measure item weights in:</span>
                          </div>
                          <div className="col-md-4">
                            <CommonSelect
                              options={weightOptions}
                              className="select"
                              defaultValue={weightOptions.find((o) => o.value === weightUnit)}
                              onChange={(opt) => setWeightUnit(opt?.value ?? "kg")}
                            />
                            {fieldErrors.weight_unit && <div className="text-danger small mt-1">{fieldErrors.weight_unit}</div>}
                          </div>
                        </div>
                        <div className="row align-items-center py-3">
                          <div className="col-md-8">
                            <span className="fw-medium d-flex align-items-center gap-1">
                              Select items when barcodes are scanned using:
                              <OverlayTrigger placement="right" overlay={<Tooltip>Choose the field used to identify items when a barcode is scanned</Tooltip>}>
                                <i className="ti ti-info-circle text-muted" />
                              </OverlayTrigger>
                            </span>
                          </div>
                          <div className="col-md-4">
                            <CommonSelect
                              options={barcodeOptions}
                              className="select"
                              defaultValue={barcodeOptions.find((o) => o.value === barcodeScanUsing)}
                              onChange={(opt) => setBarcodeScanUsing(opt?.value ?? "sku")}
                            />
                            {fieldErrors.barcode_scan_using && <div className="text-danger small mt-1">{fieldErrors.barcode_scan_using}</div>}
                          </div>
                        </div>
                      </div>

                      {/* Duplicate Item Name */}
                      <div className="border-bottom pb-4 mb-4">
                        <h6 className="fw-semibold mb-3">Duplicate Item Name</h6>
                        <div className="form-check mb-1">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="allowDuplicateNames"
                            checked={allowDuplicateNames}
                            onChange={(e) => setAllowDuplicateNames(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="allowDuplicateNames">
                            Allow duplicate item names
                          </label>
                        </div>
                        <p className="text-muted small mb-3 ms-4">
                          If you allow duplicate item names, all imports involving items will use SKU as the primary field for mapping.
                        </p>
                        <div className="rounded p-3" style={{ background: "#fff8f0", border: "1px solid #ffe0b2" }}>
                          <span className="text-warning me-2"><i className="ti ti-alert-triangle" /></span>
                          Before you enable this option, make{" "}
                          <Link to="#" className="text-primary">the SKU field active and mandatory.</Link>
                        </div>
                      </div>

                      {/* Enhanced Item Search */}
                      <div className="border-bottom pb-4 mb-4">
                        <h6 className="fw-semibold mb-3">Enhanced Item Search</h6>
                        <div className="form-check mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="enhancedSearch"
                            checked={enhancedSearch}
                            onChange={(e) => setEnhancedSearch(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="enhancedSearch">
                            Enable Enhanced Item Search
                          </label>
                        </div>
                        <div className="rounded p-3 d-flex align-items-start gap-2" style={{ background: "#fff8f0", border: "1px solid #ffe0b2" }}>
                          <span className="text-warning mt-1"><i className="ti ti-info-circle" /></span>
                          <span>Enabling this option makes it easier to find any item using relevant keywords in any order.</span>
                        </div>
                      </div>

                      {/* Price Lists */}
                      <div className="border-bottom pb-4 mb-4">
                        <h6 className="fw-semibold mb-2 d-flex align-items-center gap-1">
                          Price Lists
                          <OverlayTrigger placement="right" overlay={<Tooltip>Manage multiple pricing for items</Tooltip>}>
                            <i className="ti ti-info-circle text-muted fs-14" />
                          </OverlayTrigger>
                        </h6>
                        <div className="form-check mb-1">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="enablePriceLists"
                            checked={enablePriceLists}
                            onChange={(e) => setEnablePriceLists(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="enablePriceLists">
                            Enable Price Lists
                          </label>
                        </div>
                        <p className="text-muted small mb-0 ms-4">
                          Price Lists enables you to customise the rates of the items in your sales and purchase transactions.
                        </p>
                        {enablePriceLists && (
                          <div className="ms-4 mt-3">
                            <div className="form-check mb-1">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="applyPriceListLineItem"
                                checked={applyPriceListLineItem}
                                onChange={(e) => setApplyPriceListLineItem(e.target.checked)}
                              />
                              <label className="form-check-label" htmlFor="applyPriceListLineItem">
                                Apply price list at line item level
                              </label>
                            </div>
                            <p className="text-muted small mb-0 ms-4">
                              Select this option if you want to apply different price lists for each line item.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Composite Items */}
                      <div className="border-bottom pb-4 mb-4">
                        <h6 className="fw-semibold mb-3">Composite Items</h6>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="enableCompositeItems"
                            checked={enableCompositeItems}
                            onChange={(e) => setEnableCompositeItems(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="enableCompositeItems">
                            Enable Composite Items
                          </label>
                        </div>
                      </div>

                      {/* Inventory Start Date */}
                      <div className="border-bottom pb-4 mb-4">
                        <label className="form-label text-danger fw-medium d-flex align-items-center gap-1 mb-2">
                          Inventory Start Date*
                          <OverlayTrigger placement="right" overlay={<Tooltip>The date from which inventory tracking begins</Tooltip>}>
                            <i className="ti ti-info-circle text-muted fs-14" />
                          </OverlayTrigger>
                        </label>
                        <div className="row">
                          <div className="col-md-4">
                            <CommonDatePicker
                              value={inventoryStartDate}
                              onChange={(date) => setInventoryStartDate(date ?? dayjs())}
                            />
                            {fieldErrors.inventory_start_date && (
                              <div className="text-danger small mt-1">{fieldErrors.inventory_start_date}</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Advanced Inventory Tracking */}
                      <div className="border-bottom pb-4 mb-4">
                        <h6 className="fw-semibold mb-3">Advanced Inventory Tracking</h6>
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="enableSerialTracking"
                            checked={enableSerialTracking}
                            onChange={(e) => setEnableSerialTracking(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="enableSerialTracking">
                            Enable Serial Number Tracking
                          </label>
                        </div>
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="enableBatchTracking"
                            checked={enableBatchTracking}
                            onChange={(e) => setEnableBatchTracking(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="enableBatchTracking">
                            Enable Batch Tracking
                          </label>
                        </div>
                        {enableBatchTracking && (
                          <div className="ms-4 mb-3" style={{ borderLeft: "2px solid #dee2e6", paddingLeft: "12px" }}>
                            <div className="form-check mb-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="allowDuplicateBatch"
                                checked={allowDuplicateBatch}
                                onChange={(e) => setAllowDuplicateBatch(e.target.checked)}
                              />
                              <label className="form-check-label text-muted" htmlFor="allowDuplicateBatch">
                                Allow duplicate batch numbers
                              </label>
                              {fieldErrors.allow_duplicate_batch && <div className="text-danger small mt-1">{fieldErrors.allow_duplicate_batch}</div>}
                            </div>
                            <div className="form-check mb-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="allowQtyToSoldBatch"
                                checked={allowQtyToSoldBatch}
                                onChange={(e) => setAllowQtyToSoldBatch(e.target.checked)}
                              />
                              <label className="form-check-label text-muted" htmlFor="allowQtyToSoldBatch">
                                Allow quantity to be added only to the sold batch when returned
                              </label>
                              {fieldErrors.allow_qty_to_sold_batch && <div className="text-danger small mt-1">{fieldErrors.allow_qty_to_sold_batch}</div>}
                            </div>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="allowDiffSellingPrice"
                                checked={allowDiffSellingPrice}
                                onChange={(e) => setAllowDiffSellingPrice(e.target.checked)}
                              />
                              <label className="form-check-label text-muted" htmlFor="allowDiffSellingPrice">
                                Allow different Selling price for each Batch Tracked Items
                              </label>
                              {fieldErrors.allow_diff_selling_price && <div className="text-danger small mt-1">{fieldErrors.allow_diff_selling_price}</div>}
                            </div>
                          </div>
                        )}
                        {(enableSerialTracking || enableBatchTracking) && (
                          <div
                            className="d-flex align-items-center justify-content-between rounded px-3 py-2"
                            style={{ background: "#fff8f0", border: "1px solid #ffe0b2" }}
                          >
                            <div className="d-flex gap-4">
                              <div>
                                <div className="text-muted small mb-1">Tracked in:</div>
                                <div className="fw-medium small">
                                  {trackingOptions.find((o) => o.value === trackedInValue)?.label}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted small mb-1">Mandatory?</div>
                                <div className="fw-medium small">{mandatoryTracking ? "Yes" : "No"}</div>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                              onClick={() => {
                                setModalTrackedIn(trackedInValue);
                                setModalMandate(mandatoryTracking);
                                setShowTrackingModal(true);
                              }}
                            >
                              <i className="ti ti-settings" />
                              Configure
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Prevent Stock Below Zero */}
                      <div className="border-bottom pb-4 mb-4">
                        <div className="form-check mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="preventBelowZero"
                            checked={preventBelowZero}
                            onChange={(e) => setPreventBelowZero(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="preventBelowZero">
                            Prevent stock from going below zero
                          </label>
                        </div>
                        {fieldErrors.stock_level && (
                          <div className="text-danger small mb-2">{fieldErrors.stock_level}</div>
                        )}
                        {preventBelowZero && (
                          <div className="ms-4 mb-3">
                            <div className="form-check mb-2">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="stockLevel"
                                id="orgLevel"
                                checked={stockLevel === "org"}
                                onChange={() => setStockLevel("org")}
                              />
                              <label className="form-check-label d-flex align-items-center gap-1" htmlFor="orgLevel">
                                Organization level
                                <OverlayTrigger placement="right" overlay={<Tooltip>Prevents stock from going below zero across all locations</Tooltip>}>
                                  <i className="ti ti-info-circle text-muted fs-14" />
                                </OverlayTrigger>
                              </label>
                            </div>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="stockLevel"
                                id="locationLevel"
                                checked={stockLevel === "location"}
                                onChange={() => setStockLevel("location")}
                              />
                              <label className="form-check-label d-flex align-items-center gap-1" htmlFor="locationLevel">
                                Location level
                                <OverlayTrigger placement="right" overlay={<Tooltip>Prevents stock from going below zero per location</Tooltip>}>
                                  <i className="ti ti-info-circle text-muted fs-14" />
                                </OverlayTrigger>
                              </label>
                            </div>
                          </div>
                        )}
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="outOfStockWarning"
                            checked={outOfStockWarning}
                            onChange={(e) => setOutOfStockWarning(e.target.checked)}
                          />
                          <label className="form-check-label d-flex align-items-center gap-1" htmlFor="outOfStockWarning">
                            Show an Out of Stock warning when an item's stock drops below zero
                            <OverlayTrigger placement="right" overlay={<Tooltip>Displays a warning when stock goes below zero</Tooltip>}>
                              <i className="ti ti-info-circle text-muted fs-14" />
                            </OverlayTrigger>
                          </label>
                        </div>
                        <div
                          id="notify-reorder-section"
                          className="form-check mb-2 rounded"
                          style={{
                            transition: "background 0.4s ease",
                            background: flashReorder ? "rgba(255, 193, 7, 0.15)" : "transparent",
                            paddingTop: 8,
                            paddingBottom: 8,
                            marginTop: -8,
                            marginBottom: -8,
                          }}
                        >
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="notifyReorderPoint"
                            checked={notifyReorderPoint}
                            onChange={(e) => setNotifyReorderPoint(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="notifyReorderPoint">
                            Notify me if an item's quantity reaches the reorder point
                          </label>
                        </div>
                        {notifyReorderPoint && (
                          <div className="ms-4 mb-3">
                            <label className="form-label text-danger fw-medium mb-1">
                              Notify to*
                            </label>
                            <div style={{ maxWidth: "280px" }}>
                              <CommonSelect
                                options={notifyEmailOptions}
                                className="select"
                                defaultValue={notifyEmailOptions.find((o) => o.value === notifyToEmail)}
                                onChange={(opt) => setNotifyToEmail(opt?.value ?? "")}
                              />
                              {fieldErrors.notify_to_email && (
                                <div className="text-danger small mt-1">{fieldErrors.notify_to_email}</div>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="trackLandedCost"
                            checked={trackLandedCost}
                            onChange={(e) => setTrackLandedCost(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="trackLandedCost">
                            Track landed cost on items
                          </label>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Field Customization Tab */}
                  {!loading && activeTab === "field" && (
                    <div className="p-4">
                      <div className="border-bottom mb-3 pb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <h5 className="mb-0 fs-17">Custom Fields</h5>
                        <Link
                          to="javascript:void(0)"
                          className="btn btn-primary btn-sm"
                          onClick={() => navigate(all_routes.productCustomField)}
                        >
                          <i className="ti ti-square-rounded-plus-filled me-1" />
                          Add New Field
                        </Link>
                      </div>

                      {/* Loading */}
                      {cfLoading && (
                        <div className="d-flex align-items-center gap-2 py-4 text-muted">
                          <div className="spinner-border spinner-border-sm text-primary" role="status" />
                          <span>Loading custom fields…</span>
                        </div>
                      )}

                      {/* Fetch error */}
                      {!cfLoading && cfFetchError && (
                        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3">
                          <i className="ti ti-alert-circle fs-16 flex-shrink-0" />
                          <span className="flex-grow-1">{cfFetchError}</span>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger ms-auto"
                            onClick={loadCustomFields}
                          >
                            Retry
                          </button>
                        </div>
                      )}

                      {/* Empty state */}
                      {!cfLoading && !cfFetchError && customFields.length === 0 && (
                        <div className="text-muted text-center py-5">
                          <i className="ti ti-layout-list fs-32 d-block mb-2 opacity-50" />
                          No custom fields yet. Click <strong>Add New Field</strong> to create one.
                        </div>
                      )}

                      {/* Table */}
                      {!cfLoading && !cfFetchError && customFields.length > 0 && (
                        <div className="table-responsive">
                          <table className="table table-nowrap">
                            <thead className="table-light">
                              <tr>
                                <th>Field Name</th>
                                <th>Data Type</th>
                                <th>Mandatory</th>
                                <th>Show in All PDFs</th>
                                <th>Status</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {customFields.map((cf) => {
                                const c = cf.config;
                                const isActing = cfActionId === cf.id;
                                return (
                                  <tr key={cf.id} style={{ opacity: isActing ? 0.5 : 1, transition: "opacity 0.2s" }}>
                                    <td>
                                      {c.is_system && <i className="ti ti-lock text-muted me-1 fs-14" />}
                                      {c.is_system
                                        ? c.label
                                        : <span className="text-primary">{c.label}</span>
                                      }
                                    </td>
                                    <td>{DATA_TYPE_LABELS[c.data_type] ?? c.data_type}</td>
                                    <td>
                                      <div className="form-check form-switch p-0">
                                        <label className="form-check-label d-flex align-items-center justify-content-center">
                                          <input
                                            className="form-check-input switchCheckDefault"
                                            type="checkbox"
                                            role="switch"
                                            checked={c.is_system ? true : c.is_mandatory}
                                            disabled={c.is_system || isActing}
                                            onChange={() => !c.is_system && handleCfAction(cf, { is_mandatory: !c.is_mandatory })}
                                          />
                                        </label>
                                      </div>
                                    </td>
                                    <td>{c.show_in_all_pdfs ? "Yes" : "No"}</td>
                                    <td>
                                      <span className={c.is_active ? "badge badge-tag badge-soft-success" : "badge badge-tag badge-soft-secondary"}>
                                        {c.is_active ? "Active" : "Inactive"}
                                      </span>
                                    </td>
                                    <td>
                                      <div className="dropdown table-action">
                                        <Link
                                          to="#"
                                          className="action-icon btn btn-xs shadow d-inline-flex btn-outline-light"
                                          data-bs-toggle="dropdown"
                                          aria-expanded="false"
                                        >
                                          <i className="ti ti-chevron-down" />
                                        </Link>
                                        <div className="dropdown-menu dropdown-menu-right dropmenu-item-danger">
                                          {!c.is_system && (
                                            <button
                                              className="dropdown-item d-flex align-items-center"
                                              onClick={() => navigate(all_routes.productCustomFieldEdit.replace(":id", String(cf.id)))}
                                              disabled={isActing}
                                            >
                                              Edit
                                            </button>
                                          )}
                                          <button
                                            className="dropdown-item d-flex align-items-center"
                                            onClick={() => handleCfAction(cf, { is_active: !c.is_active })}
                                            disabled={isActing}
                                          >
                                            {c.is_active ? "Mark as Inactive" : "Mark as Active"}
                                          </button>
                                          <button
                                            className="dropdown-item d-flex align-items-center"
                                            onClick={() => handleCfAction(cf, { show_in_all_pdfs: !c.show_in_all_pdfs })}
                                            disabled={isActing}
                                          >
                                            {c.show_in_all_pdfs ? "Hide in all PDF" : "Show in All PDFs"}
                                          </button>
                                          {!c.is_system && (
                                            <button
                                              className="dropdown-item d-flex align-items-center"
                                              onClick={() => openDeleteModal(cf)}
                                              disabled={isActing}
                                            >
                                              Delete
                                            </button>
                                          )}
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

        {/* ══ Sticky Save bar — General tab only ═══════════════════ */}
        {activeTab === "general" && (
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
                  Saving…
                </>
              ) : "Save"}
            </button>
          </div>
        )}

        <Footer />
      </div>

      {/* Inventory Tracking Preferences Modal */}
      <Modal show={showTrackingModal} onHide={() => setShowTrackingModal(false)} centered>
        <Modal.Header className="border-bottom px-4 py-3">
          <Modal.Title className="fs-16 fw-semibold">Inventory Tracking Preferences</Modal.Title>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowTrackingModal(false)}
            aria-label="Close"
          />
        </Modal.Header>
        <Modal.Body className="px-4 py-4">
          <p className="text-muted mb-3">
            Choose the transactions in which you prefer to track your inventory:
          </p>
          <CommonSelect
            options={trackingOptions}
            className="select mb-4"
            defaultValue={trackingOptions.find((o) => o.value === modalTrackedIn)}
            onChange={(opt) => setModalTrackedIn(opt?.value ?? "packages")}
          />
          <p className="text-success small fw-medium mb-2">
            You can add the serial and batch details while:
          </p>
          <ul className="list-unstyled mb-0">
            {(trackingBullets[modalTrackedIn] ?? []).map((bullet) => (
              <li key={bullet} className="d-flex align-items-center gap-2 mb-2">
                <i className="ti ti-circle-check-filled text-success fs-16 flex-shrink-0" />
                <span className="text-muted">{bullet}</span>
              </li>
            ))}
          </ul>
          <hr className="my-3" />
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="modalMandate"
              checked={modalMandate}
              onChange={(e) => setModalMandate(e.target.checked)}
            />
            <label className="form-check-label text-muted" htmlFor="modalMandate">
              Mandate serial number or batch tracking in transactions.
            </label>
          </div>
        </Modal.Body>
        <Modal.Footer className="px-4 py-3 border-top d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-sm btn-light me-2"
            onClick={() => setShowTrackingModal(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => {
              setTrackedInValue(modalTrackedIn);
              setMandatoryTracking(modalMandate);
              setShowTrackingModal(false);
            }}
          >
            Update
          </button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notifications */}
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
              className={`d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 ${
                toast.type === "success"
                  ? "bg-success"
                  : toast.type === "danger"
                  ? "bg-danger"
                  : "bg-warning"
              }`}
              style={{ width: "36px", height: "36px" }}
            >
              <i
                className={`ti fs-16 text-white ${
                  toast.type === "success"
                    ? "ti-check"
                    : toast.type === "danger"
                    ? "ti-x"
                    : "ti-alert-triangle"
                }`}
              />
            </span>
            <span className="fw-medium fs-14">{toast.message}</span>
          </Toast.Body>
        </Toast>
      </div>

      {/* Delete Custom Field Modal */}
      <Modal
        show={deleteModal.show}
        onHide={() => !deleteModal.deleting && setDeleteModal((m) => ({ ...m, show: false }))}
        centered
        size="md"
      >
        <Modal.Body className="p-5">
          <div className="text-center">
            <div className="mb-4">
              <span
                className="avatar badge-soft-danger border-0 text-danger rounded-circle d-inline-flex align-items-center justify-content-center"
                style={{ width: 72, height: 72 }}
              >
                <i className="ti ti-trash" style={{ fontSize: 34 }} />
              </span>
            </div>
            <h3 className="mb-3 fw-semibold">Delete Confirmation</h3>
            <p className="mb-0 text-muted fs-15">
              Are you sure you want to delete <strong>{deleteModal.field?.config.label}</strong>?
              This cannot be undone.
            </p>
            <div className="d-flex align-items-center justify-content-center gap-3 mt-5">
              <button
                type="button"
                className="btn btn-cancel px-5 py-2 fs-15"
                onClick={() => setDeleteModal((m) => ({ ...m, show: false }))}
                disabled={deleteModal.deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger px-5 py-2 fs-15"
                onClick={handleDeleteConfirm}
                disabled={deleteModal.deleting}
              >
                {deleteModal.deleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" />
                    Deleting…
                  </>
                ) : "Yes, Delete"}
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ProjectSettings;
