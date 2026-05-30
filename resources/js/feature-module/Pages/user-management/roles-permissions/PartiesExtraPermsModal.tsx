import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import Select from "react-select";
import { fetchDistributionCategories } from "../../../../core/services/distributionCategoryApi";

interface Option { value: string; label: string; }

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExtraPermsValue {
  party_category_ids: number[];
}

interface Props {
  show:      boolean;
  onHide:    () => void;
  value:     ExtraPermsValue;
  readOnly?: boolean;
  onSave?:   (val: ExtraPermsValue) => void;
  title?:    string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const PartiesExtraPermsModal: React.FC<Props> = ({ show, onHide, value, readOnly = false, onSave, title = "Parties — Extra Permissions" }) => {
  const [draft,      setDraft]      = useState<ExtraPermsValue>(value);
  const [catOptions, setCatOptions] = useState<Option[]>([]);
  const [catLoading, setCatLoading] = useState(false);

  useEffect(() => { if (show) setDraft(value); }, [show]);

  useEffect(() => {
    if (!show || catOptions.length > 0) return;
    setCatLoading(true);
    fetchDistributionCategories().then(res => {
      if (res.success) {
        setCatOptions(res.data.map(c => ({ value: String(c.id), label: c.name })));
      }
    }).finally(() => setCatLoading(false));
  }, [show]);

  const selectedCatOptions = catOptions.filter(o => draft.party_category_ids.includes(Number(o.value)));

  const handleSave = () => { onSave?.(draft); onHide(); };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdropClassName="blurred-backdrop">

      {/* ── Header ── */}
      <Modal.Header
        closeButton={false}
        style={{ padding: "20px 24px 18px", borderBottom: "1px solid #f1f5f9", alignItems: "flex-start" }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1 }}>
          <div style={{
            width: 42, height: 42, borderRadius: "50%",
            background: "#fef2f2",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <i className="ti ti-shield-lock fs-18" style={{ color: "#ef4444" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 16, color: "#0f172a" }}>
              {title}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onHide}
          style={{
            width: 32, height: 32, borderRadius: "50%",
            border: "1.5px solid #fecaca", background: "#fef2f2",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0, padding: 0,
          }}
        >
          <i className="ti ti-x" style={{ fontSize: 14, color: "#ef4444", lineHeight: 1 }} />
        </button>
      </Modal.Header>

      {/* ── Body ── */}
      <Modal.Body className="px-4 pt-4 pb-3">

        {/* Category access section */}
        <p className="text-uppercase text-muted fw-semibold fs-12 mb-3" style={{ letterSpacing: "0.06em" }}>
          Party Distribution Category Access
        </p>
        <div style={{ width: "50%" }}>
          {readOnly ? (
            selectedCatOptions.length === 0 ? (
              <p className="text-muted fs-13 mb-0">All categories (no restriction)</p>
            ) : (
              <div className="d-flex flex-wrap gap-2">
                {selectedCatOptions.map(o => (
                  <span key={o.value} className="badge badge-soft-primary fs-12 px-2 py-1">{o.label}</span>
                ))}
              </div>
            )
          ) : (
            <>
              <p className="text-muted fs-13 mb-2">
                Select which distribution categories this role can access. Leave empty to allow all.
              </p>
              <Select
                classNamePrefix="react-select"
                isMulti
                options={catOptions}
                value={selectedCatOptions}
                placeholder={catLoading ? "Loading categories…" : "Select categories (leave empty for all)"}
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
                }}
                onChange={(selected) => {
                  const ids = (selected as Option[]).map(o => Number(o.value));
                  setDraft(d => ({ ...d, party_category_ids: ids }));
                }}
              />
            </>
          )}
        </div>

      </Modal.Body>

      {/* ── Footer ── */}
      <Modal.Footer style={{ padding: "16px 24px 22px", borderTop: "1px solid #f1f5f9", justifyContent: "flex-start" }}>
        {!readOnly ? (
          <>
            <button type="button" className="btn btn-danger me-2" onClick={handleSave}>
              Save
            </button>
            <button type="button" className="btn btn-outline-light" style={{ textDecoration: "none" }} onClick={onHide}>
              Cancel
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-outline-light" style={{ textDecoration: "none" }} onClick={onHide}>
            Close
          </button>
        )}
      </Modal.Footer>

    </Modal>
  );
};

export default PartiesExtraPermsModal;
