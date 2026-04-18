import { Link } from "react-router";
import CommonSelect from "../../../../../components/common-select/commonSelect";
import ImageWithBasePath from "../../../../../components/imageWithBasePath";
import TextEditor from "../../../../../components/texteditor/texteditor";
import {
  Add_Assignee,
  Priority,
  Status_Completed,
  Tag,
} from "../../../../../core/json/selectOption";
import { all_routes } from "../../../../../routes/all_routes";

const Modals = () => {
  return (
    <>
      {/* Add Todo */}
      <div className="modal fade" id="add_todo">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h6 className="modal-title">Add New Todo</h6>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <form>
              <div className="modal-body">
                <div className="row">
                  <div className="col-12">
                    <div className="mb-3">
                      <label className="form-label">Todo Title</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="mb-3">
                      <label className="form-label">Tag</label>
                      <CommonSelect
                        options={Tag}
                        className="select"
                        defaultValue={Tag[0]}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="mb-3">
                      <label className="form-label">Priority</label>
                      <CommonSelect
                        options={Priority}
                        className="select"
                        defaultValue={Priority[0]}
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">Descriptions</label>
                      <div className="snow-editor">
                        <TextEditor />
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="mb-3">
                      <label className="form-label">Add Assignee</label>
                      <CommonSelect
                        options={Add_Assignee}
                        className="select"
                        defaultValue={Add_Assignee[0]}
                      />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="mb-0">
                      <label className="form-label">Status</label>
                      <CommonSelect
                        options={Status_Completed}
                        className="select"
                        defaultValue={Status_Completed[0]}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light me-2"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add New Todo
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Add Todo end */}
      {/* Edit Todo */}
      <div className="modal fade" id="edit_todo">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h6 className="modal-title">Edit Todo</h6>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <form >
              <div className="modal-body">
                <div className="row">
                  <div className="col-12">
                    <div className="mb-3">
                      <label className="form-label">Todo Title</label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue="Update calendar and schedule"
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="mb-3">
                      <label className="form-label">Tag</label>
                      <CommonSelect
                        options={Tag}
                        className="select"
                        defaultValue={Tag[1]}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="mb-3">
                      <label className="form-label">Priority</label>
                      <CommonSelect
                        options={Priority}
                        className="select"
                        defaultValue={Priority[1]}
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">Descriptions</label>
                      <div className="snow-editor">
                        <TextEditor/>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="mb-3">
                      <label className="form-label">Add Assignee</label>
                      <CommonSelect
                        options={Add_Assignee}
                        className="select"
                        defaultValue={Add_Assignee[1]}
                      />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="mb-0">
                      <label className="form-label">Status</label>
                      <CommonSelect
                        options={Status_Completed}
                        className="select"
                        defaultValue={Status_Completed[1]}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light me-2"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Edit Todo end */}
      {/* Todo Details */}
      <div className="modal fade" id="view_todo">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title me-1">Plan tasks for the next day</h4>
              <span className="badge bg-danger d-inline-flex align-items-center p-1 me-1">
                <i className="ti ti-square me-1" />
                Urgent
              </span>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <h5 className="mb-2">Task Details</h5>
              <div className="border rounded mb-3 p-2">
                <div className="row row-gap-3">
                  <div className="col-md-4">
                    <div className="text-center">
                      <span className="d-block mb-1">Created On</span>
                      <p className="text-dark mb-0">22 July 2025</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center">
                      <span className="d-block mb-1">Due Date</span>
                      <p className="text-dark mb-0">22 July 2025</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center">
                      <span className="d-block mb-1">Status</span>
                      <span className="badge badge-soft-success d-inline-flex align-items-center">
                        <i className="fas fa-circle fs-6 me-1" />
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <h5 className="mb-2">Description</h5>
                <p>
                  Hiking is a long, vigorous walk, usually on trails or
                  footpaths in the countryside. Walking for pleasure developed
                  in Europe during the eighteenth century. Religious pilgrimages
                  have existed much longer but they involve walking long
                  distances for a spiritual purpose associated with specific
                  religions and also we achieve inner peace while we hike at a
                  local park.
                </p>
              </div>
              <div className="mb-3">
                <h5 className="mb-2">Tags</h5>
                <div className="d-flex align-items-center">
                  <span className="badge bg-danger me-2">Internal</span>
                  <span className="badge bg-success me-2">Projects</span>
                  <span className="badge bg-secondary">Reminder</span>
                </div>
              </div>
              <div>
                <h5 className="mb-2">Assignee</h5>
                <div className="avatar-list-stacked avatar-group-sm">
                  <span className="avatar avatar-rounded">
                    <ImageWithBasePath
                      className="border border-white"
                      src="assets/img/profiles/avatar-01.jpg"
                      alt="img"
                    />
                  </span>
                  <span className="avatar avatar-rounded">
                    <ImageWithBasePath
                      className="border border-white"
                      src="assets/img/profiles/avatar-02.jpg"
                      alt="img"
                    />
                  </span>
                  <span className="avatar avatar-rounded">
                    <ImageWithBasePath
                      className="border border-white"
                      src="assets/img/profiles/avatar-03.jpg"
                      alt="img"
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Todo Details end */}
      {/* Start Modal  */}
      <div className="modal fade" id="delete_modal">
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content">
            <div className="modal-body text-center">
              <div className="mb-3">
                <span className="avatar bg-danger">
                  <i className="ti ti-trash fs-24" />
                </span>
              </div>
              <h6 className="fs-16 mb-1">Delete Confirmation</h6>
              <p className="mb-3">Are you sure want to delete?</p>
              <div className="d-flex justify-content-center">
                <Link
                  to="#"
                  className="btn btn-light me-3"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </Link>
                <Link to={all_routes.todo} className="btn btn-danger">
                  Yes, Delete
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Modal  */}
    </>
  );
};

export default Modals;
