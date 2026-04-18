import { Link } from "react-router";
import { all_routes } from "../../../routes/all_routes";
import ImageWithBasePath from "../../../components/imageWithBasePath";
import { useState } from "react";
type PasswordField = "password" | "confirmPassword" | "newPassword";

const ResetPassword = () => {
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
    newPassword: false,
  });

  const togglePasswordVisibility = (field: PasswordField) => {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };
  return (
    <div className="overflow-hidden p-3 acc-vh">
      {/* start row */}
      <div className="row vh-100 w-100 g-0">
        <div className="col-lg-6 vh-100  overflow-y-auto overflow-x-hidden">
          {/* start row */}
          <div className="row">
            <div className="col-md-10 mx-auto">
              <form className=" vh-100 d-flex justify-content-between flex-column p-4 pb-0">
                <div className="text-center mb-4 auth-logo">
                  <ImageWithBasePath
                    src="assets/img/logo.svg"
                    className="img-fluid"
                    alt="Logo"
                  />
                </div>
                <div>
                  <div className="mb-3">
                    <h3 className="mb-2">Reset Password?</h3>
                    <p className="mb-0">
                      Enter New Password &amp; Confirm Password to get inside
                    </p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
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
                  <div className="mb-3">
                    <label className="form-label">Confirm Password</label>
                    <div className="input-group input-group-flat pass-group">
                      <input
                        type={
                          passwordVisibility.confirmPassword
                            ? "text"
                            : "password"
                        }
                        className="form-control pass-input"
                        placeholder="****************"
                      />
                      <span
                        className={`ti toggle-password input-group-text toggle-password ${
                          passwordVisibility.confirmPassword
                            ? "ti-eye"
                            : "ti-eye-off"
                        }`}
                        onClick={() =>
                          togglePasswordVisibility("confirmPassword")
                        }
                      ></span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">New Confirm Password</label>
                    <div className="input-group input-group-flat pass-group">
                      <input
                        type={
                          passwordVisibility.newPassword ? "text" : "password"
                        }
                        className="form-control pass-input"
                        placeholder="****************"
                      />
                      <span
                        className={`ti toggle-password input-group-text toggle-password ${
                          passwordVisibility.newPassword
                            ? "ti-eye"
                            : "ti-eye-off"
                        }`}
                        onClick={() => togglePasswordVisibility("newPassword")}
                      ></span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <Link
                      to={all_routes.success}
                      className="btn btn-primary w-100"
                    >
                      Change Password
                    </Link>
                  </div>
                  <div className="mb-3 text-center">
                    <p className="mb-0">
                      Return to{" "}
                      <Link
                        to={all_routes.login}
                        className="link-indigo fw-bold link-hover"
                      >
                        {" "}
                        Login
                      </Link>
                    </p>
                  </div>
                </div>
                <div className="text-center pb-4">
                  <p className="text-dark mb-0">Copyright © 2025 - CRMS</p>
                </div>
              </form>
            </div>{" "}
            {/* end col */}
          </div>
          {/* end row */}
        </div>
        <div className="col-lg-6 account-bg-04" /> {/* end col */}
        {/* end row */}
      </div>
      {/* end row */}
    </div>
  );
};

export default ResetPassword;
