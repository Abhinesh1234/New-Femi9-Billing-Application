import { Link } from "react-router";
import PageHeader from "../../../../components/page-header/pageHeader";
import SettingsTopbar from "../settings-topbar/settingsTopbar";
import { all_routes } from "../../../../routes/all_routes";
import Footer from "../../../../components/footer/footer";
import CommonPhoneInput from "../../../../components/common-phoneInput/commonPhoneInput";
import { useState } from "react";
import CommonSelect from "../../../../components/common-select/commonSelect";
import { Reason } from "../../../../core/json/selectOption";
type PasswordField = "password" | "confirmPassword";

const SecuritySettings = () => {
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });

  const togglePasswordVisibility = (field: PasswordField) => {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };
  const [phone, setPhone] = useState<string | undefined>();
  const [phone2, setPhone2] = useState<string | undefined>();

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
                        className="d-block p-2 fw-medium active"
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
                <div className="card-body pb-0">
                  <div className="border-bottom mb-3 pb-3">
                    <h5 className="mb-0 fs-17">Security Settings</h5>
                  </div>
                  {/* start row */}
                  <div className="row">
                    <div className="col-lg-4 col-md-6 d-flex">
                      <div className="card border shadow-none flex-fill mb-3">
                        <div className="card-body d-flex justify-content-between flex-column">
                          <div className="mb-3">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <h6 className="fs-14 fw-semibold mb-0">
                                Password
                              </h6>
                            </div>
                            <p className="fs-13 mb-0">
                              Last Changed 03 Jan 2025, 09:00 AM
                            </p>
                          </div>
                          <div>
                            <Link
                              to="javascript:void(0)"
                              className="btn btn-xs btn-light"
                              data-bs-toggle="modal"
                              data-bs-target="#change_password"
                            >
                              Change Password
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>{" "}
                    {/* end col */}
                    <div className="col-lg-4 col-md-6 d-flex">
                      <div className="card border shadow-none flex-fill mb-3">
                        <div className="card-body d-flex justify-content-between flex-column">
                          <div className="mb-3">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <h6 className="fs-14 fw-semibold mb-0">
                                Two Factor
                              </h6>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </div>
                            <p className="fs-13 mb-0">
                              Receive codes via SMS or email every time you
                              login
                            </p>
                          </div>
                          <div>
                            <span className="badge badge-soft-success">
                              Enabled
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>{" "}
                    {/* end col */}
                    <div className="col-lg-4 col-md-6 d-flex">
                      <div className="card border shadow-none flex-fill mb-3">
                        <div className="card-body d-flex justify-content-between flex-column">
                          <div className="mb-3">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <h6 className="fs-14 fw-semibold mb-0">
                                Google Authenticator
                              </h6>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </div>
                            <p className="fs-13 mb-0">
                              Google Authenticator adds an extra layer of
                              security
                            </p>
                          </div>
                          <div>
                            <span className="badge badge-soft-success">
                              Connected
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>{" "}
                    {/* end col */}
                    <div className="col-lg-4 col-md-6 d-flex">
                      <div className="card border shadow-none flex-fill mb-3">
                        <div className="card-body d-flex justify-content-between flex-column">
                          <div className="mb-3">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <h6 className="fs-14 fw-semibold mb-0">
                                Phone Number Verification
                                <i className="ti ti-discount-check-filled text-success ms-1" />
                              </h6>
                            </div>
                            <p className="fs-13 mb-0">
                              Verified Mobile Number :{" "}
                              <span className="text-dark">+99264710583</span>
                            </p>
                          </div>
                          <div className="d-flex align-items-center">
                            <Link
                              to="javascript:void(0)"
                              className="btn btn-xs btn-light me-2"
                              data-bs-toggle="modal"
                              data-bs-target="#change_phone_number"
                            >
                              Change
                            </Link>
                            <Link
                              to="javascript:void(0)"
                              className="link-primary fs-12 fw-medium"
                            >
                              Remove
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>{" "}
                    {/* end col */}
                    <div className="col-lg-4 col-md-6 d-flex">
                      <div className="card border shadow-none flex-fill mb-3">
                        <div className="card-body d-flex justify-content-between flex-column">
                          <div className="mb-3">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <h6 className="fs-14 fw-semibold mb-0">
                                Email Verification
                                <i className="ti ti-discount-check-filled text-success ms-1" />
                              </h6>
                            </div>
                            <p className="fs-13 mb-0">
                              Verified Email :{" "}
                              <span className="text-dark">
                                info@example.com
                              </span>
                            </p>
                          </div>
                          <div className="d-flex align-items-center">
                            <Link
                              to="javascript:void(0)"
                              className="btn btn-xs btn-light me-2"
                              data-bs-toggle="modal"
                              data-bs-target="#change_email"
                            >
                              Change
                            </Link>
                            <Link
                              to="javascript:void(0)"
                              className="link-primary fs-12 fw-medium"
                            >
                              Remove
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>{" "}
                    {/* end col */}
                    <div className="col-lg-4 col-md-6 d-flex">
                      <div className="card border shadow-none flex-fill mb-3">
                        <div className="card-body d-flex justify-content-between flex-column">
                          <div className="mb-3">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <h6 className="fs-14 fw-semibold mb-0">
                                Device Management
                              </h6>
                            </div>
                            <p className="fs-13 mb-0">
                              Last Changed 15 Jan 2025, 12:00 AM
                            </p>
                          </div>
                          <div className="d-flex align-items-center">
                            <Link
                              to="javascript:void(0)"
                              className="btn btn-xs btn-light"
                              data-bs-toggle="modal"
                              data-bs-target="#device_management"
                            >
                              Manage
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>{" "}
                    {/* end col */}
                    <div className="col-lg-4 col-md-6 d-flex">
                      <div className="card border shadow-none flex-fill mb-3">
                        <div className="card-body d-flex justify-content-between flex-column">
                          <div className="mb-3">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <h6 className="fs-14 fw-semibold mb-0">
                                Account Activity
                              </h6>
                            </div>
                            <p className="fs-13 mb-0">
                              Last Changed 20 Jan 2025, 11:30 AM
                            </p>
                          </div>
                          <div className="d-flex align-items-center">
                            <Link
                              to="javascript:void(0)"
                              className="btn btn-xs btn-light"
                              data-bs-toggle="modal"
                              data-bs-target="#account_activity"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>{" "}
                    {/* end col */}
                    <div className="col-lg-4 col-md-6 d-flex">
                      <div className="card border shadow-none flex-fill mb-3">
                        <div className="card-body d-flex justify-content-between flex-column">
                          <div className="mb-3">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <h6 className="fs-14 fw-semibold mb-0">
                                Deactive Account
                              </h6>
                            </div>
                            <p className="fs-13 mb-0">
                              Last Changed 04 Mar 2023, 08:40 AM
                            </p>
                          </div>
                          <div className="d-flex align-items-center">
                            <Link
                              to="javascript:void(0)"
                              className="btn btn-xs btn-light"
                              data-bs-toggle="modal"
                              data-bs-target="#deactive_account"
                            >
                              Deactive
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>{" "}
                    {/* end col */}
                    <div className="col-lg-4 col-md-6 d-flex">
                      <div className="card border shadow-none flex-fill mb-3">
                        <div className="card-body d-flex justify-content-between flex-column">
                          <div className="mb-3">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <h6 className="fs-14 fw-semibold mb-0">
                                Delete Account
                              </h6>
                            </div>
                            <p className="fs-13 mb-0">
                              Last Changed 13 Mar 2023, 02:40 PM
                            </p>
                          </div>
                          <div className="d-flex align-items-center">
                            <Link
                              to="javascript:void(0)"
                              className="btn btn-xs btn-light"
                              data-bs-toggle="modal"
                              data-bs-target="#delete_account"
                            >
                              Delete Account
                            </Link>
                          </div>
                        </div>
                      </div>{" "}
                      {/* end col */}
                    </div>
                    {/* end row */}
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
      {/* Change Password */}
      <div className="modal fade" id="change_password" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Change Password</h5>
              <button
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
                    Current Password <span className="text-danger">*</span>
                  </label>
                  <input type="password" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    New Password <span className="text-danger">*</span>
                  </label>
                  <input type="password" className="form-control" />
                </div>
                <div className="mb-0">
                  <label className="form-label">
                    Confirm Password <span className="text-danger">*</span>
                  </label>
                  <input type="password" className="form-control" />
                </div>
              </div>
              <div className="modal-footer">
                <div className="d-flex align-items-center">
                  <Link
                    to="#"
                    className="btn btn-light me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </Link>
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Change Password */}
      {/* Phone Number Password */}
      <div className="modal fade" id="change_phone_number" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Phone Number Verify</h5>
              <button
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
                  <div className="input-blocks">
                    <label className="form-label">
                      Current Phone Number{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <CommonPhoneInput
                      value={phone}
                      onChange={setPhone}
                      placeholder="(201) 555-0123"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <div>
                    <label className="form-label">
                      New Phone Number <span className="text-danger">*</span>
                    </label>
                    <CommonPhoneInput
                      value={phone2}
                      onChange={setPhone2}
                      placeholder="(201) 555-0123"
                    />
                  </div>
                  <p className="mt-2">
                    <i className="ti ti-info-circle me-1" />
                    New phone number only updated once you verified{" "}
                  </p>
                </div>
                <div>
                  <label className="form-label">
                    Current Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group input-group-flat pass-group">
                    <input
                      type={passwordVisibility.password ? "text" : "password"}
                      className="form-control pass-input"
                      placeholder="****************"
                    />
                    <span
                      className={`ti toggle-password input-group-text toggle-password ${
                        passwordVisibility.password ? "ti-eye" : "ti-eye-off"
                      }`}
                      onClick={() => togglePasswordVisibility("password")}
                    ></span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <div className="d-flex align-items-center">
                  <Link
                    to="#"
                    className="btn btn-light me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </Link>
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Phone Number Password */}
      {/* Change Email Password */}
      <div className="modal fade" id="change_email" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Change Email Address</h5>
              <button
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
                  <div className="input-blocks">
                    <label className="form-label">
                      Current Email Address{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <input type="email" className="form-control" />
                  </div>
                </div>
                <div className="mb-3">
                  <div>
                    <label className="form-label">
                      New Email Address<span className="text-danger">*</span>
                    </label>
                    <input className="form-control" type="email" />
                  </div>
                  <p className="d-inline-flex align-items-center mt-1 mb-0">
                    <i className="ti ti-info-circle me-1" />
                    New email address only updated once you verified{" "}
                  </p>
                </div>
                <div>
                  <label className="form-label">
                    Confirm Password<span className="text-danger">*</span>
                  </label>
                  <div className="input-group input-group-flat pass-group">
                    <input
                      type={passwordVisibility.password ? "text" : "password"}
                      className="form-control pass-input"
                      placeholder="****************"
                    />
                    <span
                      className={`ti toggle-password input-group-text toggle-password ${
                        passwordVisibility.password ? "ti-eye" : "ti-eye-off"
                      }`}
                      onClick={() => togglePasswordVisibility("password")}
                    ></span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <div className="d-flex align-items-center">
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
      {/* /Change Email Password */}
      {/* Change Device Password */}
      <div className="modal fade" id="device_management" role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Device Management</h5>
              <button
                className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form>
              <div className="modal-body">
                {/* Start Table */}
                <div className="table-responsive custom-table">
                  <table className="table table-nowrap">
                    <thead className="table-light">
                      <tr>
                        <th>Device</th>
                        <th>Date</th>
                        <th>Location</th>
                        <th>IP Address</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Chrome - Windows</td>
                        <td>15 May 2025, 10:30AM</td>
                        <td>New York / USA</td>
                        <td>232.222.12.72</td>
                        <td>
                          <div className="dropdown table-action">
                            <Link
                              to="#"
                              className="action-icon btn btn-xs shadow btn-icon btn-outline-light "
                            >
                              <i className="ti ti-logout" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>Safari Macos</td>
                        <td>10 Apr 2025, 05:15 PM</td>
                        <td>New York / USA</td>
                        <td>224.111.12.75</td>
                        <td>
                          <div className="dropdown table-action">
                            <Link
                              to="#"
                              className="action-icon btn btn-xs shadow btn-icon btn-outline-light "
                            >
                              <i className="ti ti-logout" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>Firefox Windows</td>
                        <td>15 Mar 2025, 02:40 PM</td>
                        <td>New York / USA</td>
                        <td>111.222.13.28</td>
                        <td>
                          <div className="dropdown table-action">
                            <Link
                              to="#"
                              className="action-icon btn btn-xs shadow btn-icon btn-outline-light "
                            >
                              <i className="ti ti-logout" />
                            </Link>
                          </div>    
                        </td>
                      </tr>
                      <tr>
                        <td>Safari Macos</td>
                        <td>15 Jan 2025, 08:00AM</td>
                        <td>New York / USA</td>
                        <td>120.517.26.17</td>
                        <td>
                          <div className="dropdown table-action">
                            <Link
                              to="#"
                              className="action-icon btn btn-xs shadow btn-icon btn-outline-light "
                            >
                              <i className="ti ti-logout" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* End Table */}
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Change Device Password */}
      {/* Change Account Activity */}
      <div className="modal fade" id="account_activity" role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Account Activity</h5>
              <button
                className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form>
              <div className="modal-body">
                {/* Start Table */}
                <div className="table-responsive custom-table">
                  <table className="table table-nowrap">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Device</th>
                        <th>IP Address</th>
                        <th>Location</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>15 May 2025, 10:30AM</td>
                        <td>Chrome - Windows</td>
                        <td>232.222.12.72</td>
                        <td>New York / USA</td>
                        <td>
                          <div className="dropdown table-action">
                            <Link
                              to="#"
                              className="action-icon btn btn-xs shadow btn-icon btn-outline-light "
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              <i className="ti ti-logout" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>10 Apr 2025, 05:15 PM</td>
                        <td>Safari Macos</td>
                        <td>224.111.12.75</td>
                        <td>New York / USA</td>
                        <td>
                          <div className="dropdown table-action">
                            <Link
                              to="#"
                              className="action-icon btn btn-xs shadow btn-icon btn-outline-light "
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              <i className="ti ti-logout" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>15 Mar 2025, 02:40 PM</td>
                        <td>Firefox Windows</td>
                        <td>111.222.13.28</td>
                        <td>New York / USA</td>
                        <td>
                          <div className="dropdown table-action">
                            <Link
                              to="#"
                              className="action-icon btn btn-xs shadow btn-icon btn-outline-light "
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              <i className="ti ti-logout" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>15 Jan 2025, 08:00AM</td>
                        <td>Safari Macos</td>
                        <td>120.517.26.17</td>
                        <td>New York / USA</td>
                        <td>
                          <div className="dropdown table-action">
                            <Link
                              to="#"
                              className="action-icon btn btn-xs shadow btn-icon btn-outline-light "
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              <i className="ti ti-logout" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* End Table */}
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Change Device Password */}
      {/* Deactivate Account modal */}
      <div className="modal fade" id="deactive_account">
        <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
          <div className="modal-content rounded-0">
            <div className="modal-body p-4 text-center position-relative">
              <div className="mb-3 position-relative z-1">
                <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle">
                  <i className="ti ti-trash fs-24" />
                </span>
              </div>
              <h5 className="mb-1">Deactive Account Confirmation</h5>
              <p className="mb-3">
                Are you sure you want to deactivate your account.
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
      {/* Deactivate Account modal */}
      {/* Delete Account */}
      <div className="modal fade" id="delete_account" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Deleting Your Account</h5>
              <button
                className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form>
              <div className="modal-body" data-select2-id={6}>
                <p className="fw-medium fs-16 mb-1 text-dark">
                  Why Are You Deleting Your Account?
                </p>
                <p className="fs-16 mb-3">
                  We're sorry to see you go! To help us improve, please let us
                  know your reason for deleting your account
                </p>
                <div className="row" data-select2-id={5}>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Reason<span className="text-danger ms-1">*</span>
                      </label>
                       <CommonSelect
                            options={Reason}
                            className="select"
                            defaultValue={Reason[0]}
                          />
                    </div>
                  </div>
                  {/* end col */}
                  <div
                    className="col-md-12"
                    id="otherReasonBox"
                    style={{ display: "none" }}
                  >
                    <label className="form-label">
                      Please Specify<span className="text-danger ms-1">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Description"
                      defaultValue={""}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <div className="d-flex align-items-center">
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
      {/* Delete Password */}
    </>
  );
};

export default SecuritySettings;
