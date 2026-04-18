import { Link } from "react-router";
import PageHeader from "../../../../components/page-header/pageHeader";
import SettingsTopbar from "../settings-topbar/settingsTopbar";
import { all_routes } from "../../../../routes/all_routes";
import CommonSelect from "../../../../components/common-select/commonSelect";
import { Bank_Name } from "../../../../core/json/selectOption";

const BankAccounts = () => {
  return (
    <>
      {/* ========================
			Start Page Content
		========================= */}
      <div className="page-wrapper">
        {/* Start Content */}
        <div className="content">
          {/* Page Header */}
          <PageHeader
            title="Settings"
            badgeCount={false}
            showModuleTile={false}
            showExport={false}
          />
          {/* End Page Header */}
          {/* Settings Menu */}
          <SettingsTopbar />
          {/* end card */}
          {/* /Settings Menu */}
          {/* start row */}
          <div className="row row-gap-3">
            <div className="col-xl-3 col-lg-12 theiaStickySidebar">
              {/* Settings Sidebar */}
              <div className="card mb-0  filemanager-left-sidebar">
                <div className="card-body">
                  <div className="settings-sidebar">
                    <h4 className="fw-bold mb-3 fs-17">Financial Settings</h4>
                    <div className="list-group list-group-flush settings-sidebar">
                      <Link
                        to={all_routes.paymentGateways}
                        className="d-block p-2 fw-medium "
                      >
                        Payment Gateways
                      </Link>
                      <Link
                        to={all_routes.bankAccount}
                        className="d-block p-2 fw-medium active"
                      >
                        Bank Accounts
                      </Link>
                      <Link
                        to={all_routes.taxRates}
                        className="d-block p-2 fw-medium"
                      >
                        Tax Rates
                      </Link>
                      <Link
                        to={all_routes.currencies}
                        className="d-block p-2 fw-medium"
                      >
                        Currencies
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Settings Sidebar */}
            </div>
            <div className="col-xl-9 col-lg-12">
              {/* Settings Info */}
              <div className="card mb-0">
                <div className="card-body">
                  <div className="border-bottom mb-3 pb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <h4 className="fs-17 mb-0">Bank Accounts</h4>
                    <Link
                      to="javascript:void(0)"
                      className="btn btn-primary btn-sm"
                      data-bs-toggle="modal"
                      data-bs-target="#add_bank"
                    >
                      <i className="ti ti-square-rounded-plus-filled me-1" />
                      Add New Account
                    </Link>
                  </div>
                  <div className="row row-gap-3">
                    {/* Bank Account */}
                    <div className="col-xxl-4 col-sm-6">
                      <div className="position-relative">
                        <input
                          type="radio"
                          name="bank"
                          id="bank1"
                          className="bank-radio"
                          defaultChecked
                        />
                        <div className="bank-box">
                          <div className="check-icon" />
                          <div className="mb-4">
                            <h5 className="fw-bold mb-1 fs-16">HDFC</h5>
                            <p className="mb-0 fs-14">**** **** 4872</p>
                          </div>
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <h6 className="fw-semibold mb-1 fs-14">
                                Holder Name
                              </h6>
                              <p className="fs-13">Darlee Robertson</p>
                            </div>
                            <div className="dropdown table-action position-relative z-1">
                              <Link
                                to="#"
                                className="action-icon btn btn-xs shadow btn-icon btn-outline-light "
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <i className="ti ti-dots-vertical" />
                              </Link>
                              <div className="dropdown-menu dropdown-menu-right">
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#edit_bank"
                                >
                                  <i className="ti ti-edit text-blue me-1" />
                                  Edit
                                </Link>
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_bank"
                                >
                                  <i className="ti ti-trash text-blue me-1" />
                                  Delete
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* /Bank Account */}
                    {/* Bank Account */}
                    <div className="col-xxl-4 col-sm-6">
                      <div className="position-relative">
                        <input
                          type="radio"
                          name="bank"
                          id="bank2"
                          className="bank-radio"
                        />
                        <div className="bank-box">
                          <div className="check-icon" />
                          <div className="mb-4">
                            <h5 className="fw-bold mb-1 fs-16">SBI</h5>
                            <p className="mb-0 fs-14">**** **** 2495</p>
                          </div>
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <h6 className="fw-semibold mb-1 fs-14">
                                Holder Name
                              </h6>
                              <p className="fs-13">Sharon Roy</p>
                            </div>
                            <div className="dropdown table-action position-relative z-1">
                              <Link
                                to="#"
                                className="action-icon btn btn-xs shadow btn-icon btn-outline-light "
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <i className="ti ti-dots-vertical" />
                              </Link>
                              <div className="dropdown-menu dropdown-menu-right">
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#edit_bank"
                                >
                                  <i className="ti ti-edit text-blue me-1" />
                                  Edit
                                </Link>
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_bank"
                                >
                                  <i className="ti ti-trash text-blue me-1" />
                                  Delete
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* /Bank Account */}
                    {/* Bank Account */}
                    <div className="col-xxl-4 col-sm-6">
                      <div className="position-relative">
                        <input
                          type="radio"
                          name="bank"
                          id="bank3"
                          className="bank-radio"
                        />
                        <div className="bank-box">
                          <div className="check-icon" />
                          <div className="mb-4">
                            <h5 className="fw-bold mb-1 fs-16">KVB</h5>
                            <p className="mb-0 fs-14">**** **** 3948</p>
                          </div>
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <h6 className="fw-semibold mb-1 fs-14">
                                Holder Name
                              </h6>
                              <p className="fs-13">Vaughan Lewis</p>
                            </div>
                            <div className="dropdown table-action position-relative z-1">
                              <Link
                                to="#"
                                className="action-icon btn btn-xs shadow btn-icon btn-outline-light "
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <i className="ti ti-dots-vertical" />
                              </Link>
                              <div className="dropdown-menu dropdown-menu-right">
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#edit_bank"
                                >
                                  <i className="ti ti-edit text-blue me-1" />
                                  Edit
                                </Link>
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_bank"
                                >
                                  <i className="ti ti-trash text-blue me-1" />
                                  Delete
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* /Bank Account */}
                  </div>
                </div>
              </div>
              {/* /Settings Info */}
            </div>
          </div>
          {/* end row */}
        </div>
        {/* End Content */}
        {/* Start Footer */}
        <footer className="footer d-block d-md-flex justify-content-between text-md-start text-center">
          <p className="mb-md-0 mb-1">
            Copyright ©{" "}
            <Link
              to="#"
              className="link-primary text-decoration-underline"
            >
              CRMS
            </Link>
          </p>
          <div className="d-flex align-items-center gap-2 footer-links justify-content-center justify-content-md-end">
            <Link to="#">About</Link>
            <Link to="#">Terms</Link>
            <Link to="#">Contact Us</Link>
          </div>
        </footer>
        {/* End Footer */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
      {/* Add Bank Account */}
      <div className="modal fade" id="add_bank" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Bank Account</h5>
              <button
                type="button"
                className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form>
              <div className="modal-body">
                <div className="mb-3 ">
                  <label className="form-label">
                    Bank Name<span className="text-danger">*</span>
                  </label>
                   <CommonSelect
                            options={Bank_Name}
                            className="select"
                            defaultValue={Bank_Name[0]}
                          />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Account Holder Name<span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Account Number<span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Branch Name<span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-0">
                  <label className="form-label">
                    ABA Number<span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
              </div>
              <div className="modal-footer">
                <div className="d-flex align-items-center justify-content-end m-0">
                  <Link
                    to="#"
                    className="btn btn-sm btn-light me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </Link>
                  <button type="submit" className="btn btn-sm btn-primary">
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add Bank Account */}
      {/* Edit Bank Account */}
      <div className="modal fade" id="edit_bank" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Bank Account</h5>
              <button
                type="button"
                className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form>
              <div className="modal-body">
                <div className="mb-3 ">
                  <label className="form-label">
                    Bank Name<span className="text-danger">*</span>
                  </label>
                 <CommonSelect
                            options={Bank_Name}
                            className="select"
                            defaultValue={Bank_Name[0]}
                          />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Account Holder Name<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue="Darlee Robertson"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Account Number<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue="**** **** 4872"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Branch Name<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue="HDFC"
                  />
                </div>
                <div className="mb-0">
                  <label className="form-label">
                    ABA Number<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue={1234567}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <div className="d-flex align-items-center justify-content-end m-0">
                  <Link
                    to="#"
                    className="btn btn-sm btn-light me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </Link>
                  <button type="submit" className="btn btn-sm btn-primary">
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Edit Bank Account */}
      {/* delete modal */}
      <div className="modal fade" id="delete_bank">
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
                Are you sure you want to remove account you selected.
              </p>
              <div className="d-flex justify-content-center">
                <Link
                  to="#"
                  className="btn btn-sm btn-light position-relative z-1 me-2 w-100"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </Link>
                <Link
                  to="#"
                  className="btn btn-sm btn-primary position-relative z-1 w-100"
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

export default BankAccounts;
