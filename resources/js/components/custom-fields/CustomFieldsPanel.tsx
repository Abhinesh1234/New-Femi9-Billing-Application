import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import ReactQuill from "react-quill-new";
import dayjs from "dayjs";
import CommonDatePicker from "../common-datePicker/commonDatePicker";
import { fetchCustomFields, type CustomField } from "../../core/services/customFieldApi";

// ─── Public handle (used by parent via ref) ───────────────────────────────────

export interface CustomFieldsPanelHandle {
  validate: () => boolean;
  getValues: () => Record<string, string>;
  getFiles: () => Record<string, File | null>;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  module: string;
  initialValues?: Record<string, string>;
  skipSystemFields?: boolean;
  // Optional async loaders for "lookup" fields keyed by lookup_module name
  lookupLoaders?: Record<
    string,
    (inputValue: string) => Promise<{ value: string; label: string }[]>
  >;
}

// ─── Format patterns (same as newItem.tsx) ────────────────────────────────────

const CF_FORMAT_PATTERNS: Record<string, { regex: RegExp; message: string }> = {
  numbers:                          { regex: /^[0-9]*$/,           message: "Only numbers are allowed." },
  alphanumeric_no_spaces:           { regex: /^[a-zA-Z0-9]*$/,    message: "Only letters and numbers are allowed (no spaces)." },
  alphanumeric_with_spaces:         { regex: /^[a-zA-Z0-9 ]*$/,   message: "Only letters, numbers, and spaces are allowed." },
  alphanumeric_hyphens_underscores: { regex: /^[a-zA-Z0-9\-_]*$/, message: "Only letters, numbers, hyphens, and underscores are allowed." },
  alphabets_no_spaces:              { regex: /^[a-zA-Z]*$/,        message: "Only letters are allowed (no spaces)." },
  alphabets_with_spaces:            { regex: /^[a-zA-Z ]*$/,       message: "Only letters and spaces are allowed." },
};

// ─── Shared react-select styles ───────────────────────────────────────────────

const makeSelectStyles = (hasError: boolean) => ({
  option: (base: object, state: { isSelected: boolean; isFocused: boolean }) => ({
    ...base,
    backgroundColor: state.isSelected ? "#E41F07" : "white",
    color: state.isSelected ? "#fff" : state.isFocused ? "#E41F07" : "#707070",
    cursor: "pointer",
    "&:hover": { backgroundColor: "#E41F07", color: "#fff" },
  }),
  control: (base: object) => ({
    ...base,
    borderColor: hasError ? "#dc3545" : (base as { borderColor: string }).borderColor,
    "&:hover": { borderColor: hasError ? "#dc3545" : "#E41F07" },
  }),
  menu: (base: object) => ({ ...base, zIndex: 999 }),
});

// ─── Component ────────────────────────────────────────────────────────────────

const CustomFieldsPanel = forwardRef<CustomFieldsPanelHandle, Props>(
  ({ module, initialValues, skipSystemFields, lookupLoaders }, ref) => {
    const [fields,   setFields]   = useState<CustomField[]>([]);
    const [loading,  setLoading]  = useState(true);
    const [values,   setValues]   = useState<Record<string, string>>({});
    const [errors,   setErrors]   = useState<Record<string, string>>({});
    const [files,    setFiles]    = useState<Record<string, File | null>>({});
    const [previews, setPreviews] = useState<Record<string, string>>({});

    // ── Fetch fields on mount ─────────────────────────────────────────────────

    useEffect(() => {
      setLoading(true);
      fetchCustomFields(module)
        .then((res) => {
          const active = res.success
            ? res.data.filter((f) => f.config.is_active && !(skipSystemFields && f.config.is_system))
            : [];
          setFields(active);
          const defaults: Record<string, string> = {};
          for (const f of active) {
            if (f.config.default_value != null) defaults[f.config.field_key] = f.config.default_value;
          }
          setValues({ ...defaults, ...(initialValues ?? {}) });
        })
        .catch(() => setFields([]))
        .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [module]);

    // ── Sync initialValues when they arrive (edit mode) ───────────────────────

    useEffect(() => {
      if (initialValues && Object.keys(initialValues).length > 0) {
        setValues((prev) => ({ ...prev, ...initialValues }));
      }
    }, [initialValues]);

    // ── Imperative handle ─────────────────────────────────────────────────────

    useImperativeHandle(ref, () => ({
      validate: () => {
        const errs: Record<string, string> = {};
        for (const field of fields) {
          if (field.config.data_type === "auto_generate") continue;
          const key = field.config.field_key;
          const err = validateField(field, values[key] ?? "");
          if (err) errs[key] = err;
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
      },
      getValues: () => values,
      getFiles:  () => files,
    }));

    // ── Helpers ───────────────────────────────────────────────────────────────

    const setValue = (key: string, val: string) =>
      setValues((prev) => ({ ...prev, [key]: val }));

    const clearError = (key: string) =>
      setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });

    const validateField = (field: CustomField, value: string): string => {
      const { is_mandatory, data_type, type_config, label } = field.config;
      const tc = type_config as Record<string, unknown>;

      if (data_type === "checkbox") {
        if (is_mandatory && value !== "1") return `${label} must be checked.`;
        return "";
      }

      const plainValue =
        data_type === "text_multi" && (tc.rich_text_editor as boolean)
          ? value.replace(/<[^>]*>/g, "").trim()
          : value.trim();
      if (is_mandatory && !plainValue) return `${label} is required.`;

      if (["dropdown", "multiselect", "lookup", "image", "attachment"].includes(data_type) && is_mandatory && !value)
        return `${label} is required.`;

      if (data_type === "number"  && value.trim() && !/^-?[0-9]+$/.test(value.trim()))
        return "Please enter a valid whole number.";
      if (data_type === "decimal" && value.trim() && isNaN(Number(value.trim())))
        return "Please enter a valid decimal number.";
      if (data_type === "amount"  && value.trim() && (isNaN(Number(value.trim())) || Number(value.trim()) < 0))
        return "Please enter a valid positive amount.";
      if (data_type === "percent" && value.trim()) {
        const n = Number(value.trim());
        if (isNaN(n) || n < 0 || n > 100) return "Percentage must be between 0 and 100.";
      }
      if (data_type === "email" && value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
        return "Please enter a valid email address.";
      if (data_type === "url" && value.trim()) {
        try { new URL(value.trim()); } catch { return "Please enter a valid URL (e.g. https://example.com)."; }
      }
      if (data_type === "phone" && value.trim() && !/^\+?[0-9\s\-().]{7,20}$/.test(value.trim()))
        return "Please enter a valid phone number.";

      if ((data_type === "text_single" || data_type === "text_multi") && value.trim()) {
        const customFmt = tc.custom_input_format as string | null;
        const fmt       = tc.input_format as string | null;
        if (customFmt) {
          try { if (!new RegExp(customFmt).test(value)) return "Input does not match the required format."; } catch { /* skip */ }
        } else if (fmt && CF_FORMAT_PATTERNS[fmt]) {
          const { regex, message } = CF_FORMAT_PATTERNS[fmt];
          if (!regex.test(value)) return message;
        }
      }
      return "";
    };

    // ── Input renderer ────────────────────────────────────────────────────────

    const renderInput = (field: CustomField, value: string, onChange: (v: string) => void): React.ReactNode => {
      const { data_type, type_config, field_key: key } = field.config;
      const tc    = type_config as Record<string, unknown>;
      const error = errors[key] ?? "";

      switch (data_type) {

        case "text_single": return (
          <>
            <input
              type="text"
              className={`form-control${error ? " is-invalid" : ""}`}
              value={value}
              onChange={(e) => { onChange(e.target.value); if (error) clearError(key); }}
              onBlur={() => setErrors((p) => ({ ...p, [key]: validateField(field, value) }))}
            />
            {error && <div className="invalid-feedback d-block">{error}</div>}
          </>
        );

        case "email":
        case "url":
        case "phone": {
          const iconMap = { email: "ti-mail", url: "ti-world", phone: "ti-phone" } as const;
          const typeMap = { email: "email",   url: "url",      phone: "tel"   } as const;
          return (
            <>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className={`ti ${iconMap[data_type as keyof typeof iconMap]} text-muted`} />
                </span>
                <input
                  type={typeMap[data_type as keyof typeof typeMap]}
                  className={`form-control border-start-0${error ? " is-invalid" : ""}`}
                  value={value}
                  onChange={(e) => { onChange(e.target.value); if (error) clearError(key); }}
                  onBlur={() => setErrors((p) => ({ ...p, [key]: validateField(field, value) }))}
                />
              </div>
              {error && <div className="invalid-feedback d-block">{error}</div>}
            </>
          );
        }

        case "text_multi": {
          const useRich = !!(tc.rich_text_editor as boolean | undefined);
          if (useRich) return (
            <>
              <div className={error ? "border border-danger rounded" : ""}>
                <ReactQuill
                  theme="snow"
                  value={value}
                  onChange={(html) => { onChange(html); if (error) clearError(key); }}
                  onBlur={() => {
                    const text = value.replace(/<[^>]*>/g, "").trim();
                    setErrors((p) => ({ ...p, [key]: validateField(field, text ? value : "") }));
                  }}
                  modules={{ toolbar: [[{ header: [1, 2, 3, false] }], ["bold", "italic", "underline", "strike"], [{ list: "ordered" }, { list: "bullet" }], ["link"], ["clean"]] }}
                />
              </div>
              {error && <div className="text-danger fs-13 mt-1">{error}</div>}
            </>
          );
          return (
            <>
              <textarea
                className={`form-control${error ? " is-invalid" : ""}`}
                rows={3}
                value={value}
                onChange={(e) => { onChange(e.target.value); if (error) clearError(key); }}
                onBlur={() => setErrors((p) => ({ ...p, [key]: validateField(field, value) }))}
              />
              {error && <div className="invalid-feedback d-block">{error}</div>}
            </>
          );
        }

        case "number":
        case "decimal":
        case "amount":
        case "percent": {
          const cls = `form-control${error ? " is-invalid" : ""}`;
          const handleChange = (v: string) => { onChange(v); if (error) clearError(key); };
          const handleBlur   = () => setErrors((p) => ({ ...p, [key]: validateField(field, value) }));
          let input: React.ReactNode;
          if (data_type === "amount") {
            input = (
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">₹</span>
                <input type="number" min="0" step="0.01" className={`${cls} border-start-0`}
                  value={value} onChange={(e) => handleChange(e.target.value)} onBlur={handleBlur} />
              </div>
            );
          } else if (data_type === "percent") {
            input = (
              <div className="input-group">
                <input type="number" min="0" max="100" step="0.01" className={`${cls} border-end-0`}
                  value={value} onChange={(e) => handleChange(e.target.value)} onBlur={handleBlur} />
                <span className="input-group-text bg-white border-start-0">%</span>
              </div>
            );
          } else if (data_type === "decimal") {
            input = <input type="number" step="any" className={cls} value={value}
              onChange={(e) => handleChange(e.target.value)} onBlur={handleBlur} />;
          } else {
            input = <input type="number" step="1" className={cls} value={value}
              onChange={(e) => handleChange(e.target.value)} onBlur={handleBlur} />;
          }
          return <>{input}{error && <div className="invalid-feedback d-block">{error}</div>}</>;
        }

        case "date": {
          const dv = value ? dayjs(value) : null;
          return (
            <>
              <CommonDatePicker
                value={dv?.isValid() ? dv : null}
                onChange={(date) => {
                  const v = date ? date.format("YYYY-MM-DD") : "";
                  onChange(v);
                  setErrors((p) => ({ ...p, [key]: validateField(field, v) }));
                }}
                className={error ? "is-invalid" : ""}
                format="DD/MM/YYYY"
                placeholder="DD/MM/YYYY"
              />
              {error && <div className="invalid-feedback d-block">{error}</div>}
            </>
          );
        }

        case "datetime": {
          const dtv = value ? dayjs(value) : null;
          return (
            <>
              <CommonDatePicker
                value={dtv?.isValid() ? dtv : null}
                onChange={(date) => {
                  const v = date ? date.format("YYYY-MM-DDTHH:mm:00") : "";
                  onChange(v);
                  setErrors((p) => ({ ...p, [key]: validateField(field, v) }));
                }}
                className={error ? "is-invalid" : ""}
                showTime={{ format: "HH:mm", minuteStep: 30 }}
                format="DD/MM/YYYY HH:mm"
                placeholder="DD/MM/YYYY HH:mm"
              />
              {error && <div className="invalid-feedback d-block">{error}</div>}
            </>
          );
        }

        case "checkbox": {
          const checked = value === "1";
          return (
            <>
              <div className="form-check form-switch mb-0 mt-1">
                <input
                  className={`form-check-input${error ? " is-invalid" : ""}`}
                  type="checkbox"
                  role="switch"
                  id={`cf_chk_${key}`}
                  checked={checked}
                  onChange={(e) => { onChange(e.target.checked ? "1" : "0"); if (error) clearError(key); }}
                />
                <label className="form-check-label text-muted fs-13" htmlFor={`cf_chk_${key}`}>
                  {checked ? "Yes" : "No"}
                </label>
              </div>
              {error && <div className="invalid-feedback d-block">{error}</div>}
            </>
          );
        }

        case "dropdown":
        case "multiselect": {
          const addColor  = !!(tc.add_color as boolean | undefined);
          const placement = (tc.color_placement as string | undefined) ?? "next";
          const rawOpts   = (tc.options as { label: string; color?: string; is_active: boolean }[]) ?? [];
          const opts      = rawOpts.filter((o) => o.is_active)
            .map((o) => ({ value: o.label, label: o.label, color: o.color ?? "#cccccc" }));
          const styles    = makeSelectStyles(!!error);

          const formatOptionLabel = (opt: { value: string; label: string; color: string }) => {
            if (!addColor) return <span>{opt.label}</span>;
            if (placement === "wrap")
              return <span style={{ background: opt.color, color: "#fff", padding: "2px 8px", borderRadius: 4, fontSize: 13 }}>{opt.label}</span>;
            return (
              <span className="d-flex align-items-center gap-2">
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: opt.color, flexShrink: 0, display: "inline-block" }} />
                {opt.label}
              </span>
            );
          };

          if (data_type === "dropdown") {
            const selected = value ? opts.find((o) => o.value === value) ?? null : null;
            return (
              <>
                <Select classNamePrefix="react-select" options={opts} value={selected} styles={styles}
                  formatOptionLabel={formatOptionLabel} isClearable menuPlacement="auto" placeholder="Select"
                  components={{ IndicatorSeparator: () => null }}
                  onChange={(opt) => { onChange(opt?.value ?? ""); if (error) clearError(key); }}
                  onBlur={() => setErrors((p) => ({ ...p, [key]: validateField(field, value) }))} />
                {error && <div className="invalid-feedback d-block">{error}</div>}
              </>
            );
          }
          const selected = value
            ? value.split(",").map((v) => opts.find((o) => o.value === v) ?? { value: v, label: v, color: "#ccc" })
            : [];
          return (
            <>
              <Select classNamePrefix="react-select" isMulti options={opts} value={selected} styles={styles}
                formatOptionLabel={formatOptionLabel} menuPlacement="auto" placeholder="Select"
                components={{ IndicatorSeparator: () => null }}
                onChange={(sel) => { onChange(sel.map((o) => o.value).join(",")); if (error) clearError(key); }}
                onBlur={() => setErrors((p) => ({ ...p, [key]: validateField(field, value) }))} />
              {error && <div className="invalid-feedback d-block">{error}</div>}
            </>
          );
        }

        case "lookup": {
          const lookupModule = (tc.lookup_module as string) ?? "";
          const parseStored  = (v: string) => {
            if (!v) return null;
            const idx = v.indexOf("|");
            return idx === -1 ? { value: v, label: v } : { value: v, label: v.slice(idx + 1) };
          };
          const loader = lookupLoaders?.[lookupModule];
          const styles = makeSelectStyles(!!error);

          if (!loader) {
            return (
              <div className="input-group">
                <input type="text" className="form-control bg-light text-muted fst-italic" readOnly value=""
                  placeholder={`${lookupModule || "Lookup"} — not connected`} />
                <span className="input-group-text bg-light border-start-0 text-muted">
                  <i className="ti ti-link fs-15" />
                </span>
              </div>
            );
          }

          return (
            <>
              <AsyncSelect classNamePrefix="react-select" cacheOptions defaultOptions
                loadOptions={loader} value={parseStored(value)} styles={styles} isClearable menuPlacement="auto"
                placeholder={`Search ${lookupModule}…`} components={{ IndicatorSeparator: () => null }}
                noOptionsMessage={({ inputValue }) => inputValue ? `No ${lookupModule} found` : `Type to search ${lookupModule}`}
                onChange={(opt) => { onChange(opt?.value ?? ""); if (error) clearError(key); }}
                onBlur={() => setErrors((p) => ({ ...p, [key]: validateField(field, value) }))} />
              {error && <div className="invalid-feedback d-block">{error}</div>}
            </>
          );
        }

        case "auto_generate": return (
          <div className="input-group">
            <input type="text" className="form-control bg-light text-muted fst-italic" readOnly value={value || "—"} />
            <span className="input-group-text bg-light border-start-0 text-muted">
              <i className="ti ti-wand fs-15" title="Auto-generated" />
            </span>
          </div>
        );

        case "image": {
          const preview = previews[key] ?? "";
          const inputId = `cf_img_${key}`;
          return (
            <>
              <label
                htmlFor={inputId}
                className={`border rounded d-flex flex-column align-items-center justify-content-center text-center position-relative overflow-hidden w-100${error ? " border-danger" : ""}`}
                style={{ cursor: "pointer", background: "#fafafa", height: 140 }}
              >
                {preview
                  ? <img src={preview} alt="preview" style={{ height: "100%", width: "100%", objectFit: "contain", padding: 8 }} />
                  : (<>
                      <i className="ti ti-photo-up text-primary fs-28 mb-1" />
                      <span className="fw-semibold fs-13">{field.config.label}</span>
                      <small className="text-muted">Click to upload — PNG, JPG up to 10 MB</small>
                    </>)}
                {preview && (
                  <button type="button"
                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 p-1 lh-1"
                    style={{ fontSize: 11 }}
                    onClick={(e) => { e.preventDefault(); setPreviews((p) => ({ ...p, [key]: "" })); setFiles((p) => ({ ...p, [key]: null })); onChange(""); }}>
                    <i className="ti ti-x" />
                  </button>
                )}
              </label>
              <input id={inputId} type="file" accept="image/*" className="d-none"
                onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
                onChange={(e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  setFiles((p) => ({ ...p, [key]: file }));
                  setPreviews((p) => ({ ...p, [key]: URL.createObjectURL(file) }));
                  onChange(file.name); if (error) clearError(key);
                }} />
              {error && <div className="invalid-feedback d-block">{error}</div>}
            </>
          );
        }

        case "attachment": {
          const file        = files[key] ?? null;
          const inputId     = `cf_att_${key}`;
          const allowedTypes = (tc.allowed_file_types as string[] | undefined) ?? ["all_files"];
          const acceptMap: Record<string, string> = {
            image: "image/*", document: ".doc,.docx,.xls,.xlsx,.csv,.txt,.rtf", pdf: ".pdf", all_files: "*",
          };
          const accept = allowedTypes.includes("all_files")
            ? "*"
            : allowedTypes.map((t) => acceptMap[t] ?? "").filter(Boolean).join(",");
          const typeLabels: Record<string, string> = { image: "Images", document: "Documents", pdf: "PDF", all_files: "All files" };
          const hint = allowedTypes.map((t) => typeLabels[t] ?? t).join(", ");
          const fmtSize = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

          return (
            <>
              <label htmlFor={inputId}
                className={`border rounded d-flex align-items-center gap-3 px-3 position-relative${error ? " border-danger" : ""}`}
                style={{ cursor: "pointer", background: "#fafafa", minHeight: 56 }}>
                <i className="ti ti-paperclip fs-20 text-muted flex-shrink-0" />
                {file ? (
                  <div className="d-flex flex-column overflow-hidden py-2">
                    <span className="fw-medium fs-13 text-truncate">{file.name}</span>
                    <small className="text-muted">{fmtSize(file.size)}</small>
                  </div>
                ) : (
                  <div className="d-flex flex-column py-2">
                    <span className="fw-medium fs-13">Click to attach a file</span>
                    <small className="text-muted">{hint}</small>
                  </div>
                )}
                {file && (
                  <button type="button" className="btn btn-sm btn-link text-danger text-decoration-none ms-auto p-0 flex-shrink-0"
                    onClick={(e) => { e.preventDefault(); setFiles((p) => ({ ...p, [key]: null })); onChange(""); }}>
                    <i className="ti ti-x fs-16" />
                  </button>
                )}
              </label>
              <input id={inputId} type="file" accept={accept} className="d-none"
                onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
                onChange={(e) => {
                  const f = e.target.files?.[0]; if (!f) return;
                  setFiles((p) => ({ ...p, [key]: f })); onChange(f.name); if (error) clearError(key);
                }} />
              {error && <div className="invalid-feedback d-block">{error}</div>}
            </>
          );
        }

        default:
          return <input type="text" className="form-control" value={value} onChange={(e) => onChange(e.target.value)} />;
      }
    };

    // ── Loading / empty states ────────────────────────────────────────────────

    if (loading) {
      return (
        <div className="py-4 d-flex align-items-center gap-2 text-muted fs-14">
          <span className="spinner-border spinner-border-sm" />
          Loading custom fields…
        </div>
      );
    }

    if (fields.length === 0) {
      return (
        <div className="py-5 text-center">
          <i className="ti ti-adjustments-off fs-32 text-muted mb-2 d-block" />
          <p className="fw-semibold fs-15 mb-1" style={{ color: "#333" }}>No custom fields configured</p>
          <p className="text-muted fs-13 mb-0" style={{ maxWidth: 340, margin: "0 auto" }}>
            Go to <strong>Settings → Custom Fields</strong> to add fields for this module.
          </p>
        </div>
      );
    }

    // ── Row layout (same pattern as newItem.tsx) ──────────────────────────────

    const FULL_WIDTH_TYPES = new Set(["text_multi", "attachment", "image"]);
    const rows: React.ReactElement[] = [];
    let i = 0;

    while (i < fields.length) {
      const field      = fields[i];
      const isFullWidth = FULL_WIDTH_TYPES.has(field.config.data_type);
      const key        = field.config.field_key;
      const val        = values[key] ?? "";
      const hasErr     = !!(errors[key]);

      if (isFullWidth) {
        rows.push(
          <div key={field.id} className="row mb-3 align-items-start">
            <label className={`col-sm-3 col-form-label fw-medium fs-14${field.config.is_mandatory || hasErr ? " text-danger" : ""}`}>
              {field.config.label}
              {field.config.is_mandatory && <span className="ms-1">*</span>}
            </label>
            <div className="col-sm-9">
              {renderInput(field, val, (v) => setValue(key, v))}
            </div>
          </div>
        );
        i++;
      } else {
        const next    = fields[i + 1];
        const hasPair = !!next && !FULL_WIDTH_TYPES.has(next.config.data_type);
        const nextKey = next?.config.field_key ?? "";
        const nextErr = !!(errors[nextKey]);

        rows.push(
          <div key={field.id} className="row mb-3 align-items-center g-0">
            {/* Left field */}
            <div className="col-sm-6 pe-3">
              <div className="row align-items-center g-0">
                <label className={`col-4 col-form-label fw-medium fs-14${field.config.is_mandatory || hasErr ? " text-danger" : ""}`}>
                  {field.config.label}
                  {field.config.is_mandatory && <span className="ms-1">*</span>}
                </label>
                <div className="col-8 ps-2">
                  {renderInput(field, val, (v) => setValue(key, v))}
                </div>
              </div>
            </div>
            {/* Right field */}
            {hasPair && next && (
              <div className="col-sm-6 ps-3">
                <div className="row align-items-center g-0">
                  <label className={`col-4 col-form-label fw-medium fs-14${next.config.is_mandatory || nextErr ? " text-danger" : ""}`}>
                    {next.config.label}
                    {next.config.is_mandatory && <span className="ms-1">*</span>}
                  </label>
                  <div className="col-8 ps-2">
                    {renderInput(next, values[nextKey] ?? "", (v) => setValue(nextKey, v))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
        i += hasPair ? 2 : 1;
      }
    }

    return <div>{rows}</div>;
  }
);

CustomFieldsPanel.displayName = "CustomFieldsPanel";
export default CustomFieldsPanel;
