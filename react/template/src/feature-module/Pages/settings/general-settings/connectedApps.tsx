import { Link } from "react-router";
import Footer from "../../../../components/footer/footer";
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import PageHeader from "../../../../components/page-header/pageHeader";
import SettingsTopbar from "../settings-topbar/settingsTopbar";
import { all_routes } from "../../../../routes/all_routes";

const ConnectedApps = () => {
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
              <div className="card mb-3 mb-xl-0">
                <div className="card-body">
                  <div className="settings-sidebar">
                    <h5 className="mb-3 fs-17">General Settings</h5>
                    <div className="list-group list-group-flush settings-sidebar">
                      <Link
                        to={all_routes.profile}
                        className="d-block p-2 fw-medium "
                      >
                        Profile
                      </Link>
                      <Link
                        to={all_routes.security}
                        className="d-block p-2 fw-medium "
                      >
                        Security
                      </Link>
                      <Link
                        to={all_routes.notification}
                        className="d-block p-2 fw-medium"
                      >
                        Notifications
                      </Link>
                      <Link
                        to={all_routes.connectedApps}
                        className="d-block p-2 fw-medium active"
                      >
                        Connected Apps
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
                    <h5 className="mb-0 fs-17">Connected Apps</h5>
                  </div>
                  {/* start row */}
                  <div className="row">
                    <div className="col-md-4 col-sm-6">
                      <div className="card border mb-3">
                        <div className="card-body">
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <span className="avatar rounded bg-light p-2">
                              <ImageWithBasePath
                                src="assets/img/icons/integration-01.svg"
                                alt="Icon"
                              />
                            </span>
                            <div className="connect-btn">
                              <a
                                href="#"
                                className="badge badge-soft-success"
                              >
                                Connected
                              </a>
                            </div>
                          </div>
                          <div className="d-flex align-items-center justify-content-between">
                            <p className="fw-medium text-dark  mb-0">
                              Google Calendar
                            </p>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input ms-0"
                                type="checkbox"
                                role="switch"
                                defaultChecked
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>{" "}
                    {/* end col */}
                    <div className="col-md-4 col-sm-6">
                      <div className="card border mb-3">
                        <div className="card-body">
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <span className="avatar rounded bg-light p-2">
                              <ImageWithBasePath
                                src="assets/img/icons/integration-03.svg"
                                alt="Icon"
                              />
                            </span>
                            <div className="connect-btn">
                              <a
                                href="#"
                                className="badge badge-soft-success"
                              >
                                Connected
                              </a>
                            </div>
                          </div>
                          <div className="d-flex align-items-center justify-content-between">
                            <p className="fw-medium text-dark  mb-0">Dropbox</p>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input ms-0"
                                type="checkbox"
                                role="switch"
                                defaultChecked
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>{" "}
                    {/* end col */}
                    <div className="col-md-4 col-sm-6">
                      <div className="card border mb-3">
                        <div className="card-body">
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <span className="avatar rounded bg-light p-2">
                              <ImageWithBasePath
                                src="assets/img/icons/integration-04.svg"
                                alt="Icon"
                              />
                            </span>
                            <div className="connect-btn">
                              <a
                                href="#"
                                className="badge border badge-soft-success"
                              >
                                Connected
                              </a>
                            </div>
                          </div>
                          <div className="d-flex align-items-center justify-content-between">
                            <p className="fw-medium text-dark  mb-0">Slack</p>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input ms-0"
                                type="checkbox"
                                role="switch"
                                defaultChecked
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>{" "}
                    {/* end col */}
                    <div className="col-md-4 col-sm-6">
                      <div className="card border mb-3">
                        <div className="card-body">
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <span className="avatar rounded bg-light p-2">
                              <ImageWithBasePath
                                src="assets/img/icons/integration-05.svg"
                                alt="Icon"
                              />
                            </span>
                            <div className="connect-btn">
                              <a
                                href="#"
                                className="badge badge-soft-success"
                              >
                                Connected
                              </a>
                            </div>
                          </div>
                          <div className="d-flex align-items-center justify-content-between">
                            <p className="fw-medium text-dark  mb-0">Gmail</p>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input ms-0"
                                type="checkbox"
                                role="switch"
                                defaultChecked
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>{" "}
                    {/* end col */}
                    <div className="col-md-4 col-sm-6">
                      <div className="card border mb-3">
                        <div className="card-body">
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <span className="avatar rounded bg-light p-2">
                              <ImageWithBasePath
                                src="assets/img/icons/integration-06.svg"
                                alt="Icon"
                              />
                            </span>
                            <div className="connect-btn">
                              <a
                                href="#"
                                className="badge badge-soft-success"
                              >
                                Connect
                              </a>
                            </div>
                          </div>
                          <div className="d-flex align-items-center justify-content-between">
                            <p className="fw-medium text-dark  mb-0">Github</p>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input ms-0"
                                type="checkbox"
                                role="switch"
                                defaultChecked
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>{" "}
                    {/* end col */}
                  </div>
                </div>{" "}
                {/* end card body */}
              </div>{" "}
              {/* end card */}
            </div>{" "}
            {/* end col */}
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
    </>
  );
};

export default ConnectedApps;
