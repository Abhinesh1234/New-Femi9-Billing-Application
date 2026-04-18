import { Link } from "react-router"
import Footer from "../../../../components/footer/footer"
import PageHeader from "../../../../components/page-header/pageHeader"
import SettingsTopbar from "../settings-topbar/settingsTopbar"
import { all_routes } from "../../../../routes/all_routes"
import ImageWithBasePath from "../../../../components/imageWithBasePath"
import CommonSelect from "../../../../components/common-select/commonSelect"
import { Invoice_Due, RoundUp } from "../../../../core/json/selectOption"


const InvoiceSettings = () => {
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
          <div className="card mb-3 mb-xl-0 filemanager-left-sidebar">
            <div className="card-body">
              <div className="settings-sidebar">
                <h5 className="mb-3 fs-17">App Settings</h5>
                <div className="list-group list-group-flush settings-sidebar">
                  <Link
                    to={all_routes.invoiceSettings}
                    className="d-block p-2 fw-medium active"
                  >
                    Invoice Settings
                  </Link>
                  <Link
                    to={all_routes.printers}
                    className="d-block p-2 fw-medium"
                  >
                    Printer
                  </Link>
                  <Link
                    to={all_routes.customFields}
                    className="d-block p-2 fw-medium"
                  >
                    Custom Fields
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
                <h5 className="mb-0 fs-17">Invoice Settings</h5>
              </div>
              <form>
                <div className="border-bottom mb-3">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <h6 className="fs-14 fw-semibold mb-1">Invoice Logo</h6>
                        <p className="fs-13 mb-0">
                          Upload logo of your company to display in invoice
                        </p>
                      </div>
                    </div>
                    <div className="col-md-6">
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
                              Upload Logo of your company to display in website.
                              Recommended size is 250 px*100 px
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-8">
                      <div className="mb-3">
                        <h6 className="fs-14 fw-semibold mb-1">
                          Invoice Prefix
                        </h6>
                        <p className="fs-13 mb-0">Add prefix to your invoice</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control"
                          defaultValue="INV-"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-8">
                      <div className="mb-3">
                        <h6 className="fs-14 fw-semibold mb-1">Invoice Due</h6>
                        <p className="fs-13 mb-0">
                          Select due date to display in invoice
                        </p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <div className="d-flex align-items-center inv-days">
                          <div className="me-2">
                            <CommonSelect
                            options={Invoice_Due}
                            className="select"
                            defaultValue={Invoice_Due[0]}
                          />
                          </div>
                          <p className="fs-13 mb-0">Days</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <div className="mb-3">
                        <h6 className="fs-14 fw-semibold mb-1">
                          Invoice Round Off
                        </h6>
                        <p className="fs-13 mb-0">Value roundoff in invoice</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <div className="d-flex align-items-center">
                          <div className="form-check form-switch me-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              defaultChecked
                            />
                          </div>
                          <div className="w-100">
                           <CommonSelect
                            options={RoundUp}
                            className="select"
                            defaultValue={RoundUp[0]}
                          />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <div className="mb-3">
                        <h6 className="fs-14 fw-semibold mb-1">
                          Show Company Details
                        </h6>
                        <p className="fs-13 mb-0">
                          Show/hide company details in invoice
                        </p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            defaultChecked
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <h6 className="fs-14 fw-semibold mb-1">
                          Invoice Footer Terms
                        </h6>
                        <p className="fs-13 mb-0">
                          Enter terms that will appear on All Proposals by
                          default.
                        </p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <div className="snow-editor" />
                      </div>
                    </div>
                  </div>
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
            </div>
          </div>
          {/* /Invoice Settings */}
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

export default InvoiceSettings