import { Link } from "react-router";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import { all_routes } from "../../../../routes/all_routes";
import SettingsTopbar from "../settings-topbar/settingsTopbar";

const NotificationsSettings = () => {
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
                        className="d-block p-2 fw-medium active"
                      >
                        Notifications
                      </Link>
                      <Link
                        to={all_routes.connectedApps}
                        className="d-block p-2 fw-medium"
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
                <div className="card-body">
                  <div className="border-bottom mb-3 pb-3">
                    <h5 className="mb-0 fs-17">Notification Settings</h5>
                  </div>
                  <div>
                    <div className="mb-3">
                      <h6 className="mb-1">General Notifications</h6>
                      <p className="mb-0">Select notifications</p>
                    </div>
                    <div className="border-bottom mb-3 pb-3">
                      <div className="form-check d-flex align-items-center justify-content-between ps-0 mb-3">
                        <label
                          className="form-check-label text-dark fw-medium"
                          htmlFor="notification1"
                        >
                          Mobile Push Notifications
                        </label>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          defaultValue=""
                          id="notification1"
                          defaultChecked
                        />
                      </div>
                      <div className="form-check d-flex align-items-center justify-content-between ps-0 mb-3">
                        <label
                          className="form-check-label text-dark fw-medium"
                          htmlFor="notification2"
                        >
                          Desktop Notifications
                        </label>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          defaultValue=""
                          id="notification2"
                          defaultChecked
                        />
                      </div>
                      <div className="form-check d-flex align-items-center justify-content-between ps-0 mb-3">
                        <label
                          className="form-check-label text-dark fw-medium"
                          htmlFor="notification3"
                        >
                          Email Notifications
                        </label>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="notification3"
                          defaultChecked
                        />
                      </div>
                      <div className="form-check d-flex align-items-center justify-content-between ps-0 mb-0">
                        <label
                          className="form-check-label text-dark fw-medium"
                          htmlFor="notification4"
                        >
                          SMS Notifications
                        </label>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="notification4"
                          defaultChecked
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <h6 className="mb-1">Custom Notifications</h6>
                      <p className="mb-0">
                        Select when you will be notified when the following
                        changes occur
                      </p>
                    </div>
                    <div className="table-responsive">
                      <table className="table table-borderless notification-table border-0">
                        <thead>
                          <tr>
                            <th />
                            <th>Push</th>
                            <th>SMS</th>
                            <th>Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="fw-medium text-dark py-2">
                              Payment
                            </td>
                            <td className="py-2">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </td>
                            <td className="py-2">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </td>
                            <td className="py-2">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td className="fw-medium text-dark py-2">
                              Transaction
                            </td>
                            <td className="py-2">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </td>
                            <td className="py-2">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </td>
                            <td className="py-2">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td className="fw-medium text-dark py-2">
                              Email Verification
                            </td>
                            <td className="py-2">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </td>
                            <td className="py-2">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </td>
                            <td className="py-2">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td className="fw-medium text-dark py-2">OTP</td>
                            <td className="py-2">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </td>
                            <td className="py-2">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </td>
                            <td className="py-2">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td className="fw-medium text-dark py-2">
                              Activity
                            </td>
                            <td className="py-2">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </td>
                            <td className="py-2">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </td>
                            <td className="py-2">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td className="fw-medium text-dark py-2">
                              Account
                            </td>
                            <td className="py-2">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </td>
                            <td className="py-2">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </td>
                            <td className="py-2">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>{" "}
                    {/* end table responsive */}
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

export default NotificationsSettings;
