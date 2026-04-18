import { Link } from "react-router";
import PageHeader from "../../../../components/page-header/pageHeader";
import SettingsTopbar from "../settings-topbar/settingsTopbar";
import { all_routes } from "../../../../routes/all_routes";

const TaxRates = () => {
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
          {/* Settings Menu */}
          <SettingsTopbar />
          {/* end card */}
          {/* /Settings Menu */}
          {/* start row */}
          <div className="row">
            <div className="col-xl-3 col-lg-12 theiaStickySidebar">
              {/* Settings Sidebar */}
              <div className="card  filemanager-left-sidebar">
                <div className="card-body">
                  <div className="settings-sidebar">
                    <h4 className="fw-bold mb-3 fs-17">Financial Settings</h4>
                    <div className="list-group list-group-flush settings-sidebar">
                      <Link
                        to={all_routes.paymentGateways}
                        className="d-block p-2 fw-medium "
                      >
                        Payment Gateways
                      </Link>
                      <Link
                        to={all_routes.bankAccount}
                        className="d-block p-2 fw-medium "
                      >
                        Bank Accounts
                      </Link>
                      <Link
                        to={all_routes.taxRates}
                        className="d-block p-2 fw-medium active"
                      >
                        Tax Rates
                      </Link>
                      <Link
                        to={all_routes.currencies}
                        className="d-block p-2 fw-medium"
                      >
                        Currencies
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Settings Sidebar */}
            </div>
            <div className="col-xl-9 col-lg-12">
              {/* Settings Info */}
              <div className="card mb-0">
                <div className="card-body">
                  <div className="border-bottom mb-3 pb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <h4 className="fs-17 mb-0">Tax Rate</h4>
                    <Link
                      to="#"
                      className="btn btn-primary btn-sm"
                      data-bs-toggle="modal"
                      data-bs-target="#add_tax"
                    >
                      <i className="ti ti-square-rounded-plus-filled me-1" />
                      Add New Tax Rate
                    </Link>
                  </div>
                  {/* Start Table */}
                  <div className="table-responsive custom-table mb-4">
                    <table className="table table-nowrap">
                      <thead className="table-light">
                        <tr>
                          <th>Name</th>
                          <th>Tax Rate</th>
                          <th>Created On</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>VAT</td>
                          <td>10%</td>
                          <td>22 Feb 2025</td>
                          <td>
                            <span className="badge bg-success">Active</span>
                          </td>
                          <td>
                            <div className="dropdown table-action">
                              <Link
                                to="#"
                                className="action-icon btn btn-xs shadow btn-icon btn-outline-light "
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <i className="ti ti-dots-vertical" />
                              </Link>
                              <div className="dropdown-menu dropdown-menu-right">
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#edit_tax"
                                >
                                  <i className="ti ti-edit text-blue me-1" />
                                  Edit
                                </Link>
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_tax"
                                >
                                  <i className="ti ti-trash text-blue me-1" />
                                  Delete
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>CGST</td>
                          <td>08%</td>
                          <td>17 Jan 2025</td>
                          <td>
                            <span className="badge bg-success">Active</span>
                          </td>
                          <td>
                            <div className="dropdown table-action">
                              <Link
                                to="#"
                                className="action-icon btn btn-xs shadow btn-icon btn-outline-light "
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <i className="ti ti-dots-vertical" />
                              </Link>
                              <div className="dropdown-menu dropdown-menu-right">
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#edit_tax"
                                >
                                  <i className="ti ti-edit text-blue me-1" />
                                  Edit
                                </Link>
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_tax"
                                >
                                  <i className="ti ti-trash text-blue me-1" />
                                  Delete
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>SGST</td>
                          <td>10%</td>
                          <td>07 Jan 2025</td>
                          <td>
                            <span className="badge bg-success">Active</span>
                          </td>
                          <td>
                            <div className="dropdown table-action">
                              <Link
                                to="#"
                                className="action-icon btn btn-xs shadow btn-icon btn-outline-light "
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <i className="ti ti-dots-vertical" />
                              </Link>
                              <div className="dropdown-menu dropdown-menu-right">
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#edit_tax"
                                >
                                  <i className="ti ti-edit text-blue me-1" />
                                  Edit
                                </Link>
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_tax"
                                >
                                  <i className="ti ti-trash text-blue me-1" />
                                  Delete
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {/* End Table */}
                  <div className="mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <h4 className="fs-17 mb-0">Tax Group</h4>
                    <Link
                      to="#"
                      className="btn btn-primary btn-sm"
                      data-bs-toggle="modal"
                      data-bs-target="#add_tax_group"
                    >
                      <i className="ti ti-square-rounded-plus-filled me-1" />
                      Add New Group
                    </Link>
                  </div>
                  {/* Start Table */}
                  <div className="table-responsive custom-table">
                    <table className="table table-nowrap">
                      <thead className="table-light">
                        <tr>
                          <th>Name</th>
                          <th>Tax Rate</th>
                          <th>Created On</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>GST</td>
                          <td>18%</td>
                          <td>18 Jan 2025</td>
                          <td>
                            <span className="badge bg-success">Active</span>
                          </td>
                          <td>
                            <div className="dropdown table-action">
                              <Link
                                to="#"
                                className="action-icon btn btn-xs shadow btn-icon btn-outline-light "
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <i className="ti ti-dots-vertical" />
                              </Link>
                              <div className="dropdown-menu dropdown-menu-right">
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#edit_tax_group"
                                >
                                  <i className="ti ti-edit text-blue me-1" />
                                  Edit
                                </Link>
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_tax_group"
                                >
                                  <i className="ti ti-trash text-blue me-1" />
                                  Delete
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {/* End Table */}
                </div>
              </div>
              {/* /Settings Info */}
            </div>
          </div>
          {/* end row */}
        </div>
        {/* End Content */}
        {/* Start Footer */}
        <footer className="footer d-block d-md-flex justify-content-between text-md-start text-center">
          <p className="mb-md-0 mb-1">
            Copyright ©{" "}
            <Link
              to="#;"
              className="link-primary text-decoration-underline"
            >
              CRMS
            </Link>
          </p>
          <div className="d-flex align-items-center gap-2 footer-links justify-content-center justify-content-md-end">
            <Link to="#;">About</Link>
            <Link to="#;">Terms</Link>
            <Link to="#;">Contact Us</Link>
          </div>
        </footer>
        {/* End Footer */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
      {/* Add Tax Rate */}
      <div className="modal fade" id="add_tax" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Tax Rate</h5>
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
                    Tax Name<span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-0">
                  <label className="form-label">
                    Tax Rate(%)<span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
              </div>
              <div className="modal-footer">
                <div className="d-flex align-items-center justify-content-end m-0">
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
      {/* /Add Tax Rate */}
      {/* Edit Tax Rate */}
      <div className="modal fade" id="edit_tax" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Tax Rate</h5>
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
                    Tax Name<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue="VAT"
                  />
                </div>
                <div className="mb-0">
                  <label className="form-label">
                    Tax Rate(%)<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue="10%"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <div className="d-flex align-items-center justify-content-end m-0">
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
      {/* /Edit Tax Rate */}
      {/* delete modal */}
      <div className="modal fade" id="delete_tax">
        <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
          <div className="modal-content rounded-0">
            <div className="modal-body p-4 text-center position-relative">
              <div className="mb-3 position-relative z-1">
                <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle">
                  <i className="ti ti-trash fs-24" />
                </span>
              </div>
              <h5 className="mb-1">Delete Confirmation</h5>
              <p className="mb-3">
                Are you sure you want to remove tax rate you selected.
              </p>
              <div className="d-flex justify-content-center">
                <Link
                  to="#"
                  className="btn btn-light position-relative z-1 me-2 w-100"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </Link>
                <Link
                  to="#"
                  className="btn btn-primary position-relative z-1 w-100"
                  data-bs-dismiss="modal"
                >
                  Yes, Delete
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* delete modal */}
      {/* Add Tax Group */}
      <div className="modal fade" id="add_tax_group" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Tax Group</h5>
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
                    Tax Name<span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-0">
                  <label className="form-label">
                    Sub Taxes<span className="text-danger">*</span>
                  </label>
                  <input
                    className="input-tags form-control border-0 h-100"
                    data-choices=""
                    data-choices-limit="infinite"
                    data-choices-removeitem=""
                    type="text"
                  />
                  <p className="mb-0 fs-12 mt-1">
                    Enter value separated by comma
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <div className="d-flex align-items-center justify-content-end m-0">
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
      {/* /Add Tax Group */}
      {/* Edit Tax Group */}
      <div className="modal fade" id="edit_tax_group" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Tax Group</h5>
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
                    Tax Name<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue="GST"
                  />
                </div>
                <div className="mb-0">
                  <label className="form-label">
                    Sub Taxes<span className="text-danger">*</span>
                  </label>
                  <input
                    className="input-tags form-control border-0 h-100"
                    data-choices=""
                    data-choices-limit="infinite"
                    data-choices-removeitem=""
                    type="text"
                    defaultValue="CGST, SGST"
                  />
                  <p className="mb-0 fs-12 mt-1">
                    Enter value separated by comma
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <div className="d-flex align-items-center justify-content-end m-0">
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
      {/* /Edit Tax Group */}
      {/* delete modal */}
      <div className="modal fade" id="delete_tax_group">
        <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
          <div className="modal-content rounded-0">
            <div className="modal-body p-4 text-center position-relative">
              <div className="mb-3 position-relative z-1">
                <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle">
                  <i className="ti ti-trash fs-24" />
                </span>
              </div>
              <h5 className="mb-1">Delete Confirmation</h5>
              <p className="mb-3">
                Are you sure you want to remove rate group you selected..
              </p>
              <div className="d-flex justify-content-center">
                <Link
                  to="#"
                  className="btn btn-sm btn-light position-relative z-1 me-2 w-100"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </Link>
                <Link
                  to="#"
                  className="btn btn-sm btn-primary position-relative z-1 w-100"
                  data-bs-dismiss="modal"
                >
                  Yes, Delete
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* delete modal */}
    </>
  );
};

export default TaxRates;
