import { Link } from "react-router"
import Footer from "../../../components/footer/footer"
import { all_routes } from "../../../routes/all_routes"

const EditPage = () => {
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
              <h6 className="fs-18 mb-0">Edit Page</h6>
              <Link to={all_routes.pages} className="btn btn-primary btn-sm">
                Back
                <i className="ti ti-chevron-right ms-1" />
              </Link>
            </div>
            <form>
              <div className="card-body pb-0">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Title <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue="Reports"
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Slug <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue="reports"
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Keywords <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue="Reports"
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <div>
                        <div className="form-check form-check-inline">
                          <input
                            type="radio"
                            id="customRadio1"
                            name="customRadio1"
                            className="form-check-input"
                            defaultChecked
                          />
                          <label
                            className="form-check-label"
                            htmlFor="customRadio1"
                          >
                            Active
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            type="radio"
                            id="customRadio2"
                            name="customRadio1"
                            className="form-check-input"
                          />
                          <label
                            className="form-check-label"
                            htmlFor="customRadio2"
                          >
                            Inactive
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">Visibility</label>
                      <div>
                        <div className="form-check form-check-inline">
                          <input
                            type="radio"
                            id="customRadio3"
                            name="customRadio2"
                            className="form-check-input"
                            defaultChecked
                          />
                          <label
                            className="form-check-label"
                            htmlFor="customRadio3"
                          >
                            Show
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            type="radio"
                            id="customRadio4"
                            name="customRadio2"
                            className="form-check-input"
                          />
                          <label
                            className="form-check-label"
                            htmlFor="customRadio4"
                          >
                            Hide
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        defaultValue={
                          " Track revenue targets, closed deals, deal velocity, and quota attainment by team or individual sales reps."
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-footer d-flex align-items-center justify-content-end">
                <button type="button" className="btn btn-light btn-sm me-2">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Changes
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

export default EditPage