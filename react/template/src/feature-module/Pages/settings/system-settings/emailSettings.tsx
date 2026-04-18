import { Link } from "react-router"
import PageHeader from "../../../../components/page-header/pageHeader"
import SettingsTopbar from "../settings-topbar/settingsTopbar"
import { all_routes } from "../../../../routes/all_routes"
import ImageWithBasePath from "../../../../components/imageWithBasePath"


const EmailSettings = () => {
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
          <div className="card mb-3 mb-xl-0  filemanager-left-sidebar" >
            <div className="card-body">
              <div className="settings-sidebar">
                <h5 className="mb-3 fs-17">System Settings</h5>
                <div className="list-group list-group-flush settings-sidebar">
                  <Link
                    to={all_routes.emailSettings}
                    className="d-block p-2 fw-medium active"
                  >
                    Email Settings
                  </Link>
                  <Link to={all_routes.smsGateways} className="d-block p-2 fw-medium">
                    SMS Gateways
                  </Link>
                  <Link to={all_routes.gdprCookies} className="d-block p-2 fw-medium">
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
              <div className="border-bottom mb-3 pb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                <h5 className="mb-0 fs-17">Email Settings</h5>
                <Link
                  to="#"
                  className="btn btn-primary btn-sm"
                  data-bs-toggle="modal"
                  data-bs-target="#add_mail"
                >
                  <i className="ti ti-send me-1" />
                  Send Test Mail
                </Link>
              </div>
              <div className="row">
                {/* Email Wrap */}
                <div className="col-md-12">
                  {/* PHP Mailer */}
                  <div className="border rounded shadow p-3 mb-3">
                    <div className="row gy-3">
                      <div className="col-sm-5">
                        <div className="d-flex align-items-center">
                          <span className="avatar avatar-lg border me-2 flex-shrink-0">
                            <ImageWithBasePath
                              src="assets/img/icons/mail-01.svg"
                              className="w-auto h-auto rounded-0"
                              alt="Img"
                            />
                          </span>
                          <div>
                            <h6 className="fs-14 fw-medium mb-1">PHP Mailer</h6>
                            <Link
                              to="#;"
                              className="badge badge-soft-success"
                            >
                              Connected
                            </Link>
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-7">
                        <div className="d-flex align-items-center justify-content-between">
                          <div>
                            <Link
                              to="#;"
                              data-bs-toggle="collapse"
                              data-bs-target="#php-mail"
                              className="border-end fs-18 pe-3 me-3"
                            >
                              <i className="ti ti-info-circle-filled me-1" />
                            </Link>
                            <Link
                              to="#"
                              className="btn btn-light"
                              data-bs-toggle="modal"
                              data-bs-target="#add_phpmail"
                            >
                              <i className="ti ti-tool me-1" />
                              View Integration
                            </Link>
                          </div>
                          <div className="form-check form-switch ps-0">
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
                    <div className="collapse" id="php-mail">
                      <div className="mail-collapse mt-2">
                        <p className="mb-0">
                          PHPMailer is a third-party PHP library that provides a
                          simple way to send emails in PHP. It offers a range of
                          features that make it a popular alternative to PHP's
                          built-in mail() function, such as support for HTML
                          emails, attachments, and SMTP authentication.
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* /PHP Mailer */}
                  {/* SMTP */}
                  <div className="border rounded shadow p-3 mb-3">
                    <div className="row gy-3">
                      <div className="col-sm-5">
                        <div className="d-flex align-items-center">
                          <span className="avatar avatar-lg border me-2 flex-shrink-0">
                            <ImageWithBasePath
                              src="assets/img/icons/mail-02.svg"
                              className="w-auto h-auto"
                              alt="Img"
                            />
                          </span>
                          <div>
                            <h6 className="fs-14 fw-medium mb-1">SMTP</h6>
                            <Link
                              to="#;"
                              className="badge badge-soft-success"
                            >
                              Connected
                            </Link>
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-7">
                        <div className="d-flex align-items-center justify-content-between">
                          <div>
                            <Link
                              to="#;"
                              className="border-end fs-18 pe-3 me-3"
                            >
                              <i className="ti ti-info-circle-filled me-1" />
                            </Link>
                            <Link
                              to="#"
                              className="btn btn-light"
                              data-bs-toggle="modal"
                              data-bs-target="#add_smtp"
                            >
                              <i className="ti ti-tool me-1" />
                              View Integration
                            </Link>
                          </div>
                          <div className="form-check form-switch ps-0">
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
                  </div>
                  {/* /SMTP */}
                  {/* SendGrid */}
                  <div className="border rounded shadow p-3">
                    <div className="row gy-3">
                      <div className="col-sm-5">
                        <div className="d-flex align-items-center">
                          <span className="avatar avatar-lg border me-2 flex-shrink-0">
                            <ImageWithBasePath
                              src="assets/img/icons/mail-03.svg"
                              className="w-auto h-auto"
                              alt="Img"
                            />
                          </span>
                          <div>
                            <h6 className="fs-14 fw-medium mb-1">SendGrid</h6>
                            <Link
                              to="#;"
                              className="badge badge-soft-light text-body"
                            >
                              Not Connected
                            </Link>
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-7">
                        <div className="d-flex align-items-center justify-content-between">
                          <div>
                            <Link
                              to="#;"
                              className="border-end fs-18 pe-3 me-3"
                            >
                              <i className="ti ti-info-circle-filled me-1" />
                            </Link>
                            <Link to="#" className="btn btn-light">
                              <i className="ti ti-plug-connected me-1" />
                              Connect
                            </Link>
                          </div>
                          <div className="form-check form-switch ps-0">
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
                  </div>
                  {/* /SendGrid */}
                </div>
                {/* /Email Wrap */}
              </div>
            </div>
          </div>
          {/* /Settings Info */}
        </div>
      </div>
    </div>
    {/* End Content */}
    {/* Start Footer */}
    <footer className="footer d-block d-md-flex justify-content-between text-md-start text-center">
      <p className="mb-md-0 mb-1">
        Copyright ©{" "}
        <Link
          to="#;"
          className="link-primary text-decoration-underline"
        >
          CRMS
        </Link>
      </p>
      <div className="d-flex align-items-center gap-2 footer-links justify-content-center justify-content-md-end">
        <Link to="#;">About</Link>
        <Link to="#;">Terms</Link>
        <Link to="#;">Contact Us</Link>
      </div>
    </footer>
    {/* End Footer */}
  </div>
  {/* ========================
			End Page Content
		========================= */}
  {/* PHP Mailer */}
  <div className="modal fade" id="add_phpmail" role="dialog">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">PHP Mailer</h5>
          <button
            className="btn-close custom-btn-close border p-1 me-0 text-dark"
            data-bs-dismiss="modal"
            aria-label="Close"
          />
        </div>
        <form>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">
                From Email Address <span className="text-danger">*</span>
              </label>
              <input type="text" className="form-control" />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Email Password <span className="text-danger">*</span>
              </label>
              <input type="password" className="form-control" />
            </div>
            <div className="mb-0">
              <label className="form-label">
                From Email Name <span className="text-danger">*</span>
              </label>
              <input type="text" className="form-control" />
            </div>
          </div>
          <div className="modal-footer">
            <div className="d-flex align-items-center justify-content-end m-0">
              <Link
                to="#"
                className="btn btn-light me-2"
                data-bs-dismiss="modal"
              >
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
  {/* /PHP Mailer */}
  {/* SMTP */}
  <div className="modal fade" id="add_smtp" role="dialog">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">SMTP</h5>
          <button
            className="btn-close custom-btn-close border p-1 me-0 text-dark"
            data-bs-dismiss="modal"
            aria-label="Close"
          />
        </div>
        <form>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">
                From Email Address <span className="text-danger">*</span>
              </label>
              <input type="text" className="form-control" />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Email Password <span className="text-danger">*</span>
              </label>
              <input type="password" className="form-control" />
            </div>
            <div className="mb-0">
              <label className="form-label">
                From Host <span className="text-danger">*</span>
              </label>
              <input type="text" className="form-control" />
            </div>
          </div>
          <div className="modal-footer">
            <div className="d-flex align-items-center justify-content-end m-0">
              <Link
                to="#"
                className="btn btn-light me-2"
                data-bs-dismiss="modal"
              >
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
  {/* /SMTP */}
  {/* Test Mail */}
  <div className="modal fade" id="add_mail" role="dialog">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Test Mail</h5>
          <button
            className="btn-close custom-btn-close border p-1 me-0 text-dark"
            data-bs-dismiss="modal"
            aria-label="Close"
          />
        </div>
        <form>
          <div className="modal-body">
            <div className="mb-0">
              <label className="form-label">
                Enter Email Address <span className="text-danger">*</span>
              </label>
              <input type="text" className="form-control" />
            </div>
          </div>
          <div className="modal-footer">
            <div className="d-flex align-items-center justify-content-end m-0">
              <Link
                to="#"
                className="btn btn-light me-2"
                data-bs-dismiss="modal"
              >
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
  {/* /Test Mail */}
</>

  )
}

export default EmailSettings