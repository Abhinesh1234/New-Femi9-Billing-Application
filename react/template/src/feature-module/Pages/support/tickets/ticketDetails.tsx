import { Link } from "react-router";
import Footer from "../../../../components/footer/footer";
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import { all_routes } from "../../../../routes/all_routes";

const TicketDetails = () => {
  return (
    <>
      {/* ========================
			Start Page Content
		========================= */}
      <div className="page-wrapper">
        {/* Start Content */}
        <div className="content">
          <h4 className="mb-4">Ticket Details</h4>
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <div className="mb-3">
                <Link
                  to={all_routes.tickets}
                  className="d-inline-flex align-items-center fw-medium"
                >
                  <i className="ti ti-arrow-left me-1" />
                  Back to Tickets
                </Link>
              </div>
              {/* Ticket Details */}
              <div className="card mb-0">
                <div className="card-body">
                  <div className="border br-5 mb-3">
                    <div className="p-3 bg-light d-flex align-items-center justify-content-between flex-wrap gap-3">
                      <h6>
                        #TK0020 -{" "}
                        <span className="text-body">Support for Theme</span>
                      </h6>
                      <div className="dropdown">
                        <Link
                          to="#"
                          className="dropdown-toggle btn bg-white border d-inline-flex align-items-center"
                          data-bs-toggle="dropdown"
                        >
                          <i className="ti ti-badge me-1" />
                          Resolved
                        </Link>
                        <ul className="dropdown-menu  dropdown-menu-end p-2">
                          <li>
                            <Link to="#" className="dropdown-item rounded-1">
                              Resolved
                            </Link>
                          </li>
                          <li>
                            <Link to="#" className="dropdown-item rounded-1">
                              Inprogress
                            </Link>
                          </li>
                          <li>
                            <Link to="#" className="dropdown-item rounded-1">
                              Open
                            </Link>
                          </li>
                          <li>
                            <Link to="#" className="dropdown-item rounded-1">
                              Closed
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="row row-cols-xl-5 row-cols-md-3 row-cols-sm-2 row-cols-1 row-gap-3">
                        <div className="col">
                          <h6 className="fs-13 fw-medium mb-1">Created By</h6>
                          <div className="d-flex align-items-center">
                            <Link
                              to="#"
                              className="avatar avatar-xs rounded-circle me-1"
                            >
                              <ImageWithBasePath
                                src="assets/img/users/user-03.jpg"
                                className="flex-shrink-0 rounded-circle"
                                alt="img"
                              />
                            </Link>
                            <Link to="#" className="text-truncate">
                              Michael Dawson
                            </Link>
                          </div>
                        </div>
                        <div className="col">
                          <h6 className="fs-13 fw-medium mb-1">Priority</h6>
                          <span className="badge bg-danger d-inline-flex align-items-center badge-sm">
                            High
                          </span>
                        </div>
                        <div className="col">
                          <h6 className="fs-13 fw-medium mb-1">Assigned To</h6>
                          <div className="d-flex align-items-center">
                            <Link
                              to="#"
                              className="avatar avatar-xs rounded-circle me-1"
                            >
                              <ImageWithBasePath
                                src="assets/img/users/user-07.jpg"
                                className="flex-shrink-0 rounded-circle"
                                alt="img"
                              />
                            </Link>
                            <Link to="#" className="text-truncate">
                              Michael Dawson
                            </Link>
                          </div>
                        </div>
                        <div className="col">
                          <h6 className="fs-13 fw-medium mb-1">Created at</h6>
                          <p className="fs-13">20 Jan 2025</p>
                        </div>
                        <div className="col">
                          <h6 className="fs-13 fw-medium mb-1">Last Updated</h6>
                          <p className="fs-13">18 Feb 2025</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <h6 className="mb-2">Description</h6>
                    <p className="mb-2">
                      After applying the updated CRM theme, I am experiencing
                      significant layout and design problems that affect my
                      workflow. I urgently need assistance to resolve these
                      display issues and compatibility challenges with the
                      existing modules and plugins to ensure smooth operations
                      and a consistent user experience.
                    </p>
                    <p className="mb-0">
                      I’ve made several attempts to adjust theme settings and
                      configurations, but the layout issues persist. The theme
                      appears to conflict with essential CRM modules and custom
                      workflows I heavily depend on.
                    </p>
                  </div>
                  <div className="mb-3">
                    <h6 className="mb-2">Attachments</h6>
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                      <div className="bg-light br-5 p-3 d-flex align-items-center border">
                        <span className="avatar d-flex align-items-center justify-content-center bg-danger me-2">
                          <ImageWithBasePath
                            src="assets/img/icons/pdf-1.svg"
                            alt="img"
                            className="w-auto h-auto"
                          />
                        </span>
                        <div className="me-2">
                          <h6 className="fs-14 fw-medium">Report1.pdf</h6>
                          <p className="fs-12 mb-0">45 KB</p>
                        </div>
                        <Link
                          to="#"
                          className="avatar avatar-sm avatar-rounded download-icon d-flex align-items-center justify-content-center"
                        >
                          <i className="ti ti-download fs-16" />
                        </Link>
                      </div>
                      <div className="bg-light br-5 p-3 d-flex align-items-center border">
                        <span className="avatar d-flex align-items-center justify-content-center bg-success me-2">
                          <ImageWithBasePath
                            src="assets/img/icons/jpg-1.svg"
                            alt="img"
                            className="w-auto h-auto"
                          />
                        </span>
                        <div className="me-2">
                          <h6 className="fs-14 fw-medium">Image2.jpg</h6>
                          <p className="fs-12 mb-0">38 KB</p>
                        </div>
                        <Link
                          to="#"
                          className="avatar avatar-sm avatar-rounded download-icon d-flex align-items-center justify-content-center"
                        >
                          <i className="ti ti-download fs-16" />
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex align-items-center">
                      <div>
                        <Link to="#" className="avatar rounded-circle me-2">
                          <ImageWithBasePath
                            src="assets/img/profiles/avatar-27.jpg"
                            alt="img"
                            className="avatar rounded-circle"
                          />
                        </Link>
                      </div>
                      <div className="d-flex align-items-center">
                        <p className="fw-medium text-dark mb-0 me-1">
                          Rely To :
                        </p>
                        <Link
                          to="#"
                          className="py-1 px-2 bg-soft-danger text-danger fs-12 fw-medium rounded"
                        >
                          Michael Dawson (michael123@example.com){" "}
                          <i className="ti ti-x ms-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="mb-0">
                    <h6 className="mb-2">Message</h6>
                    <div className="editor pages-editor">
                      <p>
                        Dear Michael Dawson, we sincerely apologize for the
                        inconvenience. We have forwarded your issue to our Los
                        Angeles branch for an immediate resolution. Meanwhile,
                        we are arranging a replacement vehicle, and we will
                        update you shortly.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="card-footer">
                  <div className="d-flex align-items-center justify-content-end">
                    <Link to="#" className="btn btn-light me-3">
                      Cancel
                    </Link>
                    <Link to="#" className="btn btn-primary">
                      Send Reply
                    </Link>
                  </div>
                </div>
              </div>
              {/* /Ticket Details */}
            </div>
          </div>
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

export default TicketDetails;
