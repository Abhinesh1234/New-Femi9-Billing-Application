import { Link } from "react-router";
import PageHeader from "../../../../components/page-header/pageHeader";
import SettingsTopbar from "../settings-topbar/settingsTopbar";
import { all_routes } from "../../../../routes/all_routes";
import ImageWithBasePath from "../../../../components/imageWithBasePath";

const SmsGateways = () => {
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
                    <h5 className="mb-3 fs-17">System Settings</h5>
                    <div className="list-group list-group-flush settings-sidebar">
                      <Link
                        to={all_routes.emailSettings}
                        className="d-block p-2 fw-medium "
                      >
                        Email Settings
                      </Link>
                      <Link
                        to={all_routes.smsGateways}
                        className="d-block p-2 fw-medium active"
                      >
                        SMS Gateways
                      </Link>
                      <Link
                        to={all_routes.gdprCookies}
                        className="d-block p-2 fw-medium"
                      >
                        GDPR Cookies
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
                <div className="card-body pb-0">
                  <div className="border-bottom mb-3 pb-3">
                    <h5 className="mb-0 fs-17">SMS Gateways</h5>
                  </div>
                  <div className="row">
                    {/* Gateway Wrap */}
                    <div className="col-xxl-4 col-sm-6">
                      <div className="border rounded d-flex align-items-center justify-content-between p-3 mb-3 shadow">
                        <div>
                          <ImageWithBasePath
                            src="assets/img/icons/gateway-01.svg"
                            alt="Img"
                          />
                        </div>
                        <div className="d-flex align-items-center">
                          <Link
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#add_nexmo"
                          >
                            <i className="ti ti-settings fs-24" />
                          </Link>
                          <div className="form-check form-switch ps-2">
                            <input
                              className="form-check-input ms-0 mt-0"
                              type="checkbox"
                              role="switch"
                              defaultChecked
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* /Gateway Wrap */}
                    {/* Gateway Wrap */}
                    <div className="col-xxl-4 col-sm-6">
                      <div className="border rounded d-flex align-items-center justify-content-between p-3 mb-3 shadow">
                        <div>
                          <ImageWithBasePath
                            src="assets/img/icons/gateway-02.svg"
                            alt="Img"
                          />
                        </div>
                        <div className="d-flex align-items-center">
                          <Link
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#add_factor"
                          >
                            <i className="ti ti-settings fs-24" />
                          </Link>
                          <div className="form-check form-switch ps-2">
                            <input
                              className="form-check-input ms-0 mt-0"
                              type="checkbox"
                              role="switch"
                              defaultChecked
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* /Gateway Wrap */}
                    {/* Gateway Wrap */}
                    <div className="col-xxl-4 col-sm-6">
                      <div className="border rounded d-flex align-items-center justify-content-between p-3 mb-3 shadow">
                        <div>
                          <ImageWithBasePath
                            src="assets/img/icons/gateway-03.svg"
                            alt="Img"
                          />
                        </div>
                        <div className="d-flex align-items-center">
                          <Link
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#add_twilio"
                          >
                            <i className="ti ti-settings fs-24" />
                          </Link>
                          <div className="form-check form-switch ps-2">
                            <input
                              className="form-check-input ms-0 mt-0"
                              type="checkbox"
                              role="switch"
                              defaultChecked
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* /Gateway Wrap */}
                  </div>
                </div>
              </div>
              {/* /Settings Info */}
            </div>
          </div>
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
      {/* Nexmo */}
      <div className="modal custom-modal fade" id="add_nexmo" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Nexmo</h5>
              <button
                className="btn-close custom-btn-close border p-1 me-0 text-dark"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <form>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">
                    API Key <span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    API Secret Key <span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-0">
                  <label className="form-label">
                    Sender ID <span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
              </div>
              <div className="modal-footer d-flex align-items-center justify-content-end gap-2">
                <Link to="#" className="btn btn-light" data-bs-dismiss="modal">
                  Cancel
                </Link>
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Nexmo */}
      {/* Add 2Factor */}
      <div className="modal custom-modal fade" id="add_factor" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header d-flex align-items-center justify-content-end">
              <h5 className="modal-title">2Factor</h5>
              <button
                className="btn-close custom-btn-close border p-1 me-0 text-dark"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <form>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">
                    API Key <span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    API Secret Key <span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-0">
                  <label className="form-label">
                    Sender ID <span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
              </div>
              <div className="modal-footer d-flex align-items-center justify-content-end gap-2">
                <Link to="#" className="btn btn-light" data-bs-dismiss="modal">
                  Cancel
                </Link>
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add 2Factor */}
      {/* Add Twilio */}
      <div className="modal custom-modal fade" id="add_twilio" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Twilio</h5>
              <button
                className="btn-close custom-btn-close border p-1 me-0 text-dark"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <form>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">
                    API Key <span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    API Secret Key <span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-0">
                  <label className="form-label">
                    Sender ID <span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
              </div>
              <div className="modal-footer d-flex align-items-center justify-content-end gap-2">
                <Link to="#" className="btn btn-light" data-bs-dismiss="modal">
                  Cancel
                </Link>
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add Twilio */}
    </>
  );
};

export default SmsGateways;
