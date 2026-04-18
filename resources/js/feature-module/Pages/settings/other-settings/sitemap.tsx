import { Link } from "react-router"
import PageHeader from "../../../../components/page-header/pageHeader"
import SettingsTopbar from "../settings-topbar/settingsTopbar"
import { all_routes } from "../../../../routes/all_routes"
import Footer from "../../../../components/footer/footer"


const Sitemap = () => {
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
                    className="d-block p-2 fw-medium active"
                  >
                    Sitemap
                  </Link>
                  <Link to={all_routes.clearCache} className="d-block p-2 fw-medium">
                    Clear Cache{" "}
                  </Link>
                  <Link to={all_routes.storage} className="d-block p-2 fw-medium">
                    Storage
                  </Link>
                  <Link to={all_routes.cronjob} className="d-block p-2 fw-medium">
                    Cronjob
                  </Link>
                  <Link
                    to={all_routes.banIpAddrress}
                    className="d-block p-2 fw-medium"
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
                <h4 className="fs-17 mb-0">Sitemap</h4>
                <Link
                  to="javascript:void(0)"
                  className="btn btn-primary btn-sm"
                  data-bs-toggle="modal"
                  data-bs-target="#add_sitemap"
                >
                  <i className="ti ti-square-rounded-plus-filled me-1" />
                  Generate Sitemap
                </Link>
              </div>
              {/* Start Table */}
              <div className="table-responsive custom-table">
                <table className="table table-nowrap">
                  <thead className="table-light">
                    <tr>
                      <th>URL</th>
                      <th>File Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <Link to="#">https://localhost/crms</Link>
                      </td>
                      <td>sitemap18725604.xml</td>
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
                              data-bs-target="#edit_sitemap"
                            >
                              <i className="ti ti-edit text-blue me-1" />
                              Edit
                            </Link>
                            <Link
                              className="dropdown-item"
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#delete_sitemap"
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
    <Footer/>
    {/* End Footer */}
  </div>
  {/* ========================
			End Page Content
		========================= */}
  {/* Add sitemap */}
  <div className="modal fade" id="add_sitemap" role="dialog">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Add Sitemap</h5>
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
            <div className="mb-0">
              <label className="form-label">
                Sitemap URL<span className="text-danger">*</span>
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
  {/* /Add sitemap */}
  {/* Edit sitemap */}
  <div className="modal fade" id="edit_sitemap" role="dialog">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Edit Sitemap</h5>
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
            <div className="mb-0">
              <label className="form-label">
                Sitemap URL<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                defaultValue="sitemap18725604.xml"
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
  {/* /Edit sitemap */}
  {/* delete modal */}
  <div className="modal fade" id="delete_sitemap">
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
            Are you sure you want to remove sitemap you selected.
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

  )
}

export default Sitemap