import { Link } from "react-router"
import CommonSelect from "../../../../../components/common-select/commonSelect"
import { Plan_Price, Plan_Type } from "../../../../../core/json/selectOption"


const ModalMembershipPlans = () => {
  return (
    <>
  {/* Add Contact */}
  <div
    className="offcanvas offcanvas-end offcanvas-large"
    tabIndex={-1}
    id="offcanvas_add"
  >
    <div className="offcanvas-header border-bottom">
      <h5 className="mb-0">Add New Plan</h5>
      <button
        type="button"
        className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      ></button>
    </div>
    <div className="offcanvas-body">
      <form>
        <div className="accordion accordion-bordered" id="main_accordion">
          {/* Basic Info */}
          <div className="accordion-item rounded mb-3">
            <div className="accordion-header">
              <Link
                to="#"
                className="accordion-button accordion-custom-button rounded"
                data-bs-toggle="collapse"
                data-bs-target="#basic"
              >
                <span className="avatar avatar-md rounded me-1">
                  <i className="ti ti-file-description" />
                </span>
                Plan Info
              </Link>
            </div>
            <div
              className="accordion-collapse collapse show"
              id="basic"
              data-bs-parent="#main_accordion"
            >
              <div className="accordion-body border-top pb-0">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Plan Name <span className="text-danger">*</span>
                      </label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Plan Type <span className="text-danger">*</span>
                      </label>
                       <CommonSelect
                            options={Plan_Type}
                            className="select"
                            defaultValue={Plan_Type[0]}
                          />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Plan Price <span className="text-danger">*</span>
                      </label>
                      <CommonSelect
                            options={Plan_Price}
                            className="select"
                            defaultValue={Plan_Price[0]}
                          />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* /Basic Info */}
          {/* Address Info */}
          <div className="accordion-item border-top rounded mb-3">
            <div className="accordion-header">
              <Link
                to="#"
                className="accordion-button accordion-custom-button rounded"
                data-bs-toggle="collapse"
                data-bs-target="#address"
              >
                <span className="avatar avatar-md rounded me-1">
                  <i className="ti ti-settings" />
                </span>
                Plan Settings
              </Link>
            </div>
            <div
              className="accordion-collapse collapse"
              id="address"
              data-bs-parent="#main_accordion"
            >
              <div className="accordion-body border-top pb-0">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Contacts <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="text"
                          className="form-control"
                          defaultValue="0-100"
                        />
                        <div className="form-check form-switch ms-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                          />
                        </div>
                      </div>
                      <div className="form-check mt-1">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="customCheck1"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="customCheck1"
                        >
                          Unlimited
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Leads <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="text"
                          className="form-control"
                          defaultValue="0-100"
                        />
                        <div className="form-check form-switch ms-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                          />
                        </div>
                      </div>
                      <div className="form-check mt-1">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="customCheck2"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="customCheck2"
                        >
                          Unlimited
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Companies <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="text"
                          className="form-control"
                          defaultValue="0-100"
                        />
                        <div className="form-check form-switch ms-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                          />
                        </div>
                      </div>
                      <div className="form-check mt-1">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="customCheck3"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="customCheck3"
                        >
                          Unlimited
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Compaigns <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="text"
                          className="form-control"
                          defaultValue="0-100"
                        />
                        <div className="form-check form-switch ms-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                          />
                        </div>
                      </div>
                      <div className="form-check mt-1">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="customCheck4"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="customCheck4"
                        >
                          Unlimited
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Projects <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="text"
                          className="form-control"
                          defaultValue="0-100"
                        />
                        <div className="form-check form-switch ms-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                          />
                        </div>
                      </div>
                      <div className="form-check mt-1">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="customCheck5"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="customCheck5"
                        >
                          Unlimited
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Deals <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="text"
                          className="form-control"
                          defaultValue="0-100"
                        />
                        <div className="form-check form-switch ms-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                          />
                        </div>
                      </div>
                      <div className="form-check mt-1">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="customCheck6"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="customCheck6"
                        >
                          Unlimited
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Tasks <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="text"
                          className="form-control"
                          defaultValue="0-100"
                        />
                        <div className="form-check form-switch ms-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                          />
                        </div>
                      </div>
                      <div className="form-check mt-1">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="customCheck7"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="customCheck7"
                        >
                          Unlimited
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Pipelines <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="text"
                          className="form-control"
                          defaultValue="0-100"
                        />
                        <div className="form-check form-switch ms-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                          />
                        </div>
                      </div>
                      <div className="form-check mt-1">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="customCheck8"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="customCheck8"
                        >
                          Unlimited
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* /Address Info */}
        </div>
        <div className="d-flex align-items-center justify-content-end">
          <button
            type="button"
            data-bs-dismiss="offcanvas"
            className="btn btn-light me-2"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Create New
          </button>
        </div>
      </form>
    </div>
  </div>
  {/* /Add Contact */}
</>

  )
}

export default ModalMembershipPlans