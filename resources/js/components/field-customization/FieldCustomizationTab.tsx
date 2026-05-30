import { useEffect, useRef, useState } from "react";
import { Toast } from "react-bootstrap";
import { useNavigate } from "react-router";
import {
  fetchCustomFields,
  updateCustomField,
  deleteCustomField,
  type CustomField,
  type CustomFieldConfig,
} from "../../core/services/customFieldApi";

export const DATA_TYPE_LABELS: Record<string, string> = {
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

interface Props {
  module: string;
  addRoute: string;
  editRoute: string;
  refreshKey?: number;
  onRefreshDone?: () => void;
  onToast?: (type: "success" | "danger" | "warning", message: string) => void;
}

type DeleteModal = { show: boolean; field: CustomField | null; deleting: boolean };

const FieldCustomizationTab = ({ module, addRoute, editRoute, refreshKey, onRefreshDone, onToast }: Props) => {
  const navigate = useNavigate();

  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [cfLoading, setCfLoading]       = useState(false);
  const [cfFetchError, setCfFetchError] = useState<string | null>(null);
  const [cfActionId, setCfActionId]     = useState<number | null>(null);
  const [deleteModal, setDeleteModal]   = useState<DeleteModal>({ show: false, field: null, deleting: false });

  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger" | "warning"; message: string }>({
    show: false, type: "success", message: "",
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (type: "success" | "danger" | "warning", message: string) => {
    if (onToast) { onToast(type, message); return; }
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  const loadCustomFields = async (done?: () => void) => {
    setCfLoading(true);
    setCfFetchError(null);
    const res = await fetchCustomFields(module);
    if (res.success) {
      setCustomFields(res.data);
    } else {
      setCfFetchError(res.message);
    }
    setCfLoading(false);
    done?.();
  };

  useEffect(() => { loadCustomFields(); }, [module]);

  useEffect(() => {
    if (refreshKey === undefined || refreshKey === 0) return;
    loadCustomFields(onRefreshDone);
  }, [refreshKey]);

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

  const openDeleteModal = (field: CustomField) =>
    setDeleteModal({ show: true, field, deleting: false });

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

  return (
    <>
      <div className="p-4">
        {/* Header */}
        <div className="border-bottom mb-3 pb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h5 className="mb-0 fs-17">Custom Fields</h5>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate(addRoute)}
          >
            <i className="ti ti-square-rounded-plus-filled me-1" />
            Add New Field
          </button>
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
                  <th style={{ width: "1%", whiteSpace: "nowrap" }}>Action</th>
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
                        <div className="text-muted" style={{ fontSize: "11px" }}>{c.field_key}</div>
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
                      <td style={{ width: "1%", whiteSpace: "nowrap" }}>
                        <div className="dropdown">
                          <button
                            type="button"
                            className="btn btn-outline-light d-flex align-items-center justify-content-center"
                            style={{ width: 38, height: 38 }}
                            data-bs-toggle="dropdown"
                            data-bs-strategy="fixed"
                          >
                            <i className="ti ti-dots-vertical fs-14 text-muted" />
                          </button>
                          <div className="dropdown-menu dropdown-menu-right dropmenu-hover-primary" style={{ zIndex: 999 }}>
                            {!c.is_system && (
                              <button
                                className="dropdown-item d-flex align-items-center gap-2 fs-13"
                                onClick={() => navigate(editRoute.replace(":id", String(cf.id)))}
                                disabled={isActing}
                              >
                                <i className="ti ti-edit fs-13" /> Edit
                              </button>
                            )}
                            <button
                              className="dropdown-item d-flex align-items-center gap-2 fs-13"
                              onClick={() => handleCfAction(cf, { is_active: !c.is_active })}
                              disabled={isActing}
                            >
                              <i className={`ti ${c.is_active ? "ti-circle-x" : "ti-circle-check"} fs-13`} />
                              {c.is_active ? "Mark as Inactive" : "Mark as Active"}
                            </button>
                            <button
                              className="dropdown-item d-flex align-items-center gap-2 fs-13"
                              onClick={() => handleCfAction(cf, { show_in_all_pdfs: !c.show_in_all_pdfs })}
                              disabled={isActing}
                            >
                              <i className={`ti ${c.show_in_all_pdfs ? "ti-eye-off" : "ti-eye"} fs-13`} />
                              {c.show_in_all_pdfs ? "Hide in All PDFs" : "Show in All PDFs"}
                            </button>
                            {!c.is_system && (
                              <>
                                <hr className="dropdown-divider m-1" />
                                <button
                                  className="dropdown-item d-flex align-items-center gap-2 fs-13 text-danger"
                                  onClick={() => openDeleteModal(cf)}
                                  disabled={isActing}
                                >
                                  <i className="ti ti-trash fs-13" /> Delete
                                </button>
                              </>
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

      {/* Toast — only rendered when parent doesn't own the toast via onToast prop */}
      {!onToast && (
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
                  toast.type === "success" ? "bg-success" : toast.type === "danger" ? "bg-danger" : "bg-warning"
                }`}
                style={{ width: "36px", height: "36px" }}
              >
                <i
                  className={`ti fs-16 text-white ${
                    toast.type === "success" ? "ti-check" : toast.type === "danger" ? "ti-x" : "ti-alert-triangle"
                  }`}
                />
              </span>
              <span className="fw-medium fs-14">{toast.message}</span>
            </Toast.Body>
          </Toast>
        </div>
      )}

      {/* Delete confirmation popup */}
      {deleteModal.show && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 1060, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}
          onClick={(e) => { if (e.target === e.currentTarget && !deleteModal.deleting) setDeleteModal((m) => ({ ...m, show: false })); }}
        >
          <div style={{ background: "#fff", borderRadius: 14, padding: "32px 28px 24px", width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <i className="ti ti-trash" style={{ fontSize: 24, color: "#ef4444" }} />
            </div>
            <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 16, color: "#0f172a", textAlign: "center" }}>
              Delete "{deleteModal.field?.config.label}"?
            </p>
            <p style={{ margin: "0 0 24px", fontSize: 13.5, color: "#64748b", textAlign: "center", lineHeight: 1.55 }}>
              This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              <button
                className="btn btn-light flex-grow-1"
                style={{ fontWeight: 500, fontSize: 14, height: 44 }}
                onClick={() => setDeleteModal((m) => ({ ...m, show: false }))}
                disabled={deleteModal.deleting}
              >
                Cancel
              </button>
              <button
                className="btn flex-grow-1"
                style={{ background: "#ef4444", color: "#fff", fontWeight: 500, fontSize: 14, border: "none", height: 44 }}
                onClick={handleDeleteConfirm}
                disabled={deleteModal.deleting}
              >
                {deleteModal.deleting
                  ? <><span className="spinner-border spinner-border-sm me-2" style={{ width: 14, height: 14, borderWidth: 2 }} />Deleting…</>
                  : "Delete"
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FieldCustomizationTab;
