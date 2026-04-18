import { Link } from "react-router";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import ModalMembershipPlans from "./modal/modalMembershipPlans";

const MembershipPlans = () => {
  return (
    <>
      {/* ========================
			Start Page Content
		========================= */}
      <div className="page-wrapper">
        {/* Start Content */}
        <div className="content pb-0">
          {/* Page Header */}
          <PageHeader
            title="Membership Plans"
            badgeCount={152}
            showModuleTile={false}
            showExport={true}
          />
          {/* End Page Header */}
          {/* card start */}
          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <div className="input-icon input-icon-start position-relative">
                <span className="input-icon-addon text-dark">
                  <i className="ti ti-search" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search"
                />
              </div>
              <Link
                to="#"
                className="btn btn-primary"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvas_add"
              >
                <i className="ti ti-square-rounded-plus-filled me-1" />
                Add Membership
              </Link>
            </div>
            <div className="card-body pb-0">
              <div className="d-block">
                <div className="d-flex align-items-center justify-content-center mb-4">
                  <p className="text-dark mb-0">Yearly</p>
                  <div className="form-check form-switch ms-2 me-1">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      defaultChecked
                    />
                  </div>
                  <p className="text-dark mb-0">Monthly</p>
                </div>
                <div className="row justify-content-center">
                  <div className="col-lg-4 col-md-6">
                    <div className="card">
                      <div className="card-body">
                        <div className="text-center border-bottom pb-3 mb-3">
                          <span>Basic</span>
                          <h5 className="d-flex align-items-center mb-0 justify-content-center mt-1">
                            $50{" "}
                            <span className="fs-14 fw-medium ms-1">
                              / month
                            </span>
                          </h5>
                        </div>
                        <div className="d-block">
                          <div>
                            <p className="d-flex align-items-center fs-16 text-dark mb-2">
                              <span className="me-1">
                                <i className="ti ti-circle-check-filled text-success" />
                              </span>
                              10 Contacts
                            </p>
                            <p className="d-flex align-items-center fs-16 fw-medium text-dark mb-2">
                              <span className="me-1">
                                <i className="ti ti-circle-check-filled text-success" />
                              </span>
                              10 Leads
                            </p>
                            <p className="d-flex align-items-center fs-16 fw-medium text-dark mb-2">
                              <span className="me-1">
                                <i className="ti ti-circle-check-filled text-success" />
                              </span>
                              20 Companies
                            </p>
                            <p className="d-flex align-items-center fs-16 fw-medium text-dark mb-2">
                              <span className="me-1">
                                <i className="ti ti-circle-check-filled text-success" />
                              </span>
                              50 Compaigns
                            </p>
                            <p className="d-flex align-items-center fs-16 fw-medium text-dark mb-2">
                              <span className="me-1">
                                <i className="ti ti-circle-check-filled text-success" />
                              </span>
                              100 Projects
                            </p>
                            <p className="d-flex align-items-center fs-16 fw-medium text-dark mb-2">
                              <span className="me-1">
                                <i className="ti ti-xbox-x-filled text-body" />
                              </span>
                              <del>Deals</del>
                            </p>
                            <p className="d-flex align-items-center fs-16 fw-medium text-dark mb-2">
                              <span className="me-1">
                                <i className="ti ti-xbox-x-filled text-body" />
                              </span>
                              <del>Tasks</del>
                            </p>
                            <p className="d-flex align-items-center fs-16 fw-medium text-dark">
                              <span className="me-1">
                                <i className="ti ti-xbox-x-filled text-body" />
                              </span>
                              <del>Pipelines</del>
                            </p>
                          </div>
                          <div className="text-center mt-3">
                            <Link to="#" className="btn btn-primary w-100">
                              Choose
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-6">
                    <div className="card">
                      <div className="card-body">
                        <div className="text-center border-bottom pb-3 mb-3">
                          <span>Business</span>
                          <h5 className="d-flex align-items-center mb-0 justify-content-center mt-1">
                            $200{" "}
                            <span className="fs-14 fw-medium ms-1">
                              / month
                            </span>
                          </h5>
                        </div>
                        <div className="d-block">
                          <div>
                            <p className="d-flex align-items-center fs-16 text-dark mb-2">
                              <span className="me-1">
                                <i className="ti ti-circle-check-filled text-success" />
                              </span>
                              20 Contacts
                            </p>
                            <p className="d-flex align-items-center fs-16 fw-medium text-dark mb-2">
                              <span className="me-1">
                                <i className="ti ti-circle-check-filled text-success" />
                              </span>
                              20 Leads
                            </p>
                            <p className="d-flex align-items-center fs-16 fw-medium text-dark mb-2">
                              <span className="me-1">
                                <i className="ti ti-circle-check-filled text-success" />
                              </span>
                              50 Companies
                            </p>
                            <p className="d-flex align-items-center fs-16 fw-medium text-dark mb-2">
                              <span className="me-1">
                                <i className="ti ti-circle-check-filled text-success" />
                              </span>
                              Unlimited Compaigns
                            </p>
                            <p className="d-flex align-items-center fs-16 fw-medium text-dark mb-2">
                              <span className="me-1">
                                <i className="ti ti-circle-check-filled text-success" />
                              </span>
                              Unlimited Projects
                            </p>
                            <p className="d-flex align-items-center fs-16 fw-medium text-dark mb-2">
                              <span className="me-1">
                                <i className="ti ti-xbox-x-filled text-body" />
                              </span>
                              <del>Deals</del>
                            </p>
                            <p className="d-flex align-items-center fs-16 fw-medium text-dark mb-2">
                              <span className="me-1">
                                <i className="ti ti-xbox-x-filled text-body" />
                              </span>
                              <del>Tasks</del>
                            </p>
                            <p className="d-flex align-items-center fs-16 fw-medium text-dark">
                              <span className="me-1">
                                <i className="ti ti-xbox-x-filled text-body" />
                              </span>
                              <del>Pipelines</del>
                            </p>
                          </div>
                          <div className="text-center mt-3">
                            <Link to="#" className="btn btn-primary w-100">
                              Choose
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-6">
                    <div className="card">
                      <div className="card-body">
                        <div className="text-center border-bottom pb-3 mb-3">
                          <span>Enterprise</span>
                          <h5 className="d-flex align-items-center mb-0 justify-content-center mt-1">
                            $400{" "}
                            <span className="fs-14 fw-medium ms-1">
                              / month
                            </span>
                          </h5>
                        </div>
                        <div className="d-block">
                          <div>
                            <p className="d-flex align-items-center fs-16 text-dark mb-2">
                              <span className="me-1">
                                <i className="ti ti-circle-check-filled text-success" />
                              </span>
                              Unlimited Contacts
                            </p>
                            <p className="d-flex align-items-center fs-16 fw-medium text-dark mb-2">
                              <span className="me-1">
                                <i className="ti ti-circle-check-filled text-success" />
                              </span>
                              Unlimited Leads
                            </p>
                            <p className="d-flex align-items-center fs-16 fw-medium text-dark mb-2">
                              <span className="me-1">
                                <i className="ti ti-circle-check-filled text-success" />
                              </span>
                              Unlimited Companies
                            </p>
                            <p className="d-flex align-items-center fs-16 fw-medium text-dark mb-2">
                              <span className="me-1">
                                <i className="ti ti-circle-check-filled text-success" />
                              </span>
                              Unlimited Compaigns
                            </p>
                            <p className="d-flex align-items-center fs-16 fw-medium text-dark mb-2">
                              <span className="me-1">
                                <i className="ti ti-circle-check-filled text-success" />
                              </span>
                              Unlimited Projects
                            </p>
                            <p className="d-flex align-items-center fs-16 fw-medium text-dark mb-2">
                              <span className="me-1">
                                <i className="ti ti-circle-check-filled text-success" />
                              </span>
                              Deals
                            </p>
                            <p className="d-flex align-items-center fs-16 fw-medium text-dark mb-2">
                              <span className="me-1">
                                <i className="ti ti-circle-check-filled text-success" />
                              </span>
                              Tasks
                            </p>
                            <p className="d-flex align-items-center fs-16 fw-medium text-dark">
                              <span className="me-1">
                                <i className="ti ti-circle-check-filled text-success" />
                              </span>
                              Pipelines
                            </p>
                          </div>
                          <div className="text-center mt-3">
                            <Link to="#" className="btn btn-primary w-100">
                              Choose
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* card end */}
        </div>
        {/* End Content */}
        {/* Start Footer */}
        <Footer />
        {/* End Footer */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
        <ModalMembershipPlans/>
    </>
  );
};

export default MembershipPlans;
