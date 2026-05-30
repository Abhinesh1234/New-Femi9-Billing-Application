import { Link } from "react-router";
import { all_routes } from "../../../routes/all_routes";

const Error403 = () => {
  return (
    <div className="container">
      <div className="row justify-content-center align-items-center vh-100">
        <div className="col-md-8 d-flex align-items-center justify-content-center mx-auto">
          <div>
            <div className="text-center p-4">
              <div style={{ fontSize: 80, color: "#e74c3c", marginBottom: 16 }}>
                <i className="ti ti-lock" />
              </div>
              <h1 className="mb-2" style={{ fontSize: 72, fontWeight: 700, color: "#e74c3c" }}>403</h1>
            </div>
            <div className="text-center">
              <h2 className="mb-3">Access Denied</h2>
              <p className="mb-3">
                You don't have permission to access this page.<br />
                Contact your administrator if you think this is a mistake.
              </p>
              <div className="pb-4">
                <Link
                  to={all_routes.dealsDashboard}
                  className="btn btn-primary d-inline-flex align-items-center"
                >
                  <i className="ti ti-chevron-left me-1" />
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error403;
