import { Link } from "react-router";
import PageHeader from "../../../../components/page-header/pageHeader";
import SettingsTopbar from "../settings-topbar/settingsTopbar";
import { all_routes } from "../../../../routes/all_routes";

const SystemBackup = () => {
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
                        className="d-block p-2 fw-medium "
                      >
                        Ban IP Address
                      </Link>
                      <Link
                        to={all_routes.systemBackup}
                        className="d-block p-2 fw-medium active"
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
                    <h4 className="fs-17 mb-0">System Backup</h4>
                    <Link
                      to="javascript:void(0)"
                      className="btn btn-primary btn-sm"
                      data-bs-toggle="modal"
                      data-bs-target="#generate_backup"
                    >
                      <i className="ti ti-folder-open me-1" />
                      Generate Backup
                    </Link>
                  </div>
                  {/* start table */}
                  <div className="table-responsive">
                    <table className="table table-nowrap">
                      <thead className="table-light">
                        <tr>
                          <th>Name</th>
                          <th>Created On</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>crm_customers_backup_2025-05-26</td>
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
                                  className="dropdown-item d-flex align-items-center"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_backup"
                                >
                                  <i className="ti ti-trash me-1" /> Delete
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>crms_reports_export_2025-05-26</td>
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
                                  className="dropdown-item d-flex align-items-center"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_backup"
                                >
                                  <i className="ti ti-trash me-1" /> Delete
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>crms_projects_export_2025-05-26</td>
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
                                  className="dropdown-item d-flex align-items-center"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_backup"
                                >
                                  <i className="ti ti-trash me-1" /> Delete
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>crms_companies_export_2025-05-26</td>
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
                                  className="dropdown-item d-flex align-items-center"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_backup"
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
      {/*  Generate Backup */}
      <div className="modal fade" id="generate_backup">
        <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
          <div className="modal-content rounded-0">
            <div className="modal-body p-4 text-center position-relative">
              <div className="mb-3 position-relative z-1">
                <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle">
                  <i className="ti ti-folder-open fs-24" />
                </span>
              </div>
              <h5 className="mb-1">Generate Backup</h5>
              <p className="mb-3">
                Are you sure you want to generate system backup?
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
      {/* / Generate Backup  */}
      {/* Delete Generate Backup */}
      <div className="modal fade" id="delete_backup">
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
                Are you sure you want to remove backup file you selected.
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
      {/* /Delete Generate Backup  */}
    </>
  );
};

export default SystemBackup;
