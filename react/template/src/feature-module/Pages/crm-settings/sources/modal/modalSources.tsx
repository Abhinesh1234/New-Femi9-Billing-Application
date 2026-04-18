import { Link } from "react-router"
import { all_routes } from "../../../../../routes/all_routes"


const ModalSources = () => {
  return (
    <>
  {/* Add New Source */}
  <div className="modal fade" id="add_source" role="dialog">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Add New Source</h5>
          <button
            className="btn-close custom-btn-close border p-1 me-0 text-dark"
            data-bs-dismiss="modal"
            aria-label="Close"
          />
        </div>
        <form>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">
                Source Name <span className="text-danger">*</span>
              </label>
              <input type="text" className="form-control" />
            </div>
            <div className="mb-0">
              <label className="form-label">Status</label>
              <div className="d-flex align-items-center">
                <div className="me-2">
                  <input
                    type="radio"
                    className="status-radio"
                    id="add-active"
                    name="status"
                  />
                  <label htmlFor="add-active">Active</label>
                </div>
                <div>
                  <input
                    type="radio"
                    className="status-radio"
                    id="add-inactive"
                    name="status"
                  />
                  <label htmlFor="add-inactive">Inactive</label>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <div className="d-flex align-items-center justify-content-end m-0">
              <Link
                to="#"
                className="btn btn-light me-2"
                data-bs-dismiss="modal"
              >
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary">
                Create New
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
  {/* /Add New Source */}
  {/* Edit Source */}
  <div className="modal fade" id="edit_source" role="dialog">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Edit Source</h5>
          <button
            className="btn-close custom-btn-close border p-1 me-0 text-dark"
            data-bs-dismiss="modal"
            aria-label="Close"
          />
        </div>
        <form>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">
                Source Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                defaultValue="Phone Calls"
              />
            </div>
            <div className="mb-0">
              <label className="form-label">Status</label>
              <div className="d-flex align-items-center">
                <div className="me-2">
                  <input
                    type="radio"
                    className="status-radio"
                    id="edit-active"
                    name="status"
                    defaultChecked
                  />
                  <label htmlFor="edit-active">Active</label>
                </div>
                <div>
                  <input
                    type="radio"
                    className="status-radio"
                    id="edit-inactive"
                    name="status"
                  />
                  <label htmlFor="edit-inactive">Inactive</label>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <div className="d-flex align-items-center justify-content-end m-0">
              <Link
                to="#"
                className="btn btn-light me-2"
                data-bs-dismiss="modal"
              >
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
  {/* /Edit Source */}
  {/* Delete Source */}
  <div className="modal fade" id="delete_source" role="dialog">
    <div className="modal-dialog modal-dialog-centered modal-sm">
      <div className="modal-content">
        <div className="modal-body">
          <div className="text-center">
            <div className="avatar avatar-xl bg-danger-light rounded-circle mb-3">
              <i className="ti ti-trash-x fs-36 text-danger" />
            </div>
            <h4 className="mb-2">Delete Confirmation</h4>
            <p className="mb-0">
              Are you sure you want to remove source you selected.
            </p>
            <div className="d-flex align-items-center justify-content-center mt-4">
              <Link
                to="#"
                className="btn btn-light me-2"
                data-bs-dismiss="modal"
              >
                Cancel
              </Link>
              <Link to={all_routes.sources} className="btn btn-danger">
                Yes, Delete it
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  {/* /Delete Source */}
</>

  )
}

export default ModalSources