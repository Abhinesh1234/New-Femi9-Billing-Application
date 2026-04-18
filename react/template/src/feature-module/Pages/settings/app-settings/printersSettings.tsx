import { Link } from "react-router";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import SettingsTopbar from "../settings-topbar/settingsTopbar";
import { all_routes } from "../../../../routes/all_routes";

const PrintersSettings = () => {
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
                        className="d-block p-2 fw-medium active"
                      >
                        Printer
                      </Link>
                      <Link
                        to={all_routes.customFields}
                        className="d-block p-2 fw-medium"
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
                    <h5 className="mb-0 fs-17">Printer</h5>
                    <Link
                      to="#"
                      className="btn btn-primary btn-sm"
                      data-bs-toggle="modal"
                      data-bs-target="#add_printer"
                    >
                      <i className="ti ti-square-rounded-plus-filled me-1" />
                      Add New Printer
                    </Link>
                  </div>
                  {/* start table */}
                  <div className="table-responsive">
                    <table className="table table-nowrap">
                      <thead className="table-light">
                        <tr>
                          <th>Printer Name</th>
                          <th>Connection Type</th>
                          <th>IP Address</th>
                          <th>Port</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>HD Printer</td>
                          <td>Network</td>
                          <td>151.00.1.22</td>
                          <td>900</td>
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
                                  data-bs-target="#edit_printer"
                                >
                                  <i className="ti ti-edit me-1" /> Edit
                                </Link>
                                <Link
                                  className="dropdown-item d-flex align-items-center"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_printer"
                                >
                                  <i className="ti ti-trash me-1" /> Delete
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>Epson</td>
                          <td>Network</td>
                          <td>151.00.1.20</td>
                          <td>500</td>
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
                                  data-bs-target="#edit_printer"
                                >
                                  <i className="ti ti-edit me-1" /> Edit
                                </Link>
                                <Link
                                  className="dropdown-item d-flex align-items-center"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_printer"
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
            </div>
          </div>
        </div>
        {/* End Content */}
        {/* Start Footer */}
        <Footer />
        {/* End Footer */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
      <>
        {/* Add Printer */}
        <div className="modal fade" id="add_printer" role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Printer</h5>
                <button
                  className="btn-close custom-btn-close border p-1 me-0 text-dark"
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
                      Printer Company <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Printer Name <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Connection Type <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      IP Address <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="mb-0">
                    <label className="form-label">
                      Port <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" />
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
                      Create New
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* /Add Currency */}
        {/* Edit Printer */}
        <div className="modal fade" id="edit_printer" role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Printer</h5>
                <button
                  className="btn-close custom-btn-close border p-1 me-0 text-dark"
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
                      Printer Company <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue="Hp"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Printer Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue="Hp printer"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Connection Type <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue="Network"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      IP Address <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue="198.162.0.1"
                    />
                  </div>
                  <div className="mb-0">
                    <label className="form-label">
                      Port <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue={900}
                    />
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
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* /Edit Printer */}
        {/* Delete Printer */}
        <div className="modal fade" id="delete_printer" role="dialog">
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
                    Are you sure you want to remove printer you selected.
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
                      to={all_routes.printers}
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
    </>
  );
};

export default PrintersSettings;
