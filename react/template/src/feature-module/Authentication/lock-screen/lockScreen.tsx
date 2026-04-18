import { Link } from "react-router"
import ImageWithBasePath from "../../../components/imageWithBasePath"
import { useState } from "react";
import { all_routes } from "../../../routes/all_routes";
type PasswordField = "password" | "confirmPassword";

const LockScreen = () => {
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
    <div className="d-flex flex-wrap w-100 vh-100 overflow-hidden">
  <div className="d-flex align-items-center justify-content-center flex-wrap vh-100 overflow-auto w-100">
    {/* start row */}
    <div className="row vh-100 w-100">
      <div className="col-md-5 mx-auto vh-100">
        <div className="vh-100 d-flex justify-content-between flex-column p-4 pb-0">
          <div className="text-center mb-5">
            <ImageWithBasePath src="assets/img/logo.svg" className="img-fluid" alt="Logo" />
          </div>
          <form>
            <div className="card shadow mb-5">
              <div className="card-body">
                <div className="text-center">
                  <p className="mb-3">Welcome back!</p>
                  <div className="mb-3">
                    <span className="avatar avatar-xxxl rounded-circle mb-2">
                      <ImageWithBasePath
                        src="assets/img/profiles/avatar-14.jpg"
                        className="img-fluid rounded-circle"
                        alt="Profile"
                      />
                    </span>
                    <h5 className="mb-0">Adrian Davies</h5>
                  </div>
                </div>
                <div className="mb-3">
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
                <div className="mb-0">
                  <Link to={all_routes.login} className="btn btn-primary w-100">
                    Log In
                  </Link>
                </div>
              </div>{" "}
              {/* end card body */}
            </div>{" "}
            {/* end card */}
          </form>
          <div>
            <div className="d-flex align-items-center flex-wrap gap-3 justify-content-center mb-3">
              <Link to="#">Terms &amp; Condition</Link>
              <Link to="#">Privacy</Link>
              <Link to="#">Help</Link>
              <div className="dropdown">
                <Link
                  to="#"
                  className="dropdown-toggle border-0 p-0 bg-transparent shadow-none"
                  data-bs-toggle="dropdown"
                >
                  English
                </Link>
                <div className="dropdown-menu dropdown-menu-end">
                  <Link to="#" className="dropdown-item">
                    French
                  </Link>
                  <Link to="#" className="dropdown-item">
                    Spanish
                  </Link>
                </div>
              </div>
            </div>
            <div className="text-center pb-4">
              <p className="text-dark mb-0">Copyright © {new Date().getFullYear()} - CRMS</p>
            </div>
          </div>
        </div>
      </div>{" "}
      {/* end col */}
    </div>
    {/* end row */}
  </div>
</div>

  )
}

export default LockScreen