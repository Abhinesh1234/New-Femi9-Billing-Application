import { Link } from "react-router";
import ImageWithBasePath from "../../../components/imageWithBasePath";
import { useState } from "react";
import { all_routes } from "../../../routes/all_routes";
type PasswordField = "password" | "confirmPassword";

const Register = () => {
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
  return (
    <div className="overflow-hidden p-3 acc-vh">
      {/* start row */}
      <div className="row vh-100 w-100 g-0">
        <div className="col-lg-6 vh-100  overflow-y-auto overflow-x-hidden">
          {/* start row */}
          <div className="row">
            <div className="col-md-10 mx-auto">
              <form className=" vh-100 d-flex justify-content-between flex-column p-4 pb-0">
                <div className="text-center mb-3 auth-logo">
                  <ImageWithBasePath
                    src="assets/img/logo.svg"
                    className="img-fluid"
                    alt="Logo"
                  />
                </div>
                <div>
                  <div className="mb-3">
                    <h3 className="mb-2">Register</h3>
                    <p className="mb-0">Create new CRMS account</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <div className="input-group input-group-flat">
                      <input type="text" className="form-control" />
                      <span className="input-group-text">
                        <i className="ti ti-user" />
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <div className="input-group input-group-flat">
                      <input type="email" className="form-control" />
                      <span className="input-group-text">
                        <i className="ti ti-mail" />
                      </span>
                    </div>
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
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="form-check form-check-md d-flex align-items-center">
                      <input
                        className="form-check-input mt-0"
                        type="checkbox"
                        defaultValue=""
                        id="checkebox-md"
                        defaultChecked
                      />
                      <label
                        className="form-check-label ms-1"
                        htmlFor="checkebox-md"
                      >
                        I agree to the{" "}
                        <Link to="#" className="text-primary link-hover">
                          Terms &amp; Privacy
                        </Link>
                      </label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <Link
                      to={all_routes.login}
                      className="btn btn-primary w-100"
                    >
                      Sign Up
                    </Link>
                  </div>
                  <div className="mb-3">
                    <p className="mb-0">
                      Already have an account?{" "}
                      <Link
                        to={all_routes.login}
                        className="link-indigo fw-bold link-hover"
                      >
                        {" "}
                        Sign In Instead
                      </Link>
                    </p>
                  </div>
                  <div className="or-login text-center position-relative mb-3">
                    <h6 className="fs-14 mb-0 position-relative text-body">
                      OR
                    </h6>
                  </div>
                  <div className="d-flex align-items-center justify-content-center flex-wrap gap-2 mb-3">
                    <div className="text-center flex-fill">
                      <Link
                        to="#"
                        className="p-2 btn btn-info d-flex align-items-center justify-content-center"
                      >
                        <ImageWithBasePath
                          className="img-fluid m-1"
                          src="assets/img/icons/facebook-logo.svg"
                          alt="Facebook"
                        />
                      </Link>
                    </div>
                    <div className="text-center flex-fill">
                      <Link
                        to="#"
                        className="p-2 btn btn-outline-light d-flex align-items-center justify-content-center"
                      >
                        <ImageWithBasePath
                          className="img-fluid  m-1"
                          src="assets/img/icons/google-logo.svg"
                          alt="Facebook"
                        />
                      </Link>
                    </div>
                    <div className="text-center flex-fill">
                      <Link
                        to="#"
                        className="p-2 btn btn-dark d-flex align-items-center justify-content-center"
                      >
                        <ImageWithBasePath
                          className="img-fluid  m-1"
                          src="assets/img/icons/apple-logo.svg"
                          alt="Apple"
                        />
                      </Link>
                    </div>
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
        </div>{" "}
        {/* end col */}
        <div className="col-lg-6 account-bg-02" /> {/* end col */}
      </div>
      {/* end row */}
    </div>
  );
};

export default Register;
