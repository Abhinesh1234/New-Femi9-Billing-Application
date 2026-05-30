import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setProductSettings } from "../../../../core/redux/productSettingsSlice";
import dayjs, { Dayjs } from "dayjs";
import { Modal, OverlayTrigger, Toast, Tooltip } from "react-bootstrap";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import CommonSelect from "../../../../components/common-select/commonSelect";
import CommonDatePicker from "../../../../components/common-datePicker/commonDatePicker";
import ReactSelect from "react-select";
import { Link, useSearchParams } from "react-router";
import { Input_Type, Module } from "../../../../core/json/selectOption";
import { all_routes } from "../../../../routes/all_routes";
import {
  validateProductSettings,
  type ProductConfiguration,
  type ValidationErrors,
} from "../../../../core/services/settingApi";
import {
  getSettings,
  updateSettings,
  bustSettings,
} from "../../../../core/cache/settingCache";
import FieldCustomizationTab from "../../../../components/field-customization/FieldCustomizationTab";
import { fetchUsers } from "../../../../core/services/userApi";

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
  notify_to_user_ids: [],
  track_landed_cost: false,
};

const ProjectSettings = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"general" | "field">(
    searchParams.get("tab") === "field" ? "field" : "general"
  );

  const handleTabChange = useCallback((tab: "general" | "field") => {
    setActiveTab(tab);
    setFieldErrors({});
  }, []);

  const [loading, setLoading]         = useState(true);
  const [loadError, setLoadError]     = useState<string | null>(null);
  const [saving, setSaving]           = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [cfRefreshKey, setCfRefreshKey] = useState(0);
  const cfRefreshResolveRef = useRef<(() => void) | null>(null);

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
  const [notifyToUserIds, setNotifyToUserIds] = useState<number[]>([]);
  const [flashReorder, setFlashReorder] = useState(false);
  const [companyUserOptions, setCompanyUserOptions] = useState<{ value: string; label: string }[]>([]);


  // ── Load company users for notify-to multi-select ────────────────────────
  useEffect(() => {
    fetchUsers().then((result) => {
      setCompanyUserOptions(
        result.data.map((u) => ({
          value: String(u.id),
          label: u.email ? `${u.name} (${u.email})` : u.name,
        }))
      );
    }).catch(() => {});
  }, []);

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

  // ── Load saved settings ──────────────────────────────────────────────────
  const applyConfig = (c: ProductConfiguration) => {
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
    setNotifyToUserIds(c.notify_to_user_ids ?? []);
    setTrackLandedCost(c.track_landed_cost);
  };

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const c = await getSettings<ProductConfiguration>("products");
      applyConfig(c);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load settings.");
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const handleRefresh = useCallback((): Promise<void> | void => {
    if (activeTab === "field") {
      return new Promise<void>((resolve) => {
        cfRefreshResolveRef.current = resolve;
        setCfRefreshKey((k) => k + 1);
      });
    }
    bustSettings("products");
    return loadSettings();
  }, [activeTab, loadSettings]);

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
    notify_to_user_ids: notifyReorderPoint ? notifyToUserIds : [],
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

    try {
      const res = await updateSettings<ProductConfiguration>("products", payload);
      if (res.success) {
        if (res.configuration) {
          applyConfig(res.configuration);
          dispatch(setProductSettings({
            enableCompositeItems: res.configuration.enable_composite_items ?? false,
            enablePriceLists:     res.configuration.enable_price_lists     ?? false,
          }));
        }
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
        showToast("danger", res.message);
      }
    } catch {
      showToast("danger", "Network error. Please check your connection and try again.");
    } finally {
      setSaving(false);
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
            onRefresh={handleRefresh}
          />
          <div className="row">
            <div className="col-12">
              <div className="card mb-0">
                <div className="card-body p-0">

                  {/* Internal Tabs */}
                  <div className="px-4 pt-3 pb-3">
                    <div className="d-inline-flex rounded" style={{ background: "#f1f3f5", padding: 4, gap: 2 }}>
                      {([
                        { key: "general" as const, label: "General" },
                        { key: "field"   as const, label: "Field Customization" },
                      ] as const).map(t => {
                        const isActive = activeTab === t.key;
                        return (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() => handleTabChange(t.key)}
                            style={{
                              padding: "9px 20px", borderRadius: 6, border: "none",
                              background: isActive ? "#fff" : "transparent",
                              color: isActive ? "#e03131" : "#6c757d",
                              fontWeight: isActive ? 600 : 400,
                              fontSize: 14,
                              boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                              transition: "all 0.15s", cursor: "pointer", whiteSpace: "nowrap",
                            }}
                          >
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Loading overlay */}

                  {/* Settings load error */}
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

                  {/* General Tab */}
                  {!loading && !loadError && activeTab === "general" && (
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
                            <div style={{ maxWidth: "480px" }}>
                              <ReactSelect
                                isMulti
                                options={companyUserOptions}
                                value={companyUserOptions.filter((o) => notifyToUserIds.includes(Number(o.value)))}
                                onChange={(selected) =>
                                  setNotifyToUserIds(selected ? selected.map((o) => Number(o.value)) : [])
                                }
                                placeholder="Select users to notify..."
                                classNamePrefix="react-select"
                                styles={{
                                  menu: (b) => ({ ...b, zIndex: 9999 }),
                                  menuPortal: (b) => ({ ...b, zIndex: 9999 }),
                                  option: (b, s) => ({
                                    ...b,
                                    backgroundColor: s.isSelected ? "#E41F07" : s.isFocused ? "white" : "white",
                                    color: s.isSelected ? "#fff" : s.isFocused ? "#E41F07" : "#707070",
                                    cursor: "pointer",
                                    "&:hover": { backgroundColor: "#E41F07", color: "#fff" },
                                  }),
                                }}
                              />
                              {fieldErrors.notify_to_user_ids && (
                                <div className="text-danger small mt-1">{fieldErrors.notify_to_user_ids}</div>
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
                  {!loading && !loadError && activeTab === "field" && (
                    <FieldCustomizationTab
                      module="products"
                      addRoute={all_routes.productCustomField}
                      editRoute={all_routes.productCustomFieldEdit}
                      refreshKey={cfRefreshKey}
                      onRefreshDone={() => { cfRefreshResolveRef.current?.(); cfRefreshResolveRef.current = null; }}
                      onToast={showToast}
                    />
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
              className="btn btn-primary me-2"
              onClick={handleSave}
              disabled={saving || loading}
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
      <Modal show={showTrackingModal} onHide={() => setShowTrackingModal(false)} centered backdropClassName="blurred-backdrop">
        <Modal.Header closeButton={false} style={{ padding: "20px 24px 18px", borderBottom: "1px solid #f1f5f9", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className="ti ti-settings fs-18" style={{ color: "#ef4444" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 16, color: "#0f172a" }}>Inventory Tracking Preferences</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowTrackingModal(false)}
            style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #fecaca", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}
          >
            <i className="ti ti-x" style={{ fontSize: 14, color: "#ef4444", lineHeight: 1 }} />
          </button>
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
        <Modal.Footer style={{ padding: "14px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            type="button"
            className="btn btn-outline-light"
            onClick={() => setShowTrackingModal(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
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

    </>
  );
};

export default ProjectSettings;
