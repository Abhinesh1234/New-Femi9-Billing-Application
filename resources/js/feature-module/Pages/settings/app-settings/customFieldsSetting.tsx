import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Modal, Toast } from "react-bootstrap";
import PageHeader from "../../../../components/page-header/pageHeader";
import SettingsTopbar from "../settings-topbar/settingsTopbar";
import Footer from "../../../../components/footer/footer";
import { all_routes } from "../../../../routes/all_routes";
import {
  fetchCustomFields,
  updateCustomField,
  deleteCustomField,
  type CustomField,
  type CustomFieldConfig,
} from "../../../../core/services/customFieldApi";

// ─── Module meta ──────────────────────────────────────────────────────────────

const MODULES: { value: string; label: string }[] = [
  { value: "products",        label: "Items" },
  { value: "contacts",        label: "Contacts" },
  { value: "companies",       label: "Companies" },
  { value: "invoices",        label: "Invoices" },
  { value: "sales_orders",    label: "Sales Orders" },
  { value: "purchase_orders", label: "Purchase Orders" },
  { value: "vendors",         label: "Vendors" },
  { value: "customers",       label: "Customers" },
];

const DATA_TYPE_LABELS: Record<string, string> = {
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

// ─── Component ────────────────────────────────────────────────────────────────

const CustomFieldsSetting = () => {
  const navigate      = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialModule = MODULES.some((m) => m.value === searchParams.get("module"))
    ? searchParams.get("module")!
    : "products";

  const [activeModule, setActiveModule]     = useState(initialModule);
  const [fields, setFields]                 = useState<CustomField[]>([]);
  const [loading, setLoading]               = useState(false);
  const [loadError, setLoadError]           = useState<string | null>(null);
  const [actionId, setActionId]             = useState<number | null>(null);

  type DeleteModal = { show: boolean; field: CustomField | null; deleting: boolean };
  const [deleteModal, setDeleteModal] = useState<DeleteModal>({ show: false, field: null, deleting: false });

  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger"; message: string }>({
    show: false, type: "success", message: "",
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Toast helpers ──────────────────────────────────────────────────────────
  const showToast = useCallback((type: "success" | "danger", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
  }, []);

  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // ── Load fields ────────────────────────────────────────────────────────────
  const loadFields = useCallback(async (module: string) => {
    setLoading(true);
    setLoadError(null);
    const res = await fetchCustomFields(module);
    if (res.success) {
      setFields(res.data);
    } else {
      setLoadError(res.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFields(activeModule);
  }, [activeModule, loadFields]);

  // ── Module tab switch ──────────────────────────────────────────────────────
  const handleModuleChange = (module: string) => {
    setActiveModule(module);
    setFields([]);
    setSearchParams({ module }, { replace: true });
  };

  // ── Inline toggle actions (is_active, show_in_all_pdfs, is_mandatory) ─────
  const handleAction = useCallback(async (field: CustomField, patch: Partial<CustomFieldConfig>) => {
    setActionId(field.id);
    const res = await updateCustomField(field.id, { ...field.config, ...patch });
    if (res.success) {
      setFields((prev) => prev.map((f) => (f.id === field.id ? res.data : f)));
      showToast("success", res.message);
    } else {
      showToast("danger", res.message);
    }
    setActionId(null);
  }, [showToast]);

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    const { field } = deleteModal;
    if (!field) return;
    setDeleteModal((m) => ({ ...m, deleting: true }));
    const res = await deleteCustomField(field.id);
    if (res.success) {
      setFields((prev) => prev.filter((f) => f.id !== field.id));
      setDeleteModal({ show: false, field: null, deleting: false });
      showToast("success", "Custom field deleted successfully.");
    } else {
      setDeleteModal((m) => ({ ...m, deleting: false }));
      showToast("danger", res.message);
    }
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <PageHeader
            title="Settings"
            badgeCount={false}
            showModuleTile={false}
            showExport={false}
          />
          <SettingsTopbar />

          <div className="row">
            {/* ── Left sidebar ── */}
            <div className="col-xl-3 col-lg-12 theiaStickySidebar">
              <div className="card mb-3 mb-xl-0 filemanager-left-sidebar">
                <div className="card-body">
                  <div className="settings-sidebar">
                    <h5 className="mb-3 fs-17">App Settings</h5>
                    <div className="list-group list-group-flush settings-sidebar">
                      <Link to={all_routes.invoiceSettings} className="d-block p-2 fw-medium">
                        Invoice Settings
                      </Link>
                      <Link to={all_routes.printers} className="d-block p-2 fw-medium">
                        Printer
                      </Link>
                      <Link to={all_routes.customFields} className="d-block p-2 fw-medium active">
                        Custom Fields
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Main content ── */}
            <div className="col-xl-9 col-lg-12">
              <div className="card mb-0">
                <div className="card-body p-0">

                  {/* Header row */}
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 px-4 pt-4 pb-3 border-bottom">
                    <h5 className="mb-0 fs-17">Custom Fields</h5>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                      onClick={() => navigate(`${all_routes.productCustomField}?module=${activeModule}`)}
                    >
                      <i className="ti ti-square-rounded-plus-filled" />
                      Add New Field
                    </button>
                  </div>

                  {/* Module tabs */}
                  <div className="border-bottom px-4">
                    <ul className="nav nav-tabs border-0 flex-nowrap overflow-auto" style={{ whiteSpace: "nowrap" }}>
                      {MODULES.map((m) => (
                        <li key={m.value} className="nav-item me-2">
                          <button
                            type="button"
                            className={`nav-link px-0 pb-3 me-3 border-0 rounded-0 fw-medium bg-transparent ${
                              activeModule === m.value
                                ? "active text-primary border-bottom border-3 border-primary"
                                : "text-muted"
                            }`}
                            onClick={() => handleModuleChange(m.value)}
                          >
                            {m.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Content area */}
                  <div className="p-4">

                    {/* Loading */}
                    {loading && (
                      <div className="d-flex align-items-center gap-2 py-5 justify-content-center text-muted">
                        <div className="spinner-border spinner-border-sm text-primary" role="status" />
                        <span>Loading custom fields…</span>
                      </div>
                    )}

                    {/* Error */}
                    {!loading && loadError && (
                      <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-0">
                        <i className="ti ti-alert-circle fs-16 flex-shrink-0" />
                        <span className="flex-grow-1">{loadError}</span>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger ms-auto"
                          onClick={() => loadFields(activeModule)}
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    {/* Empty */}
                    {!loading && !loadError && fields.length === 0 && (
                      <div className="text-muted text-center py-5">
                        <i className="ti ti-layout-list fs-32 d-block mb-2 opacity-50" />
                        No custom fields yet for{" "}
                        <strong>{MODULES.find((m) => m.value === activeModule)?.label}</strong>.{" "}
                        Click <strong>Add New Field</strong> to create one.
                      </div>
                    )}

                    {/* Table */}
                    {!loading && !loadError && fields.length > 0 && (
                      <div className="table-responsive">
                        <table className="table table-nowrap mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Field Name</th>
                              <th>Data Type</th>
                              <th>Mandatory</th>
                              <th>Show in All PDFs</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {fields.map((cf) => {
                              const c        = cf.config;
                              const isActing = actionId === cf.id;
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
                                          onChange={() => !c.is_system && handleAction(cf, { is_mandatory: !c.is_mandatory })}
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
                                  <td>
                                    <div className="dropdown">
                                      <button
                                        type="button"
                                        className="btn btn-outline-light d-flex align-items-center justify-content-center"
                                        style={{ width: 38, height: 38 }}
                                        data-bs-toggle="dropdown"
                                      >
                                        <i className="ti ti-dots-vertical fs-14 text-muted" />
                                      </button>
                                      <div className="dropdown-menu dropdown-menu-right dropmenu-hover-primary">
                                        {!c.is_system && (
                                          <button
                                            className="dropdown-item d-flex align-items-center gap-2 fs-13"
                                            onClick={() => navigate(all_routes.productCustomFieldEdit.replace(":id", String(cf.id)))}
                                            disabled={isActing}
                                          >
                                            <i className="ti ti-edit fs-13" /> Edit
                                          </button>
                                        )}
                                        <button
                                          className="dropdown-item d-flex align-items-center gap-2 fs-13"
                                          onClick={() => handleAction(cf, { is_active: !c.is_active })}
                                          disabled={isActing}
                                        >
                                          <i className={`ti ${c.is_active ? "ti-circle-x" : "ti-circle-check"} fs-13`} />
                                          {c.is_active ? "Mark as Inactive" : "Mark as Active"}
                                        </button>
                                        <button
                                          className="dropdown-item d-flex align-items-center gap-2 fs-13"
                                          onClick={() => handleAction(cf, { show_in_all_pdfs: !c.show_in_all_pdfs })}
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
                                              onClick={() => setDeleteModal({ show: true, field: cf, deleting: false })}
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

                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      {/* ── Delete Confirmation Modal ── */}
      <Modal
        show={deleteModal.show}
        onHide={() => !deleteModal.deleting && setDeleteModal((m) => ({ ...m, show: false }))}
        centered
        size="md"
      >
        <Modal.Body className="p-5">
          <div className="text-center">
            <div className="mb-4">
              <span
                className="avatar badge-soft-danger border-0 text-danger rounded-circle d-inline-flex align-items-center justify-content-center"
                style={{ width: 72, height: 72 }}
              >
                <i className="ti ti-trash" style={{ fontSize: 34 }} />
              </span>
            </div>
            <h3 className="mb-3 fw-semibold">Delete Confirmation</h3>
            <p className="mb-0 text-muted fs-15">
              Are you sure you want to delete <strong>{deleteModal.field?.config.label}</strong>?
              This cannot be undone.
            </p>
            <div className="d-flex align-items-center justify-content-center gap-3 mt-5">
              <button
                type="button"
                className="btn btn-cancel px-5 py-2 fs-15"
                onClick={() => setDeleteModal((m) => ({ ...m, show: false }))}
                disabled={deleteModal.deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger px-5 py-2 fs-15"
                onClick={handleDeleteConfirm}
                disabled={deleteModal.deleting}
              >
                {deleteModal.deleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" />
                    Deleting…
                  </>
                ) : "Yes, Delete"}
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* ── Toast ── */}
      <div
        className="position-fixed top-0 start-50 translate-middle-x pt-4"
        style={{ zIndex: 9999, pointerEvents: "none" }}
      >
        <Toast
          show={toast.show}
          onClose={() => setToast((t) => ({ ...t, show: false }))}
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
                toast.type === "success" ? "bg-success" : "bg-danger"
              }`}
              style={{ width: "36px", height: "36px" }}
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

export default CustomFieldsSetting;
