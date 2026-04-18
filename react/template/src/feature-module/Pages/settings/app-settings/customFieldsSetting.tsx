import { Link } from "react-router";
import PageHeader from "../../../../components/page-header/pageHeader";
import SettingsTopbar from "../settings-topbar/settingsTopbar";
import { all_routes } from "../../../../routes/all_routes";
import CommonSelect from "../../../../components/common-select/commonSelect";
import { Input_Type, Module } from "../../../../core/json/selectOption";

const CustomFieldsSetting = () => {
  return (
    <>
      {/* ========================
			Start Page Content
		========================= */}
      <div className="page-wrapper">
        {/* Start Content */}
        <div className="content">
          {/* Page Header */}
          <PageHeader
            title="Settings"
            badgeCount={false}
            showModuleTile={false}
            showExport={false}
          />
          {/* End Page Header */}
          <SettingsTopbar />
          {/* end card */}
          {/* start row */}
          <div className="row">
            <div className="col-xl-3 col-lg-12 theiaStickySidebar">
              <div className="card mb-3 mb-xl-0 filemanager-left-sidebar">
                <div className="card-body">
                  <div className="settings-sidebar">
                    <h5 className="mb-3 fs-17">App Settings</h5>
                    <div className="list-group list-group-flush settings-sidebar">
                      <Link
                        to={all_routes.invoiceSettings}
                        className="d-block p-2 fw-medium "
                      >
                        Invoice Settings
                      </Link>
                      <Link
                        to={all_routes.printers}
                        className="d-block p-2 fw-medium "
                      >
                        Printer
                      </Link>
                      <Link
                        to={all_routes.customFields}
                        className="d-block p-2 fw-medium active"
                      >
                        Custom Fields
                      </Link>
                    </div>
                  </div>
                </div>{" "}
                {/* end card body */}
              </div>{" "}
              {/* end card */}
            </div>{" "}
            {/* end col */}
            <div className="col-xl-9 col-lg-12">
              <div className="card mb-0">
                <div className="card-body">
                  <div className="border-bottom mb-3 pb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <h5 className="mb-0 fs-17">Custom Fields</h5>
                    <Link
                      to="javascript:void(0)"
                      className="btn btn-primary btn-sm"
                      data-bs-toggle="modal"
                      data-bs-target="#add_fields"
                    >
                      <i className="ti ti-square-rounded-plus-filled me-1" />
                      Add New Field
                    </Link>
                  </div>
                  {/* start table */}
                  <div className="table-responsive">
                    <table className="table table-nowrap">
                      <thead className="table-light">
                        <tr>
                          <th>Module</th>
                          <th>Label</th>
                          <th>Type</th>
                          <th>Default Value</th>
                          <th>Required</th>
                          <th>status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Contacts</td>
                          <td>Preferred Language</td>
                          <td>Select</td>
                          <td>English</td>
                          <td>
                            <div className="form-check form-switch p-0">
                              <label className="form-check-label d-flex align-items-center justify-content-center">
                                <input
                                  className="form-check-input switchCheckDefault"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </label>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-tag badge-soft-success">
                              Connected
                            </span>
                          </td>
                          <td>
                            <div className="dropdown table-action">
                              <Link
                                to="#"
                                className="action-icon btn btn-xs shadow d-inline-flex btn-outline-light"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <i className="ti ti-dots-vertical" />
                              </Link>
                              <div className="dropdown-menu dropdown-menu-right">
                                <Link
                                  className="dropdown-item d-flex align-items-center"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#edit_fields"
                                >
                                  <i className="ti ti-edit me-1" /> Edit
                                </Link>
                                <Link
                                  className="dropdown-item d-flex align-items-center"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_fields"
                                >
                                  <i className="ti ti-trash me-1" /> Delete
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>Projects</td>
                          <td>Project Type</td>
                          <td>Select</td>
                          <td>Internal</td>
                          <td>
                            <div className="form-check form-switch p-0">
                              <label className="form-check-label d-flex align-items-center justify-content-center">
                                <input
                                  className="form-check-input switchCheckDefault"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </label>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-tag badge-soft-success">
                              Connected
                            </span>
                          </td>
                          <td>
                            <div className="dropdown table-action">
                              <Link
                                to="#"
                                className="action-icon btn btn-xs shadow d-inline-flex btn-outline-light"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <i className="ti ti-dots-vertical" />
                              </Link>
                              <div className="dropdown-menu dropdown-menu-right">
                                <Link
                                  className="dropdown-item d-flex align-items-center"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#edit_fields"
                                >
                                  <i className="ti ti-edit me-1" /> Edit
                                </Link>
                                <Link
                                  className="dropdown-item d-flex align-items-center"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_fields"
                                >
                                  <i className="ti ti-trash me-1" /> Delete
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>Tasks</td>
                          <td>Task Type</td>
                          <td>Select</td>
                          <td>Design</td>
                          <td>
                            <div className="form-check form-switch p-0">
                              <label className="form-check-label d-flex align-items-center justify-content-center">
                                <input
                                  className="form-check-input switchCheckDefault"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </label>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-tag badge-soft-success">
                              Connected
                            </span>
                          </td>
                          <td>
                            <div className="dropdown table-action">
                              <Link
                                to="#"
                                className="action-icon btn btn-xs shadow d-inline-flex btn-outline-light"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <i className="ti ti-dots-vertical" />
                              </Link>
                              <div className="dropdown-menu dropdown-menu-right">
                                <Link
                                  className="dropdown-item d-flex align-items-center"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#edit_fields"
                                >
                                  <i className="ti ti-edit me-1" /> Edit
                                </Link>
                                <Link
                                  className="dropdown-item d-flex align-items-center"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_fields"
                                >
                                  <i className="ti ti-trash me-1" /> Delete
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {/* end table */}
                </div>
              </div>
            </div>{" "}
            {/* end col */}
          </div>{" "}
          {/* end row */}
        </div>
        {/* End Content */}
        {/* Start Footer */}
        <footer className="footer d-block d-md-flex justify-content-between text-md-start text-center">
          <p className="mb-md-0 mb-1">
            Copyright ©{" "}
            <Link
              to="#"
              className="link-primary text-decoration-underline"
            >
              CRMS
            </Link>
          </p>
          <div className="d-flex align-items-center gap-2 footer-links justify-content-center justify-content-md-end">
            <Link to="#">About</Link>
            <Link to="#">Terms</Link>
            <Link to="#">Contact Us</Link>
          </div>
        </footer>
        {/* End Footer */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
      {/* Add Custom Fields */}
      <div className="modal fade" id="add_fields" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add New Custom Field</h5>
              <button
                type="button"
                className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">
                    Module <span className="text-danger">*</span>
                  </label>
                  <CommonSelect
                            options={Module}
                            className="select"
                            defaultValue={Module[0]}
                          />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Input Type <span className="text-danger">*</span>
                  </label>
                  <CommonSelect
                            options={Input_Type}
                            className="select"
                            defaultValue={Input_Type[0]}
                          />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Label <span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Default Value</label>
                  <input type="text" className="form-control" />
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <label className="form-label">Required </label>
                  <div className="form-check form-switch p-0">
                    <label className="form-check-label d-flex align-items-center justify-content-center">
                      <input
                        className="form-check-input switchCheckDefault"
                        type="checkbox"
                        role="switch"
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <div className="d-flex align-items-center">
                  <Link
                    to="#"
                    className="btn btn-sm btn-light me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </Link>
                  <button type="submit" className="btn btn-sm btn-primary">
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add Custom Fields */}
      {/* Edit Custom Fields */}
      <div className="modal fade" id="edit_fields" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Custom Field</h5>
              <button
                type="button"
                className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form >
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">
                    Module <span className="text-danger">*</span>
                  </label>
                 <CommonSelect
                            options={Module}
                            className="select"
                            defaultValue={Module[1]}
                          />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Input Type <span className="text-danger">*</span>
                  </label>
                 <CommonSelect
                            options={Input_Type}
                            className="select"
                            defaultValue={Input_Type[1]}
                          />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Label <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue="Preferred Language"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Default Value</label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue="English"
                  />
                </div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <label className="form-label">Required </label>
                  <div className="form-check form-switch p-0">
                    <label className="form-check-label d-flex align-items-center justify-content-center">
                      <input
                        className="form-check-input switchCheckDefault"
                        type="checkbox"
                        role="switch"
                        defaultChecked
                      />
                    </label>
                  </div>
                </div>
                <div className="mb-0">
                  <label className="form-label">Status</label>
                  <div className="d-flex align-items-center">
                    <div className="me-2">
                      <input
                        type="radio"
                        className="status-radio"
                        id="add-active"
                        name="status"
                        defaultChecked
                      />
                      <label htmlFor="add-active">Active</label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        className="status-radio"
                        id="add-inactive"
                        name="status"
                      />
                      <label htmlFor="add-inactive">Inactive</label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <div className="d-flex align-items-center">
                  <Link
                    to="#"
                    className="btn btn-sm btn-light me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </Link>
                  <button type="submit" className="btn btn-sm btn-primary">
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Edit Custom Fields */}
      {/* Delete Printer */}
      <div className="modal fade" id="delete_fields" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <div className="text-center">
                <div className="mb-3 position-relative z-1">
                  <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle">
                    <i className="ti ti-trash fs-24" />
                  </span>
                </div>
                <h4 className="mb-2">Delete Confirmation</h4>
                <p className="mb-0">
                  Are you sure you want to remove custom field you selected.
                </p>
                <div className="d-flex align-items-center justify-content-center mt-4">
                  <Link
                    to="#"
                    className="btn btn-sm btn-light me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </Link>
                  <Link
                    to={all_routes.customFields}
                    className="btn btn-sm btn-primary me-2"
                  >
                    Yes, Delete
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Delete Printer */}
    </>
  );
};

export default CustomFieldsSetting;
