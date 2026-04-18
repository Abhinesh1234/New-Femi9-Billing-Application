import { Link } from "react-router";
import Footer from "../../../../components/footer/footer";
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import PageHeader from "../../../../components/page-header/pageHeader";
import SettingsTopbar from "../settings-topbar/settingsTopbar";
import { all_routes } from "../../../../routes/all_routes";

const PreferenceSettings = () => {
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
                        className="d-block p-2 fw-medium active"
                      >
                        Preference
                      </Link>
                      <Link
                        to={all_routes.appearance}
                        className="d-block p-2 fw-medium"
                      >
                        Appearance
                      </Link>
                      <Link
                        to={all_routes.languageWeb}
                        className="d-block p-2 fw-medium"
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
              <div className="card mb-0">
                <div className="card-body">
                  <div className="border-bottom mb-3 pb-3">
                    <h5 className="mb-0 fs-17">Preference</h5>
                  </div>
                  <form>
                    <div className="border-bottom mb-3">
                      <div className="row">
                        <div className="col-xxl-4 col-sm-6">
                          <div className="card border mb-3">
                            <div className="card-body d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                <ImageWithBasePath
                                  src="assets/img/icons/preference-01.svg"
                                  alt="Img"
                                />
                                <h6 className="fs-14 fw-semibold ms-2 mb-0">
                                  Contact
                                </h6>
                              </div>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input ms-0"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-xxl-4 col-sm-6">
                          <div className="card border mb-3">
                            <div className="card-body d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                <ImageWithBasePath
                                  src="assets/img/icons/preference-02.svg"
                                  alt="Img"
                                />
                                <h6 className="fs-14 fw-semibold ms-2 mb-0">
                                  Deals
                                </h6>
                              </div>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input ms-0"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-xxl-4 col-sm-6">
                          <div className="card border mb-3">
                            <div className="card-body d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                <ImageWithBasePath
                                  src="assets/img/icons/preference-03.svg"
                                  alt="Img"
                                />
                                <h6 className="fs-14 fw-semibold ms-2 mb-0">
                                  Leads
                                </h6>
                              </div>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input ms-0"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-xxl-4 col-sm-6">
                          <div className="card border mb-3">
                            <div className="card-body d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                <ImageWithBasePath
                                  src="assets/img/icons/preference-04.svg"
                                  alt="Img"
                                />
                                <h6 className="fs-14 fw-semibold ms-2 mb-0">
                                  Pipelines
                                </h6>
                              </div>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input ms-0"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-xxl-4 col-sm-6">
                          <div className="card border mb-3">
                            <div className="card-body d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                <ImageWithBasePath
                                  src="assets/img/icons/preference-02.svg"
                                  alt="Img"
                                />
                                <h6 className="fs-14 fw-semibold ms-2 mb-0">
                                  Campaign
                                </h6>
                              </div>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input ms-0"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-xxl-4 col-sm-6">
                          <div className="card border mb-3">
                            <div className="card-body d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                <ImageWithBasePath
                                  src="assets/img/icons/preference-06.svg"
                                  alt="Img"
                                />
                                <h6 className="fs-14 fw-semibold ms-2 mb-0">
                                  Projects
                                </h6>
                              </div>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input ms-0"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-xxl-4 col-sm-6">
                          <div className="card border mb-3">
                            <div className="card-body d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                <ImageWithBasePath
                                  src="assets/img/icons/preference-07.svg"
                                  alt="Img"
                                />
                                <h6 className="fs-14 fw-semibold ms-2 mb-0">
                                  Tasks
                                </h6>
                              </div>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input ms-0"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-xxl-4 col-sm-6">
                          <div className="card border mb-3">
                            <div className="card-body d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                <ImageWithBasePath
                                  src="assets/img/icons/preference-08.svg"
                                  alt="Img"
                                />
                                <h6 className="fs-14 fw-semibold ms-2 mb-0">
                                  Acivities
                                </h6>
                              </div>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input ms-0"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-xxl-4 col-sm-6">
                          <div className="card border mb-3">
                            <div className="card-body d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                <ImageWithBasePath
                                  src="assets/img/icons/preference-09.svg"
                                  alt="Img"
                                />
                                <h6 className="fs-14 fw-semibold ms-2 mb-0">
                                  Company
                                </h6>
                              </div>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input ms-0"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-xxl-4 col-sm-6">
                          <div className="card border mb-3">
                            <div className="card-body d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                <ImageWithBasePath
                                  src="assets/img/icons/preference-10.svg"
                                  alt="Img"
                                />
                                <h6 className="fs-14 fw-semibold ms-2 mb-0">
                                  Analytics
                                </h6>
                              </div>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input ms-0"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-xxl-4 col-sm-6">
                          <div className="card border mb-3">
                            <div className="card-body d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                <ImageWithBasePath
                                  src="assets/img/icons/preference-11.svg"
                                  alt="Img"
                                />
                                <h6 className="fs-14 fw-semibold ms-2 mb-0">
                                  Clients
                                </h6>
                              </div>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input ms-0"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-xxl-4 col-sm-6">
                          <div className="card border mb-3">
                            <div className="card-body d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                <ImageWithBasePath
                                  src="assets/img/icons/preference-12.svg"
                                  alt="Img"
                                />
                                <h6 className="fs-14 fw-semibold ms-2 mb-0">
                                  Customers
                                </h6>
                              </div>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input ms-0"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-end flex-wrap gap-2">
                      <a href="#" className="btn btn-sm btn-light">
                        Cancel
                      </a>
                      <button type="submit" className="btn btn-sm btn-primary">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>{" "}
                {/* end card body */}
              </div>{" "}
              {/* end card */}
            </div>{" "}
            {/* end col */}
          </div>
          {/* end row */}
        </div>
        {/* End Content */}
        {/* Start Footer */}
        <Footer />
        {/* End Footer */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
    </>
  );
};

export default PreferenceSettings;
