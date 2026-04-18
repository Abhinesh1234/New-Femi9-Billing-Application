import { Link } from "react-router";
import PageHeader from "../../../../components/page-header/pageHeader";
import SettingsTopbar from "../settings-topbar/settingsTopbar";
import { all_routes } from "../../../../routes/all_routes";
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import Footer from "../../../../components/footer/footer";

const Storage = () => {
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
              <div className="card mb-0  filemanager-left-sidebar">
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
                        className="d-block p-2 fw-medium active"
                      >
                        Storage
                      </Link>
                      <Link
                        to={all_routes.cronjob}
                        className="d-block p-2 fw-medium"
                      >
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
                    <h4 className="fs-17 mb-0">Storage</h4>
                  </div>
                  {/* start row */}
                  <div className="row row-gap-3">
                    {/* Storage */}
                    <div className="col-xxl-6 col-sm-6">
                      <div className="border rounded p-3 d-flex align-items-center justify-content-between shadow">
                        <div className="d-flex align-items-center">
                          <span className="avatar avatar-lg bg-light-100 border flex-shrink-0 me-2">
                            <ImageWithBasePath
                              src="assets/img/icons/storage-icon-01.svg"
                              className="w-auto h-auto"
                              alt="Img"
                            />
                          </span>
                          <h6 className="fw-medium fs-14 mb-0">
                            Local Storage
                          </h6>
                        </div>
                        <div className="d-flex align-items-center">
                          <div className="form-check form-switch p-0">
                            <label className="form-check-label d-flex align-items-center gap-2 w-100">
                              <input
                                className="form-check-input switchCheckDefault ms-auto"
                                type="checkbox"
                                role="switch"
                                defaultChecked
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* /Storage */}
                    {/* Storage */}
                    <div className="col-xxl-6 col-sm-6">
                      <div className="border rounded p-3 d-flex align-items-center justify-content-between shadow">
                        <div className="d-flex align-items-center">
                          <span className="avatar avatar-lg bg-light-100 border flex-shrink-0 me-2">
                            <ImageWithBasePath
                              src="assets/img/icons/storage-icon-02.svg"
                              className="w-auto h-auto"
                              alt="Img"
                            />
                          </span>
                          <h6 className="fw-medium fs-14 mb-0">AWS</h6>
                        </div>
                        <div className="d-flex align-items-center">
                          <Link
                            to="#"
                            className="me-2 d-flex align-items-center"
                            data-bs-toggle="modal"
                            data-bs-target="#add_aws"
                          >
                            <i className="ti ti-settings fs-24" />
                          </Link>
                          <div className="form-check form-switch p-0">
                            <label className="form-check-label d-flex align-items-center gap-2 w-100">
                              <input
                                className="form-check-input switchCheckDefault ms-auto"
                                type="checkbox"
                                role="switch"
                                defaultChecked
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* /Storage */}
                  </div>
                  {/* end row */}
                </div>
              </div>
              {/* /Settings Info */}
            </div>
          </div>
          {/* end row */}
        </div>
        {/* End Content */}
        {/* Start Footer */}
        <Footer />
        {/* End Footer */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
      {/* Add sitemap */}
      <div className="modal fade" id="add_aws" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">AWS</h5>
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
                    AWS Access Key<span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Secret Key<span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Bucket Name<span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Region<span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-0">
                  <label className="form-label">
                    Base URL<span className="text-danger">*</span>
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
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add sitemap */}
    </>
  );
};

export default Storage;
