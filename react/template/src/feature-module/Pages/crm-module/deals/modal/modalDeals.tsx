import { Link } from "react-router"
import ImageWithBasePath from "../../../../../components/imageWithBasePath"
import CommonSelect from "../../../../../components/common-select/commonSelect"
import { Currency, Period, Pipeine, Priority, Source, Status_Open } from "../../../../../core/json/selectOption"
import MultipleSelect from "../../../../../components/multiple-Select/multipleSelect"
import { useState } from "react"
import CommonTagInputs from "../../../../../components/common-tagInput/commonTagInputs"
import CommonDatePicker from "../../../../../components/common-datePicker/commonDatePicker"
import TextEditor from "../../../../../components/texteditor/texteditor"
import { all_routes } from "../../../../../routes/all_routes"


const ModalDeals = () => {

 const [tags, setTags] = useState<string[]>(["Devops Design", "MargrateDesign","UI for Chat"]);
  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
  };

   const [tags2, setTags2] = useState<string[]>(["Collab", "Rated"]);

  const handleTagsChange2 = (newTags: string[]) => {
    setTags2(newTags);
  };
     const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleChange = (value: string[]) => {
    setSelectedItems(value);
  };
  const options = [
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
              src="assets/img/profiles/avatar-02.jpg"
              alt="Robert"
              width={24}
              height={24}
            />
          </div>
          Robert Johnson
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
  {/* Add Canvas */}
  <div
    className="offcanvas offcanvas-end offcanvas-large"
    tabIndex={-1}
    id="offcanvas_add"
  >
    <div className="offcanvas-header border-bottom">
      <h5 className="mb-0">Add New Deal</h5>
      <button
        type="button"
        className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      ></button>
    </div>
    <div className="offcanvas-body">
      <form >
        <div className="row mb-3">
          <div className="col-md-12">
            <div className="mb-3">
              <label className="form-label">
                Deal Name <span className="text-danger">*</span>
              </label>
              <input type="text" className="form-control" />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <div className="d-flex align-items-center justify-content-between">
                <label className="form-label">
                  Pipeine <span className="text-danger">*</span>
                </label>
                <Link
                  to=""
                  className="label-add link-primary"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#offcanvas_pipeline"
                >
                  <i className="ti ti-plus me-1" />
                  Add New
                </Link>
              </div>
              <CommonSelect
                            options={Pipeine}
                            className="select"
                            defaultValue={Pipeine[0]}
                          />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">
                Status <span className="text-danger">*</span>
              </label>
              <CommonSelect
                            options={Status_Open}
                            className="select"
                            defaultValue={Status_Open[0]}
                          />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">
                Deal Value<span className="text-danger"> *</span>
              </label>
              <input className="form-control" type="text" />
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
              <input className="form-control" type="text" />
            </div>
          </div>
          <div className="col-md-12">
            <div className="mb-3">
              <label className="form-label">
                Contact <span className="text-danger">*</span>
              </label>
              <MultipleSelect
                    value={selectedItems}
                    onChange={handleChange}
                    options={options}
                    placeholder="Select"
                  />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Project <span className="text-danger">*</span>
              </label>
              <CommonTagInputs
                            initialTags={tags}
                            onTagsChange={handleTagsChange}
                          />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">
                Due Date <span className="text-danger">*</span>
              </label>
              <div className="input-group w-auto input-group-flat">
                <CommonDatePicker placeholder="dd/mm/yyyy" />

              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">
                Expected Closing Date <span className="text-danger">*</span>
              </label>
              <div className="input-group w-auto input-group-flat">
                <CommonDatePicker placeholder="dd/mm/yyyy" />
              </div>
            </div>
          </div>
          <div className="col-md-12">
            <div className="mb-3">
              <label className="form-label">
                Assignee <span className="text-danger">*</span>
              </label>
              <MultipleSelect
                    value={selectedItems2}
                    onChange={handleChange2}
                    options={options2}
                    placeholder="Select"
                  />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">
                Follow Up Date <span className="text-danger">*</span>
              </label>
              <div className="input-group w-auto input-group-flat">
                <CommonDatePicker placeholder="dd/mm/yyyy" />
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">
                Source <span className="text-danger">*</span>
              </label>
              <CommonSelect
                            options={Source}
                            className="select"
                            defaultValue={Source[0]}
                          />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">
                Tags <span className="text-danger">*</span>
              </label>
              <CommonTagInputs
                            initialTags={tags2}
                            onTagsChange={handleTagsChange2}
                          />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">
                Priority <span className="text-danger">*</span>
              </label>
              <CommonSelect
                            options={Priority}
                            className="select"
                            defaultValue={Priority[0]}
                          />
            </div>
          </div>
          <div className="col-lg-12">
            <div className="mb-3">
              <label className="form-label">
                Description <span className="text-danger">*</span>
              </label>
              <div className="editor pages-editor">
                <TextEditor/>
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
          <button
            type="button"
            className="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#create_success"
          >
            Create New
          </button>
        </div>
      </form>
    </div>
  </div>
  {/* /Add Canvas */}
  {/* edit Canvas */}
  <div
    className="offcanvas offcanvas-end offcanvas-large"
    tabIndex={-1}
    id="offcanvas_edit"
  >
    <div className="offcanvas-header border-bottom">
      <h5 className="mb-0">Edit Deal</h5>
      <button
        type="button"
        className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      ></button>
    </div>
    <div className="offcanvas-body">
      <form >
        <div className="row mb-3">
          <div className="col-md-12">
            <div className="mb-3">
              <label className="form-label">
                Deal Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                defaultValue="Annual Software Subscription"
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <div className="d-flex align-items-center justify-content-between">
                <label className="form-label">
                  Pipeine <span className="text-danger">*</span>
                </label>
                <Link
                  to=""
                  className="label-add link-primary"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#offcanvas_pipeline"
                >
                  <i className="ti ti-plus me-1" />
                  Add New
                </Link>
              </div>
              <CommonSelect
                            options={Pipeine}
                            className="select"
                            defaultValue={Pipeine[1]}
                          />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">
                Status <span className="text-danger">*</span>
              </label>
             <CommonSelect
                            options={Status_Open}
                            className="select"
                            defaultValue={Status_Open[1]}
                          />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">
                Deal Value<span className="text-danger"> *</span>
              </label>
              <input
                className="form-control"
                type="text"
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
                className="form-control"
                type="text"
                defaultValue="Collins"
              />
            </div>
          </div>
          <div className="col-md-12">
            <div className="mb-3">
              <label className="form-label">
                Contact <span className="text-danger">*</span>
              </label>
            <MultipleSelect
                    value={selectedItems}
                    onChange={handleChange}
                    options={options}
                    placeholder="Select"
                  />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Project <span className="text-danger">*</span>
              </label>
              <CommonTagInputs
                            initialTags={tags}
                            onTagsChange={handleTagsChange}
                          />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">
                Due Date <span className="text-danger">*</span>
              </label>
              <div className="input-group w-auto input-group-flat">
               <CommonDatePicker placeholder="dd/mm/yyyy" />

              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">
                Expected Closing Date <span className="text-danger">*</span>
              </label>
              <div className="input-group w-auto input-group-flat">
                <CommonDatePicker placeholder="dd/mm/yyyy" />

              </div>
            </div>
          </div>
          <div className="col-md-12">
            <div className="mb-3">
              <label className="form-label">
                Assignee <span className="text-danger">*</span>
              </label>
               <MultipleSelect
                    value={selectedItems2}
                    onChange={handleChange2}
                    options={options2}
                    placeholder="Select"
                  />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">
                Follow Up Date <span className="text-danger">*</span>
              </label>
              <div className="input-group w-auto input-group-flat">
               <CommonDatePicker placeholder="dd/mm/yyyy" />

              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">
                Source <span className="text-danger">*</span>
              </label>
              <CommonSelect
                            options={Source}
                            className="select"
                            defaultValue={Source[1]}
                          />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">
                Tags <span className="text-danger">*</span>
              </label>
             <CommonTagInputs
                            initialTags={tags2}
                            onTagsChange={handleTagsChange2}
                          />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">
                Priority <span className="text-danger">*</span>
              </label>
              <CommonSelect
                            options={Priority}
                            className="select"
                            defaultValue={Priority[1]}
                          />
            </div>
          </div>
          <div className="col-lg-12">
            <div className="mb-3">
              <label className="form-label">
                Description <span className="text-danger">*</span>
              </label>
              <div className="editor pages-editor">
               <TextEditor/>
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
          <button
            type="button"
            className="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#create_success"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
  {/* /edit Canvas */}
  {/* success modal */}
  <div className="modal fade" id="create_success">
    <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
      <div className="modal-content rounded-0">
        <div className="modal-body p-4 text-center position-relative">
          <div className="mb-3 position-relative z-1">
            <span className="avatar avatar-xl badge-soft-success border-0 text-success rounded-circle">
              <i className="ti ti-medal fs-24" />
            </span>
          </div>
          <h5 className="mb-1">Deal Created Successfully!!!</h5>
          <p className="mb-3">View the details of deal, created</p>
          <div className="d-flex justify-content-center">
            <Link
              to="#"
              className="btn btn-light position-relative z-1 me-2 w-100"
              data-bs-dismiss="modal"
            >
              Cancel
            </Link>
            <Link
              to={all_routes.dealsDetails}
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
  <div className="modal fade" id="delete_deal">
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
            Are you sure you want to remove deal you selected.
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
  {/* Add New Pipeline */}
  <div
    className="offcanvas offcanvas-end offcanvas-large"
    tabIndex={-1}
    id="offcanvas_pipeline"
  >
    <div className="offcanvas-header border-bottom">
      <h5 className="mb-0">Add New Pipeline</h5>
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
          <div className="mb-3">
            <label className="form-label">
              Pipeline Name <span className="text-danger">*</span>
            </label>
            <input className="form-control" type="text" />
          </div>
          <div className="mb-3">
            <div className="pipe-title d-flex align-items-center justify-content-between mb-2">
              <label className="form-label m-0">Pipeline Stages</label>
              <Link
                to="#"
                className="add-stage link-primary"
                data-bs-toggle="modal"
                data-bs-target="#add_stage"
              >
                <i className="ti ti-plus me-1" />
                Add New
              </Link>
            </div>
            <div className="pipeline-listing">
              <div className="pipeline-item d-flex align-items-center justify-content-between p-2 shadow-sm bg-white mb-1 border-start border-3 border-warning">
                <p className="mb-0 fw-semibold me-3 text-dark">
                  <i className="ti ti-grip-vertical text-body" /> Inpipeline
                </p>
                <div className="action-pipeline">
                  <Link
                    to="#"
                    data-bs-toggle="modal"
                    data-bs-target="#edit_stage"
                    className="btn btn-sm btn-outline-light border-0"
                  >
                    <i className="ti ti-edit me-1" />
                    Edit
                  </Link>
                  <Link
                    to="#"
                    data-bs-toggle="modal"
                    data-bs-target="#delete_stage"
                    className="btn btn-sm btn-outline-light border-0"
                  >
                    <i className="ti ti-trash me-1" />
                    Delete
                  </Link>
                </div>
              </div>
              <div className="pipeline-item d-flex align-items-center justify-content-between p-2 shadow-sm bg-white mb-1 border-start border-3 border-warning">
                <p className="mb-0 me-3 fw-semibold text-dark">
                  <i className="ti ti-grip-vertical text-body" /> Follow Up
                </p>
                <div className="action-pipeline">
                  <Link
                    to="#"
                    data-bs-toggle="modal"
                    data-bs-target="#edit_stage"
                    className="btn btn-sm btn-outline-light border-0"
                  >
                    <i className="ti ti-edit me-1" />
                    Edit
                  </Link>
                  <Link
                    to="#"
                    data-bs-toggle="modal"
                    data-bs-target="#delete_stage"
                    className="btn btn-sm btn-outline-light border-0"
                  >
                    <i className="ti ti-trash me-1" />
                    Delete
                  </Link>
                </div>
              </div>
              <div className="pipeline-item d-flex align-items-center justify-content-between p-2 shadow-sm bg-white mb-1 border-start border-3 border-warning">
                <p className="mb-0 me-3 fw-semibold text-dark">
                  <i className="ti ti-grip-vertical text-body" /> Schedule
                  Service
                </p>
                <div className="action-pipeline">
                  <Link
                    to="#"
                    data-bs-toggle="modal"
                    data-bs-target="#edit_stage"
                    className="btn btn-sm btn-outline-light border-0"
                  >
                    <i className="ti ti-edit me-1" />
                    Edit
                  </Link>
                  <Link
                    to="#"
                    data-bs-toggle="modal"
                    data-bs-target="#delete_stage"
                    className="btn btn-sm btn-outline-light border-0"
                  >
                    <i className="ti ti-trash me-1" />
                    Delete
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Access</label>
            <div className="d-flex flex-wrap access-item nav mb-3">
              <div
                className="radio-btn me-2"
                data-bs-toggle="tab"
                data-bs-target="#all"
              >
                <input
                  type="radio"
                  className="status-radio"
                  id="all"
                  name="status"
                  defaultChecked
                />
                <label htmlFor="all">All</label>
              </div>
              <div
                className="radio-btn"
                data-bs-toggle="tab"
                data-bs-target="#select-person"
              >
                <input
                  type="radio"
                  className="status-radio"
                  id="select"
                  name="status"
                />
                <label htmlFor="select">Select Person</label>
              </div>
            </div>
            <div className="tab-content">
              <div className="tab-pane fade" id="select-person">
                <div className="access-wrapper">
                  <div className="d-flex align-items-center mb-1 justify-content-between shadow-sm rounded p-2 bg-white border">
                    <div className="d-flex align-items-center gap-2">
                      <div className="avatar avatar-sm">
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-21.jpg"
                          alt="Image"
                          className="rounded-circle"
                        />
                      </div>
                      <span>Vaughan Lewis</span>
                    </div>
                    <Link to="#" className="link-primary">
                      Remove
                    </Link>
                  </div>
                  <div className="d-flex align-items-center mb-1 justify-content-between shadow-sm rounded p-2 bg-white border">
                    <div className="d-flex align-items-center gap-2">
                      <div className="avatar avatar-sm">
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-08.jpg"
                          alt="Image"
                          className="rounded-circle"
                        />
                      </div>
                      <span>Katherine Brooks</span>
                    </div>
                    <Link to="#" className="link-primary">
                      Remove
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
            Create New
          </button>
        </div>
      </form>
    </div>
  </div>
  {/* /Add New Pipeline */}
  {/* Add New Stage */}
  <div className="modal custom-modal fade" id="add_stage" role="dialog">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title mb-0">Add New Stage</h5>
          <button
            className="btn-close custom-btn-close border p-1 me-0 text-dark"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <form >
          <div className="modal-body">
            <div className="mb-0">
              <label className="form-label">
                Stage Name<span className="ms-1 text-danger">*</span>
              </label>
              <input type="text" className="form-control" />
            </div>
          </div>
          <div className="modal-btn text-end p-3 border-top">
            <Link to="#" className="btn btn-light me-2" data-bs-dismiss="modal">
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
  {/* /Add New Stage */}
  {/* Edit Stage */}
  <div className="modal custom-modal fade" id="edit_stage" role="dialog">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title mb-0">Edit Stage</h5>
          <button
            className="btn-close custom-btn-close border p-1 me-0 text-dark"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <form >
          <div className="modal-body">
            <div className="mb-0">
              <label className="form-label">
                Edit Stage<span className="ms-1 text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                defaultValue="Inpipeline"
              />
            </div>
          </div>
          <div className="modal-btn text-end p-3 border-top">
            <Link to="#" className="btn btn-light me-2" data-bs-dismiss="modal">
              Cancel
            </Link>
            <button type="submit" className="btn btn-danger">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  {/* /Edit Stage */}
  {/* delete stage */}
  <div className="modal fade" id="delete_stage">
    <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
      <div className="modal-content rounded-0">
        <div className="modal-body p-4 text-center position-relative">
          <div className="mb-3 position-relative z-1">
            <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle">
              <i className="ti ti-trash fs-24" />
            </span>
          </div>
          <h5 className="mb-1">Remove Stage</h5>
          <p className="mb-3">
            Are you sure you want to remove stage you selected.
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
  {/* delete  stage */}
</>

  )
}

export default ModalDeals