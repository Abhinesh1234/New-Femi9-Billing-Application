import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Modal, OverlayTrigger, Toast, Tooltip } from "react-bootstrap";
import { fetchPriceList, storePriceList, updatePriceList } from "../../../../core/services/priceListApi";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import { all_routes } from "../../../../routes/all_routes";
import CommonSelect, { type Option } from "../../../../components/common-select/commonSelect";

const route = all_routes;

type TransactionType  = "sales" | "purchase" | "both";
type PriceListScope   = "all_items" | "individual_items";
type PricingScheme    = "unit" | "volume";
type AdjustmentMethod = "markup" | "markdown";

const currencyOptions = [
  "INR - Indian Rupee",
  "USD - US Dollar",
  "EUR - Euro",
  "GBP - British Pound",
  "AED - UAE Dirham",
  "SGD - Singapore Dollar",
  "AUD - Australian Dollar",
];

const roundOffOptions = ["Never mind", "Nearest whole number", "0.99", "0.50", "0.49", "Decimal Places"];

const adjMethodOpts: Option[]  = [
  { value: "markup",   label: "Markup"   },
  { value: "markdown", label: "Markdown" },
];
const roundOffOpts: Option[]   = roundOffOptions.map((o) => ({ value: o, label: o }));
const currencyOpts: Option[]   = currencyOptions.map((c) => ({ value: c, label: c }));

const customerCategoryOpts: Option[] = [
  { value: "retail",     label: "Retail"     },
  { value: "wholesale",  label: "Wholesale"  },
  { value: "vip",        label: "VIP"        },
  { value: "corporate",  label: "Corporate"  },
  { value: "distributor",label: "Distributor"},
];

// Example input used in the Rounding Examples dialog
const ROUND_EXAMPLE_INPUT = "1000.678";
const roundingExamples = [
  { option: "Never mind",           label: "Never mind",           result: "1000.678" },
  { option: "Nearest whole number", label: "Nearest whole number", result: "1001"     },
  { option: "0.99",                 label: "0.99",                 result: "1000.89"  },
  { option: "0.50",                 label: "0.50",                 result: "1000.50"  },
  { option: "0.49",                 label: "0.49",                 result: "1000.58"  },
  { option: "Decimal Places",       label: "Decimal Places (2dp)", result: "1000.68"  },
];

interface RangeRow {
  id: number;
  startQty: string;
  endQty: string;
  customRate: string;
  discount: string;
}

interface BulkItem {
  id: number;
  code: string;
  salesRate: number;
  customRate: string;
  discount: string;
  ranges: RangeRow[];
  /** Previously saved custom_rate for this item in this price list (edit mode) */
  oldCustomRate?: string;
  /** Previously saved discount for this item in this price list (edit mode) */
  oldDiscount?: string;
}

let _nextRangeId = 1;
const mkRange = (): RangeRow => ({ id: _nextRangeId++, startQty: "", endQty: "", customRate: "", discount: "" });

const NewPriceList = () => {
  const navigate = useNavigate();
  const { id }        = useParams<{ id: string }>();
  const isEditMode    = Boolean(id);
  const editId        = id ? parseInt(id, 10) : null;

  const [editLoading, setEditLoading] = useState(isEditMode);

  // ── Fields ────────────────────────────────────────────────────────────────
  const [name,            setName]            = useState("");
  const [transactionType,   setTransactionType]   = useState<TransactionType>("sales");
  const [customerCategory,  setCustomerCategory]  = useState<string | null>(null);
  const [priceListScope,    setPriceListScope]     = useState<PriceListScope>("all_items");
  const [description,     setDescription]     = useState("");

  // All Items fields
  const [adjMethod,   setAdjMethod]   = useState<AdjustmentMethod>("markup");
  const [percentage,  setPercentage]  = useState("");
  const [roundOff,    setRoundOff]    = useState("Never mind");

  // Individual Items fields
  const [pricingScheme,   setPricingScheme]   = useState<PricingScheme>("unit");
  const [currency,        setCurrency]        = useState("INR - Indian Rupee");
  const [includeDiscount, setIncludeDiscount] = useState(false);
  const [importPriceList, setImportPriceList] = useState(false);
  const [adminOnly,       setAdminOnly]       = useState(false);

  // ── Bulk items (sample — will come from API) ──────────────────────────────
  const [items, setItems] = useState<BulkItem[]>(() => [
    { id: 1, code: "330", salesRate: 100.00, customRate: "", discount: "", ranges: [mkRange()] },
    { id: 2, code: "290", salesRate: 200.00, customRate: "", discount: "", ranges: [mkRange()] },
    { id: 3, code: "410", salesRate: 249.00, customRate: "", discount: "", ranges: [mkRange()] },
  ]);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showRoundingExamples, setShowRoundingExamples] = useState(false);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger"; message: string }>({
    show: false, type: "success", message: "",
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (type: "success" | "danger", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
  };

  const clr = (key: string) =>
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });

  // ── Populate form when in edit mode ──────────────────────────────────────
  useEffect(() => {
    if (!isEditMode || !editId) return;
    (async () => {
      setEditLoading(true);
      const res = await fetchPriceList(editId);
      if (res.success) {
        const d = (res as any).data;
        const s = d.settings ?? {};
        setName(d.name ?? "");
        setTransactionType(d.transaction_type ?? "sales");
        setCustomerCategory(d.customer_category_id ? String(d.customer_category_id) : null);
        setPriceListScope(d.price_list_type ?? "all_items");
        setDescription(d.description ?? "");
        setAdminOnly(d.admin_only ?? false);
        // all_items settings
        if (d.price_list_type === "all_items") {
          setAdjMethod(s.adjustment_method ?? "markup");
          setPercentage(s.percentage != null ? String(s.percentage) : "");
          setRoundOff(s.round_off ?? "Never mind");
        }
        // individual_items settings
        if (d.price_list_type === "individual_items") {
          setPricingScheme(s.pricing_scheme ?? "unit");
          setCurrency(s.currency ?? "INR - Indian Rupee");
          setIncludeDiscount(s.include_discount ?? false);
        }

        // Populate saved prices into the items table
        if (d.price_list_type === "individual_items" && Array.isArray(d.items) && d.items.length > 0) {
          const savedByItemId = new Map<number, any>(
            d.items.map((pi: any) => [Number(pi.item_id), pi])
          );
          setItems((prev) => prev.map((item) => {
            const saved = savedByItemId.get(item.id);
            if (!saved) return item;

            const oldCustomRate = saved.custom_rate != null
              ? String(parseFloat(String(saved.custom_rate))) : "";
            const oldDiscount = saved.discount != null
              ? String(parseFloat(String(saved.discount))) : "";

            const ranges: RangeRow[] =
              Array.isArray(saved.volume_ranges) && saved.volume_ranges.length > 0
                ? saved.volume_ranges.map((r: any) => ({
                    id:         _nextRangeId++,
                    startQty:   r.start_qty   != null ? String(r.start_qty)                    : "",
                    endQty:     r.end_qty     != null ? String(r.end_qty)                      : "",
                    customRate: r.custom_rate != null ? String(parseFloat(String(r.custom_rate))) : "",
                    discount:   r.discount    != null ? String(parseFloat(String(r.discount)))    : "",
                  }))
                : [mkRange()];

            return {
              ...item,
              customRate:    oldCustomRate,
              discount:      oldDiscount,
              ranges,
              oldCustomRate,
              oldDiscount,
            };
          }));
        }
      } else {
        showToast("danger", (res as any).message ?? "Failed to load price list.");
      }
      setEditLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  // ── Item helpers ──────────────────────────────────────────────────────────
  const updateItem = (itemId: number, field: "customRate" | "discount", val: string) =>
    setItems((p) => p.map((i) => i.id === itemId ? { ...i, [field]: val } : i));

  const addRange = (itemId: number) =>
    setItems((p) => p.map((i) => i.id === itemId ? { ...i, ranges: [...i.ranges, mkRange()] } : i));

  const removeRange = (itemId: number, rangeId: number) =>
    setItems((p) => p.map((i) => i.id === itemId
      ? { ...i, ranges: i.ranges.filter((r) => r.id !== rangeId) } : i));

  const updateRange = (itemId: number, rangeId: number, field: keyof Omit<RangeRow, "id">, val: string) =>
    setItems((p) => p.map((i) => i.id === itemId
      ? { ...i, ranges: i.ranges.map((r) => r.id === rangeId ? { ...r, [field]: val } : r) } : i));

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required.";
    if (priceListScope === "all_items" && !percentage) errs.percentage = "Percentage is required.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) showToast("danger", Object.values(errs)[0]);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name,
        transaction_type:      transactionType,
        customer_category_id:  customerCategory ? parseInt(customerCategory, 10) : null,
        price_list_type:       priceListScope,
        description:           description || null,
        is_active:             true,
        admin_only:            adminOnly,

        // Type-specific settings go into the JSON column
        settings: priceListScope === "all_items"
          ? { adjustment_method: adjMethod, percentage: parseFloat(percentage) || 0, round_off: roundOff }
          : { pricing_scheme: pricingScheme, currency, include_discount: includeDiscount },

        // Item rows only for individual_items
        items: priceListScope === "individual_items"
          ? items.map((item) => ({
              item_id:       item.id,
              custom_rate:   item.customRate  || null,
              discount:      item.discount    || null,
              volume_ranges: pricingScheme === "volume"
                ? item.ranges.map((r) => ({
                    start_qty:   r.startQty,
                    end_qty:     r.endQty,
                    custom_rate: r.customRate,
                    discount:    r.discount || null,
                  }))
                : null,
            }))
          : [],
      };

      const res = isEditMode && editId
        ? await updatePriceList(editId, payload)
        : await storePriceList(payload);

      if (res.success) {
        showToast("success", isEditMode ? "Price list updated successfully." : "Price list saved successfully.");
        setTimeout(() => navigate(isEditMode ? `/price-list/${editId}` : route.priceList), 1200);
      } else {
        showToast("danger", res.message || "Failed to save price list.");
        if ("errors" in res && res.errors) {
          const apiErrs: Record<string, string> = {};
          Object.entries(res.errors).forEach(([key, msgs]) => {
            if (key === "name")                 apiErrs.name       = msgs[0];
            if (key === "settings.percentage")  apiErrs.percentage = msgs[0];
          });
          if (Object.keys(apiErrs).length > 0) setErrors((prev) => ({ ...prev, ...apiErrs }));
        }
      }
    } catch {
      showToast("danger", "Failed to save price list.");
    } finally {
      setSaving(false);
    }
  };

  const goBack = () =>
    window.history.length > 1 ? navigate(-1) : navigate(route.priceList);

  if (editLoading) {
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

  return (
    <>
      <div className="page-wrapper">
        <div className="content">

          <PageHeader
            title={isEditMode ? "Edit Price List" : "New Price List"}
            showModuleTile={false}
            showExport={false}
            showClose
            onClose={goBack}
          />

          <div className="card mb-0">
            <div className="card-body p-4">

              {/* ── Name ────────────────────────────────────────────── */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label text-danger fw-medium fs-14">
                  Name <span>*</span>
                </label>
                <div className="col-sm-4">
                  <input
                    type="text"
                    className={`form-control${errors.name ? " is-invalid" : ""}`}
                    value={name}
                    onChange={(e) => { setName(e.target.value); clr("name"); }}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
              </div>

              {/* ── Transaction Type ─────────────────────────────────── */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label fw-medium fs-14">Transaction Type</label>
                <div className="col-sm-10">
                  <div className="d-flex align-items-center gap-4">
                    {(["sales", "purchase", "both"] as TransactionType[]).map((t) => (
                      <div key={t} className="form-check mb-0">
                        <input
                          className="form-check-input"
                          type="radio"
                          id={`txn_${t}`}
                          name="transactionType"
                          checked={transactionType === t}
                          onChange={() => setTransactionType(t)}
                        />
                        <label className="form-check-label fw-medium fs-14" htmlFor={`txn_${t}`}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Customer Category ───────────────────────────────── */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label fw-medium fs-14" style={{ whiteSpace: "nowrap" }}>Customer Category</label>
                <div className="col-sm-4">
                  <CommonSelect
                    options={customerCategoryOpts}
                    value={customerCategoryOpts.find((o) => o.value === customerCategory) ?? null}
                    onChange={(opt) => setCustomerCategory(opt ? opt.value : null)}
                    placeholder="Select category"
                    isClearable
                  />
                </div>
              </div>

              {/* ── Price List Type (cards) ──────────────────────────── */}
              <div className="row mb-3 align-items-start">
                <label className="col-sm-2 col-form-label fw-medium fs-14">Price List Type</label>
                <div className="col-sm-10">
                  <div className="d-flex align-items-stretch gap-3">
                    {([
                      {
                        value: "all_items" as PriceListScope,
                        title: "All Items",
                        sub: "Mark up or mark down the rates of all items",
                      },
                      {
                        value: "individual_items" as PriceListScope,
                        title: "Individual Items",
                        sub: "Customize the rate of each item",
                      },
                    ]).map((opt) => {
                      const active = priceListScope === opt.value;
                      return (
                        <div
                          key={opt.value}
                          onClick={() => setPriceListScope(opt.value)}
                          style={{
                            border: `2px solid ${active ? "var(--bs-danger, #dc3545)" : "#dee2e6"}`,
                            borderRadius: 8,
                            padding: "12px 16px",
                            cursor: "pointer",
                            background: active ? "rgba(220,53,69,0.04)" : "#fff",
                            minWidth: 220,
                            transition: "all .15s",
                          }}
                        >
                          <div className="d-flex align-items-start gap-2">
                            <span
                              className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                              style={{
                                width: 20, height: 20, marginTop: 2,
                                background: active ? "var(--bs-danger, #dc3545)" : "#dee2e6",
                                transition: "background .15s",
                              }}
                            >
                              <i className="ti ti-check text-white" style={{ fontSize: 11 }} />
                            </span>
                            <div>
                              <div className="fw-semibold fs-14" style={{ color: active ? "var(--bs-danger, #dc3545)" : "#495057" }}>
                                {opt.title}
                              </div>
                              <div className="text-muted fs-12 mt-1">{opt.sub}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── Description ──────────────────────────────────────── */}
              <div className="row mb-3 align-items-start">
                <label className="col-sm-2 col-form-label fw-medium fs-14">Description</label>
                <div className="col-sm-4">
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Enter the description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* ── Admin Only ───────────────────────────────────────── */}
              <div className="row mb-3 align-items-center">
                <div className="col-sm-2" />
                <div className="col-sm-10">
                  <div className="form-check mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="admin_only"
                      checked={adminOnly}
                      onChange={(e) => setAdminOnly(e.target.checked)}
                    />
                    <label className="form-check-label fw-medium fs-14" htmlFor="admin_only">
                      Use this price list for admins only
                    </label>
                    <div className="fs-12 text-muted mt-1">
                      When enabled, this price list will only be visible to admin users.
                    </div>
                  </div>
                </div>
              </div>

              {/* ══ ALL ITEMS: Percentage + Round Off ════════════════ */}
              {priceListScope === "all_items" && (
                <>
                  {/* Percentage */}
                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-2 col-form-label text-danger fw-medium fs-14">
                      Percentage <span>*</span>
                    </label>
                    <div className="col-sm-4">
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 140, flexShrink: 0 }}>
                          <CommonSelect
                            options={adjMethodOpts}
                            value={adjMethodOpts.find((o) => o.value === adjMethod) ?? null}
                            onChange={(opt) => opt && setAdjMethod(opt.value as AdjustmentMethod)}
                          />
                        </div>
                        <div className="input-group" style={{ flex: 1 }}>
                          <input
                            type="number"
                            className={`form-control${errors.percentage ? " is-invalid" : ""}`}
                            placeholder="0.00"
                            min={0}
                            value={percentage}
                            onChange={(e) => { setPercentage(e.target.value); clr("percentage"); }}
                          />
                          <span className="input-group-text bg-white fs-14">%</span>
                          {errors.percentage && <div className="invalid-feedback">{errors.percentage}</div>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Round Off To */}
                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-2 col-form-label text-danger fw-medium fs-14">
                      Round Off To <span>*</span>
                    </label>
                    <div className="col-sm-4">
                      <CommonSelect
                        options={roundOffOpts}
                        value={roundOffOpts.find((o) => o.value === roundOff) ?? null}
                        onChange={(opt) => opt && setRoundOff(opt.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-link p-0 fs-14 text-danger d-inline-block mt-1"
                        style={{ textDecoration: "none" }}
                        onClick={() => setShowRoundingExamples(true)}
                      >
                        View Examples
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ══ INDIVIDUAL ITEMS: Scheme + Currency + Discount + Table */}
              {priceListScope === "individual_items" && (
                <>
                  {/* Pricing Scheme */}
                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-2 col-form-label fw-medium fs-14">Pricing Scheme</label>
                    <div className="col-sm-10">
                      <div className="d-flex align-items-center gap-4">
                        {([
                          { value: "unit"   as PricingScheme, label: "Unit Pricing"   },
                          { value: "volume" as PricingScheme, label: "Volume Pricing" },
                        ]).map((opt) => (
                          <div key={opt.value} className="form-check mb-0 d-flex align-items-center gap-1">
                            <input
                              className="form-check-input"
                              type="radio"
                              id={`scheme_${opt.value}`}
                              name="pricingScheme"
                              checked={pricingScheme === opt.value}
                              onChange={() => setPricingScheme(opt.value)}
                            />
                            <label className="form-check-label fw-medium fs-14" htmlFor={`scheme_${opt.value}`}>
                              {opt.label}
                            </label>
                            {opt.value === "volume" && (
                              <OverlayTrigger
                                placement="right"
                                overlay={<Tooltip>Define different rates for different quantity ranges</Tooltip>}
                              >
                                <i className="ti ti-info-circle text-muted fs-14 ms-1" />
                              </OverlayTrigger>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Currency */}
                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-2 col-form-label fw-medium fs-14">Currency</label>
                    <div className="col-sm-4">
                      <CommonSelect
                        options={currencyOpts}
                        value={currencyOpts.find((o) => o.value === currency) ?? null}
                        onChange={(opt) => opt && setCurrency(opt.value)}
                      />
                    </div>
                  </div>

                  {/* Discount */}
                  <div className="row mb-4 align-items-start">
                    <label className="col-sm-2 col-form-label fw-medium fs-14">Discount</label>
                    <div className="col-sm-10">
                      <div className="form-check mb-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="include_discount"
                          checked={includeDiscount}
                          onChange={() => setIncludeDiscount((v) => !v)}
                        />
                        <label className="form-check-label fs-14" htmlFor="include_discount">
                          I want to include discount percentage for the items
                        </label>
                      </div>
                      {includeDiscount && (
                        <div className="d-flex align-items-start gap-2 mt-2 text-muted fs-14">
                          <i className="ti ti-info-circle fs-14 flex-shrink-0 mt-1" />
                          <span>
                            When a price list is applied, the discount percentage will be applied only if
                            discount is enabled at the line-item level.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Customise Rates in Bulk ────────────────────── */}
                  <div className="border-top pt-4">

                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <h6 className="fw-semibold fs-14 mb-0">Customise Rates in Bulk</h6>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fs-14 text-muted">Import Price List for Items</span>
                        <div className="form-check form-switch mb-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="import_price_list"
                            checked={importPriceList}
                            onChange={() => setImportPriceList((v) => !v)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <button
                        type="button"
                        className="btn btn-link p-0 fs-14 text-danger d-flex align-items-center gap-1"
                        style={{ textDecoration: "none" }}
                      >
                        <i className="ti ti-circle-plus fs-15" />
                        Update Rates in Bulk
                      </button>
                    </div>

                    {/* Table */}
                    <div className="table-responsive">
                      <table
                        className="table table-borderless align-middle mb-0"
                        style={{ minWidth: 600, tableLayout: "fixed", width: "100%" }}
                      >
                        <thead>
                          <tr style={{
                            fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                            color: "#888", letterSpacing: "0.05em", borderBottom: "1px solid #f0f0f0",
                          }}>
                            <th style={{ paddingBottom: 10 }}>Item Details</th>
                            <th style={{ paddingBottom: 10, width: 150, textAlign: "right" }}>Sales Rate</th>
                            {pricingScheme === "volume" && (
                              <th style={{ paddingBottom: 10, width: 120 }}>Start Qty</th>
                            )}
                            {pricingScheme === "volume" && (
                              <th style={{ paddingBottom: 10, width: 120 }}>End Qty</th>
                            )}
                            <th style={{ paddingBottom: 10, width: 160 }}>Custom Rate</th>
                            {includeDiscount && (
                              <th style={{ paddingBottom: 10, width: 140 }}>
                                Discount (%)
                                <OverlayTrigger placement="top" overlay={<Tooltip>Discount % to apply for this item in this price list</Tooltip>}>
                                  <i className="ti ti-info-circle text-muted fs-14 ms-1" />
                                </OverlayTrigger>
                              </th>
                            )}
                          </tr>
                        </thead>

                        <tbody>
                          {pricingScheme === "unit"
                            ? items.map((item) => (
                              <tr key={item.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                                <td className="fs-14" style={{ paddingTop: 8, paddingBottom: 8 }}>{item.code}</td>
                                <td className="fs-14 text-end" style={{ paddingTop: 8, paddingBottom: 8 }}>
                                  ₹{item.salesRate.toFixed(2)}
                                </td>
                                <td style={{ paddingTop: 8, paddingBottom: 8 }}>
                                  <div className="input-group">
                                    <span className="input-group-text bg-white fs-14">₹</span>
                                    <input
                                      type="number"
                                      className="form-control fs-14"
                                      placeholder="0.00"
                                      value={item.customRate}
                                      onChange={(e) => updateItem(item.id, "customRate", e.target.value)}
                                    />
                                  </div>
                                </td>
                                {includeDiscount && (
                                  <td style={{ paddingTop: 8, paddingBottom: 8 }}>
                                    <input
                                      type="number"
                                      className="form-control fs-14"
                                      placeholder="0.00"
                                      value={item.discount}
                                      onChange={(e) => updateItem(item.id, "discount", e.target.value)}
                                    />
                                  </td>
                                )}
                              </tr>
                            ))
                            : items.flatMap((item) => [
                              ...item.ranges.map((range, ri) => (
                                <tr key={`${item.id}-${range.id}`} style={{ borderBottom: "1px solid #f5f5f5" }}>
                                  {ri === 0 && (
                                    <>
                                      <td className="fs-14" rowSpan={item.ranges.length + 1} style={{ verticalAlign: "top", paddingTop: 10 }}>
                                        {item.code}
                                      </td>
                                      <td className="fs-14 text-end" rowSpan={item.ranges.length + 1} style={{ verticalAlign: "top", paddingTop: 10 }}>
                                        ₹{item.salesRate.toFixed(2)}
                                      </td>
                                    </>
                                  )}
                                  <td style={{ paddingTop: 6, paddingBottom: 6 }}>
                                    <input
                                      type="number"
                                      className="form-control fs-14"
                                      placeholder="Qty"
                                      value={range.startQty}
                                      onChange={(e) => updateRange(item.id, range.id, "startQty", e.target.value)}
                                    />
                                  </td>
                                  <td style={{ paddingTop: 6, paddingBottom: 6 }}>
                                    <input
                                      type="number"
                                      className="form-control fs-14"
                                      placeholder="Qty"
                                      value={range.endQty}
                                      onChange={(e) => updateRange(item.id, range.id, "endQty", e.target.value)}
                                    />
                                  </td>
                                  <td style={{ paddingTop: 6, paddingBottom: 6 }}>
                                    <div className="input-group">
                                      <span className="input-group-text bg-white fs-14">₹</span>
                                      <input
                                        type="number"
                                        className="form-control fs-14"
                                        placeholder="0.00"
                                        value={range.customRate}
                                        onChange={(e) => updateRange(item.id, range.id, "customRate", e.target.value)}
                                      />
                                      {item.ranges.length > 1 && (
                                        <button
                                          type="button"
                                          className="btn btn-danger px-2"
                                          onClick={() => removeRange(item.id, range.id)}
                                          tabIndex={-1}
                                          title="Remove range"
                                        >
                                          <i className="ti ti-x fs-14" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                  {includeDiscount && (
                                    <td style={{ paddingTop: 6, paddingBottom: 6 }}>
                                      <input
                                        type="number"
                                        className="form-control fs-14"
                                        placeholder="0.00"
                                        value={range.discount}
                                        onChange={(e) => updateRange(item.id, range.id, "discount", e.target.value)}
                                      />
                                    </td>
                                  )}
                                </tr>
                              )),
                              <tr key={`add-${item.id}`} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                <td colSpan={includeDiscount ? 4 : 3} style={{ paddingTop: 6, paddingBottom: 10 }}>
                                  <button
                                    type="button"
                                    className="btn btn-link p-0 fs-14 text-danger d-flex align-items-center gap-1"
                                    style={{ textDecoration: "none" }}
                                    onClick={() => addRange(item.id)}
                                  >
                                    <i className="ti ti-circle-plus fs-14" />
                                    Add New Range
                                  </button>
                                </td>
                              </tr>,
                            ])
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* ── Save / Cancel ────────────────────────────────────── */}
              <div className="border-top pt-3 mt-4 d-flex align-items-center gap-2">
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
                  ) : (isEditMode ? "Update" : "Save")}
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

            </div>
          </div>

        </div>
        <Footer />
      </div>

      {/* ── Toast ───────────────────────────────────────────────── */}
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

      {/* ── Rounding Examples Modal ──────────────────────────────────────── */}
      <Modal
        show={showRoundingExamples}
        onHide={() => setShowRoundingExamples(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="px-4 py-3">
          <Modal.Title className="fs-18 fw-semibold">Rounding Examples</Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-0">
          <div className="px-4 pt-3 pb-3 border-bottom">
            <p className="text-muted fs-14 mb-0">
              The table below shows how a sample value of <strong>{ROUND_EXAMPLE_INPUT}</strong> is rounded for each option.
              The currently selected option is highlighted.
            </p>
          </div>

          <div className="px-4 pt-3 pb-4">
            <p className="text-uppercase text-muted fw-semibold fs-12 mb-3" style={{ letterSpacing: "0.06em" }}>
              Examples
            </p>
            <div className="table-responsive">
              <table
                className="table table-borderless mb-0"
                style={{ tableLayout: "fixed", width: "100%" }}
              >
                <colgroup>
                  <col style={{ width: "40%" }} />
                  <col style={{ width: "30%" }} />
                  <col style={{ width: "30%" }} />
                </colgroup>
                <thead>
                  <tr style={{
                    fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                    color: "#888", letterSpacing: "0.05em",
                    borderBottom: "1px solid #e9ecef",
                  }}>
                    <th className="pb-2" style={{ paddingLeft: 20 }}>Round Off To</th>
                    <th className="pb-2 text-end">Input Value</th>
                    <th className="pb-2 text-end">Rounded Value</th>
                  </tr>
                </thead>
                <tbody>
                  {roundingExamples.map(({ option, label, result }) => {
                    const isActive = roundOff === option;
                    return (
                      <tr
                        key={option}
                        style={{
                          borderBottom: "1px solid #f5f5f5",
                          background: isActive ? "rgba(220,53,69,0.04)" : "transparent",
                        }}
                      >
                        <td
                          className="py-2 fw-medium fs-14"
                          style={{ paddingLeft: 0, color: isActive ? "var(--bs-danger, #dc3545)" : "#495057" }}
                        >
                          {/* Fixed-width icon slot keeps text position consistent across all rows */}
                          <span style={{ display: "inline-block", width: 20, flexShrink: 0 }}>
                            {isActive && (
                              <i className="ti ti-check fs-13" style={{ color: "var(--bs-danger, #dc3545)" }} />
                            )}
                          </span>
                          {label}
                        </td>
                        <td className="py-2 text-end text-muted fs-14">{ROUND_EXAMPLE_INPUT}</td>
                        <td className="py-2 text-end fw-semibold fs-14">{result}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default NewPriceList;
