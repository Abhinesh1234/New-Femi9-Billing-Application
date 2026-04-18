import { Link } from "react-router"
import ImageWithBasePath from "../../../../../../components/imageWithBasePath"
import { all_routes } from "../../../../../../routes/all_routes"


const Modal = () => {
  return (
    <>
  <div className="modal fade" id="call_history">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <div className="d-flex align-items-center">
            <h6 className="modal-title">Caller Details</h6>
          </div>
          <button
            type="button"
            className="btn-close custom-btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          />
        </div>
        <form>
          <div className="modal-body">
            <div className="card shadow-none">
              <div className="card-body">
                <div className="text-center">
                  <div className="avatar avatar-xxxl mb-3">
                    <ImageWithBasePath
                      src="assets/img/users/user-01.jpg"
                      alt="img"
                      className="rounded-circle"
                    />
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-center">
                  <Link
                    to={all_routes.videoCall}
                    className="btn btn-light btn-icon rounded-circle p-0 d-flex align-items-center justify-content-center me-3"
                  >
                    <i className="ti ti-video fs-13" />
                  </Link>
                  <Link
                    to={all_routes.chat}
                    className="btn btn-light btn-icon rounded-circle p-0 d-flex align-items-center justify-content-center me-3"
                  >
                    <i className="ti ti-message fs-13" />
                  </Link>
                  <Link
                    to={all_routes.audioCall}
                    className="btn btn-light btn-icon rounded-circle p-0 d-flex align-items-center justify-content-center"
                  >
                    <i className="ti ti-phone fs-13" />
                  </Link>
                </div>
              </div>
            </div>
            {/* start row */}
            <div className="row g-3">
              <div className="col-md-6">
                <div>
                  <p className="mb-1 fs-13">Name</p>
                  <h6 className="fw-medium fs-14 mb-0">Anthony Lewis</h6>
                </div>
              </div>
              <div className="col-md-6">
                <div>
                  <p className="mb-1 fs-13">Total Calls</p>
                  <h6 className="fw-medium fs-14 mb-0">20</h6>
                </div>
              </div>
              <div className="col-md-6">
                <div>
                  <p className="mb-1 fs-13">Phone</p>
                  <h6 className="fw-medium fs-14 mb-0">(123) 4567 890</h6>
                </div>
              </div>
              <div className="col-md-6">
                <div>
                  <p className="mb-1 fs-13">Average Call Timing</p>
                  <h6 className="fw-medium fs-14 mb-0">00:30</h6>
                </div>
              </div>
              <div className="col-md-6">
                <div>
                  <p className="mb-1 fs-13">Email</p>
                  <h6 className="fw-medium fs-14 mb-0">anthony@example.com</h6>
                </div>
              </div>
              <div className="col-md-6">
                <div>
                  <p className="mb-1 fs-13">Average Waiting Time</p>
                  <h6 className="fw-medium fs-14 mb-0">00:05</h6>
                </div>
              </div>
            </div>
            {/* end row */}
          </div>
        </form>
      </div>
    </div>
  </div>
  {/* Call End */}
  {/* Delete Modal Start */}
  <div className="modal fade" id="delete_modal">
    <div className="modal-dialog modal-dialog-centered modal-sm">
      <div className="modal-content">
        <div className="modal-body text-center">
          <div className="mb-3">
            <span className="avatar bg-danger">
              <i className="ti ti-trash fs-24" />
            </span>
          </div>
          <h6 className="mb-1">Delete Confirmation</h6>
          <p className="mb-3">Are you sure want to delete?</p>
          <div className="d-flex justify-content-center">
            <Link
              to="#"
              className="btn btn-light me-3"
              data-bs-dismiss="modal"
            >
              Cancel
            </Link>
            <Link to={all_routes.callHistory} className="btn btn-danger">
              Yes, Delete
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
  {/* Delete Modal End */}
</>

  )
}

export default Modal