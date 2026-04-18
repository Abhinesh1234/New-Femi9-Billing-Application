import { Link } from "react-router"
import Footer from "../../../../components/footer/footer"
import PageHeader from "../../../../components/page-header/pageHeader"
import { all_routes } from "../../../../routes/all_routes"
import SettingsTopbar from "../settings-topbar/settingsTopbar"


const ClearCache = () => {
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
                  <Link to={all_routes.clearCache} className="d-block p-2 fw-medium active">
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
                <h4 className="fs-17 mb-0">Clear Cache</h4>
              </div>
              <div>
                <p className="fs-14 mb-3">
                  Clearing the cache may improve performance but will remove
                  temporary files, stored preferences, and cached data from
                  websites and applications.
                </p>
                <a href="javascript:void(0)" className="btn btn-primary btn-sm">
                  Clear Cache
                </a>
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

export default ClearCache