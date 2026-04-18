import { Link } from "react-router";
import Footer from "../../../../components/footer/footer";
import CollapseIcons from "../../../../components/collapse-icons/collapseIcons";
import PredefinedDatePicker from "../../../../components/common-dateRangePicker/PredefinedDatePicker";
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import { all_routes } from "../../../../routes/all_routes";
import ContactsAnalysisChart from "./charts/contactsAnalysisChart";
import ProjectStageChart from "./charts/projectStageChart";
import LastChart from "../deals-dashboard/chats/lastChart";
import WonChart from "../deals-dashboard/chats/wonChart";
import Modal from "./modal/modal";

const ProjectDashboard = () => {
  return (
    <>
      {/* ========================
			Start Page Content
		========================= */}
      <div className="page-wrapper">
        {/* Start Content */}
        <div className="content pb-0">
          {/* Page Header */}
          <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
            <div>
              <h4 className="mb-0">Project Dashboard</h4>
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              <PredefinedDatePicker/>
              <CollapseIcons />
            </div>
          </div>
          {/* End Page Header */}
          {/* start row */}
          <div className="row">
            <div className="col-md-12 col-xl-6 d-flex">
              <div className="card flex-fill">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                    <h6 className="mb-0">Recent Projects</h6>
                    <div className="d-flex align-items-center flex-wrap row-gap-3">
                      <div className="dropdown me-2">
                        <Link
                          className="dropdown-toggle btn btn-outline-light shadow"
                          data-bs-toggle="dropdown"
                          to="#"
                        >
                          Last 30 days
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Last 15 days
                          </Link>
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Last 30 days
                          </Link>
                        </div>
                      </div>
                      <Link
                        className="btn btn-primary d-inline-flex align-items-center"
                        to="#"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#offcanvas_add"
                      >
                        <i className="ti ti-square-rounded-plus-filled me-1" />
                        Add Project
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="table-responsive custom-table">
                    <table className="table table-nowrap" id="recent-project">
                      <thead className="table-light">
                        <tr>
                          <th>Name</th>
                          <th>Company Name</th>
                          <th>Priority</th>
                          <th>Due Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="odd">
                          <td>
                            <h2 className="d-flex align-items-center fs-14 fw-medium mb-0">
                              <Link
                                to={all_routes.projectDetails}
                                className="avatar avatar-rounded border me-2"
                              >
                                <ImageWithBasePath
                                  className="w-auto h-auto"
                                  src="assets/img/priority/truellysel.svg"
                                  alt="User Image"
                                />
                              </Link>
                              <Link to={all_routes.projectDetails}>
                                Truelysell
                              </Link>
                            </h2>
                          </td>
                          <td>
                            <h6 className="d-flex align-items-center fs-14 fw-medium mb-0">
                              <Link
                                to={all_routes.companyDetails}
                                className="avatar avatar-rounded border me-2"
                              >
                                <ImageWithBasePath
                                  className="w-auto h-auto"
                                  src="assets/img/icons/company-icon-01.svg"
                                  alt="User Image"
                                />
                              </Link>
                              <Link to={all_routes.companyDetails}>
                                NovaWave LLC
                              </Link>
                            </h6>
                          </td>
                          <td>
                            <span className="d-inline-flex align-items-center badge badge-pill  badge-soft-danger border border-danger">
                              <i className="ti ti-square-rounded-filled me-1" />{" "}
                              High
                            </span>
                          </td>
                          <td>23 Nov 2025</td>
                        </tr>
                        <tr className="even">
                          <td>
                            <h2 className="d-flex align-items-center fs-14 fw-medium mb-0">
                              <Link
                                to={all_routes.projectDetails}
                                className="avatar avatar-rounded border me-2"
                              >
                                <ImageWithBasePath
                                  className="w-auto h-auto"
                                  src="assets/img/priority/dreamchat.svg"
                                  alt="User Image"
                                />
                              </Link>
                              <Link to={all_routes.projectDetails}>
                                Dreamschat
                              </Link>
                            </h2>
                          </td>
                          <td>
                            <h6 className="d-flex align-items-center fs-14 fw-medium mb-0">
                              <Link
                                to={all_routes.companyDetails}
                                className="avatar avatar-rounded border me-2"
                              >
                                <ImageWithBasePath
                                  className="w-auto h-auto"
                                  src="assets/img/icons/company-icon-02.svg"
                                  alt="User Image"
                                />
                              </Link>
                              <Link to={all_routes.companyDetails}>
                                BlueSky
                              </Link>
                            </h6>
                          </td>
                          <td>
                            <span className="d-inline-flex align-items-center badge badge-pill  badge-soft-warning border border-warning">
                              <i className="ti ti-square-rounded-filled me-1" />{" "}
                              Medium
                            </span>
                          </td>
                          <td>07 Nov 2025</td>
                        </tr>
                        <tr className="odd">
                          <td>
                            <h2 className="d-flex align-items-center fs-14 fw-medium mb-0">
                              <Link
                                to={all_routes.projectDetails}
                                className="avatar avatar-rounded border me-2"
                              >
                                <ImageWithBasePath
                                  className="w-auto h-auto"
                                  src="assets/img/priority/truellysell.svg"
                                  alt="User Image"
                                />
                              </Link>
                              <Link to={all_routes.projectDetails}>
                                DreamGigs
                              </Link>
                            </h2>
                          </td>
                          <td>
                            <h6 className="d-flex align-items-center fs-14 fw-medium mb-0">
                              <Link
                                to={all_routes.companyDetails}
                                className="avatar avatar-rounded border me-2"
                              >
                                <ImageWithBasePath
                                  className="w-auto h-auto"
                                  src="assets/img/icons/company-icon-03.svg"
                                  alt="User Image"
                                />
                              </Link>
                              <Link to={all_routes.companyDetails}>
                                Silve Hawk
                              </Link>
                            </h6>
                          </td>
                          <td>
                            <span className="d-inline-flex align-items-center badge badge-pill  badge-soft-danger border border-danger">
                              <i className="ti ti-square-rounded-filled me-1" />{" "}
                              High
                            </span>
                          </td>
                          <td>15 Oct 2025</td>
                        </tr>
                        <tr className="even">
                          <td>
                            <h2 className="d-flex align-items-center fs-14 fw-medium mb-0">
                              <Link
                                to={all_routes.projectDetails}
                                className="avatar avatar-rounded border me-2"
                              >
                                <ImageWithBasePath
                                  className="w-auto h-auto"
                                  src="assets/img/priority/servbook.svg"
                                  alt="User Image"
                                />
                              </Link>
                              <Link to={all_routes.projectDetails}>
                                Servbook
                              </Link>
                            </h2>
                          </td>
                          <td>
                            <h6 className="d-flex align-items-center fs-14 fw-medium mb-0">
                              <Link
                                to={all_routes.companyDetails}
                                className="avatar avatar-rounded border me-2"
                              >
                                <ImageWithBasePath
                                  className="w-auto h-auto"
                                  src="assets/img/icons/company-icon-04.svg"
                                  alt="User Image"
                                />
                              </Link>
                              <Link to={all_routes.companyDetails}>
                                Summit Peak
                              </Link>
                            </h6>
                          </td>
                          <td>
                            <span className="d-inline-flex align-items-center badge badge-pill  badge-soft-danger border border-danger">
                              <i className="ti ti-square-rounded-filled me-1" />{" "}
                              High
                            </span>
                          </td>
                          <td>29 Sep 2025</td>
                        </tr>
                        <tr className="odd">
                          <td>
                            <h2 className="d-flex align-items-center fs-14 fw-medium mb-0">
                              <Link
                                to={all_routes.projectDetails}
                                className="avatar avatar-rounded border me-2"
                              >
                                <ImageWithBasePath
                                  className="w-auto h-auto"
                                  src="assets/img/priority/dream-pos.svg"
                                  alt="User Image"
                                />
                              </Link>
                              <Link to={all_routes.projectDetails}>
                                DreamPOS
                              </Link>
                            </h2>
                          </td>
                          <td>
                            <h6 className="d-flex align-items-center fs-14 fw-medium mb-0">
                              <Link
                                to={all_routes.companyDetails}
                                className="avatar avatar-rounded border me-2"
                              >
                                <ImageWithBasePath
                                  className="w-auto h-auto"
                                  src="assets/img/icons/company-icon-05.svg"
                                  alt="User Image"
                                />
                              </Link>
                              <Link to={all_routes.companyDetails}>
                                RiverStone Ltd
                              </Link>
                            </h6>
                          </td>
                          <td>
                            <span className="d-inline-flex align-items-center badge badge-pill  badge-soft-warning border border-warning">
                              <i className="ti ti-square-rounded-filled me-1" />{" "}
                              Medium
                            </span>
                          </td>
                          <td>25 Sep 2025</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>{" "}
                {/* end card body */}
              </div>{" "}
              {/* end card */}
            </div>{" "}
            {/* end col */}
            <div className="col-md-12 col-xl-6 d-flex">
              <div className="card flex-fill">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                    <h6 className="mb-0">Project By Stage</h6>
                    <div className="dropdown">
                      <Link
                        className="dropdown-toggle btn btn-outline-light shadow"
                        data-bs-toggle="dropdown"
                        to="#"
                      >
                        Last 30 days
                      </Link>
                      <div className="dropdown-menu dropdown-menu-end">
                        <Link
                          to="#"
                          className="dropdown-item"
                        >
                          Last 15 days
                        </Link>
                        <Link
                          to="#"
                          className="dropdown-item"
                        >
                          Last 30 days
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div id="contacts-analysis">
                    <ContactsAnalysisChart/>
                  </div>
                </div>{" "}
                {/* end card body */}
              </div>{" "}
              {/* end card */}
            </div>{" "}
            {/* end col */}
          </div>
          {/* end row */}
          {/* start row */}
          <div className="row">
            <div className="col-md-12 col-xl-6 d-flex">
              <div className="card flex-fill">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                    <h6 className="mb-0">Projects By Stage</h6>
                    <div className="d-flex align-items-center flex-wrap row-gap-3">
                      <div className="dropdown me-2">
                        <Link
                          className="dropdown-toggle btn btn-outline-light shadow"
                          data-bs-toggle="dropdown"
                          to="#"
                        >
                          Sales Pipeline
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Marketing Pipeline
                          </Link>
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Sales Pipeline
                          </Link>
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Email
                          </Link>
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Chats
                          </Link>
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Operational
                          </Link>
                        </div>
                      </div>
                      <div className="dropdown">
                        <Link
                          className="dropdown-toggle btn btn-outline-light shadow"
                          data-bs-toggle="dropdown"
                          to="#"
                        >
                          Last 3 months
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Last 30 Days
                          </Link>
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Last 15 Days
                          </Link>
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Last 7 Days
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body text-center pt-0">
                  <div id="project-stage">
                    <ProjectStageChart/>
                  </div>
                  <p className="fw-medium mb-0">
                    This data collected based on the Projects for last 30 days
                  </p>
                </div>{" "}
                {/* end card body */}
              </div>{" "}
              {/* end card */}
            </div>{" "}
            {/* end col */}
            <div className="col-md-12 col-xl-6 d-flex flex-column">
              <div className="card flex-fill">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                    <h6 className="mb-0">Leads By Stage</h6>
                    <div className="d-flex align-items-center flex-wrap row-gap-3">
                      <div className="dropdown me-2">
                        <Link
                          className="dropdown-toggle btn btn-outline-light shadow"
                          data-bs-toggle="dropdown"
                          to="#"
                        >
                          Marketing Pipeline
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Marketing Pipeline
                          </Link>
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Sales Pipeline
                          </Link>
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Email
                          </Link>
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Chats
                          </Link>
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Operational
                          </Link>
                        </div>
                      </div>
                      <div className="dropdown">
                        <Link
                          className="dropdown-toggle btn btn-outline-light shadow"
                          data-bs-toggle="dropdown"
                          to="#"
                        >
                          Last 3 months
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Last 30 Days
                          </Link>
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Last 15 Days
                          </Link>
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Last 7 Days
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body py-0">
                  <div id="last-chart">
                    <LastChart/>
                  </div>
                </div>{" "}
                {/* end card body */}
              </div>{" "}
              {/* end card */}
              <div className="card w-100">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                    <h6 className="mb-0">Won Deals Stage</h6>
                    <div className="d-flex align-items-center flex-wrap row-gap-3">
                      <div className="dropdown me-2">
                        <Link
                          className="dropdown-toggle btn btn-outline-light shadow"
                          data-bs-toggle="dropdown"
                          to="#"
                        >
                          Marketing Pipeline
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Marketing Pipeline
                          </Link>
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Sales Pipeline
                          </Link>
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Email
                          </Link>
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Chats
                          </Link>
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Operational
                          </Link>
                        </div>
                      </div>
                      <div className="dropdown">
                        <Link
                          className="dropdown-toggle btn btn-outline-light shadow"
                          data-bs-toggle="dropdown"
                          to="#"
                        >
                          Last 3 months
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Last 30 Days
                          </Link>
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Last 15 Days
                          </Link>
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Last 7 Days
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body py-0">
                  <div id="won-chart">
                    <WonChart/>
                  </div>
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
        <Modal/>
    </>
  );
};

export default ProjectDashboard;
