import { Link } from "react-router";
import ImageWithBasePath from "../../../../../components/imageWithBasePath";
import PageHeader from "../../../../../components/page-header/pageHeader";

const AudioCall = () => {
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
            title="Audio Call"
            showModuleTile={true}
            moduleTitle="Application"
            showExport={false}
          />

          {/* End Page Header */}
          {/* start row */}
          <div className="row">
            <div className="col-xxl-12">
              <div className="card card-max-height mb-0 shadow-none">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <span className="avatar avatar-lg avatar-rounded me-2">
                        <ImageWithBasePath
                          src="assets/img/users/user-01.jpg"
                          className="img-fluid rounded-circle"
                          alt="img"
                        />
                      </span>
                      <div>
                        <h6 className="mb-1">
                          <Link to="#">Anthony Lewis</Link>
                        </h6>
                        <span className="fs-13 d-block">Online</span>
                      </div>
                    </div>
                    <Link
                      to="#"
                      className="avatar avatar-md rounded-circle bg-light text-dark"
                    >
                      <i className="ti ti-user-plus fs-20" />
                    </Link>
                  </div>
                </div>{" "}
                {/* end card-header */}
                <div className="card-body position-relative text-center d-flex flex-column justify-content-center">
                  <div className="animation-ripple avatar avatar-xxxl d-flex mx-auto mb-3 rounded-circle">
                    <ImageWithBasePath
                      src="assets/img/users/user-01.jpg"
                      className="img-fluid rounded-circle"
                      alt="img"
                    />
                  </div>
                  <h5>Anthony Lewis</h5>
                  <p>00:24</p>
                  <Link
                    to="#"
                    className="avatar avatar-xl position-absolute end-0 bottom-0 m-3"
                  >
                    <ImageWithBasePath
                      src="assets/img/users/user-05.jpg"
                      alt="Img"
                    />
                  </Link>
                </div>{" "}
                {/* end card-body */}
                <div className="card-footer">
                  <div className="d-flex align-items-center justify-content-center">
                    <Link
                      to="#"
                      className="btn btn-light btn-icon rounded-circle p-0 d-flex align-items-center justify-content-center me-3"
                    >
                      <i className="ti ti-video fs-20" />
                    </Link>
                    <Link
                      to="#"
                      className="btn btn-danger btn-icon rounded-circle p-0 d-flex align-items-center justify-content-center me-3"
                    >
                      <i className="ti ti-phone fs-20" />
                    </Link>
                    <Link
                      to="#"
                      className="btn btn-light btn-icon rounded-circle p-0 d-flex align-items-center justify-content-center"
                    >
                      <i className="ti ti-microphone fs-20" />
                    </Link>
                  </div>
                </div>{" "}
                {/* end card-footer */}
              </div>{" "}
              {/* end card */}
            </div>{" "}
            {/* end col */}
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
    </>
  );
};

export default AudioCall;
