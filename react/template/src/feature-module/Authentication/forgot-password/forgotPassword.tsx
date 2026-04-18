import { Link } from "react-router"
import ImageWithBasePath from "../../../components/imageWithBasePath"
import { all_routes } from "../../../routes/all_routes"


const ForgotPassword = () => {
  return (
   <div className="overflow-hidden p-3 acc-vh">
  {/* start row */}
  <div className="row vh-100 w-100 g-0">
    <div className="col-lg-6 vh-100  overflow-y-auto overflow-x-hidden">
      {/* start row */}
      <div className="row">
        <div className="col-md-10 mx-auto">
          <form
            className=" vh-100 d-flex justify-content-between flex-column p-4 pb-0"
          >
            <div className="text-center auth-logo mb-3" >
              <ImageWithBasePath src="assets/img/logo.svg" className="img-fluid" alt="Logo" />
            </div>
            <div>
              <div className="mb-3">
                <h3 className="mb-2">Forgot Password?</h3>
                <p className="mb-0">
                  If you forgot your password, well, then we’ll email you
                  instructions to reset your password.
                </p>
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
                <Link to={all_routes.login} className="btn btn-primary w-100">
                  Submit
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
              <div className="or-login text-center position-relative mb-3">
                <h6 className="fs-14 mb-0 position-relative text-body">OR</h6>
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
    </div>
    <div className="col-lg-6 d-none d-lg-block account-bg-03" /> {/* end col */}
  </div>
  {/* end row */}
</div>

  )
}

export default ForgotPassword