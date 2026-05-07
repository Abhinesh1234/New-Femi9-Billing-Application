import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Toast } from "react-bootstrap";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import CommonSelect, { Option } from "../../../../components/common-select/commonSelect";
import { all_routes } from "../../../../routes/all_routes";

const route = all_routes;

// ── Static data ───────────────────────────────────────────────────────────────

const countryOptions: Option[] = [
  { value: "IN", label: "India" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "SG", label: "Singapore" },
];

// ── Toggle card ───────────────────────────────────────────────────────────────

interface ToggleCardProps {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}

const ToggleCard = ({
  icon, iconBg, iconColor, title, description, checked, onChange,
}: ToggleCardProps) => (
  <div
    className="d-flex align-items-center justify-content-between border rounded p-3 mb-3"
    style={{ background: checked ? `${iconBg}` : "#fff", transition: "background 0.15s" }}
  >
    <div className="d-flex align-items-center gap-3">
      <span
        className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
        style={{ width: 48, height: 48, background: iconBg }}
      >
        <i className={`ti ${icon} fs-22`} style={{ color: iconColor }} />
      </span>
      <div>
        <div className="fw-semibold fs-14 mb-0">{title}</div>
        <div className="text-muted fs-13 mt-1">{description}</div>
      </div>
    </div>
    <div className="form-check form-switch ms-4 mb-0">
      <input
        className="form-check-input"
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ cursor: "pointer", width: 44, height: 22 }}
      />
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const NewCustomerCategory = () => {
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();
  const isEdit   = !!id;

  /* ── Page load ────────────────────────────────────────────────── */
  const [pageLoading, setPageLoading] = useState(true);

  /* ── Form fields ──────────────────────────────────────────────── */
  const [name,        setName]        = useState("");
  const [code,        setCode]        = useState("");
  const [description, setDescription] = useState("");

  /* ── Child / parent ───────────────────────────────────────────── */
  const [isChild,         setIsChild]         = useState(false);
  const [parentCategory,  setParentCategory]  = useState<Option | null>(null);
  const [parentOptions,   setParentOptions]   = useState<Option[]>([]);
  const [parentLevelMap,  setParentLevelMap]  = useState<Record<string, number>>({});

  /* ── Location link ────────────────────────────────────────────── */
  const [linkToLocation, setLinkToLocation] = useState(false);
  const [linkedCountry,  setLinkedCountry]  = useState<Option | null>(null);

  /* ── Toggles ──────────────────────────────────────────────────── */
  const [portalAccess,      setPortalAccess]      = useState(true);
  const [visibleInHierarchy, setVisibleInHierarchy] = useState(true);

  /* ── Computed level ───────────────────────────────────────────── */
  const computedLevel = isChild && parentCategory
    ? (parentLevelMap[parentCategory.value] ?? 1) + 1
    : 1;

  /* ── Validation ───────────────────────────────────────────────── */
  const [errors, setErrors] = useState<Record<string, string>>({});
  const clr = (key: string) =>
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });

  /* ── Saving / toast ───────────────────────────────────────────── */
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState<{ show: boolean; message: string; type: "success" | "error" }>({
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

  /* ── Load data ────────────────────────────────────────────────── */
  const handleRefresh = useCallback(async () => {
    try {
      // TODO: re-fetch categories for parent dropdown
      // const cats = await getCustomerCategoryList();
      // buildParentOptions(cats);
    } catch {
      showToast("Failed to refresh data.", "error");
    }
  }, []);

  useEffect(() => {
    (async () => {
      setPageLoading(true);
      try {
        // TODO: fetch all categories (for parent dropdown)
        // const cats = await getCustomerCategoryList();
        // const levelMap: Record<string, number> = {};
        // const opts = cats
        //   .filter(c => !isEdit || c.id !== Number(id))
        //   .map(c => { levelMap[String(c.id)] = c.level; return { value: String(c.id), label: c.name }; });
        // setParentOptions(opts);
        // setParentLevelMap(levelMap);

        // TODO: if editing, hydrate form fields
        // if (isEdit) {
        //   const cat = await fetchCustomerCategory(Number(id));
        //   setName(cat.name);
        //   setCode(cat.code ?? "");
        //   setDescription(cat.description ?? "");
        //   setIsChild(!!cat.parent_id);
        //   if (cat.parent_id) setParentCategory({ value: String(cat.parent_id), label: cat.parent_name ?? "" });
        //   setLinkToLocation(!!cat.linked_country);
        //   if (cat.linked_country) setLinkedCountry(countryOptions.find(o => o.value === cat.linked_country) ?? null);
        //   setPortalAccess(cat.portal_access);
        //   setVisibleInHierarchy(cat.visible_in_hierarchy);
        // }

        setParentOptions([]);
        setParentLevelMap({});
      } catch {
        showToast("Failed to load data.", "error");
      } finally {
        setPageLoading(false);
      }
    })();
  }, [isEdit, id]);

  /* ── Validation ───────────────────────────────────────────────── */
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim())                          errs.name           = "Category name is required.";
    if (isChild && !parentCategory)            errs.parentCategory = "Parent category is required.";
    if (linkToLocation && !linkedCountry)      errs.linkedCountry  = "Country is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Save ─────────────────────────────────────────────────────── */
  const handleSave = async () => {
    if (!validate()) {
      showToast("Please fix the errors before saving.", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name:                 name.trim(),
        code:                 code.trim() || null,
        description:          description.trim() || null,
        parent_id:            isChild && parentCategory ? Number(parentCategory.value) : null,
        linked_country:       linkToLocation && linkedCountry ? linkedCountry.value : null,
        portal_access:        portalAccess,
        visible_in_hierarchy: visibleInHierarchy,
        is_active:            true,
      };

      // TODO: wire up API
      // const res = isEdit
      //   ? await updateCustomerCategory(Number(id), payload)
      //   : await storeCustomerCategory(payload);
      // if (res.success) {
      //   emitMutation("customer-categories:mutated");
      //   showToast(isEdit ? "Category updated successfully." : "Category created successfully.", "success");
      //   const targetId = isEdit ? id : (res as any).data.id;
      //   setTimeout(() => navigate(route.customerCategories), 1500);
      // } else {
      //   showToast(res.message ?? "Failed to save.", "error");
      // }

      console.log("Payload (API not yet connected):", payload);
      showToast("Frontend preview — API not yet connected.", "error");
    } catch {
      showToast(isEdit ? "Failed to update category." : "Failed to create category.", "error");
    } finally {
      setSaving(false);
    }
  };

  const goBack = () =>
    window.history.length > 1 ? navigate(-1) : navigate(route.customerCategories);

  /* ── Loading screen ───────────────────────────────────────────── */
  if (pageLoading) {
    return (
      <div className="page-wrapper">
        <div
          className="content d-flex align-items-center justify-content-center"
          style={{ minHeight: 300 }}
        >
          <span className="spinner-border spinner-border-sm me-2 text-primary" />
          <span className="text-muted">Loading…</span>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <>
      <div className="page-wrapper">
        <div className="content">

          <PageHeader
            title={isEdit ? "Edit Customer Category" : "Add Customer Category"}
            badgeCount={null}
            showModuleTile={false}
            showExport={false}
            showClose
            onClose={goBack}
            onRefresh={handleRefresh}
          />

          <div className="card mb-0">
            <div className="card-body p-4">

              {/* ══ Category Name ══════════════════════════════════ */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label fw-medium fs-14 text-danger">
                  Category Name<span className="ms-1">*</span>
                </label>
                <div className="col-sm-10">
                  <input
                    type="text"
                    className={`form-control${errors.name ? " is-invalid" : ""}`}
                    placeholder="e.g. Super Stockist"
                    maxLength={100}
                    value={name}
                    onChange={e => { setName(e.target.value); clr("name"); }}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
              </div>

              {/* ══ Category Code ══════════════════════════════════ */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label fw-medium fs-14">
                  Category Code
                </label>
                <div className="col-sm-10">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. SS01"
                    maxLength={50}
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    style={{ maxWidth: 240 }}
                  />
                </div>
              </div>

              {/* ══ Level (auto) ═══════════════════════════════════ */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label fw-medium fs-14">
                  Level&nbsp;
                  <span className="text-muted fw-normal fs-12">(auto)</span>
                </label>
                <div className="col-sm-10">
                  <input
                    type="text"
                    className="form-control bg-light text-muted"
                    value={computedLevel}
                    readOnly
                    style={{ maxWidth: 100, cursor: "default" }}
                  />
                </div>
              </div>

              {/* ══ Description ════════════════════════════════════ */}
              <div className="row mb-4 align-items-start">
                <label className="col-sm-2 col-form-label fw-medium fs-14 pt-2">
                  Description
                </label>
                <div className="col-sm-10">
                  <textarea
                    className="form-control"
                    placeholder="Brief role description…"
                    rows={4}
                    maxLength={500}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                  <div className="text-muted fs-12 mt-1 text-end">
                    {description.length}/500
                  </div>
                </div>
              </div>

              {/* ── Divider ────────────────────────────────────────── */}
              <div className="d-flex align-items-center gap-3 mb-4">
                <span
                  className="text-uppercase fw-semibold fs-11 text-muted"
                  style={{ letterSpacing: "0.07em", whiteSpace: "nowrap" }}
                >
                  Category Options
                </span>
                <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
              </div>

              {/* ══ Toggle Cards ═══════════════════════════════════ */}
              <div className="row">
                <div className="col-sm-2" />
                <div className="col-sm-10">

                  {/* This is a Child Category */}
                  <ToggleCard
                    icon="ti-user-plus"
                    iconBg="rgba(228,31,59,0.08)"
                    iconColor="#E41F3B"
                    title="This is a Child Category"
                    description="Link this category under a parent category"
                    checked={isChild}
                    onChange={v => {
                      setIsChild(v);
                      if (!v) { setParentCategory(null); clr("parentCategory"); }
                    }}
                  />

                  {isChild && (
                    <div className="row mb-4 align-items-center ms-0" style={{ marginTop: -4 }}>
                      <label className="col-sm-3 col-form-label fw-medium fs-14 text-danger ps-0">
                        Parent Category<span className="ms-1">*</span>
                      </label>
                      <div className="col-sm-9">
                        <CommonSelect
                          className="select"
                          options={parentOptions}
                          value={parentCategory}
                          placeholder="— Select parent category —"
                          onChange={v => { setParentCategory(v); clr("parentCategory"); }}
                        />
                        {errors.parentCategory && (
                          <div className="text-danger fs-12 mt-1">{errors.parentCategory}</div>
                        )}
                        {parentOptions.length === 0 && (
                          <div className="text-muted fs-12 mt-1">
                            No categories available yet — save another category first.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Link to Location */}
                  <ToggleCard
                    icon="ti-map-pin"
                    iconBg="rgba(255,152,0,0.10)"
                    iconColor="#FF9800"
                    title="Link to Location"
                    description="Associate this category with a country &amp; its layers"
                    checked={linkToLocation}
                    onChange={v => {
                      setLinkToLocation(v);
                      if (!v) { setLinkedCountry(null); clr("linkedCountry"); }
                    }}
                  />

                  {linkToLocation && (
                    <div className="row mb-4 align-items-center ms-0" style={{ marginTop: -4 }}>
                      <label className="col-sm-3 col-form-label fw-medium fs-14 text-danger ps-0">
                        Country<span className="ms-1">*</span>
                      </label>
                      <div className="col-sm-9">
                        <CommonSelect
                          className="select"
                          options={countryOptions}
                          value={linkedCountry}
                          placeholder="— Select country —"
                          onChange={v => { setLinkedCountry(v); clr("linkedCountry"); }}
                        />
                        {errors.linkedCountry && (
                          <div className="text-danger fs-12 mt-1">{errors.linkedCountry}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Portal Access */}
                  <ToggleCard
                    icon="ti-shield-lock"
                    iconBg="rgba(21,120,213,0.10)"
                    iconColor="#1578D5"
                    title="Portal Access"
                    description="Allow users in this category to log in"
                    checked={portalAccess}
                    onChange={setPortalAccess}
                  />

                  {/* Visible in Hierarchy Map */}
                  <ToggleCard
                    icon="ti-sitemap"
                    iconBg="rgba(56,176,0,0.10)"
                    iconColor="#38B000"
                    title="Visible in Hierarchy Map"
                    description="Show in the hierarchy flow diagram"
                    checked={visibleInHierarchy}
                    onChange={setVisibleInHierarchy}
                  />

                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ── Sticky save bar ───────────────────────────────────── */}
        <div
          className="position-sticky bottom-0 bg-white border-top d-flex justify-content-end gap-3 px-4 py-3"
          style={{ zIndex: 100, boxShadow: "0 -4px 16px rgba(0,0,0,0.06)" }}
        >
          <button
            type="button"
            className="btn btn-outline-secondary px-4"
            onClick={goBack}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary px-5"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</>
              : isEdit ? "Update Category" : "Save Category"
            }
          </button>
        </div>

        <Footer />
      </div>

      {/* ── Toast ─────────────────────────────────────────────────── */}
      <div
        className="position-fixed top-0 start-50 translate-middle-x pt-4"
        style={{ zIndex: 9999, pointerEvents: "none" }}
      >
        <Toast
          show={toast.show}
          onClose={() => setToast(t => ({ ...t, show: false }))}
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

export default NewCustomerCategory;
