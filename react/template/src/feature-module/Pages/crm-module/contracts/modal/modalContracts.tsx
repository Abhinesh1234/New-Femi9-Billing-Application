import { Link } from "react-router";
import CommonDatePicker from "../../../../../components/common-datePicker/commonDatePicker";
import { Client, Contract_Type } from "../../../../../core/json/selectOption";
import CommonSelect from "../../../../../components/common-select/commonSelect";
import TextEditor from "../../../../../components/texteditor/texteditor";

const ModalContracts = () => {
  return (
    <>
      {/* Add New Contracts */}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_add"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">Add New Contract</h5>
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
              <div className="row mb-3">
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label">
                      Subject <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Start Date <span className="text-danger"> *</span>
                    </label>
                    <div className="input-group w-auto input-group-flat">
                      <CommonDatePicker placeholder="dd/mm/yyyy" />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      End Date <span className="text-danger"> *</span>
                    </label>
                    <div className="input-group w-auto input-group-flat">
                      <CommonDatePicker placeholder="dd/mm/yyyy" />
                    </div>
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label">
                      Client <span className="text-danger">*</span>
                    </label>
                    <CommonSelect
                      options={Client}
                      className="select"
                      defaultValue={Client[0]}
                    />
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label">
                      Contract Type<span className="text-danger">*</span>
                    </label>
                    <CommonSelect
                      options={Contract_Type}
                      className="select"
                      defaultValue={Contract_Type[0]}
                    />
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label">
                      Contract Value <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" />
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
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label">
                      Description <span className="text-danger">*</span>
                    </label>
                    <div className="editor pages-editor">
                      <TextEditor />
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
      {/* /Add New Contracts */}
      {/* View Contracts */}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_view"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">
            Contract{" "}
            <span className="badge badge-soft-primary fs-12 fw-medium ms-2">
              #1254057
            </span>
          </h5>
          <div className="flex-fill text-end me-2">
            <div className="dropdown">
              <Link
                to="#"
                className="dropdown-toggle btn btn-outline-light px-2 shadow"
                data-bs-toggle="dropdown"
              >
                Mark as Signed
              </Link>
              <div className="dropdown-menu  dropdown-menu-end">
                <ul>
                  <li>
                    <Link to="#" className="dropdown-item">
                      <i className="ti ti-file-type-pdf me-1" />
                      View PDF
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="dropdown-item">
                      <i className="ti ti-checks me-1" />
                      Mark as Signed
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="dropdown-item">
                      <i className="ti ti-file-download me-1" />
                      Download
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="dropdown-item">
                      <i className="ti ti-copy me-1" />
                      Clone
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="dropdown-item">
                      <i className="ti ti-printer me-1" />
                      Print
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <ul
            className="nav nav-tabs nav-bordered border-white mb-3"
            role="tablist"
          >
            <li className="nav-item" role="presentation">
              <Link
                to="#home-b1"
                data-bs-toggle="tab"
                aria-expanded="false"
                className="nav-link show active"
                aria-selected="false"
                tabIndex={-1}
                role="tab"
              >
                <span className="d-md-inline-block">Contract Details</span>
              </Link>
            </li>
            <li className="nav-item" role="presentation">
              <Link
                to="#profile-b1"
                data-bs-toggle="tab"
                aria-expanded="true"
                className="nav-link"
                aria-selected="true"
                role="tab"
              >
                <span className="d-md-inline-block">Renewal History</span>
              </Link>
            </li>
          </ul>
          <div className="tab-content">
            <div className="tab-pane show active" id="home-b1" role="tabpanel">
              <div className="d-flex align-items-center justify-content-end mb-3">
                <Link to="#" className="btn btn-light me-2">
                  Download
                </Link>
                <Link
                  to="#"
                  className="btn btn-primary"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#signup_offcanvas"
                >
                  Sign Now
                </Link>
              </div>
              <h6>Web Design Contract</h6>
              <p>
                Where's the other side. The further off from England the nearer
                is to find my way into a tree. By the use of a well--' 'What did
                they draw?' said Alice, in a sorrowful tone, 'I'm afraid I've
                offended it again
              </p>
              <div className="card">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-lg-6">
                      <div>
                        <h6 className="fw-medium fs-14 mb-2">
                          Contract Value : $25,25,000
                        </h6>
                        <p className="mb-1">
                          Type : <span>Contracts under Seal</span>
                        </p>
                        <p className="mb-1">
                          Start Date : <span>24 Apr 2025</span>
                        </p>
                        <p className="mb-1">
                          End Date : <span>30 Apr 2025</span>
                        </p>
                        <p className="mb-0">
                          Client : <span>Harbor View</span>
                        </p>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div>
                        <h6 className="fw-semibold fs-14 mb-2">CRMS</h6>
                        <p className="mb-1">
                          3338 Marcus Street Birmingham, AL 35211
                        </p>
                        <p className="mb-1">
                          Phone : <span>+1 98789 78788</span>
                        </p>
                        <p className="mb-0">
                          Email : <span> info@example.com</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h6 className="mb-3">Attachment</h6>
              <div className="card">
                <div className="card-body p-2 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <span className="avatar bg-danger me-2">
                      <i className="ti ti-file-type-pdf" />
                    </span>
                    <div>
                      <h6 className="fw-medium fs-14 mb-1">
                        Proposal_webdesign.pdf
                      </h6>
                      <span className="fs-13">15.2 MB</span>
                    </div>
                  </div>
                  <Link
                    to="#"
                    className="avatar avtar-xs rounded-circle text-dark bg-light"
                  >
                    <i className="ti ti-download fs-16" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="tab-pane" id="profile-b1" role="tabpanel">
              <h6 className="mb-3">Renewal History</h6>
              <div className="card">
                <div className="card-body d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="fw-medium fs-14 mb-2">
                      Contract Value : $25,25,000
                    </h6>
                    <div className="d-flex align-items-center gap-3">
                      <p className="mb-0">
                        Start Date :{" "}
                        <span className="text-dark">24 Apr 2025</span>
                      </p>
                      <p className="mb-0">
                        End Date :{" "}
                        <span className="text-dark">30 Apr 2025</span>
                      </p>
                    </div>
                  </div>
                  <Link
                    to="#"
                    className="btn btn-primary"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#signup_offcanvas"
                  >
                    Sign Now
                  </Link>
                </div>
              </div>
              <div className="card">
                <div className="card-body d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="fw-medium fs-14 mb-2">
                      Contract Value : $25,25,000
                    </h6>
                    <div className="d-flex align-items-center gap-3">
                      <p className="mb-0">
                        Start Date :{" "}
                        <span className="text-dark">24 Apr 2025</span>
                      </p>
                      <p className="mb-0">
                        End Date :{" "}
                        <span className="text-dark">30 Apr 2025</span>
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-soft-success">
                    Renewed On : 24 Apr 2025
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /View Contracts */}
      {/* Signup */}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="signup_offcanvas"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">Signature &amp; Confirmation of Identity</h5>
          <button
            type="button"
            className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  First Name <span className="text-danger">*</span>
                </label>
                <input type="text" className="form-control" />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Last Name <span className="text-danger">*</span>
                </label>
                <input type="text" className="form-control" />
              </div>
            </div>
            <div className="col-md-12">
              <div className="mb-3">
                <label className="form-label">
                  Email <span className="text-danger">*</span>
                </label>
                <input type="text" className="form-control" />
              </div>
            </div>
            <div className="col-md-12">
              <div className="mb-3">
                <label className="form-label">
                  Signature <span className="text-danger">*</span>
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
                <div className="d-flex align-items-center my-3 pb-3 border-bottom">
                  <Link to="#" className="badge badge-soft-danger me-2">
                    Clear
                  </Link>
                  <Link to="#" className="badge badge-soft-info">
                    Undo
                  </Link>
                </div>
                <p className="mb-0">
                  By Clicking on “Sign”, I consent to be legally bound by this
                  electronic representation of my signature
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Signup */}
      {/* Edit Contracts */}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_edit"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">Edit Contract</h5>
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
              <div className="row mb-3">
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label">
                      Subject <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue="SEO Proposal"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Start Date <span className="text-danger"> *</span>
                    </label>
                    <div className="input-group w-auto input-group-flat">
                      <CommonDatePicker placeholder="dd/mm/yyyy" />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      End Date <span className="text-danger"> *</span>
                    </label>
                    <div className="input-group w-auto input-group-flat">
                      <CommonDatePicker placeholder="dd/mm/yyyy" />
                    </div>
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label">
                      Client <span className="text-danger">*</span>
                    </label>
                    <CommonSelect
                      options={Client}
                      className="select"
                      defaultValue={Client[1]}
                    />
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label">
                      Contract Type<span className="text-danger">*</span>
                    </label>
                    <CommonSelect
                      options={Contract_Type}
                      className="select"
                      defaultValue={Contract_Type[1]}
                    />
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label">
                      Contract Value <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue="$2,15,000"
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
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label">
                      Description <span className="text-danger">*</span>
                    </label>
                    <div className="editor pages-editor">
                      <TextEditor />
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
      {/* /Edit Contracts */}
      {/* delete modal */}
      <div className="modal fade" id="delete_contracts">
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
                Are you sure you want to remove contract you selected.
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
  );
};

export default ModalContracts;
