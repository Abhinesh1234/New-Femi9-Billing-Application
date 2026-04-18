import { Link } from "react-router"
import Footer from "../../../../components/footer/footer"
import { all_routes } from "../../../../routes/all_routes"


const MembershipAddons = () => {
  return (
    <>
  {/* ========================
			Start Page Content
		========================= */}
  <div className="page-wrapper">
    {/* Start Content */}
    <div className="content pb-0">
      <div className="row">
        <div className="col-lg-10 mx-auto">
          {/* card start */}
          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <h6 className="fs-18 mb-0">Membership Addons</h6>
              <Link
                to={all_routes.membershipplan}
                className="btn btn-primary btn-sm"
              >
                Back
                <i className="ti ti-chevron-right ms-1" />
              </Link>
            </div>
            <form>
              <div className="card-body pb-0">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Contacts <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="text"
                          className="form-control"
                          defaultValue="0-100"
                        />
                        <div className="form-check form-switch ms-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                          />
                        </div>
                      </div>
                      <div className="form-check mt-1">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="customCheck1"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="customCheck1"
                        >
                          Unlimited
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Leads <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="text"
                          className="form-control"
                          defaultValue="0-100"
                        />
                        <div className="form-check form-switch ms-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                          />
                        </div>
                      </div>
                      <div className="form-check mt-1">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="customCheck2"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="customCheck2"
                        >
                          Unlimited
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Companies <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="text"
                          className="form-control"
                          defaultValue="0-100"
                        />
                        <div className="form-check form-switch ms-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                          />
                        </div>
                      </div>
                      <div className="form-check mt-1">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="customCheck3"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="customCheck3"
                        >
                          Unlimited
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Compaigns <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="text"
                          className="form-control"
                          defaultValue="0-100"
                        />
                        <div className="form-check form-switch ms-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                          />
                        </div>
                      </div>
                      <div className="form-check mt-1">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="customCheck4"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="customCheck4"
                        >
                          Unlimited
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Projects <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="text"
                          className="form-control"
                          defaultValue="0-100"
                        />
                        <div className="form-check form-switch ms-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                          />
                        </div>
                      </div>
                      <div className="form-check mt-1">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="customCheck5"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="customCheck5"
                        >
                          Unlimited
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Deals <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="text"
                          className="form-control"
                          defaultValue="0-100"
                        />
                        <div className="form-check form-switch ms-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                          />
                        </div>
                      </div>
                      <div className="form-check mt-1">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="customCheck6"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="customCheck6"
                        >
                          Unlimited
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Tasks <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="text"
                          className="form-control"
                          defaultValue="0-100"
                        />
                        <div className="form-check form-switch ms-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                          />
                        </div>
                      </div>
                      <div className="form-check mt-1">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="customCheck7"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="customCheck7"
                        >
                          Unlimited
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Pipelines <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="text"
                          className="form-control"
                          defaultValue="0-100"
                        />
                        <div className="form-check form-switch ms-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                          />
                        </div>
                      </div>
                      <div className="form-check mt-1">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="customCheck8"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="customCheck8"
                        >
                          Unlimited
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-footer d-flex align-items-center justify-content-end">
                <button type="button" className="btn btn-light btn-sm me-2">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Create New
                </button>
              </div>
            </form>
          </div>
          {/* card end */}
        </div>
      </div>
    </div>
    {/* End Content */}
    {/* Start Footer */}
    <Footer/>
    {/* End Footer */}
  </div>
  {/* ========================
			End Page Content
		========================= */}
</>

  )
}

export default MembershipAddons