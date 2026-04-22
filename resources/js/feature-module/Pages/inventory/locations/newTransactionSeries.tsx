import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Toast } from "react-bootstrap";
import Select from "react-select";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import { assignSeriesLocations, showSeries, storeSeries, updateSeries } from "../../../../core/services/seriesApi";
import { fetchLocations, type LocationListItem } from "../../../../core/services/locationApi";
import { all_routes } from "../../../../routes/all_routes";

const route = all_routes;

/* ── Types & defaults ─────────────────────────────────────────────── */

interface SeriesModule {
  module: string;
  prefix: string;
  startingNumber: string;
  restartNumbering: string;
}

const DEFAULT_MODULES: SeriesModule[] = [
  { module: "Credit Note",       prefix: "CN-",   startingNumber: "00001",  restartNumbering: "None" },
  { module: "Customer Payment",  prefix: "",      startingNumber: "1",      restartNumbering: "None" },
  { module: "Purchase Order",    prefix: "PO-",   startingNumber: "00001",  restartNumbering: "None" },
  { module: "Sales Order",       prefix: "SO-",   startingNumber: "00001",  restartNumbering: "None" },
  { module: "Vendor Payment",    prefix: "",      startingNumber: "1",      restartNumbering: "None" },
  { module: "Retainer Invoice",  prefix: "RET-",  startingNumber: "00001",  restartNumbering: "None" },
  { module: "Bill Of Supply",    prefix: "BOS-",  startingNumber: "000001", restartNumbering: "None" },
  { module: "Invoice",           prefix: "INV-",  startingNumber: "000001", restartNumbering: "None" },
  { module: "Sales Return",      prefix: "RMA-",  startingNumber: "00001",  restartNumbering: "None" },
  { module: "Delivery Challan",  prefix: "DC-",   startingNumber: "00001",  restartNumbering: "None" },
];

const RESTART_OPTIONS = ["None", "Every Month", "Every Year"];

const PLACEHOLDER_ITEMS = [
  { label: "Fiscal Year Start", sub: [{ label: "YY", token: "%FYS_YY%" }, { label: "YYYY", token: "%FYS_YYYY%" }] },
  { label: "Fiscal Year End",   sub: [{ label: "YY", token: "%FYE_YY%" }, { label: "YYYY", token: "%FYE_YYYY%" }] },
  { label: "Transaction Year",  sub: [{ label: "YY", token: "%TY_YY%"  }, { label: "YYYY", token: "%TY_YYYY%"  }] },
  { label: "Transaction Date",  sub: null as null, token: "%TD%" },
  { label: "Transaction Month", sub: null as null, token: "%TM%" },
];

/* ── Token resolution for preview ────────────────────────────────── */

const resolveTokens = (prefix: string): string => {
  const now = new Date();
  const m = now.getMonth();
  const y = now.getFullYear();
  const fysYear = m >= 3 ? y : y - 1;
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
    .replace(/%TM%/g,        String(now.getMonth() + 1).padStart(2, "0"));
};

const pvw = (prefix: string, num: string) => {
  const r = resolveTokens(prefix);
  return r ? `${r}${num}` : num;
};

/* ── Main page ────────────────────────────────────────────────────── */

const NewTransactionSeries = () => {
  const navigate = useNavigate();
  const { seriesId } = useParams<{ seriesId?: string }>();
  const isEditMode = !!seriesId;

  const [seriesName,     setSeriesName]     = useState("");
  const [modules,        setModules]        = useState<SeriesModule[]>(DEFAULT_MODULES.map(m => ({ ...m })));
  const [errors,         setErrors]         = useState<Record<string, string>>({});
  const [saving,         setSaving]         = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Location assignment
  const [allLocations,      setAllLocations]      = useState<LocationListItem[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<Set<number>>(new Set());

  // Placeholder variable dropdown
  const [placeholderTarget,  setPlaceholderTarget]  = useState<{ rowIdx: number; top: number; left: number; right: number } | null>(null);
  const [hoveredPlaceholder, setHoveredPlaceholder] = useState<number | null>(null);

  // Toast
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger"; message: string }>({ show: false, type: "success", message: "" });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (type: "success" | "danger", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  const clr = (key: string) => setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });

  // Fetch locations always; fetch series data in edit mode
  useEffect(() => {
    if (isEditMode && seriesId) {
      const sid = Number(seriesId);
      Promise.all([showSeries(sid), fetchLocations()])
        .then(([seriesRes, locRes]) => {
          if (seriesRes.success) {
            const s = seriesRes.data;
            setSeriesName(s.name ?? "");
            const stored = s.modules_config?.modules ?? [];
            if (stored.length > 0) {
              const merged = DEFAULT_MODULES.map(def => {
                const found = stored.find((m: any) => m.module === def.module);
                return found ? {
                  module:           found.module,
                  prefix:           found.prefix ?? "",
                  startingNumber:   found.starting_number ?? def.startingNumber,
                  restartNumbering: found.restart_numbering ?? def.restartNumbering,
                } : { ...def };
              });
              setModules(merged);
            }
          } else {
            showToast("danger", seriesRes.message ?? "Failed to load series.");
          }

          if (locRes.success) {
            setAllLocations(locRes.data);
            const assigned = new Set(
              locRes.data
                .filter(l => l.default_txn_series_id === sid)
                .map(l => l.id)
            );
            setSelectedLocations(assigned);
          }
        })
        .catch(() => showToast("danger", "Failed to load data."))
        .finally(() => setLoadingInitial(false));
    } else {
      fetchLocations()
        .then(locRes => { if (locRes.success) setAllLocations(locRes.data); })
        .catch(() => {})
        .finally(() => setLoadingInitial(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, seriesId]);

  const setMod = (i: number, key: keyof SeriesModule, v: string) =>
    setModules(prev => prev.map((m, idx) => idx === i ? { ...m, [key]: v } : m));

  const insertToken = (token: string) => {
    if (placeholderTarget === null) return;
    setMod(placeholderTarget.rowIdx, "prefix", modules[placeholderTarget.rowIdx].prefix + token);
    setPlaceholderTarget(null);
    setHoveredPlaceholder(null);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!seriesName.trim()) errs.seriesName = "Series name is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name:    seriesName.trim(),
        modules: modules.map(m => ({
          module:            m.module,
          prefix:            m.prefix,
          starting_number:   m.startingNumber,
          restart_numbering: m.restartNumbering,
        })),
      };

      const res = isEditMode
        ? await updateSeries(Number(seriesId), payload)
        : await storeSeries(payload);

      if (res.success) {
        // Persist location assignments for both create and edit
        const targetId = isEditMode ? Number(seriesId) : res.data.id;
        if (selectedLocations.size > 0) {
          await assignSeriesLocations(targetId, Array.from(selectedLocations));
        }
        showToast("success", res.message ?? (isEditMode ? "Series updated successfully." : "Series created successfully."));
        if (!isEditMode) {
          setTimeout(() => navigate(route.locations), 1500);
        }
      } else {
        showToast("danger", res.message ?? "Failed to save series.");
        if ("errors" in res && res.errors) {
          const apiErrs: Record<string, string> = {};
          Object.entries(res.errors).forEach(([key, msgs]) => {
            if (key === "name") apiErrs.seriesName = msgs[0];
          });
          if (Object.keys(apiErrs).length > 0) setErrors((prev) => ({ ...prev, ...apiErrs }));
        }
      }
    } catch {
      showToast("danger", "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate(route.locations));

  if (loadingInitial) {
    return (
      <div className="page-wrapper">
        <div className="content d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
          <span className="spinner-border text-danger" role="status" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-wrapper">
        <div className="content">

          <PageHeader
            title={isEditMode ? "Edit Series" : "New Series"}
            showModuleTile={false}
            showExport={false}
            showClose
            onClose={goBack}
          />

          <div className="card mb-0">
            <div className="card-body p-4">

              {/* ── Series Name ──────────────────────────────────── */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label fw-medium fs-14 text-danger">
                  Series Name<span className="ms-1">*</span>
                </label>
                <div className="col-sm-10">
                  <input
                    type="text"
                    className={`form-control${errors.seriesName ? " is-invalid" : ""}`}
                    placeholder="e.g. Default Transaction Series"
                    value={seriesName}
                    onChange={e => { setSeriesName(e.target.value); clr("seriesName"); }}
                  />
                  {errors.seriesName && <div className="invalid-feedback">{errors.seriesName}</div>}
                </div>
              </div>

              {/* ── Locations ────────────────────────────────────── */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label fw-medium fs-14">
                  Locations
                </label>
                <div className="col-sm-10">
                  <Select
                    classNamePrefix="react-select"
                    isMulti
                    options={allLocations.map(l => ({ value: l.id, label: l.name }))}
                    value={allLocations
                      .filter(l => selectedLocations.has(l.id))
                      .map(l => ({ value: l.id, label: l.name }))}
                    styles={{
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected ? "#E41F07" : state.isFocused ? "white" : "white",
                        color: state.isSelected ? "#fff" : state.isFocused ? "#E41F07" : "#707070",
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "#E41F07", color: "#fff" },
                      }),
                      control: (base) => ({
                        ...base,
                        "&:hover": { borderColor: "#E41F07" },
                      }),
                    }}
                    menuPlacement="auto"
                    placeholder="Select locations…"
                    components={{ IndicatorSeparator: () => null }}
                    onChange={(sel) => {
                      setSelectedLocations(new Set((sel as { value: number; label: string }[]).map(o => o.value)));
                    }}
                  />
                </div>
              </div>

              {/* ── Modules table ─────────────────────────────────── */}
              <div className="row mb-3">
                <div className="col-12">
                  <div className="table-responsive">
                    <table className="table table-borderless align-middle mb-0" style={{ minWidth: 560 }}>
                      <thead>
                        <tr style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "#888", letterSpacing: "0.05em", borderBottom: "1px solid #f0f0f0" }}>
                          <th style={{ whiteSpace: "nowrap", paddingBottom: 10 }}>Module</th>
                          <th style={{ whiteSpace: "nowrap", paddingBottom: 10, minWidth: 180 }}>Prefix</th>
                          <th style={{ whiteSpace: "nowrap", paddingBottom: 10, minWidth: 110 }}>Starting No.</th>
                          <th style={{ whiteSpace: "nowrap", paddingBottom: 10, minWidth: 150 }}>Restart Numbering</th>
                          <th style={{ whiteSpace: "nowrap", paddingBottom: 10, minWidth: 100 }}>Preview</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modules.map((m, i) => (
                          <tr key={m.module} style={{ borderBottom: "1px solid #f5f5f5" }}>

                            <td className="fs-14" style={{ paddingTop: 8, paddingBottom: 8, whiteSpace: "nowrap" }}>{m.module}</td>

                            <td style={{ paddingTop: 8, paddingBottom: 8 }}>
                              <div className="input-group input-group-sm" style={{ flexWrap: "nowrap" }}>
                                <input
                                  type="text"
                                  className="form-control fs-14"
                                  value={m.prefix}
                                  onChange={e => setMod(i, "prefix", e.target.value)}
                                  placeholder="Prefix"
                                />
                                <button
                                  type="button"
                                  className="btn btn-outline-danger"
                                  style={{ padding: "0 8px" }}
                                  onClick={e => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setPlaceholderTarget({ rowIdx: i, top: rect.bottom + 4, left: rect.left, right: window.innerWidth - rect.right });
                                  }}
                                >
                                  <i className="ti ti-plus fs-14" />
                                </button>
                              </div>
                            </td>

                            <td style={{ paddingTop: 8, paddingBottom: 8 }}>
                              <input
                                type="text"
                                className="form-control fs-14"
                                value={m.startingNumber}
                                onChange={e => setMod(i, "startingNumber", e.target.value)}
                                placeholder="00001"
                              />
                            </td>

                            <td style={{ paddingTop: 8, paddingBottom: 8 }}>
                              <select
                                className="form-select fs-14"
                                value={m.restartNumbering}
                                onChange={e => setMod(i, "restartNumbering", e.target.value)}
                              >
                                {RESTART_OPTIONS.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </td>

                            <td className="fs-14 text-muted" style={{ paddingTop: 8, paddingBottom: 8, whiteSpace: "nowrap" }} title={pvw(m.prefix, m.startingNumber)}>
                              {pvw(m.prefix, m.startingNumber)}
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

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
            {saving
              ? <><span className="spinner-border spinner-border-sm me-1" role="status" />Saving…</>
              : isEditMode ? "Update" : "Save"}
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

      {/* ── Toast Notifications ─────────────────────────────────────────── */}
      <div
        className="position-fixed top-0 start-50 translate-middle-x pt-4"
        style={{ zIndex: 99999, pointerEvents: "none" }}
      >
        <Toast
          show={toast.show}
          onClose={() => setToast(t => ({ ...t, show: false }))}
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

      {/* ── Placeholder variable dropdown (portal) ──────────────────── */}
      {placeholderTarget !== null && createPortal(
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 9998 }}
            onClick={() => { setPlaceholderTarget(null); setHoveredPlaceholder(null); }}
          />
          {(() => {
            const menuWidth    = 220;
            const subWidth     = 100;
            const vw           = window.innerWidth;
            const anchorLeft   = placeholderTarget.left + menuWidth <= vw - 8;
            const subOpensLeft = placeholderTarget.left + menuWidth + subWidth > vw - 8;
            return (
              <div
                className="bg-white border rounded shadow-sm"
                style={{
                  position: "fixed",
                  top: placeholderTarget.top,
                  ...(anchorLeft ? { left: placeholderTarget.left } : { right: placeholderTarget.right }),
                  zIndex: 9999,
                  minWidth: menuWidth,
                }}
                onClick={e => e.stopPropagation()}
              >
                {PLACEHOLDER_ITEMS.map((item, idx) => (
                  <div
                    key={item.label}
                    style={{ position: "relative" }}
                    onMouseEnter={() => setHoveredPlaceholder(idx)}
                    onMouseLeave={() => setHoveredPlaceholder(null)}
                  >
                    <div
                      className="px-3 py-2 fs-15 d-flex align-items-center justify-content-between"
                      style={{ cursor: "pointer", background: hoveredPlaceholder === idx ? "#f5f5f5" : "" }}
                      onClick={() => { if (!item.sub && item.token) insertToken(item.token); }}
                    >
                      <span>{item.label}</span>
                      {item.sub && <i className={`ti ti-chevron-${subOpensLeft ? "left" : "right"} fs-13 text-muted`} />}
                    </div>

                    {item.sub && hoveredPlaceholder === idx && (
                      <div
                        className="bg-white border rounded shadow-sm"
                        style={{
                          position: "absolute", top: 0,
                          ...(subOpensLeft ? { right: "100%" } : { left: "100%" }),
                          zIndex: 10000, minWidth: subWidth,
                        }}
                      >
                        {item.sub.map(s => (
                          <div
                            key={s.label}
                            className="px-3 py-2 fs-15"
                            style={{ cursor: "pointer" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#f5f5f5")}
                            onMouseLeave={e => (e.currentTarget.style.background = "")}
                            onClick={() => insertToken(s.token)}
                          >
                            {s.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </>,
        document.body,
      )}
    </>
  );
};

export default NewTransactionSeries;
