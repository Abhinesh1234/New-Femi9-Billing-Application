import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Toast } from "react-bootstrap";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import CommonSelect, { type Option } from "../../../../components/common-select/commonSelect";
import { all_routes } from "../../../../routes/all_routes";
import { getDistributionCategories, bustDistributionCategories } from "../../../../core/cache/distributionCategoryCache";
import { bustDistributionSubCategories } from "../../../../core/cache/distributionSubCategoryCache";
import { fetchDistributionSubCategory, storeDistributionSubCategory, updateDistributionSubCategory } from "../../../../core/services/distributionSubCategoryApi";
import { emitMutation } from "../../../../core/cache/mutationEvents";

const route = all_routes;

const NewDistributionSubCategory = () => {
  const navigate  = useNavigate();
  const { id }    = useParams<{ id: string }>();
  const isEdit    = !!id;
  const editId    = id ? Number(id) : null;

  /* ── Page load ──────────────────────────────────────────────────── */
  const [pageLoading, setPageLoading] = useState(true);

  /* ── Form state ─────────────────────────────────────────────────── */
  const [name,              setName]              = useState("");
  const [distributionCatId, setDistributionCatId] = useState<Option | null>(null);
  const [description,       setDescription]       = useState("");
  const [status,            setStatus]            = useState<Option>({ value: "active", label: "Active" });
  const [targetAmount,      setTargetAmount]      = useState("");
  const [cashbackReferral,  setCashbackReferral]  = useState("");
  const [distCatOptions,    setDistCatOptions]    = useState<Option[]>([]);
  const [errors,            setErrors]            = useState<Record<string, string>>({});
  const [saving,            setSaving]            = useState(false);

  const STATUS_OPTIONS: Option[] = [
    { value: "active",   label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  /* ── Toast ──────────────────────────────────────────────────────── */
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false, message: "", type: "success",
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  };

  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  /* ── Helpers ────────────────────────────────────────────────────── */
  const clr = (key: string) => setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });

  const applyRecord = (rec: ReturnType<typeof Object.assign>) => {
    setName(rec.name);
    setDescription(rec.description ?? "");
    setStatus(rec.status === "inactive"
      ? { value: "inactive", label: "Inactive" }
      : { value: "active",   label: "Active" },
    );
    setTargetAmount(rec.target_amount ?? "");
    setCashbackReferral(rec.cashback_referral ?? "");
    setDistributionCatId(null);
    if (rec.distribution_category_id && rec.distribution_category) {
      setDistributionCatId({
        value: String(rec.distribution_category.id),
        label: rec.distribution_category.name,
      });
    }
  };

  const formatIndian = (raw: string): string => {
    if (!raw) return "";
    const [intPart, decPart] = raw.split(".");
    const lastThree = intPart.slice(-3);
    const rest      = intPart.slice(0, -3);
    const formatted = rest.length > 0
      ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
      : lastThree;
    return decPart !== undefined ? formatted + "." + decPart : formatted;
  };

  const handleTargetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const stripped = e.target.value.replace(/,/g, "");
    if (stripped === "" || /^\d*\.?\d{0,2}$/.test(stripped)) {
      setTargetAmount(stripped);
    }
  };

  const applyCats = (cats: { id: number; name: string }[]) => {
    setDistCatOptions(cats.map(c => ({ value: String(c.id), label: c.name })));
  };

  /* ── Single parallel mount load ─────────────────────────────────── */
  useEffect(() => {
    (async () => {
      setPageLoading(true);

      const [catsResult, editResult] = await Promise.all([
        getDistributionCategories().catch(() => null),
        isEdit && editId ? fetchDistributionSubCategory(editId) : Promise.resolve(null),
      ]);

      if (catsResult) {
        applyCats(catsResult);
      } else {
        showToast("Failed to load distribution categories.", "error");
      }

      if (isEdit && editResult) {
        if (!editResult.success) {
          showToast((editResult as any).message ?? "Failed to load record.", "error");
        } else {
          applyRecord(editResult.data);
        }
      }

      setPageLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Refresh: bust cache + reload ───────────────────────────────── */
  const handleRefresh = useCallback(async () => {
    bustDistributionCategories();
    const catsResult = await getDistributionCategories().catch(() => null);
    if (catsResult) {
      applyCats(catsResult);
      // Validate distributionCatId — hard-clear if deleted, update label if renamed
      if (distributionCatId) {
        const match = catsResult.find((c) => String(c.id) === distributionCatId.value);
        if (!match) {
          setDistributionCatId(null);
          clr("distributionCatId");
        } else if (match.name !== distributionCatId.label) {
          setDistributionCatId({ value: distributionCatId.value, label: match.name });
        }
      }
    }
    setErrors({});
  }, [distributionCatId]);

  /* ── Validation ──────────────────────────────────────────────────── */
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim())         errs.name             = "Distribution sub-category name is required.";
    if (!distributionCatId)   errs.distributionCatId = "Parent distribution category is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Save handler ────────────────────────────────────────────────── */
  const handleSave = async () => {
    if (!validate()) {
      showToast("Please fill in all required fields before saving.", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name:                       name.trim(),
        distribution_category_id:   distributionCatId ? Number(distributionCatId.value) : null,
        description:                description.trim() || null,
        status:                     (status.value as "active" | "inactive"),
        target_amount:              targetAmount !== "" ? Number(targetAmount) : null,
        cashback_referral:          cashbackReferral.trim() || null,
        parent_id:                  null,
        linked_location_country_id: null,
        linked_location_node_id:    null,
        portal_access:              false,
        visible_in_hierarchy:       false,
      };

      const res = isEdit && editId
        ? await updateDistributionSubCategory(editId, payload)
        : await storeDistributionSubCategory(payload);

      if (res.success) {
        bustDistributionSubCategories();
        emitMutation("distribution-sub-categories:mutated");
        showToast(
          isEdit ? "Distribution sub-category updated successfully." : "Distribution sub-category created successfully.",
          "success",
        );
        setTimeout(() => navigate(route.customerSettings + "?tab=distributionSub"), 1500);
      } else {
        showToast(
          (res as any).message ?? `Failed to ${isEdit ? "update" : "create"} distribution sub-category.`,
          "error",
        );
      }
    } catch {
      showToast(`Failed to ${isEdit ? "update" : "create"} distribution sub-category.`, "error");
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate("/"));

  /* ── Page loading spinner ────────────────────────────────────────── */
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

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <>
      <div className="page-wrapper">
        <div className="content">

          <PageHeader
            title={isEdit ? "Edit Distribution Sub Category" : "New Distribution Sub Category"}
            showModuleTile={false}
            showExport={false}
            showClose
            onClose={goBack}
            onRefresh={handleRefresh}
          />

          <div className="card mb-0">
            <div className="card-body p-4">

              {/* ── Sub Category Name ──────────────────────────────────── */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label text-danger fw-medium fs-14">
                  Distribution Sub Category Name<span className="ms-1">*</span>
                </label>
                <div className="col-sm-4">
                  <input
                    type="text"
                    className={`form-control${errors.name ? " is-invalid" : ""}`}
                    placeholder="e.g. Regional Distributor"
                    maxLength={100}
                    value={name}
                    onChange={e => { setName(e.target.value); clr("name"); }}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
              </div>

              {/* ── Parent Distribution Category ───────────────────────── */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label text-danger fw-medium fs-14">
                  Parent Distribution Category<span className="ms-1">*</span>
                </label>
                <div className="col-sm-4">
                  <CommonSelect
                    className="select"
                    options={distCatOptions}
                    value={distributionCatId}
                    onChange={v => { setDistributionCatId(v); clr("distributionCatId"); }}
                    placeholder="Select distribution category"
                  />
                  {errors.distributionCatId && (
                    <div className="text-danger fs-12 mt-1">{errors.distributionCatId}</div>
                  )}
                </div>
              </div>

              {/* ── Description ────────────────────────────────────────── */}
              <div className="row mb-3 align-items-start">
                <label className="col-sm-2 col-form-label fw-medium fs-14">Description</label>
                <div className="col-sm-4">
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Brief role description…"
                    maxLength={500}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* ── Status ─────────────────────────────────────────────── */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label fw-medium fs-14">Status</label>
                <div className="col-sm-4">
                  <CommonSelect
                    className="select"
                    options={STATUS_OPTIONS}
                    value={status}
                    onChange={v => v && setStatus(v)}
                    placeholder="Select status"
                  />
                </div>
              </div>

              {/* ── Target Amount ──────────────────────────────────────── */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label fw-medium fs-14">Target Amount</label>
                <div className="col-sm-4">
                  <input
                    type="text"
                    inputMode="decimal"
                    className="form-control"
                    placeholder="e.g. 5,00,000"
                    value={formatIndian(targetAmount)}
                    onChange={handleTargetAmountChange}
                  />
                </div>
              </div>

              {/* ── Cashback Referral ──────────────────────────────────── */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label fw-medium fs-14">Cashback Referral</label>
                <div className="col-sm-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. REF-2024"
                    maxLength={255}
                    value={cashbackReferral}
                    onChange={e => setCashbackReferral(e.target.value)}
                  />
                </div>
              </div>

            </div>
          </div>

        </div>{/* content */}

        {/* ── Sticky Save / Cancel bar ──────────────────────────────── */}
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

      {/* ── Toast Notifications ───────────────────────────────────────── */}
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
    </>
  );
};

export default NewDistributionSubCategory;
