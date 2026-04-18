import { Link } from "react-router"
import { Category, Priority, StatusActive } from "../../../../../core/json/selectOption"
import CommonSelect from "../../../../../components/common-select/commonSelect"
import ImageWithBasePath from "../../../../../components/imageWithBasePath";
import { useState } from "react";
import MultipleSelect from "../../../../../components/multiple-Select/multipleSelect";
import CommonDatePicker from "../../../../../components/common-datePicker/commonDatePicker";
import CommonTagInputs from "../../../../../components/common-tagInput/commonTagInputs";

const ModalTask = () => {
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
     const [tags, setTags] = useState<string[]>(["Collab", "VIP"]);
  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
  };

  return (
  <>
  {/* Add task */}
  <div
    className="offcanvas offcanvas-end offcanvas-large"
    tabIndex={-1}
    id="offcanvas_add"
  >
    <div className="offcanvas-header border-bottom">
      <h5 className="mb-0">Add New Task</h5>
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
                  Title<span className="text-danger">*</span>
                </label>
                <input type="text" className="form-control" />
              </div>
              <div className="mb-3">
                <label className="form-label">Category</label>
                 <CommonSelect
                            options={Category}
                            className="select"
                            defaultValue={Category[0]}
                          />
              </div>
            </div>
            <div className="col-md-12">
              <div className="mb-3">
                <label className="form-label">
                  Responsible Persons <span className="text-danger">*</span>
                </label>
               <MultipleSelect
                    value={selectedItems}
                    onChange={handleChange}
                    options={options}
                    placeholder="Select"
                  />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Start Date<span className="text-danger"> *</span>
                </label>
                <div className="input-group w-auto input-group-flat">
                  <CommonDatePicker placeholder="dd/mm/yyyy" />

                </div>
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
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Priority</label>
                 <CommonSelect
                            options={Priority}
                            className="select"
                            defaultValue={Priority[0]}
                          />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Status</label>
               <CommonSelect
                            options={StatusActive}
                            className="select"
                            defaultValue={StatusActive[0]}
                          />
              </div>
            </div>
            <div className="col-md-12">
              <div className="mb-3">
                <label className="form-label">
                  Description <span className="text-danger">*</span>
                </label>
                <textarea className="form-control" rows={3} defaultValue={""} />
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
  {/* /Add task */}
  {/* edit task */}
  <div
    className="offcanvas offcanvas-end offcanvas-large"
    tabIndex={-1}
    id="offcanvas_edit"
  >
    <div className="offcanvas-header border-bottom">
      <h5 className="mb-0">Edit Task</h5>
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
                  Title<span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  defaultValue="Truelysell"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Category</label>
               <CommonSelect
                            options={Category}
                            className="select"
                            defaultValue={Category[1]}
                          />
              </div>
            </div>
            <div className="col-md-12">
              <div className="mb-3">
                <label className="form-label">
                  Responsible Persons <span className="text-danger">*</span>
                </label>
               <MultipleSelect
                    value={selectedItems}
                    onChange={handleChange}
                    options={options}
                    placeholder="Select"
                  />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Start Date<span className="text-danger"> *</span>
                </label>
                <div className="input-group w-auto input-group-flat">
                  <CommonDatePicker placeholder="dd/mm/yyyy" />

                </div>
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
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Priority</label>
                <CommonSelect
                            options={Priority}
                            className="select"
                            defaultValue={Priority[1]}
                          />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Status</label>
                <CommonSelect
                            options={StatusActive}
                            className="select"
                            defaultValue={StatusActive[1]}
                          />
              </div>
            </div>
            <div className="col-md-12">
              <div className="mb-3">
                <label className="form-label">
                  Description <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  defaultValue={
                    "Coordinate a product demo session with the client to walk them through key CRM features"
                  }
                />
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
  {/* edit task */}
  {/* delete modal */}
  <div className="modal fade" id="delete_task">
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
            Are you sure you want to remove tasks you selected.
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

export default ModalTask