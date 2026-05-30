import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Toast } from "react-bootstrap";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import CommonSelect, { type Option } from "../../../../components/common-select/commonSelect";
import { all_routes } from "../../../../routes/all_routes";
import {
  getCountryList,
  getCachedLayerSchema,
} from "../../../../core/cache/distributionLocationCache";
import {
  type Country,
} from "../../../../core/services/distributionLocationApi";
import { getDistributionCategories, bustDistributionCategories, type DistributionCategory } from "../../../../core/cache/distributionCategoryCache";
import { bustDistributionSubCategories } from "../../../../core/cache/distributionSubCategoryCache";
import { fetchDistributionCategory, storeDistributionCategory, updateDistributionCategory } from "../../../../core/services/distributionCategoryApi";
import { emitMutation } from "../../../../core/cache/mutationEvents";
import { getRoleList } from "../../../../core/cache/roleCache";

const route = all_routes;

// ── Selected linked location value (countries only) ───────────────────────────

interface DistribLocation {
  countryId:   number;
  countryName: string;
  layerName:   string | null;
  depth:       number | null;
}

// ── Picker stack frame types ──────────────────────────────────────────────────

type LayerEntry = { name: string; depth: number };

type StackFrame =
  | { kind: "root";   countries: Country[] }
  | { kind: "layers"; countryId: number; countryName: string; layers: LayerEntry[] };

// ── DistributionLocationPicker ────────────────────────────────────────────────

interface PickerProps {
  value: DistribLocation | null;
  onChange: (v: DistribLocation | null) => void;
  assignedKeys: Set<string>;
  disabled?: boolean;
  hasError?: boolean;
}

function DistributionLocationPicker({ value, onChange, assignedKeys: _assignedKeys, disabled, hasError }: PickerProps) {
  const [stack,   setStack]   = useState<StackFrame[]>([{ kind: "root", countries: [] }]);
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);
  const wrapRef               = useRef<HTMLDivElement>(null);
  const countriesLoadedRef    = useRef(false);

  const current = stack[stack.length - 1];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open || countriesLoadedRef.current) return;
    setLoading(true);
    getCountryList()
      .then(data => {
        countriesLoadedRef.current = true;
        setStack([{ kind: "root", countries: data.filter(c => c.is_active) }]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  const back = () => setStack(prev => prev.slice(0, -1));

  const handleCountryClick = async (country: Country) => {
    setLoading(true);
    try {
      const schemas = await getCachedLayerSchema(country.id);
      const seen    = new Set<number>();
      const layers: LayerEntry[] = [];
      schemas
        .filter(s => s.parent_node_id === 0)
        .sort((a, b) => a.depth - b.depth)
        .forEach(s => {
          if (!seen.has(s.depth)) { seen.add(s.depth); layers.push({ name: s.layer_name, depth: s.depth }); }
        });
      setStack(prev => [...prev, { kind: "layers", countryId: country.id, countryName: country.name, layers }]);
    } finally { setLoading(false); }
  };

  const select = (item: DistribLocation) => {
    onChange(item);
    setOpen(false);
    setStack(prev => [prev[0]]);
  };

  const renderContent = () => {
    if (loading) return (
      <div className="px-3 py-3 d-flex align-items-center gap-2 text-muted fs-14">
        <span className="spinner-border spinner-border-sm" />
        Loading…
      </div>
    );

    if (current.kind === "root") {
      if (current.countries.length === 0)
        return <div className="px-3 py-3 text-center fs-15" style={{ color: "#707070" }}>No countries found</div>;

      return current.countries.map(c => (
        <div
          key={c.id}
          className="d-flex align-items-center justify-content-between px-3 py-2 fs-15"
          style={{ cursor: "pointer", color: "#707070" }}
          onClick={() => handleCountryClick(c)}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#E41F07"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#707070"; }}
        >
          <span className="flex-grow-1">{c.name}</span>
          <i className="ti ti-chevron-right fs-14" style={{ color: "inherit", flexShrink: 0 }} />
        </div>
      ));
    }

    if (current.kind === "layers") {
      if (current.layers.length === 0)
        return <div className="px-3 py-3 text-center fs-15" style={{ color: "#707070" }}>No layers defined for this country</div>;

      return current.layers.map((layer, idx) => {
        const isSelected = value?.countryId === current.countryId && (value?.layerName === layer.name || value?.depth === layer.depth);
        return (
          <div
            key={idx}
            className="px-3 py-2 fs-15"
            style={{
              cursor:     "pointer",
              background: isSelected ? "#E41F07" : "transparent",
              color:      isSelected ? "#fff" : "#707070",
            }}
            onClick={() => select({ countryId: current.countryId, countryName: current.countryName, layerName: layer.name, depth: layer.depth })}
            onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.color = "#E41F07"; }}
            onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.color = "#707070"; }}
          >
            {layer.name}
          </div>
        );
      });
    }
  };

  const displayValue = value
    ? value.layerName
      ? `${value.countryName} › ${value.layerName}`
      : value.countryName
    : "";

  return (
    <div ref={wrapRef} className="position-relative" style={open ? { zIndex: 10 } : undefined}>
      {/* Control — same border/radius as project form-control inputs */}
      <div
        className="d-flex align-items-center"
        style={{
          border: `1px solid ${hasError ? "#dc3545" : "var(--border-color)"}`,
          borderRadius: 6,
          minHeight: 38,
          background: disabled ? "var(--bs-secondary-bg, #f8f9fa)" : "#fff",
          cursor: disabled ? "default" : "pointer",
          userSelect: "none",
        }}
        onClick={() => { if (!disabled) setOpen(o => !o); }}
      >
        {/* Value / placeholder */}
        <div
          style={{
            flex: 1,
            padding: "6px 12px",
            fontSize: 14,
            color: displayValue ? "var(--bs-body-color, #212529)" : "#aaa",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {displayValue || "Select country and layer"}
        </div>

        {/* Indicators — exact react-select filled SVGs */}
        <div className="d-flex align-items-center">
          {value && !disabled && (
            <span
              style={{ padding: "0 4px", color: "hsl(0,0%,70%)", display: "flex", alignItems: "center", cursor: "pointer" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "hsl(0,0%,45%)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "hsl(0,0%,70%)"; }}
              onClick={e => { e.stopPropagation(); onChange(null); }}
            >
              <svg height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false" fill="currentColor">
                <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z" />
              </svg>
            </span>
          )}
          <span
            style={{
              padding: "0 8px",
              color: "hsl(0,0%,70%)",
              display: "flex",
              alignItems: "center",
              opacity: disabled ? 0.4 : 1,
            }}
            onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.color = "hsl(0,0%,45%)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "hsl(0,0%,70%)"; }}
          >
            <svg height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false" fill="currentColor"
              style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 200ms" }}>
              <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z" />
            </svg>
          </span>
        </div>
      </div>

      {open && (
        <div
          className="position-absolute bg-white border rounded shadow-sm"
          style={{ top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 1050, maxHeight: 280, overflowY: "auto" }}
        >
          {current.kind === "layers" && (
            <div
              className="d-flex align-items-center gap-2 px-3 py-2 border-bottom"
              style={{ cursor: "pointer", background: "#f8f9fa", position: "sticky", top: 0 }}
              onClick={back}
            >
              <i className="ti ti-arrow-left fs-13" style={{ color: "#707070" }} />
              <span className="fs-15 fw-medium" style={{ color: "#707070" }}>{current.countryName}</span>
            </div>
          )}
          {renderContent()}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const NewDistributionCategory = () => {
  const navigate  = useNavigate();
  const { id }    = useParams<{ id: string }>();
  const isEdit    = !!id;
  const editId    = id ? Number(id) : null;

  /* ── Page load ──────────────────────────────────────────────────── */
  const [pageLoading, setPageLoading] = useState(true);

  /* ── Form state ─────────────────────────────────────────────────── */
  const [name,               setName]               = useState("");
  const [code,               setCode]               = useState("");
  const [description,        setDescription]        = useState("");
  const [isChild,            setIsChild]            = useState(false);
  const [parentCategory,     setParentCategory]     = useState<Option | null>(null);
  const [linkToLocation,     setLinkToLocation]     = useState(false);
  const [linkedLocation,     setLinkedLocation]     = useState<DistribLocation | null>(null);
  const [portalAccess,       setPortalAccess]       = useState(false);
  const [visibleInHierarchy, setVisibleInHierarchy] = useState(false);
  const [errors,             setErrors]             = useState<Record<string, string>>({});
  const [saving,             setSaving]             = useState(false);

  const [allCategories, setAllCategories] = useState<DistributionCategory[]>([]);
  const [assignedKeys,  setAssignedKeys]  = useState<Set<string>>(new Set());
  const [selectedRole,  setSelectedRole]  = useState<Option | null>(null);
  const [roleOptions,   setRoleOptions]   = useState<Option[]>([]);

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

  const applyRecord = (rec: ReturnType<typeof Object.assign>, resolvedLayerName?: string | null) => {
    setName(rec.name);
    setCode(rec.code ?? "");
    setDescription(rec.description ?? "");
    setPortalAccess(rec.portal_access);
    setVisibleInHierarchy(rec.visible_in_hierarchy);
    setSelectedRole(rec.role_id && rec.role ? { value: String(rec.role_id), label: rec.role.name } : null);
    setIsChild(false); setParentCategory(null);
    setLinkToLocation(false); setLinkedLocation(null);
    if (rec.parent_id && rec.parent) {
      setIsChild(true);
      setParentCategory({ value: String(rec.parent.id), label: rec.parent.name });
    }
    if (rec.linked_location_country_id && rec.linked_country) {
      setLinkToLocation(true);
      setLinkedLocation({
        countryId:   rec.linked_location_country_id,
        countryName: rec.linked_country.name,
        layerName:   resolvedLayerName ?? null,
        depth:       rec.linked_location_depth ?? null,
      });
    }
  };

  const applyCats = (cats: DistributionCategory[]) => {
    setAllCategories(cats);
    const keys = new Set<string>();
    cats.forEach(c => {
      if (c.linked_location_country_id) keys.add(`country:${c.linked_location_country_id}`);
    });
    setAssignedKeys(keys);
  };

  /* ── Single parallel mount load ─────────────────────────────────── */
  useEffect(() => {
    (async () => {
      setPageLoading(true);

      const [catsResult, rolesResult, editResult] = await Promise.all([
        getDistributionCategories().catch(() => null),
        getRoleList().catch(() => null),
        isEdit && editId ? fetchDistributionCategory(editId) : Promise.resolve(null),
      ]);

      if (rolesResult) {
        setRoleOptions(rolesResult.data.map(r => ({ value: String(r.id), label: r.name })));
      }

      if (catsResult) {
        applyCats(catsResult);
      } else {
        showToast("Failed to load distribution categories.", "error");
      }

      if (isEdit && editResult) {
        if (!editResult.success) {
          showToast((editResult as any).message ?? "Failed to load record.", "error");
        } else {
          const rec = editResult.data;
          let resolvedLayerName: string | null = null;
          if (rec.linked_location_country_id && rec.linked_location_depth) {
            const schemas = await getCachedLayerSchema(rec.linked_location_country_id).catch(() => []);
            const match = schemas.find(s => Number(s.depth) === rec.linked_location_depth && !s.parent_node_id);
            resolvedLayerName = match?.layer_name ?? null;
          }
          applyRecord(rec, resolvedLayerName);
        }
      }

      setPageLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Refresh: re-fetch option lists only, keep all typed fields ──── */
  const handleRefresh = useCallback(async () => {
    bustDistributionCategories();
    const catsResult = await getDistributionCategories().catch(() => null);
    if (catsResult) {
      applyCats(catsResult);
      // Validate parentCategory — hard-clear if deleted, update label if renamed
      if (isChild && parentCategory) {
        const match = catsResult.find((c) => c.id !== editId && String(c.id) === parentCategory.value);
        if (!match) {
          setParentCategory(null);
          clr("parentCategory");
        } else if (match.name !== parentCategory.label) {
          setParentCategory({ value: parentCategory.value, label: match.name });
        }
      }
    }
    setErrors({});
  }, [isChild, parentCategory, editId]);

  /* ── Derived options ─────────────────────────────────────────────── */
  const parentOptions = useMemo(
    () => allCategories.filter(c => c.id !== editId).map(c => ({ value: String(c.id), label: c.name })),
    [allCategories, editId],
  );

  /* ── Validation ──────────────────────────────────────────────────── */
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim())                      errs.name           = "Distribution category name is required.";
    if (isChild && !parentCategory)        errs.parentCategory = "Please select a parent distribution category.";
    if (linkToLocation && !linkedLocation) errs.linkedLocation = "Please select a location.";
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
        code:                       code.trim() || null,
        description:                description.trim() || null,
        parent_id:                  isChild && parentCategory ? Number(parentCategory.value) : null,
        linked_location_country_id: linkToLocation && linkedLocation ? linkedLocation.countryId : null,
        linked_location_node_id:    null,
        linked_location_depth:      linkToLocation && linkedLocation ? linkedLocation.depth : null,
        portal_access:              portalAccess,
        visible_in_hierarchy:       visibleInHierarchy,
        role_id:                    selectedRole ? Number(selectedRole.value) : null,
      };

      const res = isEdit && editId
        ? await updateDistributionCategory(editId, payload)
        : await storeDistributionCategory(payload);

      if (res.success) {
        bustDistributionCategories();
        bustDistributionSubCategories();
        emitMutation("distribution-categories:mutated");
        showToast(
          isEdit ? "Distribution category updated successfully." : "Distribution category created successfully.",
          "success",
        );
        setTimeout(() => navigate(route.customerSettings + "?tab=distribution"), 1500);
      } else {
        showToast(
          (res as any).message ?? `Failed to ${isEdit ? "update" : "create"} distribution category.`,
          "error",
        );
      }
    } catch {
      showToast(`Failed to ${isEdit ? "update" : "create"} distribution category.`, "error");
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
            title={isEdit ? "Edit Distribution Category" : "New Distribution Category"}
            showModuleTile={false}
            showExport={false}
            showClose
            onClose={goBack}
            onRefresh={handleRefresh}
          />

          <div className="card mb-0">
            <div className="card-body p-4">

              {/* ── Category Name ──────────────────────────────────────── */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label text-danger fw-medium fs-14">
                  Distribution Category Name<span className="ms-1">*</span>
                </label>
                <div className="col-sm-4">
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

              {/* ── Category Code ──────────────────────────────────────── */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label fw-medium fs-14">Distribution Category Code</label>
                <div className="col-sm-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. SS01"
                    maxLength={50}
                    value={code}
                    onChange={e => setCode(e.target.value)}
                  />
                </div>
              </div>

              {/* ── Level (auto) ───────────────────────────────────────── */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label fw-medium fs-14">
                  Level&nbsp;<span className="text-muted fw-normal fs-13">(auto)</span>
                </label>
                <div className="col-sm-4">
                  <input
                    type="text"
                    className="form-control bg-light text-muted"
                    value={isChild && parentCategory
                      ? (allCategories.find(c => c.id === Number(parentCategory.value))?.level ?? 0) + 1
                      : 1
                    }
                    readOnly
                    style={{ cursor: "default" }}
                  />
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

              <div className="border-top my-4" />

              {/* ── Child Category ─────────────────────────────────────── */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label fw-medium fs-14" htmlFor="isChildCategory">
                  Child Distribution Category
                </label>
                <div className="col-sm-4 d-flex align-items-center gap-2" style={{ minHeight: 38 }}>
                  <input
                    className="form-check-input mt-0"
                    type="checkbox"
                    id="isChildCategory"
                    checked={isChild}
                    onChange={e => {
                      setIsChild(e.target.checked);
                      if (!e.target.checked) { setParentCategory(null); clr("parentCategory"); }
                    }}
                  />
                  <label className="form-check-label fw-medium fs-14 mb-0" htmlFor="isChildCategory">Yes</label>
                </div>
              </div>

              {isChild && (
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-2 col-form-label fw-medium fs-14 text-danger">
                    Parent Distribution Category<span className="ms-1">*</span>
                  </label>
                  <div className="col-sm-4">
                    <CommonSelect
                      className="select"
                      options={parentOptions}
                      value={parentCategory}
                      onChange={v => { setParentCategory(v); clr("parentCategory"); }}
                      placeholder="Select parent distribution category"
                    />
                    {errors.parentCategory && (
                      <div className="text-danger fs-12 mt-1">{errors.parentCategory}</div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Link to Location ───────────────────────────────────── */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label fw-medium fs-14" htmlFor="linkToLocation">
                  Link to Location
                </label>
                <div className="col-sm-4 d-flex align-items-center gap-2" style={{ minHeight: 38 }}>
                  <input
                    className="form-check-input mt-0"
                    type="checkbox"
                    id="linkToLocation"
                    checked={linkToLocation}
                    onChange={e => {
                      setLinkToLocation(e.target.checked);
                      if (!e.target.checked) { setLinkedLocation(null); clr("linkedLocation"); }
                    }}
                  />
                  <label className="form-check-label fw-medium fs-14 mb-0" htmlFor="linkToLocation">Yes</label>
                </div>
              </div>

              {linkToLocation && (
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-2 col-form-label fw-medium fs-14 text-danger">
                    Location<span className="ms-1">*</span>
                  </label>
                  <div className="col-sm-4">
                    <DistributionLocationPicker
                      value={linkedLocation}
                      onChange={v => { setLinkedLocation(v); clr("linkedLocation"); }}
                      assignedKeys={assignedKeys}
                      hasError={!!errors.linkedLocation}
                    />
                    {errors.linkedLocation && (
                      <div className="text-danger fs-12 mt-1">{errors.linkedLocation}</div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Portal Access ──────────────────────────────────────── */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label fw-medium fs-14" htmlFor="portalAccess">
                  Portal Access
                </label>
                <div className="col-sm-4">
                  <div className="form-check form-switch mb-0 mt-1">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="portalAccess"
                      checked={portalAccess}
                      onChange={e => setPortalAccess(e.target.checked)}
                    />
                    <label className="form-check-label text-muted fs-13" htmlFor="portalAccess">
                      {portalAccess ? "Yes" : "No"}
                    </label>
                  </div>
                </div>
              </div>

              {/* ── Visible in Hierarchy Map ───────────────────────────── */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label fw-medium fs-14" htmlFor="visibleInHierarchy">
                  Visible in Hierarchy Map
                </label>
                <div className="col-sm-4">
                  <div className="form-check form-switch mb-0 mt-1">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="visibleInHierarchy"
                      checked={visibleInHierarchy}
                      onChange={e => setVisibleInHierarchy(e.target.checked)}
                    />
                    <label className="form-check-label text-muted fs-13" htmlFor="visibleInHierarchy">
                      {visibleInHierarchy ? "Yes" : "No"}
                    </label>
                  </div>
                </div>
              </div>

              {/* ── Role ───────────────────────────────────────────────── */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label fw-medium fs-14">Role</label>
                <div className="col-sm-4">
                  <CommonSelect
                    className="select"
                    options={roleOptions}
                    value={selectedRole}
                    onChange={v => setSelectedRole(v)}
                    placeholder="Select role"
                    isClearable
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

export default NewDistributionCategory;
