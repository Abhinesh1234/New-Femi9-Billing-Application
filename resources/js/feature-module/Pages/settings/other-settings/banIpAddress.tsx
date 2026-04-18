import { Link } from "react-router"
import Footer from "../../../../components/footer/footer"
import PageHeader from "../../../../components/page-header/pageHeader"
import { all_routes } from "../../../../routes/all_routes"
import SettingsTopbar from "../settings-topbar/settingsTopbar"


const BanIpAddress = () => {
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
      <SettingsTopbar/>
      {/* end card */}
      {/* /Settings Menu */}
      {/* start row */}
      <div className="row row-gap-3">
        <div className="col-xl-3 col-lg-12 theiaStickySidebar">
          {/* Settings Sidebar */}
          <div className="card mb-0 filemanager-left-sidebar">
            <div className="card-body">
              <div className="settings-sidebar">
                    <h4 className="fs-17 mb-3">Other Settings</h4>
                    <div className="list-group list-group-flush settings-sidebar">
                      <Link
                        to={all_routes.sitemap}
                        className="d-block p-2 fw-medium "
                      >
                        Sitemap
                      </Link>
                      <Link
                        to={all_routes.clearCache}
                        className="d-block p-2 fw-medium "
                      >
                        Clear Cache{" "}
                      </Link>
                      <Link
                        to={all_routes.storage}
                        className="d-block p-2 fw-medium "
                      >
                        Storage
                      </Link>
                      <Link
                        to={all_routes.cronjob}
                        className="d-block p-2 fw-medium "
                      >
                        Cronjob
                      </Link>
                      <Link
                        to={all_routes.banIpAddrress}
                        className="d-block p-2 fw-medium active"
                      >
                        Ban IP Address
                      </Link>
                      <Link
                        to={all_routes.systemBackup}
                        className="d-block p-2 fw-medium"
                      >
                        System Backup
                      </Link>
                      <Link
                        to={all_routes.databaseBackup}
                        className="d-block p-2 fw-medium"
                      >
                        Database Backup
                      </Link>
                      <Link
                        to={all_routes.systemUpdate}
                        className="d-block p-2 fw-medium"
                      >
                        System Update
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
                <h4 className="fs-17 mb-0">Ban IP Address</h4>
                <Link
                  to="#"
                  className="btn btn-primary btn-sm"
                  data-bs-toggle="modal"
                  data-bs-target="#add_ip"
                >
                  <i className="ti ti-square-rounded-plus-filled me-1" />
                  Add New Ban IP{" "}
                </Link>
              </div>
              {/* start table */}
              <div className="table-responsive">
                <table className="table table-nowrap">
                  <thead className="table-light">
                    <tr>
                      <th>Ban Ip Address</th>
                      <th>Reason</th>
                      <th>Created On</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>211.11.0.25</td>
                      <td>Suspicious Activity</td>
                      <td>22 Feb 2025</td>
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
                              className="dropdown-item"
                              to="#;"
                              data-bs-toggle="modal"
                              data-bs-target="#edit_ip"
                            >
                              <i className="ti ti-edit text-blue" /> Edit
                            </Link>
                            <Link
                              className="dropdown-item"
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#delete_ip"
                            >
                              <i className="ti ti-trash" /> Delete
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>211.03.0.11</td>
                      <td>Spam or Abuse</td>
                      <td>10 Feb 2025</td>
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
                              className="dropdown-item"
                              to="#;"
                              data-bs-toggle="modal"
                              data-bs-target="#edit_ip"
                            >
                              <i className="ti ti-edit text-blue" /> Edit
                            </Link>
                            <Link
                              className="dropdown-item"
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#delete_ip"
                            >
                              <i className="ti ti-trash" /> Delete
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>211.24.0.17</td>
                      <td>Unauthorized Access</td>
                      <td>17 Jan 2025</td>
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
                              className="dropdown-item"
                              to="#;"
                              data-bs-toggle="modal"
                              data-bs-target="#edit_ip"
                            >
                              <i className="ti ti-edit text-blue" /> Edit
                            </Link>
                            <Link
                              className="dropdown-item"
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#delete_ip"
                            >
                              <i className="ti ti-trash" /> Delete
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>211.12.0.34</td>
                      <td>Violation of Terms</td>
                      <td>07 Jan 2025</td>
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
                              className="dropdown-item"
                              to="#;"
                              data-bs-toggle="modal"
                              data-bs-target="#edit_ip"
                            >
                              <i className="ti ti-edit text-blue" /> Edit
                            </Link>
                            <Link
                              className="dropdown-item"
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#delete_ip"
                            >
                              <i className="ti ti-trash" /> Delete
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
          {/* /Settings Info */}
        </div>
      </div>
      {/* end row */}
    </div>
    {/* End Content */}
    {/* Start Footer */}
    <Footer/>
    {/* End Footer */}
  </div>
  {/* ========================
			End Page Content
		========================= */}
  {/* Add Ban IP Address */}
  <div className="modal custom-modal fade" id="add_ip" role="dialog">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Add Ban IP Address</h5>
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
                IP Address <span className="text-danger">*</span>
              </label>
              <input type="text" className="form-control" />
            </div>
            <div className="mb-0">
              <label className="form-label">
                Reason <span className="text-danger">*</span>
              </label>
              <textarea className="form-control" rows={4} defaultValue={""} />
            </div>
          </div>
          <div className="modal-footer d-flex align-items-center justify-content-end gap-2">
            <Link
              to="#"
              className="btn btn-sm btn-light"
              data-bs-dismiss="modal"
            >
              Cancel
            </Link>
            <button type="submit" className="btn btn-sm btn-primary">
              Create New
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  {/* /Add Ban IP Address */}
  {/* Edit Ban IP Address */}
  <div className="modal custom-modal fade" id="edit_ip" role="dialog">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Edit Ban IP Address</h5>
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
                IP Address <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                defaultValue="211.11.0.25	"
              />
            </div>
            <div className="mb-0">
              <label className="form-label">
                Reason <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control"
                rows={4}
                defaultValue={"Suspicious Activity\t"}
              />
            </div>
          </div>
          <div className="modal-footer d-flex align-items-center justify-content-end gap-2">
            <Link
              to="#"
              className="btn btn-sm btn-light"
              data-bs-dismiss="modal"
            >
              Cancel
            </Link>
            <button type="submit" className="btn btn-sm btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  {/* /Edit Ban IP Address */}
  {/* Delete IP Address */}
  <div className="modal fade" id="delete_ip">
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
            Are you sure you want to remove ban IP address you selected.
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
  {/* /Delete IP Address */}
</>

  )
}

export default BanIpAddress