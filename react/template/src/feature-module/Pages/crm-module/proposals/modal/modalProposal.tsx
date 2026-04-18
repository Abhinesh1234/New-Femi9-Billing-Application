import { Link } from "react-router";
import CommonDatePicker from "../../../../../components/common-datePicker/commonDatePicker";
import {
  Client,
  Currency,
  Deals,
  Proposal_Project,
  Related_TO,
  Status_Accepted,
} from "../../../../../core/json/selectOption";
import CommonSelect from "../../../../../components/common-select/commonSelect";
import ImageWithBasePath from "../../../../../components/imageWithBasePath";
import { useState } from "react";
import MultipleSelect from "../../../../../components/multiple-Select/multipleSelect";
import CommonTagInputs from "../../../../../components/common-tagInput/commonTagInputs";
import TextEditor from "../../../../../components/texteditor/texteditor";
import { all_routes } from "../../../../../routes/all_routes";

const ModalProposal = () => {
  const [tags, setTags] = useState<string[]>(["Tag 1", "Tag 2", "Tag 3"]);
  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
  };
  const [selectedItems2, setSelectedItems2] = useState<string[]>([]);

  const handleChange2 = (value: string[]) => {
    setSelectedItems2(value);
  };
const options2 = [
    {
      label: (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              borderRadius: "50%",
              overflow: "hidden",
              width: 24,
              height: 24,
            }}
          >
            <ImageWithBasePath
              src="assets/img/profiles/avatar-19.jpg"
              alt="Robert"
              width={24}
              height={24}
            />
          </div>
         Darlee Robertson
        </div>
      ),
      value: "robert-johnson",
    },
    {
      label: (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              borderRadius: "50%",
              overflow: "hidden",
              width: 24,
              height: 24,
            }}
          >
            <ImageWithBasePath
              src="assets/img/users/user-01.jpg"
              alt="Sharon"
              width={24}
              height={24}
            />
          </div>
          Sharon Roy
        </div>
      ),
      value: "sharon-roy",
    },
    {
      label: (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              borderRadius: "50%",
              overflow: "hidden",
              width: 24,
              height: 24,
            }}
          >
            <ImageWithBasePath
              src="assets/img/profiles/avatar-21.jpg"
              alt="Vaughan"
              width={24}
              height={24}
            />
          </div>
          Vaughan Lewis
        </div>
      ),
      value: "vaughan-lewis",
    },
    {
      label: (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              borderRadius: "50%",
              overflow: "hidden",
              width: 24,
              height: 24,
            }}
          >
            <ImageWithBasePath
              src="assets/img/profiles/avatar-23.jpg"
              alt="Jessica"
              width={24}
              height={24}
            />
          </div>
          Jessica Louise
        </div>
      ),
      value: "jessica-louise",
    },
    {
      label: (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              borderRadius: "50%",
              overflow: "hidden",
              width: 24,
              height: 24,
            }}
          >
            <ImageWithBasePath
              src="assets/img/profiles/avatar-16.jpg"
              alt="Carol"
              width={24}
              height={24}
            />
          </div>
          Carol Thomas
        </div>
      ),
      value: "carol-thomas",
    },
  ];
  return (
    <>
      {/* Add proposals */}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_add"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">Add New Proposal</h5>
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
                      Date<span className="text-danger"> *</span>
                    </label>
                    <div className="input-group w-auto input-group-flat">
                      <CommonDatePicker placeholder="dd/mm/yyyy" />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Open Till <span className="text-danger">*</span>
                    </label>
                    <div className="input-group w-auto input-group-flat">
                      <CommonDatePicker placeholder="dd/mm/yyyy" />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
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
                <div className="col-md-6">
                  <div className="mb-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <label className="form-label">
                        Project<span className="text-danger">*</span>
                      </label>
                      <Link
                        to="#"
                        className="label-add link-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#add_project"
                      >
                        <i className="ti ti-plus me-1" />
                        Add New
                      </Link>
                    </div>
                    <CommonSelect
                      options={Proposal_Project}
                      className="select"
                      defaultValue={Proposal_Project[0]}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Related to <span className="text-danger">*</span>
                    </label>
                    <CommonSelect
                      options={Related_TO}
                      className="select"
                      defaultValue={Related_TO[0]}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <label className="form-label">
                        Deals<span className="text-danger">*</span>
                      </label>
                      <Link
                        to="#"
                        className="label-add link-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#add_deal"
                      >
                        <i className="ti ti-plus me-1" />
                        Add New
                      </Link>
                    </div>
                    <CommonSelect
                      options={Deals}
                      className="select"
                      defaultValue={Deals[0]}
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
                      defaultValue={Currency[0]}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Status <span className="text-danger">*</span>
                    </label>
                    <CommonSelect
                      options={Status_Accepted}
                      className="select"
                      defaultValue={Status_Accepted[0]}
                    />
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label">
                      Assigned to <span className="text-danger">*</span>
                    </label>
                    <MultipleSelect
                      value={selectedItems2}
                      onChange={handleChange2}
                      options={options2}
                      placeholder="Select"
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
                    <label className="form-label">Tags </label>
                    <CommonTagInputs
                      initialTags={tags}
                      onTagsChange={handleTagsChange}
                    />
                    <span className="fs-13 mb-0">
                      Enter value separated by comma
                    </span>
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
      {/* /Add proposals */}
      {/* edit proposal */}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_edit"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">Edit Proposal</h5>
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
                      defaultValue="SEO Proposals"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Date<span className="text-danger"> *</span>
                    </label>
                    <div className="input-group w-auto input-group-flat">
                      <CommonDatePicker placeholder="dd/mm/yyyy" />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Open Till <span className="text-danger">*</span>
                    </label>
                    <div className="input-group w-auto input-group-flat">
                      <CommonDatePicker placeholder="dd/mm/yyyy" />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
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
                <div className="col-md-6">
                  <div className="mb-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <label className="form-label">
                        Project<span className="text-danger">*</span>
                      </label>
                      <Link
                        to="#"
                        className="label-add link-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#add_project"
                      >
                        <i className="ti ti-plus me-1" />
                        Add New
                      </Link>
                    </div>
                    <CommonSelect
                      options={Proposal_Project}
                      className="select"
                      defaultValue={Proposal_Project[0]}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Related to <span className="text-danger">*</span>
                    </label>
                    <CommonSelect
                      options={Related_TO}
                      className="select"
                      defaultValue={Related_TO[0]}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <label className="form-label">
                        Deals<span className="text-danger">*</span>
                      </label>
                      <Link
                        to="#"
                        className="label-add link-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#add_deal"
                      >
                        <i className="ti ti-plus me-1" />
                        Add New
                      </Link>
                    </div>
                    <CommonSelect
                      options={Deals}
                      className="select"
                      defaultValue={Deals[1]}
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
                      Status <span className="text-danger">*</span>
                    </label>
                    <CommonSelect
                      options={Status_Accepted}
                      className="select"
                      defaultValue={Status_Accepted[1]}
                    />
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label">
                      Assigned to <span className="text-danger">*</span>
                    </label>
                    <MultipleSelect
                      value={selectedItems2}
                      onChange={handleChange2}
                      options={options2}
                      placeholder="Select"
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
                    <label className="form-label">Tags </label>
                    <CommonTagInputs
                      initialTags={tags}
                      onTagsChange={handleTagsChange}
                    />
                    <span className="fs-13 mb-0">
                      Enter value separated by comma
                    </span>
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
      {/* edit proposal */}
      {/* Add New View */}
      <div className="modal custom-modal fade" id="add_deal" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title mb-0">Add New Deal</h5>
              <button
                className="btn-close me-0"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <form action="#">
              <div className="modal-body">
                <div className="mb-0">
                  <label className="form-label">Deal Name</label>
                  <input type="text" className="form-control" />
                </div>
              </div>
              <div className="modal-btn text-end border-top p-3">
                <Link
                  to="#"
                  className="btn btn-light me-2"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </Link>
                <button type="submit" className="btn btn-danger">
                  Create New
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add New View */}
      {/* Add New View */}
      <div className="modal custom-modal fade" id="add_project" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title mb-0">Add New Project</h5>
              <button
                className="btn-close me-0"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <form action="#">
              <div className="modal-body">
                <div className="mb-0">
                  <label className="form-label">Project Name</label>
                  <input type="text" className="form-control" />
                </div>
              </div>
              <div className="modal-btn text-end border-top p-3">
                <Link
                  to="#"
                  className="btn btn-light me-2"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </Link>
                <button type="submit" className="btn btn-danger">
                  Create New
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add New View */}
      {/* success modal */}
      <div className="modal fade" id="create_success">
        <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
          <div className="modal-content rounded-0">
            <div className="modal-body p-4 text-center position-relative">
              <div className="mb-3 position-relative z-1">
                <span className="avatar avatar-xl badge-soft-success border-0 text-success rounded-circle">
                  <i className="ti ti-user-plus fs-24" />
                </span>
              </div>
              <h5 className="mb-1">Contact Created Successfully!!!</h5>
              <p className="mb-3">View the details of contact, created</p>
              <div className="d-flex justify-content-center">
                <Link
                  to="#"
                  className="btn btn-light position-relative z-1 me-2 w-100"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </Link>
                <Link
                  to={all_routes.contactDetails}
                  className="btn btn-primary position-relative z-1 w-100"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* success modal */}
      {/* delete modal */}
      <div className="modal fade" id="delete_proposals">
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
                Are you sure you want to remove Proposals you selected.
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

export default ModalProposal;
