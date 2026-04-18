import { Link } from "react-router";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import { all_routes } from "../../../../routes/all_routes";
import SettingsTopbar from "../settings-topbar/settingsTopbar";
import CommonSelect from "../../../../components/common-select/commonSelect";
import { City, Country, State } from "../../../../core/json/selectOption";
import ImageWithBasePath from "../../../../components/imageWithBasePath";

const ProfileSettings = () => {
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
          {/* start row */}
          <div className="row">
            <div className="col-xl-3 col-lg-12 theiaStickySidebar">
              <div className="card mb-3 mb-xl-0">
                <div className="card-body">
                  <div className="settings-sidebar">
                    <h5 className="mb-3 fs-17">General Settings</h5>
                    <div className="list-group list-group-flush settings-sidebar">
                      <Link
                        to={all_routes.profile}
                        className="d-block p-2 fw-medium active"
                      >
                        Profile
                      </Link>
                      <Link
                        to={all_routes.security}
                        className="d-block p-2 fw-medium"
                      >
                        Security
                      </Link>
                      <Link
                        to={all_routes.notification}
                        className="d-block p-2 fw-medium"
                      >
                        Notifications
                      </Link>
                      <Link
                        to={all_routes.connectedApps}
                        className="d-block p-2 fw-medium"
                      >
                        Connected Apps
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
                    <h5 className="mb-0 fs-17">Profile</h5>
                  </div>
                  <form >
                    <div className="mb-3">
                      <h6 className="mb-1">Employee Information</h6>
                      <p className="mb-0">Provide the information below</p>
                    </div>
                    <div className="mb-3">
                      <div className="profile-upload d-flex align-items-center">
                        <div className="profile-upload-img avatar avatar-xxl border border-dashed rounded position-relative flex-shrink-0">
                          <span>
                            <i className="ti ti-photo" />
                          </span>
                          <ImageWithBasePath
                            id="ImgPreview"
                            src="assets/img/profiles/avatar-02.jpg"
                            alt="img"
                            className="preview1"
                          />
                          <Link
                            to="#"
                            id="removeImage1"
                            className="profile-remove"
                          >
                            <i className="ti ti-x" />
                          </Link>
                        </div>
                        <div className="profile-upload-content ms-3">
                          <label className="d-inline-flex align-items-center position-relative btn btn-primary btn-sm mb-2">
                            <i className="ti ti-file-broken me-1" />
                            Upload File
                            <input
                              type="file"
                              id="imag"
                              className="input-img position-absolute w-100 h-100 opacity-0 top-0 end-0"
                            />
                          </label>
                          <p className="mb-0">
                            JPG, GIF or PNG. Max size of 800K
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="border-bottom mb-3">
                      {/* start row */}
                      <div className="row">
                        <div className="col-md-4">
                          <div className="mb-3">
                            <label className="form-label">
                              First Name <span className="text-danger">*</span>
                            </label>
                            <input type="text" className="form-control" />
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-md-4">
                          <div className="mb-3">
                            <label className="form-label">
                              Last Name <span className="text-danger">*</span>
                            </label>
                            <input type="text" className="form-control" />
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-md-4">
                          <div className="mb-3">
                            <label className="form-label">
                              User Name <span className="text-danger">*</span>
                            </label>
                            <input type="text" className="form-control" />
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-md-4">
                          <div className="mb-3">
                            <label className="form-label">
                              Phone Number{" "}
                              <span className="text-danger">*</span>
                            </label>
                            <input type="text" className="form-control" />
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-md-4">
                          <div className="mb-3">
                            <label className="form-label">
                              Email <span className="text-danger">*</span>
                            </label>
                            <input type="text" className="form-control" />
                          </div>
                        </div>{" "}
                        {/* end col */}
                      </div>
                      {/* end row */}
                    </div>
                    <div className="border-bottom mb-3">
                      <div className="mb-3">
                        <h6 className="mb-1">Address</h6>
                        <p className="mb-0">Please enter the address details</p>
                      </div>
                      {/* start row */}
                      <div className="row">
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label">Address</label>
                            <input type="text" className="form-control" />
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-lg-6 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Country</label>
                            <CommonSelect
                            options={Country}
                            className="select"
                            defaultValue={Country[0]}
                          />
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-lg-6 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              State / Province
                            </label>
                           <CommonSelect
                            options={State}
                            className="select"
                            defaultValue={State[0]}
                          />
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-lg-6 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">City</label>
                           <CommonSelect
                            options={City}
                            className="select"
                            defaultValue={City[0]}
                          />
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-lg-6 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Postal Code</label>
                            <input type="text" className="form-control" />
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

export default ProfileSettings;
