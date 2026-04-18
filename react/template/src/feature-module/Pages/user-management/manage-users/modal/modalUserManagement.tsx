import { useState } from "react";
import { Link } from "react-router"
import CommonPhoneInput from "../../../../../components/common-phoneInput/commonPhoneInput";
import { Location } from "../../../../../core/json/selectOption";
import CommonSelect from "../../../../../components/common-select/commonSelect";
type PasswordField = "password" | "confirmPassword";

const ModalUserManagement = () => {
    const [passwordVisibility, setPasswordVisibility] = useState({
        password: false,
        confirmPassword: false,
      });
    
      const togglePasswordVisibility = (field: PasswordField) => {
        setPasswordVisibility((prevState) => ({
          ...prevState,
          [field]: !prevState[field],
        }));
      };
    const [phone, setPhone] = useState<string | undefined>();
    const [phone2, setPhone2] = useState<string | undefined>();
  return (
  <>
  {/* Add User */}
  <div
    className="offcanvas offcanvas-end offcanvas-large"
    tabIndex={-1}
    id="offcanvas_add"
  >
    <div className="offcanvas-header border-bottom">
      <h5 className="fw-semibold">Add New User</h5>
      <button
        type="button"
        className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      >
        <i className="ti ti-x" />
      </button>
    </div>
    <div className="offcanvas-body">
      <form>
        <div>
          {/* Basic Info */}
          <div>
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex align-items-center mb-3">
                  <div className="avatar avatar-xxl border border-dashed me-3 flex-shrink-0">
                    <div className="position-relative d-flex align-items-center">
                      <i className="ti ti-photo text-dark fs-16" />
                    </div>
                  </div>
                  <div className="d-inline-flex flex-column align-items-start">
                    <div className="drag-upload-btn btn btn-sm btn-primary position-relative mb-2">
                      <i className="ti ti-file-broken me-1" />
                      Upload file
                      <input
                        type="file"
                        className="form-control image-sign"
                        multiple
                      />
                    </div>
                    <span>JPG, GIF or PNG. Max size of 800K</span>
                  </div>
                </div>
              </div>
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
                    User Name <span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <label className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <div className="form-check form-switch form-check-reverse">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="switchCheckReverse"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="switchCheckReverse"
                      >
                        Email Opt Out
                      </label>
                    </div>
                  </div>
                  <input type="text" className="form-control" />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Role <span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Phone 1 <span className="text-danger">*</span>
                  </label>
                 <CommonPhoneInput
                            value={phone}
                            onChange={setPhone}
                            placeholder="(201) 555-0123"
                          />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Phone 2</label>
                   <CommonPhoneInput
                            value={phone2}
                            onChange={setPhone2}
                            placeholder="(201) 555-0123"
                          />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <div className="input-group input-group-flat pass-group">
                    <input
                        type={passwordVisibility.password ? "text" : "password"}
                        className="form-control pass-input"
                        placeholder="****************"
                      />
                      <span
                        className={`ti toggle-password input-group-text toggle-password ${
                          passwordVisibility.password ? "ti-eye" : "ti-eye-off"
                        }`}
                        onClick={() => togglePasswordVisibility("password")}
                      ></span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Repeat Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group input-group-flat pass-group">
                    <input
                        type={passwordVisibility.confirmPassword ? "text" : "password"}
                        className="form-control pass-input"
                        placeholder="****************"
                      />
                      <span
                        className={`ti toggle-password input-group-text toggle-password ${
                          passwordVisibility.confirmPassword ? "ti-eye" : "ti-eye-off"
                        }`}
                        onClick={() => togglePasswordVisibility("confirmPassword")}
                      ></span>
                  </div>
                </div>
              </div>
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">
                    Location <span className="text-danger">*</span>
                  </label>
                  <CommonSelect
                            options={Location}
                            className="select"
                            defaultValue={Location[0]}
                          />
                </div>
              </div>
            </div>
          </div>
          {/* /Basic Info */}
        </div>
        <div className="d-flex align-items-center justify-content-end">
          <Link
            to="#"
            className="btn btn-light me-2"
            data-bs-dismiss="offcanvas"
          >
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary">
            Create
          </button>
        </div>
      </form>
    </div>
  </div>
  {/* /Add User */}
  {/* Edit User */}
  <div
    className="offcanvas offcanvas-end offcanvas-large"
    tabIndex={-1}
    id="offcanvas_edit"
  >
    <div className="offcanvas-header border-bottom">
      <h5 className="fw-semibold">Edit User</h5>
      <button
        type="button"
        className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      >
        <i className="ti ti-x" />
      </button>
    </div>
    <div className="offcanvas-body">
      <form>
        <div>
          {/* Basic Info */}
          <div>
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex align-items-center mb-3">
                  <div className="avatar avatar-xxl border border-dashed me-3 flex-shrink-0">
                    <div className="position-relative d-flex align-items-center">
                      <i className="ti ti-photo text-dark fs-16" />
                    </div>
                  </div>
                  <div className="d-inline-flex flex-column align-items-start">
                    <div className="drag-upload-btn btn btn-sm btn-primary position-relative mb-2">
                      <i className="ti ti-file-broken me-1" />
                      Upload file
                      <input
                        type="file"
                        className="form-control image-sign"
                        multiple
                      />
                    </div>
                    <span>JPG, GIF or PNG. Max size of 800K</span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    First Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue="Elizabeth Morgan"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    User Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue="Elizabeth@12"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <label className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <div className="form-check form-switch form-check-reverse">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="switchCheckReverse2"
                        defaultChecked
                      />
                      <label
                        className="form-check-label"
                        htmlFor="switchCheckReverse2"
                      >
                        Email Opt Out
                      </label>
                    </div>
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue="elizabeth@gmail.com"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Role <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue="Software"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Phone 1 <span className="text-danger">*</span>
                  </label>
                <CommonPhoneInput
                            value={phone}
                            onChange={setPhone}
                            placeholder="(201) 555-0123"
                          />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Phone 2</label>
                  <CommonPhoneInput
                            value={phone}
                            onChange={setPhone}
                            placeholder="(201) 555-0123"
                          />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <div className="input-group input-group-flat pass-group">
                    <input
                        type={passwordVisibility.password ? "text" : "password"}
                        className="form-control pass-input"
                        placeholder="****************"
                      />
                      <span
                        className={`ti toggle-password input-group-text toggle-password ${
                          passwordVisibility.password ? "ti-eye" : "ti-eye-off"
                        }`}
                        onClick={() => togglePasswordVisibility("password")}
                      ></span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Repeat Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group input-group-flat pass-group">
                    <input
                        type={passwordVisibility.password ? "text" : "password"}
                        className="form-control pass-input"
                        placeholder="****************"
                      />
                      <span
                        className={`ti toggle-password input-group-text toggle-password ${
                          passwordVisibility.password ? "ti-eye" : "ti-eye-off"
                        }`}
                        onClick={() => togglePasswordVisibility("password")}
                      ></span>
                  </div>
                </div>
              </div>
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">
                    Location <span className="text-danger">*</span>
                  </label>
                  <CommonSelect
                            options={Location}
                            className="select"
                            defaultValue={Location[1]}
                          />
                </div>
              </div>
            </div>
          </div>
          {/* /Basic Info */}
        </div>
        <div className="d-flex align-items-center justify-content-end">
          <Link
            to="#"
            className="btn btn-light me-2"
            data-bs-dismiss="offcanvas"
          >
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
  {/* /Edit User */}
  {/* delete modal */}
  <div className="modal fade" id="delete_contact">
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
            Are you sure you want to remove user you selected.
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

export default ModalUserManagement