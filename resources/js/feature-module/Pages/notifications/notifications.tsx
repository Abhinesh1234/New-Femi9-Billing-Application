import { Link } from "react-router";
import Footer from "../../../components/footer/footer";
import PageHeader from "../../../components/page-header/pageHeader";
import ImageWithBasePath from "../../../components/imageWithBasePath";

const Notifications = () => {
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
            title="Notifications"
            badgeCount={false}
            showModuleTile={false}
            showExport={false}
          />
          {/* End Page Header */}
          {/* card start */}
          <div className="card mb-0">
            <div className="card-header d-flex align-items-center flex-wrap gap-2 justify-content-between">
              <h6 className="d-inline-flex align-items-center mb-0">
                Total Notifications{" "}
                <span className="badge bg-danger ms-2">658</span>
              </h6>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <Link to="#" className="btn btn-light">
                  <i className="ti ti-checks me-1" />
                  Mark all as read
                </Link>
                <Link to="#" className="btn btn-danger">
                  <i className="ti ti-trash me-1" />
                  Delete All
                </Link>
              </div>
            </div>
            <div className="card-body">
              <div className="card notication-card">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div className="d-flex align-items-center">
                      <Link to="#" className="avatar flex-shrink-0">
                        <ImageWithBasePath
                          src="./assets/img/users/user-07.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                      <div className="ms-2">
                        <div>
                          <p className="mb-1">
                            <Link to="#" className="fw-medium">
                              Daniel Martinz
                            </Link>{" "}
                            requested Sick Leave from{" "}
                            <span className="text-dark fw-medium">
                              May 28 2025
                            </span>{" "}
                            to{" "}
                            <span className="text-dark fw-medium">
                              {" "}
                              May 29 2025
                            </span>
                          </p>
                          <p className="fs-12 mb-0 d-inline-flex align-items-center">
                            <i className="ti ti-clock me-1" /> 4 min ago
                            <span className="ms-2">
                              <i className="ti ti-point-filled text-danger fs-16 lh-sm" />
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="noti-btn">
                      <Link
                        to="#"
                        className="btn btn-danger d-inline-flex align-items-center"
                      >
                        <i className="ti ti-trash me-1" />
                        Delete
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card notication-card">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div className="d-flex align-items-center">
                      <Link to="#" className="avatar flex-shrink-0">
                        <ImageWithBasePath
                          src="./assets/img/users/user-02.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                      <div className="ms-2">
                        <div>
                          <p className="mb-1">
                            Leave for{" "}
                            <Link to="#" className="fw-medium">
                              Emily Clark
                            </Link>{" "}
                            <span className="text-dark fw-medium">
                              (May 26 2025)
                            </span>{" "}
                            has been approved.
                          </p>
                          <p className="fs-12 mb-0 d-inline-flex align-items-center">
                            <i className="ti ti-clock me-1" /> 15 min ago
                            <span className="ms-2">
                              <i className="ti ti-point-filled text-danger fs-16 lh-sm" />
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="noti-btn">
                      <Link
                        to="#"
                        className="btn btn-danger d-inline-flex align-items-center"
                      >
                        <i className="ti ti-trash me-1" />
                        Delete
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card notication-card">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div className="d-flex align-items-center">
                      <Link to="#" className="avatar flex-shrink-0">
                        <ImageWithBasePath
                          src="./assets/img/users/user-04.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                      <div className="ms-2">
                        <div>
                          <p className="mb-1">
                            Leave request from{" "}
                            <Link to="#" className="fw-medium">
                              David Anderson
                            </Link>{" "}
                            <span className="text-dark fw-medium">
                              (May 30 2025)
                            </span>{" "}
                            has been rejected.
                          </p>
                          <p className="fs-12 mb-0 d-inline-flex align-items-center">
                            <i className="ti ti-clock me-1" /> 45 Min Ago
                            <span className="ms-2">
                              <i className="ti ti-point-filled text-danger fs-16 lh-sm" />
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="noti-btn">
                      <Link
                        to="#"
                        className="btn btn-danger d-inline-flex align-items-center"
                      >
                        <i className="ti ti-trash me-1" />
                        Delete
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card notication-card mb-0">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div className="d-flex align-items-center">
                      <Link to="#" className="avatar flex-shrink-0">
                        <ImageWithBasePath
                          src="./assets/img/users/user-24.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                      <div className="ms-2">
                        <div>
                          <p className="mb-1">
                            <Link to="#" className="fw-medium">
                              Ann McClure
                            </Link>{" "}
                            cancelled her appointment scheduled for{" "}
                            <span className="text-dark fw-medium">
                              February 5, 2024
                            </span>
                          </p>
                          <p className="fs-12 mb-0 d-inline-flex align-items-center">
                            <i className="ti ti-clock me-1" /> 58 Min Ago
                            <span className="ms-2">
                              <i className="ti ti-point-filled text-danger fs-16 lh-sm" />
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="noti-btn">
                      <Link
                        to="#"
                        className="btn btn-danger d-inline-flex align-items-center"
                      >
                        <i className="ti ti-trash me-1" />
                        Delete
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* card start */}
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

export default Notifications;
