import { Link } from "react-router"
import Footer from "../../../../components/footer/footer"
import PageHeader from "../../../../components/page-header/pageHeader"
import SettingsTopbar from "../settings-topbar/settingsTopbar"
import { all_routes } from "../../../../routes/all_routes"
import CommonSelect from "../../../../components/common-select/commonSelect"
import { Cookies_Position } from "../../../../core/json/selectOption"


const GdprCookies = () => {
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
    <SettingsTopbar/>
      {/* end card */}
      {/* start row */}
      <div className="row">
        <div className="col-xl-3 col-lg-12 theiaStickySidebar">
          <div className="card mb-3 mb-xl-0  filemanager-left-sidebar">
            <div className="card-body">
               <div className="settings-sidebar">
                <h5 className="mb-3 fs-17">System Settings</h5>
                <div className="list-group list-group-flush settings-sidebar">
                  <Link
                    to={all_routes.emailSettings}
                    className="d-block p-2 fw-medium "
                  >
                    Email Settings
                  </Link>
                  <Link to={all_routes.smsGateways} className="d-block p-2 fw-medium">
                    SMS Gateways
                  </Link>
                  <Link to={all_routes.gdprCookies} className="d-block p-2 fw-medium active">
                    GDPR Cookies
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
                <h5 className="mb-0 fs-17">GDPR Cookies</h5>
              </div>
              <form>
                <div className="border-bottom mb-3">
                  <div className="row align-items-center">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <h6 className="fs-14 fw-semibold mb-1">
                          Cookies Content Text
                        </h6>
                        <p className="fs-13">You can configure the text here</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <div className="snow-editor" />
                      </div>
                    </div>
                  </div>
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <div className="mb-3">
                        <h6 className="fs-14 fw-semibold mb-1">
                          Cookies Position
                        </h6>
                        <p className="fs-13">You can configure the type</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                         <CommonSelect
                            options={Cookies_Position}
                            className="select"
                            defaultValue={Cookies_Position[0]}
                          />
                      </div>
                    </div>
                  </div>
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <div className="mb-3">
                        <h6 className="fs-14 fw-semibold mb-1">
                          Agree Button Text
                        </h6>
                        <p className="fs-13">You can configure the text here</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control"
                          defaultValue="Agree"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <div className="mb-3">
                        <h6 className="fs-14 fw-semibold mb-1">
                          Decline Button Text
                        </h6>
                        <p className="fs-13">You can configure the text here</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control"
                          defaultValue="Decline"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <div className="mb-3">
                        <h6 className="fs-14 fw-semibold mb-1">
                          Show Decline Button
                        </h6>
                        <p className="fs-13">To display decline button</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <div className="form-check form-switch ms-0 ps-0">
                          <input
                            className="form-check-input ms-0 mt-0"
                            type="checkbox"
                            role="switch"
                            defaultChecked
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <div className="mb-3">
                        <h6 className="fs-14 fw-semibold mb-1">
                          Link for Cookies Page
                        </h6>
                        <p className="fs-13">You can configure the link here</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <input type="text" className="form-control" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-end flex-wrap gap-2">
                  <a href="#" className="btn btn-sm btn-light me-2">
                    Cancel
                  </a>
                  <button type="submit" className="btn btn-sm btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
          {/* /GDPR Cookies */}
        </div>
      </div>
    </div>
    {/* End Content */}
    {/* Start Footer */}
    <Footer/>
    {/* End Footer */}
  </div>
  {/* ========================
			End Page Content
		========================= */}
</>

  )
}

export default GdprCookies