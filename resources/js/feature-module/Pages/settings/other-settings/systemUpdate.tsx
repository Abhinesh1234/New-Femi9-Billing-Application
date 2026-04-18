import { Link } from "react-router"
import Footer from "../../../../components/footer/footer"
import PageHeader from "../../../../components/page-header/pageHeader"
import SettingsTopbar from "../settings-topbar/settingsTopbar"
import { all_routes } from "../../../../routes/all_routes"


const SystemUpdate = () => {
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
                                      className="d-block p-2 fw-medium "
                                    >
                                      Ban IP Address
                                    </Link>
                                    <Link
                                      to={all_routes.systemBackup}
                                      className="d-block p-2 fw-medium "
                                    >
                                      System Backup
                                    </Link>
                                    <Link
                                      to={all_routes.databaseBackup}
                                      className="d-block p-2 fw-medium "
                                    >
                                      Database Backup
                                    </Link>
                                    <Link
                                      to={all_routes.systemUpdate}
                                      className="d-block p-2 fw-medium active"
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
                <h4 className="fs-17 mb-0">System Update</h4>
              </div>
              {/* Item */}
              <div className="mb-4">
                <div className="d-flex align-items-center flex-wrap gap-2">
                  <div className="position-relative z-1">
                    <span className="avatar avatar-lg badge-soft-success badge-sm border-0 text-success rounded-circle">
                      <i className="ti ti-circle-check-filled fs-24" />
                    </span>
                  </div>
                  <div>
                    <h6 className="fs-14 mb-1 fw-semibold">
                      {" "}
                      You are up to date{" "}
                      <Link
                        to="#"
                        className="badge badge-tag badge-soft-info ms-2"
                        data-bs-toggle="modal"
                        data-bs-target="#default"
                      >
                        Default
                      </Link>{" "}
                    </h6>
                    <p className="fs-13 mb-0">Last Checked : Today 10:30AM</p>
                  </div>
                </div>
              </div>
              {/* Item */}
              <div className="mb-3">
                <div className="w-100">
                  <label className="form-label">
                    Purchase Key<span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
              </div>
              {/* Item */}
              <div className="bg-light border rounded p-2 d-flex align-items-center">
                <p className="mb-0">
                  {" "}
                  <i className="ti ti-info-circle me-2 text-info" /> Before
                  updating, it's best to back up your files and database and
                  review the changelog.
                </p>
              </div>
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
</>

  )
}

export default SystemUpdate