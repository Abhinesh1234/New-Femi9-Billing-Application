import { useState } from "react";
import CommonSelect from "../../../../../components/common-select/commonSelect"
import { Campaign_Type, Currency, Period } from "../../../../../core/json/selectOption"
import CommonTagInputs from "../../../../../components/common-tagInput/commonTagInputs";
import { Link } from "react-router";
import ImageWithBasePath from "../../../../../components/imageWithBasePath";


const ModalCampaign = () => {
  const [tags, setTags] = useState<string[]>(["Small Business", "Corporate Companies"," Urban Apartment"]);
 const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
  };

  return (
    <>
  {/* Add proposals */}
  <div
    className="offcanvas offcanvas-end offcanvas-large"
    tabIndex={-1}
    id="offcanvas_add"
  >
    <div className="offcanvas-header border-bottom">
      <h5 className="mb-0">Add New Campaign</h5>
      <button
        type="button"
        className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      ></button>
    </div>
    <div className="offcanvas-body">
      <form>
        <div>
          <div className="row">
            <div className="col-md-12">
              <div className="mb-3">
                <label className="form-label">
                  Name <span className="text-danger">*</span>
                </label>
                <input type="text" className="form-control" />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Campaign Type <span className="text-danger">*</span>
                </label>
                 <CommonSelect
                            options={Campaign_Type}
                            className="select"
                            defaultValue={Campaign_Type[0]}
                          />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Deal Value <span className="text-danger">*</span>
                </label>
                <input type="text" className="form-control" />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Currency <span className="text-danger">*</span>
                </label>
                <CommonSelect
                            options={Currency}
                            className="select"
                            defaultValue={Currency[0]}
                          />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Period <span className="text-danger">*</span>
                </label>
                  <CommonSelect
                            options={Period}
                            className="select"
                            defaultValue={Period[0]}
                          />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Period Value <span className="text-danger">*</span>
                </label>
                <input type="text" className="form-control" />
              </div>
            </div>
            <div className="col-md-12">
              <div className="mb-3">
                <label className="form-label">
                  Target Audience <span className="text-danger">*</span>
                </label>
               <CommonTagInputs
                            initialTags={tags}
                            onTagsChange={handleTagsChange}
                          />
              </div>
            </div>
            <div className="col-md-12">
              <div className="mb-3">
                <label className="form-label">
                  Description <span className="text-danger">*</span>
                </label>
                <textarea
                  rows={3}
                  className="form-control"
                  placeholder="Description"
                  defaultValue={""}
                />
              </div>
            </div>
            <div className="col-md-12">
              <div className="mb-3">
                <label className="form-label">
                  Attachment <span className="text-danger">*</span>
                </label>
                <div className="file-upload drag-file w-100 d-flex bg-light border shadow align-items-center justify-content-center flex-column">
                  <span className="upload-img d-block mb-1">
                    <i className="ti ti-folder-open text-primary fs-16" />
                  </span>
                  <p className="mb-0 fs-14 text-dark">
                    Drop your files here or{" "}
                    <Link
                      to="#"
                      className="text-decoration-underline text-primary"
                    >
                      browse
                    </Link>
                  </p>
                  <input type="file" accept="video/image" />
                  <p className="fs-13 mb-0">Maximum size : 50 MB</p>
                </div>
              </div>
            </div>
            <div className="col-md-5">
              <div className="card shadow">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <span className="avatar rounded bg-success fs-24 flex-shrink-0">
                        <i className="ti ti-file-spreadsheet" />
                      </span>
                      <div>
                        <h6 className="mb-1 fs-14 fw-medium">
                          Project Specs.xls
                        </h6>
                        <p className="mb-0">365 KB</p>
                      </div>
                    </div>
                    <Link
                      to=""
                      className="btn btn-icon btn-xs rounded-circle btn-outline-light flex-shrink-0"
                    >
                      <i className="ti ti-download" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-5">
              <div className="card bg-light">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <span className="avatar rounded bg-success fs-24 flex-shrink-0">
                        <ImageWithBasePath src="./assets/img/blogs/blog-1.jpg" alt="img" />
                      </span>
                      <div>
                        <h6 className="mb-1 fs-14 fw-medium">637.jpg</h6>
                        <p className="mb-0">365 KB</p>
                      </div>
                    </div>
                    <Link
                      to=""
                      className="btn btn-icon btn-xs rounded-circle btn-outline-light flex-shrink-0"
                    >
                      <i className="ti ti-download" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-end">
          <button
            type="button"
            data-bs-dismiss="offcanvas"
            className="btn btn-light me-2"
          >
            Cancel
          </button>
          <button type="button" className="btn btn-primary">
            Create
          </button>
        </div>
      </form>
    </div>
  </div>
  {/* /Add proposals */}
  {/* edit proposal */}
  <div
    className="offcanvas offcanvas-end offcanvas-large"
    tabIndex={-1}
    id="offcanvas_edit"
  >
    <div className="offcanvas-header border-bottom">
      <h5 className="mb-0">Edit Campaign</h5>
      <button
        type="button"
        className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      ></button>
    </div>
    <div className="offcanvas-body">
      <form>
        <div>
          <div className="row">
            <div className="col-md-12">
              <div className="mb-3">
                <label className="form-label">
                  Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  defaultValue="Distribution"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Campaign Type <span className="text-danger">*</span>
                </label>
                <CommonSelect
                            options={Campaign_Type}
                            className="select"
                            defaultValue={Campaign_Type[1]}
                          />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Deal Value <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  defaultValue="$04,51,000"
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Currency <span className="text-danger">*</span>
                </label>
               <CommonSelect
                            options={Currency}
                            className="select"
                            defaultValue={Currency[1]}
                          />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Period <span className="text-danger">*</span>
                </label>
                <CommonSelect
                            options={Period}
                            className="select"
                            defaultValue={Period[1]}
                          />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Period Value <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  defaultValue="Collins"
                />
              </div>
            </div>
            <div className="col-md-12">
              <div className="mb-3">
                <label className="form-label">
                  Target Audience <span className="text-danger">*</span>
                </label>
               <CommonTagInputs
                            initialTags={tags}
                            onTagsChange={handleTagsChange}
                          />
              </div>
            </div>
            <div className="col-md-12">
              <div className="mb-3">
                <label className="form-label">
                  Description <span className="text-danger">*</span>
                </label>
                <textarea
                  rows={3}
                  className="form-control"
                  placeholder="Description"
                  defaultValue={""}
                />
              </div>
            </div>
            <div className="col-md-12">
              <div className="mb-3">
                <label className="form-label">
                  Attachment <span className="text-danger">*</span>
                </label>
                <div className="file-upload drag-file w-100 d-flex bg-light border shadow align-items-center justify-content-center flex-column">
                  <span className="upload-img d-block mb-1">
                    <i className="ti ti-folder-open text-primary fs-16" />
                  </span>
                  <p className="mb-0 fs-14 text-dark">
                    Drop your files here or{" "}
                    <Link
                      to="#"
                      className="text-decoration-underline text-primary"
                    >
                      browse
                    </Link>
                  </p>
                  <input type="file" accept="video/image" />
                  <p className="fs-13 mb-0">Maximum size : 50 MB</p>
                </div>
              </div>
            </div>
            <div className="col-md-5">
              <div className="card shadow">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <span className="avatar rounded bg-success fs-24 flex-shrink-0">
                        <i className="ti ti-file-spreadsheet" />
                      </span>
                      <div>
                        <h6 className="mb-1 fs-14 fw-medium">
                          Project Specs.xls
                        </h6>
                        <p className="mb-0">365 KB</p>
                      </div>
                    </div>
                    <Link
                      to=""
                      className="btn btn-icon btn-xs rounded-circle btn-outline-light flex-shrink-0"
                    >
                      <i className="ti ti-download" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-5">
              <div className="card bg-light">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <span className="avatar rounded bg-success fs-24 flex-shrink-0">
                        <ImageWithBasePath src="./assets/img/blogs/blog-1.jpg" alt="img" />
                      </span>
                      <div>
                        <h6 className="mb-1 fs-14 fw-medium">637.jpg</h6>
                        <p className="mb-0">365 KB</p>
                      </div>
                    </div>
                    <Link
                      to=""
                      className="btn btn-icon btn-xs rounded-circle btn-outline-light flex-shrink-0"
                    >
                      <i className="ti ti-download" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-end">
          <button
            type="button"
            data-bs-dismiss="offcanvas"
            className="btn btn-light me-2"
          >
            Cancel
          </button>
          <button type="button" className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
  {/* edit proposal */}
  {/* delete modal */}
  <div className="modal fade" id="delete_campaign">
    <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
      <div className="modal-content rounded-0">
        <div className="modal-body p-4 text-center position-relative">
          <div className="mb-3 position-relative z-1">
            <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle">
              <i className="ti ti-trash fs-24" />
            </span>
          </div>
          <h5 className="mb-1">Delete Confirmation</h5>
          <p className="mb-3">
            Are you sure you want to remove campaign you selected.
          </p>
          <div className="d-flex justify-content-center">
            <Link
              to="#"
              className="btn btn-light position-relative z-1 me-2 w-100"
              data-bs-dismiss="modal"
            >
              Cancel
            </Link>
            <Link
              to="#"
              className="btn btn-primary position-relative z-1 w-100"
              data-bs-dismiss="modal"
            >
              Yes, Delete
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
  {/* delete modal */}
</>

  )
}

export default ModalCampaign