import { Link } from "react-router";
import { all_routes } from "../../../routes/all_routes";
import ImageWithBasePath from "../../../components/imageWithBasePath";

const EmailVerification = () => {
  return (
    <div className="overflow-hidden p-3 acc-vh">
      {/* start row */}
      <div className="row vh-100 w-100 g-0">
        <div className="col-lg-6 vh-100  overflow-y-auto overflow-x-hidden">
          {/* start row */}
          <div className="row">
            <div className="col-md-10 mx-auto">
              <form className=" vh-100 d-flex justify-content-between flex-column p-4 pb-0">
                <div className="text-center mb-4">
                  <ImageWithBasePath
                    src="assets/img/logo.svg"
                    className="img-fluid"
                    alt="Logo"
                  />
                </div>
                <div>
                  <div className="text-center mb-3">
                    <span className="avatar avatar-xl rounded-circle bg-success mb-4">
                      <i className="ti ti-check fs-26" />
                    </span>
                    <h4 className="mb-2">Verify Your Email</h4>
                    <p className="mb-3">
                      We've sent a link to your email ter4@example.com. Please{" "}
                      <br /> follow the link inside to continue
                    </p>
                    <p className="mb-0">
                      Didn't receive an email?{" "}
                      <Link to="#" className="link-indigo fw-bold link-hover">
                        {" "}
                        Resend Link
                      </Link>
                    </p>
                  </div>
                  <div className="mb-3">
                    <Link
                      to={all_routes.login}
                      className="btn btn-primary w-100"
                    >
                      Skip Now
                    </Link>
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
        <div className="col-lg-6 account-bg-05" /> {/* end col */}
      </div>
      {/* end row */}
    </div>
  );
};

export default EmailVerification;
