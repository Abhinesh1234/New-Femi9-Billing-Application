import { Link } from "react-router";
import PageHeader from "../../../../components/page-header/pageHeader";
import SettingsTopbar from "../settings-topbar/settingsTopbar";
import { all_routes } from "../../../../routes/all_routes";
import ImageWithBasePath from "../../../../components/imageWithBasePath";

const LanguageSettings = () => {
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
          <SettingsTopbar />
          {/* end card */}
          {/* start row */}
          <div className="row">
            <div className="col-xl-3 col-lg-12 theiaStickySidebar">
              <div className="card filemanager-left-sidebar">
                <div className="card-body">
                  <div className="settings-sidebar">
                    <h5 className="mb-3 fs-17">Website Settings</h5>
                    <div className="list-group list-group-flush settings-sidebar">
                      <Link
                        to={all_routes.companySettings}
                        className="d-block p-2 fw-medium "
                      >
                        Company Settings
                      </Link>
                      <Link
                        to={all_routes.localization}
                        className="d-block p-2 fw-medium "
                      >
                        Localization
                      </Link>
                      <Link
                        to={all_routes.prefixes}
                        className="d-block p-2 fw-medium "
                      >
                        Prefixes
                      </Link>
                      <Link
                        to={all_routes.preference}
                        className="d-block p-2 fw-medium "
                      >
                        Preference
                      </Link>
                      <Link
                        to={all_routes.appearance}
                        className="d-block p-2 fw-medium "
                      >
                        Appearance
                      </Link>
                      <Link
                        to={all_routes.languageWeb}
                        className="d-block p-2 fw-medium active"
                      >
                        Language
                      </Link>
                    </div>
                  </div>
                </div>{" "}
                {/* end card body */}
              </div>{" "}
              {/* end card */}
            </div>{" "}
            {/* end col */}
            <div className="col-xl-9 col-lg-12">
              {/* Custom Fields */}
              <div className="card">
                <div className="card-body">
                  <div className="border-bottom mb-3 pb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <h4 className="fs-17 mb-0">Language</h4>
                    <div className="d-flex align-items-center gap-2">
                      <div className="dropdown">
                        <Link
                          to="#"
                          className="dropdown-toggle btn btn-outline-light px-2 shadow"
                          data-bs-toggle="dropdown"
                        >
                          <i className="ti ti-language me-2" />
                          Language
                        </Link>
                        <div className="dropdown-menu  dropdown-menu-end">
                          <ul>
                            <li>
                              <Link
                                to="#"
                                className="dropdown-item d-flex align-items-center gap-2"
                              >
                                <ImageWithBasePath
                                  src="assets/img/flags/us.svg"
                                  alt="Img"
                                  height={16}
                                />
                                English
                              </Link>
                            </li>
                            <li>
                              <Link
                                to="#"
                                className="dropdown-item d-flex align-items-center gap-2"
                              >
                                 <ImageWithBasePath
                                  src="assets/img/flags/de.svg"
                                  alt="Img"
                                  height={16}
                                />
                                German
                              </Link>
                            </li>
                            <li>
                              <Link
                                to="#"
                                className="dropdown-item d-flex align-items-center gap-2"
                              >
                                 <ImageWithBasePath
                                  src="assets/img/flags/ae.svg"
                                  alt="Img"
                                  height={16}
                                />
                                Arabic
                              </Link>
                            </li>
                            <li>
                              <Link
                                to="#"
                                className="dropdown-item d-flex align-items-center gap-2"
                              >
                                 <ImageWithBasePath
                                  src="assets/img/flags/fr.svg"
                                  alt="Img"
                                  height={16}
                                />
                                French
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <Link
                        to="javascript:void(0)"
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#add_lang"
                      >
                        <i className="ti ti-square-rounded-plus-filled me-1" />
                        Add Language
                      </Link>
                    </div>
                  </div>
                  {/* Contact List */}
                  <div className="table-responsive custom-table mb-4">
                    <table className="table table-nowrap">
                      <thead className="table-light">
                        <tr>
                          <th>Language</th>
                          <th>Code</th>
                          <th>RTL</th>
                          <th>Total</th>
                          <th>Done</th>
                          <th>Progress</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <Link
                              to="#"
                              className="d-flex align-items-center gap-2"
                            >
                               <ImageWithBasePath
                                src="assets/img/flags/us.svg"
                                alt="Img"
                                height={16}
                              />
                              English
                            </Link>
                          </td>
                          <td>en</td>
                          <td>
                            <div className="form-check form-switch p-0">
                              <label className="form-check-label d-flex align-items-center gap-2 w-100">
                                <input
                                  className="form-check-input switchCheckDefault ms-auto"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </label>
                            </div>
                          </td>
                          <td>3481</td>
                          <td>2861</td>
                          <td>
                            <div className="pipeline-progress d-flex align-items-center w-100">
                              <div
                                className="progress w-100 bg-light"
                                style={{ height: 5, borderRadius: 10 }}
                              >
                                <div
                                  className="progress-bar bg-warning"
                                  role="progressbar"
                                  style={{ width: "80%", borderRadius: 10 }}
                                  aria-valuenow={80}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                />
                              </div>
                              <span className="ms-2 text-body">80%</span>
                            </div>
                          </td>
                          <td>
                            <Link
                              to="#"
                              className="badge bg-success"
                            >
                              Connected
                            </Link>
                          </td>
                          <td className="d-flex align-items-center gap-2">
                            <Link
                              to={all_routes.languageWeb}
                              className="badge bg-light text-dark me-2"
                            >
                              Web
                            </Link>
                            <Link
                              to="#"
                              className="badge bg-light text-dark me-2"
                            >
                              App
                            </Link>
                            <Link
                              to="#"
                              className="badge bg-light text-dark me-2"
                            >
                              Admin
                            </Link>
                            <div className="dropdown table-action">
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
                                  data-bs-target="#edit_lang"
                                >
                                  <i className="ti ti-edit text-blue me-1" />
                                  Edit
                                </Link>
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_lang"
                                >
                                  <i className="ti ti-trash text-blue me-1" />
                                  Delete
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <Link
                              to="#"
                              className="d-flex align-items-center gap-2"
                            >
                               <ImageWithBasePath
                                src="assets/img/flags/de.svg"
                                alt="Img"
                                height={16}
                              />
                              German
                            </Link>
                          </td>
                          <td>de</td>
                          <td>
                            <div className="form-check form-switch p-0">
                              <label className="form-check-label d-flex align-items-center gap-2 w-100">
                                <input
                                  className="form-check-input switchCheckDefault ms-auto"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </label>
                            </div>
                          </td>
                          <td>4815</td>
                          <td>4815</td>
                          <td>
                            <div className="pipeline-progress d-flex align-items-center w-100">
                              <div
                                className="progress w-100 bg-light"
                                style={{ height: 5, borderRadius: 10 }}
                              >
                                <div
                                  className="progress-bar bg-success"
                                  role="progressbar"
                                  style={{ width: "100%", borderRadius: 10 }}
                                  aria-valuenow={80}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                />
                              </div>
                              <span className="ms-2 text-body">100%</span>
                            </div>
                          </td>
                          <td>
                            <Link
                              to="#"
                              className="badge bg-success"
                            >
                              Connected
                            </Link>
                          </td>
                          <td className="d-flex align-items-center gap-2">
                            <Link
                              to={all_routes.languageWeb}
                              className="badge bg-light text-dark me-2"
                            >
                              Web
                            </Link>
                            <Link
                              to="#"
                              className="badge bg-light text-dark me-2"
                            >
                              App
                            </Link>
                            <Link
                              to="#"
                              className="badge bg-light text-dark me-2"
                            >
                              Admin
                            </Link>
                            <div className="dropdown table-action">
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
                                  data-bs-target="#edit_lang"
                                >
                                  <i className="ti ti-edit text-blue me-1" />
                                  Edit
                                </Link>
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_lang"
                                >
                                  <i className="ti ti-trash text-blue me-1" />
                                  Delete
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <Link
                              to="#"
                              className="d-flex align-items-center gap-2"
                            >
                               <ImageWithBasePath
                                src="assets/img/flags/ae.svg"
                                alt="Img"
                                height={16}
                              />
                              Arabic
                            </Link>
                          </td>
                          <td>ar</td>
                          <td>
                            <div className="form-check form-switch p-0">
                              <label className="form-check-label d-flex align-items-center gap-2 w-100">
                                <input
                                  className="form-check-input switchCheckDefault ms-auto"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </label>
                            </div>
                          </td>
                          <td>2590</td>
                          <td>20</td>
                          <td>
                            <div className="pipeline-progress d-flex align-items-center w-100">
                              <div
                                className="progress w-100 bg-light"
                                style={{ height: 5, borderRadius: 10 }}
                              >
                                <div
                                  className="progress-bar bg-primary"
                                  role="progressbar"
                                  style={{ width: "50%", borderRadius: 10 }}
                                  aria-valuenow={40}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                />
                              </div>
                              <span className="ms-2 text-body">50%</span>
                            </div>
                          </td>
                          <td>
                            <Link
                              to="#"
                              className="badge bg-success"
                            >
                              Connected
                            </Link>
                          </td>
                          <td className="d-flex align-items-center gap-2">
                            <Link
                              to={all_routes.languageWeb}
                              className="badge bg-light text-dark me-2"
                            >
                              Web
                            </Link>
                            <Link
                              to="#"
                              className="badge bg-light text-dark me-2"
                            >
                              App
                            </Link>
                            <Link
                              to="#"
                              className="badge bg-light text-dark me-2"
                            >
                              Admin
                            </Link>
                            <div className="dropdown table-action">
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
                                  data-bs-target="#edit_lang"
                                >
                                  <i className="ti ti-edit text-blue me-1" />
                                  Edit
                                </Link>
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_lang"
                                >
                                  <i className="ti ti-trash text-blue me-1" />
                                  Delete
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <Link
                              to="#"
                              className="d-flex align-items-center gap-2"
                            >
                               <ImageWithBasePath
                                src="assets/img/flags/fr.svg"
                                alt="Img"
                                height={16}
                              />
                              English
                            </Link>
                          </td>
                          <td>fr</td>
                          <td>
                            <div className="form-check form-switch p-0">
                              <label className="form-check-label d-flex align-items-center gap-2 w-100">
                                <input
                                  className="form-check-input switchCheckDefault ms-auto"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </label>
                            </div>
                          </td>
                          <td>1892</td>
                          <td>387</td>
                          <td>
                            <div className="pipeline-progress d-flex align-items-center w-100">
                              <div
                                className="progress w-100 bg-light"
                                style={{ height: 5, borderRadius: 10 }}
                              >
                                <div
                                  className="progress-bar bg-purple"
                                  role="progressbar"
                                  style={{ width: "40%", borderRadius: 10 }}
                                  aria-valuenow={40}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                />
                              </div>
                              <span className="ms-2 text-body">40%</span>
                            </div>
                          </td>
                          <td>
                            <Link
                              to="#"
                              className="badge bg-success"
                            >
                              Connected
                            </Link>
                          </td>
                          <td className="d-flex align-items-center gap-2">
                            <Link
                              to={all_routes.languageWeb}
                              className="badge bg-light text-dark me-2"
                            >
                              Web
                            </Link>
                            <Link
                              to="#"
                              className="badge bg-light text-dark me-2"
                            >
                              App
                            </Link>
                            <Link
                              to="#"
                              className="badge bg-light text-dark me-2"
                            >
                              Admin
                            </Link>
                            <div className="dropdown table-action">
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
                                  data-bs-target="#edit_lang"
                                >
                                  <i className="ti ti-edit text-blue me-1" />
                                  Edit
                                </Link>
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_lang"
                                >
                                  <i className="ti ti-trash text-blue me-1" />
                                  Delete
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="row align-items-center">
                    <div className="col-md-6">
                      <div className="datatable-length" />
                    </div>
                    <div className="col-md-6">
                      <div className="datatable-paginate" />
                    </div>
                  </div>
                  {/* /Contact List */}
                </div>
              </div>
              {/* /Custom Fields */}
            </div>
          </div>
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
      {/* Add Translation */}
      <div className="modal fade" id="add_lang" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Translation</h5>
              <button
                className="btn-close custom-btn-close border p-1 me-0 text-dark"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <form>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">
                    Language <span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Code <span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-0">
                  <label className="form-label">Status</label>
                  <div className="radio-wrap">
                    <div className="d-flex flex-wrap">
                      <div className="radio-btn">
                        <input
                          type="radio"
                          className="status-radio"
                          id="add-active"
                          name="status"
                          defaultChecked
                        />
                        <label htmlFor="add-active">Active</label>
                      </div>
                      <div className="radio-btn">
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
              </div>
              <div className="modal-footer">
                <div className="d-flex align-items-center">
                  <Link
                    to="#"
                    className="btn btn-sm btn-light me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </Link>
                  <button type="submit" className="btn btn-sm btn-primary">
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add Translation */}
      {/* Edit Translation */}
      <div className="modal fade" id="edit_lang" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Translation</h5>
              <button
                className="btn-close custom-btn-close border p-1 me-0 text-dark"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <form>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">
                    Language <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue="English"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Code <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue="en"
                  />
                </div>
                <div className="mb-0">
                  <label className="form-label">Status</label>
                  <div className="radio-wrap">
                    <div className="d-flex flex-wrap">
                      <div className="radio-btn">
                        <input
                          type="radio"
                          className="status-radio"
                          id="edit-active"
                          name="status"
                          defaultChecked
                        />
                        <label htmlFor="edit-active">Active</label>
                      </div>
                      <div className="radio-btn">
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
              </div>
              <div className="modal-footer">
                <div className="d-flex align-items-center">
                  <Link
                    to="#"
                    className="btn btn-sm btn-light me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </Link>
                  <button type="submit" className="btn btn-sm btn-primary">
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Edit Translation */}
      {/* delete modal */}
      <div className="modal fade" id="delete_lang">
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

export default LanguageSettings;
