import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation as useRouterLocation } from "react-router";
import { Toast } from "react-bootstrap";
import Select from "react-select";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import CommonSelect from "../../../../components/common-select/commonSelect";
import { assignSeriesLocations, storeSeries, updateSeries } from "../../../../core/services/seriesApi";
import { type LocationListItem } from "../../../../core/services/locationApi";
import { getSeriesDetail, bustSeries, bustSeriesLists } from "../../../../core/cache/seriesCache";
import { getLocationList, bustLocationLists } from "../../../../core/cache/locationCache";
import { emitMutation } from "../../../../core/cache/mutationEvents";
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

const CUSTOMER_CATEGORY_OPTIONS = [
  { value: "retail",      label: "Retail"      },
  { value: "wholesale",   label: "Wholesale"   },
  { value: "vip",         label: "VIP"         },
  { value: "corporate",   label: "Corporate"   },
  { value: "distributor", label: "Distributor" },
];

const PLACEHOLDER_ITEMS: { label: string; token?: string; sub: { label: string; token: string }[] | null }[] = [
  { label: "Fiscal Year Start", sub: [{ label: "YY", token: "%FYS_YY%" }, { label: "YYYY", token: "%FYS_YYYY%" }] },
  { label: "Fiscal Year End",   sub: [{ label: "YY", token: "%FYE_YY%" }, { label: "YYYY", token: "%FYE_YYYY%" }] },
  { label: "Transaction Year",  sub: [{ label: "YY", token: "%TY_YY%"  }, { label: "YYYY", token: "%TY_YYYY%"  }] },
  { label: "Transaction Date",  token: "%TD%", sub: null },
  { label: "Transaction Month", token: "%TM%", sub: null },
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
  const returnTo = (useRouterLocation().state as { returnTo?: string } | null)?.returnTo ?? null;

  const [seriesName,        setSeriesName]        = useState("");
  const [customerCategory,  setCustomerCategory]  = useState<string | null>(null);
  const [modules,           setModules]           = useState<SeriesModule[]>(DEFAULT_MODULES.map(m => ({ ...m })));
  const [errors,            setErrors]            = useState<Record<string, string>>({});
  const [saving,            setSaving]            = useState(false);
  const [loadingInitial,    setLoadingInitial]    = useState(true);

  // Location assignment
  const [allLocations,      setAllLocations]      = useState<LocationListItem[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<Set<number>>(new Set());

  // Placeholder variable dropdown
  const [placeholderTarget,  setPlaceholderTarget]  = useState<{ rowIdx: number; top: number; left: number; right: number } | null>(null);
  const [hoveredPlaceholder, setHoveredPlaceholder] = useState<number | null>(null);

  // Toast — signature aligned with location.tsx: showToast(message, type)
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "error"; message: string }>({ show: false, type: "success", message: "" });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (message: string, type: "success" | "error" = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  const clr = (key: string) => setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });

  // ── Initial load ──────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoadingInitial(true);

      if (isEditMode && seriesId) {
        const sid = Number(seriesId);
        const [seriesResult, locData] = await Promise.all([
          getSeriesDetail(sid).catch(() => null),
          getLocationList().catch(() => null),
        ]);

        if (!seriesResult) {
          showToast("Failed to load series data.", "error");
        } else {
          setSeriesName(seriesResult.name ?? "");
          setCustomerCategory((seriesResult as any).customer_category ?? null);
          const stored = seriesResult.modules_config?.modules ?? [];
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
        }

        if (!locData) {
          showToast("Failed to load locations.", "error");
        } else {
          setAllLocations(locData);
          if (seriesResult) {
            const assigned = new Set(
              locData.filter(l => l.default_txn_series_id === sid).map(l => l.id)
            );
            setSelectedLocations(assigned);
          }
        }
      } else {
        const locData = await getLocationList().catch(() => null);
        if (!locData) {
          showToast("Failed to load locations.", "error");
        } else {
          setAllLocations(locData);
        }
      }

      setLoadingInitial(false);
    })();
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

  const handleRefresh = useCallback(async () => {
    try {
      if (isEditMode && seriesId) {
        const sid = Number(seriesId);
        bustSeries(sid);
        bustLocationLists();
        const [s, locData] = await Promise.all([
          getSeriesDetail(sid).catch(() => null),
          getLocationList().catch(() => null),
        ]);
        if (!s) {
          showToast("Failed to reload series data.", "error");
        } else {
          setSeriesName(s.name ?? "");
          setCustomerCategory((s as any).customer_category ?? null);
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
        }
        if (!locData) {
          showToast("Failed to reload locations.", "error");
        } else {
          setAllLocations(locData);
          if (s) {
            const assigned = new Set(
              locData.filter(l => l.default_txn_series_id === sid).map(l => l.id)
            );
            setSelectedLocations(assigned);
          }
        }
      } else {
        bustLocationLists();
        const locData = await getLocationList().catch(() => null);
        if (!locData) {
          showToast("Failed to reload locations.", "error");
        } else {
          setAllLocations(locData);
        }
      }
    } catch {
      showToast("Failed to refresh. Please try again.", "error");
    }
  }, [isEditMode, seriesId]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!seriesName.trim()) errs.seriesName = "Series name is required.";
    const badMod = modules.find(m => {
      const s = m.startingNumber.trim();
      return !s || !/^\d+$/.test(s) || parseInt(s, 10) < 1;
    });
    if (badMod) errs.modules = `"${badMod.module}" starting number must be a positive whole number.`;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      showToast("Please fill in all required fields before saving.", "error");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        name:    seriesName.trim(),
        modules: modules.map(m => ({
          module:            m.module,
          prefix:            m.prefix,
          starting_number:   m.startingNumber,
          restart_numbering: m.restartNumbering,
        })),
        customer_category: customerCategory ?? null,
      };

      const res = isEditMode
        ? await updateSeries(Number(seriesId), payload)
        : await storeSeries(payload);

      if (res.success) {
        const targetId = isEditMode ? Number(seriesId) : res.data.id;

        if (selectedLocations.size > 0) {
          const assignRes = await assignSeriesLocations(targetId, Array.from(selectedLocations)).catch(() => null);
          if (!assignRes?.success) {
            showToast("Series saved but location assignments could not be applied — please retry.", "error");
            bustSeries(targetId);
            bustLocationLists();
            emitMutation("series:mutated");
            emitMutation("locations:mutated");
            setSaving(false);
            return;
          }
        }

        bustSeries(targetId);
        bustLocationLists();
        emitMutation("series:mutated");
        emitMutation("locations:mutated");
        showToast(res.message ?? (isEditMode ? "Series updated successfully." : "Series created successfully."));
        setTimeout(() => {
          if (isEditMode) {
            navigate(`/locations/series/${seriesId}`);
          } else if (returnTo) {
            navigate(returnTo, { state: { newSeries: { id: targetId, name: seriesName.trim() } } });
          } else {
            navigate(`/locations/series/${targetId}`);
          }
        }, 1500);
      } else {
        showToast(res.message ?? (isEditMode ? "Failed to update series." : "Failed to save series."), "error");
        if ("errors" in res && res.errors) {
          const apiErrs: Record<string, string> = {};
          Object.entries(res.errors).forEach(([key, msgs]) => {
            if (key === "name") apiErrs.seriesName = (msgs as string[])[0];
          });
          if (Object.keys(apiErrs).length > 0) setErrors(prev => ({ ...prev, ...apiErrs }));
        }
      }
    } catch {
      showToast(isEditMode ? "Failed to update series." : "Failed to save series.", "error");
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate(route.locations));

  if (loadingInitial) {
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
            onRefresh={handleRefresh}
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
                  <div className="common-select">
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
                          backgroundColor: state.isSelected ? "#E41F07" : "white",
                          color: state.isSelected ? "#fff" : state.isFocused ? "#E41F07" : "#707070",
                          cursor: "pointer",
                          "&:hover": { backgroundColor: "#E41F07", color: "#fff" },
                        }),
                        menu: (base) => ({ ...base, zIndex: 999 }),
                      }}
                      placeholder="Select locations…"
                      components={{ IndicatorSeparator: () => null }}
                      onChange={(sel) => {
                        setSelectedLocations(new Set((sel as { value: number; label: string }[]).map(o => o.value)));
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* ── Customer Category ────────────────────────────── */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label fw-medium fs-14">
                  Customer Category
                </label>
                <div className="col-sm-10">
                  <CommonSelect
                    className="select"
                    isClearable
                    options={CUSTOMER_CATEGORY_OPTIONS}
                    value={CUSTOMER_CATEGORY_OPTIONS.find(o => o.value === customerCategory) ?? null}
                    placeholder="Select customer category…"
                    onChange={opt => setCustomerCategory(opt ? opt.value : null)}
                  />
                </div>
              </div>

              {/* ── Modules table ─────────────────────────────────── */}
              <div className="row mb-3">
                <div className="col-12">

                  <div className="d-flex align-items-center gap-3 mb-3">
                    <span className="text-uppercase fw-semibold fs-13 text-muted" style={{ letterSpacing: "0.07em", whiteSpace: "nowrap" }}>
                      Module Settings
                    </span>
                    <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
                  </div>

                  <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                    <div className="border rounded overflow-hidden" style={{ minWidth: 860 }}>

                      {/* Header */}
                      <div
                        className="d-flex align-items-center px-3 py-2 border-bottom"
                        style={{ background: "#f8f9fa", gap: 24 }}
                      >
                        <div style={{ width: 150, flexShrink: 0 }}>
                          <span className="fw-semibold fs-12 text-uppercase text-muted">Module</span>
                        </div>
                        <div style={{ flex: 3 }}>
                          <span className="fw-semibold fs-12 text-uppercase text-muted">Prefix</span>
                        </div>
                        <div style={{ flex: 2 }}>
                          <span className="fw-semibold fs-12 text-uppercase text-muted">Starting No.</span>
                        </div>
                        <div style={{ flex: 2 }}>
                          <span className="fw-semibold fs-12 text-uppercase text-muted">Restart Numbering</span>
                        </div>
                        <div style={{ flex: 2 }}>
                          <span className="fw-semibold fs-12 text-uppercase text-muted">Preview</span>
                        </div>
                      </div>

                      {/* Rows */}
                      {modules.map((m, i) => (
                        <div
                          key={m.module}
                          className="d-flex align-items-center px-3 border-bottom"
                          style={{ gap: 24, paddingTop: 10, paddingBottom: 10, background: "#fff" }}
                        >
                          {/* Module name */}
                          <div className="fs-14 fw-medium" style={{ width: 150, flexShrink: 0, color: "#344054", whiteSpace: "nowrap" }}>
                            {m.module}
                          </div>

                          {/* Prefix + variable button */}
                          <div style={{ flex: 3 }}>
                            <div className="input-group" style={{ flexWrap: "nowrap" }}>
                              <input
                                type="text"
                                className="form-control fs-14"
                                style={{ height: 37 }}
                                value={m.prefix}
                                onChange={e => setMod(i, "prefix", e.target.value)}
                                placeholder="e.g. INV-"
                              />
                              <button
                                type="button"
                                className="btn btn-outline-danger d-flex align-items-center justify-content-center"
                                style={{ width: 40, padding: 0, flexShrink: 0 }}
                                title="Insert variable placeholder"
                                onClick={e => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setPlaceholderTarget({ rowIdx: i, top: rect.bottom + 4, left: rect.left, right: window.innerWidth - rect.right });
                                }}
                              >
                                <i className="ti ti-plus fs-14" />
                              </button>
                            </div>
                          </div>

                          {/* Starting number */}
                          <div style={{ flex: 2 }}>
                            <input
                              type="text"
                              className="form-control fs-14"
                              style={{ height: 37 }}
                              value={m.startingNumber}
                              onChange={e => setMod(i, "startingNumber", e.target.value)}
                              placeholder="00001"
                            />
                          </div>

                          {/* Restart numbering */}
                          <div style={{ flex: 2 }}>
                            <select
                              className="form-select fs-14"
                              style={{ height: 37 }}
                              value={m.restartNumbering}
                              onChange={e => setMod(i, "restartNumbering", e.target.value)}
                            >
                              {RESTART_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>

                          {/* Preview */}
                          <div
                            className="fs-13 text-muted"
                            style={{ flex: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                            title={pvw(m.prefix, m.startingNumber)}
                          >
                            {pvw(m.prefix, m.startingNumber) || <span style={{ color: "#ccc" }}>—</span>}
                          </div>
                        </div>
                      ))}

                    </div>
                  </div>
                  {errors.modules && (
                    <div className="text-danger fs-13 mt-2 d-flex align-items-center gap-1">
                      <i className="ti ti-alert-circle fs-14" />
                      {errors.modules}
                    </div>
                  )}
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
              ? <><span className="spinner-border spinner-border-sm me-1" role="status" />{isEditMode ? "Updating…" : "Saving…"}</>
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
        style={{ zIndex: 9999, pointerEvents: "none" }}
      >
        <Toast
          show={toast.show}
          onClose={() => setToast(t => ({ ...t, show: false }))}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
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
