import { Link } from "react-router";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import SettingsTopbar from "../settings-topbar/settingsTopbar";
import { all_routes } from "../../../../routes/all_routes";
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import CommonSelect from "../../../../components/common-select/commonSelect";
import { Font_Family, Sidebar_Size } from "../../../../core/json/selectOption";

const AppearanceSettings = () => {
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
                        className="d-block p-2 fw-medium active"
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
                    <h5 className="mb-0 fs-17">Appearance</h5>
                  </div>
                  <form>
                    <div className="border-bottom mb-3">
                      {/* start row */}
                      <div className="row">
                        <div className="col-md-4">
                          <div className="mb-3">
                            <h6 className="fs-14 fw-semibold mb-1">
                              Select Theme
                            </h6>
                            <p className="fs-13 mb-0">
                              Select theme of the website
                            </p>
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-md-8">
                          <div className="mb-3">
                            <div className="theme-type-images d-flex align-items-center gap-2">
                              <div className="theme-image  text-center p-2 rounded active">
                                <div className="mb-2">
                                  <ImageWithBasePath
                                    src="assets/img/theme/theme-01.jpg"
                                    alt="Img"
                                  />
                                </div>
                                <span className="fw-medium">Light</span>
                              </div>
                              <div className="theme-image text-center p-2 rounded">
                                <div className="mb-2">
                                  <ImageWithBasePath
                                    src="assets/img/theme/theme-02.jpg"
                                    alt="Img"
                                  />
                                </div>
                                <span className="fw-medium">Dark</span>
                              </div>
                              <div className="theme-image text-center p-2 rounded">
                                <div className="mb-2">
                                  <ImageWithBasePath
                                    src="assets/img/theme/theme-03.jpg"
                                    alt="Img"
                                  />
                                </div>
                                <span className="fw-medium">Automatic</span>
                              </div>
                            </div>
                          </div>
                        </div>{" "}
                        {/* end col */}
                      </div>
                      {/* end row */}
                      {/* start col */}
                      <div className="row">
                        <div className="col-md-8">
                          <div className="mb-3">
                            <h6 className="fs-14 fw-semibold mb-1">
                              Accent Color
                            </h6>
                            <p className="fs-13 mb-0">
                              Select accent color of website
                            </p>
                          </div>
                        </div>
                        {/* end col */}
                        <div className="col-md-4">
                          <div className="mb-3">
                            <div className="theme-colors">
                              <div className="d-flex align-items-center gap-2">
                                <span className="themecolorset defaultcolor active" />
                                <span className="themecolorset theme-secondary" />
                                <span className="themecolorset theme-violet" />
                                <span className="themecolorset theme-blue" />
                                <span className="themecolorset theme-brown" />
                              </div>
                            </div>
                          </div>
                        </div>{" "}
                        {/* end col */}
                      </div>
                      {/* end row */}
                      {/* start row */}
                      <div className="row">
                        <div className="col-md-8">
                          <div className="mb-3">
                            <h6 className="fs-14 fw-semibold mb-1">
                              Expand Sidebar
                            </h6>
                            <p className="fs-13 mb-0">
                              To display in all the pages
                            </p>
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-md-4">
                          <div className="mb-3">
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                defaultChecked
                              />
                            </div>
                          </div>
                        </div>{" "}
                        {/* end col */}
                      </div>
                      {/* end row */}
                      {/* start row */}
                      <div className="row">
                        <div className="col-md-8">
                          <div className="mb-3">
                            <h6 className="fs-14 fw-semibold mb-1">
                              Sidebar Size
                            </h6>
                            <p className="fs-13 mb-0">
                              Select size of sidebar to display
                            </p>
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-md-4">
                          <div className="mb-3">
                            <CommonSelect
                              options={Sidebar_Size}
                              className="select"
                              defaultValue={Sidebar_Size[0]}
                            />
                          </div>
                        </div>{" "}
                        {/* end col */}
                      </div>
                      {/* end row */}
                      {/* start row */}
                      <div className="row">
                        <div className="col-md-8">
                          <div className="mb-3">
                            <h6 className="fs-14 fw-semibold mb-1">
                              Font Family
                            </h6>
                            <p className="fs-13 mb-0">
                              Select font family of website
                            </p>
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-md-4">
                          <div className="mb-3">
                            <CommonSelect
                              options={Font_Family}
                              className="select"
                              defaultValue={Font_Family[0]}
                            />
                          </div>
                        </div>{" "}
                        {/* end col */}
                      </div>
                      {/* end row */}
                    </div>
                    <div className="d-flex align-items-center justify-content-end flex-wrap gap-2">
                      <Link to="#" className="btn btn-sm btn-light">
                        Cancel
                      </Link>
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

export default AppearanceSettings;
