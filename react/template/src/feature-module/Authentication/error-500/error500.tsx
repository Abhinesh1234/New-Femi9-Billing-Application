import { Link } from "react-router"
import ImageWithBasePath from "../../../components/imageWithBasePath"
import { all_routes } from "../../../routes/all_routes"


const Error500 = () => {
  return (
   <div className="container">
  {/* start row */}
  <div className="row justify-content-center align-items-center vh-100">
    <div className="col-md-8 d-flex align-items-center justify-content-center mx-auto">
      <div>
        <div className="error-img mb-4">
          <ImageWithBasePath
            src="assets/img/authentication/error-500.png"
            className="img-fluid"
            alt=""
          />
        </div>
        <div className="text-center">
          <h2 className="mb-3">Oops, something went wrong</h2>
          <p className="mb-3">
            Error 500 Page not found. Sorry the page you looking for <br />{" "}
            doesn’t exist or has been moved
          </p>
          <div className="pb-4">
            <Link to={all_routes.dealsDashboard} className="btn btn-primary">
              <i className="ti ti-chevron-left me-1" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>{" "}
    {/* end col */}
  </div>
  {/* end row */}
</div>

  )
}

export default Error500